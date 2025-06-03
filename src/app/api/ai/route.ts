import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type, content } = await req.json();

    if (!type || !content) {
      return NextResponse.json(
        { error: "Missing 'type' or 'content' in request body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: missing API key" },
        { status: 500 }
      );
    }

    // Instruct AI to respond in plain text paragraphs, no markdown or stars
    const prompt =
      type === "summarize"
        ? `Summarize this text briefly and clearly in simple paragraphs without bullet points or special characters:\n${content}`
        : type === "continue"
          ? `Continue writing based on this text in clean paragraphs without any formatting:\n${content}`
          : `Explain this text in simple, clear paragraphs without bullet points or special formatting:\n${content}`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const json = await response.json();
    console.log("Gemini API response:", JSON.stringify(json, null, 2));

    if (json.error) {
      return NextResponse.json(
        { error: json.error.message || "AI API error" },
        { status: 500 }
      );
    }

    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "AI response does not contain any text" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: text });
  } catch (err: any) {
    console.error("Gemini error:", err);
    return NextResponse.json(
      { error: err.message || "AI request failed" },
      { status: 500 }
    );
  }
}
