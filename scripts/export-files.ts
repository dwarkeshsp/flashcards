/**
 * Generates static export files served from /public/exports/<slug>/:
 *   - flashcards.md      Clean markdown of all Q&A
 *   - flashcards.tsv     Two-column Q/A TSV for Anki import (fallback)
 *   - flashcards.json    JSON dump for the Python apkg builder
 *   - transcript.md      Cleaned-up transcript with typo fixes
 *
 * Run via:  npm run export-files
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { episodes } from "../lib/episodes";
import { Episode, totalCardCount } from "../lib/types";

const ROOT = process.cwd();
const EXPORTS_ROOT = join(ROOT, "public", "exports");

function buildFlashcardsMd(ep: Episode): string {
  const lines: string[] = [];
  lines.push(`# ${ep.title}`);
  lines.push("");
  if (ep.youtubeUrl) lines.push(`- YouTube: ${ep.youtubeUrl}`);
  if (ep.substackUrl) lines.push(`- Substack: ${ep.substackUrl}`);
  lines.push(`- Total cards: ${totalCardCount(ep)}`);
  lines.push("");
  lines.push(ep.blurb);
  lines.push("");
  if (ep.note) {
    lines.push(`> ${ep.note}`);
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  for (const s of ep.sections) {
    const header = s.timestamp ? `## (${s.timestamp}) — ${s.title}` : `## ${s.title}`;
    lines.push(header);
    lines.push("");
    if (s.cards.length === 0) {
      lines.push("_No flashcards for this section yet._");
      lines.push("");
      continue;
    }
    s.cards.forEach((c, i) => {
      lines.push(`### Q${i + 1}. ${c.q}`);
      lines.push("");
      lines.push(c.a);
      lines.push("");
    });
  }
  return lines.join("\n");
}

function escapeAnkiField(s: string): string {
  // For Anki CSV/TSV import: HTML allowed; convert markdown lightly and preserve LaTeX.
  // LaTeX is kept as MathJax-style \( \) and \[ \].
  return s.replace(/\t/g, " ").replace(/\r?\n/g, "<br>").replace(/"/g, '""');
}

// Symbols that map cleanly to a single Unicode glyph (TeX command name
// without the leading backslash → replacement).
const TEX_SYMBOLS: Record<string, string> = {
  approx: "≈", sim: "~", cdot: "·", times: "×", div: "÷", pm: "±", mp: "∓",
  geq: "≥", ge: "≥", leq: "≤", le: "≤", ll: "≪", gg: "≫", neq: "≠", ne: "≠",
  equiv: "≡", to: "→", rightarrow: "→", leftarrow: "←", mapsto: "↦",
  Rightarrow: "⇒", propto: "∝", in: "∈", notin: "∉", subset: "⊂", mid: "|",
  cup: "∪", cap: "∩", sum: "∑", prod: "∏", int: "∫", infty: "∞",
  partial: "∂", nabla: "∇", dots: "…", ldots: "…", cdots: "…",
  pi: "π", theta: "θ", mu: "μ", sigma: "σ", Sigma: "Σ", lambda: "λ",
  Lambda: "Λ", alpha: "α", beta: "β", gamma: "γ", Gamma: "Γ", delta: "δ",
  Delta: "Δ", epsilon: "ε", phi: "φ", rho: "ρ", tau: "τ", omega: "ω",
  Omega: "Ω", top: "T",
  // escaped literals (e.g. `\{` `\}` `\%`) -> placeholders restored later
  "{": "\u0001", "}": "\u0002", "%": "%", $: "$", "&": "&", "#": "#",
  "|": "|", " ": " ",
};

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶",
  "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽",
  ")": "⁾", n: "ⁿ", i: "ⁱ",
};

function toSuper(arg: string): string {
  if (arg.length > 0 && [...arg].every((c) => SUPERSCRIPT[c])) {
    return [...arg].map((c) => SUPERSCRIPT[c]).join("");
  }
  return arg.length === 1 ? `^${arg}` : `^(${arg})`;
}

function readBraced(s: string, i: number): { body: string; end: number } {
  // s[i] must be '{'
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") depth++;
    else if (s[j] === "}") {
      depth--;
      if (depth === 0) return { body: s.slice(i + 1, j), end: j + 1 };
    }
  }
  return { body: s.slice(i + 1), end: s.length };
}

function readArg(s: string, i: number): { body: string; end: number } {
  while (s[i] === " ") i++;
  if (s[i] === "{") return readBraced(s, i);
  if (s[i] === "\\") {
    const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
    if (m) return { body: m[0], end: i + m[0].length };
  }
  return { body: s[i] ?? "", end: i + 1 };
}

// Render a TeX math string as readable plain text with Unicode glyphs.
// Used only for the exported cards (Anki/Mochi); the website keeps KaTeX.
function mathToText(tex: string): string {
  const fracLike = new Set(["frac", "dfrac", "tfrac"]);
  const stripCmds = new Set([
    "text", "mathrm", "mathcal", "mathbb", "mathbf", "mathit", "boldsymbol",
    "textbf", "textit", "operatorname",
  ]);
  const dropCmds = new Set([
    "left", "right", "bigl", "bigr", "Bigl", "Bigr", "big", "Big", "biggl",
    "biggr", "bigm", "Bigm", "displaystyle", "limits",
  ]);

  function convert(s: string): string {
    let out = "";
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === "\\") {
        const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
        if (!m) { out += ch; i++; continue; }
        const cmd = m[1];
        i += m[0].length;
        if (fracLike.has(cmd)) {
          const a = readArg(s, i); i = a.end;
          const b = readArg(s, i); i = b.end;
          const num = convert(a.body), den = convert(b.body);
          const simple = (x: string) => /^[A-Za-z0-9.]+$/.test(x);
          out += simple(num) && simple(den) ? `${num}/${den}` : `(${num})/(${den})`;
        } else if (cmd === "sqrt") {
          const a = readArg(s, i); i = a.end;
          out += `√(${convert(a.body)})`;
        } else if (cmd === "underbrace") {
          const a = readArg(s, i); i = a.end;
          let label = "";
          while (s[i] === " ") i++;
          if (s[i] === "_") { i++; const l = readArg(s, i); i = l.end; label = convert(l.body); }
          out += convert(a.body) + (label ? ` [${label}]` : "");
        } else if (stripCmds.has(cmd)) {
          const a = readArg(s, i); i = a.end;
          out += convert(a.body);
        } else if (dropCmds.has(cmd)) {
          // drop sizing/style commands, keep following delimiter char
        } else if (TEX_SYMBOLS[cmd] !== undefined) {
          out += TEX_SYMBOLS[cmd];
        } else if (cmd === "\\") {
          out += " ";
        } else if ([",", ";", ":", " "].includes(cmd)) {
          out += " ";
        } else if (cmd === "!") {
          // negative thin space -> nothing
        } else {
          // unknown command. Named operators (log, max, arg, ...) read
          // better with a leading space; everything else is kept verbatim.
          const OPERATORS = new Set([
            "max", "min", "arg", "log", "ln", "exp", "det", "sin", "cos",
            "tan", "lim", "sup", "inf", "gcd", "dim", "deg",
          ]);
          if (OPERATORS.has(cmd) && out.length && !/[\s(]$/.test(out)) out += " ";
          out += cmd;
        }
      } else if (ch === "{" || ch === "}") {
        i++; // drop grouping braces
      } else if (ch === "^") {
        i++;
        const a = readArg(s, i); i = a.end;
        out += toSuper(convert(a.body));
      } else if (ch === "_") {
        i++;
        const a = readArg(s, i); i = a.end;
        out += `_${convert(a.body)}`;
      } else {
        out += ch; i++;
      }
    }
    return out;
  }

  let t = convert(tex.replace(/~/g, " "));
  t = t.replace(/\u0001/g, "{").replace(/\u0002/g, "}");
  t = t.replace(/[ \t]{2,}/g, " ").trim();
  return t;
}

function mdToAnkiHtml(s: string): string {
  // Math renders inconsistently across apps (Anki MathJax vs Mochi KaTeX vs
  // their HTML→Markdown importer), so for the exported cards we render TeX to
  // readable Unicode plain text. The website still gets real KaTeX because it
  // reads the raw markdown source, not this export.
  //
  // Math spans are converted and stashed behind placeholders first so the
  // bold/italic/code passes below can't mangle the result.
  const math: string[] = [];
  const stash = (tex: string) => {
    math.push(mathToText(tex));
    return `\u0000MATH${math.length - 1}\u0000`;
  };
  let out = s.replace(/\$\$([\s\S]+?)\$\$/g, (_m, x) => stash(x));
  out = out.replace(/\$([^\n$]+?)\$/g, (_m, x) => stash(x));

  out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    const filename = src.split("/").pop() ?? src;
    return `<img src="${filename}" alt="${alt}">`;
  });
  out = out
    .split("\n")
    .map((l) => (/^\s*-\s+/.test(l) ? l.replace(/^\s*-\s+/, "• ") : l))
    .join("\n");
  out = out
    .split("\n")
    .map((l) => (/^\s*\d+\.\s+/.test(l) ? l.replace(/^\s*(\d+)\.\s+/, "$1. ") : l))
    .join("\n");

  out = out.replace(/\u0000MATH(\d+)\u0000/g, (_m, i) => math[Number(i)]);
  return out.trim();
}

function buildTsv(ep: Episode): string {
  const rows = ['"Question"\t"Answer"'];
  for (const s of ep.sections) {
    s.cards.forEach((c) => {
      const q = `"${escapeAnkiField(mdToAnkiHtml(c.q))}"`;
      const a = `"${escapeAnkiField(mdToAnkiHtml(c.a))}"`;
      rows.push(`${q}\t${a}`);
    });
  }
  return rows.join("\n");
}

function buildJson(ep: Episode): string {
  return JSON.stringify(
    {
      meta: {
        slug: ep.slug,
        title: ep.title,
        guest: ep.guest,
        blurb: ep.blurb,
        date: ep.date ?? null,
        youtube: ep.youtubeUrl ?? null,
        substack: ep.substackUrl ?? null,
      },
      sections: ep.sections.map((s) => ({
        id: s.id,
        timestamp: s.timestamp ?? null,
        title: s.title,
        cards: s.cards.map((c) => ({
          question_md: c.q,
          answer_md: c.a,
          question_html: mdToAnkiHtml(c.q),
          answer_html: mdToAnkiHtml(c.a),
        })),
      })),
    },
    null,
    2
  );
}

function applyTranscriptFixes(ep: Episode): string | null {
  if (!ep.transcriptPath) return null;
  const full = join(ROOT, ep.transcriptPath);
  if (!existsSync(full)) {
    console.warn(`  ⚠ transcript not found at ${ep.transcriptPath} (skipping)`);
    return null;
  }
  let text = readFileSync(full, "utf8");
  for (const { from, to } of ep.transcriptFixes ?? []) {
    text = text.split(from).join(to);
  }
  return text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n");
}

function exportEpisode(ep: Episode) {
  const out = join(EXPORTS_ROOT, ep.slug);
  mkdirSync(out, { recursive: true });
  const cards = totalCardCount(ep);
  console.log(`• ${ep.slug}  (${cards} cards, ${ep.sections.length} sections)`);

  if (cards > 0) {
    writeFileSync(join(out, "flashcards.md"), buildFlashcardsMd(ep), "utf8");
    writeFileSync(join(out, "flashcards.tsv"), buildTsv(ep), "utf8");
    writeFileSync(join(out, "flashcards.json"), buildJson(ep), "utf8");
    console.log(`    ✓ flashcards.{md,tsv,json}`);
  }

  const transcript = applyTranscriptFixes(ep);
  if (transcript) {
    writeFileSync(join(out, "transcript.md"), transcript, "utf8");
    console.log(`    ✓ transcript.md`);
  }
}

function main() {
  mkdirSync(EXPORTS_ROOT, { recursive: true });
  for (const ep of episodes) exportEpisode(ep);
}

main();
