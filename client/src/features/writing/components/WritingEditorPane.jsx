"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Eye,
  PencilSimple,
  DownloadSimple,
  FilePdf,
  FileText,
  PenNib,
  CircleNotch,
  Sparkle,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import RefineActionBar from "./RefineActionBar";

export default function WritingEditorPane({
  draft = null,
  mode = "email",
  isStreaming = false,
  streamingStage = null,
  streamedSubject = "",
  streamedContent = "",
  isSaving = false,
  onSaveEdits,
  onRefine,
}) {
  const activeType = draft?.type || mode;
  const isEmail = activeType === "email";

  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState(null);
  const [saveState, setSaveState] = useState("saved"); // "saved" | "unsaved" | "saving" | "error"
  const [copiedKey, setCopiedKey] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Derived active subject/content: streaming props directly while streaming; user editBuffer when editing; else saved draft
  const hasMatchingEditBuffer =
    !isStreaming && editBuffer && editBuffer.draftId === (draft?._id || null);

  const localSubject = isStreaming
    ? streamedSubject || draft?.subject || ""
    : hasMatchingEditBuffer
      ? editBuffer.subject
      : draft?.subject || "";

  const localContent = isStreaming
    ? streamedContent
    : hasMatchingEditBuffer
      ? editBuffer.content
      : draft?.content || "";

  // Guard: only true when the user actually types into Subject/Content inputs
  const userDirtyRef = useRef(false);
  const editVersionRef = useRef(0);
  const pendingSaveRef = useRef(null);
  const onSaveEditsRef = useRef(onSaveEdits);
  const latestEditRef = useRef({
    draftId: draft?._id || null,
    isEmail,
    subject: localSubject,
    content: localContent,
  });
  const markdownContainerRef = useRef(null);

  useEffect(() => {
    onSaveEditsRef.current = onSaveEdits;
  }, [onSaveEdits]);

  const executeAckedSave = async (targetDraftId, payload, sentVersion) => {
    setSaveState("saving");
    const savePromise = onSaveEditsRef.current(targetDraftId, payload);
    pendingSaveRef.current = savePromise;

    try {
      await savePromise;
      if (pendingSaveRef.current === savePromise) {
        pendingSaveRef.current = null;
      }
      if (editVersionRef.current === sentVersion) {
        userDirtyRef.current = false;
        setEditBuffer(null);
        setSaveState("saved");
      } else {
        setSaveState("unsaved");
      }
      return true;
    } catch {
      if (pendingSaveRef.current === savePromise) {
        pendingSaveRef.current = null;
      }
      setSaveState("error");
      return false;
    }
  };

  // Flush any unacknowledged edits to their original draftId if user switches drafts
  useEffect(() => {
    return () => {
      if (userDirtyRef.current && latestEditRef.current.draftId) {
        const { draftId: targetId, isEmail: wasEmail, subject, content } =
          latestEditRef.current;
        const payload = { content };
        if (wasEmail) {
          payload.subject = subject;
        }
        onSaveEditsRef.current(targetId, payload).catch(() => {});
      }
    };
  }, []);

  // 800ms debounced auto-save strictly guarded by userDirtyRef
  useEffect(() => {
    if (!userDirtyRef.current || isStreaming || !draft?._id || !editBuffer) {
      return;
    }

    const targetDraftId = draft._id;
    const sentVersion = editVersionRef.current;
    const payload = { content: latestEditRef.current.content };
    if (isEmail) {
      payload.subject = latestEditRef.current.subject;
    }

    const timer = setTimeout(() => {
      if (!userDirtyRef.current) return;
      executeAckedSave(targetDraftId, payload, sentVersion);
    }, 800);

    return () => clearTimeout(timer);
  }, [editBuffer, draft?._id, isEmail, isStreaming]);

  const flushPendingEdits = async () => {
    if (pendingSaveRef.current) {
      await pendingSaveRef.current.catch(() => {});
    }
    if (!userDirtyRef.current || !draft?._id || isStreaming) return true;
    const sentVersion = editVersionRef.current;
    const payload = { content: latestEditRef.current.content };
    if (isEmail) {
      payload.subject = latestEditRef.current.subject;
    }
    return await executeAckedSave(draft._id, payload, sentVersion);
  };

  const handleSubjectChange = (e) => {
    const nextVal = e.target.value;
    userDirtyRef.current = true;
    editVersionRef.current += 1;
    setSaveState("unsaved");
    latestEditRef.current = {
      draftId: draft?._id || null,
      isEmail,
      subject: nextVal,
      content: localContent,
    };
    setEditBuffer({
      draftId: draft?._id || null,
      subject: nextVal,
      content: localContent,
    });
  };

  const handleContentChange = (e) => {
    const nextVal = e.target.value;
    userDirtyRef.current = true;
    editVersionRef.current += 1;
    setSaveState("unsaved");
    latestEditRef.current = {
      draftId: draft?._id || null,
      isEmail,
      subject: localSubject,
      content: nextVal,
    };
    setEditBuffer({
      draftId: draft?._id || null,
      subject: localSubject,
      content: nextVal,
    });
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      await flushPendingEdits();
    }
    setIsEditing((prev) => !prev);
  };

  const triggerCopyFeedback = (key) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleCopySubject = async () => {
    if (!localSubject?.trim()) return;
    try {
      await navigator.clipboard.writeText(localSubject);
      triggerCopyFeedback("subject");
      toast.success("Subject copied to clipboard");
    } catch {
      toast.error("Failed to copy subject. Please copy manually.");
    }
  };

  const handleCopyBody = async () => {
    if (!localContent?.trim()) return;
    try {
      await navigator.clipboard.writeText(localContent);
      triggerCopyFeedback("body");
      toast.success("Draft body copied to clipboard");
    } catch {
      toast.error("Failed to copy draft body. Please copy manually.");
    }
  };

  const escapeHtml = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const handleDownloadText = (ext) => {
    setIsExportOpen(false);
    if (!localContent?.trim()) return;
    const fileTitle = (draft?.title || "cognify-draft")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-|-$/g, "");
    const header =
      isEmail && localSubject?.trim() ? `Subject: ${localSubject.trim()}\n\n` : "";
    const blob = new Blob([`${header}${localContent}`], {
      type: ext === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileTitle || "cognify-draft"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    setIsExportOpen(false);
    if (!localContent?.trim()) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to export as PDF.");
      return;
    }

    const safeTitle = escapeHtml(draft?.title || (isEmail ? "Email Draft" : "Cover Letter"));
    const safeSubject = escapeHtml(localSubject);
    const dateStr = new Date(draft?.updatedAt || Date.now()).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const renderedHtml = markdownContainerRef.current
      ? markdownContainerRef.current.innerHTML
      : `<pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px;">${escapeHtml(localContent)}</pre>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeTitle} - Cognify AI Writing</title>
          <style>
            @media print { @page { margin: 1.8cm; } body { margin: 0; padding: 0; } }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              line-height: 1.7;
              color: #111827;
              background: #fff;
              max-width: 780px;
              margin: 40px auto;
              padding: 0 24px;
            }
            .header {
              border-bottom: 2px solid #ff5f56;
              padding-bottom: 14px;
              margin-bottom: 24px;
            }
            h1 { font-size: 22px; font-weight: 700; margin: 0 0 6px 0; color: #0a0a0a; }
            .subject { font-size: 14px; font-weight: 600; color: #374151; margin: 6px 0; }
            .meta { font-size: 11px; color: #6b7280; font-family: monospace; }
            p { margin: 12px 0; font-size: 14px; color: #1f2937; }
            ul, ol { padding-left: 20px; font-size: 14px; color: #1f2937; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${safeTitle}</h1>
            ${isEmail && safeSubject ? `<div class="subject">Subject: ${safeSubject}</div>` : ""}
            <div class="meta">Cognify AI Writing • ${dateStr}</div>
          </div>
          <div>${renderedHtml}</div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const hasContent = Boolean(
    localContent?.trim() || isStreaming || (isEditing && draft?._id)
  );

  return (
    <div className="h-full flex flex-col bg-[#0b0b0d] min-h-0">
      {/* Top Output Toolbar */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-[#0e0e11] flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff5f56] font-semibold">
            {isEmail ? "Email Output" : "Cover Letter Output"}
          </span>

          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ff5f56]/15 border border-[#ff5f56]/30 text-[10px] font-mono text-[#ff5f56]">
              <CircleNotch size={11} className="animate-spin" />
              <span>{streamingStage?.message || "Generating..."}</span>
            </span>
          )}

          {!isStreaming && draft?._id && (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-mono ${
                  saveState === "error" ? "text-[#ff5f56]" : "text-white/40"
                }`}
              >
                {saveState === "saving" || isSaving
                  ? "Saving..."
                  : saveState === "error"
                    ? "Save failed"
                    : saveState === "unsaved"
                      ? "Unsaved"
                      : "Saved"}
              </span>
              {saveState === "error" && (
                <button
                  type="button"
                  onClick={() => flushPendingEdits()}
                  className="text-[10px] font-mono underline text-[#ff5f56] hover:text-white cursor-pointer"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasContent && !isStreaming && (
            <>
              <button
                type="button"
                onClick={handleToggleEdit}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isEditing
                    ? "bg-[#ff5f56]/18 border-[#ff5f56]/45 text-[#ff5f56]"
                    : "bg-white/[0.04] border-white/10 text-white/75 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye size={13} />
                    <span>Preview</span>
                  </>
                ) : (
                  <>
                    <PencilSimple size={13} />
                    <span>Edit</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyBody}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/75 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === "body" ? (
                  <Check size={13} className="text-osmo-lime" />
                ) : (
                  <Copy size={13} />
                )}
                <span>Copy</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportOpen((v) => !v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/75 hover:text-white transition-colors cursor-pointer"
                >
                  <DownloadSimple size={13} />
                  <span>Export</span>
                </button>

                {isExportOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsExportOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-[#16161a] border border-white/12 shadow-2xl p-1 z-40">
                      <button
                        type="button"
                        onClick={() => handleDownloadText("txt")}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                      >
                        <FileText size={13} />
                        <span>Download .txt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadText("md")}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                      >
                        <FileText size={13} />
                        <span>Download .md</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                      >
                        <FilePdf size={13} className="text-[#ff5f56]" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Editable Subject Bar */}
      {isEmail && hasContent && (
        <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#111115] flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 shrink-0">
            Subject:
          </span>
          <input
            type="text"
            value={localSubject}
            disabled={isStreaming}
            onChange={handleSubjectChange}
            placeholder={isStreaming ? "Generating subject line..." : "Email subject line"}
            className="flex-1 bg-transparent text-sm font-semibold text-white placeholder-white/30 focus:outline-none"
          />
          <button
            type="button"
            disabled={!localSubject?.trim()}
            onClick={handleCopySubject}
            title="Copy Subject Line"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] text-white/70 hover:text-white transition-colors cursor-pointer disabled:opacity-35"
          >
            {copiedKey === "subject" ? (
              <Check size={12} className="text-osmo-lime" />
            ) : (
              <Copy size={12} />
            )}
            <span>Copy Subject</span>
          </button>
        </div>
      )}

      {/* Main Output / Editable Body */}
      {hasContent ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {isEditing && !isStreaming ? (
            <textarea
              value={localContent}
              onChange={handleContentChange}
              className="flex-1 w-full h-full p-5 bg-[#0b0b0d] text-sm text-white/90 leading-relaxed focus:outline-none resize-none font-sans [scrollbar-width:thin]"
              placeholder="Edit your draft copy here..."
            />
          ) : (
            <div
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto p-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]"
            >
              <div
                ref={markdownContainerRef}
                className="prose prose-invert prose-sm max-w-none prose-p:text-white/85 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white prose-li:text-white/85"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {localContent || ""}
                </ReactMarkdown>
              </div>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-[#ff5f56] animate-pulse ml-1 align-middle" />
              )}
            </div>
          )}

          {/* Quick AI Refine Bar (shown when draft is persisted and not streaming) */}
          {draft?._id && !isStreaming && (
            <RefineActionBar
              onRefine={async (action, customInstruction) => {
                const savedOk = await flushPendingEdits();
                if (!savedOk) return;
                onRefine(action, customInstruction);
              }}
              isStreaming={isStreaming}
              disabled={!localContent?.trim()}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-[#ff5f56]/10 border border-[#ff5f56]/25 flex items-center justify-center text-[#ff5f56] mb-4">
            <PenNib size={26} weight="duotone" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1.5">
            {isEmail ? "Ready to Draft Your Email" : "Ready to Craft Your Cover Letter"}
          </h3>
          <p className="text-xs text-white/45 max-w-sm leading-relaxed">
            {isEmail
              ? "Configure purpose, intent, context, and tone on the left. Cognify will stream a crisp subject line and editable email copy."
              : "Attach an existing Resume from Resume Studio (or enter your background), paste the job description, and generate a tailored, editable cover letter."}
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-white/35">
            <Sparkle size={12} className="text-[#ff5f56]" />
            <span>Editable output with auto-save & quick AI refinement</span>
          </div>
        </div>
      )}
    </div>
  );
}
