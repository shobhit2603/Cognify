"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkle, Lightning } from "@phosphor-icons/react";
import TextRoll from "../ui/TextRoll";

export default function CtaSection() {
  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto items-stretch">
        
        {/* Left Capsule: Dark Oval with Dynamic Typography */}
        <div className="md:col-span-5 bg-[#151515] text-white rounded-[120px] p-8 sm:p-10 flex flex-col justify-between items-center text-center border border-white/10 shadow-2xl relative overflow-hidden group min-h-85">
          <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-30 pointer-events-none" />

          <div className="relative z-10 pt-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-osmo-lime">
              COGNIFY
            </span>
          </div>

          <div className="relative z-10 my-auto">
            <h3 className="text-3xl sm:text-4xl uppercase tracking-tight text-white font-display leading-tight">
              Built to Flex.<br />
              Built for Flow.
            </h3>
            <p className="font-caveat text-osmo-lime text-xl mt-2">
              Unleash deep cognitive leverage
            </p>
          </div>

          <div className="relative z-10 pb-4">
            <span className="text-[10px] font-mono text-white/40 tracking-wider">
              2026 EDITION • SAAS SOVEREIGN
            </span>
          </div>
        </div>

        {/* Right Capsule: Electric Purple High-Impact Action Box */}
        <div className="md:col-span-7 bg-osmo-purple text-white rounded-3xl sm:rounded-[36px] p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-osmo-purple/50 min-h-85">
          {/* Ambient light glow */}
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-osmo-lime animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/90">
                GET STARTED IN 30 SECONDS
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl tracking-tight text-white font-display leading-[1.05] uppercase">
              Ready to level up?
            </h2>

            <p className="text-sm sm:text-base text-white/80 font-medium mt-3 max-w-md leading-relaxed">
              Join thousands of professionals, students, and engineers using Cognify to understand faster, write better, and execute without friction.
            </p>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-white/20 flex items-center gap-4 flex-wrap">
            <Link
              href="/auth"
              className="group/btn flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-osmo-lime text-black font-bold text-sm uppercase tracking-wider hover:bg-white transition-all duration-300 shadow-xl active:scale-95"
            >
              <TextRoll>Join Free Today</TextRoll>
              <ArrowRight size={16} weight="bold" className="transition-transform group-hover/btn:translate-x-1" />
            </Link>

            <Link
              href="/chat"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 border border-white/10"
            >
              <TextRoll>Try Sandbox</TextRoll>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
