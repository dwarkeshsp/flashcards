# Dwarkesh Podcast Flashcards

Static site hosting practice flashcards I prepare for technical episodes of
the Dwarkesh Podcast. One deck per guest, with click-to-reveal online and
downloadable Anki / Markdown / transcript exports.

Built with Next.js 14 (static export), Tailwind, and KaTeX.

- Landing page: lists every episode.
- `/episodes/<slug>/`: flashcards + transcript for a single episode.

## Local development

```bash
npm install
npm run dev
# http://localhost:3000
```

## Adding a new episode

1. Drop the cleaned transcript at `transcripts/<slug>.md`.
2. Create `lib/episodes/<slug>.ts` exporting a `const <slug>: Episode`:

   ```ts
   import { Episode } from "../types";

   export const someGuest: Episode = {
     slug: "some-guest",
     title: "Some Guest on the Dwarkesh Podcast",
     guest: "Some Guest",
     blurb: "One-line description shown on the landing page + episode header.",
     date: "2026-05",                          // optional; "YYYY-MM" or "YYYY-MM-DD"
     youtubeUrl: "https://youtu.be/...",       // optional; omit for upcoming episodes
     substackUrl: "https://dwarkesh.com/...",  // optional
     transcriptPath: "transcripts/some-guest.md",
     note: "Optional banner shown above the cards.",
     sections: [
       {
         id: "some-section-id",
         timestamp: "00:00:00",                 // optional; drop for un-timestamped prep decks
         title: "Section title",
         cards: [{ q: "…", a: "…" }],
       },
     ],
   };
   ```

3. Register the episode in `lib/episodes/index.ts` (the order there is the
   order shown on the landing page).

4. Regenerate the downloadable exports:

   ```bash
   npm run export-files          # writes flashcards.{md,tsv,json} + transcript.md
   python3 scripts/build_anki.py # writes flashcards.apkg
   ```

   Outputs land in `public/exports/<slug>/`. The dev server hot-reloads edits
   to `lib/episodes/*` but the two commands above must be rerun before the
   download links see new content.

## Writing cards

Each `q` and `a` is a Markdown string.

- `$inline$` and `$$block$$` LaTeX render with KaTeX (and MathJax in Anki).
- Images in answers: `![alt](/images/file.png)`. Drop the PNG in
  `public/images/`; the Anki build picks it up automatically.
- Bold / italics / lists / inline code all work.

## Deploying

Static export goes to `out/`. Drop it on any host.

### Vercel (one click)

```bash
npx vercel deploy --prod
```

### GitHub Pages / Netlify / Cloudflare Pages / S3 / …

```bash
npm run build
# upload everything in out/
```

## Repo layout

| Path                                        | What it is                                          |
| ------------------------------------------- | --------------------------------------------------- |
| `lib/types.ts`                              | `Episode`, `Section`, `Card` types                  |
| `lib/episodes/index.ts`                     | Registry of all episodes (order = landing order)    |
| `lib/episodes/<slug>.ts`                    | Per-episode data (metadata + sections + cards)      |
| `transcripts/<slug>.md`                     | Source transcript (copied + fixed into exports)     |
| `app/page.tsx`                              | Landing page (episode list)                         |
| `app/episodes/[slug]/page.tsx`              | Per-episode page (static, prerendered)              |
| `components/EpisodeHeader.tsx`              | Episode header with title, actions, downloads       |
| `components/EpisodeView.tsx`                | Wires header + sidebar + sections + card state      |
| `components/Sidebar.tsx`                    | Sticky section nav                                  |
| `components/SectionView.tsx`                | Section header + list of `QuestionRow`s             |
| `components/QuestionRow.tsx`                | One expandable Q/A row                              |
| `components/Markdown.tsx`                   | Markdown + KaTeX renderer                           |
| `public/images/`                            | Diagrams used inside answers                        |
| `public/exports/<slug>/flashcards.apkg`     | Anki deck (import into Anki)                        |
| `public/exports/<slug>/flashcards.md`       | Clean Markdown of all Q&A                           |
| `public/exports/<slug>/flashcards.tsv`      | Tab-separated Anki fallback                         |
| `public/exports/<slug>/flashcards.json`     | JSON dump consumed by `build_anki.py`               |
| `public/exports/<slug>/transcript.md`       | Cleaned transcript with typo fixes applied          |
| `scripts/export-files.ts`                   | Regenerates md/tsv/json/transcript for all episodes |
| `scripts/build_anki.py`                     | Builds one `.apkg` per episode from JSON            |

## Credits

Questions by Dwarkesh Patel. Lectures / interviews by the guests themselves.
