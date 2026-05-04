import { Episode } from "../types";
import { davidReich } from "./david-reich";
import { reinerPope } from "./reiner-pope";

// Order here is the order shown on the landing page.
// Newest/upcoming episodes first.
export const episodes: Episode[] = [davidReich, reinerPope];

export function getEpisode(slug: string): Episode | undefined {
  return episodes.find((e) => e.slug === slug);
}
