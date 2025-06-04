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

    let prompt = "";
    if (type === "suggest-tags") {
      prompt = `Analyze the following text and suggest relevant tags. Return the tags in a JSON array format with each tag having a name and optional parent tag. Focus on key topics, themes, and important concepts:\n\n${content}`;
    } else {
      // Clean prompt that ensures no special characters or formatting
      prompt =
        type === "summarize"
          ? `Create a clear and concise summary of the following text. Use simple paragraphs without any special characters, bullet points, or formatting. Focus on the main points and key information:\n\n${content}`
          : type === "continue"
            ? `Continue writing based on this text. Use simple paragraphs without any special characters or formatting:\n\n${content}`
            : `Explain this text in simple, clear paragraphs without any special characters or formatting:\n\n${content}`;
    }

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

    if (type === "suggest-tags") {
      try {
        // Try to parse the response as JSON
        const tags = JSON.parse(text);
        return NextResponse.json({ tags });
      } catch {
        // If parsing fails, try to extract tags from the text
        const tags = text
          .split(/[,\n]/)
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .map((tag) => ({ name: tag }));
        return NextResponse.json({ tags });
      }
    }

    // Clean the response text by removing any remaining special characters
    const cleanText = text
      .replace(/[*_~`#]/g, "") // Remove markdown characters
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
      .replace(/^\s+|\s+$/g, "") // Trim whitespace
      .replace(/[•\-\*]/g, "") // Remove bullet points
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();

    return NextResponse.json({ result: cleanText });
  } catch (err: any) {
    console.error("Gemini error:", err);
    return NextResponse.json(
      { error: err.message || "AI request failed" },
      { status: 500 }
    );
  }
}
