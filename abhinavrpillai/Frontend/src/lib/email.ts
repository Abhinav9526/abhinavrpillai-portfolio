import nodemailer from "nodemailer";
import { config } from "@/data/config";

// SMTP configuration options
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : smtpPort === 465;
const smtpUser = process.env.SMTP_USER || config.email; // rpillaiabhinav@gmail.com
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";

export const isSmtpConfigured = Boolean(smtpPass);

function createTransporter() {
  if (!isSmtpConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

/**
 * Clean, modern HTML template for notifications sent to Abhinav
 */
export function getAdminEmailHtml({
  fullName,
  email,
  message,
}: {
  fullName: string;
  email: string;
  message: string;
}) {
  const dateStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Portfolio Message</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f17; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 28px 24px; text-align: left;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                  📬 New Portfolio Message
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9);">
                  Received from abhinavrpillai portfolio contact form
                </p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding: 28px 24px;">
                <!-- Sender Info Grid -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #1a2234; border: 1px solid #283548; border-radius: 12px; padding: 16px;">
                  <tr>
                    <td style="padding: 6px 12px; font-size: 13px; color: #94a3b8; width: 100px;">Sender:</td>
                    <td style="padding: 6px 12px; font-size: 14px; font-weight: 600; color: #ffffff;">${fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 12px; font-size: 13px; color: #94a3b8;">Email:</td>
                    <td style="padding: 6px 12px; font-size: 14px; font-weight: 600; color: #38bdf8;">
                      <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 12px; font-size: 13px; color: #94a3b8;">Time:</td>
                    <td style="padding: 6px 12px; font-size: 13px; color: #cbd5e1;">${dateStr} (IST)</td>
                  </tr>
                </table>

                <!-- Message Box -->
                <div style="margin-bottom: 24px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #f97316;">
                    Message Content:
                  </h3>
                  <div style="background-color: #0f172a; border-left: 4px solid #f97316; border-radius: 0 10px 10px 0; padding: 18px; font-size: 15px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${message}</div>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #1f2937;">
                  <a href="mailto:${email}?subject=Re:%20Portfolio%20Inquiry" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(249,115,22,0.3);">
                    Reply to ${fullName} →
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #0d131f; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
                Sent directly to ${config.email} from your portfolio contact form.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Clean, warm, and professional auto-reply template sent to the user who contacted Abhinav
 */
export function getUserConfirmationEmailHtml({
  fullName,
  message,
}: {
  fullName: string;
  message: string;
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thank you for reaching out</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f17; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 28px 24px; text-align: left;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                  ✨ Thank You for Reaching Out!
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9);">
                  I have received your message
                </p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding: 28px 24px;">
                <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                  Hi <strong style="color: #ffffff;">${fullName}</strong>,
                </p>
                <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                  Thank you for visiting my portfolio and taking the time to send a message! I have received your inquiry and will review it and get back to you as soon as possible.
                </p>

                <!-- Copy of user's message -->
                <div style="margin: 24px 0; background-color: #1a2234; border: 1px solid #283548; border-radius: 12px; padding: 18px;">
                  <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">
                    Summary of your message:
                  </h4>
                  <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1; white-space: pre-wrap; font-style: italic;">
                    "${message}"
                  </div>
                </div>

                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                  If your inquiry is urgent, feel free to also connect with me on <a href="${config.social.linkedin}" style="color: #38bdf8; text-decoration: none; font-weight: 600;">LinkedIn</a>.
                </p>

                <!-- Sign off -->
                <div style="border-top: 1px solid #1f2937; padding-top: 20px; margin-top: 24px;">
                  <p style="margin: 0; font-size: 15px; font-weight: 700; color: #ffffff;">
                    Abhinav R Pillai
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #f97316; font-weight: 500;">
                    Full Stack Web Developer
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
                    <a href="mailto:${config.email}" style="color: #64748b; text-decoration: none;">${config.email}</a>
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #0d131f; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
                © ${new Date().getFullYear()} Abhinav R Pillai. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Sends both the notification email to Abhinav and the auto-reply confirmation to the user
 */
export async function sendContactEmails({
  fullName,
  email,
  message,
}: {
  fullName: string;
  email: string;
  message: string;
}) {
  // Option 1: Web3Forms (100% Free, zero personal email or password exposure)
  if (process.env.WEB3FORMS_ACCESS_KEY) {
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY,
          name: fullName,
          email: email,
          message: message,
          subject: `📬 New Message from ${fullName} - Portfolio Inquiry`,
          from_name: "Abhinav R Pillai Portfolio",
          replyto: email,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Web3Forms submission failed");
      }

      // If SMTP is also configured, send the auto-reply confirmation email to the user
      const transporter = createTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"Abhinav R Pillai" <${smtpUser}>`,
            to: email,
            subject: `Thank you for contacting me, ${fullName}! 🚀`,
            text: `Hi ${fullName},\n\nThank you for reaching out through my portfolio! I have received your message and will get back to you as soon as possible.\n\nYour message:\n"${message}"\n\nBest regards,\nAbhinav R Pillai\nFull Stack Developer`,
            html: getUserConfirmationEmailHtml({ fullName, message }),
          });
        } catch (autoReplyErr) {
          console.warn("Auto-reply notice (non-fatal):", autoReplyErr);
        }
      }

      return {
        success: true,
        provider: "web3forms",
        message: "Message delivered successfully via Web3Forms.",
      };
    } catch (err: any) {
      console.error("Web3Forms error:", err);
      throw new Error(err.message || "Failed to send email via Web3Forms");
    }
  }

  const transporter = createTransporter();

  // If neither Web3Forms nor SMTP password is configured, simulate in dev mode with helpful log
  if (!transporter) {
    console.log("--------------------------------------------------");
    console.log("📨 [DEV MODE] Email to Abhinav simulated:");
    console.log(`   To: ${config.email}`);
    console.log(`   From: ${fullName} <${email}>`);
    console.log(`   Message: ${message}`);
    console.log("📨 [DEV MODE] Auto-reply confirmation to sender simulated:");
    console.log(`   To: ${email}`);
    console.log(`   Subject: Thank you for contacting me, ${fullName}!`);
    console.log("👉 FREE & PRIVATE OPTION 1: Get a free key at https://web3forms.com (no password needed)");
    console.log("   Add: WEB3FORMS_ACCESS_KEY=your_key in Frontend/.env");
    console.log("👉 FREE OPTION 2: Add SMTP_PASS=<16-digit Google App Password> or Brevo SMTP in Frontend/.env");
    console.log("--------------------------------------------------");
    return {
      success: true,
      simulated: true,
      message: "Message processed successfully (dev mode).",
    };
  }

  // 1. Send Notification to Abhinav
  const adminMailPromise = transporter.sendMail({
    from: `"Portfolio Contact Form" <${smtpUser}>`,
    to: config.email,
    replyTo: email,
    subject: `📬 New Message from ${fullName} via Portfolio`,
    text: `From: ${fullName} (${email})\n\nMessage:\n${message}`,
    html: getAdminEmailHtml({ fullName, email, message }),
  });

  // 2. Send Auto-Reply Confirmation to the Sender
  const userConfirmationPromise = transporter.sendMail({
    from: `"Abhinav R Pillai" <${smtpUser}>`,
    to: email,
    subject: `Thank you for contacting me, ${fullName}! 🚀`,
    text: `Hi ${fullName},\n\nThank you for reaching out through my portfolio! I have received your message and will get back to you as soon as possible.\n\nYour message:\n"${message}"\n\nBest regards,\nAbhinav R Pillai\nFull Stack Developer`,
    html: getUserConfirmationEmailHtml({ fullName, message }),
  });

  const [adminResult, userResult] = await Promise.all([
    adminMailPromise,
    userConfirmationPromise,
  ]);

  return {
    success: true,
    adminMessageId: adminResult.messageId,
    userMessageId: userResult.messageId,
  };
}
