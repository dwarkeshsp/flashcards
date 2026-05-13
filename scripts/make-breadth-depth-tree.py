"""Q5 — How two heads carve up the 361^300 search space.

Three panels left to right:
  1. The naive game tree: bushy / deep.
  2. Policy prunes breadth: keeps a thin band of candidate moves.
  3. Value prunes depth: truncates rollouts at internal nodes.

Final caption: ~ a few thousand-node MCTS tree per move.
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch

apply_house_style()

fig, axes = plt.subplots(1, 3, figsize=(13.5, 5.5), dpi=140)
fig.patch.set_facecolor(BG)


def draw_tree(ax, *, prune_breadth: bool, prune_depth: bool, panel_title: str):
    ax.set_facecolor(BG)
    ax.set_xlim(-1, 1)
    ax.set_ylim(-0.05, 1.1)
    ax.set_aspect("auto")
    ax.axis("off")

    # Root at top, expand downward; each level fans out.
    levels = 6 if not prune_depth else 3
    branching = 7
    spread = 0.95

    # Recursive draw.
    def draw_subtree(x, y, level, x_half_width, kept_fraction=1.0):
        if level >= levels:
            return
        child_y = y - (1.0 / 6.0)
        # When pruning breadth, only keep the central kept_fraction of children.
        n = branching
        if prune_breadth and level >= 0:
            n_keep = max(2, int(round(n * kept_fraction)))
            indices = range((n - n_keep) // 2, (n - n_keep) // 2 + n_keep)
        else:
            indices = range(n)

        for k in range(n):
            t = (k + 0.5) / n
            cx = x + (t - 0.5) * 2 * x_half_width
            edge_color = INK if k in indices else FAINT
            edge_alpha = 0.9 if k in indices else 0.15
            ax.plot(
                [x, cx],
                [y, child_y],
                color=edge_color,
                alpha=edge_alpha,
                lw=0.6 if k not in indices else 0.9,
            )
            if k in indices:
                next_half = x_half_width / branching * 0.9
                next_kept = (
                    max(0.35, kept_fraction * 0.6) if prune_breadth else 1.0
                )
                draw_subtree(cx, child_y, level + 1, next_half, next_kept)

    draw_subtree(0, 1.0, 0, spread, kept_fraction=0.55 if prune_breadth else 1.0)

    # If pruning depth, draw a horizontal value-cut line and label it.
    if prune_depth:
        cut_y = 1.0 - (1.0 / 6.0) * levels
        ax.plot(
            [-spread, spread],
            [cut_y, cut_y],
            linestyle="--",
            color=ORANGE,
            lw=1.2,
        )
        ax.text(
            spread,
            cut_y - 0.04,
            "$V_\\theta(s)$  truncates",
            ha="right",
            va="top",
            color=ORANGE,
            fontsize=10,
            style="italic",
        )

    # If pruning breadth, draw a soft cone showing the kept band.
    if prune_breadth:
        cone = patches.Polygon(
            [
                (-0.2, 1.0),
                (0.2, 1.0),
                (spread * 0.55, -0.05),
                (-spread * 0.55, -0.05),
            ],
            closed=True,
            facecolor=BLUE,
            alpha=0.07,
            edgecolor="none",
        )
        ax.add_patch(cone)
        ax.text(
            -spread * 0.55,
            -0.02,
            "$P(a\\mid s)$  guides",
            ha="left",
            va="bottom",
            color=BLUE,
            fontsize=10,
            style="italic",
        )

    ax.set_title(panel_title, color=INK, fontsize=12, pad=10)


draw_tree(
    axes[0],
    prune_breadth=False,
    prune_depth=False,
    panel_title="naive tree  $\\sim 361^{300}$",
)
draw_tree(
    axes[1],
    prune_breadth=True,
    prune_depth=False,
    panel_title="policy prunes breadth",
)
draw_tree(
    axes[2],
    prune_breadth=True,
    prune_depth=True,
    panel_title="value prunes depth  $\\rightarrow$  sparse MCTS tree",
)

fig.suptitle(
    "Two heads, two cuts: from $361^{300}$ to a few thousand nodes per move",
    y=1.02,
    fontsize=13,
    color=INK,
)

out = Path("public/images/eric-jang/breadth-depth-tree.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
