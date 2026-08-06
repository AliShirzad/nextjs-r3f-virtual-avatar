import { promises as fs } from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Reads a file from `public/`, refusing anything that escapes it.
 *
 * The inputs below are hard-coded, but this stays defensive so the helper
 * can't become a path-traversal sink if it is ever wired to request data.
 */
async function readPublicFile(relativePath: string, encoding: BufferEncoding) {
  const resolved = path.join(PUBLIC_DIR, relativePath);
  if (resolved !== PUBLIC_DIR && !resolved.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error(`Refusing to read outside public/: ${relativePath}`);
  }
  return fs.readFile(resolved, encoding);
}

const readJsonTranscript = async (p: string) =>
  JSON.parse(await readPublicFile(p, "utf8"));

const audioFileToBase64 = (p: string) => readPublicFile(p, "base64");

/**
 * The scripted reply the avatar plays back.
 *
 * Each message pairs pre-rendered audio with a Rhubarb-style viseme
 * transcript, so the mouth shapes stay in sync with the audio clock. This is
 * a canned script standing in for a live LLM + TTS pipeline — see the README.
 */
export async function getIntroMessages() {
  const [audio0, lipsync0, audio1, lipsync1] = await Promise.all([
    audioFileToBase64("/audios/intro_0.wav"),
    readJsonTranscript("/audios/intro_0.json"),
    audioFileToBase64("/audios/intro_1.wav"),
    readJsonTranscript("/audios/intro_1.json"),
  ]);

  return [
    {
      text: "Hey dear... How was your day?",
      audio: audio0,
      lipsync: lipsync0,
      facialExpression: "smile",
      animation: "Talking_1",
    },
    {
      text: "I missed you so much... Please don't go for so long!",
      audio: audio1,
      lipsync: lipsync1,
      facialExpression: "sad",
      animation: "Crying",
    },
  ];
}
