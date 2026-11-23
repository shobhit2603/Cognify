"use client";
import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { FilePdf, BriefcaseMetal, PenNib, Graph } from "@phosphor-icons/react";

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
    accentColor: "text-osmo-lime",
    glowClass: "group-hover:bg-osmo-lime/20",
    hoverBorderClass: "hover:border-osmo-lime/40",
    hoverTextClass: "group-hover:text-osmo-lime",
    hoverShadowClass: "hover:shadow-[0_0_30px_rgba(161,255,98,0.12)]",
  },
  {
    id: "resume",
    number: "03",
    title: "Resume Studio",
    category: "ATS Optimizer",
    icon: BriefcaseMetal,
    href: "/resume",
    quickAction: "Audit Resume",
    accentColor: "text-[#ffbd2e]",
    glowClass: "group-hover:bg-[#ffbd2e]/20",
    hoverBorderClass: "hover:border-[#ffbd2e]/40",
    hoverTextClass: "group-hover:text-[#ffbd2e]",
    hoverShadowClass: "hover:shadow-[0_0_30px_rgba(255,189,46,0.12)]",
  },
  {
    id: "writing",
    number: "04",
    title: "AI Writing",
    category: "Executive Copy",
    icon: PenNib,
    href: "/writing",
    quickAction: "Draft Copy",
    accentColor: "text-[#ff5f56]",
    glowClass: "group-hover:bg-[#ff5f56]/20",
    hoverBorderClass: "hover:border-[#ff5f56]/40",
    hoverTextClass: "group-hover:text-[#ff5f56]",
    hoverShadowClass: "hover:shadow-[0_0_30px_rgba(255,95,86,0.12)]",
  },
  {
    id: "notes",
    number: "05",
    title: "Notes Enhancer",
    category: "Idea Structuring",
    icon: Graph,
    href: "/notes",
    quickAction: "Structure Note",
    accentColor: "text-[#00FFFF]",
    glowClass: "group-hover:bg-[#00FFFF]/20",
    hoverBorderClass: "hover:border-[#00FFFF]/40",
    hoverTextClass: "group-hover:text-[#00FFFF]",
    hoverShadowClass: "hover:shadow-[0_0_30px_rgba(0,255,255,0.12)]",
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
      <div className="bento-card-animate shrink-0" style={{ height: "75px" }}>
        <GreetingTimeCard />
      </div>

      {/* BOTTOM AREA: 3 columns */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
        {/* LEFT COLUMN: AI Chat Engine Card (bottom-left) */}
        <div className="md:col-span-3 bento-card-animate h-full min-h-0">
          <AIChatEngineCard />
        </div>

        {/* CENTER COLUMN: 2×2 Sub-tool Grid */}
        <div className="md:col-span-6 flex-1 min-h-0 grid grid-cols-2 gap-1.5 p-1 bg-black/40">
          {SUB_TOOL_MODULES.map((tool) => (
            <div key={tool.id} className="bento-card-animate h-full min-h-0 relative hover:z-30">
              <BentoToolCard
                number={tool.number}
                title={tool.title}
                category={tool.category}
                icon={tool.icon}
                href={tool.href}
                quickAction={tool.quickAction}
                accentColor={tool.accentColor}
                glowClass={tool.glowClass}
                hoverBorderClass={tool.hoverBorderClass}
                hoverTextClass={tool.hoverTextClass}
                hoverShadowClass={tool.hoverShadowClass}
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
