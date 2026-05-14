"""Q5 — Two heads carve up the tree.

Show the unexplored space in addition to the explored one:
  - Background: dense, faded "phantom" tree representing the
    ~361^300 branches MCTS never touches.
  - Foreground: solid black MCTS subtree threaded through the
    middle — narrower (policy prunes breadth) and shallower
    (value prunes depth) than the phantom.
  - Two annotations: a blue "policy" funnel at the top showing
    the breadth being pruned, and an orange dashed horizontal
    line where the value head truncates depth.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches

apply_house_style()

fig, ax = plt.subplots(figsize=(10.5, 5.8), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis("off")


ROOT = (0.5, 0.94)
LEVEL_DY = 0.155  # vertical step between levels


# ── Phantom tree — wide and deep, very faded ──────────────────────────
PHANTOM_BRANCHING = 5
PHANTOM_LEVELS = 5
PHANTOM_HALF_WIDTH = 0.46


def phantom(x, y, level, half_w):
    if level >= PHANTOM_LEVELS:
        return
    cy = y - LEVEL_DY
    for k in range(PHANTOM_BRANCHING):
        t = (k + 0.5) / PHANTOM_BRANCHING
        cx = x + (t - 0.5) * 2 * half_w
        ax.plot([x, cx], [y, cy],
                color=FAINT, lw=0.28, alpha=0.40, zorder=1)
        phantom(cx, cy, level + 1, half_w / PHANTOM_BRANCHING * 0.92)


phantom(*ROOT, 0, PHANTOM_HALF_WIDTH)


# ── Actual MCTS tree — narrower, shallower, solid ──────────────────────
ACTUAL_BRANCHING = 2
ACTUAL_LEVELS = 3
ACTUAL_HALF_WIDTH = 0.16


def actual(x, y, level, half_w):
    if level >= ACTUAL_LEVELS:
        return
    cy = y - LEVEL_DY
    for k in range(ACTUAL_BRANCHING):
        t = (k + 0.5) / ACTUAL_BRANCHING
        cx = x + (t - 0.5) * 2 * half_w
        ax.plot([x, cx], [y, cy], color=INK, lw=1.2, zorder=3)
        ax.add_patch(
            patches.Circle((cx, cy), 0.014,
                            facecolor=BG, edgecolor=INK, lw=1.0, zorder=4)
        )
        actual(cx, cy, level + 1, half_w / ACTUAL_BRANCHING * 0.85)


# Root node marker
ax.add_patch(
    patches.Circle(ROOT, 0.018, facecolor=BG, edgecolor=INK, lw=1.0, zorder=4)
)
actual(*ROOT, 0, ACTUAL_HALF_WIDTH)


# ── Value head: dashed orange line at the depth of the deepest visited node ──
y_cut = ROOT[1] - ACTUAL_LEVELS * LEVEL_DY
ax.plot([0.04, 0.96], [y_cut, y_cut],
        linestyle="--", color=ORANGE, lw=1.3, zorder=5)
ax.text(
    0.96, y_cut - 0.012,
    "value head  $\\to$  prunes depth",
    ha="right", va="top",
    color=ORANGE, fontsize=10.5, style="italic",
)


# ── Policy head: soft blue funnel above the actual tree, labelled at top ────
funnel = patches.Polygon(
    [
        (0.5 - ACTUAL_HALF_WIDTH * 0.6, ROOT[1] + 0.005),
        (0.5 + ACTUAL_HALF_WIDTH * 0.6, ROOT[1] + 0.005),
        (0.5 + PHANTOM_HALF_WIDTH * 0.55, y_cut),
        (0.5 - PHANTOM_HALF_WIDTH * 0.55, y_cut),
    ],
    closed=True, facecolor=BLUE, alpha=0.05, edgecolor="none", zorder=0,
)
ax.add_patch(funnel)
# Two dashed boundary lines for the funnel.
for sign in (-1, 1):
    ax.plot(
        [0.5 + sign * ACTUAL_HALF_WIDTH * 0.55, 0.5 + sign * PHANTOM_HALF_WIDTH * 0.55],
        [ROOT[1] - 0.02, y_cut],
        color=BLUE, lw=0.9, alpha=0.55, linestyle="--", zorder=2,
    )

ax.text(
    0.5, ROOT[1] + 0.045,
    "policy head  $\\to$  prunes breadth",
    ha="center", va="bottom",
    color=BLUE, fontsize=10.5, style="italic",
)


out = Path("public/images/eric-jang/breadth-depth-tree.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
