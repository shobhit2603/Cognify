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

export const MAX_CUSTOM_PRESETS = 6;
const STORAGE_KEY = "cognify_custom_note_presets";

export const getStoredPresets = () => {
  if (typeof window === "undefined") return DEFAULT_PRESETS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PRESETS;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PRESETS;

    const defaultMap = new Map(DEFAULT_PRESETS.map((p) => [p.id, p]));
    const customPresets = [];

    for (const item of parsed) {
      if (defaultMap.has(item.id)) {
        defaultMap.set(item.id, { ...defaultMap.get(item.id), ...item });
      } else if (!item.isDefault && customPresets.length < MAX_CUSTOM_PRESETS) {
        customPresets.push(item);
      }
    }
    return [...defaultMap.values(), ...customPresets];
  } catch {
    return DEFAULT_PRESETS;
  }
};

export const saveStoredPresets = (presets) => {
  if (typeof window === "undefined") return;
  try {
    const defaultIds = new Set(DEFAULT_PRESETS.map((p) => p.id));
    const customOnly = presets.filter((p) => !defaultIds.has(p.id)).slice(0, MAX_CUSTOM_PRESETS);
    const defaults = presets.filter((p) => defaultIds.has(p.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...defaults, ...customOnly]));
  } catch (err) {
    console.error("[Presets] Failed to save presets:", err);
  }
};
