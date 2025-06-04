// lib/gemini.ts
export type GeminiTaskType = "summarize" | "continue" | "explain";

export async function callGeminiAI(
  type: GeminiTaskType,
  content: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  let prompt = "";

  switch (type) {
    case "summarize":
      prompt = `Summarize this text briefly and clearly in simple paragraphs without bullet points or special characters:\n${content}`;
      break;
    case "continue":
      prompt = `Continue writing based on this text in clean paragraphs without any formatting:\n${content}`;
      break;
    case "explain":
    default:
      prompt = `Explain this text in simple, clear paragraphs without bullet points or special formatting:\n${content}`;
      break;
  }

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error.message || "Gemini API error");
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API response missing text.");
  }

  return text;
}
