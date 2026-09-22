import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { localeDirection, routing } from "@/i18n/routing";
import { env } from "@/lib/env";
import { fontVariables } from "../fonts";
import "../globals.css";

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
    <html lang={locale} dir={localeDirection(locale)} className={fontVariables}>
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
