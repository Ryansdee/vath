// app/api/portal/create/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});

function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
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
      price = 0,
    } = await request.json();

    if (!clientName || !clientEmail)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const portalCode = generateUniqueCode();
    const createdAt = Timestamp.now();
    const expiresAt = expiresInDays
      ? Timestamp.fromMillis(createdAt.toMillis() + expiresInDays * 86400000)
      : null;

    const paymentRequired = price > 0;
    const paid = !paymentRequired;

    const portalData = {
      clientName,
      clientEmail,
      projectName: projectName || "Untitled Project",
      createdAt,
      ...(expiresAt && { expiresAt }),
      portalCode,
      files,
      price,
      paymentRequired,
      paid,
      paidAt: paid ? createdAt : null,
    };

    const ref = await addDoc(collection(db, "portals"), portalData);
    const portalId = ref.id;
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/portal/${portalId}`;

    // --- EMAILS ---
    const emailHeader = `
      <div style="font-family:Arial,sans-serif;background:#fafafa;padding:40px;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:12px;">
          <h2 style="text-align:center;color:#111;">${projectName}</h2>
          <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
    `;

    const emailFooter = `
          <p style="text-align:center;color:#777;font-size:12px;margin-top:40px;">
            © ${new Date().getFullYear()} Vath Studio — Secure Client Portal
          </p>
        </div>
      </div>
    `;

    const emailHtmlPayment = `
      ${emailHeader}
      <p>Bonjour ${clientName},</p>
      <p>Votre portail est prêt pour <strong>${projectName}</strong>.</p>
      <p>Pour accéder à vos fichiers, veuillez finaliser le paiement de <strong>${price.toFixed(2)} €</strong>.</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="${portalUrl}" style="background:black;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">
          Payer maintenant
        </a>
      </p>
      <p>Une fois le paiement validé, vous recevrez automatiquement un email avec votre code d’accès.</p>
      ${expiresAt ? `<p>Le portail expirera le ${expiresAt.toDate().toLocaleDateString()}.</p>` : ""}
      ${emailFooter}
    `;

    const emailHtmlImmediate = `
      ${emailHeader}
      <p>Bonjour ${clientName},</p>
      <p>Vos fichiers pour <strong>${projectName}</strong> sont disponibles.</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="${portalUrl}" style="background:black;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">
          Accéder au portail
        </a>
      </p>
      <p>Votre code d’accès : <strong>${portalCode}</strong></p>
      ${expiresAt ? `<p>Expiration : ${expiresAt.toDate().toLocaleDateString()}</p>` : ""}
      ${emailFooter}
    `;

    const subject = paymentRequired
      ? `Paiement requis — ${projectName}`
      : `Vos fichiers sont prêts — ${projectName}`;

    const html = paymentRequired ? emailHtmlPayment : emailHtmlImmediate;

    await transporter.sendMail({
      from: `"Vath Studio" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      portalId,
      portalUrl,
      portalCode,
      message: paymentRequired
        ? "Portal created. Payment email sent."
        : "Portal created and access code sent.",
    });
  } catch (error: unknown) {
    console.error("Create portal error:", error);

    let message = "Unknown error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { error: "Failed to create portal", details: message },
      { status: 500 }
    );
  }
}
