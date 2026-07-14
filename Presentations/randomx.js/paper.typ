#import "polylux/polylux.typ": *
#import "polylux/l-m.dev.typ": *

#set raw(tab-size: 4)
#show: metropolis-theme.with()
#set par(justify: true)

#let l-m-todo(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[TODO: ] #text(fill: l-m-meta-colour, body)]
#let l-m-tldr(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[tldr: ] #text(fill: l-m-meta-colour, body)]
#let span-sep(left, right) = box[#left #box(width: 1fr, repeat[#text(fill: l-m-meta-colour)[-]]) #right]

#show math.equation: set text(1.25em)

#let l-m-meta(body) = text(fill: l-m-meta-colour, body)
#let l-m-code(body) = text(fill: l-m-code-colour, body)

#let uncoverb(b, body) = uncover((beginning: b), body)

#let gc = block.with(width: 100%, height: 100%)
#let gh = block.with(width: 100%)

/*
  - Ctrl-K Ctrl-0 (folds all regions)
  - Ctrl-K Ctrl-j (unfolds all regions)
*/

/* math */

#let Ru = math.upright("R")
#let RD = $upright(bold("RD"))$
#let RU = $upright(bold("RU"))$
#let RN = $upright(bold("RN"))$
#let RZ = $upright(bold("RZ"))$
#let ulp = $"ulp"$
#let fma = $"fma"$
#import "@preview/plotst:0.2.0": *

#let generate_grouped_data(list_of_series, group_width_ratio: 0.75) = {
  let num_series = list_of_series.len()
  let bar_width = group_width_ratio / num_series
  let first_bar_offset = -group_width_ratio / 2 + bar_width / 2
  
  let combined_data = ()
  
  for (series_idx, series_data) in list_of_series.enumerate() {
    for (group_idx, value) in series_data.enumerate() {
      let x_pos = 1 + group_idx + first_bar_offset + series_idx * bar_width
      combined_data.push((value, x_pos))
    }
  }
  return combined_data
}

#let cpu_labels = (
  "", "i7-6600U", "i5-7500T", "i7-9750H", "i5-10400F",
  "i9-14900HX", "i5-12400F", "i7-8565U", "i5-8265U"
)

// --- Additive (FADD) Data ---
#let fadd_hard_gflops = (13.45, 19.44, 18.60, 21.19, 50.55, 28.29, 14.33, 19.21)
#let fadd_semi_gflops = (6.82, 9.33, 10.15, 11.67, 31.66, 18.48, 7.57, 8.37)
#let fadd_soft_gflops = (0.94, 1.10, 1.39, 1.38, 1.60, 1.46, 1.24, 1.13)

// --- Multiplicative (FMUL) Data ---
#let fmul_hard_gflops = (8.28, 19.44, 20.48, 22.23, 57.97, 28.36, 13.80, 19.39)
#let fmul_semi_fma_gflops = (7.24, 9.57, 10.84, 12.01, 32.06, 18.54, 7.73, 8.96)
#let fmul_semi_gflops = (1.96, 4.03, 4.81, 5.10, 10.21, 8.17, 4.30, 4.24)
#let fmul_soft_gflops = (2.79, 3.45, 4.09, 4.40, 8.68, 6.54, 3.07, 3.35)

#title-slide({
  l-m-title("Zero to RandomX.js:")
  linebreak()
  l-m-title("Bringing Webmining Back From The Grave")
  l-m-hr()
  set text(size: 0.8em)
  text(fill: l-m-meta-colour, "Thursday, November 6th | K15 Old main G32 | 2 PM - 4 PM")
})

#slide(title: "About me")[
  #grid(columns: (10fr, 6fr), gutter: 2em, gc[
    - Liam, l-m, github.com/l1mey112 (GH)
    - #underline[https://l-m.dev/], l-m at l-m.dev

    #linebreak()
    - #strike[Highschool student] University Student
    - Adv Mathematics/Computer Science \@ #text(fill: rgb("#ff6a48"))[UNSW]

    #l-m-hr()

    - Compilers, *Systems Programming*, WebAssembly, Linux
    #uncoverb(2)[
      #list[#l-m-meta[(new!)] Interactive Theorem Proving w/ #text(fill: rgb("#386ee0"))[Lean]]
    ]
  ], gc[
    #image("image-7.png")
  ])
]

#slide(title: "This Talk?")[
	#l-m-todo[(1.RX) Introduce RandomX.]

	#l-m-todo[(2.JS) Introduce RandomX.js]

	#l-m-todo[(3.FP) Cover the semifloat impl. in RandomX.js]
]

#new-section-slide[(1.RX) RandomX]

/*
- (1) An application specific integratic circuit. Incredibly expensive, incredibly
      specialised pieces of kit, which are designed to do one thing and do it as
      fast as possible on hardware.

      You want to get rid of ASICs as much as possible, as they enable centralisation
      of hashrate, which is basically power here, in the few who can afford them.

      They're responsible for many 51% attacks on Bitcoin for example.

      Once ASICs get on your network, it's over for miners using commodity hardware
      like CPUs and GPUs. Instantly, it only becomes competitive to mine with ASICs.

      Monero makes it their mission to only allow CPUs to mine efficiently on the
      network. A CPU is a ciruit, but an ASIC is also a another circuit.
      Historically, this has been very hard.
*/
#slide(title: [(1.RX) ASICs])[
  #gh[
    #set align(center)
    #image("image-9.png")
  ]
]

/*
- (1) ...
- (2) ...
- (3) ...
      By then, ASICs for cryptonight have already been created, so the switch was
      needed.

- (4) ... Right? You want the majority to get a fair shot, and in Monero's case,
      they chose to stick with CPU miners.
*/
#slide(title: [(1.RX) RandomX])[

  RandomX is a proof-of-work algorithm that is optimized for general-purpose CPUs. It has stood the test of time as an *ASIC resistant* hash function.

  #uncoverb(2)[
    On November 30th, 2019, Monero switched from its old POW algorithm, _cryptonight_, to RandomX. #uncoverb(3)[
      #text(fill: rgb("#f26822"))[Which had already been broken.]
    ]
  ]

  #uncoverb(3)[
    #l-m-hr()
    #quote(attribution: [tevador/RandomX], block: true)[
      RandomX uses random code execution (hence the name) together with several memory-hard techniques to minimize the efficiency advantage of specialized hardware.
    ]

    #uncoverb(4)[
      #l-m-meta[(Goal: Promote egalitarian mining!)]
    ]
      
    #v(1em)

    https://github.com/tevador/RandomX
  ]

  #l-m-hr()

  *Defn.*  #strong()[_A_]pplication-#strong()[_S_]pecific-#strong()[_I_]ntegrated-#strong()[_C_]iruit --- ASIC are specialised circuits.
]

/*
- (1) This is RandomX on a high level. This is supposed to resemble a CPU and this
      is supposed to be 2 GiB of fixed read only memory for it to sample from.

      The hash function accepts two input values:

      - String K with a size of 0-60 bytes (key)
      - String H of arbitrary length (the value to be hashed)

      and outputs a 256-bit result R.

      Intended use states that you fix the key, and you build the dataset from that
      which can take multiple seconds. Once the key is fixed you can use it like a
      regular hash function.

      The only thing the
      VM will ask the dataset is to read its items, which are 64 bytes in length
      each.

      As you can see in the corner there, the VM has a 2 KiB scratchpad which is
      basically its working memory. The point of the VM is to blast the scratchpad
      with entropy and then hash it along with its registers. That's the final result.
*/
#slide(
  background: image("randomx architecture simplified.png", fit: "cover", width: 120%, height: 120%),
)[]

/*
- (1) RandomX opts to solve the ASIC problem with defense in depth.

      You can't ban ASICs, they're just circuits, a CPU is a circuit.
      
      The only difference to CPUs, ASICs are just incredibly specialised with
      their circuits frozen to do a specific task.

- (2) Our only weapon really, is money. The remember the goal is to use so many
      features from CPUs that when it comes down to it, your ASIC will look exactly
      like a CPU, then you go down to a store and buy an actual one.

      What we want is economic infeasability, where the actual custom design and
      fabrication exceeds the cost of just buying commodity CPUs, where you would
      lose out to economies of scale, with the huge risk of Monero just
      hard forking and changing their algorithm, turning your ASIC into a brick.

      So, RandomX will tack on feature after feature to grow the cost of a custom
      ASIC. First,

- (3) ... these are the two obvious ones, the goal is to force ASICs to include
      memory external to the chip, and to make the actual hash computation a random
      program, not fixed code.

- (4) ... So CPUs are good at maximising ILP, instruction level parallelism. In the
      name, they can execute multiple instructions at once, they can reorder them,
      they can predict branches, optimistically guess the result of some code.
      All modern CPUs do this, and its a huge advantage
      made up for how complex it is on-chip.

      So, if an ASIC wants to be competitive here, they need to factor in the cost
      of stealing trade secrets from AMD and Intel to their bottom line. There's no
      getting around this. This level of complexity, needs to be included on the
      chip somehow.

- (5) ...
      
      So we have memory external to the chip with the Dataset, but CPUs have fast
      on chip caches for frequently acccessed memory as L1, L2, L3.
      So RandomX does use this, and it's where the VM sends all its entropy.

- (6) There are also some things which are givens when you want to do useful work
      on CPUs, so full compliant floating point, hardware SIMD, integer dividers,
      and hardware AES instructions.

- (7) The sum of all of these equates to a monumental amount of complexity and R&D
      time for a would be ASIC.
      Creating one that does all these would be prohibitively expensive.

      The goal is to accomplish these!
*/
#slide(title: [(1.RX) Defense in depth (of the ASIC)])[
  #uncoverb(2)[
    *Goal.* Economic infeasability of ASICs.
  ]

  #uncoverb(3)[
    #l-m-hr()

    - 2 GiBs of #l-m-meta[(external)] DRAM + prefetch - *Memory-Hardness*.

    #list[*Random* code e#strong[X]ecution.]
  ]
  
  #uncoverb(4)[
    #list[*Superscalar design*, Speculative execution, branch prediction.]
  ]

  #uncoverb(5)[
    - 2 MiBs of scratchpad (L1 $subset.eq$ L2 $subset.eq$ L3).
  ]

  #uncoverb(6)[

    #list[Full compliant IEEE754. #l-m-meta[(floating point)]]

    - Hardware SIMD, integer dividers, AES instructions.
  ]

  #uncoverb(7)[
    #l-m-hr()

    *Each increases die area for an ASIC!*
  ]
]

/*
- (1) So I'll explain the dataset first, one of two black boxes. The input data H
      isn't considered here, the only input to the dataset is the key K.

- (2) ...

      The word superscalar is key here, so what RandomX does to generate these
      hash functions is that it simulates a modern superscalar CPU, to decide what
      instructions to emit to artificially saturate the host CPU.
      The simulator takes in entropy and spits out instructions.

- (3) ...

      If you want to mine fast, you generate the entire 2 GiBs up front, but, if you
      just want to mine on a memory budget or verify someones hash, you only need
      the 256 MiB "cache" as you can run the 8 hash functions on demand. This is
      called light-verification, or light-mode, which is really the takeaway of this
      slide.

      A would-be ASIC is forced to use external slow DRAM, as on-chip memory
      for storing the 2 GiB dataset is expensive, and calculating the items
      on demand is extremely inefficient for even CPUs if you want to go fast.
*/
#slide(
  background: image("randomx architecture dataset.png", fit: "cover", width: 110%, height: 110%),
  inset: 1.2em
)[
  #set align(top)
  #set text(size: 0.8em)

  #grid(columns: (10fr, 9fr), gutter: 0em, gc[], gc[
    #uncover((2, 3))[
      Pre-initialisation.

      - The key $K$ is passed to the SSH generator, which generates 8 "superscalar" hash functions.
      - $K$ is also used to fill 256 MiBs of static memory.
    ]

    #uncover(3)[
      #l-m-hr()
      Dataset-initialisation.

      - Each 64-byte Dataset item is generated by executing each of those 8 functions, and XORing data from the cache.
      - Cache $==>$ Dataset.
    ]
  ])
]

/*
- (1) We have that there RandomX virtual machine is only concerned with the
      input hash bytes, not so much the key.

      On a high level there are four main sections of the VM, which are the
      scratchpad (which is the working memory of this imaginary CPU), the
      program buffer (which just holds the instructions), the register file,
      and the abstract virtual machine.

- (2) I will go through the general algorithm.

- (3) An initial seed is calculated by hashing the input, then
      the scratchpad is entirely filled from random bytes using rounds from AES.

- (4) The program buffer is filled, which is basically all the state needed
      to program an instance of the VM. 128 bytes are
      set aside to be loaded into the register file, and 2048 bytes is the
      actual program.

      So (4) the VM is executed along with all the instructions, filling up the
      scratchpad and register files with entropy, and reading from the
      dataset.

      Every instruction that can read or write will do so respecting the
      hierarchy of the scratchpad, so accesses to L1 are done 3 times as much as 
      accesses to L2, and accesses to L3 are done sparingly and at certain
      stages to avoid stalls.

      After that, the register file is hashed and copied as state to generate
      an entirely new program, going around steps 3-5 again, where the
      entropy of one program is used to generate the next, and so on.

- (5) So after we executed the 8 programs, we have a scratchpad which
      is just filled with entropy, so we hash it using rounds from AES,
      and the final result is the hash of the scratchpad with the register file.

      The reason we execute 8 chained programs is to avoid miners rerolling
      for easy ones, aborting halfway through will make you throw away all
      of your previous work. That's why we chain them.
*/
#slide(
  background: move(dy: 8pt, image("randomx architecture vm.png", fit: "cover", width: 100%, height: 100%)),
  inset: 1.2em
)[
  #set align(top)
  #set text(size: 0.8em)

  #grid(columns: (17fr, 24fr), gutter: 0em, gc[
    #uncoverb(2)[
      *Algorithm.*
    ]

    #uncoverb(3)[
      1. Initial seed S is calculated. #l-m-meta[(Blake2b)]
      2. Scratchpad is filled. #l-m-meta[(AesGenerator1R=S)]
    ]

    #uncoverb(4)[
      #l-m-hr()

      3. Program Buffer filled. #l-m-meta[(AesGenerator4R\*)]

        #l-m-meta[(VM is programmed from contents)]
      
      4. *The VM is executed.*
      5. Register file is hashed and copied to AesGenerator4R\* state.
      6. Steps 3-5 are performed *8* times.

        #l-m-meta[(chained VM execution)]
    ]

    #uncoverb(5)[
      #l-m-hr()

      7. Scratchpad fingerprint is calculated. #l-m-meta[(AesHash1R)]
      
      8. Final result R is the hash of scratchpad fingerprint + register file. #l-m-meta[(Blake2b)]
    ]
  ], gc[])
]

/*
- (1) The virtual machine has 8 integer registers r0-r7 and a total of 12
      floating point registers split into 3 groups.

      The integer registers are 64 bits wide, and each floating point register
      is 128 bit SIMD registers, so pairs of doubles.
      FP registers a0-a3 are fixed after programming.

      There are also 3 internal registers, ma, mx, and fprc. You might have
      already seen ma and mx, they're the registers that store an index
      into the dataset item to access.

- (2) The integer instructions are pretty standard...

      Note that most of these instructions have _R and _M variants, which
      read and write registers, or read and write to the scratchpad.

- (3) The only floating point operations that are included are the
      base deterministic IEEE754 instructions, swapping the pair within
      an FP register, and FSCAL which is equivalent to a XOR on the binary 
      representation.

- (4) Stores into the scratchpad are done with ISTORE and loops are implemented
      using CBRANCH.

      The CFROUND instruction adjusts the value of fprc, which is the
      rounding mode of the 5 core IEEE instructions.
*/
#slide(title: [(1.RX) Instructions + Registers], inset: 1.2em)[
  #let gb = gc.with(height: 60%)

  #set align(top)
  
  #grid(columns: (10fr, 10fr), gutter: 1em, gb[
    #uncoverb(2)[
      *Instructions (integer).*

      - IADD, ISUB, IMUL, IMULH, ISMULH, INEG
      - IXOR, IROL, ISWAP_R
      - IMUL_RCP #l-m-code[(division by imm32)]
    ]

    #uncoverb(3)[
      #l-m-hr()
      
      *Instructions (FP).*

      #l-m-meta[(IEEE754)] FADD, FSUB, FMUL, FDIV, FSQRT

      - FSWAP_R: #l-m-code[(dst0, dst1) = (dst1, dst0)]
      - FSCAL_R: #l-m-code[(XOR by 0x80F0000000000000)]
    ]
  ], gb[
    #uncoverb(4)[
      *Instructions (misc).*
      - ISTORE: _arbitrary_ scratchpad addr.

      - CBRANCH: backwards branch, flat loops
      - CFROUND: change FP rounding #l-m-meta[(IEEE754)]

        (adjusts *fprc* = 0, 1, 2, 3)

      #[
        #set text(size: 0.8em)
        #set align(center)

        #table(
          columns: (auto, auto),
          stroke: luma(70),

          [0], [roundTiesToEven],
          [1], [roundTowardNegative],
          [2], [roundTowardPositive],
          [3], [roundTowardZero],
        )
      ]
    ]
  ])

  #[
    #set align(right)
    #uncoverb(2)[
      #l-m-meta[(most instructions have \*\_R, \*\_M variants)]
    ]
    #linebreak()
  ]
  
  #block[
    #set align(left)
    #let sz(d) = (auto,) * d
    #set par(spacing: 0pt)
    #let except(d, i) = (x, _) => if x == i {} else {d}
    #let initsp = 12em

    #table(
      columns: (initsp,) + sz(8),
      stroke: except(l-m-meta-colour, 0),
      fill: except(rgb("#ff000075"), 0),
    )[#l-m-meta[(64-bit integers)]][r0][r1][r2][r3][r4][r5][r6][r7]

    #table(
      columns: (initsp,) + sz(12),
      stroke: except(l-m-meta-colour, 0),
      fill: (x, _) => {
        if x == 0 {}
        else if x <= 4 { rgb("#016fff56") }
        else if x <= 8 { rgb("#01ff7356") }
        else { rgb("#ff01ff56") }
      }
    )[#l-m-meta[(pairs of doubles)]][f0][f1][f2][f3][e0][e1][e2][e3][a0][a1][a2][a3]

    #table(
      columns: (initsp,) + sz(3),
      stroke: except(l-m-meta-colour, 0),
    )[#l-m-meta[(misc)]][ma][mx][fprc]
  ]
]

/*
- (1) Before I conclude this section, I want to go over floating point numbers
      and give am
      explaination of why RandomX would even want to use these, given that
      they have a track record of feeling "nondeterministic" or "random".

- (2) The most common example is 0.1 + 0.2 != 0.3. This sets a lot of people
      off because this is just not what you should be expecting at all.

- (3) Floating point numbers
      make a tradeoff between performance and ease of use, over actually
      representing the numbers they represent.

- (4) For IEEE754 doubles, you get 2^64 possible numbers compared to the infinite 
      amount of real numbers.

- (5) Because we lose out on the ability to represent an infinite amount
      of numbers, we don't have for example associativity, so the code on the left
      almost always returns false. The function is doing rounding at
      different stages. If you look on the right, take that little circle
      function there to be rounding your numbers, then the difference is pretty
      pronounced.

- (6) But, I haven't actually addressed the elephant in the room, which is that
      programmers working with floating point numbers find it frustrating,
      inaccurate, and basically a random black box.

      If floating point feels inconsistent and like magic at times, why should
      RandomX rely on it to give consistent results?
*/
#slide(title: [(1.RX) IEEE754])[
  #uncoverb(2)[
    #list[0.1 + 0.2 = 0.30000000000000004 != 0.3 #l-m-meta[(?? wtf)]]
  ]

  #uncoverb(3)[
    - *IEEE754* makes a _tradeoff_. #uncoverb(4)[Define $Ru$ as set of _doubles_ without NaN. Then $|Ru| < 2^64$.]
  ]

  #uncoverb(4)[
    #l-m-hr()

    *Result.* $Ru$ is a finite amount of *useful* numbers, with $plus.minus infinity$. #l-m-meta[(IEEE754)]
  ]

  #linebreak()

  #uncoverb(5)[
    #grid(columns: (10fr, 10fr), gutter: 1em, gh[
      ```c
      bool chk(double x, double y, double z) {
          // 99% this is false
          return (x + y) + z == x + (y + z);
      }
      ```
    ], gh[
      $
        circle.small(circle.small(x + y) + z) != circle.small(x + circle.small(y + z))
      $
    ])
  ]
  #linebreak()

  #uncoverb(6)[
    #figure[
      FP _feels random_, is portable/well defined?
    ]
  ]
]

/*
- (1) ...
- (2) What does correctly rounded mean? It basically is, take two numbers,
      do an operation with infinite precision, like mathematical addition, 
      then round it down back into a floating point number.

      The 5 core operations of IEEE754 are defined this way. Anything else, any
      compound operations, you can't expect them to be portable, bring your own
      implementations, or get lucky.

- (3) There are actually 4 different ways to round a number so that it goes back
      into being a double, which are
      - round to nearest,
      - round towards negative infinity,
      - round towards positive infnity,
      - round towards zero.
      
- (4) If you do any of these 5 core operations on floats, you can expect the
      CPU to round your numbers according to these 4 different rounding modes,
      which there is usually an inbuilt register inside your CPU to select a
      rounding mode globally, not per instruction.

      In RandomX, "fprc" is this register.

- (5) So what you need to take away from this slide, is that floating point
      numbers are perfectly defined and portable, they just
      have a decent amount of internal machinery to do with rounding, a lot
      of footguns.

      There is a bit of a caveat though, you only ever get access to RN.
*/
#slide(title: [(1.RX) IEEE754], inset: 1.2em)[
  #gh(height: 60%)[
    FP is perfectly specified, with $+$, $-$, $times$, $div$, $sqrt(x)$ *correctly rounded*. #l-m-meta[(IEEE754)]

    #uncoverb(2)[
      - P/L defn. as $mono("x + y") := RN(mono(x) + mono(y))$, $mono("sqrt(x)") := RN(sqrt(mono(x)))$, etc.

      - Anything else? Sorry. $sin(x)$, $exp(x)$ behave differently on other platforms.
    ]

    #uncoverb(4)[
      #l-m-hr()

      Define $circle.small : RR^infinity -> Ru$ to be a function that rounds according to a #l-m-meta[(global)] fprc.

      - $"fadd"(x, y) = circle.small(x + y)$, $"fsqrt"(x) = circle.small(sqrt(x))$, etc.
    ]

    #v(1em)

    #uncover(5)[
      #figure[
        *Caveat.* All P/L give you $RN$ only. \
        #l-m-meta[(foreshadowing)]
      ]
    ]
  ]

  #grid(columns: (10fr, 10fr), gutter: 1em, gh[
    #uncoverb(4)[
      ```
      ○(x) {
        case fprc = 0: RN(x)
        case fprc = 1: RD(x)
        case fprc = 2: RU(x)
        case fprc = 3: RZ(x)
      }
      ```
    ]
  ], gh[
    #set text(size: 0.8em)
    #set align(right)
    
    #uncoverb(2)[
      #table(
        columns: (auto, auto, auto),
        stroke: luma(70),
        align: left,

        table.header(
          [*fprc*]
        ),
        [0], [roundTiesToEven], [$RN : RR^infinity  -> Ru$],
        [1], [roundTowardNegative], [$RD : RR^infinity -> Ru$],
        [2], [roundTowardPositive], [$RU : RR^infinity -> Ru$],
        [3], [roundTowardZero], [$RZ : RR^infinity -> Ru$],
      )
    ]
  ])
]

/*
- (1) To expand on this, these are code snippets in C, JavaScript and Rust
      In those languages, it is always
      assumed or forced, to use RN behaviour. This is generally what you want for
      anything other than scientific libraries, so 99% of code out there.

      RN has a lot of nice properties over directed rounding.
      It accumulates less error and has less bias.

- (2) If you actually want to use them, for example in C without invoking UB, you
      need to let the compiler know not to optimise with the
      assumption that the global rounding mode is RN.

      So for the add function on the right, it has the semantics of using the actual
      dynamic rounding function which is decided by the CPU or whatever
      implementation of FP is in there.
*/
#slide(title: [(1.RX) IEEE754 in P/L])[
  #set align(top)

  #grid(columns: (13fr, 9fr), gutter: 1em, gc[
    Assumed $"add"(x, y) = RN(x + y)$ in all P/L.
    
    ```c

    // in C
    double add(double x, double y) {
        return x + y                      // RN(x + y)
    }
    ```

    ```js
    
    // in JavaScript
    function add(x, y) {
        return x + y                      // RN(x + y)
    }
    ```

    ```rs

    // in Rust
    pub fn add(x: f64, y: f64) -> f64 {
        x + y                             // RN(x + y)
    }
    ```
  ], gc[
    #uncoverb(2)[
      Opt-in to avoid UB.

      #linebreak()

      ```c
      #include <fenv.h>

      double add(double x, double y) {
          #pragma STDC FENV_ACCESS ON
        
          return x + y; // ○(x + y)
      }

      ```

      #l-m-hr()

      ```yasm
      add(double, double):
          ; xmm0 = ○(xmm0 + xmm1)
          addsd   xmm0, xmm1
          ret
      ```
    ]
  ])
]

/*
- (1) Calling back to the first slide in this part...

      (Don't read the quote)
*/
#slide(title: [(1.RX) Conclusion])[
  #quote(attribution: [tevador/RandomX], block: true)[
    RandomX uses random code execution (hence the name) together with several memory-hard techniques to minimize the efficiency advantage of specialized hardware.
  ]

  #l-m-meta[(Reminder: the goal is to make ASICs resemble CPUs.)]

  #l-m-hr()

  #grid(columns: (13fr, 9fr), gutter: 1em, gh[
    #uncoverb(2)[
      An ASIC for RandomX needs:

      - 2 GiBs of #l-m-meta[(external)] DRAM - *Memory-hard*
      - *Random* code e#strong[X]ecution.
      - Superscalar design, instruction/μop cache.
      - Speculative execution, branches.
      - Full compliant IEEE754.
      - Hardware AES, dividers, SIMD floating point.
      - 2 MiBs of scratchpad (L1, L2, L3).
    ]
  ], gh[
    #uncoverb(3)[
      *Verdict.* No advantage over CPU.

      #l-m-meta[(economically infeasible)]
    ]

    #linebreak()

    #uncoverb(4)[
      *Success!*
    ]
  ])
]

#new-section-slide[(2.JS) RandomX.js]

/*
- (1) ..., which is just executing a script in the browser to mine coins.

- (2) ... stealing CPU time from users in hacked
      websites by installing a script without them knowing.

      For example, the pirate bay, to gain some extra revenue, used a service called
      coinhive, where they just put a <script> tag inside their website, which mined
      monero. coinhive as a company basically disappeared into thin air around the
      same time RandomX came to be.

- (3)
- (4) So, the question really is, why?
*/
#slide(title: [(2.JS) RandomX.js?])[
  Monero has a certain relationship with Web Mining.

  #uncoverb(2)[
    - _Could_ replace ads, just used for cryptojacking websites.
      
      _The Pirate Bay_ used *Coinhive*. CH discontinued in 2019.
  ]

  
  #uncoverb(3)[
    #l-m-hr()
    No *serious/working* implementations of RandomX since its introduction.

    #l-m-meta[(suggesting that one could be implemented was laughable)]
  ]


  #linebreak()

  #uncoverb(4)[
    #figure[
      *Why?*
    ]
  ]
]

/*
- (1) ...
      It isn't really a matter of "can this be implemented", it's more of a,
      "can this be implemented and not be terribly slow".

- (2) Tevador, the creator thinks that it can be done, just really slowly.
      Which he estimates 30 hashes a minute, which is less than 1 H/s.

      That's just, really really low. Like come on!

      I wanted to try beat that.
*/
#slide(title: [(2.JS) RandomX.js?])[
  #quote(block: true, attribution: [tevador/RandomX README.md])[
    *Does RandomX facilitate botnets/malware mining or web mining?*

    [...]

    Web mining is infeasible due to the large memory requirement and the lack of directed rounding support for floating point operations in both Javascript and WebAssembly.
  ]

  #set align(right)

  #l-m-meta[(Stuck with $RN$ !!)]

  #uncoverb(2)[
    #figure(image("image.png", width: 55%))
  ]
]

/*
- (1) ...

- (2) Why would I do this? I really don't care about web mining, I just think it's an
      interesting problem.

      First right, what code would I actually generate?
      Instead of generating JavaScript code, you can do something
      much closer to the JITs in RandomX. You can generate WebAssembly.

- (3) ...

      The point of WebAssembly is to be a compilation target for performance
      sensitive code, it's basically assembly for the web, where you work with raw
      memory, unboxed integers, and so on.

      So, JavaScript can execute arbitrary code pretty fast at runtime, you just
      generate WebAssembly, and get JavaScript to load and execute it
      for you!

- (4) There are some downsides, no AES instruction, and you're limited to a fixed
      rounding mode which is the same as JavaScript.

      For AES, you can just reimplement it too, so it's not a big deal either.
      We also can't allocate 2 GiBs, so we're stuck to light mining.
*/
#slide(title: [(2.JS) RandomX.js])[
  #quote(block: true, attribution: [l1mey112/randomx.js])[
    RandomX.js is an implementation of the ubiquitous Monero POW algorithm RandomX in JavaScript. 
  ]

  #uncoverb(2)[
    *Why? It's a fun engineering problem!*
  ]

  #linebreak()

  #grid(columns: (45fr, 9fr), gutter: 1em, gh[
    #uncoverb(3)[
      *\~5 years later (2024):*

      - JavaScript has WebAssembly now, with SIMD and shared memory.
      - JavaScript has threads (web workers).
      - WASM is pretty expressive, with branch tables, memcpy(), etc.
    ]


    #uncoverb(4)[
      No native AES instruction, no $RD$, $RU$, $RZ$, and

      - *shouldn't* have 2 GiB dataset, so only light mining.

          #l-m-meta[(compute dataset items on fly, expensive...)]
    ]
  ], gh[
    #uncoverb(3)[
      #image("image-1.png")
    ]
  ])


  #l-m-hr()
  
  https://github.com/l1mey112/randomx.js
]

/*
- (1) ...
- (2) ...
*/
#slide(title: [(2.JS) Overview])[
  #let C = rgb("#5c6bc0")
  #let Cpp = rgb("#669ad3")
  #let TypeScript = rgb("#3077c5")
  #let linesof(x) = 100% * (x / 4500)
  #let except(d, i) = (_, y) => if y == i {} else {d}
  #let ll(body) = [#set text(fill: C); #set align(right); #body]

  #let gb = gc.with(height: 65%)

  #grid(columns: (45fr, 10fr), gutter: 1em, gb[
    #uncoverb(2)[
      - Complete rewrite of core RandomX (#text(fill: Cpp)[C++]) in #text(fill: C)[C], 5000 lines.
      - 500 lines of host _glue_ #text(fill: TypeScript)[TypeScript]. #l-m-meta[(to execute JIT VM)]
      - Same tests as RX, and 200k LOC test suite for FP impl.

        #l-m-meta[(Most readable RandomX impl. in existence)]
    ]

    #uncoverb(3)[
      #l-m-hr()

      - No interpreter, RX code generated in WASM and executed by JS.
      - Rewritten cryptography to use WASM SIMD.
      - Performant directed rounding, *semifloat*. #l-m-meta[(!!)]
      - Support for shared memory/threads.
      
        #l-m-meta[(i.e. share the 256 MiB cache)]
    ]
  ], gb[
    #uncoverb(2)[
      #image("image-3.png")

      #image("image-5.png")
    ]
  ])

  #linebreak()
  #linebreak()

  #uncoverb(2)[
    #table(
      columns: (linesof(2600), linesof(700 + 500), linesof(400), linesof(300)),
      stroke: except(l-m-meta-colour, 1),
      [RandomX WASM *JIT* - VM implementation], [Dataset/Crypto], [FP+mul], [VM],
      ll[2600 lines], ll[1200 lines], ll[400], ll[300],
    )
  ]
]

/*
- (2)
- (3) ..., which is certainly a much better figure than the 1 H/s speculated by
      tevador. So I'd call this a win.
*/
#slide(title: [(2.JS) Performance?])[
  ```sh
  node examples/randomx.js
  # machine id: AMD Ryzen 7 3800X 8-Core Processor [rx/0+relaxed-simd+!fma] Node.js/v22.9.0 (linux x64)
  # cache construction time 535.8 ms
  # average hashrate: 22.0 H/s

  node examples/randomx_threaded.js
  # machine id: AMD Ryzen 7 3800X 8-Core Processor [rx/0+relaxed-simd+!fma] Node.js/v22.9.0 (linux x64)
  # initialising thread 0..15
  # average hashrate: 208.0 H/s
  ```

  #linebreak()

  #uncoverb(2)[
    On the same machine #l-m-meta[(with light mining)], I got 100 H/s per thread.
  ]

  #linebreak()

  #uncoverb(3)[
    #figure[
      *5x slower is pretty good!*
    ]
  ]
]

/*
- (1) ...
- (2) But, we're stuck to only one rounding mode RN, how do I actually implement
      fadd_1, 2, 3 with only RN? We don't really have a solution, we're stuck.

      For example, on the left, there is the fadd_0 implementation, you just add
      them.

      To answer that question, and to actually go over how it's implemented in
      RandomX.js, we're going to go on a deep dive.
*/
#slide(title: [(2.JS) Motivation])[
  #show raw: set text(size: 0.75em)

  - During VM, a branch table #l-m-meta[(call_indirect)] selects correct FP  op w/ rounding, so

    FADD_R has _fadd_0_ $RN$, _fadd_1_ $RD$, _fadd_2_ $RU$, _fadd_3_ $RZ$.

  #linebreak()

  #grid(columns: (auto, auto), gutter: 1em, gh[
    ```c
    case FADD_R:
        // dst = dst + src
        WASM_U8_THUNK({
            0x20, F(inst->dst), // local.get $dest
            0x20, A(inst->src), // local.get $src
            0x23, $fprc,        // global.get $fprc
            0x11, 3, 0,         // call_indirect table 0
            0x21, F(inst->dst), // local.set $dest
        });
        break;


    ```

    
    #show raw: set text(size: 1.2em)

    #uncoverb(2)[
      ```c
      v128_t fadd_0(v128_t a, v128_t b) {
          return wasm_f64x2_add(a, b); // RN(a + b)
      }
      ```
    ]
  ], gh[
    ```c
    WASM_SECTION(WASM_SECTION_ELEMENT, {
        WASM_U8_THUNK({
            5, // elems = vec(5)

            // elem 0: fadd
            0x02,
            0,                                  // table index = 0
            0x41, 0, 0x0b,                      // offset = i32.const 0
            0x00,                               // funcref
            4,                                  // elements = vec(4)
            FIDX(3), FIDX(4), FIDX(5), FIDX(6), // fprc_0..fprc_3
            // fadd_0,  fadd_1,  fadd_2,  fadd_3
            //
            // setup fsub_0-3, fmul_0-3, fdiv_0-3, fsqrt_0-3, ...
    ```
  ])

  #linebreak()

  #uncoverb(2)[
    *Goal.* How do we actually implement fadd_1, fadd_2, etc?
  ]
]

#new-section-slide[(3.FP) Semifloat]

/*
- (1) The easiest way to show this is with a picture. We have a number line here.
      On that number line these little ticks are our actual tangible floating point 
      numbers.

- (2) - RD is trying to pull the number towards negative infinity, RU is pulling
        the number towards positive infinity (that way ->).
      - RZ is pulling the number towards zero, and RN is pulling the number towards
        the nearest float.
      
      (pulling towards the nearest tick, into the real world)
- (3)
*/
#slide(title: [(3.FP) How does rounding actually work?])[

  #gh[
    #set align(center)

    #gh(width: 80%)[
      #image("fp-rounding.png")
    ]
  ]

  #uncoverb(2)[
    - $RN$ returns the closest FP to $x$ (with conditions to break ties)
    - $RD$ returns largest FP $<= x$ (round toward $-oo$)
    - $RU$ returns smallest FP $>= x$ (round toward $+oo$)
  ]
  
  #uncoverb(3)[
    Then, we define
    $
      RZ(x) = cases(RD(x) & x  > 0 "," , RU(x) quad & x < 0 ",", 0 & "otherwise".)
    $
  ]
]

/*
- (1) Lets make a definition here...
- (2) Well, if we look at our diagram, the floating point numbers do have a semi
      common distance, at least the close numbers do.
- (3) And we have that...

      So, rounding functions either snap up, or snap down, they don't go any
      further than a tick. Can we use this to our advantage?
*/
#slide(title: [(3.FP) How does rounding actually work?])[
  *Defn.* _Unit in the last-place_ (*ULP*) is the gap between two FP numbers nearest to $x$. #l-m-meta[(Kahan)]

  #v(1em)

  #uncoverb(2)[
    #gh[
      #set align(center)

      #gh(width: 80%)[
        #image("fp-rounding.png")
      ]
    ]
  ]
  #v(1em)

  #uncoverb(3)[
    Each FP number #l-m-meta[(tick)] is at most one ULP away! #l-m-meta[(can we use this?)]

    *Note.* All ways to round either go up a tick, or go down a tick, nothing else.
  ]
]

/*
- (1) We're going to try and use this fact right now.
- (2) ...

- (5) Here is the upshot. If we can find epsilon ...

      To show how this is so powerful, imagine...

- (6) ... such that it returns the rounded capital X, and the error term
      epsilon, so that the rounded number plus the error is the actual value.

- (7) So, RN* doesn't exist in general for any arbitrary x.

- (8) But, lets imagine we had it, just for summing two numbers.

      If we wanted to implement fadd_1, we could just use RN* here to find the
      error, and snap the sum to always rounding down.
*/
#slide(title: [(3.FP) Measuring error])[
  #grid(columns: (10fr, 8fr), gutter: 5em, gh[    
    Take some $x in RR$, then $x = circle.small(x) + epsilon$.

    #uncoverb(2)[
      Solving for $epsilon = x - circle.small(x)$, then if
  
      #list[$epsilon = 0$, the operation was *exact*,]
    ]

    #uncoverb(3)[
      #list[$epsilon < 0$, we rounded up, as $circle.small(x) > x$,]
    ]

    #uncoverb(4)[
      #list[$epsilon > 0$, we rounded down, as $circle.small(x) < x$.]
    ]

    #uncoverb(5)[
      #l-m-hr()
  
      *Upshot.* If we find $epsilon$, even just the $plus.minus$,
      we can detect when rounding happens and correct it!
    ]
  ], gh[
    #uncoverb(6)[
      Imagine $RN^* : RR -> (Ru times Ru)$,

      $
        (X, epsilon) = RN^*(x) ==> X + epsilon = x
      $
    ]

    #uncoverb(7)[
      #l-m-meta[($RN^*$ doesn't exist in general)]
    ]

    #linebreak()

    #uncoverb(8)[
      ```c
      // impl. fprc = 1, so RD (round down)
      fadd_1(x, y) {
        sum, ε = RN*(x + y)

        if ε < 0 {
          // sum rounded up
          return sum - ulp
        } else {
          // sum rounded down or exact
          return sum
        }
      }
      ```
    ]
  ])
]

/*
- (1) So, this algorithm does exist, it's called TwoSum. TwoSum is among many others
      algorithms called error free transforms, those EFTs are basically your RN*.

- (2) This is something we can actually compute.

      But, if you don't believe me, this is the actual C code that does this.
- (3) There are no hands behind my back, this is an actual implementation of this,
      and is very similar to what RandomX.js uses.

      Nextafter is a function in math.h that basically gets the next
      representable float in the "direction" of the second operand. So, it basically
      computes c - ulp for us.

      Though, you're counting 1, 2, ..., different floating point operations, and a
      branch, those must be much slower than using a single add and letting hardware
      do the rounding for us. It is slower, but the widespread alternative is much
      worse.
*/
#slide(title: [(3.FP) TwoSum (error free transform)])[
  #grid(columns: (5fr, 8fr), gutter: 5em, gh[    
    #uncoverb(1)[
      ```c
      // RN*(x + y)
      TwoSum(x, y) {
        s  = RN(a + b)
        a’ = RN(s - b)
        b’ = RN(s - a’)
        δa = RN(a - a’)
        δb = RN(b - b’)
        ε  = RN(δa + δb)
        return (s, ε)
      }


      ```
    ]
    #uncoverb(2)[
      ```c
      fadd_1(x, y) {
        sum, ε = TwoSum(x, y)

        if ε < 0 {
          return sum - ulp
        } else {
          return sum
        }
      }
      ```
    ]
  ], gh[
    #uncoverb(3)[
      ```c
      #include <math.h> // for nextafter()

      double sum_residue(double a, double b, double c) {
          double delta_a = a - (c - b);
          double delta_b = b - (c - a);
          double res = delta_a + delta_b;
          return res;
      }

      // return RD(a + b)
      double fadd_1(double a, double b) {
          double c = a + b;
          double res = sum_residue(a, b, c);
          if (res < 0) {
              // c - ulp
              return nextafter(c, -INFINITY);
          } else {
              return c;
          }
      }
      ```
    ]
  ])
  
]

/*
- (1) 
- (2) ... by software, so the motivation ...
- (3) ("what is this called?") ... will be called semifloat, and that's what I'll
      call them for the rest of this talk.
- (4) (Definition)

- (5) Now, is semifloat any faster that these three?
       For example on the left is a hardfloat
      implementation, just switching between the modes.
      On the right, is the actual WASM SIMD version used in RandomX.js.

      So, it's softfloat vs semifloat. Lets take a look at how softfloat is doing,
      and we'll benchmark it!
*/
#slide(title: [(3.FP) FP implementations])[
  #list[FP impl. by hardware is often called *hardfloat*.]

  #uncoverb(2)[
    - FP impl. by software #l-m-meta[(integer operations)] is called *softfloat*.

      #l-m-meta[(Motv. CPU only supports integer operations, emulate FP in software.)]
  ]

  #uncoverb(3)[
    What is this thing called?
  ]

  #uncoverb(4)[
    - In vein of these similar defn. FP emulations in terms of $RN$ will be called *semifloat*.
      #uncoverb(5)[#l-m-meta[(Is semifloat any faster than softfloat?)]]
  ]

  #linebreak()

  #uncoverb(5)[
    #grid(columns: (7fr, 10fr), gutter: 2em, gh[
      #show raw: set text(size: 0.8em)

      ```c
      #include <fenv.h> // fesetround()
      
      double hard_fadd_1(double a, double b) {
          #pragma STDC FENV_ACCESS ON

          fesetround(FE_DOWNWARD);
          double res = a + b;
          fesetround(FE_TONEAREST);
          return res;
      }
      ```
    ], gh[
      #show raw: set text(size: 0.8em)
      
      ```c
      v128_t sum_residue(v128_t a, v128_t b, v128_t c) {
          v128_t delta_a = wasm_f64x2_sub(a, wasm_f64x2_sub(c, b));
          v128_t delta_b = wasm_f64x2_sub(b, wasm_f64x2_sub(c, a));
          v128_t res = wasm_f64x2_add(delta_a, delta_b);
          return res;
      }

      v128_t semi_fadd_1(v128_t dest, v128_t src) {
          v128_t c = wasm_f64x2_add(dest, src);
          v128_t res = sum_residue(dest, src, c);
          // performs the if (res < 0) nextafter(c, -INFINITY); as SIMD
          return nextafter_1_finite_nozero(res, c);
      }
      ```
    ])
  ]
]

/*
- (1) This f64_add is taken from Berkely softfloat, with the actual implementation
      modified to be as fast as possible given RandomX's assumptions.

      To start, the softfloat checks the signs of the two numbers and dispatches
      to a function that handles the actual sum.

- (2) And look, branch, branch, branch
- (3) branch, branch, branch.

      Many branches could be eliminanted given the assumptions, but not all of them.

      The reason why there are so many branches is that floating point addition
      needs to align the floating points and add the components. In general, this is
      a pretty involved operation and the completely unpredictable branches make
      this incredibly slow. But how slow really?
*/
#slide(title: [(3.FP) Softfloat (additive)], inset: 1em)[
  #show raw: set text(size: 1em)

  #grid(columns: (10fr, 9fr), gutter: 2em, gh[
    ```c
    // github.com/ucb-bar/berkeley-softfloat-3
    static float64_t f64_add(float64_t a, float64_t b) {
        // ...

        uA.f = a;
        uiA = uA.ui;
        signA = signF64UI( uiA );
        uB.f = b;
        uiB = uB.ui;
        signB = signF64UI( uiB );
        if ( signA == signB ) {
            return softfloat_addMagsF64( uiA, uiB, signA );
        } else {
            return softfloat_subMagsF64( uiA, uiB, signA );
        }
    }
    ```

    #l-m-hr()

    github.com/l1mey112/fp-rounding-emulation

    #l-m-meta[(check bench_RD folder)]
  ], gh[
    #show raw: set text(size: 0.8em)
    
    #let t = ```c
    // performs |A| + |B|
    static float64_t
    softfloat_addMagsF64( uint_fast64_t uiA, uint_fast64_t uiB, bool signZ )
    {
        // ....
        expA = expF64UI( uiA );
        sigA = fracF64UI( uiA );
        expB = expF64UI( uiB );
        sigB = fracF64UI( uiB );
        expDiff = expA - expB;
        if ( ! expDiff ) {
            if ( ! expA ) {
                uiZ = uiA + sigB;
                goto uiZ;
            }
            expZ = expA;
            sigZ = UINT64_C( 0x0020000000000000 ) + sigA + sigB;
            sigZ <<= 9;
        } else {
            sigA <<= 9;
            sigB <<= 9;

            if ( expDiff < 0 ) {
                expZ = expB;
                if ( expA ) {
                    sigA += UINT64_C( 0x2000000000000000 );
                }
                sigA = softfloat_shiftRightJam64( sigA, -expDiff );
            } else {
                expZ = expA;
                if ( expB ) {
                    sigB += UINT64_C( 0x2000000000000000 );
                }
                sigB = softfloat_shiftRightJam64( sigB, expDiff );
            }
            sigZ = UINT64_C( 0x2000000000000000 ) + sigA + sigB;
            if ( sigZ < UINT64_C( 0x4000000000000000 ) ) {
                --expZ;
                sigZ <<= 1;
            }
        }
        // peform rounding here
        return softfloat_roundPackToF64( signZ, expZ, sigZ );
    uiZ:
        uZ.ui = uiZ;
        return uZ.f;
    }
    ```

    #uncover(2)[
      #move(t, dy: 20em)
    ]
    #uncover(3)[
      #move(t, dy: -25em)
    ]

  ])

]


/*
- (1) So, here is the benchmark I tried on a couple CPUs...
      These are modern out-of-order, superscalar CPUs. Generally, you can expect
      implementations with the least branches to win here.

      Because TwoSum doesn't use any branches, and since the CPU can execute both
      the computations for DeltaA and DeltaB, it effectively goes down from 6
      float operations to only 2-3. So the overhead is only 2x, so not bad.

      The softfloat though, that's 17x slower compared to baseline, those
      branches hit hard. That's as expected though. Let's look at multiplication!
*/
#slide(title: [(3.FP) Benchmark (additive)], inset: 1em)[
  #set align(right)

  ```bash
  $ git clone https://github.com/l1mey112/fp-rounding-emulation
  $ cd fp-rounding-emulation/bench_RD
  $ clang ... && ./bench
  # fprc(1):    XX.XX GFLOPS "hard_fadd_1"
  # fprc(1):    XX.XX GFLOPS "semi_fadd_1" (x1.88 overhead)
  # fprc(1):     X.XX GFLOPS "soft_fadd_1" (x17.56 overhead)
  #                  (average overhead)    ^^^^^^^^^^^^^^^^^
  ```
  
  #{
    set text(size: 0.8em)

    let axis = axis.with(stroke: white, value_color: l-m-text-colour)

    let fadd_series = (fadd_hard_gflops, fadd_semi_gflops, fadd_soft_gflops)
    let fadd_plot_data = generate_grouped_data(fadd_series)
    let fadd_colors = ((red,) * fadd_hard_gflops.len() +
      (blue,) * fadd_hard_gflops.len() +
      (orange,) * fadd_hard_gflops.len())

    let pl = plot(
      axes: (
        axis(
          min: 0, max: 9, location: "bottom",
          values: cpu_labels,
          title: "Processor",
        ),
        axis(
          min: 0, max: 60, step: 10, location: "left",
          helper_lines: true,
          title: "Performance (GFLOPS)"
        ),
      ),
      data: fadd_plot_data
    )

    bar_chart(
      pl,
      caption: none,
      (100%, 60%),
      bar_width: (0.75 / fadd_series.len()) * 100%,
      fill: fadd_colors,
    )

  }

  #align(center)[
    #text(fill: red)[■] hard_fadd_1
    #h(1.5em)
    #text(fill: blue)[■] semi_fadd_1
    #h(1.5em)
    #text(fill: orange)[■] soft_fadd_1
  ]
]

/*
- (1) Well, here is the multiplication function in its entirety. It is pretty big,
      but there are a couple familiar parts.

      The top is the same, just calculating the multiplication.

      The middle is where we find the error.
      There are calls to frexp and ldexp.
      Basically, we perform equal scaling on a, b, and c to avoid underflow.
      This is okay, because we only care about the sign of the error.

      We have infinity for the E registers, so this if statement is needed.
      It's a rare branch, so it costs next to nothing.

      And finally, it's all fed to the same nextafter function for fadd_1.
*/
#slide(title: [(3.FP) Semifloat (multiplicative)], inset: 1em)[
  #show raw: set text(size: 0.8em)

  ```c
  v128_t semi_fmul_1(v128_t dest, v128_t src) {
      v128_t c = wasm_f64x2_mul(dest, src);

      // scale a_scaled, b_scaled, c_scaled to be within [0.5,1) - frexp(3), ldexp(3)
      v128_t expa, expb;
      v128_t a_scaled = frexp_reg_e_nozero_noinf(dest, &expa);
      v128_t b_scaled = frexp_reg_e_nozero_noinf(src, &expb);
      v128_t c_scaled = ldexp_reg_e_nozero_noinf(c, wasm_i64x2_sub(wasm_i64x2_neg(expa), expb)); // -expa - expb
      v128_t res = mul_residue(a_scaled, b_scaled, c_scaled);

      v128_t isinf = wasm_f64x2_eq(c, wasm_f64x2_const(INFINITY, INFINITY));

      // branch hit 0.024882% to 0.003414% of the time, so never
      if (unlikely(wasm_v128_any_true(isinf))) {
          v128_t isfinite_a = wasm_f64x2_ne(dest, wasm_f64x2_const(INFINITY, INFINITY));
          // fin * fin = _inf_; round down to the nearest representable number
          // inf * fin = inf
          //
          // res = isinf ? (isfinite_a ? -1.0 : 1.0) : res
          //                             ^^^^   ^^^
          //                    rounding down   no rounding
          v128_t res_isinf = wasm_v128_bitselect(wasm_f64x2_const(-1.0, -1.0), wasm_f64x2_const(1.0, 1.0), isfinite_a);
          res = wasm_v128_bitselect(res_isinf, res, isinf);
      }

      return nextafter_1_finite_nozero(res, c);
  }
  ```
]

/*
- (1) So, lets take a look at mul_residue. This is one of Dekker’s algorithms,
      it's another EFT like TwoSum.

      This whole thing is still branchless, but I mean, it's really really ugly.
      This must be much slower than addition, but we'll see.

      There is this note here at the end.
      
      At the end of this huge 
      computation, we get the variable a*b and subtract it with c here.
      This is the core of this entire function.
      We just want to extract the error term. Is there a way to skip all of this crap?

      Let's look into this deeper:
*/
#slide(title: [(3.FP) Semifloat (multiplicative)], inset: 1em)[
  ```c
  static inline v128_t upper_half(v128_t x) {
      v128_t secator = wasm_f64x2_const(134217729.0, 134217729.0);
      v128_t p = wasm_f64x2_mul(x, secator);
      return wasm_f64x2_add(p, wasm_f64x2_sub(x, p));
  }

  static inline v128_t mul_residue(v128_t a, v128_t b, v128_t c) {
      v128_t aup = upper_half(a);
      v128_t alo = wasm_f64x2_sub(a, aup);
      v128_t bup = upper_half(b);
      v128_t blo = wasm_f64x2_sub(b, bup);

      v128_t high = wasm_f64x2_mul(aup, bup); 
      v128_t mid = wasm_f64x2_add(wasm_f64x2_mul(aup, blo), wasm_f64x2_mul(alo, bup));
      v128_t low = wasm_f64x2_mul(alo, blo);
      v128_t ab = wasm_f64x2_add(high, mid);
      v128_t resab = wasm_f64x2_add(wasm_f64x2_sub(high, ab), mid);
      resab = wasm_f64x2_add(resab, low);

      v128_t fma = wasm_f64x2_sub(ab, c); // a*b - c ----- we want a * b - RN(a * b) = res
      return wasm_f64x2_add(resab, fma);
  }
  ```
]

/*
- (1) Let's actually try to derive something together. Starting with what we know,
      we want to find an equation for epsilon. Remember that the real value, the
      a * b is actually just a * b rounded + an error term.
- (2) So, solving for epsilon, we get this expression. It's just a * b minus a * b
      but rounded, pretty intuitive. We haven't done anything crazy yet.

- (3) What we can do though, is apply RN to both sides, and we get epsilon back.
- (4)

- (5) Now though, as you can probably see, we actually have a closed form solution
      for the error term. However, we need to be able to do a * b - c in
      infinite precision, then round at the very end. Is this even possible?
*/
#slide(title: [(3.FP) Semifloat FMA? (multiplicative)])[
  #gh[    
    Let $mono(c) = RN(a times b)$, assume $epsilon in Ru$. Going back to what we know,  
    $
      a times b &= RN(a times b) + epsilon \
      a times b &= mono(c) + epsilon.
    $

    #uncoverb(2)[
      Solving for $epsilon$,
      $
        a times b - mono(c) = epsilon,
      $
    ]
    #uncoverb(3)[
      apply $RN$ on both sides,
      $
        RN(a times b - mono(c)) &= RN(epsilon) \
        &= epsilon,
      $
    ]
    #uncoverb(4)[
      as $epsilon$ is already a floating point number.
    ]

    #uncoverb(5)[
      #l-m-hr()

      *Goal.* Is there a way to do $a times b - mono(c)$ in one rounding?
    ]
  ]
]

/*
- (1) ... So, what is this fma?
- (2) We have that fma, fused multiply-add, calculates a * b + c all in one
      rounding, instead of two.
- (3) This is not a double round, the expression a * b rounded + c rounded is
      completely wrong, and would never give us the epsilon we want.
- (4) Now, the code here looks super simple. We can omit the the huge list of
      FP operations in mul_residue, even the infinity calculation, and just
      use it like so, as intended.

      This is the reason why hands down, FMA is my favourite instruction.
*/
#slide(title: [(3.FP) Semifloat FMA (multiplicative)])[
  IEEE754-2008 specifies $+$, $-$, $times$, $div$, $sqrt(x)$, $fma(a, b, c)$ correctly rounded. #l-m-meta[(?? fma)]

  #uncoverb(2)[

    *Defn.* Fused multiply-add,
    
    $
      fma(a, b, c) = circle.small(a times b + c).
    $

  ]

  #uncoverb(3)[
    #l-m-meta[(Not a double round! So  $fma(a, b, c) != circle.small(circle.small(a times b) + c)$.)]
  ]

  #uncoverb(4)[
    #l-m-hr()
    #linebreak()

    ```c
    v128_t mul_residue_fma(v128_t a, v128_t b, v128_t c) {
        // return fma(a, b, -c)
        return wasm_f64x2_relaxed_madd(wasm_f64x2_neg(c), b, a); // RN(a*b - c)
    }
    
    v128_t semi_fmul_fma_1(v128_t dest, v128_t src) {
        v128_t c = wasm_f64x2_mul(dest, src);
        v128_t res = mul_residue_fma(dest, src, c);
        return nextafter_1_finite_nozero(res, c);
    }
    ```
  ]
]

/*
- (1) Okay, here is the benchmark again. So the orange software multiplication isn't
      10 times slower now, it's more like 4 to 5 times slower which is pretty 
      tenable.

      The green semifloat with FMA though, is absolutely the best here, it's only 80%
      slower than baseline hardware, which is very good!

      It seems like the regular blue naive semifloat barely has the lead it had before,
      the software implementation is very close behind.
      
      Still faster though, even with naive semifloat doing 15 floating point
      operations, but what happened?
*/
#slide(title: [(3.FP) Benchmark (multiplicative)])[
  #set align(right)

  ```bash
  $ git clone https://github.com/l1mey112/fp-rounding-emulation
  $ cd fp-rounding-emulation/bench_RD
  $ clang ... && ./bench
  # fprc(1):    XX.XX GFLOPS "hard_fmul_1"
  # fprc(1):    XX.XX GFLOPS "semi_fmul_fma_1" (x1.78 overhead)
  # fprc(1):     X.XX GFLOPS "semi_fmul_1"     (x4.33 overhead)
  # fprc(1):     X.XX GFLOPS "soft_fmul_1"     (x5.00 overhead)
  #                  (average overhead)        ^^^^^^^^^^^^^^^^
  ```
  
  #{
    set text(size: 0.8em)

    let axis = axis.with(stroke: white, value_color: l-m-text-colour)

    let fmul_series = (fmul_hard_gflops, fmul_semi_fma_gflops, fmul_semi_gflops, fmul_soft_gflops)
    let fmul_plot_data = generate_grouped_data(fmul_series)
    let fmul_colors = ((red,) * fadd_hard_gflops.len() +
      (green,) * fadd_hard_gflops.len() +
      (blue,) * fadd_hard_gflops.len() +
      (orange,) * fadd_hard_gflops.len())

    let pl = plot(
      axes: (
        axis(
          min: 0, max: 9, location: "bottom",
          values: cpu_labels,
          title: "Processor",
        ),
        axis(
          min: 0, max: 60, step: 10, location: "left",
          helper_lines: true,
          title: "Performance (GFLOPS)"
        ),
      ),
      data: fmul_plot_data
    )

    bar_chart(
      pl,
      caption: none,
      (100%, 60%),
      bar_width: (0.75 / fmul_series.len()) * 100%,
      fill: fmul_colors,
    )
  }

  #align(center)[
    #text(fill: red)[■] hard_fmul_1
    #h(1.5em)
    #text(fill: green)[■] semi_fmul_fma_1
    #h(1.5em)
    #text(fill: blue)[■] semi_fmul_1
    #h(1.5em)
    #text(fill: orange)[■] soft_fmul_1
  ]
]

/*
- (1) Now, this is the berkely softfloat version, and it's so small that it can 
      actually fit onto a single slide! Like the f64_add softfloat version, I 
      optimised as heavily as I can, given the assumptions.

      Remember that floating point addition is much more complicated in terms of
      branches, because you need to align the floating points of each
      value.

- (2) A super simple example explaination is this:
      Take two floating point numbers a and b.
      Then consider their multiplication, you just multiply the mantissas and add
      the exponents, which is much easier to do in software, and for the most
      part, branchless.
*/
#slide(title: [(3.FP) Softfloat (multiplicative)])[
  #show raw: set text(size: 0.8em)
  
  #grid(columns: (10fr, 6fr), gutter: 1em, gc[
    ```c
    float64_t f64_mul( float64_t a, float64_t b )
    {
        union ui64_f64 uA, uB, uZ;
        uA.f = a; uB.f = b;
        uint64_t uiA = uA.ui;            uint64_t uiB = uB.ui;
        int16_t expA  = expF64UI( uiA ); uint64_t sigA  = fracF64UI( uiA );
        int16_t expB  = expF64UI( uiB ); uint64_t sigB  = fracF64UI( uiB );

        if ( expA == 0x7FF ) {
            goto infArg;
        }
        int16_t expZ = expA + expB - 0x3FF;
        sigA = (sigA | UINT64_C( 0x0010000000000000 ))<<10;
        sigB = (sigB | UINT64_C( 0x0010000000000000 ))<<11;

        // perform 64 bit multiply -> returning 128 bit result
        struct uint128 sig128Z = softfloat_mul64To128( sigA, sigB );
        uint64_t sigZ = sig128Z.v64 | (sig128Z.v0 != 0);
        if ( sigZ < UINT64_C( 0x4000000000000000 ) ) {
            --expZ;
            sigZ <<= 1;
        }
        // perform rounding, you've seen this before with f64_add
        return softfloat_roundPackToF64( 0 /* signZ */, expZ, sigZ );
    infArg:
        uZ.ui = packToF64UI( 0 /* signZ */, 0x7FF, 0 );
        return uZ.f;
    }
    ```
  ], gc[
    #set par(justify: false)

    #uncoverb(2)[
      Take two FP numbers, $a$ and $b$. Then,
    
      $
        a &= m times 2^(e), \
        b &= n times 2^(u).
      $

      Multiplying,
      $
        a times b = (m times n) times 2^(e + u),
      $
      which is much, much easier to do in software.
      
      #l-m-meta[(compared to FP addition.)]
    ]
  ])
]

/*
- (1) I'll give a short summary, ...
- (5) This allows RandomX.js to be fast!
*/
#slide(title: [(3.FP) In short])[
  #list[RandomX "forces" nontrivial FP rounding on you to maximise die space on an ASIC.]

  #uncoverb(2)[
    - WASM, JS, Rust, Python, etc only have access to $RN$, what now?
  ]

  #uncoverb(3)[
    #l-m-hr()

    - Error free transforms allow you to impl. $RD$, $RU$, $RZ$ in terms of $RN$,
      without using slow software impl.

    - This speeds up emulation of addition considerably, multiplication, a little.

      #l-m-meta[(EFTs still win!)]
  ]


  #uncoverb(4)[
    #l-m-hr()

    - The bane of slow software implementations is unpredictable branches.

      #l-m-meta[(the cost of multiple FP operations $<$ cost of a single unpredictable branch)]
  ]

  #linebreak()

  #uncoverb(5)[
    #gh[
      #figure[
        This allows RandomX.js to be fast!
      ]
    ]
  ]
]

#new-section-slide[Finishing Up]

#slide(title: "Q&A - The End + Reference material")[

  Thank you everyone! It's Q&A time.

  #set text(size: 0.7em)

  #linebreak()

  *Slides cut to make time.* Easy program problem, memory-hardness, scratchpad, longer exposition on the ASIC problem, relaxed SIMD caveats, RandomX FP assumptions.

  #l-m-hr()

  *Error Free Transforms (EFTs)*
  - #l-m-meta[Muller, J.-M. et al. (2018)] Handbook of Floating-Point Arithmetic.
  - #l-m-meta[Arnold, J. (2012)] “Floating-Point Arithmetic.”
  
    https://indico.cern.ch/event/166141/sessions/125684/attachments/201414/282782/Arnold-FPWorkshop-Print.pdf

  - #l-m-meta[(My question on SO)] https://stackoverflow.com/questions/78776730

  #l-m-hr()

  *RandomX*
  - #l-m-meta[(docs)] https://github.com/tevador/RandomX/blob/master/doc/docs.md
  - #l-m-meta[(specs)] https://github.com/tevador/RandomX/blob/master/doc/specs.md

  #l-m-hr()

  *RandomX.js*
  - #l-m-meta[(perf tracking)] https://github.com/l1mey112/randomx.js/issues/1
]
