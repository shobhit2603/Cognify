import rateLimit from "express-rate-limit";
import { RateLimiterMemory } from "rate-limiter-flexible";
import ApiResponse from "../utils/apiResponse.util.js";
import { StatusCodes } from "http-status-codes";
import envConfig from "../config/env.config.js";

/**
 * Global API Rate Limiter
 * Limits each IP across general routes. In development, generous limit prevents false 429 lockouts
 * during active polling or multi-tab usage.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: envConfig.NODE_ENV === "development" ? 2000 : 500, // Limit each IP per windowMs
  skip: (req) => {
    // Exclude read-only document polling requests from consuming the rate limit budget using exact route pathname
    if (req.method !== "GET") return false;
    const pathname = (req.baseUrl || "") + (req.path || "");
    return pathname === "/api/v1/documents" || pathname.startsWith("/api/v1/documents/");
  },
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(
      ApiResponse(
        StatusCodes.TOO_MANY_REQUESTS,
        "Too many requests from this IP, please try again after 15 minutes"
      )
    );
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Auth Rate Limiter
 * Stricter limit for authentication routes to prevent brute-force attacks.
 * Limits each IP to 10 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: envConfig.NODE_ENV === "test" ? 100 : 10,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(
      ApiResponse(
        StatusCodes.TOO_MANY_REQUESTS,
        "Too many authentication attempts, please try again after 15 minutes"
      )
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI Endpoints Rate Limiter (Token Bucket)
 * Allows a burst of 5 requests, and then replenishes 1 token every 10 seconds.
 * This is perfect for chat apps where users might send a few messages rapidly,
 * but shouldn't spam the system continuously.
 */
const aiRateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests (burst capacity)
  duration: 10, // Per 10 seconds, replenishes points completely over the duration? 
  // Wait, RateLimiterFlexible points/duration means "Consume up to 5 points per 10 seconds".
  // To do a true token bucket where we replenish 1 token every X seconds, we can do this:
});

// Let's configure RateLimiterMemory properly for a bursty Token Bucket.
// points: Max number of points in the bucket.
// duration: Time to reset points in seconds.
const aiTokenBucketLimiter = new RateLimiterMemory({
  points: 5, // Maximum 5 requests
  duration: 60, // Reset points every 60 seconds (so 5 requests per minute allowed)
  // To implement a smooth token bucket, rate-limiter-flexible works out of the box with points & duration.
});

export const aiEndpointLimiter = async (req, res, next) => {
  try {
    const key = req.user?._id ? req.user._id.toString() : req.ip; // Rate limit by User ID if logged in, else by IP
    await aiTokenBucketLimiter.consume(key, 1); // Consume 1 point
    next();
  } catch (rejRes) {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(
      ApiResponse(
        StatusCodes.TOO_MANY_REQUESTS,
        "You are sending messages too fast. Please wait a moment before sending another.",
        {
          retrySecs: Math.round(rejRes.msBeforeNext / 1000) || 1
        }
      )
    );
  }
};
