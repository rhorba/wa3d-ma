import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": root, "server-only": `${root}tests/stubs/server-only.ts` },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["lib/**/*.test.ts", "tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.test.ts"],
      reporter: ["text-summary", "text", "json-summary"],
      // Combined unit + integration gate (CLAUDE.md rule 6, Test Strategy §2).
      // The code that decides what the site says is held to 100% (Test Strategy §2).
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
        "lib/catalogue/status.ts": { lines: 100, statements: 100, functions: 100, branches: 100 },
        "lib/catalogue/progress.ts": { lines: 100, statements: 100, functions: 100, branches: 100 },
        "lib/catalogue/validate.ts": { lines: 100, statements: 100, functions: 100, branches: 100 },
        "lib/catalogue/rules/**/*.ts": {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
      },
    },
  },
});
