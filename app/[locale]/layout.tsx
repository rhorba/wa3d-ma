import type { Metadata } from "next";
import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  Noto_Naskh_Arabic,
  Source_Serif_4,
} from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { localeDirection, routing } from "@/i18n/routing";
import { env } from "@/lib/env";
import "../globals.css";

// UI §2 typefaces, self-hosted at build time by next/font (no third-party requests: CSP font-src 'self').
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex",
  display: "swap",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-source-serif",
  display: "swap",
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
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
