import { z } from "zod";

// ADR-6: the only module that reads process.env. Values are parsed once and an invalid
// value fails the build, so a misconfigured deploy never reaches readers.

const HttpsUrl = z
  .url({ protocol: /^https$/, error: "must be an https:// URL" })
  .transform((url) => url.replace(/\/+$/, ""));

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: HttpsUrl,
  NEXT_PUBLIC_REPO_URL: HttpsUrl,
  // Only the exact string "true" enables the 2021-2026 archive (FR-9, SDR-3).
  NEXT_PUBLIC_ARCHIVE_ENABLED: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  // CI/test only: catalogue folder to build from (docs/devops-wa3d-ma.md §2).
  WA3D_DATA_DIR: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : "data")),
});

export type Env = {
  siteUrl: string;
  repoUrl: string;
  archiveEnabled: boolean;
  dataDir: string;
};

export type EnvSource = Partial<Record<keyof z.input<typeof EnvSchema>, string | undefined>>;

export function parseEnv(source: EnvSource): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration (see .env.example):\n${problems}`);
  }
  const value = result.data;
  return {
    siteUrl: value.NEXT_PUBLIC_SITE_URL,
    repoUrl: value.NEXT_PUBLIC_REPO_URL,
    archiveEnabled: value.NEXT_PUBLIC_ARCHIVE_ENABLED,
    dataDir: value.WA3D_DATA_DIR,
  };
}

let cached: Env | undefined;

export function env(): Env {
  // Literal property access so Next can inline the public values where needed.
  cached ??= parseEnv({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_REPO_URL: process.env.NEXT_PUBLIC_REPO_URL,
    NEXT_PUBLIC_ARCHIVE_ENABLED: process.env.NEXT_PUBLIC_ARCHIVE_ENABLED,
    WA3D_DATA_DIR: process.env.WA3D_DATA_DIR,
  });
  return cached;
}
