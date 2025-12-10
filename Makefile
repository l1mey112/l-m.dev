

# tools:
#   miniserve
#   pandoc
#   yq (go-yq) - https://github.com/mikefarah/yq/releases/tag/v4.49.2

# need to store build artefacts somewhere, guess
# putting them in public shouldn't do any harm

FILTERS := $(wildcard tools/*.lua)
FILTERS_ARG := $(foreach f,$(FILTERS),-L $(f))

LUA_DEPS := $(shell find tools -type f -name '*.lua')

TEMPLATES := $(shell find templates -type f -name '*.html')

CS := $(wildcard Website/cs/*)
CS_PAGES := $(patsubst Website/cs/%.md,public/cs/%.html,$(filter %.md,$(CS)))

ifdef OVERRIDE_CS_PAGES
CS_PAGES := $(strip $(OVERRIDE_CS_PAGES))
endif

# --from markdown+autolink_bare_uris literally converts frontmatter urls to tags.
# what a joke.

PANDOC_OPTS := -s \
	--from markdown+hard_line_breaks+wikilinks_title_after_pipe+mark+pipe_tables

# broken at the moment
#	--filter tools/mathjax-svg-filter.js

# the calculation for the word count in the list uses `wc`, but the calculation
# for the wordcount in the actual files uses a more sophisticated lua filter.
#
# i would prefer to make it all consistent, but doing so (reading from the list json)
# would require rebuilding everything all the time when a single file changes

.PHONY: all
all: public/cs/index.html $(CS_PAGES)

.PHONY: serve
serve: all
	miniserve public --pretty-urls

public/cs/index.html: Website/cs_index.md public/cs_list.json $(TEMPLATES) $(LUA_DEPS)

	pandoc Website/cs_index.md -o $@ \
		--template=templates/cs/baseof_list.html \
		-V section="cs" \
		$(PANDOC_OPTS) $(FILTERS_ARG) \
		-M pageurl="/cs/" \
		-M list_map_file="$(abspath public/cs_list.json)" \
		--title-prefix="Cs"

public/cs/%.html: Website/cs/%.md $(TEMPLATES) $(LUA_DEPS) public/cs_navigation.json

	pandoc $< -o $@ \
		--template=templates/cs/baseof.html \
		-V section="cs" \
		$(PANDOC_OPTS) $(FILTERS_ARG) \
		-M pageurl="/cs/$(basename $(notdir $<))" \
		-M navigation_map_file="$(abspath public/cs_navigation.json)" \
		--title-prefix="l-m.dev"

public/cs_list.json: $(CS) tools/list.sh
	tools/list.sh "Website/cs" "/cs/" > $@

# only mark this file as updated when the contents change, not timestamp
public/cs_navigation.json: $(CS) tools/navigation.sh

# this runs repeatedly for some reason, just make it quiet
	@tools/navigation.sh "Website/cs" "/cs/" > $@.tmp
	
	@if cmp -s $@.tmp $@; then \
		rm $@.tmp;             \
	else                       \
		mv $@.tmp $@;          \
	fi
