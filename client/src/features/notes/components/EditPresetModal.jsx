"use client";
import React, { useState } from "react";
import { X, Sparkle, Trash } from "@phosphor-icons/react";

export default function EditPresetModal({ isOpen, onClose, preset, onSave, onDelete, canDelete = true }) {
  if (!isOpen || !preset) return null;

  return (
    <EditPresetDialog
      key={preset.id}
      onClose={onClose}
      preset={preset}
      onSave={onSave}
      onDelete={onDelete}
      canDelete={canDelete}
    />
  );
}

function EditPresetDialog({ onClose, preset, onSave, onDelete, canDelete }) {
  const [name, setName] = useState(preset.name || "");
  const [description, setDescription] = useState(preset.description || "");
  const [instructions, setInstructions] = useState(preset.instructions || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...preset,
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkle size={20} className="text-osmo-lime" weight="fill" />
            <h3 className="text-base font-semibold text-white">Customize Enhancement Preset</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
              Preset Name
            </label>
            <input
              type="text"
              required
              maxLength={40}
              placeholder="e.g. Study Guide, System Architecture..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime/70 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
              Brief Description
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Focus on definitions and review questions"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime/70 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
              Custom Prompt Instructions (Optional)
            </label>
            <textarea
              rows={4}
              maxLength={600}
              placeholder="Special instructions for how the AI should format and structure this note style..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime/70 text-xs resize-none"
            />
            <p className="text-[11px] text-white/40 mt-1">
              These guidelines are sent alongside your raw notes whenever you select this preset chip.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {canDelete && !preset.isDefault ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(preset.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash size={14} />
                <span>Delete Preset</span>
              </button>
            ) : (
              <span className="text-[11px] text-white/30 italic">Default Preset</span>
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-osmo-lime text-black hover:bg-osmo-lime/90 transition-all shadow-md shadow-osmo-lime/20"
              >
                Save Preset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
