"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowUp, Sparkle, GlobeHemisphereWest } from "@phosphor-icons/react";

const mainNavigation = [
  { label: "AI Chat", href: "/chat", desc: "Streaming reasoning" },
  { label: "Document Analysis", href: "/documents", desc: "PDF synthesis" },
  { label: "Resume Studio", href: "/resume", desc: "ATS checker" },
  { label: "Notes Generator", href: "/notes", desc: "Concept learning" },
  { label: "AI Writing", href: "/writing", desc: "Comms & proposals" }
];

const secondaryLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Security & Trust", href: "/security" },
  { label: "Changelog", href: "/changelog" }
];

export default function Footer() {
  const [activeDot, setActiveDot] = useState(4);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-brand-black text-brand-white rounded-t-[3rem] pt-24 pb-12 px-6 md:px-16 mt-20 mx-2 overflow-hidden border-t border-white/10 shadow-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute right-0 bottom-0 w-125 h-87.5 bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto flex flex-col gap-20 relative z-10">
        
        {/* Top Tier: Action & Status Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-300">All systems operational</span>
          </div>

          <div className="flex items-center gap-6 self-end md:self-auto">
            {/* Interactive 3x3 Dot Grid Matrix */}
            <div 
              className="grid grid-cols-3 gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5 cursor-pointer"
              onMouseLeave={() => setActiveDot(4)}
            >
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  onMouseEnter={() => setActiveDot(i)}
                  animate={{
                    scale: activeDot === i ? 1.4 : 1,
                    backgroundColor: activeDot === i ? "#FF6B02" : "rgba(255, 255, 255, 0.2)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-2.5 h-2.5 rounded-full"
                />
              ))}
            </div>

            {/* Scroll-To-Top Button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, rotate: -45 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Scroll to top"
              className="w-12 h-12 rounded-full bg-brand-white text-brand-black flex items-center justify-center cursor-pointer transition-colors shadow-lg hover:bg-brand-orange hover:text-white"
            >
              <ArrowUp size={20} weight="bold" />
            </motion.button>
          </div>
        </div>

        {/* Middle Tier: Main Content Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Product Links */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkle size={14} className="text-brand-orange" weight="fill" />
              Workspace Modules
            </span>
            
            <div className="flex flex-col">
              {mainNavigation.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="group py-3 flex items-center justify-between border-b border-white/5 transition-all duration-300 hover:border-brand-orange/40 hover:pl-2"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-gray-300 group-hover:text-brand-white transition-colors">
                      {link.label}
                    </span>
                    <span className="text-xs text-gray-500 font-mono hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                       {link.desc}
                    </span>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:bg-brand-orange text-white transition-all duration-300">
                    <ArrowUpRight size={20} weight="bold" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Platform Resources & Brand Callout */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-12 lg:pl-12 lg:border-l lg:border-white/10">
            
            {/* Resource Links */}
            <div className="flex flex-col gap-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Platform & Trust
              </span>
              <div className="grid grid-cols-2 gap-3">
                {secondaryLinks.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="text-sm font-medium text-gray-400 hover:text-brand-orange transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brand Statement */}
            <div className="flex flex-col gap-3 pt-6">
              <h2 className="text-5xl sm:text-7xl font-display font-bold tracking-tighter text-white">
                Cognify<span className="text-brand-orange">.</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                The unified AI environment designed to turn fragmented reasoning into continuous output.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom Tier: Copyright & Meta */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <GlobeHemisphereWest size={16} />
            <span>Encrypted & logically isolated user context</span>
          </div>

          <div className="flex items-center gap-6">
            <p>© {new Date().getFullYear()} Cognify AI. All rights reserved.</p>
            <span>•</span>
            <p className="text-gray-300">Built with purpose.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}