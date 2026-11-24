"use client";
import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, CircleNotch, WarningCircle } from "@phosphor-icons/react";

export default function RawNoteEditor({
  note,
  onSave,
  isSaving = false,
  isCentered = false,
}) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.originalContent || "");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "unsaved"

  const timerRef = useRef(null);
  const prevExternalTitleRef = useRef(note?.title);
  const pendingPayloadRef = useRef(null);
  const onSaveRef = useRef(onSave);
  const saveVersionRef = useRef(0);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Flush pending save and clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingPayloadRef.current && note?._id) {
        onSaveRef.current?.(note._id, pendingPayloadRef.current);
      }
    };
  }, [note?._id]);

  // Sync external title updates (e.g. AI auto-title generation) without triggering auto-save
  useEffect(() => {
    if (note?.title && note.title !== prevExternalTitleRef.current) {
      prevExternalTitleRef.current = note.title;
      setTitle(note.title);
      if (pendingPayloadRef.current) {
        pendingPayloadRef.current.title = note.title;
      }
      setSaveStatus("saved");
    }
  }, [note?.title]);

  // Debounced auto-save trigger (800ms) with sequence check
  const triggerAutoSave = (newTitle, newContent) => {
    setSaveStatus("saving");
    pendingPayloadRef.current = {
      title: newTitle,
      originalContent: newContent,
    };

    if (timerRef.current) clearTimeout(timerRef.current);

    const currentVersion = ++saveVersionRef.current;

    timerRef.current = setTimeout(async () => {
      try {
        const payload = pendingPayloadRef.current || {
          title: newTitle,
          originalContent: newContent,
        };
        await onSave(note._id, payload);
        if (saveVersionRef.current === currentVersion) {
          pendingPayloadRef.current = null;
          setSaveStatus("saved");
        }
      } catch {
        if (saveVersionRef.current === currentVersion) {
          setSaveStatus("error");
        }
      }
    }, 800);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setSaveStatus("unsaved");
    triggerAutoSave(val, content);
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus("unsaved");
    triggerAutoSave(title, val);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121215] select-text overflow-hidden">
      {/* ── Editor Header: Title & Auto-Save Indicator ── */}
      <div className="border-b border-white/5 bg-[#121215]/80 backdrop-blur-sm shrink-0">
        <div className={`flex items-center justify-between px-6 py-4 ${isCentered ? "max-w-4xl mx-auto w-full" : ""}`}>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note..."
            className="flex-1 text-lg font-semibold text-white bg-transparent border-none outline-none placeholder-white/30 truncate mr-4 focus:ring-0"
          />

          {/* Auto-save status indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 select-none">
            {saveStatus === "saving" || isSaving ? (
              <span className="flex items-center gap-1.5 text-white/50">
                <CircleNotch size={14} className="animate-spin text-osmo-lime" />
                <span>Saving...</span>
              </span>
            ) : saveStatus === "error" ? (
              <span className="flex items-center gap-1.5 text-rose-400">
                <WarningCircle size={14} />
                <span>Save error</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/40">
                <CheckCircle size={14} className="text-osmo-lime/70" weight="fill" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Raw Textarea Canvas ── */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div className={`h-full ${isCentered ? "max-w-4xl mx-auto w-full" : ""}`}>
          <textarea
            data-lenis-prevent
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing your rough thoughts, meeting bullets, code ideas, or lecture notes here...&#10;&#10;When ready, pick a preset below or click 'Enhance Note' to transform them into a structured blueprint."
            className="w-full h-full p-6 bg-transparent border-none outline-none resize-none text-white/90 placeholder-white/20 text-sm leading-relaxed font-sans focus:ring-0 overflow-y-auto custom-scrollbar block"
          />
        </div>
      </div>

      {/* ── Editor Footer: Stats ── */}
      <div className="border-t border-white/5 bg-[#0f0f12] text-[11px] font-mono text-white/40 shrink-0 select-none">
        <div className={`flex items-center justify-between px-6 py-2.5 ${isCentered ? "max-w-4xl mx-auto w-full" : ""}`}>
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
          <span className="text-white/30 hidden sm:inline">
            Auto-saves after 800ms
          </span>
        </div>
      </div>
    </div>
  );
}
