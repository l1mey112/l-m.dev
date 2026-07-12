---
title: A month with C and the terminal - Part 2
description: Part 2, Line drawing + simple linear algebra.
date: 2022-04-04
tags:
  - C
---

> This is a 3 part series!

# Line drawing + simple linear algebra
![](static-asciiplotter2.mp4){.mp4-full-50}
After the simple physics plotter, I wanted to try using 2x2 matricies for transformations like rotation, scale and shear. It led me to this video.

[Youtube - Linear transformations and matrices | Chapter 3, Essence of linear algebra - 3Blue1Brown](https://www.youtube.com/watch?v=kYB8IZa5AuE)

After watching, I came up with these initial functions

```c
// Vadd();
//   Add two vectors together
// VSmultiply();
//   Multiply vector by a number

typedef struct{
    double ix; double jx;
    double iy; double jy;
}MATRIX;

VECTOR Mmul(VECTOR vec, MATRIX mat){
    VECTOR Ihat = {mat.ix,mat.iy};
    VECTOR Jhat = {mat.jx,mat.jy};

    return Vadd(
        VSmultiply(Ihat,vec.x),
        VSmultiply(Jhat,vec.y)
    );
    
}
```

It takes a 2D vector as input, then transforms it by the 2x2 input matrix. Construct a matrix then apply it to the positions of the objects vertices.

# Rotation matrix

```c
MATRIX Mrotate(double degrees){
    double r = degToRad(degrees);
    return (MATRIX)
    {
        cos(r), -sin(r),
        sin(r),  cos(r)
    };
}
```
# Scale matrix

```c
MATRIX Mscale(double s){
    return (MATRIX)
    {
        0, s,
        s, 0
    };
}
```

Objects contain their own transformation matrix that is applied anytime it is rendered to the buffer. Using matrix to matrix multiplication, you can combine two matricies together into one master matrix that you can set an objects transform to with this function ...

```c
// Mmultiply();
//   Multiply (or "combine") matricies
// Mscale();
//   Return scale matrix by factor
// Mrotate();
//   Return rotation matrix by degrees

int quad = createQuad(
		&scene,         // scene struct
		(VECTOR){0,0},  // position
		5,15,           // dimensions
		PURPLE,         // colour
		true     // rendered as wireframe?
);

// ... int main() ...

// apply scale and rotation matrix
applyTransformObject( 
    &scene.objects[quad],
    Mmultiply(
        Mscale(sin(anim.elapsed)),
        Mrotate(anim.elapsed*100)
    )
);
```

Now matricies are out of the way, its time to talk about drawing lines. I drew lines with Bresenham’s line algorithm.

[Bresenham's line algorithm - Wikipedia](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)

The pseudocode on Wikipedia is as follows

```c
plotLine(x0, y0, x1, y1)
    dx = abs(x1 - x0)
    sx = x0 < x1 ? 1 : -1
    dy = -abs(y1 - y0)
    sy = y0 < y1 ? 1 : -1
    error = dx + dy
    
    while true
        plot(x0, y0)
        if x0 == x1 && y0 == y1 break
        e2 = 2 * error
        if e2 >= dy
            if x0 == x1 break
            error = error + dy
            x0 = x0 + sx
        end if
        if e2 <= dx
            if y0 == y1 break
            error = error + dx
            y0 = y0 + sy
        end if
    end while
```

To draw “wireframe” rectangles, 4 line draw calls must be used to outline the bounds of the shape. The bounds can also be transformed by the objects own matrix.

For animation, a new standardised definition was needed. This is the outline of how to create an animation struct and manipulate it

```c
typedef struct{
    unsigned int fps;
    double delta;
    double elapsed;
}Animation;

Animation anim = createAnimation(60);
// takes fps as input, then constructs
// and returns the struct

while(1){
		printf("%g", anim.elapsed);
		printf("%g", anim.delta);
		printf("%u", anim.fps);		

		animationFrame(&anim);
		// wait for single frame
		// then manipulate anim.elapsed
}
```

This system is used extensively in this and in further projects because creating animated frames is much simpler.

This project was the product of wanting to learn basic linear algebra and simple transformations in preparation for the project I did after, the ASCII 3D engine.

[Next part!](/cs/a_month_with_c_and_the_terminal_part_3)