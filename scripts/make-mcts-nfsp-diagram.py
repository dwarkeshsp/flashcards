"""MCTS vs NFSP — same student, opposite time-directions.

Side-by-side: NFSP (Bellman backup over real past trajectories, arrow
backward in time) vs MCTS (UCT tree expansion over imagined futures, arrow
forward in time). Both teachers hand the student π_θ the same (s, a*) pair.

House style: off-cream, blue + orange + faint brown, slight hand-drawn feel.
"""
import math

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

fig, ax = plt.subplots(figsize=(12.0, 6.5), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 120)
ax.set_ylim(0, 65)
ax.set_aspect("equal")
ax.axis("off")


def draw_node(cx, cy, r=2.0, label=None, fill=BG, edge=INK, lw=1.1,
              label_color=INK, label_fontsize=10):
    ax.add_patch(patches.Circle((cx, cy), r, facecolor=fill, edgecolor=edge, lw=lw))
    if label is not None:
        ax.text(cx, cy, label, ha="center", va="center",
                fontsize=label_fontsize, color=label_color)


def draw_terminal(cx, cy, w=2.6, h=2.6, fill=ORANGE):
    ax.add_patch(patches.Rectangle((cx - w / 2, cy - h / 2), w, h,
                                    facecolor=fill, edgecolor=INK, lw=0.9))


# ── Top titles ───────────────────────────────────────────────────────────────
ax.text(30, 60.5, "NFSP", ha="center", va="center",
        fontsize=15, color=BLUE, fontweight="bold")
ax.text(30, 57.8, "search BACKWARD in time", ha="center", va="center",
        fontsize=11, color=BLUE, style="italic")

ax.text(90, 60.5, "MCTS", ha="center", va="center",
        fontsize=15, color=ORANGE, fontweight="bold")
ax.text(90, 57.8, "search FORWARD in time", ha="center", va="center",
        fontsize=11, color=ORANGE, style="italic")


# ── Left panel: NFSP — real past trajectory ──────────────────────────────────
# Past states laid out left → right, ending at current state s on the right.
nfsp_y = 38
nfsp_xs = [6, 16, 26, 36, 46]
nfsp_labels = ["$s_{-4}$", "$s_{-3}$", "$s_{-2}$", "$s_{-1}$", "$s$"]
for x, lab in zip(nfsp_xs, nfsp_labels):
    draw_node(x, nfsp_y, r=2.0, label=lab, label_fontsize=9)

# Forward (real) transitions — faint grey solid arrows
for x1, x2 in zip(nfsp_xs[:-1], nfsp_xs[1:]):
    ax.add_patch(FancyArrowPatch(
        (x1 + 2.0, nfsp_y), (x2 - 2.0, nfsp_y),
        arrowstyle="-", lw=1.0, color=FAINT,
    ))

# Terminal reward sits to the right of s (we are "now")
draw_terminal(53, nfsp_y, fill=ORANGE)
ax.text(53, nfsp_y, "r", ha="center", va="center",
        fontsize=10, color="white", fontweight="bold")

# Backward Bellman arrows — blue, curved, pointing left
for x1, x2 in zip(nfsp_xs[1:], nfsp_xs[:-1]):
    ax.add_patch(FancyArrowPatch(
        (x1 - 2.0, nfsp_y + 0.4), (x2 + 2.0, nfsp_y + 0.4),
        arrowstyle="->", lw=1.5, color=BLUE,
        connectionstyle="arc3,rad=0.35", mutation_scale=12,
    ))
# arrow from terminal back to s
ax.add_patch(FancyArrowPatch(
    (53 - 1.5, nfsp_y + 0.4), (nfsp_xs[-1] + 2.0, nfsp_y + 0.4),
    arrowstyle="->", lw=1.5, color=BLUE,
    connectionstyle="arc3,rad=0.35", mutation_scale=12,
))

ax.text(26, nfsp_y + 6.2, "value backs up through Bellman",
        ha="center", va="bottom", fontsize=10, color=BLUE, style="italic")

# PAST / NOW labels under axis
ax.plot([3, 56], [nfsp_y - 7.5, nfsp_y - 7.5], color=FAINT, lw=1.0)
ax.text(3, nfsp_y - 9, "past", ha="left", va="top", fontsize=9.5,
        color=INK, style="italic")
ax.text(56, nfsp_y - 9, "now", ha="right", va="top", fontsize=9.5,
        color=INK, style="italic")

# Q(s,a) callout
ax.text(46, nfsp_y - 4.5, "$Q(s,a)$", ha="center", va="top",
        fontsize=11, color=INK)

# NFSP update box
ax.add_patch(FancyBboxPatch(
    (3, 11), 56, 8.5,
    boxstyle="round,pad=0.4,rounding_size=0.8",
    facecolor="#e9efff", edgecolor=BLUE, lw=1.3,
))
ax.text(31, 17, "Bellman target",
        ha="center", va="center", fontsize=10, color=BLUE,
        fontweight="bold")
ax.text(31, 14, "$Q(s,a) \\leftarrow r + \\gamma \\max_{a'} Q(s', a')$",
        ha="center", va="center", fontsize=12, color=INK)


# ── Right panel: MCTS — imagined future tree ─────────────────────────────────
mcts_root_x, mcts_root_y = 66, 38
draw_node(mcts_root_x, mcts_root_y, r=2.0, label="$s$", label_fontsize=9)

# Three children
child_x = 78
child_ys = [48, 38, 28]
for cy in child_ys:
    draw_node(child_x, cy, r=1.6, fill=BG)
    ax.add_patch(FancyArrowPatch(
        (mcts_root_x + 2.0, mcts_root_y), (child_x - 1.6, cy),
        arrowstyle="->", lw=1.4, color=ORANGE, mutation_scale=12,
    ))

# Leaves per child — 2 each
leaf_x = 95
leaf_offsets = [3.5, -3.5]
for cy in child_ys:
    for off in leaf_offsets:
        ly = cy + off
        draw_node((leaf_x - 5), ly, r=1.0, fill=BG)
        ax.add_patch(FancyArrowPatch(
            (child_x + 1.6, cy), (leaf_x - 5 - 1.0, ly),
            arrowstyle="->", lw=1.0, color=FAINT, mutation_scale=10,
        ))
        # value square at leaf
        draw_terminal(leaf_x + 1.0, ly, w=2.2, h=2.2, fill=ORANGE)

ax.text(leaf_x + 4.5, 51, "leaf\nvalues",
        ha="left", va="center", fontsize=9, color=ORANGE, style="italic")

ax.text(80, mcts_root_y + 14, "tree expansion via PUCT",
        ha="center", va="bottom", fontsize=10, color=ORANGE, style="italic")

# NOW / FUTURE labels
ax.plot([63, 100], [mcts_root_y - 7.5, mcts_root_y - 7.5],
        color=FAINT, lw=1.0)
ax.text(63, mcts_root_y - 9, "now", ha="left", va="top",
        fontsize=9.5, color=INK, style="italic")
ax.text(100, mcts_root_y - 9, "imagined futures", ha="right", va="top",
        fontsize=9.5, color=INK, style="italic")

# Q(s,a) callout
ax.text(mcts_root_x + 5, mcts_root_y - 4.5, "$Q(s,a)$",
        ha="center", va="top", fontsize=11, color=INK)

# MCTS update box
ax.add_patch(FancyBboxPatch(
    (62, 11), 56, 8.5,
    boxstyle="round,pad=0.4,rounding_size=0.8",
    facecolor="#fbeee0", edgecolor=ORANGE, lw=1.3,
))
ax.text(90, 17, "Backed-up value at $s$",
        ha="center", va="center", fontsize=10, color=ORANGE,
        fontweight="bold")
ax.text(90, 14,
        "$Q(s,a) \\leftarrow \\mathbb{E}_{\\tau \\sim \\text{tree}}"
        "[\\sum_t \\gamma^t r_t]$",
        ha="center", va="center", fontsize=12, color=INK)


# ── Divider ──────────────────────────────────────────────────────────────────
ax.plot([60, 60], [8, 56], color=FAINT, lw=1.0, linestyle="--")


# ── Bottom: the duality ──────────────────────────────────────────────────────
ax.add_patch(FancyBboxPatch(
    (3, 1), 115, 6.5,
    boxstyle="round,pad=0.4,rounding_size=0.8",
    facecolor="#f0e9d8", edgecolor=INK, lw=1.0,
))
ax.text(60.5, 4.4,
        "Both teachers hand the student $\\pi_\\theta$ a better action at $s$ — "
        "NFSP from trajectories that already happened, MCTS from trajectories "
        "that haven't.",
        ha="center", va="center", fontsize=10.5, color=INK)
ax.text(60.5, 2.0,
        "The student doesn't know the difference.",
        ha="center", va="center", fontsize=10.5, color=INK,
        style="italic", fontweight="bold")


plt.savefig("public/images/eric-jang/mcts-nfsp-time-direction.png",
            bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print("wrote public/images/eric-jang/mcts-nfsp-time-direction.png")
