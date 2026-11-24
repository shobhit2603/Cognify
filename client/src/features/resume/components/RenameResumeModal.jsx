"use client";
import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";

export default function RenameResumeModal({ isOpen, onClose, currentTitle, onRename }) {
  const [title, setTitle] = useState(currentTitle || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(currentTitle || "");
  }, [currentTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRename(title.trim());
      onClose();
    } catch {
      // error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#131316] border border-white/10 rounded-2xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-base font-semibold text-white mb-1">Rename Resume</h3>
        <p className="text-xs text-white/50 mb-5">
          Give your resume a clear descriptive title to track different roles or iterations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Resume Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer - Google"
              autoFocus
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ffbd2e] focus:ring-1 focus:ring-[#ffbd2e]/50 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#ffbd2e] text-black hover:bg-[#ffbd2e]/90 disabled:opacity-50 transition-all shadow-md shadow-[#ffbd2e]/10"
            >
              {isSubmitting ? "Saving..." : "Save Title"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
