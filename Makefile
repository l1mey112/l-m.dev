

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

FILTERS := $(wildcard tools/*.lua)
FILTERS_ARG := $(foreach f,$(FILTERS),-L $(f))

LUA_DEPS := $(shell find tools -type f -name '*.lua')

TEMPLATES := $(shell find templates -type f -name '*.html')

CS := $(wildcard $(website)/cs/*)
CS_PAGES := $(patsubst $(website)/cs/%.md,public/cs/%/index.html,$(filter %.md,$(CS)))

ifdef OVERRIDE_CS_PAGES
CS_PAGES := $(strip $(OVERRIDE_CS_PAGES))
endif

# --from markdown+autolink_bare_uris literally converts frontmatter urls to <a> tags.
# what a joke

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
	nginx -c serve-nginx.conf -p .

.PHONY: clean
clean:
	find public -mindepth 1 -maxdepth 1 ! -name 'static' -exec rm -rf {} +

public/cs: 
	mkdir -p $@

public/cs/index.html: $(website)/cs_index.md $(TEMPLATES) $(LUA_DEPS) \
	public/cs public/cs_list.json

	pandoc $(website)/cs_index.md -o $@ \
		--template=templates/cs/baseof_list.html \
		-V section="cs" \
		$(PANDOC_OPTS) $(FILTERS_ARG) \
		-M pageurl="/cs/" \
		-M list_map_file="$(abspath public/cs_list.json)" \
		--title-prefix="Cs"

public/cs/%/index.html: $(website)/cs/%.md $(TEMPLATES) $(LUA_DEPS) \
	public/cs public/cs_navigation.json

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/cs/baseof.html \
		-V section="cs" \
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
