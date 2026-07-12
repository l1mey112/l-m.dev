---
title: Minor Changes To Improve UX on Physics, Applied
description: Copious amounts of Macro Magic + Touchscreen support
date: 2023-06-30
tags:
  - WebAssembly
  - C
  - Web
sources:
  - "Year 11 Physics, Applied": https://l-m.dev/physics-applied
  - l1mey112/yr11-physics-applied: https://github.com/l1mey112/yr11-physics-applied
  - MDN/Touch Events: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
  - MDN/sessionStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
---

# Intro

Two things are needed in the current simulation website.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
The ability for simulation parameters to persist over reloads.
:::::
::::: {.flex-columns-1}
Using touch controls to pan on mobile touch devices.
:::::
::::::::::

These are in dire need to get implemented, and it only took me a day. Here is the recount.

# Persistent Storage

JavaScript exposes global APIs for 

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
\>> `sessionStorage`
- For the current origin URL
- Data is cleared when the tab is closed
- Reloads persist data
:::::
::::: {.flex-columns-1}
\>> `localStorage`
- Stores data with no expiration date
- Can only be cleared through in browser facilities or through JavaScript
:::::
::::::::::

I don't want it to last forever, just as long as the tab is open. I'll use `sessionStorage`.

Wait, we're using C here, how do you even interface with JavaScript?

## `EM_JS`

```c
EM_JS(void, console_log_hello_from_c, (), {
	console.log("hello!")
});

int main(void) {
	console_log_hello_from_c(); // call with ease
}
```

I mean, it's that easy. Emscripten is magic.

I've used it before, namely to identify if the application is running inside an `<iframe>`.

```c
EM_JS(bool, is_inside_iframe, (), {
	return window.location != window.parent.location;
});

// if (is_inside_iframe()) /* then call */;
```

How does it work?

The innards are a macro monstrosity.

```c
#define _EM_JS(ret, c_name, js_name, params, code)                             \
  _EM_JS_CPP_BEGIN                                                             \
  ret c_name params EM_IMPORT(js_name);                                        \
  __attribute__((used)) static void* __em_js_ref_##c_name = (void*)&c_name;    \
  EMSCRIPTEN_KEEPALIVE                                                         \
  __attribute__((section("em_js"), aligned(1))) char __em_js__##js_name[] =    \
    #params "<::>" code;                                                       \
  _EM_JS_CPP_END

#define EM_JS(ret, name, params, ...) _EM_JS(ret, name, name, params, #__VA_ARGS__)
```

It takes everything inside `__VA_ARGS__`, then stringises it, that means the entire function body, and inserts that string into the `em_js` section. This won't make sense to you now, read on.

We can create a JavaScript function and call it like normal from C, let's implement **persistence**.

## A Naive API

**There are many ways to approach this.** The API must be able to support basically any C datatype that can be coerced from JavaScript, and be easy to call and pass around.

A naive implementation, supporting only floats, may be this.

```c
EM_JS(float, local_storage_get_float, (const char *key, float default), {
	let v;
	if (v = sessionStorage.getItem(UTF8ToString(key)))
		return v;
	return default;
});

EM_JS(float, local_storage_set_float, (const char *key, float value), {
	sessionStorage.setItem(UTF8ToString(key), value)
});
```

And the program follows a simple pattern.

On entry, initialise your variable with the value inside the persistent storage, if it doesn't exist, use a default value.

Perform calculations with the variable throughout the lifecycle of the program, and at the end, write it out back to the local storage. Simple!

```c
float brightness;

void cleanup(void)
{
	local_storage_set_float("brightness", brightness);
}

int main(void)
{
	brightness = local_storage_get_float("brightness", 50.f);

	atexit(cleanup); // run on exit

	while (/* complex operations */)
		brightness = /* complex operation */;
}
```

## Wasteful.

I can see a couple inefficiencies with this design.

1. First, the key. On every call it creates a JavaScript string through a `char *`, then uses it to index the local storage. This is known at compile time, so why go through all this trouble at runtime?

1. Second, there is zero namespacing. For my application, the same URL could contain multiple simulations each with their own local storage. I don't want one page overwriting the data of another. Simple namespacing by using the current `__FILE__` seems like an easy fix.

1. Last, there is no ability to use any type other than `float`. This obviously cannot do. Generics need to be used, but C doesn't have them? More on that later...

To cut down even more, let's also store the default value verbatim in the generic/generated function.

Alright. We need a **generic** getter and setter function, with a **namespaced** and **compile time baked** key.

## Macro Magic

The macro system is a double edged sword, hidden control flow, non hygenic, blah blah blah.

Personally, it doesn't matter to me. I work with what I have.

This is the API I decided on, three macros.

<!-- you cannot destringify strings into tokens, that is why it is not "time_elapsed" -->

```c
#define LOCAL_STORAGE_INIT(type, name, default) ...
#define LOCAL_STORAGE_GET(name) ...
#define LOCAL_STORAGE_SET(name, val) ...

// create JS functions
LOCAL_STORAGE_INIT(float, time_elapsed, 0);

int main(void)
{
	float time_elapsed = LOCAL_STORAGE_GET(time_elapsed);

	/* complex stuff here */
	
	LOCAL_STORAGE_SET(time_elapsed, time_elapsed);
}
```

The `name` parameter is the namespaced key into the local storage. Take note that it isn't a string, but an identifier. This is because I need an identifier to perform token concatenation, you can't convert a string into an identifier inside a preprocessor macro, only the other way around.

Other than that it's pretty bland, which is good!

This is the macro implemenation.

```c
#define LOCAL_STORAGE_GET(name) local_storage_##name()
#define LOCAL_STORAGE_SET(name, val) local_storage_set_##name(val)
#define LOCAL_STORAGE_INIT0(...) EM_JS(__VA_ARGS__)
#define LOCAL_STORAGE_INIT(type, name, default)                       \
    LOCAL_STORAGE_INIT0(type, local_storage_##name, (), {             \
        let v;                                                        \
        if (v = sessionStorage.getItem(__FILE__ + "_" + #name))       \
            return v;                                                 \
        return default;                                               \
    });                                                               \
    LOCAL_STORAGE_INIT0(void, local_storage_set_##name, (type val), { \
        return sessionStorage.setItem(__FILE__ + "_" + #name, val);   \
    })
```

It's a lot to take in, I'll go through it one by one starting with `GET` and `SET`.

---

```c
#define LOCAL_STORAGE_GET(name) local_storage_##name()
```

The preprocessor operator `##` performs token concatenation.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```c
LOCAL_STORAGE_GET(value) // macro invok
```
:::::
::::: {.flex-columns-1}
```c
local_storage_value() // function call
```
:::::
::::::::::

In other words, `hello##world`, will be treated like `helloworld` after the preprocessing stage. This is powerful when expanding a macro, I use it to call the functions generated. 

---

Okay, what does `__FILE__ + "_" + #name` mean?

The `__FILE__` identifier is special, it's filled in by the preprocessor and is interpreted as a string literal containing the current file's name.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
```
__FILE__ + "_" + #name
```
:::::
::::: {.flex-columns-1}
```
"file.c" + "_" + "value"
```
:::::
::::::::::

Combining the use of `#name`, which converts an indentifier into a string literal, the expression expands to the above. Keep in mind, the body of the `EM_JS` is in JavaScript land, they use `+` for string concatenation.

Oh yeah, the `__VA_ARGS__` dumps all the tokens from the `...` into the invocation of the next function. It's used to make sure we evaluate all macros in the entire JS function, then allow it to be converted into a string inside `EM_JS`.

---

Now, to create these functions using `LOCAL_STORAGE_INIT`.

Calling `LOCAL_STORAGE_INIT` will generate two functions used for getting and setting.

```c
LOCAL_STORAGE_INIT(float, emission_rate, 10);
```

```c
EM_JS(float, local_storage_emission_rate, (), {
	let v;
	if (v = sessionStorage.getItem("file.c" + "_" + "emission_rate"))
		return v;
	return 10;
});
EM_JS(float, local_storage_set_emission_rate, (float val), {
	return sessionStorage.setItem("file.c" + "_" + "emission_rate", val);
});
```

See? Easy C generics, using copious amounts of macros.

## Real World Example

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
This is inside the source code of the [potential energy](https://l-m.dev/physics-applied#potential_energy) simulation.

First, we initialise all of the local storage that needs to be tracked. Keep in mind the use of a default value.

Inside the `init2` function, which is called before the first frame is drawn, the values are extracted from the browser's local storage.
:::::
::::: {.flex-columns-1}
```c
#define USE_INIT2
#include "demos.h"

static bool show_about;
static float g;
static float m;

LOCAL_STORAGE_INIT(bool, show_about, true);
LOCAL_STORAGE_INIT(float, g, 9.8);
LOCAL_STORAGE_INIT(float, m, 100.0);

static void init2(void)
{
	show_about = LOCAL_STORAGE_GET(show_about);
	g = LOCAL_STORAGE_GET(g);
	m = LOCAL_STORAGE_GET(m);
}
```
:::::
::::::::::

Okay, now in the ImGui side.

Special sliders and checkboxes always return `bool`, this is so that you can check if the widget was interacted with during the current frame. I use this to update local storage, so that this value is persisted through reloads.

```c
igBegin("Hello Dear ImGui!", 0, ImGuiWindowFlags_AlwaysAutoResize);
{
	if (igCheckbox("Show About", &show_about))
		LOCAL_STORAGE_SET(show_about, show_about);
}
igEnd();
```

Now you can reload as much as you want, and those precious floats that you set seconds ago won't go away!

# Touch Events

This site needs to cater to basically everyone on a wide range of devices. This may be the web, but that isn't enough abstraction.

The simulations pan around with the right and middle mouse buttons in a click and drag motion. Whilst left mouse clicks are emulated through library abstractions, devices that use touchscreen are neglected, cursed to have their viewport stuck at the origin. They arent able to pan at all!

It's annoying opening the website on my phone whilst not being able to pan.

I am using ImGui + sokol, but even then ImGui can't represent touchscreen presses.

I'll have to hook into JavaScript again, I need to be able to handle double touch pan.

## [MDN To The Rescue](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

```js
document.addEventListener("touchstart", handleStart);
document.addEventListener("touchend", handleEnd);
document.addEventListener("touchcancel", handleCancel);
document.addEventListener("touchmove", handleMove);
```

I trust that you'll be able to read the code to understand the basic API, else, read the MDN article.

:::::::::: {.flex-columns}
::::: {.flex-columns-1}
We're only interested in **start** and **move**.

The values returned inside `client*` are absolute screen positions, we need to expose the change in position every frame to implement dragging.

To get the delta every frame, you need to store the absolute position and the previous position from the last absolute position, subtract them, set values, and you're done.

```c
EM_JS(float, touch_get_x, (), {
	let dx = __t_cx - __t_px;
	__t_px = __t_cx;
	return dx;
});

EM_JS(float, touch_get_y, (), {
	let dy = __t_cy - __t_py;
	__t_py = __t_cy;
	return dy;
});
```
:::::
::::: {.flex-columns-1}
```js
var __t_cx = 0; // absolute pos
var __t_cy = 0; // absolute pos
var __t_px = 0; // prev pos
var __t_py = 0; // prev pos

function touchstart(event) {
	let touches = event.touches;
	if (touches.length == 2) {
		__t_cx = __t_px = touches[0].clientX;
		__t_cy = __t_py = touches[0].clientY;
	}
}

function touchmove(event) {
	let touches = event.touches;
	if (touches.length == 2) {
		__t_cx = touches[0].clientX;
		__t_cy = touches[0].clientY;
	}
}
```
Those JavaScript functions on the right are called every frame to the get the change in position, if any.
:::::
::::::::::

I searched around, seeing if there was a way to detect if the page is a mobile device.

> "There's no single approach that's truly foolproof."

Coutesy of stackoverflow. This stopped me from bothering, for most devices the line is being slowly blurred.

Is it a touch device? Is it a mouse device? Is it both?

Specifics don't matter to me, I call this every frame instead.

```c
if (igIsMouseDragging(ImGuiMouseButton_Right, 0.f) || igIsMouseDragging(ImGuiMouseButton_Middle, 0.f))
{
	__delta_scroll.x += __io->MouseDelta.x;
	__delta_scroll.y += __io->MouseDelta.y;
} else {
	__delta_scroll.x += touch_get_x(); // handle mobile
	__delta_scroll.y += touch_get_y(); // handle mobile
}
```

# The End.

Two seemingly minor changes add a whole lot. Below is a screenshot from my iPhone, using Firefox.

![](image-physapplied-iphone.png){.png-full}

Panning around with a double touch and the peristent settings work perfectly.

Until next time.