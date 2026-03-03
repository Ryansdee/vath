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

    const timestamp = new Date().toLocaleString("fr-BE", {
      weekday: "short", year: "numeric", month: "short",
      day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <style>
    body{margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif}
    .wrapper{max-width:560px;margin:40px auto;padding:0 16px}
    .card{background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7}
    .header{background:#0a0a0a;padding:28px 32px}
    .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(138,107,254,.15);border:1px solid rgba(138,107,254,.3);color:#a58fff;font-size:11px;font-family:monospace;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:14px}
    .dot{display:inline-block;width:6px;height:6px;background:#8a6bfe;border-radius:50%}
    .header h1{font-size:20px;font-weight:600;color:#fff;margin:0;letter-spacing:-.02em}
    .header p{font-size:13px;color:#666;margin:5px 0 0}
    .body{padding:28px 32px;background:#fafafa}
    .field-grid{border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;background:#fff}
    .field-row{display:flex;align-items:center;padding:13px 18px;border-bottom:1px solid #f0f0f0}
    .field-row:last-child{border-bottom:none;background:#f5f5f5}
    .field-label{font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:.08em;color:#aaa;width:88px;flex-shrink:0}
    .field-value{font-size:14px;color:#1a1a1a;font-weight:500}
    .email-tag{display:inline-block;background:#f0f0f0;color:#555;font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;margin-left:6px}
    .ts{font-family:monospace;font-size:12px;color:#555;font-weight:400}
    .cta{text-align:center;margin-top:22px}
    .cta a{display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;font-size:13px;font-weight:500;padding:11px 26px;border-radius:8px}
    .footer{padding:16px 32px;border-top:1px solid #ececec;display:flex;justify-content:space-between;align-items:center}
    .footer span{font-size:12px;color:#bbb}
    .footer strong{color:#888;font-weight:500}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="badge"><span class="dot"></span> Portal Activity</div>
        <h1>Client portal opened</h1>
        <p>A client just accessed their project portal.</p>
      </div>
      <div class="body">
        <div class="field-grid">
          <div class="field-row">
            <span class="field-label">Project</span>
            <span class="field-value">${projectName || portalId || "—"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Client</span>
            <span class="field-value">
              ${clientName || "—"}
              ${clientEmail ? `<span class="email-tag">${clientEmail}</span>` : ""}
            </span>
          </div>
          <div class="field-row">
            <span class="field-label">Opened at</span>
            <span class="field-value ts">${timestamp}</span>
          </div>
        </div>
        <div class="cta">
          <a href="https://vadimthevelin.com/admin">View portal →</a>
        </div>
      </div>
      <div class="footer">
        <span>Sent by <strong>Portal Bot</strong></span>
        <span>vadimthevelin.com</span>
      </div>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Portal Bot" <${process.env.EMAIL_USER}>`,
      to: "contact@vadimthevelin.com",
      subject: `🟣 Portal opened — ${projectName || portalId}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("notify-open error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}