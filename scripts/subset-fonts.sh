#!/usr/bin/env sh
# Story 3.3 (NFR-1): shrinks the self-hosted fonts to the characters the site uses, so Lighthouse's
# slow-4G first paint stays under budget. Rewrites public/fonts/*.woff2 in place; safe to run again.
# The files are cached as immutable: after a change, bump the .vN suffix in the file name and in
# lib/fonts.ts + app/globals.css.
# Needs fonttools + brotli: pip install fonttools brotli
# Usage: sh scripts/subset-fonts.sh (run after replacing a font with a fresh fontsource file)
set -eu

dir=public/fonts
# Arabic faces: the Arabic block, bidi and joining controls, punctuation and guillemets. The ASCII range
# is a no-op today (fontsource Arabic files carry no Latin; Plex Latin covers it) but keeps any we add.
arabic="U+0020-007E,U+00A0,U+00AB,U+00BB,U+0600-06FF,U+200C-200F,U+2010-2027,U+2066-2069"
# Latin faces: Latin-1 (all French accents), oe ligatures, general punctuation, euro, minus.
latin="U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212"

subset() {
  python -m fontTools.subset "$1" --flavor=woff2 --no-hinting --desubroutinize \
    --output-file="$1.tmp" "$2" && mv "$1.tmp" "$1"
}

for font in "$dir"/*-arabic-arabic-*-normal.v*.woff2; do subset "$font" --unicodes="$arabic"; done
for font in "$dir"/*-latin-*-normal.v*.woff2; do subset "$font" --unicodes="$latin"; done

# Header wordmark only (every page, both locales): three letters instead of the whole Naskh face.
python -m fontTools.subset "$dir/noto-naskh-arabic-arabic-400-normal.v1.woff2" --text="وعد" \
  --flavor=woff2 --no-hinting --output-file="$dir/noto-naskh-arabic-wordmark.v1.woff2"

ls -l "$dir"/*.woff2
