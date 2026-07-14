#import "polylux/polylux.typ": *
#import "polylux/l-m.dev.typ": *

#set raw(tab-size: 4)
#show: metropolis-theme.with()
#set par(justify: true)

#let l-m-todo(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[TODO: ] #text(fill: l-m-meta-colour, body)]
#let l-m-tldr(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[tldr: ] #text(fill: l-m-meta-colour, body)]
#let span-sep(left, right) = box[#left #box(width: 1fr, repeat[#text(fill: l-m-meta-colour)[-]]) #right]

#let l-m-meta(body) = text(fill: l-m-meta-colour, body)

#let gc = block.with(
  width: 100%,
  height: 100%,
)

#title-slide({
  l-m-title("Introduction to RandomX, implementation of RandomX.js")
  linebreak()
  l-m-title("")
  l-m-hr()
  set text(size: 0.8em)
  text(fill: l-m-meta-colour, "Tuesday, October 3rd | Lecture Theatre 123 | 6 PM - 8 PM")
})

#slide(title: "About me")[
  - Liam, l-m, #underline[l-m.dev], #underline[l-m\@l-m.dev]
]

#focus-slide()[
  Let Me Paint A Picture. TODO change this
]

/*
*/
#slide(title: "What is Monero?")[
  - Introduce
]


/* TODO: Required knowledge
    - Hashes
*/
#new-section-slide[(POW.1) Proof-of-Work Consensus]

/*
- (1) To avoid stepping over eachothers toes and get the network ruined, transactions are processed at a
      set time interval.
- (2) All the blocks line up in a "chain" like a linked list, you don't want branches (<) where you can
      get into two states at once.
- (2) Now, they need to pick someone. And it needs to be exactly _one_ person (right?), so how is this done?
*/
#slide(title: "(1.POW) Block-Chain")[
  - Cryptocurrencies are a distributed system, and distributed systems need consensus.
  - These coins process transactions every "block time," which could be between 10 mins #text("(BTC)", fill: rgb("#f79413")), 2 minutes #text("(XMR)", rgb("#f26822")), 12 seconds #text("(ETH)", rgb("#8a93b2")), etc.

  #l-m-hr()

  #uncover(2)[
    - Every #text("2 minutes", rgb("#f26822")), someone needs to _mine_ a block, which contains all transactions since the previous block was mined.

    #set align(center)
    #set align(horizon)
    #image("pow.png", width: 80%)
  ]
]

/*
- (2) Before a block is mined, the network sets a new difficulty. In Monero's case, they want some amount
      of leading zeros after the result of a hash. Given that hashes are so random, you need to bash your
      head against the wall shooting energy into the wind.
- (3) Probabalistically, one person will win every block time. Immediately after a block is mined, a new
      difficulty and new hash is put up.
- (3) Only blocks that meet the difficulty are accepted, you're proving to the network that you spent
      energy and time getting this block in.
- (3) Note that this is just some hash, it could be anything. In Bitcoin's case for example, it's SHA-256.
*/
#slide(title: "(1.POW) Proof of Work (POW)")[
  #grid(columns: (auto, auto), gutter: 2em, gc[
    - We pick the person by making them _compete_ as miners.
    - How is this done? #uncover((2, 3))[*By making miners guess repeatedly.*]

    #uncover(3)[
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
- (1) ..., it just needs to be some amount of hard work, ...
- (2) It's just a bunch of bit-bashing. Taking data to a fixed length hash.
- (2) The hash function is just a slow black box, how bad could it be?
*/
#slide(title: "(1.POW) Case Study: SHA-256")[
  #grid(columns: (auto, auto), gutter: 2em, gc[
    - Since we can pick anything as the hash function, lets just do what #text("BTC", fill: rgb("#f79413")) does!

    #uncover(2)[
      #l-m-hr()
      
      - SHA256 is pretty simple!
      - It's super easy to run on a CPU, GPU, or even a physical circuit.
      
      - _How bad could it be?_
        #l-m-meta[(forshadowing)]
    ]
  ], gc[
    ```
    SHA256(bytes) {
    ... for each 512 bit chunk of bytes:

    for i in [0..64)
        S1 := (e >> 6) ⊕ (e >> 11) ⊕ (e >> 25)
        ch := (e ∧ f) ⊕ (~e ∧ g)
        temp1 := h + S1 + ch + k[i] + w[i]
        S0 := (a >> 2) ⊕ (a >> 13) ⊕ (a >> 22)
        maj := (a ∧ b) ⊕ (a ∧ c) ⊕ (b ∧ c)
        temp2 := S0 + maj

        ...
    }
    ```
  ])
]

#focus-slide()[
  How does this actually play out?
]

/*
- (3) You want to increase hashrate by absolutely any means necessary.
*/
#focus-slide()[
  #set text(fill: l-m-text-colour, size: 0.9em)
  
  1. Each hash is  a lottery ticket.
  #uncover((2, 3))[2. You want to be the quickest.]
  #uncover(3)[$⟹$ More H/s, more money.]
]

/*
- (2) Out of all possible devices that could mine, I'd say 95% of them are commodity CPU hardware.

- (4) As you go from CPU -> GPU -> ASIC, this represents an order of magnitude increase in the hashrate.
      However, it also represents an order of magnitude decrease in the generality of these machines.
      They get more specific, only work with certain hashes, only with a specific coin.

      The one thing I want you all to take away from this slide is just how powerful these ASICs are.
      You could get a 100 CPUs, and a mid range ASIC would beat them.

      Once ASICs start mining on your blockchain, it's over, throw out all of your CPU and GPU miners.
      ASICs become the only competitive way to mine.
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
- (2) We have that hashes equal votes. Your hashrate, the amount of hashes you can do in a second, or before
      the next block time, is your share in the control you have over the network.

      The more hashes, the higher chances it'll be your turn to mint a block and decide what transactions you
      want to process for the network.

- (3) If you control at least 51% of the possible hashrate out there, no one can stop you. It's like having
      51% equity, or 51% stock. When you mine new blocks, a malicious actor can stuff whatever they want in
      there, valid or invalid transations, and even rewrite history because they control more than 50% of
      validation power.

- (4) This is what would be called a "51% attack."
      You want the people to be in control of the network, where no single entitiy has a majority stake
      in the hashrate of the network.
      
      This is the founding idea behind cryptocurrencies by the way, it's a shame that most of them suffer
      from what comes next.
*/
#focus-slide()[
  #set text(fill: l-m-text-colour, size: 1em)

  #uncover((2, 3, 4))[
    #align([H/s $<==>$ votes])
  ]
  #uncover((3, 4))[
    #align([Control $>=$ 51% of H/s $==>$ #underline[*rewrite history*]])
  ]
  #uncover((4))[
    #l-m-meta()[(51% attack)]
  ]
]

/*
- (1) So, it's us against them, right?
- (2) For one of us, one of our commodity machines, we get vote.

      Even if everyone in this room brought all of their devices and chained them together and just started
      mining, we wouldn't beat a random person in Texas or China with cheap electricity and a couple ASICs.

      There is no winning that fight. One of them is a thousand of us.

- (3) Once ASICs become the only competitive way to mine, it's over for the for the average person trying
      to secure the network.
*/
#slide(
  title: [(1.POW) Case Study: Us against Them],
  inset: 1em,
  background: image("us-and-them.png", fit: "stretch", width: 100%, height: 100%),
)[
  #set align(top)

  #grid(columns: (auto, auto, auto), gutter: 1em, gc[
    #uncover((2, 3, 4))[
      *One CPU = one vote.*
      #l-m-hr()
    ]
    #uncover((3, 4))[
      - Once ASICs become the only competitive way to mine, it's over.

      - Network security is in jeopardy.
    ]
  ], gc[
    #uncover((2, 3, 4))[
      *One ASIC = 1000+ votes.*
      #l-m-hr()
    ]
    #uncover(4)[
      - You'd end up with a currency with all the control in the hands of a few people who can afford it.

      - In the long run, you're screwed!
    ]
  ])
]

/*
- (3) In a perfect world, everyone gets a fair shot. We want to reduce the chances of a single person
      having majority control over a cryptocurrency.
*/
#focus-slide()[
  #set text(fill: l-m-text-colour, size: 0.9em)
  
  _What did we learn?_

  #l-m-hr()

  #uncover((2, 3))[
    ASICs need to be banned by any means necessary, if we are to care about security.
  ]

  #uncover(3)[
    #l-m-meta[(promote egalitarian mining)]
  ]
]

#new-section-slide[(2.Rx) RandomX]

/*
- (2) That's the point right? That's why everyone has them. That's also why no one has an ASIC.
- (3) Essentially, this is specialisation. An ASIC is a perfect machine that executes only a
      specific task.

      Think of all the overhead a CPU needs to be general across all tasks?
*/
#slide(title: [(2.Rx) What is the problem with hashing?])[
  #grid(columns: (auto, auto, auto), gutter: 2em, gc[
    CPUs are general purpose processors, ASICs can only do one thing.

    #uncover((2, 3, 4))[
      CPUs are very efficient at executing arbitrary code!

      #l-m-meta[(That's the point, right?)]
    ]
    
  ], gc[
    #uncover((3, 4))[
      That is, $"CPU"("code", "data")$, but $"ASIC"("data")$. The code is frozen.

      #l-m-hr()

      #show math.equation: set text(1.1em)

      $
        "circuit" &= "freeze"(lambda x."CPU"("SHA-256", x)) \
        "ASIC"_"SHA-256" (b) &= "circuit"(b)
      $
    ]
    #uncover(4)[
      _How could we exploit this?_
    ]
  ])
]

/*
- (2) We want to create a hash function so general, that the perfect machine to calculate those hashes
      looks exactly like a CPU. Then, there is no advantage to using an ASIC.

      ...

      If we do this right, we solve our problem.
*/
#focus-slide()[
  What if executing arbitrary code was \
  integral to hashing?

  #set text(fill: l-m-text-colour, size: 0.6em)

  #uncover((2, 3))[
    #l-m-meta[
      (That is, $"HASH"("code", "data")$, instead of $"HASH"("data")$)
    ]
  ]

  #l-m-hr()

  #uncover(3)[
    Then, the CPU becomes this perfect machine. CPU = ASIC.
  ]
]

/*
- (3) By then, ASICs for cryptonight have already been created, so the switch was needed.
*/
#slide(title: [(2.Rx) RandomX])[

  RandomX is a proof-of-work algorithm that is optimized for general-purpose CPUs. It has stood the test of time as an *ASIC resistant* hash function.

  #uncover((2, 3))[
    On November 30th, 2019, Monero switched from its old POW algorithm, _cryptonight_, to RandomX. #uncover(3)[
      #text(fill: rgb("#f26822"))[Which had already been broken.]
    ]
  ]

  #uncover(3)[
    #l-m-hr()
    #quote[
      RandomX uses random code execution (hence the name) together with several memory-hard techniques to minimize the efficiency advantage of specialized hardware.
    ]
  ]
]
