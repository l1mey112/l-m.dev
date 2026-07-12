---
title: Creating A Compiler Part 5 - Turing Turing Complete
description: Brain is fucked.
date: 2022-08-07
tags:
  - stas
  - V
  - Compiler
---

Whats better than Turing complete? Turing Turing complete. Simulating a Turing complete language in a Turing complete language gives you this distinction. 

Obviously I had to choose brainfuck, an esoteric language loved by everyone. It's also incredibly simple. I'll run through it's code line by line. Along the road I'll explain new features added in to make this *brainfuck.stas* happen.

I'll first talk about some new parts to the language, the match statement and character literals.

# The Match Statement
:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
The match/switch case statement is a fundamental part of any programming language. Mapping very close to assembly, the match statement is near mandatory for syntactically clean code.

It's a new and needed addition to stas and it acts similarly to other languages.
:::::
::::: {.flex-columns-1}
```
match 11 in
    13 do
        ; 13!
    end
    12 12 += do
        ; 24!
    end
    11 -- do
        ; 10!
    end
end
```
:::::
::::::::::

:::::::::: {.centre-text}

Another thing to keep in mind about match and if headers. It is perfectly legal for them to just be empty, with the condition appearing beforehand. With an empty header, they consume existing values from the stack.

These two pairs of match and if statements are functionally the same.

::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
true if do

end
```
:::::
::::: {.flex-columns-1}
```
if true do

end
```
:::::
::::: {.flex-columns-1}
```
match 1 do

end
```
:::::
::::: {.flex-columns-1}
```
1 match do

end
```
:::::
::::::::::

# Character Literals

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
What if you want to get the value of an ascii character, without using some kind of ascii table?

Just how it works in V, I use backticks to denote a character literal. When scanning source code, it is simply replaced with a number to be pushed onto the stack.
:::::
::::: {.flex-columns-1}
```
"0" ; is a string with one character
`0` ; the ascii value of zero, 48
```
:::::
::::::::::

:::::::::: {.centre-text}

The entire program ...

::::::::::

# brainfuck.stas

```
#include "std.stas"

main ! in do
    local * input_bf [1024]
    input_bf 1024 read_stdin
    
    local * buffer_bf [20000]
    buffer_bf 0 20000 memset

    local int ptr_bf 0

    local * last_loop 0
    local * current_bf 0

    input_bf pop current_bf
    while current_bf * :: 8 @ 0 != do
        match in 
            `>` do
                ptr_bf ++ pop ptr_bf
            end
            `<` do
                ptr_bf 0 != assert
                ptr_bf -- pop ptr_bf
            end
            `+` do
                buffer_bf ptr_bf += @
                * :: 8 ++ & :: 8
            end
            `-` do
                buffer_bf ptr_bf += @
                * :: 8 -- & :: 8
            end
            `.` do
                buffer_bf ptr_bf +=
                1 write
            end
            `,` do
                buffer_bf ptr_bf +=
                getch & :: 8
            end
            `[` do
                current_bf pop last_loop
            end
            `]` do
                last_loop 0 != assert
                buffer_bf ptr_bf +=
                if * :: 8 0 != do
                    last_loop pop current_bf
                end
            end
        end
        current_bf ++ pop current_bf
    end
    endl
end
```

:::::::::: {.centre-text}

... 55 lines, I've seen smaller, but I'd say thats pretty good! 

I'll step through it chunk by chunk.

::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
#include "std.stas"

main ! in do
    local * input_bf [1024]
    input_bf 1024 read_stdin
    
    local * buffer_bf [20000]
    buffer_bf 0 20000 memset
```
:::::
::::: {.flex-columns-1}
At the start of the program I declare two buffers, one containing 1024 bytes and another 20 000 bytes. The first buffer is used to store the brainfuck program, which is read from the standard input.

The second buffer stores the brainfuck "memory tape". This chunk of memory will be manipulated by the brainfuck program. It is set to all zeros using the memset standard library function.
:::::
::::::::::
:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
echo '+[----->+++<]>+.+.' | ./brainfuck
```
:::::
::::: {.flex-columns-1}
The program reads from **stdin**, so just pipe a program in like this!
:::::
::::::::::

:::::::::: {.centre-text}

I initialise all stack variables used in the program next. 

::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
local int ptr_bf 0

local * last_loop 0
local * current_bf 0

input_bf pop current_bf
```
:::::
::::: {.flex-columns-1}

If you are familiar with brainfuck, you would know that there is a pointer that points to the current cell and is manipulated with arrow characters "<" and ">". The variable **ptr_bf** is this value and is incremented and decremented at will.

**current_bf** is a pointer to the current character being interpreted in the brainfuck program. It is set to the beginning of the program buffer and incremented to read the next character in the program.

If the interpreter comes across a "[", a character denoting a new loop in a brainfuck program, it's position is stored in the **"last_loop"** variable. When looping the **"current_bf"** variable, or position in the brainfuck program, is set to back to the beginning of that loop (stored in the **"last_loop"** variable).
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```text
while current_bf *::8 @ 0 != do
```
:::::
::::: {.flex-columns-1}
"While the current character in the brainfuck program does not have an ascii value of zero, do below."

The end of a string of characters is usually contains a null character/byte at the end. A null character contains a value of zero. If we hit one, we can safely exit as the entire program has been read through.

See the @ symbol? After comparision of the current character, a duplicate is made and is left on the stack for the body of the while loop to act on. 
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
match in 
    `>` do
        ptr_bf ++ pop ptr_bf
    end
    `<` do
        ptr_bf 0 != assert
        ptr_bf -- pop ptr_bf
    end
    `+` do
        buffer_bf ptr_bf += @
        * :: 8 ++ & :: 8
    end
    `-` do
        buffer_bf ptr_bf += @
        * :: 8 -- & :: 8
    end
    `.` do
        buffer_bf ptr_bf +=
        1 write
    end
    `,` do
        buffer_bf ptr_bf +=
        getch & :: 8
    end
```
:::::
::::: {.flex-columns-1}
The current character being acted on is currently on the stack and is ready to be consumed by the match statement.

Now to actually interpret the current character, following brainfuck's rules.

"<" and ">" increment and decrement the current cell index in the buffer. "<" also checks if the index is not zero before decrementing.

"+" and "-" increments and decrements the current cell value. Adding the buffers base pointer by the index returns the address of the current cell. I duplicate this value, dereference it, increment it and write the incremented value to the original address. (* and & both consume one pointer, you must duplicate the pointer if you want to use it again.)

The " . " character means print the ascii character at the current cell. I add the buffers base with the current index and use this address as the input to the "write" function, with a length to write of one.

The " , " character takes one character from the user, and places it in the current cell. I get the address of the current cell and call the "getch" function to take input of one character and return it's value. I use those as input to write the byte value to the pointer.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
`[` do
    current_bf pop last_loop
end
`]` do
    last_loop 0 != assert
    buffer_bf ptr_bf +=
    if * :: 8 0 != do
        last_loop pop current_bf
    end
end
```
:::::
::::: {.flex-columns-1}
The "[" and "]" characters mean enter a while loop.

When hitting the "[" character, take note of the current position in the entered code and store it inside the **"last_loop"** variable.

Brainfuck code inside the loop will now execute as normal, until it hits a "]" character. When it does, the current cell value is checked. If it does not equal zero, go back to the loop start (the "[" character). Else, continue execution.
:::::
::::::::::

<br>

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
current_bf ++ pop current_bf
```
:::::
::::: {.flex-columns-1}
Executed at the end of the main while loop's body, this increments the pointer pointing to characters in the entered code buffer.

It simply moves onto the next character in the array and allows the while loop to handle it.
:::::
::::::::::

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```
endl
```
:::::
::::: {.flex-columns-1}
Print a newline character before exiting the program.
:::::
::::::::::

<br>

:::::::::: {.centre-text}

And thats it!

::::::::::

# Closing Notes

Writing brainfuck, or any program for that matter, in my language is one of my goals. It shows how my language is maturing. For next time, I want to implement unit tests for all sections of my compiler. And maybe refactor how variables are implemented at the assembly level, that will make way for a stack datatype I plan to add.

Until then, I'm out!

:::::::::: {.centre-text}

[**Check out the source code on github!**](https://github.com/l1mey112/stas)

::::::::::
