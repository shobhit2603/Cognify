import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { StatusCodes } from "http-status-codes";
import envConfig from "./config/env.config.js";
import ApiResponse from "./utils/apiResponse.util.js";
import errorHandler from "./middlewares/error.middleware.js";
import passport from "passport";
import { configurePassport } from "./config/passport.config.js";

// Routes imports
import authRoutes from "./routes/auth.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";

const app = express();

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// ─── Global Middlewares ──────────────────────────────────

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow localhost or local network IPs for development
      if (envConfig.NODE_ENV === "development" && /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Check against configured allowed origins
      const allowedOrigins = Array.isArray(envConfig.ALLOWED_ORIGINS) ? envConfig.ALLOWED_ORIGINS : [envConfig.ALLOWED_ORIGINS];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parse JSON request bodies
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Parse cookies
app.use(cookieParser());

// HTTP request logger (dev mode)
if (envConfig.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── API Versioning ──────────────────────────────────────

// v1 routes
app.use("/api/v1/auth", authRoutes);

// ─── API Documentation ───────────────────────────────────

if (envConfig.NODE_ENV === "development") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ─── Health Check ────────────────────────────────────────

app.get("/api/v1/health", (_req, res) => {
  res.status(StatusCodes.OK).json(
    ApiResponse(StatusCodes.OK, "Server is running healthy ", {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
});

// ─── 404 Handler ─────────────────────────────────────────

app.use((_req, res) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .json(ApiResponse(StatusCodes.NOT_FOUND, "Route not found"));
});

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

export default app;
