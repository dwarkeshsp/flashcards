# Pretraining parallelisms and failed runs

- Substack: https://www.dwarkesh.com/p/notes-on-pretraining-parallelisms
- Total cards: 18

Why pretraining runs fail, and the chain of problems and fixes behind FSDP / pipeline / tensor parallelism.

---

## Why pretraining runs fail

### Q1. Why is breaking causality in training so bad?

The model just learns the trivial solution of copying the answer from the output, and the gradient carries no useful signal.

### Q2. What is expert choice, and why does it break causality?

You split the tokens across experts by which tokens each expert most strongly prefers, so every expert ends up with roughly the same number of tokens.

But which expert token $n$ gets allocated to can depend on which expert token $n + k$ might be routed to.

### Q3. What is token dropping, and why does it break causality?

Experts ignore the tokens in their batch that rank weakly for them, in order to avoid overflowing their padding budget.

This breaks causality because a later token being more strongly matched to an expert can cause an earlier token to be dropped.

### Q4. Why is bias much worse than variance in training?

Variance can average out, but bias compounds.

### Q5. Name the rumored reasons why the Llama 4, Gemini 2 Pro, and GPT-4 training runs got fucked up, respectively.

- Llama 4: expert choice
- Gemini 2 Pro: token dropping
- GPT-4: swamping by accumulator (FP16 collectives losing small gradients to a large running sum)

## Collectives

### Q1. What happens in an all-gather?

Every GPU starts with a different shard. Afterwards, every GPU has the full concatenated result.

### Q2. What happens in an all-reduce?

Each GPU ends up with the element-wise reduction (i.e. sum) across every GPU.

### Q3. What happens in a reduce-scatter?

Each GPU ends up with its $1/K$ shard of the element-wise reduced result.

Strictly cheaper than all-reduce because you skip the final all-gather.

![All-reduce vs reduce-scatter vs all-gather](/images/pretraining/collectives.png)

### Q4. Time cost of an all-gather within one domain of $N$ GPUs, where $B$ is the total payload and $W$ is per-GPU egress bandwidth?

$$T_{\text{AllGather}} = \frac{B \cdot (N - 1)}{W \cdot N}$$

### Q5. Time cost of an all-to-all within one domain of $N$ GPUs is

$$T_{\text{AllToAll}} = \frac{B \cdot (N - 1)}{W \cdot N^2} \approx \frac{B}{W \cdot N}.$$

Explain why.

Each GPU starts with $B / N$ of info. It needs to send $1/N$ of that to each of the $N - 1$ other GPUs.

## Parallelisms

### Q1. What is the problem with data parallelism alone?

Each GPU only has a limited amount of HBM — a B300 is 288 GB — and this is not enough to store the weights as models get bigger, much less their activations.

### Q2. How does fully sharded data parallelism (FSDP) work?

Each GPU stores only $1/N$ of the parameters of each layer. Before processing a layer, you all-gather the full layer's parameters from all the GPUs. After processing, each GPU discards the gathered parameters.

### Q3. Why is it much more trivial to overlap compute and comms for FSDP than it is for, say, expert or tensor parallelism?

The only thing being communicated is the weights, which don't depend on what happened in the layer before, so you can start all-gathering the next layer while still computing the current one.

Tensor and expert parallelism, by contrast, must share activations for one layer before processing the next.

### Q4. Why does FSDP only have a 50% comms volume overhead over vanilla DP? You'd think having to all-gather every layer's full weights, use them for one matmul, then throw them away, would be hugely taxing.

In regular DP, you still need an all-reduce after every layer of the backward pass to sync the batch's gradients across all GPUs. That all-reduce has comms volume $\text{params} \times 2$.

FSDP adds all-gathers — one per layer in the forward pass, one per layer in the backward pass. But an all-gather is half the comms volume of an all-reduce. So naive FSDP comms volume ends up being $\text{params} \times 4$ (all-gather forward and back, plus all-reduce on back).

You can do even better: since each gradient shard only needs to end up on the one GPU that owns it, replace the all-reduce with a reduce-scatter (which skips the final broadcast step). That gets you to $\text{params} \times 3$ total — a 50% overhead over vanilla DP.

### Q5. Why can MFU totally crater as you scale the number of GPUs on FSDP? Why did Dylan joke that FSDP is for the GPU poor?

Compute time decreases as you add more GPUs, but comms time does not.

### Q6. Define the critical batch size.

The batch size beyond which doubling the batch stops halving the number of steps to reach a target loss.

### Q7. Why does FSDP set a batch size floor?

FSDP is data-parallel, so each GPU processes at least one sequence. Attention is computed within a sequence and can't (easily) be split across GPUs.

### Q8. Why do "bubbles" emerge when pipeline parallelism is used during training?

At the beginning of the batch, the GPUs dedicated to the final layers aren't being used; at the end of the batch, the GPUs dedicated to the first layers aren't being used.

You can't overlap batches to fix this because you need to consolidate gradients and update the model before processing the next batch.
