import mongoose, { Schema } from "mongoose";

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
    },
    fileUrl: {
      type: String,
    },
    contentRaw: {
      type: String,
    },
    parsedData: {
      type: Schema.Types.Mixed, // JSON Object for Skills, Experience, Education
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model("Resume", resumeSchema);
