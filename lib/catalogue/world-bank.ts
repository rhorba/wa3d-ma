// Story 4.2 (SDR-4, FR-6): turns a World Bank Indicators API answer into a committed indicator snapshot.
// Pure, so it is tested without the network; scripts/fetch-indicators.ts does the requests.
import { z } from "zod";
import { Indicator, UNITS } from "./schema";

const Text = z.string().trim().min(1);

/** One entry of data/world-bank-series.json: which series feeds which indicator file. */
export const SeriesSpec = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  series: z.string().regex(/^[A-Z0-9_.]+$/, "a World Bank series code, e.g. SL.UEM.TOTL.ZS"),
  name: z.strictObject({ fr: Text, ar: Text }),
  unit: z.enum(UNITS),
  decimals: z.number().int().min(0).max(2),
  from: z.number().int().min(1960),
});
export const SeriesConfig = z.strictObject({ series: z.array(SeriesSpec).min(1) });
export type SeriesSpec = z.infer<typeof SeriesSpec>;

const Row = z.object({ date: z.string(), value: z.number().nullable() });
const Answer = z.tuple([
  z.object({ lastupdated: z.string().optional() }).passthrough(),
  z.array(Row).nullable(),
]);

export const COUNTRY = "MAR";

export function apiUrl(spec: SeriesSpec, to: number): string {
  return `https://api.worldbank.org/v2/country/${COUNTRY}/indicator/${spec.series}?format=json&date=${spec.from}:${to}&per_page=200`;
}

/** The public page a reader can open; the API URL is for machines. */
export function pageUrl(spec: SeriesSpec): string {
  return `https://data.worldbank.org/indicator/${spec.series}?locations=MA`;
}

export function toIndicator(spec: SeriesSpec, body: unknown, accessed: string): Indicator {
  const parsed = Answer.safeParse(body);
  if (!parsed.success) {
    const message = JSON.stringify(body).slice(0, 200);
    throw new Error(`${spec.series}: unexpected World Bank answer ${message}`);
  }
  const [meta, rows] = parsed.data;
  const published = /^\d{4}-\d{2}-\d{2}$/.test(meta.lastupdated ?? "")
    ? meta.lastupdated
    : undefined;
  const source = {
    name: `Banque mondiale, ${spec.series}`,
    url: pageUrl(spec),
    ...(published ? { published } : {}),
    accessed,
  };
  const values = (rows ?? [])
    .filter((row) => row.value !== null && /^\d{4}$/.test(row.date))
    .map((row) => ({ year: Number(row.date), period: "Y", value: row.value as number, source }))
    .filter((value) => value.year >= spec.from)
    .sort((a, b) => a.year - b.year);
  if (values.length === 0)
    throw new Error(`${spec.series}: no values for Morocco since ${spec.from}`);

  return Indicator.parse({
    schemaVersion: 1,
    id: spec.id,
    name: spec.name,
    unit: spec.unit,
    decimals: spec.decimals,
    values,
  });
}
