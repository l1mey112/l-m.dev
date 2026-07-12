---
title: How To Make A V Compiler Backend
description: "`import v.gen.your_backend_here`"
date: 2023-02-25
tags:
  - V
  - Compiler
sources:
  - CONTRIBUTING.md: https://github.com/vlang/v/blob/master/CONTRIBUTING.md
  - Wikipedia/Compiler: https://en.wikipedia.org/wiki/Compiler
  - My V Fork: https://github.com/l1mey112/v
---

# Intro

**Most compilers take a three stage design.**

The **front end** gathers all of the input code, generates tokens, verifies syntax, creates an AST and performs type checking.

- `v.scanner`
- `v.parser`
- `v.checker`

The **middle end** performs optimisations and transformations, removes unneeded code, evaluates constant expressions and handles generics.

- `v.eval`
- `v.transformer`
- `v.table`

The **back end** generates code. It may also perform more optimisations and transformations that are specific for the target.

- `v.gen.c`
- `v.gen.native`
- `v.gen.js`
- `v.gen.golang`
- `v.gen.wasm` (I am working on this!)

Want to introduce V to a new exotic target? You need a new *backend*.

- `v.gen.your_backend_here?`

# A V backend.

A V backend is executed after the front and middle stages are complete. All types, generics, and missing links are resolved. **The entire Abstract Syntax Tree is at your disposal.**

Want to create one? Congratulations, you are a compiler developer.

This guide assumes high and low level knowledge. Compiler development, ASTs, types, V, basic info about the structure and layout of the V compiler, and some persistence. Surface level knowledge about expressions, statements, and other AST constructs is also needed.

Fork the V repository, open it in your favorite code editor, and let's start!

# Boilerplate First!

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
- `cmd/tools/builders/example_builder.v`

```v
module main

import v.builder.examplebuilder

fn main() {
    examplebuilder.start()
}
```
:::::
::::: {.flex-columns-1}
For multiple reasons, the V compiler creates multiple executables for each compiler backend. Inside `cmd/tools/builders` all compiler backends are compiled when needed and invoked from here.

Import your compiler backend, then `.start()` it!
:::::
::::::::::

- `vlib/v/builder/examplebuilder/examplebuilder.v`

This is the code that actually implements the backend entrypoint.

It grabs all user files, module imports, files from the `builtin` V module, executes all front and middle stages of the V compiler, then calls the actual compiler backend.

```v
module examplebuilder

import v.pref
import v.util
import v.builder
import v.gen.example

// This is the function called above...
pub fn start() {
    mut args_and_flags := util.join_env_vflags_and_os_args()[1..]
    prefs, _ := pref.parse_args([], args_and_flags)
    builder.compile('build', prefs, compile_example)
}

pub fn compile_example(mut b builder.Builder) {
    // Get V files passed to the compiler by the user.
    mut files := b.get_user_files()
    
    // This compiler backend cannot handle the builtin library yet.
    // Omit this, most backends need special treatment.
    // files << b.get_builtin_files()
    
    b.set_module_lookup_paths()
    if b.pref.is_verbose {
        println('all .v files:')
        println(files)
    }
    // Call example backend.
    build_example(mut b, files, b.pref.out_name)
}

pub fn build_example(mut b builder.Builder, v_files []string, out_file string) {
    // Call the V scanner, parser, checker, transformer....
    b.front_and_middle_stages(v_files) or { return }
    util.timing_start('Example GEN') // Start timing
    {
        example.gen(b.parsed_files, b.table, out_file, b.pref) // Call your backend!
    }
    util.timing_measure('Example GEN') // End timing
}
```

---

- `vlib/v/gen/example/gen.v`

Let's actually implement a stub version of our compiler backend.

```v
module example // `import v.gen.example`

import v.pref
import v.ast

pub fn gen(files []&ast.File, table &ast.Table, out_name string, pref_ &pref.Preferences) {
    println("Hello example backend, compiling ${files.len} file/s!")
}
```

This is the real entrypoint to our backend. It takes each file's AST, the V symbol table, the output name path, and the current compilation preferences.

Preferences store things such as compiler flags, `-g` for debug, `-v` for verbose, and so on.

---

Okay, we have the entrypoint to our backend. But how does the V compiler know that our backend even exists?

- `vlib/v/pref/pref.v`

Add `Backend.example`.

```v
pub enum Backend {
    c // The (default) C backend
    golang // Go backend
    interpret // Interpret the ast
    js_node // The JavaScript NodeJS backend
    js_browser // The JavaScript browser backend
    js_freestanding // The JavaScript freestanding backend
    native // The Native backend
    example // The Example backend <-----------------
}
```

`fn backend_from_string` is responsible for getting the backend from the `-b` compiler option.

Add a field for `Backend.example`.

```v
pub fn backend_from_string(s string) !Backend {
    // TODO: unify the "different js backend" options into a single `-b js`
    // + a separate option, to choose the wanted JS output.
    match s {
        'c' { return .c }
        'go' { return .golang }
        'interpret' { return .interpret }
        'js' { return .js_node }
        'js_node' { return .js_node }
        'js_browser' { return .js_browser }
        'js_freestanding' { return .js_freestanding }
        'native' { return .native }
        'example' { return .example } // <-----------------
        else { return error('Unknown backend type ${s}') }
    }
}
```

- `cmd/v/v.v`

Now, inside the V compiler executable, add allow the backend executable to be called.

```v
fn rebuild(prefs &pref.Preferences) {
    match prefs.backend {
        // ....
        // ....
        .example {
            util.launch_tool(prefs.is_verbose, 'builders/example_builder', os.args[1..])
        }
    }
}
```

--- 

Okay, lets recap what we just did.

---

1. `cmd/tools/builders/example_builder.v`

The executable that is invoked by `v.v`, calls `.start()`.

2. `vlib/v/builder/examplebuilder/examplebuilder.v`

This file is the entrypoint to the compiler backend. Grabbing all of the user files and importing modules, executing the front and middle stages of the V compiler.

It then calls `example.gen()`, executing the compiler backend on the V AST.

3. `vlib/v/gen/example/gen.v`

This is the actual compiler backend. It takes each file’s AST, the V symbol table, the output name path, and the compilation preferences.

4. `vlib/v/pref/pref.v`

Insert a new field for our example backend inside `enum Backend`.

Then inside `fn backend_from_string`, add a branch to match a string to our new backend.

5. `cmd/v/v.v`

The V compiler. Inside `fn rebuild` add a branch to execute our compiler backend executable that we made in step one.

---

Alright, these are all the supporting files we need!

The code inside `vlib/v/gen/example` is where you will spend 99% of your time in, as this is where the actual compiler backend is implemented. You won't need to step out of there.

# Calling Our Backend.

Use these commands to recompile V and invoke your backend.

```
$ ./v self
$ ./v -b example a.v
Hello example backend, compiling 1 file/s!
```
`./v self` will recompile the V executable, and allow recompilation of the backend.

Best to do it all in one line, and only recompile the backend we need when changes are made.

```
$ ./v cmd/tools/builders/example_builder.v && ./v -b example a.v
Hello example backend, compiling 1 file/s!
```

We wrote all this code, created all of these files, what can it do?

Currently, nothing!

# The Example Backend.

Run through this code with me. This is the structure that a compiler backend often follows.

```v
module example

import v.pref
import v.ast
import v.util

// The master `Gen` struct, is passed around and stores the current backend's state.
[heap; minify]
pub struct Gen {
    pref     &pref.Preferences = unsafe { nil }
    files    []&ast.File
    out_name string
mut:
    table    &ast.Table = unsafe { nil }
}

// Display simple string error messages from your backend.
// ```
// g.error("Feature not implemented")
// ```
[noreturn]
pub fn (mut g Gen) error(s string) {
    util.verror('example error', s)
}

// Called to handle and generate a list of AST statements.
pub fn (mut g Gen) stmts(stmts []ast.Stmt) {
    for stmt in stmts {
        g.stmt(stmt)
    }
}

// Called to handle and generate a single AST statement.
fn (mut g Gen) stmt(node ast.Stmt) {
    g.error('example.stmt(): unhandled node: ' + node.type_name())
}

// Called to handle and generate a single AST expression.
fn (mut g Gen) expr(node ast.Expr) {
    g.error('example.expr(): unhandled node: ' + node.type_name())
}

// The backend entrypoint.
pub fn gen(files []&ast.File, table &ast.Table, out_name string, pref_ &pref.Preferences) {
    // Create a `Gen` struct, this will store everything.
    mut g := Gen {
        out_name: out_name
        files: files
        pref: pref_
        table: table
    }

    // Iterate over all files and generate their contents.
    for file in g.files {
        // Handle existing errors.
        if file.errors.len > 0 {
            g.error(file.errors[0].str())
        }
        // Generate all code statements inside a file.
        g.stmts(file.stmts)
    }
}
```

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```v
// a.v
fn main() {}
```
:::::
::::: {.flex-columns-1}
With all of this boilerplate code put in place, you can start compiling a file. Create one following the left.
:::::
::::::::::

Okay, let's compile and run our new changes!

```
$ ./v cmd/tools/builders/example_builder.v && ./v -b example a.v
example error: example.stmt(): unhandled node: v.ast.Module
```

We hit an unhandled node, `ast.Module`.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Even though not present in our file, an `ast.Module` is provided implicitly.
:::::
::::: {.flex-columns-1}
```v
// it's implicit anyway
module main
```
:::::
::::::::::

`ast.Module` isn't very important to code generation, so we can just skip it.

Make these new changes below.

```v
fn (mut g Gen) stmt(node ast.Stmt) {
    match node {
        ast.Module {}
        else {
            g.error('example.stmt(): unhandled node: ' + node.type_name())
        }
    }
}
```

Now we're getting somewhere! `ast.FnDecl` is an AST node that represents a function declaration.

```
$ ./v -b example a.v
example error: example.stmt(): unhandled node: v.ast.FnDecl
```

This is easy stuff, let's move on.

# Tiny cgen!

V is an extensive language.

Your new compiler backend will not support all of V, this is okay. The most advanced V backend is `cgen`, it generates C code from V and is the implementation of V you would be most familiar with.

In this guide, We are going to create a simplistic backend that generates C code like `cgen`.

Early compiler backend development would follow a process like this.

1. `error: unhandled node: 'ast.NodeHere'`
1. Implement code generation for the unhandled AST node
1. Repeat

**Don't let this fool you though, compiler backend development is very involved.**

Consult other V developers! Ask questions! ASK QUESTIONS!

Do not be afraid to ask, especially when concerning matters about your own compiler backend. It's important, as the implementation of V must be as close to perfect as possible.

Time to block out some basic code generation.

## `ast.Type`


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
`ast.Type` represents a type inside V.

An `int`, `&struct`, `string`, whatever it is. All represented by a single unit.

:::::
::::: {.flex-columns-1}
Under the hood, `ast.Type` is an integer.

```v
module ast

type Type = int
```
:::::
::::::::::

Since `ast.Type` is just an integer, it poses several questions.

- What about field information for a `struct` or `enum` type?
- Methods on an `interface`?
- How do you know the parent type for an alias?
- All types on a sumtype?

I'll give you the rundown.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-2}
An `ast.Type` is packed with multiple fields.

1. An `index` into the global symbol table of all type.
1. `flag`s containing type flags. Variadics, Options...
1. The amount of indirections on a type, `nr_muls`.
    - `&&int`, `nr_muls == 2`

:::::
::::: {.flex-columns-1}
```v
    flag: u8
          |     index: u16
          |        |
Type = 0xFF__FF__FFFF = int
              |
    nr_muls: u8
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Access a type symbol on the symbol table using the `.sym()` function.

```v
// `v where struct TypeSymbol`
ts := g.table.sym(typ)
```

The type symbol contains everything to do with a type, all kinds.

:::::
::::: {.flex-columns-1}
```v
module ast

pub fn (t &Table) sym(typ Type) &TypeSymbol {
    idx := typ.idx() // int(typ & 0xFFFF)
    if idx > 0 {
        return t.type_symbols[idx]
    }
    // unreachable
    // ....
}
```
:::::
::::::::::

Each built in concrete type inside the symbol table, such as integers and strings, have their own type index.

## V types to C types.

Since we're generating C code from V code, translating between types is needed.

Create this function.

```v
fn (g Gen) ctyp(typ ast.Type) string {
    // Pointers will not be implemented, keep the scope down.
    if typ.nr_muls() > 0 {
        g.error('ctyp: pointers are not implemented')
    }
    
    // Match concrete types.
    return match typ.idx() {
        ast.void_type_idx { 'void' }
        ast.bool_type_idx { '_Bool' }
        ast.i8_type_idx { 'char' }
        ast.i16_type_idx { 'short' }
        ast.int_type_idx { 'int' }
        ast.i64_type_idx { 'long' }
        ast.u8_type_idx { 'unsigned char' }
        ast.u16_type_idx { 'unsigned short' }
        ast.u32_type_idx { 'unsigned' }
        ast.u64_type_idx { 'unsigned long' }
        ast.usize_type_idx { 'size_t' }
        ast.isize_type_idx { 'ptrdiff_t' }
        else { g.error('ctyp: ${*g.table.sym(typ)} is unimplemented') }
    }
}
```

## `ast.FnDecl`


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Since we want to generate readable C code, it must have decent indentation.

`cgen` does this already, it's implemented with a simple integer with the amount of indentations needed.

Add the `writeln` method.

When using `writeln` to write out a line of code, append needed indentations.

:::::
::::: {.flex-columns-1}
```diff
[heap; minify]
pub struct Gen {
    pref     &pref.Preferences = unsafe { nil }
    files    []&ast.File
    out_name string
mut:
    table    &ast.Table = unsafe { nil }
+   ident    int
}
```
```v
fn (g Gen) writeln(s string) {
    println(`\t`.repeat(g.ident) + s)
}
```
:::::
::::::::::

```v
fn (mut g Gen) stmt(node ast.Stmt) {
	match node {
		ast.FnDecl {
			// Further reading:
			//   `v where struct FnDecl -mod vlib/v/ast`
			//   `v where struct Param -mod vlib/v/ast`
			
			cname := util.no_dots(node.name) // convert `main.main` to `main__main`
			ret := g.ctyp(node.return_type)  // convert V types to C types
		
			// Take all parameters and create a list of C arguments
			param_strings := node.params.map("${g.ctyp(it.typ)} ${it.name}")
			
            // Write function declaraion
			g.writeln("${ret} ${cname}(${param_strings.join(", ")}) {")
			g.ident++
			{
				g.stmts(node.stmts)
			}
			g.ident--
			g.writeln("}")
		}
		else {
			g.error('example.stmt(): unhandled node: ' + node.type_name())
		}
	}
}
```

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
The backend now generates this code on the right.

```v
// a.v
fn unsigned(a u32, b i16) {}
fn hello(a int, b i8) {}
fn main() {}
```
:::::
::::: {.flex-columns-1}
```c
void main__unsigned(unsigned a, short b) {
}
void main__hello(int a, char b) {
}
void main__main() {
}
```
:::::
::::::::::

It may not seem like much for now, but your backend will grow exponentially the more nodes you implement.

## Time to do something useful.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Let's implement `ast.AssignStmt`.

Assigning and reassigning variables are done with this AST node. V also supports multiple expressions in a list, these must be handled too.

Since we are implementing an AST node that uses expressions, we would have to implement those also.
:::::
::::: {.flex-columns-1}
```v
// a.v
fn main() {
    a, b := 10, 15

	mut c := 10
    c = 15
    c *= 2
}
```
:::::
::::::::::

`writeln` is used to write an entire line with indentation.

This is not always useful, so these new functions need to be added.

```v
fn (g Gen) write_indent() { print(`\t`.repeat(g.ident)) }
fn (g Gen) write(s string) { print(s) }
```

Alright, the implementation of `ast.AssignStmt` is right here.

```v
fn (mut g Gen) stmt(node ast.Stmt) {
	match node {
		ast.Module {}
		ast.FnDecl {}
		ast.AssignStmt {
			if node.has_cross_var {
				// a, b := b, a
				// a, b := function()
				g.error('ast.AssignStmt: complex assign unimplemented')
			}

            //
            // `a, b := 10, 15`
            // 
            // node.left == [a, b]
            // node.right == [10, 15]
            // 
			
			for idx in 0 .. node.left.len {
				// Converts `int literal` types, into `int`
				// and `float literal` types, into `f64`.
				typ := ast.mktyp(node.left_types[idx])

				if node.left[idx] !is ast.Ident {
					// Does not support:
					//   `a.b := 10`
					//   `*a = 10`
					// Only supports:
					//    `a := 10`
					g.error('ast.AssignStmt: complex lvalues not implemented')
				}
				// `v where struct Ident -mod vlib/v/ast`
				left := node.left[idx] as ast.Ident

				g.write_indent()
				if node.op == .decl_assign {
                    // Variable declaration with `:=`
					g.write("${g.ctyp(typ)} ")
				}

                // V's operators are quite similar to C's
                // We can get away with a simple `.str()`
				opstr := if node.op == .decl_assign { "=" } else { node.op.str() }
                
                // `name op expression`
                // `a = 10`
				g.write("${left.name} ${opstr} ")
				{
					g.expr(node.right[idx])
				}
				g.write(";\n")
			}
		}
		else {
			g.error('example.stmt(): unhandled node: ' + node.type_name())
		}
	}
}
```

Let's add a simple expression so that the assign statement can handle it, the `ast.IntegerLiteral`.

```v
fn (mut g Gen) expr(node ast.Expr) {
	match node {
		ast.IntegerLiteral {
            // The implementation of `ast.IntegerLiteral`,
			// copied straight from `cgen`.
            
			if node.val.starts_with('0o') {
				g.write('0')
				g.write(node.val[2..])
			} else if node.val.starts_with('-0o') {
				g.write('-0')
				g.write(node.val[3..])
			} else {
				g.write(node.val)
			}
		}
		else {
			g.error('example.expr(): unhandled node: ' + node.type_name())
		}
	}
}
```

---

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```v
fn main() {
    a, b := 10, 15
    
	mut c := 10
    c = 15
    c *= 2
}
```
:::::
::::: {.flex-columns-1}
```c
void main__main() {
    int a = 10;
    int b = 15;
    int c = 10;
    c = 15;
    c *= 2;
}
```
:::::
::::::::::

## `ast.InfixExpr` and `ast.Ident`


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Let's handle binary expressions, and referencing other variables.
:::::
::::: {.flex-columns-1}
```v
fn main() {
    a := 10
	b := a + 10
}
```
:::::
::::: {.flex-columns-1}
```c
void main__main() {
    int a = 10;
    int b = a + 10;
}
```
:::::
::::::::::

```v
fn (mut g Gen) expr(node ast.Expr) {
	match node {
		ast.IntegerLiteral {}
		ast.InfixExpr {
			g.expr(node.left)
			g.write(' ${node.op} ')
			g.expr(node.right)
		}
		ast.Ident {
			if node.obj !is ast.Var {
				// Globals, Constants. Both not supported.
				g.error('ast.Ident: unsupported variable type')
			}

			// Local Variables.
			g.write(node.name)
		}
		else {
			g.error('example.expr(): unhandled node: ' + node.type_name())
		}
	}
}
```

## `ast.Return` and `ast.CallExpr`

Most of these implementations don't need an explanation. You know V, you know C, you got this!

```v
fn (mut g Gen) stmt(node ast.Stmt) {
	match node {
		ast.Module {}
		ast.FnDecl {}
		ast.AssignStmt {}
		ast.Return {
			if node.exprs.len > 1 {
				// return a, b
				g.error('ast.Return: multi return unimplemented')
			}

			g.write_indent()
			g.write("return")
			if node.exprs.len == 1 {
				g.write(" ")
				g.expr(node.exprs[0])
			}
			g.write(";\n")
		}
		else {
			g.error('example.stmt(): unhandled node: ' + node.type_name())
		}
	}
}
```

```v
fn (mut g Gen) expr(node ast.Expr) {
	match node {
		ast.IntegerLiteral {}
		ast.InfixExpr {}
		ast.Ident {}
		ast.CallExpr {
			if node.is_method {
				// struct.call()
				g.error('ast.CallExpr: complex ast.CallExpr not implemented')
			}
			cname := util.no_dots(node.name) // convert `main.main` to `main__main`

            // `main__main();`
			g.write("${cname}(")
			{
				for idx, arg in node.args {
					g.expr(arg.expr)
					if idx + 1 < node.args.len {
						g.write(", ")
					}
				}
			}
			g.write(")")
		}
		else {
			g.error('example.expr(): unhandled node: ' + node.type_name())
		}
	}
}
```

---

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```v
fn give() int {
	return 15
}

fn add(a int, b int) int {
	return a + b
}

fn main() {
    a := add(give(), 15)
}
```
:::::
::::: {.flex-columns-1}
Works as advertised.
```c
int main__give() {
        return 15;
}
int main__add(int a, int b) {
        return a + b;
}
void main__main() {
        int a = main__add(main__give(), 15);
}
```
:::::
::::::::::


## Housekeeping

V supports function hoisting. That means functions can be called before their linear declaration in a V file.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```v
fn main() {
    a := call()
}
fn call() int {
	return 10
}
```
:::::
::::: {.flex-columns-1}
```c
void main__main() {
    int a = main__call();
}
int main__call() {
    return 10;
}
```
:::::
::::::::::

This obviously generates invalid C code with implicit declarations. All functions must be predefined at the top of the file first.

Loop over all of the functions in the symbol table, then add their definitions.

Also, add the C main function at the very bottom down there.

```v
pub fn gen(files []&ast.File, table &ast.Table, out_name string, pref_ &pref.Preferences) {
	mut g := Gen {
		out_name: out_name
		files: files
		pref: pref_
		table: table
	}

    // ----------
	// | Declare all C functions before their implementation.
	for name, func in table.fns {
		cname := util.no_dots(name)
		ret := g.ctyp(func.return_type)
	
		// Take all parameters and create a list of C arguments
		param_strings := func.params.map("${g.ctyp(it.typ)} ${it.name}")
		
		g.writeln("${ret} ${cname}(${param_strings.join(", ")});")
	}
	g.write("\n")

	for file in g.files {
		if file.errors.len > 0 {
			g.error(file.errors[0].str())
		}
		g.stmts(file.stmts)
	}

    // ----------
    // | C main function.
	g.write("\nint main() { main__main(); }\n")
}
```

# Recap

Let's go over what we just did.

1. Support for only concrete value types
1. Basic Function declarations
1. Variable assignments
1. Infix expressions, function calls

As you can tell, not much. But it's a start.

Our backend does not compile the `builtin` module. That means no strings, no I/O, no error handling. As you add more features to your simple backend, you'll be able to introduce more code from the standard library that support your subset of V.

Prepare to be patient, you'll get there.

Goodbye!