---
title: Three Undocumented Projects And The Three Month Hiatus
description: The WebAssembly Backend Rewrite + Year 11 Physics, Applied + me.l-m.dev
date: 2023-06-29
tags:
  - WebAssembly
  - V
  - Compiler
  - C
  - Simulation
sources:
  - l1mey112/v: https://github.com/l1mey112/v/tree/wasmbackendedtwo
  - wasm vlib docs: https://modules.vlang.io/wasm.html
  - "Year 11 Physics, Applied": https://l-m.dev/physics-applied
  - me.l-m.dev: https://me.l-m.dev/
---

<!--
```
git log --author=l1mey112 --first-parent --format="%ad %s" --date=short --reverse wasmbackendedtwo | bat
```
-->

:::::::::: {.flex-columns}
::::: {.flex-columns-1}

You know how long ago this was?

Three months too long.

A lot has happened that's gone completely undocumented, I am here to clear that up.
:::::
::::: {.flex-columns-1}
```
The V WebAssembly Compiler Backend

Feb 26, 2023 | 1615 words | ~8 minute read
[ V ] [ Compiler Theory ] [ WebAssembly ]
```
:::::
::::::::::

<!-- I am not the busy person I make myself out to be. -->
<!-- The huge projects -->

That post was created at the start of the school year. I am now halfway through the year and on break.

During that time I have been working on three large projects.

Excuse for not documenting them on the blog? **Pure laziness.**

## Not Exactly

The real reason was a combination of school and developer productivity. I don't have much time to work on projects, so I ship them as fast as I can during the time where I can.

I work pretty fast, and use up the time I have, so the blog then gets ignored.

Decent excuse? Forgive me? You're in luck, I have a lot in store for you.

# The V WebAssembly Backend Rewrite

This I am proud of.

![](image-wasmbackend-announce.png){.png-full}

I'll break it down for you.

1. The WebAssembly backend depends on Binaryen. Binaryen is an absolute nightmare to package and distribute to users of V. The issue was the C++ dependancy, not everyone has the latest version of `libstdc++`, especially people using LTS Linux distributions and Windows.

1. Code Generation was a mess. Not all of it, I'll give myself credit there, just the code dealing with memory locations and stack frames. It was the result of wishful premature optimisation, and I have found and implemented a better solution.

1. The ability to generate WebAssembly code should not be limited to the compiler only. Expose the ability to generate WebAssembly code to the standard library! I was a little annoyed that the `native` backend didn't do this, I would have loved to build in-memory JIT compilers. `import wasm` is a MUST.

## Solution?

1. Read through the entire WebAssembly binary specification, implement a nice API to generate WebAssembly modules from V.

1. Rip out Binayen and rewrite Code Generation. I saw myself rewriting a very large chunk of it, cleaning up the code along the way.

1. Finish?

I'll get to number 3 at the end.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
This is `import wasm`, it is in the V standard library.

It's a full implementation of the WebAssembly binary format MVP.

The library is designed as a pure V alternative to Binaryen.

```
$ wasm-validate num.wasm; echo $?
0
```

It's fairly complex, whilst it's API is simple.
:::::
::::: {.flex-columns-1}
```v
import wasm
import os

mut m := wasm.Module{}
mut f := m.new_function('num', [], [.i32_t])
{
	f.i32_const(10) // | i32.const 10
	f.i32_const(15) // | i32.const 15
	f.add(.i32_t)   // | i32.add
}
m.commit(f, true) // export: true
os.write_file_array('num.wasm', m.compile())!
```
:::::
::::::::::

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
Using the interface, you can easily write compilers that generate WebAssembly on demand.

This example generates a binary importing functions from the WASI namespace, then calling them.
:::::
::::: {.flex-columns-1}
```sh
$ cd v
$ v run examples/wasm_codegen/hello_wasi.v \
	| wasmer run /dev/stdin
Hello, WASI!
```
:::::
::::::::::

[I won't get too far into this, you can read the docs yourself.](https://modules.vlang.io/wasm.html)

Another reason why I won't go further will be explained shortly.

## The Backend Rewrite.

<!-- :::::::::: {.flex-columns}
::::: {.flex-columns-1}
```sh
./v -b wasm -g a.v -o - | wasm-dis -
```
:::::
::::: {.flex-columns-1}
```wat
(func $main.test
 (param $a<int> i32)
 (param $b<int> i32)
 (result i32)
 (local $c<int> i32)
 
 (local.set $a<int>
  (i32.add
   (local.get $a<int>)
   (local.get $b<int>)
  )
 )
 (i32.add
  (local.get $a<int>)
  (i32.const 10)
 )
)
```
:::::
:::::::::: -->

When I was initially writing the WebAssembly backend, it was my introduction to code generation for a compiler as a WHOLE. I personally did not have as much experience back then as I did now.

To understand the structure of a typical compiler backend, I combed through the source code of V's native ARM and x86_64 backend. This gave me a lot of pointers, one being the inspiration for the representation of a memory location.

```v
// variables, very VERY similar to the native backend
type Var = Global | Stack | Temporary | ast.Ident

// representing a memory location, pointer or variable
// this is the primary interface
type LocalOrPointer = Var | binaryen.Expression
```

A common pattern inside the native backend would be to take an `ast.Ident` from an expression, and convert it to one variant of a `Global | Stack | ...` sumtype.

WebAssembly has a notion of locals, think of them as an infinite amount of CPU registers you can use freely.

Unlike CPU registers, WebAssembly locals aren't volitile at all. They don't get overwritten. I am not taking full advantage of this with that design.

How well this works for `native` is debatable, but for WebAssembly we can do better and simpler.

```v
struct Var {
	name       string   // if applicable, used in debuginfo
mut:
	typ        ast.Type
	is_address bool     // complex flag, is_not_value_type essentially
	is_global  bool
	idx        int      // wasm.LocalIndex | wasm.GlobalIndex
	offset     int      // pointer offset
}
```

Two major things here. The fields `is_address` and `offset`.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
The `is_address` field is a special flag.

```v
Var{ is_address: !g.is_pure_type(typ) }
```

In short, value types that can be stored in a register are pure types, with some exceptions. It all comes down to the custom ABI, and how values are passed from function to function.

Passing a `struct` obviously cannot fit into a WebAssembly local, you must pass a pointer into the callee's stack frame.

The `is_address` flag ensures you know how to store the value if it were to be cloned, passed around, dereferenced, and so on.
:::::
::::: {.flex-columns-1}
```v
// is_pure_type(voidptr) == true
// is_pure_type(&Struct) == false
fn (g Gen) is_pure_type(typ ast.Type) bool {
	if typ.is_pure_int()
		|| typ.is_pure_float()
		|| typ == ast.char_type_idx
		|| typ.is_real_pointer()
		|| typ.is_bool() {
		return true
	}
	ts := g.table.sym(typ)
	if ts.info is ast.Alias {
		ptyp := ts.info.parent_type
		return g.is_pure_type(ptyp)
	}
	return false
}
```
:::::
::::::::::

It's much better than the `Global | Stack | Temporary | binaryen.Expression` distinction, that was entirely a wishful premature optimisation.

---

The field `offset` is very nice to have. Why create a new local which is just the offset of another one?

The ability to reuse existing locals is very important and avoids waste.

This fits in very well with the stack offsets from the base pointer `__vbp`.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```v
struct AA { a int b int c int d int }

fn test() {
	a := AA{}
	b := AA{}
}
```
:::::
::::: {.flex-columns-1}
One WebAssembly local, three memory locations.
```v
Var{ name: '__vbp', idx: 0             }
Var{ name: 'a<AA>', idx: 0, offset: 0  }
Var{ name: 'b<AA>', idx: 0, offset: 16 }
```
:::::
::::::::::


## Where To From Here?

[Read the open message and more here.](https://me.l-m.dev/?meta=1687823676) (What website is this?? Keep reading.)

Want more exposition? Join the [V discord](https://discord.gg/vlang) and visit `#wasm-backend`.

The current status of the rewrite is as such. It generates invalid code for expression block statements such as If expressions, and certain parts of it's design must be changed.

For a month or so back then, I've been stringing the V community along with updates. There has been less and less updates due to school and such, so I've halted progress on the rewrite until now.

It's time to show something new.

# Year 11 Physics, Applied. [[+]](https://l-m.dev/physics-applied/)

A collection of interactive demonstrations and physics simulations.

![](image-physapplied-ss.png){.png-full}

I love Physics, there isn't anything like it. My obession is probably indicative by all of these simulations I've created over the years.

[Remember that softbody one I did?](https://l-m.dev/cs/softbody-dynamics-terminal/)

That's one of them. Not even including the tons of toy Rasterisers, Ray Tracers, Ray Marchers, and Physics engines.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
Welp, I take Physics in school. Why not do something nice to demonstrate what I learn in the curriculum?

I write every single Physics demo in C, the using Emscripten to compile that straight to WebAssembly.

For graphics I use Sokol and ImGui, they have bindings for C and can be compiled to WebAssembly using WebGL.

Calling `make` compiles the entire site into a self contained collection of HTML and WebAssembly files.

Full source -> **[l1mey112/physics-applied](https://github.com/l1mey112/yr11-physics-applied)**
:::::
::::: {.flex-columns-1}
![](phyapplied.gif){.png-full}
:::::
::::::::::
:::::::::: {.flex-columns}
::::: {.flex-columns-1}
[
	![](image-physapplied-ghlang.png){.png-full}
](https://github.com/l1mey112/yr11-physics-applied)
:::::
::::: {.flex-columns-1}
1. [Vector Addition](https://l-m.dev/physics-applied/#vector_addition)
1. [Static And Kinematic Friction Coefficients](https://l-m.dev/physics-applied/#friction_coefficients)
1. [Transverse Wave Motion](https://l-m.dev/physics-applied/#wave_generator)
1. [Softbody Pressure And Ideal Gases](https://l-m.dev/physics-applied/#softbody)
1. [Gravitational Potential Energy And Kinetic Energy](https://l-m.dev/physics-applied/#potential_energy)
:::::
::::::::::

[Want to read small notes about my thought process?](https://me.l-m.dev/?tag_physics=on) (Again, same website. Keep reading.)

# me.l-m.dev [[+]](https://me.l-m.dev/)

This was a funny one.

I built an entire full stack server side rendered linear blogging application entirely in V over the long weekend, whilst I was still supposed to be on holiday. I was committing code whilst half asleep on the couch in some beach accomodation.

I've always wanted something like this.

![](image-me-l-m-dev-front.png){.png-full}

## The Story

For the past couple years, I've had a Discord channel in a shitty server where I would post things daily. Anything that interested me at the time, or what I was working on. The first post there was a 3D model supposed to be used in a portfolio website using ThreeJS and JavaScript. This was back when I was learning on my own to become a full stack JavaScript developer (yikes).

Posts after that? 3D models, animation, the early stas compiler, music, V, and etc.

I took the time to insert the posts into a `sqlite3` database, and got on with my day. I also scraped music and personal anecdotes and shoved them in there too.

![](image-me-l-m-dev-tags.png){.png-full-75}

The site currently has 627 posts, and 235 unique tags.

It allows me to add new posts, edit existing posts, delete posts, and backup all from the website itself.

## Special Requirements

This is what I wanted, and achieved.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
The website has to respect privacy, and so to give users a peace of mind, that means no JavaScript.

The website also has to be able to embed outside content, such as music from Spotify and videos from YouTube.
:::::
::::: {.flex-columns-1}
1. Privacy Respecting
1. Zero JavaScript
1. Dynamic And Easy To Work With
1. Embedding Outside Content
1. RSS
:::::
::::::::::

The website can spot YouTube and Spotify urls and replace them with the bare content, stripping JavaScript.

![](image-me-l-m-dev-eighty.png){.png-full}

How does it spot and generate proper Spotify embeds without JavaScript?

Simple, web scraping.

1. Import `regex` and use query `https?://open\.spotify\.com/track/(\S+)` to access the URL and Track ID.

1. Make a HTTP GET request to the URL.

1. On the HTML response, run this regex query on it:
	
	`<script\s+id="initial-state"\s+type="text/plain">([^<]+)</script>`

1. Using the captured text, which is a Base64 encoded JSON string, decode it.

1. Extract all the metadata you need, including the 30 second preview MP3, cover art, and etc.

1. Embed safe HTML, without all the JavaScript on a normal `<iframe>` embed.

Simple, right? It's cool, I like it.

The source code is [completely open](https://github.com/l1mey112/me.l-m.dev/), and so is the website!

# The End.

Three large projects, all documented here all at once.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
[The V WebAssembly Backend](https://github.com/l1mey112/v/tree/wasmbackendedtwo)
:::::
::::: {.flex-columns-1}
[Year 11 Physics, Applied](https://l-m.dev/physics-applied)
:::::
::::: {.flex-columns-1}
[me.l-m.dev](https://me.l-m.dev)
:::::
::::::::::

These projects aren't just one offs, they'll become long projects I'll be working on.

1. The WebAssembly Backend Rewrite will be completed by the end of my break.

1. I expect to add some more simulations, don't want to miss out on optics content. I also expect to create some small blog posts around improving the site.

1. `me.l-m.dev` is in dire need of some features right now, specifically pagination. I have a vision on what I needs to get done, and how I will do it.

Until then, Goodbye!