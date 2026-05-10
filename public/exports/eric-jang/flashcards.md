# Eric Jang on AlphaGo and AlphaZero

- Total cards: 10

Practice questions for Eric Jang's blackboard lecture on building AlphaGo from scratch: Go, MCTS, policy and value networks, and how AlphaZero-style learning compares to LLM RL.

> Generated end-to-end by parallel Cursor SDK agents (Opus 4.7) with web search and matplotlib visual tooling. See scripts/pipeline/run.ts.

---

## (01:02:31) — Why AlphaGo's RL is elegant

### Q1. Why does AlphaGo's training avoid the sparse-reward exploration problem that LLM RL has to solve?

Because **MCTS run on top of the current policy net $\pi_\theta$ is a policy-improvement operator**: its visit-count distribution is (typically) a strictly better policy than $\pi_\theta$ itself. So $\pi_\theta$ is just trained to imitate the MCTS distribution — supervised learning on *improved labels*, with no need to first achieve a non-zero success rate by random exploration.

![Why AlphaGo's RL is elegant](/images/eric-jang/alphago-bypasses-sparse-rl.png)

## (01:07) — Self-play as policy improvement

### Q1. In AlphaGo's self-play loop, every position's MCTS visit distribution is used as a supervised label for the policy net. On a test-time-scaling plot (x = num MCTS simulations, y = win rate), what does this distillation step do to the curve from iteration $k$ to iteration $k{+}1$, and why?

Iter $k{+}1$'s curve **starts where iter $k$'s curve ended after $N$ simulations.** Distilling the visit distribution amortizes those $N$ sims of search into the policy weights, so the new "shoot-from-the-hip" net plays at iter $k$'s post-search level for free.

![Self-play as policy improvement](/images/eric-jang/mcts-distillation-amortization.png)

## (02:47:00) — Why MCTS hasn't taken over LLMs

### Q1. AlphaGo's PUCT action selection uses the exploration bonus $C_{\text{PUCT}}\,P(a)\,\dfrac{\sqrt{N}}{1+N_a}$. Why does this term stop guiding search when MCTS is applied over an LLM's ~100k-token vocabulary?

Because you essentially **never sample the same child token more than once**. Across a ~100k-vocab branching factor, $N_a$ stays at 0 (or 1) for almost every action, so the $\sqrt{N}/(1+N_a)$ ratio collapses to roughly the same value everywhere — the "have I tried this child enough times?" signal that PUCT is built around no longer discriminates between actions. The heuristic was designed for Go's ≤361 actions, where the same child is revisited many times per node; that assumption is what breaks for language.

![Why MCTS hasn't taken over LLMs](/images/eric-jang/mcts-fails-on-llms.png)

## (01:30:00) — MCTS algorithm

### Q1. In AlphaGo's MCTS, name the four phases of a single simulation, **in order**.

**select → expand → evaluate → backup**

![MCTS algorithm](/images/eric-jang/mcts-four-steps.png)

## (01:22:50) — Why naive self-play stalls

### Q1. Eric implements a self-play loop against KataGo where, after MCTS rollouts, he supervises the policy on the moves of *winning* games (REINFORCE-style, with the win/lose indicator as the weight). It plateaus at ~50%. He attributes the failure to a single quantitative scaling law on the policy gradient. **What is that scaling, and where does the extra factor of $T$ come from?**

$$\mathrm{Var}\!\left[\nabla_{\!\theta}\,\mathcal{L}\right]\;\propto\;T^{2}$$

in the episode length $T$. The extra factor of $T$ (vs the $\sim T$ you'd get from independent samples) comes from the fact that the per-step log-probs are produced by **the same policy across time**, so the actions are correlated; squaring the sum-over-time inside the variance picks up $\sim T^{2}$ cross-terms. For Go, $T \approx 150$ moves per side, so any single decisive move is buried under noise from the many neutral moves and the gradient carries no usable signal.

![Why naive self-play stalls](/images/eric-jang/naive-winner-imitation-fails.png)

## (00:29:48) — Action selection inside MCTS

### Q1. Write AlphaGo's **PUCT** rule for picking which child to descend into during MCTS, and label what each of its four pieces — $Q(s,a)$, $c_{\mathrm{PUCT}}$, $P(a)$, and $\sqrt{N}/(1+N_a)$ — contributes.

$$a^{\star} \;=\; \arg\max_{a}\;\Bigl[\,Q(s,a)\;+\;c_{\mathrm{PUCT}}\,P(a)\,\frac{\sqrt{N}}{1+N_a}\,\Bigr]$$

- $Q(s,a)$ — **exploit**: mean action value of this child (avg result of rollouts that have gone through it).
- $c_{\mathrm{PUCT}}$ — **exploration weight**: tuning constant trading exploit vs exploration.
- $P(a)$ — **policy prior** from the network: steers exploration toward moves the policy thinks are strong.
- $\dfrac{\sqrt{N}}{1+N_a}$ — **visit-count bonus**: huge when $N_a=0$, decays as that child is sampled, so under-tried children get pulled in.

($N$ = parent's total visits; $N_a$ = visits to this specific child.)

![Action selection inside MCTS](/images/eric-jang/puct-selection-rule.png)

## (03:28:00) — RL vs supervised learning information rate

### Q1. If your policy's pass rate on a token (or trajectory) is $p$, how many bits per sample does cross-entropy supervised learning extract, and how many does naive binary-reward RL extract? What does each do as $p \to 0$?

- **SL (cross-entropy on the labeled token):** $-\log p$ bits per sample, deterministic given the label. Diverges to $\infty$ as $p \to 0$ — every miss tells you exactly how far the predicted distribution sits from the label.
- **RL (binary success/failure):** $H(p) = -p\log p - (1-p)\log(1-p)$ expected bits per sample, averaged over the Bernoulli outcome. Peaks at $1$ bit when $p = 1/2$ (a coin flip), and collapses to $0$ as $p \to 0$ or $p \to 1$.

So a cold policy (tiny $p$) keeps getting unbounded SL signal but a vanishing expected RL signal — "supervision through a straw."

![RL vs supervised learning information rate](/images/eric-jang/supervised-vs-rl-bits-per-sample.png)

## (00:13:59) — Computer Go scoring

### Q1. Why do Go AIs train and resolve games under **Tromp-Taylor** rules instead of standard human (e.g. Chinese) rules?

Tromp-Taylor scoring is **fully algorithmic** — it removes the human "agree this group is dead" consensus step.

- Human rules require both players to agree which stones are dead before counting; if they disagree, they keep playing.
- Tromp-Taylor instead forces play to the **bitter end**: every contested stone has to actually be captured on the board, so the winner is decidable by code with no human-in-the-loop — safe to optimize against in self-play.

## (00:09:48) — Go fundamentals

### Q1. Why does a Go group need *two* eyes (not one) to be unconditionally alive?

Because only one stone is placed per turn. Filling either eye is suicide — the placed stone has 0 liberties because the *other* eye is still a liberty of the surrounding group — so the group can never be reduced to zero liberties. With one eye there is no fallback liberty, so filling it captures the group instead.

![Go fundamentals](/images/eric-jang/two-eyes-unconditionally-alive.png)

## (00:39:03) — Why neural nets help

### Q1. In AlphaGo's MCTS, what does the value head $V_\theta(s)$ compute as a "shortcut for searching to the end of the tree"?

$V_\theta(s) \approx \mathbb{E}[U \mid s]$, the expected terminal outcome of self-play continued from $s$ — one forward pass replaces an exponential-depth rollout the network never explicitly enumerates.

![Why neural nets help](/images/eric-jang/value-function-as-amortized-search.png)
