/**
 * Agent flashcard pipeline (rewrite).
 *
 * One outer planner agent picks card concepts. Per-card worker agents
 * (Opus 4.7) each draft one card and its visual in parallel, with web
 * search and Python tooling available. A fresh critic agent grades each
 * card, the writer revises if needed, then we promote the run into
 * lib/episodes/generated.ts so the site picks it up.
 *
 * Run:
 *   CURSOR_API_KEY=... npm run pipeline -- --manifest scripts/pipeline-manifests/eric-jang.json
 */

import { Agent, CursorAgentError, type SDKAgent } from "@cursor/sdk";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import {
  criticSystem,
  criticTask,
  plannerSystem,
  plannerTask,
  reviserTask,
  writerSystem,
  writerTask,
} from "./prompts";
import type {
  CardConcept,
  CardRecord,
  Critique,
  Manifest,
  WorkerCard,
} from "./types";

const ROOT = process.cwd();
const ARTIFACT_ROOT = join(ROOT, ".agent-flashcards");
const MAX_RETRYABLE_SDK_ATTEMPTS = 3;

// Web-search MCP server. open-websearch needs no API keys and exposes
// search() + fetch_article() over stdio.
const WEB_SEARCH_MCP = {
  type: "stdio" as const,
  command: "npx",
  args: ["-y", "open-websearch", "serve"],
  env: {},
};

const MCP_SERVERS = { "open-websearch": WEB_SEARCH_MCP };

type CliOptions = {
  manifestPath: string;
  resumeRunDir?: string;
  maxCards?: number;
};

function parseArgs(argv: string[]): CliOptions {
  let manifestPath: string | undefined;
  let resumeRunDir: string | undefined;
  let maxCards: number | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--manifest") manifestPath = argv[++i];
    else if (a === "--resume-run-dir") resumeRunDir = argv[++i];
    else if (a === "--max-cards") maxCards = Number(argv[++i]);
    else if (a === "-h" || a === "--help") {
      console.log(
        "Usage: tsx scripts/pipeline/run.ts --manifest <path> [--resume-run-dir <path>] [--max-cards <n>]"
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  if (!manifestPath) throw new Error("Missing --manifest");
  return { manifestPath, resumeRunDir, maxCards };
}

function loadManifest(p: string): Manifest {
  const m = JSON.parse(readFileSync(resolve(ROOT, p), "utf8")) as Manifest;
  if (!m.slug || !m.transcriptPath || !m.model) {
    throw new Error("manifest must include slug, transcriptPath, model");
  }
  m.targetCards = m.targetCards ?? 10;
  m.concurrency = m.concurrency ?? 4;
  m.criticPasses = m.criticPasses ?? 1;
  return m;
}

function timestampForPath(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function readJson<T>(p: string): T {
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function writeJson(p: string, value: unknown) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(p: string, value: string) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, value, "utf8");
}

function extractJsonObject(raw: string): unknown {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      // fall through
    }
  }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return JSON.parse(raw.slice(first, last + 1));
  }
  throw new Error("no JSON object in agent reply");
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function withRetryableStartup<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  let last: unknown;
  for (let attempt = 1; attempt <= MAX_RETRYABLE_SDK_ATTEMPTS; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (!(err instanceof CursorAgentError) || !err.isRetryable) break;
      if (attempt === MAX_RETRYABLE_SDK_ATTEMPTS) break;
      const wait = attempt * 1500;
      console.warn(`[${label}] retryable SDK error: ${err.message} (retrying in ${wait}ms)`);
      await sleep(wait);
    }
  }
  throw last;
}

async function streamRunText(
  agent: SDKAgent,
  prompt: string,
  label: string,
  rawOut: string
): Promise<{ text: string; status: string; runId: string }> {
  const run = await withRetryableStartup(label, () => agent.send(prompt));
  console.log(`[${label}] agent=${agent.agentId} run=${run.id}`);
  const buf: string[] = [];
  for await (const event of run.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") {
          process.stdout.write(`[${label}] · `);
          process.stdout.write(block.text + "\n");
          buf.push(block.text);
        }
      }
    }
  }
  const result = await run.wait();
  const finalText = result.result ?? buf.join("\n");
  writeText(rawOut, finalText);
  return { text: finalText, status: result.status, runId: run.id };
}

async function dispose(agent?: SDKAgent) {
  if (!agent) return;
  try {
    await agent[Symbol.asyncDispose]();
  } catch (err) {
    console.warn("agent dispose failed:", err instanceof Error ? err.message : err);
  }
}

// ---- Planner ---------------------------------------------------------------

async function planConcepts(
  manifest: Manifest,
  runDir: string
): Promise<CardConcept[]> {
  const cachePath = join(runDir, "plan.json");
  if (existsSync(cachePath)) {
    console.log(`[planner] resuming from cached plan.json`);
    return readJson<{ cards: CardConcept[] }>(cachePath).cards;
  }
  const transcript = readFileSync(resolve(ROOT, manifest.transcriptPath), "utf8");
  const agent = await withRetryableStartup("planner", () =>
    Agent.create({
      apiKey: process.env.CURSOR_API_KEY!,
      name: `planner:${manifest.slug}`,
      model: { id: manifest.model },
      mcpServers: MCP_SERVERS,
      local: {
        cwd: ROOT,
        settingSources: [],
        sandboxOptions: { enabled: false },
      },
    })
  );
  try {
    const { text } = await streamRunText(
      agent,
      `${plannerSystem()}\n\n---\n\n${plannerTask(manifest, transcript)}`,
      "planner",
      join(runDir, "raw", "plan.txt")
    );
    const obj = extractJsonObject(text) as { cards?: CardConcept[] };
    const cards = (obj.cards ?? []).map(normalizeConcept);
    writeJson(cachePath, { cards });
    console.log(`[planner] proposed ${cards.length} cards`);
    return cards;
  } finally {
    await dispose(agent);
  }
}

function normalizeConcept(c: Partial<CardConcept>): CardConcept {
  return {
    id: String(c.id ?? "").trim() || `card-${Math.random().toString(36).slice(2, 8)}`,
    concept: String(c.concept ?? "").trim(),
    sectionTitle: String(c.sectionTitle ?? "Untitled").trim(),
    timestamp: c.timestamp ? String(c.timestamp) : null,
    sourceExcerpt: String(c.sourceExcerpt ?? "").trim(),
    rationale: String(c.rationale ?? "").trim(),
    shape: String(c.shape ?? "conceptual-model").trim(),
    visualHint: String(c.visualHint ?? "").trim(),
  };
}

// ---- Card worker -----------------------------------------------------------

async function runCardWorker(
  manifest: Manifest,
  runDir: string,
  concept: CardConcept
): Promise<CardRecord | null> {
  const cardDir = join(runDir, "cards", concept.id);
  mkdirSync(cardDir, { recursive: true });
  const cardJson = join(cardDir, "card.json");
  if (existsSync(cardJson)) {
    console.log(`[card:${concept.id}] resuming from existing card.json`);
  }

  const writer = await withRetryableStartup(`card:${concept.id}:create`, () =>
    Agent.create({
      apiKey: process.env.CURSOR_API_KEY!,
      name: `writer:${manifest.slug}:${concept.id}`,
      model: { id: manifest.model },
      mcpServers: MCP_SERVERS,
      local: {
        cwd: ROOT,
        settingSources: [],
        sandboxOptions: { enabled: false },
      },
    })
  );

  try {
    if (!existsSync(cardJson)) {
      await streamRunText(
        writer,
        `${writerSystem(manifest, runDir)}\n\n---\n\n${writerTask(concept, runDir)}`,
        `card:${concept.id}:write`,
        join(cardDir, "raw-write.txt")
      );
    }
    if (!existsSync(cardJson)) {
      console.warn(`[card:${concept.id}] writer did not produce card.json; skipping`);
      return null;
    }

    let card = readJson<WorkerCard>(cardJson);

    const critiques: Critique[] = [];
    for (let pass = 1; pass <= manifest.criticPasses; pass += 1) {
      const critique = await criticPass(manifest, runDir, concept, card, pass);
      critiques.push(critique);
      if (critique.recommendation === "accept") break;
      if (critique.recommendation === "reject") {
        console.warn(`[card:${concept.id}] critic recommends reject; leaving as-is for human review`);
        break;
      }
      // polish or rewrite -> ask the durable writer to revise
      await streamRunText(
        writer,
        reviserTask(critique),
        `card:${concept.id}:revise:${pass}`,
        join(cardDir, `raw-revise-${pass}.txt`)
      );
      if (existsSync(cardJson)) card = readJson<WorkerCard>(cardJson);
    }

    const visualAsset = card.visual ? join(cardDir, card.visual) : null;
    const record: CardRecord = {
      concept,
      card,
      critiques,
      cardDir: relative(runDir, cardDir),
      visualAsset: visualAsset ? relative(runDir, visualAsset) : null,
    };
    writeJson(join(cardDir, "record.json"), record);
    return record;
  } finally {
    await dispose(writer);
  }
}

async function criticPass(
  manifest: Manifest,
  runDir: string,
  concept: CardConcept,
  card: WorkerCard,
  pass: number
): Promise<Critique> {
  const cardDir = join(runDir, "cards", concept.id);
  const visualPath = card.visual ? join(cardDir, card.visual) : undefined;
  const taskBody = criticTask({
    id: concept.id,
    sectionTitle: card.sectionTitle,
    timestamp: card.timestamp,
    sourceExcerpt: card.sourceExcerpt,
    q: card.q,
    a: card.a,
    visual: card.visual,
    visualPath: visualPath ? relative(ROOT, visualPath) : undefined,
  });
  const result = await withRetryableStartup(`critic:${concept.id}:${pass}`, () =>
    Agent.prompt(`${criticSystem()}\n\n---\n\n${taskBody}`, {
      apiKey: process.env.CURSOR_API_KEY!,
      model: { id: manifest.model },
      mcpServers: MCP_SERVERS,
      local: {
        cwd: ROOT,
        settingSources: [],
        sandboxOptions: { enabled: false },
      },
    })
  );
  const raw = result.result ?? "";
  writeText(join(cardDir, `raw-critique-${pass}.txt`), raw);
  let critique: Critique;
  try {
    critique = extractJsonObject(raw) as Critique;
  } catch (err) {
    console.warn(`[critic:${concept.id}] could not parse critique JSON: ${err}`);
    critique = {
      tier: "T1",
      targeting: "Critique parse failed; needs human review.",
      construction: raw.slice(0, 200),
      visualVerdict: "n/a",
      visualNotes: "",
      recommendation: "polish",
      rewriteHint: "Critic JSON failed to parse; please re-read the card and revise if needed.",
    };
  }
  console.log(
    `[critic:${concept.id}:${pass}] tier=${critique.tier} rec=${critique.recommendation}`
  );
  writeJson(join(cardDir, `critique-${pass}.json`), critique);
  return critique;
}

// ---- Concurrency -----------------------------------------------------------

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const idx = nextIndex++;
      try {
        results[idx] = await fn(items[idx], idx);
      } catch (err) {
        console.error(`worker ${idx} failed:`, err instanceof Error ? err.message : err);
        // @ts-expect-error allow partial
        results[idx] = null;
      }
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

// ---- Promotion -------------------------------------------------------------

function loadAllRecords(runDir: string): CardRecord[] {
  const cardsDir = join(runDir, "cards");
  if (!existsSync(cardsDir)) return [];
  return readdirSync(cardsDir)
    .filter((d) => existsSync(join(cardsDir, d, "record.json")))
    .map((d) => readJson<CardRecord>(join(cardsDir, d, "record.json")))
    .filter((r) => r.card && r.card.q && r.card.a);
}

function tsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function promote(manifest: Manifest, runDir: string): void {
  const records = loadAllRecords(runDir);
  if (records.length === 0) {
    console.warn("[promote] no records found to promote");
    return;
  }

  // Copy visuals to public/images/<slug>/<id>.png and rewrite markdown.
  const imagesDir = join(ROOT, "public", "images", manifest.slug);
  mkdirSync(imagesDir, { recursive: true });

  const accepted: CardRecord[] = [];
  for (const rec of records) {
    const lastTier = rec.critiques.at(-1)?.tier ?? "T2";
    const lastRec = rec.critiques.at(-1)?.recommendation ?? "polish";
    if (lastRec === "reject" || lastTier === "T0") {
      console.log(`[promote] skipping ${rec.concept.id} (${lastTier}/${lastRec})`);
      continue;
    }
    accepted.push(rec);
  }

  for (const rec of accepted) {
    if (!rec.visualAsset) continue;
    const src = resolve(runDir, rec.visualAsset);
    if (!existsSync(src)) continue;
    const dest = join(imagesDir, `${rec.concept.id}.png`);
    writeFileSync(dest, readFileSync(src));
    const publicHref = `/images/${manifest.slug}/${rec.concept.id}.png`;
    rec.card.a = rec.card.a.replace(/visual\.png/g, publicHref);
    if (!rec.card.a.includes(publicHref) && !/!\[[^\]]*\]\([^)]+\)/.test(rec.card.a)) {
      rec.card.a += `\n\n![${rec.card.sectionTitle}](${publicHref})`;
    }
  }

  // Group by sectionTitle, preserving the order in which they appeared.
  const sectionsBySlug = new Map<string, { id: string; title: string; timestamp?: string; cards: WorkerCard[] }>();
  for (const rec of accepted) {
    const id = sectionSlug(rec.card.sectionTitle);
    let s = sectionsBySlug.get(id);
    if (!s) {
      s = {
        id,
        title: rec.card.sectionTitle,
        timestamp: rec.card.timestamp ?? undefined,
        cards: [],
      };
      sectionsBySlug.set(id, s);
    }
    s.cards.push(rec.card);
  }

  const sections = Array.from(sectionsBySlug.values());
  const exportName = camelCase(manifest.slug);
  const tsLines: string[] = [];
  tsLines.push(`// Auto-generated by scripts/pipeline/run.ts. Do not edit by hand;`);
  tsLines.push(`// re-run the pipeline to update.`);
  tsLines.push(`import type { Episode } from "../types";`);
  tsLines.push(``);
  tsLines.push(`export const ${exportName}: Episode = {`);
  tsLines.push(`  slug: ${JSON.stringify(manifest.slug)},`);
  tsLines.push(`  title: ${JSON.stringify(manifest.title)},`);
  tsLines.push(`  guest: ${JSON.stringify(manifest.guest)},`);
  tsLines.push(`  blurb: ${JSON.stringify(manifest.blurb)},`);
  if (manifest.date) tsLines.push(`  date: ${JSON.stringify(manifest.date)},`);
  if (manifest.youtubeUrl) tsLines.push(`  youtubeUrl: ${JSON.stringify(manifest.youtubeUrl)},`);
  if (manifest.substackUrl) tsLines.push(`  substackUrl: ${JSON.stringify(manifest.substackUrl)},`);
  tsLines.push(`  transcriptPath: ${JSON.stringify(manifest.transcriptPath)},`);
  if (manifest.note) tsLines.push(`  note: ${JSON.stringify(manifest.note)},`);
  tsLines.push(`  sections: [`);
  for (const s of sections) {
    tsLines.push(`    {`);
    tsLines.push(`      id: ${JSON.stringify(s.id)},`);
    tsLines.push(`      title: ${JSON.stringify(s.title)},`);
    if (s.timestamp) tsLines.push(`      timestamp: ${JSON.stringify(s.timestamp)},`);
    tsLines.push(`      cards: [`);
    for (const c of s.cards) {
      tsLines.push(`        {`);
      tsLines.push(`          q: \`${tsEscape(c.q)}\`,`);
      tsLines.push(`          a: \`${tsEscape(c.a)}\`,`);
      tsLines.push(`        },`);
    }
    tsLines.push(`      ],`);
    tsLines.push(`    },`);
  }
  tsLines.push(`  ],`);
  tsLines.push(`};`);
  tsLines.push(``);

  const ts = tsLines.join("\n");
  const epPath = join(ROOT, "lib", "episodes", `${manifest.slug}.ts`);
  writeText(epPath, ts);
  console.log(`[promote] wrote ${relative(ROOT, epPath)}`);

  // Re-emit lib/episodes/generated.ts to register it.
  const generatedPath = join(ROOT, "lib", "episodes", "generated.ts");
  const genLines: string[] = [];
  genLines.push(`// Auto-generated by scripts/pipeline/run.ts. Do not edit by hand.`);
  genLines.push(`import type { Episode } from "../types";`);
  genLines.push(`import { ${exportName} } from "./${manifest.slug}";`);
  genLines.push(``);
  genLines.push(`export const generatedEpisodes: Episode[] = [${exportName}];`);
  genLines.push(``);
  writeText(generatedPath, genLines.join("\n"));
  console.log(`[promote] wrote ${relative(ROOT, generatedPath)}`);
  console.log(`[promote] promoted ${accepted.length}/${records.length} cards`);
}

function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "section";
}

function camelCase(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// ---- Main ------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!process.env.CURSOR_API_KEY) {
    throw new Error("CURSOR_API_KEY is required");
  }
  const manifest = loadManifest(opts.manifestPath);

  let runDir: string;
  if (opts.resumeRunDir) {
    runDir = resolve(ROOT, opts.resumeRunDir);
    if (!existsSync(runDir)) throw new Error(`run dir not found: ${runDir}`);
    console.log(`Resuming run at ${runDir}`);
  } else {
    runDir = join(ARTIFACT_ROOT, manifest.slug, timestampForPath());
    mkdirSync(runDir, { recursive: true });
    writeJson(join(runDir, "manifest.snapshot.json"), manifest);
    console.log(`New run at ${runDir}`);
  }

  let concepts = await planConcepts(manifest, runDir);
  if (opts.maxCards !== undefined) concepts = concepts.slice(0, opts.maxCards);
  console.log(`[main] running ${concepts.length} card workers (concurrency=${manifest.concurrency})`);

  const records = await mapWithConcurrency(concepts, manifest.concurrency, (concept) =>
    runCardWorker(manifest, runDir, concept)
  );
  const ok = records.filter((r): r is CardRecord => !!r);
  console.log(`[main] ${ok.length}/${concepts.length} cards completed`);

  promote(manifest, runDir);
  console.log(`Done. Run dir: ${relative(ROOT, runDir)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exitCode = 1;
});
