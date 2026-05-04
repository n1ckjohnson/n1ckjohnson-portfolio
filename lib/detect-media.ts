import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

export function detectLogoSrc(): string | null {
  for (const ext of ["svg", "png", "webp"]) {
    const filePath = join(process.cwd(), "public", `logo.${ext}`);
    if (existsSync(filePath)) return `/logo.${ext}`;
  }
  return null;
}

const MEDIA_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"]);

function isMediaFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MEDIA_EXTS.has(ext);
}

function trailingNumber(filename: string): number {
  return parseInt(filename.match(/(\d+)\.[^.]+$/)?.[1] ?? "0", 10);
}

function readDir(slug: string): string[] {
  const dir = join(process.cwd(), "public", "work", slug);
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function findFile(slug: string, base: string): string | null {
  const files = readDir(slug);
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"]) {
    const filename = `${base}.${ext}`;
    if (files.includes(filename)) return `/work/${slug}/${filename}`;
  }
  return null;
}

export function detectHeroSrc(slug: string): string | null {
  const files = readDir(slug);
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"]) {
    const filename = `hero.${ext}`;
    if (files.includes(filename)) {
      const filePath = join(process.cwd(), "public", "work", slug, filename);
      try {
        const { mtimeMs } = statSync(filePath);
        return `/work/${slug}/${filename}?v=${Math.round(mtimeMs)}`;
      } catch {
        return `/work/${slug}/${filename}`;
      }
    }
  }
  return null;
}

export function detectThumbSrc(slug: string): string | null {
  const files = readDir(slug);
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
    const filename = `thumb.${ext}`;
    if (files.includes(filename)) {
      const filePath = join(process.cwd(), "public", "work", slug, filename);
      try {
        const { mtimeMs } = statSync(filePath);
        return `/work/${slug}/${filename}?v=${Math.round(mtimeMs)}`;
      } catch {
        return `/work/${slug}/${filename}`;
      }
    }
  }
  return null;
}

export function detectBreakSrc(slug: string): string | null {
  return findFile(slug, "break");
}

export function detectBreak2Src(slug: string): string | null {
  return findFile(slug, "break-2");
}

export function detectSupportSrcs(slug: string): string[] {
  const files = readDir(slug);
  const supportFiles = files.filter(
    (f) => f.startsWith("support-") && isMediaFile(f)
  );
  supportFiles.sort((a, b) => trailingNumber(a) - trailingNumber(b));
  return supportFiles.map((f) => `/work/${slug}/${f}`);
}

// Grouped support for social-content-systems
const SOCIAL_GROUPS = [
  { key: "uniform", label: "Uniform Combos" },
  { key: "game-week", label: "Game Week Content" },
  { key: "achievements", label: "Achievements" },
  { key: "salute-service", label: "Salute to Service" },
  { key: "bday", label: "Birthday" },
  { key: "sounds-game", label: "Sounds of the Game Posters" },
];

// Grouped support for small-market-team (2025 Playoffs)
const PLAYOFFS_GROUPS = [
  {
    label: "Playoff Social Creative",
    test: (f: string) => /^support-\d+\.[^.]+$/.test(f) && isMediaFile(f),
  },
  {
    label: "Grassroots Activation",
    test: (f: string) => /^merch-\d+\.[^.]+$/.test(f) && isMediaFile(f),
  },
];

// Grouped support for pro-bowl-campaign
const PRO_BOWL_GROUPS = [
  {
    label: "2026 Creative",
    test: (f: string) => /^support-\d+\.[^.]+$/.test(f) && isMediaFile(f),
  },
  {
    label: "2025 Creative",
    test: (f: string) => /^2025-support-\d+\.[^.]+$/.test(f) && isMediaFile(f),
  },
];

export function detectAboutUsSrcs(slug: string): string[] {
  const files = readDir(slug);
  return files
    .filter((f) => /^about-us-\d+\.[^.]+$/.test(f) && isMediaFile(f))
    .sort((a, b) => trailingNumber(a) - trailingNumber(b))
    .map((f) => `/work/${slug}/${f}`);
}

export function detectLaunchSrcs(slug: string): string[] {
  const files = readDir(slug);
  return files
    .filter((f) => f.startsWith("launch-") && isMediaFile(f))
    .sort((a, b) => trailingNumber(a) - trailingNumber(b))
    .map((f) => `/work/${slug}/${f}`);
}

export function detectCommunicationSrcs(slug: string): string[] {
  const files = readDir(slug);
  return files
    .filter((f) => f.startsWith("communication-") && isMediaFile(f))
    .sort((a, b) => trailingNumber(a) - trailingNumber(b))
    .map((f) => `/work/${slug}/${f}`);
}

export function detectEmailSupportSrcs(slug: string): string[] {
  const files = readDir(slug);
  return files
    .filter((f) => /^email-support-\d+\.[^.]+$/.test(f) && isMediaFile(f))
    .sort((a, b) => trailingNumber(a) - trailingNumber(b))
    .map((f) => `/work/${slug}/${f}`);
}

export function detectSmallMarketSrcs(slug: string): string[] {
  const files = readDir(slug);
  return files
    .filter((f) => /^small-market-\d+\.[^.]+$/.test(f) && isMediaFile(f))
    .sort((a, b) => trailingNumber(a) - trailingNumber(b))
    .map((f) => `/work/${slug}/${f}`);
}

export function detectSupportGroups(
  slug: string
): { label: string; srcs: string[] }[] | null {
  if (slug === "social-content-systems") {
    const files = readDir(slug);
    const groups: { label: string; srcs: string[] }[] = [];
    for (const { key, label } of SOCIAL_GROUPS) {
      const prefix = `support-${key}-`;
      const matched = files
        .filter((f) => f.startsWith(prefix) && isMediaFile(f))
        .sort((a, b) => trailingNumber(a) - trailingNumber(b));
      if (matched.length > 0) {
        groups.push({ label, srcs: matched.map((f) => `/work/${slug}/${f}`) });
      }
    }
    return groups.length > 0 ? groups : null;
  }

  if (slug === "small-market-team") {
    const files = readDir(slug);
    const groups: { label: string; srcs: string[] }[] = [];
    for (const { label, test } of PLAYOFFS_GROUPS) {
      const matched = files
        .filter(test)
        .sort((a, b) => trailingNumber(a) - trailingNumber(b));
      if (matched.length > 0) {
        groups.push({ label, srcs: matched.map((f) => `/work/${slug}/${f}`) });
      }
    }
    return groups.length > 0 ? groups : null;
  }

  if (slug === "pro-bowl-campaign") {
    const files = readDir(slug);
    const groups: { label: string; srcs: string[] }[] = [];
    for (const { label, test } of PRO_BOWL_GROUPS) {
      const matched = files
        .filter(test)
        .sort((a, b) => trailingNumber(a) - trailingNumber(b));
      if (matched.length > 0) {
        groups.push({ label, srcs: matched.map((f) => `/work/${slug}/${f}`) });
      }
    }
    return groups.length > 0 ? groups : null;
  }

  return null;
}
