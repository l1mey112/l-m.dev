---
title: Intro To The stas Programming Language - Core Features
description: Learn how a stack works, math and stack operations, calling functions and basic control flow.
date: 2022-11-12
tags: [stas]
---

> - As of writing, stas is in version 0.1.2.

# Introduction To stas.

**Inspired by FORTH with a modern syntax, stas is a general purpose stack based programming language.**

Designed to be short and consise, programs written in stas take a concatenative form. A form where functions and operations mutate the stack in a pipeline where each output is anothers input. It is a typeless language, but still safe in the sense that all operations on stack are verified in multiple ways during compile time.

This is an introduction to the stas programming language. You will learn how a stack works, math and stack operations, calling functions and basic control flow. Enjoy!

# The main Function.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
All stas programs starts at the main function. Each function is denoted with the 'fn' keyword, then it's name.

After the name of the function, you have two options.
:::::
::::: {.flex-columns-1}
```stas
fn main 0 0 {
	;
}
```
:::::
::::: {.flex-columns-1}
```stas
fn main {
	;
}
```
:::::
::::::::::

All functions can accept and return arguments, this is expressed with two numbers. The argument count and the return count. If the function accepts zero values and returns zero values, the short form syntax can be used, omitting both numbers.

Small introduction over. If you've never heard of a stack, get ready.

# The Stack.

This is not a conventional programming language.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```c
2 + 4 + 8
```
```c
7 + 18 / 2
```
```c
9 * (1 + 22) / 3
```
:::::
::::: {.flex-columns-1}
On the left, is the conventional way to write infix based expressions. You are very likely to be used to this, for good reason.

On the right, is the way to write postfix based expressions. Both examples are equivalent, down to the order of evaluation.
:::::
::::: {.flex-columns-1}
```c
2 4 + 8 +
```
```c
7 18 2 / +
```
```c
9 1 22 + * 3 /
```
:::::
::::::::::

You can begin to see a pattern here. Instead of an operator with a left and right value, a binary expression, stack based languages construct expressions differently. Instead of a infix based expression, postfix expressions specify their operands before the operator.

Stack based programs manipulate data by utilising one or more values from atop the stack, and returning one or more values back atop the stack.


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
This analogy has been done to death, but nonetheless, here it is.

Think of a stack of plates. You can only operate on those plates but removing or adding upon the uppermost plate.

:::::
::::: {.flex-columns-1}
```
\_2_/    /-> \_7_/ >-\
\_7_/   /    \_2_/  \_9_/
\_5_/ \_5_/         \_5_/
\_2_/ \_2_/   add   \_2_/
\_8_/ \_8_/         \_8_/
```
:::::
::::::::::

With this knowledge, it's easy to construct chains of execution where values and operators manipulate the stack.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
  2
  2
  5
   +
  2
   /
   *
```
:::::
::::: {.flex-columns-4}
```
 1-3.                     5.                      7.
        \_2_/                   \_7_/           
 /-       +      -\       /-      /      -+-    \_3_/  
        \_5_/     |             \_2_/     |       *      -\
\_5_/                   \_2_/                   \_2_/     |
\_2_/     4.    \_7_/   \_7_/     6.    \_3_/           
\_2_/           \_2_/   \_2_/           \_2_/           \_6_/
```
:::::
::::::::::

# Shuffling The Stack.

Instead of performing arithmetic on the stack, what if you want to swap values around? Duplicate them? Drop them off the stack entirely? Ripped straight from FORTH, there are 7 operators to do exactly that.

The FORTH stack notation is used to describe the state of the stack after an operation. Placed in comments everywhere in the stas source code, it's simply for documentation. Learning it is vital to helping you with the rest of the tutorial.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
; ( before -- after )
```
:::::
::::: {.flex-columns-1}
The dash separates the things that should be on the stack from the things that will be left there afterwards.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
; ( num -- )
```
:::::
::::: {.flex-columns-1}
This comment describes an operation that accepts a value and returns nothing.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
; ( a b -- sum )
```
:::::
::::: {.flex-columns-1}
This could be the notation for the plus operator, adding two values on the stack and returning the sum.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
; ( a b -- b a )
```
:::::
::::: {.flex-columns-1}
This is the notation for an operator that swaps the two values on the stack.
:::::
::::::::::

With this, I can easily explain these built in operators.

```stas
drop  ; ( a       --         ) | drop a value off the stack
dup   ; ( a       -- a a     ) | duplicate the top value on the stack
over  ; ( a b     -- a b a   ) | duplicate the value behind the top value
over2 ; ( a b c   -- a b c a ) | duplicate the value 2 values behind the top value
swap  ; ( a b     -- b a     ) | swap two values on the stack
rot   ; ( a b c   -- c a b   ) | rotate 3 values, so that the top value is at end
rot4  ; ( a b c d -- d a b c ) | rotate 4 values
```

# The Concatenative Nature Of stas.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
A sequence of operations in an applicative language like C is as follows.

```c
int mul_8(int a) {
	return a * 8;	
}

int div_2(int a) {
	return a / 2;	
}

int add_3(int a) {
	return a + 3;	
}


void main() {
	int a = 99;
	a = div_2(a);
	a = div_2(a);
	a = add_3(a);
	a = mul_8(a);
}
```
:::::
::::: {.flex-columns-1}
And this is a sequence of operations in a concatenative language like stas.

```stas
fn mul_8 1 1 {
	8 *
}

fn div_2 1 1 {
	2 /
}

fn add_3 1 1 {
	3 +
}

fn main {
	99 div_2 div_2 add_3 mul_8
}
```

See how each output feeds the input of the next function? This is how concatenative languages work.

There is no such thing as a statement, only expressions. Expressions that manipulate the state of the stack.
:::::
::::::::::

# Bootstrap stas.

> - The stas compiler is written in itself. To avoid the chicken or the egg scenario, precompiled assembly files reside in the 'bootstrap/' directory.

Keep in mind, stas only supports x86-64 machines running the Linux kernel. Windows support will come with the introduction of FFI, to call the C library WinAPI.

First, clone the repository and change directory.

```bash
$ git clone https://github.com/l1mey112/stas && cd stas
```

Use FASM, the flat assembler, to compile the bootstrap source into your binary.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Don't have it? Download it from their [website.](https://flatassembler.net/)

I recommend to get it from your package manager.
:::::
::::: {.flex-columns-1}
```sh
$ pacman -S fasm
$ apt install fasm
```
:::::
::::::::::

```bash
$ fasm -m 1048576 bootstrap/x86-64_linux.fasm stas
```

That's it!

```bash
$ ./stas -h
```

Programs should be created and ran in the root directory of the stas repository as the standard library is located there.

# Optional: Visual Studio Code Extension.




:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Visual Studio Code users, There is an extension avaliable for stas!

The [Visual Studio Code extension](https://github.com/l1mey112/stas-vscode) supports syntax highlighting. Freely avaliable in the vscodium extension store, or download a copy from [open-vsx](https://open-vsx.org/extension/l-m/stas-vscode).
:::::
::::: {.flex-columns-2}
![](image-stas-guide-ext.png){.png-full}
:::::
::::::::::

# Hello world!

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
include 'std.stas'

fn main {
	"Hello world!\n" puts
}
```
:::::
::::: {.flex-columns-2}

The include keyword followed by path to a file, similar to '#include' in C, will dump the contents of that file into your own files.

String literals are a special case. They don't work how you would think, instead they push 2 values onto the stack. The lower value being a pointer to the start of the string and the higher value being the length of the string.

The 'puts' function accepts the string and it's length and prints it to stdout.

:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
"Hello world!\n" ; ( str len )
```
:::::
::::: {.flex-columns-1}
```stas
puts ; ( str len -- )
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
$ ./stas hello.stas
$ ./a.out
Hello world!
```
:::::
::::: {.flex-columns-1}
```
$ ./stas hello.stas -r
Hello world!
```
:::::
::::: {.flex-columns-1}

The default name for a generated executable is 'a.out'.

Passing the '-r' switch will cause the stas compiler to execute the file after compilation.

:::::
::::::::::

# Other Functions.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Here are some extra functions and their signatures for printing strings and numbers to stdout and stderr.

The exit function can be used to exit with a code, once called it will never return as the process will be killed.

```stas
puts    ; ( str len -- )
eputs   ; ( str len -- )

putu    ; ( num -- )
eputu   ; ( num -- )
putuln  ; ( num -- )
eputuln ; ( num -- )

exit    ; ( code -- )
```
:::::
::::: {.flex-columns-1}
```stas
include 'std.stas'

; ( -- n1 n2 n3 )
fn give_numbers 0 3 {
	2 1 8
}

fn main {
	give_numbers + swap - putuln ; 7
}
```
:::::
::::::::::

# All Arithmetic And Comparison Operators.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
; Arithmetic

+  ; ( a b -- sum )
-  ; ( a b -- sub )
*  ; ( a b -- mul )
/  ; ( a b -- div )
%  ; ( a b -- mod )
%% ; ( a b -- div mod )

; Increment and Decrement

-- ; ( a -- b )
++ ; ( a -- b )
```
:::::
::::: {.flex-columns-1}
```stas
; Bitwise Operators

<< ; ( a s -- shift-right )
>> ; ( a s -- shift-left  )

&  ; ( a b -- bits-and )
|  ; ( a b -- bits-or  )
^  ; ( a b -- bits-xor )
~  ; ( a   -- bits-not )

; Boolean

!  ; ( a -- bool-invert )
```
:::::
::::::::::

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```stas
; Comparision

=  ; ( a b -- equals?      )
!= ; ( a b -- not-equals?  )
>  ; ( a b -- gt?          )
<  ; ( a b -- lt?          )
>= ; ( a b -- gt-or-equal? )
<= ; ( a b -- lt-or-equal? )
```
:::::
::::: {.flex-columns-1}
```stas
; Signed Comparison

>s  ; ( a b -- signed-gt?          )
<s  ; ( a b -- signed-lt?          )
>=s ; ( a b -- signed-gt-or-equal? )
<=s ; ( a b -- signed-lt-or-equal? )
```
:::::
::::::::::

# Doing Something Useful With Control Flow.

**There is no turing completeness without loops and conditionals.**

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
include 'std.stas'

fn main {
	true if {
		"Value is true!\n" puts
	} else {
		"Value is false!\n" puts
	}
}
```
:::::
::::: {.flex-columns-1}
The most basic form of control flow is the If statement and like everything else, is in a postfix form.

The standard library defines two constants, 'true' and 'false'. They can be used with If statements.

Booleans in stas work just like booleans in C. Zero equals false, and any number other than zero is true.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
include 'std.stas'

; ( num -- num )
fn decrease 1 1 {
	dup 0 != if {
		dup putuln ; dup num to print
		; (num)
		-- decrease
	}
}

fn main {
	20 decrease drop
	; prints 20 to 1 inclusive
}
```
:::::
::::: {.flex-columns-1}
If you're a bit crafty, you can write conditional loops using this recursive calls.

This is perfectly valid. Even better if the function call is at the end of the function body, which in this example it is, as the function call can be entirely optimised out.

Notice the drop at the end? Stack counts are strictly checked and evaluated during compile time. If you leave unhandled values on the stack in a function that doesn't return anything, the compiler will ask you to handle them by doing more operations or dropping them off of the stack before a function return.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

```stas
include 'std.stas'

fn main {
	0
	while dup 10 < {
		; (idx)
		dup putuln

		++ ; increment idx to
		   ; avoid infinite loop
	}
	drop

	; ()
	; prints numbers 0 to 9 inclusive
}
```

:::::
::::: {.flex-columns-1}
The while loop, it's nothing new, but stas has a different way of handling it.

The index is pushed onto the stack at the start of the loop. A conditional clause at the top of the while loop determines if the loop will continue. When the conditional clause ends, it must leave one boolean value on the stack to consume.

Duplicating the index and comparing it to the max index is very similar to a C for loop of this layout.

```c
for (int a = 0 ; a < 10 ; a++);
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

```stas
include 'std.stas'

; ( num -- )
fn dum_num_print 1 0 {
	; (num)
	dup 0 = if {
		"Number is zero\n" puts
	} elif dup 1 = {
		"Number is one\n" puts
	} elif dup 2 = {
		"Number is two\n" puts
	} else {
		"Number unsupported\n" puts
	}
	drop
	
	; ()
}

fn main {
	2  dum_num_print
	0  dum_num_print
	99 dum_num_print
}
```
:::::
::::: {.flex-columns-1}

The 'elif' keyword is used to chain if statements. It is useless unless next to an If statement.

The constant duplication of the number seems pointless, but I urge you to look closer. If the first If case fails, how will the next one get it's value to compare?

```
$ ./stas dum_print.stas -r
Number is two
Number is zero
Number unsupported
```

Elifs can be chained to other Elifs, or end with an else case at the end.

To avoid unhandled values on the stack, drop the original number off of the stack after all branches.

:::::
::::::::::

# Putting It To The Test.

Lets create a function to sum all numbers from zero to ten.




:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
fn main {
	0 1 ; (sum idx)
	while dup 10 <= {
		; (sum idx)
	}
}
```
:::::
::::: {.flex-columns-1}
We need a way to store the total sum and also the current index in the loop.

The index should go first, because the while loop will inspect the top value on the stack.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
fn main {
	0 1 ; (sum idx)
	while dup 10 <= {
		; (sum idx)
		dup rot
		; (idx sum idx)
	}
}
```
:::::
::::: {.flex-columns-1}
Duplicating the current index and rotating it to the back of the stack will give us some space to add the index to the sum.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
fn main {
	0 1 ; (sum idx)
	while dup 10 <= {
		; (sum idx)
		dup rot
		; (idx sum idx)
		+ swap
		; (sum idx)
	}
}
```
:::::
::::: {.flex-columns-1}

Add the two values, the current index to the total sum. Then swap them, swapping the sum with the index allows the while loop to access the index on the next time around.

:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
fn main {
	0 1 ; (sum idx)
	while dup 10 <= {
		; (sum idx)
		dup rot
		; (idx sum idx)
		+ swap
		; (sum idx)
		++
	}
	drop
	; (sum)

	putuln
}
```
:::::
::::: {.flex-columns-1}

A while loop will just infinitely loop without updating the index. So now after the index has been moved to the top after the swap, increment it, closing off the loop.

When the while loop ends, the index and sum will be on the stack. The index will be first as it always on top outside of the while body, simply drop it off.

The remaining value is the sum, and you can just print it!

:::::
::::::::::

```
./stas add.stas -r  
55
```

# Closing.

stas is a fluctuating programming language, but it's core features are set in stone.

Any questions, queries, anything? Anything about this post that was hard to understand? Not clear enough? Contact me and I'll sort it out. Best way to do that? Github issue or an email, an issue is very much prefered.

The core features you learned about today, stack based programming, arithmetic on the stack, control flow, that's just scratching the surface. Global and local variables, constants and interfacing with OS were things left out in this one.

Until then, goodbye!