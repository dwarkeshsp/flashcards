# Visual style guide for episode flashcards

Read this before producing any image. Visuals are part of the card, not
decoration.

## Decide whether a visual is needed

Add a visual only when one of these is true:

- The lecturer literally drew a diagram, formula, or graph at this moment and
  the card refers to that drawing.
- A simple diagram makes the answer faster to retrieve months later
  (e.g. a 2-axis tradeoff curve, a mechanism with arrows, a tree).
- A reconstructed diagram would replace 3+ sentences of prose.

If a card is about wording, a definition, or a single fact, no visual is
needed. Skip it. A bad visual is worse than no visual.

## Style: match the existing house style

Look at the reference PNGs in `public/images/`:

- `latency-vs-batch.png` — simple 2D plot with a couple of colored line
  segments, light hand-drawn feel, clean sans-serif labels.
- `cost-vs-context.png` — same family, with a step function, dashed lines,
  small inline annotations, axis arrows.
- `pipeline-bubbles.png` — block diagram with light fills, faint dashed
  bubble regions, small legend.

Common style elements to imitate:

- White (or near-white, off-cream `#fafaf7`) background, never black.
- Black axis lines with arrowheads at the far end. Origin is open.
- Two or three accent colors at most. Reuse hues already in the reference
  set: a muted blue (`#3a6fb0`), a warm orange (`#c46c3f`), a faint warm
  brown (`#a08660`), and dashed greys for guide rules.
- Sans-serif labels, lowercase or sentence case, axis names italicized.
  Use `t`, `B`, `len_ctx` style — short and lowercase.
- Optional inline annotations next to lines, never floating titles.
- A short title at the top in plain weight if and only if a title actually
  helps. Most reference plots have one short word.

Things to avoid:

- Photographs of the blackboard. The point of the card is to communicate
  the idea cleanly, and the audience will not see the original board.
- Heavy 3D effects, shadows, gradients, glowing strokes.
- Overly perfect engineering CAD lines. The reference style is slightly
  hand-drawn, like pencil on paper.
- Embedded screenshots from the video. Always reconstruct the diagram.

## How to make the image

You have a Python virtual environment at `.agent-venv/bin/python3` with
`matplotlib` and `Pillow` already installed. Either:

1. Write a small Python script under your card directory called
   `make_visual.py` that uses matplotlib to render the diagram and saves
   it to `visual.png` at 1024x640 or 1024x768.
2. Or hand-write an SVG in `visual.svg` and rasterize it to `visual.png`.

The matplotlib path is preferred. A starting recipe:

```python
import matplotlib.pyplot as plt
from matplotlib import rcParams

rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Helvetica", "Arial", "DejaVu Sans"],
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": True,
    "axes.spines.bottom": True,
})

fig, ax = plt.subplots(figsize=(8.5, 5.3), dpi=120)
fig.patch.set_facecolor("#fafaf7")
ax.set_facecolor("#fafaf7")
ax.tick_params(left=False, bottom=False, labelleft=False, labelbottom=False)
# ... draw your diagram ...
ax.annotate("", xy=(1.03, 0), xycoords="axes fraction",
            xytext=(0, 0), textcoords="axes fraction",
            arrowprops=dict(arrowstyle="->", color="#1a1a1a", lw=1.2))
ax.annotate("", xy=(0, 1.03), xycoords="axes fraction",
            xytext=(0, 0), textcoords="axes fraction",
            arrowprops=dict(arrowstyle="->", color="#1a1a1a", lw=1.2))
plt.savefig("visual.png", bbox_inches="tight", facecolor=fig.get_facecolor())
```

Save the script alongside the image so the visual is reproducible.

## Linking the visual into the card

In `card.json`, set `visual` to `"visual.png"` (a relative path inside the
card directory). The promotion step will copy it to
`public/images/<slug>/<card-id>.png` and rewrite the markdown reference.
You do not need to use absolute paths.

## Anti-checklist before saving

Before declaring done, look at your `visual.png` and answer honestly:

- Could a future reviewer answer the card faster because of this image?
- Are all labels readable at the size it will render?
- Is the color palette in the reference family above?
- Is anything in the image that does not directly support the card's
  retrieval target? Remove it.

If any of those fail, fix or delete the visual.
