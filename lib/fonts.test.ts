import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FONTS, fontPreloads } from "./fonts";

const css = readFileSync("app/globals.css", "utf8");

describe("self-hosted fonts", () => {
  it("every file exists under public/ and is declared once in globals.css", () => {
    for (const href of Object.values(FONTS)) {
      expect(existsSync(`public${href}`), href).toBe(true);
      expect(css.split(`url("${href}")`).length - 1, href).toBe(1);
    }
  });

  it("never swaps a face in after first paint (CLS)", () => {
    const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
    expect(faces).toHaveLength(Object.keys(FONTS).length);
    for (const face of faces) expect(face).toContain("font-display: optional");
  });

  it("preloads only the faces of the page's own locale", () => {
    expect(fontPreloads("fr")).toEqual([
      FONTS.plex400,
      FONTS.plex600,
      FONTS.serif600,
      FONTS.wordmark,
    ]);
    expect(fontPreloads("ar")).toContain(FONTS.naskh400);
    expect(fontPreloads("ar")).toContain(FONTS.plex400);
    expect(fontPreloads("fr")).not.toContain(FONTS.naskh400);
    expect(fontPreloads("ar")).not.toContain(FONTS.serif600);
    expect(fontPreloads("en")).toEqual([]);
  });
});
