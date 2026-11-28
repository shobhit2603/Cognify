"use client";
import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import TextRoll from "../ui/TextRoll";
import {
  Sparkle,
  ArrowRight,
  ArrowUpRight,
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
  ShieldCheck,
  Lightning,
  GitBranch,
  Cpu,
  Database,
  LockKey,
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const PHILOSOPHY_STEPS = [
  {
    step: "01",
    name: "Understand",
    accent: "text-osmo-lime",
    border: "border-white/10 hover:border-osmo-lime/40",
    detail:
      "Ingest dense PDFs, resumes, and raw thoughts through asynchronous vector indexing and structured extraction.",
  },
  {
    step: "02",
    name: "Research",
    accent: "text-osmo-purple",
    border: "border-white/10 hover:border-osmo-purple/50",
    detail:
      "Query grounded document context and real-time live web sources via SSE streaming with verifiable citations.",
  },
  {
    step: "03",
    name: "Create",
    accent: "text-[#ff5f56]",
    border: "border-white/10 hover:border-[#ff5f56]/40",
    detail:
      "Draft tailored emails, cover letters backed by your uploaded resumes, and structured study blueprints.",
  },
  {
    step: "04",
    name: "Improve",
    accent: "text-osmo-teal",
    border: "border-white/10 hover:border-osmo-teal/40",
    detail:
      "Audit resumes against ATS criteria, refine copy with 1-click version safety, and track everything from one hub.",
  },
];

const WORKSPACES = [
  {
    number: "01",
    title: "AI Chat",
    subtitle: "Reasoning & Live Web",
    description:
      "Low-latency SSE conversational engine powered by Groq and Mistral with automatic Tavily web grounding, citations, KaTeX math, and branchable history.",
    href: "/chat",
    icon: ChatTeardropDots,
    accentText: "text-osmo-purple",
    hoverBorder: "hover:border-osmo-purple/50",
    badge: "STREAMING",
  },
  {
    number: "02",
    title: "Document Analysis",
    subtitle: "Vector RAG Engine",
    description:
      "Resilient S3 + local PDF ingestion processed via BullMQ workers, semantic chunking, Pinecone retrieval, executive summaries, and page-cited Q&A.",
    href: "/documents",
    icon: FilePdf,
    accentText: "text-osmo-lime",
    hoverBorder: "hover:border-osmo-lime/50",
    badge: "PINECONE RAG",
  },
  {
    number: "03",
    title: "Resume Studio",
    subtitle: "ATS Diagnostics",
    description:
      "In-memory PDF parsing and 4-dimensional ATS scoring with role alignment, keyword gap audits, and interactive section-by-section bullet optimization.",
    href: "/resume",
    icon: BriefcaseMetal,
    accentText: "text-[#ffbd2e]",
    hoverBorder: "hover:border-[#ffbd2e]/50",
    badge: "ATS SCORE",
  },
  {
    number: "04",
    title: "AI Writing",
    subtitle: "Executive Copy",
    description:
      "Split-view Email Writer and Cover Letter Studio integrated with Resume Studio, editable auto-saved drafts, quick AI refinement, and PDF/MD export.",
    href: "/writing",
    icon: PenNib,
    accentText: "text-[#ff5f56]",
    hoverBorder: "hover:border-[#ff5f56]/50",
    badge: "EDITABLE STUDIO",
  },
  {
    number: "05",
    title: "Notes Enhancer",
    subtitle: "Learning Blueprints",
    description:
      "Transform rough lecture or meeting notes into crisp, proportional Markdown guides with folder organization, custom presets, and 1-click restore.",
    href: "/notes",
    icon: Graph,
    accentText: "text-osmo-teal",
    hoverBorder: "hover:border-osmo-teal/50",
    badge: "SMART NOTES",
  },
  {
    number: "CORE",
    title: "Platform Security",
    subtitle: "Sovereign Foundation",
    description:
      "HttpOnly JWT sessions, Google OAuth 2.0, Zod trust-boundary validation, token-bucket AI rate limiting, and strict server-side user ownership checks.",
    href: "/dashboard",
    icon: ShieldCheck,
    accentText: "text-white",
    hoverBorder: "hover:border-white/30",
    badge: "ZERO LEAKAGE",
  },
];

const ENGINEERING_PILLARS = [
  {
    title: "Build the platform once, scale capabilities on top",
    description:
      "Authentication, ownership verification, centralized AI providers, usage telemetry, and our design system form one shared core—eliminating duplicated logic across every workspace.",
  },
  {
    title: "Layered server & feature-modular client",
    description:
      "The Express backend enforces strict separation across Routes, Controllers, Services, and Repositories on MongoDB, while Next.js isolates each workspace under features/.",
  },
  {
    title: "Resilient real-time streaming & fallbacks",
    description:
      "Every generative flow streams token-by-token over Server-Sent Events with AbortController cancellation, primary-to-fallback LLM routing, and graceful partial persistence.",
  },
];

const TECH_STACK = [
  { name: "NEXT.JS 16", role: "App Router & Proxy", icon: Lightning },
  { name: "EXPRESS.JS", role: "Layered REST & SSE", icon: Cpu },
  { name: "MONGODB", role: "Repository ODM", icon: Database },
  { name: "GROQ + MISTRAL", role: "Dual LLM Inference", icon: Sparkle },
  { name: "PINECONE + BULLMQ", role: "Async Vector RAG", icon: GitBranch },
  { name: "GSAP + TAILWIND", role: "Motion & Design System", icon: LockKey },
];

export default function AboutContent() {
  const containerRef = useRef(null);

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      // Hero entrance timeline (fast & crisp, clears inline props)
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(".about-hero-badge", {
          y: -12,
          duration: 0.45,
          clearProps: "transform",
        })
        .from(
          ".about-hero-line",
          {
            y: 26,
            duration: 0.6,
            stagger: 0.08,
            clearProps: "transform",
          },
          "-=0.3"
        )
        .from(
          ".about-hero-sub",
          {
            y: 16,
            duration: 0.5,
            stagger: 0.06,
            clearProps: "transform",
          },
          "-=0.35"
        )
        .from(
          ".about-hero-cta",
          {
            y: 14,
            duration: 0.45,
            stagger: 0.06,
            clearProps: "transform",
          },
          "-=0.3"
        );

      // Philosophy 4-step strip (transform-only so cards never get stuck hidden)
      gsap.from(".about-philosophy-card", {
        y: 24,
        scale: 0.98,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".about-philosophy-grid",
          start: "top 92%",
          once: true,
        },
      });

      // Workspaces grid
      gsap.from(".about-workspace-card", {
        y: 28,
        scale: 0.98,
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".about-workspaces-grid",
          start: "top 92%",
          once: true,
        },
      });

      // Engineering manifesto rows
      gsap.from(".about-pillar-row", {
        x: 18,
        duration: 0.55,
        stagger: 0.09,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".about-pillars-list",
          start: "top 92%",
          once: true,
        },
      });

      // Tech stack tiles
      gsap.from(".about-stack-tile", {
        y: 16,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".about-stack-grid",
          start: "top 94%",
          once: true,
        },
      });

      // Bottom CTA capsules
      gsap.from(".about-cta-card", {
        y: 24,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".about-cta-section",
          start: "top 92%",
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-2 pb-10 md:pt-4 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-center mb-5 about-hero-badge">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-mono font-bold uppercase tracking-widest text-osmo-dark">
            <Sparkle size={14} weight="fill" className="text-osmo-purple" />
            <span>COGNIFY ✻ ABOUT THE WORKSPACE</span>
          </div>
        </div>

        <div className="text-center max-w-5xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-display font-bold uppercase tracking-tighter text-osmo-dark leading-[0.94]">
            <span className="block about-hero-line">One Unified</span>
            <span className="block about-hero-line">
              Cognitive{" "}
              <span className="text-osmo-purple">Engine</span>
              <span className="text-osmo-dark">.</span>
            </span>
          </h1>

          <p className="about-hero-sub font-caveat text-2xl sm:text-3xl text-red-500">
            Understand → Research → Create → Improve
          </p>

          <p className="about-hero-sub text-base sm:text-lg text-black/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Cognify was built so students, job seekers, engineers, and knowledge workers never have to juggle fragmented AI tabs. Every tool shares one secure foundation, turning raw documents, resumes, and ideas into finished work.
          </p>

          <div className="pt-3 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard"
              className="about-hero-cta group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-osmo-dark text-white font-bold text-sm uppercase tracking-wider hover:bg-osmo-purple transition-all duration-300 active:scale-95"
            >
              <TextRoll>Launch Workspace</TextRoll>
              <ArrowRight
                size={16}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="https://github.com/shobhit2603/Cognify"
              target="_blank"
              rel="noopener noreferrer"
              className="about-hero-cta group inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-black/5 hover:bg-black/10 border border-black/10 text-osmo-dark font-bold text-sm uppercase tracking-wider transition-all duration-300"
            >
              <TextRoll>View Source on GitHub</TextRoll>
              <ArrowUpRight
                size={16}
                weight="bold"
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Product Philosophy Strip */}
      <section className="relative w-full py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="about-philosophy-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PHILOSOPHY_STEPS.map((item) => (
            <div
              key={item.step}
              className={`about-philosophy-card bg-[#151515] text-white rounded-sm hover:rounded-3xl border p-5 flex flex-col justify-between min-h-40 transition-all duration-300 ${item.border}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold tracking-widest ${item.accent}`}>
                  STEP {item.step}
                </span>
                <span className="w-2 h-2 rounded-full bg-white/20" />
              </div>

              <div className="my-auto py-2">
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-white">
                  {item.name}
                </h2>
                <p className="text-xs text-white/65 leading-relaxed mt-1.5">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Five Specialized Workspaces + Core Platform */}
      <section className="relative w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-osmo-purple">
              THE COGNIFY SUITE
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-osmo-dark uppercase leading-[1.02]">
              Five Workspaces.<br />One Coherent Flow.
            </h2>
          </div>

          <p className="font-caveat text-2xl sm:text-3xl text-black/60 max-w-sm">
            From raw PDFs &amp; rough notes to polished career assets.
          </p>
        </div>

        <div className="about-workspaces-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKSPACES.map((ws) => {
            const Icon = ws.icon;
            return (
              <Link
                key={ws.number}
                href={ws.href}
                className={`about-workspace-card group bg-[#151414] text-white rounded-sm hover:rounded-3xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between min-h-56 transition-all duration-300 ${ws.hoverBorder}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon
                      size={22}
                      weight="bold"
                      className={`${ws.accentText} transition-transform duration-300 group-hover:scale-110`}
                    />
                    <span className="font-display text-base font-bold text-white/30 tracking-widest">
                      {ws.number}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white/70 border border-white/10">
                    {ws.badge}
                  </span>
                </div>

                <div className="my-4 space-y-1.5">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-white">
                    {ws.title}
                  </h3>
                  <p className={`font-caveat text-xl ${ws.accentText}`}>
                    {ws.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-white/65 leading-relaxed pt-1">
                    {ws.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/50 group-hover:text-white transition-colors">
                  <span className="font-bold uppercase tracking-wider">
                    <TextRoll>Open Module</TextRoll>
                  </span>
                  <ArrowUpRight
                    size={16}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Engineering Manifesto & Tech Stack (Mirrors WhyCognifySection) */}
      <section className="relative w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="w-full h-px bg-black/10 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-4 rounded-sm bg-black/5 border border-black/10 inline-block">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/Cognify-Logo.png"
                      alt="Cognify Logo"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xl font-black tracking-tighter uppercase text-osmo-dark font-display">
                      COGNIFY<span className="text-osmo-purple">.</span>
                    </span>
                    <p className="text-[10px] font-mono font-bold text-black/50 tracking-widest uppercase">
                      ENGINEERING MANIFESTO
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-red-500 font-caveat text-3xl pt-1">
                <span>Built to Last</span>
                <svg
                  className="w-9 h-9 rotate-12 stroke-red-500 fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#151515] text-white space-y-3 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-osmo-lime font-bold tracking-widest">
                DATA ISOLATION GUARANTEE
              </span>
              <h3 className="text-xl font-bold font-display leading-snug">
                Your Context Belongs Only to You
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Every conversation, PDF chunk, resume, enhanced note, and generated letter is strictly isolated by verified user ownership at the repository and vector-metadata layers.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-osmo-dark font-display leading-[1.06]">
              Designed as a real SaaS architecture, never a patchwork of prompts.
            </h2>

            <div className="about-pillars-list divide-y divide-black/10 border-y border-black/10">
              {ENGINEERING_PILLARS.map((pillar, idx) => (
                <div
                  key={idx}
                  className="about-pillar-row py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 group hover:bg-black/[0.02] transition-colors px-2"
                >
                  <div className="sm:col-span-5">
                    <h3 className="text-xl sm:text-2xl font-bold text-osmo-dark font-display group-hover:text-osmo-purple transition-colors">
                      {pillar.title}
                    </h3>
                  </div>
                  <div className="sm:col-span-7">
                    <p className="text-sm sm:text-base text-black/70 font-medium leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">
                Core Technology Stack
              </div>
              <div className="about-stack-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TECH_STACK.map((tech) => {
                  const Icon = tech.icon;
                  return (
                    <div
                      key={tech.name}
                      className="about-stack-tile p-3.5 rounded-lg bg-black/5 border border-black/10 hover:border-osmo-purple/40 transition-all flex items-start gap-3"
                    >
                      <Icon
                        size={18}
                        weight="bold"
                        className="text-osmo-purple shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-osmo-dark">
                          {tech.name}
                        </p>
                        <p className="text-[11px] text-black/55 font-medium mt-0.5">
                          {tech.role}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Builders & CTA Capsules (Mirrors CtaSection) */}
      <section className="about-cta-section relative w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Left Dark Capsule */}
          <div className="about-cta-card md:col-span-5 bg-[#151515] text-white rounded-lg p-7 sm:p-9 flex flex-col justify-between items-center text-center border border-white/10 relative overflow-hidden min-h-72">
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-30 pointer-events-none" />

            <div className="relative z-10 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-osmo-lime">
                CRAFTED BY
              </span>
            </div>

            <div className="relative z-10 my-auto space-y-2.5">
              <h3 className="text-2xl sm:text-3xl uppercase tracking-tight text-white font-display leading-tight">
                Shashank Lakhera<br />&amp; Shobhit Shrivastava
              </h3>
              <p className="font-caveat text-osmo-lime text-2xl">
                Full-Stack AI Systems &amp; Motion Craft
              </p>
            </div>

            <div className="relative z-10 pb-2">
              <span className="text-xs text-white/40 tracking-wider font-mono">
                OPEN SOURCE • COGNIFY 2026
              </span>
            </div>
          </div>

          {/* Right Electric Purple Capsule */}
          <div className="about-cta-card md:col-span-7 bg-osmo-purple text-white rounded-lg p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden border border-osmo-purple/50 min-h-72">
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-lg bg-white/10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-osmo-lime animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/90">
                  EXPLORE THE PLATFORM
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl tracking-tight text-white font-display leading-[1.05] uppercase">
                Start building with Cognify.
              </h2>

              <p className="text-sm sm:text-base text-white/80 font-medium mt-3 max-w-md leading-relaxed">
                Jump straight into the workspace or inspect the full architecture, tests, and documentation in our GitHub repository.
              </p>
            </div>

            <div className="relative z-10 pt-6 mt-5 border-t border-white/20 flex items-center gap-4 flex-wrap">
              <Link
                href="/auth"
                className="group/btn flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-osmo-lime text-black font-bold text-sm uppercase tracking-wider hover:bg-white transition-all duration-300 active:scale-95"
              >
                <TextRoll>Open Workspace</TextRoll>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              </Link>

              <Link
                href="https://github.com/shobhit2603/Cognify"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 border border-white/10"
              >
                <TextRoll>GitHub Repo</TextRoll>
                <ArrowUpRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
