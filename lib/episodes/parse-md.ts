// Parses a Markdown-authored flashcard file into an `Episode`.
//
// The Markdown file is the single source of truth: the website, the
// per-episode markdown/tsv/json exports, and the Anki .apkg deck all
// flow downstream of this parse result. There is no "TS source / md
// source" split — `lib/episodes/<slug>.ts` is a thin adapter that
// calls into here.
//
// File format
// -----------
//
//   ---
//   slug: eric-jang
//   title: Eric Jang
//   guest: Eric Jang
//   blurb: Building AlphaGo from scratch
//   date: 2026-05-08              # optional
//   transcript: transcripts/...   # optional
//   youtube: https://...          # optional
//   substack: https://...         # optional
//   note: Banner shown on page    # optional
//   flatten: true                 # optional; collapses all parsed
//                                 # sections into one "All cards"
//                                 # section. Useful before timestamps
//                                 # exist for the episode.
//   ---
//
//   # Editing notes (optional, ignored by the parser)
//   ...free text...
//
//   ---
//
//   # Section: Section title here
//   timestamp: HH:MM:SS           # optional, single line right after
//                                 # the section header
//
//   ## Q: Question text, may continue on
//   subsequent lines until the answer header.
//
//   ### A: Inline answer, or:
//   ### A:
//   Multi-line answer body. Markdown, LaTeX (`$...$`, `$$...$$`),
//   lists, and image references all work.
//
//   ---
//
//   ## Q: Next question in the same section...
//
// Rules
// -----
//   - `---` on its own line is a card boundary (and also the
//     frontmatter delimiter).
//   - `# Section:` starts a new section. Sections with zero cards are
//     dropped at the end of parsing.
//   - `## Q:` opens a card; everything until `### A:` is the question.
//   - `### A:` opens the answer; everything until the next `---` or
//     `# Section:` or `## Q:` is the answer body.
//   - Content outside of an open card (e.g. editing notes,
//     `<!-- comments -->`) is ignored.
//   - `flatten: true` in the frontmatter collapses all sections into
//     a single section called "All cards".

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Card, Episode, Section } from "../types";

type Frontmatter = {
  slug: string;
  title: string;
  guest: string;
  blurb: string;
  date?: string;
  transcript?: string;
  youtube?: string;
  substack?: string;
  note?: string;
  flatten?: boolean;
};

const REQUIRED_KEYS: (keyof Frontmatter)[] = ["slug", "title", "guest", "blurb"];

function parseFrontmatter(text: string, sourcePath: string): {
  frontmatter: Frontmatter;
  body: string;
  bodyStartLine: number;
} {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    throw new Error(
      `${sourcePath}: must begin with a \`---\` frontmatter delimiter`
    );
  }
  let i = 1;
  const raw: Record<string, string> = {};
  while (i < lines.length && lines[i].trim() !== "---") {
    const line = lines[i];
    const trimmed = line.trim();
    i++;
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const val = trimmed.slice(colon + 1).trim();
    raw[key] = val;
  }
  if (i >= lines.length) {
    throw new Error(`${sourcePath}: missing closing \`---\` after frontmatter`);
  }
  for (const k of REQUIRED_KEYS) {
    if (!raw[k]) {
      throw new Error(`${sourcePath}: missing required frontmatter \`${k}\``);
    }
  }
  const fm: Frontmatter = {
    slug: raw.slug,
    title: raw.title,
    guest: raw.guest,
    blurb: raw.blurb,
    date: raw.date,
    transcript: raw.transcript,
    youtube: raw.youtube,
    substack: raw.substack,
    note: raw.note,
    flatten: raw.flatten === "true",
  };
  return {
    frontmatter: fm,
    body: lines.slice(i + 1).join("\n"),
    bodyStartLine: i + 2, // 1-indexed line number of body's first line
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHr(line: string): boolean {
  return /^---+\s*$/.test(line.trim());
}

function parseSectionHeader(line: string): string | null {
  const m = /^#\s+Section:\s*(.+)$/.exec(line);
  return m ? m[1].trim() : null;
}

function parseTimestampMeta(line: string): string | null {
  const m = /^timestamp:\s*(.+)$/.exec(line.trim());
  return m ? m[1].trim() : null;
}

function parseQHeader(line: string): { rest: string } | null {
  const m = /^##\s+Q:\s*(.*)$/.exec(line);
  return m ? { rest: m[1] } : null;
}

function parseAHeader(line: string): { rest: string } | null {
  const m = /^###\s+A:\s*(.*)$/.exec(line);
  return m ? { rest: m[1] } : null;
}

function trimBlock(s: string): string {
  return s.replace(/^\s*\n+/, "").replace(/\s+$/, "");
}

function parseBody(body: string, sourcePath: string): Section[] {
  type Mode = "between" | "in-q" | "in-a";

  const sections: Section[] = [];
  let currentSection: Section | null = null;

  let mode: Mode = "between";
  let qBuf: string[] = [];
  let aBuf: string[] = [];

  function ensureSection(): Section {
    if (currentSection) return currentSection;
    // Implicit default section if the file has cards before any
    // explicit `# Section:` header. Will be renamed to "All cards"
    // later if `flatten` is set, or kept as a single un-titled
    // section otherwise.
    const s: Section = { id: "section-1", title: "Cards", cards: [] };
    sections.push(s);
    currentSection = s;
    return s;
  }

  function finishCard() {
    const q = trimBlock(qBuf.join("\n"));
    const a = trimBlock(aBuf.join("\n"));
    if (q || a) {
      if (!q) {
        throw new Error(`${sourcePath}: card has an answer but no question`);
      }
      const card: Card = { q, a };
      ensureSection().cards.push(card);
    }
    qBuf = [];
    aBuf = [];
    mode = "between";
  }

  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Section header — close any open card and start a new section.
    const sectionTitle = parseSectionHeader(line);
    if (sectionTitle) {
      finishCard();
      // Skip blank lines and pick up an optional `timestamp:` meta
      // line on the next non-blank line.
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      let timestamp: string | undefined;
      if (j < lines.length) {
        const ts = parseTimestampMeta(lines[j]);
        if (ts) {
          timestamp = ts;
          i = j;
        }
      }
      const id = slugify(sectionTitle) || `section-${sections.length + 1}`;
      currentSection = {
        id,
        title: sectionTitle,
        cards: [],
        ...(timestamp ? { timestamp } : {}),
      };
      sections.push(currentSection);
      continue;
    }

    // `---` is a card boundary.
    if (isHr(line)) {
      finishCard();
      continue;
    }

    const q = parseQHeader(line);
    if (q) {
      // A new Q closes any in-flight card (e.g. cards with no
      // explicit `---` separator).
      finishCard();
      mode = "in-q";
      if (q.rest) qBuf.push(q.rest);
      continue;
    }

    const a = parseAHeader(line);
    if (a) {
      if (mode === "between") {
        throw new Error(
          `${sourcePath}: answer header found before any question`
        );
      }
      mode = "in-a";
      if (a.rest) aBuf.push(a.rest);
      continue;
    }

    if (mode === "in-q") qBuf.push(line);
    else if (mode === "in-a") aBuf.push(line);
    // mode === "between": editing notes etc., ignore.
  }
  finishCard();

  return sections.filter((s) => s.cards.length > 0);
}

export function parseEpisodeMd(relPath: string): Episode {
  const fullPath = join(process.cwd(), relPath);
  const text = readFileSync(fullPath, "utf8");
  const { frontmatter, body } = parseFrontmatter(text, relPath);
  let sections = parseBody(body, relPath);

  if (frontmatter.flatten) {
    const allCards = sections.flatMap((s) => s.cards);
    sections = allCards.length
      ? [{ id: "all", title: "All cards", cards: allCards }]
      : [];
  }

  return {
    slug: frontmatter.slug,
    title: frontmatter.title,
    guest: frontmatter.guest,
    blurb: frontmatter.blurb,
    date: frontmatter.date,
    transcriptPath: frontmatter.transcript,
    youtubeUrl: frontmatter.youtube,
    substackUrl: frontmatter.substack,
    note: frontmatter.note,
    sections,
  };
}
