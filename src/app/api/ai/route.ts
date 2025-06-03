import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, content } = await req.json();

  if (!type || !content)
    return NextResponse.json({ error: "Missing input" }, { status: 400 });

  const prompt =
    type === "sumarize"
      ? `Sumarize this text:\n${content}`
      : `Generate continuation of this text:\n${content}`;
  try {
    const result = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.Generative_Language_APIKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await result.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No AI result");

    return NextResponse.json({ result: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
