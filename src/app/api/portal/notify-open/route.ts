// app/api/portal/notify-open/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});

export async function POST(req: Request) {
  try {
    const { portalId, projectName, clientName, clientEmail } = await req.json();

    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>Portal opened</h2>
        <p><strong>Project:</strong> ${projectName || "-"}</p>
        <p><strong>Client:</strong> ${clientName || "-"} (${clientEmail || "-"})</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Portal Bot" <${process.env.EMAIL_USER}>`,
      to: "contact@vadimthevelin.com",
      subject: `Portal opened — ${projectName || portalId}`,
      html,
    });

    return NextResponse.json({ ok: true });
    } catch (error: unknown) {
    console.error("notify-open error:", error);

    let message = "Unknown error";

    if (error instanceof Error) {
        message = error.message;
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
