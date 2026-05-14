"""Q9 — PUCT explore vs exploit crossover.

Two smooth lines, inline labels, axis arrows. Matches the house style
of public/images/latency-vs-batch.png and cost-vs-context.png.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import numpy as np
import matplotlib.pyplot as plt

apply_house_style()

fig, ax = plt.subplots(figsize=(9.5, 5.0), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)

N = np.linspace(0.1, 100, 400)
# Exploration term: decays as ~ 1 / sqrt(N).
explore = 1.0 / np.sqrt(N + 1) * 2.5
# Q value: smoothly rises and settles around 0.7 (no jagged noise).
Q = 0.7 * (1 - np.exp(-(N) / 12.0))

ax.plot(N, explore, color=ORANGE, lw=2.2)
ax.plot(N, Q, color=BLUE, lw=2.2)

# Inline labels at the right end of each line.
ax.text(N[-1] + 1.5, explore[-1], "explore",
        ha="left", va="center", color=ORANGE, fontsize=11)
ax.text(N[-1] + 1.5, Q[-1], "$Q$",
        ha="left", va="center", color=BLUE, fontsize=12, style="italic")

# Crossover dot.
diff = Q - explore
idx = int(np.argmax(diff > 0))
if idx > 0:
    ax.plot(N[idx], Q[idx], marker="o", markersize=6,
            markerfacecolor=BG, markeredgecolor=INK, mew=1.1, zorder=5)

# Style: axes with arrows, no top/right spines, light tick marks.
ax.set_xlim(0, 110)
ax.set_ylim(0, 2.5)
ax.spines["left"].set_color(INK)
ax.spines["bottom"].set_color(INK)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.tick_params(left=False, bottom=False, labelleft=False, labelbottom=False)

# Axis arrows
ax.annotate("", xy=(110, 0), xytext=(0, 0),
            xycoords="data", textcoords="data",
            arrowprops=dict(arrowstyle="->", color=INK, lw=1.1))
ax.annotate("", xy=(0, 2.5), xytext=(0, 0),
            xycoords="data", textcoords="data",
            arrowprops=dict(arrowstyle="->", color=INK, lw=1.1))

# Axis labels
ax.text(110, -0.08, "$N(s,a)$", ha="right", va="top",
        color=INK, fontsize=12, style="italic")
ax.text(-3, 2.45, "score", ha="right", va="center",
        color=INK, fontsize=11, style="italic")

out = Path("public/images/eric-jang/puct-dominance-shift.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
