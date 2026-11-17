/**
 * Build audience for the Creative Technology experience.
 *
 * - "public"   Only owner-approved media and public-tier copy are rendered.
 *              This is what `next build` produces unless told otherwise.
 * - "internal" Adds media that is not yet approved for publication, plus
 *              internal-tier facts. Used for the live presentation.
 *
 * Resolution order:
 *   1. an explicit CT_AUDIENCE at run time,
 *   2. local development previews internally,
 *   3. the audience baked into a production build (see next.config.ts),
 *   4. public.
 *
 * Server-only: never import this from a client component.
 */
export type Audience = "public" | "internal";

function parse(value: string | undefined): Audience | null {
  return value === "internal" || value === "public" ? value : null;
}

export function getAudience(): Audience {
  const explicit = parse(process.env.CT_AUDIENCE);
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return "internal";
  return parse(process.env.CT_BUILD_AUDIENCE) ?? "public";
}

export function isInternal(): boolean {
  return getAudience() === "internal";
}
