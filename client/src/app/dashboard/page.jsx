"use client";
import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph
} from "@phosphor-icons/react";

import BrandProfileCard from "../../features/dashboard/components/BrandProfileCard";
import LiveClockCard from "../../features/dashboard/components/LiveClockCard";
import BentoToolCard from "../../features/dashboard/components/BentoToolCard";
import RecentActivityCard from "../../features/dashboard/components/RecentActivityCard";

const TOOL_MODULES = [
  {
    id: "chat",
    number: "01",
    title: "AI Chat Engine",
    category: "Reasoning & Inference",
    description: "Low-latency streaming reasoning with full Markdown and code rendering.",
    icon: ChatTeardropDots,
    badge: "MISTRAL",
    badgeBg: "bg-osmo-lime text-black",
    href: "/chat",
    quickAction: "Start AI Thread",
    bgClass: "bg-black text-white",
    accentColor: "text-osmo-lime",
    glowColor: "bg-osmo-lime/15"
  },
  {
    id: "documents",
    number: "02",
    title: "Document Analysis",
    category: "PDF Synthesis",
    description: "Upload dense multi-page PDFs for instant summaries, key citations, and Q&A.",
    icon: FilePdf,
    badge: "VECTOR RAG",
    badgeBg: "bg-osmo-purple text-white",
    href: "/documents",
    quickAction: "Upload PDF",
    bgClass: "bg-black text-white",
    accentColor: "text-osmo-purple",
    glowColor: "bg-osmo-purple/15"
  },
  {
    id: "resume",
    number: "03",
    title: "Resume Studio",
    category: "ATS Optimizer",
    description: "Target job descriptions, audit keyword gaps, and generate executive summaries.",
    icon: BriefcaseMetal,
    badge: "94% ATS",
    badgeBg: "bg-[#ffbd2e] text-black",
    href: "/resume",
    quickAction: "Audit Resume",
    bgClass: "bg-black text-white",
    accentColor: "text-[#ffbd2e]",
    glowColor: "bg-[#ffbd2e]/15"
  },
  {
    id: "writing",
    number: "04",
    title: "AI Writing",
    category: "Executive Copy",
    description: "Draft tailored cover letters, board-ready emails, and professional copy.",
    icon: PenNib,
    badge: "ADAPTIVE",
    badgeBg: "bg-[#ff5f56] text-white",
    href: "/writing",
    quickAction: "Draft Letter",
    bgClass: "bg-black text-white",
    accentColor: "text-[#ff5f56]",
    glowColor: "bg-[#ff5f56]/15"
  },
  {
    id: "notes",
    number: "05",
    title: "Notes Enhancer",
    category: "Idea Structuring",
    description: "Convert rough thoughts and brainstorms into structured concept blueprints.",
    icon: Graph,
    badge: "SYNTHESIS",
    badgeBg: "bg-[#27c93f] text-black",
    href: "/notes",
    quickAction: "Structure Note",
    bgClass: "bg-black text-white",
    accentColor: "text-[#27c93f]",
    glowColor: "bg-[#27c93f]/15"
  }
];

export default function DashboardPage() {
  const gridContainerRef = useRef(null);

  // Staggered Entrance Animation for Awwwards Polish
  useGSAP(() => {
    if (!gridContainerRef.current) return;
    const cards = gsap.utils.toArray(gridContainerRef.current.querySelectorAll(".bento-card-animate"));

    gsap.fromTo(
      cards,
      { y: 20, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.45,
        stagger: 0.035,
        ease: "power3.out",
        clearProps: "transform,opacity"
      }
    );
  }, []);

  const chatTool = TOOL_MODULES.find((m) => m.id === "chat");
  const otherTools = TOOL_MODULES.filter((m) => m.id !== "chat");

  return (
    <div 
      ref={gridContainerRef}
      className="w-full h-full flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-2.5 lg:gap-1 overflow-y-auto md:overflow-hidden select-none pb-6 md:pb-0"
    >
      {/* ========================================================================= */}
      {/* COLUMN 1: Brand & Profile Box + Live Clock & Greeting (3.5 Cols) */}
      {/* ========================================================================= */}
      <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-2 sm:gap-2.5 lg:gap-1 h-full min-h-0">
        {/* Top: Brand & Profile Bento Box */}
        <div className="bento-card-animate flex-1 min-h-44">
          <BrandProfileCard />
        </div>

        {/* Bottom: Live Clock & Date */}
        <div className="bento-card-animate flex-1 min-h-48">
          <LiveClockCard />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COLUMN 2: Primary AI Tools Bento Spread (5.5 Cols) */}
      {/* ========================================================================= */}
      <div className="md:col-span-8 lg:col-span-6 flex flex-col gap-2 sm:gap-2.5 lg:gap-1 h-full min-h-0">
        {/* Top Hero Card: AI Chat Engine */}
        <div className="bento-card-animate shrink-0">
          <BentoToolCard
            number={chatTool.number}
            title={chatTool.title}
            category={chatTool.category}
            description={chatTool.description}
            icon={chatTool.icon}
            badge={chatTool.badge}
            badgeBg={chatTool.badgeBg}
            href={chatTool.href}
            quickAction={chatTool.quickAction}
            bgClass={chatTool.bgClass}
            accentColor={chatTool.accentColor}
            glowColor={chatTool.glowColor}
            className="min-h-40"
            isHero={true}
          />
        </div>

        {/* Bottom 2x2 Grid: The 4 Specialized Productivity Modules */}
        <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 lg:gap-1">
          {otherTools.map((tool) => (
            <div key={tool.id} className="bento-card-animate h-full min-h-36 flex flex-col">
              <BentoToolCard
                number={tool.number}
                title={tool.title}
                category={tool.category}
                description={tool.description}
                icon={tool.icon}
                badge={tool.badge}
                badgeBg={tool.badgeBg}
                href={tool.href}
                quickAction={tool.quickAction}
                bgClass={tool.bgClass}
                accentColor={tool.accentColor}
                glowColor={tool.glowColor}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COLUMN 3: Dedicated Recent Activity Stream with Internal Scroll (3 Cols) */}
      {/* ========================================================================= */}
      <div className="md:col-span-12 lg:col-span-3 bento-card-animate h-full min-h-64 lg:min-h-0">
        <RecentActivityCard />
      </div>
    </div>
  );
}