---
title: A DVD Screensaver For The Bootsector
description: Mandelbrot looked cooler TBH
date: 2022-09-30
tags:
  - Assembly
---

# Intro


DVD screensavers, everyone loves them. Somehow a nostalgic part of everyone's childhood?

I've done bootsector coding before, the assembly is always really fun to write.

Why not give that a try?

First, baby steps. I needed to get a rectangle drawn as a prerequisite.

# Rendering The Rectangle, No DVD Logo Yet

```
$ git checkout 4891dec333eeac0f4ac40b49ffacc7cd12da608e
$ make run
```

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
I'll go over the basic startup stuff, before the main loop. 

Fixing up the base pointer, going into 320 by 200 pixel video mode with 256 colours and setting up the extra segment to point to the start of video memory.
:::::
::::: {.flex-columns-1}
This is how the main event loop goes.
1. Draw rectangle
1. Sleep
1. Screen collision
1. Clear the rectangle
1. Apply velocity
:::::
::::::::::
```nasm
mov bp, sp

mov ax, 0013h ; http://www.techhelpmanual.com/89-video_memory_layouts.html
int 0x10

mov ax, 0xA0000 / 16  ; x86 segment 
mov es, ax            ; to vram
```
:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```nasm
struc rectdef
	.x:      resw 1 ; reserve 2 bytes
	.y:      resw 1 ; ..
	.w:      resw 1 ; ..
	.h:      resw 1 ; ..
	.colour: resb 1 ; reserve 1 byte
endstruc
```
NASM supports struct definitions, this is what I use to group the rectangle's state together. Although not supported as a complete compiler intrinsic, NASM opted to use their powerful macro system for that, it still works very well.
:::::
::::: {.flex-columns-1}
```nasm
%define VGA_WIDTH  320
%define VGA_HEIGHT 200

%define BASEVELOCITY 2

rect:
istruc rectdef
	at rectdef.x,      dw VGA_WIDTH / 2
	at rectdef.y,      dw VGA_HEIGHT / 2
	at rectdef.w,      dw 30
	at rectdef.h,      dw 20
	at rectdef.colour, db 13
iend
```
:::::
::::::::::

Accessing the fields of the defined global struct is done with memory offsets created with the struct macro.
```nasm
mov ax, [rect + rectdef.x]
add ax, [rect + rectdef.w]

mov bl, [rect + rectdef.colour]
```
With that out of the way, you can draw the rectangle with that data stored. Drawing the boundaries is quite simple, if you've done 2D drawing before.

```nasm
mov byte [rect + rectdef.colour], 0
mov ax, rect
call draw_rect
```
:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```nasm
; AX: (*rect)
draw_rect:
	push bp
	mov bp, sp

	mov bx, ax
	
	mov ax, [bx + rectdef.x]
	add ax, [bx + rectdef.w]
	push ax

	mov ax, [bx + rectdef.x]
	sub ax, [bx + rectdef.w]
	push ax

	mov ax, [bx + rectdef.y]
	add ax, [bx + rectdef.h]
	push ax

	mov ax, [bx + rectdef.y]
	sub ax, [bx + rectdef.h]
	push ax


	; bp - 2 | x + w
	; bp - 4 | x - w
	; bp - 6 | y + h
	; bp - 8 | y - h
```
:::::
::::: {.flex-columns-1}
On lines 108 and 109, a stack frame is set up to prepare for some stack variables we push.

Since the AX register cannot be used to index into a memory location with an offset, the contents is put into the BX register.

The next four groups of 3 instructions are used to compute the boundaries of the rectangle. This is because this rectangle is defined with a center X and Y position along with the width and height being half lengths.

Indexing down from the base pointer reveals those 4 variables.
:::::
::::::::::
:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```nasm
	; AX: Horizontal
	; BX: Vertical
	; DI: Address relative to VRAM
	; DL: colour

	mov dl, [bx + rectdef.colour]
	mov bx, [bp - 8]
	vloop:
		mov ax, [bp - 4]

		mov di, bx
		imul di, 320
		add di, [bp - 4]

	hloop:
		mov byte es:[di], dl
		inc di

		inc ax
		cmp ax, [bp - 2]
		jne hloop

		inc bx
		cmp bx, [bp - 6]
		jne vloop

	leave
	ret
```
:::::
::::: {.flex-columns-1}
This is the main loop, reponsible for filling in all of that data.

The comment above shows what registers are used in the loop. It starts at the left, filling in each scanline from top to bottom.

That's the entire drawing function!
:::::
::::::::::

# Time To Make It Move

Handling the movement is easy, just apply a constant X and Y velocity every frame. The screen collision is a different story though.

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```nasm
; %define BASEVELOCITY 2

; handle X collision

    mov ax, [rect + rectdef.x]
    add ax, [rect + rectdef.w]
    cmp ax, VGA_WIDTH
    jge right
    mov ax, [rect + rectdef.x]
    sub ax, [rect + rectdef.w]
    cmp ax, 0
    jle left
    jmp nextX
right:
  	mov word [velocity.x], -BASEVELOCITY
  	jmp nextX
left:
  	mov word [velocity.x], BASEVELOCITY
nextX:

; handle X collision

	mov ax, [rect + rectdef.y]
	add ax, [rect + rectdef.h]
	cmp ax, VGA_HEIGHT
	jge up
	mov ax, [rect + rectdef.y]
	sub ax, [rect + rectdef.h]
	cmp ax, 0
	jle down
	jmp nextY
up:
	mov word [velocity.y], -BASEVELOCITY
	jmp nextY
down:
	mov word [velocity.y], BASEVELOCITY
nextY:
```
:::::
::::: {.flex-columns-1}
The velocity is two seperate variables from the rectangle struct. 

```nasm
velocity.x: dw 0
velocity.y: dw 0
```

Whenever the bounds of the rectangle pass the sides of the screen it's velocity is inverted to start traveling in the other direction, a rebound.

Later on, when I tried to optimise for space I realised that handling the collision seperately was a waste. Since the drawing and collision step both compute the bounds of the rectangle, I merged them.

This is how the position gets updated with it's velocity, it is called after collision every frame.
```nasm
mov ax, word [velocity.x]
add word [rect + rectdef.x], ax
mov ax, word [velocity.y]
add word [rect + rectdef.y], ax
```

The velocity gets set to a negative value, but since signed binary numbers are represented with the twos complement the add instruction actually does subtraction.
:::::
::::::::::

# Sleeping

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```nasm
; CX:DX microseconds
; 0xf4240 : one second
sleep:
	mov al, 0
	mov ah, 0x86
	mov dx, 0xAFFF ; 45.055 milliseconds
	mov cx, 0x0
	int 0x15
	clc
	ret
```
:::::
::::: {.flex-columns-1}
If you constantly redraw every frame without waiting at all, the screen will look like a flashing mess. Here's how to slow it down.

Interrupt 15 in hex (with AL being 86h) is used to slow down the CPU by a certain amount of microseconds. 16 bits, the largest size avaliable in registers, can only store a total of 65 milliseconds. This interrupt, like most others, uses two 16 bit registers combined for a single 32 bit value.
:::::
::::::::::

![](video-dvd-rendering-rectangle.mp4){.mp4-full}

A little bit of screen tearing, but good for a first test.

# But Where Is The DVD Logo?

All of that code above was about 200 bytes.

We only have 512 bytes in the entire sector, for data and code. Read that?

A 20 by 20 pixel image is 400 bytes. A 17 by 17 pixel image will just barely fit inside along with the existing 200 bytes. I came to this realisation pretty early, how would I copy an image to the screen?

Until I found out about the hex 11 video mode. 640 by 480 pixels, 2 colours. Not 256 colours, two colours. Having a single bit per pixel instead of a byte per pixel made this all work.

The same 20 by 20 pixel image will now be 50 bytes instead of the 400 bytes it was before. There isn't any colour, just black and white, but does that matter? The DVD logo is a solid colour anyway.

I use a python script to generate the bitmapped image from the original PNG's alpha (transparency) channel.

```make
main.elf boot.bin: 
	nasm -Ovx -g3 -F dwarf -f elf32 main.asm -o main.o $(shell cat dvd/macroout)

dvd/rawdvdbytes: 
	cd dvd && python3 image.py 2> macroout > rawdvdbytes
```

The raw image bits goes to standard out and standard error is the macro definitions that go to NASM.

I use these macro definitions inside the code to tell it the image dimensions so I don't have to hardcode them.

```python
def printdef(a):
	sys.stderr.write(f"{a} ")

im = Image.open('dvdlogo-04.png').convert("RGBA")

_, _, _, a = im.split() # discard other colour channels

alphab = bytes(np.array(a))

bit_array = bitarray()
bit_array.setall(0)

a = 0
for b in range(0, alphab.__len__()):
	if b % x == 0:
		if b != 0:
			for _a in range(0, bit_array.padbits):
				bit_array.append(0)
		a += 1
		# printdef(f"{bit_array.nbytes}")
	else:
		bit_array.append(int(alphab[b] > 100))

ner = int(math.ceil(x / 8))
printdef(f"-DSCANLINE_BYTE_LEN={ner}")
printdef(f"-DIMAGE_SCANLINE_AMT={int(round(int(a) / int(2)))}")
printdef(f"-DIMAGE_RECT_WIDTH={int(round(int(ner) / int(2)))}")

sys.stdout.buffer.write(bit_array.tobytes())
```

# incbin

Using the 'incbin' NASM compiler intrinsic the image can be embedded straight into the binary. Since we place labels before the binary inclusion, we have a pointer straight to the data.


:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```nasm
image_dvd: 
incbin "dvd/rawdvdbytes"
image_dvd_end:

%if $-$$ > 510
	%error ----- exeeded 512 bytes ----- 
%endif
```
:::::
::::: {.flex-columns-1}
The macro if statement checks if the resulting executable sector has not gone over the 512 byte limit. The 510 there is for reserving the 2 byte BIOS executable signature.
:::::
::::::::::

Now when drawing each individual scanline of the rectangle, sample from the texture at the correct position. Since the video mode is 8 pixels per byte, drawing to the screen is incredibly fast!

:::::::::: {.flex-columns .align-items}
::::: {.flex-columns-1}
```nasm
; BL: boolean, 1 for draw 0 for clear
; ...
; ...

mov ax, 0
mov dx, [bp - 8]
vloop:
	mov di, dx
	imul di, VGA_WIDTH
	add di, [bp - 4]

	imul si, ax, SCANLINE_BYTE_LEN - 1
	add si, image_dvd

hloop:
	mov cx, SCANLINE_BYTE_LEN - 1

	test bl, bl
	je .zero
	
	rep movsb
	
	jmp .next
.zero:
	push ax
	mov ax, 0
	rep stosd
	pop ax
.next:

	inc ax
	inc dx
	cmp dx, [bp - 6]
	jne vloop
```
:::::
::::: {.flex-columns-1}
This is the updated version of the drawing loop.

The 'hloop' label is redundant, instead I use x86 string instructions to copy out the entire scanline. This saves space and makes the program much simpler without having to use extra registers.

You can also see the macros containing the image dimensions generated by the python script.

Right after the 'hloop' label you can see the CX register being set to the amount of bytes in a single horizontal line in the image. The 'rep' prefix before string operations uses the CX register, designated as a counter in the original x86, to mark it's current position when copying.

The 'movsb' copies from memory located inside the SI register straight to the DI register, while using CX as a count. Because of the 'rep' prefix the CX register is decremented after every repeat, when it reaches zero it stops. This is like the 'memcpy' C function, compilers may even use this instruction when optimising on certain x86 systems.

The 'stosd' is like the 'memset' C function. Whatever is inside the AX register is used to fill up memory locations pointed to by DI, while also using CX as a count.

When the function is called, the BL 8 bit register is set to either one or zero. When it is zero the '.zero' branch is taken, clearing out all the pixels inside the rectangle. When it is one, each byte from the image is copied to the video memory.
:::::
::::::::::

# The End.

![](video-dvd-in-qemu.mp4){.mp4-full}

Pretty anticlimactic right? I think so.

It was a nice idea that popped into my head, I just couldn't resist at least trying it.

It's not the most fully featured DVD screensaver. No colour changing and the logo is quite small. That's what 512 bytes will give you, I still think I did pretty good though!

As always, code [right here](https://github.com/l1mey112/bootsector-dvd-screensaver) (github) and [also here](https://git.l-m.dev/l-m/bootsector-dvd-screensaver) (git.l-m.dev)

CYA !

\- lm