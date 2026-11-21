import { ChatGroq } from "@langchain/groq";
import envConfig from "../config/env.config.js";

// Production ready Groq model configuration
const getGroqModel = (options = {}) => {
  return new ChatGroq({
    model: options.model || process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    apiKey: envConfig.GROQ_API_KEY,
    temperature: options.temperature ?? 0.7,
    maxRetries: options.maxRetries ?? 3,
    ...options,
  });
};

export const getGroqModelInstance = () => getGroqModel();

export default getGroqModel;
