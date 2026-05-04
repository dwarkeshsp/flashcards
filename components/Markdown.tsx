"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[[rehypeKatex, { strict: false, trust: true }]]}
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href} target="_blank" rel="noreferrer noopener" className="underline decoration-rule hover:decoration-accent" {...rest}>
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
