"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatTeardropDots, ArrowUpRight, PaperPlaneTilt } from "@phosphor-icons/react";

export default function AIChatEngineCard() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    // Store the pending prompt so the chat page can auto-fire it
    try {
      sessionStorage.setItem("cognify_pending_prompt", trimmed);
    } catch {
      // ignore storage errors (e.g. private mode restrictions)
    }
    router.push("/chat");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="group relative w-full h-full overflow-hidden transition-colors duration-300 ease-out bg-[#151414] hover:bg-osmo-purple">
      <div className="w-full h-full bg-[#151414] border border-white/[0.08] text-white p-4 lg:p-5 flex flex-col justify-between overflow-hidden select-none transition-all duration-300 ease-out group-hover:scale-[0.96] active:scale-[0.92] group-hover:rounded-3xl group-hover:bg-black">

        {/* Top: Icon + number + arrow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChatTeardropDots
              size={22}
              weight="bold"
              className="text-osmo-purple transition-transform duration-200"
            />
            <span className="font-display text-lg font-bold text-white/30 tracking-widest uppercase">
              01
            </span>
          </div>
          <button
            onClick={() => router.push("/chat")}
            className="text-white/30 hover:text-white transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 cursor-pointer"
            title="Open AI Chat"
          >
            <ArrowUpRight size={18} weight="bold" />
          </button>
        </div>

        {/* Center: Title */}
        <div className="my-auto py-1">
          <h3 className="text-xl sm:text-2xl font-display font-medium tracking-tight text-white uppercase leading-tight">
            AI Chat Engine
          </h3>
          <p className="text-md font-caveat text-white/50 group-hover:text-white/80 transition-colors mt-0.5">
            Reasoning Core
          </p>
        </div>

        {/* Bottom: Quick-send search box */}
        <div className="pt-3 border-t border-white/[0.08]">
          <div
            className={`flex items-center gap-2 bg-white/[0.04] border rounded-xl px-3 py-2 transition-all duration-200 ${
              isFocused
                ? "border-osmo-purple/60 bg-osmo-purple/5 shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"
                : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => inputRef.current?.focus()}
          >
            <ChatTeardropDots
              size={14}
              weight="bold"
              className={`shrink-0 transition-colors duration-200 ${isFocused ? "text-osmo-purple" : "text-white/30"}`}
            />
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything, start a new chat…"
              className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none min-w-0 font-sans"
            />
            <button
              onClick={handleSend}
              disabled={!prompt.trim()}
              className={`shrink-0 p-1 rounded-lg transition-all duration-200 cursor-pointer ${
                prompt.trim()
                  ? "bg-osmo-purple text-white hover:bg-osmo-purple/80 scale-100"
                  : "bg-white/5 text-white/20 scale-90 pointer-events-none"
              }`}
              title="Send prompt"
            >
              <PaperPlaneTilt size={12} weight="bold" />
            </button>
          </div>
          <p className="text-[9px] text-white/20 mt-1.5 pl-1">
            Press <kbd className="font-mono text-white/30">Enter</kbd> to launch instantly
          </p>
        </div>
      </div>
    </div>
  );
}
