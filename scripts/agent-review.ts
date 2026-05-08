/**
 * Local review workbench for agent-generated flashcard drafts.
 *
 * It scans generated `review.json` artifacts, serves a localhost UI, stores
 * decisions next to each run, and can resume the durable episode agent for
 * contextual rewrites.
 */

import { Agent, CursorAgentError } from "@cursor/sdk";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const DEFAULT_ARTIFACT_ROOT = ".agent-flashcards";
const DEFAULT_PORT = 8765;
const DEFAULT_MODEL = "composer-2";
const MAX_RETRYABLE_SDK_ATTEMPTS = 3;

type Tier = "T0" | "T1" | "T2" | "T3";
type Recommendation = "reject" | "rewrite" | "polish" | "accept";
type DecisionStatus = "unreviewed" | "accepted" | "rejected" | "edited" | "rewrite-requested" | "rewritten";

type Manifest = {
  slug: string;
  title: string;
  guest?: string;
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
  classification: Tier;
  targeting: string;
  construction: string;
  recommendation: Recommendation;
  suggestedRewrite?: {
    q: string;
    a: string;
  };
};

type ReviewItem = {
  card: CandidateCard;
  critiques: Critique[];
};

type ReviewFile = {
  manifest: Manifest;
  items: ReviewItem[];
};

type AgentFile = {
  agentId?: string;
  model?: string;
  cwd?: string;
};

type Decision = {
  status: DecisionStatus;
  notes?: string;
  editedCard?: {
    q: string;
    a: string;
  };
  updatedAt: string;
};

type DecisionsFile = {
  decisions: Record<string, Decision>;
};

type RewriteRecord = {
  cardId: string;
  feedback: string;
  revisedCard: {
    q: string;
    a: string;
  };
  explanation: string;
  critiques: Critique[];
  agentId?: string;
  runId?: string;
  createdAt: string;
};

type RunBundle = {
  runId: string;
  runDir: string;
  review: ReviewFile;
  decisions: Record<string, Decision>;
  agent?: AgentFile;
  rewrites: RewriteRecord[];
};

type CliOptions = {
  artifactRoot: string;
  port: number;
  model: string;
  open: boolean;
  help: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    artifactRoot: DEFAULT_ARTIFACT_ROOT,
    port: DEFAULT_PORT,
    model: DEFAULT_MODEL,
    open: true,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--root") {
      opts.artifactRoot = argv[++i] ?? opts.artifactRoot;
    } else if (arg === "--port") {
      opts.port = Number(argv[++i] ?? opts.port);
    } else if (arg === "--model") {
      opts.model = argv[++i] ?? opts.model;
    } else if (arg === "--no-open") {
      opts.open = false;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(opts.port) || opts.port < 1 || opts.port > 65535) {
    throw new Error("--port must be an integer between 1 and 65535");
  }

  return opts;
}

function printHelp() {
  console.log(`Usage:
  npm run agent:review

Options:
  --root <path>     Artifact root to scan. Default: ${DEFAULT_ARTIFACT_ROOT}
  --port <number>   Local server port. Default: ${DEFAULT_PORT}
  --model <id>      Model for rewrite/critic calls. Default: ${DEFAULT_MODEL}
  --no-open         Do not open the browser automatically.
  --help            Show this help text.
`);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function listFilesRecursive(root: string, filename: string): string[] {
  if (!existsSync(root)) return [];
  const out: string[] = [];

  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (name === filename) {
        out.push(full);
      }
    }
  }

  walk(root);
  return out.sort((a, b) => b.localeCompare(a));
}

function loadDecisions(runDir: string): Record<string, Decision> {
  const path = join(runDir, "decisions.json");
  if (!existsSync(path)) return {};
  return readJson<DecisionsFile>(path).decisions ?? {};
}

function saveDecision(runDir: string, cardId: string, decision: Omit<Decision, "updatedAt">) {
  const path = join(runDir, "decisions.json");
  const decisions = loadDecisions(runDir);
  decisions[cardId] = {
    ...decision,
    updatedAt: new Date().toISOString(),
  };
  writeJson(path, { decisions });
}

function loadRewrites(runDir: string): RewriteRecord[] {
  const rewritesDir = join(runDir, "rewrites");
  if (!existsSync(rewritesDir)) return [];
  return readdirSync(rewritesDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => readJson<RewriteRecord>(join(rewritesDir, name)));
}

function findAgentFile(runDir: string): AgentFile | undefined {
  const agentPath = join(runDir, "agent.json");
  if (existsSync(agentPath)) return readJson<AgentFile>(agentPath);

  const runLogPath = join(runDir, "run-log.json");
  if (!existsSync(runLogPath)) return undefined;
  const runLog = readJson<{ runLog?: Array<{ agentId?: string; model?: string }> }>(runLogPath);
  const firstWithAgent = runLog.runLog?.find((entry) => entry.agentId);
  return firstWithAgent?.agentId
    ? { agentId: firstWithAgent.agentId, model: firstWithAgent.model, cwd: ROOT }
    : undefined;
}

function loadRuns(artifactRoot: string): RunBundle[] {
  return listFilesRecursive(artifactRoot, "review.json").map((reviewPath) => {
    const runDir = dirname(reviewPath);
    const review = readJson<ReviewFile>(reviewPath);
    return {
      runId: relative(artifactRoot, runDir),
      runDir,
      review,
      decisions: loadDecisions(runDir),
      agent: findAgentFile(runDir),
      rewrites: loadRewrites(runDir),
    };
  });
}

function findRun(artifactRoot: string, runDir: string): RunBundle {
  const resolvedRunDir = resolve(runDir);
  const resolvedRoot = resolve(artifactRoot);
  if (!resolvedRunDir.startsWith(resolvedRoot)) {
    throw new Error("runDir must be inside artifact root");
  }
  const reviewPath = join(resolvedRunDir, "review.json");
  if (!existsSync(reviewPath)) throw new Error(`Missing review.json in ${resolvedRunDir}`);
  const review = readJson<ReviewFile>(reviewPath);
  return {
    runId: relative(resolvedRoot, resolvedRunDir),
    runDir: resolvedRunDir,
    review,
    decisions: loadDecisions(resolvedRunDir),
    agent: findAgentFile(resolvedRunDir),
    rewrites: loadRewrites(resolvedRunDir),
  };
}

function findItem(run: RunBundle, cardId: string): ReviewItem {
  const item = run.review.items.find((candidate) => candidate.card.id === cardId);
  if (!item) throw new Error(`Card not found: ${cardId}`);
  return item;
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

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${key} must be a non-empty string`);
  }
  return value;
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`${key} must be a string`);
  return value;
}

function validateRewrite(value: unknown): RewriteRecord["revisedCard"] & { explanation: string } {
  assertRecord(value, "rewrite response");
  return {
    q: requiredString(value, "q"),
    a: requiredString(value, "a"),
    explanation: requiredString(value, "explanation"),
  };
}

function validateCritique(value: unknown, pass: number): Critique {
  assertRecord(value, "critique response");
  const classification = value.classification;
  if (classification !== "T0" && classification !== "T1" && classification !== "T2" && classification !== "T3") {
    throw new Error("classification must be T0, T1, T2, or T3");
  }
  const recommendation = value.recommendation;
  if (recommendation !== "reject" && recommendation !== "rewrite" && recommendation !== "polish" && recommendation !== "accept") {
    throw new Error("recommendation must be reject, rewrite, polish, or accept");
  }

  let suggestedRewrite: Critique["suggestedRewrite"];
  if (value.suggestedRewrite !== undefined && value.suggestedRewrite !== null) {
    assertRecord(value.suggestedRewrite, "suggestedRewrite");
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
      await sleep(attempt * 1000);
    }
  }

  throw lastError;
}

function buildRewritePrompt(run: RunBundle, item: ReviewItem, feedback: string): string {
  return `You are the durable episode agent for this flashcard run. You previously analyzed the episode and drafted cards.

The reviewer dislikes this card and wants a rewrite using your accumulated episode context.

Episode:
${JSON.stringify(run.review.manifest, null, 2)}

Original source excerpt:
${item.card.sourceExcerpt}

Original card:
Q. ${item.card.q}
A. ${item.card.a}

Critic notes:
${JSON.stringify(item.critiques, null, 2)}

Reviewer feedback:
${feedback}

Rewrite the card. Preserve the source grounding and what is genuinely worth remembering, but fix the review problem. Avoid broad, generic, yes/no, or multiple-answer questions.

Return only JSON:
{
  "q": "revised Markdown question",
  "a": "revised Markdown answer",
  "explanation": "briefly explain what changed and why"
}`;
}

function buildCritiquePrompt(manifest: Manifest, card: CandidateCard): string {
  return `You are a fresh, conservative critic for memory prompts.

Evaluate this rewritten candidate card for long-horizon spaced repetition. You did not generate it.

Episode: ${manifest.title}

Source excerpt:
${card.sourceExcerpt}

Candidate card:
Q. ${card.q}
A. ${card.a}

Rating scale:
- T3: Ready to review. Specific, source-anchored when useful, unambiguous, and stable over months.
- T2: Needs polish. Core targeting and construction are sound; only wording-level tweaks needed.
- T1: Needs refactor. Roughly on target but not reviewable as written because it is vague, generic, broad, underspecified, admits multiple valid answers, or loses the source's striking angle.
- T0: Off target. Tests the wrong detail or misses what made the source excerpt worth remembering.

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

async function critiqueCard(manifest: Manifest, card: CandidateCard, model: string): Promise<Critique> {
  const result = await withRetryableSdkStartup("rewrite-critic", () =>
    Agent.prompt(buildCritiquePrompt(manifest, card), {
      apiKey: process.env.CURSOR_API_KEY!,
      model: { id: model },
      local: {
        cwd: ROOT,
        settingSources: [],
        sandboxOptions: { enabled: true },
      },
    })
  );
  if (result.status !== "finished") {
    throw new Error(`Critic failed with status ${result.status}`);
  }
  return validateCritique(extractJsonObject(result.result ?? ""), 1);
}

async function rewriteCard(
  artifactRoot: string,
  runDir: string,
  cardId: string,
  feedback: string,
  model: string
): Promise<RewriteRecord> {
  if (!process.env.CURSOR_API_KEY) {
    throw new Error("CURSOR_API_KEY is required for rewrites");
  }

  const run = findRun(artifactRoot, runDir);
  const item = findItem(run, cardId);
  const agentId = run.agent?.agentId;
  if (!agentId) {
    throw new Error("This run has no saved agentId. Re-run generation with the latest pipeline.");
  }

  const agent = withRetryableSdkStartup("rewrite-agent-resume", () =>
    Agent.resume(agentId, {
      apiKey: process.env.CURSOR_API_KEY,
      model: { id: model },
      local: {
        cwd: run.agent?.cwd ?? ROOT,
        settingSources: [],
        sandboxOptions: { enabled: true },
      },
    })
  );

  try {
    const sdkAgent = await agent;
    const rewriteRun = await withRetryableSdkStartup("rewrite-send", () =>
      sdkAgent.send(buildRewritePrompt(run, item, feedback))
    );
    const result = await rewriteRun.wait();
    if (result.status !== "finished") {
      throw new Error(`Rewrite failed with status ${result.status}`);
    }
    const revised = validateRewrite(extractJsonObject(result.result ?? ""));
    const revisedCard: CandidateCard = {
      ...item.card,
      q: revised.q,
      a: revised.a,
    };
    const critique = await critiqueCard(run.review.manifest, revisedCard, model);
    const record: RewriteRecord = {
      cardId,
      feedback,
      revisedCard: {
        q: revised.q,
        a: revised.a,
      },
      explanation: revised.explanation,
      critiques: [critique],
      agentId,
      runId: result.id,
      createdAt: new Date().toISOString(),
    };
    const path = join(run.runDir, "rewrites", `${cardId}-${Date.now()}.json`);
    writeJson(path, record);
    saveDecision(run.runDir, cardId, {
      status: "rewritten",
      notes: feedback,
      editedCard: record.revisedCard,
    });
    return record;
  } finally {
    const sdkAgent = await agent;
    await sdkAgent[Symbol.asyncDispose]();
  }
}

function sendJson(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(value));
}

function sendHtml(res: ServerResponse, html: string) {
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(html);
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

function openBrowser(url: string) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", url] : [url];
  const child = spawn(command, args, { stdio: "ignore", detached: true });
  child.unref();
}

function htmlPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent Flashcard Review</title>
  <style>
    :root { color-scheme: light dark; --bg: #f7f4ed; --panel: #fffaf0; --text: #211d19; --muted: #746b5f; --line: #ded5c4; --accent: #9f4429; }
    @media (prefers-color-scheme: dark) { :root { --bg: #171512; --panel: #211e1a; --text: #eee5d8; --muted: #b8aa98; --line: #3d362e; --accent: #e28b66; } }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header { padding: 18px 22px; border-bottom: 1px solid var(--line); display: flex; gap: 16px; align-items: center; justify-content: space-between; }
    h1 { margin: 0; font-size: 18px; }
    button, select, textarea, input { font: inherit; }
    button { border: 1px solid var(--line); background: var(--panel); color: var(--text); border-radius: 8px; padding: 7px 10px; cursor: pointer; }
    button.primary { background: var(--accent); border-color: var(--accent); color: white; }
    button:disabled { opacity: .55; cursor: not-allowed; }
    select, textarea, input { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); padding: 7px 9px; }
    textarea { width: 100%; min-height: 92px; resize: vertical; }
    main { display: grid; grid-template-columns: 330px 1fr; min-height: calc(100vh - 67px); }
    aside { border-right: 1px solid var(--line); padding: 14px; overflow: auto; max-height: calc(100vh - 67px); }
    .toolbar { display: grid; gap: 8px; margin-bottom: 12px; }
    .card-list { display: grid; gap: 8px; }
    .list-item { border: 1px solid var(--line); background: var(--panel); border-radius: 10px; padding: 10px; cursor: pointer; }
    .list-item.active { outline: 2px solid var(--accent); }
    .small { color: var(--muted); font-size: 12px; }
    .badge { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 1px 7px; font-size: 12px; color: var(--muted); margin-right: 4px; }
    .review { padding: 16px; overflow: auto; max-height: calc(100vh - 67px); }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; align-items: start; }
    .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px; }
    .panel h2 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
    pre { white-space: pre-wrap; word-break: break-word; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
    .qa { white-space: pre-wrap; font-family: Georgia, serif; font-size: 17px; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .critique { border-top: 1px solid var(--line); padding-top: 10px; margin-top: 10px; }
    .empty { color: var(--muted); padding: 40px; text-align: center; }
    @media (max-width: 1100px) { main { grid-template-columns: 1fr; } aside { max-height: none; border-right: 0; border-bottom: 1px solid var(--line); } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Agent Flashcard Review</h1>
    <div class="small" id="summary">Loading...</div>
  </header>
  <main>
    <aside>
      <div class="toolbar">
        <select id="runFilter"></select>
        <select id="statusFilter">
          <option value="all">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="edited">Edited</option>
          <option value="rewritten">Rewritten</option>
        </select>
        <input id="search" placeholder="Search cards">
        <button id="refresh">Refresh</button>
      </div>
      <div class="card-list" id="cardList"></div>
    </aside>
    <section class="review" id="reviewPane">
      <div class="empty">Select a card.</div>
    </section>
  </main>
  <script>
    let state = { runs: [], cards: [], selectedKey: null };
    const el = (id) => document.getElementById(id);
    const text = (value) => value == null ? "" : String(value);

    async function api(path, options) {
      const res = await fetch(path, {
        headers: { "content-type": "application/json" },
        ...options,
        body: options && options.body ? JSON.stringify(options.body) : undefined
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      return json;
    }

    function flatten(runs) {
      return runs.flatMap((run) => run.review.items.map((item) => {
        const decision = run.decisions[item.card.id] || { status: "unreviewed" };
        const rewrites = run.rewrites.filter((rewrite) => rewrite.cardId === item.card.id);
        return { key: run.runDir + "::" + item.card.id, run, item, decision, rewrites };
      }));
    }

    async function load() {
      const data = await api("/api/data");
      state.runs = data.runs;
      state.cards = flatten(data.runs);
      renderFilters();
      renderList();
      if (state.selectedKey) renderSelected();
      el("summary").textContent = state.runs.length + " runs · " + state.cards.length + " cards";
    }

    function renderFilters() {
      const select = el("runFilter");
      const current = select.value || "all";
      select.innerHTML = '<option value="all">All runs</option>' + state.runs.map((run) =>
        '<option value="' + encodeURIComponent(run.runDir) + '">' + run.review.manifest.title + " · " + run.runId + '</option>'
      ).join("");
      select.value = current;
    }

    function filteredCards() {
      const runValue = decodeURIComponent(el("runFilter").value);
      const status = el("statusFilter").value;
      const query = el("search").value.toLowerCase();
      return state.cards.filter((entry) => {
        if (runValue !== "all" && entry.run.runDir !== runValue) return false;
        if (status !== "all" && (entry.decision.status || "unreviewed") !== status) return false;
        const haystack = [entry.run.review.manifest.title, entry.item.card.q, entry.item.card.a, entry.item.card.sourceExcerpt].join(" ").toLowerCase();
        return !query || haystack.includes(query);
      });
    }

    function renderList() {
      const list = el("cardList");
      const cards = filteredCards();
      if (cards.length === 0) {
        list.innerHTML = '<div class="empty">No cards match.</div>';
        return;
      }
      list.innerHTML = "";
      for (const entry of cards) {
        const div = document.createElement("div");
        div.className = "list-item" + (entry.key === state.selectedKey ? " active" : "");
        const tiers = entry.item.critiques.map((c) => c.classification).join(", ");
        div.innerHTML = '<div><span class="badge">' + entry.decision.status + '</span><span class="badge">' + tiers + '</span></div>' +
          '<strong>' + escapeHtml(entry.item.card.q).slice(0, 120) + '</strong>' +
          '<div class="small">' + escapeHtml(entry.run.review.manifest.title) + '</div>';
        div.onclick = () => { state.selectedKey = entry.key; renderList(); renderSelected(); };
        list.appendChild(div);
      }
    }

    function selected() {
      return state.cards.find((entry) => entry.key === state.selectedKey) || state.cards[0];
    }

    function renderSelected() {
      const entry = selected();
      if (!entry) {
        el("reviewPane").innerHTML = '<div class="empty">No cards available. Run the generator first.</div>';
        return;
      }
      state.selectedKey = entry.key;
      const card = entry.decision.editedCard ? { ...entry.item.card, ...entry.decision.editedCard } : entry.item.card;
      const latestRewrite = entry.rewrites[entry.rewrites.length - 1];
      el("reviewPane").innerHTML =
        '<div class="actions">' +
          '<button class="primary" id="accept">Accept</button>' +
          '<button id="reject">Reject</button>' +
          '<button id="saveEdit">Save edit</button>' +
          '<button id="rewrite">Rewrite with feedback</button>' +
          '<span class="badge">' + entry.decision.status + '</span>' +
        '</div>' +
        '<div class="grid">' +
          '<div class="panel"><h2>Source</h2><div class="small">' + escapeHtml(entry.item.card.sectionTitle) + '</div><pre>' + escapeHtml(entry.item.card.sourceExcerpt) + '</pre></div>' +
          '<div class="panel"><h2>Card</h2><label class="small">Question</label><textarea id="editQ">' + escapeHtml(card.q) + '</textarea><label class="small">Answer</label><textarea id="editA">' + escapeHtml(card.a) + '</textarea><label class="small">Your notes / rewrite feedback</label><textarea id="notes">' + escapeHtml(entry.decision.notes || "") + '</textarea>' + (entry.item.card.risk ? '<p class="small">Risk: ' + escapeHtml(entry.item.card.risk) + '</p>' : '') + '</div>' +
          '<div class="panel"><h2>Critics</h2>' + renderCritiques(entry.item.critiques) + (latestRewrite ? renderRewrite(latestRewrite) : '') + '</div>' +
        '</div>';

      el("accept").onclick = () => saveDecision(entry, "accepted");
      el("reject").onclick = () => saveDecision(entry, "rejected");
      el("saveEdit").onclick = () => saveDecision(entry, "edited");
      el("rewrite").onclick = () => rewrite(entry);
    }

    function renderCritiques(critiques) {
      return critiques.map((c) => '<div class="critique"><strong>' + c.classification + ' / ' + c.recommendation + '</strong><p>' + escapeHtml(c.targeting) + '</p><p>' + escapeHtml(c.construction) + '</p>' + (c.suggestedRewrite ? '<p class="small">Suggested Q: ' + escapeHtml(c.suggestedRewrite.q) + '</p>' : '') + '</div>').join("");
    }

    function renderRewrite(rewrite) {
      return '<div class="critique"><strong>Latest rewrite</strong><p>' + escapeHtml(rewrite.explanation) + '</p><p><strong>Q.</strong> ' + escapeHtml(rewrite.revisedCard.q) + '</p><p><strong>A.</strong> ' + escapeHtml(rewrite.revisedCard.a) + '</p>' + renderCritiques(rewrite.critiques || []) + '</div>';
    }

    async function saveDecision(entry, status) {
      await api("/api/decision", {
        method: "POST",
        body: {
          runDir: entry.run.runDir,
          cardId: entry.item.card.id,
          status,
          notes: el("notes").value,
          editedCard: { q: el("editQ").value, a: el("editA").value }
        }
      });
      await load();
      renderSelected();
    }

    async function rewrite(entry) {
      const feedback = el("notes").value.trim();
      if (!feedback) {
        alert("Add rewrite feedback first.");
        return;
      }
      el("rewrite").disabled = true;
      el("rewrite").textContent = "Rewriting...";
      try {
        await api("/api/rewrite", {
          method: "POST",
          body: { runDir: entry.run.runDir, cardId: entry.item.card.id, feedback }
        });
        await load();
        renderSelected();
      } catch (err) {
        alert(err.message);
      }
    }

    function escapeHtml(value) {
      return text(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[ch]));
    }

    el("refresh").onclick = load;
    el("runFilter").onchange = renderList;
    el("statusFilter").onchange = renderList;
    el("search").oninput = renderList;
    load().catch((err) => { el("summary").textContent = err.message; });
  </script>
</body>
</html>`;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  artifactRoot: string,
  model: string
) {
  const url = new URL(req.url ?? "/", "http://localhost");

  try {
    if (req.method === "GET" && url.pathname === "/") {
      sendHtml(res, htmlPage());
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/data") {
      sendJson(res, 200, { runs: loadRuns(artifactRoot) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/decision") {
      const body = await readBody(req);
      assertRecord(body, "request body");
      const runDir = requiredString(body, "runDir");
      const cardId = requiredString(body, "cardId");
      const status = requiredString(body, "status") as DecisionStatus;
      if (!["accepted", "rejected", "edited", "rewrite-requested", "rewritten"].includes(status)) {
        throw new Error("Invalid decision status");
      }
      let editedCard: Decision["editedCard"];
      if (body.editedCard !== undefined) {
        assertRecord(body.editedCard, "editedCard");
        editedCard = {
          q: requiredString(body.editedCard, "q"),
          a: requiredString(body.editedCard, "a"),
        };
      }
      const run = findRun(artifactRoot, runDir);
      findItem(run, cardId);
      saveDecision(run.runDir, cardId, {
        status,
        notes: optionalString(body, "notes"),
        editedCard,
      });
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/rewrite") {
      const body = await readBody(req);
      assertRecord(body, "request body");
      const record = await rewriteCard(
        artifactRoot,
        requiredString(body, "runDir"),
        requiredString(body, "cardId"),
        requiredString(body, "feedback"),
        optionalString(body, "model") ?? model
      );
      sendJson(res, 200, { ok: true, rewrite: record });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const message =
      error instanceof CursorAgentError
        ? `${error.message}${error.isRetryable ? " (retryable)" : ""}`
        : error instanceof Error
          ? error.message
          : String(error);
    sendJson(res, 500, { error: message });
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  const artifactRoot = resolve(ROOT, opts.artifactRoot);
  mkdirSync(artifactRoot, { recursive: true });
  const server = createServer((req, res) => {
    void handleRequest(req, res, artifactRoot, opts.model);
  });
  server.on("error", (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });

  server.listen(opts.port, () => {
    const url = `http://localhost:${opts.port}`;
    console.log(`Agent flashcard review workbench: ${url}`);
    console.log(`Scanning: ${artifactRoot}`);
    console.log("Press Ctrl+C to stop.");
    if (opts.open) openBrowser(url);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
