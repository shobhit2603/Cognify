import mongoose, { Schema } from "mongoose";

const chunkMetadataSchema = new Schema(
  {
    chunkId: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    sectionTitle: { type: String },
    chunkIndex: { type: Number, required: true },
    contentType: { type: String, default: "text" },
    tokenCount: { type: Number },
  },
  { _id: false }
);

const documentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storageProvider: {
      type: String,
      default: "s3",
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["UPLOADED", "QUEUED", "PARSING", "CHUNKING", "EMBEDDING", "INDEXING", "READY", "FAILED"],
      default: "UPLOADED",
    },
    progress: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
    },
    parserUsed: {
      type: String,
    },
    pageCount: {
      type: Number,
    },
    chunkCount: {
      type: Number,
    },
    processingDurationMs: {
      type: Number,
    },
    processingJobId: {
      type: String,
    },
    chunks: [chunkMetadataSchema],
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
