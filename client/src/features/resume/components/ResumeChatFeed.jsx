"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BriefcaseMetal,
  User,
  Copy,
  Check,
  CaretDown,
  CaretUp,
  Sparkle,
  Target,
  CircleNotch,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import BeforeAfterDiffCard from "./BeforeAfterDiffCard";

function UserMessageBubble({ msg }) {
  const [isJdExpanded, setIsJdExpanded] = useState(false);
  const jdText = msg.jobDescription || "";
  const jdLines = jdText.split("\n");
  const isLongJd = jdLines.length > 4 || jdText.length > 250;

  return (
    <div className="flex justify-end min-w-0">
      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-[#ffbd2e] text-black px-4 py-3 shadow-md space-y-2 min-w-0 overflow-x-hidden break-words [overflow-wrap:anywhere]">
        <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
          {msg.content}
        </p>

        {/* Collapsible Job Description Container */}
        {jdText && (
          <div className="rounded-xl bg-black/10 border border-black/10 p-2.5 text-xs text-black/80 space-y-1 min-w-0 overflow-x-hidden break-words [overflow-wrap:anywhere]">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold tracking-wider text-black/60">
              <span className="flex items-center gap-1">
                <Target size={12} weight="bold" /> Attached Job Description
              </span>
              {isLongJd && (
                <button
                  type="button"
                  onClick={() => setIsJdExpanded(!isJdExpanded)}
                  className="hover:underline flex items-center gap-0.5"
                >
                  <span>{isJdExpanded ? "Collapse" : "Show Full"}</span>
                  {isJdExpanded ? <CaretUp size={11} /> : <CaretDown size={11} />}
                </button>
              )}
            </div>

            <p
              className={`font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
                !isJdExpanded && isLongJd ? "line-clamp-3" : ""
              }`}
            >
              {jdText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const markdownRenderComponents = {
  p: ({ children }) => (
    <p className="mb-2 leading-relaxed break-words [overflow-wrap:anywhere]">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-2 break-words [overflow-wrap:anywhere]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-2 break-words [overflow-wrap:anywhere]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed break-words [overflow-wrap:anywhere]">{children}</li>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs sm:text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5 break-words [overflow-wrap:anywhere]">
      {children}
    </h3>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white break-words [overflow-wrap:anywhere]">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-[#ffbd2e] font-mono text-[11px] break-all whitespace-pre-wrap">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-[#ffbd2e] underline hover:text-[#ffbd2e]/80 break-all [overflow-wrap:anywhere]"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="min-w-full divide-y divide-white/10 text-xs">{children}</table>
    </div>
  ),
  pre: ({ children }) => (
    <pre className="p-3 rounded-xl bg-black/40 border border-white/10 overflow-x-auto my-2 text-xs font-mono [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </pre>
  ),
};

function AssistantMessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      toast.success("Response copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex items-start gap-3 group min-w-0">
      <div className="w-8 h-8 rounded-xl bg-[#ffbd2e]/10 border border-[#ffbd2e]/30 flex items-center justify-center shrink-0 text-[#ffbd2e] shadow-inner mt-0.5">
        <BriefcaseMetal size={16} weight="duotone" />
      </div>

      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-[#141418] border border-white/10 p-4 shadow-md space-y-2 overflow-x-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-white/90 truncate">Resume Studio AI</span>
            {msg.mode && msg.mode !== "general" && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ffbd2e]/10 text-[#ffbd2e] border border-[#ffbd2e]/20 uppercase shrink-0">
                {msg.mode}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-all shrink-0"
            title="Copy response"
          >
            {copied ? <Check size={13} className="text-[#ffbd2e]" /> : <Copy size={13} />}
          </button>
        </div>

        <div className="prose prose-invert prose-xs max-w-none text-white/80 leading-relaxed space-y-2 min-w-0 overflow-x-hidden break-words [overflow-wrap:anywhere]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownRenderComponents}
          >
            {msg.content}
          </ReactMarkdown>
        </div>

        {/* Structured Suggestions if present */}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/5 min-w-0 overflow-x-hidden">
            {msg.suggestions.map((s, idx) => (
              <BeforeAfterDiffCard
                key={idx}
                original={s.original}
                improved={s.improved}
                reason={s.reason}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeChatFeed({
  messages = [],
  optimisticUserMessage = null,
  streamedText = "",
  isStreaming = false,
  streamingMode = "general",
  onSelectPrompt,
}) {
  const scrollContainerRef = useRef(null);
  const feedBottomRef = useRef(null);
  const isUserScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  // Filter out only the initial auto-generated diagnostic audit summaries so the chat stream starts clean
  const isGeneratedAuditSummary = (msg) =>
    msg.role === "assistant" &&
    msg.mode === "audit" &&
    typeof msg.content === "string" &&
    msg.content.trim().startsWith("### ATS Optimization Audit Complete");

  const baseChatMessages = messages.filter((msg) => !isGeneratedAuditSummary(msg));

  // Optimistically include outgoing user prompt so it renders instantly from frame 1
  const chatMessages = [...baseChatMessages];
  if (
    optimisticUserMessage &&
    !chatMessages.some(
      (m) =>
        m._id === optimisticUserMessage._id ||
        (m.role === "user" && m.content === optimisticUserMessage.content)
    )
  ) {
    chatMessages.push(optimisticUserMessage);
  }

  const prevMessagesCountRef = useRef(chatMessages.length);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrollingUp = scrollTop < lastScrollTopRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;

    if (isScrollingUp && !isAtBottom) {
      isUserScrolledUpRef.current = true;
    } else if (isAtBottom) {
      isUserScrolledUpRef.current = false;
    }
    lastScrollTopRef.current = scrollTop;
  }, []);

  const scrollToBottom = useCallback((force = false, smooth = true) => {
    if (force || !isUserScrolledUpRef.current) {
      feedBottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // When a new message is added, smooth scroll to bottom
  useEffect(() => {
    if (chatMessages.length > prevMessagesCountRef.current) {
      isUserScrolledUpRef.current = false;
      scrollToBottom(true, true);
    }
    prevMessagesCountRef.current = chatMessages.length;
  }, [chatMessages.length, scrollToBottom]);

  // When streaming chunks arrive, pin instantly to bottom unless user scrolled up
  useEffect(() => {
    if (isStreaming && streamedText) {
      scrollToBottom(false, false);
    }
  }, [isStreaming, streamedText, scrollToBottom]);

  const starterPrompts = [
    {
      label: "Rewrite with X-Y-Z formula",
      prompt: "Rewrite my work experience bullets using the Google X-Y-Z formula with strong action verbs and quantified metrics.",
      mode: "optimize-section",
    },
    {
      label: "JD Keyword Match",
      prompt: "I'd like to check keyword gaps against a target role.",
      mode: "jd-match",
    },
    {
      label: "Roast my summary",
      prompt: "Critique and roast my professional summary section. Point out cliches and give me an executive rewrite.",
      mode: "general",
    },
    {
      label: "Technical skills audit",
      prompt: "Audit my technical skills section. How should I categorize it to maximize ATS keyword parseability?",
      mode: "optimize-section",
    },
  ];

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      data-lenis-prevent
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 sm:p-6 select-text"
    >
      <div className="w-full max-w-4xl mx-auto space-y-6 flex flex-col justify-start pb-4 min-w-0 overflow-x-hidden">
        {chatMessages.length === 0 && !streamedText && !isStreaming && (
          <div className="py-10 text-center space-y-6 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#ffbd2e]/10 border border-[#ffbd2e]/30 flex items-center justify-center text-[#ffbd2e] mx-auto shadow-inner">
              <Sparkle size={24} weight="duotone" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-white">Interactive Resume Copilot</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Ask anything about your resume, optimize weak bullets, or paste a job description to check alignment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectPrompt(p.prompt, p.mode)}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#ffbd2e]/40 text-left transition-all space-y-1 group"
                >
                  <p className="text-xs font-semibold text-white/90 group-hover:text-[#ffbd2e] transition-colors">
                    {p.label}
                  </p>
                  <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                    {p.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message History */}
        {chatMessages.map((msg, idx) =>
          msg.role === "user" ? (
            <UserMessageBubble key={msg._id || idx} msg={msg} />
          ) : (
            <AssistantMessageBubble key={msg._id || idx} msg={msg} />
          )
        )}

        {/* Streaming Assistant Response with identical Markdown typography */}
        {isStreaming && (
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#ffbd2e]/10 border border-[#ffbd2e]/30 flex items-center justify-center shrink-0 text-[#ffbd2e] shadow-inner mt-0.5">
              <CircleNotch size={16} className="animate-spin" />
            </div>
            <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-[#141418] border border-white/10 p-4 shadow-md space-y-2 overflow-x-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-white/90 truncate">Resume Studio AI</span>
                  {streamingMode && streamingMode !== "general" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ffbd2e]/10 text-[#ffbd2e] border border-[#ffbd2e]/20 uppercase shrink-0">
                      {streamingMode}
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ffbd2e]/10 text-[#ffbd2e] animate-pulse shrink-0">
                    generating...
                  </span>
                </div>
              </div>

              <div className="prose prose-invert prose-xs max-w-none text-white/80 leading-relaxed space-y-2 min-w-0 overflow-x-hidden break-words [overflow-wrap:anywhere]">
                {streamedText ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownRenderComponents}
                  >
                    {streamedText}
                  </ReactMarkdown>
                ) : (
                  <p className="text-xs text-white/50 italic">Thinking...</p>
                )}
                <span className="inline-block w-1.5 h-3.5 bg-[#ffbd2e] ml-1 animate-pulse align-middle" />
              </div>
            </div>
          </div>
        )}

        <div ref={feedBottomRef} />
      </div>
    </div>
  );
}
