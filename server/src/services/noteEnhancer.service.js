import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getGroqModelInstance } from "../providers/groq.provider.js";
import getMistralModel from "../providers/mistral.provider.js";
import envConfig from "../config/env.config.js";
import * as noteRepository from "../repositories/note.repository.js";

// ─── Core Proportionality & Scannability Rules ────────────────────────────────
const CORE_PROPORTIONALITY_RULES = `
CRITICAL LENGTH & SCOPE RULES:
- STRICT PROPORTIONALITY: Match the length and depth directly to the input notes. A 2-line note must yield a concise 1-2 paragraph or short bullet summary—NEVER a sprawling textbook or giant multi-column table.
- NO UNSOLICITED EXPANSIONS: Do not invent external facts, extensive trivia, or unnecessary boilerplate that the user did not touch upon.
- HIGH-RETENTION SCANNABILITY: Use clean, compact Markdown bullets, bold highlights for key phrases, and clear hierarchy. Keep it easily digestible for fast revision.
`;

// ─── 1. Preset Framework Definitions ──────────────────────────────────────────

export const PRESET_FRAMEWORKS = {
  STUDY_GUIDE: {
    id: "study-guide",
    name: "Study Guide",
    description: "Transforms notes into structured study blueprints with key definitions, analogies, pitfalls, and review questions.",
    systemPrompt: `You are Cognify's Learning & Study Specialist. Transform raw or lecture notes into a high-retention study blueprint.
${CORE_PROPORTIONALITY_RULES}
Structure (scale sections to input volume; omit sections if note is brief):
- ### Core Concept (1-2 sentences summarizing the core idea)
- ### Key Points & Definitions (bulleted list of essential concepts)
- ### Quick Revision / Pitfalls (practical memory hook, common trap, or self-check question)
Maintain absolute fidelity to the user's raw notes without inventing unrelated facts.`,
  },

  CODE_TECH_NOTES: {
    id: "code-tech",
    name: "Code & Tech Notes",
    description: "Breaks down technical notes, algorithms, and system concepts into logic blueprints, edge cases, and code patterns.",
    systemPrompt: `You are Cognify's Senior Technical Architect. Transform rough coding thoughts or debug notes into clean, production-grade technical documentation.
${CORE_PROPORTIONALITY_RULES}
Structure (scale sections to input volume):
- ### Overview & Objective (brief summary)
- ### Implementation Pattern (clean, syntax-highlighted code block with comments)
- ### Key Considerations & Edge Cases (concise bullet points on gotchas, limits, or performance)
Do NOT write endless boilerplate. Focus strictly on the logic in the notes.`,
  },

  MEETING_TAKEAWAYS: {
    id: "meeting-takeaways",
    name: "Meeting Takeaways",
    description: "Extracts key discussion points, explicit decisions, and assigned action items from meeting notes.",
    systemPrompt: `You are Cognify's Executive Meeting Specialist. Transform raw meeting notes or bullet dumps into an actionable, crisp brief.
${CORE_PROPORTIONALITY_RULES}
Structure (scale sections to input volume):
- ### Context & Goal (brief 1-sentence recap)
- ### Decisions Agreed Upon (unambiguous bullet points)
- ### Action Items (checklist with Task, Owner [if mentioned or 'TBD'], and Priority)
- ### Open Questions (if any follow-up is noted)
Be concise and eliminate conversational filler.`,
  },

  QUICK_POLISH: {
    id: "quick-polish",
    name: "Quick Polish & Summary",
    description: "Cleans grammar, improves flow, and provides an executive summary without altering original structure.",
    systemPrompt: `You are Cognify's Executive Writing Specialist. Polish raw notes for maximum clarity, clean flow, and readability.
${CORE_PROPORTIONALITY_RULES}
Structure:
- ### Quick Summary (1-2 punchy sentences)
- ### Polished Notes (the user's notes cleaned up with professional formatting, bullet hierarchy, and bold emphasis)
- ### Key Takeaways (3-4 bullet points)
Strictly preserve the author's meaning and tone without inflating the content.`,
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

export const buildEnhancementPrompt = ({
  rawContent,
  frameworkId = null,
  customInstructions = null,
  presetInstructions = null,
}) => {
  // If specific framework passed, validate own property or fall back to auto-detect
  let framework =
    frameworkId && Object.prototype.hasOwnProperty.call(FRAMEWORK_MAP, frameworkId)
      ? FRAMEWORK_MAP[frameworkId]
      : null;
  if (!framework) {
    framework = detectFramework(rawContent);
  }

  let systemPrompt = framework.systemPrompt;

  // If preset has custom instructions from user overrides, incorporate them
  if (presetInstructions && presetInstructions.trim()) {
    systemPrompt += `\n\nCUSTOM FRAMEWORK GUIDELINES:
${presetInstructions.trim().slice(0, 2000)}`;
  }

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

export async function* streamNoteEnhancement({
  rawContent,
  frameworkId = null,
  customInstructions = null,
  presetInstructions = null,
}) {
  const { framework, messages } = buildEnhancementPrompt({
    rawContent,
    frameworkId,
    customInstructions,
    presetInstructions,
  });

  // Attempt Groq streaming first, fallback to Mistral if needed
  let stream;
  try {
    if (envConfig.GROQ_API_KEY && envConfig.GROQ_API_KEY !== "mock_key") {
      const model = getGroqModelInstance({ temperature: 0.2 });
      stream = await model.stream(messages);
    } else {
      const model = getMistralModel({ temperature: 0.2 });
      stream = await model.stream(messages);
    }
  } catch (providerError) {
    console.warn("[Note Enhancer] Primary model failed, falling back to Mistral:", providerError.message);
    const fallbackModel = getMistralModel({ temperature: 0.2 });
    stream = await fallbackModel.stream(messages);
  }

  for await (const chunk of stream) {
    const text = chunk.content;
    if (text && typeof text === "string") {
      yield { content: text };
    }
  }
}

// ─── 5. Auto-Title Generation & Safe Persistence ──────────────────────────────

/**
 * Checks if a note is untitled and generates a concise 3-5 word title.
 * Persists the title to the database via noteRepository.
 * Safely wrapped in try/catch so title generation never blocks or fails enhancement streaming.
 *
 * @param {Object} params
 * @param {Object} params.note - The existing note document.
 * @param {string} params.userId - User ID.
 * @returns {Promise<string|null>} The generated clean title or null if skipped/failed.
 */
export const generateAndPersistTitleIfUntitled = async ({ note, userId }) => {
  try {
    const rawTitle = (note?.title || "").trim();
    const isUntitled = !rawTitle || rawTitle === "Untitled Note" || rawTitle === "New Note";
    if (!isUntitled) return null;

    const content = (note?.originalContent || "").trim();
    if (!content) return null;

    const promptMessages = [
      new SystemMessage(
        "You are an expert editor. Generate a concise, meaningful 3 to 5 word title for the user's raw notes. " +
        "Return ONLY the plain title text without quotes, punctuation, asterisks, or prefix labels."
      ),
      new HumanMessage(content.slice(0, 500)),
    ];

    let responseText = "";
    try {
      if (envConfig.NODE_ENV !== "test" && envConfig.GROQ_API_KEY && envConfig.GROQ_API_KEY !== "mock_key") {
        const model = getGroqModelInstance({ temperature: 0.2, maxTokens: 30 });
        const res = await model.invoke(promptMessages);
        responseText = typeof res.content === "string" ? res.content : "";
      } else if (envConfig.NODE_ENV !== "test" && envConfig.MISTRAL_API_KEY && envConfig.MISTRAL_API_KEY !== "mock_key") {
        const model = getMistralModel({ temperature: 0.2, maxTokens: 30 });
        const res = await model.invoke(promptMessages);
        responseText = typeof res.content === "string" ? res.content : "";
      }
    } catch (llmErr) {
      console.warn("[Note Enhancer] LLM title inference failed, using fallback:", llmErr.message);
    }

    // Strip surrounding quotes, asterisks, newlines, and trailing punctuation
    let cleanTitle = responseText
      .replace(/^["'`#*\s]+|["'`#*.\s]+$/g, "")
      .replace(/[\r\n]+/g, " ")
      .trim();

    // Fallback if model was skipped, returned empty, or threw an error
    if (!cleanTitle || cleanTitle.length > 60) {
      const firstLine = content.split("\n")[0].replace(/[#*`_]/g, "").trim();
      cleanTitle = firstLine.slice(0, 40) || "Untitled Note";
    }

    if (cleanTitle && cleanTitle !== "Untitled Note") {
      const updated = await noteRepository.update(
        note._id,
        userId,
        { title: cleanTitle },
        { title: note.title }
      );
      if (updated) return cleanTitle;
      return null;
    }
    return null;
  } catch (err) {
    console.warn("[Note Enhancer] Auto-title generation failed non-fatally:", err.message);
    return null;
  }
};
