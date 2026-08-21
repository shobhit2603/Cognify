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
  CheckCircle,
  Copy,
  Sparkle,
  Sliders,
  Play,
  MagnifyingGlass,
  ArrowClockwise,
  Quotes,
  Terminal,
  PaperPlaneRight
} from "@phosphor-icons/react";
import TextRoll from "../ui/TextRoll";

const tabs = [
  {
    id: "chat",
    label: "AI Chat",
    icon: <ChatTeardropDots size={18} weight="bold" />,
    badge: "STREAMING"
  },
  {
    id: "documents",
    label: "Document Analysis",
    icon: <FilePdf size={18} weight="bold" />,
    badge: "VECTOR RAG"
  },
  {
    id: "resume",
    label: "Resume Studio",
    icon: <BriefcaseMetal size={18} weight="bold" />,
    badge: "94% ATS"
  },
  {
    id: "writing",
    label: "AI Writing",
    icon: <PenNib size={18} weight="bold" />,
    badge: "TONE-TUNED"
  },
  {
    id: "notes",
    label: "Notes Enhancer",
    icon: <Graph size={18} weight="bold" />,
    badge: "SYNTHESIS"
  }
];

export default function PlatformShowcase() {
  const [activeTab, setActiveTab] = useState("chat");
  const [copied, setCopied] = useState(false);
  const [writingTone, setWritingTone] = useState("Executive");

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Light circular backdrop halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-black/3 rounded-lg pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-black/5 border border-black/10 text-xs font-bold uppercase tracking-wider text-black/70 mb-4">
          <Sparkle size={14} className="text-osmo-purple" weight="fill" />
          <span>Interactive Sandbox</span>
        </div>

        <div className="relative inline-block">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-osmo-dark font-display uppercase">
            The platform
          </h2>
          {/* Handwritten Annotation */}
          <span className="hidden sm:inline-block absolute -right-28 -top-3 text-red-500 font-caveat text-2xl rotate-12 select-none pointer-events-none">
            Live Demo ↗
          </span>
        </div>

        <p className="text-base sm:text-lg text-black/60 font-medium mt-4 max-w-xl mx-auto">
          Explore all five specialized intelligence modules in one cohesive, distraction-free environment.
        </p>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex p-1.5 rounded-lg bg-black/5 border border-black/10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-[#151515] text-white shadow-md"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                <span className={isActive ? "text-osmo-lime" : "text-black/40"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="hidden md:inline-block text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-osmo-purple text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dark IDE / Workspace Mockup Bezel */}
      <div className="relative bg-[#151515] text-white rounded-lg border border-white/10 overflow-hidden max-w-5xl mx-auto">
        {/* Workspace Top Window Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-osmo-dark-card">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 text-xs font-mono text-white/40 hidden sm:inline-block">
              cognify-workspace / {activeTab}.engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-osmo-lime bg-osmo-lime/10 px-2.5 py-1 rounded-sm border border-osmo-lime/20">
              <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime animate-pulse" />
              <span>MISTRAL-7B STREAM ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Workspace Inner Body with Sidebar + Main View */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-120">
          
          {/* Internal Sidebar */}
          <div className="hidden md:flex md:col-span-3 border-r border-white/10 bg-[#181616] p-4 flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase px-2 mb-3">
                Workspace Modules
              </div>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                      activeTab === tab.id
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={activeTab === tab.id ? "text-osmo-lime" : ""}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <p className="text-[11px] font-bold text-white">Dedicated Token Pool</p>
              <p className="text-[10px] text-white/50 font-mono mt-0.5">8k / 32k context used</p>
              <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                <div className="w-1/4 h-full bg-osmo-lime rounded-full" />
              </div>
            </div>
          </div>

          {/* Main Stage View depending on activeTab */}
          <div className="md:col-span-9 p-6 sm:p-8 flex flex-col justify-between bg-[#151515]">
            
            {/* MODULE 1: AI CHAT */}
            {activeTab === "chat" && (
              <div className="space-y-6 animate-fadeIn">
                {/* User Message */}
                <div className="flex items-start gap-3.5 max-w-2xl">
                  <div className="w-8 h-8 rounded-full bg-osmo-purple flex items-center justify-center text-xs font-bold shrink-0">
                    U
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-sm text-white/90">
                    <p className="font-medium">
                      Explain Node.js event loop with microtasks vs macrotasks and write a minimal demo snippet.
                    </p>
                  </div>
                </div>

                {/* AI Streaming Response */}
                <div className="flex items-start gap-3.5 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-osmo-lime text-black flex items-center justify-center text-xs font-bold shrink-0">
                    AI
                  </div>
                  <div className="bg-[#1e1b1b] border border-white/10 rounded-lg p-5 text-sm text-white/90 space-y-4 w-full">
                    <div className="flex items-center justify-between text-xs text-white/50 font-mono pb-2 border-b border-white/10">
                      <span>Reasoning stream • 142 tokens/sec</span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Copy size={13} />
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed text-white/80">
                      The <strong className="text-white">Event Loop</strong> continuously coordinates asynchronous callbacks. <strong className="text-osmo-lime">Microtasks</strong> (<code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">process.nextTick</code>, <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Promise</code>) drain immediately after each operation before the next <strong className="text-osmo-purple">Macrotask</strong> (<code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">setTimeout</code>, <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">setImmediate</code>) executes.
                    </p>

                    {/* Code Syntax Highlighting Block */}
                    <div className="rounded-lg bg-[#0d0c0c] border border-white/10 p-3.5 font-mono text-xs text-white/90 overflow-x-auto">
                      <div className="text-white/40 mb-2"></div>
                      <p className="text-blue-400">console<span className="text-white">.</span><span className="text-yellow-300">log</span><span className="text-white">(</span><span className="text-green-300">&apos;1: Synchronous&apos;</span><span className="text-white">);</span></p>
                      <p className="text-purple-400">setTimeout<span className="text-white">(() =&gt; </span>console<span className="text-white">.</span><span className="text-yellow-300">log</span><span className="text-white">(</span><span className="text-green-300">&apos;4: Macrotask&apos;</span><span className="text-white">), 0);</span></p>
                      <p className="text-purple-400">Promise<span className="text-white">.</span><span className="text-yellow-300">resolve</span><span className="text-white">().</span><span className="text-yellow-300">then</span><span className="text-white">(() =&gt; </span>console<span className="text-white">.</span><span className="text-yellow-300">log</span><span className="text-white">(</span><span className="text-green-300">&apos;2: Microtask&apos;</span><span className="text-white">));</span></p>
                      <p className="text-purple-400">process<span className="text-white">.</span><span className="text-yellow-300">nextTick</span><span className="text-white">(() =&gt; </span>console<span className="text-white">.</span><span className="text-yellow-300">log</span><span className="text-white">(</span><span className="text-green-300">&apos;3: High-Priority Microtask&apos;</span><span className="text-white">));</span></p>
                    </div>
                  </div>
                </div>

                {/* Chat Prompt Input Simulation */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white/40 flex items-center justify-between">
                    <span>Ask a follow up question or paste code...</span>
                    <span className="font-mono text-[10px] text-white/30 hidden sm:inline-block">⌘K</span>
                  </div>
                  <Link
                    href="/chat"
                    className="p-3 rounded-xl bg-osmo-lime text-black font-bold hover:bg-white transition-all duration-300"
                  >
                    <PaperPlaneRight size={18} weight="fill" />
                  </Link>
                </div>
              </div>
            )}

            {/* MODULE 2: DOCUMENT ANALYSIS */}
            {activeTab === "documents" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                      <FilePdf size={24} weight="bold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Q3_SaaS_Financial_Report.pdf</h4>
                      <p className="text-xs text-white/50 font-mono">48 Pages • 2.4 MB • Vector Indexed</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-sm bg-osmo-lime/10 text-osmo-lime text-xs font-mono font-bold">
                    ✓ PARSED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#1e1b1b] border border-white/10 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-osmo-purple font-bold tracking-wider">
                      SYNTHESIZED INSIGHTS
                    </span>
                    <h5 className="text-sm font-bold text-white">Annual Recurring Revenue</h5>
                    <p className="text-xs text-white/70 leading-relaxed">
                      ARR grew 142% YoY to $18.4M driven by enterprise tier expansions and 118% net dollar retention.
                    </p>
                    <div className="text-[11px] text-osmo-lime font-mono pt-1">
                      Ref: Section 4.2, Page 19
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#1e1b1b] border border-white/10 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-osmo-purple font-bold tracking-wider">
                      SEMANTIC Q&A
                    </span>
                    <h5 className="text-sm font-bold text-white">&ldquo;What are the primary risk factors?&rdquo;</h5>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Supply chain concentration in EU data centers and currency exchange volatility in APAC markets.
                    </p>
                    <div className="text-[11px] text-osmo-lime font-mono pt-1">
                      Ref: Risk Disclosures, Page 34
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/60">Upload any PDF research paper, technical spec, or legal contract.</span>
                  <Link
                    href="/documents"
                    className="text-xs font-bold uppercase tracking-wider text-osmo-lime hover:underline flex items-center gap-1"
                  >
                    <span>Analyze Document</span>
                    <ArrowUpRight size={14} weight="bold" />
                  </Link>
                </div>
              </div>
            )}

            {/* MODULE 3: RESUME STUDIO */}
            {activeTab === "resume" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center p-5 rounded-lg bg-white/5 border border-white/10">
                  {/* Gauge */}
                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 rounded-lg bg-[#1e1b1b] border border-white/10 text-center">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-white/10 stroke-current"
                          strokeWidth="3.5"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-osmo-lime stroke-current"
                          strokeWidth="3.5"
                          strokeDasharray="94, 100"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-bold text-white">94</span>
                        <span className="text-[10px] font-bold text-white/50 block">/ 100</span>
                      </div>
                    </div>
                    <span className="mt-2 text-xs font-bold text-osmo-lime uppercase tracking-wider">
                      TOP 5% ATS MATCH
                    </span>
                  </div>

                  {/* Recommendations */}
                  <div className="sm:col-span-8 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Target Role: Senior Full-Stack Architect</span>
                      <span className="text-[10px] font-mono text-white/40">3 Gaps Identified</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#1e1b1b] border border-white/5 text-xs text-white/80 space-y-1">
                      <div className="flex items-center gap-2 text-osmo-lime font-semibold">
                        <CheckCircle size={14} weight="fill" />
                        <span>Action Verb Density: Excellent (98%)</span>
                      </div>
                      <p className="text-white/60 text-[11px]">
                        Strong quantification in work experience (e.g. &ldquo;Reduced API latency by 45%&rdquo;).
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-osmo-purple/10 border border-osmo-purple/20 text-xs text-white/80 space-y-1">
                      <div className="flex items-center gap-2 text-osmo-purple font-semibold">
                        <Sparkle size={14} weight="fill" />
                        <span>Suggested ATS Keyword Addition</span>
                      </div>
                      <p className="text-white/70 text-[11px]">
                        Add <code className="bg-white/10 px-1 py-0.5 rounded text-white">&quot;Distributed Tracing&quot;</code> and <code className="bg-white/10 px-1 py-0.5 rounded text-white">&quot;GraphQL Subscriptions&quot;</code> to Section 3.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-white/50">Recruiter-grade ATS audit engine tailored for modern tech roles.</span>
                  <Link
                    href="/resume"
                    className="px-4 py-2 rounded-lg bg-osmo-purple text-white text-xs font-bold hover:bg-white hover:text-black transition-all"
                  >
                    Open Resume Studio
                  </Link>
                </div>
              </div>
            )}

            {/* MODULE 4: AI WRITING */}
            {activeTab === "writing" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/50">TONE SELECTOR:</span>
                    {["Executive", "Persuasive", "Concise"].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setWritingTone(tone)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          writingTone === tone
                            ? "bg-osmo-lime text-black"
                            : "bg-white/10 text-white/70 hover:text-white"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-white/40">Cover Letter & Executive Memo</span>
                </div>

                <div className="bg-[#1e1b1b] border border-white/10 rounded-lg p-5 text-sm text-white/90 space-y-3 font-sans">
                  <p className="text-xs font-mono text-osmo-lime">Subject: Application for Lead AI Architect — [Your Name]</p>
                  <p className="text-sm leading-relaxed text-white/80">
                    Dear Hiring Team,
                  </p>
                  <p className="text-sm leading-relaxed text-white/80">
                    I am writing to express my enthusiasm for the Lead AI Architect role at your organization. Having scaled low-latency multi-tenant inference systems processing over 10M requests daily, I bring deep expertise in orchestrating LLM retrieval architectures and resilient microservices.
                  </p>
                  <p className="text-sm leading-relaxed text-white/80">
                    My background aligns directly with your mission to build sovereign, high-throughput AI platforms.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-white/50">Tuned for career documents, pitch drafts, and formal emails.</span>
                  <Link
                    href="/writing"
                    className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-osmo-lime transition-all"
                  >
                    Start Writing
                  </Link>
                </div>
              </div>
            )}

            {/* MODULE 5: NOTES ENHANCER */}
            {activeTab === "notes" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Raw Notes */}
                  <div className="p-4 rounded-lg bg-[#1e1b1b] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-white/40 font-bold">RAW ROUGH NOTES</span>
                      <span className="text-[10px] text-red-400 font-mono">Unstructured</span>
                    </div>
                    <div className="text-xs text-white/60 font-mono space-y-1.5 p-2 rounded-none bg-black/30">
                      <p>• Raft consensus - leader election</p>
                      <p>• Term numbers prevent split brain</p>
                      <p>• Heartbeat timeout vs election timeout</p>
                      <p>• Log replication only via leader</p>
                    </div>
                  </div>

                  {/* AI Enhanced Study Blueprint */}
                  <div className="p-4 rounded-lg bg-[#1e1b1b] border border-osmo-lime/30 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-osmo-lime font-bold">COGNIFY SYNTHESIS</span>
                      <span className="text-[10px] text-osmo-lime font-mono">Cornell Structure</span>
                    </div>
                    <div className="text-xs text-white/80 space-y-2">
                      <h6 className="font-bold text-white text-xs">Core Protocol Rule:</h6>
                      <p className="text-[11px] leading-relaxed text-white/70">
                        Raft guarantees consistency through randomized election timers (150-300ms). Only a leader with the most up-to-date log term can win quorum votes.
                      </p>
                      <div className="p-2 rounded bg-osmo-lime/10 border border-osmo-lime/20 text-[11px] text-osmo-lime">
                        💡 Key Takeaway: Solves Paxos complexity with clear state transitions.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-white/50">Transforms messy meeting notes into structured learning resources.</span>
                  <Link
                    href="/notes"
                    className="px-4 py-2 rounded-lg bg-osmo-lime text-black text-xs font-bold hover:bg-white transition-all"
                  >
                    Open Notes Enhancer
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom Bar CTA */}
        <div className="p-5 sm:p-6 bg-[#121111] border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-osmo-lime animate-ping" />
            <span className="text-xs sm:text-sm font-semibold text-white/80">
              Ready to elevate your daily productivity?
            </span>
          </div>

          <Link
            href="/auth"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-osmo-lime text-black hover:bg-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300"
          >
            <TextRoll>Launch Free Workspace</TextRoll>
            <ArrowUpRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
