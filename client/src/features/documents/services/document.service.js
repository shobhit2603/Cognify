import { axiosInstance } from "../../../lib/axios";
import { API_URL } from "../../../config/env";

export const getUploadUrl = async ({ fileName, mimeType, size }) => {
  const response = await axiosInstance.post("/documents/upload-url", {
    fileName,
    mimeType,
    size,
  });
  return response.data.data;
};

export const uploadFileToS3 = async (uploadUrl, file, onProgress = null) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/pdf");

    // If uploading to local backend server, send credentials (cookies) and auth token
    const isLocalServer =
      uploadUrl.includes("/api/v1/documents/local-storage") ||
      uploadUrl.includes("localhost") ||
      uploadUrl.includes("127.0.0.1");

    if (isLocalServer) {
      xhr.withCredentials = true;
      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject(new Error(`Failed to upload to storage: status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during file upload"));
    xhr.send(file);
  });
};

export const processDocument = async (documentId) => {
  const response = await axiosInstance.post(`/documents/${documentId}/process`);
  return response.data.data;
};

export const getDocuments = async (page = 1, limit = 20, search = "") => {
  const response = await axiosInstance.get("/documents", {
    params: { page, limit, search },
  });
  return response.data.data;
};

export const getDocumentById = async (documentId) => {
  const response = await axiosInstance.get(`/documents/${documentId}`);
  return response.data.data;
};

export const deleteDocument = async (documentId) => {
  const response = await axiosInstance.delete(`/documents/${documentId}`);
  return response.data;
};

export const askDocument = async (documentId, question) => {
  const response = await axiosInstance.post(`/documents/${documentId}/ask`, {
    question,
  });
  return response.data.data;
};

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

export const streamAskDocument = async (documentId, question, callbacks, signal) => {
  const apiBase = API_URL || "";
  const baseUrl = apiBase.endsWith("/api/v1") ? apiBase.slice(0, -7) : apiBase;
  const path = `/api/v1/documents/${documentId}/ask?stream=true`;
  const token = getAuthToken();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ question }),
      signal,
    });

    if (!response.ok) {
      let errMsg = `Server error ${response.status}`;
      try {
        const body = await response.json();
        errMsg = body?.message || errMsg;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let receivedDone = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const rawData = line.slice(6).trim();
          if (!rawData) continue;
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.type === "citations" && callbacks.onCitations) {
              callbacks.onCitations(parsed.citations);
            } else if (parsed.type === "chunk" && callbacks.onChunk) {
              callbacks.onChunk(parsed.content);
            } else if (parsed.type === "done" && callbacks.onDone) {
              receivedDone = true;
              callbacks.onDone();
            } else if (parsed.type === "error" && callbacks.onError) {
              receivedDone = true;
              callbacks.onError(new Error(parsed.error));
            }
          } catch (parseErr) {
            console.warn("Error parsing document stream chunk:", parseErr);
          }
        }
      }
    }

    if (!receivedDone && callbacks.onError) {
      callbacks.onError(new Error("Stream connection closed unexpectedly before completion"));
    }
  } catch (err) {
    if (callbacks.onError) callbacks.onError(err);
  }
};
