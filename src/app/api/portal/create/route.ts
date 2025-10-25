import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

// --- Email transporter (Gmail ou SMTP) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// --- Génération d’un code aléatoire à 6 caractères ---
function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const {
      clientName,
      clientEmail,
      files = [],
      projectName,
      expiresInDays = 30,
      delayEmailMs = 0,
      price = 0, // 👈 le prix est ajouté ici
    } = await request.json();

    if (!clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const portalCode = generateUniqueCode();

    const createdAt = Timestamp.now();
    const expiresAt = expiresInDays
      ? Timestamp.fromMillis(createdAt.toMillis() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // --- Créer le document Firestore ---
    const portalData = {
      clientName,
      clientEmail,
      projectName: projectName || "Untitled Project",
      createdAt,
      ...(expiresAt && { expiresAt }),
      portalCode,
      files,
      price, // 👈 on stocke le prix ici
    };

    const portalRef = await addDoc(collection(db, "portals"), portalData);
    const portalId = portalRef.id;
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://vath-portofolio.netlify.app"}/portal/${portalId}`;

    console.log(`✅ Portal created: ${portalId} | Price: ${price}`);

    // --- Préparation de l’email HTML ---
    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #fff; padding: 0; margin: 0;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr><td align="center" style="padding:40px 0;">
      <table width="600" cellpadding="0" cellspacing="0" style="border:1px solid #eee;">
        <tr><td style="background:#000; color:#fff; padding:20px; text-align:center;">
          <h2 style="margin:0; letter-spacing:2px; font-weight:300;">Your Files Are Ready</h2>
        </td></tr>
        <tr><td style="padding:30px;">
          <p>Hi ${clientName},</p>
          <p>Your photos and videos from <strong>${projectName || "your project"}</strong> are ready!</p>
          <p>Access your portal below to view and download all your files:</p>
          <div style="text-align:center; margin:30px 0;">
            <a href="${portalUrl}" style="background:#000; color:#fff; text-decoration:none; padding:12px 30px; letter-spacing:1px;">Access Portal</a>
          </div>
          <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;">
          <p style="font-size:13px; color:#555;">Portal Code: <strong>${portalCode}</strong></p>
          <p style="font-size:13px; color:#555;">Price: <strong>${price.toFixed(2)}€</strong></p>
          ${expiresAt ? `<p style="font-size:13px; color:#555;">Expires on: ${expiresAt.toDate().toLocaleDateString()}</p>` : ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

    // --- Fonction d’envoi de mail ---
    const sendEmail = async () => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: clientEmail,
          subject: `Your Photos & Videos are Ready — ${projectName || "Your Project"}`,
          html: emailHtml,
        });
        console.log(`📧 Email sent to ${clientEmail}`);
      } catch (err) {
        console.error("❌ Error sending email:", err);
      }
    };

    // --- Envoi immédiat ou différé ---
    if (delayEmailMs > 0) {
      console.log(`⏰ Email scheduled for ${delayEmailMs / 60000} minutes`);
      setTimeout(sendEmail, delayEmailMs);
      return NextResponse.json({
        success: true,
        portalId,
        portalUrl,
        portalCode,
        message: `Portal created. Email will be sent in ${delayEmailMs / 60000} minutes.`,
      });
    } else {
      await sendEmail();
      return NextResponse.json({
        success: true,
        portalId,
        portalUrl,
        portalCode,
        message: "Portal created and email sent immediately.",
      });
    }
  } catch (error) {
    console.error("❌ Error creating portal:", error);
    return NextResponse.json(
      { error: "Failed to create portal", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
