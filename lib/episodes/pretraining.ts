// Topic-level subject deck: pretraining parallelisms and failed runs.
// Cards live in `content/pretraining-cards.md`; this file is a thin
// adapter that parses that markdown at build time.
import { parseEpisodeMd } from "./parse-md";

export const pretraining = parseEpisodeMd("content/pretraining-cards.md");
