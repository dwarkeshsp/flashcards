# Jacob Kimmel on the Dwarkesh Podcast

- Total cards: 10

Practice questions for Jacob Kimmel, drafted by the agent flashcard pipeline and human-reviewed before promotion.

> Prepared for a future offline pipeline run. Produces review artifacts only; does not edit lib/episodes.

---

## (00:07:39) — 00:00:00 – Three reasons evolution didn’t optimize for longevity

### Q1. What is the counterargument to “evolution should always favor longer life because longer-lived organisms can have more descendants”?

If an intervention extends lifespan without restoring late-life function, older individuals may consume resources while contributing fewer offspring than younger replacements. From a selfish-gene view, turnover at high fitness can beat longevity with decline.

### Q2. In Kimmel's framing, what three search constraints limit what features evolution can discover, even if they are in principle easy to engineer?

- Mutation rate bounds the size of genetic steps and is constrained by cancer/deleterious-mutation risk;
- population size bounds parallel search;
- much selection pressure may be spent on things like infectious disease rather than late-life health.

### Q3. What reason does Jacob Kimmel suggest for thinking that lifetime mutations are not the cause of aging?

People with Lynch syndrome or DNA polymerase defects can have a mutation rate that is 10-1000 times higher than normal, and they seem fine.

## (00:12:17) — 00:12:07 – Why didn't humans evolve their own antibiotics?

### Q1. Why might microbes evolve antibiotics but humans not evolve their own antibiotic cassette, even though infection mattered a lot for human fitness?

Antibiotics are not a one-time invention; they are part of a Red Queen chemical arms race. Microbes have huge population sizes and can tolerate high mutation rates because failed mutants do not endanger a whole multicellular body. Humans cannot run that fast a chemical arms race: high mutation rates in metazoans risk cancer or organism-level failure

## (00:25:26) — 00:25:26 – De-aging cells via epigenetic reprogramming

### Q1. As of 2024, what are the 2 kinds of models NewLimit has been training?

1. `transcriptome → cell age`
2. `transcriptome from old cells + the TF you want to test → whether that TF will make the cell look younger`

### Q2. How many transcription factors are there in the human genome?

1600

### Q3. How did Yamanaka discover which transcription factors constituted the minimal set for converting somatic cells to iPSC?

He started with 24 transcription factors highly expressed in embryonic stem cells, showed all 24 together could reprogram fibroblasts to iPSCs, then systematically removed factors one by one to find the minimal essential set of four: OSKM.

## (01:17:23) — 01:09:31 – Can virtual cells break Eroom's Law?

### Q1. How could a virtual-cell model make drug discovery less bespoke?

Run sparse perturbation experiments, measure how cell state changes, and train a model that predicts the effect of interventions. Then instead of testing every gene combination in the lab, search in silico for perturbations likely to move diseased or aged cells toward a desired healthy state. 

## (01:32:07) — 01:31:32 – Economic models for pharma

### Q1. Why do durable medicines create a reimbursement problem in a healthcare system where patients often switch insurers?

The insurer paying today may not be the insurer that benefits later. If a one-time therapy prevents expensive disease five or ten years out, but the patient changes plans after three or four years, the original insurer pays the upfront cost while another payer captures the savings. 

### Q2. What is the economic argument that preventive longevity medicines could reduce healthcare spending rather than increase it?

A lot of healthcare spending is concentrated after people are already very sick, especially in intensive late-stage care. If medicines preserve organ or immune function and prevent hospitalizations or late-life complications, they can shift spending from labor-intensive sick-care administration toward pharmaceutical prevention.
