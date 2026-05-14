"""Q12 — NFSP and MCTS: same student, opposite time-directions.

Two-panel layout inspired by Eric's slide 13. No formula text, no
descriptive captions in the body — the card has those.

  Left  (NFSP):  a horizontal chain of past states ending at s plus a
                 terminal reward r; blue arcs trace the Bellman back-up
                 leftward through the chain.
  Right (MCTS):  s on the left with a small tree fanning right into
                 imagined futures; orange arcs trace the value back-up
                 from the leaves toward s.

A faint dashed vertical divider separates the two panels. The only
text in the figure: "NFSP" / "MCTS" at top, "past" / "future" at
bottom.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch

apply_house_style()

fig, ax = plt.subplots(figsize=(11, 4.8), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 100)
ax.set_ylim(0, 56)
ax.set_aspect("equal")
ax.axis("off")


# Vertical divider.
ax.plot([50, 50], [6, 50], color=FAINT, lw=0.8, linestyle="--")


# ────────── LEFT panel: NFSP — backward in time ──────────
NFSP_Y = 28
chain_xs = [8, 18, 28, 38]  # s-3, s-2, s-1, s
for i, x in enumerate(chain_xs):
    is_current = i == len(chain_xs) - 1
    ax.add_patch(
        patches.Circle(
            (x, NFSP_Y),
            2.6,
            facecolor=BG,
            edgecolor=INK if is_current else FAINT,
            lw=1.4 if is_current else 1.0,
        )
    )
    if is_current:
        ax.text(x, NFSP_Y, "$s$", ha="center", va="center",
                fontsize=11, color=INK, style="italic")

# Faint forward arrows showing real-time chain (light grey).
for x1, x2 in zip(chain_xs[:-1], chain_xs[1:]):
    ax.add_patch(
        FancyArrowPatch(
            (x1 + 2.6, NFSP_Y),
            (x2 - 2.6, NFSP_Y),
            arrowstyle="->",
            color=FAINT,
            lw=0.8,
            mutation_scale=10,
        )
    )

# Terminal reward r — small orange square to the right of s.
r_x = 46
ax.add_patch(
    patches.Rectangle((r_x - 1.6, NFSP_Y - 1.6), 3.2, 3.2,
                      facecolor=ORANGE, edgecolor=ORANGE, lw=0.8)
)
# faint connector from s to r
ax.add_patch(
    FancyArrowPatch(
        (chain_xs[-1] + 2.6, NFSP_Y),
        (r_x - 1.6, NFSP_Y),
        arrowstyle="->",
        color=FAINT,
        lw=0.8,
        mutation_scale=10,
    )
)

# Blue back-up arcs: leftward, arching above the chain.
arc_nodes = [(r_x, NFSP_Y)] + [(x, NFSP_Y) for x in reversed(chain_xs)]
for (x_from, _), (x_to, _) in zip(arc_nodes[:-1], arc_nodes[1:]):
    ax.add_patch(
        FancyArrowPatch(
            (x_from - 1.8, NFSP_Y + 1.5),
            (x_to + 2.8, NFSP_Y + 1.5),
            arrowstyle="->",
            color=BLUE,
            lw=1.6,
            mutation_scale=11,
            connectionstyle="arc3,rad=0.45",
        )
    )

# Top + bottom labels.
ax.text(25, 50, "NFSP", ha="center", va="center",
        color=BLUE, fontsize=12, fontweight="bold")
ax.text(8, 8, "past", ha="left", va="top",
        color=INK, fontsize=10.5, style="italic")
ax.text(46, 8, "now", ha="right", va="top",
        color=INK, fontsize=10.5, style="italic")


# ────────── RIGHT panel: MCTS — forward in time ──────────
MCTS_Y = 28
s2_x = 56
ax.add_patch(
    patches.Circle((s2_x, MCTS_Y), 2.6, facecolor=BG, edgecolor=INK, lw=1.4)
)
ax.text(s2_x, MCTS_Y, "$s$", ha="center", va="center",
        fontsize=11, color=INK, style="italic")

# Three children in a vertical fan.
child_x = 72
child_ys = [40, 28, 16]
for cy in child_ys:
    ax.add_patch(
        patches.Circle((child_x, cy), 1.9, facecolor=BG, edgecolor=FAINT, lw=1.0)
    )
    # forward branch from s to child (faint, like the real-time arrows on the left)
    ax.add_patch(
        FancyArrowPatch(
            (s2_x + 2.6, MCTS_Y),
            (child_x - 1.9, cy),
            arrowstyle="->",
            color=FAINT,
            lw=0.8,
            mutation_scale=10,
        )
    )

# Two leaves per child — orange terminal squares on the right.
leaf_x = 88
leaf_offset = 2.6
for cy in child_ys:
    for dy in (leaf_offset, -leaf_offset):
        ly = cy + dy
        ax.add_patch(
            patches.Rectangle((leaf_x - 1.6, ly - 1.6), 3.2, 3.2,
                              facecolor=ORANGE, edgecolor=ORANGE, lw=0.8)
        )
        ax.add_patch(
            FancyArrowPatch(
                (child_x + 1.9, cy),
                (leaf_x - 1.6, ly),
                arrowstyle="->",
                color=FAINT,
                lw=0.6,
                mutation_scale=8,
            )
        )

# Orange back-up arcs: one per child, from the child node back to s
# (the per-leaf back-up is implied by the children's existence).
for i, cy in enumerate(child_ys):
    sign = 1 if i == 0 else (-1 if i == 2 else 0)
    if sign == 0:
        ax.add_patch(
            FancyArrowPatch(
                (child_x - 1.9, cy),
                (s2_x + 2.6, MCTS_Y),
                arrowstyle="->",
                color=ORANGE,
                lw=1.6,
                mutation_scale=12,
            )
        )
    else:
        ax.add_patch(
            FancyArrowPatch(
                (child_x - 1.9, cy),
                (s2_x + 2.0, MCTS_Y + sign * 1.5),
                arrowstyle="->",
                color=ORANGE,
                lw=1.6,
                mutation_scale=12,
                connectionstyle=f"arc3,rad={0.25 * sign}",
            )
        )

# Top + bottom labels.
ax.text(75, 50, "MCTS", ha="center", va="center",
        color=ORANGE, fontsize=12, fontweight="bold")
ax.text(56, 8, "now", ha="left", va="top",
        color=INK, fontsize=10.5, style="italic")
ax.text(92, 8, "future", ha="right", va="top",
        color=INK, fontsize=10.5, style="italic")


out = Path("public/images/eric-jang/mcts-nfsp-time-direction.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
