"""Shared house-style helpers for hand-drawn Eric Jang flashcard diagrams.

Centralizing the palette + matplotlib defaults makes each per-diagram
script tiny and keeps the visual identity consistent.
"""
from matplotlib import rcParams

# Palette — matches public/images/{latency-vs-batch,cost-vs-context,
# pipeline-bubbles}.png and the existing eric-jang/{network-schematic,
# mcts-nfsp-time-direction}.png.
BG = "#fafaf7"
INK = "#1a1a1a"
BLUE = "#3a6fb0"
ORANGE = "#c46c3f"
BROWN = "#a08660"
FAINT = "#bdb6a8"
PANEL = "#f0e9d8"
BLUE_FILL = "#e9efff"
ORANGE_FILL = "#fbeee0"


def apply_house_style() -> None:
    rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Helvetica", "Arial", "DejaVu Sans"],
            "axes.spines.top": False,
            "axes.spines.right": False,
        }
    )
