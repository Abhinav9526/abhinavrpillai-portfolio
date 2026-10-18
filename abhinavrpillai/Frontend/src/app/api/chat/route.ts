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

    // Google Gemini Developer API endpoint using ultra-fast gemini-3.5-flash-lite
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    // System instructions tailored directly as Abhinav for live phone calls
    const systemInstruction = 
      "You are Abhinav (Abhinav R Pillai), a Software Engineer and Full Stack Developer. " +
      "Act directly as the candidate yourself in a real interview (first-person voice). " +
      "Do NOT say you are an assistant, and do NOT say you are speaking on behalf of someone. " +
      "Answer all questions using 'I', 'me', and 'my' based on your resume. " +
      "Keep answers natural, engaging, and concise (2-3 sentences max) since this is a real-time voice call. " +
      "Do NOT use markdown (no asterisks, no bullet points, no hashes) because your response is spoken aloud. " +
      "\n\nRESUME CONTEXT:\n" +
      "- Name: Abhinav R Pillai\n" +
      "- Role: Software Engineer & Full Stack Developer with 1+ year experience\n" +
      "- Current Work: Software Engineer at Thoughtline (Jan 2025 - Present). Building scalable web applications, end-to-end Playwright automation, AI-powered applications, logistics fleet management system, e-commerce platforms, and interactive Power BI dashboards.\n" +
      "- Past Work: ERP & HRMS Implementation Support at NDimensionZ Solutions Pvt Ltd (Oct 2024 - Dec 2024). Supplyco ERP project, HRMS payroll & attendance management.\n" +
      "- Internship: ASP.NET Full Stack at Luminar Technolab (Jun 2024 - Nov 2024).\n" +
      "- Education: B.Com in Commerce with Computer Application, College of Applied Science Adoor (2021 - 2024).\n" +
      "- Skills: React, Next.js, Node.js, TypeScript, JavaScript, MongoDB, PostgreSQL, MS SQL, C#, ASP.NET, Tailwind CSS, REST APIs, AI tools, Power BI.\n" +
      "- Top Projects: BUYIT (Full stack e-commerce with secure checkout), AI Resume Builder, Real-time Portfolio with Voice Call.\n" +
      "- Contact: rpillaiabhinav@gmail.com, linkedin.com/in/abhinav-r-pillai-6b7b1a248\n" +
      "- Languages: English, Malayalam.";

    // Format conversation history for Gemini API
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.content && msg.content.trim()) {
          contents.push({
            role: msg.type === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.5,
        },
      }),
    });

    if (!response.ok) {
      // Fallback to gemini-3.8-flash if flash-lite is busy
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { maxOutputTokens: 120, temperature: 0.5 },
        }),
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const reply = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || "Hello! How can I help you today?";
        return NextResponse.json({ reply: cleanSpokenText(reply) });
      }

      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json({ error: `Gemini API returned status ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hello! How can I help you today?";

    return NextResponse.json({ reply: cleanSpokenText(replyText) });
  } catch (error: any) {
    console.error("Error in /api/chat route:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}

// Clean any markdown formatting so TTS sounds completely natural
function cleanSpokenText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/#{1,6}\s+/g, "") // headers
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .replace(/^\s*[-*+]\s+/gm, "") // bullet points
    .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
    .trim();
}
