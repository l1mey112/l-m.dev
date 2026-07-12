---
title: Creating A Compiler Part 4 - Language Conventions And Type Checking
description: Simulating, not interpreting
date: 2022-08-06
tags:
  - stas
  - V
  - Compiler
---

# Intro

Back in part 3, I explained that I was going to implement a types system and a type checker. This type checker would verify the program before compiling the final binary. It would simulate the stack by pushing and popping types to be sure that functions are consuming and returning the correct values. 

Since the coming of type checking this version of stas is pretty stable for end users. I can start explaining how the language operates!

I'll run you through a couple basic programs.

# add.stas + while.stas

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
#include "std.stas"

main ! in do
    10 15 +=

    5 +=

    uputln
end
```
:::::
::::: {.flex-columns-1}
This is a very simple program. It starts by pushing 10 and 15 onto the stack and consuming them both to add them together. There is now one value on the stack.

Then 5 gets pushed with them both being added together. The resulting singular value is 30. The unsigned print function is called, taking 30 off of the stack and printing it. The "ln" at the end of the function means a newline will be printed after.
:::::
::::::::::

Everything in stas either consumes values from the stack, adds values onto the stack, or both. You cannot return from a function that returns nothing with values remaining on the stack. The new checker will point this out and give you an error.

The next one is a lot more complicated. While loops are a fundamental part of any language, but they work differently here. The top statements holds code that will be executed at every iteration of the loop, this code must leave a boolean value on the top of the stack. First, some background on the operators below.

The @ symbol is a special operator, it will duplicate the value on the top of the stack. This is very important for self contained while loops.

The decrement operator (-\-), along with the increment operator (++), does not take values off the stack. It simply decrements/increments them. All comparison operators work by consuming two values from the stack and pushing a boolean after the comparison is done.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
#include "std.stas"

main ! in do
    10

    while @ 0 > do
        "Hello!" println
        --
    end
    _
end
```
:::::
::::: {.flex-columns-1}

The program first pushes 10 onto the stack and enters the while loop. It then gets duplicated, zero gets pushed onto the stack and they both get compared. Notice how only the duplicate gets compared, while leaving the original value on the stack now exposed to the inner loop.

Inside the inner loop, a string gets pushed and then printed. This does not affect the value underneath the string left from the header.

Every while loop has an end though, that works by decrementing its value inside the inner loop. It enters back into the header and that value is now duplicated to be compared again!
:::::
::::::::::

After the while loop is done, it would leave a value of zero on the stack. Since you cannot leave functions that return nothing with values on the stack, it uses the drop operator. The drop operator or "_" , simply pops that value off the stack.
:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
For people who are stuck or just want to try out the language, I implemented the "tutor" mode. Once the program is verified by the checker, it then steps through the program's statements and displays information relating to the stack.
:::::
::::: {.flex-columns-1}
```
./stas.sh files/while.stas --tutor
```
:::::
::::::::::

![](video-stastutor.mp4){.mp4-full-75}

:::::::::: {.centre-text}
Keep in mind that it does not simulate the program, it can only display types. It simply hooks into the checker section of the compiler. 
::::::::::

# Type Checking In Detail

Take a look at the new statically typed write function from the standard library.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
write ! in buf * count int do
    1 1 buf count syscall3
    _
end
```
:::::
::::: {.flex-columns-1}
Back in older versions of stas, you would use the exclamation mark to mean a void return. This is still the same.

But you can also see the star and the int keyword. That means the argument "buf" is a pointer, and the argument "count" is an integer.
:::::
::::::::::

# How Does The Checker Work?

**It's actually incredibly simple.**

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```v
[flag] // use as a bitfield
enum BuiltinType {
    void_t
    int_t
    bool_t
    ptr_t
}

struct StackElement {
    pos FilePos
/*  position of a keyword in 
    a file that pushed/created 
    that value (error handling) */
mut:
    typ BuiltinType
/*  type of element */
}
```
:::::
::::: {.flex-columns-1}
This is the checker struct that encompasses the whole compiler pass. 
```v
struct Checker {
    fns map[string]&Function
mut:
    stack []StackElement
    curr IR_Statement
}
```
It contains a map/dictionary of all functions and a "stack" that holds an array of stack elements. The curr value stores the current statement being checked.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
I take a recursive approach, like in most sections of the compiler, it makes it pretty effortless. Once the scanner and then parser finish, the checker gets invoked like this.
:::::
::::: {.flex-columns-1}
```v
c.sim_function(c.fns["main"])
```
:::::
::::::::::

# Stack 'Simulation'

Take a look at the condensed version of the "sim_function" method on the checker: 

```v
fn (mut c Checker) sim_function(ctx &Function){
//  pop all arguments off the stack, in reverse order
    for typ in ctx.args.reverse() {
        c.pop(typ.typ)
    }
    mut entry_pos := c.stack.len
    c.sim_body(ctx.body, ctx)
//	simulate a "body"
//  a body is just an array of statements,
//  with the current function as its 'context'

    if ctx.ret != .void_t {
//      function returns something,
//      check the type of the value at the top of the stack
//      and compare it with the return value of the current
//      function        
        ret := c.stack.last()
        entry_pos++ // make space for the return value
        if !ret.typ.has(ctx.ret) {
            c.error_fp("Return type is incompatible with ${ctx.ret}",ret.pos)
//          use the return stack element's file position for an error
        }
    }
    if c.stack.len != entry_pos {
//      function's stack values are not resolved!
        c.error("Returning from function with $c.stack.len value/s on stack")
//      print an error and a stack 'backtrace'
    }
}
```

It makes sure there is correct values on the stack for it's arguments and takes note of the current stack length. It then simulates all the statements inside the body of the function. If the function returns something it then makes sure that the value's type left on the stack is the same as the functions return type. It finally checks if the stack is left in the same condition as before the stack was simulated, essentially checking for dangling stack values still left.

All "sim_body" does is loop through all the statements, and call another function.
```v
fn (mut c Checker) sim_body(body []IR_Statement, ctx &Function){
    for s in body {
        c.sim_single(s,ctx)
    }
}
```
"sim_single" takes a stas statement and it's current function context then acts on it. Confused? Check this out.

```v
fn (mut c Checker) sim_single(s IR_Statement, ctx &Function){
    c.curr = s
    match s {
        // can add and subtract with pointers and integers
        IR_ADD {
            a := c.pop(.int_t | .ptr_t) 
            b := c.pop(.int_t | .ptr_t) 
            c.push(a | b)
        //  c.pop(.int_t | .ptr_t)
        //  makes sure that the value popped
        //  off is either an integer or a pointer
        }
        IR_SUB {
            a := c.pop(.int_t | .ptr_t)
            b := c.pop(.int_t | .ptr_t)
            c.push(a | b)
        }
        // multiplication and division with pointers are not allowed
        IR_MUL {
            c.pop(.int_t)
            c.pop(.int_t)
            c.push(.int_t)
        }
        IR_DIV {
            c.pop(.int_t)
            c.pop(.int_t)
            c.push(.int_t)
        }
        // makes sure that the top value is an integer or pointer
        IR_DEC {
            c.top(.int_t | .ptr_t)
        }
        IR_INC {
            c.top(.int_t | .ptr_t)
        }
        // ......
    }
}
```

All statements affect the stack in some way, and the checker enforces them. It makes makes sure that there are enough values for operators and that they have the correct types. It also checks for things like pointer arithmetic; Pointers should never be multiplied or divided, but addition and subtraction is perfectly fine. With operators like increment and decrement it makes sure that the top value on the stack is a correct type before progressing. See more conditions below.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```v
IR_EQUAL {
    c.pop(.int_t | .ptr_t | .bool_t)
    c.pop(.int_t | .ptr_t | .bool_t)
    c.push(.bool_t)
}
```
:::::
::::: {.flex-columns-1}
All conditionals consume two values from the stack and push a boolean.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```v
IR_RETURN {
    if ctx.ret != .void_t {
        c.pop(ctx.ret)
    }
}
```
:::::
::::: {.flex-columns-1}
The return keyword lets you return early from a function. If the function does return a value it pops off that value and makes sure that it's type is the same as the current functions return type.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```v
IR_CALL_FUNC {
    c.sim_function(c.fns[s.func])
}
IR_IF {
    c.sim_if(s ,ctx)
}
IR_WHILE {
    c.sim_while(s ,ctx)
}
IR_MATCH {
    c.sim_match(s ,ctx)
}
```
:::::
::::: {.flex-columns-1}
For more complex statements, a separate function is used. Remember when I said I took a recursive approach? 

If the checker encounters a call function statement, it will start simulating that function. It starts at the main function and simulates all inner function calls!
:::::
::::::::::

As you can see the checker would not interpret the program, it just performs simple checks using an internal stack. 

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
Using a union flag/bitfield, it allows the checker to be a lot more lenient. This system allows a sort of type promotion where it can assume more than one type.

This is okay because all types currently share the same width. Later on when structs are implemented, their type checking would be different.
:::::
::::: {.flex-columns-1}
```v
left  := .ptr_t
right := .int_t

return .ptr_t | .int_t
```
:::::
::::::::::

And thats all for the type checking! Seriously, I can't state how useful it is. I also did a couple small but effective additions too.

# Dead Function Elimination

If it is not called, it is not compiled. All functions now contain an internal array of all function calls. Inside the parser, function calls now insert the called function name into the host function's list of function calls. Self/Recursive calls are ommitted. [It may also be the same as Tree Shaking.](https://en.wikipedia.org/wiki/Tree_shaking)

```v
fn (mut g Parser) new_push() IR_Statement {
    if g.curr.token == .name {
        if g.curr.lit in g.fns {
            g.trace("new func call '$g.curr.lit'")
            g.ctx.is_stack_frame = true
            if g.curr.lit != g.ctx.name {    // if fn not calling self
                g.ctx.fn_calls << g.curr.lit // <---- here!
            }
            return IR_CALL_FUNC {
                argc: g.fns[g.curr.lit].args.len
                func: g.curr.lit
                no_return: g.fns[g.curr.lit].ret == .void_t
                pos: g.fpos
            }
        }
    }
/*  ..... */
}
```

After the parser, all functions keep an internal list of what functions they call. After the checker, when code generation takes place, the tree is traversed using recursion.


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
The gen struct (code generation), like the checker and parser, keeps a mutable (able to be edited) map/dictionary of pointers to all avaliable parsed functions.
:::::
::::: {.flex-columns-1}
```v
struct Gen {
mut:
    fns map[string]&Function
}
```
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
It starts at the main function and traverses it's called functions.
:::::
::::: {.flex-columns-1}
```v
g.traverse_tree('main')
```
:::::
::::::::::

After a function's code is generated and written out, the pointer to that function is set to null. This stops it from being compiled multiple times. On traversal of a function it recurses on all functions called by that function. Check out the code below.

```v
fn (mut g Gen) traverse_tree(func string){
    for f in g.fns[func].fn_calls {
        if unsafe { g.fns[f] == nil } {
            continue
        }   // ignore this function

        g.traverse_tree(f)
            // recurse again

        g.file.writeln(g.fns[f].gen())
        g.header.write_string(g.fns[f].gen_rodata(g))
            // generate asm for the header and body

        g.fns[f] = unsafe { nil } 
            // stop from being compiled more than once
    }
}
```

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```nasm
global _start
section .rodata
section .text
_fatal:
    mov rdx, rsi
    mov rsi, rdi
    mov rax, 1
    mov rdi, 2
    syscall
    mov rdi, 1
    jmp _exit
_start:
    call main
    xor rdi, rdi
_exit:
    mov rax, 60
    syscall
main:
    push rbp
    mov rbp, rsp
    pop rbp
    ret
```
:::::
::::: {.flex-columns-1}
With this new addition, including the standard library no longer bloats your executable.

This program below outputs the assembly on the left.

```
#include "std.stas"

main ! in do
    
end
```
:::::
::::::::::

:::::::::: {.centre-text}
What About Those Extra Assembly Labels?
::::::::::

# The Assert Keyword

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
#include "std.stas"

main ! in do
    false assert
end
```
:::::
::::: {.flex-columns-1}
The extra asm code was to allow builtin keywords like "assert" to work without the presence of the standard library. The "_fatal" function takes in a pointer to a array of characters and it's length, this is the message that will be printed before the programs exit.
:::::
::::::::::

The assert keyword is often used when debugging code. It tests if a condition in your code returns true, if not, the program will panic.

The assert keyword generates a panic message. This message will contain the position of the failed assert keyword and an inner message explaining that an assertion has failed.

```as
lit_00001: db 'stas panic: files/main.stas:4:8', 10, \
              '       msg: Assertation failed.', 10, 0
```

The above stas code will generate this main function.

```nasm
main:
	push rbp
	mov rbp, rsp
	push qword 0          ; false keyword
	pop rax               ; start assert keyword
	test al, al           ; check for false
	jne .next_00002       ; true? skip over
	mov rdi, lit_00001    ; move failure msg
	mov rsi, 64           ; move failure msg len
	jmp _fatal            ; exit program with message
.next_00002:              ; continue
	pop rbp
	ret
```

# Closing Up

So much things have changed I have decided to split up this update into a part 4 and a part 5. Check out part 5 for when I show you a brainfuck interpreter written in stas!

:::::::::: {.centre-text}

[**Check out the source code on github!**](https://github.com/l1mey112/stas)

::::::::::