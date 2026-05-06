"""
Builds public/exports/flashcards.apkg from public/exports/flashcards.json.

Run:
    python3 -m pip install --user genanki
    python3 scripts/build_anki.py

The deck uses MathJax (\(...\) and \[...\]) which Anki renders natively.
Images referenced in answers are embedded directly into the .apkg.
"""

from __future__ import annotations

import json
import os
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
DATA_FILE = EXPORTS / "flashcards.json"
OUT_FILE = EXPORTS / "flashcards.apkg"

DECK_ID = 2026042901  # Stable random-ish ID. Don't change.
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


def find_referenced_images(answer_html: str) -> list[str]:
    return re.findall(r'<img[^>]+src="([^"]+)"', answer_html)


def main() -> int:
    if not DATA_FILE.exists():
        print(
            f"Missing {DATA_FILE}. Run `npm run export-files` first.",
            file=sys.stderr,
        )
        return 1

    data = json.loads(DATA_FILE.read_text())

    model = genanki.Model(
        MODEL_ID,
        "Reiner Pope Lecture Card",
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

    deck = genanki.Deck(
        DECK_ID,
        "Reiner Pope on Dwarkesh Podcast — Practice Questions",
    )

    media: set[Path] = set()

    for sec in data["sections"]:
        section_label = f"{sec['timestamp']} — {sec['title']}"
        tag = "Reiner_Pope::" + re.sub(r"[^a-zA-Z0-9]+", "_", sec["id"])
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

    package = genanki.Package(deck)
    package.media_files = [str(p) for p in sorted(media)]
    EXPORTS.mkdir(parents=True, exist_ok=True)
    package.write_to_file(str(OUT_FILE))

    total = sum(len(s["cards"]) for s in data["sections"])
    print(f"✓ {OUT_FILE.relative_to(ROOT)}  ({total} cards, {len(media)} media files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
