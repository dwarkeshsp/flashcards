import Link from "next/link";
import { siteEpisodes } from "@/lib/episodes";
import { totalCardCount } from "@/lib/types";
import { ArrowIcon } from "@/components/Icons";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
        <header className="mb-14">
          <h1 className="max-w-prose text-[1.5rem] leading-snug tracking-tight text-ink sm:text-[1.75rem]">
            Flashcards for blackboard lectures of the{" "}
            <a
              href="https://www.youtube.com/@DwarkeshPatel"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-rule decoration-1 underline-offset-[4px] transition-colors hover:text-accent hover:decoration-accent"
            >
              Dwarkesh Podcast
            </a>
            .
          </h1>
        </header>

        <ul className="space-y-3">
          {siteEpisodes.map((ep) => {
            const cards = totalCardCount(ep);
            const upcoming = !ep.youtubeUrl && !ep.date;
            return (
              <li key={ep.slug}>
                <Link
                  href={`/${ep.slug}/`}
                  className="group block rounded-lg border border-rule bg-white/40 px-6 py-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-ink/25 hover:bg-white hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] sm:px-7 sm:py-7"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif text-[1.65rem] font-medium leading-tight tracking-tight text-ink transition-colors group-hover:text-accent sm:text-[1.85rem]">
                        {ep.guest}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.825rem] text-ink-faint">
                        {ep.date ? (
                          <span className="tabular-nums">{formatDate(ep.date)}</span>
                        ) : null}
                        {ep.date ? <span aria-hidden>·</span> : null}
                        <span className="tabular-nums">
                          {cards} card{cards === 1 ? "" : "s"}
                        </span>
                        {upcoming ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className="text-accent">Upcoming</span>
                          </>
                        ) : null}
                      </div>
                      <p className="mt-3 max-w-prose text-[0.975rem] leading-relaxed text-ink-muted">
                        {ep.blurb}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="mt-1.5 shrink-0 text-ink-faint transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
                    >
                      <ArrowIcon />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <Footer className="mt-20" />
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
