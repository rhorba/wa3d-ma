import { describe, expect, it } from "vitest";
import { SeriesConfig, apiUrl, pageUrl, toIndicator, type SeriesSpec } from "./world-bank";

const spec: SeriesSpec = {
  id: "chomage-bm",
  series: "SL.UEM.TOTL.ZS",
  name: { fr: "Taux de chômage (BM)", ar: "معدل البطالة (البنك الدولي)" },
  unit: "percent",
  decimals: 1,
  from: 2021,
};
const row = (date: string, value: number | null) => ({
  indicator: { id: "SL.UEM.TOTL.ZS", value: "Unemployment" },
  country: { id: "MA", value: "Morocco" },
  countryiso3code: "MAR",
  date,
  value,
});
const answer = [
  { page: 1, pages: 1, total: 5, lastupdated: "2026-07-13" },
  [row("2025", 9), row("2024", 9.103), row("2023", null), row("2022", 11.8), row("2020", 11.9)],
];

describe("World Bank snapshots (Story 4.2)", () => {
  it("keeps non-null years from `from` on, oldest first, each with an official source", () => {
    const indicator = toIndicator(spec, answer, "2026-09-22");
    expect(indicator.values.map((v) => [v.year, v.value])).toEqual([
      [2022, 11.8],
      [2024, 9.103],
      [2025, 9],
    ]);
    expect(indicator.values[0]?.source).toEqual({
      name: "Banque mondiale, SL.UEM.TOTL.ZS",
      url: "https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=MA",
      published: "2026-07-13",
      accessed: "2026-09-22",
    });
    expect(indicator).toMatchObject({ schemaVersion: 1, id: "chomage-bm", unit: "percent" });
  });

  it("omits the published date when the API gives none", () => {
    const indicator = toIndicator(spec, [{ page: 1 }, [row("2024", 9)]], "2026-09-22");
    expect(indicator.values[0]?.source).not.toHaveProperty("published");
  });

  it("fails loudly on an API error or an empty series", () => {
    const error = [
      { message: [{ id: "120", value: "The provided parameter value is not valid" }] },
    ];
    expect(() => toIndicator(spec, error, "2026-09-22")).toThrow(/unexpected World Bank answer/);
    expect(() => toIndicator(spec, [{ page: 1 }, null], "2026-09-22")).toThrow(/no values/);
    expect(() => toIndicator(spec, [{ page: 1 }, [row("2019", 12)]], "2026-09-22")).toThrow(
      /no values for Morocco since 2021/,
    );
  });

  it("builds the API and public page URLs for Morocco", () => {
    expect(apiUrl(spec, 2026)).toBe(
      "https://api.worldbank.org/v2/country/MAR/indicator/SL.UEM.TOTL.ZS?format=json&date=2021:2026&per_page=200",
    );
    expect(pageUrl(spec)).toBe("https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=MA");
  });

  it("validates the series config", () => {
    expect(SeriesConfig.safeParse({ series: [spec] }).success).toBe(true);
    expect(SeriesConfig.safeParse({ series: [{ ...spec, series: "bad code" }] }).success).toBe(
      false,
    );
    expect(SeriesConfig.safeParse({ series: [] }).success).toBe(false);
  });
});
