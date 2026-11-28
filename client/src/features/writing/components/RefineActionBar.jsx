"use client";
import React, { useState } from "react";
import { MagicWand, PaperPlaneRight } from "@phosphor-icons/react";
import { REFINE_CHIPS } from "../constants/writingOptions";

export default function RefineActionBar({
  onRefine,
  isStreaming = false,
  disabled = false,
}) {
  const [customInstruction, setCustomInstruction] = useState("");

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const trimmed = customInstruction.trim();
    if (!trimmed || isStreaming || disabled) return;
    onRefine("custom", trimmed);
    setCustomInstruction("");
  };

  return (
    <div className="p-3 border-t border-white/10 bg-[#0e0e11] space-y-2.5 shrink-0 select-none">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/40 mr-1">
          <MagicWand size={12} className="text-[#ff5f56]" />
          <span>Quick Refine</span>
        </span>
        {REFINE_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={isStreaming || disabled}
            onClick={() => onRefine(chip.id)}
            className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-[#ff5f56]/15 border border-white/10 hover:border-[#ff5f56]/40 text-[11px] font-medium text-white/75 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={customInstruction}
          disabled={isStreaming || disabled}
          onChange={(e) => setCustomInstruction(e.target.value)}
          placeholder="Custom adjustment (e.g. 'Add a polite deadline for Friday 5 PM' or 'Emphasize Node.js scaling')..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!customInstruction.trim() || isStreaming || disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff5f56]/18 hover:bg-[#ff5f56]/30 border border-[#ff5f56]/40 text-[#ff5f56] text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Refine</span>
          <PaperPlaneRight size={12} weight="bold" />
        </button>
      </form>
    </div>
  );
}
