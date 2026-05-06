# Reiner Pope on Dwarkesh Podcast — Practice Questions

Static site that hosts the practice flashcards from Reiner Pope's blackboard
lecture on the Dwarkesh Podcast. Built with Next.js 14 (static export),
Tailwind, and KaTeX.

- **Watch:** https://youtu.be/xmkSf5IS-zw
- **Read:** https://www.dwarkesh.com/p/reiner-pope

## Local development

```bash
npm install
npm run dev
# http://localhost:3000
```

## Editing flashcards

All cards live in [`lib/cards.ts`](./lib/cards.ts). Each `q` and `a` is a
markdown string; `$inline$` and `$$block$$` LaTeX are rendered with KaTeX.

After edits, regenerate the export files:

```bash
npm run export-files          # writes flashcards.{md,tsv,json} + transcript.md
python3 scripts/build_anki.py # writes flashcards.apkg
```

(The Python script needs `genanki`: `python3 -m pip install --user genanki`.)

The dev server picks up `lib/cards.ts` changes via hot reload, but you must
rerun the two commands above for the downloadable exports to update.

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
| `lib/cards.ts`                      | Source of truth for all flashcards                    |
| `app/page.tsx`                      | Overview page (sidebar + sections + click-to-reveal)  |
| `components/`                       | UI building blocks                                    |
| `public/images/`                    | Diagrams used inside answers                          |
| `public/exports/flashcards.apkg`    | Anki deck (drag into Anki to import)                  |
| `public/exports/flashcards.md`      | Clean markdown of all Q&A                             |
| `public/exports/flashcards.tsv`     | Tab-separated for Anki CSV import (fallback)          |
| `public/exports/flashcards.json`    | JSON dump used by `build_anki.py`                     |
| `public/exports/transcript.md`      | Cleaned-up transcript (typos fixed)                   |
| `scripts/export-files.ts`           | Regenerates the markdown / tsv / json exports         |
| `scripts/build_anki.py`             | Regenerates the .apkg from the JSON dump              |

## Typo fixes applied vs. the original docx

- Section 2 title: `across a GPU racks` → `across GPU racks` (also fixed in transcript export)
- Section 1: `keen decreasing` → `keep decreasing`
- Section 5: question said `500M tokens/sec`; the answer's math used `50M`. Fixed question to `50M tokens/sec` (matches the 200T tokens / 100× answer).
- Section 5: normalized lowercase `x` → `×` in one equation.

## Credits

Questions written by Dwarkesh Patel. Lecture by Reiner Pope.
