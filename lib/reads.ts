import fs from "fs";
import path from "path";
import matter from "gray-matter";

// A "read" is something Dwarkesh has read and taken notes on: mostly
// books for now, maybe articles later. Each read is a markdown file at
// `content/reads/<slug>.md` (frontmatter + note body). Kindle/Readwise
// highlights, when present, live next to it in
// `content/reads/<slug>.highlights.json` — that file is machine-written
// by `scripts/import-readwise.ts` and should never be edited by hand.

export type ReadKind = "book" | "article";
export type ReadStatus = "reading" | "finished";

export type Highlight = {
  // Readwise highlight id, kept so re-imports stay stable.
  id?: number;
  text: string;
  // The user's own Kindle note attached to this highlight, if any.
  note?: string;
  location?: number;
  // "location" | "page" | "order" (Readwise's location_type)
  locationType?: string;
  chapter?: string;
  highlightedAt?: string;
  url?: string;
};

export type HighlightsFile = {
  source: string;
  readwiseBookId?: number;
  title: string;
  author?: string;
  exportedAt: string;
  highlights: Highlight[];
};

export type Read = {
  slug: string;
  title: string;
  author?: string;
  // Publication year of the work itself.
  year?: number;
  kind: ReadKind;
  status: ReadStatus;
  // When read/finished; "YYYY-MM" or "YYYY-MM-DD".
  date?: string;
  // For articles: link to the original.
  sourceUrl?: string;
  // Optional one-liner shown on index lists.
  blurb?: string;
  // Markdown body: the standalone note about the read.
  note: string;
  highlights: Highlight[];
};

const READS_DIR = path.join(process.cwd(), "content", "reads");

export function getAllReads(): Read[] {
  if (!fs.existsSync(READS_DIR)) return [];
  const files = fs
    .readdirSync(READS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const reads = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(READS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const highlightsPath = path.join(READS_DIR, `${slug}.highlights.json`);
    let highlights: Highlight[] = [];
    if (fs.existsSync(highlightsPath)) {
      const parsed = JSON.parse(
        fs.readFileSync(highlightsPath, "utf8")
      ) as HighlightsFile;
      highlights = parsed.highlights ?? [];
    }

    return {
      slug,
      title: String(data.title ?? slug),
      author: data.author ? String(data.author) : undefined,
      year: data.year ? Number(data.year) : undefined,
      kind: (data.kind as ReadKind) ?? "book",
      status: (data.status as ReadStatus) ?? "finished",
      date: data.date ? String(data.date) : undefined,
      sourceUrl: data.sourceUrl ? String(data.sourceUrl) : undefined,
      blurb: data.blurb ? String(data.blurb) : undefined,
      // HTML comments are used as authoring hints in the stubs; they
      // should never render or count as content.
      note: content.replace(/<!--[\s\S]*?-->/g, "").trim(),
      highlights,
    } satisfies Read;
  });

  // Currently-reading first, then finished reads newest-first.
  return reads.sort((a, b) => {
    if (a.status !== b.status) return a.status === "reading" ? -1 : 1;
    return (b.date ?? "").localeCompare(a.date ?? "");
  });
}

export function getRead(slug: string): Read | undefined {
  return getAllReads().find((r) => r.slug === slug);
}
