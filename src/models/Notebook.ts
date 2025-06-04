import mongoose, { Schema, Document, models, model } from "mongoose";

export interface INotebook extends Document {
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotebookSchema = new Schema<INotebook>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamps on save
NotebookSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Notebook =
  models.Notebook || model<INotebook>("Notebook", NotebookSchema);
