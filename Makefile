

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
TOPLEVEL_LIST := /cs /stream /talk

# TOPLEVEL_LIST -> -M toplevel_list=item1 -M toplevel_list=item2 ...
TOPLEVEL_LIST_ARG := $(foreach t,$(TOPLEVEL_LIST),-M toplevel_list=$(t))

PANDOC_OPTS := -s -L tools/resources.lua -L tools/relative_time.lua -L tools/mark_to_meta.lua $(TOPLEVEL_LIST_ARG) \
	--from markdown+hard_line_breaks+wikilinks_title_after_pipe-implicit_figures+mark+pipe_tables \
	--highlight-style=templates/monokai.theme \
	--syntax-definition=templates/vlang.xml \
	--syntax-definition=templates/stas.xml \
	--syntax-definition=templates/wat.xml \
	--syntax-definition=templates/lean.xml \
	--strip-comments \
	--extract-media=public/media -M media_path=$(media) # see resources.lua

# broken at the moment
#	--filter tools/mathjax-svg-filter.js

# public/index.html depends on all toplevel pages as this it contains
# global naviagation to a pages based on a tag

.PHONY: all
all: public/index.html $(TOPLEVEL_PAGES)

.PHONY: serve
serve: all
	@echo http://localhost:8080
	nginx -c serve-nginx.conf -p .

.PHONY: clean
clean:
	find public -mindepth 1 -maxdepth 1 ! -name 'static' -exec rm -rf {} +
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
		--metadata title="l-m.dev"

public/%/index.html: $(website)/%.md $(TEMPLATES) $(STATIC) \
	tools/metadata_page.lua tools/resources.lua tools/mark_to_meta.lua

	mkdir -p $(dir $@)

	pandoc $< -o $@ \
		--template=templates/baseof.html \
		--css=/static/main.css \
		--css=/static/index.css \
		-V is_homepage=true -V is_dark_already=false \
		$(PANDOC_OPTS) -L tools/metadata_page.lua

STYLE_cs   := /static/main.css
STYLE_DEFAULT := /static/me.css

TEMPLATE_BASE_cs := templates/cs/
TEMPLATE_BASE_DEFAULT := templates/me/

SUBSITE_OPTS := -V is_dark_already=true

# call on dir in W, root rule is public/$1/index.html
define SUBSITE_RULE
MARK_$1 := $$(wildcard $(website)/$1/*.md)
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
		-M list_map_file=<(tools/dump_list.sh meta.db "/$1*") \
		-M list_tags_file=<(tools/dump_tags_popcount.sh meta.db "$1") \
		-M colours_file=$(website)/colours.json \
		--metadata title="l-m.dev" \
		--title-prefix="$1"

public/$1/%/index.html: $(website)/$1/%.md $$(TEMPLATES) $$(STATIC) \
	tools/metadata_hook.lua tools/metadata_page.lua tools/resources.lua tools/relative_time.lua tools/mark_to_meta.lua $(LUA_MODULES)

	mkdir -p $$(dir $$@)

	pandoc $$< -o $$@ \
		--template=$$(CURRENT_TEMPLATE_BASE_$1)/baseof.html --css=$$(CURRENT_STYLE_$1) \
		-M section="$1" -V is_$1=true $$(SUBSITE_OPTS) \
		$$(PANDOC_OPTS) -L tools/metadata_hook.lua -L tools/metadata_page.lua \
		-M pageurl="/$1/$$(basename $$(notdir $$<))" \
		-M emit_meta=true \
		--title-prefix="l-m.dev" \
	| sqlite3 meta.db
endef

$(foreach dir,$(notdir $(filter $(website)/%,$(DIRS))),$(eval $(call SUBSITE_RULE,$(dir))))
