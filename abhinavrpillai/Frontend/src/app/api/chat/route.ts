import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API key is not configured in environment variables.");
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // Google Gemini Developer API endpoint using gemini-3.5-flash-lite
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    // System instructions tailored for Abhinav's portfolio voice assistant
    const systemInstruction = 
      "You are Abhinav's personal AI Assistant. " +
      "You help visitors learn about Abhinav's experience, projects, skills, and contact info. " +
      "Answer questions concisely (1-2 sentences maximum) as this is a voice call, " +
      "and you want to keep the dialogue fast-paced and conversational. " +
      "Be friendly, professional, and directly address the user. " +
      "Keep answers natural and engaging. Do not use markdown (like asterisks or bullet points) in your response, as the response is spoken out loud.";

    // Format the conversation history for Gemini API
    const contents = [];
    
    // Convert previous messages to Gemini API format
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.type === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }
    
    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API returned error status:", response.status, errorText);
      return NextResponse.json(
        { error: `Gemini API returned status ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    
    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
