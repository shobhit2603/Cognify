import mongoose, { Schema } from "mongoose";

const messageSuggestionSchema = new Schema(
  {
    original: { type: String, trim: true },
    improved: { type: String, trim: true },
    reason: { type: String, trim: true },
  },
  { _id: false }
);

const resumeMessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["general", "audit", "optimize-section", "jd-match"],
      default: "general",
    },
    content: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      trim: true,
    },
    suggestions: [messageSuggestionSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const sectionEvaluationSchema = new Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

const latestAuditSchema = new Schema(
  {
    overallScore: { type: Number, default: 0 },
    subScores: {
      formatting: { type: Number, default: 0 },
      impactAndMetrics: { type: Number, default: 0 },
      skillsAndKeywords: { type: Number, default: 0 },
      sectionStructure: { type: Number, default: 0 },
    },
    keyProblems: [{ type: String, trim: true }],
    whyItMatters: [{ type: String, trim: true }],
    actionableRecommendations: [{ type: String, trim: true }],
    strongSections: [sectionEvaluationSchema],
    weakSections: [sectionEvaluationSchema],
    missingKeywords: [{ type: String, trim: true }],
    matchedKeywords: [{ type: String, trim: true }],
    targetRole: { type: String, trim: true },
    targetJobDescription: { type: String, trim: true },
    analyzedAt: { type: Date, default: null },
  },
  { _id: false }
);

const parsedSectionsSchema = new Schema(
  {
    contactInfo: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },
    summary: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experience: [Schema.Types.Mixed],
    education: [Schema.Types.Mixed],
    projects: [Schema.Types.Mixed],
  },
  { _id: false }
);

const resumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    storageProvider: {
      type: String,
      enum: ["s3", "local"],
      default: "local",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    rawText: {
      type: String,
      required: true,
    },
    parsedSections: {
      type: parsedSectionsSchema,
      default: () => ({}),
    },
    latestAudit: {
      type: latestAuditSchema,
      default: () => ({}),
    },
    messages: [resumeMessageSchema],
  },
  {
    timestamps: true,
  }
);

// High-speed compound index for user's history drawer and dashboard activities
resumeSchema.index({ userId: 1, updatedAt: -1 });

export const Resume = mongoose.model("Resume", resumeSchema);
