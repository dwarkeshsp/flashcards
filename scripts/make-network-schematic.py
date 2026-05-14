"""Q2 — Network basics.

Visual goal: input -> network -> two outputs.
No internal labels in the network, no titles inside the heads.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

apply_house_style()

fig, ax = plt.subplots(figsize=(9.5, 4.6), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 100)
ax.set_ylim(0, 55)
ax.set_aspect("equal")
ax.axis("off")


# Board (input)
bx, by, bw, bh = 4, 16, 18, 18
ax.add_patch(patches.Rectangle((bx, by), bw, bh, facecolor=BG, edgecolor=INK, lw=1.2))
n = 6
for i in range(n + 1):
    ax.plot([bx, bx + bw], [by + i * bh / n] * 2, color=INK, lw=0.6)
    ax.plot([bx + i * bw / n] * 2, [by, by + bh], color=INK, lw=0.6)
cell = bw / n
stones = [(1, 4, "k"), (2, 3, "w"), (3, 3, "k"), (3, 4, "w"),
          (4, 2, "k"), (5, 5, "w"), (2, 5, "k"), (4, 4, "w")]
for cx, cy, color in stones:
    fc = INK if color == "k" else BG
    ax.add_patch(
        patches.Circle(
            (bx + cx * cell, by + cy * cell), 0.9, facecolor=fc, edgecolor=INK, lw=0.8,
        )
    )
ax.text(bx + bw / 2, by - 2.5, "$s$", ha="center", va="top",
        fontsize=12, color=INK, style="italic")

# Network (just a soft rounded rectangle, nothing inside)
nx, ny, nw, nh = 33, 16, 22, 18
ax.add_patch(
    FancyBboxPatch(
        (nx, ny), nw, nh,
        boxstyle="round,pad=0.4,rounding_size=1.4",
        facecolor=BG, edgecolor=INK, lw=1.2,
    )
)
ax.text(nx + nw / 2, ny + nh / 2, "network",
        ha="center", va="center", fontsize=11.5, color=INK)

# Arrow board -> network
ax.add_patch(
    FancyArrowPatch(
        (bx + bw + 0.5, by + bh / 2), (nx - 0.5, ny + nh / 2),
        arrowstyle="->", color=INK, lw=1.2, mutation_scale=14,
    )
)


# Policy head output — small histogram, top-right
ph_x, ph_y, ph_w, ph_h = 68, 30, 24, 10
ax.add_patch(
    patches.Rectangle((ph_x, ph_y), ph_w, ph_h,
                      facecolor=BG, edgecolor="none")
)
heights = [0.5, 1.4, 0.5, 3.6, 0.9, 0.5, 1.9, 0.4, 1.3, 0.3, 1.0, 0.6]
bar_w = ph_w / len(heights) * 0.7
for i, h in enumerate(heights):
    x = ph_x + i * (ph_w / len(heights)) + (ph_w / len(heights) - bar_w) / 2
    ax.add_patch(patches.Rectangle((x, ph_y), bar_w, h * 1.6,
                                    facecolor=BLUE, edgecolor=BLUE, lw=0))
# Baseline
ax.plot([ph_x, ph_x + ph_w], [ph_y, ph_y], color=INK, lw=0.8)
ax.text(ph_x + ph_w + 1.5, ph_y + ph_h / 2, "policy",
        ha="left", va="center", fontsize=11, color=INK, style="italic")

# Value head output — single filled bar
vh_x, vh_y, vh_w, vh_h = 68, 14, 24, 4.5
ax.add_patch(
    patches.Rectangle((vh_x, vh_y), vh_w, vh_h,
                      facecolor=BG, edgecolor=INK, lw=0.9)
)
# fill ~67%
ax.add_patch(
    patches.Rectangle((vh_x, vh_y), vh_w * 0.67, vh_h,
                      facecolor=ORANGE, edgecolor="none")
)
ax.text(vh_x + ph_w + 1.5, vh_y + vh_h / 2, "value",
        ha="left", va="center", fontsize=11, color=INK, style="italic")

# Two arrows out of the network
ax.add_patch(
    FancyArrowPatch(
        (nx + nw + 0.5, ny + nh / 2 + 2), (ph_x - 0.5, ph_y + ph_h / 2),
        arrowstyle="->", color=INK, lw=1.2, mutation_scale=14,
        connectionstyle="arc3,rad=-0.18",
    )
)
ax.add_patch(
    FancyArrowPatch(
        (nx + nw + 0.5, ny + nh / 2 - 2), (vh_x - 0.5, vh_y + vh_h / 2),
        arrowstyle="->", color=INK, lw=1.2, mutation_scale=14,
        connectionstyle="arc3,rad=0.18",
    )
)

out = Path("public/images/eric-jang/network-schematic.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
