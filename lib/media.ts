import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { readImageSize } from "@/lib/image-size";

/**
 * Build-time media discovery for /public. Project folders follow a simple
 * naming convention (hero, thumb, break, support-N …) so content files only
 * describe *which* groups to show, never individual paths.
 */

export type MediaKind = "image" | "animated" | "video";

export type MediaItem = {
  src: string;
  kind: MediaKind;
  width: number;
  height: number;
};

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
const ANIMATED_EXTS = ["gif"];
const VIDEO_EXTS = ["mp4", "webm"];
const MEDIA_EXTS = [...IMAGE_EXTS, ...ANIMATED_EXTS, ...VIDEO_EXTS];

// Fallback frame for media whose size can't be read (video): 16:9
const FALLBACK = { width: 1920, height: 1080 };

const publicDir = join(process.cwd(), "public");

function extension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function kindOf(filename: string): MediaKind {
  const ext = extension(filename);
  if (VIDEO_EXTS.includes(ext)) return "video";
  if (ANIMATED_EXTS.includes(ext)) return "animated";
  return "image";
}

function trailingNumber(filename: string) {
  return parseInt(filename.match(/(\d+)\.[^.]+$/)?.[1] ?? "0", 10);
}

/** Resolves a public path (e.g. "/work/x/hero.jpg") to a sized media item. */
export function mediaItem(src: string): MediaItem | null {
  const filePath = join(publicDir, src);
  if (!existsSync(filePath)) return null;
  const kind = kindOf(src);
  const size = kind === "video" ? null : readImageSize(filePath);
  return { src, kind, ...(size ?? FALLBACK) };
}

function listDir(dir: string): string[] {
  const path = join(publicDir, dir);
  if (!existsSync(path)) return [];
  try {
    return readdirSync(path).filter((f) => MEDIA_EXTS.includes(extension(f)));
  } catch {
    return [];
  }
}

/** First file named `<base>.<ext>` in a folder, by extension preference. */
export function findMedia(dir: string, base: string): MediaItem | null {
  const files = listDir(dir);
  for (const ext of MEDIA_EXTS) {
    const filename = `${base}.${ext}`;
    if (files.includes(filename)) return mediaItem(`/${dir}/${filename}`);
  }
  return null;
}

/** All files in a folder matching `pattern`, ordered by trailing number. */
export function listMedia(dir: string, pattern: RegExp): MediaItem[] {
  return listDir(dir)
    .filter((f) => pattern.test(f))
    .sort((a, b) => trailingNumber(a) - trailingNumber(b))
    .map((f) => mediaItem(`/${dir}/${f}`))
    .filter((item): item is MediaItem => item !== null);
}

export function workDir(slug: string) {
  return `work/${slug}`;
}

export function detectLogoSrc(): string | null {
  for (const ext of ["svg", "png", "webp"]) {
    if (existsSync(join(publicDir, `logo.${ext}`))) return `/logo.${ext}`;
  }
  return null;
}
