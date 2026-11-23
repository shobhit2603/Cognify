"use client";
import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarSimple, Plus, FileText, ArrowLeft } from "@phosphor-icons/react";
import { toast } from "sonner";
import NotesDrawer from "./NotesDrawer";
import RawNoteEditor from "./RawNoteEditor";
import EnhanceActionBar from "./EnhanceActionBar";
import EnhancedNotePane from "./EnhancedNotePane";
import { useNotes, useNote, useNoteFolders, useNoteMutations } from "../hooks/useNotes";
import { noteService } from "../services/note.service";
import { getStoredPresets } from "../constants/presets";

export default function NotesStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  // Debounce search query to prevent unnecessary refetches and flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Split ratio: default 42% for raw editor, 58% for enhanced reading view
  const [splitPercent, setSplitPercent] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cognify_notes_split_ratio");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 25 && parsed <= 65) return parsed;
      }
    }
    return 42;
  });

  const splitContainerRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Pointer drag events for resizable divider
  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
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
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        localStorage.setItem("cognify_notes_split_ratio", splitPercent.toString());
      } catch {
        // ignore
      }
    }
  };

  // Enhancement Streaming State
  const [selectedFrameworkId, setSelectedFrameworkId] = useState(null); // null = Auto-Detect
  const [customInstructions, setCustomInstructions] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementStage, setEnhancementStage] = useState(null);
  const [streamedText, setStreamedText] = useState("");
  const accumulatedTextRef = useRef("");

  const abortControllerRef = useRef(null);

  // Queries
  const { data: notes = [], isLoading: isLoadingNotes } = useNotes({
    search: debouncedSearchQuery,
  });
  const { data: folders = [] } = useNoteFolders();

  // Mutations
  const {
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    moveNote,
    restorePreviousEnhancement,
    createFolder,
    updateFolder,
    deleteFolder,
  } = useNoteMutations();

  // Derived active note id and active note (decoupled from drawer search filtering)
  const urlId = searchParams.get("id");
  const activeNoteId = selectedNoteId || urlId || (notes.length > 0 ? notes[0]._id : null);
  const { data: singleNote } = useNote(activeNoteId);
  const activeNote = singleNote || notes.find((n) => n._id === activeNoteId) || null;

  const handleSelectNote = (id) => {
    if (isEnhancing && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsEnhancing(false);
      setEnhancementStage(null);
      setStreamedText("");
    }
    setSelectedNoteId(id);
    setStreamedText("");
    setEnhancementStage(null);
    router.replace(`/notes?id=${id}`, { scroll: false });
  };

  const handleCreateNote = async (initialData = {}) => {
    try {
      const res = await createNote(initialData);
      const newNote = res?.data || res;
      if (newNote?._id) {
        handleSelectNote(newNote._id);
        toast.success("New note created");
      }
    } catch {
      // Handled in mutation hook
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      if (activeNoteId === id) {
        const remaining = notes.filter((n) => n._id !== id);
        const nextId = remaining.length > 0 ? remaining[0]._id : null;
        setSelectedNoteId(nextId);
        if (nextId) router.replace(`/notes?id=${nextId}`, { scroll: false });
        else router.replace("/notes", { scroll: false });
      }
    } catch {
      // Handled
    }
  };

  const handleDeleteFolder = async (folderId, noteCount) => {
    // STRICT RULE: block deletion if notes exist
    if (noteCount > 0) {
      toast.error(
        `Cannot delete folder because it contains ${noteCount} note(s). Please move or delete the notes inside first.`
      );
      return;
    }

    try {
      await deleteFolder(folderId);
    } catch {
      // Handled
    }
  };

  // Trigger SSE Enhancement Streaming
  const handleEnhance = async () => {
    if (!activeNote || !activeNote.originalContent?.trim() || isEnhancing) return;

    setIsEnhancing(true);
    accumulatedTextRef.current = "";
    setStreamedText("");
    setEnhancementStage({ stage: "detecting", message: "Analyzing note intent..." });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Look up preset instructions if active
    let presetInstructions;
    if (selectedFrameworkId) {
      const presets = getStoredPresets();
      const match = presets.find((p) => p.id === selectedFrameworkId);
      if (match?.instructions?.trim()) {
        presetInstructions = match.instructions.trim();
      }
    }

    try {
      await noteService.streamNoteEnhancement(
        activeNote._id,
        {
          frameworkId: selectedFrameworkId,
          customInstructions: customInstructions.trim() || undefined,
          presetInstructions: presetInstructions || undefined,
        },
        {
          signal: abortController.signal,
          onStage: (data) => {
            setEnhancementStage(data);
          },
          onTitle: (generatedTitle) => {
            if (generatedTitle) {
              queryClient.setQueriesData({ queryKey: ["notes"] }, (oldNotes) => {
                if (!oldNotes) return oldNotes;
                if (Array.isArray(oldNotes.data)) {
                  return {
                    ...oldNotes,
                    data: oldNotes.data.map((n) =>
                      n._id === activeNote._id ? { ...n, title: generatedTitle } : n
                    ),
                  };
                }
                if (Array.isArray(oldNotes)) {
                  return oldNotes.map((n) =>
                    n._id === activeNote._id ? { ...n, title: generatedTitle } : n
                  );
                }
                return oldNotes;
              });
              queryClient.setQueryData(["note", activeNote._id], (oldNote) => {
                if (!oldNote) return oldNote;
                if (oldNote.data) {
                  return { ...oldNote, data: { ...oldNote.data, title: generatedTitle } };
                }
                return { ...oldNote, title: generatedTitle };
              });
            }
          },
          onChunk: (chunk) => {
            accumulatedTextRef.current += chunk;
            setStreamedText(accumulatedTextRef.current);
          },
          onDone: (data) => {
            const finalContent = accumulatedTextRef.current || "";
            const frameworkName = data?.frameworkUsed || "Enhanced Blueprint";
            const targetNoteId = activeNote._id;

            const updatedFields = {
              ...(data?.note || {}),
              enhancedContent: data?.note?.enhancedContent || finalContent,
              previousEnhancedContent:
                data?.note?.previousEnhancedContent !== undefined
                  ? data.note.previousEnhancedContent
                  : activeNote.enhancedContent || null,
              enhancedMetadata: data?.note?.enhancedMetadata || {
                frameworkUsed: frameworkName,
                enhancedAt: new Date().toISOString(),
              },
            };

            // 1. Synchronously update TanStack Query cache before clearing streaming text
            queryClient.setQueriesData({ queryKey: ["notes"] }, (old) => {
              if (!old) return old;
              if (Array.isArray(old.data)) {
                return {
                  ...old,
                  data: old.data.map((n) =>
                    n._id === targetNoteId ? { ...n, ...updatedFields } : n
                  ),
                };
              }
              if (Array.isArray(old)) {
                return old.map((n) =>
                  n._id === targetNoteId ? { ...n, ...updatedFields } : n
                );
              }
              return old;
            });

            queryClient.setQueryData(["note", targetNoteId], (old) => {
              if (!old) return { success: true, data: { ...activeNote, ...updatedFields } };
              if (old.data) {
                return { ...old, data: { ...old.data, ...updatedFields } };
              }
              return { ...old, ...updatedFields };
            });

            // 2. Clear streaming state now that cache is populated
            setIsEnhancing(false);
            setEnhancementStage(null);
            setStreamedText("");

            // 3. Mark query stale in background without dropping cache or unmounting
            queryClient.invalidateQueries({
              queryKey: ["notes"],
              refetchType: "none",
            });
          },
          onError: (err) => {
            setIsEnhancing(false);
            setEnhancementStage(null);
            toast.error(err.message || "Enhancement failed. Please try again.");
          },
        }
      );
    } catch {
      setIsEnhancing(false);
      setEnhancementStage(null);
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsEnhancing(false);
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d0d0f] text-white overflow-hidden font-sans">
      {/* ── Left Drawer ── */}
      <NotesDrawer
        notes={notes}
        folders={folders}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onTogglePin={(id) => togglePin(id)}
        onMoveNote={(id, folderId) => moveNote({ id, folderId })}
        onCreateFolder={(data) => createFolder(data)}
        onUpdateFolder={(id, data) => updateFolder({ id, data })}
        onDeleteFolder={handleDeleteFolder}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
      />

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navigation Bar / Workspace Top Bar */}
        <header className="h-12 border-b border-white/10 bg-[#0e0e11] px-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
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

            <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
              {activeNote ? activeNote.title : "Notes Enhancer"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isDrawerOpen && (
              <button
                type="button"
                onClick={() => handleCreateNote()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs border border-white/10 transition-colors"
              >
                <Plus size={13} weight="bold" />
                <span>New Note</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Split-Screen Studio ── */}
        {activeNote ? (
          <div
            ref={splitContainerRef}
            className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative select-none md:select-text"
          >
            {/* Left Column: Raw Note Editor + Scoped Action Bar */}
            <div
              style={{ width: `${splitPercent}%` }}
              className="h-full flex flex-col min-w-0 min-h-0 overflow-hidden"
            >
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <RawNoteEditor
                  key={activeNote._id}
                  note={activeNote}
                  onSave={(id, data) => updateNote({ id, data })}
                />
              </div>

              {/* Scoped Bottom Action Bar (width matches raw notes column only) */}
              <div className="shrink-0 border-t border-white/10 bg-[#0d0d0f]">
                <EnhanceActionBar
                  selectedFrameworkId={selectedFrameworkId}
                  onSelectFramework={setSelectedFrameworkId}
                  customInstructions={customInstructions}
                  setCustomInstructions={setCustomInstructions}
                  onEnhance={handleEnhance}
                  isEnhancing={isEnhancing}
                  rawContentLength={(activeNote.originalContent || "").trim().length}
                />
              </div>
            </div>

            {/* Draggable Divider with Pointer Events */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title="Drag to resize panels"
              className="hidden md:flex w-2.5 -mx-1.5 cursor-col-resize z-20 items-center justify-center group shrink-0 relative select-none hover:bg-white/5"
            >
              <div className="w-1 h-10 rounded-full bg-white/20 group-hover:bg-osmo-lime group-hover:h-14 transition-all" />
            </div>

            {/* Right Column: Live Enhanced Output (Extends cleanly to bottom of viewport) */}
            <div
              style={{ width: `${100 - splitPercent}%` }}
              className="h-full flex flex-col min-w-0 min-h-0 overflow-hidden border-l border-white/10"
            >
              <EnhancedNotePane
                key={activeNote._id}
                note={activeNote}
                isEnhancing={isEnhancing}
                enhancementStage={enhancementStage}
                streamedText={streamedText}
                onUpdateEnhancedContent={(id, content) =>
                  updateNote({ id, data: { enhancedContent: content } })
                }
                onRestorePrevious={(id) => restorePreviousEnhancement(id)}
              />
            </div>
          </div>
        ) : (
          /* Empty Workspace (no notes in user account) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-osmo-lime mb-4 shadow-inner">
              <FileText size={32} weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isLoadingNotes ? "Loading Notes..." : "No Notes Found"}
            </h3>
            <p className="text-xs text-white/50 max-w-sm mb-6 leading-relaxed">
              Create your first note to start jotting down rough ideas, meeting bullets,
              or lecture concepts, and enhance them into structured blueprints.
            </p>
            <button
              type="button"
              onClick={() => handleCreateNote()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-osmo-lime text-black font-semibold text-xs hover:bg-osmo-lime/90 transition-all shadow-md shadow-osmo-lime/20"
            >
              <Plus size={15} weight="bold" />
              <span>Create First Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
