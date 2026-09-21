import { afterEach, describe, expect, it, vi } from "vitest";
import { parseEnv } from "./env";

const valid = {
  NEXT_PUBLIC_SITE_URL: "https://wa3d-ma.vercel.app",
  NEXT_PUBLIC_REPO_URL: "https://github.com/rhorba/wa3d-ma",
};

describe("parseEnv", () => {
  it("parses the documented values with safe defaults", () => {
    expect(parseEnv(valid)).toEqual({
      siteUrl: "https://wa3d-ma.vercel.app",
      repoUrl: "https://github.com/rhorba/wa3d-ma",
      archiveEnabled: false,
      dataDir: "data",
    });
  });

  it("strips trailing slashes so absolute URLs never double them", () => {
    expect(parseEnv({ ...valid, NEXT_PUBLIC_SITE_URL: "https://wa3d.ma/" }).siteUrl).toBe(
      "https://wa3d.ma",
    );
  });

  it.each([
    ["true", true],
    ["false", false],
    ["TRUE", false],
    ["1", false],
    ["", false],
    [undefined, false],
  ])(
    "treats ARCHIVE_ENABLED=%j as %s: only the exact string 'true' enables it",
    (raw, expected) => {
      expect(parseEnv({ ...valid, NEXT_PUBLIC_ARCHIVE_ENABLED: raw }).archiveEnabled).toBe(
        expected,
      );
    },
  );

  it("uses WA3D_DATA_DIR when set and falls back to data when blank", () => {
    expect(parseEnv({ ...valid, WA3D_DATA_DIR: "tests/fixtures/catalogue/valid" }).dataDir).toBe(
      "tests/fixtures/catalogue/valid",
    );
    expect(parseEnv({ ...valid, WA3D_DATA_DIR: "  " }).dataDir).toBe("data");
  });

  it.each([["http://wa3d-ma.vercel.app"], ["javascript:alert(1)"], ["wa3d-ma.vercel.app"], [""]])(
    "rejects a non-https site URL (%j) with a readable message",
    (url) => {
      expect(() => parseEnv({ ...valid, NEXT_PUBLIC_SITE_URL: url })).toThrow(
        /NEXT_PUBLIC_SITE_URL: must be an https:\/\/ URL/,
      );
    },
  );

  it("rejects missing required values and names each one", () => {
    expect(() => parseEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL[\s\S]*NEXT_PUBLIC_REPO_URL/);
  });
});

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reads process.env once and caches the parsed result", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://wa3d-ma.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_REPO_URL", "https://github.com/rhorba/wa3d-ma");
    vi.stubEnv("NEXT_PUBLIC_ARCHIVE_ENABLED", "true");
    const { env } = await import("./env");
    const first = env();
    expect(first.archiveEnabled).toBe(true);

    vi.stubEnv("NEXT_PUBLIC_ARCHIVE_ENABLED", "false");
    expect(env()).toBe(first);
  });
});
