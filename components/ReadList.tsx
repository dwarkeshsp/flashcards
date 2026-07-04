import Link from "next/link";
import type { Read } from "@/lib/reads";

// A clean, unboxed list of reads: italic serif title, author, and a
// right-aligned status/date. Tufte would not approve of cards.
export function ReadList({ reads }: { reads: Read[] }) {
  return (
    <ul>
      {reads.map((r) => (
        <li key={r.slug} className="border-t border-rule first:border-t-0">
          <Link
            href={`/reads/${r.slug}/`}
            className="group flex items-baseline justify-between gap-6 py-4"
          >
            <span className="min-w-0">
              <span className="font-serif text-[1.15rem] font-medium italic leading-snug text-ink transition-colors group-hover:text-accent">
                {shortTitle(r.title)}
              </span>
              {r.author ? (
                <span className="ml-2.5 whitespace-nowrap text-[0.85rem] text-ink-muted">
                  {r.author}
                </span>
              ) : null}
              {r.blurb ? (
                <span className="mt-1 block max-w-prose text-[0.9rem] leading-relaxed text-ink-muted">
                  {r.blurb}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-[0.8rem] tabular-nums text-ink-faint">
              {statusLabel(r)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Index lists show the title before the colon; the full subtitle
// belongs on the read's own page.
function shortTitle(title: string): string {
  const idx = title.indexOf(":");
  return idx > 0 ? title.slice(0, idx) : title;
}

function statusLabel(r: Read): string {
  if (r.status === "reading") return "reading";
  if (r.date) return formatDate(r.date);
  return "";
}

function formatDate(iso: string): string {
  const [y, m] = iso.split("-");
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
  const month = m ? monthNames[parseInt(m, 10) - 1] : undefined;
  return month ? `${month} ${y}` : y;
}
