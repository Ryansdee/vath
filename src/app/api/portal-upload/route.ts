import { NextRequest, NextResponse } from "next/server";
import {admin} from "../../../../lib/firebase-admin";


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob | null;
  const portalId = formData.get("portalId") as string | null;
  const email = formData.get("email") as string | null;

  if (!file || !portalId || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Vérifier si l'email est autorisé
  const ALLOWED_EMAILS = process.env.NEXT_PUBLIC_ALLOWED_EMAILS!.split(",");
  if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: "Email not authorized" }, { status: 403 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${(file as any).name || "upload"}`;
    const fileRef = bucket.file(`portals/${portalId}/${fileName}`);

    await fileRef.save(buffer, {
      metadata: { contentType: (file as any).type },
      resumable: false,
    });

    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // URL publique longue durée
    });

    return NextResponse.json({ url, name: fileName });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
