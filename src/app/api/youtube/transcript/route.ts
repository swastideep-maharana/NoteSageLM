import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube("v3");

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing videoId parameter" },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: missing YouTube API key" },
        { status: 500 }
      );
    }

    // Get video captions
    const captionsResponse = await youtube.captions.list({
      key: apiKey,
      part: ["snippet"],
      videoId: videoId,
    });

    const captions = captionsResponse.data.items;
    if (!captions || captions.length === 0) {
      return NextResponse.json(
        { error: "No captions found for this video" },
        { status: 404 }
      );
    }

    // Get the first available caption track
    const captionId = captions[0].id;
    if (!captionId) {
      return NextResponse.json(
        { error: "No caption ID found" },
        { status: 404 }
      );
    }

    // Download the caption track
    const captionResponse = await youtube.captions.download({
      key: apiKey,
      id: captionId,
    });

    // Process the caption data to extract the transcript
    const transcript = processCaptionData(captionResponse.data);

    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error("Error fetching YouTube transcript:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transcript" },
      { status: 500 }
    );
  }
}

function processCaptionData(captionData: any): string {
  // This is a simplified version. In a real implementation,
  // you would need to parse the caption data format (e.g., SRT, VTT)
  // and extract the text content.
  return captionData.toString();
}
