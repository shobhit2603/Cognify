import { Redis } from "ioredis";
import envConfig from "../../config/env.config.js";

// Initialize Redis Client
let redisClient;

try {
  redisClient = new Redis(envConfig.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  redisClient.on("error", (error) => {
    console.error("Redis Connection Error:", error);
  });

  redisClient.on("connect", () => {
    console.log("Redis Connected Successfully");
  });
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
}

export default redisClient;
