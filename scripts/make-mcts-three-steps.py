"""Q7 — Three steps of an MCTS simulation, in the style of the AlphaGo
paper (Figure 2 in arXiv:1712.01815 and the AlphaZero/Nature paper):

  a. Select               — descend by argmax Q + U.
  b. Expand and evaluate  — one network forward pass at the new leaf;
                            children are added with priors P.
  c. Backup               — leaf value walks back to the root, folding
                            into the running average Q on every edge.

Nodes are tiny Go boards (not generic circles), so the visual reads
as "search through a sequence of game positions" instead of an
abstract tree. Active path is drawn solid; non-active parts of the
tree are dimmed.
"""
from pathlib import Path
import math
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch

apply_house_style()


# ── geometry ──────────────────────────────────────────────────────────────
BOARD = 0.16                   # side length of each mini-board (in axes coords)
GRID_INTERSECTIONS = 4         # 4×4 intersections → 3 cells per side
STONE_R = BOARD * 0.11


# Per-node stone configurations — varied just enough to read as
# "different positions" without distracting from the tree.
STONES = {
    "root": [(1, 2, "k"), (2, 1, "w")],
    "a":    [(1, 2, "k"), (2, 1, "w"), (2, 2, "k")],
    "b":    [(1, 2, "k"), (2, 1, "w"), (1, 1, "k")],
    "b1":   [(1, 2, "k"), (2, 1, "w"), (1, 1, "k"), (2, 2, "w")],
    "b2":   [(1, 2, "k"), (2, 1, "w"), (1, 1, "k"), (0, 1, "w")],
    "new":  [(1, 2, "k"), (2, 1, "w"), (1, 1, "k"), (2, 2, "w"), (2, 0, "k")],
}

LAYOUT = {
    "root": (0.50, 0.86),
    "a":    (0.25, 0.55),
    "b":    (0.75, 0.55),
    "b1":   (0.58, 0.22),   # the descent leaf in panels (a) and (c)
    "b2":   (0.92, 0.22),
}

EDGES = [
    ("root", "a"),
    ("root", "b"),
    ("b", "b1"),
    ("b", "b2"),
]

# The path the simulation descends.
PATH = [("root", "b"), ("b", "b1")]


# ── drawing primitives ───────────────────────────────────────────────────
def draw_board(ax, name, cx, cy, *, dimmed=False, highlight=None):
    """Mini Go-board centered at (cx, cy)."""
    color = FAINT if dimmed else INK
    half = BOARD / 2
    ax.add_patch(
        patches.Rectangle(
            (cx - half, cy - half), BOARD, BOARD,
            facecolor=BG, edgecolor=color, lw=0.8, zorder=2,
        )
    )
    n = GRID_INTERSECTIONS
    cell = BOARD / (n - 1)
    for i in range(n):
        t = i * cell
        ax.plot([cx - half, cx + half], [cy - half + t, cy - half + t],
                color=color, lw=0.35, zorder=2)
        ax.plot([cx - half + t, cx - half + t], [cy - half, cy + half],
                color=color, lw=0.35, zorder=2)
    for (gx, gy, bw) in STONES.get(name, []):
        sx = cx - half + gx * cell
        sy = cy - half + gy * cell
        fc = color if bw == "k" else BG
        ax.add_patch(
            patches.Circle((sx, sy), STONE_R,
                            facecolor=fc, edgecolor=color, lw=0.4, zorder=3)
        )
    if highlight is not None:
        ax.add_patch(
            patches.Rectangle(
                (cx - half - 0.012, cy - half - 0.012),
                BOARD + 0.024, BOARD + 0.024,
                facecolor="none", edgecolor=highlight, lw=1.6, zorder=4,
            )
        )


def board_edge_point(from_xy, to_xy):
    """Return the point on the boundary of the from-board nearest to_xy."""
    dx = to_xy[0] - from_xy[0]
    dy = to_xy[1] - from_xy[1]
    length = math.hypot(dx, dy)
    if length == 0:
        return from_xy
    offset = BOARD / 2 + 0.008
    return (from_xy[0] + dx / length * offset,
            from_xy[1] + dy / length * offset)


def draw_edge(ax, from_xy, to_xy, *, color, lw, label=None, label_color=None,
              arrow=True, reverse=False):
    p1 = board_edge_point(from_xy, to_xy)
    p2 = board_edge_point(to_xy, from_xy)
    if reverse:
        p1, p2 = p2, p1
    style = "->" if arrow else "-"
    ax.add_patch(
        FancyArrowPatch(
            p1, p2,
            arrowstyle=style,
            color=color, lw=lw, mutation_scale=11, zorder=1,
        )
    )
    if label:
        # Midpoint, offset perpendicularly so the label sits next to the edge.
        mx = (p1[0] + p2[0]) / 2
        my = (p1[1] + p2[1]) / 2
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        length = math.hypot(dx, dy)
        if length:
            nx, ny = -dy / length, dx / length
        else:
            nx, ny = 0, 0
        ax.text(
            mx + nx * 0.028,
            my + ny * 0.028,
            label,
            ha="center", va="center",
            color=label_color or color,
            fontsize=10, style="italic", zorder=5,
            bbox=dict(facecolor=BG, edgecolor="none", pad=1.0),
        )


def setup(ax, title):
    ax.set_facecolor(BG)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    ax.text(0.5, 1.04, title, ha="center", va="bottom",
            fontsize=12.5, fontweight="bold", color=INK)


# ── figure ───────────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(13, 5.6), dpi=140)
fig.patch.set_facecolor(BG)
fig.subplots_adjust(wspace=0.05, top=0.86, bottom=0.04, left=0.02, right=0.98)


# ────────── Panel (a) Select ──────────
ax = axes[0]
setup(ax, "a.  Select")
path_set = set(PATH)
for src, dst in EDGES:
    on_path = (src, dst) in path_set
    draw_edge(
        ax, LAYOUT[src], LAYOUT[dst],
        color=INK if on_path else FAINT,
        lw=1.7 if on_path else 0.9,
        label="$Q + U$" if on_path else None,
    )
selected = {"root", "b", "b1"}
for name in LAYOUT:
    draw_board(ax, name, *LAYOUT[name], dimmed=name not in selected)


# ────────── Panel (b) Expand and evaluate ──────────
ax = axes[1]
setup(ax, "b.  Expand and evaluate")
for src, dst in EDGES:
    draw_edge(
        ax, LAYOUT[src], LAYOUT[dst],
        color=FAINT, lw=0.9,
    )
for name in LAYOUT:
    draw_board(ax, name, *LAYOUT[name], dimmed=name != "b1")
# Two new children below b1, with P-labeled edges.
b1x, b1y = LAYOUT["b1"]
new_y = 0.02
new_xs = [b1x - 0.16, b1x + 0.16]
for nx in new_xs:
    draw_board(ax, "new", nx, new_y, dimmed=False)
    draw_edge(ax, (b1x, b1y), (nx, new_y), color=INK, lw=1.4, label="$P$")
# (p, v) = f_theta callout to the right of b1
ax.text(
    b1x + BOARD / 2 + 0.05, b1y,
    r"$(\mathbf{p}, v) = f_\theta(s)$",
    ha="left", va="center", color=INK, fontsize=11,
)


# ────────── Panel (c) Backup ──────────
ax = axes[2]
setup(ax, "c.  Backup")
for src, dst in EDGES:
    on_path = (src, dst) in path_set
    if on_path:
        # Reverse the arrow so it points UP from leaf to root.
        draw_edge(
            ax, LAYOUT[src], LAYOUT[dst],
            color=INK, lw=1.7, label="$Q$",
            reverse=True,
        )
    else:
        draw_edge(
            ax, LAYOUT[src], LAYOUT[dst],
            color=FAINT, lw=0.9,
        )
for name in LAYOUT:
    on_path = name in {"root", "b", "b1"}
    highlight = ORANGE if name == "b1" else None
    draw_board(ax, name, *LAYOUT[name],
               dimmed=not on_path, highlight=highlight)


# ────────── "Repeat" header arc spanning all three panels ──────────
# Drawn in figure coordinates so it sits above the three panels.
fig.patches.append(
    FancyArrowPatch(
        (0.93, 0.965), (0.07, 0.965),
        arrowstyle="->", color=INK, lw=1.0,
        mutation_scale=12,
        connectionstyle="arc3,rad=-0.22",
        transform=fig.transFigure,
    )
)
fig.text(0.5, 0.985, "Repeat", ha="center", va="bottom",
         color=INK, fontsize=10.5, style="italic")


out = Path("public/images/eric-jang/mcts-three-steps.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
