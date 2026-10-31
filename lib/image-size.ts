import { closeSync, openSync, readFileSync, readSync } from "fs";

export type Size = { width: number; height: number };

/**
 * Reads intrinsic pixel dimensions from an image file header (PNG, JPEG,
 * GIF, WebP) without decoding it. Used at build time so every image can
 * reserve its space and the page never shifts while media loads.
 */
export function readImageSize(filePath: string): Size | null {
  let fd: number | null = null;
  try {
    fd = openSync(filePath, "r");
    const head = Buffer.alloc(64 * 1024);
    const bytes = readSync(fd, head, 0, head.length, 0);
    // Large embedded metadata (ICC, EXIF thumbnails) can push a JPEG's
    // frame header past the first chunk, so fall back to the whole file.
    return parse(head.subarray(0, bytes)) ?? parse(readFileSync(filePath));
  } catch {
    return null;
  } finally {
    if (fd !== null) closeSync(fd);
  }
}

function parse(b: Buffer): Size | null {
  // PNG — IHDR chunk
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  // GIF — logical screen descriptor
  if (b.length > 10 && b.toString("ascii", 0, 3) === "GIF") {
    return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  }

  // WebP — VP8 / VP8L / VP8X
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8 ") {
      return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") {
      return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
    }
  }

  // JPEG — walk segments until a start-of-frame marker
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = b[i + 1];
      const isSOF =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }

  return null;
}
