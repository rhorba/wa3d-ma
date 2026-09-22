import localFont from "next/font/local";

// UI §2 typefaces, committed under the SIL Open Font License (app/fonts/LICENSE-*.txt).
// Local files, not next/font/google: the build must never touch the network (SDR-4, NFR-5),
// and a Google Fonts hiccup once broke CI. Served from our own origin (CSP font-src 'self').
// Shared by the locale layout and the root 404 page. Subset by scripts/subset-fonts.sh (Story 3.3), and
// not preloaded (preloading every face stole bandwidth from first paint on slow 4G). display optional: a font
// that misses the first ~100 ms is skipped for that page instead of swapping in and shifting the layout (CLS).
const plex = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex",
  display: "optional",
  preload: false,
});
const sourceSerif = localFont({
  src: [{ path: "./fonts/source-serif-4-latin-600-normal.woff2", weight: "600" }],
  variable: "--font-source-serif",
  display: "optional",
  preload: false,
});
const plexArabic = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex-arabic",
  display: "optional",
  preload: false,
});
const naskh = localFont({
  src: [{ path: "./fonts/noto-naskh-arabic-arabic-400-normal.woff2", weight: "400" }],
  variable: "--font-naskh",
  display: "optional",
  preload: false,
});

// The header wordmark alone (scripts/subset-fonts.sh): keeps the full Naskh face off FR pages.
const wordmark = localFont({
  src: [{ path: "./fonts/noto-naskh-arabic-wordmark.woff2", weight: "400" }],
  variable: "--font-wordmark",
  display: "optional",
  preload: false,
});

export const fontVariables = [plex, sourceSerif, plexArabic, naskh, wordmark]
  .map((font) => font.variable)
  .join(" ");
