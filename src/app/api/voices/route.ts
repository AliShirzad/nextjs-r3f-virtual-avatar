import { NextResponse } from "next/server";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/voices";

/**
 * Lists the voices available to the configured ElevenLabs account.
 *
 * Called by the UI to populate the voice picker. Returns 503 rather than
 * throwing when the key is absent so the app still renders without one.
 */
export async function GET() {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVEN_LABS_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const response = await fetch(ELEVENLABS_API_URL, {
    headers: { "xi-api-key": apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    // Deliberately does not forward the upstream body: it can echo request
    // headers back, and the API key travels in one.
    return NextResponse.json(
      { error: "Failed to fetch voices from ElevenLabs" },
      { status: response.status }
    );
  }

  return NextResponse.json({ data: await response.json() });
}
