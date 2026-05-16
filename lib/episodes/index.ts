import { Episode } from "../types";
import { ericJang } from "./eric-jang";
import { davidReich } from "./david-reich";
import { reinerPope } from "./reiner-pope";
import { adaPalmer } from "./ada-palmer";
import { dylanPatel } from "./dylan-patel";
import { jacobKimmel } from "./jacob-kimmel";
import { lewisBollard } from "./lewis-bollard";
import { stephenKotkin } from "./stephen-kotkin";
import { pretraining } from "./pretraining";
import { transistors } from "./transistors";
import { chips } from "./chips";
import { vitalQuestion } from "./vital-question";
import { stalin } from "./stalin";

// Blackboard-lecture episodes (have a guest, video, transcript).
export const siteLectures: Episode[] = [ericJang, reinerPope];

// Subject decks (blog posts and side projects). Rendered as a
// separate section beneath the lectures on the home page.
export const siteSubjects: Episode[] = [
  pretraining,
  transistors,
  chips,
  vitalQuestion,
  stalin,
];

// Everything that statically renders to the public site.
export const siteEpisodes: Episode[] = [...siteLectures, ...siteSubjects];

// All known deck modules (used by export tooling and `getEpisode`).
// Hidden modules stay as canonical data but aren't on the deployed
// surface.
export const episodes: Episode[] = [
  ...siteEpisodes,
  stephenKotkin,
  lewisBollard,
  jacobKimmel,
  dylanPatel,
  adaPalmer,
  davidReich,
];

export function getEpisode(slug: string): Episode | undefined {
  return episodes.find((e) => e.slug === slug);
}

export function getSiteEpisode(slug: string): Episode | undefined {
  return siteEpisodes.find((e) => e.slug === slug);
}
