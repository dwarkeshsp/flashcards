/** Manifest describing one episode run for the agent pipeline. */
export type Manifest = {
  slug: string;
  title: string;
  guest: string;
  blurb: string;
  date?: string;
  youtubeUrl?: string;
  substackUrl?: string;
  transcriptPath: string;
  videoPath?: string;
  /** Cursor SDK model id. */
  model: string;
  /** How many cards the planner should aim for. */
  targetCards: number;
  /** Max number of card workers running in parallel. */
  concurrency: number;
  /** Critic passes per card. */
  criticPasses: number;
  /** Optional banner shown on the episode page. */
  note?: string;
};

/** One card concept emitted by the planner agent. */
export type CardConcept = {
  id: string;
  concept: string;
  sectionTitle: string;
  timestamp: string | null;
  sourceExcerpt: string;
  rationale: string;
  shape: string;
  visualHint: string;
};

/** A finished card written to disk by a worker agent. */
export type WorkerCard = {
  id: string;
  sectionTitle: string;
  timestamp: string | null;
  sourceExcerpt: string;
  q: string;
  a: string;
  visual: string | null;
  notes?: string;
};

export type Critique = {
  tier: "T0" | "T1" | "T2" | "T3";
  targeting: string;
  construction: string;
  visualVerdict: "good" | "missing" | "fix" | "remove" | "n/a";
  visualNotes: string;
  recommendation: "accept" | "polish" | "rewrite" | "reject";
  rewriteHint: string;
};

export type CardRecord = {
  concept: CardConcept;
  card: WorkerCard;
  critiques: Critique[];
  /** Path to the worker's run directory, relative to the run root. */
  cardDir: string;
  /** Final visual asset path (relative to the run root), if any. */
  visualAsset: string | null;
};
