"use client";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  ChatTeardropDots, 
  FilePdf, 
  BriefcaseMetal, 
  Notebook, 
  PenNibStraight, 
  Sparkle,
  ShieldCheck,
  FileText,
  Cookie,
  ArrowUpRight
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

const menuItems = [
  { 
    label: "AI Chat", 
    href: "/chat", 
    desc: "Streaming reasoning & context engine", 
    icon: <ChatTeardropDots size={22} weight="duotone" /> 
  },
  { 
    label: "Document Analysis", 
    href: "/documents", 
    desc: "Contextual PDF extraction & summaries", 
    icon: <FilePdf size={22} weight="duotone" /> 
  },
  { 
    label: "Resume Studio", 
    href: "/resume", 
    desc: "ATS analysis & section optimization", 
    icon: <BriefcaseMetal size={22} weight="duotone" /> 
  },
  { 
    label: "Notes Generator", 
    href: "/notes", 
    desc: "Rough idea synthesis & recall frameworks", 
    icon: <Notebook size={22} weight="duotone" /> 
  },
  { 
    label: "AI Writing", 
    href: "/writing", 
    desc: "Emails, cover letters & proposals", 
    icon: <PenNibStraight size={22} weight="duotone" /> 
  }
];

const secondaryLinks = [
  { label: "Privacy Policy", href: "/privacy", icon: <ShieldCheck size={16} /> },
  { label: "Terms of Service", href: "/terms", icon: <FileText size={16} /> },
  { label: "Cookie Policy", href: "/cookies", icon: <Cookie size={16} /> }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 350, damping: 26 } 
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } }
};

export default function FloatingMenu({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
        
        if (e.key === "Tab" && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        if (modalRef.current) modalRef.current.focus();
      }, 50);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 flex justify-center items-start pt-24 sm:pt-28 pb-8 px-4 sm:px-6 bg-brand-black/60 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            initial={{ scale: 0.96, y: -16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -12, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-brand-white rounded-[2.5rem] shadow-2xl p-6 sm:p-12 border border-white/80 flex flex-col focus:outline-none relative overflow-hidden"
          >
            {/* Header / Logo + ESC indicator */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-black/10">
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6">
                  <Image
                    src="/Cognify-Logo.png"
                    alt="Cognify Logo"
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-display font-bold tracking-tight text-brand-black pt-0.5">
                  Cognify<span className="text-brand-orange">.</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-black/5 px-2.5 py-1 rounded-md">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white shadow-xs text-brand-black font-semibold border border-black/10">ESC</kbd>
                <span>to close</span>
              </div>
            </div>

            {/* Menu Body */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
            >
              {/* Left Column: Primary Navigation Items */}
              <div className="lg:col-span-7 flex flex-col gap-1.5">
                <motion.span variants={itemVariants} className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkle size={13} className="text-brand-orange" weight="fill" />
                  Workspace Capabilities
                </motion.span>

                {menuItems.map((item, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <Link 
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-black/5 text-brand-black flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors duration-200 shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-display font-bold text-brand-black group-hover:text-brand-orange transition-colors">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 font-sans font-light">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <ArrowRight 
                        size={18} 
                        weight="bold" 
                        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-brand-orange shrink-0"
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Right Column: Mini Workspace Banner & Legal Links */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6 lg:border-l lg:border-black/10 lg:pl-10 pt-2 lg:pt-0">
                {/* Interactive Status Card */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-brand-black text-brand-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-brand-orange text-[10px] font-bold uppercase tracking-wider mb-3">
                      <span>Ready to Deploy</span>
                    </div>
                    <h4 className="text-xl font-display font-bold mb-1">Start in seconds</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Create an account and test our streaming workspace without setup overhead.
                    </p>
                  </div>

                  <Link
                    href="/auth"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-white hover:text-brand-black text-white text-xs font-display font-bold py-2.5 px-4 rounded-xl transition-colors duration-200"
                  >
                    <span>Get Free Access</span>
                    <ArrowUpRight size={14} weight="bold" />
                  </Link>
                </motion.div>

                {/* Secondary Links */}
                <div className="flex flex-col gap-2">
                  <motion.span variants={itemVariants} className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">
                    Platform Legal
                  </motion.span>
                  <div className="flex flex-col gap-1.5">
                    {secondaryLinks.map((item, idx) => (
                      <motion.div key={idx} variants={itemVariants}>
                        <Link 
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-brand-orange transition-colors py-1"
                        >
                          <span className="text-gray-400">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}