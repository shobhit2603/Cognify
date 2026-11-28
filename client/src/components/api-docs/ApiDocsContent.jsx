"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import TextRoll from "../ui/TextRoll";
import {
  Terminal,
  ArrowLeft,
  ArrowUpRight,
  Copy,
  Check,
  LockKey,
  Gauge,
  Broadcast,
} from "@phosphor-icons/react";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

const METHOD_STYLES = {
  GET: "bg-osmo-lime/20 text-osmo-lime border-osmo-lime/40",
  POST: "bg-osmo-purple/25 text-[#b79cff] border-osmo-purple/50",
  PATCH: "bg-[#ffbd2e]/20 text-[#ffbd2e] border-[#ffbd2e]/40",
  PUT: "bg-osmo-teal/20 text-osmo-teal border-osmo-teal/40",
  DELETE: "bg-[#ff5f56]/20 text-[#ff5f56] border-[#ff5f56]/40",
};

const API_GROUPS = [
  {
    id: "auth",
    label: "Auth & Sessions",
    basePath: "/api/v1/auth",
    endpoints: [
      { method: "POST", path: "/api/v1/auth/register", summary: "Register account & issue verification OTP", tag: "RATE LIMITED" },
      { method: "POST", path: "/api/v1/auth/login", summary: "Authenticate with email/password & set HttpOnly cookies", tag: "RATE LIMITED" },
      { method: "POST", path: "/api/v1/auth/refresh", summary: "Rotate access & refresh tokens" },
      { method: "POST", path: "/api/v1/auth/verify-email", summary: "Verify email address using OTP" },
      { method: "POST", path: "/api/v1/auth/forgot-password", summary: "Request password reset OTP", tag: "RATE LIMITED" },
      { method: "POST", path: "/api/v1/auth/reset-password", summary: "Reset password using OTP", tag: "RATE LIMITED" },
      { method: "GET", path: "/api/v1/auth/me", summary: "Fetch authenticated user profile" },
      { method: "GET", path: "/api/v1/auth/google", summary: "Initiate Google OAuth 2.0 flow" },
      { method: "POST", path: "/api/v1/auth/logout", summary: "Clear session cookies & revoke session" },
    ],
  },
  {
    id: "chat",
    label: "AI Chat & Messages",
    basePath: "/api/v1/chats & /messages",
    endpoints: [
      { method: "POST", path: "/api/v1/chats", summary: "Create a new conversation thread" },
      { method: "GET", path: "/api/v1/chats", summary: "Paginated chat list with search" },
      { method: "GET", path: "/api/v1/chats/:id", summary: "Retrieve chat metadata" },
      { method: "PATCH", path: "/api/v1/chats/:id", summary: "Rename conversation title" },
      { method: "DELETE", path: "/api/v1/chats/:id", summary: "Delete chat and cascade messages" },
      { method: "POST", path: "/api/v1/messages/stream/:chatId", summary: "Stream AI chat response with live web/RAG grounding", tag: "SSE + LIMIT" },
      { method: "GET", path: "/api/v1/messages/:chatId", summary: "List messages in conversation" },
      { method: "PATCH", path: "/api/v1/messages/:id", summary: "Edit prompt / message content" },
      { method: "DELETE", path: "/api/v1/messages/:id", summary: "Delete message" },
    ],
  },
  {
    id: "documents",
    label: "Document Analysis",
    basePath: "/api/v1/documents",
    endpoints: [
      { method: "POST", path: "/api/v1/documents/upload-url", summary: "Create document record & S3 presigned upload URL" },
      { method: "PUT", path: "/api/v1/documents/local-storage/upload", summary: "Dev local-storage binary fallback upload" },
      { method: "GET", path: "/api/v1/documents", summary: "List user documents with processing status" },
      { method: "GET", path: "/api/v1/documents/:id", summary: "Fetch summary, key takeaways, and download URL" },
      { method: "POST", path: "/api/v1/documents/:id/process", summary: "Queue PDF extraction, chunking, and Pinecone indexing" },
      { method: "POST", path: "/api/v1/documents/:id/ask", summary: "Grounded vector RAG Q&A with page citations", tag: "SSE + LIMIT" },
      { method: "DELETE", path: "/api/v1/documents/:id", summary: "Delete PDF from MongoDB, S3, and Pinecone" },
    ],
  },
  {
    id: "resumes",
    label: "Resume Studio",
    basePath: "/api/v1/resumes",
    endpoints: [
      { method: "POST", path: "/api/v1/resumes/upload", summary: "Synchronously upload PDF resume & extract text in-memory" },
      { method: "GET", path: "/api/v1/resumes", summary: "List uploaded resumes with search & pagination" },
      { method: "GET", path: "/api/v1/resumes/:id", summary: "Retrieve parsed sections, latest ATS audit, and chat" },
      { method: "GET", path: "/api/v1/resumes/:id/file", summary: "Stream original PDF inline for preview pane" },
      { method: "POST", path: "/api/v1/resumes/:id/audit", summary: "Run 4-dimensional ATS diagnostic audit", tag: "RATE LIMITED" },
      { method: "POST", path: "/api/v1/resumes/:id/chat", summary: "Interactive resume section optimization", tag: "SSE + LIMIT" },
      { method: "PATCH", path: "/api/v1/resumes/:id", summary: "Rename resume title" },
      { method: "DELETE", path: "/api/v1/resumes/:id", summary: "Delete resume and stored PDF" },
    ],
  },
  {
    id: "writing",
    label: "AI Writing",
    basePath: "/api/v1/writing",
    endpoints: [
      { method: "POST", path: "/api/v1/writing/email", summary: "Generate subject & email body via SSE stream", tag: "SSE + LIMIT" },
      { method: "POST", path: "/api/v1/writing/cover-letter", summary: "Generate resume-backed or manual cover letter via SSE", tag: "SSE + LIMIT" },
      { method: "POST", path: "/api/v1/writing/:id/refine", summary: "Refine draft (shorter, formal, custom) with 1-level backup", tag: "SSE + LIMIT" },
      { method: "GET", path: "/api/v1/writing", summary: "List drafts with type filter, search & pagination" },
      { method: "GET", path: "/api/v1/writing/:id", summary: "Fetch single saved draft" },
      { method: "PATCH", path: "/api/v1/writing/:id", summary: "Save editable title, subject, or content (auto-save)" },
      { method: "PATCH", path: "/api/v1/writing/:id/pin", summary: "Toggle pin status" },
      { method: "POST", path: "/api/v1/writing/:id/restore", summary: "Swap/restore 1-level backed-up version" },
      { method: "DELETE", path: "/api/v1/writing/:id", summary: "Permanently delete writing draft" },
    ],
  },
  {
    id: "notes",
    label: "Notes & Dashboard",
    basePath: "/api/v1/notes, /note-folders, /dashboard",
    endpoints: [
      { method: "POST", path: "/api/v1/notes", summary: "Create a new raw note" },
      { method: "GET", path: "/api/v1/notes", summary: "List notes with search, folder, and pin filters" },
      { method: "PATCH", path: "/api/v1/notes/:id", summary: "Auto-save title, raw content, or enhanced content" },
      { method: "POST", path: "/api/v1/notes/:id/enhance", summary: "Enhance note via preset or custom steering", tag: "SSE + LIMIT" },
      { method: "POST", path: "/api/v1/notes/:id/restore", summary: "Restore previous enhancement version" },
      { method: "GET", path: "/api/v1/note-folders", summary: "List note folders with counts" },
      { method: "GET", path: "/api/v1/dashboard/activity", summary: "Unified recent activity feed (ALL or 01–05)" },
      { method: "GET", path: "/api/v1/health", summary: "Server uptime & health check" },
    ],
  },
];

export default function ApiDocsContent() {
  const containerRef = useRef(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [copiedPath, setCopiedPath] = useState(null);

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(".api-hero-badge", { y: -12, duration: 0.45, clearProps: "transform" })
        .from(".api-hero-title", { y: 24, duration: 0.55, clearProps: "transform" }, "-=0.3")
        .from(".api-hero-sub", { y: 14, duration: 0.45, clearProps: "transform" }, "-=0.3");

      gsap.from(".api-spec-card", {
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".api-spec-grid",
          start: "top 92%",
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  const handleCopyPath = async (path) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 1500);
      toast.success(`Copied ${path}`);
    } catch {
      toast.error("Failed to copy endpoint path.");
    }
  };

  const visibleGroups =
    selectedGroup === "all"
      ? API_GROUPS
      : API_GROUPS.filter((g) => g.id === selectedGroup);

  return (
    <div
      ref={containerRef}
      className="w-full pb-16 pt-2 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/10 pb-8 mb-8 space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black/50 hover:text-osmo-purple transition-colors w-fit"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Back to Home</span>
        </Link>

        <div className="api-hero-badge flex items-center gap-2 text-osmo-purple">
          <Terminal size={20} weight="bold" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">
            REST &amp; SSE Specification • v1
          </span>
        </div>

        <h1 className="api-hero-title text-4xl sm:text-6xl font-display font-bold uppercase tracking-tighter text-osmo-dark leading-[0.95]">
          API Reference<span className="text-osmo-purple">.</span>
        </h1>

        <p className="api-hero-sub font-caveat text-2xl sm:text-3xl text-red-500">
          Resource-oriented JSON &amp; real-time Server-Sent Events
        </p>

        <p className="api-hero-sub text-sm sm:text-base text-black/70 leading-relaxed max-w-3xl font-medium">
          All endpoints are versioned under <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-xs">/api/v1/*</code> and proxied first-party by Next.js to preserve strict HttpOnly cookie security across browsers.
        </p>

        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-osmo-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-osmo-purple transition-colors"
          >
            <TextRoll>Read Workspace Docs</TextRoll>
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Auth, Rate Limits & SSE Spec Cards */}
      <div className="api-spec-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="api-spec-card bg-[#151515] text-white border border-white/10 rounded-lg p-5 space-y-2">
          <div className="flex items-center gap-2 text-osmo-lime text-xs font-mono font-bold uppercase">
            <LockKey size={15} weight="bold" />
            <span>Authentication</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Authenticated routes enforce <code className="text-white">requireAuth</code> + <code className="text-white">requireEmailVerification</code> via HttpOnly cookies and verify <code className="text-white">userId</code> ownership per resource.
          </p>
        </div>

        <div className="api-spec-card bg-[#151515] text-white border border-white/10 rounded-lg p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#ffbd2e] text-xs font-mono font-bold uppercase">
            <Gauge size={15} weight="bold" />
            <span>Rate Limiting</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Auth endpoints limit bursts (`10/15m`); generative AI routes use a per-user token bucket (`5 req / 60s`), returning <code className="text-white">429</code> with <code className="text-white">retrySecs</code>.
          </p>
        </div>

        <div className="api-spec-card bg-osmo-purple text-white border border-osmo-purple/50 rounded-lg p-5 space-y-2">
          <div className="flex items-center gap-2 text-osmo-lime text-xs font-mono font-bold uppercase">
            <Broadcast size={15} weight="bold" />
            <span>SSE Event Protocol</span>
          </div>
          <p className="text-xs text-white/85 leading-relaxed font-mono">
            data: &#123; &quot;event&quot;: &quot;stage&quot; | &quot;subject&quot; | &quot;title&quot; | &quot;chunk&quot; | &quot;done&quot; | &quot;error&quot; &#125;
          </p>
        </div>
      </div>

      {/* Group Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6">
        <button
          type="button"
          onClick={() => setSelectedGroup("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
            selectedGroup === "all"
              ? "bg-osmo-dark text-osmo-lime"
              : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-osmo-dark"
          }`}
        >
          ALL MODULES
        </button>
        {API_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setSelectedGroup(g.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              selectedGroup === g.id
                ? "bg-osmo-purple text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-osmo-dark"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Endpoint Groups */}
      <div className="space-y-6">
        {visibleGroups.map((group) => (
          <section
            key={group.id}
            className="bg-[#151414] text-white border border-white/10 rounded-lg overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/10 bg-[#191818] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-display font-bold uppercase tracking-tight">
                {group.label}
              </h2>
              <code className="text-[11px] font-mono text-white/50">
                {group.basePath}
              </code>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {group.endpoints.map((ep) => {
                const key = `${ep.method}-${ep.path}`;
                return (
                  <div
                    key={key}
                    className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-16 text-center py-0.5 rounded border text-[10px] font-mono font-extrabold shrink-0 ${
                          METHOD_STYLES[ep.method] || "bg-white/10 text-white border-white/20"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-xs sm:text-sm font-mono text-white/90 truncate">
                        {ep.path}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyPath(ep.path)}
                        title="Copy endpoint path"
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedPath === ep.path ? (
                          <Check size={13} className="text-osmo-lime" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3">
                      <span className="text-xs text-white/60">
                        {ep.summary}
                      </span>
                      {ep.tag && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-osmo-lime border border-white/10 shrink-0">
                          {ep.tag}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
