website := Website

# <link rel=canonical>, og:url, absolute og:image
SITEURL := https://l-m.dev

# force the use of bash as <(...) is not supported by /bin/sh
SHELL := /bin/bash

LUA_MODULES := $(wildcard tools/modules/*.lua)

TEMPLATES := $(shell find templates -type f -name '*.html')
STATIC := $(wildcard public/static/**)

# extracts ONLY directories under $(website) that don't start with _
RAW_DIRS := $(filter-out $(website)/_%/,$(wildcard $(website)/*/))
DIRS     := $(patsubst %/,%,$(RAW_DIRS))
TARGETS := $(patsubst $(website)/%,public/%/index.html,$(filter %,$(DIRS)))

#ifdef OVERRIDE_CS_PAGES
#CS_PAGES := $(strip $(OVERRIDE_CS_PAGES))
#endif

# --from markdown+autolink_bare_uris literally converts frontmatter urls to <a> tags.
# what a joke

TOPLEVEL := $(filter-out $(website)/index.md,$(wildcard $(website)/*.md))
TOPLEVEL_PAGES := $(patsubst $(website)/%.md,public/%/index.html,$(filter %.md,$(TOPLEVEL)))

# these show up at the top as /talk, /cs, /3d, etc
TOPLEVEL_LIST := /cs /stream /talk /net

# TOPLEVEL_LIST -> -M toplevel_list=item1 -M toplevel_list=item2 ...
TOPLEVEL_LIST_ARG := $(foreach t,$(TOPLEVEL_LIST),-M toplevel_list=$(t))

YEAR := $(shell date +%Y)

PANDOC_OPTS := -M year=$(YEAR) -s -L tools/resources.lua -L tools/relative_time.lua -L tools/mark_to_meta.lua $(TOPLEVEL_LIST_ARG) \
	-M siteurl=$(SITEURL) \
	--from markdown+hard_line_breaks+wikilinks_title_after_pipe-implicit_figures+mark+pipe_tables \
	--highlight-style=templates/monokai.theme \
	--syntax-definition=templates/vlang.xml \
	--syntax-definition=templates/stas.xml \
	--syntax-definition=templates/wat.xml \
	--syntax-definition=templates/lean.xml \
	--strip-comments

# broken at the moment
#	--filter tools/mathjax-svg-filter.js

# public/index.html depends on all toplevel pages as this it contains
# global naviagation to a pages based on a tag

.PHONY: all
all: public/index.html public/sitemap.xml $(TOPLEVEL_PAGES)

.PHONY: serve
serve: all
	@echo http://localhost:8080
	air

.PHONY: clean
clean:
	find public -mindepth 1 -maxdepth 1 ! -name 'static' ! -name 'media' ! -name 'robots.txt' ! -name 'talks' ! -name 'physics-applied' -exec rm -rf {} +
	rm -f meta.db meta.db-shm meta.db-wal

_metadb := $(shell sqlite3 meta.db < tools/schema.sql)

public/index.html: $(website)/index.md $(TEMPLATES) $(STATIC) $(TARGETS) \
	tools/metadata_list_tags.lua tools/resources.lua tools/mark_to_meta.lua $(LUA_MODULES) \
	$(website)/colours.json

	 pandoc $< -o $@ \
		--template=templates/index/baseof.html \
		--css=/static/main.css \
		--css=/static/index.css \
		-V is_homepage=true -V is_dark_already=false \
		$(PANDOC_OPTS) -L tools/metadata_list_tags.lua \
		-M list_tags_file=<(tools/dump_tags_popcount.sh meta.db) \
		-M colours_file=$(website)/colours.json \
		-M canonical="$(SITEURL)/"

public/%/index.html: $(website)/%.md $(TEMPLATES) $(STATIC) \
	tools/metadata_page.lua tools/resources.lua tools/mark_to_meta.lua

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/baseof.html \
		--css=/static/main.css \
		--css=/static/index.css \
		-V is_homepage=true -V is_dark_already=false \
		-M canonical="$(SITEURL)/$*" \
		$(PANDOC_OPTS) -L tools/metadata_page.lua

STYLE_cs   := /static/main.css
STYLE_DEFAULT := /static/me.css

TEMPLATE_BASE_cs := templates/cs/
TEMPLATE_BASE_DEFAULT := templates/me/

# only emit one <link rel=canonical>
# this is separate to what stream does for example
CANONICAL_SINGLE_cs := true

# template for cs puts post title as <h1>, so we want to shift all "#" -> "##"
SHIFT_HEADING_cs := true

DESCRIPTION_cs := My blog about computers and all of the above.
DESCRIPTION_stream := Stream announcements and VOD notes.

# this isn't general, applies to everything
# TODO: make it not general, yagni for now
SUBSITE_OPTS := -V is_dark_already=true

# root rule is public/$1/index.html
define SUBSITE_RULE
# draft = have _name.md at the front
MARK_$1 := $$(filter-out $(website)/$1/_%.md,$$(wildcard $(website)/$1/*.md))
MARK_PAGES_$1 := $$(patsubst $(website)/$1/%.md,public/$1/%/index.html,$$(MARK_$1))

CURRENT_STYLE_$1 := $(or $(STYLE_$1),$(STYLE_DEFAULT))
CURRENT_TEMPLATE_BASE_$1 := $(or $(TEMPLATE_BASE_$1),$(TEMPLATE_BASE_DEFAULT))

public/$1/index.html: $$(MARK_PAGES_$1) $$(TEMPLATES) $$(STATIC) \
	tools/metadata_list_map.lua tools/resources.lua tools/relative_time.lua tools/mark_to_meta.lua tools/metadata_list_tags.lua $(LUA_MODULES) \
	$(website)/colours.json

	mkdir -p $$(dir $$@)

	cat /dev/null | pandoc -o $$@ \
		--template=$$(CURRENT_TEMPLATE_BASE_$1)/baseof_list.html --css=$$(CURRENT_STYLE_$1) \
		-M section="$1" -V is_$1=true $$(SUBSITE_OPTS) \
		$$(PANDOC_OPTS) -L tools/metadata_list_map.lua -L tools/metadata_list_tags.lua \
		-M pageurl="/$1" \
		-M canonical="$(SITEURL)/$1" \
		$(if $(DESCRIPTION_$1),-M description="$(DESCRIPTION_$1)") \
		-M list_map_file=<(tools/dump_list.sh meta.db "/$1*") \
		-M list_tags_file=<(tools/dump_tags_popcount.sh meta.db "$1") \
		-M colours_file=$(website)/colours.json \
		--metadata title="$1" \
		--title-prefix="l-m.dev"

public/$1/%/index.html: $(website)/$1/%.md $$(TEMPLATES) $$(STATIC) \
	tools/metadata_hook.lua tools/metadata_page.lua tools/resources.lua tools/relative_time.lua tools/mark_to_meta.lua $(LUA_MODULES)

	mkdir -p $$(dir $$@)

	pandoc $$< -o $$@ \
		--template=$$(CURRENT_TEMPLATE_BASE_$1)/baseof.html --css=$$(CURRENT_STYLE_$1) \
		-M section="$1" -V is_$1=true $$(SUBSITE_OPTS) \
		$$(PANDOC_OPTS) -L tools/metadata_hook.lua -L tools/metadata_page.lua \
		-M pageurl="/$1/$$(basename $$(notdir $$<))" \
		$(if $(CANONICAL_SINGLE_$1),-M canonical="$(SITEURL)/$1/$$(basename $$(notdir $$<))" -V og_type=article) \
		$(if $(SHIFT_HEADING_$1),--shift-heading-level-by=1) \
		-M emit_meta=true \
	| sqlite3 meta.db
endef

$(foreach dir,$(notdir $(filter $(website)/%,$(DIRS))),$(eval $(call SUBSITE_RULE,$(dir))))

SITEMAP_PAGES := public/index.html $(TOPLEVEL_PAGES) $(TARGETS) $(MARK_PAGES_cs)

public/sitemap.xml: $(SITEMAP_PAGES) tools/sitemap.sh
	tools/sitemap.sh
