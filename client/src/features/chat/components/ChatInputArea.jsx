"use client";
import React, { useRef, useState } from "react";
import {
  StopCircle,
  Microphone,
  ArrowUp,
  FilePdf,
  Paperclip,
  X
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
  const [attachedFile, setAttachedFile] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync external edit prompts into local state
  const [prevEditPromptText, setPrevEditPromptText] = useState(editPromptText);
  if (editPromptText !== prevEditPromptText) {
    setPrevEditPromptText(editPromptText);
    if (editPromptText?.text !== undefined) {
      setInput(editPromptText.text);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if PDF
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setAttachedFile(file);
    } else {
      alert("Please upload a valid PDF document.");
    }
    // Reset file input value so re-selecting same file triggers change
    e.target.value = "";
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const submitMessage = () => {
    const trimmed = input.trim();
    if ((!trimmed && !attachedFile) || isGenerating) return;

    // If there's an attached file, include a note or pass through
    const messageToSend = attachedFile
      ? (trimmed ? `${trimmed}\n\n[Attached: ${attachedFile.name}]` : `Please analyze this document: ${attachedFile.name}`)
      : trimmed;

    onSend(messageToSend, attachedFile);
    setInput("");
    setAttachedFile(null);
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

  const canSubmit = (input.trim().length > 0 || attachedFile !== null) && !isGenerating;

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 sm:px-8 flex flex-col items-center pointer-events-none z-20">
      <div className="w-full max-w-3xl pointer-events-auto bg-[#1c1a1a]/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-3 sm:p-3.5 flex flex-col gap-2 transition-all">
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attached PDF Preview Chip */}
        {attachedFile && (
          <div className="flex items-center gap-2.5 bg-white/6 px-3 py-1.5 rounded-2xl w-fit text-xs text-white/90 border border-white/8">
            <div className="p-1 rounded-lg bg-red-500/20 text-red-400">
              <FilePdf size={16} weight="fill" />
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0 max-w-xs sm:max-w-md">
              <span className="font-medium truncate">{attachedFile.name}</span>
              <span className="text-[11px] text-white/40 shrink-0">
                ({formatFileSize(attachedFile.size)})
              </span>
            </div>
            <button
              type="button"
              onClick={removeAttachedFile}
              className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer ml-1"
              title="Remove attached PDF"
            >
              <X size={13} weight="bold" />
            </button>
          </div>
        )}

        {/* Textarea & Command Controls */}
        <div className="flex items-end gap-2 sm:gap-3 w-full">
          
          {/* Action Buttons Left: PDF Attachment & Voice Mic */}
          <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
            {/* PDF Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-2xl transition-all flex items-center justify-center cursor-pointer bg-white/5 text-white/50 hover:text-white hover:bg-white/10 active:scale-95"
              title="Upload PDF Document"
            >
              <Paperclip size={18} weight="bold" />
            </button>

            {/* Voice Input Trigger */}
            <button
              type="button"
              onClick={onToggleMic}
              className={`w-10 h-10 rounded-2xl transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                isListening
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
              }`}
              title={isListening ? "Listening... click to stop" : "Voice dictation (speech-to-text)"}
            >
              <Microphone size={18} weight={isListening ? "fill" : "bold"} />
            </button>
          </div>

          {/* Auto-growing Textarea with Clear Satoshi Font */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachedFile ? "Ask a question about this PDF..." : "Ask Cognify anything..."}
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
              className="w-10 h-10 shrink-0 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors cursor-pointer mb-0.5 shadow-sm active:scale-95"
              title="Stop generating"
            >
              <StopCircle size={20} weight="fill" />
            </button>
          ) : (
            <button
              onClick={submitMessage}
              disabled={!canSubmit}
              className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all cursor-pointer mb-0.5 shadow-sm ${
                canSubmit
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
    </div>
  );
}
