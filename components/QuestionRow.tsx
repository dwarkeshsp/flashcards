"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronIcon } from "./Icons";
import { Markdown } from "./Markdown";

export function QuestionRow({
  index,
  q,
  a,
  open,
  onToggle,
}: {
  index: number;
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(open ? "auto" : 0);

  useEffect(() => {
    const el = answerRef.current;
    if (!el) return;
    if (open) {
      setHeight(el.scrollHeight);
      const t = setTimeout(() => setHeight("auto"), 220);
      return () => clearTimeout(t);
    } else {
      if (height === "auto") setHeight(el.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <li className="group border-b border-rule last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 py-3.5 text-left"
      >
        <span className="mt-1.5 text-ink-faint">
          <ChevronIcon open={open} />
        </span>
        <span className="select-none pt-0.5 text-xs font-medium text-ink-faint tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="question-prose flex-1 text-[1.0625rem] leading-snug text-ink">
          <Markdown>{q}</Markdown>
        </span>
      </button>
      <div
        style={{ height: typeof height === "number" ? `${height}px` : height }}
        className="overflow-hidden transition-[height] duration-200 ease-out"
      >
        <div ref={answerRef} className="pb-5 pl-[2.4rem] pr-2">
          <div className="border-l-2 border-accent/30 pl-4">
            <Markdown className="answer-prose">{a}</Markdown>
          </div>
        </div>
      </div>
    </li>
  );
}
