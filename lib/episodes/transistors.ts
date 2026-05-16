// Topic-level subject deck: transistors.
// Cards live in `content/transistors-cards.md`; this file is a thin
// adapter that parses that markdown at build time.
import { parseEpisodeMd } from "./parse-md";

export const transistors = parseEpisodeMd("content/transistors-cards.md");
