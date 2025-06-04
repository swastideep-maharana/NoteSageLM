import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
folderSchema.index({ userId: 1 });
folderSchema.index({ parentId: 1 });

export const Folder =
  mongoose.models.Folder || mongoose.model("Folder", folderSchema);
