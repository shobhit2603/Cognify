"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Quotes,
  Globe,
  Sparkle,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowDown
} from "@phosphor-icons/react";

const testimonials = [
  {
    quote: "This gets the official AI practitioner stamp of approval.",
    body: "Even if you know prompt engineering, context fragmentation across 10 browser tabs kills your momentum. Cognify solves this seamlessly by uniting PDF vector synthesis, ATS career optimization, and low-latency reasoning in one blazing-fast workspace.",
    author: "Elena Rostova",
    role: "PRINCIPAL AI RESEARCHER",
    org: "VECTOR LABS",
    avatarBg: "bg-osmo-lime text-black"
  },
  {
    quote: "The PDF extraction and ATS Studio saved our team hundreds of hours.",
    body: "We parsed dense 100-page regulatory filings in seconds, with exact citations. The resume studio also pinpointed keyword gaps that standard tools completely missed.",
    author: "Marcus Chen",
    role: "HEAD OF ENGINEERING",
    org: "SYNTHESIS TECH",
    avatarBg: "bg-white text-black"
  }
];

export default function MetricsAndQuoteSection() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeTestimonial = testimonials[currentIdx];

  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
        
        {/* Left Side: Dark Circular Radar / Globe Widget */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-72 h-84 sm:w-80 sm:h-96 rounded-4xl bg-[#151515] border border-white/10 p-6 flex flex-col justify-between items-center text-center overflow-hidden group">
            {/* Ambient Radial background */}
            <div className="absolute inset-0 bg-radial from-osmo-lime/10 via-transparent to-transparent opacity-60" />

            {/* Top Label */}
            <div className="relative z-10 pt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-osmo-lime block">
                Connect
              </span>
              <span className="text-sm font-semibold text-white/90">
                Worldwide Inference
              </span>
            </div>

            {/* Center Dial / Globe Graphic with tick marks */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Radial Ticks */}
              <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin-slow" />
              
              {/* Pulsing Core Node */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-osmo-lime/20 border border-osmo-lime/40 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">&lt;45ms</span>
                <span className="text-[9px] text-osmo-lime font-bold uppercase tracking-tight">
                  STREAM LATENCY
                </span>
              </div>
            </div>

            {/* Bottom Handwritten Tag */}
            <div className="relative z-10 pb-4">
              <span className="text-osmo-lime font-caveat text-xl sm:text-2xl">
                Cognify&apos;s Global Node Network
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Electric Purple Testimonial Showcase Card */}
        <div className="lg:col-span-7">
          <div className="bg-osmo-purple text-white rounded-lg p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-95 border border-osmo-purple/50">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-lg bg-white/10 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug font-display mb-6">
                &ldquo;{activeTestimonial.quote}&rdquo;
              </h3>

              <p className="text-sm sm:text-base text-white/85 leading-relaxed font-medium">
                {activeTestimonial.body}
              </p>
            </div>

            <div className="relative z-10 pt-8 mt-8 border-t border-white/20 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${activeTestimonial.avatarBg} flex items-center justify-center font-bold text-base shadow`}>
                  {activeTestimonial.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-display">
                    {activeTestimonial.author}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-black/25 text-osmo-lime tracking-wider">
                      {activeTestimonial.role}
                    </span>
                    <span className="text-xs text-white/60 font-mono">
                      {activeTestimonial.org}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle switch for testimonials */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                      currentIdx === i ? "bg-white scale-125" : "bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
