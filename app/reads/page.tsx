import type { Metadata } from "next";
import Link from "next/link";
import { getAllReads } from "@/lib/reads";
import { ReadList } from "@/components/ReadList";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Reads",
  description: "Books and articles Dwarkesh is reading, with notes and highlights.",
};

export default function ReadsPage() {
  const reads = getAllReads();
  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-2xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20">
        <nav className="mb-10 text-[0.85rem]">
          <Link
            href="/"
            className="text-ink-faint transition-colors hover:text-accent"
          >
            ← Home
          </Link>
        </nav>
        <header className="mb-10">
          <h1 className="font-serif text-[1.75rem] font-medium tracking-tight text-ink">
            Reads
          </h1>
          <p className="mt-2 max-w-prose text-[0.95rem] leading-relaxed text-ink-muted">
            Books (and eventually articles) I&apos;m reading — a short note
            on each, plus my Kindle highlights.
          </p>
        </header>
        <ReadList reads={reads} />
        <Footer className="mt-20" />
      </main>
    </div>
  );
}
