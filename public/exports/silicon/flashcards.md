# Silicon

- Total cards: 35

Transistors, chip design, and fabrication — diodes to MOSFETs, MACs to RTL-to-GDS, and STI to high-NA EUV.

---

## Diode and BJT mechanism

### Q1. What is a diode?

A two-terminal semiconductor that allows current to flow one way but not the other.

### Q2. Does a diode act as a conductor or insulator when conventional current flows from $\text{battery} \to \text{P} \to \text{N} \to \text{battery}$? Why?

Insulator.

Electrons saturate the holes in P, leaving no differential for the electrons in N to jump towards. Meanwhile, the extra electrons in N flow back to the battery.

### Q3. Does a diode act as a conductor or insulator when conventional current flows from $\text{battery} \to \text{N} \to \text{P} \to \text{battery}$? Why?

Conductor.

Electrons saturate N, push into the depletion region, then jump across to the holes in P, which then return to the battery.

### Q4. In a BJT transistor, if a small positive current is allowed to flow from base to emitter, what is allowed to happen?

A large positive current is allowed to flow from collector to emitter.

![BJT control flow](/images/silicon/bjt-current-flow.png)

*Image from Ben Eater's transistor video.*

### Q5. If electrons are flowing from emitter to base (i.e. you turn the transistor on), why does that enable those electrons to now reach the collector?

You're allowing electrons from the emitter to get all the way up into the base, so close that they can jump across the depletion region between base and collector.

![NPN BJT electron flow: emitter → base → collector](/images/silicon/bjt-electron-flow.png)

*Image from Ben Eater's transistor video.*

## MOSFET vs BJT

### Q1. Sketch in your head what a MOSFET looks like.

Top to bottom: gate (metal) on top of an SiO₂ insulator, sitting on a P-type substrate. Two N-doped wells flank the gate on the left and right — the source and the drain. When the gate is positive, a channel of electrons forms in the substrate just under the insulator, connecting source to drain.

![NMOS cross-section](/images/silicon/mosfet-cross-section.png)

### Q2. Why does a positive charge at the gate open up the channel underneath the insulator? (Consider an NMOS.)

It pulls up the electrons in the P-type substrate, filling up the holes at the top — the channel.

### Q3. Why is a MOSFET more power efficient than a bipolar junction transistor?

In a MOSFET, the input is a voltage you set. In a BJT, it's a current you must keep feeding.

### Q4. Conceptually, why doesn't it require a continuous current to keep the MOSFET channel between source and drain open?

Thanks to the insulator between the gate and the channel, there's no power dissipated. The channel is powered just by voltage (basically potential energy).

### Q5. What is the only time you have to pay an energy cost in a MOSFET?

When you turn the transistor on or off (i.e. when the gate voltage changes).

### Q6. In a MOSFET, you can think of the positive gate / SiO₂ insulator / negative channel triplet as what kind of component?

A capacitor.

## Since 1947

### Q1. The original 1947 transistor was made of germanium, which also has 4 valence electrons like silicon. Why can't germanium be used to build MOSFETs?

Its native oxide (GeO₂) is water-soluble and electrically defective. MOSFETs need a thin, stable, near-perfect insulator on the channel — only silicon grows one (SiO₂).

### Q2. What was Dennard scaling and why did it come to an end?

Dennard scaling refers to the period from 1960-2005 in which planar MOSFETs were scaled down by directly shrinking their dimensions, which increased power density.

However, threshold voltage and leakage current do not scale with transistor length - Source and Drain got so close together that they would be current even without the channel being on.

### Q3. At a high level, what is the difference between planar, FinFET, and gate-all-around?

- Planar: gate sits flat atop the source-to-drain channel.
- FinFET: gate drapes the channel from three sides.
- Gate-all-around: gate fully wraps the channel from all sides.

### Q4. MOSFET technology has progressed from planar (1965–2011) to FinFET (2011–2022) to gate-all-around (2022 onwards). Why?

Better gate control means you can shrink the source-to-drain distance (the "gate length") without source/drain fields leaking current through.

## Gates and arithmetic

### Q1. What kind of operation does a MUX implement?

Selection — a ternary operator for two inputs.

![3-to-1 MUX as AND/OR tree on select signals](/images/silicon/mux.png)

### Q2. What is the difference between a half adder and a full adder?

A full adder considers the carry-in; a half adder doesn't.

### Q3. What would a 4-bit ripple-carry adder made of 1-bit full adders look like?

A horizontal chain of 4 full adders. Each takes a pair of bits plus the previous adder's carry-out as its carry-in, and emits a sum bit plus a carry-out that feeds the next adder.

![4-bit ripple-carry adder](/images/silicon/ripple-carry-adder.png)

### Q4. Walk through the calculation of the area taken up by an int8 × int8 multiply-accumulate. Relevant gate counts: full adder = 1.0, 2:1 mux = 0.3.

Consider the simpler 4×4 case: $1010 \cdot 1110 + z$ (with $z$ the accumulate).

This breaks down into

$$1 \cdot (1110 \ll 3) + 0 \cdot (1110 \ll 2) + 1 \cdot (1110 \ll 1) + 0 \cdot 1110 + z.$$

Each of those is in turn a mux:

$$(1\,?\,1110 \ll 3 : 0) + (0\,?\,1110 \ll 2 : 0) + (1\,?\,1110 \ll 1 : 0) + (0\,?\,1110 : 0) + z.$$

So you need as many adds and muxes as there are digits in the first number.

The width of both gates has to be twice the width of the biggest number, since an 8-bit × 8-bit product can be 16 bits wide.

$$(8 \cdot 0.3 \cdot 16) + (8 \cdot 1.0 \cdot 16) = 8 \cdot 1.3 \cdot 16 = 166.4.$$

### Q5. Visualize how you can use a fused multiply-add to compute the dot product of two vectors.

For two length-$N$ vectors, run $N$ sequential FMAs: $\text{acc} \leftarrow a_i \cdot b_i + \text{acc}$ for $i = 0, \dots, N - 1$. The accumulator ends up holding $\sum_i a_i b_i$.

![Chained FMAs computing a dot product](/images/silicon/fma-dot-product.png)

## RTL to GDS, clock speed, memory

### Q1. Walk through the 5 steps of the RTL-to-GDS PD flow.

1. Logic synthesis: compile RTL → technology-independent graph of universal gates (NAND-ish).
2. Technology mapping: collapse the graph by pattern-matching the larger patterns of TSMC's standard cell library onto it ("regex for trees") → technology-dependent netlist.
3. Placement: embed cells in 2D minimizing wire length (spring / cost-function optimization).
4. Routing: connect placed cells with wires on stacked copper layers (Manhattan-only).
5. GDS-out: lower placement + routing to polygons (doping, etch, metal) → mask data for TSMC.

### Q2. Why can two chips on the same TSMC node run at 4 GHz vs 5 GHz?

Clock speed is set by the critical path — the longest delay between any two registers (wire plus logic cost). Two chips on the same node can have a different layout, affecting this quantity.

### Q3. What is the tradeoff between registers and SRAM?

SRAM is much smaller per bit but rigid (1R xor 1W per cycle); register files are bigger per bit but flexible (cheap to add ports, no minimum size).

### Q4. Why can you only read OR write one column of an SRAM array per cycle?

Because of how it's implemented: an SRAM is a hand-designed macro with exactly one decoder + one set of bit lines wired into the grid.

![SRAM array layout: one decoder, shared word/bit lines](/images/silicon/sram-array.png)

## Fabrication

### Q1. What is the difference between chemical vapor deposition and thermal oxidation?

In thermal oxidation, you're actually reacting with the silicon directly to make a new compound (Si -> SiO2) whereas in chemical vapor deposition, you're reacting some precursor gas to accumulate atop the existing material, not by turning it into something

### Q2. Here is the before and after of shallow trench isolation formation. Why couldn't we have just used photoresist directly on top of the pad oxide to make the trench? Why is a nitride needed?

![Shallow trench isolation formation: before and after the trench etch](/images/silicon/sti-formation.png)

![Oxide fill, CMP, and nitride strip producing the final STI structure](/images/silicon/sti-fill-cmp.png)

Without the nitride atop to prevent thermal oxidation atop the corners of the trench, you'd create bonds there which are bent. Even once you mechanically polish them atop, they'd be vulnerable to mechanical stress, but with nitride atop they form clean molecular structures.

### Q3. Nodes below 7 nm often use a hard mask (like silicon nitride) as opposed to photoresist to block the ions during the well implants. Why is this?

![Well implants masked by photoresist](/images/silicon/well-implants.png)

As the NA (the concentration angle) of the lithography increases, you have to use thinner layers of photoresist, lest you have inward sloping edges because of light angle. Thin resist can't block high energy well implants.

### Q4. Why did we have to switch from naive SiO2 gates to high-K metal gates (eg. HfO2 for the dielectric and metals atop)?

As transistors got smaller, silicon dioxide would let too much current leak between the gate and the channel. High K metal gates have better capacitance.

### Q5. Why do modern transistor processes use a dummy gate that is replaced at the end with the actual gate stack?

The gate consists of several metals that are chosen to optimize the conductivity of the gate and threshold voltage of the device. They can melt and degrade when subjected to high temperature processes that occur at the beginning of transistor fabrication. Therefore, they are deposited last to avoid these high temperature steps.

### Q6. Explain the basic mechanism of atomic layer deposition (ALD)

The first precursor gas is passed over the wafer. It typically has a metal part and an organic part. The metal portion binds to the surface, forming a single layer with the organic sticking up. This process is self-limiting because binding only happens between the wafer and the metal, not between the metal and the organic. Next, the chamber is purged and the second precursor is introduced. This gas reacts with the dangling organics pulling off the organic part of the molecule and leaving a single atomic layer of the metal. This process is repeated for as many layers as desired.

## Interconnects and lithography

### Q1. Until recently, copper is used for interconnects except for the end part that actually touches the transistor, which is made of tungsten. 1. why is tungsten used there? 2 why is copper used elsewhere.

Copper diffuses so much that if it was directly touching the transistor, you'd worry about it damaging sensitive areas. So we used Tungsten there.

Tungsten has higher resistivity, so it would require more power for all the interconnects if we used tungsten all over.

### Q2. Why is ruthenium preferred over copper for interconnects, despite having more bulk resistivity? Give 2 reasons

Ruthenium is easier to etch than copper, which allows you to etch out air gaps (air has the lowest capacitance)

At nanoscale, ruthenium has lower resistance, because mean free path of an electron is lower, which means it accumulates and thus dissipates less energy between collisions

### Q3. Explain the main difference between DUV and EUV masks

DUV masks are transmitting, meaning they selectively transmit or absorb light based on the pattern. Since every material absorbs EUV light, this approach cannot be used in the EUV case. Instead of transmitting, EUV masks must be reflective in the regions where the resist should be exposed.

### Q4. Name the main complexities of EUV masks and why they are so expensive ($10-15 million for full mask set). (1 out of 3 okay)

1\. EUV masks are reflective, so the blank mask must be made of 40-50 alternating layers of silicon and molybdenum. This structure is hard to fabricate. 2. Patterning the mask requires a dedicated multi-beam electron lithography tool. Inspecting the mask for defects requires another dedicated high-resolution inspection tool. Mask yield is ~50% which increases cost. 3. To keep dust particles off the mask, a pellicle must be placed over the mask which must be ultra thin and temperature resilient.

### Q5. A high-NA EUV machine has an NA of 0.55. The theoretical maximum value for the NA is 1. What are the optical reasons EUV NA likely cannot scale much beyond 0.75? (1 out of 2 okay)

1\. As the NA increases, the lenses become very large. Large lenses mean that the light will strike the lenses at a large angle. At large angles different polarizations of light are reflected differently. This reduces the contrast between the absorbing and reflecting parts of the mask. 2. The depth of field (DOF) quantifies what thickness of the resist is in focus during exposure. DOF ~ 1 / NA². Therefore, as the NA is increased, the DOF gets smaller, meaning a thinner resist must be used. Thinner resists are worse at blocking subsequent etching steps.
