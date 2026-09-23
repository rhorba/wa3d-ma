import type { ReactNode } from "react";

// Story 2.8: after Arabic words, "2021-2026" or a URL would be reordered by the bidi algorithm
// ("2026-2021"). Messages mark such values with <ltr>…</ltr>; pages render them isolated, left to right.

/** Rich-text tag for t.rich(…, { ltr }). */
export const ltr = (chunks: ReactNode) => <bdi dir="ltr">{chunks}</bdi>;

/** Markup tag for t.markup(…, { ltr: plain }) where only a string is allowed (metadata). */
export const plain = (chunks: string) => chunks;
