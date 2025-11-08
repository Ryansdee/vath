import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const runtime = "nodejs";

// ✅ Typage correct des données Firestore
interface PortalData {
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

    // ✅ Typé correctement
    const data = snap.data() as PortalData;
    const amount = Math.round((data.price ?? 0) * 100);

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid or missing price" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      metadata: { portalId },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (error: unknown) {
    console.error("stripe create intent error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
