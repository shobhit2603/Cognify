"use client";
import React, { useState } from "react";
import {
  Sparkle,
  Copy,
  Check,
  ArrowRight,
  ChartLineUp,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function BeforeAfterDiffCard({
  original = "",
  improved = "",
  reason = "",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!improved) return;
    navigator.clipboard.writeText(improved);
    setCopied(true);
    toast.success("Optimized bullet copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#16161a] overflow-hidden my-3 shadow-lg">
      <div className="px-3.5 py-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartLineUp size={14} className="text-[#ffbd2e]" weight="bold" />
          <span className="text-[11px] font-semibold text-white/90 uppercase font-mono tracking-wider">
            Google X-Y-Z Bullet Optimization
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ffbd2e]/10 hover:bg-[#ffbd2e]/20 text-[#ffbd2e] text-[11px] font-semibold border border-[#ffbd2e]/30 transition-colors"
        >
          {copied ? <Check size={12} weight="bold" /> : <Copy size={12} weight="bold" />}
          <span>{copied ? "Copied" : "Copy Rewrite"}</span>
        </button>
      </div>

      <div className="p-3.5 space-y-2.5 text-xs min-w-0 overflow-x-hidden">
        {/* Original */}
        {original && (
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-mono uppercase text-red-400 font-semibold flex items-center gap-1">
              <span>●</span> Original Bullet
            </span>
            <p className="p-2.5 rounded-lg bg-red-500/[0.04] border border-red-500/15 text-white/60 line-through break-words [overflow-wrap:anywhere]">
              {original}
            </p>
          </div>
        )}

        {/* Improved */}
        {improved && (
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-mono uppercase text-[#ffbd2e] font-semibold flex items-center gap-1">
              <span>●</span> High-Impact Rewrite
            </span>
            <p className="p-2.5 rounded-lg bg-[#ffbd2e]/[0.08] border border-[#ffbd2e]/25 text-white font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
              {improved}
            </p>
          </div>
        )}

        {/* Reason */}
        {reason && (
          <p className="text-[11px] text-white/50 italic leading-relaxed pt-1 border-t border-white/5 break-words [overflow-wrap:anywhere]">
            <span className="font-semibold text-white/70">Why it works:</span> {reason}
          </p>
        )}
      </div>
    </div>
  );
}
