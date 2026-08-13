import { ChatMistralAI } from "@langchain/mistralai";
import envConfig from "../config/env.config.js";

// Production ready model configuration
const getMistralModel = (options = {}) => {
  return new ChatMistralAI({
    model: options.model || "mistral-medium-latest",
    apiKey: envConfig.MISTRAL_API_KEY,
    temperature: options.temperature || 0.7,
    maxRetries: options.maxRetries || 3,
    ...options,
  });
};

export const defaultMistralModel = getMistralModel();

export default getMistralModel;
