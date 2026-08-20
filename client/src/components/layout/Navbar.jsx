"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import TextRoll from "../ui/TextRoll";
import { 
  ArrowUpRight, 
  ChatTeardropDots, 
  FilePdf, 
  BriefcaseMetal, 
  Graph,
  CreditCard,
  UsersThree,
  SignOut,
  SquaresFour,
  PenNib
} from "@phosphor-icons/react";
import { useAuth } from "../../features/auth/hooks/useAuth";

const capabilities = [
  {
    id: "chat",
    number: "01",
    label: "AI Chat",
    category: "Reasoning Engine",
    badge: "FAST",
    href: "/chat",
    icon: <ChatTeardropDots size={24} weight="bold" />,
    preview: {
      tag: "CORE CAPABILITY",
      title: "Streaming Context & Multimodal Reasoning",
      description: "Low-latency inference engine with Markdown and code rendering.",
      stat: "Streaming Responses",
      note: "Conversational AI"
    }
  },
  {
    id: "documents",
    number: "02",
    label: "Document Analysis",
    category: "PDF Synthesis",
    badge: null,
    href: "/documents",
    icon: <FilePdf size={24} weight="bold" />,
    preview: {
      tag: "EXTRACTION ENGINE",
      title: "Deep PDF Extraction & Q&A",
      description: "Upload dense research papers, technical specs, and get instant summaries and Q&A.",
      stat: "Vector Context Retrieval",
      note: "Instant parsing"
    }
  },
  {
    id: "resume",
    number: "03",
    label: "Resume Studio",
    category: "Career Optimizer",
    badge: "NEW",
    href: "/resume",
    icon: <BriefcaseMetal size={24} weight="bold" />,
    preview: {
      tag: "ATS INTELLIGENCE",
      title: "Algorithmic Resume & ATS Optimization",
      description: "Target job descriptions, parse keyword gaps, and generate executive summaries.",
      stat: "Detailed ATS Analysis",
      note: "Tuned for recruiters"
    }
  },
  {
    id: "writing",
    number: "04",
    label: "AI Writing",
    category: "Content Generation",
    badge: null,
    href: "/writing",
    icon: <PenNib size={24} weight="bold" />,
    preview: {
      tag: "CREATION ENGINE",
      title: "Professional Email & Cover Letter Writer",
      description: "Generate tailored cover letters based on your resume and write professional emails.",
      stat: "Custom Tone Control",
      note: "Professional writing"
    }
  },
  {
    id: "notes",
    number: "05",
    label: "Notes Enhancer",
    category: "Idea Structuring",
    badge: null,
    href: "/notes",
    icon: <Graph size={24} weight="bold" />,
    preview: {
      tag: "WORKSPACE RECALL",
      title: "Structured Idea Mapping & Auto-Synthesis",
      description: "Convert rough thoughts and meeting notes into organized blueprints and clear learning resources.",
      stat: "Semantic Linking",
      note: "Zero cognitive load"
    }
  }
];

const resourceLinks = [
  { label: "About Us", href: "/about", icon: <UsersThree size={20} /> },
  { label: "Pricing", href: "/pricing", icon: <CreditCard size={20} /> }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, isLoggingOut } = useAuth();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuGridRef = useRef(null);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) return;
      
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 10 && currentScrollY > 150) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY.current && lastScrollY.current - currentScrollY > 10 || currentScrollY < 50) {
            setIsVisible(true);
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Synchronized GSAP Entry and Exit Timeline
  useGSAP(() => {
    if (!menuGridRef.current) return;
    const items = gsap.utils.toArray(menuGridRef.current.querySelectorAll(".menu-animate-item"));

    gsap.killTweensOf(items);

    if (isOpen) {
      gsap.fromTo(
        items,
        { y: 20, opacity: 0, scale: 0.98 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.45, 
          stagger: 0.04, 
          ease: "power2.out",
          delay: 0.12, // Waits for container expansion to begin, eliminating clip lag
          clearProps: "transform,opacity"
        }
      );
    } else {
      gsap.to(items, {
        y: -10,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        stagger: 0.02
      });
    }
  }, [isOpen]);

  if (pathname?.startsWith("/chat") || pathname?.startsWith("/dashboard")) return null;

  const newLocal = "w-5 rotate-45 translate-y-1.5";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-osmo-dark/95 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <header 
        className={`fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none font-sans transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible || isOpen ? "translate-y-4 sm:translate-y-6" : "translate-y-[-120%]"
        }`}
      >
        <div
          data-lenis-prevent={isOpen ? "" : undefined}
          className={`pointer-events-auto w-full bg-osmo-dark text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-white/10 relative overflow-hidden shadow-2xl ${
            isOpen
              ? "max-w-4xl rounded-none p-6 sm:p-8 max-h-[88vh] overflow-y-auto"
              : "max-w-3xl rounded-none px-5 py-3 sm:px-6 sm:py-4 hover:border-white/20"
          }`}
        >
          {/* Main Bar */}
          <div className="flex items-center justify-between gap-4 relative z-20">
            
            {/* Menu Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group flex items-center gap-3 text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none"
              aria-expanded={isOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between items-start py-0.5">
                <span
                  className={`h-0.5 bg-white block transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] origin-center ${
                    isOpen ? newLocal : "w-5 group-hover:w-4"
                  }`}
                />
                <span
                  className={`h-0.5 bg-white block transition-all duration-300 ${
                    isOpen ? "opacity-0 scale-x-0" : "w-3 opacity-100 scale-x-100 group-hover:w-5"
                  }`}
                />
                <span
                  className={`h-0.5 bg-white block transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] origin-center ${
                    isOpen ? "w-5 -rotate-45 -translate-y-1.5" : "w-4 group-hover:w-3"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold tracking-wide uppercase">
                <TextRoll>{isOpen ? "Close" : "Menu"}</TextRoll>
              </span>
            </button>

            {/* Brand Logo */}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-center p-1 transition-all duration-300 active:scale-95 gap-3"
            >
              <div className="relative w-7 h-7 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-12 group-hover:scale-110">
                <Image
                  src="/Cognify-Logo.png"
                  alt="Cognify Logo"
                  fill
                  sizes="28px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white">
                COGNIFY<span className="text-osmo-lime">.</span>
              </span>
            </Link>

            {/* User/Auth Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-none bg-white/5 text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/10"
                  >
                    <SquaresFour size={18} weight="bold" />
                    <TextRoll>Dashboard</TextRoll>
                  </Link>
                  <button
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="p-2.5 rounded-none bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-all cursor-pointer disabled:opacity-50 border border-white/5"
                    title="Sign Out"
                  >
                    <SignOut size={18} weight="bold" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-semibold px-4 py-2.5 rounded-none text-white/80 hover:text-white hover:bg-white/5 transition-all hidden sm:block"
                  >
                    <TextRoll>Login</TextRoll>
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="group text-sm font-semibold px-5 py-2.5 rounded-none bg-osmo-lime text-black hover:bg-white active:scale-95 transition-all shadow-[0_0_15px_rgba(202,254,72,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    <TextRoll>Join</TextRoll>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Drawer Grid */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen ? "grid-rows-[1fr] opacity-100 mt-8 pt-6 border-t border-white/10" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden" ref={menuGridRef}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 px-1 menu-animate-item will-change-transform">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                    System Capabilities
                  </span>
                  <span className="text-xl font-medium text-white/60 font-caveat">
                    05 Modules
                  </span>
                </div>

                {/* Capabilities Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                  {capabilities.map((item, idx) => {
                    const colors = [
                      { 
                        text: "group-hover:text-osmo-lime", 
                        bg: "bg-osmo-lime text-black", 
                        border: "hover:border-osmo-lime/40",
                        glow: "group-hover:bg-osmo-lime/10" 
                      },
                      { 
                        text: "group-hover:text-osmo-purple", 
                        bg: "bg-osmo-purple text-white", 
                        border: "hover:border-osmo-purple/40",
                        glow: "group-hover:bg-osmo-purple/10" 
                      },
                      { 
                        text: "group-hover:text-[#ffbd2e]", 
                        bg: "bg-[#ffbd2e] text-black", 
                        border: "hover:border-[#ffbd2e]/40",
                        glow: "group-hover:bg-[#ffbd2e]/10" 
                      },
                      { 
                        text: "group-hover:text-[#ff5f56]", 
                        bg: "bg-[#ff5f56] text-white", 
                        border: "hover:border-[#ff5f56]/40",
                        glow: "group-hover:bg-[#ff5f56]/10" 
                      },
                      { 
                        text: "group-hover:text-[#27c93f]", 
                        bg: "bg-[#27c93f] text-black", 
                        border: "hover:border-[#27c93f]/40",
                        glow: "group-hover:bg-[#27c93f]/10" 
                      },
                    ];
                    const color = colors[idx % colors.length];

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group menu-animate-item relative flex flex-col justify-between p-5 rounded-none bg-white/2 border border-white/8 hover:bg-white/5 transition-all duration-300 ease-out hover:-translate-y-1 min-h-40 overflow-hidden will-change-transform ${color.border}`}
                      >
                        {/* Ambient Card Corner Glow */}
                        <div 
                          className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none ${color.glow}`} 
                        />

                        {/* Card Top Row */}
                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className={`text-white/60 transition-all duration-300 transform group-hover:scale-110 ${color.text}`}>
                            {item.icon}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-none tracking-widest shadow-sm ${color.bg}`}>
                                {item.badge}
                              </span>
                            )}
                            <ArrowUpRight 
                              size={16} 
                              className="text-white/30 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" 
                            />
                          </div>
                        </div>
                        
                        {/* Card Body */}
                        <div className="relative z-10">
                          <h3 className="text-sm font-bold tracking-tight text-white mb-1 transition-colors group-hover:text-white">
                            {item.label}
                          </h3>
                          <span className={`text-base font-bold block mb-0.5 font-caveat transition-colors ${color.text}`}>
                            {item.category}
                          </span>
                          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed transition-colors group-hover:text-white/70">
                            {item.preview.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Resource Links & Footer */}
                <div className="pt-4 border-t border-white/10 menu-animate-item will-change-transform mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium flex-wrap">
                    {resourceLinks.map((res, idx) => (
                      <Link
                        key={idx}
                        href={res.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-all py-1.5 px-3 rounded-none hover:bg-white/5 border border-transparent hover:border-white/10 active:scale-95"
                      >
                        <span className="text-white/40 group-hover:text-white transition-colors">{res.icon}</span>
                        <span><TextRoll>{res.label}</TextRoll></span>
                      </Link>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-white/30 px-3 tracking-wider uppercase">
                    Cognify AI Workspace
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}