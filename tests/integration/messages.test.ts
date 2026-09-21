import { describe, expect, it } from "vitest";
import ar from "@/messages/ar.json";
import fr from "@/messages/fr.json";

function keys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message files", () => {
  it("have identical keys in French and Arabic (US-6: no second-class language)", () => {
    expect(keys(ar).sort()).toEqual(keys(fr).sort());
  });

  it("have no empty strings", () => {
    for (const messages of [fr, ar]) {
      const flat = JSON.stringify(messages);
      expect(flat).not.toMatch(/:""/);
    }
  });
});
