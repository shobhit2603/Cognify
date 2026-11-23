"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FilePdf,
  DownloadSimple,
  Sparkle,
  ChatCircleDots,
  Lightbulb,
  CheckCircle,
  Copy,
  PaperPlaneRight,
  BookmarkSimple,
  SpinnerGap,
  WarningCircle,
  Trash,
} from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import * as docService from "../services/document.service";

export default function DocumentAnalysisView({ documentId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("summary"); // "summary" | "qa"
  const [messages, setMessages] = useState([]);
  const [questionInput, setQuestionInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => docService.getDocumentById(documentId),
    refetchInterval: (query) => {
      const currentDoc = query.state.data?.document;
      if (!currentDoc) return 3000;
      if (currentDoc.status !== "READY" && currentDoc.status !== "FAILED") {
        return 3000;
      }
      return false;
    },
  });

  const doc = data?.document;

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === "qa") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleCopySummary = async () => {
    if (!doc?.summary) return;
    try {
      await navigator.clipboard.writeText(doc.summary);
      setCopiedSummary(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await docService.deleteDocument(documentId);
      toast.success("Document deleted");
      router.push("/documents");
    } catch (err) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  const handleSendQuestion = async (e) => {
    e?.preventDefault();
    const q = questionInput.trim();
    if (!q || isAsking) return;

    if (doc?.status !== "READY") {
      toast.error("Document is still parsing and vectorizing. Please wait until status is Ready.");
      return;
    }

    const userMsg = { id: `u-${Date.now()}`, role: "user", content: q };
    const assistantMsg = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: "",
      citations: [],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setQuestionInput("");
    setIsAsking(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await docService.streamAskDocument(
        documentId,
        q,
        {
          onCitations: (citations) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, citations } : m
              )
            );
          },
          onChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            );
          },
          onDone: () => {
            setIsAsking(false);
          },
          onError: (err) => {
            console.error("QA Stream Error:", err);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content:
                        m.content ||
                        "Sorry, I could not retrieve information for this question. Please try again.",
                    }
                  : m
              )
            );
            setIsAsking(false);
          },
        },
        controller.signal
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error asking document:", err);
      }
      setIsAsking(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0f] text-white">
        <div className="w-8 h-8 rounded-full border-2 border-osmo-lime/20 border-t-osmo-lime animate-spin" />
        <p className="text-xs text-white/40 font-mono tracking-widest uppercase mt-3">
          Loading Document Analysis...
        </p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0f] text-white p-6">
        <WarningCircle size={40} className="text-red-400 mb-3" />
        <h2 className="text-lg font-bold">Document Not Found</h2>
        <p className="text-xs text-white/40 mt-1 mb-4">
          The requested document could not be located or has been deleted.
        </p>
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-osmo-lime transition-colors"
        >
          <ArrowLeft size={14} weight="bold" /> Return to Documents
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d0f] text-white overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#141313]">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/documents"
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors shrink-0"
            title="Back to Documents"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>

          <div className="w-9 h-9 rounded-xl bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center shrink-0">
            <FilePdf size={20} weight="bold" className="text-osmo-lime" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-osmo-lime/10 text-osmo-lime">
                02 • DOCS
              </span>
              <h1 className="text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
                {doc.originalName}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
              <span>{formatSize(doc.size)}</span>
              {doc.pageCount && <span>• {doc.pageCount} pages</span>}
              {doc.chunkCount && <span>• {doc.chunkCount} vector chunks</span>}
              <span>• Status: {doc.status}</span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {doc.downloadUrl && (
            <a
              href={doc.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              <DownloadSimple size={14} weight="bold" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-white/40 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
            title="Delete Document"
          >
            <Trash size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Workspace Tabs Header */}
      <div className="px-6 pt-2.5 border-b border-white/[0.06] flex items-center gap-6 shrink-0 bg-[#111010]">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all relative ${
            activeTab === "summary"
              ? "text-osmo-lime"
              : "text-white/50 hover:text-white"
          }`}
        >
          <Sparkle size={15} weight="bold" />
          Executive Summary &amp; Key Takeaways
          {activeTab === "summary" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-osmo-lime rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("qa")}
          className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all relative ${
            activeTab === "qa"
              ? "text-osmo-lime"
              : "text-white/50 hover:text-white"
          }`}
        >
          <ChatCircleDots size={15} weight="bold" />
          Grounded Vector Q&amp;A Chat
          {activeTab === "qa" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-osmo-lime rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "summary" ? (
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-8"
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Status processing or failure banner */}
            {doc.status === "FAILED" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-300 text-sm">
                <WarningCircle size={22} className="shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold">Document Analysis Failed</p>
                  <p className="text-xs text-red-300/70 mt-0.5">
                    {doc.error || "An error occurred while parsing this document. Please delete and upload it again."}
                  </p>
                </div>
              </div>
            )}

            {doc.status !== "READY" && doc.status !== "FAILED" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-300 text-sm">
                <SpinnerGap size={20} className="animate-spin shrink-0" />
                <div>
                  <p className="font-semibold">Document Analysis in Progress ({doc.progress || 20}%)</p>
                  <p className="text-xs text-amber-300/70 mt-0.5">
                    Current stage: {doc.status}. Text is being extracted, chunked, and vectorized into Pinecone.
                  </p>
                </div>
              </div>
            )}

            {/* Executive Summary Card */}
            <div className="bg-[#151414] border border-white/[0.08] rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-osmo-lime">
                  <Sparkle size={18} weight="bold" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider">
                    Executive Summary
                  </h3>
                </div>
                {doc.summary && (
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                  >
                    {copiedSummary ? <CheckCircle size={14} className="text-osmo-lime" /> : <Copy size={14} />}
                    {copiedSummary ? "Copied" : "Copy Summary"}
                  </button>
                )}
              </div>

              {doc.summary ? (
                <div className="text-sm text-white/80 leading-relaxed space-y-3 prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {doc.summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-white/30 italic">
                  Summary will appear here once document parsing completes.
                </p>
              )}
            </div>

            {/* Key Insights List */}
            <div className="bg-[#151414] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center gap-2 text-osmo-lime mb-4 border-b border-white/[0.06] pb-3">
                <Lightbulb size={18} weight="bold" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Key Insights &amp; Takeaways
                </h3>
              </div>

              {doc.keyInsights && doc.keyInsights.length > 0 ? (
                <ul className="space-y-3">
                  {doc.keyInsights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                      <span className="w-6 h-6 rounded-lg bg-osmo-lime/10 text-osmo-lime font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {insight}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/30 italic">
                  Key insights will be extracted automatically by the AI analyzer once vectorization finishes.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Document Q&A */
        <div className="flex-1 min-h-0 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-3 overflow-hidden">
          <div
            data-lenis-prevent
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 pr-1 mb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center">
                  <ChatCircleDots size={28} weight="bold" className="text-osmo-lime" />
                </div>
                <h4 className="text-base font-semibold text-white">
                  Ask Questions About This Document
                </h4>
                <p className="text-xs text-white/40 max-w-md font-caveat text-sm">
                  Our vector engine searches across all chunked pages of &quot;{doc.originalName}&quot; and synthesizes answers with exact page citations.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {["What is the main objective?", "Summarize the key data points", "What are the conclusions?"].map(
                    (preset, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestionInput(preset)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-colors"
                      >
                        &quot;{preset}&quot;
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-osmo-lime text-osmo-dark font-medium shadow-md shadow-osmo-lime/10"
                        : "bg-[#181717] text-white/90 border border-white/[0.08]"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-invert max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content || "Thinking..."}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{m.content}</p>
                    )}

                    {/* Citations badges */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.08]">
                        <p className="text-[10px] font-semibold text-osmo-lime uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <BookmarkSimple size={12} weight="bold" /> Cited Excerpts
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.citations.map((c, ci) => (
                            <span
                              key={ci}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/70"
                              title={c.text}
                            >
                              Page {c.pageNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar pinned to bottom */}
          <form
            onSubmit={handleSendQuestion}
            className="pt-3 border-t border-white/[0.08] flex items-center gap-2 shrink-0 bg-[#0d0d0f]"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask a question about this document..."
              disabled={isAsking || doc.status !== "READY"}
              className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime transition-colors disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!questionInput.trim() || isAsking || doc.status !== "READY"}
              className="w-11 h-11 rounded-2xl bg-osmo-lime text-osmo-dark flex items-center justify-center hover:bg-osmo-lime/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <PaperPlaneRight size={18} weight="bold" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
