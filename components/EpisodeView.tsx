"use client";

import { useState } from "react";
import { Episode } from "@/lib/types";
import { EpisodeHeader } from "./EpisodeHeader";
import { SectionView } from "./SectionView";
import { Sidebar } from "./Sidebar";

export function EpisodeView({ episode }: { episode: Episode }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sectionAllOpen = (sectionId: string, count: number): boolean => {
    if (count === 0) return false;
    for (let i = 0; i < count; i++) {
      if (!openIds.has(`${sectionId}-${i}`)) return false;
    }
    return true;
  };

  const toggleSection = (sectionId: string, count: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      const allOpen = sectionAllOpen(sectionId, count);
      for (let i = 0; i < count; i++) {
        const id = `${sectionId}-${i}`;
        if (allOpen) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-paper">
      <EpisodeHeader episode={episode} />
      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <Sidebar sections={episode.sections} />
          <div className="min-w-0">
            {episode.sections.map((s) => {
              const count = s.cards.length;
              const allOpen = sectionAllOpen(s.id, count);
              return (
                <SectionView
                  key={s.id}
                  section={s}
                  openIds={openIds}
                  toggle={toggle}
                  episodeUrl={episode.youtubeUrl}
                  headerExtra={
                    count > 0 ? (
                      <button
                        onClick={() => toggleSection(s.id, count)}
                        className="text-[0.78rem] text-ink-faint underline decoration-rule decoration-1 underline-offset-[3px] transition-colors hover:text-ink hover:decoration-accent"
                      >
                        {allOpen ? "Collapse all" : "Expand all"}
                      </button>
                    ) : null
                  }
                />
              );
            })}
          </div>
        </div>
        <footer className="border-t border-rule py-10 text-center text-[0.78rem] text-ink-faint">
          <p>
            Made by{" "}
            <a
              href="https://www.dwarkesh.com"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-rule hover:decoration-accent"
            >
              Dwarkesh Patel
            </a>{" "}
            with{" "}
            <a
              href="https://cursor.com"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-rule hover:decoration-accent"
            >
              Cursor
            </a>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}
