---
title: Formally Verifying Peephole Optimisations In Lean
date: 2025-12-23
description: Introduction to formally specifying peephole optimisations (under LLVM/C style UB semantics) in Lean, and an introduction to my new project which verifies them.
tags:
  - Lean
  - Compiler
  - C
sources:
  - "[VOD] PEEP 2 - proof of addNsw_assoc (add nsw LLVM instruction)": https://www.youtube.com/watch?v=lY1GF-8sdsA&t=8367s
  - l-m.dev/stream (stream schedule): https://l-m.dev/stream/
  - l1mey112/peephole-formal: https://github.com/l1mey112/peephole-formal
  - google/souper: https://github.com/google/souper
---

> **TLDR: New project + development streams:** [l1mey112/peephole-formal](https://github.com/l1mey112/peephole-formal)

# Motivation

<!--

Back in the past, around 2024 I was working on my toy [FPLC](/cs/where-did-all-the-time-go/#highschool-years-streaming) when I came across the paper for the Sea of Nodes (SoN) compiler IR. There were three different kinds of IR models I experimented while working on that project:

1. **CFG + SSA (φ).** Basically how LLVM does it, control flow and data dependencies are stored in completely disjoint data structures and "phi" instructions are used to merge incoming values from other basic blocks.

2. **CFG + SSA (block params).** This is how Swift does it, and is much "purer". Instead of having φ an instruction, each basic block takes in "block parameters", making control flow merging explicit.

3. **Sea of Nodes.** Popular in Java compilers and JITs, new-ish. Control flow and data dependencies are treated the same way, most pure of them all.

-->

I started a new project back around September and have been working on it on during university, now that I'm on break, I've started streaming again and put this project into full motion.

<!-- But what is it? I've been working on toy compilers for a while, and I've taken an interest to niche areas of the field. Namely, E-graphs, Click's Sea of Nodes (SoN), and superoptimisers. Although these are interesting, they all TODO -->

Imagine you created your own compiler, new kind of IR, an optimiser, anything to do with rewrite rules. Let's say for moral reasons you choose to link none of LLVM's libraries (thanks for caring about your users!). Then, you've chosen to roll your own optimisations (which is really fun in itself).

Sans the big optimisations like global value numbering, loop optimisations, alias analysis, the foundation of them really is the peephole optimisations (ones that work locally and seek to canonicalise runs of instructions). This is where the money really is, so focusing on that there are a couple things:

1. ==(Universal)== Peephole optimisations are the most generalisable across optimisers, having said that, there is no universal database of rewrite rules. So, implementations needlessly replicate 10 different ways of representing the same simple rule, which might be `2 * x ~> x << 1` for example.

2. ==(Correctness)== These rules might not be correct, that is, might not agree on all inputs or introduce undefined behaviour. This issue is reduced greatly when SMT solvers come into play to prove these optimisations correct ([alive2](https://llvm.org/devmtg/2019-10/slides/Lopes-Regehr-Alive2.pdf) for LLVM). However, SMT solvers have soundness issues and can only prove for each integer bitwidth at a time, not for all possible bitwidths at once.

3. ==(Machine assisted)== There is no framework to analyse huge groups of rewrite rules, or to interoperate with superoptimisers (computer search) to find new ones. A question you might want to ask for SoN might be: "is this set of rewrite rules confluent?", that is, "can these rewrite rules guarantee a unique normal form after rewriting them all?". Similar questions involving superoptimisers might be: "is this the most optimal optimisation?" And oh, **training data**.

Part (1) and (3) is a pretty important one. I believe we're missing out on a huge amount of insight from not amassing all peephole rewrite rules in one place.

[Souper](https://github.com/google/souper) is an aforementioned superoptimiser for LLVM IR. Superoptimisers are basically a family of programs that take a piece of code, assembly, LLVM, whatever, and perform near brute force (some genetic, stochastic methods) to "guess" better programs. Since the guessing that superoptimisers do is an intractable problem, it's best to run them (offline) on some server to "farm" optimisations, instead of invoking them whenever you want to optimise a program (online).

Here is some [HN article](https://news.ycombinator.com/item?id=10463312) about Souper. I read this comment a couple years back and it's been a bit of a pipe dream for me to make this possible in one way or another:

[
![[Pasted image 20251222171959.png]]
](https://news.ycombinator.com/item?id=10463312)

(My first thought was) **WHY aren't we doing this??**

# This Project

:::::::::: {.centre-text}

[l1mey112/peephole-formal](https://github.com/l1mey112/peephole-formal) - [l-m.dev/stream/](https://l-m.dev/stream/) for implementation streams

::::::::::

Realisable goals (following the above three):

1. ==("Universal"-ish framework)== Create a framework for modeling a most general and interoperable IR for peephole optimisations, so LLVM integer instructions with C style undefined behaviour. No control flow besides `select`. **Stick to peepholes!**

2. ==(Correctness)== Lay the foundations for proving these optimisations correct in the Lean theorem prover. **This is trustless by design.** Combinations of automatic and manual proof, implement metaprogramming/tactics to make this easier.

3. ==(Machine assisted)== Lay groundwork for exporting, importing rewrite rules, and being interoperable with existing rewrite rule search (superoptimisers, etc). Also be accessible as a huge library for training data.

To go further (unrealisable given my current knowledge):

- Denotational semantics for (1), not just modeling the instructions in Lean. Then, I would be interested in writing a formally verified SoN optimiser using those rewrite rules.

- A formally verified SoN optimiser would require confluence to guarantee the Greatest Fixed Point (gfp). I barely understand what confluence is, hence I would need to learn rewriting theory and the proof techniques that come with that ==(Click, Combining analyses, combining optimizations)==.

# You Can Make Programs More Defined

To begin, we need to talk about what the C spec and by extension, what LLVM permits. Regardless of what you think about undefined behaviour (UB), it enables optimisations. "The looser you are, the more you can optimise" is a good rule of thumb. For example:

```c
bool cond(int x) {
	return x + 1 > x;
}
```

You would want to turn this into a `return true;`{.c}. However, what happens when we pass `cond(INT_MAX);` ? Obviously, this might not be true in all cases and the optimisation fails.

What does the C standard say? Signed overflow isn't defined behaviour, so as a compiler you have the liberty of defining this behaviour in this case.

---

Let's "prove" that `cond(x)` is always true for all `int x;`. Considering two cases, we have:

- **Case 1.** `x + 1` doesn't overflow. Hence, trivially `x + 1 > x`.

- **Case 2.** `x == INT_MAX` and `x + 1` overflows. Define `x + 1 > x` to be true.

So this is a valid optimisation!

# You Cannot Make Programs Less Defined

Consider the function:

```c
int assoc(int x, int y, int z) {
	return x + (y + z);
}
```

Can we rewrite this to `(x + y) + z` ? In general, **absolutely not**. The reason why is because reassociating the brackets can introduce undefined behaviour. Take this counterexample

```
INT_MAX + (1 + -1)   ~>   (INT_MAX + 1) - 1
                     ~>   <UB> - 1
                     ~>   <UB>
```

So, we've gone from an expression without UB and manipulated the brackets to induce UB. Now, the C standard is loose on what compilers are permitted to do when behaviour isn't defined. However, they **absolutely cannot introduce UB**.

# How Do We Model This?

In any definition of C/LLVM style integer semantics, you need to care a lot about what happens for undefined behaviour. As shown above, it is a violation of the spec to introduce undefined behaviour when there wasn't any initially. Similarly, if there is UB, you are allowed to **define** it.

Hence, a compiler would want to

1. Rewrite some expression to an exactly equivalent one.
2. Take advantage of UB to pick (define!) whatever value we want.

Following what LLVM does, we can define

```lean
/--
LLVM-style integers with poison value.
-/
inductive iN (bits : Nat) : Type where
  | bitvec : BitVec bits → iN bits
  | poison : iN bits

/--
`Rewrite x y` means the value `x` can be rewritten into the value `y`.
-/
inductive Rewrite {n} : iN n → iN n → Prop where
  /-- A value rewrites to itself. -/
  | refl (x : iN n) : Rewrite x x
  /-- Poison can be rewritten into any concrete value. -/
  | poison_forge (v : BitVec n) : Rewrite poison (bitvec v)

@[inherit_doc] infix:50 " ~> "  => Rewrite
```

You can think of the `iN` type being a generic tagged union/enum type/sumtype `iN<bits>` parameterised by a bitwidth. Each value can either be the production of UB, or an actual bitvector.

The `Rewrite` proposition is a bit similar, but it's not a type at all. You can think of it as "`Rewrite` holds if and only if you can provide a witness to either constructor".

We can deduce the following two theorems about undefined behaviour:

```lean
/-- Poison can be rewritten to anything. -/
theorem poison_rewrite {n} (x : iN n)
  : poison ~> x

/-- Values cannot be rewritten to poison. -/
theorem not_bitvec_poision_rewrite {n} (a : BitVec n)
  : ¬bitvec a ~> poison
```

Their interpretations are as follows:

1. **True.** `poison ~> x` by definition of rewrite (you can make a program more defined).
2. **False.** `bitvec a ~> poison` is always false by definition (you cannot make a program less defined).

This is what we wanted! But, how are the instructions/operations actually defined?

In LLVM (see the [LangRef](https://llvm.org/docs/LangRef.html#add-instruction) for the add instruction), we can use the `add nsw` instruction to represent the C signed overflow UB condition, as `nsw` stands for "no signed wrap". 

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```lean
def addNsw? {n} (a b : BitVec n) : iN n :=
  if BitVec.saddOverflow a b then
    poison
  else
    bitvec (a + b)

/-- pBind₂ returns poison if
	either x or y is poison.
	otherwise, calls addNsw? -/

def addNsw {n} (x y : iN n) : iN n
  := pBind₂ x y addNsw?

```
:::::
::::: {.flex-columns-1}
The semantics are:

1. If `x` or `y` are poison, return poison.
2. If `x + y` overflows, return poison.
3. Return `x + y`.

Custom notation is also a thing in Lean, so we can use

```lean
infixl:65 " +nsw " => iN.addNsw
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Side by side with a C and Lean function, they're pretty similar.

```lean
def add (x y : iN 32) := x +nsw y
```
:::::
::::: {.flex-columns-1}
```c
int add(int x, int y) {
	return x + y;
}
```
:::::
::::::::::

# What's Next?

Consider this theorem, what's wrong with it?

```lean
theorem addNsw_assoc {n} {x y z : iN n}
    : (x +nsw y) +nsw z = x +nsw (y +nsw z) := by

  sorry
```

Remember, it's unprovable. We found a counterexample above in [# You Cannot Make Programs Less Defined](#you-cannot-make-programs-less-defined) by picking values in a way such that the LHS overflows, but the RHS doesn't.

Adjusting the theorem, we have

```lean
theorem addNsw_assoc_same_sign {n} {x y z : iN n}
    (hxyz : x ∈ i[0,∞]  ∧ y ∈ i[0,∞]  ∧ z ∈ i[0,∞]   -- all positive, or
          ∨ x ∈ i[-∞,0] ∧ y ∈ i[-∞,0] ∧ z ∈ i[-∞,0]) -- all negative

    : (x +nsw y) +nsw z = x +nsw (y +nsw z) := by

  cases hxyz
  . /- positive case -/
    exact "https://www.youtube.com/watch?v=lY1GF-8sdsA&t=8367s"
  . sorry -- proved after the stream
```

> [theorems/ideal/addNsw_assoc.lean#L38](https://github.com/l1mey112/peephole-formal/blob/b8dd141e74384296afb365f6894620b9a8c07e2a/theorems/ideal/addNsw_assoc.lean#L38)

Now, this is provable! If you restrict the values to all having the same sign, the sums "overflow together" and moving the brackets around work just fine. This assumption/hypothesis makes it look more like the theorem

```lean
theorem addNuw_assoc {n} {x y z : iN n}
    : (x +nuw y) +nuw z = x +nuw (y +nuw z) := by

  sorry -- proved at home
```

as unsigned integers have no sign.

The stream where I prove the positive case is linked above, but it's also linked below. You want to skip to the part where I actually prove it (linked as a timestamp), as I spend an hour proving a stupid little lemma that is already proved in the standard library (silly me).

[
![[PEEP 2 - proof of addNsw_assoc (add nsw LLVM instruction) - 0-0-00.png]]
](https://www.youtube.com/watch?v=lY1GF-8sdsA&t=8367s)

> *[VOD] PEEP 2 - proof of addNsw_assoc (add nsw LLVM instruction)*

I have plans to take this further, and reach the end of those "realisable goals" in [# This Project](#this-project). I don't have much experience in Lean, but I've gotten this far and I'm willing to see the end of my pure maths and CS degree so I'm ought to get better at this program verification thing.

See you next time!
