import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getGroqModelInstance } from "../providers/groq.provider.js";
import getGroqModel from "../providers/groq.provider.js";
import { ragSearch } from "../tools/rag.tool.js";
import { search } from "../tools/search.tool.js";

// ─── System Prompt ────────────────────────────────────────────────────────────
const DEFAULT_SYSTEM_PROMPT = `You are Cognify, a highly intelligent, versatile, and helpful AI assistant equipped with real-time web search and document analysis capabilities.
When live web search results or document references are provided:
- You have active, real-time live web access enabled. Never claim you cannot access current information or browse the web when search results are present in the context.
- Directly synthesize the retrieved information, quoting up-to-date facts, current prices, figures, and dates clearly.
- Include source citations in Markdown format (e.g. [Source Name](URL)) from the provided search results where helpful.
- Provide concise, clear, and direct answers without unnecessary disclaimers.`;

// ─── Intent Detection ─────────────────────────────────────────────────────────
// Simple heuristic — avoids an extra LLM call to decide which tools to invoke.

function needsWebSearch(message) {
  const webKeywords = [
    /latest|current|today|todays|now|recent|news|price|gold|silver|weather|stock|score|trending/i,
    /what (is|are) .*(in \d{4}|right now|currently|today)/i,
    /who (won|is|are|did)/i,
    /when (did|is|was|will)/i,
    /how (much|many|do i|does|to)/i,
  ];
  return webKeywords.some((re) => re.test(message));
}

function needsRagSearch(message) {
  const ragKeywords = [
    /document|pdf|file|upload|internship|resume|cv|report/i,
    /according to|in the (doc|file|pdf)/i,
    /what (does the|is in the)/i,
  ];
  return ragKeywords.some((re) => re.test(message));
}

// ─── Context Builder ──────────────────────────────────────────────────────────
// Max characters per web result — keeps total prompt within Groq's token limit.
const MAX_WEB_RESULT_CHARS = 2500;
const MAX_WEB_RESULTS = 5;

async function buildContext(content, chatId) {
  const context = [];

  const ragNeeded = needsRagSearch(content);
  const webNeeded = needsWebSearch(content);

  // Run non-conflicting searches in parallel
  const [ragResult, webResult] = await Promise.allSettled([
    ragNeeded ? ragSearch({ query: content, chatId }) : Promise.resolve(null),
    webNeeded ? search({ query: content }) : Promise.resolve(null),
  ]);

  if (ragNeeded) {
    if (ragResult.status === "rejected") {
      throw new Error("RAG operational failure: unable to retrieve context.");
    }
    if (
      ragResult.status === "fulfilled" &&
      ragResult.value &&
      ragResult.value !== "No relevant information found in the documents."
    ) {
      context.push(`--- Document Context ---\n${ragResult.value}`);
    }
  }

  if (
    webNeeded &&
    webResult.status === "fulfilled" &&
    webResult.value &&
    webResult.value !== "Failed to fetch web results."
  ) {
    // Truncate each result and cap the total number to avoid exceeding token limits
    const rawResults = webResult.value.split(/\n\n---\n\n|\n\n --- \n\n/);
    const truncated = rawResults
      .slice(0, MAX_WEB_RESULTS)
      .map((r) => (r.length > MAX_WEB_RESULT_CHARS ? r.slice(0, MAX_WEB_RESULT_CHARS) + "…" : r))
      .join("\n\n---\n\n");
    context.push(`--- Web Search Results ---\n${truncated}`);
  }

  return context.join("\n\n");
}

// ─── Main AI Response (Streaming) ────────────────────────────────────────────
export async function* getAIResponse({ content, history = [], systemPrompt = null, chatId = null }) {
  try {
    if (!chatId) {
      throw new Error("chatId is required for AI context scoping.");
    }

    if (!content && (!history || history.length === 0)) {
      throw new Error("Content or conversation history is required.");
    }

    // 1. Gather context from RAG / web search with dynamic stage feedback
    const ragNeeded = needsRagSearch(content);
    const webNeeded = needsWebSearch(content);

    if (webNeeded) {
      yield { event: "stage", stage: "web", message: "Searching the live web...", step: 1 };
    } else if (ragNeeded) {
      yield { event: "stage", stage: "docs", message: "Scanning document context...", step: 1 };
    } else {
      yield { event: "stage", stage: "reasoning", message: "Analyzing query & context...", step: 1 };
    }

    const retrievedContext = await buildContext(content, String(chatId));

    yield { event: "stage", stage: "synthesizing", message: "Synthesizing response...", step: 2 };

    // 2. Build the system prompt (trusted instructions only)
    const finalSystemPrompt = `${systemPrompt || DEFAULT_SYSTEM_PROMPT}\nCurrent date and time: ${new Date().toLocaleString()}`;
    
    const messages = [new SystemMessage(finalSystemPrompt)];

    if (retrievedContext) {
      messages.push(new HumanMessage(`--- RETRIEVED REAL-TIME CONTEXT & WEB SOURCES ---
The following verified web search results and document context were dynamically retrieved for this query. Use this real-time information to answer the user's question accurately with up-to-date facts, figures, dates, and sources:

${retrievedContext}
-------------------------------------------------`));
    }

    // 3. Format conversation history
    for (const msg of history) {
      const role = msg.role === "ai" ? "assistant" : msg.role;
      if (role === "assistant") {
        messages.push(new AIMessage(msg.content));
      } else if (role === "system") {
        messages.push(new SystemMessage(msg.content));
      } else if (role === "user") {
        messages.push(new HumanMessage(msg.content));
      }
    }
    messages.push(new HumanMessage(content || "Continue"));

    // 4. Stream the response directly — no agent, no tool calling
    const stream = await getGroqModelInstance().stream(messages);

    for await (const chunk of stream) {
      const chunkContent = chunk.content;
      if (chunkContent && typeof chunkContent === "string") {
        yield { content: chunkContent };
      }
    }
  } catch (error) {
    console.error("[AI Service Error] getAIResponse failed:", error.message);
    throw new Error("Failed to get AI response. Please try again later.");
  }
}

// ─── Title Generation ─────────────────────────────────────────────────────────
export async function getTitle({ message }) {
  try {
    if (!message) throw new Error("Message is required to generate a title.");

    const titleModel = getGroqModelInstance();

    const response = await titleModel.invoke([
      [
        "system",
        "You are a helpful assistant that generates concise, engaging titles for chat conversations. Output ONLY the title text, maximum 5 words, without any quotes or prefixes.",
      ],
      ["user", `Generate a title for: "${message}"`],
    ]);

    const cleanTitle = response.content.replace(/[\"']/g, "").trim();
    return { chatTitle: cleanTitle || "New Chat" };
  } catch (error) {
    console.error("[AI Service Error] getTitle failed:", error.message);
    return { chatTitle: "New Conversation" };
  }
}
