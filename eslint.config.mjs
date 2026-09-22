import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

// Architecture §8 fitness functions, enforced by lint.
const PURE_DOMAIN_MESSAGE =
  "lib/catalogue pure modules import zod only: no framework, React or file system (Architecture §3, ADR-4).";
const ENV_MESSAGE = "Read configuration through lib/env.ts, never process.env directly (ADR-6).";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
      "skills/**",
      "docs/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // Plain <a> on purpose: every page is a static document (SDR-1); next/link would pull the
      // client-side router into the bundle for no benefit (NFR-1 budget).
      "@next/next/no-html-link-for-pages": "off",
      // ADR-8: data is rendered as text, never as HTML.
      "react/no-danger": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: ENV_MESSAGE,
        },
      ],
    },
  },
  {
    files: [
      "lib/catalogue/constants.ts",
      "lib/catalogue/schema.ts",
      "lib/catalogue/status.ts",
      "lib/catalogue/progress.ts",
      "lib/catalogue/freshness.ts",
      "lib/catalogue/validate.ts",
      "lib/catalogue/rules/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*", "react", "react-dom", "react/*", "node:*", "fs", "path"],
              message: PURE_DOMAIN_MESSAGE,
            },
          ],
        },
      ],
    },
  },
  {
    // The only places allowed to read process.env (scripts read CI-only variables such as
    // GITHUB_STEP_SUMMARY, never app configuration).
    files: ["lib/env.ts", "*.config.ts", "*.config.mjs", "tests/**", "e2e/**", "scripts/**"],
    rules: { "no-restricted-syntax": "off" },
  },
];

export default eslintConfig;
