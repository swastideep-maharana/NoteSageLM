import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type, content, options } = await req.json();

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

    let prompt = "";
    switch (type) {
      case "auto-tag":
        prompt = `Analyze the following text and suggest relevant tags. Return the response as a JSON array of strings. Focus on key topics, themes, and concepts:\n\n${content}`;
        break;
      case "suggest":
        prompt = `Based on the following text, suggest related topics or ideas to explore. Return the response as a JSON object with 'suggestions' array containing objects with 'title' and 'description' fields:\n\n${content}`;
        break;
      case "summarize":
        const summaryType = options?.type || "concise";
        const summaryLength = options?.length || "medium";
        prompt = `Create a ${summaryType} summary of the following text with ${summaryLength} length. Focus on key points and main ideas. Return the response as a JSON object with:
        1. Summary text
        2. Key points (array)
        3. Main topics (array)
        4. Reading time estimate
        Text:\n\n${content}`;
        break;
      case "enhance":
        prompt = `Enhance the following text by adding more details, examples, and explanations while maintaining the original meaning:\n\n${content}`;
        break;
      case "analyze":
        prompt = `Analyze the following text and provide insights about:
        1. Key themes and topics
        2. Writing style and tone
        3. Complexity level
        4. Main arguments or points
        5. Potential areas for improvement
        Return the response as a JSON object with these categories:\n\n${content}`;
        break;
      case "sentiment":
        prompt = `Analyze the sentiment of the following text. Return a JSON object with:
        1. Overall sentiment (positive, negative, or neutral)
        2. Sentiment score (-1 to 1)
        3. Key emotional indicators
        4. Confidence level (0-1)
        Text:\n\n${content}`;
        break;
      case "keywords":
        prompt = `Extract key phrases and important terms from the following text. Return a JSON object with:
        1. Main keywords (array)
        2. Key phrases (array)
        3. Term frequency (object with term:count)
        4. Relevance scores (object with term:score)
        Text:\n\n${content}`;
        break;
      case "translate":
        const targetLang = options?.targetLanguage || "English";
        prompt = `Translate the following text to ${targetLang}. Maintain the original meaning, tone, and formatting. Return the response as a JSON object with:
        1. Translated text
        2. Original language detection
        3. Translation confidence score
        4. Cultural notes (if applicable)
        Text:\n\n${content}`;
        break;
      case "advanced-summarize":
        prompt = `Create an advanced summary of the following text. Return a JSON object with:
        1. Executive summary (2-3 sentences)
        2. Detailed summary (paragraph)
        3. Key takeaways (bulleted list)
        4. Action items (if applicable)
        5. Related concepts
        6. Reading level assessment
        Text:\n\n${content}`;
        break;
      case "content-improve":
        prompt = `Improve the following text by:
        1. Enhancing clarity and readability
        2. Fixing grammar and style issues
        3. Adding relevant examples
        4. Improving structure and flow
        5. Maintaining original meaning
        Return the response as a JSON object with:
        1. Improved text
        2. Changes made (list)
        3. Improvement suggestions
        Text:\n\n${content}`;
        break;
      case "youtube-summarize":
        prompt = `Analyze and summarize the following YouTube video content. Return a JSON object with:
        1. Video summary (2-3 paragraphs)
        2. Key points (bulleted list)
        3. Main topics covered
        4. Timestamps for important moments
        5. Action items or takeaways
        6. Related topics for further exploration
        Video content:\n\n${content}`;
        break;
      case "roadmap":
        prompt = `Create a detailed roadmap for the following topic. Return a JSON object with:
        1. Main goal
        2. Timeline phases (with estimated duration)
        3. Key milestones
        4. Required resources
        5. Dependencies
        6. Success metrics
        7. Risk factors and mitigation strategies
        Topic:\n\n${content}`;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid AI feature type" },
          { status: 400 }
        );
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
      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch (error) {
      // If parsing fails, return the text as is
      return NextResponse.json({ result: text });
    }
  } catch (err: any) {
    console.error("AI feature error:", err);
    return NextResponse.json(
      { error: err.message || "AI feature request failed" },
      { status: 500 }
    );
  }
}
