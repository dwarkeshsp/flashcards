type FooterProps = {
  className?: string;
  variant?: "page" | "episode";
};

export function Footer({ className = "", variant = "page" }: FooterProps) {
  const base =
    variant === "episode"
      ? "border-t border-rule py-10 text-center"
      : "border-t border-rule pt-8";
  return (
    <footer className={`${base} text-[0.8rem] text-ink-faint ${className}`}>
      <p>
        Built by{" "}
        <a
          href="https://www.dwarkesh.com"
          target="_blank"
          rel="noreferrer noopener"
          className="text-ink underline decoration-rule decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent"
        >
          Dwarkesh
        </a>{" "}
        using{" "}
        <a
          href="https://cursor.com/dwarkesh"
          target="_blank"
          rel="noreferrer noopener"
          className="text-ink underline decoration-rule decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent"
        >
          Cursor
        </a>
        .
      </p>
    </footer>
  );
}
