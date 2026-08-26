import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Next.js port of Api/mail.js (sendReceiptEmail).
// Server-only: uses SENDGRID_API_KEY (never NEXT_PUBLIC_*).
// POST { to, subject, html } → sends email from info@codenow101.com.
// Also export sendReceiptEmail for use from other route handlers
// (e.g. payment notify) without an extra HTTP hop.

const FROM_EMAIL = "info@codenow101.com";

function ensureApiKey() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    throw new Error("SENDGRID_API_KEY is not set");
  }
  sgMail.setApiKey(key);
}

export async function sendReceiptEmail(
  to: string,
  subject: string,
  htmlContent: string,
): Promise<void> {
  ensureApiKey();

  const msg = {
    to,
    from: FROM_EMAIL,
    subject,
    html: htmlContent,
  };

  console.log("Preparing to send email...", {
    to: msg.to,
    subject: msg.subject,
    from: msg.from,
  });

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully to", to);
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "body" in error.response
    ) {
      console.error(
        "Response body from SendGrid:",
        (error.response as { body: unknown }).body,
      );
    }
    throw error;
  }
}

type MailBody = {
  to?: string;
  subject?: string;
  html?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MailBody;
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 },
      );
    }

    // Basic email shape check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    await sendReceiptEmail(to, subject, html);

    return NextResponse.json({ ok: true, message: "Email sent" });
  } catch (error) {
    console.error("POST /api/mail error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
