"""Q11 — Winner-imitation drowns one good move in ~30k neutral labels.

Two stacked panels:
  Top — REINFORCE / winner-imitation. A 100 × 300 grid of (game, move).
        ~99 winning games are statistical noise: their moves are
        "neutral" labels (faint dots). One game out of 100 contains
        the single decisive move: one bright orange cell. The
        gradient signal is buried.

  Bottom — MCTS distillation. Same grid, but every cell is a dense
           per-state supervision target (filled). No credit-
           assignment problem.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, BLUE_FILL, ORANGE_FILL, apply_house_style

import matplotlib.pyplot as plt
from matplotlib import patches
from matplotlib.patches import FancyBboxPatch

apply_house_style()

fig, axes = plt.subplots(2, 1, figsize=(11.5, 6.2), dpi=140)
fig.patch.set_facecolor(BG)


N_GAMES = 100
N_MOVES = 300


def panel(ax, *, label, mode, accent, accent_fill):
    ax.set_facecolor(BG)
    ax.set_xlim(0, N_MOVES)
    ax.set_ylim(0, N_GAMES)
    ax.set_aspect("auto")
    ax.tick_params(left=False, bottom=False, labelleft=False, labelbottom=False)
    for sp in ax.spines.values():
        sp.set_color(FAINT)
        sp.set_linewidth(0.8)

    if mode == "rl":
        # Background tinted neutral.
        ax.add_patch(
            patches.Rectangle(
                (0, 0),
                N_MOVES,
                N_GAMES,
                facecolor=FAINT,
                alpha=0.18,
                edgecolor="none",
            )
        )
        # The single decisive move.
        decisive_game = 73
        decisive_move = 142
        ax.add_patch(
            patches.Rectangle(
                (decisive_move - 1.5, decisive_game - 1.5),
                3,
                3,
                facecolor=accent,
                edgecolor=accent,
                lw=0.5,
            )
        )
        ax.annotate(
            "1 useful gradient",
            xy=(decisive_move + 1.5, decisive_game + 1.5),
            xytext=(decisive_move + 25, decisive_game + 28),
            ha="left",
            va="bottom",
            color=accent,
            fontsize=10.5,
            arrowprops=dict(arrowstyle="->", color=accent, lw=1.0),
        )
        ax.text(
            N_MOVES - 6,
            N_GAMES - 6,
            "$\\sim$30,000 neutral move labels",
            ha="right",
            va="top",
            color=INK,
            fontsize=10,
            style="italic",
        )
    elif mode == "mcts":
        # Every cell is a supervision target.
        ax.add_patch(
            patches.Rectangle(
                (0, 0),
                N_MOVES,
                N_GAMES,
                facecolor=accent_fill,
                edgecolor="none",
            )
        )
        # Subtle grid of dots to convey "every cell has a label".
        xs = list(range(8, N_MOVES, 16))
        ys = list(range(6, N_GAMES, 8))
        for x in xs:
            for y in ys:
                ax.plot(
                    x, y, marker="o", markersize=2.2, color=accent, alpha=0.55
                )
        ax.text(
            N_MOVES - 6,
            N_GAMES - 6,
            "every state $\\to$ a better label  ($s, a^*$)",
            ha="right",
            va="top",
            color=accent,
            fontsize=10,
            fontweight="bold",
            style="italic",
        )

    # Left side panel label.
    ax.text(
        -10,
        N_GAMES / 2,
        label,
        ha="right",
        va="center",
        rotation=90,
        color=INK,
        fontsize=11.5,
        fontweight="bold",
    )

    # Axes annotations.
    ax.text(
        N_MOVES / 2,
        -8,
        "moves within a game  ($\\sim$300)",
        ha="center",
        va="top",
        color=INK,
        fontsize=9.5,
        style="italic",
    )
    ax.text(
        -4,
        N_GAMES / 2,
        "100 games",
        ha="right",
        va="center",
        color=INK,
        fontsize=9.5,
        style="italic",
        rotation=90,
    )


panel(
    axes[0],
    label="winner-\nimitation",
    mode="rl",
    accent=ORANGE,
    accent_fill=ORANGE_FILL,
)
panel(
    axes[1],
    label="MCTS\ndistillation",
    mode="mcts",
    accent=BLUE,
    accent_fill=BLUE_FILL,
)

fig.suptitle(
    "Why imitating winners stalls:  one needle in $\\sim$30k neutral labels",
    y=1.005,
    fontsize=13,
    color=INK,
)
fig.subplots_adjust(hspace=0.55)

out = Path("public/images/eric-jang/winner-imitation-dilution.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
