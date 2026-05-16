"use client";

import Link from "next/link";
import { useState } from "react";
import { Episode, totalCardCount } from "@/lib/types";
import { BackIcon, CheckIcon, CopyIcon, DownloadIcon } from "./Icons";

export function EpisodeHeader({ episode }: { episode: Episode }) {
  const [copied, setCopied] = useState(false);
  const slug = episode.slug;
  const cards = totalCardCount(episode);
  const isSubject = episode.kind === "subject";
  const upcoming = !isSubject && !episode.youtubeUrl && !episode.date;
  const youtubeEmbedUrl = episode.youtubeUrl ? toYouTubeEmbed(episode.youtubeUrl) : null;

  const transcriptHref = `/exports/${slug}/transcript.md`;

  const onCopyTranscript = async () => {
    try {
      const res = await fetch(transcriptHref);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const metaItems: React.ReactNode[] = [];
  if (episode.guest) metaItems.push(<span key="guest">{episode.guest}</span>);
  if (episode.date)
    metaItems.push(
      <span key="date" className="tabular-nums">
        {formatDate(episode.date)}
      </span>,
    );
  metaItems.push(
    <span key="cards" className="tabular-nums">
      {cards} card{cards === 1 ? "" : "s"}
    </span>,
  );
  if (upcoming)
    metaItems.push(
      <span key="upcoming" className="text-accent">
        Upcoming
      </span>,
    );

  return (
    <header className="border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-5 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-7">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[0.78rem] text-ink-faint transition-colors hover:text-ink"
        >
          <BackIcon />
          <span>All flashcards</span>
        </Link>

        <div className="mt-7 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {metaItems.map((item, i) => (
            <span key={i} className="contents">
              {i > 0 ? <span className="text-rule">·</span> : null}
              {item}
            </span>
          ))}
        </div>

        <h1 className="mt-2 font-serif text-[2rem] font-medium leading-[1.1] tracking-tight text-ink sm:text-[2.4rem]">
          {episode.substackUrl ? (
            <a
              href={episode.substackUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-accent"
              title={isSubject ? "Read the post" : "Read on Substack"}
            >
              {episode.title}
            </a>
          ) : (
            episode.title
          )}
        </h1>
        <p className="mt-3 max-w-prose text-[1.0125rem] leading-relaxed text-ink-muted">
          {episode.blurb}
        </p>

        {isSubject && episode.substackUrl ? (
          <a
            href={episode.substackUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1 text-[0.875rem] text-ink-muted transition-colors hover:text-accent"
          >
            <span className="underline decoration-rule decoration-1 underline-offset-[3px] hover:decoration-accent">
              Read the post
            </span>
            <span aria-hidden>→</span>
          </a>
        ) : null}

        {youtubeEmbedUrl ? (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-md border border-rule bg-ink/5">
            <iframe
              src={youtubeEmbedUrl}
              title={`${episode.title} on YouTube`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Download
          </span>
          {cards > 0 ? (
            <>
              <ExportLink href={`/exports/${slug}/flashcards.apkg`} label="Anki deck" />
              <ExportLink href={`/exports/${slug}/flashcards.md`} label="Markdown" />
            </>
          ) : null}
          {episode.transcriptPath ? (
            <>
              <ExportLink href={transcriptHref} label="Transcript" />
              <button
                onClick={onCopyTranscript}
                className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-muted transition-colors hover:text-ink"
                title="Copy transcript to clipboard for pasting into an LLM"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                <span className="underline decoration-rule decoration-1 underline-offset-[3px] hover:decoration-accent">
                  {copied ? "Copied" : "Copy transcript"}
                </span>
              </button>
            </>
          ) : null}
        </div>

        {episode.note ? (
          <div className="mt-5 rounded-md border border-accent/20 bg-accent/[0.04] px-4 py-3 text-[0.9rem] leading-relaxed text-ink-muted">
            {episode.note}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function ExportLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-muted transition-colors hover:text-ink"
    >
      <DownloadIcon />
      <span className="underline decoration-rule decoration-1 underline-offset-[3px] hover:decoration-accent">
        {label}
      </span>
    </a>
  );
}

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0] || null;
    } else if (u.hostname.endsWith("youtube.com")) {
      id = u.searchParams.get("v");
      if (!id && u.pathname.startsWith("/embed/")) {
        id = u.pathname.slice("/embed/".length).split("/")[0] || null;
      }
    }
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function formatDate(iso: string): string {
  const parts = iso.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1] ?? "1", 10);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[month - 1]} ${year}`;
}
