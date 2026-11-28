"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  SidebarSimple,
  Plus,
  ArrowLeft,
  ArrowCounterClockwise,
  PushPin,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import Tooltip from "../../../components/ui/Tooltip";
import WritingDrawer from "./WritingDrawer";
import WritingComposer from "./WritingComposer";
import WritingEditorPane from "./WritingEditorPane";
import {
  useWritings,
  useWritingDraft,
  useWritingMutations,
} from "../hooks/useWriting";
import { writingService } from "../services/writing.service";
import { useResumes } from "../../resume/hooks/useResumes";

const DEFAULT_EMAIL_FORM = {
  purpose: "Follow-Up",
  intent: "",
  context: "",
  replyToEmail: "",
  recipientContext: "",
  tone: "professional",
  formality: "semi-formal",
  length: "medium",
};

const DEFAULT_COVER_LETTER_FORM = {
  resumeId: "",
  userBackground: "",
  targetRole: "",
  targetCompany: "",
  jobDescription: "",
  tone: "professional",
  length: "medium",
};

export default function WritingStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlDraftId = searchParams.get("id");

  // ── Drawer & Right Output Panel Visibility ────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cognify_writing_drawer_open");
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const [isOutputPanelOpen, setIsOutputPanelOpen] = useState(true);

  const handleToggleDrawer = () => {
    setIsDrawerOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cognify_writing_drawer_open", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // ── Resizable Split Ratio (25%-65%, default 45%) ──────────────────────────
  const [splitPercent, setSplitPercent] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cognify_writing_split_ratio");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 25 && parsed <= 65) return parsed;
      }
    }
    return 45;
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
    const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPercent(Math.max(25, Math.min(65, rawPercent)));
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
        localStorage.setItem(
          "cognify_writing_split_ratio",
          splitPercent.toString()
        );
      } catch {
        // ignore
      }
    }
  };

  // ── Filter & Selection State ──────────────────────────────────────────────
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState(urlDraftId || null);
  const [isNewDraftMode, setIsNewDraftMode] = useState(!urlDraftId);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Data Queries & Mutations ──────────────────────────────────────────────
  const { data: drafts = [], isLoading: isLoadingDrafts } = useWritings({
    type: typeFilter,
    search: debouncedSearch,
  });

  const activeDraftId = isNewDraftMode
    ? null
    : selectedDraftId || urlDraftId || null;
  const { data: activeDraft } = useWritingDraft(activeDraftId);

  const { data: resumesRaw, isLoading: isLoadingResumes } = useResumes({
    limit: 50,
  });
  const resumes = Array.isArray(resumesRaw)
    ? resumesRaw
    : resumesRaw?.resumes || [];

  const {
    updateWriting,
    isSaving,
    togglePin,
    restorePreviousVersion,
    isRestoring,
    deleteWriting,
  } = useWritingMutations();

  // ── Composer Form State ───────────────────────────────────────────────────
  const [newDraftMode, setNewDraftMode] = useState("email");
  const [emailForm, setEmailForm] = useState(DEFAULT_EMAIL_FORM);
  const [coverLetterForm, setCoverLetterForm] = useState(
    DEFAULT_COVER_LETTER_FORM
  );

  const mode =
    !isNewDraftMode && activeDraft?.type ? activeDraft.type : newDraftMode;

  const hydrateFormsFromDraft = (draftDoc) => {
    if (!draftDoc) return;
    const inputs = draftDoc.inputs || {};
    if (draftDoc.type === "cover-letter") {
      setNewDraftMode("cover-letter");
      setCoverLetterForm({
        resumeId: inputs.resumeId ? String(inputs.resumeId) : "",
        userBackground: inputs.userBackground || "",
        targetRole: inputs.targetRole || "",
        targetCompany: inputs.targetCompany || "",
        jobDescription: inputs.jobDescription || "",
        tone: inputs.tone || "professional",
        length: inputs.length || "medium",
      });
    } else {
      setNewDraftMode("email");
      setEmailForm({
        purpose: inputs.purpose || "Follow-Up",
        intent: inputs.intent || "",
        context: inputs.context || "",
        replyToEmail: inputs.replyToEmail || "",
        recipientContext: inputs.recipientContext || "",
        tone: inputs.tone || "professional",
        formality: inputs.formality || "semi-formal",
        length: inputs.length || "medium",
      });
    }
  };

  // Track deep-link hydration cleanly without calling setState synchronously on re-renders
  const urlHydratedRef = useRef(false);
  useEffect(() => {
    if (
      urlDraftId &&
      !urlHydratedRef.current &&
      activeDraft?._id === urlDraftId
    ) {
      urlHydratedRef.current = true;
      const t = setTimeout(() => hydrateFormsFromDraft(activeDraft), 0);
      return () => clearTimeout(t);
    }
  }, [urlDraftId, activeDraft]);

  // ── Streaming State ───────────────────────────────────────────────────────
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStage, setStreamingStage] = useState(null);
  const [streamedSubject, setStreamedSubject] = useState("");
  const [streamedContent, setStreamedContent] = useState("");
  const accumulatedBodyRef = useRef("");
  const streamRafRef = useRef(null);
  const abortControllerRef = useRef(null);

  const cancelPendingStreamRaf = () => {
    if (streamRafRef.current !== null) {
      cancelAnimationFrame(streamRafRef.current);
      streamRafRef.current = null;
    }
  };

  const abortActiveStream = () => {
    cancelPendingStreamRaf();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleNewDraft = () => {
    abortActiveStream();
    setIsStreaming(false);
    setStreamingStage(null);
    setStreamedSubject("");
    setStreamedContent("");
    setIsNewDraftMode(true);
    setSelectedDraftId(null);
    setIsOutputPanelOpen(true);
    setEmailForm(DEFAULT_EMAIL_FORM);
    setCoverLetterForm(DEFAULT_COVER_LETTER_FORM);
    router.replace("/writing", { scroll: false });
  };

  const handleSelectDraft = (id) => {
    abortActiveStream();
    setIsStreaming(false);
    setStreamingStage(null);
    setStreamedSubject("");
    setStreamedContent("");
    setIsNewDraftMode(false);
    setSelectedDraftId(id);
    setIsOutputPanelOpen(true);
    const matched = drafts.find((d) => d._id === id);
    if (matched) hydrateFormsFromDraft(matched);
    router.replace(`/writing?id=${id}`, { scroll: false });
  };

  const handleDeleteDraft = async (id) => {
    try {
      await deleteWriting(id);
      if (activeDraftId === id) {
        const remaining = drafts.filter((d) => d._id !== id);
        if (remaining.length > 0) {
          handleSelectDraft(remaining[0]._id);
        } else {
          handleNewDraft();
        }
      }
    } catch {
      // Handled in mutation hook
    }
  };

  const syncCacheOnDone = (savedDraft) => {
    if (!savedDraft?._id) return;
    const savedId = savedDraft._id;

    // 1. Synchronously populate single + list caches BEFORE clearing streaming state
    queryClient.setQueryData(["writing", savedId], {
      success: true,
      data: savedDraft,
    });

    queryClient.setQueriesData({ queryKey: ["writings"] }, (old) => {
      if (!old?.data?.items) return old;
      const exists = old.data.items.some((item) => item._id === savedId);
      const nextItems = exists
        ? old.data.items.map((item) =>
            item._id === savedId ? { ...item, ...savedDraft } : item
          )
        : [savedDraft, ...old.data.items];
      return {
        ...old,
        data: {
          ...old.data,
          items: nextItems,
        },
      };
    });

    setIsNewDraftMode(false);
    setSelectedDraftId(savedId);
    router.replace(`/writing?id=${savedId}`, { scroll: false });

    // 2. Clear streaming state only after cache is populated (zero flicker)
    setIsStreaming(false);
    setStreamingStage(null);
    setStreamedSubject("");
    setStreamedContent("");

    // 3. Mark stale in background without unmounting
    queryClient.invalidateQueries({ queryKey: ["writings"], refetchType: "none" });
    queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
  };

  const runStream = async (streamFn) => {
    setIsOutputPanelOpen(true);
    setIsStreaming(true);
    setStreamingStage({ stage: "preparing", message: "Preparing prompt..." });
    setStreamedSubject("");
    setStreamedContent("");
    accumulatedBodyRef.current = "";

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result = await streamFn({
        signal: abortController.signal,
        onStage: (data) => setStreamingStage(data),
        onSubject: (subj) => setStreamedSubject(subj),
        onTitle: (generatedTitle) => {
          if (generatedTitle && activeDraftId) {
            queryClient.setQueryData(["writing", activeDraftId], (old) => {
              if (!old) return old;
              if (old.data)
                return { ...old, data: { ...old.data, title: generatedTitle } };
              return { ...old, title: generatedTitle };
            });
          }
        },
        onChunk: (chunk) => {
          accumulatedBodyRef.current += chunk;
          if (streamRafRef.current === null) {
            streamRafRef.current = requestAnimationFrame(() => {
              streamRafRef.current = null;
              setStreamedContent(accumulatedBodyRef.current);
            });
          }
        },
        onDone: (data) => {
          cancelPendingStreamRaf();
          if (data?.draft) {
            syncCacheOnDone(data.draft);
          } else {
            setIsStreaming(false);
            setStreamingStage(null);
          }
        },
        onError: (err) => {
          cancelPendingStreamRaf();
          setIsStreaming(false);
          setStreamingStage(null);
          toast.error(err.message || "Generation failed. Please try again.");
        },
      });

      // If stopped mid-stream, refresh list so saved partial draft surfaces cleanly
      if (result?.aborted) {
        setIsStreaming(false);
        setStreamingStage(null);
        if (accumulatedBodyRef.current.trim()) {
          toast.info("Generation stopped — partial draft saved.");
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["writings"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
          }, 450);
        }
      }
    } catch {
      setIsStreaming(false);
      setStreamingStage(null);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleGenerate = () => {
    if (isStreaming) return;
    if (mode === "email") {
      runStream((callbacks) =>
        writingService.streamEmail(
          {
            ...emailForm,
            draftId: activeDraftId || undefined,
          },
          callbacks
        )
      );
    } else {
      runStream((callbacks) =>
        writingService.streamCoverLetter(
          {
            ...coverLetterForm,
            resumeId: coverLetterForm.resumeId || null,
            draftId: activeDraftId || undefined,
          },
          callbacks
        )
      );
    }
  };

  const handleRefine = (action, customInstruction = "") => {
    if (isStreaming || !activeDraftId) return;
    runStream((callbacks) =>
      writingService.streamRefine(
        activeDraftId,
        { action, customInstruction },
        callbacks
      )
    );
  };

  const handleStop = () => {
    abortActiveStream();
  };

  const hasLeftUtilityButtons =
    !isDrawerOpen ||
    (isOutputPanelOpen && Boolean(activeDraft?.previousContent)) ||
    Boolean(activeDraft?._id);

  return (
    <div className="flex h-screen w-full bg-[#0d0d0f] text-white overflow-hidden font-sans">
      {/* Left History Drawer */}
      <WritingDrawer
        drafts={drafts}
        activeDraftId={activeDraftId}
        onSelectDraft={handleSelectDraft}
        onNewDraft={handleNewDraft}
        onDeleteDraft={handleDeleteDraft}
        onTogglePin={(id) => togglePin(id)}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isDrawerOpen}
        isLoading={isLoadingDrafts}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Action Navbar */}
        <header className="h-12 border-b border-white/10 bg-[#0e0e11] px-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleToggleDrawer}
              title={isDrawerOpen ? "Collapse Drawer" : "Expand Drawer"}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <SidebarSimple
                size={18}
                weight={isDrawerOpen ? "fill" : "regular"}
              />
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <span className="text-white/20">/</span>

            <span className="text-xs font-semibold text-white/90 truncate max-w-[220px]">
              {activeDraft?.title || "AI Writing Studio"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* + New Draft visible ONLY when left drawer is collapsed */}
            {!isDrawerOpen && (
              <Tooltip content="Create New Draft" position="bottom">
                <button
                  type="button"
                  onClick={handleNewDraft}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs border border-white/10 transition-colors cursor-pointer"
                >
                  <Plus size={13} weight="bold" />
                  <span>New Draft</span>
                </button>
              </Tooltip>
            )}

            {/* Pin Draft */}
            {activeDraft?._id && (
              <Tooltip
                content={activeDraft.isPinned ? "Unpin Draft" : "Pin Draft"}
                position="bottom"
              >
                <button
                  type="button"
                  onClick={() => togglePin(activeDraft._id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    activeDraft.isPinned
                      ? "bg-[#ff5f56]/15 border-[#ff5f56]/35 text-[#ff5f56]"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  <PushPin
                    size={15}
                    weight={activeDraft.isPinned ? "fill" : "regular"}
                  />
                </button>
              </Tooltip>
            )}

            {/* Restore Previous Version visible ONLY when right output panel is open and backup exists */}
            {isOutputPanelOpen && activeDraft?.previousContent && (
              <Tooltip content="Restore Previous Version" position="bottom">
                <button
                  type="button"
                  disabled={isRestoring || isStreaming}
                  onClick={() => restorePreviousVersion(activeDraft._id)}
                  className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <ArrowCounterClockwise size={15} weight="bold" />
                </button>
              </Tooltip>
            )}

            {hasLeftUtilityButtons && (
              <div className="h-4 w-px bg-white/10 mx-0.5" />
            )}

            {/* Collapsible Right Output Panel Toggle */}
            <Tooltip
              content={
                isOutputPanelOpen ? "Hide Output Panel" : "Show Output Panel"
              }
              position="bottom"
            >
              <button
                type="button"
                onClick={() => setIsOutputPanelOpen((prev) => !prev)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <SidebarSimple
                  size={18}
                  weight={isOutputPanelOpen ? "fill" : "regular"}
                  className="rotate-180"
                />
              </button>
            </Tooltip>
          </div>
        </header>

        {/* Resizable Split-View Studio */}
        <div
          ref={splitContainerRef}
          className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative select-none md:select-text"
        >
          {/* Left Pane: Input Composer */}
          <div
            style={{ width: isOutputPanelOpen ? `${splitPercent}%` : "100%" }}
            className={`h-full flex flex-col min-w-0 min-h-0 overflow-hidden ${
              isDragging ? "" : "transition-[width] duration-300 ease-in-out"
            }`}
          >
            <WritingComposer
              mode={mode}
              onModeChange={(nextMode) => {
                setNewDraftMode(nextMode);
                if (activeDraftId && activeDraft?.type !== nextMode) {
                  setIsNewDraftMode(true);
                  setSelectedDraftId(null);
                  router.replace("/writing", { scroll: false });
                }
              }}
              emailForm={emailForm}
              setEmailForm={setEmailForm}
              coverLetterForm={coverLetterForm}
              setCoverLetterForm={setCoverLetterForm}
              resumes={resumes}
              isLoadingResumes={isLoadingResumes}
              isStreaming={isStreaming}
              hasActiveDraft={Boolean(activeDraftId)}
              isCentered={!isOutputPanelOpen}
              onGenerate={handleGenerate}
              onStop={handleStop}
            />
          </div>

          {/* Draggable Split Divider */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title="Drag to resize panels"
            className={`hidden md:flex cursor-col-resize z-20 items-center justify-center group shrink-0 relative select-none hover:bg-white/5 transition-all duration-300 ease-in-out ${
              isOutputPanelOpen
                ? "w-2.5 -mx-1.5 opacity-100"
                : "w-0 opacity-0 pointer-events-none overflow-hidden -mx-0"
            }`}
          >
            <div className="w-1 h-10 rounded-full bg-white/20 group-hover:bg-[#ff5f56] group-hover:h-14 transition-all" />
          </div>

          {/* Right Pane: Editable Output Canvas */}
          <div
            style={{
              width: isOutputPanelOpen ? `${100 - splitPercent}%` : "0%",
            }}
            className={`h-full flex flex-col min-h-0 overflow-hidden ${
              isOutputPanelOpen
                ? "border-l border-white/10 opacity-100 min-w-0"
                : "w-0 min-w-0 border-none opacity-0 pointer-events-none max-md:hidden max-md:h-0"
            } ${isDragging ? "" : "transition-all duration-300 ease-in-out"}`}
          >
            <WritingEditorPane
              key={activeDraft?._id || "new-draft"}
              draft={activeDraft}
              mode={mode}
              isStreaming={isStreaming}
              streamingStage={streamingStage}
              streamedSubject={streamedSubject}
              streamedContent={streamedContent}
              isSaving={isSaving}
              onSaveEdits={(id, data) => updateWriting({ id, data })}
              onRefine={handleRefine}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
