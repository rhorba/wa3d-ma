import { describe, expect, it } from "vitest";
import bannedWords from "@/data/banned-words.json";
import { catalogueInput, commitment, commitmentFile, evidence } from "@/tests/builders";
import { validateCatalogue } from "../validate";
import { findBannedWords, normaliseArabic, normaliseFrench } from "./neutrality";

// Arabic diacritics built from code points so the test file stays reviewable.
const FATHA = String.fromCodePoint(0x064e);
const TATWEEL = String.fromCodePoint(0x0640);
const najahWithTashkeel = `ن${FATHA}ج${FATHA}اح`;

describe("normalisation", () => {
  it("French: case, accents and punctuation", () => {
    expect(normaliseFrench("RÉUSSITE, totale !")).toBe("reussite totale");
  });

  it("Arabic: tashkeel and tatweel removed, letter variants unified", () => {
    expect(normaliseArabic(najahWithTashkeel)).toBe("نجاح");
    expect(normaliseArabic(`كا${TATWEEL}رثة`)).toBe("كارثه");
    expect(normaliseArabic("إخفاق")).toBe("اخفاق");
    expect(normaliseArabic("على")).toBe("علي");
  });
});

describe("findBannedWords", () => {
  it.each([
    ["RÉUSSITE totale", ["réussite"]],
    ["Un échec.", ["échec"]],
    ["Le projet est un exploit", ["exploit"]],
    ["une promesse tenue par le gouvernement", ["promesse tenue"]],
  ])("French %j → %j", (text, expected) => {
    expect(findBannedWords(text, ["réussite", "échec", "exploit", "promesse tenue"], "fr")).toEqual(
      expected,
    );
  });

  it.each([
    ["L'exploitation du port a commencé.", "exploit inside exploitation"],
    ["Les réussites scolaires sont publiées par le ministère.", "plural not listed"],
    ["La promesse a été tenue secrète", "phrase words not consecutive"],
    ["Le texte se termine par une promesse", "phrase cut off by the end of the text"],
  ])("French: no false positive for %j (%s)", (text) => {
    expect(findBannedWords(text, ["exploit", "réussite", "promesse tenue"], "fr")).toEqual([]);
  });

  it("Arabic: matches with tashkeel, with proclitics, and phrases", () => {
    const banned = ["نجاح", "فشل", "وعد وفى"];
    expect(findBannedWords(`${najahWithTashkeel} كبير`, banned, "ar")).toEqual(["نجاح"]);
    expect(findBannedWords("انتهى المشروع بالفشل", banned, "ar")).toEqual(["فشل"]);
    expect(findBannedWords("والفشل واضح", banned, "ar")).toEqual(["فشل"]);
    expect(findBannedWords("هذا وعد وفى به", banned, "ar")).toEqual(["وعد وفى"]);
  });

  it("Arabic: no false positive inside a longer word", () => {
    // "خانة" (a box, a cell) contains "خان" (betrayed) but is a different word.
    expect(findBannedWords("ملء الخانة الأولى", ["خان"], "ar")).toEqual([]);
  });

  it("ignores empty banned entries", () => {
    expect(findBannedWords("texte", ["", " "], "fr")).toEqual([]);
  });
});

describe("V-10 in the pipeline", () => {
  const input = (fr: string, ar: string, title?: string) =>
    catalogueInput({
      bannedWords: bannedWords,
      commitments: [
        commitmentFile(
          commitment({
            ...(title ? { title: { fr: title, ar: "عنوان" } } : {}),
            evidence: [evidence({ note: { fr, ar } })],
          }),
        ),
      ],
    });

  it("flags judgement words in notes and titles with the shipped list", () => {
    const issues = validateCatalogue(
      input("Un fiasco total.", "كارثة حقيقية", "Promesse trahie"),
    ).issues;
    expect(issues.map((issue) => issue.message).sort()).toEqual(
      [
        'evidence[0].note.ar uses a judgement word: "كارثة"',
        'evidence[0].note.fr uses a judgement word: "fiasco"',
        'title.fr uses a judgement word: "trahie", "promesse trahie"',
      ].sort(),
    );
    expect(issues.every((issue) => issue.rule === "V-10" && issue.severity === "error")).toBe(true);
    expect(issues).toHaveLength(3);
  });

  it("catches the softer evaluative words added in v1 (Story 4.1)", () => {
    const issues = validateCatalogue(
      input("Un résultat décevant.", "حصيلة غير كافية وتقدم ملحوظ"),
    ).issues;
    expect(issues.map((issue) => issue.message).sort()).toEqual(
      [
        'evidence[0].note.ar uses a judgement word: "ملحوظ", "غير كافية"',
        'evidence[0].note.fr uses a judgement word: "décevant"',
      ].sort(),
    );
  });

  it("accepts factual notes", () => {
    const issues = validateCatalogue(
      input(
        "Le HCP publie un solde de 620 000 emplois nets créés entre 2021 et 2025.",
        "نشرت المندوبية السامية للتخطيط رصيدا صافيا قدره 620 000 منصب شغل.",
      ),
    ).issues;
    expect(issues).toEqual([]);
  });
});
