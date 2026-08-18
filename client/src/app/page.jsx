"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { 
  ArrowRight, 
  Sparkle, 
  ChatTeardropDots, 
  FilePdf, 
  BriefcaseMetal, 
  PenNibStraight, 
  Notebook, 
  CheckCircle, 
  TerminalWindow, 
  Lightning, 
  ArrowsClockwise, 
  PaperPlaneRight,
  MagnifyingGlass,
  ArrowUpRight,
  UserCircleGear,
  GraduationCap,
  Code
} from "@phosphor-icons/react";
import Link from "next/link";

// Interactive Demo datasets
const TOOL_DEMOS = {
  chat: {
    badge: "Mistral Powered",
    title: "AI Chat Assistant",
    tagline: "Natural streaming conversations with context retention.",
    href: "/chat",
    previewInput: "Compare Monolithic vs Microservices in latency and maintainability",
    previewOutput: "• Monoliths offer sub-millisecond in-memory communication.\n• Microservices introduce network hops but allow isolated horizontal scalability.",
    cta: "Launch Chat Studio"
  },
  documents: {
    badge: "Deep Extraction",
    title: "Document Q&A & Analysis",
    tagline: "Drop complex PDFs and extract actionable citations in milliseconds.",
    href: "/documents",
    previewInput: "Uploaded: Quarterly_Financial_Report_2026.pdf (42 Pages)",
    previewOutput: "Key Finding: Operating margin expanded +4.2% YoY driven by infrastructure consolidation and reduced cloud overhead.",
    cta: "Analyze Documents"
  },
  resume: {
    badge: "ATS Optimization",
    title: "Resume Studio",
    tagline: "Actionable scoring, gap detection, and section-by-section rewrites.",
    href: "/resume",
    previewInput: "Target: Senior Full Stack Engineer (Next.js + Distributed Systems)",
    previewOutput: "ATS Score: 88/100 (+14 pts)\nSuggested: Quantify database latency improvements in the experience section.",
    cta: "Optimize Resume"
  },
  writing: {
    badge: "Precision Tone",
    title: "AI Writing & Comms",
    tagline: "Draft high-stakes client emails, proposals, and tailored cover letters.",
    href: "/writing",
    previewInput: "Context: Follow up after technical design review with stakeholders",
    previewOutput: "Hi Alex,\n\nFollowing up on our architecture session—we’ve validated the streaming schema and finalized the state boundary.",
    cta: "Compose with AI"
  },
  notes: {
    badge: "Concept Synthesis",
    title: "Notes Enhancer",
    tagline: "Turn rough scratchpads into structured conceptual learning frameworks.",
    href: "/notes",
    previewInput: "Raw note: useEffect cleanup runs before unmount and previous effect re-run",
    previewOutput: "Synthesis: React Effect Lifecycle & Memory Protection\n• Prevents stale subscriptions\n• Invoked immediately prior to unmounting.",
    cta: "Enhance Notes"
  }
};

export default function Home() {
  const [activeTool, setActiveTool] = useState("chat");
  const [promptInput, setPromptInput] = useState("");
  const heroRef = useRef(null);
  const marqueeRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // GSAP floating ambient animation on ambient glow
    gsap.to(".ambient-glow", {
      y: 25,
      x: 15,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-brand-white text-brand-black overflow-x-hidden selection:bg-brand-orange selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section 
        ref={heroRef} 
        className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 pt-12 pb-20 max-w-7xl mx-auto overflow-hidden"
      >
        {/* Ambient Gradient Blur */}
        <div className="ambient-glow absolute top-1/4 left-1/2 -translate-x-1/2 w-87.5 sm:w-150 h-75 bg-brand-orange/15 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Floating Badges */}
        <motion.div 
          drag
          dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
          whileHover={{ scale: 1.05, cursor: "grab" }}
          whileTap={{ cursor: "grabbing" }}
          initial={{ opacity: 0, x: -60, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex absolute left-8 top-32 items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl shadow-black/5 border border-black/5 z-20"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-brand-orange">
            <Lightning size={20} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-black">Sub-50ms TTFT</p>
            <p className="text-[11px] text-gray-400">Streaming Engine</p>
          </div>
        </motion.div>

        <motion.div 
          drag
          dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
          whileHover={{ scale: 1.05, cursor: "grab" }}
          whileTap={{ cursor: "grabbing" }}
          initial={{ opacity: 0, x: 60, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex absolute right-8 top-36 items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl shadow-black/5 border border-black/5 z-20"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle size={20} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-black">99.4% ATS Precision</p>
            <p className="text-[11px] text-gray-400">Contextual Scoring</p>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="flex flex-col items-center text-center gap-6 max-w-4xl z-10"
        >
          {/* Eyebrow badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-black text-brand-white text-xs font-medium tracking-wide shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
            <span>COGNIFY WORKSPACE</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-display font-bold tracking-tight text-brand-black leading-[1.05]"
          >
            Think clearer. <br className="hidden sm:block" />
            Build faster with <span className="text-brand-orange underline decoration-black/10 underline-offset-8">Cognify.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-2xl text-gray-600 font-sans font-light max-w-2xl leading-relaxed"
          >
            An interconnected AI command center for documents, resume optimization, structured writing, and knowledge synthesis.
          </motion.p>

          {/* Interactive Hero Action Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full max-w-xl mt-4 flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-xl shadow-black/5 border border-black/10"
          >
            <div className="flex items-center gap-3 px-3 w-full">
              <Sparkle size={20} className="text-brand-orange shrink-0" weight="fill" />
              <input 
                type="text" 
                placeholder="Ask Cognify to analyze, synthesize, or write..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base outline-none text-brand-black placeholder:text-gray-400 font-medium"
              />
            </div>
            <Link 
              href={`/chat${promptInput ? `?prompt=${encodeURIComponent(promptInput)}` : ""}`}
              className="w-full sm:w-auto shrink-0 bg-brand-black hover:bg-brand-orange text-white px-6 py-3 rounded-xl font-display font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Mini Action Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 pt-2"
          >
            <span className="text-xs text-gray-400 font-medium mr-2">Try quick prompt:</span>
            {[
              "Audit ATS Score",
              "Deconstruct PDF",
              "Write Technical Memo"
            ].map((tag, i) => (
              <button
                key={i}
                onClick={() => setPromptInput(tag)}
                className="text-xs bg-black/5 hover:bg-black/10 text-gray-600 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROOF & REPUTATION (REDESIGNED "TRUSTED BY") */}
      {/* ========================================================================= */}
      <section className="w-full border-y border-black/10 bg-white/70 backdrop-blur-md py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Metrics summary */}
          <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left shrink-0">
            <div>
              <p className="text-3xl font-display font-bold text-brand-black">2.4M+</p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Tokens Processed</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-black/10" />
            <div>
              <p className="text-3xl font-display font-bold text-brand-orange">99.8%</p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Parser Fidelity</p>
            </div>
          </div>

          {/* Scrolling Partner Tape */}
          <div className="w-full overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
            
            <motion.div 
              ref={marqueeRef}
              className="flex items-center gap-12 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
            >
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-12 text-gray-400 font-display font-bold text-lg tracking-wider">
                  <span className="hover:text-brand-black transition-colors cursor-default">VERTEX LABS</span>
                  <span>•</span>
                  <span className="hover:text-brand-black transition-colors cursor-default">HYPERION AI</span>
                  <span>•</span>
                  <span className="hover:text-brand-black transition-colors cursor-default">DEVSCALE</span>
                  <span>•</span>
                  <span className="hover:text-brand-black transition-colors cursor-default">ACADEME GLOBAL</span>
                  <span>•</span>
                  <span className="hover:text-brand-black transition-colors cursor-default">NEXUS DYNAMICS</span>
                  <span>•</span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE TOOLS PLAYGROUND (DEEP DIVE SECTION) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto py-28 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">
              <Lightning size={16} weight="fill" />
              <span>The Five Capabilities</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-bold text-brand-black tracking-tight">
              Tools designed to <br />eliminate friction.
            </h2>
          </div>
          <p className="text-gray-500 max-w-md font-sans text-base">
            No disparate tools. Switch between deep reasoning, document parsing, career growth, and writing without losing your state[cite: 1, 2].
          </p>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-black/5 rounded-2xl mb-8">
          {[
            { id: "chat", label: "AI Chat", icon: <ChatTeardropDots size={18} /> },
            { id: "documents", label: "Documents", icon: <FilePdf size={18} /> },
            { id: "resume", label: "Resume Studio", icon: <BriefcaseMetal size={18} /> },
            { id: "writing", label: "AI Writing", icon: <PenNibStraight size={18} /> },
            { id: "notes", label: "Notes", icon: <Notebook size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTool(tab.id)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display font-semibold text-sm transition-all duration-300 cursor-pointer ${
                activeTool === tab.id 
                  ? "bg-white text-brand-black shadow-md shadow-black/5" 
                  : "text-gray-500 hover:text-brand-black hover:bg-white/40"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Live Interactive Preview Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="w-full bg-brand-black text-brand-white rounded-[2.5rem] p-6 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-stretch justify-between gap-10"
          >
            {/* Left Info Panel */}
            <div className="flex flex-col justify-between max-w-md">
              <div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-brand-orange text-xs font-bold tracking-wider uppercase mb-6 inline-block">
                  {TOOL_DEMOS[activeTool].badge}
                </span>
                <h3 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                  {TOOL_DEMOS[activeTool].title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  {TOOL_DEMOS[activeTool].tagline}
                </p>
              </div>

              <div>
                <Link
                  href={TOOL_DEMOS[activeTool].href}
                  className="inline-flex items-center gap-3 bg-brand-orange hover:bg-white hover:text-brand-black text-white px-6 py-3.5 rounded-xl font-display font-bold transition-all duration-300 group"
                >
                  <span>{TOOL_DEMOS[activeTool].cta}</span>
                  <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Code/Output Canvas */}
            <div className="grow bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <TerminalWindow size={18} className="text-brand-orange" />
                  <span>Cognify Engine </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-gray-400 mb-1"></p>
                  <div className="bg-black/40 p-3 rounded-lg text-white/90 border border-white/5">
                    {TOOL_DEMOS[activeTool].previewInput}
                  </div>
                </div>

                <div>
                  <p className="text-brand-orange mb-1"></p>
                  <div className="bg-black/60 p-4 rounded-lg text-emerald-400 whitespace-pre-line border border-white/5 leading-relaxed">
                    {TOOL_DEMOS[activeTool].previewOutput}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
                <span>Status: 200 OK</span>
                <span>Latency: 38ms</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ========================================================================= */}
      {/* 4. TARGET AUDIENCE MATRIX */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto py-24 px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-brand-black mb-4">
            Built intentionally for high performers.
          </h2>
          <p className="text-gray-500 text-lg">
            Whether you are shipping software, conquering syllabi, or landing your next lead role[cite: 1, 2].
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              role: "Developers & Architects",
              icon: <Code size={32} weight="duotone" />,
              accent: "from-blue-500/10 to-transparent",
              points: [
                "Deconstruct massive API documentation sets",
                "Draft technical specs and architectural reviews",
                "Instant logic debugging with zero context loss"
              ]
            },
            {
              role: "Career Climbers",
              icon: <UserCircleGear size={32} weight="duotone" />,
              accent: "from-brand-orange/10 to-transparent",
              points: [
                "Automated ATS parsing and keyword extraction",
                "Role-targeted resume section improvements",
                "High-impact tailored cover letter generator"
              ]
            },
            {
              role: "Students & Researchers",
              icon: <GraduationCap size={32} weight="duotone" />,
              accent: "from-emerald-500/10 to-transparent",
              points: [
                "Transform messy lecture notes into structured recall sheets",
                "Deep contextual PDF Q&A for academic papers",
                "Concept mapping and error analysis"
              ]
            }
          ].map((audience, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -6 }}
              className="bg-white border border-black/5 rounded-4xl p-8 shadow-xl shadow-black/5 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-black/5 text-brand-black flex items-center justify-center mb-6">
                  {audience.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{audience.role}</h3>
                <ul className="flex flex-col gap-3">
                  {audience.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-gray-600 text-sm">
                      <CheckCircle size={16} className="text-brand-orange shrink-0 mt-0.5" weight="bold" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unified Workspace</span>
                <ArrowUpRight size={18} className="text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. AESTHETIC CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto py-20 px-4 sm:px-6 mb-16">
        <div className="w-full bg-brand-black text-brand-white rounded-[3rem] p-10 sm:p-20 text-center flex flex-col items-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/40 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-4xl sm:text-7xl font-display font-medium tracking-tight mb-6 z-10">
            One tab. <br />Every intelligent workflow.
          </h2>
          <p className="text-neutral-300 text-lg sm:text-xl max-w-xl font-light mb-10 z-10">
            Say goodbye to 5 subscription windows and fragmented prompt history. Elevate your productivity today.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full sm:w-auto">
           <button>Get Started</button>
          </div>
        </div>
      </section>

    </div>
  );
}