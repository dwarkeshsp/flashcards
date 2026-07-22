import Link from "next/link";
import { siteEpisodes } from "@/lib/episodes";
import { Episode, totalCardCount } from "@/lib/types";
import { getAllReads } from "@/lib/reads";
import { ReadList } from "@/components/ReadList";
import { Footer } from "@/components/Footer";

export default function Page() {
  const reads = getAllReads();
  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-2xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
        <header className="mb-14">
          <h1 className="text-[1.5rem] leading-snug tracking-tight text-ink sm:text-[1.75rem]">
            Dwarkesh&apos;s notebook.
          </h1>
          <p className="mt-3 max-w-prose text-[0.95rem] leading-relaxed text-ink-muted">
            Notes and highlights from what I&apos;m reading, and flashcards
            for{" "}
            <a
              href="https://www.youtube.com/@DwarkeshPatel"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-rule decoration-1 underline-offset-[4px] transition-colors hover:text-accent hover:decoration-accent"
            >
              Dwarkesh Podcast
            </a>{" "}
            episodes.
          </p>
        </header>

        <section>
          <h2 className="mb-2 border-b border-rule pb-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            <Link href="/reads/" className="transition-colors hover:text-accent">
              Reads
            </Link>
          </h2>
          <ReadList reads={reads} />
        </section>

        <section className="mt-16">
          <h2 className="mb-2 border-b border-rule pb-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Flashcards
          </h2>
          <ul>
            {siteEpisodes.map((ep) => (
              <DeckRow key={ep.slug} ep={ep} />
            ))}
          </ul>
        </section>

        <Footer className="mt-20" />
      </main>
    </div>
  );
}

function DeckRow({ ep }: { ep: Episode }) {
  const cards = totalCardCount(ep);
  const heading = ep.guest ?? ep.title;
  return (
    <li className="border-t border-rule first:border-t-0">
      <Link
        href={`/${ep.slug}/`}
        className="group flex items-baseline justify-between gap-6 py-4"
      >
        <span className="min-w-0">
          <span className="font-serif text-[1.15rem] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
            {heading}
          </span>
          <span className="mt-1 block max-w-prose text-[0.9rem] leading-relaxed text-ink-muted">
            {ep.blurb}
          </span>
        </span>
        <span className="shrink-0 text-[0.8rem] tabular-nums text-ink-faint">
          {cards} cards
        </span>
      </Link>
    </li>
  );
}
