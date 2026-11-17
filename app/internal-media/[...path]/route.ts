import { createReadStream, existsSync, statSync } from "fs";
import { join, normalize, sep } from "path";
import { Readable } from "stream";
import { getAudience } from "@/lib/creative-technology/audience";
import { INTERNAL_MEDIA_DIR } from "@/lib/creative-technology/media";

/**
 * Serves media that is NOT approved for publication, and only to an internal
 * build (the local design review). In a public build this handler always
 * answers 404 and no page references it. The files themselves live outside
 * /public in a git-ignored folder, so they are never part of a deployed site.
 */

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  json: "application/json",
  mp4: "video/mp4",
};

const SAFE_SEGMENT = /^[a-z0-9][a-z0-9._-]*$/i;

function notFound() {
  return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  if (getAudience() !== "internal") return notFound();

  const { path } = await context.params;
  if (!path?.length || !path.every((segment) => SAFE_SEGMENT.test(segment) && !segment.includes(".."))) {
    return notFound();
  }

  const file = normalize(join(INTERNAL_MEDIA_DIR, ...path));
  // turbopackIgnore: keeps media-internal/ out of the traced server output.
  if (!file.startsWith(INTERNAL_MEDIA_DIR + sep) || !existsSync(/* turbopackIgnore: true */ file)) return notFound();

  const stats = statSync(/* turbopackIgnore: true */ file);
  if (!stats.isFile()) return notFound();

  const type = TYPES[file.split(".").pop()?.toLowerCase() ?? ""];
  if (!type) return notFound();

  const versioned = new URL(request.url).searchParams.has("v");
  const stream = Readable.toWeb(createReadStream(/* turbopackIgnore: true */ file)) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(stats.size),
      "Cache-Control": versioned ? "private, max-age=31536000, immutable" : "private, no-cache",
      "X-Robots-Tag": "noindex",
    },
  });
}
