import React from "react";
import { motion } from "motion/react";
import { Sparkle } from "@phosphor-icons/react";

const SUGGESTED_STARTERS = [
  { label: "Deconstruct Architecture", prompt: "Compare the latency, token overhead, and maintainability of streaming Next.js edge functions vs long-lived Node.js servers." },
  { label: "Audit ATS Resume", prompt: "What are the most impactful action verbs and quantifiable metrics to highlight on a full-stack engineer resume for ATS systems?" },
  { label: "Draft Technical Memo", prompt: "Draft a concise technical architecture memo explaining the benefits of isolating external AI providers behind a repository service layer." },
  { label: "Synthesize Core Concept", prompt: "Explain how React's concurrent rendering differs from traditional synchronous state updates with clear conceptual examples." }
];

export default function ChatEmptyState({ onSendStarter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-8"
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-black text-brand-orange flex items-center justify-center mb-6 shadow-md border border-black/10">
        <Sparkle size={24} weight="fill" />
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-brand-black mb-3">
        What are we reasoning through today?
      </h2>
      <p className="text-gray-500 font-sans text-base max-w-lg font-normal mb-8 leading-relaxed">
        Attach documents, optimize resumes, draft communications, or synthesize complex topics without prompt friction.
      </p>

      {/* Curated Interactive Starter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
        {SUGGESTED_STARTERS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSendStarter(item.prompt)}
            className="px-3.5 py-2 rounded-xl bg-white border border-black/8 hover:border-brand-orange/40 hover:bg-white text-gray-600 hover:text-brand-black text-xs font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/50 group-hover:bg-brand-orange" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
