import mongoose, { Schema } from "mongoose";

const documentChunkSchema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // Array of numbers for future vector search
    },
    pageNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentChunk = mongoose.model("DocumentChunk", documentChunkSchema);
