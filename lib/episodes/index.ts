import { Episode } from "../types";
import { ericJang } from "./eric-jang";
import { davidReich } from "./david-reich";
import { reinerPope } from "./reiner-pope";
import { adaPalmer } from "./ada-palmer";
import { dylanPatel } from "./dylan-patel";
import { jacobKimmel } from "./jacob-kimmel";
import { lewisBollard } from "./lewis-bollard";
import { stephenKotkin } from "./stephen-kotkin";

// Order here is the order shown on the landing page.
// Newest/upcoming episodes first.
export const episodes: Episode[] = [
  ericJang,
  stephenKotkin,
  lewisBollard,
  jacobKimmel,
  dylanPatel,
  adaPalmer,
  davidReich,
  reinerPope,
];

export function getEpisode(slug: string): Episode | undefined {
  return episodes.find((e) => e.slug === slug);
}
