import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { defaultMistralModel } from "../providers/mistral.provider.js";
import getMistralModel from "../providers/mistral.provider.js";
import { ragSearch } from "../tools/rag.tool.js";
import { searchTool } from "../tools/search.tool.js";
import envConfig from "../config/env.config.js";

// Define the precise prompt for the agent
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "{system_prompt}"],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"), // Crucial for tool calling memory
]);

const DEFAULT_SYSTEM_PROMPT = `You are Cognify, a highly intelligent, helpful, and friendly AI assistant. 
When a user asks about a document or PDF, you MUST use the 'rag_tool' to fetch the context. 
If the answer is not found in the retrieved document context, state clearly that the document does not contain the information rather than making it up. Provide concise, clear, and accurate answers.`;

export async function* getAIResponse({ content, history = [], systemPrompt = null, chatId = null }) {
  try {
    if (!content && (!history || history.length === 0)) {
      throw new Error("Content or conversation history is required.");
    }

    // 1. Format System Prompt
    const finalSystemPrompt = `${systemPrompt || DEFAULT_SYSTEM_PROMPT}\nCurrent date and time: ${new Date().toLocaleString()}`;

    // 2. Format Conversation History into LangChain Message objects
    const formattedHistory = history.map((msg) => {
      const role = msg.role === "ai" ? "assistant" : msg.role;
      return role === "assistant"
        ? new AIMessage(msg.content)
        : new HumanMessage(msg.content);
    });

    // 3. Create dynamic tool to inject chatId
    const dynamic_rag_tool = tool(
      async ({ query }) => ragSearch({ query, chatId }),
      {
        name: "rag_tool",
        description:
          "MANDATORY tool to use when the user asks questions about their uploaded PDFs, documents, or internship details. Searches the vector database.",
        schema: z.object({
          query: z.string().describe("The specific query to search in the vector database"),
        }),
      }
    );

    const dynamicTools = [searchTool, dynamic_rag_tool];

    const dynamicAgent = createToolCallingAgent({
      llm: defaultMistralModel,
      tools: dynamicTools,
      prompt,
    });

    const dynamicExecutor = new AgentExecutor({
      agent: dynamicAgent,
      tools: dynamicTools,
      verbose: envConfig.NODE_ENV !== "production",
    });

    // 4. Execute the agent and stream events
    const events = dynamicExecutor.streamEvents(
      {
        input: content || "Continue",
        chat_history: formattedHistory,
        system_prompt: finalSystemPrompt,
      },
      { version: "v2" }
    );

    for await (const event of events) {
      // Stream only the final model output, ignoring the internal tool-calling thoughts
      if (
        event.event === "on_chat_model_stream" &&
        event.name === "ChatMistralAI"
      ) {
        const chunkContent = event.data.chunk.content;

        // Ensure we only yield actual text content, not tool invocation chunks
        if (chunkContent && typeof chunkContent === 'string') {
          yield { content: chunkContent };
        }
      }
    }
  } catch (error) {
    console.error("[AI Service Error] getAIResponse failed:", error.message);
    throw new Error("Failed to get AI response. Please try again later.");
  }
}

export async function getTitle({ message }) {
  try {
    if (!message) throw new Error("Message is required to generate a title.");

    const titleModel = getMistralModel({ temperature: 0.2, maxRetries: 2 });

    const response = await titleModel.invoke([
      [
        "system",
        "You are a helpful assistant that generates concise, engaging titles for chat conversations. Output ONLY the title text, maximum 5 words, without any quotes or prefixes.",
      ],
      ["user", `Generate a title for: "${message}"`],
    ]);

    const cleanTitle = response.content.replace(/["']/g, "").trim();
    return { chatTitle: cleanTitle || "New Chat" };
  } catch (error) {
    console.error("[AI Service Error] getTitle failed:", error.message);
    return { chatTitle: "New Conversation" };
  }
}
