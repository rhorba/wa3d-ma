import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { env } from "./lib/env";

// ADR-6: validate configuration when the config loads, so a bad value fails the build with a
// readable message (errors thrown while prerendering are redacted in production builds).
env();

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // ADR-5: no middleware; the bare domain goes to the default locale with a static redirect.
  async redirects() {
    return [{ source: "/", destination: "/fr", permanent: true }];
  },
};

export default withNextIntl(nextConfig);
