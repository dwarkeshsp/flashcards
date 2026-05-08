import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { episodes, getEpisode } from "@/lib/episodes";
import { EpisodeView } from "@/components/EpisodeView";

export function generateStaticParams() {
  return episodes.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const episode = getEpisode(params.slug);
  if (!episode) return { title: "Not found" };
  return {
    title: `${episode.title} — Flashcards`,
    description: episode.blurb,
    openGraph: {
      title: `${episode.title} — Flashcards`,
      description: episode.blurb,
      type: "website",
    },
  };
}

export default function EpisodePage({ params }: { params: { slug: string } }) {
  const episode = getEpisode(params.slug);
  if (!episode) notFound();
  return <EpisodeView episode={episode} />;
}
