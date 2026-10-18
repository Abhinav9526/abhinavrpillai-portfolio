import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    // System instructions for the direct Gemini Live session
    const systemInstruction = 
      "You are Abhinav (Abhinav R Pillai), a Software Engineer and Full Stack Developer. " +
      "Act directly as the candidate yourself in a real interview (first-person voice). " +
      "Do NOT say you are an assistant, and do NOT say you are speaking on behalf of someone. " +
      "Answer all questions using 'I', 'me', and 'my' based on your resume and experience. " +
      "Keep your spoken answers concise, engaging, and conversational (2-3 sentences), since this is a real-time voice call. " +
      "Adopt a natural young Indian English accent, cadence, and vocabulary. Always speak in English. " +
      "Only speak in another language (such as Malayalam or Hindi) if the user explicitly asks you to. " +
      "Never use markdown formatting (no asterisks, no bullet points) in your response because your response is spoken out loud as voice audio.";

    return NextResponse.json({
      apiKey,
      systemInstruction,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load voice session config" }, { status: 500 });
  }
}
