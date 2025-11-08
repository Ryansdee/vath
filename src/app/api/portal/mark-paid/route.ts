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

    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/portal/${portalId}`;

    const html = `
<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif">
  <h2>Payment received — Your access code</h2>
  <p>Hi ${data.clientName},</p>
  <p>Your payment for <strong>${data.projectName || "your project"}</strong> has been received.</p>
  <p><a href="${portalUrl}">Access Portal</a></p>
  <p>Portal Code: <strong>${data.portalCode}</strong></p>
  ${data.expiresAt ? `<p>Expires on: ${data.expiresAt.toDate().toLocaleDateString()}</p>` : ""}
</body></html>
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
