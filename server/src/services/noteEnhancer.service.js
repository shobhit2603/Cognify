import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getGroqModelInstance } from "../providers/groq.provider.js";
import getMistralModel from "../providers/mistral.provider.js";
import envConfig from "../config/env.config.js";

// ─── 1. Preset Framework Definitions ──────────────────────────────────────────

export const PRESET_FRAMEWORKS = {
  STUDY_GUIDE: {
    id: "study-guide",
    name: "Study Guide",
    description: "Transforms notes into structured study blueprints with key definitions, analogies, pitfalls, and review questions.",
    systemPrompt: `You are Cognify's Learning & Study Specialist. Your objective is to transform raw, shorthand, or lecture notes into a high-retention Study Guide.
Formatting Rules:
- Structure clearly with Markdown headings:
  1. ### Core Concept & Big Picture (clear summary and why this matters)
  2. ### Key Terms & Definitions (bulleted list of essential concepts)
  3. ### Deep-Dive & Real-World Examples (practical analogies and demonstrations)
  4. ### Common Pitfalls & Mistakes (what to avoid or watch out for)
  5. ### Quick Review & Self-Test Questions (3-4 comprehension checks with answers hidden in markdown blockquotes)
- Maintain absolute fidelity to the user's raw notes without inventing unrelated facts.
- Keep the tone pedagogical, crystal-clear, and engaging.`,
  },

  CODE_TECH_NOTES: {
    id: "code-tech",
    name: "Code & Tech Notes",
    description: "Breaks down technical notes, algorithms, and system concepts into logic blueprints, edge cases, and code patterns.",
    systemPrompt: `You are Cognify's Senior Technical Architect & Developer Specialist. Your objective is to transform rough coding thoughts, architecture sketches, or debug logs into crisp, production-grade technical documentation.
Formatting Rules:
- Structure clearly with Markdown headings:
  1. ### Technical Overview & Core Objective
  2. ### Architecture & Logic Breakdown (step-by-step mechanism)
  3. ### Code Example / Implementation Pattern (clean, syntax-highlighted code block with comments)
  4. ### Edge Cases & Potential Pitfalls (concurrency, limits, security, failure modes)
  5. ### Performance & Scalability Considerations
- Keep code clean, modern, and idiomatic.
- Do not bloat with boilerplate; focus on the core logic specified in the raw notes.`,
  },

  MEETING_TAKEAWAYS: {
    id: "meeting-takeaways",
    name: "Meeting Takeaways",
    description: "Extracts key discussion points, explicit decisions, and assigned action items from meeting notes.",
    systemPrompt: `You are Cognify's Executive Meeting & Project Management Specialist. Your objective is to transform raw, informal meeting notes or bullet dumps into an actionable Meeting Brief.
Formatting Rules:
- Structure clearly with Markdown headings:
  1. ### Meeting Context & Objectives
  2. ### Key Discussion Points & Topics Covered
  3. ### Decisions Agreed Upon (unambiguous list of what was decided)
  4. ### Action Items & Next Steps (checklist with Task, Assigned Owner [if mentioned or 'TBD'], and Priority)
  5. ### Open Questions & Blockers (unresolved items requiring follow-up)
- Preserve the exact decisions and nuance from the meeting notes. Be concise and eliminate conversational fluff.`,
  },

  QUICK_POLISH: {
    id: "quick-polish",
    name: "Quick Polish & Summary",
    description: "Cleans grammar, improves flow, and provides an executive summary without altering original structure.",
    systemPrompt: `You are Cognify's Executive Writing Specialist. Your objective is to polish raw notes for maximum clarity, professional flow, and readability.
Formatting Rules:
- Fix grammatical errors, sentence fragments, and awkward phrasing while strictly preserving the author's voice and structure.
- Structure clearly:
  1. ### Executive Summary (2-3 concise sentences distilling the core message)
  2. ### Polished Notes (the user's notes cleaned up with professional formatting, bullet hierarchy, and bold emphasis)
  3. ### High-Impact Takeaways (3-5 punchy key points)
- Do not add extraneous information not present in the user's notes.`,
  },
};

// Map lookup by ID
export const FRAMEWORK_MAP = Object.values(PRESET_FRAMEWORKS).reduce((acc, framework) => {
  acc[framework.id] = framework;
  return acc;
}, {});

// ─── 2. Auto-Detect Framework Heuristic ───────────────────────────────────────

export const detectFramework = (content) => {
  if (!content || typeof content !== "string") {
    return PRESET_FRAMEWORKS.QUICK_POLISH;
  }

  const text = content.toLowerCase();

  // Code & Tech signals
  const techKeywords = [
    /```/,
    /\b(function|const|let|var|class|interface|async|await|return|import|export)\b/,
    /\b(api|rest|endpoint|http|get|post|patch|delete|route|middleware|controller)\b/,
    /\b(database|sql|mongodb|redis|query|index|schema|table|foreign key)\b/,
    /\b(docker|kubernetes|aws|s3|cloud|serverless|lambda|deploy|ci\/cd)\b/,
    /\b(bug|error|exception|stack trace|fix|patch|refactor|nullpointer)\b/,
    /\b(react|nextjs|node|express|tailwind|css|html|typescript|python|golang)\b/,
  ];
  const techScore = techKeywords.filter((re) => re.test(text)).length;

  // Meeting signals
  const meetingKeywords = [
    /\b(meeting|sync|standup|1:1|one-on-one|agenda|minutes|call with|team call|sync call)\b/,
    /\b(attendees|participants|stakeholders)\b/,
    /\b(action item|action items|next steps|assigned to|assigned owner)\b/,
    /\b(agreed upon|decision made|decided that|consensus reached)\b/,
    /\b(deadline|eta|due date|roadmap|sprint goals|milestone)\b/,
  ];
  const meetingScore = meetingKeywords.filter((re) => re.test(text)).length;

  // Study & Learning signals
  const studyKeywords = [
    /\b(lecture|chapter|exam|quiz|midterm|final|homework|assignment)\b/,
    /\b(definition|concept|theory|principle|formula|hypothesis|theorem)\b/,
    /\b(history|biology|chemistry|physics|economics|psychology|sociology|philosophy)\b/,
    /\b(study guide|flashcard|memorize|summary of chapter|notes from class)\b/,
  ];
  const studyScore = studyKeywords.filter((re) => re.test(text)).length;

  // Compare matches
  if (techScore >= 2 && techScore >= meetingScore && techScore >= studyScore) {
    return PRESET_FRAMEWORKS.CODE_TECH_NOTES;
  }
  if (meetingScore >= 2 && meetingScore >= techScore && meetingScore >= studyScore) {
    return PRESET_FRAMEWORKS.MEETING_TAKEAWAYS;
  }
  if (studyScore >= 2 && studyScore >= techScore && studyScore >= meetingScore) {
    return PRESET_FRAMEWORKS.STUDY_GUIDE;
  }

  // Fallback heuristic based on length & structure
  if (techScore >= 1) return PRESET_FRAMEWORKS.CODE_TECH_NOTES;
  if (meetingScore >= 1) return PRESET_FRAMEWORKS.MEETING_TAKEAWAYS;
  if (studyScore >= 1) return PRESET_FRAMEWORKS.STUDY_GUIDE;

  return PRESET_FRAMEWORKS.QUICK_POLISH;
};

// ─── 3. Prompt Builder ────────────────────────────────────────────────────────

export const buildEnhancementPrompt = ({ rawContent, frameworkId = null, customInstructions = null }) => {
  // If specific framework passed, validate or fall back to auto-detect
  let framework = frameworkId ? FRAMEWORK_MAP[frameworkId] : null;
  if (!framework) {
    framework = detectFramework(rawContent);
  }

  let systemPrompt = framework.systemPrompt;

  // If user provided custom natural-language instructions, augment the prompt
  if (customInstructions && customInstructions.trim()) {
    systemPrompt += `\n\nADDITIONAL USER INSTRUCTIONS:
The user has provided the following specific instruction: "${customInstructions.trim()}".
You MUST incorporate and respect this preference while maintaining the chosen structure.`;
  }

  const userPrompt = `Here are my raw notes to enhance:
--- RAW NOTES START ---
${rawContent.trim()}
--- RAW NOTES END ---

Please enhance these notes now into clean, well-formatted Markdown following the specified framework.`;

  return {
    framework,
    messages: [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ],
  };
};

// ─── 4. Streaming Inference Generator ─────────────────────────────────────────

export async function* streamNoteEnhancement({ rawContent, frameworkId = null, customInstructions = null }) {
  const { framework, messages } = buildEnhancementPrompt({
    rawContent,
    frameworkId,
    customInstructions,
  });

  // Attempt Groq streaming first, fallback to Mistral if needed
  let stream;
  try {
    if (envConfig.GROQ_API_KEY && envConfig.GROQ_API_KEY !== "mock_key") {
      const model = getGroqModelInstance({ temperature: 0.3 });
      stream = await model.stream(messages);
    } else {
      const model = getMistralModel({ temperature: 0.3 });
      stream = await model.stream(messages);
    }
  } catch (providerError) {
    console.warn("[Note Enhancer] Primary model failed, falling back to Mistral:", providerError.message);
    const fallbackModel = getMistralModel({ temperature: 0.3 });
    stream = await fallbackModel.stream(messages);
  }

  for await (const chunk of stream) {
    const text = chunk.content;
    if (text && typeof text === "string") {
      yield { content: text };
    }
  }
}
