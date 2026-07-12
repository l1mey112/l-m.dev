---
title: Porting a C program to V
description: (Legacy) Porting the terminal renderer
date: 2022-04-12
tags:
  - V
  - C
---

# Initial

After exploring the V programming language, I decided to port my existing C terminal renderer to a more modern language like V. Like I said before, porting C programs to V introduces no extra performance cost because V compiles directly to C code. The port took less than an hour. Not a lot of code had to be changed, just remove all semicolons and change function declarations and the result was much easier to work with and improve.

# The improvements noticed immediately

# Defining methods on types

In C, methods had to be detached from the structs that they used.

```c
dot(multiply(subtract(vector,vector2),vector3),scalar)
```

This was rather annoying though, since a product of this was a lot of function nesting. In V, you can simply define functions on any datatype. This resulted in a very readable function chain, similar to JQuery, because functions return the same result type.

```v
vector.subtract(vector2).multiply(vector3).dot(scalar)
```

Because of this doing nearly everything with matrices and other types were very streamlined. 

Here is an example of the definition of the normalise method on a 2D Vector. Notice the `smultiply()` function being called inside the body.

```v
struct Vector2{
	mut:
		x f64
		y f64
}

fn (vec1 Vector2) normalise() Vector2 {
	length := 1.0 / vec1.length()
	return vec1.smultiply(length)
			// scalar multiply (smultiply)
}
```

# The `term` Library

Like most programming languages, V has a pretty extensive standard library. The term library is such a gamechanger for projects like this. No more messing around with ANSI sequences or figuring out how to parse and use simple terminal colours.

Here is a comparison of the code needed to reset the cursor position to the top of the terminal.

```c
void reset(){
    printf("\x1b[%dD", WIDTH+1);
    printf("\x1b[%dA", HEIGHT+1);
}
// ANSI sequences are complicated :(
```
```v
import term

term.set_cursor_position(x:0, y:0)
```

Printing greyscale colours requires a lookup table to be accessed to get the right value for the ANSI colour sequence.
```c
void printLUT(double value){
	int index = round(interpolate(0,23,value));

	printf("\033[38;5;%dm%s",GRAYLUT[index], "██");
}
```

This is much, much better.

```v
fn rgb(r int, g int, b int, msg string) string

print(term.rgb(140,55,255,"██"))
```

# C header and linking jankyness
To work with multiple C files, they must be individually compiled into object files, then linked into one final executable. Programs like GNU Make and other build systems can be used to streamline this process are quite hard to learn. The command `v .` can be used to take an entire directory of V programs and compile them into a single program, no linking and no messing with headers.

One issue though, V’s compiler doesn’t have any evident way to insert/include files similar to how a #include inside C would do. So I wrote my own!

```v
fn main(){
		//?include[meshes/cylinder.mesh]

		facecount := cylinder.f.len		
		println(facecount)
}
```

![](image-preprocessor.png){.png-full-50}

After looking around V’s docs for a solution, I came across the TextScanner module. It’s used to create simple parsers by scanning strings line by line looking for keywords. My preprocessor takes any existing files, looks for an include keyword and inserts another files contents.

# Forward

After porting the existing renderer to V, I made a LOT of additions (almost doubling the codebase in a single day). Too much to list in one post. This is an initial smaller post that just outlined the porting experience. A larger post will be made soon!