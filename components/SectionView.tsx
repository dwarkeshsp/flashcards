"use client";

import { ReactNode } from "react";
import { Section } from "@/lib/types";
import { QuestionRow } from "./QuestionRow";

export function SectionView({
  section,
  openIds,
  toggle,
  headerExtra,
}: {
  section: Section;
  openIds: Set<string>;
  toggle: (id: string) => void;
  episodeUrl?: string;
  headerExtra?: ReactNode;
}) {
  return (
    <section id={section.id} className="scroll-mt-6 pb-14">
      <div className="mb-3">
        <div className="flex items-baseline justify-between gap-3">
          <span />
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
