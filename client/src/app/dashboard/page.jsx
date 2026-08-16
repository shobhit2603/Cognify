"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import {
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNibStraight,
  Notebook,
  ArrowRight,
  ClockCounterClockwise,
  Sparkle,
  Lightning,
  MagnifyingGlass,
  ArrowUpRight,
  Plus,
  CheckCircle,
  Cpu,
  FolderSimple
} from "@phosphor-icons/react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import { useAuth } from "../../features/auth/hooks/useAuth";

const WORKSPACE_MODULES = [
  {
    id: "chat",
    title: "AI Chat",
    category: "General Intelligence",
    tagline: "Natural streaming conversations with context retention.",
    icon: ChatTeardropDots,
    href: "/chat",
    stats: "Mistral Large",
    accent: "hover:border-brand-orange/40",
    colSpan: "col-span-1 md:col-span-3 lg:col-span-4",
    bgStyle: "bg-white",
    quickAction: "New Conversation",
  },
  {
    id: "documents",
    title: "Document Analysis",
    category: "Knowledge Extraction",
    tagline: "Extract insights, key facts, and run Q&A on PDFs.",
    icon: FilePdf,
    href: "/documents",
    stats: "PDF Support",
    accent: "hover:border-blue-500/40",
    colSpan: "col-span-1 md:col-span-3 lg:col-span-2",
    bgStyle: "bg-white",
    quickAction: "Upload File",
  },
  {
    id: "resume",
    title: "Resume Studio",
    category: "Career Optimization",
    tagline: "ATS benchmark scoring & targeted section rewrites.",
    icon: BriefcaseMetal,
    href: "/resume",
    stats: "ATS Parser",
    accent: "hover:border-emerald-500/40",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    bgStyle: "bg-white",
    quickAction: "Run Audit",
  },
  {
    id: "writing",
    title: "AI Writing",
    category: "Professional Comms",
    tagline: "Draft high-impact emails, cover letters & proposals.",
    icon: PenNibStraight,
    href: "/writing",
    stats: "Multi-tone",
    accent: "hover:border-purple-500/40",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    bgStyle: "bg-white",
    quickAction: "Draft Copy",
  },
  {
    id: "notes",
    title: "Notes Enhancer",
    category: "Learning Synthesis",
    tagline: "Turn rough scratchpads into structured conceptual frameworks.",
    icon: Notebook,
    href: "/notes",
    stats: "Concept Maps",
    accent: "hover:border-amber-500/40",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    bgStyle: "bg-white",
    quickAction: "New Note",
  },
];

const RECENT_ACTIVITY = [
  { 
    id: 1, 
    title: "Monolithic vs Microservices Architecture", 
    tool: "AI Chat", 
    href: "/chat",
    time: "20m ago",
    badge: "Chat"
  },
  { 
    id: 2, 
    title: "Quarterly_Engineering_Strategy_2026.pdf", 
    tool: "Documents", 
    href: "/documents",
    time: "3h ago",
    badge: "PDF"
  },
  { 
    id: 3, 
    title: "Lead Systems Engineer Cover Letter", 
    tool: "AI Writing", 
    href: "/writing",
    time: "Yesterday",
    badge: "Writing"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 350, damping: 28 } 
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const glowRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    gsap.to(glowRef.current, {
      x: 20,
      y: 15,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-white text-brand-black pt-6 pb-24 px-4 sm:px-8 relative overflow-x-hidden selection:bg-brand-orange selection:text-white">
        
        {/* Ambient Gradient Glow */}
        <div
          ref={glowRef}
          className="absolute top-16 right-10 w-96 h-96 bg-brand-orange/10 rounded-full blur-[130px] pointer-events-none z-0"
        />

        <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
          
          {/* ========================================================================= */}
          {/* 1. HERO HEADER & QUICK LAUNCH SEARCH */}
          {/* ========================================================================= */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-black/5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-gray-600 text-xs font-mono font-medium mb-3">
                <Sparkle size={14} className="text-brand-orange" weight="fill" />
                <span>COGNIFY WORKSPACE</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-brand-black tracking-tight leading-tight">
                {getGreeting()}, <span className="text-brand-orange">{firstName}.</span>
              </h1>
              <p className="text-gray-500 font-sans text-base sm:text-lg mt-1">
                Your unified workspace is active. Choose an AI pipeline to begin.
              </p>
            </div>

            {/* Interactive Search / Command Input */}
            <div className="w-full lg:max-w-md relative flex items-center">
              <MagnifyingGlass size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tools, notes, documents... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/10 focus:border-brand-orange/70 focus:ring-2 focus:ring-brand-orange/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-brand-black placeholder:text-gray-400 font-medium transition-all shadow-xs outline-none"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. PHILOSOPHY PIPELINE STATUS BAR */}
          {/* ========================================================================= */}
          <div className="bg-black/2 border border-black/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Lightning size={16} className="text-brand-orange" weight="fill" />
              <span>Workspace Workflow</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto justify-start sm:justify-end text-xs font-display font-medium text-gray-500">
              <span className="px-3 py-1 rounded-lg bg-white border border-black/5 text-brand-black font-bold">1. Understand</span>
              <ArrowRight size={12} className="text-gray-400 shrink-0" />
              <span className="px-3 py-1 rounded-lg bg-white border border-black/5 text-brand-black font-bold">2. Research</span>
              <ArrowRight size={12} className="text-gray-400 shrink-0" />
              <span className="px-3 py-1 rounded-lg bg-white border border-black/5 text-brand-black font-bold">3. Create</span>
              <ArrowRight size={12} className="text-gray-400 shrink-0" />
              <span className="px-3 py-1 rounded-lg bg-white border border-black/5 text-brand-black font-bold">4. Improve</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. BENTO WORKSPACE TOOLS GRID */}
          {/* ========================================================================= */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-6 gap-5"
          >
            {WORKSPACE_MODULES.filter(
              (m) =>
                m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.tagline.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className={`${tool.colSpan} flex flex-col`}
                >
                  <Link
                    href={tool.href}
                    className={`group relative flex flex-col justify-between h-full min-h-55 p-7 ${tool.bgStyle} border border-black/5 ${tool.accent} rounded-4xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/5`}
                  >
                    {/* Card Top Row */}
                    <div className="flex justify-between items-start z-10 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black/5 text-brand-black rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-black group-hover:text-white">
                          <Icon size={24} weight="duotone" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 block">
                            {tool.category}
                          </span>
                          <span className="text-xs font-medium text-brand-orange">
                            {tool.stats}
                          </span>
                        </div>
                      </div>

                      <div className="w-9 h-9 rounded-full bg-black/5 group-hover:bg-brand-black group-hover:text-white flex items-center justify-center text-gray-500 transition-all duration-300">
                        <ArrowUpRight size={16} weight="bold" />
                      </div>
                    </div>

                    {/* Card Bottom Body */}
                    <div className="z-10 mt-auto">
                      <h3 className="text-2xl font-display font-bold text-brand-black mb-1 group-hover:text-brand-orange transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-sans leading-relaxed">
                        {tool.tagline}
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-medium text-gray-400 group-hover:text-brand-black transition-colors">
                        <span>{tool.quickAction}</span>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Subtle Backdrop Gradient Hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-brand-orange/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ========================================================================= */}
          {/* 4. ACTIVITY & RUNTIME TELEMETRY DUAL SECTION */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            
            {/* Left: Recent Activity Feed */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-black">
                  <ClockCounterClockwise size={20} weight="bold" />
                  <h2 className="text-xl font-display font-bold">Recent Activity</h2>
                </div>
                <span className="text-xs text-gray-400 font-medium font-mono">Real-time sync</span>
              </div>

              <div className="flex flex-col gap-3">
                {RECENT_ACTIVITY.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="group flex items-center justify-between p-4 bg-white border border-black/5 hover:border-black/15 rounded-2xl transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-black/5 text-brand-black flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                        <FolderSimple size={16} weight="duotone" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-medium text-brand-black truncate group-hover:text-brand-orange transition-colors">
                          {activity.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-semibold text-gray-500">{activity.tool}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-md bg-black/5 text-gray-500 text-[11px] font-mono font-medium">
                        {activity.badge}
                      </span>
                      <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Runtime Telemetry & Session Card */}
            <div className="lg:col-span-4 flex flex-col justify-between p-6 bg-brand-black text-brand-white rounded-4xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-400 text-[11px] font-mono font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Engine Online</span>
                  </div>
                  <Cpu size={18} className="text-gray-400" />
                </div>

                <h3 className="text-xl font-display font-bold mb-1">Mistral AI Workspace</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 font-sans">
                  Streaming inference is enabled with isolated multi-turn context retention.
                </p>

                <div className="flex flex-col gap-2.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-400 pb-1.5 border-b border-white/10">
                    <span>Latency</span>
                    <span className="text-white font-bold">&lt; 50ms</span>
                  </div>
                  <div className="flex justify-between text-gray-400 pb-1.5 border-b border-white/10">
                    <span>Document Context</span>
                    <span className="text-white font-bold">PDF Ready</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Active Session</span>
                    <span className="text-emerald-400 font-bold">Encrypted</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/chat"
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-white hover:text-brand-black text-white text-xs font-display font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>Start New AI Thread</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}