import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { parseTxt, parsePDF, parseDocx } from "@/lib/fileParsers";

export const config = {
  api: {
    bodyParser: false, // disable Next.js default body parser to handle multipart/form-data
  },
};

interface FormidableFile {
  filepath: string;
  originalFilename?: string;
}

export async function POST(req: NextRequest) {
  const form = formidable({ keepExtensions: true });

  const [fields, files]: [
    Record<string, string>,
    Record<string, FormidableFile | FormidableFile[]>,
  ] = await new Promise((resolve, reject) => {
    form.parse(
      req as any,
      (
        err: Error | null,
        fields: Record<string, string>,
        files: Record<string, FormidableFile | FormidableFile[]>
      ) => {
        if (err) reject(err);
        else resolve([fields, files]);
      }
    );
  });

  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const filePath = file.filepath;
  const originalFilename = file.originalFilename || "Untitled";

  const ext = originalFilename.split(".").pop()?.toLowerCase() || "";

  let content = "";

  try {
    if (ext === "txt") {
      content = await parseTxt(filePath);
    } else if (ext === "pdf") {
      content = await parsePDF(filePath);
    } else if (ext === "docx") {
      content = await parseDocx(filePath);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  const title = originalFilename.replace(/\.[^/.]+$/, "");

  return NextResponse.json({ title, content });
}
