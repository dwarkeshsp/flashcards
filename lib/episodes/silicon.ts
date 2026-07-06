// Topic-level subject deck: silicon, end to end — transistor physics,
// chip-level digital design, and fabrication. Combines the former
// Transistors and Chips decks plus fabrication cards.
// Cards live in `content/silicon-cards.md`; this file is a thin
// adapter that parses that markdown at build time.
import { parseEpisodeMd } from "./parse-md";

export const silicon = parseEpisodeMd("content/silicon-cards.md");
