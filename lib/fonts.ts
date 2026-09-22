// UI §2 typefaces, self-hosted from public/fonts (SIL Open Font License, LICENSE-*.txt beside them).
// Declared with @font-face in app/globals.css (font-display optional: no swap, no layout shift) and
// preloaded per locale, so a first visit gets the designed faces within the ~100 ms optional window
// without the other locale's files on its critical path (Story 3.5 design check).
// Files are served immutable (next.config.ts): bump the .vN suffix whenever a file's content changes.
export const FONTS = {
  plex400: "/fonts/ibm-plex-sans-latin-400-normal.v1.woff2",
  plex600: "/fonts/ibm-plex-sans-latin-600-normal.v1.woff2",
  serif600: "/fonts/source-serif-4-latin-600-normal.v1.woff2",
  plexArabic400: "/fonts/ibm-plex-sans-arabic-arabic-400-normal.v1.woff2",
  plexArabic600: "/fonts/ibm-plex-sans-arabic-arabic-600-normal.v1.woff2",
  naskh400: "/fonts/noto-naskh-arabic-arabic-400-normal.v1.woff2",
  wordmark: "/fonts/noto-naskh-arabic-wordmark.v1.woff2",
} as const;

// What the first screen of each locale paints. Arabic pages still need Plex Latin: the Arabic files
// carry no Latin letters or digits (dates, figures, "Wa3d.ma"). The FR serif is H1 only; the AR H1 is Naskh.
const PRELOADS: Record<string, readonly string[]> = {
  fr: [FONTS.plex400, FONTS.plex600, FONTS.serif600, FONTS.wordmark],
  ar: [
    FONTS.plexArabic400,
    FONTS.plexArabic600,
    FONTS.naskh400,
    FONTS.plex400,
    FONTS.plex600,
    FONTS.wordmark,
  ],
};

export function fontPreloads(locale: string): readonly string[] {
  return PRELOADS[locale] ?? [];
}
