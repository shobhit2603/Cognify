"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import TextRoll from "../ui/TextRoll";
import {
  UsersThree,
  ArrowLeft,
  ArrowUpRight,
  GitBranch,
  Sparkle,
  Code,
  FileText,
  SpeakerHigh,
  EnvelopeSimple,
  PaintBrush,
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const CONTRIBUTION_AREAS = [
  {
    tag: "POST-MVP MODULE",
    title: "Blog & Long-Form Writer",
    accent: "text-[#ff5f56]",
    border: "border-white/10 hover:border-[#ff5f56]/45",
    icon: Code,
    description:
      "Extend the GeneratedContent architecture inside AI Writing to support structured SEO outlines, long-form articles, and custom editorial templates.",
  },
  {
    tag: "DOCUMENT PIPELINE",
    title: "DOCX, PPTX & Markdown Ingestion",
    accent: "text-osmo-lime",
    border: "border-white/10 hover:border-osmo-lime/45",
    icon: FileText,
    description:
      "Expand BullMQ document workers beyond PDFs to parse Word documents, slide decks, and multi-format study notes into Pinecone RAG.",
  },
  {
    tag: "MULTIMODAL",
    title: "Text-to-Voice & Audio Notes",
    accent: "text-osmo-teal",
    border: "border-white/10 hover:border-osmo-teal/45",
    icon: SpeakerHigh,
    description:
      "Add low-latency voice playback for Notes Enhancer blueprints and AI Chat responses while maintaining strict user data boundaries.",
  },
  {
    tag: "FRONTEND & MOTION",
    title: "UI Polish, Tests & Accessibility",
    accent: "text-osmo-purple",
    border: "border-white/10 hover:border-osmo-purple/45",
    icon: PaintBrush,
    description:
      "Refine responsive studio layouts, expand Jest + Supertest coverage, and sharpen keyboard navigation across all five workspaces.",
  },
];

export default function CareersContent() {
  const containerRef = useRef(null);

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(".careers-hero-badge", { y: -12, duration: 0.45, clearProps: "transform" })
        .from(".careers-hero-title", { y: 24, duration: 0.55, clearProps: "transform" }, "-=0.3")
        .from(".careers-hero-sub", { y: 14, duration: 0.45, clearProps: "transform" }, "-=0.3");

      gsap.from(".careers-area-card", {
        y: 22,
        scale: 0.98,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".careers-areas-grid",
          start: "top 92%",
          once: true,
        },
      });

      gsap.from(".careers-cta-card", {
        y: 22,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".careers-cta-section",
          start: "top 92%",
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full pb-16 pt-2 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/10 pb-8 mb-8 space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black/50 hover:text-osmo-purple transition-colors w-fit"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Back to Home</span>
        </Link>

        <div className="careers-hero-badge flex items-center gap-2 text-osmo-purple">
          <UsersThree size={20} weight="bold" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">
            Open Source &amp; Collaboration
          </span>
        </div>

        <h1 className="careers-hero-title text-4xl sm:text-6xl font-display font-bold uppercase tracking-tighter text-osmo-dark leading-[0.95]">
          Build With Us<span className="text-osmo-purple">.</span>
        </h1>

        <p className="careers-hero-sub font-caveat text-2xl sm:text-3xl text-red-500">
          Indie AI engineering, open to contributors &amp; collaborators
        </p>

        <p className="careers-hero-sub text-sm sm:text-base text-black/70 leading-relaxed max-w-3xl font-medium">
          Cognify is an independent open-source AI workspace created by{" "}
          <strong>Shashank Lakhera</strong> and{" "}
          <strong>Shobhit Shrivastava</strong>. While we don&apos;t have salaried roles open right now, we actively welcome fellow engineers, designers, and AI builders to collaborate on Post-MVP features.
        </p>
      </div>

      {/* Transparent Status Banner */}
      <section className="bg-[#151515] text-white border border-white/10 rounded-lg p-6 sm:p-7 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-osmo-lime animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-osmo-lime">
              CURRENT TEAM STATUS
            </span>
          </div>
          <h2 className="text-xl font-display font-bold uppercase tracking-tight">
            Open-Source Contributors Welcome
          </h2>
          <p className="text-xs sm:text-sm text-white/65 max-w-2xl leading-relaxed">
            Browse open issues, propose Post-MVP enhancements, or open a pull request on GitHub following our layered server and feature-modular client guidelines.
          </p>
        </div>

        <Link
          href="https://github.com/shobhit2603/Cognify"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-osmo-lime text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shrink-0 w-fit"
        >
          <GitBranch size={15} weight="bold" />
          <TextRoll>Open GitHub Repo</TextRoll>
          <ArrowUpRight size={14} weight="bold" />
        </Link>
      </section>

      {/* Post-MVP Contribution Areas */}
      <section className="space-y-5 mb-12">
        <div className="flex items-center gap-2">
          <Sparkle size={18} weight="fill" className="text-osmo-purple" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-black/60">
            Roadmap Areas Looking for Collaborators
          </h2>
        </div>

        <div className="careers-areas-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTRIBUTION_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <div
                key={area.title}
                className={`careers-area-card bg-[#151414] text-white border rounded-sm hover:rounded-3xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 ${area.border}`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={22} weight="bold" className={area.accent} />
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white/70 border border-white/10">
                    {area.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight">
                    {area.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Collaboration Capsules */}
      <section className="careers-cta-section grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="careers-cta-card md:col-span-5 bg-[#151515] text-white rounded-lg p-7 border border-white/10 flex flex-col justify-between min-h-56">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-osmo-lime">
            HOW TO CONTRIBUTE
          </span>
          <div className="my-auto py-3 space-y-2">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
              Fork, Build &amp; Open a PR
            </h3>
            <p className="text-xs text-white/65 leading-relaxed">
              Check <code className="text-white">docs/</code> and the Master Engineering Context in the repo to follow Cognify&apos;s security, validation, and testing standards.
            </p>
          </div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-osmo-lime hover:underline w-fit"
          >
            <span>Read Architecture Docs</span>
            <ArrowUpRight size={13} weight="bold" />
          </Link>
        </div>

        <div className="careers-cta-card md:col-span-7 bg-osmo-purple text-white rounded-lg p-7 sm:p-9 border border-osmo-purple/50 flex flex-col justify-between min-h-56">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/85">
              DIRECT COLLABORATION
            </span>
            <h3 className="text-3xl font-display font-bold uppercase tracking-tight leading-tight">
              Want to collaborate on AI systems?
            </h3>
            <p className="text-xs sm:text-sm text-white/85 max-w-md leading-relaxed">
              Reach out directly with ideas, feedback, or feature proposals—we love connecting with builders.
            </p>
          </div>

          <div className="pt-5 flex items-center gap-3 flex-wrap">
            <a
              href="mailto:lakherashashank70@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-osmo-lime text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all"
            >
              <EnvelopeSimple size={15} weight="bold" />
              <TextRoll>Email Us</TextRoll>
            </a>
            <Link
              href="https://github.com/shobhit2603/Cognify/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <TextRoll>Browse Issues</TextRoll>
              <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
