"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, X, Sparkle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import FloatingMenu from "./FloatingMenu";
import AnimatedButton from "../ui/AnimatedButton";

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = Math.round((totalScroll / (windowHeight || 1)) * 100);
      setScrollProgress(isNaN(scroll) ? 0 : Math.min(Math.max(scroll, 0), 100));
      setIsScrolled(totalScroll > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 items-center">
          
          {/* Left: Brand Identity */}
          <div className="flex justify-start pointer-events-auto">
            <Link 
              href="/" 
              className="group flex items-center gap-2.5 bg-white/70 hover:bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-black/5 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/Cognify-Logo.png"
                  alt="Cognify Logo"
                  fill
                  sizes="24px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-brand-black pt-0.5">
                Cognify<span className="text-brand-orange transition-colors">.</span>
              </span>
            </Link>
          </div>

          {/* Center: Command Pill (Floating Control) */}
          <div className="hidden md:flex justify-center pointer-events-auto">
            <motion.div 
              animate={{ 
                scale: isScrolled ? 0.98 : 1,
                boxShadow: isScrolled 
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)" 
                  : "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 bg-brand-black/90 hover:bg-brand-black backdrop-blur-xl text-brand-white pl-4 pr-3 py-2 rounded-full border border-white/15 transition-colors"
            >
              {/* Menu Toggle Trigger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="relative flex items-center justify-center gap-2 hover:text-brand-orange transition-colors text-sm font-medium cursor-pointer w-16 h-6 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/60 rounded-full"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                      className="flex items-center gap-1.5 absolute"
                    >
                      <X size={16} weight="bold" />
                      <span className="text-xs">Close</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                      className="flex items-center gap-1.5 absolute"
                    >
                      <List size={16} weight="bold" />
                      <span className="text-xs">Menu</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <div className="w-px h-4 bg-white/20" />

              {/* Progress Dial indicator */}
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-tight">
                <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/20"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-brand-orange transition-all duration-150 ease-out"
                      strokeDasharray={`${scrollProgress}, 100`}
                      strokeWidth="5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <span>{scrollProgress}%</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Quick Action CTA */}
          <div className="flex justify-end items-center gap-2 pointer-events-auto">
            {/* Mobile Menu trigger fallback */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden bg-brand-black text-white p-2.5 rounded-xl flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>

            <AnimatedButton
              href="/auth"
              variant="secondary"
              className="hidden sm:inline-flex px-5! py-2.5! text-xs font-semibold tracking-wide uppercase shadow-sm"
            >
              Launch Studio
            </AnimatedButton>
          </div>

        </div>
      </header>

      {/* Floating Menu Drawer */}
      <FloatingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}