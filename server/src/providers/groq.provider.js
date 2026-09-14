import { ChatGroq } from "@langchain/groq";
import envConfig from "../config/env.config.js";

// Production ready Groq model configuration
// Free tier: ~14,400 req/day on llama-3.1-8b-instant, no credit card needed
const getGroqModel = (options = {}) => {
  return new ChatGroq({
    model: options.model || "groq/compound-mini",
    apiKey: envConfig.GROQ_API_KEY,
    temperature: options.temperature ?? 0.7,
    maxRetries: options.maxRetries ?? 3,
    ...options,
  });
};

export const getGroqModelInstance = () => getGroqModel();

export default getGroqModel;
