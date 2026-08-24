"use client";
import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
} from "@phosphor-icons/react";

import GreetingTimeCard from "../../features/dashboard/components/GreetingTimeCard";
import AIChatEngineCard from "../../features/dashboard/components/AIChatEngineCard";
import BentoToolCard from "../../features/dashboard/components/BentoToolCard";
import RecentActivityCard from "../../features/dashboard/components/RecentActivityCard";

const SUB_TOOL_MODULES = [
  {
    id: "documents",
    number: "02",
    title: "Document Analysis",
    category: "PDF Synthesis",
    icon: FilePdf,
    href: "/documents",
    quickAction: "Upload PDF",
    bgClass: "bg-[#151414] text-white border border-white/[0.08]",
    accentColor: "text-osmo-lime",
    hoverBgClass: "hover:bg-osmo-lime",
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
    accentColor: "text-[#ffbd2e]",
    hoverBgClass: "hover:bg-[#ffbd2e]",
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
    accentColor: "text-[#ff5f56]",
    hoverBgClass: "hover:bg-[#ff5f56]",
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
    accentColor: "text-[#00FFFF]",
    hoverBgClass: "hover:bg-[#00FFFF]",
  },
];

export default function DashboardPage() {
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = gsap.utils.toArray(
      containerRef.current.querySelectorAll(".bento-card-animate"),
    );

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
        clearProps: "transform,opacity",
      },
    );
  }, []);

  return (
    <main
      ref={containerRef}
      className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden select-none"
    >
      {/* TOP ROW: Horizontal Greeting + Clock Banner */}
      <div className="bento-card-animate shrink-0" style={{ height: "56px" }}>
        <GreetingTimeCard />
      </div>

      {/* BOTTOM AREA: 3 columns */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">

        {/* LEFT COLUMN: AI Chat Engine Card (bottom-left) */}
        <div className="md:col-span-3 bento-card-animate h-full min-h-0">
          <AIChatEngineCard />
        </div>

        {/* CENTER COLUMN: 2×2 Sub-tool Grid */}
        <div className="md:col-span-6 flex-1 min-h-0 grid grid-cols-2">
          {SUB_TOOL_MODULES.map((tool) => (
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
                hoverBgClass={tool.hoverBgClass}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Recent Activity */}
        <div className="md:col-span-3 bento-card-animate h-full min-h-0">
          <RecentActivityCard />
        </div>
      </div>
    </main>
  );
}
