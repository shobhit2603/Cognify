"use client";
import React, { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import AnimatedButton from "../components/ui/AnimatedButton";

export default function Home() {
  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload to avoid jumping
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl flex flex-col items-center gap-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
          Cognify is now in Beta
        </div>

        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-brand-black leading-tight">
          Your Intelligent <br className="hidden md:block" />
          <span className="text-brand-orange">Workspace</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl font-sans font-light">
          Understand documents, craft professional emails, and enhance your notes with an all-in-one AI platform.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <AnimatedButton 
            href="/auth"
            variant="primary"
          >
            <span>Start creating</span>
            <ArrowRight size={20} weight="bold" />
          </AnimatedButton>
          <AnimatedButton 
            href="#features"
            variant="outline"
          >
            <span>Explore features</span>
          </AnimatedButton>
        </div>
      </motion.div>

      {/* Feature visual placeholder (like the dashboard card) */}
      <motion.div
        id="features"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="mt-24 w-full max-w-6xl aspect-video bg-[#E5E5E5] rounded-[2.5rem] shadow-2xl border border-white/20 p-8 overflow-hidden relative flex flex-col scroll-mt-32"
      >
        <div className="w-full flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl mb-8">
          <div className="w-32 h-6 bg-black/10 rounded-full"></div>
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-black/10 rounded-full"></div>
            <div className="w-6 h-6 bg-black/10 rounded-full"></div>
            <div className="w-6 h-6 bg-black/10 rounded-full"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-1/2 h-6 bg-black/10 rounded-md mb-4"></div>
                  <div className="w-full h-3 bg-black/5 rounded-full mb-2"></div>
                  <div className="w-3/4 h-3 bg-black/5 rounded-full"></div>
                </div>
                <div className="w-10 h-10 bg-brand-black rounded-full self-end mt-4"></div>
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
