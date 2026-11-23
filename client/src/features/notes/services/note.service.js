import { axiosInstance } from "../../../lib/axios";
import { API_URL } from "../../../config/env";

export const noteService = {
  // ── Note CRUD ──────────────────────────────────────────────
  getNotes: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.folderId !== undefined) params.append("folderId", filters.folderId ?? "null");
    if (filters.isPinned !== undefined) params.append("isPinned", String(filters.isPinned));

    const response = await axiosInstance.get(`/notes?${params.toString()}`);
    return response.data;
  },

  getNoteById: async (id) => {
    const response = await axiosInstance.get(`/notes/${id}`);
    return response.data;
  },

  createNote: async (data = {}) => {
    const response = await axiosInstance.post("/notes", data);
    return response.data;
  },

  updateNote: async (id, data) => {
    const response = await axiosInstance.patch(`/notes/${id}`, data);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await axiosInstance.delete(`/notes/${id}`);
    return response.data;
  },

  togglePin: async (id) => {
    const response = await axiosInstance.patch(`/notes/${id}/pin`);
    return response.data;
  },

  moveNote: async (id, folderId) => {
    const response = await axiosInstance.patch(`/notes/${id}/move`, { folderId });
    return response.data;
  },

  restorePreviousEnhancement: async (id) => {
    const response = await axiosInstance.post(`/notes/${id}/restore`);
    return response.data;
  },

  // ── Folder CRUD ────────────────────────────────────────────
  getFolders: async () => {
    const response = await axiosInstance.get("/note-folders");
    return response.data;
  },

  getFolderById: async (id) => {
    const response = await axiosInstance.get(`/note-folders/${id}`);
    return response.data;
  },

  createFolder: async (data) => {
    const response = await axiosInstance.post("/note-folders", data);
    return response.data;
  },

  updateFolder: async (id, data) => {
    const response = await axiosInstance.patch(`/note-folders/${id}`, data);
    return response.data;
  },

  deleteFolder: async (id) => {
    const response = await axiosInstance.delete(`/note-folders/${id}`);
    return response.data;
  },

  // ── SSE Streaming Enhancement Client ───────────────────────
  streamNoteEnhancement: async (noteId, payload, callbacks = {}) => {
    const { onStage, onTitle, onChunk, onDone, onError, signal } = callbacks;

    const normalizedBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const url = `${normalizedBase}/notes/${noteId}/enhance`;

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
        throw new Error(errorData.message || "Failed to start note enhancement");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // Keep uncompleted tail in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.event === "stage") {
                onStage?.(data);
              } else if (data.event === "title") {
                onTitle?.(data.title);
              } else if (data.event === "chunk") {
                onChunk?.(data.content);
              } else if (data.event === "done") {
                onDone?.(data);
              } else if (data.event === "error") {
                onError?.(new Error(data.error || "Enhancement failed"));
              }
            } catch (err) {
              console.warn("[SSE Parse Warning]:", err, line);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("[Note Enhancement] Stream aborted by user");
        return;
      }
      onError?.(err);
      throw err;
    }
  },
};
