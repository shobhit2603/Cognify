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
} from "@phosphor-icons/react";
import Tooltip from "../../../components/ui/Tooltip";
import ResumeDrawer from "./ResumeDrawer";
import ResumeUploadZone from "./ResumeUploadZone";
import ResumeAuditHero from "./ResumeAuditHero";
import ResumeChatFeed from "./ResumeChatFeed";
import ResumeActionBar from "./ResumeActionBar";
import ResumePreviewPane from "./ResumePreviewPane";
import { useResumes, useResume, useResumeMutations } from "../hooks/useResumes";
import { resumeService } from "../services/resume.service";

export default function ResumeStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlResumeId = searchParams.get("id");

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
  const [isAuditExpanded, setIsAuditExpanded] = useState(true);

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
  const abortControllerRef = useRef(null);

  const [promptToInject, setPromptToInject] = useState("");
  const [modeToInject, setModeToInject] = useState("general");

  // Synchronize selection with URL
  const handleSelectResume = useCallback(
    (id) => {
      setIsUploadMode(false);
      setIsAuditExpanded(true);
      router.replace(`/resume?id=${id}`);
      if (!isPreviewOpen) {
        setIsPreviewOpen(true);
      }
    },
    [router, isPreviewOpen]
  );

  const handleStartUpload = () => {
    setIsUploadMode(true);
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
    setIsAuditExpanded(true);
    await runAudit({
      id: activeResumeId,
      targetRole: activeResume?.latestAudit?.targetRole || "",
      jobDescription: activeResume?.latestAudit?.targetJobDescription || "",
    });
  };

  // ── Chat Stream Handler ───────────────────────────────────────────────────
  const handleSendMessage = async ({ message, mode, jobDescription }) => {
    if (!activeResumeId || isStreaming) return;

    // Smart auto-collapse audit report when chatting starts
    setIsAuditExpanded(false);
    setIsStreaming(true);
    setStreamedText("");

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await resumeService.streamResumeChat({
        resumeId: activeResumeId,
        message,
        mode,
        jobDescription,
        signal: abortController.signal,
        onChunk: (chunk) => {
          setStreamedText((prev) => prev + chunk);
        },
        onDone: () => {
          setStreamedText("");
          setIsStreaming(false);
          // Invalidate resume to refresh conversation and updated audit
          queryClient.invalidateQueries({ queryKey: ["resume", activeResumeId] });
          queryClient.invalidateQueries({ queryKey: ["resumes"] });
        },
        onError: (err) => {
          setIsStreaming(false);
          console.error("[Resume Studio Stream Error]:", err);
        },
      });
    } catch (err) {
      setIsStreaming(false);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamedText("");
    }
  };

  const handleSelectStarterPrompt = (promptText, mode) => {
    setPromptToInject(promptText);
    setModeToInject(mode);
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
        onRenameResume={(id, newTitle) => updateTitle({ id, title: newTitle })}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isDrawerOpen}
        onToggleDrawer={handleToggleDrawer}
      />

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
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

            {!isUploadMode && activeResume && (
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
            )}

            {/* Subtle Divider */}
            {(!isDrawerOpen || (!isUploadMode && activeResume)) && (
              <div className="h-4 w-px bg-white/10 mx-0.5" />
            )}

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
          </div>
        </header>

        {/* ── Studio Canvas / Split View ── */}
        {isUploadMode || !activeResume ? (
          <div className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center">
            <ResumeUploadZone onUpload={handleUpload} isUploading={isUploading} />
          </div>
        ) : (
          <div
            ref={splitContainerRef}
            className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative select-none md:select-text"
          >
            {/* Center Column: ATS Audit + Resume Chat + Scoped Action Bar */}
            <div
              style={{ width: isPreviewOpen ? `${splitPercent}%` : "100%" }}
              className={`h-full flex flex-col min-w-0 min-h-0 overflow-hidden ${
                isDragging ? "" : "transition-[width] duration-300 ease-in-out"
              }`}
            >
              {/* Collapsible Top ATS Audit Card */}
              {activeResume?.latestAudit && (
                <div className="shrink-0 max-h-[50%] overflow-y-auto">
                  <ResumeAuditHero
                    audit={activeResume.latestAudit}
                    isExpanded={isAuditExpanded}
                    onToggleExpand={() => setIsAuditExpanded((prev) => !prev)}
                    onReAudit={handleReAudit}
                    isAuditing={isAuditing}
                  />
                </div>
              )}

              {/* Interactive Chat Stream */}
              <ResumeChatFeed
                messages={activeResume.messages || []}
                streamedText={streamedText}
                isStreaming={isStreaming}
                onSelectPrompt={handleSelectStarterPrompt}
              />

              {/* Scoped Bottom Action Bar */}
              <div className="shrink-0">
                <ResumeActionBar
                  onSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  onStopStreaming={handleStopStreaming}
                  initialPrompt={promptToInject}
                  initialMode={modeToInject}
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
                style={{ width: `${100 - splitPercent}%` }}
                className={`h-full min-w-0 min-h-0 overflow-hidden ${
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
