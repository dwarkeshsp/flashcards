"use client";

import { useEffect, useState } from "react";
import { Section } from "@/lib/types";

export function Sidebar({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 0.5, 1],
      }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="sidebar-scroll sticky top-6 hidden max-h-[calc(100vh-3rem)] overflow-y-auto pr-4 lg:block">
      <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        Sections
      </h2>
      <ol className="space-y-1.5">
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`group block border-l-2 py-1.5 pl-3 transition-colors ${
                  active
                    ? "border-accent text-ink"
                    : "border-rule text-ink-muted hover:border-ink-faint hover:text-ink"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.7rem] tabular-nums text-ink-faint">
                    {s.cards.length > 0 ? `${s.cards.length} cards` : "transcript only"}
                  </span>
                </div>
                <div className="mt-0.5 text-[0.875rem] leading-snug">
                  {s.title}
                </div>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
