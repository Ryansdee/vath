import { NextResponse } from "next/server";
import archiver from "archiver";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filesParam = searchParams.get("files"); // JSON.stringify([{url, name}, ...])

  if (!filesParam) {
    return NextResponse.json({ error: "Missing files parameter" }, { status: 400 });
  }

  let files: { url: string; name: string }[];
  try {
    files = JSON.parse(filesParam);
  } catch {
    return NextResponse.json({ error: "Invalid files parameter" }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("error", (err) => {
        controller.error(err);
      });

      archive.on("data", (chunk) => {
        controller.enqueue(chunk);
      });

      archive.on("end", () => {
        controller.close();
      });

      // Ajouter chaque fichier depuis Firebase
      (async () => {
        for (const file of files) {
          try {
            const res = await fetch(file.url);
            const arrayBuffer = await res.arrayBuffer();
            archive.append(Buffer.from(arrayBuffer), { name: file.name });
          } catch (err) {
            console.error(`Erreur téléchargement fichier ${file.name}:`, err);
          }
        }
        archive.finalize();
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=portal-files.zip`,
    },
  });
}
