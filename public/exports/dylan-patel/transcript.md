## Timestamps

00:00:00 – Why an H100 is worth more today than 3 years ago

00:24:52 – Nvidia secured TSMC allocation early; Google is getting squeezed
00:34:34 – ASML will be the \#1 constraint for AI compute scaling by 2030
00:56:06 – Can’t we just use TSMC’s older fabs?
01:05:56 – When will China outscale the West in semis?
01:16:20 – The enormous incoming memory crunch
01:42:53 – Scaling power in the US will not be a problem

01:55:03 – Space GPUs aren't happening this decade

02:14:26 – Why aren’t more hedge funds making the AGI trade?

02:18:49 – Will TSMC kick Apple out from N2?

02:24:35 – Robots and Taiwan risk

## Transcript

### 00:00:00 – Why an H100 is worth more today than 3 years ago

**Dwarkesh Patel**

All right, this is the episode where my roommate teaches me semiconductors.

**Dylan Patel**

It's also the send off for this current set.

**Dwarkesh Patel**

It is. After you use it, I'm like, "I can't use this again. I gotta get out of here."

**Dylan Patel**

No sloppy seconds for Dwarkesh.

**Dwarkesh Patel**

[Dylan](https://www.dwarkesh.com/p/dylan-jon) is the CEO of [SemiAnalysis](https://semianalysis.com/). Dylan, here’s the burning question I have for you. If you add up the big four—Amazon, Meta, Google, Microsoft—their combined forecasted CapEx this year that you published recently is $600 billion. Given yearly prices of renting that compute, that would be close to 50 gigawatts. Obviously, we're not putting on 50 gigawatts this year, so presumably that's paying for compute that is going to be coming online over the coming years. How should we think about the timeline around when that CapEx comes online?

Similar question for the labs. OpenAI just announced they raised $110 billion, and Anthropic just announced they raised $30 billion. If you look at the compute they have coming online this year—you should tell me how much it is, but is it on the order of another four gigawatts total? The cost to rent the compute that OpenAI and Anthropic will have this year to sustain their compute spend is $10 to $13 billion a gigawatt. Those individual raises alone are enough to cover their compute spend for the year. And this is not even including the revenue that they're going to earn this year.

So help me understand: first, what is the timescale at which the Big Tech CapEx actually comes online? And second, what are the labs raising all this money for if the yearly price of a one-gigawatt data center is $13 billion?

**Dylan Patel**

So when you talk about the CapEx of these hyperscalers being on the order of $600 billion, and you look across the rest of the supply chain, it gets you to the order of a trillion dollars. A portion of this is immediately for compute going online this year: the chips and the other parts of CapEx that get paid this year. But there's a lot of setup CapEx as well.

When we're talking about 20 gigawatts of incremental added capacity this year in America, a portion of this is not spent this year. A portion of that CapEx was actually spent the prior year. When you look at Google having $180 billion, a big chunk of that is spent on turbine deposits for '28 and '29. A chunk of that is spent on data center construction for '27. A chunk of that is spent on power purchasing agreements, down payments, and all these other things they're doing further out into the future so they can set up this super fast scaling. This applies to all the hyperscalers and other people in the supply chain.

So with roughly 20 gigawatts deployed this year, a big chunk is hyperscalers, and a chunk is not. For all of these companies, their biggest customers are Anthropic and OpenAI. Anthropic and OpenAI are at roughly two to two-and-a-half gigawatts right now, and they're trying to scale much larger.

If you look at what Anthropic has done over the last few months, with $4 billion or $6 billion in revenue added, we can just draw a straight line and say they'll add another $6 billion of revenue a month. People would argue that’s bearish, and that they should go faster. What that implies is they're going to add $60 billion of revenue across the next ten months. At the current gross margins Anthropic had, as last reported by media, that would imply they have roughly $40 billion of compute spend for that inference, for that $60 billion of revenue.

That $40 billion of compute, at roughly $10 billion a gigawatt in rental costs, means they need to add four gigawatts of inference capacity just to grow revenue. That’s assuming their research and development training fleet stays flat. In a sense, Anthropic needs to get to well above five gigawatts by the end of this year. It's going to be really tough for them to get there, but it's possible.

**Dwarkesh Patel**

Can I ask a question about that? If Anthropic was not on track to have five gigawatts by the end of this year, but it needs that to serve both the revenue that's gone crazier than expected—and maybe it's going to be even more than that—plus the research and training to make sure its models are good enough for next year: Where is that capacity going to come from?

**Dylan Patel**

[Dario, when he was on your podcast](https://www.dwarkesh.com/p/dario-amodei-2), was very conservative. He said, "I'm not going to go crazy on compute because if my revenue inflects at a different rate, at a different point… I don't want to go bankrupt. I want to make sure that we're being responsible with this scaling." But in reality, he's screwed the pooch compared to OpenAI, whose approach was, "Let's just sign these crazy fucking deals."

OpenAI has got way more access to compute than Anthropic by the end of the year. What does Anthropic have to do to get the compute? They have to go to lower-quality providers that they would not have gone to before. Anthropic historically had the best quality providers, like Google and Amazon, the biggest companies in the world. Now Microsoft is expanding across the supply chain, and they're going to other newer players.

OpenAI has been a bit more aggressive on going to many players. Yes, they have tons of capacity from Microsoft, Google, and Amazon, but they also have tons with [CoreWeave](https://en.wikipedia.org/wiki/CoreWeave) and Oracle. They've gone to random companies, or companies one would think are random, like [SoftBank Energy](https://www.wsj.com/tech/ai/openai-softbank-to-invest-1-billion-in-sb-energy-fa7385b9), who has never built a data center in their life but is building data centers now for OpenAI. They've gone to many others, like [NScale](https://www.nscale.com/), to get capacity.

There's this conundrum for Anthropic because they were so conservative on compute, because they didn't want to go crazy. In some sense, a lot of the financial freakouts in the second half of last year were because, “OpenAI signed all these deals but they didn't have the money to pay for them…” Okay, Oracle's stock is going to tank, CoreWeave's stock is going to tank. All these companies' stocks tanked, and credit markets went crazy because people thought the end buyer couldn't pay for this. Now it's like, "Oh wait, they raised a ton of money. Okay, fine, they can pay for it."

Anthropic was a lot more conservative. They were like, "We'll sign contracts, but we'll be principled. We'll purposely undershoot what we think we can possibly do and be conservative because we don't want to potentially go bankrupt."

**Dwarkesh Patel**

The thing I want to understand is, what does it mean to have to acquire compute in a pinch? Is it that you have to go with [neoclouds](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-evolution-of-neoclouds-and-their-next-moves)? Do they have worse compute? In what way is it worse?

Did you have to pay gross margins to a cloud provider that you wouldn't have otherwise had to pay because they're coming in at the last minute? Who built the spare capacity such that it's available for Anthropic and OpenAI to get last minute?

What is the concrete advantage that OpenAI has gotten if they end up at similar compute numbers by 2027? Are they just going to end this year with different gigawatts? If so, how many gigawatts are Anthropic and OpenAI going to have by the end of this year?

**Dylan Patel**

To acquire excess compute, yes, there is capacity at hyperscalers. Not all contracts for compute are long-term, five-year deals. There's compute from 2023 or 2024, or H100s from 2025, that were signed at shorter terms. The vast majority of OpenAI's compute is signed on five-year deals, but there were many other customers that had one-year, two-year, three-year, or six-month deals, on demand.

As these contracts roll off, who is the participant in the market most willing to pay price? In this sense, we've seen H100 prices inflect a lot and go up. People are willing to sign long-term deals for above $2 even. I've seen deals where certain AI labs—I'm being a little bit vague here for a reason—have signed at as high as $2.40 for two to three years for H100s. If you think about the margin, it costs $1.40 to build Hopper, across five years. Now, two years in, you're signing deals for two to three years at $2.40? Those margins are way higher.

Now you can crowd out all of these other suppliers, whether Amazon had these, or CoreWeave, or [Together AI](https://www.together.ai/), or [Nebius](https://nebius.com/), or whoever it is. These neoclouds are the firms that had a higher percentage of Hopper in general because they were more aggressive on it. They also tended to sign shorter-term deals, not CoreWeave but the others. So if I want Hopper, there is some capacity out there.

Also, while most of the capacity at an Oracle or a CoreWeave is signed for a long-term deal in terms of Blackwell, anything that's going online this quarter is already sold. In some cases, they're not even hitting all the numbers they promised they would sell because there are some data center delays, not just those two, but Nebius, Microsoft, Amazon, and Google. But there are a lot of neoclouds, as well as some of the hyperscalers, who have capacity they're building that they haven't sold yet, or capacity they were going to allocate to some internal use that is not necessarily super AGI-focused, that they may now turn around and sell.

Or in the case of Anthropic, they don't have to have all the compute directly. Amazon can have the compute and serve [Bedrock](https://aws.amazon.com/bedrock/), or Google can have the compute and serve [Vertex](https://cloud.google.com/vertex-ai), or Microsoft can have the compute and serve [Foundry](https://azure.microsoft.com/en-us/products/ai-foundry), and then do a revenue share with Anthropic, or vice versa.

**Dwarkesh Patel**

Basically, you're saying Anthropic is having to pay either this 50% markup in the sense of the revenue share, or in the sense of last-minute spot compute that they wouldn't have otherwise had to pay had they bought the compute early.

**Dylan Patel**

Right, there's a trade-off there. But at the same time, for a solid four months, everyone was saying to OpenAI, "We're not going to sign deals with you." That sounds crazy, but it was because, “you don’t have the money.” Now everyone's saying, "OpenAI, we believed you the whole time. We can sign any deal because you've raised all this money." Anthropic is constrained in that sense. There are not that many incremental buyers of compute yet, because Anthropic hit the capability tier first where their revenue is mooning.

**Dwarkesh Patel**

That's interesting. Otherwise you might think having the best model is an extremely depreciating asset, because three months later you don't have the best model. But the reason it's important is that you can sign these deals, lock in the compute in advance, and get better prices.

Maybe this is an obvious point. But at least until recently, people had made this huge point about the [depreciation cycle of a GPU](https://www.cnbc.com/2025/11/14/ai-gpu-depreciation-coreweave-nvidia-michael-burry.html). The bears, the [Michael Burrys](https://x.com/michaeljburry/status/1987918650104283372?lang=en) or whoever, have said, "Look, people are saying four or five years for these GPUs. Maybe it's because the technology is improving so fast, but it in fact makes sense to have two-year depreciation cycles for these GPUs," which increases the reported amortized CapEx in a given year and makes it financially less lucrative to build all these clouds.

But in fact you’re pointing out that maybe the depreciation cycle is even longer than five years. If we're using Hoppers—especially if AI really takes off and in 2030 we’re saying, "We have to get the seven-nanometer fabs up, we have to go back and turn on the A100s again"—then the depreciation cycle is actually incredibly long. I feel like that's an interesting financial implication of what you're saying.

**Dylan Patel**

There's a few strings to pull on there. One is, what happens to depreciation of GPUs? I guess I didn't answer your prior question, which is that I think Anthropic will be able to get to five gigawatts-ish, maybe a little bit more by the end of the year through themselves as well as their product being served through Bedrock, Vertex, or Foundry. I think they'll be able to get to five or six gigawatts, which is way above their initial plans. OpenAI will be roughly the same, actually a little bit higher based on our numbers.

But anyway, the depreciation cycle of a GPU. Michael Burry was saying it's three years or less. That’s sort of his argument. There are two lenses to look at this. Mechanically, there's a [TCO model](https://www.investopedia.com/terms/t/totalcostofownership.asp), total cost of ownership of a GPU, where we project pricing out for GPUs and build up the total cost of a cluster. There are a number of costs: your data center cost, your networking cost, your smart hands and people in the data center swapping stuff out. There's your spare parts, your actual chip cost, your server cost. All these various costs get lumped together. There's some depreciation cycles on it, certain credit costs on it.

You build up to, “Hey, an H100 costs $1.40/hour to deploy at volume across five years if your depreciation is five years.” If you sign a deal at $2/hour for those five years, your gross margin is roughly 35%. It's a little bit above that. If you sign it for $1.90, it's 35% roughly. Then you assume at that fifth year, the GPU falls off a bus and is dead.

In some cases, the argument people are making is if you didn't sign a long-term deal, because every two years NVIDIA is tripling or quadrupling the performance while only 2X-ing or 50% increasing the price… Then the price of an H100… Sure maybe the value in the market was $2 at 35% gross margins in 2024, but in 2026, when Blackwell is in super high volume and deploying millions a year, you’re actually now worth $1/hour. And when Rubin in '27 is in super high volume—even though it starts shipping this year, it’s super high volume next year—doing millions of chips a year deployed into clouds, you've got another 3X in performance, another 50% or 2X in price, then the Hopper is only worth $0.70/hour. So the price of a GPU would continue to fall. That's one lens.

The other lens is, what is the utility you get out of the chip? If you could build infinite Rubin or infinite of the newest chip, then yes, that's exactly what would happen. The price of a Hopper would fall at a spot or short-term contract rate as the new chips come out and the price per performance goes up. But because you are so limited on semiconductors and deployment timelines, what actually prices these chips is not the comparative thing I can buy today, but rather what is the value I can derive out of this chip today.

In that sense, let's take [GPT-5.4](https://openai.com/index/introducing-gpt-5-4/). GPT-5.4 is both way cheaper to run than GPT-4 and has fewer active parameters. It's much smaller, in that sense of active parameter, because it's a sparser [MoE](https://en.wikipedia.org/wiki/Mixture_of_experts) versus GPT-4 being a coarser MoE. There's also been so many other advancements in training, [RL](https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf), model architecture, and data qualities that have made GPT-5.4 way better than GPT-4. And it's cheaper to serve. When you look at an H100, it can serve more tokens per GPU of 5.4 than if you had ran GPT-4 on it. So it's producing more tokens of a model that is of higher quality.

What is the maximum TAM for GPT-4 tokens? Maybe it was a few billion dollars, maybe it was tens of billions of dollars. Adoption takes time. For GPT-5.4, that number is probably north of a hundred billion. But there's an adoption lag, there's competition, and there's the constant improvements that everyone else is having. If improvements stopped here, the value of an H100 is now predicated on the value that GPT-5.4 can get out of it instead of the value that GPT-4 can get out of it. These labs are in a competitive environment, so their margins can't go to infinity. You sort of have this dynamic that is quite interesting in that an H100 is worth more today than it was three years ago.

**Dwarkesh Patel**

That's crazy. It's also interesting from the perspective of just taking that forward. If we had actual AGI models developed, if we had a genuine human on a server… These are such hand wave-y numbers about how many flops the brain can do. But on a flop basis, an H100 is estimated to do 1e15, which is how much some people estimate the human brain does in flops. Obviously, in terms of memory, the human brain has way more. An H100 is 80 gigabytes, and the brain might have petabytes.

**Dylan Patel**

Oh, yeah, you've got petabytes? Name a petabyte of ones and zeros, bro. Name me a string.

**Dwarkesh Patel**

Well, this is actually the point.

**Dylan Patel**

No, we’ve just got the best [sparse attention](https://medium.com/@vishal09vns/sparse-attention-dad17691478c) techniques ever.

**Dwarkesh Patel**

Genuinely though. In the amount of information that is compressed, it might be petabytes. The brain is an extremely sparse MoE. But anyways, imagine a human knowledge worker can produce six figures a year of value. If an H100 can produce something close to that, if we had actual humans on a server, the value of an H100 is such that it can repay itself in the course of a couple of months.

So when I interviewed Dario, the point I was trying to make is not that I think the [singularity](https://en.wikipedia.org/wiki/Technological_singularity) is two years away and therefore Dario desperately needs to buy more compute, although the revenue is certainly there that he needs to buy more compute. The point I was trying to make is that given what Dario seems to be saying—given his statements that we're two years away from a data center of geniuses, and certainly not more than five years away, and a data center of geniuses should be earning trillions upon trillions of dollars of revenue—it just does not make sense why he keeps making these statements about being more conservative on compute or, to your point, being less aggressive than OpenAI on compute.

I guess that point got lost because then people were roasting me, saying, "Oh, this podcaster is trying to convince this multi-hundred billion dollar company CEO to YOLO it, bro." I was just trying to say that internally, his statements are inconsistent. Anyway, it's good to iron it out.

**Dylan Patel**

I think going back to the earlier view that if the models are so powerful, the value of a GPU goes up over time, right now only OpenAI and Anthropic have that viewpoint. But as we approach further out, everyone is going to be able to see that value skyrocket per GPU. So in that sense, you should commit now to compute.

Interestingly, in Anthropic fashion, there's a bit of a meme that they have commitment issues and are sort of polyamorous. Not Dario, but this is a bit of a meme.

**Dwarkesh Patel**

Explains everything. By the way, there's this interesting economic effect called [Alchian-Allen](https://en.wikipedia.org/wiki/Alchian%E2%80%93Allen_effect), which is the idea that if you increase the fixed cost of different goods, one of which is higher quality and one which is lower quality, that will make people choose the higher quality good, on the margin.

To give a specific example, suppose the better-tasting apple costs two dollars and the shittier apple costs one dollar. Now suppose you put an import tariff on them. Now it's $3 versus $2 for a great apple versus a medium apple.

**Dylan Patel**

Is that because they both increased by a dollar, or should it be a 50% increase?

**Dwarkesh Patel**

No, because they both increased by $1. The whole effect is that if there's a fixed cost that is applied to both. Then the price difference between them, the ratio, changes. Previously, the more expensive one was 2X more expensive. Now it's just 1.5X more expensive.

So I wonder if applied to AI that would mean that, if GPUs are going to get more expensive, there will be a fixed cost increase in the price of compute. As a result, that will push people to be willing to pay higher margins for slightly better models. Because the calculus is, I'm going to be paying all this money for the compute anyway. I might as well just pay slightly more to make sure it's the very best model rather than a model that's slightly worse.

**Dylan Patel**

So the Hopper went from $2 to $3. If a Hopper can make a million tokens of Opus and it can make two million tokens of Sonnet, the price differential between Opus and Sonnet has decreased because the price of the GPU has increased by a dollar from $2 to $3.

Interesting. I think that makes a ton of sense. We just see all of the volumes are on the best models today, all the revenue is on the best models today. In a compute-limited world, two things happen. One, companies that don't have commitment issues and have these five-year contracts for compute have locked in a humongous margin advantage. They've locked in compute for five years at the price it transacted at two, three, or five years ago.

Whereas if you're three years into that five-year contract and someone else's two-year or three-year contract rolled off, and now they're trying to buy that at modern pricing, when it's priced to the value of models, the price is going to be up a lot more. So the person who committed early has better margins in general. The percentage of the market that is in long-term contracts is much larger than the percentage of the market in short-term contracts that can be this flex capacity you add at the last second.

At the same time, where does the margin go? Because models get more valuable, how much can the cloud players flex their pricing? If you look at CoreWeave, their average term duration is over three years right now. For ninety-eight percent plus of their compute, it's over three years. They end up with this conundrum where they can't actually flex price. But every year they're adding incrementally way more capacity than they had previously.

This year alone, Meta's adding as much capacity as they had in their entire fleet of compute and data centers for all purposes for serving WhatsApp, Instagram, and Facebook in 2022, and doing AI. They're adding that alone this year.

In the same sense, you talk about Meta doing that, CoreWeave, Google, and Amazon, all these companies are adding insane amounts of compute year on year. That new compute gets transacted at the new price. In a sense, yes, you've locked in, as long as we're in a takeoff. "Oh, OpenAI went from six hundred megawatts to two gigawatts last year, and from two gigawatts to six plus this year, and six to twelve next year." The incremental added compute is where all the cost is, not the prior long-term contracts.

Then who holds the cards is the infra providers for charging margin. Now the cloud players, the neoclouds, or the hyperscalers can charge the margin. They can to some extent, but then as you go upstream to who has access to all the memory and logic capacity, it's Nvidia for the most part. They've signed a lot of long-term contracts. They've got ninety billion dollars of long-term contracts today, and they're negotiating three-year deals today with the memory vendors.

You've got Amazon and Google through [Broadcom](https://en.wikipedia.org/wiki/Broadcom), Amazon directly, and [AMD](https://en.wikipedia.org/wiki/AMD). These companies hold all the cards because they've secured the capacity. TSMC is not raising prices, but memory vendors are, to some extent, raising a lot of price. They're going to double or triple price again, but then they're also signing these long-term deals.

Who is able to accrue all the margin dollars is potentially the cloud, potentially the chip vendors, and the memory vendors, until TSMC or ASML break out and say, "No, we're going to charge a lot more." But at the same time, do the model vendors get to charge crazy margins? At least this year, we're going to see margins for the model vendors go up a lot. Because they're so capacity constrained, they have to destroy demand. There's no way Anthropic can continue at the current pace without destroying demand.

### 00:24:52 – Nvidia secured TSMC allocation early; Google is getting squeezed

**Dwarkesh Patel** 1:20:33

Let's get into logic and memory. How specifically has Nvidia been able to lock up so much of both? I think according to your numbers, by '27, Nvidia is going to have \+70% of [N3](https://en.wikipedia.org/wiki/3_nm_process) wafer capacity, or around that area. I forget what the numbers were for memory at [SK Hynix](https://en.wikipedia.org/wiki/SK_Hynix) and [Samsung](https://en.wikipedia.org/wiki/Samsung_Electronics) and so forth.

Think about how the neocloud business works and how Nvidia works with that, or how the RL environment business works and how Anthropic works with that. In both those cases, Nvidia is purposely trying to fracture the complementary industry to make sure that they have as much leverage as possible. They're giving allocation to random neoclouds to make sure that there's not one person that has all the compute.

Similarly, Anthropic or OpenAI, when they're working with the data providers, they say, "No, we're going to just seed a huge industry of these things so that we're not locked into any one supplier for data environments."

And I wonder why on the 3 nm process—that's going to be [Trainium 3](https://newsletter.semianalysis.com/p/aws-trainium3-deep-dive-a-potential), that's going to be [TPU v7](https://docs.cloud.google.com/tpu/docs/tpu7x), other accelerators potentially—why is TSMC just giving it all up to Nvidia rather than trying to fracture the market?

**Dylan Patel**

There are a couple points here. On 3 nm, if we go back to last year, the vast majority of 3 nm was Apple. Apple is being moved to 2 nm. Memory prices are going up, so Apple's volumes may go down. As memory prices go up, either they cut margin or they move on. There's some time lag because they have long-term contracts, but Apple likely reduces demand or moves to 2 nm faster, where 2 nm is only capable of mobile chips today. In the future, AI chips will move there. So Apple has that.

Apple is also talking to third-party vendors because they're getting squeezed out of TSMC a little bit. TSMC's margins on high-performance computing—[HPC](https://www.tsmc.com/english/dedicatedFoundry/technology/platform_HPC), AI chips, et cetera—are higher than they are for mobile, because they have a bigger advantage in HPC than they do in mobile.

When you look at TSMC’s running calculus here, they're actually providing really good allocations to companies that are doing CPUs. When you think about Amazon having Trainium and [Graviton](https://aws.amazon.com/ec2/graviton/), both of those are on 3 nm, Graviton being their CPU, Trainium being their AI chip. TSMC is much more excited to give allocation to Graviton than they are to Trainium because they view the CPU business as more stable, long-term growth.

As a company that is conservative and doesn't want to ride cycles of growth too hard, you actually want to allocate to the market that is more stable with a lower growth rate first before you allocate all the incremental capacity to the fast growth rate market. That is the case generally. Same for AMD. The allocations they get on their CPUs, TSMC is much more excited about those than they are for GPUs. Likewise for Amazon.

Nvidia is a bit unique because yes, they have CPUs, they make switches, they make networking, NVLink, InfiniBand, Ethernet, NICs. By and large, most of these things will be on 3 nm by the end of this year with the Rubin launch and all the chips in that family, the GPU being the most important one. Yet Nvidia is getting the majority of supply.

Part of this is because you look at the market and TSMC and others forecast market demand in many ways, but it's also the market signal. The market signaled, "Hey, we need this much capacity next year. We need this much. We'll sign non-cancelable, non-returnable. We may even pay deposits." Nvidia just did it way earlier than Google or Amazon. In some cases, Google and Amazon had stumbling blocks. One of the chips got delayed slightly by a couple quarters. Trainium and all these sorts of things happened.

In that case, there was a huge sort of, “Well, these guys are delaying, but Nvidia is wanting more, more, more, more. And we are checking with the rest of the supply chain, is there enough capacity?” They're going to all the [PCB](https://en.wikipedia.org/wiki/Printed_circuit_board) vendors and saying, "Is there enough PCB?" [Victory Giant](https://en.shpcb.com/) is one of the largest suppliers of PCBs to Nvidia, and they're a Chinese company. All the PCBs come from China, or many of them. They're like, "Do you have enough PCB capacity? Great. Hey memory vendors, who has all the memory capacity? Okay, Nvidia does. Great."

When you look at who is AGI-pilled enough to buy compute on long timelines at levels that seem ridiculous to people who aren't AGI-pilled—but nonetheless, they're willing to pay a pretty good margin and sign it now because they view in the future that ratio is screwed up—the same thing happens with the supply chain for semiconductors. I don't think Nvidia is quite AGI-pilled. Jensen doesn't believe software is going to be fully automated and all these things.

**Dwarkesh Patel**

Accelerated computing, not AI chips, right?

**Dylan Patel**

It's AI chips.

**Dwarkesh Patel**

But that's what he calls it, right?

**Dylan Patel**

Yeah. I think it's a broader term, AI is within that, but also physics modeling and simulations.

**Dwarkesh Patel**

But it's like he's not embracing the main use case.

**Dylan Patel**

I think he's embracing it, but I just don't think he's AGI-pilled like Dario or Sam. But he's still way, way more AGI-pilled than Google was in Q3 of last year, or Amazon was in Q3 of last year, and he saw way more demand.

The reason is pretty simple. You can see all the data center construction. He's like, "Okay, I want to have this market share." We have all the data centers tracked, and there's a lot of data centers that could be one or the other. To some extent, Google and Amazon, Google especially, even though their TPU is just better for them to deploy, they have to deploy a crap load of GPUs because they don't have enough TPUs to fill up their data centers. They can't get them fabbed.

**Dwarkesh Patel**

I have a question about that. Google sold a million, was it the v7s?

**Dylan Patel**

Yes.

**Dwarkesh Patel**

—the [Ironwoods](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/ironwood-tpu-age-of-inference/) to Anthropic, and you're saying the big bottleneck right now, this year or next year, I guess going forward forever now, is going to be the logic and memory, the stuff it takes to build these chips. Google has DeepMind, the third prominent AI lab. If this is the big bottleneck, why would they sell it rather than just giving it to DeepMind?

**Dylan Patel**

This is again a problem of… DeepMind people were like, "This is insane. Why did we do this?" But Google Cloud people and Google executives saw a different thought process.

You and I know the compute team at Anthropic. Both of the main people came from Google. They saw this dislocation, they negotiated a deal, and they were able to get access to this compute before Google realized. The chain of events, at least from our data that we found, was in early Q3, over the course of six weeks, we saw capacity on TPUs go up by a significant amount. It went up multiple times in those six weeks.

There were multiple requests. Google even had to go to TSMC and explain to them why they needed this increase in capacity because it was so sudden. A lot of that capacity increase was for selling to Anthropic. Because Anthropic saw it before Google.

And then Google had [Nano Banana](https://gemini.google/overview/image-generation/) and [Gemini 3](https://blog.google/products-and-platforms/products/gemini/gemini-3/) which caused their user metrics to skyrocket. Then leadership at Google was like, "Oh." Then they started making [the statement that we have to double compute every six months](https://www.cnbc.com/2025/11/21/google-must-double-ai-serving-capacity-every-6-months-to-meet-demand.html), or whatever the exact number was.

They really woke up a lot more, and then they went to TSMC and said, "We want more. We want more." TSMC replied, "Sorry guys, we're sold out. We can maybe get 5-10% more for 2026, but really we're going to work on 2027."

There was this information asymmetry among the labs, in my mind. I don't know exactly. It's the narrative I've spun myself from seeing all the data in the supply chain on wafer orders and what's going on with the data centers that Anthropic and [Fluidstack](https://www.fluidstack.io/) signed.

It's pretty clear to me that Google screwed up. You can see this from Google's Gemini ARR. They had next to nothing in Q1 to Q3—in Q3 a little bit once they started inflecting. But in Q4 they reached $5 billion in revenue on an ARR basis. It's clear Google didn't see revenue skyrocket initially. In a sense, Anthropic had a little bit of commitment issues before their ARR exploded, even though they had far more information asymmetry and saw what was coming down the pipe. Google is going to be more conservative than Anthropic and Google had even less ARR. So they were just not willing to do it, and then they realized they should do it.

Since then, Google has gotten absurdly AGI-pilled in terms of what they're doing. They bought an energy company. They're putting deposits down for turbines. They're buying a ridiculous percentage of powered land. They're going to utilities and negotiating long-term agreements. They're doing this on the data center and power side very aggressively. I think Google woke up towards the end of last year, but it took them some time.

**Dwarkesh Patel**

How many gigawatts do you think Google will have by the end of next year?

**Dylan Patel**

Buy my data.

**Dwarkesh Patel**

You charge for that kind of information.

**Dylan Patel**

Yes, yes.

### 00:34:34 – ASML will be the \#1 constraint for AI compute scaling by 2030

I feel like every year the bottleneck for what is preventing us from scaling AI compute keeps changing. A couple years ago it was [CoWoS](https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm). Last year it was power. You'll tell me what the bottleneck is this year.

But I want to understand five years out, what will be the thing that is constraining us from deploying the singularity?

**Dylan Patel**

The biggest bottleneck is compute. For that, the longest lead time supply chains are not power or data centers. They're actually the semiconductor supply chains themselves. It switches back from power and data centers as a major bottleneck to chips.

In the chip supply chain, there's a number of different bottlenecks. There's [memory](https://en.wikipedia.org/wiki/Semiconductor_memory), [logic wafers](https://www.asml.com/en/technology/all-about-microchips/microchip-basics) from [TSMC](https://en.wikipedia.org/wiki/TSMC), and the [fabs](https://en.wikipedia.org/wiki/Semiconductor_fabrication_plant) themselves. Construction of the fabs takes two to three years, versus a data center which takes less than a year. We've seen Amazon build data centers in as fast as eight months. There's a big difference in lead times because of the complexity of building the fab that actually makes the chips. The tools also have really long lead times.

The bottlenecks, as we've scaled, have shifted based on what the supply chain is currently not able to do. It was CoWoS, power, and data centers, but those were all shorter lead time items. CoWoS is a much simpler process of [packaging chips](https://anysilicon.com/the-ultimate-guide-to-semiconductor-packaging/) together. Power and data centers are ultimately way simpler than the actual manufacturing of the chips. There's been some sliding of capacity across mobile or PC to data center chips, which has been somewhat fungible.

Whereas CoWoS, power, and data centers have had to start anew as supply chains. But now there's no more capacity for the mobile and PC industries—which used to be the majority of the semiconductor industry—to shift over to AI. [Nvidia](https://en.wikipedia.org/wiki/Nvidia) is now the largest customer at TSMC and [SK Hynix](https://en.wikipedia.org/wiki/SK_Hynix), the largest memory manufacturer. It's sort of impossible for the sliding of resources away from the common person's PCs and smartphones to shift any more towards the AI chips. So now the question is how do we scale AI chip production? That's the biggest bottleneck as we go to 2030\.

**Dwarkesh Patel**

It would be very interesting if there's an absolute gigawatt ceiling that you can project out to 2030 based just on "We can't produce more than this many [EUV](https://en.wikipedia.org/wiki/Extreme_ultraviolet_lithography) machines."

**Dylan Patel**

To scale compute further, there are different bottlenecks this year and next year, but ultimately by 2028 or 2029, the bottleneck falls to the lowest rung on the supply chain, which is [ASML](https://en.wikipedia.org/wiki/ASML_Holding). ASML makes the world's most complicated machine: an [EUV tool](https://www.asml.com/en/products/euv-lithography-systems). The selling price for those is $300-400 million. Currently, they can make about 70\. Next year, they'll get to 80\. Even under very aggressive supply chain expansion, they only get to a little bit over 100 by the end of the decade.

What does that mean? They can make a hundred of these tools by the end of the decade, and 70 right now. How does that actually translate to AI compute? We see all these numbers from [Sam Altman](https://en.wikipedia.org/wiki/Sam_Altman) and many others across the supply chain: gigawatts, gigawatts, gigawatts. How many gigawatts are we adding? We see [Elon saying a hundred gigawatts in space](https://www.dwarkesh.com/p/elon-musk).

**Dwarkesh Patel**

A year.

**Dylan Patel**

A year. The problem with any of these numbers, or the challenge to these numbers, is actually not the power or the data center. We can dive into that, but it's manufacturing the chips.

Take a gigawatt of Nvidia's [Rubin](https://www.nvidia.com/en-us/data-center/technologies/rubin/) chips. Rubin is announced at [GTC](https://en.wikipedia.org/wiki/Nvidia_GTC), I believe the week this podcast goes live. To make a gigawatt worth of data center capacity of Nvidia's latest chip that they're releasing towards the end of this year, you need a few different wafer technologies. You need about 55,000 wafers of [3 nm](https://en.wikipedia.org/wiki/3_nm_process). You need about 6,000 wafers of [5 nm](https://en.wikipedia.org/wiki/5_nm_process), and then you need about 170,000 wafers of [DRAM](https://en.wikipedia.org/wiki/Dynamic_random-access_memory) memory.

Across these three different buckets, each requires different amounts of EUV. When you manufacture a wafer, there are thousands and thousands of process steps where you're depositing material and removing them. But the key critical step—which at least in [advanced logic](https://www.appliedmaterials.com/us/en/semiconductor/markets-and-inflections/advanced-logic.html) is 30% of the cost of the chip—is something that doesn't actually put anything on the wafer. You take the wafer, you deposit [photoresist](https://en.wikipedia.org/wiki/Photoresist), which is a chemical that chemically changes when you expose it to light. Then you stick it into the EUV tool, which shines light at it in a certain way. It patterns it. There's what's called a [mask](https://agcem.com/products/euv-mask-blanks/), which is effectively a stencil for the design.

When you look at a leading-edge 3 nm wafer, it has 70 or so masks, 70 or so layers of lithography, but 20 of them are the most advanced EUV. If you need 55,000 wafers for a gigawatt, and you do 20 EUV passes per wafer, you can do the math. That's 1.1 million passes of EUV for a single gigawatt. It's pretty simple. Once you add the rest of the stuff, it ends up being 2 million, across 5 nm and all the memory. You're at roughly 2 million EUV passes for a single gigawatt.

These tools are very complicated. When you think about what it's doing across a wafer, it's taking the wafer and scanning and stepping across. It does this dozens of times across the whole wafer. When you're talking about how many EUV passes, that’s the entire wafer being exposed at a certain rate.

An EUV tool can do roughly 75 wafers per hour, and the tool is up roughly 90% of the time. In the end, you need about three and a half EUV tools to do the 2 million EUV wafer passes for the gigawatt. So three and a half EUV tools satisfies a gigawatt.

It's funny to think about the numbers. What does a gigawatt cost? It costs roughly $50 billion. Whereas what do three and a half EUV tools cost? That's $1.2 billion. It's actually quite a lower number, which is interesting to think about. Fifty gigawatts of economic [CapEx](https://www.investopedia.com/terms/c/capitalexpenditure.asp) in the data center, and what gets built on top of that in terms of tokens is even larger. It might be $100 billion worth of AI value into the supply chain, held up by this $1.2 billion worth of tooling that simply cannot expand its supply chain quickly.

**Dwarkesh Patel**

You wrote an article recently saying over the last three years, TSMC has done $100 billion of CapEx. So it's $30/$30/$40 billion. A small fraction of that is being used by Nvidia for the 3 nm, or previously 4 nm, that it's using for its chips. What were its earnings last quarter? It was $40 billion. So $40 billion times four is $160 billion. Nvidia alone is turning some small fraction of $100 billion in CapEx, which is going to be depreciated over many years and not just this one year, into $160 billion in a single year.

That gets even more intense when you go down the supply chain to ASML, which is taking a billion dollars' worth of machines to produce a gigawatt. Of course, those machines last for more than a year so it’s doing more than that.

Now I want to understand, how many such machines will there be by 2030, if you include not just the ones that are sold that year, but have been compiling over the previous years? What does that imply? Sam Altman says he wants to do a gigawatt a week in 2030\. When you add up those numbers, is it compatible with that?

**Dylan Patel**

That's completely compatible, if you think about it. TSMC and the entire ecosystem have something like 250 to 300 EUV tools already. Then you stack on 70 this year, 80 next year, growing to 100 by 2030\. You're at 700 EUV tools by the end of the decade. 700 EUV tools, at three and a half tools per gigawatt—assuming it's all allocated to AI, which it's not—gets you to 200 gigawatts worth of AI chips for the data centers to deploy.

Sam wants 52 gigawatts a year. He's only taking 25% share then. Obviously, there's some share given to mobile and PC, assuming we're even allowed to have consumer goods still and we don't get priced out of them. But roughly, he's saying 25% market share of the total chips fabbed. That's very reasonable given that this year alone, I think he's going to have access to 25% of the [Blackwell GPUs](https://en.wikipedia.org/wiki/Blackwell_\(microarchitecture\)) that are deployed. It's not that crazy.

**Dwarkesh Patel**

When did ASML start shipping EUV tools, when [7 nm](https://en.wikipedia.org/wiki/7_nm_process) started? I don't know when that was exactly. You're saying in 2030, they're going to be using machines that initially were shipped in 2020\. So for ten years, you're using the same most important machine in this most technologically advanced industry in the world? I find that surprising.

**Dylan Patel**

ASML's been shipping EUV tools now for roughly a decade, but it only entered mass volume production around 2020\. The tool's not the same. Back then, the tools were even lower throughput. There are various specifications around them called [overlay](https://en.wikipedia.org/wiki/Overlay_control). I was mentioning you're stacking layers on top of each other. You'll do some EUV, you'll do a bunch of different process steps—depositing stuff, etching stuff, cleaning the wafer—dozens of those steps before you do another EUV layer.

There's a spec called overlay, which is: you did all this work, you drew these lines on the wafer, now I want to draw these dots. Let's say I want to draw these dots to connect these lines of metal to holes, and then the next layer up is another set of lines going perpendicular, so now you're connecting wires going perpendicular to each other. You have to be able to land them on top of each other. It's called overlay.

Overlay is a spec that's been improved rapidly by ASML. Wafer throughput has been improved rapidly by ASML. The price of the tool has gone up, but not as much as the capabilities of the tool. Initially, the EUV tools were $150 million. Over time, they're now $400 million as I look out to 2028\. But the capabilities of the tools have more than doubled as well, especially on throughput and overlay accuracy, which is the ability to accurately align the subsequent passes on top of each other even though you do tons of steps between.

ASML is improving super rapidly. It's also noteworthy to say that ASML is maybe one of the most generous companies in the world. They have this linchpin thing. No one has anything competitive. [Maybe China will have some EUV by the end of the decade](https://www.reuters.com/world/china/how-china-built-its-manhattan-project-rival-west-ai-chips-2025-12-17/), but no one else has anything even close to EUV, and yet they haven't taken price and margins up like crazy. You go ask some other folks that we talk to all the time, like [Leopold](https://www.dwarkesh.com/p/leopold-aschenbrenner), and they're like, "Let's have the price go up." Because they can. The margin is there. You can take the margin. Nvidia takes the margin. Memory players are taking the margin. But ASML has never raised the price more than they've increased the capability of the tool.

In a sense, they've always provided net benefit to their customers. It's not that the tool is stagnant, it's just that these tools are old. Yes, you can upgrade them some, and the new tools are coming. For simplicity's sake, we're ignoring the advances in overlay or throughput per tool for this podcast.

**Dwarkesh Patel**

You say we're producing 60 of these machines this year and then 70, 80 over subsequent years. What would happen if ASML just decided to double its CapEx or triple its CapEx? What is preventing them from producing more than 100 in 2030? Why are you so confident that even five years out, you can be relatively sure what their production will be?

**Dylan Patel**

I think there are a couple factors here. ASML has not decided to just go YOLO, let's expand capacity as fast as possible. In general, the semiconductor supply chain has not. It's lived through the booms and busts, and we can talk a bit more about it. Basically some players have recently woken up, but in general no one really sees demand for 200 gigawatts a year of AI chips, or trillions of dollars of spend a year in the semiconductor supply chain. They're not AI-pilled. They're not AGI-pilled.

**Dwarkesh Patel**

We're going to get to a trillion dollars this year.

**Dylan Patel**

Yeah, I feel you, but I'm saying no one really understands this in the supply chain. Constantly, we're told our numbers are way too high, and then when they're right, they're like, "Oh, yeah, but your next year's numbers are still too high."

ASML's tool has four major components. It has the source, which is made by [Cymer](https://www.asml.com/en/company/about-asml/cymer) in San Diego. It has the [reticle stage](https://www.linkedin.com/posts/asml_asmls-reticle-stage-activity-7315418259040694274-DNW7/), which is made in Wilmington, Connecticut. It has the wafer stage. It has the optics, the lenses and such. Those last two are made in Europe.

When you look at each of these four, they're tremendously complex supply chains that, (A) they have not tried to expand massively, and (B) when they try to expand them, the time lag is quite long. Again, this is the most complicated machine that humans make, period, at any sort of volume.

Let's talk about the source specifically. What does the source do? It drops these tin droplets. It hits it three subsequent times with a laser perfectly. The first one hits this tin droplet, it expands out. It hits it again, so it expands out to this perfect shape, and then it blasts it at super high power. The tin droplets get excited enough that they release EUV light, 13.5 nanometer, and then it's in this thing that is collecting all the light and directing it into the lens stack.

Then you have the lens stack, which is Carl Zeiss, as you mentioned, and some other folks, but Zeiss being the most important part of it. They also have not tried to expand production capacity because they don't see... They're like, "We're growing a lot because of AI. We're growing from 60 to 100." It's like, "No, no, no. We need to go to a couple hundred, but it's fine. Whatever."

Each of these tools has, I think, 18 of these lenses, effectively. They are multilayer mirrors, which are perfect layers of molybdenum and ruthenium, if I recall correctly, stacked on top of each other in many layers, and then the light bounces off of it perfectly. When we think about a lens, it's in a shape, and it focuses the light. This is like a mirror that's also a lens, so it's pretty complicated. Any defect in these super thinly deposited stacks will mess it up. Any curvature issues will mess it up.

There are a lot of challenges with scaling the production. It's quite artisanal in this sense because you're not making tens of thousands of these a year, you're making hundreds, you're making thousands. 60 tools a year, 18 of these per tool, you’re still in the hundreds, of tools, or you're at the thousand number roughly for these lenses and projection optics.

Then you step forward to the reticle stage, which is also something really crazy. This thing moves at, I want to say, nine Gs. It will shift nine Gs because as you step across a wafer, the tool will go... The wafer stage is complementary. It's the wafer part. You line these two things up. You're taking all the light through the lenses that's focused, and here's the reticle, here's the wafer. The reticle's moving one direction, the wafer's moving the other direction as it scans a 26x33 millimeter section of the wafer, and then it stops. It shifts over to another part of the wafer and does it again. It does that in just seconds. Each of them is moving at nine Gs in opposite directions.

Each of these things is a wonder and marvel of chemistry, fabrication, mechanical engineering, and optical engineering, because you have to align all these things and make sure they're perfect. All of these things have crazy amounts of metrology because you have to perfectly test everything. If anything is messed up, the yield goes to zero, because this is such a finely tuned system.

By the way, it's so large that you're building it in the [factory in Eindhoven, Netherlands](https://www.asml.com/en/company/about-asml/locations/veldhoven), and they're deconstructing it and shipping it on many planes to the customer site, and then you're reassembling it there and testing it again. That process takes many, many months.

There are so many steps in the supply chain, whether it's Zeiss making their lenses and projection optics or Cymer, which is an ASML-owned company, making the EUV source. Each of these has its own complex supply chain. ASML has commented that their supply chain has over ten thousand people in it.

**Dwarkesh Patel**

Like individual suppliers?

**Dylan Patel**

Yes. It might not be directly. It might be through Zeiss having so many suppliers and XYZ company having so many suppliers.

If you just think about it, you're talking about two physically moving objects that are the size of a wafer, and it has to be accurate to the level of single-digit nanometers or even smaller because the entire system, the overlay, the layer-to-layer overlay variation, has to be on the order of 3 nanometers. If the overlay is 3 nms, that means each individual part, the accuracy of its physical movement has to be even less than that. It has to be sub-one nanometer in most cases, because the error of these things stack up. There's no way to just snap your fingers and increase production.

Things as simple as power. The US going from zero percent power growth to two percent power growth, even though China's already at thirty, was so hard for America to do. And that's a really simple supply chain with very few people in it who make difficult things. There are probably 100,000 electricians and people who work in the electricity supply chain, or more, in the US?

When you look at ASML, they employ so few people. Carl Zeiss probably employs less than a thousand people working on this, and all of those people are super, super specialized. You can't just train random people up for this in the snap of a finger. You can't just get your entire supply chain to get galvanized.

Nvidia's had to do a lot to get the entire supply chain to even deliver the capacity they're going to make this year. When you go talk to [Anthropic](https://en.wikipedia.org/wiki/Anthropic), they're like, "We're short of [TPUs](https://en.wikipedia.org/wiki/Tensor_Processing_Unit), we're short of training, and we're short of [GPUs](https://en.wikipedia.org/wiki/Graphics_processing_unit)." When you go talk to [OpenAI](https://en.wikipedia.org/wiki/OpenAI), they're like, "We're short of these things."

OpenAI and Anthropic know they need X. Nvidia is not quite as AGI-pilled. They're building X \- 1\. You go down the supply chain, everyone's doing X \- 1\. In some cases, they're doing X ÷ 2, because they're not AGI-pilled.

You end up with this time lag for the whip to react. The AI-pilledness and the desire to increase production takes so long. Once they finally understand that they need to increase production rapidly… They think they understand. They think AI means we have to go from 60 to 100, in addition to the tools getting better and faster, the source getting higher power from 500 watts to 1,000, and all these other aspects of the supply chain advancing technically and increasing production. They think they're actually increasing production a lot.

But if you flow through the numbers… What does Elon want? He wants 100 gigawatts a year in space by 2028 or 2029\. Sam Altman wants 52 gigawatts a year by the end of the decade. Anthropic probably needs the same, and Google needs that. You go across the supply chain, and it's like, wait, no, the supply chain can't possibly build enough capacity for everyone to get what they want on the side of compute.

### 00:56:06 – Can’t we just use TSMC’s older fabs?

**Dwarkesh Patel**

I feel like in the data center supply chain for the last few years, people have been making arguments like, “We are bottlenecked by this specific thing, therefore AI compute can't scale more than X.” But as you've written about, if the grid is a bottleneck, then we just do [behind the meter](https://www.enelnorthamerica.com/insights/blogs/what-does-btm-behind-the-meter-mean) on the site, we do gas turbines, et cetera. If that doesn't work, there are all these other alternatives that people fall back on.

I want to ask whether we can imagine a similar thing happening in the semiconductor supply chain. If EUV becomes a bottleneck, what if we just went back to 7 nm and did what China is doing currently, producing 7 nm chips with [multi-patterning](https://en.wikipedia.org/wiki/Multiple_patterning) with [DUV](https://en.wikipedia.org/wiki/Ultraviolet) machines? If you look at a 7 nm chip like the [A100](https://www.nvidia.com/en-us/data-center/a100/), there's been a lot of progress obviously from the A100 to the [B100](https://www.exxactcorp.com/blog/hpc/comparing-nvidia-tensor-core-gpus) or [B200](https://www.nvidia.com/en-us/data-center/dgx-b200/).

How much of that progress is just numerics? If you just hold [FP16](https://en.wikipedia.org/wiki/Half-precision_floating-point_format) constant from A100 to B100. The B100 is a little over one petaflop, and the A100 is like 300 teraflops.

**Dylan Patel**

Yeah, 312\.

**Dwarkesh Patel**

Holding numerics constant, you have a 3x improvement from A100 to B100. Some of that is the process improvement, some of that is just the accelerator design improving, which we could replicate again in the future.

It seems there's actually a very small effect from the process improving from 7nm to 4 nm. I don't know the numbers offhand but let's say there's 150k wafers per month of 3 nm and eventually similar amounts for [2 nm](https://en.wikipedia.org/wiki/2_nm_process). But then there's a similar amount for 7 nm.

If you have all those old wafers and there's maybe a 50% haircut because the bits per wafer area are 50% less or something, it doesn't seem that bad to just bring on 7 nm wafers if that gives you another fifty or hundred gigawatts. Tell me why that's naive.

**Dylan Patel**

We potentially do go crazy enough that this happens because we just need incremental compute, and the compute is worth the higher cost and power of these chips. But it's also unlikely to a large extent because some of these are not fair comparisons.

For example, from A100, which is 312 teraflops, to Blackwell, which is 1,000 or 2,000 FP16, and then Rubin is 5,000 or so FP16… It's not a fair comparison because these chips have vastly different design targets. With A100, Nvidia optimized for FP16 and [BF16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) numerics. When you look at [Hopper](https://en.wikipedia.org/wiki/Hopper_\(microarchitecture\)), they didn't care as much about that; they cared about [FP8](https://en.wikipedia.org/wiki/Minifloat). When you look at Rubin, they don’t care about FP16 and BF16 so much, they care mostly about [FP4](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/) and FP6. Numerics are what they've designed their chip for.

Let's say we make a new chip design on 7 nm, optimized for the numerics of the modern day. The performance difference is still going to be much larger than the FLOPS difference you mentioned. Often it's easy to boil things down to FLOPS per watt or FLOPS per dollar, but that's not a fair comparison.

Let's look at [Kimi K2.5](https://www.kimi.com/ai-models/kimi-k2-5) and [DeepSeek](https://en.wikipedia.org/wiki/DeepSeek). When you look at those two models and their performance on Hopper versus Blackwell on very optimized software, you get vastly different performance. Most of this is not attributed to FLOPS or numerics, because those models are actually eight-bit. So it's not like Blackwells and Hopper are both optimized for eight-bit, and Blackwell is not really taking advantage of its four-bit there. The performance gulf is actually much larger.

Sure it's one thing to shrink process technology and make the transistor smaller so each chip has X number of FLOPS, but you forget the big gating factor. These models don't run on a single chip. They run on hundreds of chips at a time. If you look at DeepSeek's production deployment, which is well over a year old now, they were running on 160 GPUs. That's what they serve production traffic on. They split the model across 160 GPUs.

Every time you cross the barrier from one chip to another, there is an efficiency loss. You have to transmit over high-speed electrical [SerDes](https://en.wikipedia.org/wiki/SerDes), which brings a latency cost and a power cost. There are all these dynamics that hurt. As you shrink and shrink the [process node](https://en.wikipedia.org/wiki/MOSFET#Scaling), you've increased the amount of compute in a single chip. Now in-chip movement of data is at least tens of terabytes a second, if not hundreds of terabytes a second. Whereas between chips, you're on the order of a terabyte a second.

Then you have this movement of data between chips that are super close to each other physically. You can only put so many chips close to each other physically, so you have to put chips in different racks. The movement of data between racks is on the order of hundreds of gigabits a second, 400 gig or 800 gig a second, so roughly 100 gigabytes a second.

So you have this huge ladder: on-chip communication is super fast, within the rack is an order of magnitude slower, and outside the rack is an order of magnitude lower than that. As you break the bounds of chips, you end up with a performance loss.

The reason I explain this is because when you look at Hopper versus Blackwell, even if both are using a rack's worth of chips, Hopper is significantly slower. The amount of performance you have leveraged to the task within each domain—tens of terabytes a second of communication between these processing elements versus terabytes a second between these processing elements—is much, much higher and therefore the performance is much higher. When you look at inference at 100 tokens a second for DeepSeek and Kimi K2.5, the performance difference between Hopper and Blackwell is on the order of 20x.

It's not 2x or 3x like the FLOPS performance difference indicates, even though those are on the same process node. There are just differences in networking technologies and what they've worked on. You can translate some of these back, but when you look at what they're doing on 3 nm with Rubin, some of those things are simply not possible to do all the way back on A100, even if you make a new chip for 7 nm.

There are certain architectural improvements you can port and certain ones you cannot. The performance difference is not just going to be the difference in FLOPS. It's in some senses cumulative between the difference in FLOPS per chip, networking speed between chips, how many FLOPS are on a chip versus a system, and memory bandwidth on a single chip versus an entire system. All of these things compound.

**Dwarkesh Patel**

Can I ask you a very naive question? The B200 now has two [dies](https://en.wikipedia.org/wiki/Die_\(integrated_circuit\)) on a single chip, so you can get that bandwidth without having to go through [NVLink](https://en.wikipedia.org/wiki/NVLink) or [InfiniBand](https://en.wikipedia.org/wiki/InfiniBand). Next year, [Rubin Ultra](https://arstechnica.com/ai/2025/03/nvidia-announces-rubin-ultra-and-feynman-ai-chips-for-2027-and-2028/) will have four dies on one chip. What is preventing us from just doing that with an older… How many dies could you have on a single chip and still get these tens of terabytes a second?

**Dylan Patel**

Even within Blackwell, there are differences in performance when you're communicating on the chip versus across the chips. Those bounds are obviously much smaller than when you're going out of the entire chip. When you scale the number of chips up, there is some performance loss. It's not perfect, but it is way better than different entire packages.

How large can [advanced packaging](https://en.wikipedia.org/wiki/Advanced_packaging_\(semiconductors\)) scale? The way Nvidia is doing it is CoWoS. Google, Broadcom, MediaTek, and Amazon's [Trainium](https://aws.amazon.com/ai/machine-learning/trainium/) are all doing CoWoS. But actually you can go look back at what Tesla did with [Dojo](https://en.wikipedia.org/wiki/Tesla_Dojo), which they cancelled and restarted. Dojo was a chip that was the size of an entire wafer. They had 25 chips on it. There were some tradeoffs. They couldn't put [HBM](https://en.wikipedia.org/wiki/High_Bandwidth_Memory) on it. But the positive side was that they had 25 chips on it. To date, it is still probably the best chip for running [convolutional neural networks](https://en.wikipedia.org/wiki/Convolutional_neural_network). It's just not great at [transformers](https://en.wikipedia.org/wiki/Transformer_\(deep_learning\)) because the shape of the chip, the memory, the arithmetic, and all these various specifications are just not well-suited for transformers. They're well-suited for CNNs.

Dojo chips were optimized around that, and they made a bigger package. But as you make packages bigger and bigger, you have other constraints: networking speed, memory bandwidth, and cooling capabilities. All of these things start to rear their heads. It's not simple. But yes, you will see a trend line of more chips on the package, and yes, you're going to be able to do that on 7 nm.

In fact, that's what Huawei did with their [Ascend 910C](https://www.tomshardware.com/tech-industry/artificial-intelligence/deepseek-research-suggests-huaweis-ascend-910c-delivers-60-percent-nvidia-h100-inference-performance) or [D](https://www.tomshardware.com/tech-industry/artificial-intelligence/huawei-ascend-ai-910d-processor-designed-to-take-on-nvidias-blackwell-and-rubin-gpus). They initially put one, and then they did two. They're focusing on scaling the packaging up because that is an area where they can advance faster than process technology where they can't shrink. But at the end of the day, that’s something you can do on the leading-edge chips too. Anything you do on 7 nm, you can also probably do on 3 nm in terms of packaging.

### 01:05:56 – When will China outscale the West in semis?

**Dwarkesh Patel**

If we end up in this world in 2030 where the West has the most advanced process technology but has not ramped it up as much, whereas China… I don't know if you think by 2030 they would have EUV and 2 nm or whatever. But they are semiconductor-pilled and they are producing in mass quantity.

Basically, I'm wondering what the year is where there's a crossover, where our advantage in process technology has faded enough, and their advantage in scale has increased enough. And also, if their advantage in having one country with the entire supply chain indigenized—rather than having random suppliers in Germany and the Netherlands—would mean that China would be ahead in its ability to produce mass [flops](https://en.wikipedia.org/wiki/Floating_point_operations_per_second).

**Dylan Patel**

To date, China still does not have an entirely indigenized semiconductor supply chain.

**Dwarkesh Patel**

But would they in 2030?

**Dylan Patel**

By 2030, it's possible that they do. But to date, all of China's 7 nm and 14 nm capacity uses ASML DUV tools. The amount that they can import from ASML is large. But the vast majority of ASML's revenue, especially on EUV all of it, is outside of China. The scale advantage is still in the favor of the West plus Taiwan, Japan, and Korea, et cetera.

**Dwarkesh Patel**

But they're trying to make their own DUV and EUV tools, right?

**Dylan Patel**

They're trying to do all these things. The question is how fast can they advance and scale up production as well as quality. To date, we haven't seen that. Now I'm quite bullish that they're going to be able to do these things over the next five to ten years. They will really scale up production and kick it into high gear. They have more engineers working on it and more desire to throw capital at the problem.

**Dwarkesh Patel**

So by 2030, will they have fully indigenized DUV?

**Dylan Patel**

I think for sure. DUV, yes.

**Dwarkesh Patel**

And fully indigenized EUV by 2030?

**Dylan Patel**

I think they'll have working tools. I don't think that they'll be able to manufacture a bunch yet. There's having it work, and then there's production hell. ASML had EUV working in the early 2010s at some capacity. The tools were not accurate enough. They were not scaled for high-volume manufacturing or reliable enough. They had to ramp production, and that all took time.

Production hell takes time. That's why it took another five to seven years to get EUV into mass production at a fab rather than just working in the lab.

**Dwarkesh Patel**

How many DUV tools do you think they'll be able to manufacture in 2030?

**Dylan Patel**

ASML?

**Dwarkesh Patel**

No, China.

**Dylan Patel**

That's a great question. It's a bit of a challenge to look into this supply chain especially. We try really hard. In some instances, they're buying stuff from Japanese vendors. If they want a fully indigenized supply chain, they need to not buy these lenses, projection optics, or stages from Japanese vendors. They need to build it internally.

It's really tough to say where they'll be able to get to. I honestly think it's a shot in the dark. But it's probably not unlikely that they'll be able to do on the order of 100 DUV tools a year, whereas ASML is currently doing hundreds of DUV tools a year.

No company has a process node where they make a million wafers a month. Elon says he wants to do it and China is obviously going to do it. TSMC is trying to do that. The memory makers may get to a million wafers a month as well, but not in a single fab.

It's mind-boggling to think of that scale, and challenging to see the supply chain galvanized for that. I don't want to doubt China's capability to scale.

**Dwarkesh Patel**

I guess this is an interesting question. I think at some point SemiAnalysis will do the deep dive on this. By when would indigenized Chinese production be bigger than the rest of the West combined. And put in the input of your model of when they'll have DUV machines and EUV machines at scale?

Because there's this question around if you have long timelines on AI—by long meaning 2035, which is not that long in the grand scheme of things—should you expect a world where China is dominating in semiconductors? It doesn't get asked enough because if you're in San Francisco, we're thinking on timescales of weeks. If you're outside of San Francisco, you're not thinking about AGI at all.

What if we have AGI? What if you have this transformational thing that is commanding tens or hundreds of trillions of dollars of economic growth and token output, but it happens in 2035? What does that imply for the West versus China? SemiAnalysis has got to write the definitive model on this.

**Dylan Patel**

It's really challenging when you move timescales out that far. What we tend to focus on is tracking every data center, every fab, and all the tools. We track where they're going, but the time lags for these things are relatively short. We can only make reasonably accurate estimates for data center capacity based on land purchasing, permits, and turbine purchasing. We know where all these things are going, that's the data we sell.

As you go out to 2035, things are just so radically different. Your error bars get so large it's hard to make an estimate. But at the end of the day, if takeoff or timelines are slow enough, I don't see why China wouldn't be able to catch up drastically. In some sense, we've got this valley where, three to six months ago, or maybe even now, Chinese models are as competitive as they've ever been. I think Opus 4.6 and GPT 5.4 have really pulled away and made the gap a little bit bigger, but I'm sure some new Chinese models will come out.

As we move from selling tokens where they provide the entire reasoning chain, to selling automated white-collar work—an automated software engineer, you send them the request, they give you the result back, and there's a bunch of thinking on the back end that they don't show you—the ability to [distill](https://en.wikipedia.org/wiki/Knowledge_distillation) out of American models into Chinese models will be harder.

Second, look at the scale of the compute the labs have. OpenAI exited the year with roughly two gigawatts last year. Anthropic will get to two-plus gigawatts this year. By the end of next year, they'll both be at ten gigawatts of capacity. China is not scaling their AI lab compute nearly as fast. At some point, when you can't distill the learnings from these labs into the Chinese models, plus with this compute race that OpenAI, Anthropic, Google, and Meta are all racing on, they end up getting to a point where the model performance should start to diverge more.

Then look at all this CapEx being spent on data centers. Amazon is spending $200 billion, Google $180 billion. All these companies are spending hundreds of billions of dollars on CapEx. There's nearly a trillion dollars of CapEx being invested in data centers in America this year, roughly. What's the return on invested capital here? You and I would think the return on invested capital for data center CapEx is very high.

If we look at Anthropic's revenues, in January they added $4 billion. In February, which was a shorter month, they added $6 billion. We'll see what they can do in March and April, given that compute constraints are what's bottlenecking their growth. The reliability of Claude is quite low because they're so compute constrained. But if this continues, then the ROIC on these data centers is super high.

At some point, the US economy starts growing faster and faster over this year and next year because of all this CapEx, all the revenue these models are generating, and the downstream supply chain. China doesn't have that yet. They have not built the scale of infrastructure to invest in models, get to the capabilities, and then deploy these models at such scale.

When you look at Anthropic, they're at $20 billion ARR. The margins are sub-50 percent, at least as [last reported by *The Information*](https://www.theinformation.com/briefings/anthropic-lowered-gross-margin-projection-costs-run-ai-rose). So that's $13 or $14 billion of compute that it's running on rental cost-wise, which is actually $50 billion worth of CapEx that someone laid out for Anthropic to generate their current revenue.

China has just not done this. If and when Anthropic 10Xs revenue again—and I think our answer would be when, not if—China doesn't have the compute to deploy at that scale. So there is some sense that we're in a fast takeoff. It's not like we're talking about a [Dyson sphere](https://en.wikipedia.org/wiki/Dyson_sphere) by X date, it's more like the revenue is compounding at such a rate that it does affect economic growth. The resources these labs are gathering are growing so fast. China hasn't done that yet, so in that case, the US and the West are actually diverging.

The flip side is that these infrastructure investments have middling returns. Maybe they're not as good as hoped. Maybe Google is wrong for wanting to take free cash flow to zero and spend $300 billion on CapEx next year. Maybe they’re just wrong and people on Wall Street who are bearish and people who don't understand AI are correct. In that case, the US is building all this capacity but doesn't get great returns. Meanwhile, China is able to build a fully vertical, indigenized supply chain, instead of the US/Japan/Korea/Taiwan/SE Asia/Europe countries together building this less vertical supply chain. In a sense, at some point China is able to scale past us if AI takes longer to get to certain capability levels than the vast majority of your guests on this podcast believe.

**Dwarkesh Patel**

It's fast timelines, the US wins; long timelines, China wins.

**Dylan Patel**

Yeah but I don't know what fast timelines means. I don't think you have to believe in AGI to have the timelines where the US wins.

### 01:16:20 – The enormous incoming memory crunch

**Dwarkesh Patel**

Let's go back to memory. I think people on Wall Street and people in the industry are understanding how big this is, but maybe generally people don't understand what a big deal it is. So we've got this memory crunch, as you were talking about.

And earlier I was asking about, oh, could we solve for the EUV tool shortage by going back to seven nanometers? So let me ask a similar question about memory. HBM is made of DRAM, but has three to four times fewer bits per wafer area than the DRAM it's made out of.

Is it possible that accelerators in the future could just use commodity DRAM and not HBM, so we can get much more capacity out of the DRAM we have? The reason I think this might be possible is, if we're going to have agents that are just going off and doing work, and it's not a synchronous chatbot application, then you don't necessarily need extremely fast latency.

Maybe you can have lower bandwidth, because the reason you stack DRAM into HBM is for higher bandwidth. Is it possible to go to HBM accelerators and basically have the opposite of Claude Code Fast, like have Claude Slow?

**Dylan Patel**

At the end of the day, the incremental purchaser who's willing to pay the highest price for tokens also ends up being the one that's less price-sensitive. Compute should be allocated, in a capitalistic society, towards the goods that have the highest value, and the private market determines this by willingness to pay.

To some extent, Anthropic could actually release a slow mode. They could release Claude Slow Mode and increase tokens per dollar by a significant amount. They could probably reduce the price of Opus 4.6 by 4-5x and reduce the speed by maybe just 2x. The curve on inference throughput versus speed is already there just on HBM. And yet they don't, because no one actually wants to use a slow model.

Furthermore, on these agentic tasks, it's great that the model can run at a time horizon of hours. But if the model was running slower, those hours would become a day. Vice versa, if the model is running faster, those hours become an hour. No one really wants to move to a day-long wait period, because the highest-value tasks also have some time sensitivity to them.

I struggle to see… Yes, you could use regular DRAM. There are a couple of challenges with this. One of the core constraints of chips is that a chip is a certain size, and all of the [I/O](https://en.wikipedia.org/wiki/Input/output) escapes on the edges. Often, the left and right of the chip are HBM—so the I/O from the chip to the HBM is on the sides—and then the top and bottom are I/O to other chips.

If you were to change from HBM to [DDR](https://en.wikipedia.org/wiki/DDR_SDRAM), all of a sudden this I/O on the edge would have significantly less bandwidth, but significantly more capacity per chip. But the metric you actually care about is bandwidth per wafer, not bits per wafer.

**Dwarkesh Patel**

Because the thing that is constraining the FLOPS is just getting in and out the next matrix, and for that you just need more bandwidth.

**Dylan Patel**

Yeah, getting out the [weights](https://www.ultralytics.com/glossary/model-weights) and getting in and out the [KV cache](https://huggingface.co/blog/not-lain/kv-caching). In many cases, these GPUs are not running at full memory capacity. It's obviously a system design thing: model, hardware, and software co-design. You have to figure out how much KV cache you need, how much you keep on the chip, how much you offload to other chips and call when you need it for tool calling, and how many chips you parallelize this on.

Obviously, the search space for this is very broad, which is why we have [InferenceX](https://inferencex.semianalysis.com/), an open-source model that searches all the optimal points on inference for a variety of different chips and models.

The point is, you're not always necessarily constrained by memory capacity. You can be constrained by FLOPS, network bandwidth, memory bandwidth, or memory capacity. If you really simplify it down, there are four constraints, and each of these can break out into more.

If you switch to DDR, yes, you produce four times the bits per DRAM wafer, but all of a sudden the constraints shift a lot and your system design shifts. You go slower. Is the market smaller? Maybe. But also, all these FLOPS are wasted because they're just sitting there waiting for memory. You don't need all that capacity because you can't really increase batch size because then the KV cache would take even longer to read.

**Dwarkesh Patel**

Makes sense. What is the bandwidth difference between HBM and normal DRAM?

**Dylan Patel**

An [HBM4](https://en.wikipedia.org/wiki/High_Bandwidth_Memory#HBM4) stack—let's talk about the stuff that's in Rubin, because that's what we've been indexing on—is 2048 bits across, connected in an area that's 13 millimeters wide. It transfers memory at around 10 giga-transfers a second.

So a stack of HBM4 is 2048 bits on an area that's roughly 11 to 13 millimeters wide. That's the shoreline you're taking on the chip. In that shoreline, you have 2048 bits transferring at 10 giga-transfers per second. You multiply those together and divide by eight, bits to a byte, and you're at roughly 2.5 terabytes a second per HBM stack.

When you look at DDR, in that same area, it's maybe 64 or 128 bits wide. That DDR5 is transferring at anywhere from 6.4 to maybe 8,000 giga-transfers a second. So your bandwidth is significantly lower. It's 64 times 8,000 divided by eight, which puts you at 64 gigabytes a second. Even if you take a generous interpretation of 128 times 8 giga-transfers, you're at 128 gigabytes a second for the same shoreline, versus 2.5 terabytes a second.

There's an order of magnitude difference in bandwidth per edge area. If your chip is a square, or 26 by 33 millimeters—which is the maximum size for an individual die—you only have so much edge area. On the inside of that chip, you put all your compute. There are things you can do to try and change that, like more [SRAM](https://en.wikipedia.org/wiki/Static_random-access_memory) or more caching. But at the end of the day, you're very constrained by bandwidth.

**Dwarkesh Patel**

Then there's the question of where you can destroy demand to free up enough for AI. I guess the picture is especially bad because, as you're saying, if it takes four times more wafer area to get the same byte, for HBM you have to destroy four times as much consumer demand for laptops and phones to free up one byte for AI.

What does this imply for the next year or two? Sorry for the run-on question, in your newsletter you said 30% of Big Tech's CapEx in 2026 is going towards memory?

**Dylan Patel**

Yes.

**Dwarkesh Patel**

That's insane, right? Of the $600 billion or whatever, 30% is going just to memory.

**Dylan Patel**

Yes. Obviously, there's some level of margin stacking that Nvidia does, so you have to separate that out and apply their margin to the memory and the logic. But at the end of the day, a third of their CapEx is going to memory.

**Dwarkesh Patel**

That's crazy. What should we expect over the next year or two as this memory crunch hits?

**Dylan Patel**

The memory crunch will continue to get harder, and prices will continue to go up. This affects different parts of the market differently. Are people going to hate AI more and more? Yes, because smartphones and PCs are not going to get incrementally better year on year. In fact, they're going to get incrementally worse.

**Dwarkesh Patel**

If you look at the bill of materials for an iPhone, what fraction of it is the memory? How much more expensive does an iPhone get if the memory is two times more expensive?

**Dylan Patel**

I believe an iPhone has 12 gigabytes of memory. Each gig used to cost roughly $3-4, so that's $50. But now the price of memory has tripled. Let's say it's $12 per gig for DDR. Now you're talking about $150 versus $50.

That's a $100 increase in cost for Apple. Apple has some margin, they're not just going to eat the margin. NAND also has the same market dynamics, so in reality, it's probably a $150 increase on the iPhone. So now that’s a $100 cost increase and that’s just on the DRAM. The [NAND](https://en.wikipedia.org/wiki/Flash_memory) also has the same sort of market. So in fact it’s probably a $150 increase on the iPhone. Apple either has to pass that on to the consumer or eat it. I don't see Apple reducing their margin too much, maybe they eat a little bit. But at the end of the day, that means the end consumer is paying $250 more for an iPhone.

Now that’s just on last year’s pricing versus today’s. There is some lag before Apple feels the heat because they tend to have long-term contracts for memory that last three months to a year. But at the end of the day, Apple gets hit pretty hard by this. They won't really adjust until the next iPhone release.

But that's the high end of the market, which is only a few hundred million phones a year. Apple sells two or three hundred million phones annually. The bulk of the market is mid-range and low-end. It used to be that 1.4 billion smartphones were sold a year. Now we're at about 1.1 billion. Our projections are that we might drop to 800 million this year, and down to 500 or 600 million next year.

We look at data points out of China from some of our analysts in Asia, Singapore, Hong Kong, and Taiwan. They've been tracking this, and they see [Xiaomi](https://en.wikipedia.org/wiki/Xiaomi) and [Oppo](https://en.wikipedia.org/wiki/Oppo) cutting low-end and mid-range smartphone volumes by half.

Yes, it’s only a $150 [BOM](https://en.wikipedia.org/wiki/Bill_of_materials) increase on a $1,000 iPhone where Apple has some larger margin. But for smaller phones, the percentage of the BOM that goes to memory and storage is much larger. And the margins are lower, so there's less capacity to even eat the margins. And they have also generally tended not to do long-term agreements on memory.

Why this is a big deal is that if smartphone volumes halve, that drop will happen in the low and mid-range, not the high end. So it’s not like the bits released are halving. Currently, consumer devices account for more than half of memory demand. Even if you halve smartphone volumes, because of the shape of the halving, the low end gets cut by more than half, while the high end gets cut by less than half, because you and I will still buy the high-end phones that cost north of a thousand dollars. We'll buy them even if they get a little bit more expensive. And Apple's volumes will not go down as much as a low-end smartphone provider.

The same applies to PCs. What this does to the market is quite drastic. DRAM gets released and goes to AI chips, who are willing to do longer-term contracts and pay higher margins, because at the end of the day the margin they extract from the end user is much larger.

This probably leads to people hating AI even more. Today, you already see all the memes on PC subreddits and gaming PC Twitter. It's cat dancing videos saying, "This is why memory prices have doubled and you can't get a new gaming GPU or desktop." It's going to be even worse when memory prices double again, especially DRAM.

Another interesting dynamic is that it's not just DRAM, it's also NAND. NAND is also going up in price. Both of these markets have expanded capacity very slowly over the last few years, NAND almost zero. The percentage of NAND that goes to phones and PCs is larger than the percentage of DRAM that goes to phones and PCs.

As you destroy demand, mostly for DRAM purposes, you unlock more NAND that gets allocated and can go to other markets. The price increases of DRAM will be larger than those of NAND because you've released more from the consumer, and in fact, you've produced more memory for AI.

**Dwarkesh Patel**

Sorry, maybe you just explained it and I missed it. Is it because [SSDs](https://en.wikipedia.org/wiki/Solid-state_drive) are being used in large quantities for data centers?

**Dylan Patel**

They are, but not in as large quantities as DRAM.

**Dwarkesh Patel**

Okay, so they will also increase because they'll be using some quantity, but there's not as much of a need as there is for HBM. Makes sense.

One thing I didn't appreciate until I was reading some of your newsletters is that the same constraints preventing logic scaling over the next few years are quite similar to what's preventing us from producing more memory wafers. In fact, literally the same exact machine, this EUV tool, is needed for memory.  So I guess the question someone could ask right now is, why can't we just make more memory?

**Dylan Patel**

The constraints, as I was mentioning earlier, are not necessarily EUV tools today or next year. They become that as we get to the latter part of the decade. Currently, the constraints are more that they physically just haven't built fabs. Over the last three to four years, these vendors have not built new fabs because memory prices were really low. Their margins were low, and in fact, they were losing money in 2023 on memory. So they decided they weren't building new fabs. The market slowly recovered over time but never really got amazing until last year.

In 2024, we were banging on the drums that reasoning means [long context](https://cloud.google.com/transform/the-prompt-what-are-long-context-windows-and-why-do-they-matter), which means a large KV cache, which means you need a lot of memory demand. We've been talking about that for a year and a half, two years. People who understand AI went really long on memory then. So you’ve seen that dynamic, but now it has finally played out in pricing.

It took so long for what was obvious: long context means the KV cache gets bigger, you need more memory. Half the cost of accelerators is memory. Of course they're going to start going crazy on it. It took a year for that to actually reflect in memory prices. Once memory prices reflected that, it took another three to six months for the memory vendors to start building fabs. Those fabs take two years to build. So we won't have really meaningful fabs to even put these tools in until late 2027 or 2028\.

Instead, you've seen some really crazy stuff to get capacity. [Micron](https://en.wikipedia.org/wiki/Micron_Technology) [bought a fab from a company in Taiwan](https://www.reuters.com/world/china/microns-18-billion-acquisition-boosts-powerchip-shares-2026-01-19/) that makes lagging-edge chips. Hynix and Samsung are doing some pretty crazy things to try and expand capacity at their existing fabs, which also have large knock-on effects in the economy.

So why can't we build more capacity? There's nowhere to put the tools. It's not just EUV; there are other tools involved in DRAM and logic. In logic, for N3, about 28% of the cost of the final wafer is EUV. When you look at DRAM, it's in the teens. It's going up, but it's a much smaller percentage of the cost. These other tools are also bottlenecks, although their supply chains are not as complex as ASML's.

You see [Applied Materials](https://en.wikipedia.org/wiki/Applied_Materials), [Lam Research](https://www.lamresearch.com/), and all these other companies expanding capacity a lot as well. But you don't have anywhere to put the tool, because the most complex buildings people make are fabs, and fabs take two years to build.

**Dwarkesh Patel**

[I interviewed Elon recently](https://www.dwarkesh.com/p/elon-musk), and his whole plan is that they're going to build this [TeraFab](https://www.bloomberg.com/news/articles/2026-01-28/musk-says-tesla-needs-to-build-terafab-to-manufacture-chips) and they're going to build the [clean rooms](https://en.wikipedia.org/wiki/Cleanroom). I won't even ask you about the dirty rooms thing, but let's say they build the clean rooms.

I have a couple of questions. One, do you think this is the kind of thing that Elon Co. could build much faster than people conventionally build it? This is not about building the end tools. This is just about building the facility itself. How complicated is it to just build the clean room extremely fast? Is this something that Elon, with his "move fast" approach, could do much faster if that's what we're bottlenecked on this year or next year? Two, does that even matter if, in two years, your view is that we're not bottlenecked on clean room space, but on the tooling?

**Dylan Patel**

As with any complex supply chain, it takes time, and constraints shift over time. Even if something is no longer a constraint, that doesn't mean that market no longer has margin. For example, energy will not be a big bottleneck a couple of years from now, but that doesn't mean energy isn't growing super fast and there's no margin there. It's just not the key bottleneck. In the space of fabs, clean rooms are the biggest bottleneck this year and next year. As we get to 2028, 2029, 2030, there will still be constraints there.

The thing about Elon is he has a tremendous capability to garner physical resources and really smart people to build things. The way he recruits amazing people is by trying to build the craziest stuff. In the case of AI, that hasn't really worked because everyone's trying to build AGI. Everyone is very ambitious. But in the case of going to Mars, making rockets that land themselves, fully autonomous electric cars, or humanoid robots, these are methods of recruiting the people who think that's the most important problem in the world to work on that problem, because he's the only one trying really hard.

In the case of semiconductors, he stated he wants to make a fab that's a million wafers per month. No one has a fab that big. It's possible that he's able to recruit a lot of really awesome people and get them on this crazy task of building a million wafers a month. Step one is to build the clean room, and that I think he probably can do. His mindset around deleting things, that it can be dirty, it's fine, is probably not right. Actually I think it’s 100% not right. You need the fab to be very clean. All of the air in the fab gets replaced every three seconds, it’s that fast. There have to be so few particles.

But I think he can build the clean room. It'll take a year or two. Initially, it won't be super fast, but over time, he'll get faster at it. The really complex part is actually developing a process technology and building wafers. I don't think he can develop that quickly. That has a lot of built-up knowledge. The most complicated integration of very expensive tools and supply chains is done by TSMC, Intel, or Samsung. These two other companies aren't even that great at it, and they're tremendously complex.

**Dwarkesh Patel**

How surprised would you be if in 2030 there just happened to be some total disruption where we're not using EUV? What if we're using something that has much better effects, is much simpler to produce, and can be produced in much bigger quantities? I'm sure as an industry insider that sounds like a totally naive question, but do you see what I'm asking? What probability should we put on something coming totally out of left field to make all of this irrelevant?

**Dylan Patel**

Something that's very simple and easy to scale, I assign a very, very low probability. There are a number of companies working on effectively particle accelerators or [synchrotrons](https://en.wikipedia.org/wiki/Synchrotron) that generate light that's either 13.5 nanometer, like EUV, or an even narrower wavelength, like [X-ray](https://www.tomshardware.com/tech-industry/semiconductors/american-startup-substrate-promises-2nm-class-chipmaking-with-particle-accelerators-at-a-tenth-of-the-cost-of-euv-x-ray-lithography-system-has-potential-to-surpass-asmls-euv-scanners) at 7 nanometers, to then use in lithography tools. But those things are massive particle accelerators generating this light. It's a very complicated thing to build.

There are a couple of companies and I think that could be a big disruption to the industry beyond EUV. But I don't think we're going to magically build something new that is direct write and super simple, and can be manufactured at huge volumes, although there are some attempts to do things like this.

**Dwarkesh Patel**

I ask because if you think about Elon's companies in the past, rocketry was this thing that was thought to be—and is—incredibly complicated.

**Dylan Patel**

Look, I'm just a naive yapper compared to Elon. What have I built? So maybe it's possible.

**Dwarkesh Patel**

In order to build more memory in the future, could we build [3D DRAM](https://www.tomshardware.com/tech-industry/next-generation-3d-dram-approaches-reality-as-scientists-achieve-120-layer-stack-using-advanced-deposition-techniques) the way we do [3D NAND](https://www.appliedmaterials.com/us/en/semiconductor/markets-and-inflections/memory/3d-nand.html) and then go back to DUV?

**Dylan Patel**

That is the hope currently. Everyone's roadmap for 3D DRAM is that you'll still use EUV because you want to have that tighter overlay. When you're doing these subsequent processing steps, everything is vertically stacked and you have more layers on top of each other. You want the pitches to be tighter. So generally, people are still trying to do it with EUV.

But what 3D would do is change the calculation of how many bits a single EUV pass can make. That number would go up drastically if you go to 3D DRAM. That is the hope. Right now, everyone's roadmap goes from the current 6F cell, to a [4F cell](https://www.globalsmt.net/advanced-packaging/a-new-round-of-technological-innovation-in-memory-market-on-the-way/), and then finally 3D DRAM by the end of the decade or early next decade. There's still a lot of R\&D, manufacturing, and integration to be done. I wouldn't call that out of the cards. I think it's very likely going to happen.

It's also going to require a huge retooling of fabs. The breakdown of tools in a fab will be very different. The lithography tool is actually the only thing that isn't that different. But the number of them relative to different types of [chemical vapor deposition](https://en.wikipedia.org/wiki/Chemical_vapor_deposition), [atomic layer deposition](https://en.wikipedia.org/wiki/Atomic_layer_deposition), [dry etch](https://en.wikipedia.org/wiki/Dry_etching), or different kinds of etch chambers with different chemistries… You have all these different tools for different process nodes. You can't just convert a logic fab to a DRAM fab, or vice versa, or a NAND fab to a DRAM fab, in a short amount of time.

In the same way, existing DRAM fabs require a lot of retooling just to go from 1-alpha to 1-beta to 1-gamma process nodes, because they have to add DUV and change the chemistry stacks for when you’re using EUV in terms of deposition and etch. And the EUV tool has to be there. Furthermore, when you change to 3D DRAM, there's going to be an even larger shift, so a lot of retooling of these fabs needs to happen.

That would be a big disruption. That would make EUV demand generally lower. But as we've seen across time, lithography demand as a percentage of wafer cost has trended up. Around the 2014 era, it was 17% of the wafer cost, and it's gone to 30% over the last fifteen years. For DRAM, it was in the low to mid-teens, and now it's trended toward the high teens. Before we get to 3D DRAM, it'll likely cross into the 20% range. But then, if we get to 3D DRAM, the total end wafer cost as a percentage of EUV tanks again.

**Dwarkesh Patel**

I guess you care less about the percent of cost and more about how much it bottlenecks production.

**Dylan Patel**

Right, but the percentage of cost—

**Dwarkesh Patel**

It’s a proxy, yeah. If you're [Jensen](https://en.wikipedia.org/wiki/Jensen_Huang) or Sam Altman, or whoever stands to gain a lot from scaling up AI compute, there are these stories that they'd go to TSMC and say, "Why can't we access Y and Z?" But I think the point you're making is that it doesn't really matter what TSMC does in some sense. In fact, even if you have Intel and Samsung building more foundries, in the long run, you're going to be bottlenecked by ASML and other tool and material makers.

First, is that a correct interpretation? Second, should Silicon Valley people be going to the Netherlands right now to try to pitch ASML to make more tools so that in 2030 they can have more AI compute?

**Dylan Patel**

It's a funny dynamic we saw in 2023, 2024, and 2025\. People who saw the energy bottleneck before others asymmetrically went to [Siemens](https://www.siemens-energy.com/us/en/home/products-services/product-offerings/gas-turbines.html), [Mitsubishi](https://en.wikipedia.org/wiki/Mitsubishi_Heavy_Industries), and of course [GE Vernova](https://en.wikipedia.org/wiki/GE_Vernova), and bought up turbine capacity. Now they're able to charge excess amounts for deploying these turbines in places because of energy.

In the same sense, this could be done for EUV, except ASML is not just going to trust any random bozo who wants to buy EUV tools. These turbines are much cheaper than EUV tools, and there's many more of them produced. Especially once you get to industrial gas turbines, not just [combined-cycle](https://en.wikipedia.org/wiki/Combined-cycle_power_plant) but the cheaper, smaller, less efficient ones, people put down deposits for these.

Someone could do this. Someone should go to the Netherlands and be like, "I'll pay you a billion dollars. You give me the right to purchase ten EUV tools two years from now, and I'm first in line." Then over those two years, you go around and wait for everyone to realize, "Oh crap, I don't have enough EUV tools," and you try to sell your option at some premium. All you're effectively doing is saying, "ASML, you're dumb. You weren't making enough margin on these. I'm going to make a margin." The question is, will ASML even agree to this? I don't think so.

**Dwarkesh Patel**

There's a world where they at least get the demand signal from that to increase production.

**Dylan Patel**

Potentially. I agree.

**Dwarkesh Patel**

But it sounds like you're saying they couldn't even increase production if they wanted to, given the supply chain.

**Dylan Patel**

Right. But that's exactly the market in which… If they can't increase production, just like TSMC cannot increase production that fast, and yet demand is mooning, then the obvious solution is to arbitrage this. You and I know demand is way higher than they're projecting and their capability to build.

You arbitrage this by locking up the capacity, doing a forward contract, and then trying to sell it at a later date once other people realize everything is fucked and we don't have enough capacity. Then you'll have this insane margin that ASML and TSMC should have been charging. But the thing is, I don't know if ASML and TSMC will ever agree to this.

### 01:42:53 – Scaling power in the US will not be a problem

**Dwarkesh Patel**

Let me ask you about power now. It sounds like you think power can be arbitrarily scaled.

**Dylan Patel**

Not arbitrarily, but yes.

**Dwarkesh Patel**

But beyond these numbers. If I'm remembering correctly, [your blog post](https://newsletter.semianalysis.com/p/how-ai-labs-are-solving-the-power) on how AI labs are increasing power implied that GE Vernova, Mitsubishi, and Siemens could produce 60 gigawatts a year in gas turbines. Then there are these other sources, but they're less significant than the turbines.

Only a fraction of that goes to AI, I assume. If in 2030 we have enough logic and memory to do 200 gigawatts a year, do you just think that these things are on a path to ramp up to more than 200 gigawatts a year, or what do you see?

**Dylan Patel**

Right now we're at 20 or 30\. This is critical IT capacity, by the way, which is an important thing to mention. When I'm talking about these gigawatts, I'm talking about critical IT capacity. Server plugged in, that's how much power it pulls. But there are losses along the chain. There is loss on transmission, conversion, cooling, et cetera. So you should gross this factor up from 20 gigawatts for this year, or 200 gigawatts by the end of the decade, to some number 20-30% higher.

Then you have capacity factors. Turbines don't run at 100 percent. If you look at [PJM](https://en.wikipedia.org/wiki/PJM_Interconnection), which I think is the largest grid in America—covering the Midwest and some of the Northeast area—in their models they want to have roughly 20 percent excess capacity. Within that 20 percent excess capacity, they're running all the turbines at 90% because they are derated some for reliability, maintenance, and so on. In reality, the nameplate capacity for energy is always way higher than the actual end critical IT capacity because of all these factors.

But it's not just turbines. If you were just making power from turbines, that's simple, boring, and easy. Humans and capitalism are far more effective. The whole point of that blog was that, yes, there are only three people making combined-cycle gas turbines, but there's so much more we can do. We can do [aeroderivatives](https://www.gevernova.com/content/dam/gepower-microsites/global/en_US/documents/avr/GEA34130%20AeroderivativeGT_Whitepaper_R5.pdf). We can take airplane engines and turn them into turbines. There are even new entrants in the market, like [Boom Supersonic](http://m) trying to do that and working with [Crusoe](https://www.crusoe.ai/).  Also there's all the other ones like that already exist in the market.

There are also [medium-speed reciprocating engines](https://blog.burnsmcd.com/meet-growing-data-center-power-demands-with-reciprocating-engines): engines that spin in circles, like a diesel engine. There are ten people who make engines that way. I'm from Georgia, and people used to be like, "Oh man, you got a [Cummins](https://www.cummins.com/en-na) engine in there," regarding RAM trucks. Automobile manufacturing is going down, so these companies all have capacity and could scale and convert that for data center power. You stick all these reciprocating engines in. It's not as clean as combined-cycle, but maybe you can convert them from diesel to gas if you want.

What about ship engines? All of these engines for massive cargo ships are great. [Nebius is doing that for a Microsoft data center in New Jersey](https://nebius.com/newsroom/nebius-announces-multi-billion-dollar-agreement-with-microsoft-for-ai-infrastructure). They're running ship engines to generate power. [Bloom Energy](https://www.bloomenergy.com/) is doing [fuel cells](https://www.bloomenergy.com/hydrogen-fuel-cells/). We've been very positive on them for a year and a half now because they have such a capability to increase their production. Their payback period for a production increase is very fast, even if the cost is a little bit higher than combined-cycle, which is the best for cost and efficiency.

Then there's solar plus battery, which can come online as those cost curves continue to come down. There's wind, where you might only expect 15 percent of the maximum power because things oscillate, but you add batteries. There are all these things.

The other thing is that the grid is scaled so we don't cut off power at peak usage on the hottest day of the summer. But in reality, that's a load spike that is 10-20% higher than the average. If you just put enough utility-scale batteries, or [peaker plants](https://en.wikipedia.org/wiki/Peaking_power_plant) that only run a small portion of the year—and those could be gas, industrial gas turbines, combined-cycle, batteries, or any of the other sources I mentioned—then all of a sudden you've unlocked 20% of the US grid for data centers. Most of the time that capacity is sitting idle. It's really only there for that peak, which is just a few hours over a few days of the year. If you have enough capacity to absorb that peak load, then all of the sudden you’ve transferred it all.

Today, data centers are only 3-4% of the power of the US grid, and by 2028 they'll be 10%. But if you can unlock 20% of the US grid like this, it's not that crazy. The US grid is terawatt-level, not hundreds-of-gigawatts-level. So we can add a lot more energy.

I'm not saying it's easy. These things are going to be hard. There's a lot of hard engineering, risks people have to take, and new technologies people have to use. But Elon was the first to do this behind-the-meter gas, and since then we've seen an explosion of different things people are doing to get power.  They're not easy, but people are gonna be able to do them. The supply chains are just way simpler than chips.

**Dwarkesh Patel**

Interesting. He made the point during the interview that for the specific blade for the specific turbine he was looking at, the lead times go out beyond 2030\. Your point is that—

**Dylan Patel**

That's great. There are so many other ways to make energy. Just be inefficient. It's fine.

**Dwarkesh Patel**

Right now, combined-cycle gas turbines have CapEx of $1,500 per kilowatt. Are you saying it would make sense to have either technologies that are much more expensive than that, or other things are getting cheap enough to make it competitive?

**Dylan Patel**

Exactly. It can be as high as $3,500 per kilowatt. It could be twice as much as the cost of combined-cycle, and the total cost of the GPU on a TCO basis has only gone up a few cents per hour.

Because we've been talking about Hopper pricing, $1.40, let's say the power price doubles. The Hopper that was $1.40 is now $1.50 in cost. I don't care, because the models are improving so fast that the marginal utility of them is worth way more than that ten-cent increase in energy.

**Dwarkesh Patel**

So you're saying 20 percent of the grid—the grid is about one terawatt—can just come online from utility-scale batteries, increasing what you'd be comfortable putting on the grid.

**Dylan Patel**

The regulatory mechanism there is not easy, by the way.

**Dwarkesh Patel**

But that's 200 gigawatts, if that hypothetically happens. Just from the different sources of gas generation you mentioned—the different kinds of engines and turbines—combined, how many gigawatts could they unlock by the end of the decade?

**Dylan Patel**

We're tracking this in our data. There are over 16 different manufacturers of power-generating things just from gas alone. Yes, there are only three turbine manufacturers for combined-cycle, but we're tracking 16 different vendors, and we have all of their orders. It turns out there are hundreds of gigawatts of orders to various data centers.

As we get to the end of the decade, we think something like half of the capacity that's being added will be behind the meter. Behind the meter is almost always more expensive than grid-connected, but there are just a lot of problems with getting grid-connected: permits and interconnection queues and all this sort of stuff. So even though it's more expensive, people are doing behind the meter.

What they're doing behind the meter ranges widely. It could be reciprocating engines, ship engines, or aeroderivatives. It could be combined-cycle, although combined-cycle is not that great for behind the meter. It could be Bloom Energy fuel cells, or solar plus battery. It could be any of these things.

**Dwarkesh Patel**

And you're saying any of these individually could do tens of gigawatts?

**Dylan Patel**

Any of these individually will do tens of gigawatts, and as a whole, they will do hundreds of gigawatts.

**Dwarkesh Patel**

Okay. So that alone should more than—

**Dylan Patel**

Electrician wages will probably double or triple again. There are going to be a lot of new people entering that field, and a ton of people who make money, but I don't see that as the main bottleneck.

**Dwarkesh Patel**

Right now in Abilene, at the [1.2-gigawatt data center that Crusoe is building for OpenAI](https://www.crusoe.ai/resources/newsroom/crusoe-expands-ai-data-center-campus-in-abilene-to-1-2-gigawatts), I think they have 5,000 people working there, or at peak they did. If you turn that into 100 gigawatts—and I'm sure things will get more efficient over time—that would be 400,000 people it would take to build 100 gigawatts.

If you think about the US labor force, and how many electricians there are and how many construction workers there are… I guess there are 800,000 electricians. I don't know if they're all substitutable in this way. There are millions of construction workers. But if we're in a world where we're adding 200 gigawatts a year, are we going to be crunched on labor eventually, or do you think that is actually not a real constraint?

**Dylan Patel**

Labor is a big constraint. It's a humongous constraint in this. People have to be trained. Likewise, we'll probably start importing the highest-skilled labor. It makes sense that a really high-skilled electrician in Europe who was working on destroying power plants now comes to America and is building high-voltage electricity moving across a data center.

Humanoid robots or robotics at least might start to help, but the main factor for reducing the number of people is going to be modularizing things and making them in factories in Asia. Unfortunately for America, places like Korea, Southeast Asia, and in many ways China as well are going to ship more and more built-out sections of the data center and those will be shipped in. Today you currently ship servers or a rack in, and then you plug that into different pieces that you're shipping from different places.

But now you'll ship it to a factory and integrate the entire thing. Maybe this is a two-megawatt block, and this block goes from high-voltage AC power to the DC voltage that you deliver to the rack, or something like this. Or with cooling, you ship a fully integrated unit that has a lot of the cooling subsystems already put together, because plumbers are also a big constraint here.

Furthermore, instead of just a single rack where you have people wiring up all these racks with electricity, you take a skid and put an entire row of servers on it that is shipped directly from the factories. Today, a single rack may be 120 or 140 kilowatts, but as we get to next-generation [Nvidia Kyber](https://developer.nvidia.com/blog/nvidia-800-v-hvdc-architecture-will-power-the-next-generation-of-ai-factories/) and things like that, it's almost a megawatt.

In addition, if you do an entire row, it'll have the rack, the networking, the cooling, and the power all integrated together. Now when you come in, you have much less to cable. There's less networking fiber, fewer power connections, and fewer plumbing things. This can drastically reduce the number of people working in data centers, so our capability to build them will be much larger.

Along the way, some people will move faster to new things, and some will move slower. [Crusoe and Google have been talking a lot about this modularization](https://www.forbes.com/sites/annatong/2026/03/12/from-gigawatts-to-grab-and-go-crusoe-leans-into-modular-ai-data-centers/), as have [companies like Meta](https://www.datacenterdynamics.com/en/news/meta-to-deploy-366mw-of-modular-gas-units-to-power-1gw-data-center-in-el-paso-texas/) and many others. The people who move faster to new things may face delays, while the people who are slower will face labor problems. There will always be dislocations in the market because this is a very complex supply chain. At the end of the day, it's still simple enough that we will be able to solve it through capitalism and human ingenuity on the timescales required.

### 01:55:03 – Space GPUs aren't happening this decade

**Dwarkesh Patel**

Speaking of big problems to solve, Elon Musk is very bullish on space GPUs. If you're right that power is not a constraint on Earth… I guess the other reason they would make sense is that even if  there will be enough gas turbines or whatever on Earth, Elon's next argument is that you can't get the permitting to build hundreds of gigawatts on Earth. Do you buy that argument?

**Dylan Patel**

Land-wise, America is big. Data centers don't actually take up that much space, so you can solve that. Permitting-wise, air pollution permits are a challenge, but the Trump administration made it much easier. You go to Texas, and you can skip a lot of this red tape.

Elon had to deal with a lot of this complex stuff in Memphis, and then building a power plant across the border for [Colossus 1 and 2](https://x.ai/colossus). But at the end of the day, there's a lot more you can get away with in the middle of Texas.

**Dwarkesh Patel**

Given that Elon lives in Texas, why didn't he just go to Texas?

**Dylan Patel**

I think it was partially that they over-indexed on grid power for a temporary period of time. That's just what they thought they needed more of.

**Dwarkesh Patel**

Because they had an aluminum refinery connected to the grid there.

**Dylan Patel**

It was actually an idled appliance factory. But I think they may have indexed more to grid power, water access, and gas access. I think they bought that knowing the gas line was right there and they were going to tap it. Same with water. It was a whole host of different constraints. It was probably an area where electricians were easier to find.

At the end of the day, I'm not exactly sure why they chose that site. I bet Elon would've chosen somewhere in Texas if he could've gone back because of the regulatory challenges he faced. Ultimately, permitting is a challenge, but America is a big place with 50 states, and things will get done.

There are a lot of small jurisdictions where you can just transport in all the workers you need for a temporary period of three to twelve months, depending on the contractor. You can put them in temporary housing and pay out the butt, because labor is very cheap relative to the GPUs and the networking, and the end value of the tokens it's going to produce. So there is plenty of room to pay for all of these things.

Also, people are also diversifying now. Australia, Malaysia, Indonesia, and India are all places where data centers are going up at a much faster pace. But currently, over 70% of AI data centers are still in America, and that continues to be the trend. People are figuring out how to build these things. Ultimately, dealing with permitting and red tape in middle-of-nowhere Texas, Wyoming, or New Mexico is probably a hell of a lot easier than sending stuff into space.

**Dwarkesh Patel**

Other than the economic argument making less sense once you consider that energy is a small fraction of the total cost of ownership of a data center, what are the other reasons you're skeptical?

**Dylan Patel**

Obviously, power is basically free in space.

**Dwarkesh Patel**

That's the reason to do it.

**Dylan Patel**

Yeah, that's the reason to do it. But there are all the other counterarguments. Even if power costs double on Earth, it's still a fraction of the total cost of the GPU.

The main challenge is… We have [ClusterMAX](https://www.clustermax.ai/), which rates all the neoclouds. We test over 40 cloud companies, including the hyperscalers and neoclouds. Outside of software, what differentiates these clouds the most is their ability to deploy and manage failure.

GPUs are horrendously unreliable. Even today, around 15% of Blackwells that get deployed have to be [RMA'd](https://en.wikipedia.org/wiki/Return_merchandise_authorization). You have to take them out. Sometimes you just have to plug them back in, but sometimes you have to take them out and ship them back to Nvidia or their partners who do the RMAs and such.

**Dwarkesh Patel**

What do you make of Elon's argument that after an initial phase, they actually don't fail that much?

**Dylan Patel**

Sure, but now you've done this, tested them all, deconstructed them, put them on a spaceship, launched them into space, and then put them online again. That takes months. If your argument is that a GPU has a useful life of five years, and this takes six additional months, that is 10% of your cluster's useful life.

Because we're so capacity-constrained, that compute is theoretically most valuable in the first six months you have it. We're more constrained now than we will be in the future. That compute can contribute to a better model in the future, or generate revenue today that you can use to raise more money. All these things make now the most important moment, but you've potentially delayed your compute deployment by six months.

What separates these cloud providers is… We see some clouds taking six months to deploy GPUs right here on Earth. We see clouds that take a lot less than six months. So the question is, where does space get in there? I don't see how you could test them all on Earth, deconstruct them, and ship them to space without it taking significantly longer than just leaving them in the facility where you tested them.

**Dwarkesh Patel**

The question I wanted to ask is about the topology of space communication. Right now, Starlink satellites talk to each other at 100 gigabits per second. You could imagine that being much higher with optical intersatellite laser links optimized for this. That actually ends up being quite close to InfiniBand bandwidth, which is 400 gigabytes a second.

**Dylan Patel**

But that's per GPU, not per rack. So multiply that by 72\. Also, that was Hopper. When you go to Blackwell and Rubin, that 2x's and 2x's again.

**Dwarkesh Patel**

But how much compute is happening per… During inference, are the different scale-ups still working together, or is inference just happening as a batch within a single scale-up?

**Dylan Patel**

A lot of models fit within one scale-up domain, but many times you split them across multiple scale-up domains.

As models become more and more sparse, which is the general trend, you want to ping just a couple of experts per GPU. If leading models today have hundreds, if not a thousand, of experts, then you'd want to run this across hundreds or thousands of chips, even as we advance into the future.

So then you end up with the problem of needing to connect all these satellites together for communications as well.

**Dwarkesh Patel**

That would be tough. If there's a world where you could do inference for a batch on a single scale-up, then maybe it's more plausible. But if not, it's a different story.

**Dylan Patel**

Networking these chips together is a problem, and you can't just make the satellite infinitely large. There are a lot of physics challenges to making a satellite really big. That's why you need these interconnects between the satellites.

Those interconnects are more expensive. In a cluster, 15-20% of the cost is networking. All of a sudden, you're using space lasers instead of simple lasers that are manufactured in volumes of millions with pluggable transceivers.

And those things are very unreliable as well, more unreliable than the GPUs by the way. Across the life of a cluster, you have to unplug and clean them all the time. You have to unplug and replug them just for random reasons. These things are just not as reliable. So you've got that problem as well. You've got a more expensive, complicated space laser to communicate instead of this pluggable optical transceiver that's been produced in super high volume.

**Dwarkesh Patel**

So all in all, what does that imply for space data centers?

**Dylan Patel**

Space data centers effectively are not limited by their energy advantage. They are limited by the same contended resource. We can only make two hundred gigawatts of chips a year by the end of the decade. What are we going to do to get that capacity? It doesn't matter if it's on land or in space. It doesn’t really matter, because you can build that power. Human capabilities and capacity could get to the period where we're adding a terawatt a year globally of various types of power.

At some point, we do cross the chasm where space data centers make sense, but it's not this decade. It is much further out, once energy constraints actually become a big bottleneck and land permitting becomes a much bigger bottleneck as it subsumes more of the economy. And crucially, once chips are no longer the bottleneck.

Right now, chips are the biggest bottleneck. You want them deployed and working on AI the moment they're manufactured. There are a lot of things people are doing to increase that speed faster and faster. They’re modularizing data centers, or even modularizing racks where you put the chip in at the data center, but only the chip and everything else is already wired up and ready to go. There are things like this people are doing to decrease that time that you cannot do in space.

At the end of the day, all that matters in a chip-constrained world is getting these chips producing tokens ASAP. Maybe by 2035, the semiconductor industry, ASML, Zeiss, and suppliers like Lam Research and Applied Materials and other fab manufacturers will catch up once the pendulum swings and we are able to make enough chips. Then we will be optimizing every dial and it makes sense to optimize the 10-15% of energy costs. As we move to [ASICs](https://en.wikipedia.org/wiki/Application-specific_integrated_circuit) potentially, and if Nvidia's margins aren't \+70%, maybe that energy cost becomes 30% of the cluster. These are the things to optimize.

But Elon doesn't win by doing 20% gains. He never wins that way. Elon wins when he swings for the fences and does 10X gains. That's what SpaceX is about. That's what Tesla is about. All of his success has been about that, not chasing the 20%. I think space data centers will eventually be a 10X gain as Earth's resources get more and more contentious, but that's not this decade.

**Dwarkesh Patel**

Just to drive some intuition about how much land there is on Earth… Obviously, for the chips themselves, especially if you move to a world where you have racks that have megawatts—

**Dylan Patel**

That's the other thing. If manufacturing is the constraint, right now it's roughly one watt per square millimeter for AI chips. One easy way to improve that is to pump it to two watts per square millimeter. You may not get 2x the performance, you may only get 20% more performance, and that requires much more exotic cooling. It requires more complicated cold plates and complex liquid cooling, or maybe even things like [immersion cooling](https://en.wikipedia.org/wiki/Immersion_cooling).

In space, higher watts per millimeter is very difficult, whereas on Earth, these are solved problems. One of these things enables you to get a lot more tokens, maybe 20% more tokens per wafer that's manufactured, and that's a humongous win.

**Dwarkesh Patel**

Square millimeter, you mean of die area?

**Dylan Patel**

Yeah, of die area.

**Dwarkesh Patel**

It would be better for space because more watts per millimeter means the chip runs hotter. I guess this is a question of computer chip engineering, but it cools to the fourth power by the Stefan-Boltzmann law. If you can run a very hot chip, it allows a lot of—

**Dylan Patel**

No, you can't run it hotter. You can only run it denser. The problem is that getting the heat out of that dense area means you have to move away from standard air and liquid cooling to more exotic forms of liquid cooling, or even immersion, to get to higher power densities. That's more difficult in space than it is on Earth.

**Dwarkesh Patel**

Maybe it's worth explaining at this point what exactly a scale-up is and what it looks like for Nvidia versus Trainium versus TPUs.

**Dylan Patel**

Earlier I was mentioning how communication within a chip is super fast. Communication within chips that are in the same rack is fast, but not as fast. It's on the order of terabytes. Communication very far away is on the order of hundreds of gigabytes. As you get further distance, maybe across the country, the order of magnitude is on the order of gigabytes.

A scale-up domain is this tight domain where the chips are communicating on the order of terabytes a second. For Nvidia, previously this meant an H100 server had eight GPUs, and those eight GPUs could talk to each other at terabytes a second. With Blackwell NVL72, they implemented rack-scale scale-up. That meant all seventy-two GPUs in the rack could connect to each other at terabytes a second. The speed doubled generation on generation, but the most important innovation was going from eight to seventy-two in the domain.

When we look at Google, their scale-up domain is completely different. It has always been on the order of thousands. With TPU v4, they had pods the size of four thousand chips. With v8 or v7, they have pods in the eight or nine thousand range. What's relevant here is that it's not the same as Nvidia. It's not like for like.

Google has a topology that's a [torus](https://newsletter.semianalysis.com/p/tpuv7-google-takes-a-swing-at-the). Every chip connects to six neighbors. Nvidia's 72 GPUs connect all-to-all. They can send terabytes a second to any arbitrary other chip in that pod of scale-up. Whereas Google, you have to bounce through chips. If TPU 1 needs to talk to TPU 76, it has to bounce through various chips, and there is always some blocking of resources when you do that because that one TPU is only connected to six other TPUs.

So there is a difference in topology and bandwidth, and there are trade-offs and advantages to both. Google gets to have a massive scale-up domain, but they have the trade-off of bouncing across chips to get from one to another. You can only talk to six direct neighbors.

Amazon has mutated their scale-up domain. They're somewhere in between Nvidia and Google. They're trying to make larger scale-up domains. They try to do all-to-all to some extent with switches, which is what Nvidia does, but they also use torus topologies like Google to some extent.

As we advance forward to next generations, all three of them are moving more towards a [dragonfly topology](https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/34926.pdf). That means there are some fully connected elements and some elements that are not fully connected. You can get the scale-up to be hundreds or thousands of chips, but also have it not contend for resources when bouncing through chips.

**Dwarkesh Patel**

Related question: I heard somebody make the claim that the reason parameter scaling has been slow—and only now are we getting bigger models from OpenAI and Anthropic—is that… The original GPT-4 is over a trillion parameters, and only now are models starting to approach that again. I heard a theory that the reason is that Nvidia's scale-ups have just not had that much memory capacity. Let's say you have a 5T model running at FP8, so that's five trillion gigabytes. And then you have the KV cache, let's say it's—

**Dylan Patel**

Just call it the same size.

**Dwarkesh Patel**

Okay, let's say it's the same size for one batch. So you need ten terabytes to be able to run…

**Dylan Patel**

A single forward pass, yeah.

**Dwarkesh Patel**

And then only with the GB200 and NVL72 do you have an Nvidia scale-up that has twenty terabytes, and before that they were much smaller. Whereas Google, on the other hand, has had these huge TPU pods that are not all-to-all, but still have hundreds of terabytes of capacity in a single scale-up. Does that explain why parameter scaling has been slow?

**Dylan Patel**

I think it's partially the capacity and bandwidth, but also as you build a larger model, the ability to deploy it is slower. In terms of what the inference speed is for the end user, that's kind of irrelevant. What's really relevant is RL.

What we've seen with these models and allocation of compute at a lab… There are a few main ways you can allocate compute. You can allocate it to inference, i.e. revenue. You can allocate it to development, i.e. making the next model. You can allocate it to research. In development specifically, you split it between [pre-training](https://www.databricks.com/blog/llm-pre-training-and-custom-llms) and RL.

When you think about what is happening, the compute efficiency gains you get from research are so large that you actually want most of your compute to go to research, not to development. All these researchers are generating new ideas, trying them out, testing them, and continuing to push the Pareto optimal curve of [scaling laws](https://en.wikipedia.org/wiki/Neural_scaling_law) further and further. Empirically, what we’ve seen is that model costs get ten times cheaper every year, or even more than that. At the same scale it gets ten times cheaper, and to reach new frontiers it costs the same amount or more. So you don't want to allocate too many resources to pre-training and RL. You actually want to allocate most of your resources to research.

In the middle is this development period. If you pre-train a five-trillion-parameter model, how many rollouts do you have to do in RL? Rollouts for a five-trillion-parameter model are five times larger than for a one-trillion-parameter model. If you wanted to do as many rollouts—maybe the larger model is two times more sample efficient—now you need 2.5x as much time of RL to get the model smarter.

Or you could RL the smaller model for 2x the time. You'd still have a 25% difference in the big model, which is 2x as sample efficient and doing X number of rollouts. But the smaller model, which is a trillion parameters, although its less sample efficient, is doing twice as many rollouts and is still done faster. You get the model sooner, you've done more RL, and then you can take that model to help you build the next models, help your engineers train, and do all these research ideas.

This feedback loop is actually weighed towards smaller models in every case, no matter what your hardware is. As you look to Google, they do deploy the largest production model of any of the major labs with [Gemini Pro](https://deepmind.google/models/gemini/pro/). It's a larger model than GPT-5.4. It's a larger model than Opus. Google does this because they have a unipolar set of compute. It's almost all TPU.

Whereas Anthropic is dealing with H100s, H200s, Blackwell, Trainiums, and TPUs of various generations. OpenAI is dealing with mostly Nvidia right now, but going towards having AMD and Trainium as well. The fleets of compute like Google's can just optimize around a larger model. They can leverage a thousand chips in a scale-up domain to get the RL time speed much faster so that this feedback loop can be fast.

But at the end of the day, in isolation, you almost always want to go with a smaller model that gets RL'd faster and gets deployed into research and development earlier. You can build the next thing and get more efficiency wins. You have this compounding effect of making a smaller model that can be deployed into research and development earlier. I spend less compute on the training because I was able to allocate more compute to the research. This compounding effect of being able to do research faster and faster is potentially a faster takeoff. That's all these companies want: the fastest takeoff possible.

### 02:14:26 – Why aren’t more hedge funds making the AGI trade?

**Dwarkesh Patel**

Okay, a spicy question. You've explained that SemiAnalysis sells these spreadsheets. You're always pointing out how six months or a year ago, you warned people about the memory crunch. Now you're telling people about the cleanroom crunch, and in the future, the tool crunch. Why is Leopold the only person using your spreadsheets to make outrageous money? What is everybody else doing?

**Dylan Patel**

I think there are a lot of people making money in many ways. Leopold jokes that he's the only client of mine who tells me our numbers are too low. Everyone else tells me our numbers are too high, almost ad nauseam. Whether it's a hyperscaler saying, "Hey, that other hyperscaler, their numbers are too high," and we're like, "Nah, that's it." They're like, "No, no, no, it's impossible," blah, blah, blah. You finally have to convince them through all these facts and data when we're working with hyperscalers or AI labs that in fact, no, that number isn't too high, that's correct. Eventually, sometimes it takes them six months to realize, or a year later.

Other clients, on the trading side, also use our data. Roughly 60% of my business is industry. So AI labs, data center companies, hyperscalers, semiconductor companies, the whole supply chain across AI infrastructure. But 40% of our revenue is hedge funds. I'm not going to comment on who our customers are, but a lot of people use the data. It's just how do you interpret it, and then what do you view as beyond it?

I will say Leopold is pretty much the only person who tells me my numbers are too low, always. Sometimes he's too high, sometimes I'm too low. But in general, I think other people are doing that. You can look across the space at hedge funds and look at their 13Fs and see they own, maybe not exactly what Leopold does, because it's always a question of what is the most constrained thing. What's the thing that's going to be most outside of expectations?

That's what you're really trying to exploit: inefficiencies in the market. In a sense, our data is making the market more efficient by making the base data of what's happening more accurate. Many funds do trade on information that is out there… I don't think Leopold's the only person. I think he has the most conviction about the AGI takeoff, though.

**Dwarkesh Patel**

Right, but the bets are not about what happens in 2035\. The bets that you're making—that are at least exemplified by public returns we can see for different funds including Leopold's—are about what has happened in the last year. The last year stuff could be predicted using your spreadsheets. It's about buying the next year's spreadsheets.

**Dylan Patel**

They're not just spreadsheets. There are reports. There's API access to the data. There's a lot of data.

**Dwarkesh Patel**

But do you see what I mean? It's not about some crazy singularity thing. It's about, do you buy the memory crunch?

**Dylan Patel**

You only buy the memory crunch if you believe AI is going to take off in a huge way. The memory crunch, a lot of it was predicated on… At least for people in the Bay Area who think about infrastructure, it's obvious. KV cache explodes as context lengths get longer, so you need more memory. Then you do the math.

You also have to have a lot of supply chain understanding of what fabs are being built, what data centers are being built, how many chips, and all these things. We track all these different datasets very tightly, but at the end of the day, it takes someone to fully believe that this is going to happen.

A year ago, if you told someone memory prices would quadruple and smartphone volumes are going to go down 40% over the year or two after that, people were like, "You're crazy. That'd never happen." Except a few people do believe that, and those people did trade memory.

And people did. I don't think Leopold was the only person buying memory companies. He, of course, sized and positioned and did things in better ways than some, maybe most. I don't want to comment on whose returns are what, but he certainly did well. Other people also did really well.

Wow, you've made me diplomatic for the first time ever. No, no, you're fine. I think this is hilarious. I'm being a diplomat, whereas usually I'm spicy.

### 02:18:49 – Will TSMC kick Apple out from N2?

**Dwarkesh Patel**

Okay, some rapidfire to close out. If you're saying with the memory, logic, et cetera, the N3 is mostly going to be AI accelerators, but then there's N2, which is mostly Apple now… In the future, I guess AI would also want to go on N2. Can TSMC kick out Apple if Nvidia and Amazon and Google say, "Hey, we're willing to pay a lot of money for N2 capacity?"

**Dylan Patel**

I think the challenge with this is chip design timelines take a long while, so that's more than a year out, and the designs that are on two nanometer are more than a year out.

What would really happen is Nvidia and all these others will be like, "Hey, we're going to prepay for the capacity and you're going to expand it for us." Maybe TSMC takes a little bit of margin, but not a ton. They're not going to kick Apple out entirely. What they're going to do is when Apple orders X, they might say, "Hey, we project you only need X minus one, and so that's what we're going to give you, X minus one." Then that flex capacity, Apple's kind of screwed on.

Traditionally, Apple has always over-ordered by 10% and cut back by 10% over the course of the year. Some years they hit the entire 10%. Volumes vary based on the season and macro.

I don't think TSMC would kick out Apple. I think Apple will become a smaller and smaller percentage of TSMC's revenue, and therefore be less relevant for TSMC to cater to their demands. TSMC could eventually start saying, "Hey, you've got to pre-book your capacity for next year, for two years out, and you have to prepay for the CapEx," because that's what Nvidia and Amazon and Google are doing.

**Dwarkesh Patel**

I wonder if it's worth going into specific numbers. I don't have any of them on hand. What percentage of N2 does Apple have its hands on over the coming years versus AI?

**Dylan Patel**

This year Apple has the majority of N2 that's going to get fabricated. There's a little bit from AMD. They are trying to make some AI chips and CPU chips early. There's a little bit, but for the most part, it's Apple.

As we go forward to the year after that, Apple still gets closer to half of it as other people start ramping, but then it falls drastically, just like for N3, where they were half. When I say N2, that includes [A16](https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_A16), which is a variant of N2. Over time, those nodes will be the majority.

What's also interesting is traditionally, Apple has been the first to a process node. 2 nm is actually the first time they're not. Well, that’s besides Huawei. Huawei, back in 2020 and before, was the first with Apple, but they were both making smartphones. Now, with 2 nm, you've got AMD trying to make a CPU and a GPU chiplet that they use advanced packaging to package together, in the same timeframe as Apple. This is a big risk for AMD that causes potential delays because it's a brand-new process technology. It's hard. But at the end of the day, this is a bet that they want to do to scale faster than Nvidia and try and beat them.

As we move forward, when we move to the A16 node, the first customer there is not even Apple. It's AI. As we move forward, that will become more and more prevalent. Not only will Apple not be the first to a node, they will also not be the majority of the volume to the new node. They'll then just be like any old customer.

Because the scale of TSMC's CapEx keeps ballooning, but Apple's business is not growing at the same pace, they become a less and less relevant customer. They also will just cut their orders because things in the supply chain are kicking them out, whether it be packaging or materials or DRAM or NAND. These things are increasing in cost. They can't pass on all the cost to customers likely because the consumer is not that strong. You end up with this conundrum where they are just not TSMC's best bud like they have been historically.

**Dwarkesh Patel**

Do you think if Huawei had access to 3 nm, they would have a better accelerator than Rubin?

**Dylan Patel**

Potentially, yeah. Huawei was the first with a 7 nm AI chip as well. They were the first with a 5 nm mobile chip, but they were the first with a 7 nm AI chip. The Huawei Ascend was two months before the TPU and four months before Nvidia's A100, I think.

That's just moving to a process node. That doesn't imply software or hardware design or all these other things. But Huawei is arguably the only company in the world that has all the legs. Huawei has cracked software engineers. Huawei has cracked networking technologies. That's, in fact, their biggest business historically. They have cracked AI talent.

Furthermore, beyond Nvidia, they actually have better AI researchers. Beyond Nvidia, they have their own fabs. And beyond Nvidia, they have their own end market of selling tokens and things like that. Huawei is able to get the top, top talent. Nvidia is as well, but not with as much concentration, and Huawei has a bigger pool in China.

It's very arguable that Huawei, if they had TSMC, would be better than Nvidia. There are areas where China has advantages in areas that Nvidia can't access as easily. Not just scale, but certain optical technologies China's actually really good at.

I think it's very reasonable that if in 2019 Huawei was not [banned from using TSMC](https://www.nytimes.com/2020/05/15/business/economy/commerce-department-huawei.html), Huawei would have already eclipsed Apple as the biggest TSMC customer. Huawei has huge share in networking, compute, CPUs, and all these things. They would have kept gaining share, and they'd likely be TSMC's biggest customer.

### 02:24:35 – Robots and Taiwan risk

**Dwarkesh Patel**

Wow. That's crazy.  I've got a random final question for you. The other part of the Elon interview was robots. If humanoids take off faster than people expect, if by 2030 there's millions of humanoids running around which each need local compute, any thoughts on what that implies? What would be required for that?

**Dylan Patel**

There's a lot of difficulties with the [VLMs](https://www.nvidia.com/en-us/glossary/vision-language-models/) and [VLAs](https://www.pi.website/research/knowledge_insulation) that people are deploying on robots. But to some extent, you don't need to have all the intelligence in the robot. It would be much more efficient to not do that. Because in the cloud, you can batch process and all these things.

What you may want to do is have a lot of the planning and longer-horizon tasks determined by a much more capable model in the cloud that runs at very high batch sizes. Then it pushes those directions to the robots, who interpolate between each subsequent action. Or it is given a command like, "Hey, pick up that cup," and then the model on the robot can pick up the cup. As it's picking up, things like weight and force may have to be determined by the model on the robot, but not everything needs to be. It can say, “hey that’s a headphone” and the super model in the cloud can say, "I know these headphones are Sony XM6s," which is not a Dwarkesh ad spot, but...

**Dwarkesh Patel**

I’m like, why is this guy's plugging this thing so hard. It's on the table. It's on his neck when we're interviewing Satya together. Is he getting paid by Sony?

**Dylan Patel**

Unfortunately not. But anyways, it might say, "Hey, the headband is soft, and this is the weight of it," and all these things. Then the model on the robot can be less intelligent, take these inputs, and do the actions. It may get told by the model in the cloud every second, or maybe ten times a second, depending on the hertz of the action. But a lot of that can be offloaded to the cloud.

Otherwise, if you do all of the processing on the device, I believe it would be more expensive because you can't batch. Two, you couldn't have as much intelligence as you do in the cloud because the models will just be bigger in the cloud. Three, we're in a semiconductor shortage world, and any robot you deploy needs leading-edge chips because the power is really bad for robots. You need it to be low power and efficient, and all of a sudden you're taking power and chips that would've been for AI data centers, and you're putting them in robots. So now that 200 gigawatts gets lower if you're deploying millions of humanoids.

**Dwarkesh Patel**

I think this is very interesting because something people might not appreciate about the future is how centralized, in a physical sense, intelligence will be. Right now, there are eight billion humans, and their compute is in their heads, on their person.

In the future, even with robots that are out physically in the world—obviously, knowledge work will be done in a centralized way from data centers with hundreds of thousands or maybe millions of instances—the future you're suggesting is one where there's more centralized thinking and centralized computation driving millions of robots out in the world. That's an interesting fact about the future that I think people might not appreciate.

**Dylan Patel**

I think Elon recognizes this, which is why he's going to different places for his chips. He signed this massive deal with Samsung to make his robot chips in Texas because I personally think he thinks Taiwan risk is huge.

Because of that and the centralization of resources in Taiwan, having his robot chips in Texas means having a separate supply chain that is not as constrained. No one's really making AI chips on Samsung besides Nvidia's new [LPU](https://groq.com/blog/the-groq-lpu-explained) that they launched. They’re launching it next week, but we're recording this the week before.

**Dwarkesh Patel**

This episode's coming out Friday.

**Dylan Patel**

Oh, this episode's coming out before. Sick. They're launching this new AI chip next week which is built on Samsung, but that's a recent development from Nvidia. That's the only other AI demand there, whereas on TSMC, everything is competing. He gets both geopolitical diversification and supply chain diversity for his robots, and he's not competing as much with the infinite willingness to pay for the data center geniuses.

**Dwarkesh Patel**

Final question, on Taiwan. If we believe that tools are the ultimate bottleneck, how much of Taiwan's place in the AI semiconductor supply chain could we de-risk simply by having a plan to airlift every single process engineer at TSMC out if they get blockaded or something? Or do you still need to ship out the EUV tools, which would be multiple plane loads per single tool and would not be practical?

**Dylan Patel**

If you ship out all the process engineers and assuming it's hot enough that you destroy the fabs, no one has all the fabs in Taiwan now, which is a big risk.

These tools actually use a lot of semiconductors which are manufactured in Taiwan. It's a [snake eating its own tail](https://en.wikipedia.org/wiki/Ouroboros) meme because you can't make the tools without the chips from Taiwan, which you can't use without the tools in Taiwan. There's obviously some diversification there. They don't use super advanced chips in lithography tools, but at the end of the day, there is some dragon eating its tail.

Just shipping out all the engineers and blowing up the fabs means China has a stronger semiconductor supply chain than the rest of the world in terms of verticalization, now that you've removed Taiwan. You've got all the know-how, but you've got to replicate it in, let's say, Arizona or wherever for TSMC. It's going to take a long time to build all the capacity that TSMC has built over the years.

And so you've drastically slowed US and global GDP. Not just growth, you've shrunk the GDP massively, and you've got a lot bigger problems. Your incremental ability to add compute goes to almost zero. Instead of hundreds of gigawatts a year by the end of the decade, let's say something happens to Taiwan, now you're at maybe 10 gigawatts across Intel and Samsung, or 20 gigawatts. It's nothing.

Now all of a sudden you've really caused some crazy dynamics in AI. Of course, you have all the existing capacity, but that existing capacity pales in comparison to the capacity that's being expanded.

**Dwarkesh Patel**

Okay. Dylan, that was excellent. Thank you so much for coming on the podcast.

**Dylan Patel**

Thank you for having me. And see you tonight.