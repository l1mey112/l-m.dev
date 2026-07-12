---
title: Softbody dynamics in the terminal
description: (Legacy) Simulating softbodies in V
date: 2022-05-08
tags:
  - V
  - Simulation
---

# Initial

This is my first blog post back in a while. Since then I’ve gotten a lot better at V and has watched it become my sole programming language for development, to the point where I rewrote and improved the backend from my link shortening service from NodeJS to Vweb. The creator even tweeted about one of my projects!

![](image-v-twitter.png){.png-full}

> **Thank you so much!** [Twitter link](https://twitter.com/v_language/status/1520368343601106945)

# Simulating soft body dynamics!
I’ve done small simulations before but I wanted to step it up and take on softbody simulations. I implemented the **Pressurised Spring Mass model.** This way of simulating a spherical soft body has a physical behavior more like a rubber exercise ball or a balloon. A deformable exterior with air filling up the inside, keeping the ball pressurised and round. To simulate these components, two essential basic laws of physics need to be followed. These are **Hooke’s Law** and the **Ideal Gas Law.** I wont go over their fundamentals, just how it is utilised in my simulation and the algorithms around it.

**Before we can talk about the Hooke’s Law, I have to show the data structure of a spring and a vertex.**

```v
struct Vertex {
	mut:
		position Vec = Vec{0, 0} // X and Y position

		velocity Vec        // velocity in units/second
		force    Vec        // force in units
		mass     f64 = 1.0  // mass, defaults to 1 unit
}

```
A vertex is an infinitesimally small point with no volume, but contains a mass. It’s the most important component of a simulation and can be used to represent a multitude of things. Think about it as a single position in space, that is part of our simulation.
```v
struct Spring {
	mut:
		a &Vertex     // references to the
		b &Vertex     // two constrained vertices

		length f64    // rest length
		stiffness f64 // resistance to change
		damping f64   // loss of energy, damping
}
```
A spring constrains two vertices together by a spring force governed by Hooke’s Law. It contains a resting length, stiffness (or resistance to change), and a damping force. A spring will constantly enact forces on it’s two endpoints to bring them to the resting length, by any means necessary.
```v
struct Vec{
	mut:
		x f64
		y f64
}
// a 2D vector, used to 
// represent directions or positions
```

# Hooke’s Law

> Hooke's law is a law of physics that states that the force needed to extend or compress a spring by some distance scales linearly with respect to that distance
> \- [Wikipedia](https://en.wikipedia.org/wiki/Hooke's_law)


![](softbodies-static-springs.mp4){.mp4-full-50}

> **Green = at resting length, Red = stretched past length.**

```v
length_difference := vertex_A.position.distance_to(vertex_B.position) - spring.length
	// the difference in the endpoints distances and the springs resting length
force := length_difference * spring.stiffness
	// the maximum force applied to either endpoint (scalar value)

direction_to_A_from_B := (vertex_A.position - vertex_B.position).normalize()
direction_to_B_from_A := (vertex_B.position - vertex_A.position).normalize()
	// vector of length 1

velocity_difference := vertex_A.velocity - vertex_B.velocity
base_dot := direction_to_A_from_B.dot(velocity_difference)
force += dot * spring.damping
	// calculating damp forces from dot product and adding it to the resulting force

vertex_A.force += direction_to_B_from_A * force
vertex_B.force += direction_to_A_from_B * force
	// final spring force for both endpoints
```

# The ideal gas law

> The ideal gas law, also called the general gas equation, is the equation of state of a hypothetical ideal gas. It is a good approximation of the behavior of many gases under many conditions, although it has several limitations.
> \- [Wikipedia](https://en.wikipedia.org/wiki/Ideal_gas_law)

Pressure and volume are innately linked in relation to gaseous fluids, this is called the ideal gas law. 

# PV = nRT
- P = Pressure
- V = Volume
- n  = Amount of substance (moles)
- R  = Universal Gas constant
- T  = Absolute temperature (kelvin)

**As the volume of an object decreases, the pressure increases.**

Because of this statement, I opted to remove `nRT` from the equation to simplify it further and to allow restructuring. It’s now represented as a single constant in the algorithm.
```v
const nrt = 1.0 * 8.3144621 * 293.15 
// 1.0 moles of substance, at 293.15 kelvin (room temperature, 20°C)
```

With the pressure formula (below), you can combine this with the ideal gas law for the final equation.

:::::::::: {.centre-text}
`P = F / A`
::::::::::

Using the above formula, you can compute the force acted on a surface from just the Area and the Volume of a shape. 

:::::::::: {.centre-text}
`F = A * nRT / V`
::::::::::

**This is the basis for my simulation**

Because this is a 2D simulation, I substitute an object volume for it’s area and face area for length. The formula remains mostly unchanged though. 

First we loop over every spring, take its two vertices and calculate the length between them and multiply that by the `nRT` constant. This is then divided by the entire softbodies area to obtain the force pushing outwards by the normal vector of the edge.

```v
const nrt = 1.0 * 8.3144621 * 293.15
shape_area := softbody.area()

for i, mut spring in softbody.springs {
	length := spring.vertex_A.position.distance(spring.vertex_B.position)
	force_float := (length * nrt) / shape_area
	
	// **calculate normal vector**
	// this part is rather lengthy so i left it out
	
	spring.vertex_A.force += spring_normal_vector * svec(force_float)
	spring.vertex_B.force += spring_normal_vector * svec(force_float)
} // for every single edge, calculate pressure force
```

Computing the entire area over any 2D polygon done as follows. Basically sum the cross products around each vertex. Much simpler than triangulation.
```v
fn (c SoftBodyCircle) area() f64 {
	mut area := 0.0
	for i in 0..c.vertices.len {
		i_next := (i+1) % c.vertices.len
		area += c.vertices[i].position.y * 
						c.vertices[i_next].position.x - 
						c.vertices[i].position.x * 
						c.vertices[i_next].position.y
	}
	return area * -0.5
}
```

# Examples + Observations

![](softbodies-static-1.0-force-lines.mp4,softbodies-static-3.5-force-lines.mp4){.mp4-list}

> n = 0.4 and n = 3.5 respectively

Although this ball is incapable of popping, increasing the amount of substance leads to a large force exerted on the circumference. Pressure force vectors are visualised with the purple lines and stresses on the springs go from green (rest length) to red (stretched).

With this coefficient set to 0.4 it feels more like a half inflated sack of air, with a lot less pressure exerted over time but with a huge force during the initial landing because it was allowed to contract a lot more.

Notice how the force lines and the expansion of the soft body equal each other where n = 3.5, during the initial drop. As the volume increases, force lowers and vice versa, as expected!

# Gravity

Although not as important, it’s still worth the mention. Gravity is just a constant acceleration downwards, at -9.8 meters per second squared. Newton’s second law was made for this one.
```v
const gravity = Vec{0,-9.8}

fn (mut v Vertex) gravity() {
	v.force += gravity * v.mass
}
```

---

# Creating Circles

Circles. What is the most important characteristic besides it’s position? It’s radius. So what’s that other entry there? Sadly computers can only approximate a circle, we can only get so close without our computers burning up. 

The `samples` variable outlines how many vertices our approximated circle contains. We use this as the constructor of sorts for a softbody copy.

```v
struct ProceduralCircle {
	mut:
		position Vec
		radius   f64
		samples  int
}
```

Sampling a point on a circle from an angle is simple if you payed attention during trigonometry. Just take the unit circle as an example.
> cos θ = x, sin θ = y
```v
fn (c ProceduralCircle) sample_point(index int)Vec{
	angle := index / c.samples * 2.0 * math.pi // convert to radians
		// get the angle from the index of the point we want to access

	return Vec{
		c.radius * math.cos(angle),
		c.radius * math.sin(angle)
	} + c.position
}
```

Using the sample point function to gather all the positions of the circle, you can (with some extra values), convert them to vertices and connect each up with a spring. 

```v
softbody = ProceduralCircle{
	radius: 10,
	position: vec(0,20),
	samples: 20
}.make_real( 10, 200.0, 1.0 )
//* mass, stiffness, damping
```

The `make_real()` function to convert a procedural circle to a simulated softbody one is quite long, but just translates from one data structure to another, not too complicated.

# Vertex to Line collision

Eventually I’d have to do some form of collision, so I choice one of the simplest. Collision between a point and an infinitely long line. To do this we need to first find what side of the line the point is on, and if it is on the colliding side, move it to the closest point on the line and reflect its velocity.

(that is why it’s done after the integration step).

```v
struct Line {
	mut:
		position  Vec  // point touching the line
		direction Vec  // line's direction
		facing    bool // collision side
}
```

I wont talk about the side checking since its quite similar to the second step, getting the closest point on the line from a colliding point.

```v
fn (l Line) get_closest(vec Vec)Vec {
	v := vec - l.position
	d := v.dot(l.direction)

	return l.position + l.direction * d
}
```

To find the closest point on a line, get the direction to the lines position, then calculate the dot product to find a projected vectors length along the line. Then use that length multiplied by the lines direction plus it’s position to calculate a point in space, resting on a line, that is closest to the test point. 

**This always works because any point in space makes a right angled triangle between itself, the lines position, and closest point on the line.**

---

# Euler integration

The integration step is the most important component besides the actual physics simulating. It applies forces accumulated over the life cycle of the frame, setting velocities and applying positions.

Just like how velocity represents a change in position, delta time represents a change in time. As the framerate is set to 60 frames a second. The simulation will be calculated 60 times a second, that means it has to simulate within the bounds of 1/60 of a second. 

Although Euler Integration is the least accurate out of a lot of choices, it’s good enough for this use.

```v
const delta = 1.0/fps // fps = 60
fn (mut v Vertex) integrate() {
	v.velocity += v.force * delta / v.mass
	v.position += v.velocity * delta
}
```

---

# Recap!

I’ve glossed over a decent amount of topics pertaining to the simulation, this is a small recap of what you’ve seen.

```v
softbody.prepare() 
	// left out, used to reset forces for the physics body + debugging

softbody.simulate()          
	// simulate internal forces
	// -	spring forces
	// -	pressure dynamics
	// -	gravity
 
softbody.integrate() // euler integration
	// integrate into the simulation, acting on forces and applying to
	// -	velocity
	// -	position

softbody.line_collide(line)  
	// check and act on collisions with a line

softbody.render()
	// display on screen/terminal
```

1. `prepare()`
    1. This is where you reset all force vectors for each vertex. This is because force vectors are accumulated over the frames lifespan, adding each component influencing the body.
2. `simulate()`
    1. Gravity is simulated first, then spring forces and finally pressure dynamics, although order does not matter!
    2. Each component to the simulation is its own function applied to every vertex (gravity) or applied to every spring/edge (spring forces and pressure)
3. `integrate()`
    1. Accumulated forces are now acted upon, changing the velocity each timestep/frame
    2. Velocity is set, then each vertex’s position is changed. The force vector is unused after this step
4. `line_collide()`
    1. Collide against a line. Lines are represented as a position and a direction, extending to infinity.
5. `render()`
    1. Display a representation of the scene in the terminal. The terminal has a limited resolution and only so much can be displayed here. Decimal positions are rounded off to integers and the correct pixels are shaded in.
    2. The terminal uses a different coordinate system to the simulation. The simulation keeps the origin at the center of the screen, whilst terminal coordinates have the origin at the top left. Conversions need to be made to account for this.

# The final Simulation!

![](softbodies-static-0.4.mp4,softbodies-static-1.0.mp4,softbodies-static-3.5.mp4){.mp4-list}

> N coefficient at 0.4, 1.0, and 3.5 respectively

![](softbodies-static-two_lines.mp4){.mp4-full-50}

> Collision with two lines, one at an angle.

# Forward

It’s not the spectacular finish you expected after all that exposition, but I hope I taught you something. That’s really my goal at the end of all this. I came into this project not knowing much about this level of physics simulations, but after 2 days and a lot of tabs, it can be done. This goes for honestly everything, knowledge is really just a search away nowadays. School just picked up again so there hasn’t been as much time as i’d like. I hope to work on some more simulations later though, like fluid simulations. This was a really fun project!

Until then, i’ll be making my leave.

[Full source code](https://github.com/l1mey112/v-2Dsoftbodies)