import { Episode } from "../types";
import { ericJang } from "./eric-jang";
import { davidReich } from "./david-reich";
import { reinerPope } from "./reiner-pope";
import { adaPalmer } from "./ada-palmer";
import { dylanPatel } from "./dylan-patel";
import { jacobKimmel } from "./jacob-kimmel";
import { lewisBollard } from "./lewis-bollard";
import { stephenKotkin } from "./stephen-kotkin";

// All known episode modules (used by export tooling and `getEpisode`).
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

// What the public site lists and statically renders. Other modules stay as
// canonical data but are intentionally hidden from the deployed surface.
export const siteEpisodes: Episode[] = [ericJang, reinerPope];

export function getEpisode(slug: string): Episode | undefined {
  return episodes.find((e) => e.slug === slug);
}

export function getSiteEpisode(slug: string): Episode | undefined {
  return siteEpisodes.find((e) => e.slug === slug);
}
