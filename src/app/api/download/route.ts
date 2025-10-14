import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const fileName = searchParams.get("name") || "file";

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
  }

  try {
    // Télécharge le fichier Firebase Storage
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch file from Firebase");

    const blob = await response.blob();

    // Renvoie le fichier avec les bons headers
    return new Response(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error in /api/download:", error);
    return NextResponse.json({ error: "Error downloading file" }, { status: 500 });
  }
}
