import { existsSync, readFileSync, statSync } from "fs";
import { join } from "path";
import manifest from "@/content/creative-technology/media.json";
import { readImageSize } from "@/lib/image-size";
import { getAudience } from "@/lib/creative-technology/audience";

/**
 * Approval-aware media resolution for the Creative Technology experience.
 *
 * Every asset is declared in content/creative-technology/media.json and is
 * "pending" until the owner approves it. Pending files live outside /public
 * (media-internal/, git-ignored) and are only ever referenced by an internal
 * build. A public build resolves them to `null`, so nothing unapproved can
 * reach the page, the bundle or the deployed output.
 *
 * Server-only: uses the filesystem and the build audience.
 */

export type Provenance =
  | "production-output"
  | "system-output-synthetic"
  | "qa-proof"
  | "source-input"
  | "derived";

export type ManifestEntry = {
  id: string;
  file: string;
  kind: "image" | "lottie" | "video";
  project: string;
  alt: string;
  provenance: Provenance;
  source: string;
  approval: "approved" | "pending";
  publicPath?: string;
  note?: string;
};

/** What a client component receives. Contains no private paths. */
export type Media = {
  id: string;
  src: string;
  kind: ManifestEntry["kind"];
  width: number;
  height: number;
  alt: string;
  provenance: Provenance;
};

export type MediaMap = Record<string, Media | null>;

// turbopackIgnore: these folders are read at run time. Without it the bundler
// treats each one as a build dependency and traces every file in it.
export const INTERNAL_MEDIA_DIR = join(/* turbopackIgnore: true */ process.cwd(), "media-internal", "creative-technology");
const PUBLIC_DIR = join(/* turbopackIgnore: true */ process.cwd(), "public");
const APPROVED_DIR = join(PUBLIC_DIR, "creative-technology", "media");

export const APPROVED_URL = "/creative-technology/media";
// Kept at the top level, away from the project routes, so a public page's
// route data never has cause to mention it.
export const INTERNAL_URL = "/internal-media";

const entries = manifest as ManifestEntry[];
const byId = new Map(entries.map((entry) => [entry.id, entry]));

export function mediaManifest(): ManifestEntry[] {
  return entries;
}

function locate(entry: ManifestEntry): { path: string; src: string } | null {
  if (entry.approval === "approved") {
    return entry.publicPath
      ? { path: join(PUBLIC_DIR, entry.publicPath), src: entry.publicPath }
      : { path: join(APPROVED_DIR, entry.file), src: `${APPROVED_URL}/${entry.file}` };
  }
  if (getAudience() !== "internal") return null;
  return { path: join(INTERNAL_MEDIA_DIR, entry.file), src: `${INTERNAL_URL}/${entry.file}` };
}

/** Resolves one asset for the current audience, or `null` if it may not be shown. */
export function resolveMedia(id: string): Media | null {
  const entry = byId.get(id);
  if (!entry) return null;
  const located = locate(entry);
  // turbopackIgnore: paths come from the manifest at run time. Without it the
  // bundler traces the whole project, media-internal/ included, into the output.
  if (!located || !existsSync(/* turbopackIgnore: true */ located.path)) return null;

  const size = entry.kind === "image" ? readImageSize(located.path) : null;
  // Version the URL by modification time so a rebuilt derivative is never served stale.
  const version = Math.round(statSync(/* turbopackIgnore: true */ located.path).mtimeMs / 1000).toString(36);

  return {
    id: entry.id,
    src: `${located.src}?v=${version}`,
    kind: entry.kind,
    width: size?.width ?? 0,
    height: size?.height ?? 0,
    alt: entry.alt,
    provenance: entry.provenance,
  };
}

export function resolveMany(ids: readonly string[]): MediaMap {
  return Object.fromEntries(ids.map((id) => [id, resolveMedia(id)]));
}

/** Resolves every asset whose id starts with `prefix`, keyed by id. */
export function resolvePrefix(prefix: string): MediaMap {
  return resolveMany(entries.filter((entry) => entry.id.startsWith(prefix)).map((entry) => entry.id));
}

/** Reads the JSON sidecar written next to a derived asset (same name, .json). */
export function resolveSidecar<T>(id: string): T | null {
  const entry = byId.get(id);
  if (!entry) return null;
  const located = locate(entry);
  if (!located) return null;
  const sidecar = located.path.replace(/\.[a-z0-9]+$/i, ".json");
  if (!existsSync(/* turbopackIgnore: true */ sidecar)) return null;
  try {
    return JSON.parse(readFileSync(/* turbopackIgnore: true */ sidecar, "utf8")) as T;
  } catch {
    return null;
  }
}
