import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";
import envConfig from "../config/env.config.js";

const tvly = tavily({ apiKey: envConfig.TAVILY_API_KEY });

export async function search({ query }) {
    console.log("========================================================")
    console.log("using search tool with query =>", query)
    console.log("========================================================")

    try {
        const response = await tvly.search(query, {
            searchDepth: "advanced",
            maxResults: 5,
        })

        const results = response.results.map(r => r.content)

        console.log("========================================================")
        console.log("results =>", results)
        console.log("========================================================")

        return results.join("\n\n --- \n\n")
    } catch (error) {
        console.error("Tavily search error:", error);
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
