r"""
Builds one Anki deck per episode from each
public/exports/<slug>/flashcards.json, writing to
public/exports/<slug>/flashcards.apkg.

Run:
    python3 -m pip install --user genanki
    python3 scripts/build_anki.py

Each deck uses MathJax (\(...\) and \[...\]) which Anki renders natively.
Images referenced in answers are embedded directly into the .apkg.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

try:
    import genanki
except ImportError:
    print("genanki not installed. Run:  python3 -m pip install --user genanki", file=sys.stderr)
    sys.exit(1)


ROOT = Path(__file__).resolve().parents[1]
EXPORTS = ROOT / "public" / "exports"
IMAGES_DIR = ROOT / "public" / "images"


# Shared model (card template + CSS) — one model reused across all decks.
# Bumping MODEL_ID would invalidate Anki cards already imported from prior
# versions, so keep it stable.
MODEL_ID = 2026042902

CSS = """
.card {
  font-family: "Source Serif 4", Georgia, serif;
  font-size: 18px;
  line-height: 1.5;
  color: #1a1a1a;
  background: #fafaf7;
  text-align: left;
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}
.section-tag {
  display: inline-block;
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a8a8a;
  margin-bottom: 16px;
}
.q {
  font-size: 19px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.a {
  border-left: 2px solid rgba(185, 77, 43, 0.35);
  padding-left: 14px;
  margin-top: 14px;
  color: #2a2a2a;
}
.a img {
  max-width: 100%;
  height: auto;
  border: 1px solid #e5e3dc;
  border-radius: 6px;
  margin: 10px 0;
  background: white;
}
.a code, .q code {
  font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
  font-size: 0.92em;
  background: #f0eee5;
  padding: 0.1em 0.35em;
  border-radius: 3px;
}
hr#answer { border: 0; border-top: 1px solid #e5e3dc; margin: 18px 0 12px 0; }
"""


def stable_deck_id(slug: str) -> int:
    """Deterministic deck ID derived from the episode slug. Stable across
    regenerations so re-imports update existing decks rather than creating
    duplicates."""
    digest = hashlib.sha1(slug.encode("utf-8")).hexdigest()
    # genanki wants a 31-bit-ish int; take the first 8 hex chars (32 bits)
    # then mask down to 31 bits to be safe.
    n = int(digest[:8], 16) & 0x7FFFFFFF
    # Avoid tiny ids that might collide with shared defaults.
    return max(n, 10_000_000)


def find_referenced_images(answer_html: str) -> list[str]:
    return re.findall(r'<img[^>]+src="([^"]+)"', answer_html)


def build_model() -> genanki.Model:
    return genanki.Model(
        MODEL_ID,
        "Dwarkesh Flashcard",
        fields=[
            {"name": "Section"},
            {"name": "Question"},
            {"name": "Answer"},
        ],
        templates=[
            {
                "name": "Card 1",
                "qfmt": (
                    '<div class="section-tag">{{Section}}</div>'
                    '<div class="q">{{Question}}</div>'
                ),
                "afmt": (
                    '<div class="section-tag">{{Section}}</div>'
                    '<div class="q">{{Question}}</div>'
                    '<hr id="answer">'
                    '<div class="a">{{Answer}}</div>'
                ),
            }
        ],
        css=CSS,
    )


def build_deck(data_file: Path, model: genanki.Model) -> tuple[Path, int, int]:
    data = json.loads(data_file.read_text())
    meta = data["meta"]
    slug = meta["slug"]
    deck_title = meta["title"]

    deck = genanki.Deck(stable_deck_id(slug), deck_title)

    media: set[Path] = set()
    deck_tag = re.sub(r"[^a-zA-Z0-9]+", "_", slug)

    for sec in data["sections"]:
        section_label = (
            f"{sec['timestamp']} — {sec['title']}" if sec.get("timestamp") else sec["title"]
        )
        section_tag = re.sub(r"[^a-zA-Z0-9]+", "_", sec["id"])
        tag = f"{deck_tag}::{section_tag}"
        for card in sec["cards"]:
            q_html = card["question_html"]
            a_html = card["answer_html"]
            for src in find_referenced_images(a_html):
                fname = Path(src).name
                local = IMAGES_DIR / fname
                if local.exists():
                    media.add(local)
            note = genanki.Note(
                model=model,
                fields=[section_label, q_html, a_html],
                tags=[tag],
            )
            deck.add_note(note)

    out_file = data_file.parent / "flashcards.apkg"
    package = genanki.Package(deck)
    package.media_files = [str(p) for p in sorted(media)]
    package.write_to_file(str(out_file))

    total = sum(len(s["cards"]) for s in data["sections"])
    return out_file, total, len(media)


def main() -> int:
    if not EXPORTS.exists():
        print(f"Missing {EXPORTS}. Run `npm run export-files` first.", file=sys.stderr)
        return 1

    data_files = sorted(EXPORTS.glob("*/flashcards.json"))
    if not data_files:
        print(f"No flashcards.json files under {EXPORTS}.", file=sys.stderr)
        return 1

    model = build_model()
    for data_file in data_files:
        out_file, total, nmedia = build_deck(data_file, model)
        rel = out_file.relative_to(ROOT)
        print(f"✓ {rel}  ({total} cards, {nmedia} media files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
