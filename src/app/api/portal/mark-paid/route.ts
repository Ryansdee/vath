// app/api/portal/mark-paid/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

interface PortalData {
  clientName: string;
  clientEmail: string;
  projectName?: string;
  portalCode: string;
  expiresAt?: Timestamp | null;
  paid: boolean;
  price: number;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});

export async function POST(request: Request) {
  try {
    const { portalId } = await request.json();
    if (!portalId) {
      return NextResponse.json({ error: "portalId is required" }, { status: 400 });
    }

    const ref = doc(db, "portals", portalId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Portal not found" }, { status: 404 });
    }

    const data = snap.data() as PortalData;

    if (data.paid) {
      return NextResponse.json({ success: true, alreadyPaid: true, message: "Already marked as paid." });
    }

    await updateDoc(ref, { paid: true, paidAt: Timestamp.now() });

    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://vadimthevelin.com/"}/portal/${portalId}`;

    const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Payment received</title>
  </head>

  <body style="margin:0;padding:0;background:#ffffff;">
    <!-- Preheader (hidden text for inbox preview) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Payment received. Your portal access code is ready.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <!-- Container -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;">
            <tr>
              <td align="center" style="padding-bottom:18px;">
                <!-- Minimal “logo” -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#000;">
                  VATH STUDIO
                </div>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #000;background:#fff;">
                <!-- Inner -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding:34px 22px 10px 22px;">
                      <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#000;">
                        Payment received
                      </div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#000;margin-top:10px;">
                        Your access is ready
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:14px 28px 0 28px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#000;max-width:520px;">
                        Hi <span style="font-weight:700;">${data.clientName}</span>,<br/>
                        We’ve received your payment for
                        <span style="font-weight:700;">${data.projectName || "your project"}</span>.
                        You can access your portal below.
                      </div>
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td align="center" style="padding:22px 28px 6px 28px;">
                      <a href="${portalUrl}"
                        style="
                          display:inline-block;
                          padding:14px 22px;
                          border:1px solid #000;
                          color:#000;
                          text-decoration:none;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:13px;
                          letter-spacing:2px;
                          text-transform:uppercase;
                        ">
                        Access Portal
                      </a>
                    </td>
                  </tr>

                  <!-- Code block -->
                  <tr>
                    <td align="center" style="padding:18px 28px 0 28px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#000;">
                        Portal code
                      </div>

                      <div
                        style="
                          margin-top:10px;
                          display:inline-block;
                          padding:14px 16px;
                          border:1px dashed #000;
                          font-family:'Courier New',Courier,monospace;
                          font-size:18px;
                          letter-spacing:3px;
                          color:#000;
                          background:#fff;
                        "
                      >
                        ${data.portalCode}
                      </div>

                      ${
                        data.expiresAt
                          ? `<div style="margin-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#000;letter-spacing:1px;">
                              Expires on: <span style="font-weight:700;">${data.expiresAt
                                .toDate()
                                .toLocaleDateString()}</span>
                            </div>`
                          : ""
                      }
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding:26px 28px 0 28px;">
                      <div style="height:1px;background:#000;width:100%;"></div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding:18px 28px 30px 28px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#000;max-width:520px;">
                        If the button doesn’t work, copy and paste this link:
                        <div style="word-break:break-all;margin-top:8px;font-family:'Courier New',Courier,monospace;font-size:11px;">
                          ${portalUrl}
                        </div>
                      </div>

                      <div style="margin-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#000;opacity:.75;">
                        © ${new Date().getFullYear()} Vath Studio — monochrome by design.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Outer spacing -->
            <tr><td style="height:18px;"></td></tr>

            <!-- Tiny note -->
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#000;opacity:.7;padding:0 10px;">
                This email was sent to <span style="font-weight:700;">${data.clientEmail}</span>.
              </td>
            </tr>
          </table>
          <!-- /Container -->
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

    await transporter.sendMail({
      from: `"Vath Studio" <${process.env.EMAIL_USER}>`,
      to: data.clientEmail,
      subject: `Access code — ${data.projectName || "Your Project"}`,
      html,
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("❌ mark-paid error:", error);
    return NextResponse.json({ error: "Failed to mark paid / send email" }, { status: 500 });
  }
}
