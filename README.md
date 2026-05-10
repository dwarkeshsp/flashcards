# Dwarkesh Podcast Flashcards

Static site that hosts practice flashcards for technical Dwarkesh Podcast
episodes. Cards are generated end-to-end by a Cursor SDK agent pipeline
that fans out one Opus 4.7 worker per card, with web search and matplotlib
visual tooling. Built with Next.js 14 static export, Tailwind, and KaTeX.

Each episode lives at `/episodes/<slug>/` with its own Markdown, JSON/TSV,
transcript, and Anki exports under `public/exports/<slug>/`.

## Local development

```bash
npm install
npm run dev    # http://localhost:3000
```

## The agent pipeline

The pipeline is in `scripts/pipeline/`. It is the thing you run when an
episode airs — it produces a card deck plus per-card visuals, no human
authoring required.

### Architecture

```
manifest.json                                        ┌────────────────────┐
   │                                                 │   open-websearch   │
   ▼                                                 │   MCP server       │
┌──────────────┐  10 concepts   ┌─────────────────┐  │ (no API key)       │
│   planner    │ ─────────────▶ │ N card workers  │ ◀┘
│ Opus 4.7     │   plan.json     │ Opus 4.7 each   │
│ + websearch  │                 │ + websearch     │
└──────────────┘                 │ + Python venv   │
                                 │ + ffmpeg        │
                                 └────────┬────────┘
                                          │ writes card.json
                                          │ + visual.png
                                          ▼
                                 ┌─────────────────┐
                                 │   fresh critic  │   T0/T1/T2/T3 grade
                                 │   Opus 4.7      │   per Memory Machines
                                 └────────┬────────┘
                                          │ if rewrite/polish
                                          ▼
                                 ┌─────────────────┐
                                 │   writer revise │
                                 │ (durable agent) │
                                 └────────┬────────┘
                                          ▼
                              promote → lib/episodes/<slug>.ts
                                          + public/images/<slug>/
                                          + public/exports/<slug>/
```

Concretely:

- **Planner** (`scripts/pipeline/run.ts::planConcepts`): one Opus 4.7
  agent reads the full transcript and proposes ~10 card concepts as
  JSON. Survives a Memory Machines / Andy Matuschak rubric: focused,
  precise, consistent, tractable, effortful, source-anchored, T2/T3.
- **Card worker** (`runCardWorker`): one durable Opus 4.7 agent per
  card, running in parallel with bounded concurrency (default 4). Each
  worker has filesystem access, shell, ffmpeg, the matplotlib venv at
  `.agent-venv/bin/python3`, and the `open-websearch` MCP server for
  fact-checking. It reads `scripts/pipeline/visual-guide.md`, writes
  `card.json` plus an optional reconstructed `visual.png`, and saves
  `make_visual.py` so the image is reproducible.
- **Critic** (`criticPass`): a fresh stateless Opus 4.7 call per pass,
  with no shared context with the writer. Grades T0–T3, may suggest a
  rewrite. Same MCP servers available so it can verify factual claims.
- **Reviser**: the durable writer agent gets the critique back and
  decides whether to update its files. Workers are encouraged to push
  back on weak criticism in `notes` rather than blindly defer.
- **Promotion** (`promote`): assembles `lib/episodes/<slug>.ts` from the
  records, copies visuals into `public/images/<slug>/`, and registers
  the episode in `lib/episodes/generated.ts`.

### Run it

Set `CURSOR_API_KEY` (and ensure Node 18+ is installed). The pipeline
expects the project Python venv at `.agent-venv/` with matplotlib
installed:

```bash
python3 -m venv .agent-venv
.agent-venv/bin/pip install matplotlib pillow
```

Then:

```bash
npm run pipeline -- --manifest scripts/pipeline-manifests/eric-jang.json
```

Each run writes everything to
`.agent-flashcards/<slug>/<timestamp>/`:

- `plan.json` — planner output
- `cards/<id>/card.json` — final card
- `cards/<id>/visual.png` — generated visual (if any)
- `cards/<id>/make_visual.py` — script that produced the visual
- `cards/<id>/critique-1.json` — fresh critic verdict
- `cards/<id>/raw-*.txt` — raw agent transcripts for debugging
- `cards/<id>/record.json` — combined record promoted into the deck

`--max-cards N` caps how many concepts the workers run; `--resume-run-dir
<path>` reuses an existing run directory.

After the pipeline finishes, regenerate the static exports:

```bash
npm run export-files   # public/exports/<slug>/flashcards.{md,tsv,json}
npm run build-anki     # public/exports/<slug>/flashcards.apkg
```

`build-anki` looks for image media in `public/images/<slug>/` first,
then `public/images/`, so per-episode generated visuals get embedded
into the .apkg automatically.

### Manifest format

```jsonc
{
  "slug": "eric-jang",
  "title": "Eric Jang on AlphaGo and AlphaZero",
  "guest": "Eric Jang",
  "blurb": "...",
  "date": "2026-05-08",
  "transcriptPath": "transcripts/eric-jang.md",
  "videoPath": "Eric Jang 5-7.mp4",
  "model": "claude-opus-4-7",
  "targetCards": 10,
  "concurrency": 4,
  "criticPasses": 1,
  "note": "Banner shown on the episode page."
}
```

### Visual style

`scripts/pipeline/visual-guide.md` is the contract every worker reads
before drawing. Visuals must match the house style established by
`public/images/{latency-vs-batch.png, cost-vs-context.png,
pipeline-bubbles.png}`: off-cream `#fafaf7` background, blue/orange/brown
accents, sans-serif labels, axis arrows, slightly hand-drawn feel.
Workers are explicitly forbidden from saving raw video screenshots as
the card visual — they must reconstruct the diagram.

### Manual editing

Built-in episodes live in `lib/episodes/` and are imported directly.
Pipeline-generated episodes are written into per-episode files
(`lib/episodes/<slug>.ts`) and then registered via
`lib/episodes/generated.ts`. To hand-tune a generated card, edit the
generated file directly; the pipeline will overwrite it on the next
run.

## Directory layout

| Path | What it is |
| --- | --- |
| `lib/episodes/` | Source of truth for canonical episode decks |
| `lib/episodes/index.ts` | Episode registry and display order |
| `lib/episodes/generated.ts` | Auto-written list of pipeline-generated episodes |
| `app/page.tsx` | Episode index |
| `app/episodes/[slug]/page.tsx` | Episode flashcard page |
| `components/` | UI building blocks |
| `public/images/` | Diagrams used inside answers |
| `public/images/<slug>/` | Per-episode generated diagrams |
| `public/exports/<slug>/` | Generated `.apkg`, `.md`, `.tsv`, `.json`, `transcript.md` |
| `scripts/pipeline/` | Cursor SDK agent pipeline |
| `scripts/pipeline-manifests/` | Per-episode manifests |
| `scripts/export-files.ts` | Regenerates the markdown / tsv / json exports |
| `scripts/build_anki.py` | Regenerates the .apkg from the JSON dump |
| `.agent-flashcards/` | Per-run artifact directory (gitignored) |

## Deploying

Static export goes to `out/`. `npx vercel deploy --prod` or upload `out/`
to any static host.

## Credits

Site by Dwarkesh Patel. Cards on this site are generated by Cursor SDK
agents (Opus 4.7) with the Memory Machines / Andy Matuschak rubric, then
spot-edited as needed.
