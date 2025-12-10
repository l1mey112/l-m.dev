

# tools:
#   nginx
#   pandoc
#   yq (go-yq) - https://github.com/mikefarah/yq/releases/tag/v4.49.2

# need to store build artefacts somewhere, guess
# putting them in public shouldn't do any harm

# pass W="Website" make to change the source directory
ifndef W
	website := Website
else
	website := $(W)
endif

ifndef M
	media := $(website)/_Media
else
	media := $(M)
endif

FILTERS := $(wildcard tools/*.lua)
FILTERS_ARG := $(foreach f,$(FILTERS),-L $(f))

LUA_DEPS := $(shell find tools -type f -name '*.lua')

TEMPLATES := $(shell find templates -type f -name '*.html')
STATIC := $(wildcard public/static/**)

CS := $(wildcard $(website)/cs/*)
CS_PAGES := $(patsubst $(website)/cs/%.md,public/cs/%/index.html,$(filter %.md,$(CS)))

ifdef OVERRIDE_CS_PAGES
CS_PAGES := $(strip $(OVERRIDE_CS_PAGES))
endif

# --from markdown+autolink_bare_uris literally converts frontmatter urls to <a> tags.
# what a joke

TOPLEVEL := $(filter-out $(website)/index.md,$(wildcard $(website)/*.md))
TOPLEVEL_PAGES := $(patsubst $(website)/%.md,public/%/index.html,$(filter %.md,$(TOPLEVEL)))

# these show up at the top as /talk, /cs, /3d, etc
TOPLEVEL_LIST := /cs /talk

# TOPLEVEL_LIST -> -M toplevel_list=item1 -M toplevel_list=item2 ...
TOPLEVEL_LIST_ARG := $(foreach t,$(TOPLEVEL_LIST),-M toplevel_list=$(t))

PANDOC_OPTS := -s $(TOPLEVEL_LIST_ARG) \
	--from markdown+hard_line_breaks+wikilinks_title_after_pipe+mark+pipe_tables \
	--highlight-style=tools/monokai.theme \
	--extract-media=public/media -M media_path=$(media) # see resources.lua

# broken at the moment
#	--filter tools/mathjax-svg-filter.js

# the calculation for the word count in the list uses `wc`, but the calculation
# for the wordcount in the actual files uses a more sophisticated lua filter.
#
# i would prefer to make it all consistent, but doing so (reading from the list json)
# would require rebuilding everything all the time when a single file changes

.PHONY: all
all: public/index.html $(TOPLEVEL_PAGES) \
	public/cs/index.html $(CS_PAGES)

.PHONY: serve
serve: all
	@echo http://localhost:8080
	nginx -c serve-nginx.conf -p .

.PHONY: clean
clean:
	find public -mindepth 1 -maxdepth 1 ! -name 'static' -exec rm -rf {} +

public/cs: 
	mkdir -p $@

public/index.html: $(website)/index.md $(TEMPLATES) $(STATIC) $(LUA_DEPS) \
	public

	pandoc $< -o $@ \
		--template=templates/baseof.html \
		$(PANDOC_OPTS) $(FILTERS_ARG)

public/%/index.html: $(website)/%.md $(TEMPLATES) $(STATIC) $(LUA_DEPS) \
	public

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/baseof.html \
		$(PANDOC_OPTS) $(FILTERS_ARG)

public/cs/index.html: $(TEMPLATES) $(STATIC) $(LUA_DEPS) \
	public/cs public/cs_list.json

	cat /dev/null | pandoc -o $@ \
		--template=templates/cs/baseof_list.html \
		-V section="cs" -V is_cs=true \
		$(PANDOC_OPTS) $(FILTERS_ARG) \
		-M pageurl="/cs" \
		-M list_map_file="$(abspath public/cs_list.json)" \
		--metadata title="l-m.dev" \
		--title-prefix="Cs"

public/cs/%/index.html: $(website)/cs/%.md $(TEMPLATES) $(STATIC) $(LUA_DEPS) \
	public/cs public/cs_navigation.json

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/cs/baseof.html \
		-V section="cs" -V is_cs=true \
		$(PANDOC_OPTS) $(FILTERS_ARG) \
		-M pageurl="/cs/$(basename $(notdir $<))" \
		-M navigation_map_file="$(abspath public/cs_navigation.json)" \
		--title-prefix="l-m.dev"

public/cs_list.json: $(CS) tools/list.sh
	tools/list.sh "$(website)/cs" "/cs/" > $@

# only mark this file as updated when the contents change, not timestamp
public/cs_navigation.json: $(CS) tools/navigation.sh

# this runs repeatedly for some reason, just make it quiet
	@tools/navigation.sh "$(website)/cs" "/cs/" > $@.tmp
	
	@if cmp -s $@.tmp $@; then \
		rm $@.tmp;             \
	else                       \
		mv $@.tmp $@;          \
	fi
