export const DEFAULT_PRESETS = [
  {
    id: "study-guide",
    name: "Study Guide",
    description: "Definitions, analogies, pitfalls, and self-test review questions.",
    icon: "GraduationCap",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    isDefault: true,
  },
  {
    id: "code-tech",
    name: "Code & Tech Notes",
    description: "Logic breakdown, architecture, code snippets, and edge cases.",
    icon: "Code",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    isDefault: true,
  },
  {
    id: "meeting-takeaways",
    name: "Meeting Takeaways",
    description: "Meeting context, decisions agreed upon, and next action items.",
    icon: "UsersThree",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    isDefault: true,
  },
  {
    id: "quick-polish",
    name: "Quick Polish & Summary",
    description: "Fixes grammar, polishes formatting, and produces concise bullet takeaways.",
    icon: "Sparkle",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    isDefault: true,
  },
];

export const MAX_PRESETS = 6;
const STORAGE_KEY = "cognify_custom_note_presets";

export const getStoredPresets = () => {
  if (typeof window === "undefined") return DEFAULT_PRESETS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PRESETS;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
};

export const saveStoredPresets = (presets) => {
  if (typeof window === "undefined") return;
  try {
    const limited = presets.slice(0, MAX_PRESETS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (err) {
    console.error("[Presets] Failed to save presets:", err);
  }
};
