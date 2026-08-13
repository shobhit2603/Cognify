import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET environment variable is required.");
}

const envConfig = Object.freeze({
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  ACCESS_TOKEN_COOKIE_MAX_AGE: parseInt(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE) || 15 * 60 * 1000, // 15 mins default
  REFRESH_TOKEN_COOKIE_MAX_AGE: parseInt(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days default
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
});

export default envConfig;
