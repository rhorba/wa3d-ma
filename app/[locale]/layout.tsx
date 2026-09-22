import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { localeDirection, routing } from "@/i18n/routing";
import { env } from "@/lib/env";
import { fontPreloads } from "@/lib/fonts";
import { openGraph } from "@/lib/seo";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Only fr and ar exist (SDR-1). Without this, Vercel rendered /anything on demand as a locale and
// answered 500 instead of the static 404 (seen on the first production deploy, Story 3.5).
export const dynamicParams = false;

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });
  // env() validates the configuration during the build (ADR-6).
  return {
    metadataBase: new URL(env().siteUrl),
    title: t("title"),
    description: t("description"),
    openGraph: openGraph(locale),
    twitter: { card: "summary" },
  };
}

// No NextIntlClientProvider: it would ship every message to the browser. The only client
// island (the filters, SDR-2) receives its few labels as props (NFR-1 JS budget).
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // React hoists these into <head>: the locale's faces start downloading with the CSS (lib/fonts.ts).
  for (const href of fontPreloads(locale)) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
  const t = await getTranslations("nav");

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only z-20 bg-surface px-3 py-2 focus:not-sr-only focus:absolute focus:start-2 focus:top-2"
        >
          {t("skip")}
        </a>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
