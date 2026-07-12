---
title: Creating my own Image format in V
description: (Legacy) My own raw image format!
date: 2022-04-14
tags:
  - V
  - Graphics
---

# Initial

After realising that to read and sample from a texture/image you have to use one or more external libraries. Libraries that I did not want to learn, so like I always do, I made my own image format! I knew it was semi simple, I’ve worked with raw binary data before (remember the websocket project?) so I wasn’t completely blind. By using a python script and **PIL** (Python Imaging Library**)** I was able to read out each pixels value, on any amount of channels.

# How my format works

![](image-raw-hexdump.png){.png-full-75}

> Raw hexadecimal data of an example file, don’t worry! No one will ever see this.

# Bootstrapping the format.

Each colour corresponds to the line of code responsible for writing the data, those 12 initial bytes is all the technical data it needs to reconstruct the final image.

Any discrepancy between the actual data and the bounds of the data outlined in these 12 bytes will indicate if the image is corrupt or not.

```python
f = open(sys.argv[2], "wb")
	# create and open file for writing binary data

img_array = np.array(image, dtype=np.uint8)
	# initialise a numpy array with unsigned integers
	# unsigned, can only represented as positive
sy, sx, ch = img_array.shape
	# store image size on X and Y, then channels
	# RGB = 3 channels, RGBA = 4 channels
f.write(bytes("l-m.dev", 'UTF-8'))
	# write a UTF-8 encoded string as bytes

f.write((ch).to_bytes(1,signed=True))
f.write((sx).to_bytes(2,signed=True))
f.write((sy).to_bytes(2,signed=True))
	# write channel, size x, and size y to the file
```

# Writing Image data
```python
import zlib
	# a very simple library for binary compression
	# also a vlang module :)
img_array = np.array(image, dtype=np.uint8)
sy, sx, ch = img_array.shape
compressed = bytearray()
	# any length array of bytes

for c in range(ch):
    for y in range(sy):
        for x in range(sx):
            compressed += img_array[y, x, c].tobytes()

# every y and x pixel for every channel
# > add its data

f.write(zlib.compress(compressed))
f.close()
	# write compressed bytes and close
```

![](image-raw-firefox.png){.png-full}

> The 32x32 firefox logo, being read from a .rimg, parsed inside V and printed to the terminal!

# Parsing image data in V

Parsing image data is rather simple, just undo the steps taken to insert the original bytes. Pixel colours are stored in a 8 bit unsigned integer (0-255) so dividing by 255 can bring the colour data to a normalised value. 

```v
struct Rimg {
	width u16
	height u16
	channels u8

	mut:
		data [][]Vector4
}
```
```v
fn parse_rimg(mut framebuffer[][] Vector4,name string)?Rimg{
	bytes := os.read_bytes(name)?

	ch := bytes[7]
	sx := bytes[8] | u16(bytes[9]) << 8
	sy := bytes[10] | u16(bytes[11]) << 8
		// parse bytes
	mut raw := Rimg{
		width: sx,
		height: sy,
		channels: ch,
		data: [][]Vector4{}
	} // instance raw image object

	for c := 0; c < ch; c++ {
		for y := 0; y < sy; y++ {
			for x := 0; x < sx; x++ {
				if c == 0 {
					raw.data[y][x].x = f64(data[c*sx*sy + y*sx + x])/255.0
				} else if c == 1 {
					raw.data[y][x].y = f64(data[c*sx*sy + y*sx + x])/255.0
				}else if c == 2 {
					raw.data[y][x].z = f64(data[c*sx*sy + y*sx + x])/255.0
				}else if c == 3{
					raw.data[y][x].w = f64(data[c*sx*sy + y*sx + x])/255.0
				}
			} // (i probably should use switch statements for this)
		}     // data is stored in a unsigned 8 bit integer
	}         // that means values from 0-255 (8 bit colours)
	return raw
}
```

The final output is stored in a struct. It represents colour data in a vector with 4 components for red, green, blue and an alpha channel. The width and height of an image is also stored here, used by sampling functions and for texture filtering.

---

# Texture filtering

Do you want to know why your low res images look blurry? You can thank texture filtering for that. Texture filtering creates extra perceived detail by interpolating the colour between multiple pixels around it. To me, it’s a form of “dumb” upscaling.

Being able to parse my images in V was perfectly fine, but I wanted to implement filtering to make textures a lot cleaner. 

Sampling from the colours of 4 pixels meant that Bilinear interpolation had to be used.

![](image-firefox-nearest.png,image-firefox-bilinear.png){.png-list}

> A 32x32 image rendered at 200x170 with no texture filtering and the same 32x32 image rendered at 200x170 with texture filtering


```v
fn sampletexture(vec Vector2, image Rimg)Vector4{
	mut y := mapf(0.0,1.0,image.height-1,0.0,vec.y)
	mut x := mapf(0.0,1.0,0.0,image.width-1,vec.x)

	point1 := Vector2{x,y}.floor().integer()
	point2 := Vector2{x,y}.ceil().integer()
		//* calculate the upper and lower bounds of the requested UV coordinate
	interp := Vector2{x,y}.subtract(point1.float())
		//* get float component (0-1)

	sample1 := image.data[point1.y][point1.x]
	sample2 := image.data[point1.y][point2.x]
	sample3 := image.data[point2.y][point1.x]
	sample4 := image.data[point2.y][point2.x]
		// the four sample points required for bilinear interpolation
		// linear = 1-2, bilinear = 1-2-3-4

	return sample1.smultiply((1-interp.x)*(1-interp.y))
				.add(sample2.smultiply((1-interp.y) * interp.x))
				.add(sample3.smultiply((1-interp.x)*interp.y))
				.add(sample4.smultiply(interp.x*interp.y))
}
```

# Forward

With simple compression, the file size isn’t too bad. A 1MB png sizes up to 2.1MBs in my raw format. I created this to remove the complexity with managing multiple image formats, which are just abstracted away using a python script and library.

After this addition to the engine, sampling from a texture using a UV coordinates will be incredibly simple.

[Source Code](https://github.com/l1mey112/raw-image-v)