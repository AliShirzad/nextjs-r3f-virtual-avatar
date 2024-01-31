import { NextRequest } from "next/server";
// import voice from "elevenlabs-node";

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "kgG7dCoKCfLehAPWkJOE";

export async function GET(request: NextRequest) {
  const ElevenLabs = require("elevenlabs-node");
  const voice = new ElevenLabs({
    apiKey: elevenLabsApiKey,
  });
  const data = await voice.getVoices();
  return Response.json({ data });
}
