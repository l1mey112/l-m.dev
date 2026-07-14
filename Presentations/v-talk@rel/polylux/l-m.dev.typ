// A port of "metropolis.typ" and converted to l-m.dev-style

// Consider using:
// #set text(font: "Fira Sans", weight: "light", size: 20pt)
// #show math.equation: set text(font: "Fira Math")
// #set strong(delta: 100)
// #set par(justify: true)

#import "logic.typ"
#import "helpers.typ"

#let l-m-background = luma(30)
#let l-m-text-colour = rgb("#dddddd")
#let l-m-meta-colour = rgb("#808080")
#let l-m-accent-colour = rgb("#f7208a")
#let l-m-code-colour = rgb("#d3869b")
#let m-dark-teal = rgb("#23373b")
#let m-light-brown = rgb("#eb811b")
#let m-lighter-brown = rgb("#d6c6b7")
#let m-extra-light-gray = rgb("#000")

#let m-footer = state("m-footer", [])

#let m-progress-bar = helpers.polylux-progress( ratio => {
  grid(
    columns: (ratio * 100%, 1fr),
    repeat[#text(fill: l-m-accent-colour, size: 14pt)[-]],
    repeat[#text(fill: l-m-meta-colour, size: 14pt)[-]]
  )
})

#let metropolis-theme(
  aspect-ratio: "16-9",
  footer: [],
  body
) = {
  set text(font: "Liberation Mono", weight: "regular", ligatures: true, size: 20pt, fill: l-m-text-colour)
  set page(
    paper: "presentation-" + aspect-ratio,
    margin: 0em,
    header: none,
    footer: none,
    fill: l-m-background,
  )
  show raw: it => {
    if it.block {
      it
    } else {
      set text(weight: 700, fill: l-m-code-colour)
      box[\`#it.text\`]
    }
  }
  set underline(offset: 6pt, stroke: l-m-accent-colour + 1.5pt)

  m-footer.update(footer)

  body
}

#let l-m-hr() = {
  repeat[#text(fill: l-m-meta-colour, size: 14pt)[-]]
}

#let l-m-title(content) = {
  set text(fill: l-m-text-colour, size: 1.3em)
  box[ #text(fill: l-m-accent-colour)[>> ] #content ]
}

#let raw-slide(
  content
) = {
  logic.polylux-slide(content)
}

#let title-slide(
  content
) = {
  let content = {
    grid(
      rows: (1fr, 9fr),
      block(inset: 1em, {
        set text(size: 0.8em)
        text(fill: white)[l-m.dev ]
        text(fill: l-m-meta-colour)[\/ talk]
      }),
      align(horizon, block(inset: 2em, content))
    )
  }

  logic.polylux-slide(content)
}

#let slide(title: none, align-horizon: true, body) = {
  let content = {
    if align-horizon {
      set align(horizon)
    }

    let b = block(inset: 2em, {
      set text(size: 16pt)
      body
    })

    if align-horizon {
      b = align(horizon, b)
    }

    grid(
      rows: (1fr, 9fr),
      block(inset: 1em, {
        set text(size: 0.8em)
        // text(fill: white)[l-m.dev ]
        // text(fill: l-m-meta-colour)[\/ talk]
        if title != none {
          text(fill: l-m-accent-colour)[\#\# ]
          text(fill: white)[#title]
        }
      }),
      b
    )
  }

  logic.polylux-slide(content)
}

#let new-section-slide(name) = {
  let content = {
    helpers.register-section(name)
    set align(horizon)
    show: pad.with(2em)
    set text(fill: l-m-text-colour)
    l-m-title(name)
    block(height: 2pt, width: 100%, spacing: 0pt, m-progress-bar)
  }
  logic.polylux-slide(content)
}

#let focus-slide(body) = {
  set page(fill: l-m-background, margin: 2em)
  set text(fill: l-m-text-colour, size: 1.5em)
  logic.polylux-slide(align(horizon + center, body))
}

#let full-slidepl(body) = {
	pagebreak(weak: true)
  logic.polylux-slide(body)
}

#let full-slide(body) = {
	pagebreak(weak: true)
  body
}

#let alert = text.with(fill: m-light-brown)

#let metropolis-outline = helpers.polylux-outline(enum-args: (tight: false,))
