"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  SidebarSimple,
  Plus,
  ArrowLeft,
  ArrowClockwise,
  BriefcaseMetal,
  ChartBar,
  ChatCircleText,
} from "@phosphor-icons/react";
import Tooltip from "../../../components/ui/Tooltip";
import ResumeDrawer from "./ResumeDrawer";
import ResumeUploadZone from "./ResumeUploadZone";
import ResumeAuditHero from "./ResumeAuditHero";
import ResumeChatFeed from "./ResumeChatFeed";
import ResumeActionBar from "./ResumeActionBar";
import ResumePreviewPane from "./ResumePreviewPane";
import {
  useResumes,
  useResume,
  useResumeMutations,
  updateResumeCacheMessages,
} from "../hooks/useResumes";
import { resumeService } from "../services/resume.service";

export default function ResumeStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlResumeId = searchParams.get("id");
  const urlTab = searchParams.get("tab");

  // ── Drawer & Preview Panel States ─────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cognify_resume_drawer_open");
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cognify_resume_preview_open");
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const [isUploadMode, setIsUploadMode] = useState(!urlResumeId);
  const [activeTabOverride, setActiveTabOverride] = useState(null);

  // Derive active tab from URL query param first, then user override, then localStorage, defaulting to "audit"
  const centerTab =
    urlTab === "chat" || urlTab === "audit"
      ? urlTab
      : activeTabOverride ||
        (typeof window !== "undefined" && urlResumeId
          ? (() => {
              try {
                const saved = localStorage.getItem(`cognify_resume_tab_${urlResumeId}`);
                return saved === "chat" || saved === "audit" ? saved : "audit";
              } catch {
                return "audit";
              }
            })()
          : "audit");

  // ── Split Divider Ratio ───────────────────────────────────────────────────
  const [splitPercent, setSplitPercent] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cognify_resume_split_ratio");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 25 && parsed <= 65) return parsed;
      }
    }
    return 50;
  });

  const splitContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clientX = e.clientX;
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(25, Math.min(65, rawPercent));
    setSplitPercent(clamped);
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        localStorage.setItem("cognify_resume_split_ratio", splitPercent.toString());
      } catch {
        // ignore
      }
    }
  };

  // ── Search & Filter State ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Queries & Mutations ───────────────────────────────────────────────────
  const { data: resumes = [], isLoading: isLoadingResumes } = useResumes({
    search: debouncedSearch,
  });

  const activeResumeId = urlResumeId || (!isUploadMode && resumes[0]?._id) || null;
  const { data: activeResume, isLoading: isLoadingActiveResume } = useResume(activeResumeId);

  const {
    uploadResume,
    isUploading,
    updateTitle,
    deleteResume,
    isDeleting,
    runAudit,
    isAuditing,
  } = useResumeMutations();

  // ── Auto-Run Audit For Un-audited Resumes ─────────────────────────────────
  const hasTriggeredAuditRef = useRef(new Set());
  useEffect(() => {
    if (
      activeResume?._id &&
      !activeResume.latestAudit?.analyzedAt &&
      !isAuditing &&
      !hasTriggeredAuditRef.current.has(activeResume._id)
    ) {
      hasTriggeredAuditRef.current.add(activeResume._id);
      runAudit({
        id: activeResume._id,
        targetRole: activeResume.latestAudit?.targetRole || "",
        jobDescription: activeResume.latestAudit?.targetJobDescription || "",
      }).catch((err) => {
        console.warn("[Resume Studio] Auto-audit failed:", err?.message);
      });
    }
  }, [activeResume, isAuditing, runAudit]);

  // ── Streaming Chat State ──────────────────────────────────────────────────
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [optimisticUserMessage, setOptimisticUserMessage] = useState(null);
  const abortControllerRef = useRef(null);
  const activeResumeIdRef = useRef(activeResumeId);

  // Centralized stream cleanup whenever active resume ID changes or unmounts
  useEffect(() => {
    activeResumeIdRef.current = activeResumeId;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setOptimisticUserMessage(null);
      setStreamedText("");
    }
  }, [activeResumeId]);

  const [promptToInject, setPromptToInject] = useState("");
  const [modeToInject, setModeToInject] = useState("general");
  const [promptTrigger, setPromptTrigger] = useState(0);

  // Tab switch handler with URL and localStorage persistence
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTabOverride(tab);
      const targetId = activeResumeId;
      if (targetId) {
        try {
          localStorage.setItem(`cognify_resume_tab_${targetId}`, tab);
        } catch {
          // ignore
        }
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          params.set("id", targetId);
          params.set("tab", tab);
          router.replace(`/resume?${params.toString()}`, { scroll: false });
        }
      }
    },
    [activeResumeId, router]
  );

  // Synchronize selection with URL
  const handleSelectResume = useCallback(
    (id) => {
      setIsUploadMode(false);
      let targetTab = "audit";
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(`cognify_resume_tab_${id}`);
          if (saved === "chat" || saved === "audit") {
            targetTab = saved;
          }
        } catch {
          targetTab = "audit";
        }
      }
      setActiveTabOverride(targetTab);
      router.replace(`/resume?id=${id}&tab=${targetTab}`);
      if (!isPreviewOpen) {
        setIsPreviewOpen(true);
      }
    },
    [router, isPreviewOpen]
  );

  const handleStartUpload = () => {
    setIsUploadMode(true);
    setActiveTabOverride("audit");
    router.replace("/resume");
  };

  const handleToggleDrawer = () => {
    setIsDrawerOpen((prev) => {
      const next = !prev;
      localStorage.setItem("cognify_resume_drawer_open", String(next));
      return next;
    });
  };

  const handleTogglePreview = () => {
    setIsPreviewOpen((prev) => {
      const next = !prev;
      localStorage.setItem("cognify_resume_preview_open", String(next));
      return next;
    });
  };

  // ── Upload Handler ────────────────────────────────────────────────────────
  const handleUpload = async ({ file, title, targetRole }) => {
    try {
      const res = await uploadResume({ file, title });
      const created = res?.data || res;
      if (created?._id) {
        handleSelectResume(created._id);

        // Trigger automatic initial audit in background
        try {
          await runAudit({ id: created._id, targetRole });
        } catch (auditErr) {
          console.warn("[Resume Studio] Initial audit trigger warning:", auditErr?.message);
        }
      }
    } catch (err) {
      console.error("[Resume Studio] Upload failed:", err);
    }
  };

  // ── Re-audit Handler ──────────────────────────────────────────────────────
  const handleReAudit = async () => {
    if (!activeResumeId || isAuditing) return;
    handleTabChange("audit");
    await runAudit({
      id: activeResumeId,
      targetRole: activeResume?.latestAudit?.targetRole || "",
      jobDescription: activeResume?.latestAudit?.targetJobDescription || "",
    });
  };

  // ── Chat Stream Handler ───────────────────────────────────────────────────
  const handleSendMessage = async ({ message, mode, jobDescription }) => {
    if (!activeResumeId || isStreaming) return;

    if (mode === "audit") {
      handleTabChange("audit");
      await runAudit({
        id: activeResumeId,
        targetRole: activeResume?.latestAudit?.targetRole || "",
        jobDescription: jobDescription || activeResume?.latestAudit?.targetJobDescription || "",
      });
      return;
    }

    const currentSendingId = activeResumeId;

    // Smart auto-switch to chat tab and persist
    handleTabChange("chat");
    setIsStreaming(true);
    setStreamedText("");

    const tempUserMsgId = `temp-user-${Date.now()}`;
    const tempUserMsg = {
      _id: tempUserMsgId,
      role: "user",
      content: message,
      mode,
      jobDescription,
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately store in local optimistic state so it's guaranteed to render on frame 1
    setOptimisticUserMessage(tempUserMsg);

    // 2. Also synchronously update TanStack Query cache
    updateResumeCacheMessages(queryClient, currentSendingId, (prev) => [
      ...prev,
      tempUserMsg,
    ]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulatedText = "";

    try {
      await resumeService.streamResumeChat({
        resumeId: currentSendingId,
        message,
        mode,
        jobDescription,
        signal: abortController.signal,
        onChunk: (chunk) => {
          if (activeResumeIdRef.current !== currentSendingId) return;
          accumulatedText += chunk;
          setStreamedText(accumulatedText);
        },
        onDone: (payload) => {
          if (activeResumeIdRef.current !== currentSendingId) return;
          const finalAssistantMsg = payload?.message || {
            _id: `temp-assistant-${Date.now()}`,
            role: "assistant",
            mode,
            content: accumulatedText,
            createdAt: new Date().toISOString(),
          };

          // 3. Synchronously commit both user message and assistant message to cache BEFORE clearing stream state
          // Match strictly by temp ID so earlier messages with identical content are not falsely treated as current
          updateResumeCacheMessages(queryClient, currentSendingId, (prev) => {
            const hasUser = prev.some((m) => m._id === tempUserMsgId);
            const base = hasUser ? prev : [...prev, tempUserMsg];
            return [...base, finalAssistantMsg];
          });

          // 4. Now safe to clear streaming state - zero layout shift, zero blank frame, and no empty-state fallback!
          setOptimisticUserMessage(null);
          setIsStreaming(false);
          setStreamedText("");

          // 5. Background sync with server
          queryClient.invalidateQueries({
            queryKey: ["resume", currentSendingId],
          });
          queryClient.invalidateQueries({
            queryKey: ["resumes"],
          });
        },
        onError: (err) => {
          if (activeResumeIdRef.current === currentSendingId) {
            setIsStreaming(false);
            setOptimisticUserMessage(null);
            setStreamedText("");
            // Remove optimistic message on failure and sync with server
            updateResumeCacheMessages(queryClient, currentSendingId, (prev) =>
              prev.filter((m) => m._id !== tempUserMsgId)
            );
            queryClient.invalidateQueries({
              queryKey: ["resume", currentSendingId],
            });
          }
          console.error("[Resume Studio Stream Error]:", err);
        },
      });
    } catch (err) {
      if (activeResumeIdRef.current === currentSendingId) {
        setIsStreaming(false);
        setOptimisticUserMessage(null);
        setStreamedText("");
        updateResumeCacheMessages(queryClient, currentSendingId, (prev) =>
          prev.filter((m) => m._id !== tempUserMsgId)
        );
        queryClient.invalidateQueries({
          queryKey: ["resume", currentSendingId],
        });
      }
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setStreamedText("");
      setOptimisticUserMessage(null);
      if (activeResumeIdRef.current) {
        queryClient.invalidateQueries({
          queryKey: ["resume", activeResumeIdRef.current],
        });
      }
    }
  };

  const handleSelectStarterPrompt = (promptText, mode) => {
    setPromptToInject(promptText);
    setModeToInject(mode);
    setPromptTrigger((n) => n + 1);
    handleTabChange("chat");
  };

  return (
    <div className="flex h-screen w-full bg-[#0d0d0f] text-white overflow-hidden font-sans">
      {/* ── Left History Drawer (230px) ── */}
      <ResumeDrawer
        resumes={resumes}
        activeResumeId={!isUploadMode ? activeResumeId : null}
        onSelectResume={handleSelectResume}
        onStartUpload={handleStartUpload}
        onDeleteResume={async (id) => {
          await deleteResume(id);
          if (activeResumeId === id) {
            handleStartUpload();
          }
        }}
        isDeleting={isDeleting}
        onRenameResume={(id, newTitle) => updateTitle({ id, title: newTitle })}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isDrawerOpen}
        onToggleDrawer={handleToggleDrawer}
      />

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 min-h-0">
        {/* Workspace Top Bar */}
        <header className="h-12 border-b border-white/10 bg-[#0e0e11] px-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleToggleDrawer}
              title={isDrawerOpen ? "Collapse Drawer" : "Expand Drawer"}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <SidebarSimple size={18} weight={isDrawerOpen ? "fill" : "regular"} />
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <span className="text-white/20">/</span>

            <div className="flex items-center gap-2 min-w-0">
              <BriefcaseMetal size={16} className="text-[#ffbd2e] shrink-0" weight="duotone" />
              <span className="text-xs font-semibold text-white/90 truncate max-w-[180px] sm:max-w-[260px]">
                {isUploadMode
                  ? "Upload Resume"
                  : activeResume?.title || "Resume Studio"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDrawerOpen && (
              <Tooltip content="Upload New Resume" position="bottom">
                <button
                  type="button"
                  onClick={handleStartUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffbd2e] text-black font-semibold text-xs hover:bg-[#ffbd2e]/90 transition-all shadow-sm"
                >
                  <Plus size={13} weight="bold" />
                  <span>Upload</span>
                </button>
              </Tooltip>
            )}

            {/* Right preview panel toggle, divider, and re-audit are ONLY rendered when viewing an active resume */}
            {!isUploadMode && activeResume && (
              <>
                <Tooltip content="Re-run ATS Diagnostic" position="bottom">
                  <button
                    type="button"
                    onClick={handleReAudit}
                    disabled={isAuditing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 border border-white/10 transition-colors disabled:opacity-40"
                  >
                    <ArrowClockwise size={13} className={isAuditing ? "animate-spin text-[#ffbd2e]" : ""} />
                    <span className="hidden md:inline">Re-Audit</span>
                  </button>
                </Tooltip>

                {/* Subtle Divider */}
                <div className="h-4 w-px bg-white/10 mx-0.5" />

                {/* Right Preview Panel Toggle Button (Mirrored SidebarSimple) */}
                <Tooltip
                  content={isPreviewOpen ? "Hide Resume Preview" : "Show Resume Preview"}
                  position="bottom"
                >
                  <button
                    type="button"
                    onClick={handleTogglePreview}
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <SidebarSimple
                      size={18}
                      weight={isPreviewOpen ? "fill" : "regular"}
                      className="rotate-180"
                    />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </header>

        {/* ── Studio Canvas / Split View ── */}
        {isUploadMode || !activeResume ? (
          <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex items-center justify-center">
            <ResumeUploadZone onUpload={handleUpload} isUploading={isUploading} />
          </div>
        ) : (
          <div
            ref={splitContainerRef}
            style={{
              "--center-split": isPreviewOpen ? `${splitPercent}%` : "100%",
              "--preview-split": `${100 - splitPercent}%`,
            }}
            className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative select-none md:select-text"
          >
            {/* Center Column: ATS Audit + Resume Chat + Scoped Action Bar */}
            <div
              className={`w-full md:w-[var(--center-split)] h-full flex flex-col min-w-0 min-h-0 overflow-hidden overflow-x-hidden ${
                isDragging ? "" : "transition-[width] duration-300 ease-in-out"
              }`}
            >
              {/* Sleek Two-Tab Switcher Bar */}
              <div className="shrink-0 h-11 px-4 border-b border-white/10 bg-[#0e0e11] flex items-center justify-between select-none">
                <div className="flex items-center gap-2 h-full">
                  <button
                    type="button"
                    onClick={() => handleTabChange("audit")}
                    className={`flex items-center gap-2 h-full px-3 text-xs font-semibold border-b-2 transition-all ${
                      centerTab === "audit"
                        ? "border-[#ffbd2e] text-[#ffbd2e]"
                        : "border-transparent text-white/50 hover:text-white/80"
                    }`}
                  >
                    <ChartBar size={15} weight={centerTab === "audit" ? "fill" : "regular"} />
                    <span>ATS Audit Report</span>
                    {activeResume?.latestAudit?.overallScore !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                          activeResume.latestAudit.overallScore >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : activeResume.latestAudit.overallScore >= 60
                            ? "bg-[#ffbd2e]/10 text-[#ffbd2e] border border-[#ffbd2e]/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {activeResume.latestAudit.overallScore}/100
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange("chat")}
                    className={`flex items-center gap-2 h-full px-3 text-xs font-semibold border-b-2 transition-all ${
                      centerTab === "chat"
                        ? "border-[#ffbd2e] text-[#ffbd2e]"
                        : "border-transparent text-white/50 hover:text-white/80"
                    }`}
                  >
                    <ChatCircleText size={15} weight={centerTab === "chat" ? "fill" : "regular"} />
                    <span>Resume Chat</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Full-Height Structured ATS Audit Report */}
              {centerTab === "audit" && (
                <div
                  data-lenis-prevent
                  className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <ResumeAuditHero
                    audit={activeResume?.latestAudit}
                    onReAudit={handleReAudit}
                    isAuditing={isAuditing}
                    onOptimizeIssue={(promptText, mode) => {
                      setPromptToInject(promptText);
                      setModeToInject(mode || "optimize-section");
                      setPromptTrigger((n) => n + 1);
                      handleTabChange("chat");
                    }}
                  />
                </div>
              )}

              {/* Tab 2: Full-Height Conversational Resume Chat */}
              {centerTab === "chat" && (
                <ResumeChatFeed
                  messages={activeResume?.messages || []}
                  optimisticUserMessage={optimisticUserMessage}
                  streamedText={streamedText}
                  isStreaming={isStreaming}
                  streamingMode={modeToInject}
                  onSelectPrompt={handleSelectStarterPrompt}
                />
              )}

              {/* Scoped Bottom Action Bar */}
              <div className="shrink-0 border-t border-white/10 bg-[#0d0d0f]">
                <ResumeActionBar
                  onSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  onStopStreaming={handleStopStreaming}
                  initialPrompt={promptToInject}
                  initialMode={modeToInject}
                  promptTrigger={promptTrigger}
                />
              </div>
            </div>

            {/* Draggable Divider with Pointer Events */}
            {isPreviewOpen && (
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="hidden md:flex items-center justify-center w-[4px] hover:w-[6px] hover:bg-[#ffbd2e]/60 active:bg-[#ffbd2e] bg-white/10 cursor-col-resize transition-all z-10 select-none group"
                title="Drag to resize panels"
              >
                <div className="w-1 h-8 rounded-full bg-white/20 group-hover:bg-[#ffbd2e] transition-colors" />
              </div>
            )}

            {/* Right Column: Resume Preview Pane */}
            {isPreviewOpen && (
              <div
                className={`w-full md:w-[var(--preview-split)] h-[400px] md:h-full shrink-0 md:shrink min-w-0 min-h-0 overflow-hidden ${
                  isDragging ? "" : "transition-[width] duration-300 ease-in-out"
                }`}
              >
                <ResumePreviewPane resume={activeResume} isDragging={isDragging} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
