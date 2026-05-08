# Dwarkesh Podcast Flashcards

Static site that hosts practice flashcards for technical Dwarkesh Podcast
episodes. Built with Next.js 14 static export, Tailwind, and KaTeX.

Each episode lives at `/episodes/<slug>/` and has downloadable Markdown,
JSON/TSV, transcript, and Anki exports under `public/exports/<slug>/`.

## Local development

```bash
npm install
npm run dev
# http://localhost:3000
```

## Editing flashcards

Canonical cards live in [`lib/episodes/`](./lib/episodes/). Register an episode
in [`lib/episodes/index.ts`](./lib/episodes/index.ts) to publish it on the site.
Each `q` and `a` is a markdown string; `$inline$` and `$$block$$` LaTeX are
rendered with KaTeX.

After edits, regenerate the export files:

```bash
npm run export-files  # writes public/exports/<slug>/flashcards.{md,tsv,json} + transcript.md
npm run build-anki    # writes public/exports/<slug>/flashcards.apkg
```

(The Python script needs `genanki`: `python3 -m pip install --user genanki`.)

The dev server picks up `lib/episodes/*` changes via hot reload, but you must
rerun the two commands above for the downloadable exports to update.

## Agent-assisted drafts

The offline agent pipeline drafts candidate cards without changing the canonical
episode files. It writes review artifacts under `.agent-flashcards/<slug>/<run>/`
so the first pass can be judged before anything enters `lib/episodes/*`.

1. Create a manifest JSON. See `scripts/agent-flashcards.manifest.example.json`
   or the checked-in drafts under `scripts/agent-flashcards.manifests/`.
2. Set a Cursor API key:

   ```bash
   export CURSOR_API_KEY="cursor_..."
   ```

3. Run the pipeline:

   ```bash
   npm run agent:flashcards -- --manifest scripts/agent-flashcards.manifest.example.json
   ```

The script uses one durable episode agent for transcript understanding, interest
selection, and card drafting, then fresh stateless critic calls for T0-T3 review.
The main output to inspect is `review.md`; `review.json` preserves the structured
data for later promotion tooling. Artifact shapes are documented in
`scripts/agent-flashcards.schema.json`.

For the Eric Jang demo, the checked-in manifest is:

```bash
npm run agent:flashcards -- --manifest scripts/agent-flashcards.manifests/eric-jang.json --model gpt-5.5
```

Long runs can be resumed from a partial artifact directory:

```bash
npm run agent:flashcards -- --resume-run-dir .agent-flashcards/<slug>/<run>
```

To review every generated run from one local UI:

```bash
npm run agent:review
```

This opens `http://localhost:8765` and scans all
`.agent-flashcards/**/review.json` files. The workbench shows source excerpts,
candidate cards, critic notes, and saved decisions. If `CURSOR_API_KEY` is set
and the run has an `agent.json`, the "Rewrite with feedback" action resumes the
durable episode agent, writes the rewrite under `rewrites/`, and runs a fresh
critic pass on the revised card.

After review, promote accepted / edited / rewritten cards into a draft episode
module:

```bash
npm run agent:promote -- --run-dir .agent-flashcards/<slug>/<run>
```

The promotion step writes `lib/episodes/<slug>.generated.ts` by default. Review
that file before registering it in `lib/episodes/index.ts`; pass `--register`
only when you want the script to do that registration automatically.

## Deploying

Static export goes to `out/`. Drop it on any host:

### Vercel (one click)

```bash
npx vercel deploy --prod
```

Vercel auto-detects Next.js and runs `npm run build`.

### Anywhere else (GitHub Pages, Netlify, Cloudflare Pages, S3, …)

```bash
npm run build
# upload everything in out/
```

## Files at a glance

| Path                                | What it is                                            |
| ----------------------------------- | ----------------------------------------------------- |
| `lib/episodes/`                     | Source of truth for canonical episode decks           |
| `lib/episodes/index.ts`             | Episode registry and display order                    |
| `app/page.tsx`                      | Episode index                                         |
| `app/episodes/[slug]/page.tsx`      | Episode flashcard page                                |
| `components/`                       | UI building blocks                                    |
| `public/images/`                    | Diagrams used inside answers                          |
| `public/exports/<slug>/flashcards.apkg` | Anki deck (drag into Anki to import)              |
| `public/exports/<slug>/flashcards.md`   | Clean markdown of all Q&A                         |
| `public/exports/<slug>/flashcards.tsv`  | Tab-separated for Anki CSV import fallback        |
| `public/exports/<slug>/flashcards.json` | JSON dump used by `build_anki.py`                 |
| `public/exports/<slug>/transcript.md`   | Cleaned-up transcript                             |
| `scripts/export-files.ts`           | Regenerates the markdown / tsv / json exports         |
| `scripts/build_anki.py`             | Regenerates the .apkg from the JSON dump              |

## Typo fixes applied vs. the original docx

- Section 2 title: `across a GPU racks` → `across GPU racks` (also fixed in transcript export)
- Section 1: `keen decreasing` → `keep decreasing`
- Section 5: question said `500M tokens/sec`; the answer's math used `50M`. Fixed question to `50M tokens/sec` (matches the 200T tokens / 100× answer).
- Section 5: normalized lowercase `x` → `×` in one equation.

## Current demo

The Eric Jang deck is wired into the site as a reviewable candidate deck:

- canonical module: `lib/episodes/eric-jang.ts`
- transcript: `transcripts/eric-jang.md`
- media manifest: `content/episodes/eric-jang/media.json`
- generated exports: `public/exports/eric-jang/`
- generated visuals and video snapshots: `public/images/eric-jang-*`

## Credits

Questions written by Dwarkesh Patel with Cursor-assisted drafts and review.
