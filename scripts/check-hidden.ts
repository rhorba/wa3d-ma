// V-17 applied to the code itself: no bidi-control or zero-width characters in source files.
// Tools have silently turned written escapes (backslash-u sequences) into the invisible characters, which
// no reviewer can see. Uses the validator's own definition (lib/catalogue/rules/sources.ts).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { firstHiddenCodePoint } from "../lib/catalogue/rules/sources";

const ROOTS = ["app", "components", "lib", "tests", "data", "e2e", "i18n", "messages", "scripts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".json", ".css", ".sh", ".yml"]);

function* files(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return; // folder does not exist yet
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (EXTENSIONS.has(extname(path))) yield path;
  }
}

const findings: string[] = [];
for (const root of [...ROOTS, ".github"]) {
  for (const path of files(root)) {
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((line, index) => {
        const code = firstHiddenCodePoint(line);
        if (code !== undefined) {
          findings.push(
            `${path}:${index + 1} U+${code.toString(16).toUpperCase().padStart(4, "0")}`,
          );
        }
      });
  }
}

if (findings.length > 0) {
  console.log("✗ hidden bidi/zero-width characters in source files (V-17):");
  console.log(findings.join("\n"));
  process.exit(1);
}
console.log("✓ no hidden characters in source files");
