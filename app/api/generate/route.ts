import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  // 1. Temporarily save file to process it
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join("/tmp", file.name);
  await fs.writeFile(filePath, buffer);

  // 2. Upload to Gemini File API
  const uploadResponse = await fileManager.uploadFile(filePath, {
    mimeType: file.type,
    displayName: file.name,
  });

  // 3. Generate Content
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    { fileData: { fileUri: uploadResponse.file.uri, mimeType: uploadResponse.file.mimeType } },
    { text: "Transcribe this audio. Then provide: 1) A 3-sentence Executive Summary, 2) 5 bullet-point Key Takeaways, and 3) 5 Flashcards (Front/Back). Output only as a raw JSON object." },
  ]);

  const data = JSON.parse(result.response.text());
  return NextResponse.json(data);
}
