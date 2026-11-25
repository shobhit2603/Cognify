"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  PaperPlaneRight,
  CaretUp,
  CaretDown,
  Sparkle,
  Target,
  ChartBar,
  ChatCircleText,
  Stop,
  X,
} from "@phosphor-icons/react";

const MODES = [
  {
    id: "general",
    label: "Ask Anything",
    icon: ChatCircleText,
    placeholder: "Ask anything about this resume (e.g., 'How can I strengthen my summary?')...",
  },
  {
    id: "optimize-section",
    label: "Optimize Section",
    icon: Sparkle,
    placeholder: "Paste or name the section/bullet you want rewritten with Google X-Y-Z metrics...",
  },
  {
    id: "jd-match",
    label: "JD Keyword Match",
    icon: Target,
    placeholder: "Paste target Job Description here to compare keyword gaps and update ATS score...",
  },
  {
    id: "audit",
    label: "Full ATS Audit",
    icon: ChartBar,
    placeholder: "Add optional role guidance or press Send to trigger a complete re-audit...",
  },
];

export default function ResumeActionBar({
  onSendMessage,
  isStreaming = false,
  onStopStreaming,
  initialPrompt = "",
  initialMode = "general",
  promptTrigger = 0,
}) {
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState("general");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [prevPrompt, setPrevPrompt] = useState(initialPrompt);
  const [prevMode, setPrevMode] = useState(initialMode);
  const [prevTrigger, setPrevTrigger] = useState(promptTrigger);
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync state during render when prompt/mode/trigger changes from external suggestions
  if (
    promptTrigger !== prevTrigger ||
    initialPrompt !== prevPrompt ||
    initialMode !== prevMode
  ) {
    setPrevTrigger(promptTrigger);
    setPrevPrompt(initialPrompt);
    setPrevMode(initialMode);
    if (initialPrompt) setInput(initialPrompt);
    if (initialMode) setSelectedMode(initialMode);
  }

  // Focus, highlight, position cursor, and auto-resize textarea when a preset prompt is selected
  useEffect(() => {
    if (!promptTrigger) return undefined;
    const el = textareaRef.current;
    if (!el) return undefined;

    const frameId = requestAnimationFrame(() => {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
      el.style.height = "40px";
      el.style.height = `${Math.max(40, Math.min(el.scrollHeight, 120))}px`;
      el.scrollTop = el.scrollHeight;
    });

    return () => cancelAnimationFrame(frameId);
  }, [promptTrigger]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const activeModeConfig = MODES.find((m) => m.id === selectedMode) || MODES[0];
  const ActiveIcon = activeModeConfig.icon;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!input.trim() && selectedMode !== "audit") || isStreaming) return;

    let messageToSend = input.trim();
    let jobDescription = "";

    if (selectedMode === "audit" && !messageToSend) {
      messageToSend = "Run a comprehensive ATS audit on this resume.";
    }

    if (selectedMode === "jd-match") {
      jobDescription = messageToSend;
      messageToSend = `Match my resume against this job description and report missing keywords.`;
    }

    onSendMessage({
      message: messageToSend,
      mode: selectedMode,
      jobDescription,
    });

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const handleInputResize = (e) => {
    setInput(e.target.value);
    e.target.style.height = "40px";
    e.target.style.height = `${Math.max(40, Math.min(e.target.scrollHeight, 120))}px`;
  };

  return (
    <div className="p-3 border-t border-white/10 bg-[#0d0d0f] relative select-none">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Mode Selector Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/90 hover:text-white transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <ActiveIcon size={15} className="text-[#ffbd2e]" weight="bold" />
            <span className="hidden sm:inline">{activeModeConfig.label}</span>
            <CaretUp size={12} className="text-white/40" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-52 rounded-xl bg-[#18181c] border border-white/10 shadow-2xl p-1 z-30 animate-fadeIn">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white/40">
                Studio Mode
              </div>
              {MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = mode.id === selectedMode;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setSelectedMode(mode.id);
                      setIsDropdownOpen(false);
                      textareaRef.current?.focus();
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? "bg-[#ffbd2e]/10 text-[#ffbd2e] font-semibold"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} weight={isSelected ? "bold" : "regular"} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Text Input Area */}
        <div className="flex-1 min-w-0 relative flex items-center">
          <textarea
            ref={textareaRef}
            data-lenis-prevent
            rows={1}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder={activeModeConfig.placeholder}
            style={{ height: "40px" }}
            className="w-full min-h-[40px] max-h-[120px] px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ffbd2e] focus:ring-2 focus:ring-[#ffbd2e]/25 focus:bg-white/[0.08] transition-all resize-none leading-normal overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] select-text block"
          />
        </div>

        {/* Action Button: Send or Stop */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStopStreaming}
            className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors shrink-0 shadow-sm flex items-center justify-center"
            title="Stop generating"
          >
            <Stop size={16} weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() && selectedMode !== "audit"}
            className="w-10 h-10 rounded-xl bg-[#ffbd2e] text-black hover:bg-[#ffbd2e]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-md shadow-[#ffbd2e]/10 flex items-center justify-center"
            title="Send Message"
          >
            <PaperPlaneRight size={16} weight="fill" />
          </button>
        )}
      </div>
    </div>
  );
}
