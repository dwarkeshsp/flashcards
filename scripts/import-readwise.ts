/**
 * Import Kindle highlights from Readwise into content/reads/.
 *
 * Usage:
 *   READWISE_TOKEN=xxx npm run import-readwise
 *   npm run import-readwise -- --file path/to/export.json   (offline dump)
 *
 * Get a token at https://readwise.io/access_token (requires a Readwise
 * account with Kindle sync enabled).
 *
 * For every markdown file in content/reads/, this script looks for a
 * matching book in the Readwise export (by the `readwise:` frontmatter
 * key if present, otherwise by title) and writes its highlights to
 * content/reads/<slug>.highlights.json. That file is machine-owned:
 * re-running the import overwrites it, so never edit it by hand — your
 * own prose lives in the .md file.
 *
 * Unmatched Readwise books are listed at the end so you can either add
 * a new read stub or a `readwise: "<exact readwise title>"` key.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Highlight, HighlightsFile } from "../lib/reads";

const READS_DIR = path.join(process.cwd(), "content", "reads");
const EXPORT_URL = "https://readwise.io/api/v2/export/";

type ReadwiseHighlight = {
  id: number;
  text: string;
  note?: string | null;
  location?: number | null;
  location_type?: string | null;
  highlighted_at?: string | null;
  url?: string | null;
  is_discard?: boolean;
};

type ReadwiseBook = {
  user_book_id: number;
  title: string;
  readable_title?: string;
  author?: string | null;
  category?: string;
  highlights: ReadwiseHighlight[];
};

async function fetchAllBooks(token: string): Promise<ReadwiseBook[]> {
  const books: ReadwiseBook[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(EXPORT_URL);
    if (cursor) url.searchParams.set("pageCursor", cursor);
    const res = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get("Retry-After") ?? "10");
      console.log(`Rate limited; retrying in ${wait}s...`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) {
      throw new Error(`Readwise API error ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      results: ReadwiseBook[];
      nextPageCursor?: string | null;
    };
    books.push(...data.results);
    cursor = data.nextPageCursor ?? undefined;
  } while (cursor);
  return books;
}

function loadBooksFromFile(file: string): ReadwiseBook[] {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  if (Array.isArray(parsed)) return parsed as ReadwiseBook[];
  if (Array.isArray(parsed.results)) return parsed.results as ReadwiseBook[];
  throw new Error(
    `${file} doesn't look like a Readwise export (expected an array or {results: [...]})`
  );
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titlesMatch(readTitle: string, readwiseTitle: string): boolean {
  const a = normalize(readTitle);
  const b = normalize(readwiseTitle);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function toHighlights(book: ReadwiseBook): Highlight[] {
  return book.highlights
    .filter((h) => !h.is_discard && h.text?.trim())
    .map((h) => {
      const out: Highlight = { id: h.id, text: h.text.trim() };
      if (h.note?.trim()) out.note = h.note.trim();
      if (h.location != null) out.location = h.location;
      if (h.location_type) out.locationType = h.location_type;
      if (h.highlighted_at) out.highlightedAt = h.highlighted_at;
      if (h.url) out.url = h.url;
      return out;
    })
    .sort((x, y) => {
      if (x.location != null && y.location != null) return x.location - y.location;
      if ((x.highlightedAt ?? "") !== (y.highlightedAt ?? "")) {
        return (x.highlightedAt ?? "").localeCompare(y.highlightedAt ?? "");
      }
      return (x.id ?? 0) - (y.id ?? 0);
    });
}

async function main() {
  const fileFlag = process.argv.indexOf("--file");
  let books: ReadwiseBook[];
  if (fileFlag !== -1) {
    const file = process.argv[fileFlag + 1];
    if (!file) throw new Error("--file requires a path");
    books = loadBooksFromFile(file);
    console.log(`Loaded ${books.length} books from ${file}`);
  } else {
    const token = process.env.READWISE_TOKEN;
    if (!token) {
      console.error(
        "Set READWISE_TOKEN (see https://readwise.io/access_token) or use --file <export.json>."
      );
      process.exit(1);
    }
    books = await fetchAllBooks(token);
    console.log(`Fetched ${books.length} books from Readwise`);
  }

  const readFiles = fs
    .readdirSync(READS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const matchedBookIds = new Set<number>();
  let written = 0;

  for (const file of readFiles) {
    const slug = file.replace(/\.md$/, "");
    const { data } = matter(fs.readFileSync(path.join(READS_DIR, file), "utf8"));
    const matchKey = String(data.readwise ?? data.title ?? slug);

    const book = books.find((b) =>
      [b.title, b.readable_title].some(
        (t) => t && titlesMatch(matchKey, t)
      )
    );
    if (!book) {
      console.log(`  – ${slug}: no Readwise match for "${matchKey}"`);
      continue;
    }
    matchedBookIds.add(book.user_book_id);

    const highlights = toHighlights(book);
    const out: HighlightsFile = {
      source: "readwise",
      readwiseBookId: book.user_book_id,
      title: book.readable_title ?? book.title,
      author: book.author ?? undefined,
      exportedAt: new Date().toISOString(),
      highlights,
    };
    const outPath = path.join(READS_DIR, `${slug}.highlights.json`);
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
    console.log(`  ✓ ${slug}: ${highlights.length} highlights`);
    written++;
  }

  const unmatched = books.filter(
    (b) => !matchedBookIds.has(b.user_book_id) && b.highlights?.length
  );
  if (unmatched.length) {
    console.log(
      `\n${unmatched.length} Readwise book(s) with highlights had no read stub:`
    );
    for (const b of unmatched) {
      console.log(`  · ${b.readable_title ?? b.title} (${b.highlights.length})`);
    }
    console.log(
      "Add a stub in content/reads/ (or a `readwise:` frontmatter key) to import them."
    );
  }

  console.log(`\nDone: wrote highlights for ${written} read(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
