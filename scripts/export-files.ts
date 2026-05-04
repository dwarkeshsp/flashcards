/**
 * Generates static export files served from /public/exports:
 *   - flashcards.md      Clean markdown of all Q&A
 *   - flashcards.tsv     Tab-separated for Anki import (fallback)
 *   - flashcards.json    JSON dump for the Python apkg builder
 *   - transcript.md      Cleaned-up transcript with typo fixes
 *
 * Run via:  npm run export-files
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { episode, sections, totalCardCount } from "../lib/cards";

const ROOT = process.cwd();
const OUT = join(ROOT, "public", "exports");
mkdirSync(OUT, { recursive: true });

// ----- flashcards.md -----
function buildFlashcardsMd(): string {
  const lines: string[] = [];
  lines.push(`# ${episode.title} — ${episode.subtitle}`);
  lines.push("");
  lines.push(`- YouTube: ${episode.youtubeUrl}`);
  lines.push(`- Substack: ${episode.substackUrl}`);
  lines.push(`- Total cards: ${totalCardCount}`);
  lines.push("");
  lines.push(episode.blurb);
  lines.push("");
  lines.push("---");
  lines.push("");
  for (const s of sections) {
    lines.push(`## (${s.timestamp}) — ${s.title}`);
    lines.push("");
    if (s.cards.length === 0) {
      lines.push("_No flashcards for this section yet._");
      lines.push("");
      continue;
    }
    s.cards.forEach((c, i) => {
      lines.push(`### Q${i + 1}. ${c.q}`);
      lines.push("");
      lines.push(c.a);
      lines.push("");
    });
  }
  return lines.join("\n");
}

writeFileSync(join(OUT, "flashcards.md"), buildFlashcardsMd(), "utf8");
console.log("✓ flashcards.md");

// ----- flashcards.tsv (CSV/TSV fallback for Anki) -----
function escapeAnkiField(s: string): string {
  // For Anki CSV import: HTML allowed; convert markdown lightly and preserve LaTeX
  // We keep LaTeX as MathJax-style \( \) and \[ \].
  return s.replace(/\t/g, " ").replace(/\r?\n/g, "<br>").replace(/"/g, '""');
}

function mdToAnkiHtml(s: string): string {
  // Convert $$...$$ -> \[ ... \] and $...$ -> \( ... \)
  let out = s.replace(/\$\$([\s\S]+?)\$\$/g, (_m, x) => `\\[${x}\\]`);
  out = out.replace(/\$([^\n$]+?)\$/g, (_m, x) => `\\(${x}\\)`);
  // Bold
  out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  // Italics
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  // Inline code
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Image: ![alt](src) -> <img src="src" alt="alt">
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    const filename = src.split("/").pop() ?? src;
    return `<img src="${filename}" alt="${alt}">`;
  });
  // Lists: bullet "- " at line start -> <br>• ...
  out = out
    .split("\n")
    .map((l) => (/^\s*-\s+/.test(l) ? l.replace(/^\s*-\s+/, "• ") : l))
    .join("\n");
  return out.trim();
}

function buildTsv(): string {
  const rows = ['"Question"\t"Answer"\t"Tags"'];
  for (const s of sections) {
    const tag = `Reiner_Pope::${s.id}`;
    s.cards.forEach((c) => {
      const q = `"${escapeAnkiField(mdToAnkiHtml(c.q))}"`;
      const a = `"${escapeAnkiField(mdToAnkiHtml(c.a))}"`;
      const tags = `"${tag}"`;
      rows.push(`${q}\t${a}\t${tags}`);
    });
  }
  return rows.join("\n");
}

writeFileSync(join(OUT, "flashcards.tsv"), buildTsv(), "utf8");
console.log("✓ flashcards.tsv");

// ----- flashcards.json (used by build_anki.py) -----
function buildJson(): string {
  return JSON.stringify(
    {
      meta: {
        title: episode.title,
        subtitle: episode.subtitle,
        youtube: episode.youtubeUrl,
        substack: episode.substackUrl,
      },
      sections: sections.map((s) => ({
        id: s.id,
        timestamp: s.timestamp,
        title: s.title,
        cards: s.cards.map((c) => ({
          question_md: c.q,
          answer_md: c.a,
          question_html: mdToAnkiHtml(c.q),
          answer_html: mdToAnkiHtml(c.a),
        })),
      })),
    },
    null,
    2
  );
}

writeFileSync(join(OUT, "flashcards.json"), buildJson(), "utf8");
console.log("✓ flashcards.json");

// ----- transcript.md (cleaned typos) -----
function cleanTranscript(): string {
  const src = readFileSync(join(ROOT, "Reiner Pope [INT].md"), "utf8");
  // Fix the same typos that appear in the transcript file.
  return src
    .replace(
      "How MoE models are laid out across a GPU racks",
      "How MoE models are laid out across GPU racks"
    );
}

writeFileSync(join(OUT, "transcript.md"), cleanTranscript(), "utf8");
console.log("✓ transcript.md");
