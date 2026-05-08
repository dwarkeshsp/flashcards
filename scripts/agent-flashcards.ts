/**
 * Local-first Cursor Agent SDK pipeline for drafting episode flashcards.
 *
 * This script deliberately stops at a review artifact. It does not edit
 * `lib/episodes/*`, because the first useful loop is judging whether agent
 * proposals are worth reviewing before they become canonical deck data.
 *
 * Run:
 *   npm run agent:flashcards -- --manifest path/to/manifest.json
 *   npm run agent:flashcards -- --resume-run-dir .agent-flashcards/slug/timestamp
 */

import { Agent, CursorAgentError, type SDKAgent } from "@cursor/sdk";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";

const ROOT = process.cwd();
const DEFAULT_OUT_DIR = ".agent-flashcards";
const DEFAULT_MODEL = "composer-2";
const CARD_DRAFT_STAGE_PREFIX = "cards-draft-v2";
const MAX_RETRYABLE_SDK_ATTEMPTS = 3;
const MAX_INTERESTS_PER_CHUNK = 4;

type Manifest = {
  slug: string;
  title: string;
  guest?: string;
  transcriptPath: string;
  youtubeUrl?: string;
  substackUrl?: string;
  notes?: string;
  targetCards?: number;
  maxInterests?: number;
  maxChunks?: number;
  chunkCharLimit?: number;
  criticPasses?: number;
  cardDraftBatchSize?: number;
};

type CliOptions = {
  manifestPath?: string;
  resumeRunDir?: string;
  outDir: string;
  model: string;
  maxCardBatches?: number;
  help: boolean;
};

type TranscriptChunk = {
  id: string;
  heading: string;
  startLine: number;
  endLine: number;
  text: string;
};

type CandidateInterest = {
  id: string;
  chunkId: string;
  title: string;
  sourceExcerpt: string;
  whyWorthRemembering: string;
  argumentCrux?: string;
  technicalGrounding?: string;
  cardShape?: string;
  timestamp?: string;
  sectionTitle?: string;
  priority?: "high" | "medium" | "low";
};

type CandidateCard = {
  id: string;
  interestId: string;
  sectionTitle: string;
  timestamp?: string;
  sourceExcerpt: string;
  q: string;
  a: string;
  risk?: string;
};

type Critique = {
  pass: number;
  classification: "T0" | "T1" | "T2" | "T3";
  targeting: string;
  construction: string;
  recommendation: "reject" | "rewrite" | "polish" | "accept";
  suggestedRewrite?: {
    q: string;
    a: string;
  };
};

type ReviewItem = {
  card: CandidateCard;
  critiques: Critique[];
};

type RunLogEntry = {
  stage: string;
  agentId?: string;
  runId?: string;
  status: string;
  model?: string;
  durationMs?: number;
  outputFile?: string;
};

type SavedAgent = {
  agentId: string;
  model?: string;
  cwd?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    outDir: DEFAULT_OUT_DIR,
    model: DEFAULT_MODEL,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--manifest") {
      opts.manifestPath = argv[++i];
    } else if (arg === "--resume-run-dir") {
      opts.resumeRunDir = argv[++i];
    } else if (arg === "--out-dir") {
      opts.outDir = argv[++i] ?? opts.outDir;
    } else if (arg === "--model") {
      opts.model = argv[++i] ?? opts.model;
    } else if (arg === "--max-card-batches") {
      opts.maxCardBatches = parsePositiveIntegerArg(argv[++i], "--max-card-batches");
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

function parsePositiveIntegerArg(value: string | undefined, option: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${option} must be a positive integer`);
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage:
  npm run agent:flashcards -- --manifest path/to/manifest.json
  npm run agent:flashcards -- --resume-run-dir .agent-flashcards/slug/timestamp

Options:
  --manifest <path>          Episode manifest JSON.
  --resume-run-dir <path>    Existing artifact directory to continue from.
  --out-dir <path>           Artifact root. Default: ${DEFAULT_OUT_DIR}
  --model <id>               Cursor model id. Default: ${DEFAULT_MODEL}
  --max-card-batches <n>     Stop after drafting n new card batches.
  --help                     Show this help text.
`);
}

function readManifest(path: string): Manifest {
  const fullPath = resolve(path);
  const parsed = JSON.parse(readFileSync(fullPath, "utf8")) as unknown;
  return parseManifest(parsed);
}

function parseManifest(parsed: unknown): Manifest {
  assertRecord(parsed, "manifest");

  const manifest: Manifest = {
    slug: requiredString(parsed, "slug"),
    title: requiredString(parsed, "title"),
    guest: optionalString(parsed, "guest"),
    transcriptPath: requiredString(parsed, "transcriptPath"),
    youtubeUrl: optionalString(parsed, "youtubeUrl"),
    substackUrl: optionalString(parsed, "substackUrl"),
    notes: optionalString(parsed, "notes"),
    targetCards: optionalNumber(parsed, "targetCards"),
    maxInterests: optionalNumber(parsed, "maxInterests"),
    maxChunks: optionalNumber(parsed, "maxChunks"),
    chunkCharLimit: optionalNumber(parsed, "chunkCharLimit"),
    criticPasses: optionalNumber(parsed, "criticPasses"),
    cardDraftBatchSize: optionalNumber(parsed, "cardDraftBatchSize"),
  };

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug)) {
    throw new Error("manifest.slug must be kebab-case, e.g. andrej-karpathy");
  }

  return manifest;
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`manifest.${key} must be a non-empty string`);
  }
  return value;
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`manifest.${key} must be a string`);
  return value;
}

function optionalNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`manifest.${key} must be a finite number`);
  }
  return value;
}

function resolveInputPath(inputPath: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(ROOT, inputPath);
}

function timestampForPath(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function slugifyId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function segmentTranscript(markdown: string, charLimit: number): TranscriptChunk[] {
  const lines = markdown.split(/\r?\n/);
  const chunks: TranscriptChunk[] = [];
  let currentHeading = "Opening";
  let currentStart = 1;
  let currentLines: string[] = [];

  function flush(endLine: number) {
    const text = currentLines.join("\n").trim();
    if (!text) return;
    const baseId = slugifyId(currentHeading) || `chunk-${chunks.length + 1}`;
    chunks.push({
      id: `${String(chunks.length + 1).padStart(3, "0")}-${baseId}`,
      heading: currentHeading,
      startLine: currentStart,
      endLine,
      text,
    });
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch && currentLines.length > 0) {
      flush(i);
      currentHeading = headingMatch[1].trim();
      currentStart = i + 1;
      currentLines = [line];
      continue;
    }

    currentLines.push(line);

    if (currentLines.join("\n").length >= charLimit) {
      flush(i + 1);
      currentHeading = `${currentHeading} continued`;
      currentStart = i + 2;
      currentLines = [];
    }
  }

  flush(lines.length);
  return chunks;
}

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(path: string, value: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function readRunLog(runDir: string): RunLogEntry[] {
  const runLogPath = join(runDir, "run-log.json");
  if (!existsSync(runLogPath)) return [];

  const value = readJson(runLogPath);
  assertRecord(value, "run log");
  if (!Array.isArray(value.runLog)) throw new Error("run-log.json must include runLog[]");
  return value.runLog as RunLogEntry[];
}

function readSelectedInterests(runDir: string): CandidateInterest[] {
  const interestsPath = join(runDir, "interests.selected.json");
  if (!existsSync(interestsPath)) {
    throw new Error(`Cannot resume card drafting without ${interestsPath}`);
  }
  return validateInterests(readJson(interestsPath));
}

function tryReadSelectedInterests(runDir: string): CandidateInterest[] | undefined {
  const interestsPath = join(runDir, "interests.selected.json");
  if (!existsSync(interestsPath)) return undefined;
  return validateInterests(readJson(interestsPath));
}

function readCompletedChunkInterests(
  runDir: string,
  runLog: RunLogEntry[],
  chunk: TranscriptChunk
): CandidateInterest[] | undefined {
  const stage = `interests-${chunk.id}`;
  const completedEntries = runLog
    .filter(
      (entry) =>
        entry.stage === stage &&
        (entry.status === "finished" || entry.status === "salvaged") &&
        entry.outputFile &&
        existsSync(entry.outputFile)
    )
    .reverse();

  for (const entry of completedEntries) {
    try {
      return validateInterests(extractJsonObject(readFileSync(entry.outputFile!, "utf8")), chunk.id);
    } catch (error) {
      console.warn(
        `[interests] ${chunk.id}: ignoring unusable prior output from ${entry.outputFile}: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  return undefined;
}

function readDraftCards(runDir: string, runLog: RunLogEntry[]): CandidateCard[] {
  const cardsPath = join(runDir, "cards.draft.json");
  if (!existsSync(cardsPath)) return [];
  const hasCurrentDrafts = runLog.some(
    (entry) =>
      (entry.status === "finished" || entry.status === "salvaged") &&
      entry.stage.startsWith(`${CARD_DRAFT_STAGE_PREFIX}-`)
  );
  if (!hasCurrentDrafts) {
    const preservedPath = join(runDir, `cards.draft.pre-${CARD_DRAFT_STAGE_PREFIX}.${timestampForPath()}.json`);
    writeText(preservedPath, readFileSync(cardsPath, "utf8"));
    console.warn(
      `Existing cards.draft.json is from an older card-draft stage; preserved it at ${preservedPath} and rebuilding.`
    );
    return [];
  }
  return validateCards(readJson(cardsPath));
}

function validateChunks(value: unknown): TranscriptChunk[] {
  assertRecord(value, "chunks file");
  const chunks = value.chunks;
  if (!Array.isArray(chunks)) throw new Error("chunks.json must include chunks[]");

  return chunks.map((item) => {
    assertRecord(item, "chunk");
    return {
      id: requiredString(item, "id"),
      heading: requiredString(item, "heading"),
      startLine: requiredNumber(item, "startLine"),
      endLine: requiredNumber(item, "endLine"),
      text: requiredString(item, "text"),
    };
  });
}

function readSavedAgent(runDir: string): SavedAgent | undefined {
  const agentPath = join(runDir, "agent.json");
  if (!existsSync(agentPath)) return undefined;

  const value = readJson(agentPath);
  assertRecord(value, "agent");
  return {
    agentId: requiredString(value, "agentId"),
    model: optionalString(value, "model"),
    cwd: optionalString(value, "cwd"),
  };
}

function requiredNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${key} must be a finite number`);
  }
  return value;
}

function compactJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Agent response did not contain a JSON object");
  }
}

function collectAssistantTexts(value: unknown, out: string[] = []): string[] {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) collectAssistantTexts(item, out);
    return out;
  }

  const record = value as Record<string, unknown>;
  if (record.type === "assistantMessage") {
    const message = record.message;
    if (message && typeof message === "object") {
      const text = (message as Record<string, unknown>).text;
      if (typeof text === "string" && text.trim()) out.push(text);
    }
  }

  for (const nested of Object.values(record)) collectAssistantTexts(nested, out);
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetryableSdkStartup<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRYABLE_SDK_ATTEMPTS; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!(error instanceof CursorAgentError) || !error.isRetryable) break;
      if (attempt === MAX_RETRYABLE_SDK_ATTEMPTS) break;
      const delayMs = attempt * 1000;
      console.warn(`[${label}] retryable SDK error; retrying in ${delayMs}ms`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

function validateInterests(value: unknown, chunkId?: string): CandidateInterest[] {
  assertRecord(value, "interest response");
  const interests = value.interests;
  if (!Array.isArray(interests)) throw new Error("interest response must include interests[]");

  return interests.slice(0, chunkId ? MAX_INTERESTS_PER_CHUNK : interests.length).map((item, index) => {
    assertRecord(item, "interest");
    const id = optionalString(item, "id") ?? `${chunkId ?? "interest"}-${index + 1}`;
    return {
      id,
      chunkId: optionalString(item, "chunkId") ?? chunkId ?? "unknown",
      title: requiredString(item, "title"),
      sourceExcerpt: requiredString(item, "sourceExcerpt"),
      whyWorthRemembering: requiredString(item, "whyWorthRemembering"),
      argumentCrux: optionalString(item, "argumentCrux"),
      technicalGrounding: optionalString(item, "technicalGrounding"),
      cardShape: optionalString(item, "cardShape"),
      timestamp: optionalString(item, "timestamp"),
      sectionTitle: optionalString(item, "sectionTitle"),
      priority: parsePriority(item.priority),
    };
  });
}

function maxSelectedInterests(manifest: Manifest): number {
  return manifest.maxInterests ?? Math.max(manifest.targetCards ?? 30, 30);
}

function capSelectedInterests(manifest: Manifest, interests: CandidateInterest[]): CandidateInterest[] {
  const maxInterests = maxSelectedInterests(manifest);
  if (interests.length <= maxInterests) return interests;
  console.warn(`Selected interests exceeded maxInterests (${interests.length} > ${maxInterests}); using first ${maxInterests}.`);
  return interests.slice(0, maxInterests);
}

function existingDeckStyleGuide(): string {
  return `Existing human-authored deck style to learn from, not blindly imitate:

1. Mechanism card
Q. Where does the lower bound on latency come from? Why can't you just keep decreasing batch size and have infinitesimal total time to process a token?
A. Because you still have to load all the active parameters into memory.

2. Derivation card
Q. Work through the math that shows that optimal batch size ought to be at least $300 \\times$ your sparsity ratio (active / total parameters) to maximize throughput. Ignore KV cache.
A. Set compute time = memory time, solve for batch size, then explain why weight fetches amortize while compute scales with batch.

3. Contrast card
Q. One could argue that NNs and cryptographic protocols use a similar high-level architecture to opposite ends. In what sense are they doing opposite things?
A. Cryptographic protocols take something structured and make it seem random; neural networks take something that may look random and extract structure from it.

Style notes:
- Questions can be conversational when that preserves the episode's motivating puzzle.
- Good cards often ask for a mechanism, contrast, implication, failure mode, or vivid source phrase.
- Use derivations, math, and blackboard-style prompts only when the episode actually supplies that structure.
- For normal conversations, the ideal is Feynman-style simplicity: reconstruct the crux in plain language, with just enough detail to make the explanation real.
- Answers can include short explanation, Markdown, math, or images, but should not become essays.`;
}

function validateCards(value: unknown): CandidateCard[] {
  assertRecord(value, "card response");
  const cards = value.cards;
  if (!Array.isArray(cards)) throw new Error("card response must include cards[]");

  return cards.map((item, index) => {
    assertRecord(item, "card");
    return {
      id: optionalString(item, "id") ?? `card-${index + 1}`,
      interestId: requiredString(item, "interestId"),
      sectionTitle: requiredString(item, "sectionTitle"),
      timestamp: optionalString(item, "timestamp"),
      sourceExcerpt: requiredString(item, "sourceExcerpt"),
      q: requiredString(item, "q"),
      a: requiredString(item, "a"),
      risk: optionalString(item, "risk"),
    };
  });
}

function validateCritique(value: unknown, pass: number): Critique {
  assertRecord(value, "critique response");
  const classification = value.classification;
  if (
    classification !== "T0" &&
    classification !== "T1" &&
    classification !== "T2" &&
    classification !== "T3"
  ) {
    throw new Error("critique.classification must be T0, T1, T2, or T3");
  }

  const recommendation = value.recommendation;
  if (
    recommendation !== "reject" &&
    recommendation !== "rewrite" &&
    recommendation !== "polish" &&
    recommendation !== "accept"
  ) {
    throw new Error("critique.recommendation must be reject, rewrite, polish, or accept");
  }

  let suggestedRewrite: Critique["suggestedRewrite"];
  if (value.suggestedRewrite !== undefined && value.suggestedRewrite !== null) {
    assertRecord(value.suggestedRewrite, "critique.suggestedRewrite");
    if (
      typeof value.suggestedRewrite.q === "string" &&
      value.suggestedRewrite.q.trim() &&
      typeof value.suggestedRewrite.a === "string" &&
      value.suggestedRewrite.a.trim()
    ) {
      suggestedRewrite = {
        q: value.suggestedRewrite.q,
        a: value.suggestedRewrite.a,
      };
    }
  }

  return {
    pass,
    classification,
    targeting: requiredString(value, "targeting"),
    construction: requiredString(value, "construction"),
    recommendation,
    suggestedRewrite,
  };
}

function parsePriority(value: unknown): CandidateInterest["priority"] {
  if (value === undefined) return undefined;
  if (value === "high" || value === "medium" || value === "low") return value;
  throw new Error("interest.priority must be high, medium, or low");
}

function buildEpisodeSetupPrompt(manifest: Manifest, chunks: TranscriptChunk[]): string {
  return `You are the durable episode agent for an offline flashcard pipeline.

Your job is to understand this episode well enough to identify ideas worth turning into spaced-repetition memory prompts. Do not edit files. Do not create final cards yet.

Episode:
${compactJson({
    slug: manifest.slug,
    title: manifest.title,
    guest: manifest.guest,
    youtubeUrl: manifest.youtubeUrl,
    substackUrl: manifest.substackUrl,
    notes: manifest.notes,
    transcriptChunkCount: chunks.length,
  })}

Quality standard:
- Prompt design is retrieval task design.
- Favor durable conceptual arguments the future reviewer will care about, not transient podcast claims.
- Cards later must be focused, precise, stable over months, tractable, and effortful.
- The best cards often reconstruct a mechanism, bottleneck, crux, counterargument, or simple causal model. Use derivations only when the episode really contains one.
- Do not manufacture fake technicality. The goal is clear Feynman-style understanding of the real crux.
- The main failure to avoid is T1: a plausible card that is roughly on target but too vague, generic, broad, or unstable for long-horizon review.

For now, reply only with JSON:
{
  "episodeSynopsis": "2-4 sentences",
  "recurringThemes": ["..."],
  "warningsForCardWriters": ["..."]
}`;
}

function buildInterestPrompt(manifest: Manifest, chunk: TranscriptChunk): string {
  return `Extract candidate flashcard-worthy conceptual cruxes from this transcript chunk.

Episode: ${manifest.title}
Chunk:
${compactJson({
    id: chunk.id,
    heading: chunk.heading,
    startLine: chunk.startLine,
    endLine: chunk.endLine,
  })}

Transcript chunk:
${chunk.text}

Return at most ${MAX_INTERESTS_PER_CHUNK} interests. Prefer 0-2 if the chunk is weak. Keep each source excerpt under 240 characters and each explanatory field concise.

Return only JSON:
{
  "interests": [
    {
      "id": "short-stable-id",
      "chunkId": "${chunk.id}",
      "title": "specific durable argument, mechanism, or crux",
      "sectionTitle": "${chunk.heading}",
      "timestamp": "HH:MM:SS if visible, otherwise omit",
      "sourceExcerpt": "brief exact or near-exact excerpt from the transcript",
      "whyWorthRemembering": "why this is worth reviewing months later",
      "argumentCrux": "the non-obvious claim, mechanism, causal chain, objection-resolution, or explanatory crux that should survive after the podcast is forgotten",
      "technicalGrounding": "the concrete constraints, examples, assumptions, causal steps, or equations needed to reconstruct it; omit if technical details would be fake make-work",
      "cardShape": "mechanism|derivation|contrast|prediction|failure-mode|counterargument|conceptual-model",
      "priority": "high|medium|low"
    }
  ]
}

Selection rule:
- Prefer places where the guest makes an argument you could explain simply to a smart friend, not places where they merely state an opinion, prediction, biography, or catchy phrase.
- A good interest should answer "what is the crux I want to still understand six months from now?"
- Do not force blackboard structure onto conversational episodes. The grounding should be as technical as the real argument requires, and no more.
- It is fine to return an empty array for weak chunks.`;
}

function buildSelectInterestsPrompt(manifest: Manifest, interests: CandidateInterest[]): string {
  const maxInterests = maxSelectedInterests(manifest);
  return `Select the best candidate interests for card drafting.

Episode: ${manifest.title}
Target final card count: ${manifest.targetCards ?? 30}
Maximum interests to keep: ${maxInterests}

Candidate interests:
${compactJson({ interests })}

Return only JSON:
{
  "interests": [
    {
      "id": "keep original id",
      "chunkId": "keep original chunkId",
      "title": "...",
      "sectionTitle": "...",
      "timestamp": "... if available",
      "sourceExcerpt": "...",
      "whyWorthRemembering": "...",
      "argumentCrux": "...",
      "technicalGrounding": "...",
      "cardShape": "mechanism|derivation|contrast|prediction|failure-mode|counterargument|conceptual-model",
      "priority": "high|medium|low"
    }
  ]
}

Prefer fewer, higher-value interests. Rank a clear conceptual crux above a merely memorable podcast point, even if the point is more quotable. Preserve source-specific framing and discard generic trivia. Avoid faux technicality: if a simple causal explanation is the real crux, keep it simple.`;
}

function buildCardDraftPrompt(manifest: Manifest, interests: CandidateInterest[], targetCards: number): string {
  return `Draft candidate Anki cards from these selected interests.

Episode: ${manifest.title}
Target cards from this batch: up to ${targetCards}

Selected interests:
${compactJson({ interests })}

Card-writing rules:
- Each card should test one unified retrieval target, but that target may be an extended argument if the argument is the durable thing worth retaining.
- Preserve the real grounding: assumptions, constraints, examples, causal steps, or equations that make the argument work. Do not add technical apparatus that was not needed to understand the point.
- Prefer questions like "why doesn't X work?", "what is the argument for Y?", "what bottleneck sets Z?", "what changes in this case?", or "what is the crux of the counterargument?"
- Avoid generic "What did the guest say about X?" or "What is X?" questions unless the source makes that exact definition important.
- Avoid yes/no or this/that prompts.
- Avoid broad questions with many valid answers, but do not over-compress a multi-step argument into a shallow one-sentence takeaway.
- The question should not give away the answer, but it must provide enough context to work months later.
- Answers may include brief explanation, math, or source context in Markdown.
- Answers should usually feel like a clear Feynman explanation: simple, concrete, and faithful to the real argument.
- Prefer at most one card per interest.
- If an interest contains multiple separable ideas, create separate cards only when the split is truly worthwhile.
- If you cannot make a stable card for an interest, skip it.
- Do not pad to the target. Fewer excellent cards are better than more weak cards.
- Penalize transient podcast claims. The final card should be useful even if the listener no longer cares that Karpathy personally said it.
- Penalize fake technical make-work. A card is worse if it dresses up a simple point with irrelevant rigor.

${existingDeckStyleGuide()}

Return only JSON:
{
  "cards": [
    {
      "id": "short-stable-id",
      "interestId": "matching selected interest id",
      "sectionTitle": "episode section title",
      "timestamp": "HH:MM:SS if available, otherwise omit",
      "sourceExcerpt": "brief excerpt grounding this card",
      "q": "Markdown question",
      "a": "Markdown answer",
      "risk": "optional concern, especially possible T1 issues"
    }
  ]
}`;
}

function batchItems<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

function targetCardsForBatch(totalTarget: number, batchCount: number, batchIndex: number): number {
  const base = Math.floor(totalTarget / batchCount);
  const remainder = totalTarget % batchCount;
  return base + (batchIndex < remainder ? 1 : 0);
}

function buildCritiquePrompt(manifest: Manifest, card: CandidateCard): string {
  return `You are a fresh, conservative critic for memory prompts.

Evaluate this candidate card for long-horizon spaced repetition. You did not generate it. Your job is to prevent plausible bad cards from reaching review.

Episode: ${manifest.title}

Source excerpt:
${card.sourceExcerpt}

Candidate card:
Q. ${card.q}
A. ${card.a}

Rating scale:
- T3: Ready to review. Specific, source-anchored when useful, unambiguous, stable over months, and preserves the important crux or mechanism in the simplest faithful form.
- T2: Needs polish. Core targeting and construction are sound; only wording-level tweaks needed.
- T1: Needs refactor. Roughly on target but not reviewable as written because it is vague, generic, broad, underspecified, admits multiple valid answers, loses the source's striking angle, reduces an argument to a transient podcast takeaway, or adds faux technical complexity.
- T0: Off target. Tests the wrong detail or misses what made the source excerpt worth remembering.

Litmus tests:
- Could someone answer correctly without knowing the intended idea?
- Could someone know the intended idea but fail because the question is underspecified?
- Does the question cue the same answer months later without the transcript?
- Is the question generic or definitional when the source's concrete framing matters?
- If the excerpt contains an argument, does the card ask the reviewer to reconstruct the crux rather than remember that the speaker made a claim?
- Does the answer explain the idea simply and concretely, without pretending the episode was more technical than it was?
- Is this merely transcript trivia or a podcast-position summary, or does it preserve the reason the detail is worth remembering?

Return only JSON:
{
  "classification": "T0|T1|T2|T3",
  "targeting": "1-3 sentences",
  "construction": "1-3 sentences",
  "recommendation": "reject|rewrite|polish|accept",
  "suggestedRewrite": {
    "q": "only if rewrite or polish would help",
    "a": "only if rewrite or polish would help"
  }
}`;
}

async function sendJsonRun<T>(
  agent: SDKAgent,
  stage: string,
  prompt: string,
  runDir: string,
  runLog: RunLogEntry[],
  validate: (value: unknown) => T
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRYABLE_SDK_ATTEMPTS; attempt += 1) {
    const attemptStage = attempt === 1 ? stage : `${stage}-retry-${attempt}`;
    const run = await withRetryableSdkStartup(attemptStage, () => agent.send(prompt));
    console.log(`[${attemptStage}] agent=${agent.agentId} run=${run.id}`);
    const result = await run.wait();
    let rawText = result.result ?? "";
    let salvaged = false;
    if (result.status !== "finished" && !rawText.trim() && run.supports("conversation")) {
      rawText = collectAssistantTexts(await run.conversation()).at(-1) ?? "";
      salvaged = rawText.trim() !== "";
    }
    const status = salvaged ? "salvaged" : result.status;
    const outputFile = join(runDir, "raw", `${attemptStage}.txt`);
    writeText(outputFile, rawText);

    try {
      if (result.status !== "finished" && !salvaged) {
        throw new Error(`${attemptStage} failed with status ${result.status}`);
      }
      if (salvaged) {
        console.warn(`[${attemptStage}] run ended with status ${result.status}; salvaged assistant JSON`);
      }
      const parsed = validate(extractJsonObject(rawText));
      runLog.push({
        stage,
        agentId: agent.agentId,
        runId: result.id,
        status,
        model: result.model?.id,
        durationMs: result.durationMs,
        outputFile,
      });
      return parsed;
    } catch (error) {
      lastError = error;
      runLog.push({
        stage,
        agentId: agent.agentId,
        runId: result.id,
        status: `${status}:invalid-json`,
        model: result.model?.id,
        durationMs: result.durationMs,
        outputFile,
      });
      if (attempt === MAX_RETRYABLE_SDK_ATTEMPTS) break;
      console.warn(`[${attemptStage}] invalid or incomplete JSON; retrying stage`);
      await sleep(attempt * 1000);
    }
  }

  throw lastError;
}

async function promptJsonRun<T>(
  stage: string,
  prompt: string,
  model: string,
  runDir: string,
  runLog: RunLogEntry[],
  validate: (value: unknown) => T
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRYABLE_SDK_ATTEMPTS; attempt += 1) {
    const attemptStage = attempt === 1 ? stage : `${stage}-retry-${attempt}`;
    const result = await withRetryableSdkStartup(stage, () =>
      Agent.prompt(prompt, {
        apiKey: process.env.CURSOR_API_KEY!,
        model: { id: model },
        local: {
          cwd: ROOT,
          settingSources: [],
          sandboxOptions: { enabled: true },
        },
      })
    );
    const outputFile = join(runDir, "raw", `${attemptStage}-${result.id}.txt`);
    writeText(outputFile, result.result ?? "");

    try {
      if (result.status !== "finished") {
        throw new Error(`${attemptStage} failed with status ${result.status}`);
      }
      const parsed = validate(extractJsonObject(result.result ?? ""));
      runLog.push({
        stage,
        runId: result.id,
        status: result.status,
        model: result.model?.id,
        durationMs: result.durationMs,
        outputFile,
      });
      return parsed;
    } catch (error) {
      lastError = error;
      runLog.push({
        stage,
        runId: result.id,
        status: `${result.status}:invalid-json`,
        model: result.model?.id,
        durationMs: result.durationMs,
        outputFile,
      });
      if (attempt === MAX_RETRYABLE_SDK_ATTEMPTS) break;
      console.warn(`[${attemptStage}] critic run failed or returned invalid JSON; retrying`);
      await sleep(attempt * 1000);
    }
  }

  if (lastError instanceof CursorAgentError) {
    throw new Error(`${stage} could not start: ${lastError.message}`);
  }
  throw lastError;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function truncateForMarkdown(text: string, max = 1800): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}\n\n[truncated]`;
}

function buildReviewMarkdown(manifest: Manifest, items: ReviewItem[], runDir: string): string {
  const lines: string[] = [];
  lines.push(`# Flashcard Review: ${manifest.title}`);
  lines.push("");
  lines.push(`- Slug: \`${manifest.slug}\``);
  if (manifest.guest) lines.push(`- Guest: ${manifest.guest}`);
  lines.push(`- Run directory: \`${runDir}\``);
  lines.push(`- Candidate cards: ${items.length}`);
  lines.push("");
  lines.push("Review statuses are recommendations only. Nothing has been promoted into the canonical deck.");
  lines.push("");

  for (const item of items) {
    const { card, critiques } = item;
    const classifications = critiques.map((c) => c.classification).join(", ");
    const recommendations = critiques.map((c) => c.recommendation).join(", ");
    lines.push(`## ${card.id}: ${card.sectionTitle}`);
    lines.push("");
    if (card.timestamp) lines.push(`- Timestamp: ${card.timestamp}`);
    lines.push(`- Interest: \`${card.interestId}\``);
    lines.push(`- Critic classifications: ${classifications}`);
    lines.push(`- Recommendations: ${recommendations}`);
    if (card.risk) lines.push(`- Generator risk note: ${card.risk}`);
    lines.push("");
    lines.push("### Source Excerpt");
    lines.push("");
    lines.push("> " + truncateForMarkdown(card.sourceExcerpt).replace(/\n/g, "\n> "));
    lines.push("");
    lines.push("### Candidate Card");
    lines.push("");
    lines.push(`Q. ${card.q}`);
    lines.push("");
    lines.push(`A. ${card.a}`);
    lines.push("");
    lines.push("### Critiques");
    lines.push("");
    for (const critique of critiques) {
      lines.push(`#### Pass ${critique.pass}: ${critique.classification} / ${critique.recommendation}`);
      lines.push("");
      lines.push(`Targeting: ${critique.targeting}`);
      lines.push("");
      lines.push(`Construction: ${critique.construction}`);
      lines.push("");
      if (critique.suggestedRewrite) {
        lines.push("Suggested rewrite:");
        lines.push("");
        lines.push(`Q. ${critique.suggestedRewrite.q}`);
        lines.push("");
        lines.push(`A. ${critique.suggestedRewrite.a}`);
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

async function openAgent(opts: CliOptions, manifest: Manifest, runDir: string): Promise<SDKAgent> {
  const savedAgent = opts.resumeRunDir ? readSavedAgent(runDir) : undefined;
  if (savedAgent) {
    console.log(`Resuming agent ${savedAgent.agentId}`);
    return withRetryableSdkStartup("agent-resume", () =>
      Agent.resume(savedAgent.agentId, {
        apiKey: process.env.CURSOR_API_KEY,
        model: { id: opts.model },
        local: {
          cwd: savedAgent.cwd ?? ROOT,
          settingSources: [],
          sandboxOptions: { enabled: true },
        },
      })
    );
  }

  const agent = await withRetryableSdkStartup("agent-create", () =>
    Agent.create({
      apiKey: process.env.CURSOR_API_KEY,
      name: `flashcards:${manifest.slug}`,
      model: { id: opts.model },
      local: {
        cwd: ROOT,
        settingSources: [],
        sandboxOptions: { enabled: true },
      },
    })
  );
  writeJson(join(runDir, "agent.json"), {
    agentId: agent.agentId,
    model: opts.model,
    cwd: ROOT,
    createdAt: new Date().toISOString(),
  });
  return agent;
}

async function draftCardsAndReview(
  manifest: Manifest,
  selectedInterests: CandidateInterest[],
  agent: SDKAgent,
  opts: CliOptions,
  runDir: string,
  runLog: RunLogEntry[]
): Promise<boolean> {
  const cardBatches = batchItems(
    selectedInterests,
    Math.max(1, Math.floor(manifest.cardDraftBatchSize ?? 8))
  );
  const completedCardStages = new Set(
    runLog
      .filter(
        (entry) =>
          (entry.status === "finished" || entry.status === "salvaged") &&
          entry.stage.startsWith(`${CARD_DRAFT_STAGE_PREFIX}-`)
      )
      .map((entry) => entry.stage)
  );
  const draftCards = readDraftCards(runDir, runLog);
  const totalTargetCards = Math.max(1, Math.floor(manifest.targetCards ?? 30));
  let cardBatchesRun = 0;

  for (let i = 0; i < cardBatches.length; i += 1) {
    const stage = `${CARD_DRAFT_STAGE_PREFIX}-${String(i + 1).padStart(2, "0")}`;
    if (completedCardStages.has(stage)) {
      console.log(`[cards-draft] batch ${i + 1}/${cardBatches.length}: already complete`);
      continue;
    }
    if (opts.maxCardBatches !== undefined && cardBatchesRun >= opts.maxCardBatches) {
      console.log("");
      console.log(
        `Stopped after ${cardBatchesRun} new card batch${
          cardBatchesRun === 1 ? "" : "es"
        }. Re-run with --resume-run-dir to continue.`
      );
      return false;
    }

    const batchCards = await sendJsonRun(
      agent,
      stage,
      buildCardDraftPrompt(
        manifest,
        cardBatches[i],
        targetCardsForBatch(totalTargetCards, cardBatches.length, i)
      ),
      runDir,
      runLog,
      validateCards
    );
    draftCards.push(...batchCards);
    completedCardStages.add(stage);
    cardBatchesRun += 1;
    writeJson(join(runDir, "cards.draft.json"), { cards: draftCards });
    console.log(`[cards-draft] batch ${i + 1}/${cardBatches.length}: ${batchCards.length}`);
  }

  writeJson(join(runDir, "cards.draft.json"), { cards: draftCards });
  console.log(`Draft cards: ${draftCards.length}`);

  const criticPasses = Math.max(1, Math.floor(manifest.criticPasses ?? 1));
  const reviewItems = await mapWithConcurrency(draftCards, 3, async (card) => {
    const critiques: Critique[] = [];
    for (let pass = 1; pass <= criticPasses; pass += 1) {
      const stage = `critique-${card.id}-pass-${pass}`;
      const critique = await promptJsonRun(
        stage,
        buildCritiquePrompt(manifest, card),
        opts.model,
        runDir,
        runLog,
        (value) => validateCritique(value, pass)
      ).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[${stage}] critic failed after retries; marking for human review: ${message}`);
        runLog.push({
          stage,
          status: "failed:fallback-critique",
        });
        return {
          pass,
          classification: "T1",
          targeting: "The automated critic failed after retries, so this card needs manual targeting review.",
          construction: `Critic failure: ${message}`,
          recommendation: "rewrite",
        } satisfies Critique;
      });
      critiques.push(critique);
    }
    console.log(`[critique] ${card.id}: ${critiques.map((c) => c.classification).join(", ")}`);
    return { card, critiques };
  });

  writeJson(join(runDir, "review.json"), { manifest, items: reviewItems });
  writeText(join(runDir, "review.md"), buildReviewMarkdown(manifest, reviewItems, runDir));
  return true;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }
  if (!opts.manifestPath && !opts.resumeRunDir) {
    printHelp();
    throw new Error("Missing --manifest or --resume-run-dir");
  }
  if (!process.env.CURSOR_API_KEY) {
    throw new Error("CURSOR_API_KEY is required");
  }

  let manifest: Manifest;
  let runDir: string;
  let runLog: RunLogEntry[] = [];
  let selectedInterests: CandidateInterest[] = [];

  if (opts.resumeRunDir) {
    runDir = resolveInputPath(opts.resumeRunDir);
    if (!existsSync(runDir)) throw new Error(`Resume run directory not found: ${runDir}`);
    manifest = parseManifest(readJson(join(runDir, "manifest.snapshot.json")));
    runLog = readRunLog(runDir);
    selectedInterests = capSelectedInterests(manifest, tryReadSelectedInterests(runDir) ?? []);
    console.log(`Continuing artifacts in ${runDir}`);
    if (selectedInterests.length > 0) {
      console.log(`Selected interests: ${selectedInterests.length}`);
    } else {
      console.log("Selected interests not found; resuming interest extraction");
    }
  } else {
    manifest = readManifest(opts.manifestPath!);
    const transcriptPath = resolveInputPath(manifest.transcriptPath);
    if (!existsSync(transcriptPath)) {
      throw new Error(`Transcript not found: ${transcriptPath}`);
    }

    const transcript = readFileSync(transcriptPath, "utf8");
    const chunks = segmentTranscript(transcript, manifest.chunkCharLimit ?? 18_000).slice(
      0,
      manifest.maxChunks ?? Number.POSITIVE_INFINITY
    );
    if (chunks.length === 0) throw new Error("Transcript produced no chunks");

    runDir = join(resolve(ROOT, opts.outDir), manifest.slug, timestampForPath());
    mkdirSync(runDir, { recursive: true });
    writeJson(join(runDir, "manifest.snapshot.json"), {
      ...manifest,
      transcriptPath,
      sourceFilename: basename(transcriptPath),
    });
    writeJson(join(runDir, "chunks.json"), { chunks });

    console.log(`Writing artifacts to ${runDir}`);
    console.log(`Transcript chunks: ${chunks.length}`);
  }

  let agent: SDKAgent | undefined;
  try {
    agent = await openAgent(opts, manifest, runDir);
    if (selectedInterests.length === 0) {
      const chunks = validateChunks(readJson(join(runDir, "chunks.json")));
      if (!opts.resumeRunDir) {
        await sendJsonRun(
          agent,
          "episode-setup",
          buildEpisodeSetupPrompt(manifest, chunks),
          runDir,
          runLog,
          (value) => value
        );
      }

      const perChunkInterests: CandidateInterest[] = [];
      for (const chunk of chunks) {
        const completedInterests = opts.resumeRunDir
          ? readCompletedChunkInterests(runDir, runLog, chunk)
          : undefined;
        const interests =
          completedInterests ??
          (await sendJsonRun(
            agent,
            `interests-${chunk.id}`,
            buildInterestPrompt(manifest, chunk),
            runDir,
            runLog,
            (value) => validateInterests(value, chunk.id)
          ));
        perChunkInterests.push(...interests);
        writeJson(join(runDir, "interests.raw.json"), { interests: perChunkInterests });
        console.log(`[interests] ${chunk.id}: ${interests.length}${completedInterests ? " (resumed)" : ""}`);
      }

      selectedInterests = capSelectedInterests(
        manifest,
        await sendJsonRun(
          agent,
          "interests-selected",
          buildSelectInterestsPrompt(manifest, perChunkInterests),
          runDir,
          runLog,
          validateInterests
        )
      );
      writeJson(join(runDir, "interests.selected.json"), { interests: selectedInterests });
      console.log(`Selected interests: ${selectedInterests.length}`);
    }

    const completed = await draftCardsAndReview(manifest, selectedInterests, agent, opts, runDir, runLog);
    writeJson(join(runDir, "run-log.json"), { runLog });
    if (!completed) return;

    console.log("");
    console.log("Done.");
    console.log(`Review artifact: ${join(runDir, "review.md")}`);
  } catch (error) {
    writeJson(join(runDir, "run-log.json"), { runLog });
    if (error instanceof CursorAgentError) {
      throw new Error(`Cursor agent startup failed: ${error.message}`);
    }
    throw error;
  } finally {
    await agent?.[Symbol.asyncDispose]();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
