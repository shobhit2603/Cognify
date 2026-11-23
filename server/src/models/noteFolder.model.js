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

// Compound unique index for user's folders (case-insensitive name per user)
noteFolderSchema.index(
  { userId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export const NoteFolder = mongoose.model("NoteFolder", noteFolderSchema);
