import { getTranslations } from "next-intl/server";

type Props = {
  href: string;
  children: React.ReactNode;
  /** Press pointers use the muted, dotted style (UI §3 "secondary link"). */
  variant?: "primary" | "secondary";
  className?: string;
};

/** Opens in a new tab with ↗ (mirrored in RTL) and a hidden "(nouvel onglet)" (UX rule 7, SEC-2). */
export async function ExternalLink({ href, children, variant = "primary", className = "" }: Props) {
  const t = await getTranslations("a11y");
  const style = variant === "secondary" ? "text-ink-muted decoration-dotted hover:text-ink" : "";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${style} ${className}`}>
      {children}
      <span aria-hidden="true" className="mirror ms-1 inline-block">
        ↗
      </span>
      <span className="sr-only"> {t("newTab")}</span>
    </a>
  );
}
