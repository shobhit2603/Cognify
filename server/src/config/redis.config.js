import { Redis } from "ioredis";
import envConfig from "./env.config.js";

// Initialize Redis Client
let redisClient = null;
let isRedisAvailable = false;

if (envConfig.NODE_ENV !== "test" && envConfig.REDIS_URL && !envConfig.REDIS_URL.includes("dummy")) {
  try {
    let hasLoggedError = false;

    redisClient = new Redis(envConfig.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true, // Don't crash on boot if host is unreachable
      connectTimeout: 4000,
      retryStrategy(times) {
        if (times > 2) {
          if (!hasLoggedError) {
            console.warn(`\n⚠️  [Redis Notice] Unable to connect to Redis at "${envConfig.REDIS_URL}".`);
            console.warn(`   • Document processing will use the built-in direct background worker!\n`);
            hasLoggedError = true;
          }
          isRedisAvailable = false;
          return null; // Stop reconnecting to prevent unhandled error crashes
        }
        return 1500;
      },
    });

    redisClient.on("error", (error) => {
      isRedisAvailable = false;
      if (!hasLoggedError) {
        console.warn(`[Redis Notice] Connection failed (${error.code || error.message}). Falling back to direct worker.`);
        hasLoggedError = true;
      }
    });

    redisClient.on("connect", () => {
      hasLoggedError = false;
      isRedisAvailable = true;
      console.log("✅ Redis Connected Successfully");
    });

    // Attempt non-blocking connection
    redisClient.connect().catch(() => {
      isRedisAvailable = false;
    });
  } catch (error) {
    console.warn("⚠️ Failed to initialize Redis client:", error.message);
    redisClient = null;
    isRedisAvailable = false;
  }
} else if (envConfig.NODE_ENV !== "test") {
  console.log("ℹ️  REDIS_URL not configured. Using direct asynchronous worker for document processing.");
}

export { isRedisAvailable };
export default redisClient;
