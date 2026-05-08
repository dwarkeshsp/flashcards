import Link from "next/link";
import { episodes } from "@/lib/episodes";
import { totalCardCount } from "@/lib/types";
import { ArrowIcon } from "@/components/Icons";

export default function Page() {
  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-3xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
        <header className="mb-12">
          <h1 className="font-serif text-[2.25rem] font-medium leading-[1.05] tracking-tight text-ink sm:text-[2.75rem]">
            Dwarkesh Podcast Flashcards
          </h1>
          <p className="mt-4 max-w-prose text-[1.05rem] leading-relaxed text-ink-muted">
            Practice questions to help me (and my audience) retain the
            technical episodes I prep for. One deck per guest.
          </p>
        </header>

        <ul className="divide-y divide-rule border-y border-rule">
          {episodes.map((ep) => {
            const cards = totalCardCount(ep);
            const sectionCount = ep.sections.length;
            const upcoming = !ep.youtubeUrl && !ep.date;
            return (
              <li key={ep.slug}>
                <Link
                  href={`/episodes/${ep.slug}/`}
                  className="group flex items-center justify-between gap-5 py-6 transition-colors hover:bg-ink/[0.02]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      <span>{ep.guest}</span>
                      {ep.date ? (
                        <>
                          <span className="text-rule">·</span>
                          <span className="tabular-nums">{formatDate(ep.date)}</span>
                        </>
                      ) : null}
                      {upcoming ? (
                        <>
                          <span className="text-rule">·</span>
                          <span className="text-accent">Upcoming</span>
                        </>
                      ) : null}
                    </div>
                    <h2 className="mt-1.5 font-serif text-[1.45rem] font-medium leading-tight tracking-tight text-ink group-hover:text-accent sm:text-[1.6rem]">
                      {ep.title}
                    </h2>
                    <p className="mt-2 max-w-prose text-[0.975rem] leading-relaxed text-ink-muted">
                      {ep.blurb}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] tabular-nums text-ink-faint">
                      <span>{cards} cards</span>
                      <span className="text-rule">·</span>
                      <span>{sectionCount} section{sectionCount === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-ink-faint transition-colors group-hover:text-accent">
                    <ArrowIcon />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <footer className="mt-16 text-[0.8rem] text-ink-faint">
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

function formatDate(iso: string): string {
  // Handles "YYYY-MM" and "YYYY-MM-DD"
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
