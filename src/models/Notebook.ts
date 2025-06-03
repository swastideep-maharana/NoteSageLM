import mongoose, { Schema, Document, models, model } from "mongoose";

export interface INotebook extends Document {
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

const NotebookSchema = new Schema<INotebook>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const Notebook =
  models.Notebook || model<INotebook>("Notebook", NotebookSchema);
