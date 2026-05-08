import { Episode } from "../types";

// Drafted from the Eric Jang AlphaGo / AlphaZero blackboard lecture transcript
// and the local video snapshots in public/images/eric-jang-*.jpg.
export const ericJang: Episode = {
  slug: "eric-jang",
  title: "Eric Jang on AlphaGo and AlphaZero",
  guest: "Eric Jang",
  blurb:
    "Candidate practice questions for Eric Jang's blackboard lecture on Go, Monte Carlo tree search, policy/value networks, self-play, and why AlphaGo-style learning differs from LLM RL.",
  date: "2026-05-07",
  transcriptPath: "transcripts/eric-jang.md",
  note:
    "Draft deck generated for review from the transcript plus local blackboard video snapshots. Treat these as candidates: the review artifacts flag likely T2/T3 cards, not final editorial judgment.",
  sections: [
    {
      id: "why-alphago-mattered",
      timestamp: "00:00:34",
      title: "Why AlphaGo was surprising",
      cards: [
        {
          q: "What was the core mystery about AlphaGo that drew Eric Jang back to Go AI?",
          a: "A relatively small neural network seemed to **amortize a very deep game-tree search**: Go looked intractable to brute-force search, yet a learned evaluator could make useful judgments without explicitly rolling out the whole tree.",
        },
        {
          q: "What did KataGo's 2020 result suggest about algorithmic tricks vs. the bitter lesson in Go?",
          a: "KataGo showed that a strong Go bot could be trained with roughly a **40x compute reduction** relative to earlier approaches. Eric's question was which clever tricks still mattered after years of scaling and better tooling, and which could be replaced by simpler bitter-lesson-style compute plus LLM-assisted engineering.",
        },
      ],
    },
    {
      id: "go-rules",
      timestamp: "00:07:36",
      title: "Go mechanics that matter for implementation",
      cards: [
        {
          q: "In Go captures, which neighbors determine whether a stone or group has liberties?",
          a: "Only the **orthogonal** neighbors count, not diagonals. A stone or connected group dies when all of its orthogonal liberties are occupied by the opponent.",
        },
        {
          q: "Why do Go AIs often use Tromp-Taylor scoring rather than ordinary human scoring conventions?",
          a: "Tromp-Taylor scoring is algorithmically unambiguous: keep playing until the board resolves, then count controlled stones plus empty intersections not adjacent to the opponent. Human scoring often stops earlier because both players agree which groups are alive or dead.",
        },
        {
          q: "How does Eric connect ordinary human Go scoring to the idea of a value function?",
          a: "Humans often stop before every local fight is literally played out because they can look at the board and agree which areas are settled. That judgment is like an implicit **value function**: a fast estimate of who wins from a position without exhaustive rollout.\n\n![Eric Jang demonstrating Go scoring on the board](/images/eric-jang-go-scoring.jpg)",
        },
      ],
    },
    {
      id: "mcts-search",
      timestamp: "00:16:51",
      title: "Monte Carlo tree search",
      cards: [
        {
          q: "Why is exhaustive search hopeless for full-size Go?",
          a: "A 19x19 board starts with up to 361 legal moves and games can run hundreds of moves. A naive tree is on the order of hundreds of choices to hundreds of layers deep, far beyond exhaustive enumeration.",
        },
        {
          q: "In Eric's MCTS data structure, what does a node store besides its children?",
          a: "For each action/child, it stores at least:\n\n- a **visit count** $N$\n- a mean action value $Q$\n- a prior action probability $P$\n\nThe action is often implicit: in a deterministic game, the child state tells you which move was taken.",
        },
        {
          q: "In UCB/PUCT-style selection, what are the two jobs of the score being maximized?",
          a: "It combines **exploitation** and **exploration**. The $Q$ term says which action currently looks best; the bonus term pushes search toward actions that are promising under the prior and/or underexplored by visit count.\n\n![Eric Jang's blackboard setup for UCB and PUCT](/images/eric-jang-puct.jpg)",
        },
        {
          q: "What are the four steps of one MCTS simulation in AlphaGo-style search?",
          a: "1. **Selection:** walk down the current tree using PUCT.\n2. **Expansion:** add children at the new leaf.\n3. **Evaluation:** estimate the leaf's value, usually with the value network.\n4. **Backup:** propagate that estimate back up to update visit counts and $Q$ values.\n\n![MCTS loop diagram](/images/eric-jang-mcts-loop.svg)",
        },
      ],
    },
    {
      id: "policy-value-networks",
      timestamp: "00:39:03",
      title: "Policy and value networks",
      cards: [
        {
          q: "Which part of AlphaGo attacks the depth of the search tree, and how?",
          a: "The **value network** attacks depth. Instead of rolling a position all the way to terminal scoring, it estimates the probability of winning from that board state.",
        },
        {
          q: "Which part of AlphaGo attacks the breadth of the search tree, and how?",
          a: "The **policy network** attacks breadth. It gives a prior distribution over plausible good moves, so MCTS does not have to spend equal effort on every legal action.",
        },
        {
          q: "Why can the policy and value heads usually share one neural network trunk?",
          a: "They should learn overlapping board representations. A move the policy thinks is promising should usually lead to states the value head thinks are good; later AlphaGo-style systems exploit that by using one trunk with separate policy and value heads.\n\n![Policy and value heads prune breadth and depth](/images/eric-jang-policy-value.svg)",
        },
      ],
    },
    {
      id: "self-play-learning",
      timestamp: "01:05:01",
      title: "Self-play and policy improvement",
      cards: [
        {
          q: "What is the key training target for the policy network after MCTS runs on a move?",
          a: "The policy is trained to imitate the **improved visit-count distribution** produced by MCTS, not merely the raw move it originally preferred.",
        },
        {
          q: "Why is AlphaGo-style learning more stable than just reinforcing whichever side won a game?",
          a: "MCTS gives a better local target for each move: \"search says this move distribution is better from this state.\" Winner-only imitation gives a sparse trajectory-level signal, so the few genuinely decisive moves are drowned in many neutral moves.",
        },
        {
          q: "Why can MCTS be viewed as an improvement operator in AlphaGo?",
          a: "Given a current policy/value network, MCTS spends extra test-time compute to produce a stronger move distribution. Training the policy to predict that distribution amortizes part of the search into the next network.\n\n![MCTS relabels trajectories with better local actions](/images/eric-jang-credit-assignment.svg)",
        },
        {
          q: "Why is MCTS not guaranteed to improve the raw policy early in training?",
          a: "The search is only as good as its ingredients. If the value estimates are wrong, terminal positions are underrepresented, or the number of simulations is too low, the backup process can propagate bad estimates and produce a worse policy distribution.",
        },
      ],
    },
    {
      id: "llm-rl-analogy",
      timestamp: "02:11:13",
      title: "Connections to LLM reinforcement learning",
      cards: [
        {
          q: "What credit-assignment problem did Eric hit when he tried to train by imitating only winning trajectories?",
          a: "If two policies are near 50/50, a small excess of wins may be caused by one decisive move hidden among thousands of ordinary moves. Training on all winning moves overwhelms the useful signal with neutral labels.\n\n![Eric Jang drawing the credit-assignment analogy to LLM RL](/images/eric-jang-credit-assignment.jpg)",
        },
        {
          q: "Why is AlphaGo's MCTS feedback richer than ordinary trajectory-level RL feedback?",
          a: "Trajectory-level RL asks, \"Did this whole rollout win?\" MCTS asks, at each state, \"After local search, which action distribution looks better?\" That turns sparse end-of-game feedback into much denser per-move supervision.",
        },
        {
          q: "Why doesn't the AlphaGo recipe transfer directly to LLM reasoning?",
          a: "Go has a compact, simulatable action space and a useful value function for truncating search. LLM reasoning has an enormous open-ended action space and no equally reliable local simulator/value function for arbitrary thoughts.",
        },
        {
          q: "What broader lesson does Eric draw from AlphaGo, AlphaFold, and similar systems?",
          a: "Worst-case search may be intractable, but real problem distributions often have exploitable structure. Neural networks can compress or amortize a surprising amount of simulation into a small number of forward-pass layers.",
        },
      ],
    },
  ],
};
