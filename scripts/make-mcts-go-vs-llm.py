"""Q13 — Why MCTS fits Go but breaks on LLM reasoning.

Side-by-side trees:
  Left (Go):   bounded branching, value-truncated at internal nodes,
               same children revisited many times -> PUCT works.
  Right (LLM): branching factor ~100k, no learnable value horizon,
               you almost never revisit the same child token twice.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, BLUE_FILL, ORANGE_FILL, apply_house_style

import math
import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

apply_house_style()

fig, axes = plt.subplots(1, 2, figsize=(13.5, 6.0), dpi=140)
fig.patch.set_facecolor(BG)


def go_panel(ax):
    ax.set_facecolor(BG)
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-0.05, 1.15)
    ax.axis("off")
    ax.set_title(
        "Go  $\\leq 361$  legal actions",
        color=BLUE,
        fontsize=13,
        fontweight="bold",
        pad=8,
    )

    # Root + 5 children + 3 children each.
    root_xy = (0.0, 1.0)
    ax.add_patch(patches.Circle(root_xy, 0.05, facecolor="#f3eddc", edgecolor=INK, lw=1.1, zorder=3))

    n_kids = 5
    kid_y = 0.6
    kid_xs = [-0.7 + i * (1.4 / (n_kids - 1)) for i in range(n_kids)]
    for x in kid_xs:
        ax.plot([root_xy[0], x], [root_xy[1], kid_y], color=INK, lw=1.0, zorder=1)
        ax.add_patch(patches.Circle((x, kid_y), 0.04, facecolor=BG, edgecolor=INK, lw=1.0, zorder=3))

        # Grandchildren — narrower, value-truncated leaves.
        for j in range(3):
            gx = x + (j - 1) * 0.12
            gy = 0.25
            ax.plot([x, gx], [kid_y, gy], color=INK, lw=0.8, zorder=1)
            # Value-truncated leaf: a small orange square (V_theta call-out).
            ax.add_patch(
                patches.Rectangle(
                    (gx - 0.025, gy - 0.025),
                    0.05,
                    0.05,
                    facecolor=ORANGE,
                    edgecolor=ORANGE,
                    lw=0.6,
                    zorder=3,
                )
            )

    # Revisit annotation: a curved arrow showing same-child revisits.
    ax.add_patch(
        FancyArrowPatch(
            (kid_xs[2] + 0.05, kid_y + 0.04),
            (kid_xs[2] - 0.05, kid_y + 0.04),
            arrowstyle="->",
            color=BLUE,
            lw=1.3,
            mutation_scale=12,
            connectionstyle="arc3,rad=1.0",
        )
    )
    ax.text(
        kid_xs[2],
        kid_y + 0.14,
        "same child\nrevisited",
        ha="center",
        va="bottom",
        color=BLUE,
        fontsize=9.5,
        style="italic",
    )

    # Legend / observations box.
    ax.add_patch(
        FancyBboxPatch(
            (-1.1, -0.02),
            2.2,
            0.18,
            boxstyle="round,pad=0.01,rounding_size=0.02",
            facecolor=BLUE_FILL,
            edgecolor=BLUE,
            lw=1.0,
        )
    )
    ax.text(
        0,
        0.13,
        "PUCT works: bounded breadth + $V_\\theta$ truncates depth",
        ha="center",
        va="center",
        color=BLUE,
        fontsize=10.5,
        fontweight="bold",
    )
    ax.text(
        0,
        0.03,
        "$N(s,a)$ accumulates per child  $\\to$  $\\sqrt{N}/(1+N_a)$ discriminates",
        ha="center",
        va="center",
        color=INK,
        fontsize=9.5,
    )


def llm_panel(ax):
    ax.set_facecolor(BG)
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-0.05, 1.15)
    ax.axis("off")
    ax.set_title(
        "LLM reasoning  $\\sim 100{,}000$  next tokens",
        color=ORANGE,
        fontsize=13,
        fontweight="bold",
        pad=8,
    )

    # Root + many many children — visually overflow horizontally.
    root_xy = (0.0, 1.0)
    ax.add_patch(patches.Circle(root_xy, 0.05, facecolor="#f3eddc", edgecolor=INK, lw=1.1, zorder=3))

    # Fan out a dense set of children.
    n_kids = 31
    kid_y = 0.62
    kid_xs = [-1.1 + i * (2.2 / (n_kids - 1)) for i in range(n_kids)]
    for x in kid_xs:
        ax.plot([root_xy[0], x], [root_xy[1], kid_y], color=FAINT, lw=0.5, zorder=1)
        ax.add_patch(patches.Circle((x, kid_y), 0.018, facecolor=BG, edgecolor=FAINT, lw=0.6, zorder=3))

    # ... and three dots on each side to imply truncation.
    for dx in (-1.18, 1.18):
        for k in range(3):
            ax.plot(dx, kid_y - 0.05 + k * 0.02, marker=".", color=FAINT, markersize=3)

    # Where rollouts go: into a fog of unknown.
    fog_y_top = 0.45
    fog_y_bot = 0.10
    ax.add_patch(
        patches.Rectangle(
            (-1.1, fog_y_bot),
            2.2,
            fog_y_top - fog_y_bot,
            facecolor=FAINT,
            alpha=0.12,
            edgecolor="none",
        )
    )
    ax.text(
        0.0,
        (fog_y_top + fog_y_bot) / 2,
        "no value horizon",
        ha="center",
        va="center",
        color=INK,
        fontsize=11,
        style="italic",
    )
    # Long downward arrows fading out.
    for x in kid_xs[::4]:
        ax.add_patch(
            FancyArrowPatch(
                (x, kid_y - 0.02),
                (x, fog_y_top + 0.03),
                arrowstyle="-",
                color=FAINT,
                lw=0.6,
                alpha=0.5,
            )
        )

    # Bottom observations box.
    ax.add_patch(
        FancyBboxPatch(
            (-1.1, -0.02),
            2.2,
            0.18,
            boxstyle="round,pad=0.01,rounding_size=0.02",
            facecolor=ORANGE_FILL,
            edgecolor=ORANGE,
            lw=1.0,
        )
    )
    ax.text(
        0,
        0.13,
        "PUCT breaks: unbounded breadth + can't score partial reasoning",
        ha="center",
        va="center",
        color=ORANGE,
        fontsize=10.5,
        fontweight="bold",
    )
    ax.text(
        0,
        0.03,
        "$N_a \\approx 0$ for almost every action  $\\to$  exploration term can't discriminate",
        ha="center",
        va="center",
        color=INK,
        fontsize=9.5,
    )


go_panel(axes[0])
llm_panel(axes[1])

fig.suptitle(
    "Same algorithm, two regimes: why MCTS doesn't transfer to LLM reasoning",
    y=1.0,
    fontsize=13,
    color=INK,
)

out = Path("public/images/eric-jang/mcts-go-vs-llm.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
