"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Lightning, PaperPlaneRight, ShieldCheck } from "@phosphor-icons/react";

export default function TelemetryCard() {
  const [quickPrompt, setQuickPrompt] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(quickPrompt.trim())}`);
  };

  return (
    <div className="relative w-full h-full bg-osmo-purple text-white rounded-none p-5 sm:p-6 shadow-sm flex flex-col justify-between overflow-hidden select-none group">
      {/* Background ambient lighting */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Row: Model Status */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-none text-white">
            <Cpu size={16} weight="bold" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/80">
            Engine Specs
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/20 text-osmo-lime text-[10px] font-mono font-bold rounded-none">
          <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime animate-pulse" />
          <span>&lt;28ms</span>
        </div>
      </div>

      {/* Center: Specs Grid */}
      <div className="my-3 relative z-10">
        <h4 className="text-xl font-display font-black tracking-tight text-white mb-2">
          Mistral Reasoning Grid
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-black/15 rounded-none">
            <span className="text-[10px] text-white/60 block uppercase">Context</span>
            <span className="font-bold text-white">128K Tokens</span>
          </div>
          <div className="p-2.5 bg-black/15 rounded-none">
            <span className="text-[10px] text-white/60 block uppercase">Security</span>
            <span className="font-bold text-osmo-lime">Zero Retention</span>
          </div>
        </div>
      </div>

      {/* Bottom: Direct Quick Prompt Box */}
      <form onSubmit={handleSubmit} className="relative z-10 mt-2">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Launch quick query to AI Chat..."
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            className="w-full bg-black/20 focus:bg-black/30 placeholder:text-white/50 text-white text-xs font-medium pl-3.5 pr-9 py-2.5 rounded-none outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!quickPrompt.trim()}
            className="absolute right-2 p-1.5 bg-osmo-lime text-black hover:bg-white transition-all disabled:opacity-30 rounded-none cursor-pointer"
            title="Send to AI Chat"
          >
            <PaperPlaneRight size={12} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}
