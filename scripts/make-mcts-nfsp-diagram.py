"""Q12 — NFSP and MCTS: same student, opposite time-directions.

Visual: a single time axis. State s sits at the center.
  - Left: a chain of past states with arrows pointing LEFT
          (Bellman backups along trajectories that already happened).
  - Right: a small tree fanning RIGHT into imagined futures
           (UCT expansion).

No formulas in the visual — the card text holds those. Just the two
search directions converging on s.
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
ax.set_ylim(0, 50)
ax.set_aspect("equal")
ax.axis("off")


# Center: state s.
sx, sy = 50, 28
ax.add_patch(patches.Circle((sx, sy), 3.0, facecolor=BG, edgecolor=INK, lw=1.4))
ax.text(sx, sy, "$s$", ha="center", va="center", fontsize=12, color=INK, style="italic")

# Past chain on the LEFT: four prior states with leftward Bellman arrows.
past_xs = [12, 22, 32, 42]
for x in past_xs:
    ax.add_patch(patches.Circle((x, sy), 2.2, facecolor=BG, edgecolor=FAINT, lw=1.0))
# Bellman arrows (leftward, blue).
for x_to, x_from in zip(past_xs, past_xs[1:] + [sx - 3]):
    ax.add_patch(
        FancyArrowPatch(
            (x_from - 2.3, sy + 0.4), (x_to + 2.3, sy + 0.4),
            arrowstyle="->", color=BLUE, lw=1.6,
            connectionstyle="arc3,rad=0.30", mutation_scale=12,
        )
    )

# Future tree on the RIGHT: fan of children with orange UCT arrows.
fut_xs = [62, 74, 86]
fut_ys = [38, 28, 18]
for fx, fy in zip(fut_xs, fut_ys):
    ax.add_patch(patches.Circle((fx, fy), 2.0, facecolor=BG, edgecolor=FAINT, lw=1.0))
    ax.add_patch(
        FancyArrowPatch(
            (sx + 3, sy), (fx - 2, fy),
            arrowstyle="->", color=ORANGE, lw=1.6, mutation_scale=12,
        )
    )

# Time axis with arrowheads at both ends.
ax.annotate(
    "", xy=(96, 8), xytext=(4, 8),
    xycoords="data", textcoords="data",
    arrowprops=dict(arrowstyle="<->", color=INK, lw=1.0),
)
ax.text(4, 5, "past", ha="left", va="top", color=INK, fontsize=11, style="italic")
ax.text(96, 5, "future", ha="right", va="top", color=INK, fontsize=11, style="italic")

# Inline algorithm labels above the two halves.
ax.text(28, 45, "NFSP", ha="center", va="center",
        color=BLUE, fontsize=12, fontweight="bold")
ax.text(28, 42, "Bellman backup", ha="center", va="top",
        color=BLUE, fontsize=10, style="italic")
ax.text(72, 45, "MCTS", ha="center", va="center",
        color=ORANGE, fontsize=12, fontweight="bold")
ax.text(72, 42, "tree rollout", ha="center", va="top",
        color=ORANGE, fontsize=10, style="italic")

out = Path("public/images/eric-jang/mcts-nfsp-time-direction.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
