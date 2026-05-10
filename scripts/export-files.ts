/**
 * Generates static export files served from /public/exports/<slug>/:
 *   - flashcards.md      Clean markdown of all Q&A
 *   - flashcards.tsv     Two-column Q/A TSV for Anki import (fallback)
 *   - flashcards.json    JSON dump for the Python apkg builder
 *   - transcript.md      Cleaned-up transcript with typo fixes
 *
 * Run via:  npm run export-files
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { episodes } from "../lib/episodes";
import { Episode, totalCardCount } from "../lib/types";

const ROOT = process.cwd();
const EXPORTS_ROOT = join(ROOT, "public", "exports");

function buildFlashcardsMd(ep: Episode): string {
  const lines: string[] = [];
  lines.push(`# ${ep.title}`);
  lines.push("");
  if (ep.youtubeUrl) lines.push(`- YouTube: ${ep.youtubeUrl}`);
  if (ep.substackUrl) lines.push(`- Substack: ${ep.substackUrl}`);
  lines.push(`- Total cards: ${totalCardCount(ep)}`);
  lines.push("");
  lines.push(ep.blurb);
  lines.push("");
  if (ep.note) {
    lines.push(`> ${ep.note}`);
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  for (const s of ep.sections) {
    const header = s.timestamp ? `## (${s.timestamp}) — ${s.title}` : `## ${s.title}`;
    lines.push(header);
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

function escapeAnkiField(s: string): string {
  // For Anki CSV/TSV import: HTML allowed; convert markdown lightly and preserve LaTeX.
  // LaTeX is kept as MathJax-style \( \) and \[ \].
  return s.replace(/\t/g, " ").replace(/\r?\n/g, "<br>").replace(/"/g, '""');
}

function mdToAnkiHtml(s: string): string {
  let out = s.replace(/\$\$([\s\S]+?)\$\$/g, (_m, x) => `\\[${x}\\]`);
  out = out.replace(/\$([^\n$]+?)\$/g, (_m, x) => `\\(${x}\\)`);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    const filename = src.split("/").pop() ?? src;
    return `<img src="${filename}" alt="${alt}">`;
  });
  out = out
    .split("\n")
    .map((l) => (/^\s*-\s+/.test(l) ? l.replace(/^\s*-\s+/, "• ") : l))
    .join("\n");
  out = out
    .split("\n")
    .map((l) => (/^\s*\d+\.\s+/.test(l) ? l.replace(/^\s*(\d+)\.\s+/, "$1. ") : l))
    .join("\n");
  return out.trim();
}

function buildTsv(ep: Episode): string {
  const rows = ['"Question"\t"Answer"'];
  for (const s of ep.sections) {
    s.cards.forEach((c) => {
      const q = `"${escapeAnkiField(mdToAnkiHtml(c.q))}"`;
      const a = `"${escapeAnkiField(mdToAnkiHtml(c.a))}"`;
      rows.push(`${q}\t${a}`);
    });
  }
  return rows.join("\n");
}

function buildJson(ep: Episode): string {
  return JSON.stringify(
    {
      meta: {
        slug: ep.slug,
        title: ep.title,
        guest: ep.guest,
        blurb: ep.blurb,
        date: ep.date ?? null,
        youtube: ep.youtubeUrl ?? null,
        substack: ep.substackUrl ?? null,
      },
      sections: ep.sections.map((s) => ({
        id: s.id,
        timestamp: s.timestamp ?? null,
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

function applyTranscriptFixes(ep: Episode): string | null {
  if (!ep.transcriptPath) return null;
  const full = join(ROOT, ep.transcriptPath);
  if (!existsSync(full)) {
    console.warn(`  ⚠ transcript not found at ${ep.transcriptPath} (skipping)`);
    return null;
  }
  let text = readFileSync(full, "utf8");
  for (const { from, to } of ep.transcriptFixes ?? []) {
    text = text.split(from).join(to);
  }
  return text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n");
}

function exportEpisode(ep: Episode) {
  const out = join(EXPORTS_ROOT, ep.slug);
  mkdirSync(out, { recursive: true });
  const cards = totalCardCount(ep);
  console.log(`• ${ep.slug}  (${cards} cards, ${ep.sections.length} sections)`);

  if (cards > 0) {
    writeFileSync(join(out, "flashcards.md"), buildFlashcardsMd(ep), "utf8");
    writeFileSync(join(out, "flashcards.tsv"), buildTsv(ep), "utf8");
    writeFileSync(join(out, "flashcards.json"), buildJson(ep), "utf8");
    console.log(`    ✓ flashcards.{md,tsv,json}`);
  }

  const transcript = applyTranscriptFixes(ep);
  if (transcript) {
    writeFileSync(join(out, "transcript.md"), transcript, "utf8");
    console.log(`    ✓ transcript.md`);
  }
}

function main() {
  mkdirSync(EXPORTS_ROOT, { recursive: true });
  for (const ep of episodes) exportEpisode(ep);
}

main();
