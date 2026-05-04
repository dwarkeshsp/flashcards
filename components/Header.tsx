"use client";

import { useState } from "react";
import { episode } from "@/lib/cards";
import { CheckIcon, CopyIcon, DownloadIcon, SubstackIcon, YouTubeIcon } from "./Icons";

export function Header() {
  const [copied, setCopied] = useState<string | null>(null);

  const onCopyTranscript = async () => {
    try {
      const res = await fetch("/exports/transcript.md");
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied("transcript");
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-[2rem] font-medium leading-[1.1] tracking-tight text-ink sm:text-[2.4rem]">
            {episode.title}
          </h1>
          <p className="mt-3 max-w-prose text-[1.0125rem] leading-relaxed text-ink-muted">
            {episode.blurb}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <a
            href={episode.youtubeUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[0.875rem] font-medium text-paper transition-colors hover:bg-accent"
          >
            <YouTubeIcon />
            Watch on YouTube
          </a>
          <a
            href={episode.substackUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-paper px-3.5 py-2 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink/40 hover:bg-white"
          >
            <SubstackIcon />
            Read on Substack
          </a>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-5">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Export
          </span>
          <ExportLink href="/exports/flashcards.apkg" label="Anki deck (.apkg)" />
          <ExportLink href="/exports/flashcards.md" label="Flashcards (.md)" />
          <ExportLink href="/exports/transcript.md" label="Transcript (.md)" />
          <button
            onClick={onCopyTranscript}
            className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-muted transition-colors hover:text-ink"
            title="Copy transcript to clipboard for pasting into an LLM"
          >
            {copied === "transcript" ? <CheckIcon /> : <CopyIcon />}
            <span className="underline decoration-rule decoration-1 underline-offset-[3px] hover:decoration-accent">
              {copied === "transcript" ? "Copied" : "Copy transcript"}
            </span>
          </button>
        </div>

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
