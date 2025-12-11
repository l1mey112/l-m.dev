

# tools:
#   nginx
#   pandoc
#   yq (go-yq) - https://github.com/mikefarah/yq/releases/tag/v4.49.2
#   md2html (arch and debian)

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
	--highlight-style=templates/monokai.theme \
	--syntax-definition=templates/vlang.xml \
	--syntax-definition=templates/stas.xml \
	--syntax-definition=templates/wat.xml \
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
	public/cs/index.html

# public/cs/index.html

.PHONY: serve
serve: all
	@echo http://localhost:8080
	nginx -c serve-nginx.conf -p .

.PHONY: clean
clean:
	find public -mindepth 1 -maxdepth 1 ! -name 'static' -exec rm -rf {} +
	rm meta.db

meta.db:
	sqlite3 $@ < tools/schema.sql

public/cs: 
	mkdir -p $@

public/index.html: $(website)/index.md $(TEMPLATES) $(STATIC) $(LUA_DEPS)

	pandoc $< -o $@ \
		--template=templates/baseof.html \
		--metadata title="l-m.dev" \
		$(PANDOC_OPTS) $(FILTERS_ARG)

public/%/index.html: $(website)/%.md $(TEMPLATES) $(STATIC) $(LUA_DEPS)

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/baseof.html \
		$(PANDOC_OPTS) $(FILTERS_ARG)

public/cs/index.html: $(TEMPLATES) $(STATIC) $(LUA_DEPS) \
	public/cs meta.db $(CS_PAGES)

	cat /dev/null | pandoc -o $@ \
		--template=templates/cs/baseof_list.html \
		-V section="cs" -V is_cs=true \
		$(PANDOC_OPTS) $(FILTERS_ARG) \
		-M pageurl="/cs" \
		-M list_map_file=<(tools/dump_cs_list.sh meta.db) \
		--metadata title="l-m.dev" \
		--title-prefix="Cs"

public/cs/%/index.html: $(website)/cs/%.md meta.db $(TEMPLATES) $(STATIC) $(LUA_DEPS) \
	public/cs

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/cs/baseof.html \
		-V section="cs" -V is_cs=true \
		$(PANDOC_OPTS) $(FILTERS_ARG) \
		-M pageurl="/cs/$(basename $(notdir $<))" \
		-M extract_meta=true \
		--title-prefix="l-m.dev" \
	| sqlite3 meta.db
