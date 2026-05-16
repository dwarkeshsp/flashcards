// Topic-level subject deck: notes on Nick Lane's The Vital Question.
// Cards live in `content/vital-question-cards.md`; this file is a
// thin adapter that parses that markdown at build time.
import { parseEpisodeMd } from "./parse-md";

export const vitalQuestion = parseEpisodeMd("content/vital-question-cards.md");
