// Brand assets (2026-10-06): renders the raster copies of app/icon.svg and the per-locale share
// images with the site's own subset fonts (Chromium shapes the Arabic). Output is committed; this
// runs by hand, not in CI. Re-run after a change to the mark, the fonts, the metadata strings or
// NEXT_PUBLIC_SITE_URL (the host is printed on the share image; runbook R3 domain change).
// Usage: NEXT_PUBLIC_SITE_URL=https://... node scripts/make-brand-assets.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is required (see .env.example)");
const host = new URL(siteUrl).host;

const font = async (file) =>
  `url(data:font/woff2;base64,${(await readFile(`public/fonts/${file}`)).toString("base64")})`;
const fontFaces = `
  @font-face { font-family: Plex; font-weight: 400; src: ${await font("ibm-plex-sans-latin-400-normal.v1.woff2")}; }
  @font-face { font-family: Plex; font-weight: 600; src: ${await font("ibm-plex-sans-latin-600-normal.v1.woff2")}; }
  @font-face { font-family: SourceSerif; font-weight: 600; src: ${await font("source-serif-4-latin-600-normal.v1.woff2")}; }
  @font-face { font-family: PlexAr; font-weight: 400; src: ${await font("ibm-plex-sans-arabic-arabic-400-normal.v1.woff2")}; }
  @font-face { font-family: Naskh; font-weight: 400; src: ${await font("noto-naskh-arabic-arabic-400-normal.v1.woff2")}; }`;

// Tokens from docs/ui-wa3d-ma.md §2.
const css = `
  :root { --paper: #F7F5F0; --ink: #1B1B18; --muted: #5B5850; --rule: #D6D1C4; --accent: #8A5A12; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: var(--paper); color: var(--ink); }
  .card { height: 100%; padding: 72px 88px; display: flex; flex-direction: column;
    border-inline-start: 12px solid var(--accent); }
  .wordmark { font: 600 40px Plex; }
  .wordmark span { font: 400 40px Naskh; color: var(--muted); }
  h1 { margin-top: auto; font: 600 76px/1.15 SourceSerif; max-width: 960px; }
  p { margin-top: 28px; font: 400 30px/1.45 Plex; color: var(--muted); max-width: 960px; }
  footer { margin-top: auto; padding-top: 28px; border-top: 1px solid var(--rule);
    font: 400 26px Plex; color: var(--muted); font-variant-numeric: tabular-nums; }
  [dir="rtl"] h1 { font: 400 84px/1.35 Naskh; }
  [dir="rtl"] p { font: 400 32px/1.6 PlexAr; }
  [dir="rtl"] footer { direction: ltr; text-align: right; }`;

const escape = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

async function shareCard(locale) {
  const messages = JSON.parse(await readFile(`messages/${locale}.json`, "utf8"));
  const dir = locale === "ar" ? "rtl" : "ltr";
  // Header wordmark order (ui doc §3): Latin first in FR, Arabic first in AR.
  const wordmark = dir === "rtl" ? `<span>وعد</span> Wa3d.ma` : `Wa3d.ma <span>وعد</span>`;
  return `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8">
    <style>${fontFaces}${css}</style></head><body><div class="card">
    <div class="wordmark">${wordmark}</div>
    <h1>${escape(messages.home.heading)}</h1>
    <p>${escape(messages.metadata.description)}</p>
    <footer>${escape(host)}</footer></div></body></html>`;
}

// ICO with one embedded PNG (Vista+ format; every current browser reads it).
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([header, png]);
}

const browser = await chromium.launch();
try {
  const svg = await readFile("app/icon.svg", "utf8");
  for (const [size, out] of [
    [180, "app/apple-icon.png"],
    [32, "app/favicon.ico"],
  ]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(
      `<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
    );
    // Apple rounds the corners itself: square, full-bleed paper for the touch icon.
    if (size === 180)
      await page.evaluate(() => document.querySelector("rect").setAttribute("rx", "0"));
    const png = await page.screenshot({ type: "png", omitBackground: size !== 180 });
    await writeFile(out, out.endsWith(".ico") ? ico(png, size) : png);
    await page.close();
  }

  await mkdir("public/og", { recursive: true });
  for (const locale of ["fr", "ar"]) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(await shareCard(locale));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/og/${locale}.png`, type: "png" });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("wrote app/apple-icon.png, app/favicon.ico, public/og/{fr,ar}.png");
