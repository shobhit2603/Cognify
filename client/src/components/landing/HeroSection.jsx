"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import TextRoll from "../ui/TextRoll";
import {
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
  ArrowRight,
  ArrowUpRight,
  Sparkle,
  Lightning,
  PaperPlaneRight,
  ShieldCheck,
  CheckCircle,
  Play
} from "@phosphor-icons/react";

const heroCapabilities = [
  {
    id: "chat",
    title: "AI Chat",
    sub: "Streaming Reasoning",
    icon: <ChatTeardropDots size={22} weight="bold" />,
    color: "bg-[#151515] text-white border-white/10",
    badge: "FAST",
    badgeColor: "bg-osmo-lime text-black",
    previewText: "Mistral 7B / Large reasoning with live streaming & markdown.",
    tag: "01 MODULE",
    href: "/chat"
  },
  {
    id: "documents",
    title: "PDF Synthesis",
    sub: "Vector Extraction",
    icon: <FilePdf size={22} weight="bold" />,
    color: "bg-[#1d1a1a] text-white border-white/10",
    badge: "RAG",
    badgeColor: "bg-osmo-purple text-white",
    previewText: "Instant parsing & deep semantic Q&A for 100+ page documents.",
    tag: "02 MODULE",
    href: "/documents"
  },
  {
    id: "resume",
    title: "Resume Studio",
    sub: "ATS Intelligence",
    icon: <BriefcaseMetal size={22} weight="bold" />,
    color: "bg-[#1d1a1a] text-white border-osmo-purple/40",
    badge: "94% ATS",
    badgeColor: "bg-osmo-lime text-black",
    previewText: "Algorithmic keyword optimization & section-level enhancements.",
    tag: "03 MODULE",
    href: "/resume"
  },
  {
    id: "writing",
    title: "AI Writing",
    sub: "Tone-Adaptive",
    icon: <PenNib size={22} weight="bold" />,
    color: "bg-[#1d1a1a] text-white border-white/10",
    badge: "EXECUTIVE",
    badgeColor: "bg-white/15 text-white",
    previewText: "Tailored cover letters and boardroom-ready email drafts in seconds.",
    tag: "04 MODULE",
    href: "/writing"
  },
  {
    id: "notes",
    title: "Notes Enhancer",
    sub: "Idea Structuring",
    icon: <Graph size={22} weight="bold" />,
    color: "bg-[#151515] text-white border-white/10",
    badge: "SYNTHESIS",
    badgeColor: "bg-osmo-lime text-black",
    previewText: "Convert messy thoughts into structured recall notes and blueprints.",
    tag: "05 MODULE",
    href: "/notes"
  }
];

const samplePrompts = [
  "Summarize 40-page financial report",
  "Optimize resume for Senior AI Engineer",
  "Draft executive board update email",
  "Turn messy meeting notes into structured actions"
];

export default function HeroSection() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [activePrompt, setActivePrompt] = useState(samplePrompts[0]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        y: -20,
        opacity: 0,
        duration: 0.7,
        delay: 0.1
      })
        .from(
          ".hero-title-line",
          {
            y: 40,
            opacity: 0,
            duration: 0.9,
            stagger: 0.1
          },
          "-=0.4"
        )
        .from(
          ".hero-subtitle",
          {
            y: 20,
            opacity: 0,
            duration: 0.7
          },
          "-=0.5"
        )
        .from(
          ".hero-fan-card",
          {
            y: 60,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            stagger: 0.08,
            ease: "back.out(1.2)"
          },
          "-=0.4"
        )
        .from(
          ".hero-spotlight-item",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12
          },
          "-=0.4"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full pt-8 pb-16 md:pt-12 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-visible"
    >
      {/* Top Pill / Badge */}
      <div className="flex justify-center mb-6 hero-badge">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-black/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-osmo-purple animate-pulse" />
          <span>Next-Gen AI Workspace</span>
        </div>
      </div>

      {/* Main Massive Display Headline */}
      <div className="text-center max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-osmo-dark leading-[0.95] font-display hero-title-line">
          Dev Toolkit <span className="text-osmo-purple">✻</span> Built to Flex
        </h1>
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter text-osmo-dark/90 leading-[0.95] font-display mt-2 sm:mt-3 hero-title-line">
          Intelligence for Deep Flow
        </h2>

        {/* Subtitle & Handwritten annotation */}
        <div className="relative max-w-2xl mx-auto mt-6 sm:mt-8 hero-subtitle">
          <p className="text-base sm:text-lg md:text-xl text-black/60 font-medium leading-relaxed">
            The unified AI productivity suite for modern knowledge workers.
            Synthesize dense documents, optimize career assets, craft executive writing,
            and structure complex ideas in one seamless canvas.
          </p>

          {/* Caveat Handwritten Note */}
          <div className="hidden lg:flex items-center gap-1.5 absolute -right-36 -top-5 text-osmo-purple font-caveat text-2xl rotate-6 pointer-events-none select-none">
            <span>Zero prompt friction</span>
            <svg
              className="w-7 h-7 -rotate-45 stroke-osmo-purple fill-none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Hero Fan / Arc of 5 Core Capability Cards */}
      <div className="relative mt-12 sm:mt-16 pt-4 pb-8">
        <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5 flex-wrap md:flex-nowrap justify-items-center">
          {heroCapabilities.map((cap, idx) => {
            // Arc rotation angle calculation
            const rotations = [-6, -3, 0, 3, 6];
            const yOffsets = [12, 4, 0, 4, 12];
            const rot = rotations[idx] || 0;
            const yOff = yOffsets[idx] || 0;

            return (
              <div
                key={cap.id}
                ref={(el) => (cardsRef.current[idx] = el)}
                onMouseEnter={() => setHoveredCard(cap.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  transform: `translateY(${yOff}px) rotate(${rot}deg)`,
                  transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease"
                }}
                className={`hero-fan-card group relative w-full sm:w-[48%] md:w-56 lg:w-60 h-72 sm:h-80 rounded-xl p-5 flex flex-col justify-between border shadow-lg cursor-pointer select-none overflow-hidden transition-all duration-300 hover:z-20 hover:scale-105 hover:-translate-y-2 ${
                  cap.color
                } ${hoveredCard === cap.id ? "ring-2 ring-osmo-lime/70 shadow-2xl" : ""}`}
              >
                {/* Background ambient gradient on hover */}
                <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Top header: Tag & Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-white/50 uppercase">
                    {cap.tag}
                  </span>
                  {cap.badge && (
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${cap.badgeColor}`}
                    >
                      {cap.badge}
                    </span>
                  )}
                </div>

                {/* Icon & Title */}
                <div className="relative z-10 my-auto">
                  <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center mb-3 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    {cap.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white mb-1">
                    {cap.title}
                  </h3>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wide font-mono">
                    {cap.sub}
                  </p>
                  <p className="text-xs text-white/70 mt-2.5 line-clamp-3 leading-relaxed">
                    {cap.previewText}
                  </p>
                </div>

                {/* Bottom link trigger */}
                <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white/80 group-hover:text-white">
                  <span>Explore Module</span>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-osmo-lime group-hover:text-black transition-colors">
                    <ArrowUpRight size={13} weight="bold" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Play Reel / Explore Workspace Interactive Trigger */}
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-osmo-dark font-display">
              Test
            </span>
            <Link
              href="/auth"
              className="group flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#151515] text-white hover:bg-osmo-purple transition-all duration-300 shadow-md active:scale-95"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-osmo-lime animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">
                <TextRoll>Launch Sandbox</TextRoll>
              </span>
              <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-osmo-dark font-display">
              Drive
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-black/50 font-mono">
            <Sparkle size={14} className="text-osmo-purple" weight="fill" />
            <span>Try the multi-modal reasoning engine without signing in</span>
          </div>
        </div>
      </div>

      {/* Dual Spotlight Cards (Purple Portrait Card + Dark Radial Status Widget) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 sm:mt-14 max-w-5xl mx-auto">
        
        {/* Left Spotlight: Electric Purple Card */}
        <div className="hero-spotlight-item md:col-span-6 bg-osmo-purple text-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-75 group">
          {/* Subtle graphic accent */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full bg-black/20 text-white tracking-widest">
                STREAMING ENGINE
              </span>
              <span className="text-xs font-caveat text-osmo-lime">
                &lt; 50ms time to first token
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight font-display">
              Zero Latency.<br />
              Infinite Precision.
            </h3>

            <p className="text-sm text-white/80 mt-3 max-w-sm leading-relaxed">
              Engineered with dedicated Mistral pipelines and real-time SSE streaming for instant code, synthesis, and deep multi-step reasoning.
            </p>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">
                AI
              </div>
              <div>
                <p className="text-sm font-bold text-white">Mistral Large & 7B</p>
                <p className="text-xs text-white/60 font-mono">Parallel Context Window</p>
              </div>
            </div>

            <Link
              href="/chat"
              className="p-3 rounded-xl bg-white text-black hover:bg-osmo-lime transition-all duration-300 group-hover:scale-105"
            >
              <ArrowUpRight size={18} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Right Spotlight: Dark Oval / Interactive Status Pill */}
        <div className="hero-spotlight-item md:col-span-6 bg-[#151515] text-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between border border-white/10 shadow-xl min-h-75 relative overflow-hidden">
          {/* Circular radial ticks visual backdrop */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-dashed border-white animate-spin-slow" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-osmo-lime animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-osmo-lime">
                  SYSTEM READY
                </span>
              </div>
              <span className="text-xs font-mono text-white/40">v1.0.4 PRODUCTION</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 font-display">
              5 Dedicated Modules in One Cohesive Canvas
            </h3>
            
            {/* Quick module badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/80 flex items-center gap-2">
                <ChatTeardropDots size={14} className="text-osmo-lime" />
                <span>AI Chat</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/80 flex items-center gap-2">
                <FilePdf size={14} className="text-osmo-purple" />
                <span>PDF Analysis</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/80 flex items-center gap-2">
                <BriefcaseMetal size={14} className="text-osmo-lime" />
                <span>ATS Resume</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/80 flex items-center gap-2">
                <PenNib size={14} className="text-white" />
                <span>AI Writing</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/80 flex items-center gap-2">
                <Graph size={14} className="text-osmo-purple" />
                <span>Notes Recall</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-osmo-lime/10 border border-osmo-lime/20 text-xs font-bold text-osmo-lime flex items-center gap-1.5">
                <Lightning size={14} weight="bold" />
                <span>Unified Store</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-5 mt-5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
              <ShieldCheck size={16} className="text-osmo-lime" />
              <span>Zero-Retention Privacy Guarantee</span>
            </div>

            <Link
              href="/auth"
              className="text-xs font-bold uppercase tracking-wider text-osmo-lime hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
