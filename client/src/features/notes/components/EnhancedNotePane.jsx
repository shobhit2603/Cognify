"use client";
import React, { useState, useRef } from "react";
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
  const markdownContainerRef = useRef(null);

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

    const renderedHtml = markdownContainerRef.current
      ? markdownContainerRef.current.innerHTML
      : activeContent;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Cognify Notes</title>
          <style>
            @media print {
              @page { margin: 1.5cm; }
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.7;
              color: #111827;
              background: #fff;
              max-width: 840px;
              margin: 40px auto;
              padding: 0 24px;
            }
            .header-container {
              border-bottom: 2px solid #84cc16;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            h1 { font-size: 26px; font-weight: 800; color: #0a0a0a; margin: 0 0 8px 0; }
            .meta { font-size: 12px; color: #6b7280; font-family: monospace; display: flex; gap: 16px; align-items: center; }
            .badge { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
            h2 { font-size: 18px; font-weight: 700; color: #15803d; margin-top: 24px; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
            h3 { font-size: 15px; font-weight: 600; color: #1f2937; margin-top: 20px; margin-bottom: 8px; }
            p { margin: 10px 0; color: #374151; font-size: 13.5px; }
            ul, ol { padding-left: 20px; margin: 10px 0; font-size: 13.5px; color: #374151; }
            li { margin-bottom: 4px; }
            code { background: #f3f4f6; color: #0f172a; padding: 2px 5px; border-radius: 4px; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            pre { background: #0f172a; color: #4ade80; border-radius: 8px; padding: 12px; overflow-x: auto; margin: 14px 0; }
            pre code { background: none; color: inherit; padding: 0; }
            blockquote { border-left: 4px solid #84cc16; margin: 14px 0; padding: 8px 16px; color: #4b5563; background: #f9fafb; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; font-weight: 600; color: #1e293b; }
            .footer-note { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <h1>${title}</h1>
            <div class="meta">
              ${frameworkName ? `<span class="badge">Structured with: ${frameworkName}</span>` : ""}
              <span>Cognify AI Workspace</span>
              <span>•</span>
              <span>${dateStr}</span>
            </div>
          </div>
          <div id="print-content">${renderedHtml}</div>
          <div class="footer-note">Generated with Cognify AI Notes Enhancer</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
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
    <div className="flex-1 flex flex-col h-full bg-[#0e0e11] select-text overflow-hidden min-h-0">
      {/* ── Top Header Actions ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#0e0e11]/90 backdrop-blur-sm shrink-0 select-none">
        <div className="flex items-center gap-2 truncate mr-2">
          <Sparkle size={17} className="text-osmo-lime shrink-0" weight="fill" />
          <span className="text-sm font-semibold text-white tracking-wide font-mono uppercase truncate">
            Enhanced
          </span>

          {frameworkName && (
            <span className="hidden sm:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-osmo-lime/10 text-osmo-lime border border-osmo-lime/20 font-mono truncate max-w-[120px]">
              <span>{frameworkName}</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hasContent && (
            <>
              {/* Preview vs Edit Toggle (Icon Only) */}
              <button
                type="button"
                onClick={() => {
                  if (!isEditing) setEditedContent(activeContent);
                  else if (editedContent !== activeContent) {
                    onUpdateEnhancedContent(note._id, editedContent);
                  }
                  setIsEditing(!isEditing);
                }}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title={isEditing ? "Switch to Rendered Preview" : "Edit Enhanced Markdown"}
              >
                {isEditing ? <Eye size={15} /> : <PencilSimple size={15} />}
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-osmo-lime/10 border border-osmo-lime/30 text-xs text-osmo-lime font-medium hover:bg-osmo-lime/20 transition-all shadow-sm shrink-0"
              >
                <ChatsCircle size={15} weight="bold" />
                <span className="hidden xl:inline">Discuss in Chat</span>
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
      <div
        data-lenis-prevent
        className={`flex-1 min-h-0 select-text ${
          isEditing
            ? "overflow-hidden relative"
            : "p-6 overflow-y-auto custom-scrollbar"
        }`}
      >
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full p-6 bg-transparent border-none outline-none resize-none text-white/90 text-sm leading-relaxed font-mono focus:ring-0 overflow-y-auto custom-scrollbar block"
            placeholder="Edit enhanced Markdown directly..."
          />
        ) : hasContent ? (
          <div
            ref={markdownContainerRef}
            className="prose prose-invert max-w-none text-white/90 leading-relaxed font-sans select-text pb-12"
          >
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
                pre({ children }) {
                  return (
                    <pre className="p-3.5 my-3 rounded-xl bg-black/60 border border-white/10 overflow-x-auto custom-scrollbar text-xs font-mono text-emerald-400">
                      {children}
                    </pre>
                  );
                },
                code({ className, children, ...props }) {
                  const isBlock = Boolean(className?.includes("language-")) || String(children).includes("\n");
                  if (!isBlock) {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded bg-white/10 text-osmo-lime text-xs font-mono inline break-words"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="my-4 w-full overflow-x-auto custom-scrollbar rounded-xl border border-white/10">
                      <table className="w-full border-collapse text-left text-xs text-white/80">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="bg-white/5 border-b border-white/10 px-3.5 py-2.5 font-semibold text-white font-mono text-xs">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border-b border-white/5 px-3.5 py-2 text-xs leading-relaxed">
                      {children}
                    </td>
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
