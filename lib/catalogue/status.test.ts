import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { commitment, evidence } from "@/tests/builders";
import { STATUSES, type Status } from "./schema";
import { currentStatus, statusCounts } from "./status";

const status = fc.constantFrom(...STATUSES);
// Strictly ascending dates, as V-5 guarantees for a validated catalogue.
const ascendingEvidence = fc
  .uniqueArray(fc.integer({ min: 0, max: 3650 }), { maxLength: 8 })
  .chain((days) =>
    fc.tuple(
      fc.constant([...days].sort((a, b) => a - b)),
      fc.array(status, { minLength: days.length, maxLength: days.length }),
    ),
  )
  .map(([days, statuses]) =>
    days.map((day, index) =>
      evidence({
        date: new Date(Date.UTC(2021, 9, 7) + day * 86_400_000).toISOString().slice(0, 10),
        status: statuses[index] as Status,
      }),
    ),
  );

describe("currentStatus (Test Strategy §3.1 decision table)", () => {
  it("is not_started when there is no evidence", () => {
    expect(currentStatus(commitment({ evidence: [] }))).toBe("not_started");
  });

  it.each(STATUSES)("is %s when the only entry says so", (value) => {
    expect(currentStatus(commitment({ evidence: [evidence({ status: value })] }))).toBe(value);
  });

  it("is the latest entry's status, not the most favourable or the first", () => {
    const history = [
      evidence({ date: "2022-02-02", status: "achieved" }),
      evidence({ date: "2024-03-14", status: "in_progress" }),
    ];
    expect(currentStatus(commitment({ evidence: history }))).toBe("in_progress");
  });

  it("property: appending a later entry makes its status the current one", () => {
    fc.assert(
      fc.property(ascendingEvidence, status, (history, next) => {
        const later = evidence({ date: "2031-12-31", status: next });
        return currentStatus({ evidence: [...history, later] }) === next;
      }),
    );
  });
});

describe("statusCounts", () => {
  it("lists every status in the fixed order, including zeros", () => {
    expect(Object.keys(statusCounts([]))).toEqual([...STATUSES]);
    expect(Object.values(statusCounts([]))).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("counts derived statuses", () => {
    const counts = statusCounts([
      commitment({ evidence: [] }),
      commitment({ evidence: [evidence({ status: "partial" })] }),
      commitment({ evidence: [evidence({ status: "partial" })] }),
    ]);
    expect(counts).toMatchObject({ not_started: 1, partial: 2, achieved: 0 });
  });

  it("property: counts always sum to the number of commitments", () => {
    fc.assert(
      fc.property(fc.array(ascendingEvidence, { maxLength: 30 }), (histories) => {
        const counts = statusCounts(histories.map((history) => ({ evidence: history })));
        return Object.values(counts).reduce((sum, n) => sum + n, 0) === histories.length;
      }),
    );
  });
});
