"use client";
import React, { useState, useEffect } from "react";
import { X, FolderSimple, Check } from "@phosphor-icons/react";

const FOLDER_COLORS = [
  "#84cc16", // Lime
  "#38bdf8", // Sky blue
  "#10b981", // Emerald
  "#fbbf24", // Amber
  "#a855f7", // Purple
  "#f43f5e", // Rose
];

export default function CreateFolderModal({ isOpen, onClose, onSubmit, initialFolder = null }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialFolder) {
      setName(initialFolder.name || "");
      setColor(initialFolder.color || FOLDER_COLORS[0]);
    } else {
      setName("");
      setColor(FOLDER_COLORS[0]);
    }
  }, [initialFolder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ name: name.trim(), color });
      onClose();
    } catch {
      // Error handled by hook toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <FolderSimple size={20} weight="fill" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {initialFolder ? "Rename Folder" : "Create New Folder"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
              Folder Name
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={60}
              placeholder="e.g. Work, College, Project ideas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime/70 focus:ring-1 focus:ring-osmo-lime/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
              Folder Color
            </label>
            <div className="flex items-center gap-3">
              {FOLDER_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={14} className="text-black font-bold" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-osmo-lime text-black hover:bg-osmo-lime/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-osmo-lime/20"
            >
              {isSubmitting ? "Saving..." : initialFolder ? "Update Folder" : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
