import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { env } from "./lib/env";

// ADR-6: validate configuration when the config loads, so a bad value fails the build with a
// readable message (errors thrown while prerendering are redacted in production builds).
env();

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// docs/security-wa3d-ma.md SEC-1. 'unsafe-inline' scripts are the accepted trade-off of a fully
// static site (SEC-D1: nonces need per-request rendering); every other directive is locked down.
// Dev mode also needs 'unsafe-eval' for React Refresh; production never gets it.
// upgrade-insecure-requests is left out: HSTS already forces https in production, and the
// directive would break the http://localhost production build used by the E2E suite.
const isDev = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // "preload" is added only once the own domain is live (runbook R3).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // ADR-5: no middleware; the bare domain goes to the default locale with a static redirect.
  async redirects() {
    return [{ source: "/", destination: "/fr", permanent: true }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Versioned file names (lib/fonts.ts): a changed font gets a new URL, so browsers may keep
      // these forever. Without it every page revalidates each font and can miss the optional window.
      {
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
