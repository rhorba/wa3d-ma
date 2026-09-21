import type { RuleContext } from "./types";

// V-10 (PRD G2): evidence notes and titles state facts; judgement words are banned in both
// languages. Matching is whole-word on normalised text, so "exploitation" never trips "exploit".

/** Lower-case, accents removed, punctuation collapsed to single spaces. */
export function normaliseFrench(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

// Arabic normalisation by code point (no escapes in source: tools have turned them invisible before).
const TASHKEEL = (code: number) =>
  (code >= 0x064b && code <= 0x065f) || code === 0x0670 || code === 0x0640;
const LETTER_MAP = new Map<number, number>([
  [0x0623, 0x0627], // أ → ا
  [0x0625, 0x0627], // إ → ا
  [0x0622, 0x0627], // آ → ا
  [0x0671, 0x0627], // ٱ → ا
  [0x0629, 0x0647], // ة → ه
  [0x0649, 0x064a], // ى → ي
]);

/** Tashkeel and tatweel removed; alef, taa marbuta and alif maqsura variants unified. */
export function normaliseArabic(text: string): string {
  let result = "";
  for (const character of text) {
    const code = character.codePointAt(0) as number;
    if (TASHKEEL(code)) continue;
    result += String.fromCodePoint(LETTER_MAP.get(code) ?? code);
  }
  return result.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// Arabic attaches conjunctions, prepositions and the article to the word ("بالفشل" = "with the failure").
// Longest first, so "وال" is tried before "و".
const PROCLITICS = [
  "وبال",
  "فبال",
  "وال",
  "فال",
  "بال",
  "كال",
  "لل",
  "ال",
  "و",
  "ف",
  "ب",
  "ك",
  "ل",
];

function arabicCandidates(token: string): string[] {
  const candidates = [token];
  for (const prefix of PROCLITICS) {
    if (token.startsWith(prefix) && token.length - prefix.length >= 2) {
      candidates.push(token.slice(prefix.length));
    }
  }
  return candidates;
}

/** The banned entries found in the text (single words or multi-word phrases). */
export function findBannedWords(
  text: string,
  banned: readonly string[],
  language: "fr" | "ar",
): string[] {
  const normalise = language === "fr" ? normaliseFrench : normaliseArabic;
  const tokens = normalise(text).split(" ");
  const words = language === "ar" ? tokens.map(arabicCandidates) : tokens.map((token) => [token]);
  return banned.filter((entry) => {
    const phrase = normalise(entry).split(" ").filter(Boolean);
    if (phrase.length === 0) return false;
    // A phrase matches when each of its words matches consecutive tokens.
    return words.some((_, start) =>
      phrase.every((word, offset) => words[start + offset]?.includes(word) ?? false),
    );
  });
}

/** V-10: no banned judgement word in evidence notes or titles, in French or Arabic. */
export function checkBannedWords({ input, commitments, report }: RuleContext): void {
  for (const { file, value } of commitments) {
    const texts: [string, string, "fr" | "ar"][] = [
      ["title.fr", value.title.fr, "fr"],
      ["title.ar", value.title.ar, "ar"],
      ...value.evidence.flatMap((entry, index): [string, string, "fr" | "ar"][] => [
        [`evidence[${index}].note.fr`, entry.note.fr, "fr"],
        [`evidence[${index}].note.ar`, entry.note.ar, "ar"],
      ]),
    ];
    for (const [field, text, language] of texts) {
      const found = findBannedWords(text, input.bannedWords[language], language);
      if (found.length > 0) {
        report(
          "V-10",
          file,
          `${field} uses a judgement word: ${found.map((w) => `"${w}"`).join(", ")}`,
        );
      }
    }
  }
}
