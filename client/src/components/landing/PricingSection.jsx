"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Lightning
} from "@phosphor-icons/react";
import TextRoll from "../ui/TextRoll";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-black/5 border border-black/10 text-xs font-bold uppercase tracking-wider text-black/70 mb-4">
          <CreditCard size={14} className="text-osmo-purple" weight="fill" />
          <span>Transparent Pricing</span>
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-osmo-dark font-display uppercase leading-tight">
          Everything you need in one membership
        </h2>

        {/* Billing Switcher Pill */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="p-1 rounded-lg bg-black/5 border border-black/10 inline-flex items-center">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isAnnual
                  ? "bg-[#151515] text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isAnnual
                  ? "bg-[#151515] text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm bg-osmo-lime text-black">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        
        {/* Plan 1: Solo (Electric Purple) */}
        <div className="relative bg-osmo-purple text-white rounded-lg p-8 sm:p-10 flex flex-col justify-between border border-osmo-purple/60 group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-black/20 text-white tracking-widest">
                SOLO
              </span>
              <span className="font-caveat text-osmo-lime text-2xl">
                Most Popular
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl sm:text-6xl font-display text-white">
                {isAnnual ? "$15" : "$19"}
              </span>
              <span className="text-lg text-white/70">
                / user / month
              </span>
            </div>

            <p className="text-sm text-white/80 leading-relaxed mb-6 font-medium">
              Ideal for researchers, developers, and creators who need fast, low-friction AI execution every day.
            </p>

            <div className="space-y-3.5 pt-4 border-t border-white/20">
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Unlimited Streaming AI Chats with Mistral 7B</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>50 PDF uploads &amp; Vector Q&amp;A (up to 100 pages each)</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Resume Studio with ATS gap scoring &amp; optimization</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>AI Writing: Executive emails &amp; custom cover letters</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Smart Notes Enhancer with Cornell synthesis</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/20">
            <Link
              href="/auth"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-white text-black hover:bg-osmo-lime font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-95"
            >
              <TextRoll>Start 14-Day Free Trial</TextRoll>
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Plan 2: Team / Pro (Crisp White with Dark Accents) */}
        <div className="relative bg-[#151515] text-white rounded-lg p-8 sm:p-10 flex flex-col justify-between border border-white/10 group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-white/10 text-osmo-lime tracking-widest">
                TEAM / SCALE
              </span>
              <span className="text-2xl font-caveat text-white/50">
                Enterprise Ready
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl sm:text-6xl font-display text-white">
                {isAnnual ? "$39" : "$49"}
              </span>
              <span className="text-sm font-mono text-white/60">
                / user / month
              </span>
            </div>

            <p className="text-sm text-white/70 leading-relaxed mb-6 font-medium">
              For teams, agencies, and power users who need dedicated throughput, custom vector stores, and SLA.
            </p>

            <div className="space-y-3.5 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Everything in Solo + Mistral Large Reasoning</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Dedicated priority inference queue (Zero wait time)</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Unlimited multi-document cross-synthesis</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Bulk ATS Resume audit with candidate export</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check size={18} weight="bold" className="text-osmo-lime shrink-0" />
                <span>Dedicated customer support &amp; 99.9% uptime SLA</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/10">
            <Link
              href="/auth"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-osmo-lime text-black hover:bg-white font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-95"
            >
              <TextRoll>Upgrade to Team</TextRoll>
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>

      </div>

      {/* Trust & Guarantee Note */}
      <div className="mt-12 text-center flex items-center justify-center gap-6 flex-wrap text-lg text-black/50">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-osmo-purple" />
          <span>Zero-Retention Privacy Guarantee</span>
        </div>
        <span>•</span>
        <span>No Credit Card Required for Free Trial</span>
        <span>•</span>
        <span>Cancel Anytime in 1 Click</span>
      </div>
    </section>
  );
}
