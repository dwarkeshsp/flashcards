import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllReads, getRead, Read } from "@/lib/reads";
import { Markdown } from "@/components/Markdown";
import { HighlightList } from "@/components/HighlightList";
import { Footer } from "@/components/Footer";

export function generateStaticParams() {
  return getAllReads().map((r) => ({ slug: r.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const read = getRead(params.slug);
  if (!read) return { title: "Not found" };
  const title = read.author ? `${read.title} — ${read.author}` : read.title;
  return {
    title,
    description: read.blurb ?? `Notes on ${read.title}.`,
    openGraph: {
      title,
      description: read.blurb ?? `Notes on ${read.title}.`,
      type: "article",
    },
  };
}

export default function ReadPage({ params }: { params: { slug: string } }) {
  const read = getRead(params.slug);
  if (!read) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-2xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20 lg:max-w-5xl">
        <nav className="mb-10 max-w-2xl text-[0.85rem]">
          <Link
            href="/"
            className="text-ink-faint transition-colors hover:text-accent"
          >
            ← Home
          </Link>
        </nav>

        <header className="max-w-2xl">
          <h1 className="font-serif text-[2rem] font-medium italic leading-tight tracking-tight text-ink sm:text-[2.35rem]">
            {read.title}
          </h1>
          <p className="mt-3 text-[0.9rem] text-ink-muted">
            {read.author}
            {read.year ? (
              <span className="text-ink-faint"> · {read.year}</span>
            ) : null}
          </p>
          <p className="mt-1 text-[0.85rem] text-ink-faint">
            {statusLine(read)}
          </p>
          {read.sourceUrl ? (
            <p className="mt-1 text-[0.85rem]">
              <a
                href={read.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink-faint underline decoration-rule decoration-1 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent"
              >
                Original
              </a>
            </p>
          ) : null}
        </header>

        {read.note ? (
          <div className="answer-prose mt-10 max-w-2xl">
            <Markdown>{read.note}</Markdown>
          </div>
        ) : (
          <p className="mt-10 max-w-2xl font-serif text-[1.0625rem] italic text-ink-faint">
            Notes coming soon.
          </p>
        )}

        {read.highlights.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-2 max-w-2xl border-b border-rule pb-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Highlights
              <span className="ml-2 font-normal normal-case tracking-normal">
                {read.highlights.length}
              </span>
            </h2>
            <HighlightList highlights={read.highlights} />
          </section>
        ) : null}

        <Footer className="mt-20 max-w-2xl" />
      </main>
    </div>
  );
}

function statusLine(read: Read): string {
  if (read.status === "reading") return "Currently reading";
  if (read.date) return `Read ${formatDate(read.date)}`;
  return "Read";
}

function formatDate(iso: string): string {
  const [y, m] = iso.split("-");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = m ? monthNames[parseInt(m, 10) - 1] : undefined;
  return month ? `${month} ${y}` : y;
}
