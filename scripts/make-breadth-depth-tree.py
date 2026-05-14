"""Q5 — Two heads carve up the tree.

Simpler take: one clean bounded tree, with two annotations placed
outside the tree itself.
  - Horizontal bracket across the top  → "breadth" (policy)
  - Vertical bracket along the right side → "depth" (value)
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch

apply_house_style()

fig, ax = plt.subplots(figsize=(9.5, 5.2), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(-1.1, 1.1)
ax.set_ylim(-0.1, 1.2)
ax.axis("off")


# A clean bounded tree: 4 levels.
def tree(root_xy, half_width, branching, depth, color=INK, lw=1.0):
    if depth == 0:
        return
    x, y = root_xy
    child_y = y - 0.20
    for k in range(branching):
        t = (k + 0.5) / branching
        cx = x + (t - 0.5) * 2 * half_width
        ax.plot([x, cx], [y, child_y], color=color, lw=lw)
        ax.add_patch(patches.Circle((cx, child_y), 0.024,
                                     facecolor=BG, edgecolor=color, lw=lw))
        tree((cx, child_y), half_width / branching * 0.85,
             branching - 1 if depth > 2 else branching, depth - 1, color, lw)


# Root
root = (0.0, 1.0)
ax.add_patch(patches.Circle(root, 0.03, facecolor=BG, edgecolor=INK, lw=1.0))
tree(root, 0.7, branching=4, depth=4, color=INK, lw=0.9)

# Horizontal bracket across the top — breadth (blue)
bracket_y = 1.10
ax.plot([-0.7, 0.7], [bracket_y, bracket_y], color=BLUE, lw=1.0)
ax.plot([-0.7, -0.7], [bracket_y - 0.02, bracket_y + 0.02], color=BLUE, lw=1.0)
ax.plot([0.7, 0.7], [bracket_y - 0.02, bracket_y + 0.02], color=BLUE, lw=1.0)
ax.text(0, bracket_y + 0.05, "breadth", ha="center", va="bottom",
        color=BLUE, fontsize=11, style="italic")
ax.text(0, bracket_y + 0.005, "(policy)", ha="center", va="bottom",
        color=BLUE, fontsize=9)

# Vertical bracket along the right side — depth (orange)
bracket_x = 0.95
ax.plot([bracket_x, bracket_x], [0.05, 1.0], color=ORANGE, lw=1.0)
ax.plot([bracket_x - 0.02, bracket_x + 0.02], [1.0, 1.0], color=ORANGE, lw=1.0)
ax.plot([bracket_x - 0.02, bracket_x + 0.02], [0.05, 0.05], color=ORANGE, lw=1.0)
ax.text(bracket_x + 0.05, 0.5, "depth", ha="left", va="center",
        rotation=90, color=ORANGE, fontsize=11, style="italic")
ax.text(bracket_x + 0.10, 0.5, "(value)", ha="left", va="center",
        rotation=90, color=ORANGE, fontsize=9)

out = Path("public/images/eric-jang/breadth-depth-tree.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
