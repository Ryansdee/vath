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
    const { clientName, clientEmail, files, projectName, expiresInDays } = await request.json();

    console.log("Creating portal for:", clientName, clientEmail);

    // Validation
    if (!clientName || !clientEmail || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculer la date d'expiration (optionnel)
    const expiresAt = expiresInDays 
      ? Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
      : null;

    // Créer le portail dans Firestore
    const portalData = {
      clientName,
      clientEmail,
      files,
      projectName: projectName || "Untitled Project",
      createdAt: Timestamp.now(),
      ...(expiresAt && { expiresAt }),
    };

    console.log("Portal data:", portalData);

    const portalRef = await addDoc(collection(db, "portals"), portalData);

    console.log("Portal created with ID:", portalRef.id);

    const portalId = portalRef.id;
    const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/portal/${portalId}`;

    // Envoyer l'email au client avec le lien du portail
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
                    <td style="color: #999999; font-size: 11px; font-weight: 300;">Files:</td>
                    <td style="color: #000000; font-size: 11px; font-weight: 300; text-align: right;">${files.length} ${files.length === 1 ? 'file' : 'files'}</td>
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
          
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
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

    console.log("Email sent successfully");

    return NextResponse.json({ 
      success: true, 
      portalId,
      portalUrl 
    });
  } catch (error) {
    console.error("Error creating portal:", error);
    return NextResponse.json(
      { error: "Failed to create portal", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// ===== Exemple d'utilisation pour créer un portail =====
/*
const createPortal = async () => {
  const response = await fetch('/api/portal/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientName: "John Doe",
      clientEmail: "john@example.com",
      projectName: "Wedding Photography",
      expiresInDays: 30, // Expire dans 30 jours (optionnel)
      files: [
        {
          id: "1",
          url: "https://firebasestorage.../photo1.jpg",
          name: "wedding-photo-1.jpg",
          type: "image",
          size: 2500000
        },
        {
          id: "2",
          url: "https://firebasestorage.../video1.mp4",
          name: "ceremony-highlight.mp4",
          type: "video",
          size: 45000000
        }
      ]
    }),
  });
  
  const data = await response.json();
  console.log('Portal created:', data.portalUrl);
};
*/