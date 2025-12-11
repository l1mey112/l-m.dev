

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

PANDOC_OPTS := -s -L tools/resources.lua $(TOPLEVEL_LIST_ARG) \
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

_dummy := $(shell mkdir -p public/cs)

.PHONY: all
all: public/index.html $(TOPLEVEL_PAGES) \
	public/cs/index.html

.PHONY: serve
serve: all
	@echo http://localhost:8080
	nginx -c serve-nginx.conf -p .

.PHONY: clean
clean:
	find public -mindepth 1 -maxdepth 1 ! -name 'static' -exec rm -rf {} +
	rm -f meta.db meta.db-shm meta.db-wal

meta.db:
	sqlite3 $@ < tools/schema.sql

public/index.html: $(TEMPLATES) $(STATIC) \
	meta.db $(CS_PAGES) \
	tools/resources.lua tools/metadata_list_tags.lua

# removed for now
#-V is_homepage=true

	cat /dev/null | pandoc -o $@ \
		--template=templates/index/baseof.html \
		$(PANDOC_OPTS) -L tools/metadata_list_tags.lua \
		-M list_tags_file=<(tools/dump_tags_popcount.sh meta.db) \
		--metadata title="l-m.dev"

public/%/index.html: $(website)/%.md $(TEMPLATES) $(STATIC) \
	tools/metadata_page.lua tools/resources.lua

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/baseof.html \
		$(PANDOC_OPTS) -L tools/metadata_page.lua

public/cs/index.html: $(TEMPLATES) $(STATIC) \
	meta.db $(CS_PAGES) \
	tools/metadata_list_map.lua tools/resources.lua

	mkdir -p $(dir $@)
	
	cat /dev/null | pandoc -o $@ \
		--template=templates/cs/baseof_list.html \
		-V section="cs" -V is_cs=true \
		$(PANDOC_OPTS) -L tools/metadata_list_map.lua \
		-M pageurl="/cs" \
		-M list_map_file=<(tools/dump_cs_list.sh meta.db) \
		--metadata title="l-m.dev" \
		--title-prefix="Cs"

public/cs/%/index.html: $(website)/cs/%.md meta.db $(TEMPLATES) $(STATIC) \
	tools/metadata_hook.lua tools/metadata_page.lua tools/resources.lua

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/cs/baseof.html \
		-V section="cs" -V is_cs=true \
		$(PANDOC_OPTS) -L tools/metadata_hook.lua -L tools/metadata_page.lua \
		-M pageurl="/cs/$(basename $(notdir $<))" \
		-M extract_meta=true \
		--title-prefix="l-m.dev" \
	| sqlite3 meta.db
