import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { v4 as uuidv4 } from "uuid";
import envConfig from "../config/env.config.js";

const tvly = tavily({ apiKey: envConfig.TAVILY_API_KEY });

export async function search({ query }) {
    const reqId = uuidv4();
    console.log(`[Search Tool] Request ${reqId} started for query: "${query}"`);
    const startTime = Date.now();

    try {
        const response = await tvly.search(query, {
            searchDepth: "advanced",
            maxResults: 5,
            includeAnswer: true,
        });

        const formattedParts = [];

        // Include Tavily's direct synthesized answer if available
        if (response.answer && response.answer.trim()) {
            formattedParts.push(`Direct Live Summary: ${response.answer.trim()}`);
        }

        // Include sources with title, URL, and content snippet for accurate LLM attribution
        if (Array.isArray(response.results) && response.results.length > 0) {
            response.results.forEach((r, idx) => {
                const title = r.title ? r.title.trim() : `Source ${idx + 1}`;
                const url = r.url || "";
                const snippet = r.content ? r.content.trim() : "";
                formattedParts.push(`Source [${idx + 1}]: [${title}](${url})\n${snippet}`);
            });
        }

        console.log(`[Search Tool] Request ${reqId} completed. Found ${response.results?.length || 0} results in ${Date.now() - startTime}ms.`);

        return formattedParts.join("\n\n---\n\n");
    } catch (error) {
        console.error(`[Search Tool] Request ${reqId} failed:`, error.message);
        return "Failed to fetch web results.";
    }
}

// Wrapper for Langchain Agent
export const searchTool = tool(
  async ({ query }) => {
    return await search({ query });
  },
  {
    name: "search_tool",
    description:
      "Use this tool to find the latest information on the internet. Use this ONLY if the information is not in the user's provided documents.",
    schema: z.object({
      query: z.string().describe("The search query to find information about"),
    }),
  }
);
