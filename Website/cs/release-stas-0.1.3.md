---
title: Release Changelog - stas 0.1.3
description: Comptime is best time.
date: 2022-11-18
tags:
  - Assembly
  - stas
  - Compiler
---

> - Complete parser rewrite and cleanup. This allows for many improvements.
> - Constant variables can now be declared inside functions. They follow the same scoping rules as normal variables.
> - Variable declarations can now have a constant expression to denote It's size in memory.

It really did allow for a lot of improvements.

Constant variables can now be defined inside functions. In fact, their definition inside the compiler is entirely different.

When the compiler was originally written, constants were an afterthought. Thrown in there to make selfhosting the compiler easier. There were many limitations, one being that they didn't share the same definition as an automatic or buffer variable. They were also only able to be defined at the top level, like a global variable or function. Last but not least, parsing and evaluation of the actual expression was incredibly rigid and annoying.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
const b { 22 }

fn main {
	const a { b 11 + }
	{
        const a { 1 }
		auto c a
	}
    reserve BUFSIZE { 1024 8 * }
}
```
:::::
::::: {.flex-columns-1}
It's all different now. Constants can be defined inside functions, following the same scoping rules as everything else.

Since parsing a constant expression is incredibly simplified, straight down to a single void function, it can be used in variable declarations.
:::::
::::::::::

> - New 'sizeof' keyword for use with automatic and buffer variables. It also can be used inside constant expressions.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
There is now three keywords for operating on variables. Two are for popping and getting the address of automatic variables and one, released now, for getting the size in bytes of that variable.

Just like in a lot of programming languages. The 'sizeof' keyword works similar to a constant.
:::::
::::: {.flex-columns-1}
```stas
fn main {
    reserve A { 8 8 * }
    auto    B 8

    sizeof A 64 = assert
    sizeof B 64 = assert
}
```
:::::
::::::::::

> - Static assertions at the top level.

Assertions used to be evauluated statically inside the constant folding step. Once I realised that assert guards that should fail at runtime, failed at compile time, it was removed.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
```stas
reserve BUFSIZE { 1024 8 * }

assert { sizeof BUFSIZE 8192 = } -> 'maths brokey'
```
:::::
::::: {.flex-columns-1}
To use a static compile time assert, a constant expression must be provided and an optional message to pass on.
:::::
::::::::::

> - Constant folding is back in code generation. Was present in the V stas compiler, missing till now.
> - The 'noeval' function attribute to disable the constant folding behavior.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
Constant folding is pretty important in a compiler. It's the process of evaluating constant expressions at compile time rather than at runtime. It optimises constants that are right next to eachother on the stack.

Constant folding works between inlined functions, so It's a zero cost at runtime to call an inlined function that passes around constants or performs some arithmetic. For this example this function is marked so that it is not inlined.
:::::
::::: {.flex-columns-1}
```stas
- noinline
fn slurp 1 0 { drop }
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
fn main { 88 22 + slurp }
```
:::::
::::: {.flex-columns-1}
```nasm
mov rbx, 110
```
:::::
::::::::::

The 'noeval' function attribute will disable constant folding for a function. However when this is set inlined functions may also have their bodies unevaluated, as when inlined they are technically part of the parent function.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
- noeval

fn main { 88 22 + slurp }
```
:::::
::::: {.flex-columns-1}
```nasm
mov rbx, 88
mov rsi, 22
add rbx, rsi
```
:::::
::::::::::

> - '--trace-calls' compiler switch. The compiled executable will have function calls traced at runtime.

A part of the V compiler, it is barely used because of the useful stack traces It's compiler implementation provides. In stas, where function call backtraces aren't avaliable, It's super useful for tracking down the trace of function calls when something goes wrong. For example, some failed assertion.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
![](image-stas-0-1-3-trace-calls.png){.png-full}
:::::
::::: {.flex-columns-1}
```stas
; (ptr -- str len)
fn cstr_to_stastr 1 2 {
	0 assert -> 'unreachable'
	dup strlen ; (str len)
}
```
:::::
::::::::::


Well, you know where it is, but what called it? Just pass the switch to trace function calls...

![](image-stas-0-1-3-trace-calls-n.png){.png-full-75}

> - The layout in memory of 'auto' variables has been reversed to be in line with what would be assumed.

Stack variables are written to with values in the order they appear in, from the top of the stack to the bottom. They are taken off in reverse order when released back onto the stack. This seems logical, and when not revealed to the programmer, It's abstracted away.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
The keyword to access the address of the automatic variable is also used with pointer arithmetic to access individual values.

Strings are pushed onto the stack with the pointer first, then length. When written to an automatic variable in the old behavior, accessing the first field by It's percived address would return the length, when it should be the pointer.

The memory layout of auto variables has been reversed and is now correct.
:::::
::::: {.flex-columns-1}
```stas
fn main {
	auto str 2

	"hello" pop str

	addr str     r64 ; *char
	addr str 8 + r64 ; length
}
```
:::::
::::::::::

> - Improved error message for duplicate indentifiers.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Simple as that.

```stas
fn c { }

fn main {
	const c { 10 }
}
```
:::::
::::: {.flex-columns-2}
![](image-stas-0-1-3-duplicate-ident.png){.png-full}
:::::
::::::::::

> - Test runner written in V. The accompanying file, 'make_bootstrap.sh', calls test runner.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
![](image-stas-0-1-3-test-runner.png){.png-full}
:::::
::::: {.flex-columns-1}

A test runner is super important for interative development on anything, especially compilers.

A script file is ran before a compiler commit. It is used to build stas, run checks and save the bootstrap assembly to It's correct location.

The script also runs tests.

:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
![](image-stas-0-1-3-test-runner-1.png){.png-full}
:::::
::::: {.flex-columns-1}

I wrote something up super quickly.

It compiles and runs a program, captures It's output and compares it to an existing file containing the expected output. If the output doesn't match or the program fails to compile, the test fails.

:::::
::::::::::


> - Inline functions can now use the 'ret' keyword.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

This was a large optimisation.

The original implementation of the string comparison function in the standard library was as such.

It gets called a lot. 90% of all calls when compiling are 'streq'. But the problem here is, stas uses strings with a length. If the two strings length aren't equal just stop there and return false, else check It's content.

Not only it may have been too big to be inlined, the early return made it impossible.

:::::
::::: {.flex-columns-1}
```stas
; (str len str len -- bool)
fn streq 4 1 {
	over2 over != if {
		drop drop drop drop
        false ret	
	}
    drop swap ; (str str len)
    memeq
}
```
:::::
::::::::::

In the best case scenario the call should be inlined but the call to 'memeq', that compares It's content, should not.

With It's calls inlined, string operations have been way quicker.

```stas
} elif dup Inst.fn_leave = {
    r_flush

    inlined_count 0 > if {
        "	jmp " fwrite inlined_count early_ret_label label.ref.fwriteln
    } else {
        ir_data functions[] pop fn_c
        "	mov rbp, rsp"     fwriteln
        "	mov rsp, [_rs_p]" fwriteln
        fn_c rFunction.a_sp 0 > if {
            "	add rsp, " fwrite fn_c rFunction.a_sp fwriteuln
        }
        "	ret" fwriteln
    }
} elif dup Inst.fn_call = {
```

The code generator implements this, instead of the parser.

> - NASM bootstrap files have been included in the 'bootstrap/' folder.

Have NASM, not FASM? It's just how you would expect.

```sh
$ nasm bootstrap/x86-64_linux.nasm.asm -felf64 -o a.o
$ ld a.o -o a.out
$ ./a.out
```

> - String length is excluded from the 'push_str' instruction, with it being pushed separately.

:::::::::: {.flex-columns}
::::: {.flex-columns-2}
To take advantage of the constant folding/evaluation, the instruction to push a string in the stas IR is not overloaded to push the pointer and the length. Since the length is at the top of the stack when the string is pushed, it can be dropped off if needed for zero cost as the when constant folding takes place, pushing a number then dropping it off is essentially a noop.
:::::
::::: {.flex-columns-1}
```stas
fn main {
	"hello" drop slurp
}
```
```nasm
mov rbx, _s0
push rbx
```
:::::
::::::::::

> - 'continue' and 'break' keywords both raise unreachable code errors.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
![](image-stas-0-1-3-unreachables.png){.png-full}
:::::
::::: {.flex-columns-1}
```stas
include 'std.stas'

fn main {
	while false {
		break
		
		1 drop
	}
}
```
:::::
::::::::::

> - Bugfix: fix allocated registers leaking when performing operations with automatic variables.

The stas compiler uses a register allocator to figure out what registers to use. The allocator in the name 'register allocator', It's just like memory. Registers have to be freed when they aren't used anymore, if they are not? You'll run out of registers to use pretty quick.

When popping values off of the stack into an automatic variable, the return stack must be accessed and placed into a register, that's fine.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
But the registers used to write to the memory locations weren't actually being freed properly, unlike the register used to hold the return stack.

The expected behavior is shown on the right.
:::::
::::: {.flex-columns-1}
```stas
fn main {
	auto A 4

	1 2 3 4 pop A
}
```
:::::
::::: {.flex-columns-1}
```nasm
mov r9, qword [_rs_p]
mov qword [r9 + 24], r8
mov qword [r9 + 16], rdi
mov qword [r9 + 8], rsi
mov qword [r9 + 0], rbx
```
:::::
::::::::::

# End.

This release was super refreshing.

Inline assembly, C FFI, macro systems? Expect that and more in the coming future!