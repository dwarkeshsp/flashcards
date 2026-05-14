"""Q7 — Three steps of an MCTS simulation.

Three small panels of the SAME toy tree, with the only difference being
what's highlighted:
  1. Descend  — an orange path from root to a leaf.
  2. Expand   — that leaf gains 2 new children (drawn in blue) plus a small
                dot/arrow representing the one network call.
  3. Back up  — blue arrows go UP along the same path.

No formula text, no callout boxes, no per-edge update annotations. The
card text already says what each step does.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch

apply_house_style()

fig, axes = plt.subplots(1, 3, figsize=(12, 4.6), dpi=140)
fig.patch.set_facecolor(BG)

# Same skeleton tree for all three panels.
LAYOUT = {
    "r": (0.50, 0.90),
    "a": (0.22, 0.62),
    "b": (0.50, 0.62),
    "c": (0.78, 0.62),
    "a1": (0.10, 0.34),
    "a2": (0.30, 0.34),
    "b1": (0.50, 0.34),  # the descent leaf
    "c1": (0.66, 0.34),
    "c2": (0.86, 0.34),
}
EDGES = [
    ("r", "a"), ("r", "b"), ("r", "c"),
    ("a", "a1"), ("a", "a2"),
    ("b", "b1"),
    ("c", "c1"), ("c", "c2"),
]
PATH = [("r", "b"), ("b", "b1")]


def draw_tree(ax, *, expand=False, backup=False, step_label):
    ax.set_facecolor(BG)
    ax.set_xlim(0, 1)
    ax.set_ylim(0.02, 1.0)
    ax.axis("off")

    highlight = set(PATH)
    # edges
    for a, b in EDGES:
        x1, y1 = LAYOUT[a]
        x2, y2 = LAYOUT[b]
        color = ORANGE if (a, b) in highlight else FAINT
        lw = 1.8 if (a, b) in highlight else 0.9
        ax.plot([x1, x2], [y1, y2], color=color, lw=lw, zorder=1)
    # nodes
    for name, (x, y) in LAYOUT.items():
        ax.add_patch(
            patches.Circle((x, y), 0.035,
                            facecolor=BG, edgecolor=INK, lw=1.0, zorder=2)
        )

    # Expansion: add 2 children below the descent leaf in blue.
    if expand:
        lx, ly = LAYOUT["b1"]
        for dx in (-0.07, 0.07):
            cx, cy = lx + dx, ly - 0.10
            ax.plot([lx, cx], [ly, cy], color=BLUE, lw=1.4, zorder=1)
            ax.add_patch(
                patches.Circle((cx, cy), 0.022,
                                facecolor=BG, edgecolor=BLUE, lw=1.2, zorder=2)
            )

    # Back-up: blue arrows along the path going UP.
    if backup:
        for a, b in PATH:
            x1, y1 = LAYOUT[a]
            x2, y2 = LAYOUT[b]
            ax.add_patch(
                FancyArrowPatch(
                    (x2 - 0.025, y2 + 0.025), (x1 - 0.025, y1 - 0.025),
                    arrowstyle="->", color=BLUE, lw=1.8,
                    mutation_scale=14,
                    connectionstyle="arc3,rad=0.25",
                )
            )

    # Step number + label below the panel.
    ax.text(0.5, 0.06, step_label, ha="center", va="center",
            fontsize=12, color=INK)


draw_tree(axes[0], step_label="1.  descend")
draw_tree(axes[1], expand=True, step_label="2.  expand")
draw_tree(axes[2], backup=True, step_label="3.  back up")

out = Path("public/images/eric-jang/mcts-three-steps.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
