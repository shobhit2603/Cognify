import React, { useRef } from "react";
import { PaperPlaneRight, StopCircle, Paperclip, Microphone, FilePdf, X } from "@phosphor-icons/react";

export default function ChatInputArea({
  input,
  setInput,
  isGenerating,
  onSend,
  onStop,
  attachedFiles,
  setAttachedFiles,
  isListening,
  onToggleMic,
}) {
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
      if (inputRef.current) inputRef.current.style.height = "auto";
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles((prev) => [
        ...prev,
        ...files.map((file) => ({
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB"
        }))
      ]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachedFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="absolute bottom-5 left-0 right-0 px-4 sm:px-8 flex flex-col items-center pointer-events-none z-10">
      <div className="w-full max-w-3xl pointer-events-auto bg-white border border-black/15 shadow-2xl shadow-black/10 rounded-2xl p-2.5 flex flex-col gap-2 transition-all focus-within:border-brand-orange/60 focus-within:ring-2 focus-within:ring-brand-orange/10">
        
        {/* Staged Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pt-1">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 bg-[#F4F4F3] border border-black/10 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700"
              >
                <FilePdf size={14} className="text-brand-orange" weight="fill" />
                <span className="truncate max-w-45">{file.name}</span>
                <span className="text-[10px] text-gray-400">({file.size})</span>
                <button
                  onClick={() => removeAttachedFile(file.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                >
                  <X size={12} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea & Dynamic Command Buttons */}
        <div className="flex items-end gap-2 w-full">
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Attach Document Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 shrink-0 rounded-xl hover:bg-black/5 text-gray-500 hover:text-brand-black flex items-center justify-center transition-colors cursor-pointer mb-0.5"
            title="Attach documents (PDF, TXT, DOCX)"
          >
            <Paperclip size={18} weight="bold" />
          </button>

          {/* Voice Input Trigger */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`w-9 h-9 shrink-0 rounded-xl transition-colors flex items-center justify-center cursor-pointer mb-0.5 ${
              isListening ? "bg-red-50 text-red-600 animate-pulse" : "hover:bg-black/5 text-gray-500 hover:text-brand-black"
            }`}
            title={isListening ? "Stop recording voice" : "Spoken audio prompt"}
          >
            <Microphone size={18} weight={isListening ? "fill" : "bold"} />
          </button>

          {/* Expanding Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Cognify to reason, synthesize notes, analyze documents..."
            className="w-full max-h-40 min-h-10.5 bg-transparent resize-none outline-none py-2 px-2 text-brand-black placeholder:text-gray-400 font-sans font-normal text-[15px] leading-relaxed"
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
          />

          {/* Dynamic Send / Stop Action */}
          {isGenerating ? (
            <button
              onClick={onStop}
              className="w-9 h-9 shrink-0 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer mb-0.5 shadow-2xs"
              title="Stop generating"
            >
              <StopCircle size={20} weight="fill" />
            </button>
          ) : (
            <button
              onClick={() => {
                onSend();
                if (inputRef.current) inputRef.current.style.height = "auto";
              }}
              disabled={!input.trim()}
              className="w-9 h-9 shrink-0 rounded-xl bg-brand-black hover:bg-brand-orange disabled:bg-black/5 disabled:text-gray-300 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed mb-0.5"
              title="Send message"
            >
              <PaperPlaneRight size={16} weight="fill" />
            </button>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 font-sans tracking-wide mt-2">
        Cognify Workspace Intelligence • Isolated multi-turn context
      </p>
    </div>
  );
}
