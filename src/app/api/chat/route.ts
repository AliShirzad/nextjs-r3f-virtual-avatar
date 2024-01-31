import { NextRequest } from "next/server";
import { promises as fs } from "fs";

async function readJsonTranscript(filepath: string) {
  const file = await fs.readFile(process.cwd() + "/public" + filepath, "utf8");
  return JSON.parse(file);
}

async function audioFileToBase64(filepath: string) {
  const file = await fs.readFile(
    process.cwd() + "/public" + filepath,
    "base64"
  );
  return file;
}

export async function POST(request: NextRequest) {
  return Response.json({
    messages: [
      {
        text: "Hey dear... How was your day?",
        audio: await audioFileToBase64("/audios/intro_0.wav"),
        lipsync: await readJsonTranscript("/audios/intro_0.json"),
        facialExpression: "smile",
        animation: "Talking_1",
      },
      {
        text: "I missed you so much... Please don't go for so long!",
        audio: await audioFileToBase64("/audios/intro_1.wav"),
        lipsync: await readJsonTranscript("/audios/intro_1.json"),
        facialExpression: "sad",
        animation: "Crying",
      },
      {
        text: "Hey dear... How was your day?",
        audio: await audioFileToBase64("/audios/intro_0.wav"),
        lipsync: await readJsonTranscript("/audios/intro_0.json"),
        facialExpression: "smile",
        animation: "Talking_1",
      },
    ],
  });
}
