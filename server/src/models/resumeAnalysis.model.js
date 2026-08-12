import mongoose, { Schema } from "mongoose";

const resumeAnalysisSchema = new Schema(
  {
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    score: {
      type: Number,
    },
    atsAnalysis: {
      type: Schema.Types.Mixed, // JSON Object for Keywords, Readability, Issues
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
