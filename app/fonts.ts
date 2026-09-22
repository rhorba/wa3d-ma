import localFont from "next/font/local";

// UI §2 typefaces, committed under the SIL Open Font License (app/fonts/LICENSE-*.txt).
// Local files, not next/font/google: the build must never touch the network (SDR-4, NFR-5),
// and a Google Fonts hiccup once broke CI. Served from our own origin (CSP font-src 'self').
// Shared by the locale layout and the root 404 page.
const plex = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex",
  display: "swap",
});
const sourceSerif = localFont({
  src: [{ path: "./fonts/source-serif-4-latin-600-normal.woff2", weight: "600" }],
  variable: "--font-source-serif",
  display: "swap",
});
const plexArabic = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex-arabic",
  display: "swap",
});
const naskh = localFont({
  src: [
    { path: "./fonts/noto-naskh-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "./fonts/noto-naskh-arabic-arabic-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-naskh",
  display: "swap",
});

export const fontVariables = [plex, sourceSerif, plexArabic, naskh]
  .map((font) => font.variable)
  .join(" ");
