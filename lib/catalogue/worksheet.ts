// Story 4.4: the human verification worksheet. One checkbox per fact a reader will see (quotes, target,
// baseline, every evidence entry, every indicator value), each next to the source to check it against.
// Markdown, so it can be read and ticked in any editor; written to the git-ignored .verification/.
import fr from "@/messages/fr.json";
import type { Commitment, Indicator, Source } from "./schema";
import { currentStatus } from "./status";

const PROVENANCE: Record<string, string> = {
  original: "texte original",
  official_translation: "traduction officielle",
  wa3d_translation: "traduction Wa3d",
};

const link = (source: Source, page?: number) => {
  const url = page ? `${source.url}#page=${page}` : source.url;
  const archive = source.archiveUrl ? ` · [archive](${source.archiveUrl})` : " · ⚠️ pas d'archive";
  const published = source.published ? `, publié le ${source.published}` : "";
  return `[${source.name}${page ? `, p. ${page}` : ""}](${url})${published}${archive}`;
};

const quote = (text: string) => text.replace(/\n/g, " ");

function commitmentSection(c: Commitment, index: number, indicators: Map<string, Indicator>) {
  const lines = [
    `## ${index}. ${c.title.fr}`,
    "",
    `\`${c.id}\` · ${fr.theme[c.theme]} · échéance ${c.deadline} · statut affiché : **${fr.status[currentStatus(c)]}**`,
    `AR : ${c.title.ar}`,
    "",
    `Source du texte : ${link(c.origin, c.origin.page)}`,
    "",
    `- [ ] Titre neutre, reprend les mots de l'engagement ; thème correct`,
    `- [ ] Citation FR identique au document (${PROVENANCE[c.quote.fr.provenance]}) : ${quote(c.quote.fr.text)}`,
    `- [ ] Citation AR identique au document (${PROVENANCE[c.quote.ar.provenance]}) : ${quote(c.quote.ar.text)}`,
    `- [ ] Échéance ${c.deadline} : donnée par le programme, sinon fin du mandat`,
  ];
  if (c.target) {
    const t = c.target;
    lines.push(
      `- [ ] Cible ${t.value} (${t.direction === "increase" ? "hausse" : "baisse"}, indicateur \`${t.indicatorId}\`) : celle de la citation, pas une cible inventée`,
      `- [ ] Point de départ ${t.baseline.value} en ${t.baseline.year} : ${link(t.baseline.source)}`,
    );
    const indicator = indicators.get(t.indicatorId);
    if (!indicator) lines.push(`- [ ] ⚠️ indicateur \`${t.indicatorId}\` introuvable`);
  } else {
    lines.push("- [ ] Sans cible chiffrée : l'engagement ne contient réellement aucun chiffre");
  }
  lines.push("", c.evidence.length ? "Chronologie :" : "Chronologie : aucune entrée (Non engagé).");
  for (const e of c.evidence) {
    lines.push(
      `- [ ] ${e.date} · **${fr.status[e.status]}** · ${link(e.source)}`,
      `  - FR : ${quote(e.note.fr)}`,
      `  - AR : ${quote(e.note.ar)}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function indicatorSection(indicator: Indicator) {
  const lines = [`### \`${indicator.id}\` · ${indicator.name.fr} (${indicator.unit})`, ""];
  for (const v of indicator.values) {
    const period = v.period === "Y" ? `${v.year}` : `${v.year} ${v.period}`;
    lines.push(`- [ ] ${period} = ${v.value} · ${link(v.source)}`);
  }
  return `${lines.join("\n")}\n`;
}

export function worksheetMarkdown(
  mandate: string,
  commitments: readonly Commitment[],
  indicators: readonly Indicator[],
  generatedOn: string,
): string {
  const ordered = commitments
    .filter((c) => c.mandate === mandate)
    .sort((a, b) => (a.origin.page ?? 0) - (b.origin.page ?? 0) || a.id.localeCompare(b.id));
  const byId = new Map(indicators.map((i) => [i.id, i]));
  const used = [...new Set(ordered.flatMap((c) => (c.target ? [c.target.indicatorId] : [])))]
    .map((id) => byId.get(id))
    .filter((i): i is Indicator => i !== undefined);
  const checks =
    ordered.reduce((n, c) => n + 4 + (c.target ? 2 : 1) + c.evidence.length, 0) +
    used.reduce((n, i) => n + i.values.length, 0);

  return [
    `# Fiche de vérification · mandat ${mandate}`,
    "",
    `Générée le ${generatedOn} par \`pnpm catalogue:worksheet\` · ${ordered.length} engagement(s) · ${checks} point(s) à vérifier.`,
    "",
    "Contrôlez chaque ligne contre sa source (ouvrez le lien, et l'archive si le lien est mort), puis cochez-la.",
    "Toute différence : notez-la sous la ligne, sans modifier les fichiers ; elle sera corrigée puis revérifiée.",
    "",
    ...ordered.map((c, i) => commitmentSection(c, i + 1, byId)),
    "",
    "## Indicateurs",
    "",
    ...(used.length ? used.map(indicatorSection) : ["Aucun indicateur utilisé."]),
    "",
    "## Validation",
    "",
    "- [ ] J'ai vérifié chaque ligne ci-dessus contre sa source et je valide la publication de ce mandat.",
    "",
    "Nom : ____________________ · Date : ____________",
    "",
  ].join("\n");
}
