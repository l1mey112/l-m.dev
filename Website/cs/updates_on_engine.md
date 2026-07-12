---
title: Updates on the C terminal rendering engine
description: (Legacy) Heaps of improvements! Mesh importers, depth buffer and occlusion
date: 2022-04-10
tags:
  - C
  - Graphics
---

# Initial
After writing the first blog post, I built upon the rendering pipeline inside the engine. Here are some of the improvements!

# Custom blender mesh importer

Using this custom blender script on a mesh generates code for a custom header file that can be inserted inside the main function. The generated header keeps descriptions for its vertex and face indexes plus their face normals. A rundown of how the script operates is down below.

![](image-suzanne-blender.png){.png-full}

> the blender script alongside suzanne with only quad faces 

![](image-suzanne-internal.png,image-suzanne-data.png){.png-list}

> Initial rendering with a snippet of the generated code, the original generated mesh file is 2385 lines long!

# Script rundown

1. Places the initial definitions with the name of the mesh
2. Reads the face and vertex count and inserts them
3. Loops through every vertex
    1. Reads position vector
    2. Reads the vertex index
    3. Inserts the correct definitions
4. Loops through every face
    1. Checks if the face contains 4 vertices, stop execution if it does not
    2. Reads the vertex indexes
    3. Reads the face normal vector
    4. Inserts the correct definitions along with the default debug colour
5. Copies the final header string to the clipboard

```python
i = 0
for vt in bm.verts:
    returnstring += f"{mesh_name}.v[{i}].p = (VECTOR){{{round(vt.co.x, decimals)},{round(vt.co.y, decimals)},{round(vt.co.z, decimals)}}};\n"

	#                  bmonkey.v[0].p      = (VECTOR){            9.3274         ,        -9.6862           ,         2.1144            };
	#                  bmonkey.v[1].p      = (VECTOR){           -9.3274         ,        -9.6862           ,         2.1144            };
	#                  bmonkey.v[2].p      = (VECTOR){           10.6598         ,        -8.0206           ,         0.6154            };
	#                  bmonkey.v[3].p      = (VECTOR){          -10.6598         ,        -8.0206           ,         0.6154            };
	#                  bmonkey.v[4].p      = (VECTOR){           11.6592         ,        -5.6887           ,        -0.2174            };
	#                  bmonkey.v[5].p      = (VECTOR){          -11.6592         ,        -5.6887           ,        -0.2174            };
	#                  ..............      ...........           .......        ...         ......         ...        ......            ..

    i+=1
returnstring += "\n"
```
> Example of the per vertex code
```python

for fs in bm.faces:
    if len(fs.verts) != 4:
        print("face is not a quad!")
        failed = True
        continue

    returnstring += f"{mesh_name}.f[{fs.index}].v[0] = {fs.verts[0].index}; "
    returnstring += f"{mesh_name}.f[{fs.index}].v[1] = {fs.verts[1].index}; "
    returnstring += f"{mesh_name}.f[{fs.index}].v[2] = {fs.verts[2].index}; "
    returnstring += f"{mesh_name}.f[{fs.index}].v[3] = {fs.verts[3].index}; \n"

	#                  bmonkey   .f[0]         .v[0] = 46; 
	#                  bmonkey   .f[0]         .v[1] = 0;
	#                  bmonkey   .f[0]         .v[2] = 2; 
	#                  bmonkey   .f[0]         .v[3] = 44; 

    returnstring += f"  {mesh_name}.f[{fs.index}].normal = (VECTOR){{{round(fs.normal.x,decimals)},{round(fs.normal.y,decimals)},{round(fs.normal.z,decimals)}}}; \n"
    returnstring += f"  {mesh_name}.f[{fs.index}].debugcolour = DEFAULT; \n\n"

	#                    bmonkey   .f[0]         .normal = (VECTOR){             0.665            ,             -0.7194         ,             -0.2008          }; 
	#                    bmonkey   .f[0]         .debugcolour = DEFAULT;
```
> Example of the per face code

---

# Working depth buffer and Self occlusion

After importing a quad mesh with a hole cut out of it, I noticed something unusual. Faces that should be occluded, were showing! This was not an issue before as I rendered cubes and spheres that did not contain any holes or crevasses.

![](image-rendered-no-occlusion.png){.png-full-50}

Although backface culling was implemented, faces that were facing the camera were still being shown even if they should be covered by other parts of the mesh.

Implementing a working depth buffer was long overdue. I used per face depth information to discard pixels that behind already existing pixels. Ensuring faces behind by other faces will not show up.

![](image-rendered-with-occlusion.png,image-rendered-blender.png){.png-list}

# Fragment to Pixel code

```c
void copyattributes(ATTRIBUTE frag, int x, int y){
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
        return; //! out of bounds

    if (framebuffer[y][x].depth < frag.depth) return;
		    // ignore pixel if it is occluded!

    framebuffer[y][x].colour = frag.colour;
    framebuffer[y][x].depth = frag.depth;
    framebuffer[y][x].normal = frag.normal;
}
```

# Forward

I eventually want to port this to V, where I can introduce new features such as vertex and fragment shaders and smooth shading without the many downfalls of a pure C based program.

Until then, this project will be put to sleep. I thank you for reading!