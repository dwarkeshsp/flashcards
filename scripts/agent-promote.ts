/**
 * Promote accepted review decisions into a draft Episode module.
 *
 * This is intentionally explicit: it reads a completed review run and writes a
 * TypeScript episode file, but it only registers the episode when --register is
 * passed. Review the generated file before exporting Anki artifacts.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = process.cwd();

type Manifest = {
  slug: string;
  title: string;
  guest?: string;
  blurb?: string;
  date?: string;
  youtubeUrl?: string;
  substackUrl?: string;
  transcriptPath?: string;
  notes?: string;
};

type CandidateCard = {
  id: string;
  sectionTitle: string;
  timestamp?: string;
  q: string;
  a: string;
};

type ReviewItem = {
  card: CandidateCard;
};

type ReviewFile = {
  manifest: Manifest;
  items: ReviewItem[];
};

type Decision = {
  status: "unreviewed" | "accepted" | "rejected" | "edited" | "rewrite-requested" | "rewritten";
  editedCard?: {
    q: string;
    a: string;
  };
};

type DecisionsFile = {
  decisions: Record<string, Decision>;
};

type PromotedCard = {
  q: string;
  a: string;
};

type PromotedSection = {
  id: string;
  title: string;
  timestamp?: string;
  cards: PromotedCard[];
};

type CliOptions = {
  runDir?: string;
  out?: string;
  register: boolean;
  help: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    register: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--run-dir") {
      opts.runDir = argv[++i];
    } else if (arg === "--out") {
      opts.out = argv[++i];
    } else if (arg === "--register") {
      opts.register = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

function printHelp() {
  console.log(`Usage:
  npm run agent:promote -- --run-dir .agent-flashcards/<slug>/<run>

Options:
  --run-dir <path>  Review run directory containing review.json and decisions.json.
  --out <path>      Episode module path. Default: lib/episodes/<slug>.generated.ts
  --register        Also add the generated episode to lib/episodes/index.ts.
  --help            Show this help text.
`);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeText(path: string, value: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function constNameFromSlug(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_match, ch: string) => ch.toUpperCase());
}

function isAccepted(status: Decision["status"]): boolean {
  return status === "accepted" || status === "edited" || status === "rewritten";
}

function buildSections(review: ReviewFile, decisions: DecisionsFile): PromotedSection[] {
  const sections = new Map<string, PromotedSection>();

  for (const item of review.items) {
    const decision = decisions.decisions[item.card.id];
    if (!decision || !isAccepted(decision.status)) continue;

    const title = item.card.sectionTitle;
    const id = slugify(title) || "section";
    const existing = sections.get(id);
    const section =
      existing ??
      {
        id,
        title,
        timestamp: item.card.timestamp,
        cards: [],
      };

    const card = decision.editedCard ?? item.card;
    section.cards.push({
      q: card.q,
      a: card.a,
    });
    sections.set(id, section);
  }

  return [...sections.values()];
}

function normalizeTranscriptPath(manifest: Manifest): string | undefined {
  if (!manifest.transcriptPath) return undefined;
  const absolute = resolve(ROOT, manifest.transcriptPath);
  if (!absolute.startsWith(ROOT)) return undefined;
  return relative(ROOT, absolute);
}

function buildEpisodeModule(review: ReviewFile, sections: PromotedSection[]): string {
  const manifest = review.manifest;
  const constName = constNameFromSlug(manifest.slug);
  const transcriptPath = normalizeTranscriptPath(manifest);
  const blurb =
    manifest.blurb ??
    `Practice questions for ${manifest.guest ?? manifest.title}, drafted by the agent flashcard pipeline and human-reviewed before promotion.`;

  const lines: string[] = [];
  lines.push('import { Episode } from "../types";');
  lines.push("");
  lines.push(`export const ${constName}: Episode = {`);
  lines.push(`  slug: ${JSON.stringify(manifest.slug)},`);
  lines.push(`  title: ${JSON.stringify(manifest.title)},`);
  lines.push(`  guest: ${JSON.stringify(manifest.guest ?? manifest.title)},`);
  lines.push(`  blurb: ${JSON.stringify(blurb)},`);
  if (manifest.date) lines.push(`  date: ${JSON.stringify(manifest.date)},`);
  if (manifest.youtubeUrl) lines.push(`  youtubeUrl: ${JSON.stringify(manifest.youtubeUrl)},`);
  if (manifest.substackUrl) lines.push(`  substackUrl: ${JSON.stringify(manifest.substackUrl)},`);
  if (transcriptPath) lines.push(`  transcriptPath: ${JSON.stringify(transcriptPath)},`);
  if (manifest.notes) lines.push(`  note: ${JSON.stringify(manifest.notes)},`);
  lines.push("  sections: [");

  for (const section of sections) {
    lines.push("    {");
    lines.push(`      id: ${JSON.stringify(section.id)},`);
    if (section.timestamp) lines.push(`      timestamp: ${JSON.stringify(section.timestamp)},`);
    lines.push(`      title: ${JSON.stringify(section.title)},`);
    lines.push("      cards: [");
    for (const card of section.cards) {
      lines.push("        {");
      lines.push(`          q: ${JSON.stringify(card.q)},`);
      lines.push(`          a: ${JSON.stringify(card.a)},`);
      lines.push("        },");
    }
    lines.push("      ],");
    lines.push("    },");
  }

  lines.push("  ],");
  lines.push("};");
  lines.push("");
  return lines.join("\n");
}

function registerEpisode(outPath: string, manifest: Manifest) {
  const indexPath = join(ROOT, "lib", "episodes", "index.ts");
  const rel = relative(join(ROOT, "lib", "episodes"), outPath).replace(/\.ts$/, "");
  const importPath = rel.startsWith(".") ? rel : `./${rel}`;
  const constName = constNameFromSlug(manifest.slug);
  let source = readFileSync(indexPath, "utf8");
  const importLine = `import { ${constName} } from "${importPath}";`;

  if (!source.includes(importLine)) {
    const lines = source.split("\n");
    const lastImport = lines.findLastIndex((line) => line.startsWith("import "));
    lines.splice(lastImport + 1, 0, importLine);
    source = lines.join("\n");
  }

  const episodesMatch = source.match(/export const episodes: Episode\[] = \[([^\]]*)\];/s);
  if (!episodesMatch) {
    throw new Error("Could not find episodes array in lib/episodes/index.ts");
  }
  if (!episodesMatch[1].includes(constName)) {
    source = source.replace(
      /export const episodes: Episode\[] = \[([^\]]*)\];/s,
      (_match, body: string) => `export const episodes: Episode[] = [${constName},${body}];`
    );
  }

  writeText(indexPath, source);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }
  if (!opts.runDir) {
    printHelp();
    throw new Error("Missing --run-dir");
  }

  const runDir = resolve(ROOT, opts.runDir);
  const reviewPath = join(runDir, "review.json");
  const decisionsPath = join(runDir, "decisions.json");
  if (!existsSync(reviewPath)) throw new Error(`Missing ${reviewPath}`);
  if (!existsSync(decisionsPath)) throw new Error(`Missing ${decisionsPath}`);

  const review = readJson<ReviewFile>(reviewPath);
  const decisions = readJson<DecisionsFile>(decisionsPath);
  const sections = buildSections(review, decisions);
  if (sections.length === 0) {
    throw new Error("No accepted, edited, or rewritten cards found in decisions.json");
  }

  const outPath = resolve(
    ROOT,
    opts.out ?? join("lib", "episodes", `${review.manifest.slug}.generated.ts`)
  );
  writeText(outPath, buildEpisodeModule(review, sections));
  if (opts.register) registerEpisode(outPath, review.manifest);

  const totalCards = sections.reduce((sum, section) => sum + section.cards.length, 0);
  console.log(`Wrote ${relative(ROOT, outPath)} (${totalCards} cards in ${sections.length} sections)`);
  if (!opts.register) {
    console.log("Review the generated module, then register it in lib/episodes/index.ts when ready.");
  }
}

main();
