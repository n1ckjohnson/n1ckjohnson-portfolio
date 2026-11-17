#!/usr/bin/env python3
"""
Creative Technology: real build layers for two demonstrations.

The page shows these graphics being assembled, so the pieces have to be
the real ones. Nothing here is drawn: every pixel comes from a production
PSD or a delivered export.

  Player birthdays  Renders the named layer groups of one player's
                    production PSD, each on its own transparent canvas.
                    Also writes a presentation copy of the photo layer
                    (see soften_photo_edge).
  Injury Report     Finds every player row in delivered reports and writes
                    (a) the report with its rows lifted out, as the base,
                    (b) the box of each row, so the page can place the
                    delivered rows back one at a time.

Writes PNGs to media-internal/derived/ (git-ignored). The media builder
turns them into display files like any other source; the sources map
points at them. Row boxes go to content/creative-technology/data/.

Usage (needs psd-tools, numpy, scipy, Pillow):
  python3 scripts/creative-technology/extract-psd-layers.py
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "media-internal" / "derived"
DATA = ROOT / "content" / "creative-technology" / "data"

# Private paths live in media-internal/psd_sources.local.json (git-ignored).
SOURCES = json.loads((ROOT / "media-internal" / "psd_sources.local.json").read_text())


def birthday():
    from psd_tools import PSDImage

    spec = SOURCES["birthday"]
    psd = PSDImage.open(spec["psd"])
    artboard = next(layer for layer in psd if layer.name == spec["artboard"])
    layout = next(layer for layer in artboard.descendants() if layer.name == spec["layout"])
    width, height = artboard.width, artboard.height
    groups = {layer.name: layer for layer in layout}
    out = OUT / "birthday"
    out.mkdir(parents=True, exist_ok=True)
    for name, members in spec["layers"].items():
        canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        for member in members:
            rendered = groups[member].composite(viewport=(0, 0, width, height))
            if rendered is not None:
                canvas.alpha_composite(rendered.convert("RGBA"))
        canvas.save(out / f"{spec['key']}-{name}.png")
        print("birthday", name)


def soften_photo_edge():
    """
    Presentation only. In the PSD the photo group's grey backdrop gradient
    stops at a hard vertical edge (x = 282 on the 2160px artboard); in the
    finished graphic later layers cover it, but the page shows the layers
    one at a time, so the edge is exposed in the Photo and Signature steps.

    This writes a copy of the photo layer in which only that edge is feathered:
    to the right of it, the backdrop's extra opacity ramps in smoothly over
    640px instead of stepping. Only faint backdrop pixels (alpha <= 140) are
    touched; the player, every other pixel and the PSD are unchanged, and the
    delivered export still finishes the demonstration.
    """
    src = OUT / "birthday" / f"{SOURCES['birthday']['key']}-photo.png"
    image = np.asarray(Image.open(src).convert("RGBA")).astype(np.float64)
    alpha = image[..., 3]
    edge, ramp = 282, 640
    left = alpha[:, edge - 3 : edge - 1].mean(axis=1, keepdims=True)
    xs = np.arange(edge, edge + ramp)
    t = (xs - edge) / ramp
    s = (t * t * (3 - 2 * t))[None, :]
    band = alpha[:, edge : edge + ramp]
    softened = left + (band - left) * s
    backdrop = band <= 140
    band[backdrop] = np.minimum(band, np.maximum(softened, 0))[backdrop]
    alpha[:, edge : edge + ramp] = band
    image[..., 3] = alpha
    out = OUT / "birthday" / f"{SOURCES['birthday']['key']}-photo-presentation.png"
    Image.fromarray(np.clip(image, 0, 255).astype(np.uint8)).save(out)
    print("birthday photo-presentation")


def is_card(rgb):
    """The row card's teal: the outline and the position tab."""
    r, g, b = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    return (r < 70) & (g > 70) & (b > 80) & (g - r > 50)


def rows_of(path, columns_hint):
    rgb = np.asarray(Image.open(path).convert("RGB"))
    h, w, _ = rgb.shape
    labels, count = ndimage.label(is_card(rgb))
    boxes = []
    for sl in ndimage.find_objects(labels):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        boxes.append((x0, y0, x1, y1))
    # A row is wide and short; the title block is taller, chips are narrower.
    min_w = w * (0.33 if columns_hint == 2 else 0.6)
    wide = [b for b in boxes if (b[2] - b[0]) > min_w]
    if not wide:
        return rgb, []
    heights = sorted(b[3] - b[1] for b in wide)
    # Rows share one height. The most common height is the row's.
    row_h = max(set(heights), key=lambda v: sum(abs(v - o) <= 6 for o in heights))
    rows = [b for b in wide if abs((b[3] - b[1]) - row_h) <= 8]
    rows.sort(key=lambda b: (b[0] > w / 2 if columns_hint == 2 else 0, b[1]))
    return rgb, rows


def injury():
    spec = SOURCES["injury"]
    out = OUT / "injury"
    out.mkdir(parents=True, exist_ok=True)
    geometry = {}
    for key, item in spec.items():
        rgb, rows = rows_of(item["src"], item["columns"])
        h, w, _ = rgb.shape
        if len(rows) != item["players"]:
            raise SystemExit(f"{key}: found {len(rows)} rows, expected {item['players']}")
        base = rgb.copy()
        pad = 3
        for x0, y0, x1, y1 in rows:
            # Fill with the colour just outside the card: the report's own background.
            fill = rgb[max(y0 - pad - 2, 0), max(x0 - pad - 2, 0)]
            base[max(y0 - pad, 0) : y1 + pad, max(x0 - pad, 0) : x1 + pad] = fill
        Image.fromarray(base).save(out / f"base-{key}.png")
        geometry[key] = {
            "width": w,
            "height": h,
            "rows": [[round(v, 5) for v in (x0 / w, y0 / h, (x1 - x0) / w, (y1 - y0) / h)] for x0, y0, x1, y1 in rows],
        }
        print("injury", key, len(rows))
    (DATA / "injury-rows.json").write_text(json.dumps(geometry, indent=2) + "\n")


if __name__ == "__main__":
    birthday()
    soften_photo_edge()
    injury()
