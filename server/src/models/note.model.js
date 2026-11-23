import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "NoteFolder",
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Note",
      trim: true,
      maxlength: 120,
    },
    originalContent: {
      type: String,
      default: "",
    },
    enhancedContent: {
      type: String,
      default: "",
    },
    previousEnhancedContent: {
      type: String,
      default: null,
    },
    enhancedMetadata: {
      frameworkUsed: {
        type: String,
        default: null,
      },
      enhancedAt: {
        type: Date,
        default: null,
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal query performance
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, folderId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, title: "text", originalContent: "text" });

export const Note = mongoose.model("Note", noteSchema);
