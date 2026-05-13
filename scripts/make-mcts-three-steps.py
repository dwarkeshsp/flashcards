"""Q7 — Three steps of a single MCTS simulation:

  1. Descend by PUCT from root to an unexpanded leaf.
  2. Expand: run the network on the leaf to get a value + child priors.
  3. Back up: walk back to root, incrementing visits and folding the
     new leaf value into each edge's running average Q.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, BLUE_FILL, ORANGE_FILL, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

apply_house_style()

fig, axes = plt.subplots(1, 3, figsize=(13.5, 5.5), dpi=140)
fig.patch.set_facecolor(BG)


# Same tree on all three panels.
LAYOUT = {
    "root": (0.5, 0.92),
    "c1": (0.22, 0.66),
    "c2": (0.50, 0.66),
    "c3": (0.78, 0.66),
    "g1": (0.10, 0.40),
    "g2": (0.34, 0.40),
    "g3": (0.50, 0.40),  # the descent path leaf
    "g4": (0.66, 0.40),
    "g5": (0.90, 0.40),
}
EDGES = [
    ("root", "c1"),
    ("root", "c2"),
    ("root", "c3"),
    ("c1", "g1"),
    ("c1", "g2"),
    ("c2", "g3"),
    ("c3", "g4"),
    ("c3", "g5"),
]
DESCENT_PATH = [("root", "c2"), ("c2", "g3")]


def draw_base_tree(ax, *, highlight_path=None, expand_at=None, backup=False, title=""):
    ax.set_facecolor(BG)
    ax.set_xlim(0, 1)
    ax.set_ylim(0.05, 1.05)
    ax.axis("off")
    ax.set_title(title, color=INK, fontsize=12, pad=8)

    highlight_set = set(highlight_path) if highlight_path else set()

    # Edges
    for a, b in EDGES:
        x1, y1 = LAYOUT[a]
        x2, y2 = LAYOUT[b]
        edge_color = ORANGE if (a, b) in highlight_set else FAINT
        lw = 1.8 if (a, b) in highlight_set else 1.0
        ax.plot([x1, x2], [y1, y2], color=edge_color, lw=lw, zorder=1)

    # Nodes
    for name, (x, y) in LAYOUT.items():
        r = 0.035
        fc = BG
        ec = INK
        if name == "root":
            fc = "#f3eddc"
        ax.add_patch(
            patches.Circle((x, y), r, facecolor=fc, edgecolor=ec, lw=1.0, zorder=2)
        )

    # Expansion: add children under the leaf with a neural-net call-out.
    if expand_at is not None:
        lx, ly = LAYOUT[expand_at]
        for dx in (-0.08, 0.0, 0.08):
            cx, cy = lx + dx, ly - 0.18
            ax.plot([lx, cx], [ly, cy], color=BLUE, lw=1.4, zorder=1)
            ax.add_patch(
                patches.Circle(
                    (cx, cy),
                    0.026,
                    facecolor=BLUE_FILL,
                    edgecolor=BLUE,
                    lw=1.2,
                    zorder=2,
                )
            )
        # Network call-out
        nn_box_x, nn_box_y, nn_box_w, nn_box_h = 0.65, 0.05, 0.32, 0.12
        ax.add_patch(
            FancyBboxPatch(
                (nn_box_x, nn_box_y),
                nn_box_w,
                nn_box_h,
                boxstyle="round,pad=0.01,rounding_size=0.02",
                facecolor=BLUE_FILL,
                edgecolor=BLUE,
                lw=1.2,
            )
        )
        ax.text(
            nn_box_x + nn_box_w / 2,
            nn_box_y + nn_box_h - 0.025,
            "neural net",
            ha="center",
            va="top",
            color=BLUE,
            fontsize=10,
            fontweight="bold",
        )
        ax.text(
            nn_box_x + nn_box_w / 2,
            nn_box_y + nn_box_h - 0.06,
            "$\\to$ priors  $P(a\\mid s)$",
            ha="center",
            va="top",
            color=INK,
            fontsize=9,
        )
        ax.text(
            nn_box_x + nn_box_w / 2,
            nn_box_y + nn_box_h - 0.09,
            "$\\to$ value  $V_\\theta(s)$",
            ha="center",
            va="top",
            color=INK,
            fontsize=9,
        )
        ax.add_patch(
            FancyArrowPatch(
                (lx + 0.02, ly - 0.05),
                (nn_box_x + 0.02, nn_box_y + nn_box_h),
                arrowstyle="->",
                color=BLUE,
                lw=1.2,
                connectionstyle="arc3,rad=0.18",
                mutation_scale=12,
            )
        )

    # Backup: blue arrows along the descent path going UP.
    if backup and highlight_path:
        for a, b in highlight_path:
            x1, y1 = LAYOUT[a]
            x2, y2 = LAYOUT[b]
            ax.add_patch(
                FancyArrowPatch(
                    (x2 - 0.03, y2 + 0.02),
                    (x1 - 0.03, y1 - 0.02),
                    arrowstyle="->",
                    color=BLUE,
                    lw=2.0,
                    mutation_scale=14,
                    connectionstyle="arc3,rad=0.25",
                )
            )
        ax.text(
            0.02,
            0.18,
            "for each edge:\n   $N \\to N + 1$\n   $Q \\to$ running mean",
            ha="left",
            va="top",
            color=BLUE,
            fontsize=9.5,
            family="monospace",
        )


draw_base_tree(
    axes[0],
    highlight_path=DESCENT_PATH,
    title="1.  descend  ·  pick child with max PUCT",
)
draw_base_tree(
    axes[1],
    highlight_path=DESCENT_PATH,
    expand_at="g3",
    title="2.  expand  ·  one forward pass",
)
draw_base_tree(
    axes[2],
    highlight_path=DESCENT_PATH,
    backup=True,
    title="3.  back up  ·  fold $V_\\theta$ into $Q$ along the path",
)

fig.suptitle(
    "One MCTS simulation  (run ~1600 of these per move)",
    y=1.02,
    fontsize=13,
    color=INK,
)

out = Path("public/images/eric-jang/mcts-three-steps.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
