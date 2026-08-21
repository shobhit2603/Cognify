"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
  ArrowUpRight,
  Sparkle,
  CheckCircle,
  Lightning
} from "@phosphor-icons/react";
import TextRoll from "../ui/TextRoll";

const workflowItems = [
  {
    id: "pdf-case",
    module: "DOCUMENT ANALYSIS",
    title: "SEC 10-K Regulatory Audit",
    time: "1.8s PARSE TIME",
    color: "bg-[#151515] text-white border-white/10",
    accent: "text-osmo-purple",
    stats: "48 Pages • 14 Risk Factors",
    badge: "RESEARCH",
    desc: "Extracted revenue anomalies, APAC market exposure risks, and cash flow projections with direct paragraph citations."
  },
  {
    id: "resume-case",
    module: "RESUME STUDIO",
    title: "Lead AI Architect Resume",
    time: "ATS BOOST +35 PTS",
    color: "bg-osmo-lime text-black border-osmo-lime",
    accent: "text-black",
    stats: "96/100 ATS Match Score",
    badge: "CAREER",
    desc: "Added quantitative metric impact across 4 key engineering achievements and optimized keywords for modern recruitment filters."
  },
  {
    id: "writing-case",
    module: "AI WRITING",
    title: "Enterprise Deal Proposal",
    time: "EXECUTIVE TONE",
    color: "bg-[#201d1d] text-white border-white/10",
    accent: "text-osmo-lime",
    stats: "3 Pages • Calibrated Memo",
    badge: "WRITING",
    desc: "Drafted tailored procurement memo with SLA guarantees and multi-tenant compliance terms in under 30 seconds."
  },
  {
    id: "notes-case",
    module: "NOTES ENHANCER",
    title: "Distributed Consensus Blueprint",
    time: "CORNELL SYNTHESIS",
    color: "bg-osmo-purple text-white border-osmo-purple/50",
    accent: "text-osmo-lime",
    stats: "Cornell Format • 0 Friction",
    badge: "STUDY",
    desc: "Transformed chaotic lecture bullet points into structured visual study cards with leader election state machines."
  }
];

export default function WorkflowReelSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-black/5 border border-black/10 text-xs font-bold uppercase tracking-wider text-black/70 mb-4">
            <Sparkle size={14} className="text-osmo-purple" weight="fill" />
            <span>Artifact Reel</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-osmo-dark font-display uppercase">
            Made with Cognify <span className="text-osmo-lime">✻</span>
          </h2>
        </div>

        <p className="text-sm sm:text-base text-black/60 font-medium max-w-md">
          See how researchers, developers, and creators turn high cognitive overload into clean, executed outputs.
        </p>
      </div>

      {/* Grid of 4 High-Impact Case Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflowItems.map((item) => (
          <div
            key={item.id}
            className={`group rounded-lg p-6 flex flex-col justify-between min-h-90 border transition-all duration-300 hover:-translate-y-2 hover:rounded-4xl ${item.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {item.module}
                </span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm bg-black/15 tracking-wider">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight font-display mb-2 leading-snug">
                {item.title}
              </h3>

              <div className="inline-block text-[11px] font-bold uppercase px-2.5 py-1 rounded bg-black/10 mb-4">
                {item.time}
              </div>

              <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-current/10 flex items-center justify-between">
              <span className="text-xs font-semibold opacity-70">
                {item.stats}
              </span>

              <Link
                href="/auth"
                className="w-8 h-8 rounded-sm bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
              >
                <ArrowUpRight size={15} weight="bold" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
