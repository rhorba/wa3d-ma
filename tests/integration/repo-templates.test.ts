import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Story 3.4 / SEC-6: the site prefills the correction form by field id (CommitmentActions); a renamed
// field would silently drop the prefill, so the ids the site sends must exist in the form.
const form = readFileSync(".github/ISSUE_TEMPLATE/correction.yml", "utf8");
const fields = [...form.matchAll(/^\s+id:\s*(\S+)\s*$/gm)].map((match) => match[1]);
const required = [...form.matchAll(/^\s+id:\s*(\S+)[\s\S]*?required:\s*(true|false)/gm)]
  .filter((match) => match[2] === "true")
  .map((match) => match[1]);
const actions = readFileSync("components/detail/CommitmentActions.tsx", "utf8");

describe("correction issue form", () => {
  it("has the fields the site prefills", () => {
    expect(actions).toContain('template: "correction.yml"');
    for (const id of ["commitment", "page"]) {
      expect(actions).toMatch(new RegExp(`\\b${id}: `));
      expect(fields).toContain(id);
    }
  });

  it("requires the commitment, what is wrong and an official source (SEC-6)", () => {
    expect(required).toEqual(["commitment", "what", "source"]);
  });

  it("warns that the issue is public before any field", () => {
    expect(form.indexOf("Ce signalement est public")).toBeGreaterThan(-1);
    expect(form.indexOf("Ce signalement est public")).toBeLessThan(form.indexOf("id: commitment"));
  });

  it("disables blank issues", () => {
    expect(readFileSync(".github/ISSUE_TEMPLATE/config.yml", "utf8")).toMatch(
      /^blank_issues_enabled: false$/m,
    );
  });
});
