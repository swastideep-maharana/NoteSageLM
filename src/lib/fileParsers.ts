// lib/fileParsers.ts
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function parseTxt(path: string): Promise<string> {
  return fs.readFile(path, "utf8");
}

export async function parsePDF(path: string): Promise<string> {
  const buffer = await fs.readFile(path);
  const data = await pdfParse(buffer);
  return data.text;
}

export async function parseDocx(path: string): Promise<string> {
  const buffer = await fs.readFile(path);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
