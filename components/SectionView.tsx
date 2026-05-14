"use client";

import { ReactNode } from "react";
import { Section } from "@/lib/types";
import { QuestionRow } from "./QuestionRow";

export function SectionView({
  section,
  openIds,
  toggle,
  episodeUrl,
  headerExtra,
}: {
  section: Section;
  openIds: Set<string>;
  toggle: (id: string) => void;
  episodeUrl?: string;
  headerExtra?: ReactNode;
}) {
  const youtubeTimestamp =
    section.timestamp && episodeUrl
      ? sectionTimestampToYouTube(section.timestamp, episodeUrl)
      : null;

  return (
    <section id={section.id} className="scroll-mt-6 pb-14">
      <div className="mb-3">
        <div className="flex items-baseline justify-between gap-3">
          {section.timestamp ? (
            youtubeTimestamp ? (
              <a
                href={youtubeTimestamp}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[0.78rem] tabular-nums text-ink-faint transition-colors hover:text-accent"
                title="Jump to this section on YouTube"
              >
                {section.timestamp}
              </a>
            ) : (
              <span className="font-mono text-[0.78rem] tabular-nums text-ink-faint">
                {section.timestamp}
              </span>
            )
          ) : (
            <span />
          )}
          {headerExtra}
        </div>
        <h2 className="mt-1 font-serif text-[1.55rem] font-medium leading-tight tracking-tight text-ink">
          {section.title}
        </h2>
      </div>

      {section.cards.length === 0 ? (
        <p className="text-[0.95rem] italic text-ink-muted">
          No flashcards for this section yet.
        </p>
      ) : (
        <ul className="border-y border-rule">
          {section.cards.map((c, i) => {
            const cardId = `${section.id}-${i}`;
            return (
              <QuestionRow
                key={cardId}
                index={i}
                q={c.q}
                a={c.a}
                open={openIds.has(cardId)}
                onToggle={() => toggle(cardId)}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

function sectionTimestampToYouTube(timestamp: string, baseUrl: string): string {
  const parts = timestamp.split(":").map((n) => parseInt(n, 10));
  let seconds = 0;
  if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}t=${seconds}`;
}
