"""Q9 — PUCT explore-vs-exploit dominance shifts as visits accumulate.

Plot two contributions to the PUCT score for a single edge (s,a) as
N_a grows:
  * Exploration term  c * P(s,a) * sqrt(N) / (1 + N_a)  — starts huge,
    decays roughly as 1 / sqrt(N_a) (since the parent visits N grow
    in lockstep).
  * Exploit term  Q(s,a)  — settles to a stable value once enough
    rollouts have averaged through this edge.

A vertical guide marks where the two cross — the "intuition → search-
refined consensus" transition.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import BG, INK, BLUE, ORANGE, FAINT, apply_house_style

import math
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch

apply_house_style()

fig, ax = plt.subplots(figsize=(9.5, 5.5), dpi=140)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)

N_a = np.arange(0, 200)
# Parent visits grow with this child's visits — assume the child gets
# roughly half of all parent visits once it has been chosen
# repeatedly. The qualitative shape only depends on the ratio.
N_parent = np.maximum(1, N_a * 2 + 1)
c_puct = 1.6
prior = 0.35
explore = c_puct * prior * np.sqrt(N_parent) / (1.0 + N_a)

# Q value settles around 0.62 with a bit of noise early.
rng = np.random.default_rng(7)
noise = np.zeros_like(N_a, dtype=float)
for i in range(len(N_a)):
    n = max(1, N_a[i])
    noise[i] = rng.normal(0.0, 0.6 / math.sqrt(n))
Q = 0.62 + noise

ax.plot(N_a, explore, color=ORANGE, lw=2.2, label="exploration term")
ax.plot(N_a, Q, color=BLUE, lw=2.0, label="$Q(s,a)$")

# Crossover marker: first index where Q > explore.
cross_idx = int(np.argmax(Q > explore))
if cross_idx > 0:
    ax.axvline(cross_idx, color=FAINT, lw=1.0, linestyle="--")
    ax.annotate(
        "exploration $\\to$ exploit crossover",
        xy=(cross_idx, max(Q[cross_idx], explore[cross_idx])),
        xytext=(cross_idx + 20, 1.6),
        ha="left",
        va="center",
        color=INK,
        fontsize=10.5,
        arrowprops=dict(arrowstyle="-", color=FAINT, lw=1.0),
    )

# Regime labels.
ax.text(
    cross_idx * 0.3 if cross_idx else 10,
    explore[1] * 0.55,
    "early:  network's prior decides",
    ha="left",
    va="center",
    color=ORANGE,
    fontsize=11,
    style="italic",
)
ax.text(
    160,
    Q.mean() + 0.18,
    "late:  search's $Q$ takes over",
    ha="right",
    va="center",
    color=BLUE,
    fontsize=11,
    style="italic",
)

ax.set_xlabel("$N(s,a)$  —  visits through this edge", color=INK, fontsize=11)
ax.set_ylabel("score contribution", color=INK, fontsize=11)
ax.set_xlim(0, 200)
ax.set_ylim(0, max(explore.max(), Q.max()) * 1.15)
ax.spines["left"].set_color(INK)
ax.spines["bottom"].set_color(INK)
ax.tick_params(colors=INK, labelsize=10)

ax.legend(
    loc="upper right",
    frameon=False,
    fontsize=10.5,
    labelcolor=INK,
)

out = Path("public/images/eric-jang/puct-dominance-shift.png")
plt.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor(), dpi=140)
print(f"wrote {out}")
