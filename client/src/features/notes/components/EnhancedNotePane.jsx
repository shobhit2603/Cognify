"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import {
  Sparkle,
  Copy,
  FilePdf,
  ChatsCircle,
  Eye,
  PencilSimple,
  ArrowCounterClockwise,
  Lightning,
  CircleNotch,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function EnhancedNotePane({
  note,
  isEnhancing = false,
  enhancementStage = null, // { stage: 'detecting' | 'synthesizing', message, framework }
  streamedText = "",
  onUpdateEnhancedContent,
  onRestorePrevious,
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const activeContent = streamedText || note?.enhancedContent || "";
  const hasContent = !!activeContent.trim();
  const frameworkName =
    enhancementStage?.framework || note?.enhancedMetadata?.frameworkUsed;

  const handleCopyMarkdown = () => {
    if (!activeContent) return;
    navigator.clipboard.writeText(activeContent);
    toast.success("Enhanced note copied to clipboard as Markdown!");
  };

  const handleSaveAsPdf = () => {
    if (!activeContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to export as PDF.");
      return;
    }

    const title = note?.title || "Enhanced Note";
    const dateStr = new Date(note?.updatedAt || Date.now()).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Cognify Notes</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-size: 12pt; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.7;
              color: #1a1a1a;
              max-width: 820px;
              margin: 40px auto;
              padding: 0 24px;
            }
            h1 { font-size: 26px; font-weight: 700; color: #0a0a0a; margin-bottom: 8px; }
            h2 { font-size: 20px; font-weight: 600; color: #111; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
            h3 { font-size: 16px; font-weight: 600; color: #222; margin-top: 22px; margin-bottom: 8px; }
            p { margin: 12px 0; color: #374151; }
            ul, ol { padding-left: 24px; margin: 12px 0; }
            li { margin-bottom: 6px; color: #374151; }
            code { background: #f3f4f6; color: #1f2937; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace; }
            pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; overflow-x: auto; margin: 16px 0; }
            pre code { background: none; padding: 0; }
            blockquote { border-left: 4px solid #84cc16; margin: 16px 0; padding: 6px 16px; color: #4b5563; background: #f9fafb; border-radius: 0 8px 8px 0; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-size: 13px; }
            th { background: #f9fafb; font-weight: 600; }
            .meta { font-size: 12px; color: #6b7280; font-family: monospace; margin-bottom: 24px; }
            .header-rule { border: none; border-top: 2px solid #84cc16; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">
            ${frameworkName ? `Structured with: ${frameworkName} • ` : ""}
            Cognify AI • Exported ${dateStr}
          </div>
          <div class="header-rule"></div>
          <div id="print-content"></div>
        </body>
      </html>
    `);

    // Render plain text fallback if formatting is raw
    const bodyEl = printWindow.document.getElementById("print-content");
    if (bodyEl) {
      bodyEl.innerText = activeContent;
    }

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleDiscussInChat = () => {
    if (!activeContent && !note?.originalContent) return;

    const chatContextPrompt = `I would like to discuss and ask questions about this note:

**Title:** ${note?.title || "Untitled Note"}
${frameworkName ? `**Framework:** ${frameworkName}\n` : ""}
---
${activeContent || note.originalContent}
---
Please give me a concise breakdown and let me know what questions you have or how we can explore this deeper.`;

    try {
      sessionStorage.setItem("cognify_pending_chat_prompt", chatContextPrompt);
    } catch {
      // Fallback
    }

    toast.success("Redirecting to AI Chat with this note as context...");
    router.push("/chat");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e0e11] select-text overflow-hidden">
      {/* ── Top Header Actions ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-[#0e0e11]/90 backdrop-blur-sm shrink-0 select-none">
        <div className="flex items-center gap-2 truncate">
          <Sparkle size={18} className="text-osmo-lime shrink-0" weight="fill" />
          <span className="text-sm font-semibold text-white tracking-wide font-mono uppercase truncate">
            Enhanced Blueprint
          </span>

          {frameworkName && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-osmo-lime/10 text-osmo-lime border border-osmo-lime/20 font-mono truncate">
              <Lightning size={11} weight="fill" />
              <span>{frameworkName}</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hasContent && (
            <>
              {/* Preview vs Edit Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isEditing) setEditedContent(activeContent);
                  else if (editedContent !== activeContent) {
                    onUpdateEnhancedContent(note._id, editedContent);
                  }
                  setIsEditing(!isEditing);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title={isEditing ? "Switch to Rendered Preview" : "Edit Enhanced Text"}
              >
                {isEditing ? <Eye size={14} /> : <PencilSimple size={14} />}
                <span className="hidden md:inline">{isEditing ? "Preview" : "Edit"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                title="Copy Markdown"
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Copy size={15} />
              </button>

              <button
                type="button"
                onClick={handleSaveAsPdf}
                title="Save as PDF"
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FilePdf size={15} />
              </button>

              <button
                type="button"
                onClick={handleDiscussInChat}
                title="Discuss in AI Chat"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-osmo-lime/10 border border-osmo-lime/30 text-xs text-osmo-lime font-medium hover:bg-osmo-lime/20 transition-all shadow-sm"
              >
                <ChatsCircle size={15} weight="bold" />
                <span className="hidden lg:inline">Discuss in Chat</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Version Safeguard Banner (if previous enhancement exists) ── */}
      {note?.previousEnhancedContent && (
        <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300 select-none shrink-0">
          <span className="flex items-center gap-1.5">
            <ArrowCounterClockwise size={13} weight="bold" />
            <span>A previous enhancement version is available.</span>
          </span>
          <button
            type="button"
            onClick={() => onRestorePrevious(note._id)}
            className="underline hover:text-amber-200 font-medium"
          >
            Restore Previous Version
          </button>
        </div>
      )}

      {/* ── 2-Stage Progress Shimmer Banner (while enhancing) ── */}
      {isEnhancing && enhancementStage && (
        <div className="px-6 py-3 bg-osmo-lime/10 border-b border-osmo-lime/20 flex items-center gap-3 text-xs text-osmo-lime font-mono shrink-0 animate-pulse">
          <CircleNotch size={16} className="animate-spin text-osmo-lime" />
          <span className="font-semibold uppercase">
            [{enhancementStage.stage === "detecting" ? "STAGE 1/2" : "STAGE 2/2"}]:
          </span>
          <span>{enhancementStage.message}</span>
        </div>
      )}

      {/* ── Main Canvas ── */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none resize-none text-white/90 text-sm leading-relaxed font-mono focus:ring-0"
            placeholder="Edit enhanced Markdown directly..."
          />
        ) : hasContent ? (
          <div className="prose prose-invert max-w-none text-white/90 leading-relaxed font-sans select-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1({ children }) {
                  return (
                    <h1 className="text-xl font-bold tracking-tight text-white mt-6 mb-3 first:mt-0 pb-2 border-b border-white/10">
                      {children}
                    </h1>
                  );
                },
                h2({ children }) {
                  return (
                    <h2 className="text-lg font-semibold tracking-tight text-white mt-5 mb-2.5 first:mt-0 text-osmo-lime">
                      {children}
                    </h2>
                  );
                },
                h3({ children }) {
                  return (
                    <h3 className="text-base font-semibold tracking-tight text-white/95 mt-4 mb-2 first:mt-0">
                      {children}
                    </h3>
                  );
                },
                p({ children }) {
                  return (
                    <p className="text-sm leading-relaxed text-white/80 my-2.5 first:mt-0 last:mb-0">
                      {children}
                    </p>
                  );
                },
                ul({ children }) {
                  return (
                    <ul className="list-disc list-inside space-y-1 my-2.5 text-sm text-white/80">
                      {children}
                    </ul>
                  );
                },
                ol({ children }) {
                  return (
                    <ol className="list-decimal list-inside space-y-1 my-2.5 text-sm text-white/80">
                      {children}
                    </ol>
                  );
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-osmo-lime/70 pl-3.5 my-3 bg-white/[0.03] py-2 rounded-r-lg text-white/70 italic text-xs">
                      {children}
                    </blockquote>
                  );
                },
                code({ inline, children }) {
                  if (inline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-white/10 text-osmo-lime text-xs font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="p-3.5 my-3 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-xs font-mono text-emerald-400">
                      <code>{children}</code>
                    </pre>
                  );
                },
              }}
            >
              {activeContent}
            </ReactMarkdown>
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-osmo-lime mb-4 shadow-inner">
              <Sparkle size={28} weight="duotone" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">
              No Enhancement Generated Yet
            </h4>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-6">
              Write or paste your rough notes on the left canvas, select an enhancement
              preset, and click <span className="text-osmo-lime font-medium">Enhance Note</span> to
              generate a structured study guide, technical blueprint, or meeting brief.
            </p>
            <div className="grid grid-cols-2 gap-2.5 max-w-md w-full text-left text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-osmo-lime font-bold">⚡ Zero Friction</span>
                <p className="text-[11px] text-white/40 mt-1">
                  Auto-Detect selects the best format if no preset is chosen.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-osmo-lime font-bold">🛡️ Version Safe</span>
                <p className="text-[11px] text-white/40 mt-1">
                  Re-enhancing keeps your original raw text and backup intact.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
