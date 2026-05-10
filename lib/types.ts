export type Card = {
  q: string;
  a: string;
};

export type Section = {
  id: string;
  title: string;
  // Optional "HH:MM:SS" timestamp. When present and the episode has a
  // `youtubeUrl`, the section heading links to that timestamp on YouTube.
  timestamp?: string;
  cards: Card[];
};

export type Episode = {
  // URL slug: `/episodes/<slug>/`. Also used for per-episode export paths.
  slug: string;
  // Full title shown on the episode page header, e.g.
  // "Reiner Pope on the Dwarkesh Podcast".
  title: string;
  // Guest name as it appears in the episode list, e.g. "Reiner Pope".
  guest: string;
  // One-line blurb shown on both the episode list and episode page.
  blurb: string;
  // Typically "YYYY-MM" or "YYYY-MM-DD". Undefined for not-yet-aired episodes.
  date?: string;
  youtubeUrl?: string;
  substackUrl?: string;
  // Path to the cleaned transcript within the repo (relative to repo root).
  // If set, the transcript is copied to `/public/exports/<slug>/transcript.md`.
  transcriptPath?: string;
  // Optional typo fixes applied when copying the transcript export.
  transcriptFixes?: Array<{ from: string; to: string }>;
  // Optional banner shown at the top of the episode page (for context such as
  // "Prepared before the episode aired").
  note?: string;
  sections: Section[];
};

export function totalCardCount(episode: Episode): number {
  return episode.sections.reduce((n, s) => n + s.cards.length, 0);
}
