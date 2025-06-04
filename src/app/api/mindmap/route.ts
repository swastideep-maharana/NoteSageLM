import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Missing 'content' in request body" },
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

    const prompt = `Analyze the following text and create a mind map structure. Return the response in a JSON format with nodes and edges. Each node should have an id, label, and type (main, subtopic, or detail). Each edge should have source and target node ids. The structure should represent the main topics, subtopics, and key details from the text. Format the response as a valid JSON object with 'nodes' and 'edges' arrays:\n\n${content}`;

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

    try {
      // Try to parse the response as JSON
      const mindMap = JSON.parse(text);
      return NextResponse.json(mindMap);
    } catch (error) {
      // If parsing fails, return an error
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Mind map generation error:", err);
    return NextResponse.json(
      { error: err.message || "Mind map generation failed" },
      { status: 500 }
    );
  }
}
