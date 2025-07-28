// "use server";

// import OpenAI from "openai";
// import fs from "fs/promises";
// import path from "path";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// export async function generateVoicePreview(voice: string) {
//   const response = await openai.audio.speech.create({
//     model: "gpt-4o-mini-tts",
//     voice,
//     input: `Hello! welcome to AiGenReels - this is ${voice} voice`,
//     response_format: "mp3",
//   });

//   const buffer = Buffer.from(await response.arrayBuffer());
//   const fileName = `${voice}.mp3`;
//   const filePath = path.join(
//     process.cwd(),
//     "public",
//     "voice-previews",
//     fileName
//   );

//   await fs.mkdir(path.dirname(filePath), { recursive: true });
//   await fs.writeFile(filePath, buffer);
// }
