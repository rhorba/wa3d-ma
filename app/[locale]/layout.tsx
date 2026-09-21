import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { localeDirection, routing } from "@/i18n/routing";
import { env } from "@/lib/env";
import "../globals.css";

// UI §2 typefaces, committed under the SIL Open Font License (app/fonts/LICENSE-*.txt).
// Local files, not next/font/google: the build must never touch the network (SDR-4, NFR-5),
// and a Google Fonts hiccup once broke CI. Served from our own origin (CSP font-src 'self').
const plex = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex",
  display: "swap",
});
const sourceSerif = localFont({
  src: [{ path: "../fonts/source-serif-4-latin-600-normal.woff2", weight: "600" }],
  variable: "--font-source-serif",
  display: "swap",
});
const plexArabic = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex-arabic",
  display: "swap",
});
const naskh = localFont({
  src: [
    { path: "../fonts/noto-naskh-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "../fonts/noto-naskh-arabic-arabic-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-naskh",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });
  // env() validates the configuration during the build (ADR-6).
  return { metadataBase: new URL(env().siteUrl), title: t("title"), description: t("description") };
}

// No NextIntlClientProvider: it would ship every message to the browser. The only client
// island (the filters, SDR-2) receives its few labels as props (NFR-1 JS budget).
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      className={`${plex.variable} ${sourceSerif.variable} ${plexArabic.variable} ${naskh.variable}`}
    >
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
