// The <html> element lives in app/[locale]/layout.tsx (lang and dir per locale, ADR-5). This root
// layout only exists because the root not-found page needs one; it passes children through.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
