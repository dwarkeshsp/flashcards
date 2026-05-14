"""Q13 — Why MCTS doesn't transfer from Go to LLM reasoning.

Visual contrast between two trees:
  Left  — Go: bounded fan + orange value-horizon line cutting depth.
  Right — LLM: enormous fan extending beyond the canvas + no horizon
          (branches fade into gray below).

No prose annotations inside the panels. Just one-word labels at the top.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import math
import matplotlib.pyplot as plt
from matplotlib import patches

apply_house_style()

fig, axes = plt.subplots(1, 2, figsize=(12, 5.2), dpi=140)
fig.patch.set_facecolor(BG)


# ---------- Left: Go ----------
ax = axes[0]
ax.set_facecolor(BG)
ax.set_xlim(-1, 1)
ax.set_ylim(-0.1, 1.15)
ax.axis("off")

def draw_go():
    # Root at top, 5 children at the next level, 3 grandchildren each.
    root_xy = (0.0, 1.0)
    ax.add_patch(patches.Circle(root_xy, 0.045,
                                 facecolor=BG, edgecolor=INK, lw=1.1, zorder=3))
    n_kids = 5
    kid_y = 0.62
    kid_xs = [-0.6 + i * (1.2 / (n_kids - 1)) for i in range(n_kids)]
    for x in kid_xs:
        ax.plot([root_xy[0], x], [root_xy[1], kid_y],
                color=INK, lw=0.9, zorder=1)
        ax.add_patch(patches.Circle((x, kid_y), 0.034,
                                     facecolor=BG, edgecolor=INK, lw=0.9, zorder=3))
        for j in range(3):
            gx = x + (j - 1) * 0.10
            gy = 0.28
            ax.plot([x, gx], [kid_y, gy], color=INK, lw=0.8, zorder=1)
            ax.add_patch(patches.Circle((gx, gy), 0.024,
                                         facecolor=BG, edgecolor=INK, lw=0.8, zorder=3))

    # Value-horizon: a dashed orange line just under the grandchildren.
    ax.plot([-0.85, 0.85], [0.16, 0.16],
            linestyle="--", color=ORANGE, lw=1.2)
    ax.text(0.85, 0.13, "value", ha="right", va="top",
            color=ORANGE, fontsize=10, style="italic")

draw_go()
ax.text(0, 1.10, "Go", ha="center", va="bottom",
        color=INK, fontsize=13, fontweight="bold")


# ---------- Right: LLM ----------
ax = axes[1]
ax.set_facecolor(BG)
ax.set_xlim(-1, 1)
ax.set_ylim(-0.1, 1.15)
ax.axis("off")

def draw_llm():
    root_xy = (0.0, 1.0)
    ax.add_patch(patches.Circle(root_xy, 0.045,
                                 facecolor=BG, edgecolor=INK, lw=1.1, zorder=3))
    # Dense fan of children; overflow into the canvas edges.
    n_kids = 41
    kid_y = 0.64
    kid_xs = [-1.05 + i * (2.1 / (n_kids - 1)) for i in range(n_kids)]
    for x in kid_xs:
        ax.plot([root_xy[0], x], [root_xy[1], kid_y],
                color=FAINT, lw=0.45, zorder=1)
        ax.add_patch(patches.Circle((x, kid_y), 0.014,
                                     facecolor=BG, edgecolor=FAINT, lw=0.5, zorder=3))

    # "off the page" indicator: faint dots beyond the canvas edges.
    for dx_sign in (-1, 1):
        for k in range(3):
            ax.plot(dx_sign * (1.1 + k * 0.03), kid_y,
                    marker=".", color=FAINT, markersize=2.5)

    # No value horizon. Lines fade downward into a gray gradient.
    for x in kid_xs[::2]:
        # Long line going down, getting more transparent.
        for seg in range(8):
            y0 = kid_y - seg * 0.07
            y1 = y0 - 0.07
            if y1 < 0.0:
                break
            ax.plot([x, x], [y0, y1],
                    color=FAINT, lw=0.45, alpha=max(0.05, 0.5 - seg * 0.06))

draw_llm()
ax.text(0, 1.10, "LLM", ha="center", va="bottom",
        color=INK, fontsize=13, fontweight="bold")


out = Path("public/images/eric-jang/mcts-go-vs-llm.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
