#import "polylux/polylux.typ": *
#import "polylux/l-m.dev.typ": *

#set raw(syntaxes: ("./v.sublime-syntax", "./vmod.sublime-syntax"), tab-size: 4)
#show: metropolis-theme.with()
#set par(justify: true)

#let l-m-todo(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[TODO: ] #text(fill: l-m-meta-colour, body)]
#let l-m-tldr(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[tldr: ] #text(fill: l-m-meta-colour, body)]
#let span-sep(left, right) = box[#left #box(width: 1fr, repeat[#text(fill: l-m-meta-colour)[-]]) #right]

#let gc = block.with(
	width: 100%,
)

/*
	PITCH:
	
	Why do programming languages make the choices they make? Should we strive for 
	simplicity? What components of a programming language allow readable and maintainable 
	code? What is tried and tested? What works? What doesn't work?

	In this Tech Talk, we will unravel V. V is a statically typed compiled programming 
	language carefully designed for developing fast and maintainable software. Development 
	started in 2017, and has ballooned to over 600 open source contributors, including Liam, 
	the presenter.

	V is opinionated, it makes the choices it does to allow the code to be easily reasoned 
	about, expressive, and tremendously fast to iterate on. In this talk, Liam will hope to 
	inspire and provide you with a differing perspective, one from a seasoned compiler 
	developer and active V contributor. If you're passionate about the "why" and "how" of 
	programming and language design, then this talk is your gateway. I hope to see you there.
*/

/*
	Hello everyone and thank you for coming to this tech talk.
	I appreciate SYNCS for allowing me to come here today to give
	me a platform to reach people where articles on the internet
	do not.

	I am here to talk about the V programming language and my
	personal experiences.
*/
#title-slide({
	l-m-title("Read Fast, Write Fast, And Run Faster:")
	linebreak()
	l-m-title("How To Maintain And Iterate With V")
	l-m-hr()
	set text(size: 0.8em)
	text(fill: l-m-meta-colour, "Tuesday, October 3rd | Lecture Theatre 123 | 6 PM - 8 PM")
})


/*
	My name is Liam. I am a highschool student currently in Year 11,
	with an healthy interest in computer science, physics, and computer graphics.

	I myself am an open source contributor and organisation member for
	the V Programming Language, working on the compiler's backend
	and standard library, and being the main person to call for webassembly.

	Programming and learning about it's theory is where I put most of my time right now.

	My main editor is VSCode because it's the most complete and works well,
	and for everything else I use Helix because it's better than Vim.

	For operating systems,
	I use FreeBSD on all my servers, Arch Linux on my PC, Alpine Linux on my laptop.
	(And) even though I use them everyday I still don't trust at all for anything
	important. That's why I have this windows laptop here to present with.

	For programming languages, I write C and V everyday, and have pretty broad
	knowledge on the x86_64 ISA, and WebAssembly, becuase I've used them as
	a binary target for the compilers I write.

	Typescript and webdev stuff I know pretty well, and I've always wanted
	to learn RISC-Five and Haskell.

	If you want to email me, it's is up there, and if you
	want more convienient contacts, read the first page of my website.
*/
#slide(title: "Who Am I?")[
	- Liam, l-m, #underline[l-m.dev], #underline[l-m\@l-m.dev]
	- Highschool student, Year 11
	- Computer science, Physics, and Computer Graphics.
	- Open source \@ #text(fill: rgb("#5b85be"))[*V Programming Language.*]

	- Self taught Programmer by consequence. (I love this stuff)
	#l-m-hr()

	- Editors: VSCode at home, Helix on the go.
	- OS: #text(fill: rgb("#eb0028"))[*FreeBSD*], #text(fill: rgb("#1793d1"))[*Arch Linux*], #text(fill: rgb("#477295"))[*Alpine Linux*]

	#l-m-hr()

	Programming 'Languages'

	--- *Overly proficient:* C, V, x86_64 ISA, WebAssembly (MVP spec) \
	--- *Hobbyist:* Typescript, HTML, CSS, GLSL (shader language) \
	---  *Looking to learn:* RISC-V ISA, Haskell \
]

/*
	My first introductions to V were quite interesting.
	(but) In order to explain how I got here, I need to explain where I came from.
*/
#focus-slide()[
	Let Me Paint A Picture.
]

/*
	I started programming a couple years ago. I've had experience before then,
	but this was a part of my life where programming started to make sense.

	I made some minor programs in Python, just figuring everything out.

	After writing a couple discord bots in Python, I took some time
	to learn C. I wanted to learn C because I realised early on
	that I really didn't understand how anything worked.

	(and) Yes, what you're seeing is real code.
	15 year old me had no idea what a guard clause was.
*/
#full-slide()[
	#show: set page(background: [
		#image("assets/clol.png", fit: "stretch", width: 100%)
	]) // TODO: fix fucking colour
	#set align(center)
	#set align(horizon)
	
	#image("assets/is-this-a-joke2.png", fit: "stretch", height: 40%)

	// is this a sick joke??
	
	#image("assets/is-this-a-joke1.png", fit: "stretch", height: 40%)
]

/*
	C was an interesting programming language for me.
	I took a month learning the ins and outs, and it subsided Python
	pretty quickly for personal projects.

	Around that time, I just got my new website up, and wanted to
	create a 3D renderer with a twist. Rendering to the terminal.

	Now, that same 15 year old me spent a month implementing it. One that rasterised
	Blender models serialised by a Python plugin straight to the terminal.

	I documented my progress in a 3 part series + 1 on my website, working up
	from simple linear algebra to full 3D projection matricies.
*/
#full-slide()[
	#show: set page(background: [
		#image("assets/glol.png", fit: "stretch", width: 100%)
	]) // TODO: fix fucking colour
	#set align(center)
	#set align(horizon)
	#image("assets/2023-09-28_18-52.png", height: 100%)
]

/*
	I had a pretty fun time, especially so with not having much experience
	in C or handmade computer graphics.
*/
#full-slide()[
	#show: set page(background: [
		#image("assets/glol.png", fit: "stretch", width: 100%)
	]) // TODO: fix fucking colour
	#set align(center)
	#set align(horizon)
	#image("assets/2023-09-28_18-51.png", height: 100%)
]
/*
	Figuring out self occlusion, and mesh importing:
	It was a nice learning C and a pretty good transition from Python.
*/
#full-slide()[
	#show: set page(background: [
		#image("assets/glol.png", fit: "stretch", width: 100%)
	]) // TODO: fix fucking colour
	#set align(center)
	#set align(horizon)
	#image("assets/2023-09-28_18-50_1.png", height: 100%)
]

/*
	That was my first large project, and I was getting the hang of
	programming on my own.
*/
/*
	However, I wasn't really satisfied with either C or Python.
	What do you do, right?
*/
#focus-slide()[
	However?
]

/*
	I was at a crossroads.
	I came from a pretty extensive background of C and Python,
	and neither were able to fit my all needs.

	There are good things about C that I really admired:
	- Explicit data oriented code operating on simple data types.
	  Value types are also explicit with zero abstraction overhead.
	  You get what you see, and you use what you use.

	- Reasonable control flow:
	  There is a good reason why modern programming languages
	  are shifting away from try-catch. It's slow, annoying,
	  and barely explicit.
	  This is a huge proponent of Rust's, Zig's, Go's, and V's Design,
	  with Zig making a part of their entire philosophy.

	- C is portable in the sense that you can't write a shared library with Python.
	  If you want your programming language to interoperate with the rest
	  of the world, it must speak C. C was also the first language to get address
	  sanitisers, and has a huge amount of tooling like debuggers.
	
	- C has static types entirely enforcable at compile time.
	  The main advantage of static types is exactly what they are: they're exhaustive.
	  You can be confident all call sites conform to the type just by letting
	  the compiler do it's thing.
	  Statically typed languages also have a huge advantage in tooling, with
	  IDEs able to provide a lot of information about your code, aiding
	  instant refactoring and code completion.

	(Well) Python is more muddy, but it still has some good points.
	- (For one, A) Do things quick and do things now mentally.
	  It's a great language for prototyping, and all features of the language
	  complement this.
	- It has a huge ecosystem and package manager,
	  reaching absolutely anything and everything.
	  It's standard library is actually pretty sane, unlike C's
	  inconsistent and sometimes non-existant standard library.
	  Python has a decent string type, C doesn't.
	- It is THE language you teach beginners.
	  Beginners needn't worry about types, they need to understand
	  basic algorithms and concepts like iteration and recursion.
	  Python is a great language for this, and it's syntax is
	  pretty easy to understand.

	This list isn't exhaustive, it may even be biased, but
	a compare and contrast, just to put things into perspective,
	is what is needed for next.

	C programs are easier to reason about than Python programs.
	(And) Python programs are quicker to write than C programs.
*/
#slide(title: "Back And Forth")[
	#set text(size: 0.8em)
	
	#grid(columns: (auto, auto), gutter: 2em, gc[
		#text(size: 2em)[*C*]

		#l-m-hr()

		1. *OOP seemed like an Anti-Pattern to me* \
		   --- I prefer going Data Driven. \
		   --- Embrace Value Types.
		2. *Reasonable Control Flow* \
		   --- No exceptions, literally.
		3. *"C is a universal language"* \
		   --- Stable ABI and portable everywhere. \
		   --- Debuggers of all kinds. \
		   --- ASAN helps too!
		4. *Static, with Concrete Types* \
		   --- Susceptible to static analysis. \
		   --- `-Wall -Wextra -fsanitize=address`
	], gc[
		#text(size: 2em)[*Python*]

		#l-m-hr()

		1. *Get Sh*t Done Mentality* \
		   --- Do things quick and do things now. \
		   --- #strike[Ignore the unmaintainable mess 1 month on.]
		2. *Large Ecosystem* \
		   --- `pip` anything you want. \
		   --- Large Standard Library.
		3. *Great for Beginners* \
		   --- INFO1110 declares it a necessary evil.
		4. *Pythonic?* \
		   --- Syntax sugar where needed. \
		   --- Decently readable and terse code. \
		   --- #strike[Don't buy into the cult.]
	])

	#v(5em)

	#l-m-tldr[
		C programs are easier to reason about than Python programs.
	]
	
	#l-m-tldr[
		Python programs are quicker to write than C programs.
	]
]

/*
	Why can't we have both worlds, and where does V slot in?
	This is what I want to accomplish with this talk.

	- Introduce V as an open source programming language and community.
	- Teach the language to newcomers.
	- Allow the audience to understand why V makes the choices it does.
	- Assert V as a real competitor for writing maintainable software fast.
*/
#slide(title: "This Talk?")[
	#l-m-todo[Introduce V as an open source programming language and community.]

	#l-m-todo[Teach the language to newcomers.]

	#l-m-todo[Allow the audience to understand why V makes the choices it does.]

	#l-m-todo[Assert V as a real competitor for writing maintainable software fast.]
]


/*
	What is V?
*/
#new-section-slide("What Is V?")

/*
	V is a modern programming language created by Alexander Medvednikov in 2018.

	It's a simple, fast, safe, compiled language for developing maintainable software.

	It's similar to Go and its design has also been influenced by Oberon, Rust, Swift, Kotlin, and Python, and promotes writing simple and clear code with minimal abstraction.

	It has many qualities that work to it's advantage, such as a simple expressive syntax, hot code reloading,
	test runners baked right into the language.

	(And) I've never experienced a single debug build take longer than 2 seconds, --
	I work on the compiler. Expect the average program to take milliseconds.

	By default, V compiles to C, and so it leverages existing C compiler infrastructure and optimisations.
	That property allows it to run everywhere.
	(You can) Run the compiler on Windows, develop on Linux,
	and as I speak I've got FreeBSD servers at home running it.

	Sounds exactly what I needed right?
*/
#slide(title: "What Is V?")[
	_"Simple, fast, safe, compiled. For developing maintainable software."_
	
	A modern programming language created by Alexander Medvednikov (Alex M) in 2018.

	#l-m-hr()
	#align(center)[
		```vlang
		fn main() {
		    println("Hello SYNCS!")	    
		}
		```
	]
	#l-m-hr()

	- *The language is simple but expressive, and thus programs are maintainable.*
	- Incredibly fast (debug) compilation, compile+run usually sub second.
	- Production performance on par with C with zero cost C interop.
	- Small compiler with zero dependencies.
	- Hot code reloading, test runner, among many other features built in.
	- Extremely Portable.
]

/*
	How did V come to fruition? Something similar to what I went through.

	In 2017, Alex was writing a native desktop client for major messaging services, called Volt.
	Initially in Go, Volt was rewritten in C due to better integration with graphics/UI libraries and
	smaller binaries. Go wasn't suited for the job. It's huge runtime doesn't always work to your advantage,
	especially when you simply don't need those features.
	Graphics libraries rarely support some kind of concurrency, just OpenGL doesn't.

	C was the only option, but C development isn't very productive.
	It's a tough pill to swallow especially for purists like me.
	(I mean) I love writing C but I don't lie to myself.
	It's not very sustainable especially when you want to ship something useful.

	So Alex fixed the problem with a new programming language.
	He created the V language to rewrite Volt, open sourcing it on June 22, 2019.
*/
#slide(title: "V Beginnings")[
	Alex began Volt app development in 2017.
	
	A native desktop client for major messaging services.

	#l-m-hr()

	#align(center)[
		Volt was originally written in Go, then rewritten to C.

		Go (\~5 MiBs) ---> C (\~100 KiBs)
	]
	
	#l-m-hr()

	C development is not very productive. (Tough pill to swallow.)
	
	*In early 2018, Alex created the V language to rewrite Volt.*

	#v(1em)
	```
	Alex M> I was writing an app in Go, but it needed a C library, CGO is slow
	        and hard to debug. I also wasn't getting the C++ performance I wanted.
	Alex M> So I quickly wrote a small language that translated to C and allowed
	        to insert C code via `#printf("hello");`
	```
	#v(1em)

	V was then open sourced in June 22, 2019.
]

/*
	I entered the community back in late 2021 looking for a
	programming language to use as an alternative to C and Python,

	because that's what it felt like to me. It was a complete breath
	of fresh air. ~~I was able to write programs leveraging the~~

	21 long form articles on my website and about 150 short form posts on blog.

	In early 2023, after creating a couple compilers and languages on my own using V,
	I wanted to improve the language. I started major work on the compiler and standard library,
	implementing WebAssembly support, as a language target, and as something you can just import
	and use, being right in the standard library. I'll be touching on this throughout the talk.

	I've been a member of the V community for a while now, and I've had the opportunity to voice my ideas in key decisions.
*/
// TODO: write more at the end.
#slide(title: "Where Do I Fit In?")[
	I entered the community back in late 2021 looking for a programming language to use as an alternative to C and Python.

	Enjoyed my time greatly. Wrote (mostly) everything in V.

	#l-m-hr()

	Rasterisers, Ray Tracers, Ray Marchers, Software or Hardware accelerated. Programming Languages, Compilers and Interpreters. Programming Language Tools. Websites, Static Site Generators, URL Shorteners. Complex Physics Simulations. Etc..

	#align(center)[
		*21* long form articles on #underline[l-m.dev/cs]

		*\~150* short form posts on #underline[me.l-m.dev]
	]

	#l-m-hr()
	
	*In early 2023 I started major work on the compiler and standard library, becoming an organisation member and key community figure.*
]

/*
	I'll mention some of the projects I've worked on in V.

	Early 2023 was when I started to become more involved in my open source contributions, like I said before,
	my largest contribution was the WebAssembly work I did on the V compiler and standard library.

	I've written parts of my website in V, a couple of compilers and interpreters,
	and an entire programming language, stas.

	The stas compiler is entirely selfhosted, however stas 1 was bootstrapped from a
	compiler written in V. I used V to create the initial reference implementation of
	the language and compiler. You'll see why V was the language of choice later on.
*/
#slide(title: "Where Do I Fit In?")[
	#set text(size: 0.8em)

	- *2023* --- *V WebAssembly Backend and Libraries* \
		--- Generate WebAssembly code in memory, just `import wasm`. \
		--- Compile projects to WebAssembly, for the _browser_ or _WASI_. 

	#l-m-hr()

	- *2023* --- *"me.l-m.dev"* \
		--- A stylistically minimal, privacy respecting, linear blogging website. \
		--- Zero Javascript, Zero Cookies, Zero Tracking. \
		--- I built this in a weekend! \
	- *2022* --- *stas* \
		--- A stack based compiled systems programming language. \
		--- 356 byte Hello World static Linux executable. \
		--- Leverages native system calls for Linux and FreeBSD. \
		--- The stas compiler is entirely selfhosted. \
		--- Build an identical compiler in 80ms! \
		--- *The 1.0 stas compiler was bootstrapped from a compiler written in V.* \
	- *2022* --- *jitcalc* \
		--- A calculator that evaluates expressions by creating x86_64 programs at runtime.
	- *2022* --- *crepl* \
		--- Compile and execute C code on the fly as you type it. \
		--- Lightweight and incredibly fast alternative to _igcc_.
]

/*
	As Im writing this, and out of date now that Im saying it, V is the third most written about topic on my small blog.
	Fitting, as the entire website is written in V using it's SQL ORM support and built in HTML templating.
*/
#full-slide()[
	#set page(fill: rgb("#1d1e1e")) // TODO: fix colour
	
	#align(center)[
		#image("assets/me1.png", width: 90%)
	]
]

/*
	(And) That renderer I talked about before? It got rewritten in V days later.
*/
#full-slide()[
	#align(center)[
		#image("assets/2023-09-30_15-02_1.png")
	]
]
#full-slide()[
	#align(center)[
		#image("assets/2023-09-30_15-03.png")
	]
]

/*
	Enough stalling, I'll make this quick and informative
*/
#new-section-slide[A Quick Look Into V]

/*
	The V compiler is housed in a single binary, named V.

	It's designed to be simple, no build script needed.
	
	Invoking V on a file will compile it to an executable with the same name.
	(And) Prepending `run` to the command will run the executable after compilation.

	V outputs binaries by default, compiled by a C compiler, but can also be configured
	to output C code, JavaScript, WebAssembly, and Native executables.
	It doesn't tie you down to one platform.

	C and JavaScript targets are the most complete, with WebAssembly following behind, and
	native executables being a work in progress. However, a lot of work is being done,
	and a 49 byte hello world, using Linux system calls, is a pretty big achievement.

	WebAssembly has two different sub-targets, being a browser target and a WASI target.
	WASI, or WebAssembly System Interface, is a standardised interface for running WebAssembly
	outside of the browser, pretty similar to POSIX. WebAssembly for the browser exposes
	a way to interact with host JavaScript code as well.
*/
#slide(title: [Compile and Run --- To any Target], align-horizon: false)[
	
	#[
		#show raw: set text(size: 16pt)

		```vlang
		// main.v
		
		fn main() {
			println("Hello from l-m!")
		}
		```
	]

	#l-m-hr()

	#grid(columns: (auto, auto, auto, auto), gc[
		```commands-builtin-shell-bash
		$ v main.v
		$ ./main
		Hello from l-m!
		```
	], gc[
		```commands-builtin-shell-bash
		$ v run main.v
		Hello from l-m!
		```
	])

	#l-m-hr()

	#show raw: set text(size: 11pt)

	#grid(columns: (auto, auto, auto, auto), gc[
		*C*

		```commands-builtin-shell-bash
		$ v main.v -o main.c
		$ cc main.c -o main
		# ./main
		```
	], gc[
		*JS*

		```commands-builtin-shell-bash
		$ v -b js main.v
		$ node main.js
		# -b js_browser
		# -b js_node
		# -b js_freestanding
		```
	], gc[
		*NATIVE*

		```commands-builtin-shell-bash
		$ v -b native main.v
		$ wc -c main
		49 # yes, 49 bytes tiny! 
		```
	], gc[
		*WASM* #text(fill: l-m-meta-colour)[(me)]

		```commands-builtin-shell-bash
		$ v -b wasm main.v
		$ wasmer main.wasm
		# implicit -os wasi
		# run with wasm runtime, or
		# use browser with -os browser
		```
	])
]

/*
	Functions are declared with the "fn" keyword.
	A typical V program starts with a main function, which is the entry point of the program.

	Use functions in any order, even out of order. You can use functions before you declare them.
	Types also come after the name, if you've used any modern programming language created after
	the year 2010 this should be the norm for you.

	The add function takes two arguments, both of type int, and returns an int.
*/
#slide(title: "Declarations - Begin")[
	#show raw: set text(size: 1.4em)

	```vlang
	fn main() {
		println(add(10, 15)) // prints 25!
	}

	// functions can be used before their declaration
	/* multiline comments work like this, /* and can be nested! */ */

	fn add(a int, b int) int {
		return a + b
	}
	```
]

/*
	Functions can return multiple values, using a sort of tuple syntax.
	Another deliberate design decision is that V doesn't have tuples,
	these are merely only applicable for functions that return multiple values.

	Later, on I'll show you how to work with these.
*/
#slide(title: "Declarations - Multiple Return Values")[
	#show raw: set text(size: 1.4em)

	```vlang
	// swap returns two values, both ints
	fn swap(a int, b int) (int, int) {
		return b, a
	}
	```
]

/*
	V is a very modular language, so any programs should be organised into modules,
	which are located in separate folders within the project.

	The root of all modules can be either the project root or the special SRC folder.

	At the root of the project, there should be a v.mod file with a description of the module.
*/
#slide(title: "Modules")[
	#show raw: set text(size: 1.4em)

	#grid(columns: (auto, auto), gutter: 1em, gc[
		```
		project/
		├── src/
		│   ├── module1/
		│   │   ├── module1.v
		│   │   └── module1_test.v
		│   └── module2/
		│       ├── module2.v
		│       └── module2_test.v
		└── v.mod
		```
	], gc[
		```vmod
		
		Module {
			name: 'project'
			description: 'project desc'
			version: '0.0.1'
			dependencies: []
		}
		```
	])

	
]

/*
	All variable and function names must use the snake_case style,
	as opposed to type names, which must use PascalCase.

	This is yet another deliberate design decision enforced on the compiler and
	formatting level. Enforcing an opinionated style on all code allows for a
	consistent experience across all V code bases, and makes even easier to read.

	V has a special built-in code formatter, vfmt, which brings the code to a single style.
*/
#slide(title: "Declarations - Naming Convention")[
	#set text(size: 1.2em)

	- *snake_case* --- Function, variable, module, and constant names
	- *PascalCase* --- Type names

	#l-m-hr()

	```vlang
	// sorry! (even highlighters pick this up)
	fn TestCase() {}

	// allowed
	fn test_case() {}
	```
]

/*
	Variables are declared with the colon-equals operator,
	with their type always inferred from the right hand side initialiser.

	By default, variables can't change. This is called immutability.
	V makes the ability to edit variables explicit, by using the "mut" keyword,
	without it, reassigning is an error.

	This may seem counterintuitive at first, since variables are supposedly
	designed to vary. You'll see how this comes into play, not often
	do variables change.
*/
#slide(title: "Declarations - Variables")[
	#set text(size: 0.9em)
	#show raw: set text(size: 1.5em)

	#grid(columns: (auto, auto), gutter: 1em, gc[
		*Line by line:*

		#l-m-hr()

		```vlang
		fn main() {
			name := 'V'
			age := 4
		}
		```
	], gc[
		*Multiple on one:*

		#l-m-hr()
		
		```vlang
		fn main() {
			name, age := 'V', 4
		}
		```
	])

	#v(2em)

	#grid(columns: (auto, auto), gutter: 1em, gc[
		```vlang
		fn main() {
			mut counter := 10
			counter = 20 + 1
		}
		```
	], align(center)[#gc[
		Use the `mut` keyword to make a variable mutable, without it, reassigning is an error.
	]])
]


/*
	I haven't mentioned datatypes yet, but you can probably guess what these are.

	V has built-in support for strings, and V uses UTF-8 to encode strings.
	All strings in V are immutable, you can't edit individual characters,
	only create new strings.

	Use backticks for character literals, which are represented as single
	UTF-8 code points.

	For numbers, by default, if you don't specify a type explicitly,
	then literals will be of type int or f64 depending on whether it
	is an integer or a float.

	There is an exception to the rule that all operators in V must have values of the
	same type on both sides. A primitive type can be converted to another type
	if there is zero loss of information. For example, smaller integers can be
	converted to larger integers, and integers can be converted to floats.

	If you want an exact type, you can just use casting. It looks like a function
	call with the type on the left hand side.
*/
#slide(title: "Basic Datatypes")[
	```vlang
	i8  i16  int  i64      i128 (soon)    string rune
	u8  u16  u32  u64      u128 (soon)    f32    f64  bool

	isize usize // platform-dependent, pointer size
	voidptr     // this one is mostly used for C interoperability
	```
	#l-m-hr()
	
	#grid(columns: (auto, auto), gutter: 1em, gc[
		*Literals*

		#v(1em)

		```vlang
		a1 := "hello"  // string type
		a2 := 'hello'  // use single quotes too!
		b := `A`       // rune type, Unicode code point

		c := u8(10)    // u8 type, 8 bits
		c := f32(10)   // f32 type
		d := 3.142     // f64 type
		
		e := false     // bool type
		```
	], gc[
		*Integer Type Promotion*

		#v(1em)
		
		```vlang
		   i8 → i16 → int → i64
		                  ↘     ↘
		                    f32 → f64
		                  ↗     ↗
		   u8 → u16 → u32 → u64 ⬎
		      ↘     ↘     ↘      ptr
		   i8 → i16 → int → i64 ⬏
		```
	])
]

/*
	You've probably seen the println function, or print-line.
	Among this function, the print function, and it's variants that print to standard-error,
	they all take a single argument to print. They can take any type, and print it to the console.

	An amazing feature of V is that it has string interpolation on a language level, similar
	to other high level languages like Python, and something you can't mess up unlike
	C format strings.
	You can use the dollar sign, and curly braces to insert values into strings, and print them.
*/
#slide(title: "Printing and Strings")[
	#set text(size: 0.9em)
	#show raw: set text(size: 1.5em)

	```vlang
	fn main() {
		name := 'l-m'
		year := 2000

		println('Hello, ${name}!')

		year_msg := 'The year is ${year + 23}\n'

		print(year_msg)

		// println, print   -> stdout
		// eprintln, eprint -> stderr
	}
	```
]

/*
	You can perform variable assignments with multiple variables on one line.
	Remember the swap function from before? This is how you unpack the values.

	You can also ignore values by using the underscore, which is a special identifier.

	The "assert" keyword is to test for a condition, and if it's false, it aborts the program.
	I'll be using asserts from now on to convey the expected output of a program.
*/
#slide(title: "Assignments continued")[
	#set text(size: 0.9em)
	#show raw: set text(size: 1.5em)

	```vlang
	fn swap(a int, b int) (int, int) {
		return b, a
	}
	
	fn main() {
		mut c := 105

		c, _ = swap(c, 42) // ignore with `_`

		assert c == 42
	}
	```
]

/*
	If expressions are pretty straightforward and similar to most other languages.
	Notice how I didn't say statement there, if can be used as an expression,
	and last expression is the value of a block.

	Unlike C and other similar languages, there are no parentheses surrounding the condition
	and the braces are always required. If you're using if as an expression, the else branch is mandatory.

	There is no ternary operator, it's been merged straight into the if.
*/
#slide(title: "Control Flow - Conditionals")[
	#set text(size: 0.9em)
	#show raw: set text(size: 1.2em)

	```vlang
	fn main() {
		mut a := 10

		if a > 5 {
			println('a is greater than 5')
		} else if a < 5 {
			println('a is less than 5')
		} else {
			println('a is equal to 5')
		}
	}
	```

	#v(2em)
	
	```vlang
	fn main() {
		num := 23
		s := if num % 2 == 0 { 'even' } else { 'odd' }
		println(s) // odd
	}
	```
]

/*
	V has only one looping keyword: for, with several forms.

	A range iterator is used to go through a range of numbers, not including the last value.
	It's similar to the range function in Python.

	V also contains a traditional C style for loop, and the special "in" keyword
	for going through elements of an array.
	
	If an index is required, an alternative form with another variable can be specified.
	You can also loop forever if you want.
*/
#slide(title: "Control Flow - Iteration")[
	#set text(size: 0.9em)
	#show raw: set text(size: 1.5em)

	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		// C style, mut is implied
		for i := 0; i < 10; i++ {
			println(i)
		}
		```
	], gc[
		```vlang
		// range iterator
		for i in 0 .. 10 {
			println(i)
		}
		```	
	])

	#v(1em)
	#l-m-hr()
	#v(1em)

	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		// iterate over items in array
		items := ['a', 'b', 'c']
		
		for index, item in items {
			println('${index}: ${item}')
		}
		```
	], gc[
		```vlang
		// forever
		for {
			println('infinite loop')
		}
		```
	])
]

/*
	The break and continue keywords control the innermost for loop.

	Break terminates the innermost for loop.
	Continue skips the rest of the current iteration and proceeds to
	the next step of the nearest enclosing loop.

	You can also use break and continue followed by a label name
	to refer to an outer for loop, no need to use goto.
*/
#slide(title: "Control Flow - Break and Continue")[

	#align(center)[
		```vlang
		fn main() {
			// print numbers 7 to 10
			outer: for i := 4; true; i++ {
				for {
					if i < 7 {
						continue outer
					} else if i > 10 {
						break outer
					} else {
						println("hit: ${i}")
						break
					}
				}
			}
		}
		```
	]
]

/*
	V has built-in support for arrays, and array literals are lists of expressions surrounded by square brackets.

	The type of array is determined by the first element,
	and the user can explicitly specify the type for the first element.

	The above syntax is fine for a small number of known elements,
	but for very large or empty arrays there is a second initialisation syntax.

	Below creates an array of ten-thousand ints that are all initialised with 3,
	with memory space is reserved for 30000 elements to allow it to grow.
	Think of this as a List in Python, or a Vector in many other languages.
	It's a simple realloc when the array exhausts it's internal capacity.

	To append or push to an array, use two greater-than signs, the shift operator.
	An array also has special fields to get the length and capacity.

	You can take slices using a range inside square brackets.
	A slice is a part of a parent array, and it has the same array type.	
	If a right-side index is absent, it is assumed to be the array length.
	If a left-side index is absent, it is assumed to be 0.

	You can also take a slice of a negative index, which counts from the end of the array.
	It has a special syntax, the gate, which is a hash character followed by the square brackets.
	The returned slice is always a valid array, though it may be empty.

	V also has a syntax for creating arrays with a fixed size, which live on the stack,
	for use with temporary buffers and other such things.
*/
#slide(title: "Advanced Datatypes - Arrays")[
	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		mut nums := [1, 2, 3]

		println(nums)    // [1, 2, 3]

		nums[1] = 5
		println(nums)    // [1, 5, 3]

		println(nums[1..]) // [5, 3]
		println(nums[..2]) // [1, 5]
		```
	], gc[
		```vlang
		[1, 2, 3]           // []int
		['a', 'b']          // []string

		[u8(1), 88, 99, 23] // []u8
		[1.0, 2.0, 3.0]     // []f64
		```

		#v(2em)
	

		```vlang
		nums := [1, 2, 3, 4, 5]
		println(nums#[1..-1]) // [2, 3, 4]
		```
	])
	
	
	#l-m-hr()

	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		mut a := []int{len: 10000, cap: 30000, init: 3}

		a << 10
		a << 20

		assert a.len == 10002
		assert a.cap == 30000
		assert a[0..2] == [3, 3]
		assert a[10000..10001] == [10, 20]
		```
	], gc[
		```vlang
		// fixed size, initialised to zero
		mut fnums := [3]int{}

		fnums[0] = 1
		fnums[1] = 10
		fnums[2] = 100

		assert fnums == [1, 10, 100]! // short init
		```
	])
]


/*
	Like all other datatypes in V, arrays have convienient methods to manipulate them.

	Functional paradigms are encouraged, and V provides functionality like filter and map,
	combined with a terse "it" expression syntax to manipulate each element.
*/
#slide(title: "Advanced Datatypes - Arrays")[
	```vlang
	mut vec := [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	
	filtered := vec.filter(it > 2 && it < 8)
	map_vec := vec.map(it * 2)

	assert filtered == [3, 4, 5, 6, 7]
	assert map_vec == [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

	#v(1em)

	#l-m-hr()

	#v(1em)

	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		board := [
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9],
		]

		println(board[1][2]) // 6
	```
	], gc[
		```vlang

		
		mut vals := [1, 2, 3]

		assert vals.pop() == 3
		assert vals.any(4) == false
	```
	])
]

/*
	V has support for maps, sometimes called hashmaps, dictionaries, or associative arrays in other languages.

	Like arrays, and structs, a map seems deserving of built in status,
	and V follow suit like compiled languages D and Go.

	Maps are ordered by insertion, like dictionaries in Python.
	The order is a guaranteed language feature, and you can
	iterate over a map in the order it was inserted, with
	it's keys and values.

	V's maps are one of the most performant out there,
	and if you've read the thesis used as a base for the implementation,
	you'll probably know why.
*/
#slide(title: "Advanced Datatypes - Maps")[
	```vlang
	// map with keys of type `string` and values of type `int`
	m := map[string]int{}

	// map with keys of type `string` and values of type `Foo`
	m2 := map[string]Foo{}
```

	#l-m-hr()

	
	```vlang
	mut m := map[string]int{}

	m['one'] = 1
	m['two'] = 2

	for key, val in m {
		println("key: ${key}, val: ${val}")
	}

	assert m.str() == "{'one': 1, 'two': 2}"
```
]

/*
	A structure is a data type that allows you to combine several other data types
	into one with unique names for each, nothing new here.

	In V, structures are specified using the struct keyword. Each field must have a unique name and type.

	To instantiate a struct, use a struct literal, and specify each field.

	Fields can be initialized in any order or omitted when they are created.
	There are no uninitialised data in V, when a field goes unspecified it
	is set to the default value of its type, usually zero, or the fields
	default value.

	There is also a short syntax for instantiating structures without fields,
	but all expressions must be in order with correct types.	
*/
#slide(title: "Advanced Datatypes - Structs")[
	```vlang
	struct Person {
		age  int = 0
	pub:
		name string
	}

	p := Person{
		name: 'Alice'
		age: 23
	}

	println(p.name) // Alice
	
	println(Person{name: "Sid"}) // Person{name: "Sid", age: 0}
```
]

/*
	V introduces access and mutability modifiers for each fields of a struct.
	Being able to specify whether a field is mutable or not within a module
	or outside a module is a very powerful feature.

	Combining this by using the "Treepub" keyword on a struct, or any symbol,
	you can create a well defined API for your module, and specify which fields
	are mutable, private, and which are not.
*/
#slide(title: "Advanced Datatypes - Structs and Privacy")[
	```vlang
	pub struct Foo {
		a int // private immutable (default)
	mut:
		b int // private mutable
		c int // (you can list multiple fields with the same access modifier)
	pub:
		d int // public immutable (readonly)
	pub mut:
		e int // public, but mutable only in parent module
	__global:
		f int // public and mutable both inside and outside parent module
	}
```
]

/*
	V doesn't contain OOP, it's simply not needed at all, and is substituted with
	modern methods of data abstraction, like sum types, interfaces and generics.

	You can define methods on structs, but they're just functions that take
	the struct as the first argument, and aren't polymorphic.

	Before the function name, a new parameter is added called the receiver.
	It defines the type of the structure that the method belongs to, as well as the name of the variable,
	through which you can access an instance of the structure on which the method is called.

	There is another feature called struct embedding, which is like inheritance without
	polymorphism. It's just a way to compose structures together. On the code below,
	Developer is a Person, and can access all of its fields and methods, under the hood,
	Developer just has a Person field.
	It's a pretty powerful feature, despite being just syntax sugar.
*/
#slide(title: "Advanced Datatypes - Methods and OOP?")[
	```vlang
	struct Person {
		age u8 @[required] // just an attribute, required field on init
	}

	struct Developer {
		Person
		lang string
	}

	fn (p Person) is_adult() bool {
		return p.age >= 18
	}

	fn main() {
		dev := Developer{
			age: 52
			lang: 'V'
		}

		assert dev.is_adult()
	}
```
]

/*
	V doesn't have nulls. Instead, it introduces a concept called the "Option" type
	to handle absence of values more gracefully. Null values are an explicit part
	of the type system, and a first-class type, which means you can use them as function
	parameters, return values, struct fields, and so on.

	The 'Option' type serves as a container that can either hold a value or represent its absence.

	An option must be "unwrapped" before using it, and I'll touch on this in the coming slide.
*/
#slide(title: "Advanced Datatypes - Option")[
	```vlang
	fn (r Repo) find_user_by_id(id int) ?User {
		//                              ^ Option type
		for user in r.users {
			if user.id == id {
				return user
			}
		}
		return none
		//     ^^^^ if not found, return `none`
	}
```
]

/*
	V also doesn't have exceptions, all control flow must be explicit.

	V represents errors using the Result type, not stack unwinding,
	forever propagating exceptions that will kill the program,
	if you have no idea they're there.

	The result type is similar to the Option type, but instead of
	representing the absence of a value, it represents the presence
	of an error.

	It's pretty funny when even Typescript to this day doesn't
	have a way to express if a function can throw in it's type
	system, and in C++, exceptions are an opt out feature, resulting
	in pointless conditional branches in generated code.

	When errors are represented as values, they become an integral part of the program's data flow.
	You can instantly tell what functions can fail and what functions can't, and if you don't handle
	them explicitly, the compiler will complain.

	This is more predictable and understandable, making it clear how errors affect program execution.
*/
#slide(title: "Advanced Datatypes - Result")[
	```vlang
	fn (r Repo) find_user_by_id(id int) !User {
		//                              ^ Result type
		for user in r.users {
			if user.id == id {
				return user
			}
		}
		return error('User ${id} not found')
		//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ if not found, return an error
	}
```
]

/*
	V does not allow you to ignore errors.
	If an Option or Result type is returned from a function,
	then you must process it before using its value.

	The first option for handling errors or none is to propagate them up the call stack.
	This causes the current function to return an error or none as its result, and is
	similar to just letting an exception bubble up the call stack, except this time
	it's explicit.

	However, for a function to return an error or none, its return type must be the Result or Option type.
	Thus, to propagate an error or none higher up the call stack,
	the enclosing function itself must return a Result or Option type.
*/
#slide(title: "Advanced Datatypes - Propagation")[
	```vlang
	import net.http

	fn get_body(url string) !string {
		//                  ^ Result type
		resp := http.get(url)!
		//                   ^ if error, propagate it
		return resp.body
	}
```
]

/*
	There are two other ways to handle these types.

	Instead of propagation, you can perform unwrapping.
	Unwrapping is the process of extracting the value from an Option or Result type.

	"or" blocks allow you to describe the behavior that will be performed if the function returns an error or none.
	The "or" block must be wrapped in curly braces.
	If the function returns a value, then the "or" block will be ignored.

	V uses the last statement in the or block as the value,
	so the following example will return a default user, the struct literal.

	Another way to handle errors or none is to use if unwrapping.

	In the example on the right, if the function returns a value, then the "if" block will be executed,
	and the user variable will be assigned the value returned by the function.
	If the function returns an error or none, then the "else" block will be executed.

	Trying to use a value that is wrapped in an Option or Result type,
	without unwrapping, will result in a compiler error. Everything is explicit here.
*/
#slide(title: "Advanced Datatypes - Unwrapping")[
	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		r := Repo{/* ... */}

		user := r.find_user_by_id(99) or {
			User{-1, 'Unknown'} // default
		}

		// use user
	```
	], gc[
		```vlang
		r := Repo{/* ... */}

		if user := r.find_user_by_id(99) {
			// use user
		} else {
			// no user
		}
	```
	])
]

/*
	Interfaces in V define some behavior in the form of methods and fields.
	Interfaces can be implemented by any type that has the appropriate methods and fields.
	They're basically conventions by which types can work together.

	This is real runtime polymorphism.

	When we define a function that takes the Speaker interface as an argument,
	we abstract away from the actual implementation and only use what the interface defines.
	Now we can call greet with any type that implements the Speaker interface.

	A type implements an interface by implementing its methods and fields.
	There is no explicit declaration of intent, no "implements" keyword.
	This is called duck-typing, they just have to be compatible.
*/
#slide(title: "Advanced Datatypes - Interfaces")[
	```vlang
	interface Speaker {
		speak(msg string) string
	}

	fn greet(s Speaker) {
		println(s.speak('Hello'))
	}

	struct Me {}

	fn (m Me) speak(msg string) string {
		return 'Hello, ${msg}!'
	}

	fn main() {
		m := Me{}
		greet(m)  // Me implements Speaker
	}
```
]

/*
	V takes the path of composability, instead of inheritance, and it's a good thing.

	In this case of interface embedding, all methods and fields of the interface will belong to the parent
	interface and the type will need to implement methods and fields from all interfaces.

	For example, if you have two interfaces, Reader and Writer:

	You can declare a ReaderWriter interface that requires the implementation of the
	both read() and write() methods. All structs that implement ReaderWriter will
	also implement Reader and Writer, and their methods must mutate the struct,
	as the interface methods are marked as mut.
*/
#slide(title: "Advanced Datatypes - Interfaces")[
	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		interface Reader {
		mut:
			read(mut buf []u8) ?int
		}

		interface Writer {
		mut:
			write(buf []u8) ?int
		}
		
		interface ReaderWriter {
			Reader
			Writer
		}
	```
	], gc[
		```vlang
		struct MyRW {}

		fn (mut m MyRW) read(mut buf []u8) ?int {
			// ...
		}

		fn (mut m MyRW) write(buf []u8) ?int {
			// ...
		}
	```
	])
]

/*
	Interfaces aren't often the most used by me, I resort to sum types.
	The sum type is a special data type that can hold a value of one of
	several types while maintaining type safety. Unlike interfaces which
	can have multiple implementations, sumtypes have explicit states.

	I'm constantly using sum types in my code, V or not, they solve a
	lot of problems. They go by different names, like tagged unions, variants,
	algebraic data types, etc.

	Let's say you needed to represent a tree data structure, you could do it like this.
	The type Tree is a sumtype, it contains only two valid states, Empty or Node.

	You can use a match expression to match on the type of the sum type, and
	perform different actions based on the type.

	It's entirely type safe, and the match expression ensures that you've handled
	all cases exhaustively.
	In the Node case of the match expression, the variable tree is of type Node,
	not Tree, not Empty, and you can access its fields.
*/
#slide(title: "Advanced Datatypes - Sumtypes and Match")[
	```vlang
	struct Empty {}

	struct Node {
		value f64
		left Tree
		right Tree
	}

	type Tree = Empty | Node

	fn sum(tree Tree) f64 {
		return match tree {
			Empty { 0 }
			Node { tree.value + sum(tree.left) + sum(tree.right) }
		}
	}
```
]

/*
	I'll touch more on the tools present in the V compiler.

	V has built in formatting, testing, profiling, and a centralised package manager.

	You can use the V compiler to do package operations,
	just like you can use it for compiling code, formatting code, vetting code etc.

	Submitting your V module takes a couple of seconds, and installing modules is as
	easy as "v install package".

	V's VPM currently has about 500 packages, and it's growing.
*/
#slide(title: "V Tools - VPM")[
	#[
		#show regex("\bv\b"): set text(rgb("#5b85be"), weight: "bold")
	
	```
		v [package_command] [param]
		```

	```
		v install [package]
		v install [--once] [--git|--hg] [url]

		v install ui
		v install --git https://github.com/vlang/markdown
		```
		
	]

	#l-m-hr()

```
	install           Install a package from VPM.
	remove            Remove a package that was installed from VPM.
	search            Search for a package from VPM.
	update            Update an installed package from VPM.
	upgrade           Upgrade all the outdated packages.
	list              List all installed packages.
	outdated          Show installed packages that need updates.
	```
]

/*
	Testing in V is similar to Go.
	
	Just like in Go, test files are usually located next to the
	code under test and have the _test.v suffix.
	Each test function must be prefixed with test_, and don't take any parameters.

	Inside the tests themselves, the assert statement is used for checks.
	If the expression inside assert is not true, then the test will fail.

	You can run all tests in the current directory with "v test ."
*/
#slide(title: "V Tools - Test")[
```vlang
	// add_test.v
	fn test_add() {
		assert 1 + 1 == 2
	}

	// sub_test.v
	fn test_sub() {
		assert 1 - 1 == 1 // not true
	}
	```

	#v(2em)

	#[
		#show regex("FAIL|✗"): set text(rgb("#ef6769"), weight: "bold")
		#show regex("OK"): set text(rgb("#a6e22e"), weight: "bold")
	
	```
		$ v test .
		---- Testing... ---------------------------------------------------------------
		OK    [1/2]   178.071 ms /tmp/v/add_test.v
		FAIL  [2/2]   180.654 ms /tmp/v/sub_test.v
		/tmp/v/sub_test.v:2: ✗ fn test_sub
		> assert 1 - 1 == 1
			Left value: 0
			Right value: 1
		....
		```
	]
]

/*
	You can work with pointers in V, they're called references here.

	V extends mutablity rules to references, so you can have immutable or mutable references.

	Due to these strict rules, you cannot edit a variable through an immutable reference,
	since the backing value itself is immutable.
	
	While you can dereference a reference with the star operator, you can edit fields of a struct
	through a mutable reference, no dereferencing syntax required.

	References don't hide anything, they are pointers under the hoods.
	All references created in safe V are always valid, you'll never need to worry about them
	in normal code. When working with unsafe code, for example when calling out to C code,
	you can create null references. I'll talk about C interop later.

	Nullable references are not supported in safe V, they're not needed:
	Option types exist, and should be used.
*/
#slide(title: "Memory - References")[
	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		struct Foo {
			inner &Foo
			//    ^^^^ reference to Foo
		}

		fn foo(foo &Foo) {
			//     ^^^^ reference to Foo
		}

		// none, or &Foo
		type NullableFoo = ?&Foo
	```
	], gc[
		```vlang
		struct Bas {
		mut:
			num f32
		}
		
		mut value := Bas{num: 23.0}
		mut value_ptr := &value

		value_ptr.num = 24.0

		println(value_ptr)  // &Bas{24.0}
		println(*value_ptr) // Bas{24.0}
	```
	])

	#v(1em)
	#l-m-hr()
	#v(1em)

	```vlang
		value := Bas{/* ... */}

		mut value_ptr := &value  // error: `value` is immutable, ...

		value_ptr := &value
		value_ptr.num = 24.0     // error: `value_ptr` is immutable, ...
```
]

/*
	The V compiler by default performs escape analysis to determine when to
	allocate variables on the stack or the heap. Returning a pointer to
	a local variable from a function is undefined behavior as that local
	variable will be invalidated on return, it's a constant
	pain point in languages like C and C++. V solves this by doing it for
	you, and it's safe to return a reference to a local variable, as
	V will automatically promote it's allocations. Swift does this,
	Go does this, even some optimising C compilers do this as well.

	In the function "return_reference", the compiler can easily see
	that the local reference "value" is returned, and it will promote
	the allocation of "Foo" the heap.
	
	In the function "use_reference", it doesn't escape the function,
	so it will be allocated on the stack.

	How I see it, V is able to assume and perform this analysis
	because it doesn't allow global mutable state.
	This will help you understand,
*/
#slide(title: "Memory - Stack and Heap")[
	```vlang
		struct Foo {
			inner f32
		}

		fn return_reference() &Foo {
			// heap
			value := &Foo{inner: 23.0}
			
			return value
		}

		fn use_reference() {
			// stack
			value := &Foo{inner: 29.0}

			// use value
		}
```
]

/*
	V doesn't have globals, it's always an opt in feature.
	No global variables at all, only constants.

	This seems like we're walking backwards here, but not really.

	Global variables introduce hidden dependencies between different parts of your code,
	and code that relies heavily on global variables can be challenging to test in isolation.

	In multi-threaded programs, global variables can lead to race conditions and synchronisation issues,
	having them makes reasoning about programs harder. All of a sudden, you don't know what
	is thread safe and what isn't.

	There are better ways to model programs that need global state, there's one on screen now.
	Modeling a program that uses a context throughout the entire program is as simple as creating
	a bunch of methods on a struct that mutate the state of that struct. It's not hard, and
	instantly easily to reason about.

	Most of the time globals are just a cop out.

	I'm indifferent to global variables, but they're usually not needed,
	the average V program isn't a kernel. (That's foreshadowing, but I'll move on.)
*/
#slide(title: "Globals?")[
	#grid(columns: (auto, auto), gutter: 2em, gc[
		```vlang
		// constant value, doesn't change
		const pi_float = 3.14

		struct App {
			state f64
			// ...
		}

		fn (mut a App) perform_action(state f64) {
			// ...
			a.state = state
		}

		fn (mut a App) run() {
			a.perform_action(10.0)
			a.perform_action(15.0)
			a.perform_action(pi_float)
		}
	```
	], gc[
		```vlang

		
		// no globals required.
		//
		// everything happens inside App methods,
		// mutating the App struct.
		
		fn main() {
			mut app := App{}

			app.run()
			
			assert app.state == pi_float
		}
	```
	])
]

/*
	If we're talking about heap allocations, you're probably going to ask,

	What is managing all this memory?

	V already avoids doing unnecessary allocations in the first place by using value types,
	string buffers, no classes, and promoting a simple code style, but you'll eventually
	need to allocate memory on the heap.

	In short, V provides 4 ways to manage memory.

	Manage the whole thing with a tracing garbage collector, manual memory management,
	arena allocation, or autofree. These all can be specified when compiling
	your program with compiler switches.

	I'll mostly be talking about autofree and the GC here.

	V uses a garbage collector by default.

	If hearing GC makes you want to run away, you're probably wrong,
	don't trust the "GC is slow" mantra.

	When Alex was originally working on V, he was very against it,
	expecting them to be slow and use a lot more RAM, but it was actually
	the opposite due to V's design. V's standard library actually manages their
	own memory explicitly, users don't need to worry about turning it off.

	Garbage collection has become so sophisticated and researched that previous
	stereotypes are just completely invalid, and that's what they are, preconceived
	notions based on evidence from the 2000s.

	I've read rust developers scramble and scratch their heads trying understand why
	their program is slower than one that uses a garbage collector. A modern, moving
	garbage collector gets you more allocation throughput, less memory fragmentation,
	and deferred destruction. Most GCs are often faster than reference counting,
	while being completely thread safe, so for the rust users, no need to wrap
	everything in an Arc-Ts.

	V's solution is autofree. It's a compile time switch that
	automatically inserts free calls for you, it's not default for a reason
	as it's in beta, and requires some more work but has proved itself.

	It takes care of about 90-100% of objects, and the remaining small percentage
	are freed via GC, think circular graphs and reference cycles. It's a hybrid
	approach, it's not a full GC, but it's not manual memory management either.
	
	The internals of the compiler are currently being rewritten, and
	after the frontend is done, I'll probably come and help work
	on autofree, I have a couple of ideas for that myself.

	--- pronounciation(Boehm): BOE-EM
*/
#slide(title: "What is managing all this memory?")[
	*It's flexible:*

	1. Incremental Tracing GC (default) \
		--- Boehm GC, the most sophisticated GC present in prodution today. \
		--- Tunable at the compilation level. \
		--- *No, it won't kill you.* \
	2. *Autofree* \
		--- Compiler assisted memory management. \
	3. Manual Memory management \
		--- It's there, but you probably won't need it. \
	4. Arena Allocation \
		--- V's allocation functions will use a custom bump allocator.

	#l-m-hr()

	- All standard library functions actually manage their own memory explicitly, turning off the GC is no problem.
]

/*
	You know what uses autofree? The Vinux Kernel.

	Vinix is an effort to write a modern, fast, and useful operating
	system entirely in V. It's Linux based, offering compatibility
	with it's system calls to ease porting software,
	and It runs doom, because of course it does.

	There are things that are completely unsuitable for kernel development,
	one is garbage collection. Good thing we can switch this off right?
	Vinux uses autofree, with the garbage collection absent.

	V is a safe language by default, but allows you to write low level code
	when needed by shoveling it all behind an opt in layer, or compiler
	switches passed at compilation.

	Vinux uses many of these features.

	To use globals, which should be rare, is allowed with the enable-globals
	compiler switch, and the underscore-underscore-global keyword, which is
	designed to be an eyesore, is used to declare them.

	V also allows you to write inline assembly, which is useful for
	things like context switching, and other low level operations.

	Usually raw pointer operations on references are not allowed at all,
	but V allows you to wrap code in unsafe blocks to do so.

	Calling out to C code is also allowed, and in the example below,
	Vinix is calling out to memset from libc to zero the pointer.
*/
#slide(title: "Low Level Code - Vinix")[
	#grid(columns: (1fr, 1fr), gc[
		#show raw: set text(size: 0.8em)

		```vlang
		// must use `v -enable-globals`
		__global (
			kernel_code_seg = u16(0x28)
			gdt_pointer     GDTPointer
			gdt_entries     [11]GDTEntry
		)
	```

		#l-m-hr()

		```vlang
		pub fn interrupt_state() bool {
			mut f := u64(0)
			asm volatile amd64 {
				pushfq
				pop f
				; =rm (f)
			}
			return f & (1 << 9) != 0
		}
	```

		#l-m-hr()

		```vlang
		mut volatile cmd_ptr := unsafe { &AHCIFISh2d(&cmd_table.cfis) }

		unsafe {
			C.memset(cmd_ptr, 0, sizeof(AHCIFISh2d))
		}
		```	
	], block(inset: 3em)[
		#image("assets/2023-10-01_19-43.png")
		#image("assets/screenshot0.png")
		#v(2em)
	])
]

/*
	I'll quickly go over some of the features that make V a safe by default language.

	V performs bounds checking for arrays and other data structures, and those
	data structures are type safe. There are no undefined values, and no variable shadowing,
	so referencing an identifier will always refer to the same value, you can't
	hide declarations.

	By default, all variables are immutable, and you have to explicitly declare
	mutability. You need to declare mutability on function arguments in the
	declaration, and when calling, you'll be able to see if the function mutates
	an argument at the call site as well. There are no globals, only immutable constants.
	
	This is one of my favorite things about V,
	balancing practicality with purity from the functional world,
	by introducing immutable values by default and no global state by default.

	Control flow is explicit, and error handling is baked into the type system
	with option and result types. Generics are also available, alongside
	compile time type reflection.

	V is a modular language, and always encorages you to use modules, with
	a built in centralised package manager. V also opts for opting for composability
	over inheritance, stepping over the downfalls of OOP.

	(And) You can opt in to unsafe code with unsafe blocks.
*/
#slide(title: "Summed Up Safety")[
	- Bounds checking.
	- Built in *type safe* datatypes (arrays, maps, strings).
	- No undefined values, all zero.
	- No variable shadowing.
	- Immutable by default.
	- Explicit control flow.
	- Error handling with option and result types.
	- Generics and compile time reflection.
	- Modular language, not OOP.
	- No globals, only immutable constants.
	- Opt in to unsafety with `unsafe {}` blocks.
]

/*
	To close off I'll show you a couple idomatic V programs,
	and libraries, and to finish off the section

	I'll walk you through writing a compiler in V
	for a simple language you've probably heard of
	before.
*/
#new-section-slide[Putting It All Together]

/*
	To create a web server, just use the vweb framework.

	It's simple, avoiding global state entirely, by having
	your entire context passed to your endpoints, embedding
	the vweb base context.
	
	You call vweb-dot-run on you context, after defining
	your endpoints, optionally assigning them attributes
	to functions with the at-brackets syntax that govern
	where they point to, and you're done.

	You can also use compile time templating, and the
	compiler will generate the native code that templates
	your html for you following a pretty similar syntax to
	existing V. Those lines with an @ symbol prepended are
	part of the V template language.
*/
#slide(title: "Library - vweb")[
	#show raw: set text(size: 0.8em)

	#grid(columns: (2fr, 1fr), gutter: 2em, gc[
		```vlang
		import vweb

		struct App {
			vweb.Context
		}

		@[get; '/users/:user']
		pub fn (mut app App) user_endpoint(user string) vweb.Result {
			return app.json({
				user: 20
			})
		}

		pub fn (mut app App) index() vweb.Result {
			show := true
			name := 'SYNCS'
			numbers := [1, 2, 3]
			return $vweb.html() // compile time templating
		}

		fn main() {
			println('vweb example')
			vweb.run(&App{}, port)
		}
	```
	], gc[
		```html
		<!-- index.html -->

		@include 'header.html'

		<h1>Hello @{name}!</h1>

		<p>is demo?:</p>

		@if show
			<p>yes</p>
		@else
			<p>no</p>
		@end

		@for i, number in numbers
			<p>number @{i}: @{number}</p>
		@end

		<hr>
		@include 'footer.html'
	```
	])
]

/*
	V also has a built in object relational mapper, or ORM.
	Essentially, it's a domain specific language for working
	with all SQL databases.

	V currently supports MySQL, Postgres, SQLite, and
	Microsoft SQL server.
	
	The ORM provides a number of benefits:

	- (Such as) One syntax for all SQL dialects, so Migrating is easier.
	- Queries are constructed using V's syntax, meaning they're already sanitised against SQL injection.
	- Compile time checks using V's type system.
	- (And) Readability and simplicity, it just hands you the objects in an array.

	I use the ORM for my small blog, combined with the sqlite module, and
	compile time templating. It's been a breeze to work with
	and it makes the codebase much more readable.
*/
#slide(title: "Library - ORM")[
	#show raw: set text(size: 0.8em)

	#grid(columns: (1fr, 1fr), gutter: 1em, gc[
		```vlang
		import time

		[table: 'posts']
		struct Post {
			id int [primary; sql: serial]
		mut:
			created_at time.Time
			tags       string // space separated
			content    string
		}
		```

		#l-m-hr()

		```vlang
		import orm

		// takes an interface
		fn list_posts(db orm.Connection)! {
			posts := sql db {
				select from Post order by created_at desc
			}!

			for single_post in posts {
				println(single_post)
			}
		}
		```
	], gc[
		```vlang
		import db.sqlite
		import time
		
		fn main() {
			mut db := sqlite.connect("data.sqlite")!

			// will ignore if exists
			sql db {
				create table Post
			}!

			post := Post{
				created_at: time.now()
				tags: 'self cs v'
				content: 'presentation at SYNCS! ...'
			}

			sql app.db {
				insert post into Post
			} or {
				panic('sql failed: ${err}')
			}
		}
		```
	])
]

/*
	V is a batteries included language.

	Meaning, most of everything that you'll ever need is
	already included in the standard library.

	Utility libraries, Web libraries, Graphics,
	Games, and UI Frameworks.

	On the slide is a small sample, all of which is
	available to use as soon as you install V, except
	for the V UI Framework, which can be installed with just
	"v install ui".
*/
#slide(title: "The Entire Ecosystem - Batteries Included")[
	Utility
	- #span-sep[*os*][Operating System Interface]
	- #span-sep[*math*][Math Operations]
	- #span-sep[*json*][JSON Generic Serialisation and Deserialisation]
	- #span-sep[*encoding*][Various Text and Binary Encodings]
	- #span-sep[*crypto*][Cryptography]

	Web
	- #span-sep[*net.websocket*][Websocket Client and Server]
	- #span-sep[*net.http*][HTTP Serve and Requests]
	- #span-sep[*net.html*][HTML DOM Manipulation and Parser]
	- #span-sep[*vweb*][V Web Framework]
	- #span-sep[*picoev*][Lightning Fast Event Loop]

	Graphic Libraries, Games, UI Frameworks
	- #span-sep[*gg*][Simple Graphics]
	- #span-sep[*sokol*][Portable OpenGL API]
	- #span-sep[*ui*][V UI Framework]
]

/*
	No, I'm not writing a C compiler.

	I could, but we'll be here for another 3 hours.

	Try to think simpler, like a BrainFuck compiler.
	You've probably heard of it before, but if not, this is how it works.

	BrainFuck is an esoteric programming language that operates on a very minimal set of instructions.
	
	It uses just eight commands, which are represented by individual characters:
	- plus, minus, less-than, greater-than, both square brackets, dot, and comma

	The idea behind brainfuck is just memory manipulation.
	Basically, you are given an array of 30 000 1 byte memory blocks, usually,
	most of the time it's larger.
*/
#slide(title: "Compiler Creation - BrainF*ck")[
	#gc(align(center + horizon)[
		#set text(size: 2em)

		#let v = ([*+*], [*-*], [*<*], [*>*], [*\[*], [*\]*], [*.*], [*,*])

		#stack(dir: ltr, ..v.map(it => rect(inset: 1em, stroke: l-m-accent-colour, it)))
	])
]

/*
	Let's say you have a pointer to the start of of this long array, and
	within it, you can:

	- increment the pointer, and move to the next cell using the right arrow.
	- decrement the pointer, and move to the cell before using the left arrow.
	- increment the value at the pointer using a plus character.
	- (and) decrement the value at the pointer using a minus character.

	These commands manipulate a memory array consisting of cells, each initially set to zero,
	and a pointer that moves along the array.

	After executing this code below the diagram, the memory array will end up like this,
	with the pointer pointing to the second cell, as it moved back.

	This is a simple programming language, but useless without things I'll mention.

	For a language to be turing complete, meaning it can compute anything
	given enough time and resources, it must contain conditional branches.

	(Also) Not having the ability to perform input/output, is pointless too.
	A functionally pure language is useless without IO.

	This language has both.

	- The square brackets are used to loop while the cell on entry isn't zero.
	- The dot is used to output the value of the cell at the pointer, in ASCII.
	- The comma is used to read a single character of input into the cell at the pointer.
*/
#slide(title: "Compiler Creation - BrainF*ck")[
	#gc(align(center + horizon)[
		#set text(size: 2em)

		#let v = ([*0*], text(fill: red)[*1*], [*0*], [*3*], [*0*], [*0*], [*0*], [*0*])

		#stack(dir: ltr, ..v.map(it => rect(inset: 1em, stroke: l-m-accent-colour, it)))

		*>++>>+++<\<-*

		#l-m-hr()

		#[
			#show regex("[^+\-<>\[\].,]+"): set text(l-m-meta-colour)

			```
						+++++[->+<]>
							 ^    !^
			while (cell != 0) repeat between braces
			```
		]
	])
]

/*
	Now that we know how the language works, let's write a compiler for it,
	generating WebAssembly.

	I won't go into detail about WebAssembly, it's just a portable binary
	format for compiling machine code on the web, which has evolved into
	a general purpose compilation target.

	You just have to know that it's like real assembly, with opcodes
	and instructions, and that V supports it, generating WebAssembly
	modules as a compilation target, and for use as a library generating
	WebAssembly inside your program.

	I created this library to assist myself in writing the WebAssembly
	sections of the V compiler. The same one that's exposed to the
	standard library, is the same one used when you compile V to WebAssembly.

	It's API is pretty simple, on the slide is the example used on the
	modules documentation page. Create a module to hold everything,
	then create a function, and add instructions to it, then commit it
	to the module, and compile it to a byte array.
*/
#slide(title: "Compiler Creation - 'import wasm'")[
	```vlang
	import wasm
	import os

	fn main() {
		mut m := wasm.Module{}
		mut func := m.new_function('add', [.i32_t, .i32_t], [.i32_t])
		{
			func.local_get(0) // | local.get 0
			func.local_get(1) // | local.get 1
			func.add(.i32_t)  // | i32.add
		}
		m.commit(func, true) // `export: true`

		mod := m.compile() // []u8

		os.write_file_array('add.wasm', mod)!
	}
	```
]

/*
	You'll be able to follow along with the code,
	I'll start at the main function.

	We want to get the argument supplied to the program, so just index
	into os.args, and if it's not there, print a usage message and return.

	The rest is just a skeleton for the rest of the program, we'll fill
	that in later. This just creates a module, as well as function called
	underscore-start, then exporting it. At the end of the program it just
	compiles the WebAssembly module and writes it to disk.

	How WebAssembly interfaces with the environment outside of the web
	is defined in a specification called the WebAssembly system interface,
	or WASI. Here we just import the functions we need from it, ones
	to read and write from the outside world.
	
	We also need memory to store the cells of the program, so we assign
	it here.

	The underscore-start function is special. It's a convention in WASI
	to have a function called underscore-start, which is the entry point for
	the program.

	On Unix based operating systems, that use the ELF executable format,
	it shares the name as well.
*/
#slide(title: "Compiler Creation - 'import wasm'")[
	#show raw: set text(size: 0.9em)

	```vlang
	import os
	import wasm
	
	fn main() {
		bf_expr := os.args[1] or {
			println("Usage: bf <expr>")
			return
		}
		mut m := wasm.Module{}

		// [accepts] -> [returns], don't worry about the implementation...
		m.new_function_import('wasi_unstable', 'fd_write', [.i32_t, .i32_t, .i32_t, .i32_t], [.i32_t])
		m.new_function_import('wasi_unstable', 'fd_read', [.i32_t, .i32_t, .i32_t, .i32_t], [.i32_t])
		m.assign_memory('memory', true, 2, none)
		
		mut start := m.new_function('_start', [], [])
		{
			generate_code(mut start, bf_expr)
		}
		m.commit(start, true)

		bytes := m.compile()
		os.write_file_array('bf.wasm', bytes)!
	}
	```
]

/*
	What we're actually doing here is just looping over each character
	and matching on each. Any character that isn't a valid BrainF*ck
	character is ignored, they're just comments.

	I've created a variable, or local in WebAssembly terms, called sp,
	this is the pointer which is just an index of the current cell.

	We're also keeping track of the labels for the loops and blocks,
	so we can jump to them later, these are for the operations with the
	square-bracket characters.
*/
#slide(title: "Compiler Creation - 'import wasm'")[
	#show raw: set text(size: 0.9em)

	```vlang
	fn generate_code(mut start wasm.Function, bf_expr string) {
		sp := start.new_local_named(.i32_t, 'sp')

		mut loop_labels := []wasm.LabelIndex{}
		mut block_labels := []wasm.LabelIndex{}

		for ch in bf_expr {
			match ch {
				`>` {/* ... */}        // increment pointer
				`<` {/* ... */}        // decrement pointer
				`+` {/* ... */}        // increment value at pointer
				`-` {/* ... */}        // decrement value at pointer
				`.` {/* ... */}        // print ASCII character at pointer
				`,` {/* ... */}        // read ASCII character at pointer
				`[` {/* ... */}        // open loop
				`]` {/* ... */}        // close loop
				else {}                // comments, ignore
			}
		}
	}
	```
]

/*
	The implementations of the operations that just shuffle the
	pointer around and increment and decrement values are pretty
	straightforward.

	Just a read, increment, write, for the first one.
	For the ones that need to read from memory, it takes a little
	more effort but not much more.

	The load8 function on the right just takes whatever value
	it has and uses it to load a byte from memory. False meaning
	the value doesn't need to be signed, and zero meaning the address
	has an alignment of 1, and offset of zero.

	Unless you're planning on doing some WebAssembly stuff, you
	don't need to know this.
*/
#slide(title: "Compiler Creation - 'import wasm'")[
	#show raw: set text(size: 0.9em)

	#grid(columns: (1fr, 1.2fr), gutter: 1em, align(center, gc[
		```vlang
		`>` {
			// sp = sp + 1
			start.local_get(sp)
			start.i32_const(1)
			start.add(.i32_t)
			start.local_set(sp)
		}
		`<` {
			// sp = sp - 1
			start.local_get(sp)
			start.i32_const(1)
			start.sub(.i32_t)
			start.local_set(sp)
		}
	```
	]), gc[
		```vlang
		`+` {
			// *sp = *sp + 1
			start.local_get(sp)
			{
				start.local_get(sp)
				start.load8(.i32_t, false, 0, 0)
				start.i32_const(1)
				start.add(.i32_t)
			}
			start.store8(.i32_t, 0, 0)
		}
		`-` {
			// *sp = *sp - 1
			start.local_get(sp)
			{
				start.local_get(sp)
				start.load8(.i32_t, false, 0, 0)
				start.i32_const(1)
				start.sub(.i32_t)
			}
			start.store8(.i32_t, 0, 0)
		}
	```
	])
]

/*
	I've included these implementations for completeness sake as well.

	WebAssembly has structured control flow, meaning that it takes on
	a approach with blocks, loops, and if expressions, rather than
	a bunch of labels and gotos like you would see in assembly.

	The code on the left for reading and printing are both similar,
	except the printing operation works on stdout, and the reading
	operation works on stdin.
*/
#slide(title: "Compiler Creation - 'import wasm'")[
	#show raw: set text(size: 0.9em)

	#grid(columns: (1fr, 1fr), gutter: 4em, align(center, gc[
		```vlang
		`.` {
			generate_ciovec(mut start, sp)

			// stdout, *iovs, iovs_len, *nwritten
			start.i32_const(1)
			start.i32_const(runtime_page)
			start.i32_const(1)
			start.i32_const(runtime_page + 1024)
			start.call_import('wasi_unstable', 'fd_write')
			start.drop()
		}
		`,` {
			generate_ciovec(mut start, sp)

			// stdin, *iovs, iovs_len, *nwritten
			start.i32_const(0)
			start.i32_const(runtime_page)
			start.i32_const(1)
			start.i32_const(runtime_page + 1024)
			start.call_import('wasi_unstable', 'fd_read')
			start.drop()
		}
		```
	]), gc[
		```vlang
		`[` {
			block_lbl := start.c_block([], [])
			loop_lbl := start.c_loop([], [])
			{
				// *sp == 0 ? jmp :block_lbl 
				start.local_get(sp)
				start.load8(.i32_t, false, 0, 0)
				start.eqz(.i32_t)
				start.c_br_if(block_lbl)
			}
			loop_labels << loop_lbl
			block_labels << block_lbl
		}
		`]` {
			loop_lbl := loop_labels.pop()
			start.c_br(loop_lbl) // jump back to top
			start.c_end(loop_lbl)
			start.c_end(block_labels.pop())
		}
		```
	])
]

/*
	All it takes to generate code for this language really, is
	to just iterate over the characters in the source code, and
	generate the appropriate instructions for each, we just did that.

	After implementing those operations, you can call the program
	and run the output in a webassembly runtime. What's on the
	slide is a simple cat program, which just outputs exactly what
	is input.

	If my pull request passed, which is probably did by now, you'll
	be able to find the example used inside this presentation in
	the examples directory of V.

	This was just a pretty quick example of how you can use V to
	write compilers. For complex programming language, V's type system
	and match expressions make it really easy to write compilers.
	The V compiler itself is written in V, as well as a couple compilers
	I've worked on myself.
*/
#slide(title: "Compiler Creation - 'import wasm'")[
	#align(center, gc[
		```sh
		cd where/is/your/v
		cd examples/wasm_codegen
		v run bf_compiler.v "+[>,.<]"  # simple "cat" program
		wasmtime bf.wasm               # execute
		```
	])
]

/*
	I'll finish up here.
*/
#new-section-slide[Finishing Up]

/*
	V is probably the most interesting programming language community I've
	been apart of and had the pleasure of working with.

	Beginners and new contributors come and go all the time, and most have
	had a positive experience. People want to make engines, languages,
	libraries, and frameworks from scratch, no one tells people to
	stop "reinventing the wheel", like I've seen in other communities.

	For this reason, I've actively enjoyed contributing to V, and I've
	learned a lot from it.
*/
#focus-slide()[
	The *culture* at #text(fill: rgb("#5b85be"))[*V*]
]

/*
	Here is where I want to conclude my talk.

	Thank you so much for sitting through this, I hope you enjoyed it.

	I'm releasing the entire source code for this presentation,
	all 2600 lines, written in typst markup, and when I get it,
	I'll host the video up there too.

	If you want to talk with me about absolutely anything, you can
	email me, or find more convienient contacts, website. My primary
	project right now is a programming language and optimising compiler,
	so I'll probably need test subjects.

	--- Anything you ask I'll be able to answer.
*/
#slide(title: "QnA - The End")[
	#align(center, gc[
		#underline[https://l-m.dev/talk]

		#v(4em)

		GitHub - *l1mey112* *|* Email - *l-m\@l-m.dev*

		#text(fill: rgb("#15c6be"))[Entire Presentation Written With *Typst.*]
	])
]