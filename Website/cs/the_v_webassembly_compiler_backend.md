---
title: The V WebAssembly Compiler Backend
description: I guess they liked me enough to put me on the team.
date: 2023-02-26
tags:
  - V
  - Compiler
  - WebAssembly
sources:
  - WASI: https://wasi.dev/
  - Current WASI Docs: https://github.com/WebAssembly/WASI/tree/main/legacy
  - The Grand PR: https://github.com/vlang/v/pull/17368
  - Binaryen: https://github.com/WebAssembly/binaryen
---

# Intro Overview.

**Thanks to me, V can compile to WebAssembly natively!**

What does this mean for V?

A lot of things, actually.

- V can compile and run on the web unhindered. This means game engines, graphics, expensive computation.
- V has access to a large array of performant sandboxed native runtimes implementing the WASI standard.
- It just works!

## Try it!

When you see this, the pull request [`#17368`](https://github.com/vlang/v/pull/17368) would have hopefully been merged.

<strike>

1. Install `libbinaryen.so/dll`

    - Package manager. `pacman -S binaryen/emscripten`, pkg `binaryen` as a guide
    - All else fails + Windows? [Build From Source](https://github.com/WebAssembly/binaryen#visual-c)

</strike>

> (UPDATE) V can assist you in installing Binaryen using Binaryen's Github releases.
>
> Just run `v -b wasm file.v` and follow it's instructions!

1. Write some V code

```sh
$ v up # Update V
$ cat << EOF > test.v
fn adder(x int, y int) int {
    return x + y
}

fn main() {
    println(adder(10, 15))
}
EOF
$ v -b wasm test.v # Compile to `test.wasm`
$ wasmer test.wasm # WebAssembly runtime of choice
25
```

2. Check out some examples inside [`examples/wasm`](https://github.com/l1mey112/v/tree/wasmbackend/examples/wasm/)

The mandelbrot example inside [`examples/wasm/mandelbrot`](https://github.com/l1mey112/v/tree/wasmbackend/examples/wasm/mandelbrot) functions suprisingly well.

It uses the experimental browser mode, instead of WASI.

`v -b wasm -os browser mandelbrot.v`

Alex even tweeted about it during early development!

:::::::::: {.convo}
\[ **@v_language** \] [V programs can be compiled to WASM via Emscripten, but a native WASM backend is being developed by l-m: And it can already run Mandelbrot in the browser!](https://twitter.com/v_language/status/1626234615945125888)
::::::::::

## Current State And Details.

The WebAssembly compiler backend for V implements two different modes, `wasi` and `browser`.

- `v -b wasm -os wasi`
- `v -b wasm -os browser`

The default mode of compilation is `wasi`, the WebAssembly System Interface. The `wasi` spec implements many WebAssembly "system calls". It will be comparable to a native program. The entirely of libc will be implemented, and a program compiled with `wasi` will be equal to a program compiled with `cgen`.

The `browser` target will be a full WebAssembly framework, like Emscripten. declare JavaScript functions inside V, access the DOM and canvas. It will also generate JS files and optionally HTML. `v run` should start up a web server and open a webpage to invoke your WebAssembly code, like `emrun` from Emscripten.

Development on the wasi target will be my core goal. Since code can be run locally without a JavaScript or browser dependency it’s easier to iterate and test on.

The current `browser` mode is a stub implementation while a proper runtime JS libary will be implemented.

Read the pull request [`#17368`](https://github.com/vlang/v/pull/17368) for more details.

To follow development closely go to the `#wasm-backend` channel on the [V discord server!](https://discord.gg/vlang) I am quite active there and will consistently post updates when they come.

# Where It All Started.

I looked into WebAssembly. It had insane potential.

As I understood it...

- A low level, universal bytecode format? (That is also not Java)
- Targetable by other programming languages?
- Integrates and runs on the web with ease?
- Can run natively with WASI?
- Secure and sandboxed with speed?
- Standardised?
- Large community?

... I was surprised.

There is a lot of things I could say about WebAssembly. Good things.

So, I started searching on how I could get started.

## Binaryen

**Binaryen is a compiler and toolchain infrastructure library for WebAssembly, written in C++. It aims to make compiling to WebAssembly easy, fast, and effective.**

Think of it like an alternative to LLVM, but for WebAssembly only.

The C API can be used to build up an expression tree, and it's IR maps pretty closely to WebAssembly.

Take this C code...

```c
BinaryenModuleRef module = BinaryenModuleCreate();

BinaryenType ii[2] = {BinaryenTypeInt32(), BinaryenTypeInt32()}
BinaryenType params = BinaryenTypeCreate(ii, 2);
BinaryenType results = BinaryenTypeInt32();

BinaryenFunctionRef function =
    BinaryenAddFunction(module, "adder", params, results, NULL, 0, 
        BinaryenBinary(module, BinaryenAddInt32(), 
        BinaryenLocalGet(module, 0, BinaryenTypeInt32()), 
        BinaryenLocalGet(module, 1, BinaryenTypeInt32())));

BinaryenModulePrint(module);
```

... and it's WebAssembly output.

```wast
(module ;; BinaryenModuleRef module = BinaryenModuleCreate();
 (type $i32_i32_=>_i32 (func (param i32 i32) (result i32)))
 ;; BinaryenAddFunction(module, "adder", params, results, NULL, 0, 
 (func $adder (param $0 i32) (param $1 i32) (result i32)
  ;; BinaryenBinary(module, BinaryenAddInt32(),
  (i32.add
   ;; BinaryenLocalGet(module, 0, BinaryenTypeInt32())
   (local.get $0)
   ;; BinaryenLocalGet(module, 1, BinaryenTypeInt32())
   (local.get $1)
  )
 )
)
```

1. Binaryen has a simple **stable** C API in a single header, and can also be used from JavaScript.
1. Binaryen can be used for completely parallel codegen and optimisation, as it is designed that way.
1. Binaryen's optimiser has many, many optional passes that can improve code size and speed. It applies many agressive optimisations which make Binaryen powerful enough to be used as a compiler backend by itself.

## Binaryen V Wrapper

I realised early on that a V wrapper needed to be created.

- [`l1mey112/binaryen`](https://github.com/l1mey112/binaryen-v)

I created it using `c2v`, pushed some changes in the pull request [`#17125`](https://github.com/vlang/v/pull/17125) to allow `[c:'cname']` function attributes inside the compiler without a translated flag. Then, it could be used perfectly!

At this point, I did not know I wanted to create a V backend utilising Binaryen.

I asked around in the community for what they would prefer in a native WASM backend.

They weren't too turned off with the idea, a native WebAssembly backend would be pretty welcome.

So, I started work.

## Early Beginnings

:::::::::: {.convo}
\[ **l-m** \] [**01/28/2023**]{.meta} progress being made on the wasm backend using binaryen
::::::::::

<br>

![](image-wasm-backend-story-1.png){.png-full}

:::::::::: {.convo}
\[ **l-m** \] [**01/30/2023**]{.meta} milestone crushed! compilation and execution of math.powi straight to webassembly
::::::::::

<br>

![](image-wasm-backend-story-2.png){.png-full}

:::::::::: {.convo}
\[ **l-m** \] [**01/30/2023**]{.meta} works like a charm
::::::::::

<br>

![](image-wasm-backend-story-3.png){.png-full}

:::::::::: {.convo}
\[ **Alex M** \] [**01/30/2023**]{.meta} great work @l-m !
::::::::::

---

<!--

{{< convo "l-m" "02/08/2023" >}}
i have large ambitions for the wasm backend, a proper self contained toolkit for compiling an entire V application to webassembly. here is the current roadmap:

personally, i dislike compiler builtins. eventually, to fully complete the webassembly backend, asm wasm {} using inline assembly would be implemented parsing a WAT-like syntax
{{< /convo >}}

{{< convo "l-m" "02/09/2023" >}}
a basic implementation of structures is all done
{{< /convo >}}

{{< convo "l-m" "02/15/2023" >}}
- \[x] stack pointer and structures
- \[x] internal abstraction around all variables
im ahead of native in the AA{b: BB{}} (assigning structs to fields of structs) and the val.b.b (chained ast.SelectionExpr) department
{{< /convo >}}

{{< convo "l-m" "02/16/2023" >}}
the WebAssembly code generated by the V backend can call into javascript functions that are prefixed with a JS
you can declare a function like this...

```v
fn JS.external_add(a int, b int) int
```

then pass the javascript function to the WebAssembly module!

```js
const env = {
    external_add: function(a, b) {
        return a + b;
    }
}

WebAssembly.instantiateStreaming(..., {env: env});
```
{{< /convo >}}
-->


:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```v
pub fn factorial(n i64) i64 {
    if n == 0 {
            return 1
    }
    return n * factorial(n - 1)
}
```
:::::
::::: {.flex-columns-1}
At this stage the current WebAssembly backend could only compile simple programs, with no `builtin` library.

Simple float and integer arithmetic were supported in it's entirety.
:::::
::::::::::

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```wast
(func $main.factorial (type $i64_=>_i64) 
 (param $0 i64) (result i64)
 local.get $0
 i64.eqz
 if
  i64.const 1
  return
 end
 local.get $0
 i64.const 1
 i64.sub
 call $main.factorial
 local.get $0
 i64.mul
)
```
:::::
::::: {.flex-columns-1}
Structures, stack allocations, `println`, `panic`, strings?

Not implemented at this point. I was new to backend creation and WebAssembly in general. But the more I explored Binaryen's C API, the further I got.

This was the point where I realised that focusing my development effort on WASI, instead of a browser target would be a much better use of my time. Better to test and no browser or JavaScript dependency.
:::::
::::::::::

## WASI support

> If WASM+WASI existed in 2008, we wouldn't have needed to created Docker. That's how important it is. Webassembly on the server is the future of computing. A standardized system interface was the missing link. Let's hope WASI is up to the task!
>>>>> Solomon Hykes, founder of Docker.

Completely containerised sandboxed applications running at native speed, that's Docker.

**But that's also WebAssembly.**

<!-- WebAssembly is designed to run well on the Web, but not limited to -->

WASI, The WebAssembly System Interface, is a modular system interface for WebAssembly. Think of them as a standardised list of "system calls", an API, providing native POSIX-like functionality for WebAssembly.

Want to write to `stdout`?

Simple, on POSIX like kernels (Linux, Unix, BSD...) the `write` system call is used to write to a file descriptor.

WASI takes a different but also similar approach.

```v
fn C.write(fd int, buf voidptr, count usize) usize

val := "hello"
C.write(1, val.str, val.len)
```

Each standard of the WASI interface is separated into different import namespaces.

I am importing API functions from the `wasi_snapshot_preview1` namespace. The WebAssembly runtime will notice this and provide the needed functionality.

```v
type Errno = u16

struct CIOVec {
	buf &u8
	len usize
}

[wasm_import_namespace: wasi_snapshot_preview1]
fn WASM.fd_write(fd int, iovs &CIOVec, iovs_len usize, retptr &usize) Errno
```

As always, V function interop has been done with a language prefix.

- `C.function`, `JS.function`, `WASM.function`

The function declaration using the `WASM` prefix boils down to this WebAssembly below.

```wast
(import "wasi_snapshot_preview1" "fd_write" (func $WASM.fd_write (param i32 i32 i32 i32) (result i32)))
```

It can then be called like a normal V function.

The `fd_write` WASI function takes an array of I/O vectors containing the data to be written.

It's similar to the POSIX `writev` C function.

```v
val := "hello"

vec := CIOVec{val.str, usize(val.len)}

WASM.fd_write(1, &vec, 1, -1)
```

---

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
The builtin function `println` is implemented this way, with an array of two stack allocated I/O vectors.

One vector storing the data to be written, another with the newline. It's a much nicer implementation compared to the C version, in which an entirely new string needs to be allocated containing the string and newline.

`fd_write` with N amount of I/O vectors results in only one write system call, which is perfect.
:::::
::::: {.flex-columns-1}
```v
module builtin

pub fn println(s string) {
	elm := [CIOVec{
		buf: s.str
		len: usize(s.len)
	}, CIOVec{
		buf: c'\n'
		len: 1
	}]!

	WASM.fd_write(1, &elm[0], 2, -1)
}
```
:::::
::::::::::

# What Is And Isn't Possible?

**The WebAssembly backend is NEW, very very new.**

I am a one man team and I assume will be the lead on most future updates.

I'll get a couple things out of the way.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
These built in constructs to the V programming language are not supported yet.

1. Interfaces
1. Sum Types
1. Generics
1. Dynamic Arrays
1. Maps
1. String Interpolation
1. Auto String Methods For User Types
:::::
::::: {.flex-columns-1}
These are.

1. Methods
1. Aliases
1. Structures
1. Fixed Arrays
1. Strings
1. Integers And Booleans To Strings
1. `print` and `panic`
1. Dummy `malloc` implementation
:::::
::::::::::

Hey, that's not too bad?

Plus, things such as dynamic arrays, string interpolation and maps can be easily implemented with just a little time. The infrastructure to implement these features is already in place.

**I would say, this backend is comparable if not exceeds the capabilities of the current `native` backend.**

There isn't much documentation, but that will come soon(ish).

**So, give it a go!**

I'll be reading your issues with care, because....

## I'm on the team!

I've been in the V community and used this language for fun for a while now, so it's about time i give back.

I guess they liked me enough to put me on there.

![](image-wasmbackend-github.png){.png-full-75}

I'll see myself out. Thank you for reading!