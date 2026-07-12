---
title: Where Did All The Time Go?
date: 2025-12-14
description: Graduating from highschool, moving into university, presenting at UNSW.
tags:
  - WebAssembly
  - personal
  - Presentation
sources:
  - "@l-mdotdev YouTube Channel": https://www.youtube.com/\@l-mdotdev
  - l1mey112/experimental_compiler2: https://github.com/l1mey112/experimental_compiler2
  - l1mey112/randomx.js: https://github.com/l1mey112/randomx.js
  - l1mey112/l-m.dev: https://github.com/l1mey112/l-m.dev
embed: Zero to RandomX.js_ Bringing Webmining Back From The Grave - Linux Society UNSW 2025 - 0-12-49.png
---

It's been a while, really it's been ~2 years since I made my last blog post. Two whole years. You all really deserve an apology (I'm sorry!), though this post is really an explainer wrapping up everything that I did from 2024-2025.

# Highschool Years (streaming)

From the period of 2024-2025 I've been mostly radio silent, not updating my blog, letting all the links rot. For those of you who don't know, this blog, everything in it, was all written during my time as an (overconfident, annoying) highschooler.

If some people remember my last post, which was I admit a quick low effort post driven by the need to just post just about anything, it was about my first ever technical talk. It went about as you expected, and at that time I could already feel the steam running out.

So that was my last post. Really!

As soon as my second last year of highschool ended, I had a brief stint in 2024 as a streamer. At that time I was really inspired by Tsoding ([@TsodingDaily](https://www.youtube.com/@TsodingDaily)), and I guess I wanted a piece of that pie.

|                   |                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| October 18, 2023  | Blog post: [Present a talk in 5 days with no experience](https://l-m.dev/cs/presenting_syncs_talk)                                                                                                            |
| December 15, 2023 | Streaming begins on [l1mey112/experimental_compiler2](https://github.com/l1mey112/experimental_compiler2), named FPLC (functional programming language compiler).<br><br>![[Pasted image 20251214122521.png]] |
| February 23, 2024 | Last (real) stream ever.<br><br>![[Pasted image 20251214124610.png]]                                                                                                                                          |

It wasn't that bad! I managed to gain ~1790 subscribers at the time of checking.

![[Pasted image 20251214130137.png]]


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Now though, this is the last time my subscribers and members of my Discord would ever hear of me.

Not a single peep for two years. Now, I feel incredibly bad. I'm an asshole. But really life got in the way, I was dealing with a lot of personal stuff.

Since it was such a small channel with 2 years of inactivity, the people residing there probably don't care anymore.

If anyone from there is reading this, hopefully I can make it up in the future.
:::::
::::: {.flex-columns-1}
![[Pasted image 20251214133806.png]]
:::::
::::::::::


# Highschool Years (RandomX.js)

Well, during March to June I didn't really get up to much of note. Just sitting around in school messing around. I was working on ways to pirate music on spotify, and download a huge collection (I got up to 200 GiBs of OGG files). But, that's not too interesting, it never got anywhere.

![[Pasted image 20251214130858.png]]

**However,** my most ambitious and technically involved project to date was completed during the 2 month period around September. This was **RandomX.js**, getting the RandomX proof of work hash function working on Web-Standards JavaScript.

You can find it here [l1mey112/randomx.js](https://github.com/l1mey112/randomx.js). It includes implementations of efficient floating point emulation, ported cryptography to WASM SIMD, just in time code generators, all to become probably the SOTA among implementations trying to get web mining to work.

Now, the funny thing is, I had the idea for RandomX.js during my final exam period (Trials), and finished it before final exams (HSC) ended.

I really didn't care about my schooling, so much to the point where I was working on RandomX.js, showing up to my exams with zero study, completing them, coming back and working on RandomX.js.

The way Australian education works in your final year of highschool is that when time comes for you to go to university, you better have a good ATAR. It's just a number from 30-100 which indicates the percent-better you are compared to others. If you get a 90 ATAR, you're better than 90% of the nation.

So your ATAR/number that decides your fate is calculated from a final grade comprised of 50% of your internal schooling, and 50% of your mark in your HSC (big statewide final exam).

Let's just say I bombed out on that first 50%, and that last 50% I tried my absolute hardest. Things worked out in the end, I ended up with an 83 ATAR (which is terrible where I want to go, the minimum selection for the courses I wanted was 90), however UNSW (god bless them) had a portfolio entry which I applied with all of my previous work here and got in for a minimum selection of 80. Not bad, beat it by 3 points.

Moral of the story, don't do good in school, work on your personal projects.

# First University Year (volunteering, presentation)

There is a lot to say, but also there isn't a lot to say. I'll just say the medium amount.

I am being serious when I tell you that I showed up to one of my exams in highschool not knowing what the quadratic formula was, and have never used it before.

That needed to change. During my study for the HSC and during that purgatory period between highschool and university, for the first time, I studied mathematics and fell in love with proof.

As I got through the 1st year mandatory math courses for an engineering degree, I realised I liked maths more and more, and I've put in my request to transfer to a pure maths degree with computer science. Hopefully I can do some good with that knowledge.

You should expect to see a lot of formal verification, computerised theorem proving (namely Lean), and their intersection with compiler theory.

Other than that, I did a lot of volunteering at the Linux Society over there. I got to run presentations there, and did one of my own. I entered some programming competitions with them, won some. At the end of the day all I wanted was some friends and they delivered.

[
![[Zero to RandomX.js_ Bringing Webmining Back From The Grave - Linux Society UNSW 2025 - 0-12-49.png]]
](https://www.youtube.com/watch?v=gmAgvHaw9w4)

> *Zero to RandomX.js: Bringing Webmining Back From The Grave - Linux Society UNSW 2025*

I would create a full blog post about RandomX.js, but really this presentation should be all anyone could ever need. It's just about the interesting bits.

# Where To Now? (streaming, website)

I have a couple projects coming up right now, mainly to do with Lean, verification of optimisations in compilers, and maybe some other things do with this website, which I did redesign!

Hugo was a pain in the ass to use, so I replaced that pain in the ass with **my** pain the ass, which is Pandoc and Makefiles. See [l1mey112/l-m.dev/](https://github.com/l1mey112/l-m.dev). My old microblogging website `me.l-m.dev` is gone forever now. Unfortunately, it was just all too cringe to keep up (and I doubt it still compiles with the current V compiler). However, a part of it still exists with this blog and is implemented.

You can expect:

- Compilers/optimisations in Lean, streamed.
- More blog posts, when they come.
- Things to do with mathematics.

Thanks for sticking with me.
