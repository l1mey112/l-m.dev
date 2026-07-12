---
title: A month with C and the terminal - Part 3
description: Part 3, Orthographic projection and meshes, a basic 3D engine!
date: 2022-04-04
tags:
  - C
---

# Orthographic projection and meshes - 3D engine!
![](static-cubelm.Render2.mp4){.mp4-full-50}

Going from 2D to 3D is a big jump, a long and complicated jump. Eitherway, it was the next step in my progression.

I started by completely switching to 4x4 matrices. Why you ask? A 3x3 matrix does not have a way to represent translation in a 3 coordinate system. This was a fault of the last project, using a 2x2 matrix didn’t allow for me to translate objects with the transform only. 

Using a 4x4 matrix is needed if you want to take advantage of homogeneous coordinates, without them camera projections would be impossible.

[Youtube - The Math behind (most) 3D games - Perspective Projection - Brendan Galea](https://www.youtube.com/watch?v=U0_ONQQ5ZNM)
> I learnt everything i needed to know here!

# 3D projection

I went with orthographic projection instead of the more used perspective projection. Mostly for its simplicity.

<figure>

![](image-projection.png){.img-raw}

</figure>

Orthographic projection is a flat projection, while perspective projection is more akin to human vision.

Following the above video, I used the vulkan implementation of the orthographic projection

```c
MATRIX GcreateOrthoVulkan(
		double n, 
		double f, 
		double l, 
		double r, 
		double t, 
		double b)
{
		// n, f - near and far clip
		// l, r, t, b - 
		// left, right, top, bottom 
		// screenspace coords
    
    return (MATRIX){{
        {2/(r-l),0,0,-(r+l)/(r-l)},
        {0,2/(b-t),0,-(b+t)/(b-t)},
        {0,0,1/(f-n),-n/(f-n)},
        {0,0,0,1}
    },4,4};
}
```

This returns a matrix that I can easily apply to a meshes vertices during the rendering step

# How to represent a 3D mesh?

I initially went with a data hierarchy similar to the way it is usually implemented but with a small change. To avoid complexity edges are not included, mesh data only contains faces and their vertices.

```c
MESH->vertices
vertex[0]
vertex[1]
vertex[2]
vertex[3]
// four vertices

MESH->faces
face[0] = 0,1,2,3
//indexes of vertices in the array
```

The mesh stores its own arrays for faces and vertices. A vertex just stores its own position, but faces store the array index of its vertices. So if 4 vertices were stored at index 0, 1, 2 and 3, one face contained around those 4 will store references to those vertices.

→ `mesh.faces = [0, 1, 2 ,3]`

# Rasterisation - Rendering for Video Games

Rasterisation is the reason why realtime rendering exists, its the reason why games can run at 60 fps and higher. Without it rendering would be much, much slower using methods like Ray Tracing.

The definition of Raster image is a file format that's defined by a grid of pixels, like a png or jpeg.

Rasterisation is a method to take 3D objects and map them to a 2D raster or straght to the screen in an efficient and fast way. 

It works by checking if the pixel centers are inside a 3D object, and drawing them in.

Every face of a mesh is looped over and these steps are taken.

1. Initialise variables
2. Loop through every vertex
    1. On every vertex, apply the projection matrix
    1. Append the now 2D vertex position to an array containing a 2D polygon
3. Take the face normal and transform it by the meshes own transformation matrix
4. If the dot product of the face normal and view vector is less than 0, discard the face
5. If the dot product is greater than 0
    1. Call `raster(polygon)`

My `raster()` function is as follows

1. Takes an array of 2D projected face positions and their face attributes.
2. It loops through each pixel inside the bounding box of the projected face.
3. If the pixel’s center is inside the polygon, set the screen buffer to that face attribute.

These grey steps avoid double rendering, by checking if the face is even visible from the viewing vector by using the dot product (more information below)

After this extensive list, `render()` is called

It’s job is to print out and display the scene, but other calculations like lighting is performed here

# Diffuse Lighting!

<figure>

![](image-opengl-diffuse.png){.img-raw}

<figcaption><h4>The angle between both of these vectors give us an indication on how bright a surface should be!</h4></figcaption>
</figure>

Diffuse lighting gives a object more brightness the closer its faces are aligned to the light rays from a light source. 

A dot product can help us with this. The dot product of two vectors returns a value from -1 to 1 based on how aligned two vectors are. Two vectors pointing in the same direction will return 1. Two vectors at 180 degrees, -1.

```c
// ... loop through every pixel ...

double v = V3dotN(
	framebuffer[y][x].normal,
	light_position
));

if (v < 0) v = 0;

printLUT(v);
// using a given number from 0 - 1
// print a coloured ascii character
// using a lookup table
```

# Forward

I feel like I accomplished enough by topping it off with this project. Learning the fundamentals and applying them was super fun and I hope to do more things like this in the future!