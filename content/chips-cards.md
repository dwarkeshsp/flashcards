---
slug: chips
title: Chips
kind: subject
blurb: Multiplexers, adders, MACs, RTL-to-GDS, and the SRAM vs. register file trade-off.
---

# Editing notes

- Source: self-investigation. No blog post yet.
- One card per `## Q:` / `### A:` pair. Card boundaries are `---`.

---

# Section: Gates and arithmetic
id: gates-and-arithmetic

## Q: What kind of operation does a MUX implement?

### A:

Selection — a ternary operator for two inputs.

![3-to-1 MUX as AND/OR tree on select signals](/images/chips/mux.png)

---

## Q: What is the difference between a half adder and a full adder?

### A: A full adder considers the carry-in; a half adder doesn't.

---

## Q: What would a 4-bit ripple-carry adder made of 1-bit full adders look like?

### A:

A horizontal chain of 4 full adders. Each takes a pair of bits plus the previous adder's carry-out as its carry-in, and emits a sum bit plus a carry-out that feeds the next adder.

![4-bit ripple-carry adder](/images/chips/ripple-carry-adder.png)

---

## Q: Walk through the calculation of the area taken up by an int8 × int8 multiply-accumulate. Relevant gate counts: full adder = 1.0, 2:1 mux = 0.3.

### A:

Consider the simpler 4×4 case: $1010 \cdot 1110 + z$ (with $z$ the accumulate).

This breaks down into

$$1 \cdot (1110 \ll 3) + 0 \cdot (1110 \ll 2) + 1 \cdot (1110 \ll 1) + 0 \cdot 1110 + z.$$

Each of those is in turn a mux:

$$(1\,?\,1110 \ll 3 : 0) + (0\,?\,1110 \ll 2 : 0) + (1\,?\,1110 \ll 1 : 0) + (0\,?\,1110 : 0) + z.$$

So you need as many adds and muxes as there are digits in the first number.

The width of both gates has to be twice the width of the biggest number, since an 8-bit × 8-bit product can be 16 bits wide.

$$(8 \cdot 0.3 \cdot 16) + (8 \cdot 1.0 \cdot 16) = 8 \cdot 1.3 \cdot 16 = 166.4.$$

---

## Q: Visualize how you can use a fused multiply-add to compute the dot product of two vectors.

### A:

For two length-$N$ vectors, run $N$ sequential FMAs: $\text{acc} \leftarrow a_i \cdot b_i + \text{acc}$ for $i = 0, \dots, N - 1$. The accumulator ends up holding $\sum_i a_i b_i$.

![Chained FMAs computing a dot product](/images/chips/fma-dot-product.png)

---

# Section: RTL to GDS, clock speed, memory
id: rtl-to-gds

## Q: Walk through the 5 steps of the RTL-to-GDS PD flow.

### A:

1. Logic synthesis: compile RTL → technology-independent graph of universal gates (NAND-ish).
2. Technology mapping: collapse the graph by pattern-matching the larger patterns of TSMC's standard cell library onto it ("regex for trees") → technology-dependent netlist.
3. Placement: embed cells in 2D minimizing wire length (spring / cost-function optimization).
4. Routing: connect placed cells with wires on stacked copper layers (Manhattan-only).
5. GDS-out: lower placement + routing to polygons (doping, etch, metal) → mask data for TSMC.

---

## Q: Why can two chips on the same TSMC node run at 4 GHz vs 5 GHz?

### A: Clock speed is set by the critical path — the longest delay between any two registers (wire plus logic cost). Two chips on the same node can have a different layout, affecting this quantity.

---

## Q: What is the tradeoff between registers and SRAM?

### A: SRAM is much smaller per bit but rigid (1R xor 1W per cycle); register files are bigger per bit but flexible (cheap to add ports, no minimum size).

---

## Q: Why can you only read OR write one column of an SRAM array per cycle?

### A:

Because of how it's implemented: an SRAM is a hand-designed macro with exactly one decoder + one set of bit lines wired into the grid.

![SRAM array layout: one decoder, shared word/bit lines](/images/chips/sram-array.png)
