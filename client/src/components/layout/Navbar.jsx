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
  ArrowRight,
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
  const [activeItem, setActiveItem] = useState(capabilities[0]);
  const { isAuthenticated, logout, isLoggingOut } = useAuth();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuContainerRef = useRef(null);
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
          
          // Require at least a 10px scroll distance to trigger a state change (prevents jitter)
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

  useGSAP(() => {
    if (!menuGridRef.current) return;
    
    if (isOpen) {
      gsap.fromTo(
        gsap.utils.toArray(menuGridRef.current.querySelectorAll('.menu-animate-item')),
        { y: 30, opacity: 0, scale: 0.98 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.6, 
          stagger: 0.05, 
          ease: "power3.out",
          delay: 0.15 // Wait for container to expand slightly
        }
      );
    }
  }, [isOpen]);

  if (pathname?.startsWith("/chat")) return null;

  const newLocal = "w-5 rotate-45 translate-y-1.5";
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <header 
        className={`fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none font-sans transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible || isOpen ? "translate-y-4 sm:translate-y-6" : "translate-y-[-120%]"
        }`}
      >
        <div
          ref={menuContainerRef}
          className={`pointer-events-auto w-full bg-[#151515] text-white shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] border border-white/10 relative overflow-hidden ${
            isOpen
              ? "max-w-6xl rounded-2xl p-6 sm:p-10"
              : "max-w-3xl rounded-xl px-5 py-3 sm:px-6 sm:py-4 hover:border-white/20"
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
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all"
                  >
                    <SquaresFour size={18} weight="bold" />
                    <TextRoll>Dashboard</TextRoll>
                  </Link>
                  <button
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-all cursor-pointer disabled:opacity-50"
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
                    className="text-sm font-semibold px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all hidden sm:block"
                  >
                    <TextRoll>Login</TextRoll>
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="group text-sm font-semibold px-5 py-2.5 rounded-lg bg-osmo-lime text-black hover:bg-white active:scale-95 transition-all shadow-[0_0_20px_rgba(161,255,98,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                  >
                    <TextRoll>Join</TextRoll>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Drawer Grid */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
              isOpen ? "grid-rows-[1fr] opacity-100 mt-10 pt-8 border-t border-white/10" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden" ref={menuGridRef}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                
                {/* Modules Navigation */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-5 px-2 menu-animate-item">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                        System Capabilities
                      </span>
                      <span className="text-xs font-medium text-white/30">
                        05 Modules
                      </span>
                    </div>

                    <div className="space-y-2">
                      {capabilities.map((item) => {
                        const isHovered = activeItem.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setActiveItem(item)}
                            className="group menu-animate-item"
                          >
                            <Link
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                                isHovered
                                  ? "bg-white/10"
                                  : "bg-transparent hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-5">
                                <span className="text-sm font-medium text-white/30 font-mono">
                                  {item.number}
                                </span>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-semibold tracking-tight text-white">
                                      {item.label}
                                    </h3>
                                    {item.badge && (
                                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-osmo-purple text-white tracking-widest">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-white/50 block mt-1">
                                    {item.category}
                                  </span>
                                </div>
                              </div>

                              <span className={`text-osmo-lime transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isHovered ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}>
                                <ArrowRight size={24} weight="bold" />
                              </span>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resource Links */}
                  <div className="pt-6 border-t border-white/10 menu-animate-item">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-medium">
                      {resourceLinks.map((res, idx) => (
                        <Link
                          key={idx}
                          href={res.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 text-white/60 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                        >
                          <span className="text-white/40">{res.icon}</span>
                          <span><TextRoll>{res.label}</TextRoll></span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-5 menu-animate-item">
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden h-full min-h-75 group/card hover:border-white/10 transition-colors duration-500">
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="inline-block px-3 py-1 rounded bg-white/5 text-[11px] font-bold uppercase tracking-widest text-white/80">
                          {activeItem.preview.tag}
                        </span>

                        <span className="text-lg font-medium text-osmo-lime font-caveat">
                          {activeItem.preview.note}
                        </span>
                      </div>

                      <h4 className="text-3xl font-semibold tracking-tight text-white mb-4 leading-tight">
                        {activeItem.preview.title}
                      </h4>
                      <p className="text-base text-white/50 leading-relaxed">
                        {activeItem.preview.description}
                      </p>
                    </div>

                    <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm font-semibold text-white/60 font-mono tracking-tight">
                        <span className="w-2 h-2 rounded-full bg-osmo-lime animate-pulse" />
                        <span>{activeItem.preview.stat}</span>
                      </div>

                      <Link
                        href={activeItem.href}
                        onClick={() => setIsOpen(false)}
                        className="group/btn inline-flex items-center gap-2 bg-white hover:bg-osmo-lime text-black text-sm font-bold py-3 px-6 rounded-xl transition-colors duration-300 active:scale-95"
                      >
                        <TextRoll>Discover</TextRoll>
                        <ArrowUpRight size={16} weight="bold" className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-2 text-sm text-white/40 menu-animate-item">
                    <span className="font-medium font-mono">Cognify AI Workspace</span>
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