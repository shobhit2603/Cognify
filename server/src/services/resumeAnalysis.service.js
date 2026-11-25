import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.util.js";
import { getGroqModelInstance } from "../providers/groq.provider.js";
import getMistralModel from "../providers/mistral.provider.js";
import envConfig from "../config/env.config.js";
import * as resumeRepository from "../repositories/resume.repository.js";

// ─── 1. System Prompt Definitions ─────────────────────────────────────────────

const ATS_AUDIT_SYSTEM_PROMPT = `You are Cognify's Principal ATS Architect and Executive Recruiter.
Analyze the provided resume with algorithmic rigor.
Score the resume across 4 core ATS dimensions on a strict 0-25 scale (total 0-100):
1. formatting: Header readability, contact info, standard section headers, ATS parseability (0-25).
2. impactAndMetrics: Strong past-tense action verbs (e.g. Engineered, Spearheaded), quantifiable metrics (Google X-Y-Z formula), impact clarity (0-25).
3. skillsAndKeywords: Hard skills vs soft skills categorization, industry tech keyword density, keyword relevance (0-25).
4. sectionStructure: Completeness of summary, experience, education, projects, timeline continuity (0-25).

If a Job Description is provided, calculate alignment, extract missing critical keywords, and list matched keywords.

CRITICAL FORMATTING RULES:
- DO NOT use decorative emojis (e.g. 🎯, 📐, ⚡, 🔑, 📋, etc.) anywhere in your output keys, recommendations, or section feedback. Maintain an executive, recruiter-grade, analytical tone with standard technical terminology.
- Return ONLY a valid, parseable JSON object matching this exact schema without markdown backticks or explanation:
{
  "overallScore": number, // Sum of subScores (0-100)
  "subScores": {
    "formatting": number, // 0-25
    "impactAndMetrics": number, // 0-25
    "skillsAndKeywords": number, // 0-25
    "sectionStructure": number // 0-25
  },
  "keyProblems": [string, string, string],
  "whyItMatters": [string, string, string],
  "actionableRecommendations": [string, string, string, string],
  "strongSections": [
    { "name": string, "score": number, "feedback": string }
  ],
  "weakSections": [
    { "name": string, "score": number, "feedback": string }
  ],
  "missingKeywords": [string],
  "matchedKeywords": [string]
}`;

const RESUME_CHAT_SYSTEM_PROMPT = `You are Cognify's Dedicated Resume Studio AI Copilot.
You have the complete raw text and parsed sections of the candidate's resume in your active context.
Assist the candidate with high-impact, professional resume guidance.

RULES:
- STRICT FORMATTING: DO NOT use decorative emojis (e.g., 🎯, 🚀, 📐, ⚡, 🔑, 📋, etc.) anywhere in headings, bullet points, or responses. Rely on clean Markdown hierarchy (bold headings, concise bullet points, code blocks, and quantified metrics) for a sharp, executive recruiter tone.
- When the user asks to rewrite, optimize, or improve bullets:
  ALWAYS use the Google X-Y-Z formula: "Accomplished [X] as measured by [Y] by doing [Z]".
  Use strong past-tense action verbs (e.g., Engineered, Spearheaded, Optimized, Orchestrated) instead of passive verbs (Worked on, Assisted, Responsible for).
  Where applicable, present changes in a clear "Before vs After" Markdown format:
  **Original:** ...
  **Optimized:** ...
  **Why It Works:** ...
- In 'jd-match' mode: Compare the resume with the target Job Description. Highlight keyword gaps, role fit percentage, and tailored advice for that exact role.
- In 'optimize-section' mode: Focus deeply on the targeted section (Experience, Summary, Skills, or Projects) without generic fluff.
- Keep tone professional, direct, encouraging, and recruiter-focused.`;

// ─── 2. Helpers ───────────────────────────────────────────────────────────────

function getActiveModel(options = {}) {
  if (
    envConfig.NODE_ENV !== "test" &&
    envConfig.GROQ_API_KEY &&
    envConfig.GROQ_API_KEY !== "mock_key"
  ) {
    return getGroqModelInstance(options);
  }
  if (
    envConfig.NODE_ENV !== "test" &&
    envConfig.MISTRAL_API_KEY &&
    envConfig.MISTRAL_API_KEY !== "mock_key"
  ) {
    return getMistralModel(options);
  }
  return null;
}

function extractJsonFromLlmOutput(text) {
  if (!text || typeof text !== "string") return null;
  const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─── 3. Full ATS Diagnostic Audit ─────────────────────────────────────────────

export const runResumeAudit = async ({ resumeId, userId, jobDescription, targetRole }) => {
  const resume = await resumeRepository.findResumeById(resumeId);
  if (!resume) {
    throw ApiError(StatusCodes.NOT_FOUND, "Resume not found");
  }
  if (resume.userId.toString() !== userId.toString()) {
    throw ApiError(StatusCodes.FORBIDDEN, "Access denied: You do not own this resume");
  }

  const resolvedTargetRole = targetRole !== undefined ? targetRole : (resume.latestAudit?.targetRole || "");
  const resolvedJobDescription = jobDescription !== undefined ? jobDescription : (resume.latestAudit?.targetJobDescription || "");

  const promptContent = `
--- CANDIDATE RESUME ---
Title: ${resume.title}
File Name: ${resume.originalName}
Content:
${resume.rawText}

--- TARGET CONTEXT ---
Target Role: ${resolvedTargetRole || "General Software/Tech Industry"}
Job Description:
${resolvedJobDescription || "No specific job description provided. Audit against modern industry standards."}
`;

  let auditResult = null;
  const model = getActiveModel({ temperature: 0.1 });

  if (model) {
    try {
      const messages = [
        new SystemMessage(ATS_AUDIT_SYSTEM_PROMPT),
        new HumanMessage(promptContent),
      ];
      const res = await model.invoke(messages);
      const textOutput = typeof res.content === "string" ? res.content : "";
      auditResult = extractJsonFromLlmOutput(textOutput);
    } catch (llmErr) {
      console.warn("[Resume Audit] LLM invocation failed, using fallback rubric:", llmErr.message);
    }
  }

  // Validate auditResult structure and ensure each dimension is finite and within 0-25
  const isValidDimension = (s) => typeof s === "number" && Number.isFinite(s) && s >= 0 && s <= 25;
  const subScoreObj = auditResult?.subScores;
  const isValidAudit =
    auditResult &&
    subScoreObj &&
    isValidDimension(subScoreObj.formatting) &&
    isValidDimension(subScoreObj.impactAndMetrics) &&
    isValidDimension(subScoreObj.skillsAndKeywords) &&
    isValidDimension(subScoreObj.sectionStructure) &&
    Array.isArray(auditResult.actionableRecommendations) &&
    Array.isArray(auditResult.keyProblems);

  // Fallback heuristic scoring if model is absent or parsing/validation failed
  if (!isValidAudit) {
    const hasEmail = Boolean(resume.rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/));
    const hasPhone = Boolean(resume.rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/));
    const hasNumbers = Boolean(resume.rawText.match(/\d+%/g) || resume.rawText.match(/\$\d+/g));
    const hasExperience = /experience|employment|work history/i.test(resume.rawText);
    const hasSkills = /skills|technologies|stack/i.test(resume.rawText);

    const fmtScore = (hasEmail ? 10 : 4) + (hasPhone ? 8 : 4) + (hasExperience ? 7 : 3);
    const impactScore = (hasNumbers ? 18 : 10) + (/spearheaded|architected|engineered|optimized/i.test(resume.rawText) ? 7 : 4);
    const skillScore = (hasSkills ? 20 : 12);
    const structScore = 18;
    const overall = fmtScore + impactScore + skillScore + structScore;

    const matchSkillName = (text, skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(^|[^a-zA-Z0-9+#])${escaped}(?=[^a-zA-Z0-9+#]|$)`, "i");
      return pattern.test(text);
    };

    const candidateTech = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "SQL", "MongoDB", "AWS", "Docker", "Git", "REST APIs", "GraphQL"];
    const dynamicMatched = candidateTech.filter((kw) => matchSkillName(resume.rawText, kw));
    const jdKeywords = resolvedJobDescription
      ? ["System Design", "Cloud Infrastructure", "CI/CD", "Kubernetes", "Microservices"].filter((kw) => !matchSkillName(resume.rawText, kw))
      : [];

    auditResult = {
      overallScore: Math.min(100, Math.max(20, overall)),
      subScores: {
        formatting: fmtScore,
        impactAndMetrics: impactScore,
        skillsAndKeywords: skillScore,
        sectionStructure: structScore,
      },
      keyProblems: [
        "Metrics and quantifiable impact could be expanded across project bullets.",
        "Missing clear target role keywords in the professional summary.",
        "Section headers should strictly follow standard ATS conventions.",
      ],
      whyItMatters: [
        "ATS screeners rank resumes by keyword density and standardized headings.",
        "Recruiters look for verifiable metrics (revenue, latency, scale) within the first 6 seconds.",
      ],
      actionableRecommendations: [
        "Transform passive verbs (e.g., 'Worked on') into action verbs (e.g., 'Engineered').",
        "Add 1-2 quantified metrics per role using the Google X-Y-Z formula.",
        "Incorporate core tech stack keywords matching your target position.",
      ],
      strongSections: [
        { name: "Experience", score: 85, feedback: "Solid chronological structure with identifiable roles." },
        { name: "Contact Information", score: 90, feedback: "Essential contact links are clearly reachable." },
      ],
      weakSections: [
        { name: "Summary", score: 60, feedback: "Executive summary lacks targeted keywords and career focus." },
        { name: "Skills", score: 65, feedback: "Categorize skills into Languages, Frameworks, and Cloud Infrastructure." },
      ],
      missingKeywords: jdKeywords,
      matchedKeywords: dynamicMatched.length > 0 ? dynamicMatched : ["Software Development", "Problem Solving"],
    };
  }

  // Ensure overallScore is strictly consistent with the sum of subScores
  const sub = auditResult.subScores;
  const computedOverall = Math.min(100, Math.max(0, (sub.formatting || 0) + (sub.impactAndMetrics || 0) + (sub.skillsAndKeywords || 0) + (sub.sectionStructure || 0)));
  auditResult.overallScore = computedOverall;

  const finalAudit = {
    ...auditResult,
    targetRole: resolvedTargetRole,
    targetJobDescription: resolvedJobDescription,
    analyzedAt: new Date(),
  };

  // Update resume in database
  const updatedResume = await resumeRepository.updateLatestAudit(resumeId, finalAudit);

  // Structured audit event message (clean and emoji-free)
  const auditMessage = {
    role: "assistant",
    mode: "audit",
    content: `### ATS Optimization Audit Complete (Score: ${finalAudit.overallScore}/100)

**Diagnostic Breakdown:**
- Formatting & ATS Readability: ${finalAudit.subScores.formatting}/25
- Impact & Quantified Metrics: ${finalAudit.subScores.impactAndMetrics}/25
- Skills & Keyword Density: ${finalAudit.subScores.skillsAndKeywords}/25
- Section Completeness: ${finalAudit.subScores.sectionStructure}/25

**Top Recommendations:**
${finalAudit.actionableRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

*Ask anytime to rewrite weak bullets, roast specific sections, or compare against target job descriptions.*`,
    createdAt: new Date(),
  };

  return {
    latestAudit: finalAudit,
    message: auditMessage,
    resume: updatedResume,
  };
};

// ─── 4. Conversational Resume Chat Streaming ──────────────────────────────────

export async function* streamResumeChat({
  resumeId,
  userId,
  userMessage,
  mode = "general",
  jobDescription = "",
}) {
  const resume = await resumeRepository.findResumeById(resumeId);
  if (!resume) {
    throw ApiError(StatusCodes.NOT_FOUND, "Resume not found");
  }
  if (resume.userId.toString() !== userId.toString()) {
    throw ApiError(StatusCodes.FORBIDDEN, "Access denied: You do not own this resume");
  }

  // Save the user's incoming message
  const userMsgRecord = {
    role: "user",
    mode,
    content: userMessage,
    jobDescription: jobDescription || undefined,
    createdAt: new Date(),
  };
  await resumeRepository.appendResumeMessage(resumeId, userMsgRecord);

  let activeAudit = resume.latestAudit;

  // If in jd-match mode with a provided job description, also trigger an audit update
  if (mode === "jd-match" && jobDescription && jobDescription.trim()) {
    try {
      const auditRes = await runResumeAudit({
        resumeId,
        userId,
        jobDescription,
        targetRole: resume.latestAudit?.targetRole || "",
      });
      if (auditRes?.latestAudit) {
        activeAudit = auditRes.latestAudit;
      }
    } catch (auditErr) {
      console.warn("[Resume Chat] JD match audit re-run warning:", auditErr.message);
    }
  }

  // Build context for the LLM
  const history = (resume.messages || []).slice(-8).map((m) => {
    if (m.role === "user") return new HumanMessage(m.content);
    return new SystemMessage(m.content);
  });

  const promptContext = `
--- ACTIVE RESUME CONTEXT ---
Title: ${resume.title}
Candidate Name: ${resume.parsedSections?.contactInfo?.name || "Candidate"}
Current Overall ATS Score: ${activeAudit?.overallScore || 0}/100
Weak Sections: ${Array.isArray(activeAudit?.weakSections) && activeAudit.weakSections.length > 0 ? activeAudit.weakSections.map((w) => `${w.name} (${w.score}/100: ${w.feedback})`).join("; ") : "None"}
Missing Keywords: ${Array.isArray(activeAudit?.missingKeywords) && activeAudit.missingKeywords.length > 0 ? activeAudit.missingKeywords.join(", ") : "None"}
Resume Raw Text:
${resume.rawText}

--- MODE ---
Mode: ${mode}
${jobDescription ? `Job Description:\n${jobDescription}` : ""}

User Request:
${userMessage}
`;

  const messages = [
    new SystemMessage(RESUME_CHAT_SYSTEM_PROMPT),
    ...history,
    new HumanMessage(promptContext),
  ];

  let stream = null;
  const model = getActiveModel({ temperature: 0.3 });

  if (model) {
    try {
      stream = await model.stream(messages);
    } catch (llmErr) {
      console.warn("[Resume Chat] Streaming initialization failed:", llmErr.message);
    }
  }

  let accumulatedContent = "";

  if (stream) {
    for await (const chunk of stream) {
      const text = chunk.content;
      if (text && typeof text === "string") {
        accumulatedContent += text;
        yield { event: "chunk", content: text };
      }
    }
  } else {
    // Graceful fallback response when API keys are unconfigured or in test
    const fallbackResponse = `Here is my assessment of your request for **${resume.title}**:

### 💡 Recommendation for "${userMessage.slice(0, 50)}..."
1. **Apply the Google X-Y-Z formula:**
   - **Original:** Worked on backend services and fixed bugs.
   - **Optimized:** *Architected 6+ RESTful microservices in Node.js and MongoDB, slashing query latency by 38% under high load.*
2. **Keyword Optimization:**
   - Ensure you prominently feature core competencies in your skills section.
   - Align terminology directly with the recruiter's search criteria.

Would you like me to rewrite specific project bullets or tailor your experience section further?`;

    for (const char of fallbackResponse.split(" ")) {
      accumulatedContent += char + " ";
      yield { event: "chunk", content: char + " " };
    }
  }

  // Persist assistant response to the resume's message history
  const assistantMsgRecord = {
    role: "assistant",
    mode,
    content: accumulatedContent,
    createdAt: new Date(),
  };
  await resumeRepository.appendResumeMessage(resumeId, assistantMsgRecord);

  // Emit completion event
  yield {
    event: "done",
    message: assistantMsgRecord,
  };
}
