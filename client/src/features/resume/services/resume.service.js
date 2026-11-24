import { axiosInstance } from "../../../lib/axios";
import { API_URL } from "../../../config/env";

export const resumeService = {
  // ── 1. Resume CRUD ──────────────────────────────────────────────
  getResumes: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await axiosInstance.get(`/resumes?${params.toString()}`);
    return response.data;
  },

  getResumeById: async (id) => {
    const response = await axiosInstance.get(`/resumes/${id}`);
    return response.data;
  },

  uploadResume: async ({ file, title }) => {
    const safeTitle = title || file.name.replace(/\.[^/.]+$/, "");
    const response = await axiosInstance.post("/resumes/upload", file, {
      headers: {
        "Content-Type": "application/pdf",
        "x-file-name": encodeURIComponent(file.name),
        "x-title": encodeURIComponent(safeTitle),
        "x-file-size": file.size,
      },
      params: {
        title: safeTitle,
        fileName: file.name,
      },
    });
    return response.data;
  },

  updateResumeTitle: async (id, title) => {
    const response = await axiosInstance.patch(`/resumes/${id}`, { title });
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await axiosInstance.delete(`/resumes/${id}`);
    return response.data;
  },

  // ── 2. Full ATS Audit ───────────────────────────────────────────
  auditResume: async (id, { jobDescription = "", targetRole = "" } = {}) => {
    const response = await axiosInstance.post(`/resumes/${id}/audit`, {
      jobDescription,
      targetRole,
    });
    return response.data;
  },

  // ── 3. Streaming Resume Chat & Section Optimization (SSE) ───────
  streamResumeChat: async ({
    resumeId,
    message,
    mode = "general",
    jobDescription = "",
    onChunk,
    onDone,
    onError,
    signal,
  }) => {
    if (!resumeId) throw new Error("Resume ID is required for chat streaming");

    const normalizedBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const url = `${normalizedBase}/resumes/${resumeId}/chat`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message,
          mode,
          jobDescription: jobDescription || undefined,
        }),
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
        throw new Error(errorData.message || "Failed to start resume chat stream");
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
              if (data.event === "chunk") {
                onChunk?.(data.content);
              } else if (data.event === "done") {
                onDone?.(data);
              } else if (data.event === "error") {
                onError?.(new Error(data.error || "Chat streaming failed"));
              }
            } catch (err) {
              console.warn("[Resume SSE Parse Warning]:", err, line);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("[Resume Chat] Stream aborted by user");
        return;
      }
      onError?.(err);
      throw err;
    }
  },
};
