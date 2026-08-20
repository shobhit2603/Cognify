"use client";
import React, { useRef, useState } from "react";
import {
  StopCircle,
  Microphone,
  ArrowUp
} from "@phosphor-icons/react";

export default function ChatInputArea({
  editPromptText,
  isGenerating,
  onSend,
  onStop,
  isListening,
  onToggleMic
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  // Sync external edit prompts into local state
  const [prevEditPromptText, setPrevEditPromptText] = useState(editPromptText);
  if (editPromptText !== prevEditPromptText) {
    setPrevEditPromptText(editPromptText);
    if (editPromptText?.text !== undefined) {
      setInput(editPromptText.text);
    }
  }

  const submitMessage = () => {
    if (!input.trim() || isGenerating) return;
    onSend(input);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 sm:px-8 flex flex-col items-center pointer-events-none z-20">
      <div className="w-full max-w-3xl pointer-events-auto bg-[#1c1a1a]/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-3 sm:p-3.5 flex flex-col gap-2 transition-all">
        
        {/* Textarea & Command Controls */}
        <div className="flex items-end gap-3 w-full">
          
          {/* Voice Input Trigger */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`w-10 h-10 shrink-0 rounded-2xl transition-all flex items-center justify-center cursor-pointer mb-0.5 ${
              isListening
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
            }`}
            title={isListening ? "Listening... click to stop" : "Voice dictation (speech-to-text)"}
          >
            <Microphone size={18} weight={isListening ? "fill" : "bold"} />
          </button>

          {/* Auto-growing Textarea with Larger Text */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Cognify anything..."
            className="w-full max-h-44 min-h-11 bg-transparent resize-none outline-none py-2 px-1 text-white placeholder:text-white/35 font-normal text-base sm:text-lg leading-relaxed select-text"
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 176)}px`;
            }}
          />

          {/* Dynamic Send / Stop Action Button */}
          {isGenerating ? (
            <button
              onClick={onStop}
              className="w-10 h-10 shrink-0 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors cursor-pointer mb-0.5 shadow-sm"
              title="Stop generating"
            >
              <StopCircle size={20} weight="fill" />
            </button>
          ) : (
            <button
              onClick={submitMessage}
              disabled={!input.trim()}
              className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all cursor-pointer mb-0.5 shadow-sm ${
                input.trim()
                  ? "bg-osmo-lime text-[#151414] hover:bg-osmo-lime/90 hover:scale-105 active:scale-95"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
              title="Send (Enter)"
            >
              <ArrowUp size={18} weight="bold" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/30 font-normal mt-2 select-none">
        <span>Shift + Enter for newline</span>
        <span>•</span>
        <span>Enter to send</span>
      </div>
    </div>
  );
}
