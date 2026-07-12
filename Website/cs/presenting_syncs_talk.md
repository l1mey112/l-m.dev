---
title: Present a talk in 5 days with no experience
description: A Presentation at SYNCS, all about V. The workflow, process, routine, and execution.
date: 2023-10-18
sources:
  - YouTube/THE-TALK: https://www.youtube.com/watch?v=pchEsYwA74Q
  - SYNCS: https://syncs.org.au/
  - me.l-m.dev/Aftermath: https://me.l-m.dev/?p=1696372630##
  - Typst: https://typst.app/docs/
tags:
  - V
  - Compiler
  - Presentation
embed: image-syncs-talk-yt-real.png
embed_url: https://www.youtube.com/watch?v=pchEsYwA74Q
---

<!-- - Production ready presentation in 5 days
-  -->

<!-- how to create presentation! -->
<!-- not actually about the contents! remind that! -->

<!-- auto tracking camera system locked onto Thomas, whoops! -->
<!-- i meant so say V here instead of C++ -->
<!-- currently the coroutine threading model is a work in progress, the "go" keyword does not create stackless coroutines, and for now superseded by the "spawn" keyword for OS threads -->

<!-- Corresponding Article: .... -->

> **TLDR: Watch this, now!**

[
![](image-syncs-talk-yt-real.png){.png-full}
](https://www.youtube.com/watch?v=pchEsYwA74Q)

> *Read Fast, Write Fast, Run Faster: How To Maintain And Iterate With V - SYNCS 2023*

# You Reap What You Sow

I applied and got accepted to the computer science fellowship at the University of Sydney, learning INFO1110: Introduction to Programming, an undergraduate course. Cool course. It's deadbeat easy, but I love it there. Fun atmosphere, nice classes, and kind people.

Ive always wanted to present a talk, why not use my connections that I just got?

On the day of the orientation, **the absolute first day**, I asked if I could present a talk at USYD about V.

I presented them the equivalent of an *I-do-this*, then they forwarded me to the people at SYNCS, where I sent them a nice big email. You might ask, What is SYNCS?

> The Sydney Computing Society (SYNCS) is a student organisation that aims to provide an inclusive place for like-minded individuals interested in computing.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
They run talks, presentations, work with sponsors, internships, seminars, social nights, everything.

I they gave me the opportunity to do such. Following the paper trail of 33 emails, soon to be 34, here is the timeline on the right.
:::::
::::: {.flex-columns-1}
```
|  Date     |  Event                |
|  -------  |  -------------------  |
|  1 Aug    |  We have contact!     |
|  21 Aug   |  Pitch and Biography  |
|  28 Aug   |  Oct 3 Date Agreed    |
|  2 Oct    |  Zoom Discussion      |
|  3 Oct    |  The Big Day          |
```
:::::
::::::::::

---

![](image-syncs-talk.jpg){.png-full}

# How did I do it?

The (My) specifications for the talk are below:

1. **The talk goes for 1 hour, you are to speak for at least 45 minutes.**
1. **QnA and networking happens at the end.**
1. **Live up to expectations presented in your pitch.**

*Hey, Ive never done this before!*

**You gotta start somewhere, right?**

It's hard, you don't have someone behind you telling you exactly what needs to get done. I needed to figure this all out on my own. It's daunting, but I signed up for this. Eventually I got it done.

I say it's like riding a bike, you learn how to do it once, and you can do it again and again for the rest of your life. Make sure to bring water, or that said bike will shred your vocal cords. I feel like I can do another easily now that Ive done this one. **Because of this reason I'll probably come back next year.**

Ignore that though, this is about the *now*.

## Pre-Planning

<!-- The equivalent to my version of "taking notes" is sitting down with a calculator for three hours figuring out bullet trajectories, then peeking with a Negev. It's absolutely abhorrent how terrible my Obsidian folder was. That's just how I work though, I am too impatient to write stuff down, I just go and implement it immediately before I get distracted. -->

I like reducing **unknowns** to save time. I would much rather spend days researching prior art, taking notes, and testing in my head. Rarely do I make prototypes in the early stages. Creating a multiplayer game? Don't even touch the netcode till you've done an extensive code review of Quake 3, and read a million articles. (I did this sadly.)

**Do things once, and get it right that first time.** There's a reason why Ive been taking language design notes for **2 years** before attempting my own, but that's for another day.

Being my first ever talk I didn't know anything. However, I knew my limits.

I can't really trust myself to extrapolate something amazing from dot points on stage, I can't.

Solution? Create a script. This worked to my favour, the script was basically perfect, being refined over the course of a week. Go up there, recite the script like you've done before, and you're done. Easy.

At the end of the presentation I was told I was a pretty good speaker, but to elevate myself to excellent, I would need to do away with the script and focus way more towards the audience.

This makes sense, I am almost there, **I just need to take away the training wheels.**

Many thought Ive presented multiple times before, without a perfectly planned presentation and beaming confidence, I don't think I could have fooled them.

---

Sure, got it. Write a script and follow it.

## Put Into Practice?

What am I going to use to create the presentation?

Hah. Sorry, no drag and drop here. I am going to use **Typst** to type my talk.

:::::::::: {.centre-text}

https://typst.app/

::::::::::

I absolutely love Typst, it's not just extensible markup, it's a full blown turing complete programming language. I have nothing bad to say about Typst. They're built on the correct ideals, and the community is incredibly welcoming and helpful.

During the creation of this talk, Ive worked closely with the community wherever I am stuck. I am incredibly grateful for their help. Ive even been responsible for getting a couple bugs reported, one especially pertaining to sRGB colour representation. They were literally fixed before I could even finish the talk.

:::::::::: {.centre-text}

https://github.com/typst/typst/issues/1927

::::::::::
:::::::::: {.centre-text}

https://github.com/typst/typst/issues/2259

::::::::::

I won't go into more detail, just know that Ive imported entire CSVs of positional data, mapped a bunch of functions onto it, generated graphs directly from that data, and inserted directly into a science assignment along with the rest of the paper. It's an absolute lifesaver for getting things done quick.

Below is the average markup for a slide. It's literally just text interleaved with `#function-calls()`.

![](image-syncs-talk-markup-typst.png){.png-full}

You can see the script above the slide markup, it's wrapped in a comment. I love doing this, it keeps the script to the slide, and I can easily see what I am talking about.

![](image-syncs-talk-slide-1.png){.png-full}

Oh yeah, the slides look exactly like my website too. Another reason why I love Typst, it's just an preset made from the ground up with my personal style in mind.

<!-- i started ... and got typst and argh -->
<!-- school holidays started? okay lets play TF2 -->
<!-- okay what the fuck, talk about routine -->
<!-- ## The Nightmare Routine -->

<!-- talk about tips for future me -->
<!-- the stupid HTML markup -->
<!-- take a timelined approach? -->
<!-- mention how slides look like my website -->

## The Nightmare Routine

Picture this. Big exams are done, you're exhausted, school holidays just started.

It's August 22nd, the talk is in a little more than a week. **Time to play a shit ton of Stardew Valley and TF2.**

By the time I got around to it I had about 5 days of peak productivity.

![](image-syncs-talk-sched.png){.png-full}

You want to know what peak productivity is? Try this:

1. **Wake up at 8am.**
1. **Have nice breakfast and a black coffee.**
1. **Work until 12, midnight. That's 14 hours straight.**
1. **Go to bed and do it all again tomorrow, for 5 days.**

Yeah, never again.

## Actually Up There

Okay, reduce unknowns here:

1. **Do not bring a Linux or BSD based laptop, bring a fresh windows one.**
1. **Bring a copy of your talk and script seperately on a USB.**
1. **Ensure you know exactly how your presentation will be presented.**
1. **Come early, preferably an hour.**
1. **Practice, practice, practice.**
1. **Make sure you know how long your talk is beforehand.**
1. **Shit confidence. You know you can do it.**

Little things add up. Showing to the venue early was very much needed, we had to figure out the optimial recording method, and presentation strategy.

I am just presenting a PDF full of slides, not too hard, Firefox can do this. It does have a presentation mode, but it shows the mouse cursor everywhere. It was unwatchable at that point. Thank God for custom CSS, this saved me.

![](image-syncs-talk-cursor-css.png){.png-full}

I thank the Typst community for that one.

The SYNCS people were dumbfounded watching me open up inspect and just type this out, it was a pretty shitty solution, but is it bad if it works?

Anyway, stand up there, say your lines, finished. I don't know anything else to say, time passes and when the hour is up, regardless of what happens, it's said and done.

> first time for everything right?
> 
> --------- [me.l-m.dev](https://me.l-m.dev/?p=1696372630##) <span class=meta>#1696372630</span>

I can't wait to do this again. Goodbye.