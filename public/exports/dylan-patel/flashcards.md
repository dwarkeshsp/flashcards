# Dylan Patel on the Dwarkesh Podcast

- Total cards: 8

Practice questions for Dylan Patel, drafted by the agent flashcard pipeline and human-reviewed before promotion.

> Prepared for a future offline pipeline run. Produces review artifacts only; does not edit lib/episodes.

---

## (00:00:00) — 00:00:00 – Why an H100 is worth more today than 3 years ago

### Q1. Why might an H100 become more valuable even after newer GPUs like Blackwell or Rubin arrive?

Better models, cheaper serving, and larger demand can raise the value of each old GPU's output faster than hardware obsolescence lowers it.

## 00:00:00 – Why an H100 is worth more today than 3 years ago continued

### Q1. How can higher fixed compute costs push demand toward better (holding compute constant) AI models?

It is an Alchian-Allen style effect. If two options both inherit the same fixed cost, the higher-quality option becomes cheaper in relative terms. A $2 model versus a $1 model is 2x as expensive; add a $1 compute cost to both, and it is $3 versus $2, only 1.5x. If users must pay a large compute bill anyway, paying a bit more for the best model can look more attractive.

## (00:34:34) — 00:34:34 – ASML will be the #1 constraint for AI compute scaling by 2030

### Q1. How does Dylan translate EUV tool throughput into a rough ceiling on AI data-center gigawatts?

Start with the wafers needed for 1 GW of AI chips: roughly 55k 3 nm wafers, 6k 5 nm wafers, and 170k DRAM wafers. Add up the EUV exposures across those wafers: about 2 million EUV passes. An EUV tool runs about 75 wafers/hour at about 90% uptime, so one AI gigawatt consumes roughly 3.5 EUV tools' worth of annual capacity.

### Q2. Why can't ASML simply double EUV production if demand for AI chips explodes?

EUV scanners are constrained by specialized sub-supply chains, not just ASML's willingness to spend. The tool depends on pieces like the Cymer light source, reticle stage, wafer stage, and Zeiss optics. 

## (01:16:20) — 01:16:20 – The enormous incoming memory crunch

### Q1. Why can't AI accelerators simply replace HBM with commodity DRAM to get more memory bits per wafer?

Because many inference workloads are bandwidth-limited, not just capacity-limited. DDR may give more bits, but if weights and KV cache cannot move fast enough, the expensive compute sits idle. HBM is costly in wafer-area terms because it buys much higher bandwidth, which is often the scarce thing.

## (01:55:03) — 01:55:03 – Space GPUs aren't happening this decade

### Q1. What is the crux of the argument against space GPUs as a near-term solution for AI scaling?

Space optimizes for cheap power, but near-term AI scaling is not mainly bottlenecked on power. It is bottlenecked on chips.

## (01:55:03) — 01:55:03 – Space GPUs aren't happening this decade continued

### Q1. Why might a frontier lab prefer training a smaller model for RL even if a larger model is more capable per rollout?

The smaller model can finish RL and deployment sooner. Even if a larger model is more sample-efficient, its rollouts cost more and take longer, which may more than offset the benefits. 

## (02:24:35) — 02:24:35 – Robots and Taiwan risk

### Q1. Why might future robots rely on centralized cloud intelligence instead of carrying all intelligence onboard?

Cloud models can be larger and more efficient because they can batch inference across many tasks. The robot mainly needs low-latency local control: interpolation, grasping, force feedback, and other fast sensorimotor actions. Longer-horizon planning and richer world knowledge can be computed in the data center and sent back to the robot.
