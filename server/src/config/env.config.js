import dotenv from "dotenv";

dotenv.config();

const envConfig = Object.freeze({
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  ACCESS_TOKEN_COOKIE_MAX_AGE: parseInt(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE) || 15 * 60 * 1000, // 15 mins default
  REFRESH_TOKEN_COOKIE_MAX_AGE: parseInt(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days default
});

export default envConfig;
