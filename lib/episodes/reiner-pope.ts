// Episode object for Reiner Pope's blackboard lecture.
//
// Cards live in `content/reiner-pope-cards.md` — this file is a thin
// adapter that parses that markdown at build time. The website and
// per-episode exports (markdown, tsv, json, and downstream Anki
// .apkg) all flow from that one source.
//
// Reiner's episode is the one place we set `transcriptFixes`, which
// isn't representable in the markdown frontmatter cleanly; the
// parser handles everything else and we layer the fixes on here.
import type { Episode } from "../types";
import { parseEpisodeMd } from "./parse-md";

const base = parseEpisodeMd("content/reiner-pope-cards.md");

export const reinerPope: Episode = {
  ...base,
  // Typo fixes applied to the transcript export only:
  //   - "across a GPU racks" -> "across GPU racks"
  transcriptFixes: [
    {
      from: "How MoE models are laid out across a GPU racks",
      to: "How MoE models are laid out across GPU racks",
    },
  ],
};
