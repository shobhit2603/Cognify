"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkle } from "@phosphor-icons/react";
import TextRoll from "./TextRoll";

export default function FeatureComingSoon({
  number = "03",
  title = "Resume Studio",
  subtitle = "ATS Optimizer",
  icon: Icon,
  accentColor = "text-[#ffbd2e]",
  accentBg = "bg-[#ffbd2e]",
  accentBorder = "border-[#ffbd2e]/30",
  glowColor = "bg-[#ffbd2e]/15",
  description,
}) {
  return (
    <div className="w-full h-full flex-1 min-h-0 flex items-center justify-center px-4 py-8 pt-20 relative z-10 select-none bg-[#0d0d0f]">
      {/* Centered Coming Soon Card */}
      <div className="relative w-full max-w-lg bg-[#151414] border border-white/[0.08] rounded-3xl p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
        {/* Ambient Top-Right Radial Glow */}
        <div
          className={`absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none ${glowColor}`}
        />
        {/* Ambient Bottom-Left Glow */}
        <div
          className={`absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl pointer-events-none ${glowColor} opacity-50`}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Top Pill: Module Number + Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/70 mb-6">
            <span className={`w-2 h-2 rounded-full ${accentBg} animate-pulse`} />
            <span className="font-mono tracking-widest font-semibold">{number}</span>
            <span className="text-white/20">•</span>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-white/60">
              Coming Soon
            </span>
          </div>

          {/* Feature Icon */}
          <div
            className={`w-16 h-16 rounded-2xl bg-white/[0.03] border ${accentBorder} flex items-center justify-center mb-6 shadow-inner`}
          >
            {Icon ? (
              <Icon size={32} weight="bold" className={accentColor} />
            ) : (
              <Sparkle size={32} weight="bold" className={accentColor} />
            )}
          </div>

          {/* Heading */}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase leading-snug">
            {title} <span className="normal-case font-normal text-white/80">is coming soon</span>
          </h1>

          {/* Caveat Handwritten Subtitle */}
          <p className={`text-xl font-caveat mt-1.5 font-bold ${accentColor}`}>
            {subtitle}
          </p>

          {/* Description */}
          <p className="text-sm text-white/50 max-w-sm mt-3 leading-relaxed">
            {description ||
              `${title} is currently under active development. Stay updated as we finalize this workspace for Cognify.`}
          </p>

          {/* CTA Button to Move to Dashboard */}
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-osmo-lime text-black font-semibold text-sm hover:bg-white active:scale-95 transition-all duration-300 shadow-lg cursor-pointer"
            >
              <ArrowLeft
                size={16}
                weight="bold"
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              <TextRoll>Move to Dashboard</TextRoll>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
