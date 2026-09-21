import { describe, expect, it } from "vitest";
import { commitment } from "@/tests/builders";
import type { Commitment, Mandate } from "./catalogue/schema";
import { defaultMandate, enabledMandates, MANDATES_NEWEST_FIRST } from "./mandates";

describe("enabledMandates (FR-9)", () => {
  it("lists mandates newest first", () => {
    expect(MANDATES_NEWEST_FIRST).toEqual(["2026-2031", "2021-2026"]);
  });

  it("hides the 2021-2026 archive until the flag is on", () => {
    expect(enabledMandates(false)).toEqual(["2026-2031"]);
    expect(enabledMandates(true)).toEqual(["2026-2031", "2021-2026"]);
  });
});

describe("defaultMandate (ADR-10)", () => {
  const catalogue = (entries: [Mandate, number][]) =>
    new Map<Mandate, Commitment[]>(
      entries.map(([mandate, count]) => [
        mandate,
        Array.from({ length: count }, () => commitment()),
      ]),
    );

  it("is the newest enabled mandate that has commitments", () => {
    expect(
      defaultMandate(
        catalogue([
          ["2026-2031", 3],
          ["2021-2026", 40],
        ]),
        true,
      ),
    ).toBe("2026-2031");
  });

  it("falls back to the archive while 2026-2031 is still empty", () => {
    expect(
      defaultMandate(
        catalogue([
          ["2026-2031", 0],
          ["2021-2026", 40],
        ]),
        true,
      ),
    ).toBe("2021-2026");
    expect(defaultMandate(catalogue([["2021-2026", 40]]), true)).toBe("2021-2026");
  });

  it("is null when nothing enabled has commitments (before the embargo lifts)", () => {
    expect(defaultMandate(catalogue([["2021-2026", 40]]), false)).toBeNull();
    expect(defaultMandate(new Map(), true)).toBeNull();
  });
});
