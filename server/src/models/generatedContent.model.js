import mongoose, { Schema } from "mongoose";

const writingInputsSchema = new Schema(
  {
    // Email Writer inputs
    purpose: { type: String, trim: true, default: "" },
    intent: { type: String, trim: true, default: "" },
    context: { type: String, trim: true, default: "" },
    replyToEmail: { type: String, trim: true, default: "" },
    recipientContext: { type: String, trim: true, default: "" },
    tone: { type: String, trim: true, default: "professional" },
    formality: { type: String, trim: true, default: "semi-formal" },
    length: { type: String, trim: true, default: "medium" },

    // Cover Letter inputs
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    resumeTitle: { type: String, trim: true, default: "" },
    userBackground: { type: String, trim: true, default: "" },
    jobDescription: { type: String, trim: true, default: "" },
    targetCompany: { type: String, trim: true, default: "" },
    targetRole: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const writingMetadataSchema = new Schema(
  {
    model: { type: String, default: null },
    provider: { type: String, default: null },
    lastRefinedAction: { type: String, default: null },
    generatedAt: { type: Date, default: null },
    isPartial: { type: Boolean, default: false },
  },
  { _id: false }
);

const generatedContentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email", "cover-letter"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Draft",
      trim: true,
      maxlength: 140,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    inputs: {
      type: writingInputsSchema,
      default: () => ({}),
    },
    generatedContent: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    previousContent: {
      type: String,
      default: null,
    },
    previousSubject: {
      type: String,
      default: null,
    },
    metadata: {
      type: writingMetadataSchema,
      default: () => ({}),
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    revision: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes aligned with user draft listing, filtering, and dashboard queries
generatedContentSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
generatedContentSchema.index({ userId: 1, type: 1, isPinned: -1, updatedAt: -1 });

export const GeneratedContent = mongoose.model(
  "GeneratedContent",
  generatedContentSchema
);
