"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import TextRoll from "../ui/TextRoll";
import {
  BookOpen,
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
  Lightning,
  Keyboard,
  FlowArrow,
  CheckCircle,
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const WORKSPACE_GUIDES = [
  {
    id: "01",
    name: "AI Chat",
    tagline: "Streaming Reasoning & Live Web Search",
    href: "/chat",
    icon: ChatTeardropDots,
    accent: "text-osmo-purple",
    badgeBg: "bg-osmo-purple/20 text-[#a855f7] border-osmo-purple/40",
    summary:
      "Conversational intelligence powered by Groq and Mistral with automatic Tavily web search grounding when queries need live facts.",
    steps: [
      "Launch /chat or type a prompt directly from the Dashboard AI Chat Engine card.",
      "Watch 2-stage live progress indicators (Searching the live web -> Synthesizing response) with clickable domain citations.",
      "Edit any sent prompt inline to branch the conversation, copy syntax-highlighted code blocks, or click Stop Generation anytime.",
    ],
  },
  {
    id: "02",
    name: "Document Analysis",
    tagline: "Asynchronous PDF Ingestion & Vector RAG",
    href: "/documents",
    icon: FilePdf,
    accent: "text-osmo-lime",
    badgeBg: "bg-osmo-lime/15 text-osmo-lime border-osmo-lime/30",
    summary:
      "Upload dense PDFs via direct S3 presigned URLs (with automatic local fallback), indexed by BullMQ workers into Pinecone for grounded Q&A.",
    steps: [
      "Upload a PDF up to 50MB; background workers extract text per page, chunk semantically, and embed via Mistral.",
      "Open the document workspace (/documents/[id]) to inspect the automated Executive Summary and Key Takeaways.",
      "Ask targeted or conclusion-level questions in the Q&A pane and verify exact source page citations.",
    ],
  },
  {
    id: "03",
    name: "Resume Studio",
    tagline: "4-Dimensional ATS Diagnostics & Optimization",
    href: "/resume",
    icon: BriefcaseMetal,
    accent: "text-[#ffbd2e]",
    badgeBg: "bg-[#ffbd2e]/15 text-[#ffbd2e] border-[#ffbd2e]/30",
    summary:
      "Upload your PDF resume for synchronous in-memory extraction, ATS scoring, keyword gap audits, and interactive bullet-level improvements.",
    steps: [
      "Drop a PDF resume (up to 10MB) to parse contact info, summary, skills, and experience alongside a live PDF preview.",
      "Run an ATS Audit—optionally paste a Target Role and Job Description to surface matched vs. missing keywords.",
      "Use the Resume Chat tab to rewrite specific bullets with before/after diff cards.",
    ],
  },
  {
    id: "04",
    name: "AI Writing",
    tagline: "Email Writer & Resume-Backed Cover Letters",
    href: "/writing",
    icon: PenNib,
    accent: "text-[#ff5f56]",
    badgeBg: "bg-[#ff5f56]/15 text-[#ff5f56] border-[#ff5f56]/30",
    summary:
      "Split-view writing studio for executive emails and tailored cover letters with editable drafts, auto-save, quick AI refinement, and export.",
    steps: [
      "Choose Email Writer (Purpose, Intent, Context, optional Reply-to-Email, Tone, Formality, Length) or Cover Letter.",
      "In Cover Letter, pick an existing resume from the dropdown, upload a new PDF inline, or type manual background details.",
      "Edit generated copy directly in the canvas (800ms auto-save), apply Quick Refine chips, restore prior versions, or export .txt / .md / PDF.",
    ],
  },
  {
    id: "05",
    name: "Notes Enhancer",
    tagline: "Proportional Learning Blueprints",
    href: "/notes",
    icon: Graph,
    accent: "text-osmo-teal",
    badgeBg: "bg-osmo-teal/15 text-osmo-teal border-osmo-teal/30",
    summary:
      "Turn rough lecture thoughts or meeting dumps into clean Markdown blueprints using auto-detected or custom preset frameworks.",
    steps: [
      "Jot rough notes in the distraction-free centered editor (raw edits auto-save after 800ms).",
      "Click Enhance (with Auto-Detect or a preset like Study Guide, Code & Tech, Meeting Takeaways, or Quick Polish).",
      "Review the streamed output, restore the previous version if needed, export to PDF/Markdown, or send straight to AI Chat.",
    ],
  },
];

const SHORTCUTS_AND_TIPS = [
  {
    title: "Resizable Split Workspaces",
    detail:
      "Drag the center divider in Notes, Resume, or AI Writing (25%–65%)—your split ratio persists automatically in localStorage.",
  },
  {
    title: "Stop Generation Without Data Loss",
    detail:
      "Aborted streams immediately cancel the upstream LLM request; in AI Writing, any non-empty partial draft is preserved.",
  },
  {
    title: "Cross-Workspace Bridges",
    detail:
      "Send enhanced notes straight into AI Chat, or attach Resume Studio PDFs directly inside Cover Letter generation.",
  },
  {
    title: "Unified Dashboard Telemetry",
    detail:
      "Filter Dashboard Activity by ALL or 01–05 to jump straight back into any conversation, PDF, resume, draft, or note.",
  },
];

export default function DocsContent() {
  const containerRef = useRef(null);
  const [selectedGuideId, setSelectedGuideId] = useState("all");

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(".docs-hero-badge", { y: -12, duration: 0.45, clearProps: "transform" })
        .from(".docs-hero-title", { y: 24, duration: 0.55, clearProps: "transform" }, "-=0.3")
        .from(".docs-hero-sub", { y: 14, duration: 0.45, clearProps: "transform" }, "-=0.3");

      gsap.from(".docs-arch-card", {
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".docs-arch-grid",
          start: "top 92%",
          once: true,
        },
      });

      gsap.from(".docs-tip-card", {
        y: 18,
        duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".docs-tips-grid",
          start: "top 92%",
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  const visibleGuides =
    selectedGuideId === "all"
      ? WORKSPACE_GUIDES
      : WORKSPACE_GUIDES.filter((g) => g.id === selectedGuideId);

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

        <div className="docs-hero-badge flex items-center gap-2 text-osmo-purple">
          <BookOpen size={20} weight="bold" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">
            Platform Documentation
          </span>
        </div>

        <h1 className="docs-hero-title text-4xl sm:text-6xl font-display font-bold uppercase tracking-tighter text-osmo-dark leading-[0.95]">
          Workspace Guides<span className="text-osmo-purple">.</span>
        </h1>

        <p className="docs-hero-sub font-caveat text-2xl sm:text-3xl text-red-500">
          Understand the pipelines behind every Cognify tool
        </p>

        <p className="docs-hero-sub text-sm sm:text-base text-black/70 leading-relaxed max-w-3xl font-medium">
          Explore step-by-step workflows for all five AI workspaces, our decoupled client/server architecture, and productivity tips to move faster across Cognify.
        </p>

        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-osmo-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-osmo-purple transition-colors"
          >
            <TextRoll>API Reference</TextRoll>
            <ArrowRight size={14} weight="bold" />
          </Link>
          <Link
            href="https://github.com/shobhit2603/Cognify"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black/5 hover:bg-black/10 border border-black/10 text-osmo-dark text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <TextRoll>Markdown Docs on GitHub</TextRoll>
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>
      </div>

      {/* System Architecture Overview */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FlowArrow size={18} weight="bold" className="text-osmo-purple" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-black/60">
            System Architecture Flow
          </h2>
        </div>

        <div className="docs-arch-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: "01 CLIENT",
              title: "Next.js 16 + Query",
              desc: "Feature-modular React UI with TanStack Query optimistic cache & first-party /api/v1 proxy.",
            },
            {
              step: "02 SERVER",
              title: "Layered Express API",
              desc: "Routes -> Controllers -> Services -> Repositories with Zod validation & rate limits.",
            },
            {
              step: "03 INTELLIGENCE",
              title: "Groq + Mistral + RAG",
              desc: "Dual-provider SSE streaming, Tavily live web search, and Pinecone vector retrieval.",
            },
            {
              step: "04 STORAGE",
              title: "MongoDB + S3 + Redis",
              desc: "User-owned MongoDB entities, encrypted S3 binary objects, and BullMQ async jobs.",
            },
          ].map((node) => (
            <div
              key={node.step}
              className="docs-arch-card bg-[#151515] text-white border border-white/10 rounded-lg p-5 space-y-2"
            >
              <span className="text-[10px] font-mono font-bold text-osmo-lime tracking-widest">
                {node.step}
              </span>
              <h3 className="text-lg font-display font-bold uppercase tracking-tight">
                {node.title}
              </h3>
              <p className="text-xs text-white/65 leading-relaxed">{node.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Workspace Filter */}
      <section className="space-y-5 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-osmo-dark">
            5 Core Workspace Guides
          </h2>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedGuideId("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                selectedGuideId === "all"
                  ? "bg-osmo-dark text-osmo-lime"
                  : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-osmo-dark"
              }`}
            >
              ALL (5)
            </button>
            {WORKSPACE_GUIDES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGuideId(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                  selectedGuideId === g.id
                    ? "bg-osmo-purple text-white"
                    : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-osmo-dark"
                }`}
              >
                {g.id} {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {visibleGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <article
                key={guide.id}
                className="bg-[#151414] text-white border border-white/10 rounded-lg p-6 sm:p-7 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
                      <Icon size={20} weight="bold" className={guide.accent} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white/40 font-bold">
                          {guide.id}
                        </span>
                        <h3 className="text-xl font-display font-bold uppercase tracking-tight">
                          {guide.name}
                        </h3>
                      </div>
                      <p className={`font-caveat text-lg ${guide.accent}`}>
                        {guide.tagline}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={guide.href}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-opacity hover:opacity-90 w-fit ${guide.badgeBg}`}
                  >
                    <span>Open {guide.name}</span>
                    <ArrowUpRight size={13} weight="bold" />
                  </Link>
                </div>

                <p className="text-sm text-white/75 leading-relaxed">
                  {guide.summary}
                </p>

                <ul className="space-y-2 pt-1">
                  {guide.steps.map((stepText, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-white/70"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className={`${guide.accent} shrink-0 mt-0.5`}
                      />
                      <span>{stepText}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Power-User Tips */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Keyboard size={18} weight="bold" className="text-osmo-purple" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-black/60">
            Workflow Tips &amp; Productivity Shortcuts
          </h2>
        </div>

        <div className="docs-tips-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SHORTCUTS_AND_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="docs-tip-card bg-black/5 border border-black/10 rounded-lg p-5 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-osmo-dark font-display font-bold text-base uppercase">
                <Lightning size={15} weight="fill" className="text-osmo-purple" />
                <span>{tip.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                {tip.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
