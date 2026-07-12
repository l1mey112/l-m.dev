---
title: Learning By Doing In C Finale - A Look Back
description: 
date: 2022-09-17
tags:
  - C
---

Figuring things out is therapeutic in a way. I've been working on these four projects for about a month and a bit in total, from the first commit on the first project to the time I am writing this.

C is simple but elegant, powerful language. It's why I love it so much. I've reached the limit where I actually look forward to and enjoy writing it, it's been my favorite language with good reason.

C++ in general is great, standard library? Not too much. One thing worse than writing C++ is writing C++ cope, sorry Rust. Python? Please, add a way to enforce the existing type system. If dynamic languages like Python contained an enforced type system, JITting or compiling outright would be so so simple. Writing Go? It's a bit of an identity crisis, compiling code for native speed but also including a garbage collector? No thank you, I'll take reference counting instead (I might do a piece on RC in the future). V? It's pretty good, very promising and extremely portable. It does take a bit more tweaking as it does contain an optional garbage collector (I am waiting for autofree's debut).

I love simplicity and control, C does that for me.

<!-- Learning it is not too hard, only 32 language keywords. Pointers aren't even that hard to understand, it's just the syntax for working with them that is awful to learn. C does not offer much in terms of it's standard library and such, but does it really have to? -->

Anyway, here are some core topics I have come to learn through these four projects!

# [Speeding Up malloc With Fixed Size Allocation (lmalloc)](/cs/learning_by_doing_in_c_part_1/)

- Slab Allocation
- Linked Lists
- Shared Libraries (.dll for WIN and .so for NIX)
- Replacing libc Functionality
- The 'mmap' system call

# [Huffman Coding and Dynamic Strings](/cs/learning_by_doing_in_c_part_2/)

- Dynamic Arrays
- Dynamic Bit Arrays
- Min Heap
- Binary Trees
- Serializing Data Structures
- Relative Pointers

# [HTTP Web Server In C With Sockets](/cs/learning_by_doing_in_c_part_3)

- The HTTP 1.0 Protocol
- POSIX Sockets
- Circular/Ring Buffers
- Event Loop Spawning Threads
- Thread Safe Functions With Mutexes
- Splitting By Delimiters In The String Library 
- 'sprintf' For A String Builder

# [Rendering The Mandelbrot Set Inside 16 Bit Bootsector Code](/cs/learning_by_doing_in_c_part_4/)

- 16 Bit Assembly And C Code
- BIOS Interrupts
- x86 Segmented Addressing
- Linker Scripts
- Extreme Compiler Optimisations
- Complete VGA Graphics Suite
- Floating Point Arithmetic On The x87 FPU
