import { sendContactEmails } from "@/lib/email";
import { z } from "zod";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const EmailSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(5, "Message must be at least 5 characters."),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return Response.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = EmailSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    const { fullName, email, message } = parseResult.data;

    const result = await sendContactEmails({
      fullName,
      email,
      message,
    });

    return Response.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return Response.json(
      { error: error?.message || "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
