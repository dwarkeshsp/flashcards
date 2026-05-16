// Topic-level subject deck: notes on Kotkin's two volumes on Stalin.
// Cards live in `content/stalin-cards.md`; this file is a thin
// adapter that parses that markdown at build time.
//
// Note: distinct from `stephen-kotkin.ts`, which holds (hidden)
// practice questions for the eventual podcast episode.
import { parseEpisodeMd } from "./parse-md";

export const stalin = parseEpisodeMd("content/stalin-cards.md");
