"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateVoicePreview(voice: string) {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input: "This is a preview of the selected voice.",
    response_format: "mp3",
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:audio/mpeg;base64,${buffer.toString("base64")}`;
}
