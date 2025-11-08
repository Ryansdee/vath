// app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const runtime = "nodejs";

// ✅ Typage Firestore Portal
interface PortalData {
  clientName?: string;
  clientEmail?: string;
  projectName?: string;
  price?: number;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { portalId } = await req.json();
    if (!portalId) {
      return NextResponse.json({ error: "portalId is required" }, { status: 400 });
    }

    const snap = await getDoc(doc(db, "portals", portalId));
    if (!snap.exists()) {
      return NextResponse.json({ error: "Portal not found" }, { status: 404 });
    }

    // ✅ Type Firestore doc correctly
    const data = snap.data() as PortalData;
    const price = Number(data.price ?? 0);

    if (price <= 0) {
      return NextResponse.json({ error: "No payable price for this portal" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const successUrl = `${siteUrl}/portal/${portalId}?checkout=success`;
    const cancelUrl = `${siteUrl}/portal/${portalId}?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      currency: "eur",
      client_reference_id: portalId,
      metadata: { portalId },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: data.projectName || "Client Portal Access",
              description: `Access code for ${data.clientName || "client"}`,
            },
            unit_amount: Math.round(price * 100), // cents
          },
          quantity: 1,
        },
      ],
    });

    return NextResponse.json({ success: true, sessionId: session.id });

  } catch (error: unknown) {
    console.error("create-checkout-session error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown Stripe error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
