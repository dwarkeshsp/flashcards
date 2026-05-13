---
slug: reiner-pope
title: Reiner Pope
guest: Reiner Pope
blurb: The math behind how LLMs are trained and served
date: 2026-04
youtube: https://youtu.be/xmkSf5IS-zw
substack: https://www.dwarkesh.com/p/reiner-pope
transcript: transcripts/reiner-pope.md
---

# Editing notes

- This Markdown file is the single source of truth for this episode.
  The website, the per-episode `.md` / `.tsv` / `.json` exports, and
  the Anki `.apkg` deck are all generated from it.
- The `lib/episodes/reiner-pope.ts` adapter spreads the parse result
  and adds `transcriptFixes` (the one field the parser doesn't
  handle).
- One card per `## Q:` / `### A:` pair, separated by `---`. Sections
  start with `# Section:` and may have a `timestamp: HH:MM:SS` meta
  line.
- LaTeX: `$...$` inline, `$$...$$` block. Backslashes are written
  once (e.g. `\frac`, `\text{compute}`); there are no doubled
  backslashes anywhere.

---

# Section: How batch size affects token cost and speed
id: batch-size
timestamp: 00:00:00

## Q: Equation for time of one forward pass (hint — it's the result of two different quantities)

### A: $$T = \max(t_{\text{compute}},\ t_{\text{mem}})$$

---

## Q: Equation for $t_{\text{compute}}$ — not accounting for attention

### A:

$$t_{\text{compute}} = \frac{B \cdot N_{\text{active}}}{\text{FLOPs}}$$

where $B$ is batch size, $N_{\text{active}}$ is active parameters, and FLOPs is the compute throughput of the hardware.

---

## Q: Equation for $t_{\text{mem}}$ (hint — there's a contribution from the weights, and from the KV cache)

### A: $$t_{\text{mem}} = \frac{N_{\text{total}} + B \cdot \text{len}_{\text{ctx}} \cdot \text{KV}_{\text{bytes/token}}}{\text{mem\_bw}}$$

---

## Q: Sketch out (in your head) what the graph with batch size on the x-axis and latency on the y-axis looks like — draw the lines for $t_{\text{compute}}$, KV fetch, and weight fetch, then bold the line that corresponds to total latency given a certain batch size.

### A: ![Latency vs. batch size](/images/latency-vs-batch.png)

---

## Q: Where does the lower bound on latency come from? Why can't you just keep decreasing batch size and have infinitesimal total time to process a token?

### A: Because you still have to load all the active parameters into memory.

---

## Q: Why doesn't the time cost of a token keep decreasing indefinitely as you increase batch size? What two things cannot be amortized over the batch?

### A: Compute time, and memory time for KV cache fetches, cannot be amortized with batch size.

---

## Q: On modern hardware, what is the typical ratio of FLOPs / memory bandwidth?

### A: $\sim 300$ FLOPs / byte.

---

## Q: Work through the math that shows that optimal batch size ought to be at least $300 \times$ your sparsity ratio (active / total parameters) to maximize throughput. Ignore KV cache.

### A:

Set compute time = memory time (at equality, both resources are fully saturated):

$$\frac{B \cdot N_{\text{active}}}{\text{FLOPs}} = \frac{N_{\text{total}}}{\text{mem\_bw}}$$

Solve for $B$:

$$B = \frac{\text{FLOPs}}{\text{mem\_bw}} \cdot \frac{N_{\text{total}}}{N_{\text{active}}} = 300 \cdot \frac{1}{\text{sparsity}}$$

So $B \geq 300 / \text{sparsity}$.

**Why:** compute scales with $B$ (each token needs its own matmul), but weight fetches don't (load once, reuse across batch). Need enough tokens to amortize the fetch.

**DeepSeek V3:** $32/256$ active → $B \geq 300 \times 8 = 2{,}400$.

---

## Q: Picture a GPU cluster as a train station: every $\sim$20ms, a "train" departs carrying a batch of sequences through one forward pass (producing one new token per sequence). Why 20ms specifically? What goes wrong if you schedule trains more frequently? How about less frequently?

### A:

20ms is the HBM drain time — memory capacity ÷ memory bandwidth. E.g. Rubin: $288\text{ GB} / 20\text{ TB/s} \approx 15\text{ms}$.

Faster than 20ms is impossible because you physically can't read all the weights from HBM in less time than bandwidth allows.

Slower than 20ms means you're just leaving the FLOPs idle, because there's nothing left to read.

---

# Section: How MoE models are laid out across GPU racks
id: moe-layout
timestamp: 00:32:09

## Q: Why is one rack a natural boundary for an MoE layer?

### A:

MoE communication is all-to-all (any GPU's tokens may route to any other GPU's experts).

Within a rack, NVLink connects every GPU to every other at full bandwidth, which is a perfect fit for all-to-all. Across racks, scale-out is $\sim 8\times$ slower and bottlenecks the all-to-all.

---

# Section: How pipeline parallelism moves model layers across racks
id: pipeline-parallelism
timestamp: 00:47:12

## Q: Why do "bubbles" emerge when pipeline parallelism is used during training?

### A:

At the beginning of the batch, the GPUs dedicated to the final layers are not being used, and conversely at the end of the batch, the GPUs dedicated to the first layers are not being used.

![Pipeline bubbles diagram](/images/pipeline-bubbles.png)

---

## Q: Why can't you overlap batches in training to solve pipeline bubbles?

### A: You need to consolidate gradients and update the model before you process the next batch.

---

## Q: Pipeline parallelism across $P$ stages divides model weights by $P$ per device. Why doesn't it also divide the KV cache by $P$?

### A:

Keeping $P$ stages busy requires $P$ micro-batches in flight, so concurrent sequences scale with $P$.

Given that KV cache often dominates memory at long context lengths, pipelining's value is limited.

---

# Section: Why Ilya said, "As we now know, pipelining is not wise."
id: ilya-pipelining
timestamp: 01:03:37

## Q: Why did Ilya say, "As we now know, pipelining is not wise."

### A: You're adding architecture constraints — things like Kimi's attention-to-residuals (where each block attends to all previous layers' residuals) become very difficult when those residuals live on different pipeline stages. Similarly, interleaving sliding-window and global attention layers could cause load imbalance across stages. Dealing with all this slows down research iteration, which is the greatest sin you can commit.

---

# Section: Because of RL, models may be 100× over-trained beyond Chinchilla-optimal
id: rl-overtraining
timestamp: 01:18:59

## Q: Where does the 6 in the $6ND$ pre-training FLOPs equation come from?

### A: 2 FLOPs per parameter per token for the forward pass (multiply + add). Backward pass is $2\times$ forward because you compute gradients w.r.t. both input matrices. So $2 + 4 = 6$.

---

## Q: Write the equation for total compute cost across pre-training, RL, and inference.

### A:

$$C_{\text{total}} = C_{\text{pretrain}} + C_{\text{RL}} + C_{\text{inference}}$$

$C_{\text{pretrain}} = 6 \times N_{\text{active}} \times D_{\text{pretrain}}$ (the $6ND$ formula — forward + backward)

$C_{\text{RL}} = (2 \text{ to } 6) \times N_{\text{active}} \times D_{\text{RL}} \times \text{inefficiency}$ (2 if you don't train on the rollout and do forward only, up to 6 if you do; inefficiency from low MFU during decode)

$C_{\text{inference}} = 2 \times N_{\text{active}} \times D_{\text{inference}} \times \text{inefficiency}$ (forward pass only; lower MFU during decode)

---

## Q: Why might you naively expect $C_{\text{pretrain}} = C_{\text{RL}} = C_{\text{inference}}$?

### A: If pre-training, RL, and inference costs trade off (more pre-training → less RL/inference needed for same quality, and vice versa), the optimum is approximately where all three are equal.

---

## Q: Solve for $D_{\text{pretrain}} = D_{\text{RL}} = D_{\text{inference}}$, with $\tfrac{1}{3}$ as much MFU from decode as prefill.

### A:

$$6 \times D_{\text{pretrain}} = 3 \times D_{\text{RL}} \times 3 \times \text{inefficiency} = 2 \times D_{\text{inference}} \times 3 \times \text{inefficiency}$$

$$D_{\text{pretrain}} = 1.5\, D_{\text{RL}} = D_{\text{inference}}$$

---

## Q: If a frontier model does 50M tokens/sec globally and is deployed for 2 months, using the analysis above, how many tokens should it be pretrained on?

### A:

$$D_{\text{inference}} \approx 50\text{M tokens/sec} \times 60\text{ days} \times 86{,}400\text{ sec/day} \approx 200\text{T tokens}$$

$$D_{\text{pretrain}} \approx D_{\text{inference}} \approx 200\text{T tokens}$$

---

## Q: The Chinchilla rule is that $D_{\text{optimal}} \approx 20 \times N_{\text{active}}$. If a frontier model has 100B active parameters and is pretrained on 200T tokens, how much over Chinchilla-optimal is it?

### A:

$$D_{\text{chinchilla}} \approx 20 \times 100\text{B} = 2\text{T tokens}$$

$$200\text{T} / 2\text{T} = 100\times$$

---

# Section: Deducing inference memory costs from API pricing
id: api-pricing
timestamp: 01:33:02

## Q: Why does Gemini charge ~ 50% more for tokens above 200K context? At a high level, what's happening?

### A:

Below this point, you're compute bound, where marginal cost per token is flat as context length increases.

Above this point, you're memory time bound, thanks to KV cache growing, and so marginal token cost increases linearly with context length.

---

## Q: Sketch compute and memory time per token as context length increases. Then also sketch the pricing per token and how it changes at the crossover point.

### A: ![Cost vs. context length](/images/cost-vs-context.png)

---

## Q: Given Gemini's 200K crossover, work out the implied bytes-per-token of KV cache. Assume 100B active parameters.

### A:

At the crossover, $t_{\text{compute}} = t_{\text{KV fetch}}$:

$$\frac{B \cdot N_{\text{active}}}{\text{FLOPs}} = \frac{B \cdot \text{len}_{\text{ctx}} \cdot \text{bytes/token}}{\text{mem\_bw}}$$

Solve for bytes/token:

$$\text{bytes/token} = \frac{\text{mem\_bw}}{\text{FLOPs}} \cdot \frac{N_{\text{active}}}{\text{len}_{\text{ctx}}} = \frac{1}{300} \cdot \frac{N_{\text{active}}}{\text{len}_{\text{ctx}}}$$

Plug in: $N_{\text{active}} \approx 100\text{B}$, $\text{len}_{\text{ctx}} = 200\text{K}$ → $\text{bytes/token} \approx 1.7\text{ KB}$.

---

## Q: Output tokens are typically 3–5× more expensive than input tokens. What does that tell us? And why is that?

### A:

MFU during decode is about $\tfrac{1}{5}$ that during prefill.

This is because in prefill, you're processing the whole sequence in parallel, so the weight fetch can be amortized across lots of compute, whereas in decode, you have to load all the weights in just to process one more token, which means you're wasting FLOPs while you're waiting for the weights to show up from memory.

---

## Q: Why are cached input tokens (cache hits) $\sim 10\times$ cheaper than fresh input tokens?

### A: Loading KVs from memory is much cheaper than recomputing.

---

# Section: Convergent evolution between neural nets and cryptography
id: crypto-evolution
timestamp: 02:04:02

## Q: Why do cryptographic protocols have similar high-level architecture to neural networks, where they're basically jumbling information across many layers?

### A: They've both had this convergent evolution where cryptographic protocols need every output bit to depend on every input bit in complicated ways, and similarly, NNs need output to make connections between inputs.

---

## Q: One could argue that NNs and cryptographic protocols use a similar high-level architecture to opposite ends. In what sense are they doing opposite things?

### A: Cryptographic protocols take something which has a lot of structure and make it seem indistinguishable from random. Whereas NNs take something which may look random and extract structure from it.
