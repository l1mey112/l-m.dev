#import "polylux/polylux.typ": *
#import "polylux/l-m.dev.typ": *

#set raw(tab-size: 4)
#show: metropolis-theme.with()
#set par(justify: true)

#let l-m-todo(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[TODO: ] #text(fill: l-m-meta-colour, body)]
#let l-m-tldr(body) = [#text(fill: l-m-meta-colour)[\/\/ ]#text(fill: l-m-accent-colour)[tldr: ] #text(fill: l-m-meta-colour, body)]
#let span-sep(left, right) = box[#left #box(width: 1fr, repeat[#text(fill: l-m-meta-colour)[-]]) #right]

#show math.equation: set text(1.25em)

#let l-m-meta(body) = text(fill: l-m-meta-colour, body)
#let l-m-code(body) = text(fill: l-m-code-colour, body)

#let uncoverb(b, body) = uncover((beginning: b), body)

#let gc = block.with(width: 100%, height: 100%)
#let gh = block.with(width: 100%)

/*
  - Ctrl-K Ctrl-0 (folds all regions)
  - Ctrl-K Ctrl-j (unfolds all regions)
*/

#let kubernetes-colour = rgb("#618be5")

#title-slide({
  l-m-title("Destroying My Homelab With Kubernetes")
  linebreak()
  l-m-hr()
  set text(size: 0.8em)
  text(fill: l-m-meta-colour, "Friday, July 17th | Colombo Theatre B | 2 PM - 4 PM")
})

#slide(title: "About me")[
  #grid(columns: (10fr, 6fr), gutter: 2em, gc[
    - Liam, l-m, github.com/l1mey112 #l-m-meta[(GH)]
    - #underline[https://l-m.dev/], #l-m-meta[(email)] l-m at l-m.dev

    #l-m-hr()

    - 2nd Year at #text(fill: rgb("#ff6a48"))[*UNSW*], Adv Math/CS

    - Exec at #text(fill: rgb("#fbc62f"))[*Linux Society*] and runs *Live \@ LNSC*.

    #l-m-hr()
    #image("image copy.png")
  ], gc[
    #image("image.png")
  ])
]

#slide(title: "This Talk?")[
  This wouldn't be that long I think
  
	#l-m-todo[(1) Kubernetes]

	#l-m-todo[(2) Self hosting and my setup]
]

#new-section-slide[(1) Kubernetes]

/* note: this shit sucks */

#let cl-ink = rgb("#dddddd")
#let cl-string = rgb("#e5484d")
#let cl-net = rgb("#4e9cf5")

#let cl-paper(body, fill: rgb("#f5f5f5")) = box(
  fill: fill, radius: 1pt,
  inset: (x: 1em, top: 0.9em, bottom: 2.6em),
  text(size: 0.85em, fill: black, body),
)

#let cl-tag(body) = text(fill: l-m-meta-colour, size: 0.8em, body)

#let clothes-scene(
  height: 100%, sag: 26pt, bleed: 3em,
  lines: (), pulls: (), nets: (),
) = place(top + left, block(width: 100%, height: height, layout(size => context {
  let W = size.width
  let H = size.height
  let b = measure(box(width: bleed, height: 0pt)).width
  let S = W + 2 * b
  let dip(X) = { let u = (X + b) / S; 4 * sag * u * (1 - u) }
  let depth(y) = {
    if type(y) == ratio { y * H }
    else if type(y) == relative { y.ratio * H + y.length }
    else { y }
  }

  let anchors = (:)
  let under = ()
  let over = ()

  for l in lines {
    let Y = depth(l.y)
    let ink = l.at("ink", default: cl-ink)
    let pf = l.at("paper", default: rgb("#f5f5f5"))
    under.push(place(top + left, dx: -b, dy: Y, path(
      stroke: ink + 1.4pt,
      ((0pt, 0pt), (0pt, 0pt), (0.333 * S, 1.333 * sag)),
      ((S, 0pt), (-0.333 * S, 1.333 * sag), (0pt, 0pt)),
    )))
    if "tag" in l {
      let m = measure(cl-tag(l.tag))
      under.push(place(top + left, dx: 0.88 * W - m.width / 2, dy: Y - m.height - 8pt, cl-tag(l.tag)))
    }
    for p in l.at("pins", default: ()) {
      let X = p.x * W
      let Yp = Y + dip(X)
      let m = measure(cl-paper(p.body, fill: pf))
      anchors.insert(p.id, (x: X, top: Yp + 5pt, w: m.width, h: m.height))
      under.push(place(top + left, dx: X, dy: Yp - 6pt,
        line(angle: 90deg, length: 11pt, stroke: ink + 1.8pt)))
      under.push(place(top + left, dx: X - m.width / 2, dy: Yp + 5pt, cl-paper(p.body, fill: pf)))
    }
  }

  for s in pulls {
    let A = anchors.at(s.at(0))
    let B = anchors.at(s.at(1))
    let off = if s.len() > 2 { s.at(2) } else { 0 }
    over.push(place(top + left, line(
      start: (A.x + off * (A.w / 2 - 6pt), A.top + A.h - 2pt),
      end: (B.x, B.top - 8pt),
      stroke: cl-string + 1.4pt,
    )))
  }

  for n in nets {
    let (A, B) = (anchors.at(n.at(0)), anchors.at(n.at(1)))
    let (L, R) = if A.x < B.x { (A, B) } else { (B, A) }
    over.push(place(top + left, line(
      start: (L.x + L.w / 2 - 2pt, L.top + L.h / 2),
      end: (R.x - R.w / 2 + 2pt, R.top + R.h / 2),
      stroke: cl-net + 1.4pt,
    )))
  }

  (under + over).join()
})))

#let cl-dep = [```
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
```]

#let cl-svc = [```
apiVersion: v1
kind: Service
spec:
  port: 80
```]


#let l-desired(y) = (y: y, tag: [], pins: (
  (x: 0.22, id: "dep", body: cl-dep),
  (x: 0.52, id: "svc", body: cl-svc),
))
#let l-actual = (y: 65%, tag: [], ink: l-m-meta-colour, paper: rgb("#b0b0b0"), pins: (
  (x: 0.30, id: "p1", body: [pod 1]),
  (x: 0.46, id: "p2", body: [pod 2]),
))
#let l-actual-full = (y: 65%, tag: [], ink: l-m-meta-colour, paper: rgb("#b0b0b0"), pins: (
  ..l-actual.pins, (x: 0.68, id: "cip", body: [ClusterIP obj. \ #l-m-meta[*(cluster.local:80)*]]),
))
#let dep-pulls = (("dep", "p1", -0.5), ("dep", "p2", 0.5))

#slide(title: [(1.H) Kubernetes])[
  #grid(columns: (14fr, 5fr), gutter: 2em, gc[
    Kubernetes #l-m-meta[(K8s)] is a container orchestrator.

    #uncoverb(2)[
      Released by Google in 2014, a rewrite of their internal cluster manager, _Borg_.
    ]

    #uncoverb(3)[
      #l-m-hr()
      #quote(attribution: [kubernetes.io], block: true)[
        Kubernetes, also known as K8s, is an open source system for automating deployment, scaling, and management of containerized applications.
      ]

      https://github.com/kubernetes/kubernetes
    ]
  ], gc[
    #uncoverb(2)[#image("kube.png")]
  ])
]

/*
- (2) how theses huge 
*/
#slide(title: "Kubernetes?")[

  kubernetes = container orchestrator over lots of servers (called nodes)

  #linebreak()

  #uncoverb(2)[
    - orchestration = wrangle your hundreds of servers to deploy your infrastructure
      
      #l-m-meta[(run N web servers, expose this port, connect two containers)]
  ]

  #linebreak()

  #uncoverb(3)[
    - declarative = the desired state of your infra is written down and deployed

      #l-m-meta[(describe the entirety of your infrastructure in 1000 yaml files)]
  ]
]

#slide(title: "Simple architecture")[
  1. You package the things you want to run into *containers*
  
  2. Group these containers together into *pods*
    
    #l-m-meta[(collection of containers that live & die together)]

  3. Tell Kubernetes to schedule these pods onto *nodes*

    #l-m-meta[(your physical servers)]
]

#focus-slide()[
  #image("image-10.png")

  ```sh
  ls *.yaml | xargs -n1 kubectl apply -f
  ```
]

#slide(title: "Simple architecture", background: block(
  width: 100%, height: 100%, fill: rgb("#161616"),
  image("image-9.png", fit: "contain", width: 100%, height: 100%),
))[
]

#slide(title: "etcd", align-horizon: false)[
  kubernetes (or, etcd) is a like clothesline, sticky notes, ...
  #only(1, clothes-scene(lines: ((y: 30%),)))
  #only((beginning: 2), clothes-scene(lines: (l-desired(30%),)))
]

#slide(title: "etcd", align-horizon: false)[
  #only((until: 1), clothes-scene(lines: (l-desired(22%),)))

  #only(2, clothes-scene(
    lines: (l-desired(22%), l-actual),
    pulls: dep-pulls,
  ))

  #only((beginning: 3), clothes-scene(
    lines: (l-desired(22%), l-actual-full),
    pulls: (..dep-pulls, ("svc", "cip", 0.4)),
    nets: (("p1", "p2"), ("p2", "cip")),
  ))
]

#slide(title: "Lets run through an example")[
  - We want two replicas of an nginx pod hosted at port :80 #l-m-meta[(we are web scale)]

  - We want a unique cluster internal IP address for the pods.

  - We want the ClusterIP #l-m-meta[(^^^)] to be exposed under cube.l-m.dev.

  #linebreak()


  #uncoverb(2)[
    #l-m-hr()
    
    #linebreak()
    
    1. `kind: Deployment` with the pod description written there

    2. `kind: Service` pointing at the pods

    3. `kind: Ingress` pointing at the service

    #linebreak()

    #show raw: it => { show regex("\\([^()\\n]*\\)"): set text(fill: l-m-meta-colour); it }

    ```
    Deployment (makes pods) -> Service (nginx-pods.cluster.local) -> Ingress (routes cube.l-m.dev)
    ```
  ]
]

#slide(title: "Lets run through an example", inset: (x: 2em, top: 0.4em, bottom: 2em))[
  #set align(top)
  #set text(size: 1.1em)
  
  #grid(columns: (10fr, 10fr), gutter: 6em, gh[
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: my-nginx-deployment
      namespace: nginx-test
    spec:
      replicas: 2
      selector:
        matchLabels:
          component: deployment    # -to find
      template:                    #  the pods
        metadata:                  #  |
          labels:                  #  |
            component: deployment  # -/
        spec:                      # pod spec
          containers:
            - name: nginx
              image: nginx:alpine
              ports:
                - containerPort: 80
    ```
  ], gh[
    #[
      #set text(size: 0.8em)
      
      - the Deployment contains a \"pod spec\" defining a single pod, which contains N = 1 num. of containers
    ]

    #linebreak()

    #uncoverb(2)[
      ```yaml
      apiVersion: v1
      kind: Service
      metadata:
        name: service
        namespace: nginx-test
      spec:
        ports:
          - port: 80
            targetPort: 80
        selector:
          component: deployment # selects the
      # <--------------------/ pods as before
      ```
    ]
  ])
]

#slide(title: "Lets run through an example", inset: (x: 2em, top: 0.4em, bottom: 2em))[
  #image("image-13.png")

  URL: service.nginx-test.svc.cluster.local #l-m-meta[(k8s runs an in cluster DNS resolver)]
]

#slide(title: "Lets run through an example", inset: (x: 2em, top: 0.4em, bottom: 2em))[
  #grid(columns: (10fr, 10fr), gutter: 6em, gh[
    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: ingress
      namespace: nginx-test
    spec:
      ingressClassName: traefik
      rules:
        - host: cube.l-m.dev
          http:
            paths:
              - backend:
                  service:
                    name: service
                    port:
                      number: 80
                path: /
                pathType: Prefix
    ```
  ], gh[

    - the Ingress obj. needs an

      *Ingress Controller*

    \

    #linebreak()

    think: dynamic reverse proxy

    - traefik
    - nginx-ingress
  ])
]

#focus-slide[
  personal anecdote: a concrete example was 1000x better than the \"docs\" out there
]

#image("image-11.png")

#focus-slide[
  thanks to the CNCF

  everything is YAML
]

#[
  #set align(center)

  #image("image-16.png")
]

#new-section-slide[(2) How I've hosted for a while]

#slide(title: "Lay of the land")[
  I've been selfhosting for a while now

  #set text(size: 0.9em)
  
  #grid(columns: (1fr, 1fr, 1fr), gutter: 2em,
    gc[
      Raspberry Pi 3
      #image("image-4.png")
      (near infant)
    ],
    gc[
      Intel Nuc
      #image("image-3.png")
      (most of highschool)
    ],
    gc[
      Rack mount (UCS C220 M3S)
      #image("image-2.png")
      (present day present time)
    ],
  )
]


#slide(title: "Learning this stuff")[
  #show raw: set text(size: 1.2em)
  #show regex("(?m)^> [^H\n]*"): set text(fill: l-m-meta-colour)
  #show regex("H+"): set text(fill: l-m-accent-colour)
  #show regex("-+>"): set text(fill: l-m-meta-colour)
  
  ```
                2. tunnel                        4. DNS, SSL certs
    1. server -------------->  3. outbound IP  ---------------------->  5. domain
                                (CF, paid VPS)                           (l-m.dev)
  ```
  #uncoverb(2)[
    ```
    > f := x -> 4*tanh(4*x) + 0.15*x + 3.5/(1 + exp(-6*(x - 7))):
    > plot(f(x),x=0..10);                                                   HHHHHHHHHHHHHHH
      +                                                        HHHHHHHHHHHHHHH        
    8 +                                                      HHH                  
      +                                                     HH                    
      +                                                   HHH                     
    6 +            HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH                       
      +           HH                                                              
      +          HH                        
    4 +   HHHHHHHH                                                
      +  HH                                                                       
    2 * H                                                                         
      0--+-+--+--+-2--+--+--+-+--4--+--+-+--+--6--+-+--+--+--8-+--+--+-+-10 
    ```
  ]
]

#let bs-tax = {
  set text(font: "Liberation Mono", size: 14pt, fill: l-m-meta-colour)
  place(top + right, dx: -1.5em, dy: 2.5em,
    align(left, enum(
      tight: false,
      spacing: 1em,
      [cloudflared],
      [WireGuard],
      [tailscale],
      [ngrok],
      [port forwarding],
      [CGNAT],
      [rathole],
      [autossh -R],
      [netbird],
      [VPS],
      [frp],
      [ddclient],
      [duckdns],
      [iptables DNAT],
      [fail2ban],
      [Let\'s Encrypt],
      [certbot],
      [acme.sh],
      [DNS-01 challenges],
      [wildcard certs],
    )),
  )
}

#let connected-pointer = place(bottom + right, dx: -12em, dy: -1em, {
  set text(font: "Liberation Mono", size: 14pt)
  [S\*\*t to worry about to get it CONNECTED *(2)* ------------>]
})

#slide(title: "Two areas of concern (difficulty curve)", background: bs-tax + connected-pointer)[
  #uncoverb(2)[
    *Catch-all rungs of getting shit running (1)* \ \

    1. apt install package && systemctl enable \-\-now package
    
    2. docker run -d --restart=unless-stopped package
    
    3. docker compose up -d
    4. Dockge / Portainer
    5. Proxmox or TrueNAS one click thing

    #{
      set text(fill: l-m-meta-colour)
      set enum(numbering: n => text(fill: l-m-meta-colour, numbering("1.", n)))
      enum.item(6)[assert(0 && \"unreachable\");]
    }
  ]
]

#slide(title: "My homelab")[
  For me right now, dead simple:
  
  - Proxmox on a server with ZFS root
  - LXC containers running Debian or Alpine
  - Assign predictable IP addresses, ssh in and install my stuff
  - Use cloudflare tunnels

  #grid(columns: (2fr, 6fr), gutter: 2em, gc[
    #image("image-17.png")
  ], gc[
   #image("image-19.png")
  ])
]

#focus-slide[
  this is a PITA

  i hate installing stuff
]

#[
  #set align(center)

  #image("image-20.png")
]

/*
things are never just deploy once, they need to be maintained
*/
#focus-slide[
  Running stuff is a \"\"\"solved\"\"\" problem

  #set text(size: 0.8em)

  #l-m-meta[(even w/ containers it's a lot of maintenence!)]
]

#slide(title: "You've deployed it, then what?")[
  #gc[
    #[
      #set text(size: 1.4em)
      
      #enum.item(1)[Reproducible #l-m-meta[(byte for byte equal, every deploy)]]

      #uncoverb(2)[
        #enum.item(2)[Declarative #l-m-meta[(what you want done, not how to get there)]]
      ]
      #uncoverb(3)[
        #enum.item(3)[Reliable #l-m-meta[(if it works once, it'll probably work forever)]]
      ]
    ]

    #only(2, place(bottom + right, move(dx: 12em, dy: 12em, rotate(-35deg, image("nixos.png", width: 16em)))))
    #only(3, place(bottom + right, move(dx: 8em, dy: 9em, rotate(-26deg, image("nixos.png", width: 16em)))))
    #uncoverb(4)[#place(bottom + right, move(dx: 3em, dy: 3em, rotate(-15deg, image("kube.png", width: 16em))))]
  ]
]

#slide(title: "pros vs cons vs hacker", align-horizon: false)[
  #grid(columns: (10fr, 10fr), gutter: 5em, gh[    
    = Pros

    #uncoverb(2)[
      #linebreak()

      - Reproducible
       Declarative
       Reliable

       #l-m-meta[(sure bud)]

      #linebreak()

      #uncoverb(4)[
        *HUGE PRO*

        #set text(size: 0.9em)
        #set text(hyphenate: false)

        - \"i utilise cloud native technologies\"

        - kubernetes cloud ready certificate sponsored by microsoft azure

        - resume gets an extra line
      ]
    ]
  ], gh[
    = Cons

    #uncoverb(3)[
      #linebreak()

      1. Reproducible, sure. \ \ *Extreme* amounts of trial and error to even Declare and have it work.

      #linebreak()

      - Hundreds and hundreds of YAML files
      - Helm is a disgusting abomination \
        #l-m-meta[(pkg manager for k8s)]
    ]
  ])
]

#slide(title: "So?")[
  I replaced my perfectly good homelab with a Kubernetes cluster and I run all my things on it #l-m-meta[(I track all the yamls in git)]

  #grid(columns: (10fr, 6fr), gutter: 2em, gc[
    - Website: see #underline[https://l-m.dev/]
    - My monero node
    - Syncthing
    - Linux Society infrastructure
    - Zenith Hosting CI
    - My personal Forgejo instance
  ], gc[
    #image("image-21.png")
  ])
]

#[
  #set page(fill: rgb("#292827"))
  #set align(center + horizon)
  #image("image-22.png")
]


#slide(title: "Personal development or?")[
  - for me: I've really wanted to learn k8s for a long time

  - for job: I do all the Kubernetes infrastructure at #underline(stroke: rgb("#6d44c5") + 1.5pt)[*Zenith Hosting*]
]


#slide(title: "Aside: Talos Linux")[
  not enough time (im writing this 15 mins before LAL stars)

  #set text(hyphenate: false)

  #linebreak()

  #grid(columns: (10fr, 8fr), gutter: 2em, gc[
    - Kubernetes deployments are described with yaml, but actually setting up the nodes #l-m-meta[(bare metal machines or VMs)] is not

    - Talos linux is like nixos for deploying fleets of kuberentes nodes

      - A Talos install has < 15 binaries, doesn't have ssh or a shell and configured with APIs only.
  ], gc[
    #image("image-25.png")
  ])
]

#slide(title: "Aside: Talos Linux")[
  #grid(columns: (10fr, 8fr), gutter: 2em, gc[
    ```bash
    # then node is completely secure after this
    talosctl apply-config --insecure \
      --nodes 10.84.27.126 --file out/controlplane.yaml
    ```

    and boom, immediate kubernetes node

    #uncoverb(2)[
      #image("image-26.png")
    ]
  ], gc[
    ```yaml
    # network.yaml
    machine:
      network:
        nameservers:
          - 10.84.27.1
        interfaces:
          - deviceSelector:
              physical: true
            addresses:
              - 10.84.27.120/24
            routes:
              - network: 0.0.0.0/0
                gateway: 10.84.27.1
    ---
    apiVersion: v1alpha1
    kind: HostnameConfig
    hostname: kube-etcd
    auto:
      $patch: delete
    ```
  ])
]

#new-section-slide[Finishing Up]

#slide(title: "Q&A - The End")[

  Thank you everyone! It's Q&A time.

  #linebreak()

  come find me
  
  #grid(columns: (10fr, 10fr), gutter: 2em, gc[
    - Liam Leadbetter
    - https://l-m.dev/
    - https://www.youtube.com/@l-mdotdev
    #image("image-23.png")
  ], gc[
    #image("image-24.png")
  ])
]
