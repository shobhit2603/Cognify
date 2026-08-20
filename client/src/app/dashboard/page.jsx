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
    category: "Reasoning Core",
    icon: ChatTeardropDots,
    href: "/chat",
    quickAction: "Start AI Thread",
    bgClass: "bg-[#151414] text-white border border-white/[0.08]",
    accentColor: "text-osmo-lime"
  },
  {
    id: "documents",
    number: "02",
    title: "Document Analysis",
    category: "PDF Synthesis",
    icon: FilePdf,
    href: "/documents",
    quickAction: "Upload PDF",
    bgClass: "bg-[#151414] text-white border border-white/[0.08]",
    accentColor: "text-osmo-purple"
  },
  {
    id: "resume",
    number: "03",
    title: "Resume Studio",
    category: "ATS Optimizer",
    icon: BriefcaseMetal,
    href: "/resume",
    quickAction: "Audit Resume",
    bgClass: "bg-[#151414] text-white border border-white/[0.08]",
    accentColor: "text-[#ffbd2e]"
  },
  {
    id: "writing",
    number: "04",
    title: "AI Writing",
    category: "Executive Copy",
    icon: PenNib,
    href: "/writing",
    quickAction: "Draft Copy",
    bgClass: "bg-[#151414] text-white border border-white/[0.08]",
    accentColor: "text-[#ff5f56]"
  },
  {
    id: "notes",
    number: "05",
    title: "Notes Enhancer",
    category: "Idea Structuring",
    icon: Graph,
    href: "/notes",
    quickAction: "Structure Note",
    bgClass: "bg-[#151414] text-white border border-white/[0.08]",
    accentColor: "text-[#00FFFF]"
  }
];

export default function DashboardPage() {
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = gsap.utils.toArray(containerRef.current.querySelectorAll(".bento-card-animate"));

    gsap.fromTo(
      cards,
      { y: 16, opacity: 0, scale: 0.985 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.04,
        ease: "power3.out",
        clearProps: "transform,opacity"
      }
    );
  }, []);

  const chatTool = TOOL_MODULES.find((m) => m.id === "chat");
  const subTools = TOOL_MODULES.filter((m) => m.id !== "chat");

  return (
    <main
      ref={containerRef}
      className="w-full h-full flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2 overflow-hidden select-none"
    >
      {/* LEFT COLUMN: Workspace Identity & Live Chrono */}
      <div className="md:col-span-3 flex flex-col gap-2 h-full min-h-0">
        <div className="bento-card-animate flex-1 min-h-0">
          <BrandProfileCard />
        </div>
        <div className="bento-card-animate flex-1 min-h-0">
          <LiveClockCard />
        </div>
      </div>

      {/* CENTER COLUMN: Hero Tool (AI Chat) + 2x2 Submodule Grid */}
      <div className="md:col-span-6 flex flex-col gap-1 h-full min-h-0">
        <div className="bento-card-animate h-[42%] min-h-0">
          <BentoToolCard
            number={chatTool.number}
            title={chatTool.title}
            category={chatTool.category}
            icon={chatTool.icon}
            href={chatTool.href}
            quickAction={chatTool.quickAction}
            bgClass={chatTool.bgClass}
            accentColor={chatTool.accentColor}
            isHero={true}
            className="h-full"
          />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-2 gap-1">
          {subTools.map((tool) => (
            <div key={tool.id} className="bento-card-animate h-full min-h-0">
              <BentoToolCard
                number={tool.number}
                title={tool.title}
                category={tool.category}
                icon={tool.icon}
                href={tool.href}
                quickAction={tool.quickAction}
                bgClass={tool.bgClass}
                accentColor={tool.accentColor}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Realtime Session Activity */}
      <div className="md:col-span-3 bento-card-animate h-full min-h-0">
        <RecentActivityCard />
      </div>
    </main>
  );
}

