"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowUp,
  Sparkle,
  ShieldCheck,
  Globe,
  PaperPlaneRight
} from "@phosphor-icons/react";
import TextRoll from "../ui/TextRoll";

const footerLinks = {
  modules: [
    { label: "AI Chat Engine", href: "/chat" },
    { label: "Document Analysis (PDF)", href: "/documents" },
    { label: "Resume Studio & ATS", href: "/resume" },
    { label: "AI Writing & Letters", href: "/writing" },
    { label: "Notes Enhancer", href: "/notes" }
  ],
  product: [
    { label: "The Platform", href: "/#platform" },
    { label: "Core Capabilities", href: "/#toolkit" },
    { label: "Pricing & Plans", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "System Status", href: "/status" }
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api-docs" },
    { label: "Security & Privacy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" }
  ],
  company: [
    { label: "About Cognify", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Twitter / X", href: "https://twitter.com" },
    { label: "GitHub", href: "https://github.com" }
  ]
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full bg-[#151515] text-white pt-16 sm:pt-24 pb-12 overflow-hidden border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid: Brand & Newsletter + Link Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/Cognify-Logo.png"
                  alt="Cognify Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white font-display">
                COGNIFY<span className="text-osmo-lime">.</span>
              </span>
            </div>

            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              The unified AI productivity suite engineered for deep cognitive flow. Understand documents, optimize resumes, and craft executive writing in one canvas.
            </p>

            {/* Live System Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-osmo-lime animate-pulse" />
              <span className="text-white/80">All Systems Operational</span>
              <span className="text-white/30">•</span>
              <span className="text-osmo-lime">Mistral AI Online</span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            
            {/* Modules */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">
                Modules
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.modules.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-osmo-lime transition-colors block py-0.5"
                    >
                      <TextRoll>{link.label}</TextRoll>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">
                Product
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.product.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-osmo-lime transition-colors block py-0.5"
                    >
                      <TextRoll>{link.label}</TextRoll>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.resources.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-osmo-lime transition-colors block py-0.5"
                    >
                      <TextRoll>{link.label}</TextRoll>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">
                Company
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-osmo-lime transition-colors block py-0.5"
                    >
                      <TextRoll>{link.label}</TextRoll>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div className="flex items-center gap-4 flex-wrap">
            <span>© 2026 Cognify AI Inc. All rights reserved.</span>
            <span>•</span>
            <span className="text-white/30">Crafted with Next.js &amp; Mistral AI</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-white hover:text-osmo-lime transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-white/5"
          >
            <span>BACK TO TOP</span>
            <ArrowUp size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Massive Running Watermark Marquee */}
      <div className="relative mt-12 pt-4 border-t border-white/5 overflow-hidden select-none pointer-events-none opacity-20">
        <div className="whitespace-nowrap flex items-center gap-8 font-black uppercase text-6xl sm:text-8xl lg:text-[140px] tracking-tighter text-white font-display">
          <span>COGNIFY</span>
          <span className="text-osmo-lime">✻</span>
          <span>AI WORKSPACE</span>
          <span className="text-osmo-purple">✻</span>
          <span>DEEP FLOW</span>
          <span className="text-osmo-lime">✻</span>
          <span>COGNIFY</span>
          <span className="text-osmo-lime">✻</span>
          <span>AI WORKSPACE</span>
        </div>
      </div>
    </footer>
  );
}
