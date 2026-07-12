---
title: Creating A Compiler Part 1 - Stack Based Languages
description: Description of stack based languages and a basic overview of my first draft of the language
date: 2022-07-20
tags:
  - stas
  - V
  - Compiler
---

# Intro

There is something special about figuring out everything by yourself, just throwing yourself into the problem and tackling it one by one. Sure you could buy a course or follow a 3 hour long tutorial but that's no fun. Who needs best practices or proper conventions? Learning is your responsibility, and I'll do it my own way.

A compiler is something I've always wanted to make, it seemed like **THE** end goal for me. At the moment it's incredibly limited, expect multiple posts with me fleshing out the language and compiler!

Currently, the language uses NASM assembly as intermediate representation, to then later be compiled to the final executable. 

The first version of the language is very very simplistic. Supporting global and constant variables with string literals or unsigned 64 bit numbers. Builtin functions such as printing null terminated string pointers and printing unsigned numbers are implemented in assembly. Basic arithmetic is supported too. 

I've put a lot of work into making the compiler as clean and simple to understand as possible for this initial post. Here are some programs to show off its syntax!

> String literals boil down to a unsigned 64 bit value 
![](image-stacklang-strptr.png){.png-full}

> Support for basic math operations
![](image-stacklang-unsignedmath.png){.png-full}

Don't understand the syntax? It's not the conventional functions and arguments you've seen popularised by C. This is something completely different. **It's a stack based programming language.**

# Hold on, what is a stack based programming language?

To answer that question, I will first talk about the stack.

> The stack is one of the most important data structures in computer science. To understand how a stack works, think of a deck of playing cards that is face down. We can only easily access the card that is on top. When we want to look at the top card, there are two things we can do: we can peek at it, but leave it on the stack, or we can pop it off. When we pop off the top object, we are taking it off the stack. If we want to add another card to the top of the stack, we push.

[**Stack (data structure) - Simple English Wikipedia**](https://simple.wikipedia.org/wiki/Stack_(data_structure))

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```

   push 5            push 4 
   push 8    pop     push 9   
   
   └───>     └───>   └───>            
                               top
                              +---+
             top              | 9 |
            +---+             +---+ 
            | 8 |     top     | 4 |
            +---+    +---+    +---+ 
    top     | 5 |    | 5 |    | 5 | 
   +---+    +---+    +---+    +---+ 

```
:::::
::::: {.flex-columns-1}
The stack stores the current functions "stack frame", containing the locally scoped variables inside the function. Besides heap allocation with malloc in C or the "new" keyword in C++, the stack is incredibly fast to allocate and grows and shrinks with every function call and subsequent return.
:::::
::::::::::

When a stack based language calls a function, data is popped off the stack and the return value is pushed back onto it. Some stack-oriented languages operate in Reverse Polish notation. In Reverse Polish notation arguments for a command are stated before that command. For example, to add two numbers in a function it would be:

```
10, 25, add
```

To actually invoke add with the correct arguments, 10 and 25 would need to be pushed onto the stack and then the add function would consume exactly 2 values from it, returning the resulting single value to the stack. Arguments are passed to functions through the stack, and all operations involving data are simply stack manipulations in these languages.

This also has the side effect of making my language a concatenative languge too.

A sequence of operations in an applicative language like the following:
```
y = foo(x)
z = bar(y)
w = baz(z)
```
... is written in a concatenative language as a sequence of functions:
```
x foo bar baz
```

# Closing notes

Next post, I'll be talking about all the processes in a compiler and how dynamic code generation in my compiler works.

Right now, these have all been successfully implemented and will continue to be so:

- Null terminated string literals anywhere in the program
- Basic unsigned math and pointer arithmetic
- Constant variables and global variables
- Pushing and popping said global variables
- Printing strings and unsigned numbers
- No dependencies (libc included!), statically linked
- Built to run natively on POSIX OSes with a x86-64 cpu

These have yet to be added:

- Rewriting assembly builtin functions in the language (syscall keyword)
- Main entry point along with defining other functions
- Basic control flow with if statements and while loops
- Defining locally scoped stack variables inside functions
- Printf implementation
- Basic heap allocator?

See you in part two!

```
./compiler.sh -h

compiler 0.0.1 a23df55
-----------------------------------------------
Usage: compiler [options] [ARGS]

Compiler for an unknown, unnamed and unheard of stack based programming language

Options:
  -r, --run                 run program after compiling, then deletes
  -s, --show                open nasm assembly output in a bat process
  -o                        output to file (accepts *.asm, *.S, *.o, *)
  -g                        compile with debug symbols
  -v, --version             output version information and exit
  -d, --debug               run the compiler in debug mode
  -h, --help                display this help and exit
```

:::::::::: {.centre-text}

[**Check out the source code on github!**](https://github.com/l1mey112/stas)

::::::::::