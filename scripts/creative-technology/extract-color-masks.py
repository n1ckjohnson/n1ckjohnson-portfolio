#!/usr/bin/env python3
"""
Creative Technology: region masks for the Rivalries color engineering page.

The color correction is built from masked adjustment groups inside a working
Photoshop file (jersey, pants, teal, gold, facemask and so on). This script
reads ONLY the layer-mask channels of those groups and writes small display
derivatives, so the page can show where each correction applies using the
masks the project really uses instead of a drawing of them.

What it does and does not touch:
  - The PSD is opened read-only. No pixel layer is read and nothing is saved
    back. The file is never copied.
  - Output is a low-resolution alpha mask per region, written to
    media-internal/ (git-ignored). Like every other asset it stays out of a
    public build until its manifest entry is approved.

Source paths come from the private source map (media-internal/sources.local.mjs,
entries with "derive": "psd-masks"), passed in by build-media.mjs:

    python3 extract-color-masks.py <psd> <out-dir> <stem> <width> <region=group[,group]> ...

Requires psd-tools and Pillow (pip install psd-tools).
"""
import json
import os
import sys

from PIL import Image, ImageChops
from psd_tools import PSDImage


def on_canvas(layer, size):
    """A layer's own mask placed on the full canvas, or None if it has none."""
    mask = layer.mask
    if mask is None or mask.size == (0, 0):
        return None
    tile = mask.topil()
    if tile is None:
        return None
    canvas = Image.new("L", size, int(mask.background_color or 0))
    canvas.paste(tile.convert("L"), (mask.left, mask.top))
    return canvas


def group_mask(psd, group_name):
    """
    Where one adjustment group applies: the union of the masks on the layers
    inside it, limited by the group's own mask when it has one.
    """
    union = None
    limit = None
    for layer in psd.descendants():
        if layer.is_group() and layer.name == group_name:
            limit = on_canvas(layer, psd.size)
        parent = layer.parent
        if parent is None or getattr(parent, "name", None) != group_name:
            continue
        canvas = on_canvas(layer, psd.size)
        if canvas is not None:
            union = canvas if union is None else ImageChops.lighter(union, canvas)
    if union is not None and limit is not None:
        union = ImageChops.darker(union, limit)
    return union


def main():
    psd_path, out_dir, stem, width = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
    specs = [arg.split("=", 1) for arg in sys.argv[5:]]

    psd = PSDImage.open(psd_path)
    canvas_w, canvas_h = psd.size
    height = round(canvas_h * width / canvas_w)
    os.makedirs(out_dir, exist_ok=True)

    report = {"canvas": [canvas_w, canvas_h], "width": width, "height": height, "regions": {}}
    for region, groups in specs:
        union = None
        for name in groups.split(","):
            mask = group_mask(psd, name)
            if mask is not None:
                union = mask if union is None else ImageChops.lighter(union, mask)
        if union is None:
            print(f"  skip   {region}: no mask found in {groups}")
            continue

        small = union.resize((width, height), Image.LANCZOS)
        coverage = sum(small.histogram()[128:]) / (width * height)
        bbox = small.point(lambda v: 255 if v > 24 else 0).getbbox()

        # Alpha carries the mask: the page uses it directly as a CSS mask.
        rgba = Image.new("RGBA", (width, height), (255, 255, 255, 0))
        rgba.putalpha(small)
        out = os.path.join(out_dir, f"{stem}-mask-{region}.png")
        rgba.save(out, optimize=True)

        report["regions"][region] = {
            "groups": groups.split(","),
            "coverage": round(coverage, 4),
            "bbox": [round(bbox[0] / width, 4), round(bbox[1] / height, 4), round(bbox[2] / width, 4), round(bbox[3] / height, 4)] if bbox else None,
        }
        print(f"  built  internal  {os.path.basename(out)}  coverage {coverage:.1%}")

    with open(os.path.join(out_dir, f"{stem}-masks.json"), "w") as handle:
        json.dump(report, handle, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    main()
