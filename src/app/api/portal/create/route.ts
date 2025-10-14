import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const {
      clientName,
      clientEmail,
      files = [],
      projectName,
      expiresInDays,
      delayEmailMs = 60000
    } = await request.json();

    // Validation: only require name and email
    if (!clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating portal for:", clientName, clientEmail);

    // Optional expiration date
    const expiresAt = expiresInDays
      ? Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
      : null;

    // Create portal in Firestore
    const portalData = {
      clientName,
      clientEmail,
      files,
      projectName: projectName || "Untitled Project",
      createdAt: Timestamp.now(),
      ...(expiresAt && { expiresAt }),
    };

    const portalRef = await addDoc(collection(db, "portals"), portalData);
    const portalId = portalRef.id;
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vath-portofolio.netlify.app/'}/portal/${portalId}`;

    console.log("Portal created with ID:", portalId);

    // Function to send email
    const sendEmail = async () => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: clientEmail,
          subject: `Your Photos & Videos are Ready — ${projectName || "Your Project"}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Your Files Are Ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Hi ${clientName},</p>
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Your photos and videos from <strong>${projectName || "your project"}</strong> are ready to download!</p>
              <p style="margin: 0 0 30px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Access your private portal below to view and download all your files.</p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${portalUrl}" style="display: inline-block; padding: 15px 40px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Access Your Portal</a>
              </div>
              <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Portal Details</p>
                <table width="100%" cellpadding="4" cellspacing="0">
                  <tr>
                    <td style="color: #999999; font-size: 11px; font-weight: 300;">Project:</td>
                    <td style="color: #000000; font-size: 11px; font-weight: 300; text-align: right;">${projectName || "Your Project"}</td>
                  </tr>
                  ${expiresAt ? `
                  <tr>
                    <td style="color: #999999; font-size: 11px; font-weight: 300;">Expires:</td>
                    <td style="color: #000000; font-size: 11px; font-weight: 300; text-align: right;">${expiresAt.toDate().toLocaleDateString()}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `.trim(),
        });
        console.log(`Email sent to ${clientEmail}`);
      } catch (err) {
        console.error("Error sending email:", err);
      }
    };

    // Delay email if needed
    if (delayEmailMs > 0) {
      console.log(`Email scheduled for ${delayEmailMs / 1000 / 60} minutes from now`);
      setTimeout(sendEmail, delayEmailMs);
      return NextResponse.json({
        success: true,
        portalId,
        portalUrl,
        message: `Portal created. Email will be sent in ${delayEmailMs / 60000} minutes.`
      });
    } else {
      await sendEmail();
      return NextResponse.json({ success: true, portalId, portalUrl, message: "Portal created and email sent immediately." });
    }

  } catch (error) {
    console.error("Error creating portal:", error);
    return NextResponse.json(
      { error: "Failed to create portal", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
