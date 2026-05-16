// Topic-level subject deck: chip-level digital design.
// Cards live in `content/chips-cards.md`; this file is a thin
// adapter that parses that markdown at build time.
import { parseEpisodeMd } from "./parse-md";

export const chips = parseEpisodeMd("content/chips-cards.md");
