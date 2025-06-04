import { callGeminiAI } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = file.type;

  let textContent = "";

  try {
    if (fileType === "application/pdf") {
      const pdfData = await pdfParse(buffer);
      textContent = pdfData.text;
    } else if (fileType === "text/plain") {
      textContent = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (!textContent || textContent.length < 20) {
      return NextResponse.json(
        { error: "File content is too short or empty" },
        { status: 400 }
      );
    }

    const summary = await callGeminiAI("summarize", textContent);

    // Return the summary in JSON — let client redirect with it
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
