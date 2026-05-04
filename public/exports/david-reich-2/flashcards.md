# David Reich on the Dwarkesh Podcast (Part 2)

- Total cards: 13

Practice questions for David Reich's second appearance on natural selection in recent human evolution and the new Akbari et al. study of ~500 loci under selection in the last 10,000 years.

> Prepared before the episode aired. Organized by topic for now — I'll re-slice by timestamp once the recording is live.

---

## Population genetics fundamentals

### Q1. What concretely is the selection coefficient of an allele?

How many more surviving offspring, in expectation, carriers of the allele will have.

E.g. a selection coefficient $s = 0.01$ means $1\%$ more surviving offspring than non-carriers.

### Q2. Expected heterozygosity scales as what? (constant + two variables)

$$H \propto 4 \cdot N_e \cdot \mu$$

where $N_e$ is the effective population size and $\mu$ is the mutation rate.

### Q3. What is effective population size, and why is it so much smaller than census population size?

The size of an idealized population that would experience the same rate of genetic drift as the real population.

It's smaller than census size because of previous bottlenecks and unevenness in reproduction (not everyone reproduces equally).

### Q4. What is background selection?

The steady purging of deleterious alleles near functional regions, which also drags along any neutral variation that sits on the same haplotype background.

## Selection dynamics in populations

### Q1. Why does it only take twice as long for a favorable allele to reach fixation in a population of 100 million as compared to a population of 10,000?

The frequency of an advantageous allele grows exponentially over time (like the flu), so the time to fixation scales with the logarithm of population size — not linearly.

### Q2. Why do even neutral alleles get caught up in background selection? Why does the local level of drift go up?

When a deleterious allele is eliminated, it takes along everything else on the same chromosome that's linked to it — including neutral variants nearby. That linked hitchhiking effectively reduces $N_e$ locally, which looks like extra drift.

### Q3. What are two reasons that selective sweeps on specific loci might be rare despite the fact that selection for traits has continued?

1. Traits are so polygenic that any individual locus is effectively neutral.
2. The direction of selection changes so quickly that no single locus gets sustained enough pressure for a sweep to get traction.

## Detecting selection — classical methods

### Q1. Describe how the amount of selection on a locus can be identified by looking at diversity around it.

Selection shows up as unusually **low** diversity near a functional gene — neutral variants nearby get carried along (or purged) via linkage, reducing local heterozygosity.

### Q2. Describe how selection on a locus can be identified through differences between diverged populations.

The allele frequency of the variant is much more different between diverged populations than drift alone would imply.

### Q3. Explain the methodology of Bhatia et al. 2014 to find selection effects of American slavery.

- African Americans are $\sim 20\%$ European and $\sim 80\%$ West African (using the Yoruba population as a proxy for pre-admixture West African ancestry).
- If a site has been under selection since admixture, the allele frequency in modern African Americans should deviate from the frequency predicted by that $20/80$ mixture.
- They ran this scan on $29{,}141$ African Americans.

### Q4. What technique was used before Reich & Akbari to ask whether allele frequency changes over time resulted from selection vs. drift?

The admixture-residual method: model later populations as linear mixtures of earlier ones, then flag any allele whose frequency deviates more from the mixture prediction than drift alone would allow.

### Q5. What problem does the admixture-residual method have for figuring out selection vs. drift over the last 10,000 years (pre Reich/Akbari)?

Its drift-based null distribution is set by the *entire* divergence history — tens of thousands of years, including eras when groups had very small effective population sizes and therefore lots of drift. That inflated null makes it hard to detect real selection over the last 10,000 years specifically.

## The Reich & Akbari paper

### Q1. The new Reich paper found ~500 significant loci under selection in the last 10,000 years. What are two ways to reconcile this with the previous finding that there are almost no fixed differences between populations?

1. **Selection has accelerated recently** (due to agriculture, new environments, etc.) — velocity is high, but there hasn't been enough time to drive any allele all the way to fixation.
2. **Selection fluctuates.** Instead of driving an allele to fixation, the direction can reverse, so allele frequencies oscillate rather than getting pinned at 0 or 1.
