---
slug: transistors
title: Transistors
kind: subject
blurb: Diodes, BJTs, MOSFETs, Dennard scaling, and why silicon won.
---

# Editing notes

- Source: self-investigation. No blog post yet.
- One card per `## Q:` / `### A:` pair. Card boundaries are `---`.

---

# Section: Diode and BJT mechanism
id: diode-bjt

## Q: What is a diode?

### A: A two-terminal semiconductor that allows current to flow one way but not the other.

---

## Q: Does a diode act as a conductor or insulator when conventional current flows from $\text{battery} \to \text{P} \to \text{N} \to \text{battery}$? Why?

### A:

Insulator.

Electrons saturate the holes in P, leaving no differential for the electrons in N to jump towards. Meanwhile, the extra electrons in N flow back to the battery.

---

## Q: Does a diode act as a conductor or insulator when conventional current flows from $\text{battery} \to \text{N} \to \text{P} \to \text{battery}$? Why?

### A:

Conductor.

Electrons saturate N, push into the depletion region, then jump across to the holes in P, which then return to the battery.

---

## Q: In a BJT transistor, if a small positive current is allowed to flow from base to emitter, what is allowed to happen?

### A:

A large positive current is allowed to flow from collector to emitter.

![BJT control flow](/images/transistors/bjt-current-flow.png)

*Image from Ben Eater's transistor video.*

---

## Q: If electrons are flowing from emitter to base (i.e. you turn the transistor on), why does that enable those electrons to now reach the collector?

### A:

You're allowing electrons from the emitter to get all the way up into the base, so close that they can jump across the depletion region between base and collector.

![NPN BJT electron flow: emitter → base → collector](/images/transistors/bjt-electron-flow.png)

*Image from Ben Eater's transistor video.*

---

# Section: MOSFET vs BJT
id: mosfet-vs-bjt

## Q: Sketch in your head what a MOSFET looks like.

### A:

Top to bottom: gate (metal) on top of an SiO₂ insulator, sitting on a P-type substrate. Two N-doped wells flank the gate on the left and right — the source and the drain. When the gate is positive, a channel of electrons forms in the substrate just under the insulator, connecting source to drain.

![NMOS cross-section](/images/transistors/mosfet-cross-section.png)

---

## Q: Why does a positive charge at the gate open up the channel underneath the insulator? (Consider an NMOS.)

### A: It pulls up the electrons in the P-type substrate, filling up the holes at the top — the channel.

---

## Q: Why is a MOSFET more power efficient than a bipolar junction transistor?

### A: In a MOSFET, the input is a voltage you set. In a BJT, it's a current you must keep feeding.

---

## Q: Conceptually, why doesn't it require a continuous current to keep the MOSFET channel between source and drain open?

### A: Thanks to the insulator between the gate and the channel, there's no power dissipated. The channel is powered just by voltage (basically potential energy).

---

## Q: What is the only time you have to pay an energy cost in a MOSFET?

### A: When you turn the transistor on or off (i.e. when the gate voltage changes).

---

## Q: In a MOSFET, you can think of the positive gate / SiO₂ insulator / negative channel triplet as what kind of component?

### A: A capacitor.

---

# Section: Dennard scaling
id: dennard-scaling

## Q: What is Dennard scaling?

### A: As transistors shrink, their power density stays constant, so total power usage stays in proportion with chip area.

---

## Q: How did MOSFETs enable Dennard scaling?

### A: If you shrink both the voltage and the oxide thickness, the transistor keeps working the same way.

---

# Section: Since 1947
id: since-1947

## Q: The original 1947 transistor was made of germanium, which also has 4 valence electrons like silicon. Why can't germanium be used to build MOSFETs?

### A: Its native oxide (GeO₂) is water-soluble and electrically defective. MOSFETs need a thin, stable, near-perfect insulator on the channel — only silicon grows one (SiO₂).

---

## Q: At a high level, what is the difference between planar, FinFET, and gate-all-around?

### A:

- Planar: gate sits flat atop the source-to-drain channel.
- FinFET: gate drapes the channel from three sides.
- Gate-all-around: gate fully wraps the channel from all sides.

---

## Q: MOSFET technology has progressed from planar (1965–2011) to FinFET (2011–2022) to gate-all-around (2022 onwards). Why?

### A: Better gate control means you can shrink the source-to-drain distance (the "gate length") without source/drain fields leaking current through.
