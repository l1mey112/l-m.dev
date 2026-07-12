---
title: Release Changelog - stas 0.2.0
description: First Stable Major Release And FreeBSD Support!
date: 2022-12-02
tags:
  - Assembly
  - stas
  - Compiler
---

# Forward

This is the first stable release for the stas programming language. The language and compiler both have become stable and easier to use than ever. I feel that I have accomplished a huge undertaking that is nearing it's completion.

The development of stas will slow down from this point onward. Thank you for sticking around!

> - Native FreeBSD support.
> - FreeBSD is now a cross compilation target specified using the '-os' switch.
> - Compile time conditional compilation using the 'comptime' keyword.
> - '-os freebsd' declares 'TARGET_FREEBSD' and '-os linux' declares 'TARGET_LINUX'
> - '?def' keyword is used to check if a constant variable is declared.
> - All POSIX OS specific system calls and definitions are declared seamlessly using conditional compilation.

I have always been intrigued with BSD. I've heard amazing things, used OpenBSD on my servers, and so much more. After some time I made the spontaneous decision to move to wipe everything and move to FreeBSD on my laptop, which like my desktop, used Arch Linux.

The installation process was easy, the package manager is great, desktop support was dead simple, and support for stupid closed source drivers common on a ton of modern laptops was automatic. Encrypted ZFS as a root filesystem was also as easy as flipping a switch, whilst on Linux, is a fucking nightmare.

I wanted to use my laptop and my PC to do development with stas on both operating systems. At the start it was easy, FreeBSD has Linux binary compatiblity. It can detect Linux binaries from the ELF executable header, and do some kernel magic to make them run pretty flawlessly.

**I wanted to learn more about Unix based operating systems and POSIX APIs, so I decided to put work into supporting FreeBSD natively.**

FreeBSD is not Linux. Meaning that stas is completely incompatible from the start. FreeBSD uses completely different syscall numbers to Linux, different definitions of constants, and return values from system calls.

Not all is lost however, thanks to POSIX, Unix based operating systems must implement common APIs. POSIX does not mandate a common API at the syscall level, but a common C Library wrapping the system calls instead. Since libc is mostly a wrapper, calling the kernel with system calls, a large amount of system calls from operating system to operating system have the exact same functionality. Ninety percent of what stas needs to do is to swap out the OS specific syscall numbers before compilation. How would this be done?



:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

Simple, conditional compilation.

A ton of programming languages do it. Either using a preprocessor or being baked right into the language's AST.

I wanted to integrate stas's already strong compile time ecosystem by using constant variables and expressions to extend if statements into a compile time version using the 'comptime' keyword.

```stas
const false 0

fn main {
	comptime false if {
		"this will never be included!"
	}
}
```
:::::
::::: {.flex-columns-1}

```stas
comptime true if {

	fn function 0 2 {
		"this is true!"
	}

} else {

	fn function 0 2 {
		"this is false!"
	}

}
```

Comptime time if statements can isolate any type of code inside functions, or outside at the top level.

:::::
::::::::::


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```c
int main() {

#ifdef DEF_NO
	if (0) {
#else
	if (1) {
#endif
		return 1;
	};

	return 0;
}
```
:::::
::::: {.flex-columns-1}
Since they are a function of the parser, being are parsed exactly like a block of code, they must conform to stas scoping. Unlike stas, languages like C use a preprocessor working on the source code independently before passing it onto to later compiler stages.

Think of compile time Ifs just as they are, an if statement.
:::::
::::: {.flex-columns-1}
```stas
fn main {

comptime true if { ; ???
	0 if {         ; ???
} else {           ; ???
	1 if {         ; ???
}                  ; ???

		1 exit
	}              ; ???
	
}
```
:::::
::::::::::

A new keyword was added to complement this system. It works on constant variables only, and places on the stack a boolean based on if the constant variable refered to by the name coming after is defined or not.


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
It's works similar to keywords like 'sizeof', and can be used in many places.

Variable declarations, constant expressions, anywhere that accepts a constant value.
:::::
::::: {.flex-columns-1}
```stas
comptime { ?def DEF_CONST ! } if {
	const DEF_CONST 100
}
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

It can be used to pair with static assertions, allowing complex chains of execution all at compile time.

:::::
::::: {.flex-columns-2}
```stas
assert { ?def DEF_CONST } -> 'error: not defined'
```
```stas
const isdef ?def DEF_CONST
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
To tie it all up, the stas compiler defines certain constants before the parsing step based on the preferred compilation target. These can be used to implement OS specific functionality.
:::::
::::: {.flex-columns-2}
```stas
target_os OS.linux = if {
	"TARGET_LINUX" true parse.def_comptime_const
} elif target_os OS.freebsd = {
	"TARGET_FREEBSD" true parse.def_comptime_const
}
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
```stas
; ( 'char* filename' 'struct stat* statbuf' -- c )
fn lstat 2 1 {
	comptime ?def TARGET_LINUX if {
		sys_lstat syscall2
	}
	comptime ?def TARGET_FREEBSD if {
		AT_FDCWD rot AT_SYMLINK_NOFOLLOW fstatat
	}
}
```
:::::
::::: {.flex-columns-1}

The 'lstat' function uses conditional compilation to ensure compatibility.

The 'lstat' system call is deprecated inside FreeBSD. Inside the FreeBSD libc, it was implemented with the 'fstatat' system call with a few flags.

:::::
::::::::::

> - Basic C FFI interface using the cextern keyword. C FFI is limited to freestanding libraries.
> - '-c' switch to allow creation of object code only, for use with linking to C programs.

Supporting and linking with C libraries have not been a priority in stas, since native kernel calls indepentent to libc have been implemented fairly well. Nonetheless, I like C. So I did a limited implementation anyway.

The C programming language on all POSIX/Unix based operating systems use the System V application binary interface, or ABI.

An ABI defines how data structures and functions are layed out and accessed in machine code. They mandate a calling convention, a convention on how to to properly call functions and pass arguments.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
The calling convention for the SYSV ABI goes as such.

Argument one goes into the register RDI, argument two goes into the register RSI, and so on...

The return value of a function is placed in the RAX register, with 128 bit return values spanning across RAX and RDX.

:::::
::::: {.flex-columns-1}
1. Preseved by called C function
	- rbx, rsp, rbp, r12, r13, r14, r15
1. Destroyed by called C function
	- rax, rdi, rsi, rdx, rcx, r8, r9, r10, r11
1. Arguments to a C function
	- rdi, rsi, rdx, rcx, r8, r9, return in rax
:::::
::::::::::

See, quite simple right? Not.

Like all ABIs, the SYSV ABI is quite complicated once you step foot into struct territory. I didn't even get into floating point numbers, variable alignment in memory, implicit/hidden pointers to data, and arguments on the stack are all parts of the ABI overlooked in this implementation.

To avoid quadrupling the time spent on external C functions, I have omitted them.

**You can only call C functions with six or less integer only arguments with an integer only return value.**

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

The 'cextern' syntax is quite simple.

It uses the numbers 8, 16, 32 and 64 to denote the size of the argument with the arrow operator to denote where the arguments stop and return value begins.

:::::
::::: {.flex-columns-1}
```stas
cextern add_bytes 8 8 -> 8
cextern ret_none 64 32 -> void
cextern return_const -> 32
```

Functions that return nothing must use the word 'void' just like in C.
:::::
::::::::::

How do you use them? I'll show you.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Declare a C function.

```c
typedef unsigned long u64;

u64 addsome(u64 a, u64 b) {
	return a + b;
}
```
:::::
::::: {.flex-columns-1}
Then, define the C function externally.

```stas
cextern addsome 64 64 -> 64

fn function 0 1 {
	12 8 addsome
}
```
:::::
::::::::::

Then, run these commands.

```sh
stas main.stas -c -o main.o 
	# call stasc, then pass it `-c` to ensure that
	# only an object file will be built.

gcc cfile.c -c -o cfile.o -ffreestanding
	# call gcc with the C file, use the same `-c` switch
	# to make sure it stops after creation of the object file.
	# you MUST pass it `-ffreestanding` to forbid linking with
	# libc, as complex libraries cause errors and are not
	# supported yet.

ld cfile.o main.o -o a.out
	# call the linker with the two object files to create
	# the final executable.
```

> - Inline assembly.
> - 'syscall0' to 'syscall6' and '_breakpoint' keywords have been removed from stas, now implemented with inline assembly.

Inline assembly is a huge addition.

Personally, I did not like the the way system calls were implemented. They did not need to be a complete keyword on their own since they were such a simple implementation anyway.

Show, not tell.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
fn add_500 1 1 {
	asm "rdi" -> "rdi" {
		"add rdi, 500"
	}
}
```
```stas
fn syscall2 3 1 {
	asm "rdi" "rsi" "rax" -> "rax" {
		"syscall"
	}
}
```
:::::
::::: {.flex-columns-1}
```stas
fn addup_asm 1 1 {
	asm "rsi" -> "rax" {
		"	xor rax, rax"
		"loop_start:"
		"	test rsi, rsi"
		"	jz loop_leave"
		"	add rax, rsi"
		"	dec rsi"
		"	jmp loop_start"
		"loop_leave:"
	}
}
```
:::::
::::::::::


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```stas
fn dbg_breakpoint 1 1 {
	dup
	asm "rax" {
		"db 0xcc"
	}
}
```
:::::
::::: {.flex-columns-2}
The '_breakpoint' keyword is kind of useless now. Essentially a relic of old versions of stas.

It's implementation in inline assembly is on the left, placing the top value on the stack into the RAX register and moving on.
:::::
::::::::::

> - '-unsafe' compiler switch, currently only strips assertions.



:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
$ stas stas.stas -o - | wc -c
801700
$ stas stas.stas -unsafe -o - | wc -c
722799
```
:::::
::::: {.flex-columns-1}
May have more meaning in the future, but for now assertions are entirely stripped along with their fail message stored in the binary. Strips 77 KiBs from the stasc assembly, not too bad.
:::::
::::::::::

> - Pure functions using the const qualifier before a function declaration. Const functions can be used inside constant expressions and be evaluated at compile time.
> - Add -comptime-depth switch for limiting recursion when evaluating compile time constant functions, default is 12.

This really opens up stas's comptime capabilities. I have heard about pure functions from functional programming, then 'constexpr' functions from C++.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Adding pure functions stemmed from the need to use complex statements inside constant expressions.

```stas
const fn if_value 1 1 {
	if { 55 } else { 99 }
}

const true 1
const A { true if_value }
```

You cannot use If statements or while loops at all in a constant defintions. I wanted to add a type of function that could be used right inside constant expressions and be evaluated at compile time.

Accessing anything not known at compile time is forbidden inside constant functions, that means non constant global variables, calling non constant functions, and getting command line arguments.

While loops and If statements are supported here, but local variables are not.

:::::
::::: {.flex-columns-1}
```stas
const fn sumto10 0 1 {
	0 1
	while dup 10 <= {
		dup rot +
		swap ++
	}
	drop
}

const fn rot_sub_add 3 1 {
	rot - +
}

const A { 3 2 1 rot_sub_add }
const B { sumto10 }

assert { A 2 = }
assert { B 55 = }

fn main { }
```
:::::
::::::::::

> - Better inclusion/module system.
> - Files included with the 'include "file.stas"' will be searched for in the current directory of the current stas file.
> - Files included with the 'include <file.stas>' form will be searched for in the stas library folder, next to the stas compiler executable, located in 'lib/'.
> - Files may only be included once. Similar to '#pragma once'.

I'm going to be honest, a proper file inclusion system was an afterthought. Including the standard library was only possible whilst inside the reposiory directory. The paths in the standard library simply do not resolve when inside another directory.

:::::::::: {.flex-columns}
::::: {.flex-columns-2}
You can now include a core library that would reside inside the local stas repository, or a local one depending on syntax similar to C and C++.
:::::
::::: {.flex-columns-1}
```stas
include <lib.stas>
include 'rel.stas'
```
:::::
::::::::::

Consider a project directory like this.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```diff
exampleproject
├── main.stas
└── inc
    ├── lib2.stas
    └── lib.stas
```
:::::
::::: {.flex-columns-1}
```stas
; `main.stas`


include <std.stas>
include 'inc/lib.stas'
```
:::::
::::: {.flex-columns-1}
```stas
; `inc/lib.stas`



include 'lib2.stas'
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

The main file can refer to the standard library, 'std.stas', inside of the stas repository using an arrow bracket string. All paths inside arrow brackets will refer to the 'lib/' directory inside of the stas repository, this is where all core stas libraries will reside.

Inside of the folder 'inc/' in the example project directory, all inclusions made by files inside that directory will now refer to the places relative to that folder.

```stas
; `inc/lib.stas`

include 'inc/lib2.stas' ; no need!
```

This avoids having to write out a complete absolute path relative to your actual working directory.

:::::
::::: {.flex-columns-1}
```diff
stas
├── bootstrap
├── examples
├── tests
├── src
├── lib
│   ├── hash.stas
│   ├── rand.stas
│   ├── salloc.stas
│   ├── std.stas
│   ├── term.stas
│   └── stdlib
│       ├── ...
│       ├── ...
└── stas (executable)
```
:::::
::::::::::


Files can now never be included twice, serving the same purpose as include guards or '#pragma once', avoiding errors that may arise from duplicate definitions.

> - './stas symlink' sub command. Creates a symbolic link to the stas executable in '/usr/local/bin' to allow it to be invoked from anywhere.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}

Okay, you can now use stas without being anchored to the repository directory, but how do you call the stas compiler whilst not in that directory?

I can't lie, I took this from V.

The 'symlink' subcommand will create a symbolic link to a directory in your PATH. You can then invoke stas from anywhere!

:::::
::::: {.flex-columns-1}
```
$ doas|sudo ./stas symlink
$ stas -h
Linux stas 0.2.0 Copyright (C) .......
    ...............
    ...............
```
:::::
::::::::::

![](image-stas-0-2-0-eaccess.png){.png-full}

> - Wyrand PRNG is used for 'rand'. A 'hash' library is included to store Wyrand hash functions.
> - OS indepentent way to create localhost POSIX TCP sockets in the standard library.
> - Support for syscall 'errno' values and handling using the 'errno?' function.
> - Stack based allocation buffer now uses a static buffer.
> - Add functions inside the 'term.stas' library for colouring text.
> - Implementation many string manipulation functions inside the standard library.
> - Many OS independent functions for interfacing with child processes, files, file paths, file descriptors and more have been implemented.
> - 'execute_child?' 'get_executable_path' 'find_abs_path_of_executable?' and 'normalise_path' are among the many OS independent functions implemented.
> - Updated old APIs in the standard library to use the 'fn optional?' semantics.
> - Outdated examples have been updated to use OS independent APIs.
> - Many examples and tests cases have been added to the stas repository. Try some!

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
The standard library is has been extended greatly.

Most functions have been taken out of the compiler and generalised to be placed into the standard library. Old functions from the standard library that existed during the time when the compiler was being written have been updated to use newer semantics and error handling functions.

Working with file paths and the files themselves have been made way more accessible with the functions inside the standard library. Functions for finding the file paths of executable and executing them in a child process are included also.

Extra libraries that do not require the standard library have been moved to their own file. These include 'salloc', 'term', 'rand' and 'hash'.
:::::
::::: {.flex-columns-1}

Some examples and tests utilising the new functions are below.

- [abs_path.stas](https://github.com/l1mey112/stas/blob/master/examples/abs_path.stas)
- [child_process.stas](https://github.com/l1mey112/stas/blob/master/examples/child_process.stas)
- [PATH.stas](https://github.com/l1mey112/stas/blob/master/examples/PATH.stas)
- [normpath.stas](https://github.com/l1mey112/stas/blob/master/examples/normpath.stas)
- [errno.stas](https://github.com/l1mey112/stas/blob/master/examples/errno.stas)
- [tcp_sockets.stas](https://github.com/l1mey112/stas/blob/master/examples/tcp_sockets.stas)
- [terminal_colours.stas](https://github.com/l1mey112/stas/blob/master/examples/terminal_colours.stas)
- [rand.stas](https://github.com/l1mey112/stas/blob/master/examples/rand.stas)
- [tests/os.stas](https://github.com/l1mey112/stas/blob/master/tests/os.stas)
- [tests/strings.stas](https://github.com/l1mey112/stas/blob/master/tests/strings.stas)
:::::
::::::::::


> - Assembly files generated by the stas backend will reside in '/tmp/stas' as to not clog up your working directory.

A small change, but incredibly useful. If the folder does not exist, it will be created.

```
$ ls /tmp/stas        
addr.asm  a.o.asm  a.out.asm  char.asm  comptime.asm  inline_asm.asm  inline_ret....
$ du -sh /tmp/stas
936K    /tmp/stas
```

> - Bugfix: the linker is properly called when generating object files.
> - Bugfix: 'noreturn' based parser fixes.
> - Plus many undocumented bugfixes trailing along with commits.

What would a compiler be if it had a ton of bugs?

# The End

4 months and 2 weeks since the first ever commit. With development interleaved with school, the multiple rewrites and redesigns, I don't think that duration was indicative of how long it actually took.

[This commit](https://github.com/l1mey112/stas/commit/e282060) was the first commit of the stas that you know today.

1 month, 19 days. That is how long it took me to implement a decent optimising compiler and extensive programming language, with zero prior experience. I am proud.

Thank you.