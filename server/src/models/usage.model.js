import mongoose, { Schema } from "mongoose";

const usageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feature: {
      type: String,
      enum: ["chat", "document", "resume", "writing", "note"],
      required: true,
    },
    model: {
      type: String,
    },
    inputTokens: {
      type: Number,
    },
    outputTokens: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

export const Usage = mongoose.model("Usage", usageSchema);
