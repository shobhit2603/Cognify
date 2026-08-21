"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
  ArrowUpRight,
  ArrowRight,
  Sparkle,
  CheckCircle,
  Lightning,
  ShieldCheck,
  Cpu
} from "@phosphor-icons/react";
import TextRoll from "../ui/TextRoll";

const filterCategories = [
  "The Vault",
  "Reasoning Engine",
  "Document Hub",
  "Career Studio",
  "Pro Writing",
  "Idea Mapping"
];

const toolkitData = {
  "The Vault": {
    card1: {
      tag: "PART OF THE SUITE",
      note: "Unified memory",
      icon: <Graph size={24} weight="bold" />,
      title: "Cognitive Context",
      desc: "Connect your previous chats, uploaded research PDFs, and enhanced notes into one coherent knowledge layer that learns your style.",
      stat: "Zero Context Switching",
      href: "/chat"
    },
    card2: {
      tag: "CORE VAULT",
      note: "✻ MISTRAL ENGINE",
      icon: <Sparkle size={30} weight="bold" />,
      title: "The Vault",
      desc: "Our ever-growing intelligence dashboard packed with ready-to-run prompt blueprints, vector retrieval pipelines, and career studio workflows.",
      features: [
        "Instant Markdown & Code Renderer",
        "Deep Multi-Page PDF Chunking",
        "Algorithmic ATS Resume Gap Analysis"
      ],
      href: "/auth"
    },
    card3: {
      tag: "HIGH VELOCITY",
      note: "Tuned for builders",
      icon: <Lightning size={24} weight="bold" />,
      title: "Instant Execution",
      desc: "No tedious multi-turn setup. Generate tailored emails, optimize resume bullets, or summarize technical specs with one click.",
      stat: "Zero Latency Loop",
      href: "/auth"
    }
  },
  "Reasoning Engine": {
    card1: {
      tag: "SSE STREAMING",
      note: "140+ tokens/sec",
      icon: <ChatTeardropDots size={24} weight="bold" />,
      title: "Streaming Reasoning",
      desc: "Low-latency inference pipeline that streams structured reasoning, code blocks, and markdown in real time without waiting.",
      stat: "Real-time SSE Stream",
      href: "/chat"
    },
    card2: {
      tag: "MODEL AGNOSTIC",
      note: "✻ MISTRAL LARGE",
      icon: <Cpu size={30} weight="bold" />,
      title: "Deep Logic Core",
      desc: "Multimodal and complex technical problem-solving capabilities pre-configured for system architecture, debugging, and academic theory.",
      features: [
        "Interactive Code Sandbox rendering",
        "Stop Generation & Edit prompt controls",
        "Full conversation tree persistence"
      ],
      href: "/chat"
    },
    card3: {
      tag: "ULTRA FAST",
      note: "< 45ms TTFT",
      icon: <Lightning size={24} weight="bold" />,
      title: "Parallel Inference",
      desc: "Distributed compute infrastructure ensuring rapid responses even during peak global concurrency loads.",
      stat: "99.9% Uptime Guarantee",
      href: "/chat"
    }
  },
  "Document Hub": {
    card1: {
      tag: "VECTOR EXTRACTION",
      note: "Semantic chunking",
      icon: <FilePdf size={24} weight="bold" />,
      title: "PDF Intelligence",
      desc: "Extract text, key tabular metrics, and underlying logic from 100+ page research papers and complex contracts in seconds.",
      stat: "Vector RAG Pipeline",
      href: "/documents"
    },
    card2: {
      tag: "SYNTHESIS HUB",
      note: "✻ EXACT CITATIONS",
      icon: <Sparkle size={30} weight="bold" />,
      title: "Deep Synthesis",
      desc: "Ask granular questions against dense documents and receive verified answers with page and paragraph citations.",
      features: [
        "Executive PDF Summary generation",
        "Instant Key Insights extraction",
        "Context-scoped Q&A Dialogue"
      ],
      href: "/documents"
    },
    card3: {
      tag: "DATA SECURITY",
      note: "100% Private",
      icon: <ShieldCheck size={24} weight="bold" />,
      title: "Sovereign Files",
      desc: "Your uploaded documents are encrypted in transit and at rest, and never exposed or leaked across user boundaries.",
      stat: "Zero-Data Retention",
      href: "/documents"
    }
  },
  "Career Studio": {
    card1: {
      tag: "RECRUITER TUNED",
      note: "ATS algorithms",
      icon: <BriefcaseMetal size={24} weight="bold" />,
      title: "Algorithmic ATS",
      desc: "Analyze your resume against real job descriptions to identify missing technical keywords, impact verbs, and structural flags.",
      stat: "Top 5% Match Scoring",
      href: "/resume"
    },
    card2: {
      tag: "CAREER STUDIO",
      note: "✻ EXECUTIVE AUDIT",
      icon: <Sparkle size={30} weight="bold" />,
      title: "Resume Optimizer",
      desc: "Transform passive job bullet points into quantified, achievement-oriented engineering achievements recruiters love.",
      features: [
        "Keyword Coverage & Density check",
        "Section Completeness verification",
        "One-click section optimization"
      ],
      href: "/resume"
    },
    card3: {
      tag: "IMPACT DRIVEN",
      note: "Metric multiplier",
      icon: <Lightning size={24} weight="bold" />,
      title: "Instant Polishing",
      desc: "Elevate your resume from an initial 60 score into a verified 95+ ATS benchmark before submitting applications.",
      stat: "Recruiter Ready Output",
      href: "/resume"
    }
  },
  "Pro Writing": {
    card1: {
      tag: "TONE ADAPTIVE",
      note: "Calibrated voice",
      icon: <PenNib size={24} weight="bold" />,
      title: "Executive Tone",
      desc: "Switch between Boardroom Executive, Persuasive Pitch, and Crisp Technical tone with single-click tuning controls.",
      stat: "Zero Fluff Architecture",
      href: "/writing"
    },
    card2: {
      tag: "CREATION ENGINE",
      note: "✻ TAILORED DRAFTS",
      icon: <Sparkle size={30} weight="bold" />,
      title: "AI Writing Suite",
      desc: "Generate compelling cover letters matched directly to your resume experience, and write high-stakes business emails.",
      features: [
        "Resume-aware Cover Letters",
        "Executive Proposal & Memo writer",
        "Real-time live text editing"
      ],
      href: "/writing"
    },
    card3: {
      tag: "HIGH ENGAGEMENT",
      note: "Instant drafting",
      icon: <Lightning size={24} weight="bold" />,
      title: "Pitch Acceleration",
      desc: "Eliminate writer's block for career applications and client proposals with structurally sound first drafts in seconds.",
      stat: "Editable Rich Markdown",
      href: "/writing"
    }
  },
  "Idea Mapping": {
    card1: {
      tag: "IDEA STRUCTURING",
      note: "Zero cognitive load",
      icon: <Graph size={24} weight="bold" />,
      title: "Notes Enhancer",
      desc: "Turn rough shorthand thoughts and fragmented meeting notes into structured Cornell study blueprints and action plans.",
      stat: "Cornell Study Blueprint",
      href: "/notes"
    },
    card2: {
      tag: "KNOWLEDGE LAYER",
      note: "✻ AUTO-SYNTHESIS",
      icon: <Sparkle size={30} weight="bold" />,
      title: "Smart Blueprints",
      desc: "Preserves your original insights while augmenting them with critical mental models, common edge cases, and actionable next steps.",
      features: [
        "Structured Explanation & Key Takeaways",
        "Common Pitfalls & Edge Case callouts",
        "Instant Markdown export and storage"
      ],
      href: "/notes"
    },
    card3: {
      tag: "RECALL ACCELERATOR",
      note: "Long-term memory",
      icon: <Lightning size={24} weight="bold" />,
      title: "Active Retention",
      desc: "Transform complex university lectures or technical RFCs into clear, easily digestible reference materials.",
      stat: "Permanent Knowledge Hub",
      href: "/notes"
    }
  }
};

export default function ToolkitFanSection() {
  const [activeFilter, setActiveFilter] = useState("The Vault");
  const data = toolkitData[activeFilter] || toolkitData["The Vault"];

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-black/5 border border-black/10 text-xs font-bold uppercase tracking-wider text-black/70 mb-4">
          <Cpu size={14} className="text-osmo-purple" weight="fill" />
          <span>Extensible Architecture</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-osmo-dark font-display uppercase leading-tight">
          A growing toolkit for modern knowledge workers
        </h2>

        <p className="text-base sm:text-lg text-black/60 font-medium mt-4">
          Access everything with a single workspace membership:
        </p>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          {filterCategories.map((cat) => {
            const isSelected = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-sm text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#151515] text-white scale-105"
                    : "bg-black/5 text-black/70 hover:bg-black/10 hover:text-black"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Card Interactive Fan Display */}
      <div className="relative pt-6 pb-12 flex items-center justify-center min-h-120">
        {/* Arc Background Line */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-87.5 border-t border-dashed border-black/15 rounded-[100%] pointer-events-none hidden md:block" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl w-full items-center">
          
          {/* Card 1: Electric Purple Card (Tilted Left) */}
          <div className="group relative bg-osmo-purple text-white rounded-lg p-7 flex flex-col justify-between min-h-105 transition-all duration-500 md:-rotate-4 md:hover:rotate-0 md:hover:scale-105 md:hover:z-20 border border-osmo-purple/50">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded bg-black/20 text-white tracking-widest">
                  {data.card1.tag}
                </span>
                <span className="font-caveat text-osmo-lime text-lg">
                  {data.card1.note}
                </span>
              </div>

              <div className="w-12 h-12 rounded-sm bg-white/20 flex items-center justify-center mb-4 text-white">
                {data.card1.icon}
              </div>

              <h3 className="text-3xl font-bold tracking-tight text-white font-display mb-2">
                {data.card1.title}
              </h3>

              <p className="text-sm text-white/80 leading-relaxed">
                {data.card1.desc}
              </p>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                <span className="w-2 h-2 rounded-full bg-osmo-lime" />
                <span>{data.card1.stat}</span>
              </div>

              <Link
                href={data.card1.href}
                className="w-9 h-9 rounded-sm bg-white text-black flex items-center justify-center hover:bg-osmo-lime transition-colors"
              >
                <ArrowUpRight size={16} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Card 2: Deep Dark Card (Center - High Impact) */}
          <div className="group relative bg-[#151515] text-white rounded-lg p-8 flex flex-col justify-between min-h-115 transition-all duration-500 md:scale-105 md:z-10 md:hover:scale-110 border border-white/15">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-radial from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded bg-white/10 text-osmo-lime tracking-widest">
                  {data.card2.tag}
                </span>
                <span className="text-xs font-mono text-white/40">
                  {data.card2.note}
                </span>
              </div>

              <div className="w-14 h-14 rounded-sm bg-white/10 border border-white/10 flex items-center justify-center mb-5 text-osmo-lime">
                {data.card2.icon}
              </div>

              <h3 className="text-4xl font-bold tracking-tight text-white font-display mb-3">
                {data.card2.title}
              </h3>

              <p className="text-sm text-white/70 leading-relaxed mb-4">
                {data.card2.desc}
              </p>

              <div className="space-y-2 pt-2">
                {data.card2.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/90">
                    <CheckCircle size={14} className="text-osmo-lime" weight="fill" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-white/50">Production Ready</span>

              <Link
                href={data.card2.href}
                className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-sm bg-osmo-lime text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all active:scale-95"
              >
                <TextRoll>Explore</TextRoll>
                <ArrowRight size={14} weight="bold" className="transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Neon Lime Card (Tilted Right) */}
          <div className="group relative bg-osmo-lime text-black rounded-lg p-7 flex flex-col justify-between min-h-105 transition-all duration-500 md:rotate-4 md:hover:rotate-0 md:hover:scale-105 md:hover:z-20 border border-osmo-lime">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded bg-black/10 text-black tracking-widest">
                  {data.card3.tag}
                </span>
                <span className="font-caveat text-black/70 text-lg">
                  {data.card3.note}
                </span>
              </div>

              <div className="w-12 h-12 rounded-sm bg-black/10 flex items-center justify-center mb-4 text-black">
                {data.card3.icon}
              </div>

              <h3 className="text-3xl font-bold tracking-tight text-black font-display mb-2">
                {data.card3.title}
              </h3>

              <p className="text-sm text-black/80 leading-relaxed font-medium">
                {data.card3.desc}
              </p>
            </div>

            <div className="relative z-10 pt-6 border-t border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-black/70">
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>{data.card3.stat}</span>
              </div>

              <Link
                href={data.card3.href}
                className="w-9 h-9 rounded-sm bg-black text-white flex items-center justify-center hover:bg-osmo-purple transition-colors"
              >
                <ArrowUpRight size={16} weight="bold" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
