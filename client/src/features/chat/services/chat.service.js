import { axiosInstance } from "../../../lib/axios";
import { API_URL } from "../../../config/env";

export const getChats = async (page = 1, limit = 10, search = "") => {
  const response = await axiosInstance.get("/chats", {
    params: { page, limit, search },
  });
  return response.data.data;
};

export const getChatById = async (chatId) => {
  const response = await axiosInstance.get(`/chats/${chatId}`);
  return response.data.data;
};

export const updateChat = async (chatId, updates) => {
  const response = await axiosInstance.patch(`/chats/${chatId}`, updates);
  return response.data.data;
};

export const deleteChat = async (chatId) => {
  const response = await axiosInstance.delete(`/chats/${chatId}`);
  return response.data;
};

export const getMessages = async (chatId, page = 1, limit = 50) => {
  const response = await axiosInstance.get(`/messages/${chatId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axiosInstance.delete(`/messages/${messageId}`);
  return response.data;
};

/**
 * Reads the Bearer token from Redux Persist's localStorage entry.
 * Returns null if not found or on any parse error — the request will
 * still succeed if the server accepts cookie-based auth (credentials: 'include').
 */
function getAuthToken() {
  try {
    const raw = localStorage.getItem("persist:auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.token ? JSON.parse(parsed.token) : null;
  } catch {
    return null;
  }
}

/**
 * Initiates a Server-Sent Events (SSE) connection to stream an AI response.
 *
 * @param {string}      content   - The user prompt text.
 * @param {string|null} chatId    - Existing chat ID. If null, the backend creates a new chat.
 * @param {Object}      callbacks - Event hooks.
 * @param {function}    callbacks.onConnected - Fired when stream is established; receives { chat, message }.
 * @param {function}    callbacks.onChunk     - Fired for each text chunk; receives the chunk string.
 * @param {function}    callbacks.onDone      - Fired when stream completes; receives { message }.
 * @param {function}    callbacks.onError     - Fired on error; receives an Error object.
 * @param {AbortSignal} [signal]  - Optional AbortSignal to cancel the stream mid-flight.
 */
export const streamMessage = async (content, chatId, callbacks, signal) => {
  // Build the correct endpoint URL
  const path = chatId
    ? `/api/v1/messages/stream/${chatId}`
    : `/api/v1/messages/stream`;

  // Strip '/api/v1' from API_URL if it already ends with it, since our path
  // already includes that prefix to be explicit.
  const apiBase = API_URL || "";
  const baseUrl = apiBase.endsWith("/api/v1")
    ? apiBase.slice(0, -7)
    : apiBase;

  const token = getAuthToken();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Include cookies for cookie-based auth as a fallback
      credentials: "include",
      body: JSON.stringify({ role: "user", content }),
      signal, // AbortController signal — undefined is fine if not provided
    });

    if (!response.ok) {
      let errMsg = `Server error ${response.status}`;
      try {
        const body = await response.json();
        errMsg = body?.message || errMsg;
      } catch { /* ignore */ }
      throw new Error(errMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    // Buffer accumulates partial SSE frames between network chunks
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Append decoded bytes; { stream: true } handles multi-byte chars that
      // straddle network-chunk boundaries.
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line (\n\n).
      // Split on that boundary; the last element may be an incomplete frame.
      const frames = buffer.split("\n\n");
      // Keep the incomplete tail in the buffer for the next iteration.
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        // Each SSE frame can have multiple lines; we process the "data:" line.
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;

          // Use slice(5) to safely strip "data:" prefix (anchored, no regex needed).
          // Trim leading space that SSE spec recommends after "data:".
          const dataStr = line.slice(5).trimStart();

          // Standard SSE end-of-stream sentinel — nothing to parse
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);

            switch (parsed.event) {
              case "connected":
                callbacks.onConnected?.(parsed);
                break;
              case "chunk":
                callbacks.onChunk?.(parsed.content);
                break;
              case "done":
                callbacks.onDone?.(parsed);
                break;
              case "error":
                callbacks.onError?.(new Error(parsed.error || "Stream error"));
                break;
              default:
                break;
            }
          } catch (parseErr) {
            console.warn("[SSE] Failed to parse frame data:", dataStr, parseErr);
          }
        }
      }
    }
  } catch (error) {
    // AbortError means the user intentionally stopped — don't call onError
    if (error.name === "AbortError") return;
    callbacks.onError?.(error);
  }
};
