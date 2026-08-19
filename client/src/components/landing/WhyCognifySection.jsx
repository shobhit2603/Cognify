"use client";
import React from "react";
import Image from "next/image";
import {
  Lightning,
  ShieldCheck,
  Cpu,
  Brain,
  SquaresFour,
  Sparkle,
  ArrowUpRight
} from "@phosphor-icons/react";

const valuePoints = [
  {
    title: "Build faster and deeper",
    description:
      "Our specialized inference pipelines save you hours of rebuilding prompts from scratch. Each module is engineered for real-world research, writing, and analysis, so you can ship standout work without cognitive fatigue."
  },
  {
    title: "Speed up your process",
    description:
      "These aren't stripped-down toy wrappers. Every module is built to be lightning fast, flexible, and production-ready, so you can achieve deep synthesis and ATS precision without trading quality for time."
  },
  {
    title: "A living and growing intelligence system",
    description:
      "We continuously update models, vector chunking algorithms, and ATS heuristics. Cognify evolves with your workflow, ensuring your cognitive leverage compounds over time."
  }
];

const techPartners = [
  { name: "MISTRAL AI", role: "Primary LLM Engine" },
  { name: "NEXT.JS 16", role: "SSR & Streaming Client" },
  { name: "MONGODB", role: "Vector & Document Store" },
  { name: "GSAP ANIMATION", role: "Awwwards-Grade Motion" },
  { name: "TAILWIND CSS", role: "Atomic Styling Engine" },
  { name: "REDUX TOOLKIT", role: "Global State Pipeline" }
];

export default function WhyCognifySection() {
  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Divider */}
      <div className="w-full h-px bg-black/10 mb-16" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Column: Brand Stamp & Handwritten Tag */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            {/* Retro / Modern Logo Stamp */}
            <div className="p-4 rounded-2xl bg-black/5 border border-black/10 inline-block">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <Image
                    src="/Cognify-Logo.png"
                    alt="Cognify"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tighter uppercase text-osmo-dark font-display">
                    COGNIFY<span className="text-osmo-purple">.</span>
                  </span>
                  <p className="text-[10px] font-mono font-bold text-black/50 tracking-widest uppercase">
                    INTELLIGENCE SUITE ✻ 2026
                  </p>
                </div>
              </div>
            </div>

            {/* Handwritten Caveat tag */}
            <div className="flex items-center gap-2 text-red-500 font-caveat text-3xl pt-4">
              <span>Why Cognify?</span>
              <svg
                className="w-10 h-10 rotate-12 stroke-red-500 fill-none"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="hidden lg:block p-6 rounded-3xl bg-[#151515] text-white space-y-3 border border-white/10">
            <span className="text-[10px] font-mono uppercase text-osmo-lime font-bold tracking-widest">
              ENTERPRISE SOVEREIGNTY
            </span>
            <h4 className="text-xl font-bold font-display leading-snug">
              Strict Zero-Data Retention
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Your uploaded PDFs, resumes, notes, and chat conversations remain strictly confidential and are never used to train public models.
            </p>
          </div>
        </div>

        {/* Right Column: Editorial Manifesto + Accordion-style List */}
        <div className="lg:col-span-8 space-y-12">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-osmo-dark font-display leading-[1.05]">
            Level up your workflow and join thinkers who love deep work as much as you do.
          </h2>

          {/* Benefit Rows */}
          <div className="divide-y divide-black/10 border-y border-black/10">
            {valuePoints.map((point, idx) => (
              <div
                key={idx}
                className="py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 group hover:bg-black/2 transition-colors px-2 rounded-xl"
              >
                <div className="sm:col-span-5">
                  <h3 className="text-xl sm:text-2xl font-bold text-osmo-dark font-display group-hover:text-osmo-purple transition-colors">
                    {point.title}
                  </h3>
                </div>
                <div className="sm:col-span-7">
                  <p className="text-sm sm:text-base text-black/70 font-medium leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tech Partners / Stack Row */}
          <div className="pt-4">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-black/40 mb-5">
              Built on Modern Sovereign Architecture
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {techPartners.map((tech, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-black/5 border border-black/5 hover:border-black/15 transition-all text-center"
                >
                  <p className="text-xs font-mono font-extrabold text-osmo-dark">{tech.name}</p>
                  <p className="text-[10px] text-black/50 font-medium mt-0.5">{tech.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
