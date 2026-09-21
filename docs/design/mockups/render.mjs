// Renders mockups to PNG for the design loop. Usage: node render.mjs <round>
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const require = createRequire(path.resolve('../../../../da3m-ma/package.json'));
const { chromium } = require('@playwright/test');
const dir = path.dirname(url.fileURLToPath(import.meta.url));
const round = process.argv[2] || '1';
const out = path.join(dir, 'shots', 'r' + round); fs.mkdirSync(out, { recursive: true });
const icons = fs.readFileSync(path.join(dir, 'icons.svg.html'), 'utf8');
const shots = [
  ['list-fr', 390, 'list-fr-mobile'], ['list-fr', 1280, 'list-fr-desktop'],
  ['detail-fr', 390, 'detail-fr-mobile'], ['detail-ar', 390, 'detail-ar-mobile'], ['detail-fr', 1280, 'detail-fr-desktop'],
];
const browser = await chromium.launch();
for (const [file, width, name] of shots) {
  const html = fs.readFileSync(path.join(dir, file + '.html'), 'utf8').replace('<!--ICONS-->', icons);
  const built = path.join(dir, '.built-' + file + '.html'); fs.writeFileSync(built, html);
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: width < 500 ? 2 : 1 });
  await page.goto(url.pathToFileURL(built).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
  await page.close();
}
await browser.close();
console.log('rendered to', out);
