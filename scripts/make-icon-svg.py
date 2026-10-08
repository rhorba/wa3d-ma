"""Brand mark (2026-10-06): writes app/icon.svg, the letter waw from the Naskh wordmark subset, ink on
paper, outlined so the favicon needs no font. Run again only if the mark or the font file changes,
then re-run scripts/make-brand-assets.mjs for the PNG/ICO copies.
Needs fonttools + brotli (same as subset-fonts.sh). Usage: python scripts/make-icon-svg.py
"""

from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONT = Path("public/fonts/noto-naskh-arabic-wordmark.v1.woff2")
OUT = Path("app/icon.svg")
SIZE = 512  # viewBox side
FILL = 0.62  # glyph height as a share of the box
PAPER, INK = "#F7F5F0", "#1B1B18"  # --color-paper, --color-ink (docs/ui-wa3d-ma.md)

font = TTFont(FONT)
glyphs = font.getGlyphSet()
name = font.getBestCmap()[ord("و")]

bounds = BoundsPen(glyphs)
glyphs[name].draw(bounds)
x_min, y_min, x_max, y_max = bounds.bounds
scale = SIZE * FILL / (y_max - y_min)
# Font units are y-up: flip, then centre the glyph's ink box in the square.
dx = (SIZE - (x_max - x_min) * scale) / 2 - x_min * scale
dy = (SIZE + (y_max - y_min) * scale) / 2 + y_min * scale

svg_pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
glyphs[name].draw(TransformPen(svg_pen, (scale, 0, 0, -scale, dx, dy)))

OUT.write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}">'
    f'<rect width="{SIZE}" height="{SIZE}" rx="{SIZE // 8}" fill="{PAPER}"/>'
    f'<path fill="{INK}" d="{svg_pen.getCommands()}"/></svg>\n',
    encoding="utf-8",
)
print(f"{OUT}: {OUT.stat().st_size} bytes")
