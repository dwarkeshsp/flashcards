"""Q11 — Winner-imitation: 1 useful gradient lost in a sea of neutral
labels.

Two side-by-side dot fields:
  Left  — sparse, mostly gray, one bright orange star buried in it.
  Right — uniform blue, every dot is a label.

Tiny one-word labels under each.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import numpy as np
import matplotlib.pyplot as plt

apply_house_style()

fig, axes = plt.subplots(1, 2, figsize=(11, 5.0), dpi=140)
fig.patch.set_facecolor(BG)


def dot_field(ax, *, color, decisive=False, label):
    ax.set_facecolor(BG)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    cols, rows = 60, 36
    for j in range(rows):
        for i in range(cols):
            x = (i + 0.5) / cols
            y = (j + 0.5) / rows
            ax.plot(x, y, marker=".", markersize=3.0,
                    color=color, alpha=0.55 if decisive else 0.85)

    if decisive:
        # One bright orange star buried in the field.
        sx, sy = 0.62, 0.55
        ax.plot(sx, sy, marker="*", markersize=18,
                markerfacecolor=ORANGE, markeredgecolor=ORANGE)
        ax.annotate(
            "$1$ useful gradient",
            xy=(sx, sy),
            xytext=(sx + 0.12, sy + 0.22),
            ha="left", va="bottom", color=ORANGE, fontsize=10,
            arrowprops=dict(arrowstyle="-", color=ORANGE, lw=0.9),
        )

    ax.text(0.5, -0.06, label, ha="center", va="top",
            color=INK, fontsize=11, style="italic")


dot_field(axes[0], color=FAINT, decisive=True, label="imitate winners")
dot_field(axes[1], color=BLUE, decisive=False, label="MCTS")

out = Path("public/images/eric-jang/winner-imitation-dilution.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
