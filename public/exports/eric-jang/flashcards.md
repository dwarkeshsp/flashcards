# Eric Jang

- Total cards: 15

Building AlphaGo from scratch

---

## All cards

### Q1. What is the overall purpose of the AlphaGo neural network in the full program?

To guide and prune the MCTS search.

### Q2. The AlphaGo network takes in \_\_\_ and outputs both \_\_\_ and \_\_\_.

- Input: the current board state.
- Outputs: a policy — a probability distribution over the legal moves — and a value — the probability the current player will win.

![AlphaGo network as MCTS guide](/images/eric-jang/network-schematic.png)

### Q3. We update the AlphaGo network with per-move training labels. What are these labels?

- For the policy head: the final MCTS visit distribution at that move.
- For the value head: who won the game, projected (with appropriate sign flips for self-play) back through every move.

### Q4. The AlphaZero loss is composed of two quantities. What are they conceptually, and mathematically?

Conceptually:
1. Make the value head predict who actually won.
2. Make the policy head predict the MCTS visit distribution at that state.

Mathematically, summed over states visited in self-play:

$$\mathcal{L}(\theta) \;=\; \underbrace{\bigl(V_\theta(s) - z\bigr)^2}_{\text{value: MSE vs game outcome } z\in\{-1,+1\}} \;+\; \underbrace{-\,\boldsymbol{\pi}_{\text{MCTS}}(s)^{\top}\log P_\theta(\cdot\mid s)}_{\text{policy: cross-entropy vs MCTS visit distribution}}.$$

### Q5. If there are up to ~361 legal moves per turn and a Go game can last ~300 turns, the naive game tree has on the order of $361^{300}$ trajectories. Which axis does the policy head prune, and which does the value head prune?

- Policy head prunes breadth. $P(a \mid s)$ goes into PUCT's exploration term, so MCTS spends ~no visits on obviously bad moves.
- Value head prunes depth. When you visit a new node, you just take the value head's prediction of winning for granted and percolate it up the MCTS tree.

### Q6. Couldn't we drop the policy head and pick $a^* = \arg\max_a V_\theta(s')$ over the resulting next states $s'$? Why is that a bad idea? Two reasons:

- To do argmax over the values of potential next moves, you'd have to run a forward pass of the value network up to 361 times — whereas one forward pass of the policy gives you the distribution over all moves at once.
- You can't easily turn MCTS into a single scalar, and the whole point of training is to distill the MCTS search into the model.

### Q7. During inference, is anything about the MCTS search preserved between moves?

No — the tree is discarded and rebuilt from scratch each move.

### Q8. As you keep revisiting a node in MCTS, you choose the child node to explore based on which one has the highest PUCT score, which is calculated as:
$$a^* = \arg\max_a\;\Bigl[\,Q(s,a) + c\,P(s,a)\,\frac{\sqrt{N(s)}}{1 + N(s,a)}\,\Bigr].$$
Early in the search the explore term $c\,P(s,a)\,\dfrac{\sqrt{N(s)}}{1 + N(s,a)}$ dominates, whereas later in the search the exploit term $Q(s,a)$ dominates. Think through why that's a consequence of the formula.

Unvisited children have a tiny denominator (just $1$), so their explore term is huge — they get tried first. Each subsequent visit makes less-visited siblings relatively more attractive and the move under consideration less attractive: the denominator $1 + N(s,a)$ grows linearly while $\sqrt{N(s)}$ in the numerator grows only as a square root.

The prior $P(s,a)$ sets the order: high-prior moves get the biggest bonus and are tried first, low-prior moves later.

Thus the MCTS-derived $Q$ is leaned on more to determine the value of a node when you have visited it more.

### Q9. Of the four search-time quantities in PUCT — $Q(s,a)$, $P(s,a)$, $N(s)$, $N(s,a)$ — which is produced by the neural network and which live in the MCTS tree node?

- Neural network: $P(s,a)$ — the policy prior, written into a node once, when that node is first expanded.
- MCTS node: $Q(s,a)$, $N(s)$, $N(s,a)$ — all running statistics of the search itself.

### Q10. When a simulation reaches a newly evaluated leaf and produces a value $v$, every ancestor edge $(s,a)$ on the path back to the root updates its stored $Q$. What is the update rule, and what statistic does $Q(s,a)$ end up representing?

$$Q(s,a) \;\leftarrow\; \frac{N(s,a)\,Q(s,a) + v}{N(s,a) + 1}, \qquad N(s,a) \leftarrow N(s,a) + 1.$$

An online running mean of the leaf values reached by simulations that passed through this edge. After $k$ such simulations, $Q(s,a)$ is just their arithmetic average.

### Q11. Eric ran a self-play loop that used MCTS for action selection but trained the policy net only on the moves from games it *won* (REINFORCE-style winner-imitation). It plateaued at ~50% against KataGo. Why?

Two evenly-matched policies play 100 games of ~300 moves each. By chance, maybe one game is won by a genuinely better move; the other ~50 wins are statistical noise. Imitating winners gives you *one* useful gradient buried inside ~30,000 neutral move labels — drowned out.

MCTS distillation has no credit-assignment problem. Instead of "this game was won, copy these moves," it says: *at every state you visited, here is a strictly better move than the one you played.* Every move becomes a dense per-state supervision target — like DAgger interventions in imitation learning.

### Q12. Both MCTS (AlphaZero) and NFSP (AlphaStar) relabel each visited state $s$ with a better action $a^*$ for the student policy to imitate. They differ only in where $a^*$ comes from. What is the duality?

- NFSP — search backward in time. Bellman/TD backup over trajectories that *already happened*. Teacher = greedy $a$ from learned $Q$.
- MCTS — search forward in time. UCT tree expansion over trajectories that *haven't happened yet*. Teacher = visit-count distribution.

From the student's perspective the supervision is identical — the teacher's time-direction is invisible.

![MCTS and NFSP — same student, opposite time-directions](/images/eric-jang/mcts-nfsp-time-direction.png)

### Q13. In the DeepSeek-R1 paper they said they weren't able to get MCTS to work for LLMs. What were the two big issues?

- Unbounded breadth. The number of legal actions from a given state (i.e. what further thoughts one could have started from a partial reasoning trace) is essentially unbounded — whereas for Go, there's at most 361 legal next moves.
- Harder to prune depth. Much harder to train a value model to anticipate whether a partial coding or thinking trajectory will result in success than whether a given board state is favorable to you.

### Q14. AlphaGo, AlphaZero, and KataGo all use convolutional ResNets rather than Transformers. Eric tried Transformers for Go at his scale and couldn't beat ResNets. Why do CNN inductive biases fit Go better?

Most Go fighting is local: captures, ladders, life-and-death problems. Convolutional receptive fields encode "what's near this stone matters most," and a useful local pattern is learned once and reused everywhere on the board.

### Q15. The AlphaGo network doesn't take into consideration previous board states. Why can it get away with that, and when would that not be possible?

Go is a perfect-information game, so the current board encodes all the relevant information — there's a Nash-equilibrium strategy that depends only on $s$.

In hidden-information games like poker or Diplomacy that breaks: the value of your hand depends on the opponent's *earlier* bluffs, alliances, betting patterns. Now you need an architecture that carries state across time (RNN, or Transformer over a history of states), not just one that attends over space.
