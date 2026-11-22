"use client";
import React, { useState } from "react";
import { X, FolderSimple } from "@phosphor-icons/react";

export default function MoveNoteModal({ isOpen, onClose, folders = [], currentFolderId = null, onMove }) {
  const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId ?? "null");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleMove = async () => {
    try {
      setIsSubmitting(true);
      const targetFolderId = selectedFolderId === "null" ? null : selectedFolderId;
      await onMove(targetFolderId);
      onClose();
    } catch {
      // Handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-5 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FolderSimple size={20} className="text-osmo-lime" weight="bold" />
            <h3 className="text-base font-semibold text-white">Move Note</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
          {/* Option: Uncategorized */}
          <button
            type="button"
            onClick={() => setSelectedFolderId("null")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
              selectedFolderId === "null"
                ? "bg-osmo-lime/10 text-osmo-lime border border-osmo-lime/30 font-medium"
                : "text-white/80 hover:bg-white/5 border border-transparent"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              Uncategorized (General)
            </span>
            {selectedFolderId === "null" && <span className="text-xs">Selected</span>}
          </button>

          {/* User Folders */}
          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder._id;
            return (
              <button
                type="button"
                key={folder._id}
                onClick={() => setSelectedFolderId(folder._id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  isSelected
                    ? "bg-osmo-lime/10 text-osmo-lime border border-osmo-lime/30 font-medium"
                    : "text-white/80 hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <FolderSimple size={18} weight="fill" style={{ color: folder.color || "#84cc16" }} />
                  <span className="truncate">{folder.name}</span>
                </span>
                {isSelected && <span className="text-xs">Selected</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 mt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleMove}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-osmo-lime text-black hover:bg-osmo-lime/90 disabled:opacity-50"
          >
            {isSubmitting ? "Moving..." : "Move"}
          </button>
        </div>
      </div>
    </div>
  );
}
