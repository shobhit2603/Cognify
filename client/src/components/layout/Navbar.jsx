"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, Sun, Moon, ArrowRight, Sparkle, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import FloatingMenu from "./FloatingMenu";
import AnimatedButton from "../ui/AnimatedButton";

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = `${Math.round((totalScroll / windowHeight) * 100)}`;
      setScrollProgress(isNaN(scroll) ? 0 : scroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 grid grid-cols-3 items-center pointer-events-none">
        {/* Left Side: Logo and Brand Name */}
        <div className="flex justify-start pointer-events-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Cognify-Logo.png"
              alt="Cognify Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-2xl font-display font-bold tracking-tight text-brand-black pt-1">
              Cognify<span className="text-brand-orange">.</span>
            </span>
          </Link>
        </div>

        {/* Center Pill */}
        <div className="flex justify-center pointer-events-auto">
          <div className="flex items-center gap-4 bg-brand-black/90 backdrop-blur-md text-brand-white px-5 py-3 rounded-full border border-white/10 shadow-lg">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative flex items-center justify-center gap-2 hover:text-brand-orange transition-colors text-sm cursor-pointer w-18 h-6 overflow-hidden"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-1.5 absolute"
                  >
                    <X size={18} weight="bold" />
                    <span className="font-medium">Close</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-1.5 absolute"
                  >
                    <List size={18} weight="bold" />
                    <span className="font-medium">Menu</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>



            <div className="bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {scrollProgress}%
            </div>
          </div>
        </div>

        {/* Right Action */}
        <div className="flex justify-end pointer-events-auto">
          <AnimatedButton
            href="/auth"
            variant="secondary"
            className="px-5! py-2.5! text-sm!"
          >
            Get started
          </AnimatedButton>
        </div>
      </nav>

      {/* Floating Menu Overlay */}
      <FloatingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
