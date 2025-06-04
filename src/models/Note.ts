import mongoose, { Schema, Document, models, model } from "mongoose";

export interface INote extends Document {
  userId: string;
  notebookId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: String, required: true },
    notebookId: {
      type: Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, default: "" },
  },
  {
    timestamps: true, 
  }
);

export const Note = models.Note || model<INote>("Note", NoteSchema);
