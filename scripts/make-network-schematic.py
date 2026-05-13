"""Network schematic: board state in, shared trunk, two heads (policy + value).

Used by the "What is the overall purpose of the AlphaGo neural network" card.
House style: off-cream background, muted blue / warm orange / faint brown,
slightly hand-drawn feel, no shadows/gradients.
"""
import matplotlib.pyplot as plt
from matplotlib import patches, rcParams
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Helvetica", "Arial", "DejaVu Sans"],
})

BG = "#fafaf7"
INK = "#1a1a1a"
BLUE = "#3a6fb0"
ORANGE = "#c46c3f"
BROWN = "#a08660"
FAINT = "#bdb6a8"

fig, ax = plt.subplots(figsize=(10.0, 5.5), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 100)
ax.set_ylim(0, 55)
ax.set_aspect("equal")
ax.axis("off")


# ── Board (input) ────────────────────────────────────────────────────────────
board_x, board_y, board_w, board_h = 4, 17, 18, 18
ax.add_patch(patches.Rectangle(
    (board_x, board_y), board_w, board_h,
    facecolor="#f3eddc", edgecolor=INK, lw=1.3,
))
# grid lines
n = 6
for i in range(n + 1):
    ax.plot(
        [board_x, board_x + board_w],
        [board_y + i * board_h / n, board_y + i * board_h / n],
        color=INK, lw=0.7,
    )
    ax.plot(
        [board_x + i * board_w / n, board_x + i * board_w / n],
        [board_y, board_y + board_h],
        color=INK, lw=0.7,
    )
# a few stones
stones = [(1, 4, "k"), (2, 3, "w"), (3, 3, "k"),
          (3, 4, "w"), (4, 2, "k"), (5, 5, "w"),
          (2, 5, "k"), (4, 4, "w")]
cell = board_w / n
for cx, cy, color in stones:
    fc = INK if color == "k" else "#fafaf7"
    ax.add_patch(patches.Circle(
        (board_x + cx * cell, board_y + cy * cell),
        radius=0.9, facecolor=fc, edgecolor=INK, lw=0.8,
    ))

ax.text(board_x + board_w / 2, board_y - 2.5, "board state $s$",
        ha="center", va="top", fontsize=11, color=INK, style="italic")

# ── Trunk ────────────────────────────────────────────────────────────────────
trunk_x, trunk_y, trunk_w, trunk_h = 33, 17, 24, 18
ax.add_patch(FancyBboxPatch(
    (trunk_x, trunk_y), trunk_w, trunk_h,
    boxstyle="round,pad=0.4,rounding_size=1.2",
    facecolor="#f0e9d8", edgecolor=INK, lw=1.3,
))
# layer ticks
for i in range(7):
    lx = trunk_x + 2 + i * (trunk_w - 4) / 6
    ax.plot([lx, lx], [trunk_y + 3, trunk_y + trunk_h - 3], color=FAINT, lw=1.0)

ax.text(trunk_x + trunk_w / 2, trunk_y + trunk_h / 2,
        "shared\nResNet trunk",
        ha="center", va="center", fontsize=11.5, color=INK)
ax.text(trunk_x + trunk_w / 2, trunk_y - 2.5,
        "$\\sim$10 conv layers",
        ha="center", va="top", fontsize=10, color=INK, style="italic")

# Arrow board → trunk
ax.add_patch(FancyArrowPatch(
    (board_x + board_w + 0.5, board_y + board_h / 2),
    (trunk_x - 0.5, trunk_y + trunk_h / 2),
    arrowstyle="->", lw=1.3, color=INK, mutation_scale=14,
))

# ── Two heads ────────────────────────────────────────────────────────────────
# Policy head (top-right)
ph_x, ph_y, ph_w, ph_h = 70, 32, 26, 16
ax.add_patch(FancyBboxPatch(
    (ph_x, ph_y), ph_w, ph_h,
    boxstyle="round,pad=0.4,rounding_size=1.2",
    facecolor="#e9efff", edgecolor=BLUE, lw=1.6,
))
ax.text(ph_x + 2, ph_y + ph_h - 2.5, "policy head",
        ha="left", va="top", fontsize=11.5, color=BLUE, fontweight="bold")
# tiny histogram inside
hist_x0 = ph_x + 2.0
hist_y0 = ph_y + 2.0
hist_w = ph_w - 4
bar_n = 12
import random
random.seed(2)
heights = [0.7, 1.6, 0.4, 4.2, 1.1, 0.6, 2.1, 0.5, 1.4, 0.3, 1.0, 0.7]
bar_w = hist_w / bar_n * 0.7
for i, h in enumerate(heights):
    bx = hist_x0 + i * (hist_w / bar_n) + (hist_w / bar_n - bar_w) / 2
    ax.add_patch(patches.Rectangle(
        (bx, hist_y0), bar_w, h,
        facecolor=BLUE, edgecolor=BLUE, lw=0,
    ))
# baseline
ax.plot([hist_x0, hist_x0 + hist_w], [hist_y0, hist_y0], color=INK, lw=0.9)
ax.text(ph_x + ph_w + 1, ph_y + 5, "$P(a \\mid s)$",
        ha="left", va="center", fontsize=11, color=BLUE, style="italic")
ax.text(ph_x + ph_w + 1, ph_y + 2.0, "prunes BREADTH",
        ha="left", va="center", fontsize=9.5, color=BLUE)

# Value head (bottom-right)
vh_x, vh_y, vh_w, vh_h = 70, 4, 26, 16
ax.add_patch(FancyBboxPatch(
    (vh_x, vh_y), vh_w, vh_h,
    boxstyle="round,pad=0.4,rounding_size=1.2",
    facecolor="#fbeee0", edgecolor=ORANGE, lw=1.6,
))
ax.text(vh_x + 2, vh_y + vh_h - 2.5, "value head",
        ha="left", va="top", fontsize=11.5, color=ORANGE, fontweight="bold")
# gauge
cx, cy, r = vh_x + 8, vh_y + 6.5, 4.0
ax.add_patch(patches.Wedge((cx, cy), r, 0, 180, facecolor=BG,
                            edgecolor=INK, lw=1.0))
# tick at ~70%
import math
tick_angle = math.radians(180 - 180 * 0.72)
tx1 = cx + (r - 0.6) * math.cos(tick_angle)
ty1 = cy + (r - 0.6) * math.sin(tick_angle)
tx2 = cx + (r + 0.4) * math.cos(tick_angle)
ty2 = cy + (r + 0.4) * math.sin(tick_angle)
ax.plot([cx, tx1], [cy, ty1], color=ORANGE, lw=2.2)
ax.text(cx - r - 0.2, cy - 0.6, "0", ha="right", va="center",
        fontsize=8.5, color=INK)
ax.text(cx + r + 0.2, cy - 0.6, "1", ha="left", va="center",
        fontsize=8.5, color=INK)
ax.text(vh_x + ph_w + 1, vh_y + 9, "$V_\\theta(s)$",
        ha="left", va="center", fontsize=11, color=ORANGE, style="italic")
ax.text(vh_x + ph_w + 1, vh_y + 6.0, "$\\approx P(\\text{win} \\mid s)$",
        ha="left", va="center", fontsize=10, color=ORANGE)
ax.text(vh_x + ph_w + 1, vh_y + 2.5, "prunes DEPTH",
        ha="left", va="center", fontsize=9.5, color=ORANGE)

# Arrows trunk → heads
ax.add_patch(FancyArrowPatch(
    (trunk_x + trunk_w + 0.5, trunk_y + trunk_h / 2 + 4),
    (ph_x - 0.5, ph_y + ph_h / 2),
    arrowstyle="->", lw=1.3, color=INK, mutation_scale=14,
    connectionstyle="arc3,rad=-0.18",
))
ax.add_patch(FancyArrowPatch(
    (trunk_x + trunk_w + 0.5, trunk_y + trunk_h / 2 - 4),
    (vh_x - 0.5, vh_y + vh_h / 2),
    arrowstyle="->", lw=1.3, color=INK, mutation_scale=14,
    connectionstyle="arc3,rad=0.18",
))

# Caption underline
ax.text(50, 51, "AlphaGo network = MCTS guide",
        ha="center", va="center", fontsize=13, color=INK, fontweight="bold")

plt.savefig("public/images/eric-jang/network-schematic.png",
            bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print("wrote public/images/eric-jang/network-schematic.png")
