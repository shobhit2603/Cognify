"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowUp } from "@phosphor-icons/react";
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
    <footer className="w-full bg-osmo-dark text-white mt-10 font-sans border-t border-white/10">
      <div className="max-w-8xl mx-auto flex flex-col">
        
        {/* Massive CTA Section */}
        <div className="py-12 sm:py-16 px-6 lg:px-10 border-b border-white/10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black uppercase tracking-tighter text-white leading-[0.9]">
              Free to start.<br/>
              <span className="text-osmo-lime">Scale later.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/50 max-w-md leading-relaxed font-medium">
              Cognify is completely free for individual power-users. Pay only for intensive usage and extended context limits.
            </p>
          </div>
          
          <Link 
            href="/auth" 
            className="group flex items-center justify-between gap-4 bg-white text-osmo-dark font-display font-bold uppercase tracking-widest py-4 px-6 sm:px-8 hover:bg-osmo-lime transition-all duration-300 w-full sm:w-auto"
          >
            <span>Launch Workspace</span>
            <ArrowUpRight size={20} weight="bold" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Links Grid with strict borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-white/10">
          
          {/* Modules Col */}
          <div className="p-6 border-b sm:border-b-0 sm:border-r border-white/10 space-y-6 flex flex-col">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/30">Modules</h4>
            <ul className="space-y-3 flex-1">
              {footerLinks.modules.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/70 hover:text-osmo-lime transition-colors font-medium text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-osmo-lime transition-colors block"></span>
                    <TextRoll>{link.label}</TextRoll>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Col */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/10 space-y-6 flex flex-col">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/30">Product</h4>
            <ul className="space-y-3 flex-1">
              {footerLinks.product.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/70 hover:text-osmo-lime transition-colors font-medium text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-osmo-lime transition-colors block"></span>
                    <TextRoll>{link.label}</TextRoll>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Col */}
          <div className="p-6 border-b sm:border-b-0 sm:border-r border-white/10 space-y-6 flex flex-col">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/30">Resources</h4>
            <ul className="space-y-3 flex-1">
              {footerLinks.resources.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/70 hover:text-osmo-lime transition-colors font-medium text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-osmo-lime transition-colors block"></span>
                    <TextRoll>{link.label}</TextRoll>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Col */}
          <div className="p-6 space-y-6 flex flex-col">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white/30">Company</h4>
            <ul className="space-y-3 flex-1">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/70 hover:text-osmo-lime transition-colors font-medium text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-osmo-lime transition-colors block"></span>
                    <TextRoll>{link.label}</TextRoll>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="p-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 relative">
              <Image src="/Cognify-Logo.png" alt="Cognify Logo" fill className="object-contain" />
            </div>
            <span className="font-display font-bold text-xl tracking-tighter text-white">
              COGNIFY<span className="text-osmo-lime">.</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-mono text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-osmo-lime animate-pulse block"></span>
              <span>Systems Online</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Crafted with Next.js</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-white hover:text-osmo-lime transition-colors font-mono text-xs uppercase tracking-widest group"
          >
            <span>Back to top</span>
            <ArrowUp size={16} weight="bold" className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {/* Simple Branding Bottom */}
        <div className="relative py-2 flex justify-center items-center bg-osmo-dark-surface select-none group overflow-hidden">
          <div className="font-display font-black uppercase text-7xl sm:text-9xl tracking-tighter text-white/5 transition-all duration-500 group-hover:text-osmo-lime group-hover:scale-105 cursor-default">
            COGNIFY<span className="text-osmo-lime/20 group-hover:text-white transition-colors duration-500">.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
