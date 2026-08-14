"use client";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

const menuItems = [
  { label: "AI Chat", href: "/chat" },
  { label: "Document Analysis", href: "/documents" },
  { label: "Resume Studio", href: "/resume" },
  { label: "Notes Generator", href: "/notes" },
  { label: "AI Writing", href: "/writing" }
];

const otherItems = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" }
];

const socialItems = [
  { label: "Twitter / X", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
};

export default function FloatingMenu({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-40 flex justify-center items-start pt-28 pb-6 px-6 bg-brand-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0, transformOrigin: "top center" }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-brand-white rounded-[2.5rem] shadow-2xl p-10 md:p-14 overflow-y-auto max-h-full border border-white/50 flex flex-col"
          >
            {/* Logo inside Menu */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-10 pb-6 border-b border-gray-200/60"
            >
              <Image
                src="/Cognify-Logo.png"
                alt="Cognify Logo"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="text-lg font-display font-bold tracking-tight text-brand-black pt-1">
                Cognify<span className="text-brand-orange">.</span>
              </span>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
            >
              {/* Left Column: Main Navigation */}
              <div className="flex flex-col gap-5">
                <motion.span variants={itemVariants} className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">
                  Navigation
                </motion.span>
                {menuItems.map((item, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <Link 
                      href={item.href}
                      className="group flex items-center justify-between text-2xl md:text-3xl font-display font-medium text-brand-black hover:text-brand-orange transition-colors"
                      onClick={onClose}
                    >
                      <span>{item.label}</span>
                      <ArrowRight 
                        size={24} 
                        weight="bold" 
                        className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-orange"
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Right Column: Other & Social */}
              <div className="flex flex-col gap-10 md:border-l md:border-gray-200/60 md:pl-12 pt-4 md:pt-0">
                <div className="flex flex-col gap-3">
                  <motion.span variants={itemVariants} className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                    Other
                  </motion.span>
                  {otherItems.map((item, idx) => (
                    <motion.div key={idx} variants={itemVariants}>
                      <Link 
                        href={item.href}
                        className="text-lg font-medium text-brand-black hover:text-brand-orange transition-colors"
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <motion.span variants={itemVariants} className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                    Social Media
                  </motion.span>
                  {socialItems.map((item, idx) => (
                    <motion.div key={idx} variants={itemVariants}>
                      <Link 
                        href={item.href}
                        className="text-lg font-medium text-brand-black hover:text-brand-orange transition-colors"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
