// Episode object for Eric Jang's blackboard lecture on AlphaGo.
//
// The cards themselves live in `content/eric-jang-cards.md` — this
// file is just a thin adapter that parses that markdown at build
// time. To edit cards, edit the markdown; the website and the
// per-episode exports (and the Anki deck downstream of those) all
// flow from a single source.
import { parseEpisodeMd } from "./parse-md";

export const ericJang = parseEpisodeMd("content/eric-jang-cards.md");
