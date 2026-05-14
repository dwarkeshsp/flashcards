---
slug: eric-jang
title: Eric Jang
guest: Eric Jang
blurb: Building AlphaGo from scratch
date: 2026-05-08
transcript: transcripts/eric-jang.md
flatten: true
---

# Editing notes

- This Markdown file is the single source of truth for this episode.
  The website, the per-episode .md / .tsv / .json exports, and the
  Anki .apkg deck are all generated from it.
- One card per `## Q:` / `### A:` pair. Card boundaries are `---`
  between cards.
- The `# Section: …` headers below are an editorial scaffold for
  grouping cards. With `flatten: true` in the frontmatter they are
  collapsed into a single rendered section called "All cards". When
  real timestamps are added, flip `flatten: false` and the parsed
  sections (with their `timestamp: HH:MM:SS` lines) will render
  individually.
- LaTeX is inline `$...$` or block `$$...$$`. Markdown italics work;
  bolding is intentionally avoided.
- `<!-- TODO(visual): … -->` lines mark animations I think would
  help. They are ignored by the parser.

---

# Section: Basics of the AlphaGo network

timestamp: 00:46:51

## Q: What is the overall purpose of the AlphaGo neural network in the full program?

### A: To guide and prune the MCTS search.

---

## Q: The AlphaGo network takes in ___ and outputs both ___ and ___.

### A:

- Input: the current board state.
- Outputs: a policy — a probability distribution over the legal moves — and a value — the probability the current player will win.

![AlphaGo network as MCTS guide](/images/eric-jang/network-schematic.png)

---

## Q: We update the AlphaGo network with per-move training labels. What are these labels?

### A:

- For the policy head: the final MCTS visit distribution at that move.
- For the value head: who won the game, projected (with appropriate sign flips for self-play) back through every move.

---

## Q: The AlphaZero loss is composed of two quantities. What are they conceptually, and mathematically?

### A:

Conceptually:

1. Make the value head predict who actually won.
2. Make the policy head predict the MCTS visit distribution at that state.

Mathematically, summed over states visited in self-play:

$$\mathcal{L}(\theta) = \underbrace{\bigl(V_\theta(s) - z\bigr)^2}_{\text{value: MSE vs game outcome } z\in\{-1,+1\}} \;+\; \underbrace{-\,\boldsymbol{\pi}_{\text{MCTS}}(s)^{\top}\log P_\theta(\cdot\mid s)}_{\text{policy: cross-entropy vs MCTS visit distribution}}.$$

---

# Section: How the two heads carve up the game tree

timestamp: 00:42:04

## Q: If there are up to ~361 legal moves per turn and a Go game can last ~300 turns, the naive game tree has on the order of $361^{300}$ trajectories. Which axis does the policy head prune, and which does the value head prune?

### A:

- Policy head prunes breadth. $P(a \mid s)$ goes into PUCT's exploration term, so MCTS spends ~no visits on obviously bad moves.
- Value head prunes depth. When you visit a new node, you just take the value head's prediction of winning for granted and percolate it up the MCTS tree.

![Two heads, two cuts](/images/eric-jang/breadth-depth-tree.png)

---

# Section: Why have a policy head if you already have a value head

timestamp: 00:46:51

## Q: Couldn't we drop the policy head and pick $a^* = \arg\max_a V_\theta(s')$ over the resulting next states $s'$? Why is that a bad idea? Two reasons:

### A:

- To do argmax over the values of potential next moves, you'd have to run a forward pass of the value network up to 361 times — whereas one forward pass of the policy gives you the distribution over all moves at once.
- You can't easily turn MCTS into a single scalar, and the whole point of training is to distill the MCTS search into the model.

---

# Section: Is the MCTS tree preserved between moves

timestamp: 00:44:14

## Q: When AlphaZero is going to make a move, it kicks off MCTS with an empty tree. For each simulation of MCTS (1600 per move), what happens?

### A:

- Keep descending until you explore a new leaf node. Walk down from the root, at each node picking the child whose PUCT score is highest.
- Evaluate the leaf node's policy and value.
- Walk the leaf's value back up to the root (increment each intermediate node's visit count and fold the leaf value into its running average).

![One MCTS simulation](/images/eric-jang/mcts-three-steps-paper.png)

*Figure 2 from [Silver et al., 2017](https://discovery.ucl.ac.uk/id/eprint/10045895/1/agz_unformatted_nature.pdf).*

---

# Section: PUCT — explore vs exploit, and what lives where

timestamp: 00:32:00

## Q: As you keep revisiting a node in MCTS, you choose the child node to explore based on which one has the highest PUCT score, which is calculated as:

$$a^* = \arg\max_a\;\Bigl[\,Q(s,a) + c\,P(s,a)\,\frac{\sqrt{N(s)}}{1 + N(s,a)}\,\Bigr].$$

Early in the search the explore term $c\,P(s,a)\,\dfrac{\sqrt{N(s)}}{1 + N(s,a)}$ dominates, whereas later in the search the exploit term $Q(s,a)$ dominates. Think through why that's a consequence of the formula.

### A:

Unvisited children have a tiny denominator (just $1$), so their explore term is huge — they get tried first. Each subsequent visit makes less-visited siblings relatively more attractive and the move under consideration less attractive: the denominator $1 + N(s,a)$ grows linearly while $\sqrt{N(s)}$ in the numerator grows only as a square root.

The prior $P(s,a)$ sets the order: high-prior moves get the biggest bonus and are tried first, low-prior moves later.

Thus the MCTS-derived $Q$ is leaned on more to determine the value of a node when you have visited it more.

![PUCT explore vs exploit dominance shift](/images/eric-jang/puct-dominance-shift.png)

---

## Q: Of the four search-time quantities in PUCT — $Q(s,a)$, $P(s,a)$, $N(s)$, $N(s,a)$ — which is produced by the neural network and which live in the MCTS tree node?

### A:

- Neural network: $P(s,a)$ — the policy prior, written into a node once, when that node is first expanded.
- MCTS node: $Q(s,a)$, $N(s)$, $N(s,a)$ — all running statistics of the search itself.

---

# Section: How $Q(s,a)$ is updated in an MCTS backup

timestamp: 01:00:00

## Q: When a simulation reaches a newly evaluated leaf and produces a value, every ancestor node on the path back to the root updates its stored $Q$. What statistic does $Q(s,a)$ end up representing?

### A: An online running mean of the leaf values reached by simulations that passed through this edge.

---

# Section: Why winner-imitation plateaus where MCTS distillation doesn't

timestamp: 01:18:14

## Q: Eric ran a self-play loop that used MCTS for action selection but trained the policy net only on the moves from games it *won* (REINFORCE-style winner-imitation). It plateaued at ~50% against KataGo. Why?

### A: Two evenly-matched policies play 100 games of ~300 moves each. By chance, maybe one game is won by a genuinely better move; the other ~50 wins are statistical noise. Imitating winners gives you *one* useful gradient buried inside ~30,000 neutral move labels — drowned out.

MCTS distillation has no credit-assignment problem. Instead of "this game was won, copy these moves," it says: *at every state you visited, here is a strictly better move than the one you played.* Every move becomes a dense per-state supervision target — like DAgger interventions in imitation learning.

![Winner-imitation buried in neutral labels vs MCTS dense supervision](/images/eric-jang/winner-imitation-dilution.png)

---

# Section: MCTS and NFSP — same student, opposite time-directions

timestamp: 02:19:50

## Q: Both MCTS (AlphaZero) and NFSP (AlphaStar) relabel each visited state $s$ with a better action $a^*$ for the student policy to imitate. They differ only in where $a^*$ comes from. What is the duality?

### A:

- NFSP — search backward in time. Bellman/TD backup over trajectories that *already happened*.
- MCTS — search forward in time. UCT tree expansion over trajectories that *haven't happened yet*.

![MCTS and NFSP — same student, opposite time-directions](/images/eric-jang/mcts-nfsp-time-direction.png)

---

# Section: Two reasons MCTS doesn't transfer to LLM reasoning

timestamp: 02:25:20

## Q: In the DeepSeek-R1 paper they said they weren't able to get MCTS to work for LLMs. What were the two big issues?

### A:

- Unbounded breadth. The number of legal actions from a given state (i.e. what further thoughts one could have started from a partial reasoning trace) is essentially unbounded — whereas for Go, there's at most 361 legal next moves.
- Harder to prune depth. Much harder to train a value model to anticipate whether a partial coding or thinking trajectory will result in success than whether a given board state is favorable to you.

![Why MCTS doesn't transfer from Go to LLMs](/images/eric-jang/mcts-go-vs-llm.png)

---

# Section: Inductive biases — convolution vs recurrence

timestamp: 00:47:30

## Q: AlphaGo, AlphaZero, and KataGo all use convolutional ResNets rather than Transformers. Eric tried Transformers for Go at his scale and couldn't beat ResNets. Why do CNN inductive biases fit Go better?

### A:

Most Go fighting is local: captures, ladders, life-and-death problems. Convolutional receptive fields encode "what's near this stone matters most," and a useful local pattern is learned once and reused everywhere on the board.

Eric addendum: "With larger-scale data + compute, transformers can learn these biases from scratch, but it didn't emerge at the scale of experiments I was trying."

---

## Q: The AlphaGo network doesn't take into consideration previous board states. Why can it get away with that, and when would that not be possible?

### A:

Go is a perfect-information game, so the current board encodes all the relevant information — there's a Nash-equilibrium strategy that depends only on $s$.

In hidden-information games like poker or Diplomacy that breaks: the value of your hand depends on the opponent's *earlier* bluffs, alliances, betting patterns. Now you need an architecture that carries state across time (RNN, or Transformer over a history of states), not just one that attends over space.
