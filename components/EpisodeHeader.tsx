"use client";

import Link from "next/link";
import { useState } from "react";
import { Episode, totalCardCount } from "@/lib/types";
import {
  BackIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  SubstackIcon,
  YouTubeIcon,
} from "./Icons";

export function EpisodeHeader({ episode }: { episode: Episode }) {
  const [copied, setCopied] = useState(false);
  const slug = episode.slug;
  const cards = totalCardCount(episode);
  const upcoming = !episode.youtubeUrl && !episode.date;

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

  return (
    <header className="border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-5 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-7">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[0.78rem] text-ink-faint transition-colors hover:text-ink"
        >
          <BackIcon />
          <span>All episodes</span>
        </Link>

        <div className="mt-7 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          <span>{episode.guest}</span>
          {episode.date ? (
            <>
              <span className="text-rule">·</span>
              <span className="tabular-nums">{formatDate(episode.date)}</span>
            </>
          ) : null}
          <span className="text-rule">·</span>
          <span className="tabular-nums">
            {cards} card{cards === 1 ? "" : "s"}
          </span>
          {upcoming ? (
            <>
              <span className="text-rule">·</span>
              <span className="text-accent">Upcoming</span>
            </>
          ) : null}
        </div>

        <h1 className="mt-2 font-serif text-[2rem] font-medium leading-[1.1] tracking-tight text-ink sm:text-[2.4rem]">
          {episode.title}
        </h1>
        <p className="mt-3 max-w-prose text-[1.0125rem] leading-relaxed text-ink-muted">
          {episode.blurb}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {episode.youtubeUrl ? (
            <a
              href={episode.youtubeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[0.875rem] font-medium text-paper transition-colors hover:bg-accent"
            >
              <YouTubeIcon />
              Watch on YouTube
            </a>
          ) : null}
          {episode.substackUrl ? (
            <a
              href={episode.substackUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-paper px-3.5 py-2 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink/40 hover:bg-white"
            >
              <SubstackIcon />
              Read on Substack
            </a>
          ) : null}
        </div>

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
