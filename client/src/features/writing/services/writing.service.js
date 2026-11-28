import { axiosInstance } from "../../../lib/axios";
import { API_URL } from "../../../config/env";

async function consumeSseResponse(response, callbacks = {}, signal = null) {
  const { onStage, onSubject, onTitle, onChunk, onDone, onError } = callbacks;
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let receivedTerminalEvent = false;

  const processEventBlock = (rawEvent) => {
    const trimmed = rawEvent.trim();
    if (!trimmed.startsWith("data: ")) return;
    const jsonStr = trimmed.slice(6).trim();
    if (!jsonStr) return;

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return;
    }

    if (parsed.event === "stage" && onStage) {
      onStage(parsed);
    } else if (parsed.event === "subject" && onSubject) {
      onSubject(parsed.subject);
    } else if (parsed.event === "title" && onTitle) {
      onTitle(parsed.title);
    } else if (parsed.event === "chunk" && onChunk) {
      onChunk(parsed.content);
    } else if (parsed.event === "done") {
      receivedTerminalEvent = true;
      if (onDone) onDone(parsed);
    } else if (parsed.event === "error") {
      receivedTerminalEvent = true;
      if (onError) onError(new Error(parsed.error || "Stream generation failed"));
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const rawEvent of events) {
      processEventBlock(rawEvent);
    }
  }

  if (buffer.trim()) {
    processEventBlock(buffer);
  }

  if (!receivedTerminalEvent && !signal?.aborted) {
    throw new Error("Stream ended unexpectedly before completion.");
  }
}

async function openWritingStream(endpoint, payload, callbacks = {}) {
  const { onError, signal } = callbacks;
  const normalizedBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const url = `${normalizedBase}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload || {}),
      credentials: "include",
      signal,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Request failed with status ${response.status}` };
      }
      throw new Error(errorData.message || "Failed to generate writing draft");
    }

    await consumeSseResponse(response, callbacks, signal);
  } catch (err) {
    if (err.name === "AbortError") {
      return { aborted: true };
    }
    if (onError) onError(err);
    throw err;
  }

  return { aborted: false };
}

export const writingService = {
  getWritings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.type && filters.type !== "all") params.append("type", filters.type);
    if (filters.search) params.append("search", filters.search);

    const response = await axiosInstance.get(`/writing?${params.toString()}`);
    return response.data;
  },

  getWritingById: async (id) => {
    const response = await axiosInstance.get(`/writing/${id}`);
    return response.data;
  },

  updateWriting: async (id, data) => {
    const response = await axiosInstance.patch(`/writing/${id}`, data);
    return response.data;
  },

  togglePin: async (id) => {
    const response = await axiosInstance.patch(`/writing/${id}/pin`);
    return response.data;
  },

  restorePreviousVersion: async (id) => {
    const response = await axiosInstance.post(`/writing/${id}/restore`);
    return response.data;
  },

  deleteWriting: async (id) => {
    const response = await axiosInstance.delete(`/writing/${id}`);
    return response.data;
  },

  streamEmail: (payload, callbacks) =>
    openWritingStream("/writing/email", payload, callbacks),

  streamCoverLetter: (payload, callbacks) =>
    openWritingStream("/writing/cover-letter", payload, callbacks),

  streamRefine: (draftId, payload, callbacks) =>
    openWritingStream(`/writing/${draftId}/refine`, payload, callbacks),
};
