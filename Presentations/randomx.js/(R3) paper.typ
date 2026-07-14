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

/* math */

#let Ru = math.upright("R")
#let RD = $upright(bold("RD"))$
#let RU = $upright(bold("RU"))$
#let RN = $upright(bold("RN"))$
#let RZ = $upright(bold("RZ"))$
#let ulp = $"ulp"$
#let fma = $"fma"$

#title-slide({
  l-m-title("Zero to RandomX.js:")
  linebreak()
  l-m-title("Bringing Webmining Back From The Grave")
  l-m-hr()
  set text(size: 0.8em)
  text(fill: l-m-meta-colour, "Thursday, November 6th | K15 Old main G32 | 2 PM - 4 PM")
})

#slide(title: "About me")[
  - Liam, l-m, #underline[l-m.dev], #underline[l-m\@l-m.dev]
]

/*
*/
#slide(title: "This Talk?")[
	#l-m-todo[(1.POW) Explain POW consensus, ASICs?]

	#l-m-todo[(2.RX) Explain RandomX.]

	#l-m-todo[(3.JS) Introduce RandomX.js]

	#l-m-todo[(4.FP) Explain the semifloat impl. in RandomX.js]
]

#new-section-slide[(1.POW) Proof of Work]

/*
- (2) Before a block is mined, the network sets a new difficulty. In Monero's case,
      they want some amount of leading zeros after the result of a hash. Given that
      hashes are so random, you need to bash your head against the wall pissing
      energy and heat into the wind.
- (3) Probabalistically, one person will win every block time. Immediately after a
      block is mined, a new difficulty it set up and it repeats.
- (3) Only blocks that meet the difficulty are accepted, you're proving to the
      network that you spent energy and time getting this block in.

      Note that this is just some hash, it could be anything, it just needs to be
      some work, and this work can be done by anyone. FPGAs, CPUs, GPUs, and
      specialised circuits.
*/
#slide(title: "(1.POW) Proof of Work (POW)")[
  #grid(columns: (auto, auto), gutter: 2em, gc[
    - Transactions are processed at a set time interval by a *single person*.
    
    - We pick the person by making them _compete_ as miners.
    - How is this done? #uncoverb(2)[*By making miners guess repeatedly.*]

    #uncoverb(3)[
      #l-m-hr()
      - The _difficulty_ is set up so that exactly one person wins every #text("2 minutes", rgb("#f26822")).

      - The new hash becomes the "id" of the new block, the block's _proof of work_.
    ]
  ], uncover((2, 3), gc[
    ```c
    POW(difficulty: "0x******00") {
        
        // HASH(prev_hash || nonce)
        HASH(0x111111... ⊕ 0) → 0xe88141b8
        HASH(0x111111... ⊕ 1) → 0x35a65b49
        HASH(0x111111... ⊕ 2) → 0x6bfe783f
        HASH(0x111111... ⊕ 3) → 0x7cb4fc19
        HASH(0x111111... ⊕ 4) → 0x9fb50356
        // ...
        //
        //
        HASH(0x111111... ⊕ 123123123123)
            → 0x4ac30d00
        //    0x******00
        // within difficulty, success!
    }
    ```
  ]))
]

/*
- (2) Out of all possible devices that could mine, I'd say 95% of them are commodity
      CPU hardware.

- (4) As you go from CPU -> GPU -> ASIC, this represents an order of magnitude increase
      in the hashrate. However, it also represents an order of magnitude decrease in
      the generality of these machines. They get more specific, only work with certain
      hashes, only with a specific coin.

      The one thing I want you all to take away from this slide is just how powerful
      these ASICs are. You could get a 100 CPUs, and a mid range ASIC would beat them.

      Once ASICs start mining on your blockchain, it's over, throw out all of your CPU
      and GPU miners. ASICs become the only competitive way to mine.
*/
#slide(title: [(1.POW) Case Study: Who _*could*_ mine?], inset: 1em)[
    #set align(top)
    
    #grid(columns: (auto, auto, auto), gutter: 1em, uncover((2, 3, 4), gc[
        = CPU (#text("~95%", fill: rgb("#3bea17")))
        #l-m-hr()
        #image("image-2.png", width: 90%)

        #set par(justify: false)
        - Unspecialised, general purpose hardware.
        - Will run your OS, your everyday machine.
    ]), uncover((3, 4), gc[
        = GPU (#text("~5%", fill: rgb("#ea14b5")))
        #l-m-hr()
        #image("image-4.png", width: 80%)

        #set par(justify: false)
        - Specialised for parallel processing.
        - Can't do everything a CPU can do.
        - Pretty expensive.
    ]), uncover((4), gc[
        = ASIC (#text("~0.00..1%", fill: rgb("#f70d0d")))
        #l-m-hr()
        #image("image-8.png")

        #set par(justify: false)
        - Hashing code is etched into a physical circuit.
        - #underline[*Useless for anything else.*]
        - Incredibly expensive, out of reach.

        #l-m-meta[
            (#strong()[_A_]pplication-#strong()[_S_]pecific-#strong()[_I_]ntegrated-#strong()[_C_]iruit.)
        ]
    ]))
]

/*
- (1) With ASICs, they have multiple orders of magnitude more hashrate.
      It's not a level playing field for people with CPUs who play fair.
      If you control 51% of the hashrate, no one can stop you from doing whatever
      you want, and the security of the network is destroyed.

- (2) For one of us, one of our commodity machines, we get vote in the security
      of the network.

      Even if everyone in this room brought all of mid range devices and chained
      them together and just started mining, we wouldn't beat a random person with a
      couple ASICs.

      So, it's us against them, right? You want the people to be in control of the
      network, where no single entitiy has a majority stake in the hashrate.

- (3) ...

      Once ASICs become the only competitive way to mine, it's over for the for the
      well meaning majority trying to secure the network.
*/
#slide(
  title: [(1.POW) Case Study: Us against Them],
  inset: 1em,
  background: image("us-and-them.png", fit: "stretch", width: 100%, height: 100%),
)[
  #set align(top)

  #grid(columns: (auto, auto, auto), gutter: 1em, gc[
    #uncoverb(2)[
      *One CPU = one vote.*
      #l-m-hr()
    ]
    #uncoverb(3)[
      - Once ASICs become the only competitive way to mine, it's over.

      - Network security is in jeopardy.
    ]
  ], gc[
    #uncoverb(2)[
      *One ASIC = 1000+ votes.*
      #l-m-hr()
    ]
    #uncoverb(4)[
      - You'd end up with a currency with all the control in the hands of a few people who can afford it.

      - In the long run, you're screwed!
    ]
  ])
]

/*
- (3) In a perfect world, everyone gets a fair shot. We want to reduce the chances of
      a single person having majority control over a cryptocurrency.
*/
#focus-slide()[
  #set text(fill: l-m-text-colour, size: 0.9em)
  
  _What did we learn?_

  #l-m-hr()

  #uncoverb(2)[
    ASICs need to be made irrelevant by any means necessary, if we are to care about security.
  ]

  #uncoverb(3)[
    #l-m-meta[(promote egalitarian mining)]
  ]
]

/*
- (1) CPUs are general purpose processors, ASICs can only do one thing. To do some
      useful work on a CPU, you just write some code and load it into memory. For
      an ASIC? You need to design a chip, fabricate it, and do a thousand times as
      much work, for some algorithm frozen in the silicon.

      That's obvious right?
      CPUs are very efficient at executing arbitrary code!

      How could we exploit this?

- (2) (say it)

- (3) We want to create a hash function so general, that the perfect machine to
      calculate those hashes looks exactly like a CPU. Then, there is no advantage
      to using an ASIC.

      ...

- (4) Then, the CPU becomes this perfect machine. We want to make any ASIC created
      functionally resemble a CPU, hence the creation of specialised ASICs become
      economically infeasible over just buying a CPU.

      If we do this right, we solve our problem.
*/
#focus-slide()[  
  #uncoverb(2)[
    What if executing arbitrary code was \
    integral to hashing?
  ]

  #set text(fill: l-m-text-colour, size: 0.6em)

  #uncoverb(3)[
    #l-m-meta[
      (That is, $"HASH"("code", "data")$, instead of $"HASH"("data")$)
    ]
  ]

  #uncoverb(4)[
    #l-m-hr()
    Then, all ASICs resemble CPUs. \
    $==>$ ASICs economically infeasible over CPU.
  ]
]

#new-section-slide[(2.RX) RandomX]

/*
- (3) By then, ASICs for cryptonight have already been created, so the switch was needed.
*/
#slide(title: [(2.RX) RandomX])[

  RandomX is a proof-of-work algorithm that is optimized for general-purpose CPUs. It has stood the test of time as an *ASIC resistant* hash function.

  #uncover((2, 3))[
    On November 30th, 2019, Monero switched from its old POW algorithm, _cryptonight_, to RandomX. #uncover(3)[
      #text(fill: rgb("#f26822"))[Which had already been broken.]
    ]
  ]

  #uncover(3)[
    #l-m-hr()
    #quote(attribution: [tevador/RandomX], block: true)[
      RandomX uses random code execution (hence the name) together with several memory-hard techniques to minimize the efficiency advantage of specialized hardware.
    ]

    #l-m-meta[(Reminder: the goal is to make ASICs resemble CPUs.)]

    #v(1em)

    https://github.com/tevador/RandomX
  ]
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

      You can think of these as two separate units, black boxes. The only thing the
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

      Even the possibility that Monero can just go up and change their algorithm
      puts the fear of god in these companies, as it's happened before with previous
      ASICs for the earlier cryptonight being turned into bricks. Their price
      dropped to zero because they were useless. 

      So, RandomX will tack on feature after feature to grow the cost of a custom
      ASIC. First,

- (3) ... these are the two obvious ones, the goal is to force ASICs to include
      memory external to the chip, and to make the actual hash computation a random
      program, not fixed code. CPUs can ask memory controllers to prefetch, so they
      can do computations in between waiting for memory.

- (4) ... So CPUs are good at maximising ILP, instruction level parallelism. In the
      name, they can execute multiple instructions at once, they can reorder them,
      they can predict branches, optimistically guess the result of some code
      (so speculative execution). CPUs can also cache the instructions read, so
      in tight loops, they can power down the instruction decoders.

      All modern, out-of-order, superscalar CPUs do this, and its a huge advantage
      made up for how complex it is on-chip.
      
      So, if an ASIC wants to be competitive here, they need to factor in the cost
      of stealing trade secrets from AMD and Intel to their bottom line. There's no
      getting around this. This level of complexity, needs to be included on the
      chip somehow.

- (5) ...
      
      If you remember, the dataset is 2 GiBs of fixed memory, just reading, no
      writing. So we have memory external to the chips, but CPUs have fast on chip
      caches for frequently acccessed memory, and in basically all CPUs it's
      organised into an L1, L2, L3 hierarchy. So RandomX does use this, and it's
      where the VM sends all its entropy.

- (6) There are also some things which are givens when you want to do useful work
      on CPUs, so full compliant floating point, hardware SIMD, integer dividers,
      and hardware AES instructions.

- (7) The sum of all of these equates to a monumental amount of complexity and R&D
      time. Creating an ASIC that does all these would be prohibitively expensive,
      and straight up irrational.



      Accomplishing most of these is straightforward, but for some, it's pretty
      involved.
*/
#slide(title: [(2.RX) Defense in depth (of the ASIC)])[
  #uncoverb(2)[
    *Goal.* Economic infeasability of ASICs.
  ]

  #uncoverb(3)[
    #l-m-hr()

    - 2 GiBs of #l-m-meta[(external)] DRAM + prefetch - *Memory-Hardness*.

    #list[*Random* code e#strong[X]ecution.]
  ]
  
  #uncoverb(4)[
    - Superscalar design, instruction/μop cache.

    #list[Speculative execution, branch prediction.]
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
- (1) So I'll explain the dataset first, one of two black boxes. Remember that we
      have the VM, and the Dataset. The input data H isn't considered here, the only
      input to the dataset is the key K.

- (2) ...

      The word superscalar is key here, so what RandomX does to generate these
      hash functions is that it simulates a modern superscalar CPU, to decide what
      instructions to emit to artificially saturate the host CPU. So the simulator
      takes in entropy and spits out instructions, it internally uses
      the Intel Ivy Bridge microarchitecture as a reference.

- (3) ...
      A hint here is that you actually don't need to lug around 2 GiB dataset, you
      can generate it on the fly from the dataset cache, which is only 256 MiBs.

      If you want to mine fast, you generate the entire 2 GiBs up front, but, if you
      just want to mine on a memory budget or verify someones hash, you only need
      the 256 MiB "cache" as you can run the 8 hash functions on demand. This is
      called light-verification, or light-mode, which is really the takeaway of this
      slide.
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
- (1) So here I'm going to explain how we actually force ASICs to use external
      memory, it's by this property called memory-hardness.

      I'm going to start with this definition ...

- (2) We want memory hardness to act like a barrier. Even a slight reduction in
      memory means a significant slowdown for a would be ASIC. Making RandomX memory
      hard will force ASICs to either include the memory for storing the 2 GiB
      dataset, or take a huge performance hit.

      For an ASIC to actually outperform a CPU in this area, its only option is to
      just not use external memory, like your RAM sticks, but include the memory on
      the chip itself. We want to stop them from doing this.

- (3) Let's actually consider two designs taken from the RandomX design doc that
      have the memory on chip.

- (4) ...

      This ASIC for fast mode mining at the time of RandomX's introduction
      would simply be not possible, as 2 GiBs of memory would be 
      economically infeasible to store on-chip. So you would lose out of the 
      advantage of on chip memory, and would have to use external DRAM, 
      then at that point there is no advantage to a CPU.

- (5) ...
      
      Because the superscalarhash generator, which is a CPU simulator, 
      tries its hardest to maximise the dependency chain for all the 
      registers across the instructions, an ASIC can't just evaluate the 
      entire hash in parallel. Since each instruction depends on the 
      previous one maximally, OoO execution and the superscalar nature of 
      CPUs will be able to evaluate it efficiently. An ASIC would lose a 
      lot on the performance front.

- (5) Also, it uses an incredible amount of power.

      ... So, the Dataset serves its purpose of making RandomX memory hard, while
      allowing small CPUs like Raspberry-Pis to actually verify hashes without using
      2 GiBs of memory.
*/
#slide(title: [(2.RX) Memory-Hardness (dataset)])[
  *Defn.* A function is *memory-hard* when it costs a significant amount of memory to evaluate efficiently.

  #uncoverb(2)[
    #l-m-meta[(Memory-hardness forces ASICs to use external DRAM, or take a huge penalty.)]
  ]

  #uncoverb(3)[
    #l-m-hr()
    
    Imagine an ASIC without external DRAM:

    1. #l-m-meta[(fast-mode)] 2 GiBs of on-chip low latency SRAM.

      #uncoverb(4)[*Verdict.* Straight up economically infeasible.]

    2. #l-m-meta[(light-mode)] 256 MiB of on-chip memory, 1-cycle latency for ops w/ SSH.

      #uncoverb(5)[*Verdict.* Huge performance hit.]

    #uncoverb(5)[
      #quote(attribution: [tevador/RandomX design.md], block: true)[
        
        #l-m-meta[... It will have to execute 155 \* 8 = 1240 64-bit multiplications per item, which will consume energy comparable to loading 64 bytes from DRAM.]
      ]
    ]
  ]
]

/*
- (1) We have that there RandomX virtual machine is only concerned with the
      input hash bytes, not so much the key.

      On a high level there are four main sections of the VM, which are the
      scratchpad (which is the working memory of this imaginary CPU), the
      program buffer (which just holds the instructions), the register file,
      and the abstract virtual machine which describes the way to execute
      each program.

      You can follow the yellow lines as the flow of initialisation bytes,
      and the purple lines as the result flow, like the image for the dataset.

- (2) I will go through the general algorithm.

- (3) An initial seed is calculated by hashing the input, then
      the scratchpad is entirely filled from random bytes using a RandomX
      specific performant hash function that uses rounds of AES.

- (4) The program buffer is filled, which is basically all the state needed
      to program an instance of the RandomX virtual machine. 128 bytes are
      set aside to be loaded into the register file, and 2048 bytes is the
      actual program.

      So (4) the VM is executed along with all the instructions, filling up the
      scratchpad and register files with entropy, and reading from the
      dataset.

      Every instruction that can read or write will do so respecting the
      hierarchy of the scratchpad, so accesses to L1 are done 3 times as much as 
      accesses to L2, and accesses to L3 are done sparingly and at certain
      stages to avoid stalls.

      After that, the register file is hashed and copied to the
      AES generator state which we're keeping around to generate
      an entirely new program, going around steps 3-5 again, where the
      entropy of one program is used to generate the next, and so on.

- (5) So after we executed the 8 programs, we have a scratchpad which
      is just filled with entropy, so we hash it using rounds from AES
      (which is fast), and the final result is calculated as the hash of
      the scratchpad with a portion of the register file.
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
- (1) There is a very good reason RandomX opts to execute 8 different
      programs in a chain.

- (2) Remember that mining is simply just finding an integer called
      the nonce that when you concat the block data, which is the 
      transactions with the integer it hashes to a value that is 
      acceptible, within a certain difficulty.

- (3) Given this, since the integer can be any number, why not just
      optimise for the easy programs, and skip the hard ones?

- (4) Well, if you had to execute multiple programs in a chain, aborting
      on an unfavourable program would be pretty expensive because you'd
      have to throw away all your previous work. Even if you were quicker
      at the easy programs, the fact that you need to do 8 whittles down
      your advantage back to nothing.
*/
#slide(
  background: move(dy: 25%, image("randomx easy program problem.png", fit: "contain", width: 100%, height: 100%)),
  title: [(2.RX) Easy program problem],
)[
  #set align(top)

  #gc[
    #uncoverb(2)[
      - Mining is evaluating HASH(block $⊕$ nonce), where nonce = 0, 1, 2, ...

        #l-m-meta[(until a successful hash is found.)]
    ]

    #uncoverb(3)[#list[Why not just nonce++ when an unfavorable #l-m-meta[(hard)] program is found?]]
    
    #uncoverb(4)[
      #l-m-hr()

      *Reason.* Chaining programs forces you to commit, or take a #l-m-meta[(time)] penalty.
    ]
  ]
]

/*
- (1) The virtual machine has 8 integer registers r0-r7 and a total of 12
      floating point registers split into 3 groups, f0-f3, e0-e3, a0-a3.
      Group R registers are 64 bits wide, and each floating point register
      is 128 bits wide, which transparently is just a pair of two doubles,
      so operations on those registers can be compiled down to operations
      on SIMD registers. The FP registers a0-a3 are fixed from when the
      VM was programmed.

      There are also 3 internal registers, ma, mx, and fprc. You might have
      already seen ma and mx, they're the registers that store an index
      into the dataset item to access.

      x86_64 is the lowest common denominator over all of the ISAs RandomX
      wants to support, so only 8 integer registers and 12 SIMD registers,
      and all of the VM instructions are two address x86 style.

- (2) The integer instructions are pretty standard...

      No division is included, but IMUL_RCP is multiplication by the
      a reciprocal, so division by some fixed 32 bit value. The reason
      being is division exists on CPUs, but isn't pipelined/fast, but
      you wouldn't want to exclude division. Calculating the reciprocal
      requires a division when programming the VM, so including IMUL_RCP
      forces ASICs to include a division circuit which CPUs already have.

      Note that most of these instructions have _R and _M variants, which
      read and write registers, or read and write to the scratchpad.

- (3) The only floating point operations that are included are the
      base deterministic IEEE754 instructions, swapping the pair within
      an FP register, and FSCAL which performs a scaling according to
      some complex rules which is equivalent to a XOR on the floating
      point binary representation.

      The reason why FSCAL exists, which works on the F registers, is so
      that ASICs can't use a quicker fixed point representation over using
      IEEE doubles. If they used a fixed point representation, they'd need
      to follow the complex scaling rules, where if it's in IEEE format,
      a simple XOR gives it to you for free. So no cheating here!

- (4) Stores into the scratchpad are done with ISTORE. Loops are implemented
      using CBRANCH, and the generation is set up in a way so that upwards
      branches don't nest, and infinite loops can't happen.

      Superscalar CPU designs have a huge advantage here executing
      the code with the FP and integer instructions, as well as speculative
      execution around branches.

      The CFROUND instruction adjusts the rounding mode of the add, sub,
      mul, div, and square root, just the IEEE instructions. The default
      setting of fprc is zero, which is the default assumed rounding mode 
      for basically all programming languages.
*/
#slide(title: [(2.RX) Instructions + Registers], inset: 1.2em)[
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
- (1) Before I conclude, I want to go over floating point numbers and give am
      explaination of why RandomX would even want to use these, given that
      they have a track record of feeling "nondeterministic" or "random".

- (2) The most common example is 0.1 + 0.2 != 0.3. This sets a lot of people
      off because this is just not what you should be expecting at all.

- (3) The easiest way to explain this is just that a floating point numbers
      make a tradeoff between performance and ease of use, over actually
      representing the numbers they represent.

- (4) Simplifying a lot, because of maths, representing an arbitrary real 
      number takes an infinite amount of space.
      
      If you imagine a number line, and pointed to a number on it, randomly,
      the chances that you can describe it in a finite amount of space is
      actually zero.

      We don't have an infinite amount of memory, so representing real numbers 
      exactly is just not possible and a tradeoff must be made

      IEEE754 double precision defines a 64 bit wide floating point number, so 
      there is only less than 2^64 possible numbers compared to the infinite 
      amount of real numbers.

- (5) We also have that the set of floating point doubles R contains positive 
      and negative infinity.

- (6) So to recap, ...

- (7) Because we reasonably lose out on the ability to represent an infinite amount
      of numbers, we don't have for example associativity, so the code on the left
      almost always returns false. The reason is because you're doing rounding at
      different stages. If you look on the right, and take that little circle
      function there to be rounding your numbers, the difference is pretty obvious.

- (8) But, I haven't actually addressed the elephant in the room, which is that
      programmers working with floating point numbers find it frustrating,
      inaccurate, and basically a random black box.

      If floating point feels inconsistent and like magic at times, why should
      RandomX rely on it to give consistent results?
*/
#slide(title: [(2.RX) IEEE754])[
  #uncoverb(2)[
    #list[0.1 + 0.2 = 0.30000000000000004 != 0.3 #l-m-meta[(?? wtf)]]
  ]

  #uncoverb(3)[
    - *IEEE754* makes a _tradeoff_. #uncoverb(4)[Define $Ru$ as set of _doubles_ without NaN. Then $|Ru| < 2^64$.]

      #uncoverb(5)[Define $RR^infinity = RR union { +infinity, -infinity}$, then $Ru subset RR^infinity$. #l-m-meta[(this is just ext. real NL.)]]
  ]

  #uncoverb(6)[
    #l-m-hr()

    *Result.* $Ru$ is a finite amount of useful numbers, with $plus.minus infinity$. #l-m-meta[(IEEE754)]
  ]

  #linebreak()

  #uncoverb(7)[
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

  #uncoverb(7)[
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

      REMARK correctly rounded, but sin cos arent!

      The 5 core operations of IEEE754 are defined this way, for example
      addition of x and y is just taking those two numbers, adding them
      as you would like real numbers, then rounding down which will basically
      crunch the number back to something within range that the double can
      actually represent.

- (3) There are actually 4 different ways to round a number so that it goes back
      into being a double. All of them are specified by IEEE, which are
      - round to nearest,
      - round towards negative infinity,
      - round towards positive infnity,
      - round towards zero.
      
- (4) If you do any of these primitive operations on floats, you can expect the
      CPU to round your numbers according to these 4 different rounding modes,
      which there is usually an inbuilt register inside your CPU to select a
      rounding mode globally, not per instruction.

      So, the RandomX "fprc" is an integer from 0-3 which stores the current
      rounding mode, and the floating point instructions defined a couple slides
      ago use the global rounding mode.

      CPUs already have these 4 rounding modes, and there is a lot of die space
      on them dedicated to performing the 5 operations with 4 types of rounding, so
      if RandomX only used round to nearest, it would be missing out on a lot a
      circuit space.

      Also the fact that fprc is global, it's not per instruction. So the CPUs
      have this internal register state which can be set to switch out
      entire circuits at runtime, which ASICs would need to add.

- (5) Now, an important thing to understand is that if you have any experience
      with programming languages like Python, JavaScript, or Rust, all of them
      only ever provide RN and most people don't think that the others exist,
      those other rounding modes are more fringe or low level.

      In JavaScript, you just can't get other rounding modes, and Python and
      Rust you need external bindings. In Rust, it's actually undefined 
      behaviour if you are to modify the global rounding mode, same in C without
      a pragma.
      
      This would be a problem if you are going to implement RandomX in most
      languages.

      So what you need to take away from this slide, is that floating point
      numbers are under IEEE754 are perfectly defined and portable, they just
      have a decent amount of internal machinery to do with rounding.
*/
#slide(title: [(2.RX) IEEE754])[
  #gh(height: 60%)[
    FP is perfectly specified, with $+$, $-$, $times$, $div$, $sqrt(x)$ *correctly rounded*. #l-m-meta[(IEEE754)]

    #uncoverb(2)[
      - $mono("fadd_0")(x, y) = RN(x + y)$, $mono("fsqrt_0")(x) = RN(sqrt(x))$, etc.
    ]

    #uncoverb(4)[
      #l-m-hr()

      Define $circle.small : RR^infinity -> Ru$ to be a function that rounds according to a #l-m-meta[(global)] fprc.

      - $"fadd"(x, y) = circle.small(x + y)$, $"fsqrt"(x) = circle.small(sqrt(x))$, etc.
    ]

    #v(1em)

    #uncover(5)[
      #figure[
        *All P/L give you $RN$ only.* \
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
- (1) To expand on this, these code snippets in C, JavaScript and Rust, it is always
      assumed or forced, to use RN behaviour. This is generally what you want for
      anything other than scientific libraries, so 99% of code out there. RN has a
      lot of nice properties over directed rounding like round up, round down, round
      towards zero, like you saw before. It accumulates less error and has less bias.

      Directed rounding is more of a low level thing, if IEEE754 decided to remove
      them from the standard we'd probably be fine.

- (2) If you actually want to use them, for example in C without invoking UB, you
      need to supply a pragma letting the compiler know not to optimise with the
      assumption that the only rounding mode would be round to nearest.

      So for the add function on the right, it has the semantics of using the actual
      dynamic rounding function which is decided by the FPU or whatever
      implementation of IEEE754 is in there.

      Remember, if RandomX only supported RN, then ASICs would be able to skip
      including all the circuits for the other 3 rounding modes that CPUs already
      have, avoiding a lot of complexity.

      RandomX doesn't want this, so it's included as an integral part of the VM
      execution model, switching between 4 rounding modes hundreds of times per
      program execution.
*/
#slide(title: [(2.RX) IEEE754 in P/L])[
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

*/
#slide(title: [(2.RX) Conclusion])[
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

#new-section-slide[(3.JS) RandomX.js]
