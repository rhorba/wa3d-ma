import { describe, expect, it } from "vitest";
import { formatDate, formatNumber, frenchSpacing, withFrenchSpacing } from "./format";

const NNBSP = String.fromCodePoint(0x202f); // narrow no-break space used by fr-FR grouping

describe("formatDate", () => {
  it("renders dd/mm/yyyy", () => {
    expect(formatDate("2026-09-23")).toBe("23/09/2026");
    expect(formatDate("2021-10-07")).toBe("07/10/2021");
  });
});

describe("formatNumber", () => {
  it("groups thousands with narrow no-break spaces and uses Western digits", () => {
    expect(formatNumber(1_000_000)).toBe(`1${NNBSP}000${NNBSP}000`);
    expect(formatNumber(620_000)).toBe(`620${NNBSP}000`);
  });

  it("uses a decimal comma and the requested precision", () => {
    expect(formatNumber(10.5, 1)).toBe("10,5");
    expect(formatNumber(5, 1)).toBe("5,0");
    expect(formatNumber(4.26, 2)).toBe("4,26");
  });
});

describe("frenchSpacing", () => {
  it("binds guillemets to their word with no-break spaces", () => {
    expect(frenchSpacing("programme « Awrach » et « Forsa »")).toBe(
      "programme « Awrach » et « Forsa »",
    );
    expect(frenchSpacing("«مدخول الكرامة»")).toBe("«مدخول الكرامة»");
  });

  it("applies to French strings only, deeply", () => {
    const value = {
      title: { fr: "« A »", ar: "« A »" },
      quote: { fr: { text: "« B »", provenance: "original" }, ar: { text: "« B »" } },
      evidence: [{ note: { fr: "« C »", ar: "x" } }],
      other: { fr: 3 },
      page: 24,
      archiveUrl: null,
    };
    expect(withFrenchSpacing(value)).toEqual({
      title: { fr: "« A »", ar: "« A »" },
      quote: { fr: { text: "« B »", provenance: "original" }, ar: { text: "« B »" } },
      evidence: [{ note: { fr: "« C »", ar: "x" } }],
      other: { fr: 3 },
      page: 24,
      archiveUrl: null,
    });
  });
});
