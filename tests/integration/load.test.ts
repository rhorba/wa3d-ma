import { cpSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildCatalogue, CatalogueError, readCatalogue } from "@/lib/catalogue/load";
import { STATUSES, THEMES } from "@/lib/catalogue/schema";
import { currentStatus } from "@/lib/catalogue/status";

const VALID = "tests/fixtures/catalogue/valid";
const TODAY = "2026-09-21";

describe("loading the valid fixture catalogue", () => {
  const catalogue = buildCatalogue({ dataDir: VALID, today: TODAY });
  const all = [...catalogue.byId.values()];

  it("indexes both mandates, in programme order", () => {
    expect(catalogue.byMandate.get("2021-2026")?.map((c) => c.origin.page)).toEqual([
      12, 20, 25, 30, 35, 40, 45, 50, 55,
    ]);
    expect(catalogue.byMandate.get("2026-2031")?.map((c) => c.id)).toEqual([
      "fictif-mandat-suivant",
    ]);
    expect(catalogue.byId.get("fictif-emploi")?.theme).toBe("employment");
    expect([...catalogue.indicators.keys()].sort()).toEqual([
      "fictif-abandon-scolaire",
      "fictif-emplois-nets",
    ]);
  });

  it("covers every theme, every status and every provenance (Test Strategy §2)", () => {
    expect(new Set(all.map((c) => c.theme))).toEqual(new Set(THEMES));
    expect(new Set(all.map(currentStatus))).toEqual(new Set(STATUSES));
    const provenances = all.flatMap((c) => [c.quote.fr.provenance, c.quote.ar.provenance]);
    expect(new Set(provenances)).toEqual(
      new Set(["original", "official_translation", "wa3d_translation"]),
    );
    expect(all.some((c) => c.target?.direction === "decrease")).toBe(true);
    expect(all.some((c) => c.evidence.some((e) => e.pointers?.length))).toBe(true);
  });

  it("keeps the intended warnings and no errors", () => {
    expect(catalogue.warnings.map((w) => `${w.rule} ${w.file}`)).toEqual([
      "V-14 promises/2021-2026/fictif-economie.json",
      "V-15 promises/2021-2026/fictif-education.json",
    ]);
  });

  it("exempts the fictional fixtures from the embargo but enforces it on data/", () => {
    expect(readCatalogue({ dataDir: VALID, today: TODAY }).input.enforceEmbargo).toBe(false);
    expect(readCatalogue({ dataDir: "data", today: TODAY }).input.enforceEmbargo).toBe(true);
  });

  it("loads the real catalogue folder as of the real date (as the production build does)", () => {
    expect(() => buildCatalogue({ dataDir: "data" })).not.toThrow();
  });
});

describe("rejecting a broken catalogue (one rule per scenario, through the file system)", () => {
  let dir: string;
  const setup = (embargoRoot = false) => {
    dir = mkdtempSync(join(tmpdir(), "wa3d-"));
    cpSync(VALID, dir, { recursive: true });
    // Make the temp folder the reference folder too, so the embargo applies (as for data/).
    if (embargoRoot) {
      cpSync("data/official-domains.json", join(dir, "official-domains.json"));
      cpSync("data/banned-words.json", join(dir, "banned-words.json"));
    }
    return dir;
  };
  const promise = (id: string, mandate = "2021-2026") =>
    join(dir, "promises", mandate, `${id}.json`);
  // Raw JSON is mutated on purpose to break one rule at a time.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edit = (file: string, change: (json: Record<string, any>) => void) => {
    const json = JSON.parse(readFileSync(file, "utf8"));
    change(json);
    writeFileSync(file, JSON.stringify(json));
  };
  const errorsOf = (options: { today?: string; referenceDir?: string } = {}) =>
    readCatalogue({
      dataDir: dir,
      today: options.today ?? TODAY,
      referenceDir: options.referenceDir,
    })
      .issues.filter((issue) => issue.severity === "error")
      .map((issue) => issue.rule);

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it.each([
    ["V-1 unparsable JSON", () => writeFileSync(promise("fictif-sante"), "{ oops")],
    ["V-1 schema", () => edit(promise("fictif-sante"), (j) => (j.theme = "sport"))],
    ["V-2 misnamed file", () => renameSync(promise("fictif-sante"), promise("autre-nom"))],
    [
      "V-3 duplicate id in the other mandate",
      () => {
        cpSync(promise("fictif-sante"), promise("fictif-sante", "2026-2031"));
        edit(promise("fictif-sante", "2026-2031"), (j) => {
          j.mandate = "2026-2031";
          j.deadline = "2031-10-01";
          j.evidence = [];
        });
      },
    ],
    [
      "V-4 two originals",
      () => edit(promise("fictif-sante"), (j) => (j.quote.ar.provenance = "original")),
    ],
    ["V-5 evidence out of order", () => edit(promise("fictif-sante"), (j) => j.evidence.reverse())],
    [
      "V-7 press as official source",
      () =>
        edit(
          promise("fictif-logement"),
          (j) => (j.evidence[0].source.url = "https://lematin.ma/x"),
        ),
    ],
    [
      "V-8 stale verification date",
      () => edit(promise("fictif-sante"), (j) => (j.lastVerified = "2025-07-09")),
    ],
    [
      "V-9 partial before the deadline",
      () =>
        edit(promise("fictif-autre"), (j) => {
          j.evidence[0].status = "partial";
          j.evidence[0].date = "2025-06-01";
        }),
    ],
    [
      "V-10 judgement word",
      () => edit(promise("fictif-logement"), (j) => (j.evidence[0].note.fr = "Un fiasco fictif.")),
    ],
    ["V-11 unknown indicator", () => rmSync(join(dir, "indicators", "fictif-emplois-nets.json"))],
    [
      "V-12 indicator values out of order",
      () => edit(join(dir, "indicators", "fictif-emplois-nets.json"), (j) => j.values.reverse()),
    ],
    [
      "V-17 hidden character",
      () =>
        edit(
          promise("fictif-logement"),
          (j) => (j.title.fr = `Aide${String.fromCodePoint(0x202e)}`),
        ),
    ],
  ])("%s", (label, breakIt) => {
    setup();
    breakIt();
    const rule = label.split(" ")[0];
    expect(new Set(errorsOf())).toEqual(new Set([rule]));
  });

  it("V-6 future date (with today frozen)", () => {
    setup();
    const errors = errorsOf({ today: "2026-09-14" });
    expect(errors.length).toBeGreaterThan(0);
    expect(new Set(errors)).toEqual(new Set(["V-6"]));
  });

  it("V-16 embargo applies to the real catalogue folder before 2026-09-24", () => {
    setup(true);
    const errors = errorsOf({ today: "2026-09-23", referenceDir: dir });
    expect(errors.filter((rule) => rule === "V-16")).toHaveLength(9);
    expect(errorsOf({ today: "2026-09-24", referenceDir: dir })).toEqual([]);
  });

  it("sorts a commitment without a page number after the paged ones", () => {
    setup();
    edit(promise("fictif-emploi"), (j) => delete j.origin.page);
    const order = buildCatalogue({ dataDir: dir, today: TODAY }).byMandate.get("2021-2026");
    expect(order?.at(-1)?.id).toBe("fictif-emploi");
    expect(order?.[0]?.id).toBe("fictif-protection-sociale");
  });

  it("buildCatalogue throws a readable CatalogueError", () => {
    setup();
    edit(promise("fictif-sante"), (j) => (j.theme = "sport"));
    expect(() => buildCatalogue({ dataDir: dir, today: TODAY })).toThrow(CatalogueError);
    expect(() => buildCatalogue({ dataDir: dir, today: TODAY })).toThrow(
      /1 error\(s\):\n  V-1 promises\/2021-2026\/fictif-sante\.json: theme: /,
    );
  });
});

describe("loadCatalogue (the build's memoised entry point)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reads WA3D_DATA_DIR once and reuses the result", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://wa3d-ma.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_REPO_URL", "https://github.com/rhorba/wa3d-ma");
    vi.stubEnv("WA3D_DATA_DIR", VALID);
    const { loadCatalogue } = await import("@/lib/catalogue/load");
    const first = loadCatalogue();
    expect(first.byId.size).toBe(10);
    expect(loadCatalogue()).toBe(first);
  });
});
