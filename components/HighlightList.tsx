import type { Highlight } from "@/lib/reads";

// Kindle highlights rendered Tufte-style: the highlight text sits in
// the main column; the reader's own note on it sits in the right
// margin on wide screens, and tucks under the quote on small ones.
export function HighlightList({ highlights }: { highlights: Highlight[] }) {
  const chapters = groupByChapter(highlights);
  return (
    <div>
      {chapters.map((group, gi) => (
        <section key={group.chapter ?? `group-${gi}`}>
          {group.chapter ? (
            <h3 className="mt-10 mb-1 max-w-2xl font-serif text-[1.05rem] font-medium italic text-ink">
              {group.chapter}
            </h3>
          ) : null}
          <ol>
            {group.highlights.map((h, i) => (
              <li
                key={h.id ?? `${gi}-${i}`}
                className="border-t border-rule py-6 first:border-t-0 lg:grid lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-x-12"
              >
                <blockquote className="max-w-2xl">
                  <p className="font-serif text-[1.0625rem] leading-[1.65] text-ink/90">
                    {h.text}
                  </p>
                  {locationLabel(h) ? (
                    <footer className="mt-2 text-[0.75rem] tracking-wide text-ink-faint">
                      {locationLabel(h)}
                    </footer>
                  ) : null}
                </blockquote>
                {h.note ? (
                  <aside className="mt-3 border-l-2 border-accent/40 pl-4 lg:mt-1 lg:max-w-[17rem] lg:border-l-0 lg:pl-0">
                    <p className="font-serif text-[0.9rem] italic leading-relaxed text-ink-muted">
                      {h.note}
                    </p>
                  </aside>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function locationLabel(h: Highlight): string | null {
  if (h.location == null) return null;
  if (h.locationType === "page") return `p. ${h.location}`;
  if (h.locationType === "location") return `loc. ${h.location}`;
  return null;
}

function groupByChapter(
  highlights: Highlight[]
): Array<{ chapter?: string; highlights: Highlight[] }> {
  const groups: Array<{ chapter?: string; highlights: Highlight[] }> = [];
  for (const h of highlights) {
    const last = groups[groups.length - 1];
    if (last && last.chapter === h.chapter) {
      last.highlights.push(h);
    } else {
      groups.push({ chapter: h.chapter, highlights: [h] });
    }
  }
  return groups;
}
