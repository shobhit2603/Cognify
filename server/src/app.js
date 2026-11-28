import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import envConfig from "./config/env.config.js";
import ApiResponse from "./utils/apiResponse.util.js";
import errorHandler from "./middlewares/error.middleware.js";
import passport from "passport";
import { configurePassport } from "./config/passport.config.js";

// Routes imports
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import documentRoutes from "./routes/document.routes.js";
import noteRoutes from "./routes/note.routes.js";
import noteFolderRoutes from "./routes/noteFolder.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import writingRoutes from "./routes/writing.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";

const app = express();

// Enable trust proxy for reverse proxies (Render, Heroku, Vercel)
app.set("trust proxy", 1);

// Initialize Passport.js
configurePassport();
app.use(passport.initialize());

// ─── Global Middlewares ──────────────────────────────────

// CORS configuration (must precede helmet and rate limiters to properly handle preflight OPTIONS)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow localhost or local network IPs for development
      if (
        envConfig.NODE_ENV === "development" &&
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      // Check against configured allowed origins (normalized for trailing slashes)
      const allowedOrigins = (Array.isArray(envConfig.ALLOWED_ORIGINS)
        ? envConfig.ALLOWED_ORIGINS
        : [envConfig.ALLOWED_ORIGINS]
      ).map((o) => (typeof o === "string" ? o.trim().replace(/\/+$/, "") : o));
      const normalizedOrigin = typeof origin === "string" ? origin.trim().replace(/\/+$/, "") : origin;

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "x-file-name",
      "x-title",
      "x-file-size",
    ],
  }),
);

// Block state-changing requests from disallowed cross-origins before auth/routing executes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const isDevLocal =
    envConfig.NODE_ENV === "development" &&
    /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin);
  const allowedOrigins = (Array.isArray(envConfig.ALLOWED_ORIGINS)
    ? envConfig.ALLOWED_ORIGINS
    : [envConfig.ALLOWED_ORIGINS]
  ).map((o) => (typeof o === "string" ? o.trim().replace(/\/+$/, "") : o));
  const normalizedOrigin = typeof origin === "string" ? origin.trim().replace(/\/+$/, "") : origin;

  if (isDevLocal || allowedOrigins.includes(normalizedOrigin)) {
    return next();
  }

  return res
    .status(StatusCodes.FORBIDDEN)
    .json(ApiResponse(StatusCodes.FORBIDDEN, "Cross-origin request blocked by security policy"));
});

// Security middleware configured to permit cross-origin resource sharing from client
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Apply global rate limiter
app.use(globalLimiter);

// Allow larger JSON payloads specifically for AI Writing (job descriptions & edited drafts)
app.use("/api/v1/writing", express.json({ limit: "64kb" }));

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
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/note-folders", noteFolderRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/writing", writingRoutes);

// ─── API Documentation ───────────────────────────────────

if (envConfig.NODE_ENV === "development") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ─── Health Check ────────────────────────────────────────

app.get("/api/v1/health", (_req, res) => {
  res.status(StatusCodes.OK).json(
    ApiResponse(StatusCodes.OK, "Cognify server is running healthy ", {
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
