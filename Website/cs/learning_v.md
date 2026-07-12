---
title: C is how old now? - Learning the V programming language
description: (Legacy) Time to move on to newer things.
date: 2022-04-10
tags:
  - V
---

# Initial

I heard about V from a random YouTube short talking about up and coming programming languages. It talked about V’s similarities with the Go programming language while improving on many things. No undefined values, no global state, immutability by default and no garbage collector all while being as fast as native C without the hassle of managing your memory.

V is a simple but powerful language for writing fast, maintainable code. What really stood out to me was that V used C as a backend. V code compiles to human readable C code incredibly fast. This allows for porting existing C libraries to V in a way that introduces no performance overhead. Cross compiling is easy too, just specify a different operating system and the V compiler will take care of the rest.

# Improvements that I love

I’ve written almost all of my applications and scripts in C, till now. V just makes the development experience better. Here are some improvements V makes on C

# Variable assignment
```c
int           integer = 10;  // signed 16 bit integer
unsigned int uinteger = 300; // unsigned 16 bit integer

float         decimal = 5.88;   // 32 bit float
double       decimal2 = 9.9999; // 64 bit float

bool          boolean = true;    // #include<stdbool.h>
char       greeting[] = "Hello"; // character array
```
```c
int number = 5;

number += 5;
```

---

```v
integer  := 10       // defaults to 32 bit integer
uinteger := u32(300) // unsigned 32 bit integer

decimal  := f32(5.88) // 32 bit float
decimal2 := 9.9999    // defaults to 32 bit float

boolean  := true    // inbuilt type
greeting := "Hello" // character array
```
> type inferred variables
```v
mut number := 5

number += 5
```
> numbers cannot be mutated (changed) without the mut keyword (this is a good thing!)

# Working with arrays and for loops

```c
for (int i = 0; i < 10; i++) {
    /* run 10 times */
}
```

```c
int array[5] = {1,2,3,4,5};

for (int i = 0; i < 5; i++) {
    printf("%i > %i\n",i,array[i]);
} // print index + array value
```
> its okay, but we can do better

---

```v
for i in 0..10 {
		/* run 10 times */ 
}
```

```v
array := [1,2,3,4,5]

for i, variable in array {
	println("$i > $variable")
} // print index + array value
```
> simple python-like syntax with string interpolation using the $ keyword

# Operations on arrays

```c
int numbers[] = {10,32,2,8,9}

for (int i = 0; i<5; i++) {
		if (numbers[i] == 2) return true;
}
```
> checking if an element is inside a loop

```c
int id[2];

id[0] = 222;
id[1] = 555;
// id[2] = 777; 
// Will not compile!
```
> fixed length arrays

---

```v
numbers = [10,32,2,8,9]

return 2 in numbers
```
```v
id := []int{cap: 2}

id << 222
id << 555
// id << 777
// Will not compile!
```
# Strings
```c
#include <string.h> // string operations

char  helloworld[] = "Hello";
const char world[] = " World!";

strcat(helloworld,world);
// char *strcat(char *dest, const char *src)

printf("%s", helloworld)
```
> concatenation from the standard library is quite annoying
---
```v
mut helloworld := "Hello"
world          := " World!"

helloworld += world

println(helloworld)
```
> as simple as that!

# Pointer arithmetic (memory safety)
```c
int *p;
p = malloc(2);

p[0] = 1;
p++;
p[0] = 2;

assert(*p == 2);

p--;

assert(*p == 1);
```
```v
mut p := unsafe{ malloc(2) }

unsafe {
	p[0] = 1
	p++
	p[0] = 2
}

assert *p  == 2
unsafe { p-- }
assert *p == 1
```
> although it may seem like a downfall, V ensures memory safety by only allowing memory-unsafe code inside unsafe blocks

# Terminal based sorting algorithm visualiser in V

Array manipulation is very easy in V. Built in methods allow many sorting algorithms to be simplified and readable.

```v
const (
	b_size = 50 // size of board
	r_iterations = 80 
		// how many shuffle iterations
)

struct Column{
	mut:
		value int
} // struct to store column values

fn main() { 
//	....
	mut board := []Column{}
		// array of columns

	for i in 0 .. b_size {
		board.insert(i,Column{value: i+1})
	} // instantiate board
//	....
}
```
```v
for _ in 0 .. r_iterations{
	render(b_size-1,board)
	rpos := rand.int_in_range(0,b_size)?
	board.insert(rpos,board.pop())
	render(rpos,board)
} // randomize board
```
Built in array methods make working with arrays much simpler.

`board.insert(position,element)` :: Inserts element at position.

`board.pop()` :: Removes the last element in an array, and returns it.

Both of these functions were used extensively throughout this project.
[Source Code](https://github.com/l1mey112/sorting-v)

![](static-sorting.mp4){.mp4-full-50}

> bubble sort, selection sort and finally insertion sort

---

# Encrypted filesharing using websockets in V
Being that a cryptographic library and a fully fledged HTTP and Websocket library were featured in V, I had to try this.
[Source Code](https://github.com/l1mey112/filesharing-v)

# Sending files to the relay server

```v
fn encrypt(mut data []byte, key []byte) []byte {
	cipher := aes.new_cipher(key)
		// create aes cipher for encrypting

	if data.len % 16 != 0 {
		for _ in 0 .. data.len % 16 {
			data << '\x00'.bytes()
		}
	} // set byte length to 16-byte blocks
	
	chunks := arrays.chunk(data,16)
		// chunks = byte[][]
		// split into 16-byte chunks
	mut encryptedlist := []byte{}

	for i in 0 .. chunks.len {
		mut encrypted := []byte{len: aes.block_size}
		cipher.encrypt(mut encrypted, chunks[i])
		encryptedlist << encrypted
	}

	compressed := zlib.compress(encryptedlist) or {
		panic("failed to compress")
	}

	return compressed
}
```
> encryption and compression function

Reading and sending files was quite simple

```v
filebytes := os.read_bytes(filename) or {
	// failed to read, panic now!
}
return filebytes
```

```v
mut client := start_client()?

// 0x02 = binary data opcode
client.write( filebytes,0x02 ) or {
	// failed to send
}
```

![](static-clasend.mp4){.mp4-full-50}

> **The final data sent over the websocket connection has 40 bytes of information at the start to contain the filename data, then the rest is the compressed encrypted bytes that contain the file.**

> **Your own encryption key, stored as a `.vkey` beside the executable is read and used as an input to the encryption function. A copy is saved with the files name when sending a file and is the only way to decrypt it.**

---

# Websocket implementation using callbacks

The `start_client()` function is called whenever the CLI app needs a connection when listening or sending. Similar to NodeJS’s WS library, V’s websocket library uses callbacks for the handling of network events.
```jsx
const WebSocketServer = require('ws');
const port = 3000

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: port })

// callbacks for clients
wss.on("connection", ws => {
    console.log("new client connected");
    ws.on("message", data => {
        // message received
    });
    ws.on("close", () => {
				// client disconnected
    });
    ws.onerror = function () {
        // handling client connection error
    }
});

console.log(`The WebSocket server is running on port ${port}`);
```
> NodeJS code for starting a websocket server

```v
fn start_client() ?&websocket.Client {
	mut ws := websocket.new_client("ws://localhost:3000")?
	ws.logger.set_level(log.Level.disabled)
		//! disable logging

	ws.on_open(fn (mut ws websocket.Client) ? {
		// connection opened
	})

	ws.on_error(fn (mut ws websocket.Client, err string) ? {
		// connection error
		// most of the time its a server shutdown
	})

	ws.on_close(fn (mut ws websocket.Client, code int, reason string) ? {
		// websocket closed by self
	})
	
	ws.on_message(fn (mut ws websocket.Client, msg &websocket.Message) ? {
		// received message
	})
	ws.connect() or {
		// failed to connect
	}

	go ws.listen()

	return ws
}
```
> helper functions for starting the websocket client with V
---
# Receiving files from the websocket server

Receiving files is very straightforward, just initiate a connection and halt the program. The websocket client in a different thread will execute callbacks when a message is received.

![](static-clalisten.mp4){.mp4-full-50}

```v
ws.on_message(fn (mut ws websocket.Client, msg &websocket.Message) ? {
	mut filename := msg.payload[0..40].bytestr() 
			// filename is the first 40 bytes of the data
	data := msg.payload[40..]
			// everything after 40 bytes

	filename = trim_nullb(filename) // filename is padded with null characters (\0)
	
	// the websocket server relays data indiscriminately
	// so check if you just sent that data, then handle the rebound

	os.write_file_array(ps("vbucket/"+filename+".vbytes"),data)?
		// write the received bytes into a file with the .vbytes extension

	println(term.blue("? Got data! "+filename)) // got data!
})
```
> collects all messages and saves them inside a bucket folder

# Managing keys and decrypting received files

![](static-addkey.mp4,static-unpack-v.mp4){.mp4-list}

After receiving a file, it is stored inside a bucket directory as the original file name with a `.vbytes` extension. It can only be decrypted with a `.vkey` file with the same starting file name, stored on the original senders computer.

1. `hello.bin` is sent
    1. `hello.bin.vkey` is created
    2. `hello.bin.lock` is created
    3. Bounce received back from the server
    4. `hello.bin.lock` is deleted
    
2. `hello.bin.vbytes` is received
    1. `hello.bin.vkey` from the sender is retrieved through other means and is added from the CLI
    2. Unpack is called from the CLI
    3. `hello.bin` is created from the decrypted bytes

# Forward

V is my new new favourite language now without question. Modern low level languages exist and it’s about time I moved to one.

Updates on the rendering engine soon! I may even port it to V, it will be more maintainable that way.