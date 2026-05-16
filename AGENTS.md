# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 14 static-export site** (Dwarkesh Podcast Flashcards). No database, Docker, or external services are required for development.

### Running the dev server

```bash
npm run dev    # http://localhost:3000
```

The dev server hot-reloads on file changes. If port 3000 is occupied, Next.js auto-increments to 3001, 3002, etc.

### Type checking and build

- `npx tsc --noEmit` — TypeScript type check (no dedicated lint script in package.json)
- `npm run build` — full static production build (generates `out/`)

There is no ESLint or Prettier configured in this repo. TypeScript (`tsc --noEmit`) is the primary correctness check.

### Key paths

- `lib/episodes/` — episode data (source of truth)
- `content/*-cards.md` — hand-curated episodes in Markdown format
- `app/[slug]/page.tsx` — per-episode flashcard page
- `components/` — shared UI components
- `scripts/pipeline/` — agent pipeline (requires `CURSOR_API_KEY`, not needed for site dev)

### Optional: Anki deck / export generation

Requires Python 3 with `genanki` installed:

```bash
python3 -m pip install --user genanki
npm run build-cards
```

### Notes

- The `@cursor/sdk` dependency is only used by the pipeline (`scripts/pipeline/`); the website itself does not import it at runtime.
- No `.env` file is needed for standard development. `CURSOR_API_KEY` is only needed if running the agent pipeline.
