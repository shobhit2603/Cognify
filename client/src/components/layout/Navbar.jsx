"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowUpRight, 
  ArrowRight,
  Sparkle, 
  ChatTeardropDots, 
  FilePdf, 
  BriefcaseMetal, 
  Graph,
  CodeBlock,
  Books,
  CreditCard,
  UsersThree,
  LinkedinLogo, 
  XLogo, 
  GithubLogo,
  DiscordLogo,
  SignOut,
  SquaresFour,
  Lightning,
  ShieldCheck
} from "@phosphor-icons/react";
import { useAuth } from "../../features/auth/hooks/useAuth";

// Primary Navigation Data with dynamic interactive previews
const capabilities = [
  {
    id: "chat",
    number: "01",
    label: "AI Neural Chat",
    category: "Reasoning Engine",
    badge: "FAST",
    href: "/chat",
    icon: <ChatTeardropDots size={24} weight="duotone" />,
    preview: {
      tag: "CORE CAPABILITY",
      title: "Streaming Context & Multimodal Reasoning",
      description: "Low-latency inference engine with branching memory trees, code generation, and live canvas support.",
      stat: "240ms Latency",
      note: "Supercharged reasoning",
      accent: "#a1ff62"
    }
  },
  {
    id: "documents",
    number: "02",
    label: "Document Synthesis",
    category: "Knowledge Graph",
    badge: null,
    href: "/documents",
    icon: <FilePdf size={24} weight="duotone" />,
    preview: {
      tag: "EXTRACTION ENGINE",
      title: "Vector Document & Deep PDF Extraction",
      description: "Upload dense research papers, technical specs, or contracts. Extract citations and structured data instantly.",
      stat: "50MB PDF Limit",
      note: "Instant OCR parsing",
      accent: "#6840ff"
    }
  },
  {
    id: "resume",
    number: "03",
    label: "Resume Studio",
    category: "Career Optimizer",
    badge: "NEW",
    href: "/resume",
    icon: <BriefcaseMetal size={24} weight="duotone" />,
    preview: {
      tag: "ATS INTELLIGENCE",
      title: "Algorithmic Resume & ATS Optimization",
      description: "Target job descriptions, parse keyword gaps, and generate executive summaries calibrated for recruiters.",
      stat: "98% ATS Match",
      note: "Tuned for recruiters",
      accent: "#a1ff62"
    }
  },
  {
    id: "notes",
    number: "04",
    label: "Idea Synthesis Graph",
    category: "Memory & Recall",
    badge: null,
    href: "/notes",
    icon: <Graph size={24} weight="duotone" />,
    preview: {
      tag: "WORKSPACE RECALL",
      title: "Structured Idea Mapping & Auto-Synthesis",
      description: "Convert rough thoughts and meeting notes into organized blueprints, actionable tasks, and mental graphs.",
      stat: "Semantic Linking",
      note: "Zero cognitive load",
      accent: "#6840ff"
    }
  }
];

const resourceLinks = [
  { label: "API Reference", href: "/docs", icon: <CodeBlock size={18} /> },
  { label: "Design & Easing Guide", href: "/resources", icon: <Books size={18} /> },
  { label: "Pricing & Plans", href: "/pricing", icon: <CreditCard size={18} /> },
  { label: "Community Hub", href: "/community", icon: <UsersThree size={18} /> }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(capabilities[0]);
  const { isAuthenticated, user, logout, isLoggingOut } = useAuth();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuContainerRef = useRef(null);

  // Close menu on route changes
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname?.startsWith("/chat")) return null;

  return (
    <>
      {/* Background Dimmer Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-osmo-dark/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none">
        <div
          ref={menuContainerRef}
          className={`pointer-events-auto w-full bg-osmo-dark text-osmo-bg border border-white/10 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen
              ? "max-w-6xl rounded-2xl p-6 sm:p-10 ring-1 ring-white/10"
              : "max-w-2xl rounded-xl px-4 py-3 sm:px-6 sm:py-3.5"
          }`}
        >
          {/* Top Bar Navigation Island */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Menu Trigger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group flex items-center gap-3 text-osmo-bg hover:text-osmo-lime transition-colors cursor-pointer py-1 px-2 focus:outline-none"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center py-0.5">
                <span
                  className={`w-5 h-[1.5px] bg-current block transform transition-all duration-300 origin-center ${
                    isOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`w-5 h-[1.5px] bg-current block transition-all duration-200 ${
                    isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                  }`}
                />
                <span
                  className={`w-5 h-[1.5px] bg-current block transform transition-all duration-300 origin-center ${
                    isOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                />
              </div>
              <span className="text-xs sm:text-sm font-display font-medium uppercase tracking-widest text-osmo-bg/80 group-hover:text-white">
                {isOpen ? "Close" : "Menu"}
              </span>
            </button>

            {/* Center: Brand Identity */}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="relative w-6 h-6 shrink-0 transition-transform duration-700 ease-out group-hover:rotate-180">
                <Image
                  src="/Cognify-Logo.png"
                  alt="Cognify Logo"
                  fill
                  sizes="24px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg sm:text-xl font-display font-medium tracking-tight text-osmo-bg group-hover:text-white transition-colors">
                COGNIFY
              </span>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-xs font-display font-medium px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-osmo-bg transition-all"
                  >
                    <SquaresFour size={15} weight="bold" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-osmo-bg/80 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    title="Sign Out"
                  >
                    <SignOut size={16} weight="bold" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="hidden sm:inline-block text-xs font-display uppercase tracking-wider px-4 py-2 rounded-lg text-osmo-bg/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-display font-medium uppercase tracking-wider px-4 py-2 rounded-lg bg-osmo-lime text-osmo-dark hover:bg-[#b5ff85] active:scale-95 transition-all shadow-sm"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Smooth Expanding Grid Drawer */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen ? "grid-rows-[1fr] opacity-100 mt-8 pt-8 border-t border-white/10" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Left Section: Interactive Primary Navigation (7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                      <span className="text-[11px] font-mono tracking-widest uppercase text-osmo-bg/40 flex items-center gap-2">
                        <Sparkle size={13} weight="fill" className="text-osmo-lime" />
                        SYSTEM CAPABILITIES
                      </span>
                      <span className="text-[11px] font-mono text-osmo-bg/30">
                        [04 MODULES]
                      </span>
                    </div>

                    {/* Interactive Capabilities List */}
                    <div className="space-y-3">
                      {capabilities.map((item) => {
                        const isHovered = activeItem.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setActiveItem(item)}
                            className="group"
                          >
                            <Link
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                                isHovered
                                  ? "bg-white/10 border-white/20 translate-x-1"
                                  : "bg-transparent border-transparent hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-4 sm:gap-6">
                                <span className="font-mono text-xs text-osmo-bg/30">
                                  {item.number}
                                </span>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-2xl sm:text-3xl font-display font-light tracking-tight text-osmo-bg group-hover:text-white">
                                      {item.label}
                                    </h3>
                                    {item.badge && (
                                      <span className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-osmo-purple text-white">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-osmo-bg/40 font-light block mt-0.5">
                                    {item.category}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`text-osmo-lime transition-transform duration-300 ${isHovered ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}>
                                  <ArrowRight size={20} weight="bold" />
                                </span>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secondary Resources & Docs */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-display">
                      {resourceLinks.map((res, idx) => (
                        <Link
                          key={idx}
                          href={res.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 text-osmo-bg/60 hover:text-osmo-lime transition-colors py-1"
                        >
                          <span className="text-osmo-bg/40">{res.icon}</span>
                          <span>{res.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section: Dynamic Live Spotlight & Card (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                  
                  {/* Dynamic Interactive Card */}
                  <div className="bg-osmo-dark-surface rounded-2xl p-7 border border-white/10 flex flex-col justify-between relative overflow-hidden h-full min-h-75">
                    
                    {/* Glowing Ambient Gradient */}
                    <div 
                      className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
                      style={{ backgroundColor: activeItem.preview.accent }}
                    />

                    {/* Top Metadata */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-osmo-dark text-[10px] font-mono tracking-widest uppercase text-osmo-bg/80 border border-white/5">
                          <Lightning size={12} weight="fill" className="text-osmo-lime" />
                          {activeItem.preview.tag}
                        </span>

                        <span className="font-caveat text-xl text-osmo-lime -rotate-2">
                          {activeItem.preview.note}
                        </span>
                      </div>

                      <h4 className="text-2xl sm:text-3xl font-display font-light tracking-tight text-osmo-bg mb-3 leading-tight">
                        {activeItem.preview.title}
                      </h4>
                      <p className="text-sm text-osmo-bg/60 font-light leading-relaxed mb-6">
                        {activeItem.preview.description}
                      </p>
                    </div>

                    {/* Bottom Specs & Action */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-osmo-bg/50">
                        <span className="w-2 h-2 rounded-full bg-osmo-lime animate-pulse" />
                        <span>{activeItem.preview.stat}</span>
                      </div>

                      <Link
                        href={activeItem.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-2 bg-osmo-bg hover:bg-osmo-lime text-osmo-dark text-xs font-display font-medium py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
                      >
                        <span>Launch Module</span>
                        <ArrowUpRight size={14} weight="bold" />
                      </Link>
                    </div>
                  </div>

                  {/* Social Channels & Status */}
                  <div className="flex items-center justify-between px-2 text-xs text-osmo-bg/40 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime" />
                      <span>COGNIFY OS v2.4</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-all text-osmo-bg/80"
                        aria-label="GitHub"
                      >
                        <GithubLogo size={16} />
                      </a>
                      <a
                        href="https://discord.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-all text-osmo-bg/80"
                        aria-label="Discord"
                      >
                        <DiscordLogo size={16} />
                      </a>
                      <a
                        href="https://x.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-all text-osmo-bg/80"
                        aria-label="X"
                      >
                        <XLogo size={16} />
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-all text-osmo-bg/80"
                        aria-label="LinkedIn"
                      >
                        <LinkedinLogo size={16} />
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}