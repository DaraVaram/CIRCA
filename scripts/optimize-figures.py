# -*- coding: utf-8 -*-
"""
Prepares publication figures for the web.

The source images in PublicationPictures/ are a mix of architecture diagrams and
journal title blocks, at wildly different sizes (up to 23800px wide, 10 MB) and
aspect ratios (2.4:1 to 6.7:1). Both are a problem: the file sizes are far too
large to ship, and the ratio spread would make the figure cards different heights
and break alignment down the publication list.

So each image is scaled to fit inside one fixed canvas and centered on white.
Every output is then byte-for-byte the same dimensions, which means every figure
card renders identically no matter what was fed in. Nothing is cropped.

    python scripts/optimize-figures.py

Add a new figure by dropping it in PublicationPictures/ and adding a line to
MAPPING below, keyed by publication id from src/data/publications.json.
"""
import io
import json
import os
import sys

from PIL import Image

SRC = 'PublicationPictures'
OUT = 'public/images/papers'

# One canvas for every figure. 3:1 sits near the median of the source ratios, so
# the letterboxing stays modest in both directions. 1400px wide covers a ~600px
# render at 2x device pixel ratio.
CANVAS = (1400, 467)
BACKGROUND = (255, 255, 255)
QUALITY = 82

# Source file -> publication id in src/data/publications.json.
MAPPING = {
    'NotAllObjectivesAreBornEqual.png': 'J15',
    'LP-NeRV.png': 'J14',
    'QuantizationSurvey.png': 'J12',
    'SubMillisecond.jpg': 'J10',
    'DifferentStrokes.png': 'J9',
    'SpectrumSensing.png': 'J8',
    'DataSeparation.png': 'J7',
    # Inferred from the diagram: a CNN over complex frequency points with four
    # indoor classes. J1 is the same phrase but uses weighted k-NN, not a CNN.
    'ClassificationIndoorEnvironments.png': 'J6',
}

# Pillow refuses very large images by default as a decompression-bomb guard.
# These are ours, and one is 23800px wide.
Image.MAX_IMAGE_PIXELS = None


def flatten(img):
    """Composite any transparency onto white, matching the card background."""
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        bg = Image.new('RGB', img.size, BACKGROUND)
        bg.paste(img, mask=img.split()[-1])
        return bg
    return img.convert('RGB')


def process(src_path, pub_id):
    img = flatten(Image.open(src_path))
    src_w, src_h = img.size

    # Contain: scale to fit inside the canvas without cropping.
    scale = min(CANVAS[0] / src_w, CANVAS[1] / src_h)
    # Never upscale a small source, it only adds bytes and blur.
    scale = min(scale, 1.0)
    new = (max(1, round(src_w * scale)), max(1, round(src_h * scale)))
    img = img.resize(new, Image.LANCZOS)

    canvas = Image.new('RGB', CANVAS, BACKGROUND)
    canvas.paste(img, ((CANVAS[0] - new[0]) // 2, (CANVAS[1] - new[1]) // 2))

    out_path = os.path.join(OUT, f'{pub_id}.webp')
    canvas.save(out_path, 'WEBP', quality=QUALITY, method=6)
    return src_w, src_h, os.path.getsize(src_path), os.path.getsize(out_path), out_path


def main():
    if not os.path.isdir(SRC):
        sys.exit(f'missing {SRC}/')
    os.makedirs(OUT, exist_ok=True)

    present = set(os.listdir(SRC))
    unmapped = sorted(f for f in present if f not in MAPPING and not f.startswith('.'))
    missing = sorted(f for f in MAPPING if f not in present)

    pubs = {p['id'] for p in json.load(io.open('src/data/publications.json', encoding='utf-8'))}

    print(f'{"source":40} {"id":5} {"in":>12}  {"out":>9}  {"canvas":>11}')
    print('-' * 84)
    total_in = total_out = 0
    for name, pub_id in MAPPING.items():
        if name not in present:
            continue
        if pub_id not in pubs:
            print(f'  ! {pub_id} is not a publication id, skipping {name}')
            continue
        w, h, sin, sout, out_path = process(os.path.join(SRC, name), pub_id)
        total_in += sin
        total_out += sout
        print(f'{name:40} {pub_id:5} {w:>5}x{h:<5} {sin // 1024:>4}kB -> {sout // 1024:>4}kB  {CANVAS[0]}x{CANVAS[1]}')

    print('-' * 84)
    print(f'{"TOTAL":40} {"":5} {total_in // 1024:>12}kB -> {total_out // 1024}kB')

    if unmapped:
        print('\nNot mapped, so not used:')
        for f in unmapped:
            print(f'  {f}')
    if missing:
        print('\nMapped but not found in the source folder:')
        for f in missing:
            print(f'  {f}')


if __name__ == '__main__':
    main()
