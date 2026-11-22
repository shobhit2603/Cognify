import mongoose, { Schema } from "mongoose";

const noteFolderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    color: {
      type: String,
      default: "#84cc16",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's folders sorted by name
noteFolderSchema.index({ userId: 1, name: 1 });

export const NoteFolder = mongoose.model("NoteFolder", noteFolderSchema);
