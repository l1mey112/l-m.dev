---
title: A month with C and the terminal - Part 1
description: A (legacy) post about my first introductions to low level programming, limited graphics programming and the C language. Part 1 of a 3 part series.
date: 2022-04-04
tags:
  - C
---

# Initial

A month ago, I started to learn C. After ditching python, C has become my favourite language to write anything in. It’s simplicity and speed are more than I need for any project. Plus, who needs external libraries? I started this journey using only ASCII and the terminal to render graphics. Everything was written from the ground up from the math functions to screen drawing. 3 Projects were started, each with their own complexity and scope. Ending with a ASCII 3D engine created with no experience, learning as I go.


# Plotting 2D circles and collision detection 
![](static-phys-bouncing.mp4){.mp4-full-50}

While initially learning C, I wanted to try creating a 2D physics engine. I chose the terminal as the render target because graphics libraries were complicated and most were not cross platform. As this was back when I was switching between Windows and Linux the terminal was my best bet.

[Youtube - Coding a Bouncing Ball in Terminal - Tsoding Daily](https://www.youtube.com/watch?v=kLj-H1K317U)

I watched this video a while back gave me the initial idea on how things were going to look. His idea of squishing two lines together into one for smooth circles helped me as a lot as ASCII characters are usually twice as tall as they are wide.

```c
// render loop...

int s1 = screen[y + 0][x]; // row
int s2 = screen[y + 1][x]; // row + 1

if (s1<0 && s2<0){
		// if both rows are filled
    screenout[draw] = 'G';

}else if(!(s1<0) && s2<0){
		// if the higher row was not filled
		// and lower row was filled
    screenout[draw] = ',';

}else if(s1<0 && !(s2<0)){
		// if the lower row was filled
		// but not the higher row
    screenout[draw] = '`';

}else{
		// no rows were filled
    screenout[draw] = ' ';
}

// 011001111
// 111100110
// ^^^^^^^^^
// ,GG, `GG`
``` 
> raw code snippet from render.h

Drawing circles was much easier. Instead of using the formula `x*x+y*y=r` which may cause issues with the strict integer math in use, I just loop through every pixel and calculate its distance from the circle’s center with Pythagoras `sqrt(x*x+y*y)`

```c
double distance(int x, int y){
    return (double) sqrt(x*x + y*y);
}
```
> distance function

```c
// loop through every pixel ....
// for (int px = 0; x<HEIGHT; x++){
// for (int py = 0; y<WIDTH; y++){

// px and py = current pixel position 
// that we are checking against

double s = distance(
		px-circ.pos.y,
		py-circ.pos.x
);

s -= circ.radius;
if( s > 1 ){ s = 1.0; }
// create circle boundary 

screen[px][py] = s;
// assign value to "pixel"
```
Now you can draw circles! Time to make them subject to gravity.

Gravity as we feel it is `9.8m/s^2`, that is 9.8 meters per second of velocity downwards applied every second. With code this is easy ...

```c
// ... physicsUpdate(circle) ...

double gravity = 9.8;
double delta = 1.0/FPS;

circ.velocity.y += gravity * delta;
// apply gravity to velocity

circ.pos.x += circ.velocity.x * delta;
circ.pos.y += circ.velocity.y * delta;
// apply velocity to postion

checkBorderCollision(circ);
```
> apply gravity and velocity independent to frames

What does `checkBorderCollision(circ);` do? It checks the circles axis aligned bounds with the maximum screen bounds.

```c
// if the circle is overlapping the
// left border ...
if (circ.pos.x + circ.radius >= WIDTH){
		circ.velocity = reflectv2(
				circ.velocity, 
				{-1,0} // wall normal
		);
		//... reflect around the wall normal!
}
```

If the circles complete bounds is overlapping any of the 4 screen bounds, set its velocity to “reflect” off the wall. 

<figure>

![](image-reflect.png){.img-raw}

<figcaption><h4>N is the wall normal vector</h4></figcaption>
</figure>

With an incoming vector (velocity) and the reflection normal (wall normal) we can compute the outgoing vector with `Vnew = -2*(V dot N)*N + V`

```c
vector reflectv2(vector IV, vector normal){
    // Vnew = -2*(V dot N)*N + V

    double mag = normalize(&IV);
    double a = dotv2(IV, normal);
    a *= -2;

    IV = multv2scalar(normal,a);
    IV = addv2(IV,normal);

    IV = multv2scalar(vec1,mag);

    return vec1;
}
```
> I wont go in depth, but just know that it works.

This was one of the first projects learning C, creating this really helped me to learn the syntax. Prior knowledge of vectors and such from game engines was useful too. I would later extend this when I learned about matricies.

[Next part!](/cs/a_month_with_c_and_the_terminal_part_2)