import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

// Any URL that matches no page (an unknown mandate, id, or the embargoed archive). The locale
// cannot be known here, so the page speaks both languages (UX §4 "404").
export const metadata: Metadata = {
  title: "Page introuvable · الصفحة غير موجودة · Wa3d.ma",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <html lang="fr" dir="ltr" className={fontVariables}>
      <body className="min-h-dvh antialiased">
        <main id="main" className="mx-auto grid max-w-[680px] gap-12 px-4 py-16">
          <section>
            <p className="label-caps mb-2 text-ink-muted">Wa3d.ma</p>
            <h1 className="mb-3 text-xl md:text-2xl">Page introuvable</h1>
            <p>Cet engagement ou ce mandat n&apos;existe pas, ou n&apos;est pas encore publié.</p>
            <p className="mt-4 flex flex-wrap gap-4">
              <a href="/fr">Voir les engagements</a>
              <a href="/fr/methodologie">Méthodologie</a>
            </p>
          </section>
          <section lang="ar" dir="rtl" className="border-t border-rule pt-12">
            <p className="mb-2 text-sm text-ink-muted">وعد</p>
            <h2 className="mb-3 font-[family-name:var(--font-serif-ar)] text-xl font-bold md:text-2xl">
              الصفحة غير موجودة
            </h2>
            <p>هذا الالتزام أو هذه الولاية غير موجودة، أو لم تنشر بعد.</p>
            <p className="mt-4 flex flex-wrap gap-4">
              <a href="/ar">عرض الالتزامات</a>
              <a href="/ar/methodologie">المنهجية</a>
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
