// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// ✅ Typage propre du portail Firestore
interface PortalData {
  clientName?: string;
  clientEmail?: string;
  projectName?: string;
  portalCode?: string;
  expiresAt?: Timestamp | null;
  paid?: boolean;
}

// ✅ Stripe instance correcte
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ✅ Email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown signature error";
    console.error("⚠️ Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // ✅ Extraction robuste du portalId
      const portalId =
        session.client_reference_id ??
        (session.metadata?.portalId ?? null);

      if (!portalId) {
        console.warn("⚠️ No portalId in session.metadata — skipping");
        return NextResponse.json({ received: true });
      }

      // ✅ Lecture Firestore
      const ref = doc(db, "portals", portalId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn("⚠️ Portal not found for webhook:", portalId);
        return NextResponse.json({ received: true });
      }

      const data = snap.data() as PortalData;

      if (!data.paid) {
        await updateDoc(ref, { paid: true, paidAt: Timestamp.now() });

        // ✅ Email d'accès
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const portalUrl = `${siteUrl}/portal/${portalId}`;

        const expirationText =
          data.expiresAt && typeof data.expiresAt.toDate === "function"
            ? data.expiresAt.toDate().toLocaleDateString()
            : null;

        const html = `
<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif">
  <h2>Payment received — Your access code</h2>
  <p>Hi ${data.clientName ?? ""},</p>
  <p>Your payment for <strong>${data.projectName ?? "your project"}</strong> is confirmed.</p>
  <p><a href="${portalUrl}">Access your portal</a></p>
  <p>Portal Code: <strong>${data.portalCode ?? ""}</strong></p>
  ${expirationText ? `<p>Expires on: ${expirationText}</p>` : ""}
</body></html>
        `.trim();

        try {
          await transporter.sendMail({
            from: `"Vath Studio" <${process.env.EMAIL_USER}>`,
            to: data.clientEmail,
            subject: `Access code — ${data.projectName ?? "Your Project"}`,
            html,
          });
          console.log("📧 Access email sent after payment");
        } catch (emailError) {
          console.error("📨 Email send failed:", emailError);
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown webhook processing error";
    console.error("Webhook internal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
