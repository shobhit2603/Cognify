"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Lightning,
  Sparkle,
  GraduationCap,
  Code,
  UsersThree,
  PencilSimple,
  Plus,
  ArrowClockwise,
  CaretDown,
  Check,
} from "@phosphor-icons/react";
import {
  getStoredPresets,
  saveStoredPresets,
  MAX_CUSTOM_PRESETS,
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
  const [presets, setPresets] = useState(() => {
    if (typeof window === "undefined") return [];
    return getStoredPresets();
  });
  const [editingPreset, setEditingPreset] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

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

  const customPresetsCount = presets.filter((p) => !p.isDefault).length;

  const handleCreateNewPreset = () => {
    if (customPresetsCount >= MAX_CUSTOM_PRESETS) return;
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
    setIsDropdownOpen(false);
    setEditingPreset(newPreset);
  };

  const isRawEmpty = rawContentLength === 0;

  // Active framework display info
  const activePreset = presets.find((p) => p.id === selectedFrameworkId);
  const isAuto = selectedFrameworkId === null;
  const ActiveIcon = isAuto ? Lightning : ICON_MAP[activePreset?.icon] || Sparkle;
  const activeLabel = isAuto ? "Auto" : activePreset?.name || "Auto";

  return (
    <div className="bg-[#0d0d0f] p-3 select-none">
      {/* ── Single-Row Action Bar: [Mode Dropdown] [Prompt Input] [Enhance Button] ── */}
      <div className="flex items-center gap-2">
        {/* Mode Dropdown Trigger & Upward Popover */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            title={`Active Mode: ${activeLabel}`}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all max-w-[140px] truncate ${
              isAuto
                ? "bg-osmo-lime/10 border-osmo-lime/30 text-osmo-lime hover:bg-osmo-lime/20"
                : "bg-white/10 border-white/20 text-white hover:bg-white/15"
            }`}
          >
            <ActiveIcon
              size={13}
              weight={isAuto ? "fill" : "regular"}
              className="shrink-0"
            />
            <span className="truncate hidden sm:inline">{activeLabel}</span>
            <CaretDown
              size={11}
              weight="bold"
              className={`shrink-0 transition-transform duration-150 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Upward-Opening Popover Menu */}
          {isDropdownOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#141418] border border-white/10 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl z-50 text-xs space-y-1">
              {/* Auto-Detect Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectFramework(null);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left ${
                  isAuto
                    ? "bg-osmo-lime/10 text-osmo-lime"
                    : "hover:bg-white/5 text-white/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Lightning
                    size={14}
                    weight={isAuto ? "fill" : "bold"}
                    className={isAuto ? "text-osmo-lime shrink-0" : "text-white/50 shrink-0"}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">Auto-Detect</div>
                    <div className="text-[10px] text-white/40 truncate">
                      Automatically picks best structure
                    </div>
                  </div>
                </div>
                {isAuto && (
                  <Check size={14} weight="bold" className="text-osmo-lime shrink-0 ml-2" />
                )}
              </button>

              <div className="border-t border-white/10 my-1" />

              {/* Presets List */}
              <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                {presets.map((preset) => {
                  const isSelected = selectedFrameworkId === preset.id;
                  const Icon = ICON_MAP[preset.icon] || Sparkle;

                  return (
                    <div
                      key={preset.id}
                      className={`group flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "hover:bg-white/5 text-white/70 hover:text-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectFramework(preset.id);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left truncate mr-1.5"
                      >
                        <Icon
                          size={13}
                          weight={isSelected ? "fill" : "regular"}
                          className={isSelected ? "text-osmo-lime shrink-0" : "text-white/50 shrink-0"}
                        />
                        <span className="truncate font-medium">{preset.name}</span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Edit Preset Trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPreset(preset);
                            setIsDropdownOpen(false);
                          }}
                          title="Edit Preset"
                          className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-osmo-lime opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <PencilSimple size={12} />
                        </button>

                        {isSelected && (
                          <Check size={13} weight="bold" className="text-osmo-lime" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pinned Footer Action: Create Custom Preset */}
              <div className="border-t border-white/10 pt-1">
                <button
                  type="button"
                  disabled={customPresetsCount >= MAX_CUSTOM_PRESETS}
                  onClick={handleCreateNewPreset}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-dashed transition-all text-left ${
                    customPresetsCount >= MAX_CUSTOM_PRESETS
                      ? "border-white/5 text-white/30 cursor-not-allowed"
                      : "border-white/20 hover:border-osmo-lime/40 text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium truncate">
                    <Plus size={12} />
                    <span>Custom Framework</span>
                  </span>
                  <span className="text-[10px] font-mono text-white/40">
                    {customPresetsCount}/{MAX_CUSTOM_PRESETS}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Instructions Input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder="Steer enhancement (e.g. 'concise', 'add code')..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isRawEmpty && !isEnhancing) {
                e.preventDefault();
                onEnhance();
              }
            }}
            disabled={isEnhancing}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime/70 focus:ring-1 focus:ring-osmo-lime/40 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Enhance CTA Button */}
        <button
          type="button"
          disabled={isRawEmpty || isEnhancing}
          onClick={onEnhance}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all shadow-md shrink-0 ${
            isEnhancing
              ? "bg-osmo-lime/80 text-black cursor-wait"
              : isRawEmpty
              ? "bg-white/10 text-white/30 border border-white/5 cursor-not-allowed"
              : "bg-osmo-lime text-black hover:bg-osmo-lime/90 hover:scale-[1.02] shadow-osmo-lime/20 cursor-pointer"
          }`}
        >
          {isEnhancing ? (
            <>
              <ArrowClockwise size={14} className="animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkle size={14} weight="fill" />
              <span>Enhance</span>
              <kbd className="hidden sm:inline-block ml-0.5 text-[9px] px-1 py-0.2 rounded bg-black/20 text-black/70 font-mono">
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
