import mongoose, { Schema } from "mongoose";

const chatDocumentSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a document is only added once to a specific chat
chatDocumentSchema.index({ chatId: 1, documentId: 1 }, { unique: true });

export const ChatDocument = mongoose.model("ChatDocument", chatDocumentSchema);
