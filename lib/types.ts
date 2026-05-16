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

// Decks come in two flavors:
//   - "lecture": a blackboard lecture episode (has a guest, a YouTube
//     video, and usually a transcript).
//   - "subject": a topic-level deck attached to a blog post or
//     standalone investigation (no podcast video, no transcript).
export type DeckKind = "lecture" | "subject";

export type Episode = {
  // Optional discriminator. Defaults to "lecture" when omitted so all
  // existing episode files keep behaving the same.
  kind?: DeckKind;
  // URL slug: `/<slug>/`. Also used for per-episode export paths.
  slug: string;
  // Full title shown on the deck page header.
  title: string;
  // For lectures, the guest name (e.g. "Reiner Pope"). Omitted for
  // subjects, where the title carries the identity.
  guest?: string;
  // One-line blurb shown on both the deck list and the deck page.
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
  // Optional banner shown at the top of the deck page (for context such as
  // "Prepared before the episode aired").
  note?: string;
  sections: Section[];
};

export function totalCardCount(episode: Episode): number {
  return episode.sections.reduce((n, s) => n + s.cards.length, 0);
}
