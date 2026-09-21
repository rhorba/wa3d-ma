import type { Commitment, Evidence, Indicator, Source } from "@/lib/catalogue/schema";

// Fictional test data (Test Strategy §2). Names say "fictif" so they can never be mistaken for real entries.

export function source(overrides: Partial<Source> = {}): Source {
  return {
    name: "Source officielle fictive",
    url: "https://www.hcp.ma/fictif.pdf",
    accessed: "2026-09-01",
    ...overrides,
  };
}

export function evidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    date: "2024-03-14",
    status: "in_progress",
    note: { fr: "Fait daté fictif.", ar: "واقعة مؤرخة وهمية." },
    source: source(),
    ...overrides,
  };
}

export function commitment(overrides: Partial<Commitment> = {}): Commitment {
  return {
    schemaVersion: 1,
    id: "engagement-fictif-a",
    mandate: "2021-2026",
    theme: "employment",
    title: { fr: "Engagement fictif A", ar: "التزام وهمي أ" },
    quote: {
      fr: { text: "« Texte fictif du programme. »", provenance: "original" },
      ar: { text: "«نص وهمي من البرنامج.»", provenance: "official_translation" },
    },
    origin: {
      ...source({ name: "Programme fictif", url: "https://www.cg.gov.ma/fictif.pdf" }),
      page: 12,
    },
    deadline: "2026-09-23",
    lastVerified: "2026-09-01",
    evidence: [evidence()],
    ...overrides,
  };
}

export function indicator(overrides: Partial<Indicator> = {}): Indicator {
  return {
    schemaVersion: 1,
    id: "indicateur-fictif",
    name: { fr: "Indicateur fictif", ar: "مؤشر وهمي" },
    unit: "count",
    decimals: 0,
    values: [
      { year: 2021, period: "Y", value: 0, source: source() },
      { year: 2025, period: "Y", value: 620000, source: source() },
    ],
    ...overrides,
  };
}
