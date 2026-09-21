// UX rule 5: dates as dd/mm/yyyy and Western digits in both languages (usual in the Moroccan
// Arabic press). Pages wrap the output in <bdi> so it never scrambles inside Arabic text.

/** "2026-09-23" → "23/09/2026". */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

const numberFormats = new Map<number, Intl.NumberFormat>();

/** 1000000 → "1 000 000" (narrow no-break spaces), 10.5 → "10,5", in both languages. */
export function formatNumber(value: number, decimals = 0): string {
  let format = numberFormats.get(decimals);
  if (!format) {
    format = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    numberFormats.set(decimals, format);
  }
  return format.format(value);
}
