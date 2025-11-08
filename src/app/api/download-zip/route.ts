import { NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough, Readable } from "node:stream";
import { ReadableStream as WebReadableStream } from "node:stream/web";

export const runtime = "nodejs";

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "portal-files";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filesParam = searchParams.get("files");
  const nameParam = searchParams.get("name");

  if (!filesParam)
    return NextResponse.json({ error: "Missing files parameter" }, { status: 400 });

  let files: { url: string; name: string }[];
  try {
    files = JSON.parse(filesParam);
    if (!Array.isArray(files)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid files parameter" }, { status: 400 });
  }

  const zipName = sanitizeFilename(nameParam || "portal-files");
  const pass = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => pass.destroy(err));
  archive.pipe(pass);

  for (const file of files) {
    try {
      const res = await fetch(file.url);
      if (!res.ok || !res.body) continue;

      // ✅ Web -> Node stream conversion CORRECTE
      const webStream = res.body as WebReadableStream<Uint8Array>;
      const nodeReadable = Readable.fromWeb(webStream);

      archive.append(nodeReadable, { name: file.name });
    } catch (err) {
      console.error(`Erreur fichier ${file.name}:`, err);
    }
  }

  void archive.finalize();

  // ✅ Node → Web stream conversion pour `Response()`
// Convert Node PassThrough -> Web Stream
const nodeToWebStream = Readable.toWeb(pass);

// Tell TypeScript it is the DOM version of ReadableStream
const domReadableStream = nodeToWebStream as unknown as globalThis.ReadableStream<Uint8Array>;

return new Response(domReadableStream, {
  headers: {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${zipName}.zip"`,
    "Cache-Control": "no-store",
  },
});
}
