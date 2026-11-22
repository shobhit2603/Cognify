"use client";
import React, { useState, useEffect } from "react";
import {
  Lightning,
  Sparkle,
  GraduationCap,
  Code,
  UsersThree,
  PencilSimple,
  Plus,
  ArrowClockwise,
} from "@phosphor-icons/react";
import {
  getStoredPresets,
  saveStoredPresets,
  MAX_PRESETS,
} from "../constants/presets";
import EditPresetModal from "./EditPresetModal";

const ICON_MAP = {
  GraduationCap: GraduationCap,
  Code: Code,
  UsersThree: UsersThree,
  Sparkle: Sparkle,
};

export default function EnhanceActionBar({
  selectedFrameworkId = null,
  onSelectFramework,
  customInstructions,
  setCustomInstructions,
  onEnhance,
  isEnhancing = false,
  rawContentLength = 0,
}) {
  const [presets, setPresets] = useState([]);
  const [editingPreset, setEditingPreset] = useState(null);

  useEffect(() => {
    setPresets(getStoredPresets());
  }, []);

  const handleSavePreset = (updated) => {
    const updatedList = presets.map((p) => (p.id === updated.id ? updated : p));
    setPresets(updatedList);
    saveStoredPresets(updatedList);
  };

  const handleDeletePreset = (id) => {
    const filtered = presets.filter((p) => p.id !== id);
    setPresets(filtered);
    saveStoredPresets(filtered);
    if (selectedFrameworkId === id) {
      onSelectFramework(null);
    }
  };

  const handleCreateNewPreset = () => {
    if (presets.length >= MAX_PRESETS) return;
    const newPreset = {
      id: `custom-${Date.now()}`,
      name: "New Custom Preset",
      description: "Custom enhancement guidelines",
      icon: "Sparkle",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      instructions: "",
      isDefault: false,
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    saveStoredPresets(updated);
    setEditingPreset(newPreset);
  };

  const isRawEmpty = rawContentLength === 0;

  return (
    <div className="border-t border-white/10 bg-[#0d0d0f] p-3.5 space-y-3">
      {/* ── Preset Chips Selector ── */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider mr-1">
            Mode:
          </span>

          {/* Auto-Detect Chip */}
          <button
            type="button"
            onClick={() => onSelectFramework(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              selectedFrameworkId === null
                ? "bg-osmo-lime text-black border-osmo-lime font-semibold shadow-sm shadow-osmo-lime/20"
                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Lightning size={13} weight={selectedFrameworkId === null ? "fill" : "bold"} />
            <span>Auto-Detect</span>
          </button>

          {/* Preset Framework Chips */}
          {presets.map((preset) => {
            const isSelected = selectedFrameworkId === preset.id;
            const IconComponent = ICON_MAP[preset.icon] || Sparkle;

            return (
              <div
                key={preset.id}
                className={`group relative flex items-center rounded-full border transition-all ${
                  isSelected
                    ? "bg-white/15 text-white border-osmo-lime shadow-sm"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectFramework(isSelected ? null : preset.id)}
                  title={preset.description}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 font-medium"
                >
                  <IconComponent size={13} weight={isSelected ? "fill" : "regular"} />
                  <span>{preset.name}</span>
                </button>

                {/* Edit Pencil Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPreset(preset);
                  }}
                  title="Edit preset template"
                  className="pr-2.5 pl-1 py-1.5 text-white/30 hover:text-osmo-lime opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <PencilSimple size={12} />
                </button>
              </div>
            );
          })}

          {/* Add Custom Preset (if under limit of 6) */}
          {presets.length < MAX_PRESETS && (
            <button
              type="button"
              onClick={handleCreateNewPreset}
              title={`Create custom preset (${presets.length}/${MAX_PRESETS})`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-xs"
            >
              <Plus size={12} />
              <span>Custom</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Custom Instructions & CTA Bar ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="How should we enhance this? (e.g. 'add code snippets', 'keep it under 200 words')..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isRawEmpty && !isEnhancing) {
                e.preventDefault();
                onEnhance();
              }
            }}
            disabled={isEnhancing}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime/70 focus:ring-1 focus:ring-osmo-lime/40 transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          disabled={isRawEmpty || isEnhancing}
          onClick={onEnhance}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md ${
            isEnhancing
              ? "bg-osmo-lime/80 text-black cursor-wait"
              : isRawEmpty
              ? "bg-white/10 text-white/30 border border-white/5 cursor-not-allowed"
              : "bg-osmo-lime text-black hover:bg-osmo-lime/90 hover:scale-[1.02] shadow-osmo-lime/20 cursor-pointer"
          }`}
        >
          {isEnhancing ? (
            <>
              <ArrowClockwise size={15} className="animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkle size={15} weight="fill" />
              <span>Enhance Note</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1 py-0.2 rounded bg-black/20 text-black/70 font-mono">
                ↵
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Preset Customization Modal */}
      <EditPresetModal
        isOpen={!!editingPreset}
        preset={editingPreset}
        onClose={() => setEditingPreset(null)}
        onSave={handleSavePreset}
        onDelete={handleDeletePreset}
      />
    </div>
  );
}
