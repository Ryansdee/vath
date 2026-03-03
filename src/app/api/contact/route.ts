import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "../../../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// ─── Email transporter ────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ─── Shared email wrapper ─────────────────────────────────────────────────────

function emailWrapper(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f0f0f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;">
    <tr>
      <td align="center" style="padding:48px 20px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:36px 48px;background:#000;text-align:center;">
              <p style="margin:0 0 6px 0;color:rgba(255,255,255,0.35);font-size:9px;font-weight:300;letter-spacing:3px;text-transform:uppercase;">Vadim Thevelin</p>
              <h1 style="margin:0;color:#fff;font-size:13px;font-weight:300;letter-spacing:3px;text-transform:uppercase;">${title}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;background:#fff;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;background:#f8f8f8;border:1px solid #e8e8e8;border-top:none;text-align:center;">
              <p style="margin:0 0 4px 0;color:#000;font-size:11px;font-weight:300;letter-spacing:2px;text-transform:uppercase;">Vadim Thevelin</p>
              <p style="margin:0;color:#999;font-size:10px;font-weight:300;letter-spacing:1px;">Brussels, Belgium</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─── Reusable row helper ──────────────────────────────────────────────────────

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#999;font-size:10px;font-weight:300;letter-spacing:1.5px;text-transform:uppercase;width:90px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0 8px 16px;color:#111;font-size:13px;font-weight:300;line-height:1.5;">${value}</td>
  </tr>`;
}

// ─── Section helper ───────────────────────────────────────────────────────────

function section(title: string, inner: string): string {
  return `<div style="margin-bottom:32px;">
    <p style="margin:0 0 16px 0;color:#000;font-size:9px;font-weight:400;letter-spacing:2.5px;text-transform:uppercase;border-bottom:1px solid #f0f0f0;padding-bottom:12px;">${title}</p>
    ${inner}
  </div>`;
}

// ─── Email templates ──────────────────────────────────────────────────────────

type ServiceKey = "photography" | "videography" | "direction" | "general";

const serviceLabels: Record<ServiceKey, string> = {
  photography: "Photography",
  videography: "Videography",
  direction: "Direction",
  general: "General Inquiry",
};

function buildServiceEmail(
  service: ServiceKey,
  name: string,
  email: string,
  info: string
): { subject: string; html: string } {
  const label = serviceLabels[service] || service;

  const clientInfo = section(
    "Client",
    `<table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Name", name)}
      ${infoRow("Email", `<a href="mailto:${email}" style="color:#000;text-decoration:none;">${email}</a>`)}
    </table>`
  );

  const details = info
    ? section(
        "Details",
        `<p style="margin:0;color:#333;font-size:13px;font-weight:300;line-height:1.7;">${info.replace(/\n/g, "<br>")}</p>`
      )
    : `<p style="margin:0;color:#bbb;font-size:12px;font-weight:300;font-style:italic;">No additional details provided.</p>`;

  return {
    subject: `NEW REQUEST — ${label.toUpperCase()}`,
    html: emailWrapper(`${label} Request`, clientInfo + details),
  };
}

// ─── Portal emails ────────────────────────────────────────────────────────────

function buildClientPortalEmail(
  name: string,
  portalId: string,
  portalUrl: string,
  portalCode: string | null,
  isExisting: boolean
): string {
  const codeBlock = portalCode
    ? `<div style="margin:28px 0;padding:24px;background:#f8f8f8;text-align:center;">
        <p style="margin:0 0 10px 0;color:#999;font-size:9px;font-weight:300;letter-spacing:2.5px;text-transform:uppercase;">Access Code</p>
        <p style="margin:0;color:#000;font-size:26px;font-weight:300;letter-spacing:8px;">${portalCode}</p>
      </div>`
    : "";

  const intro = isExisting
    ? `<p style="margin:0 0 16px 0;color:#111;font-size:13px;font-weight:300;line-height:1.7;">Hi ${name},</p>
       <p style="margin:0 0 24px 0;color:#555;font-size:13px;font-weight:300;line-height:1.7;">Here is your portal access information as requested.</p>`
    : `<p style="margin:0 0 16px 0;color:#111;font-size:13px;font-weight:300;line-height:1.7;">Hi ${name},</p>
       <p style="margin:0 0 24px 0;color:#555;font-size:13px;font-weight:300;line-height:1.7;">Your private portal has been created. I'll upload your files shortly — you'll be notified as soon as they're ready.</p>`;

  const content = `
    ${intro}
    <div style="text-align:center;margin:36px 0;">
      <a href="${portalUrl}" style="display:inline-block;padding:14px 36px;background:#000;color:#fff;text-decoration:none;font-size:10px;font-weight:300;letter-spacing:3px;text-transform:uppercase;">Access Portal</a>
    </div>
    ${codeBlock}
    <div style="margin-top:24px;padding:16px;background:#f8f8f8;">
      <p style="margin:0 0 6px 0;color:#999;font-size:9px;font-weight:300;letter-spacing:2px;text-transform:uppercase;">Portal ID</p>
      <p style="margin:0;color:#333;font-size:11px;font-weight:300;font-family:monospace;">${portalId}</p>
    </div>
  `;

  return emailWrapper("Your Portal", content);
}

function buildAdminPortalEmail(
  name: string,
  email: string,
  portalId: string,
  portalUrl: string,
  additionalInfo: string,
  isExisting: boolean
): string {
  const badge = isExisting
    ? `<div style="display:inline-block;padding:3px 10px;background:#f0f0f0;border:1px solid #ddd;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#666;margin-bottom:20px;">Existing Portal</div>`
    : `<div style="display:inline-block;padding:3px 10px;background:#000;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#fff;margin-bottom:20px;">New Portal</div>`;

  const clientSection = section(
    "Client",
    `${badge}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Name", name)}
      ${infoRow("Email", `<a href="mailto:${email}" style="color:#000;text-decoration:none;">${email}</a>`)}
      ${infoRow("Portal ID", `<span style="font-family:monospace;font-size:11px;">${portalId}</span>`)}
    </table>`
  );

  const infoSection = additionalInfo
    ? section(
        "Notes",
        `<p style="margin:0;color:#333;font-size:13px;font-weight:300;line-height:1.7;">${additionalInfo.replace(/\n/g, "<br>")}</p>`
      )
    : "";

  const cta = `<div style="text-align:center;margin-top:28px;">
    <a href="${portalUrl}" style="display:inline-block;padding:12px 28px;background:#000;color:#fff;text-decoration:none;font-size:10px;font-weight:300;letter-spacing:3px;text-transform:uppercase;">View Portal</a>
  </div>`;

  return emailWrapper(
    isExisting ? "Portal Access Requested" : "New Portal Request",
    clientSection + infoSection + cta
  );
}

// ─── Confirmation email for non-portal services ───────────────────────────────

function buildConfirmationEmail(name: string, service: string): string {
  const label = serviceLabels[service as ServiceKey] || service;
  const content = `
    <p style="margin:0 0 16px 0;color:#111;font-size:13px;font-weight:300;line-height:1.7;">Hi ${name},</p>
    <p style="margin:0 0 16px 0;color:#555;font-size:13px;font-weight:300;line-height:1.7;">Thank you for reaching out. Your <strong style="font-weight:400;">${label}</strong> request has been received and I'll get back to you as soon as possible.</p>
    <p style="margin:0;color:#555;font-size:13px;font-weight:300;line-height:1.7;">Best regards,<br>Vadim</p>
    <p style="margin:24px 0 0 0;color:#ccc;font-size:10px;font-weight:300;font-style:italic;">This is an automated confirmation.</p>
  `;
  return emailWrapper("Request Received", content);
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { name, email, service, additionalInfo } = await request.json();

    if (!name?.trim() || !email?.trim() || !service?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Portal service ──────────────────────────────────────────────────────────
    if (service === "portal") {
      // 1. Look for an existing portal linked to this email
      const existingSnap = await getDocs(
        query(collection(db, "portals"), where("clientEmail", "==", email.trim().toLowerCase()))
      );

      if (!existingSnap.empty) {
        // ── Existing portal found ──
        const portalDoc = existingSnap.docs[0];
        const portalId = portalDoc.id;
        const portalData = portalDoc.data();
        const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/portal/${portalId}`;
        const portalCode: string | null = portalData.portalCode || null;

        // Send portal details to client
        await transporter.sendMail({
          from: `"Vadim Thevelin" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your Portal Access — Vadim Thevelin",
          html: buildClientPortalEmail(name, portalId, portalUrl, portalCode, true),
        });

        // Notify Vadim
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: "PORTAL ACCESS REQUESTED (existing)",
          html: buildAdminPortalEmail(name, email, portalId, portalUrl, additionalInfo || "", true),
          replyTo: email,
        });

        return NextResponse.json({
          success: true,
          portalId,
          portalUrl,
          isExisting: true,
        });
      }

      // ── No existing portal → create new ──
      const portalData = {
        clientName: name.trim(),
        clientEmail: email.trim().toLowerCase(),
        projectName: "Awaiting Files",
        files: [],
        createdAt: Timestamp.now(),
        additionalInfo: additionalInfo?.trim() || "",
        // portalCode will be set manually by Vadim in the admin panel
      };

      const portalRef = await addDoc(collection(db, "portals"), portalData);
      const portalId = portalRef.id;
      const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/portal/${portalId}`;

      // Send portal link to client (no code yet — Vadim hasn't set it)
      await transporter.sendMail({
        from: `"Vadim Thevelin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Portal is Ready — Vadim Thevelin",
        html: buildClientPortalEmail(name, portalId, portalUrl, null, false),
      });

      // Notify Vadim
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "NEW PORTAL REQUEST",
        html: buildAdminPortalEmail(name, email, portalId, portalUrl, additionalInfo || "", false),
        replyTo: email,
      });

      return NextResponse.json({
        success: true,
        portalId,
        portalUrl,
        isExisting: false,
      });
    }

    // ── Other services (photography, videography, direction, general) ───────────

    const validServices: ServiceKey[] = ["photography", "videography", "direction", "general"];
    if (!validServices.includes(service as ServiceKey)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
    }

    const { subject, html } = buildServiceEmail(
      service as ServiceKey,
      name,
      email,
      additionalInfo || ""
    );

    // Send request to Vadim
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "contact@vadimthevelin.com",
      subject,
      html,
      replyTo: email,
    });

    // Send confirmation to client
    await transporter.sendMail({
      from: `"Vadim Thevelin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Request Received — Vadim Thevelin",
      html: buildConfirmationEmail(name, service),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact API] Error:", error);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}