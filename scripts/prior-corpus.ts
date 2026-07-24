/**
 * Cross-episode prior-corpus primitive for the agent pipeline.
 *
 * The drafting agent in ``scripts/agent-flashcards.ts`` is strictly
 * per-episode: one slug, one transcript, no notion that other decks
 * exist. Dylan Patel and Reiner Pope both cover GPU memory bandwidth,
 * MoE economics, and batch-size dynamics, but the agent draws a blank
 * each time it starts a new episode and can produce near-duplicates
 * of cards we already shipped.
 *
 * This module is the data primitive that closes that gap. It reads
 * every shipped card from ``lib/episodes`` and emits a flat,
 * dedup-friendly view of the canonical corpus. A future PR can:
 *
 *   1. Thread the corpus into the interest-selection prompt as
 *      "avoid restating these" context, and
 *   2. Add a fifth, stateless ``priorCorpusCritic`` pass that flags
 *      candidates that restate a card from another deck.
 *
 * Shipping the primitive separately keeps the 1298-line agent
 * pipeline untouched until the maintainer signals what shape the
 * integration should take.
 *
 * Usage
 * -----
 *   tsx scripts/prior-corpus.ts                     # print 5-line summary
 *   tsx scripts/prior-corpus.ts --emit-markdown     # full md for prompt context
 *   tsx scripts/prior-corpus.ts --emit-json         # raw record list (stable order)
 *   tsx scripts/prior-corpus.ts --exclude reiner-pope  # skip a slug
 */

import { episodes } from "../lib/episodes/index";
import type { Episode } from "../lib/types";

export type PriorCorpusRecord = {
  /** Slug of the episode the card was shipped in. */
  slug: string;
  /** Guest name as it appears in the episode list. */
  guest: string;
  /** Section title within the episode (kept verbatim for context). */
  sectionTitle: string;
  /** Stable section id within the episode. */
  sectionId: string;
  /** Position of the card within its section (0-based). */
  cardIndex: number;
  /** The card's question text. The answer is intentionally omitted: it
   * inflates the context window without improving overlap detection. */
  q: string;
};

export type PriorCorpusOptions = {
  /** Episodes to skip (typically the slug currently being drafted, so
   * a same-episode rerun doesn't dedup against its own canonical
   * cards). */
  exclude?: ReadonlySet<string> | readonly string[];
  /** Override the episode source. Defaults to ``episodes`` from
   * ``lib/episodes/index``. */
  source?: readonly Episode[];
};

/** Build a flat ``PriorCorpusRecord[]`` from the shipped episodes. The
 * order is deterministic: episode-order, section-order, card-index. */
export function loadPriorCorpus(
  options: PriorCorpusOptions = {},
): PriorCorpusRecord[] {
  const source = options.source ?? episodes;
  const exclude = normaliseExclude(options.exclude);

  const out: PriorCorpusRecord[] = [];
  for (const ep of source) {
    if (exclude.has(ep.slug)) continue;
    for (const section of ep.sections) {
      for (let i = 0; i < section.cards.length; i++) {
        const card = section.cards[i];
        out.push({
          slug: ep.slug,
          guest: ep.guest,
          sectionTitle: section.title,
          sectionId: section.id,
          cardIndex: i,
          q: card.q,
        });
      }
    }
  }
  return out;
}

/** Markdown view suitable for an LLM prompt. Each line is a single
 * record; the agent gets enough context (guest + section + question)
 * to recognise overlap without seeing the answer. */
export function priorCorpusMarkdown(records: readonly PriorCorpusRecord[]): string {
  if (records.length === 0) {
    return "(no prior corpus)\n";
  }
  const header =
    "Previously-shipped cards (avoid restating; format: " +
    "`[guest] | [section]: Q`)\n\n";
  const body = records
    .map((r) => `- [${r.guest}] | ${r.sectionTitle}: ${r.q}`)
    .join("\n");
  return header + body + "\n";
}

function normaliseExclude(
  raw: PriorCorpusOptions["exclude"],
): ReadonlySet<string> {
  if (!raw) return new Set();
  if (raw instanceof Set) return raw;
  return new Set(raw as readonly string[]);
}

function parseArgs(argv: readonly string[]): {
  mode: "summary" | "markdown" | "json";
  exclude: string[];
} {
  let mode: "summary" | "markdown" | "json" = "summary";
  const exclude: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--emit-markdown") mode = "markdown";
    else if (arg === "--emit-json") mode = "json";
    else if (arg === "--exclude") {
      const slug = argv[i + 1];
      if (!slug) throw new Error("--exclude requires a slug argument");
      exclude.push(slug);
      i++;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return { mode, exclude };
}

function printHelp(): void {
  process.stdout.write(
    [
      "Usage: tsx scripts/prior-corpus.ts [options]",
      "",
      "Options:",
      "  --emit-markdown        Print the corpus as prompt-ready markdown",
      "  --emit-json            Print the raw PriorCorpusRecord[] (stable order)",
      "  --exclude <slug>       Skip an episode (repeatable)",
      "  --help, -h             Show this help",
      "",
      "With no flags, prints a five-line summary suitable for shell output.",
      "",
    ].join("\n"),
  );
}

function summarise(records: readonly PriorCorpusRecord[]): string {
  const slugs = new Set(records.map((r) => r.slug));
  const sections = new Set(records.map((r) => `${r.slug}/${r.sectionId}`));
  return [
    `prior corpus loaded`,
    `  episodes: ${slugs.size}`,
    `  sections: ${sections.size}`,
    `  cards:    ${records.length}`,
    `  first:    ${records[0]?.guest ?? "(empty)"} | ${records[0]?.q?.slice(0, 60) ?? "-"}`,
  ].join("\n") + "\n";
}

async function main(): Promise<void> {
  const { mode, exclude } = parseArgs(process.argv.slice(2));
  const records = loadPriorCorpus({ exclude });
  switch (mode) {
    case "markdown":
      process.stdout.write(priorCorpusMarkdown(records));
      break;
    case "json":
      process.stdout.write(JSON.stringify(records, null, 2) + "\n");
      break;
    default:
      process.stdout.write(summarise(records));
  }
}

const _isMain = import.meta.url === `file://${process.argv[1]}`;
if (_isMain) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
