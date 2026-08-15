local urlize = require("tools.modules.urlize")
local datenorm = require("tools.modules.datenorm")
local wordcount_info = require("tools.modules.pandoc_wordcount")
local me = require("tools.modules.me")
local pandoc_safe = require("tools.modules.pandoc_safe")

function Pandoc(doc)
	local meta = doc.meta
	local tags = meta.tags
	local sources = meta.sources

	if tags == nil then tags = {} end
	if sources == nil then sources = {} end

	-- https://stackoverflow.com/questions/76578891/boolean-operator-in-pandoc-template
	meta['has_tags_or_sources'] = #tags > 0 or #sources > 0

	if meta.tags then
		meta.tags_urlized = urlize.urlize_pandoc_array_pairs(meta.tags)
	end

	if meta.date then
		meta.date_formatted = datenorm.normalize_date(meta.date)
		meta.date_yyyy_mm_dd = datenorm.iso_date(meta.date)
	end

	if meta.epoch then
		meta.date_epoch_rfc3339 = datenorm.utc_epoch_to_rfc3339(meta.epoch)
		meta.date_epoch_nice = datenorm.utc_epoch_to_nice_string(meta.epoch)
		meta.tags_me_fmt = me.fmt_tags_pandoc(tags)

		if not meta.title then
			meta.title = '???'
		end
	end

	local reading_info = wordcount_info(doc)

	meta.word_count = reading_info.word_count
	meta.reading_time = reading_info.reading_time
	meta.jsonld = build_jsonld(meta, tags)

	return doc
end

function build_jsonld(meta, tags)
	local canonical = pandoc_safe.stringify_or_nil(meta.canonical)

	if pandoc_safe.stringify_or_nil(meta.section) ~= "cs" or canonical == nil then
		return nil
	end

	local posting = {
		["@context"] = "https://schema.org",
		["@type"] = "BlogPosting",
		["@id"] = canonical .. "#article",
		mainEntityOfPage = canonical,
		headline = pandoc_safe.stringify_or_nil(meta.title),
		description = pandoc_safe.stringify_or_nil(meta.description),
		datePublished = pandoc_safe.stringify_or_nil(meta.date_yyyy_mm_dd),
		author = { ["@id"] = (pandoc_safe.stringify_or_nil(meta.siteurl) or "https://l-m.dev") .. "/#person" },
	}

	local keywords = pandoc_safe.stringify_array(tags)
	if #keywords > 0 then
		posting.keywords = keywords
	end

	-- stringify_or_nil keeps "", and one post has an empty description
	if posting.description == "" then
		posting.description = nil
	end

	local script = '<script type="application/ld+json">\n'
		.. pandoc.json.encode(posting)
		.. '\n</script>'

	return pandoc.MetaBlocks({ pandoc.RawBlock("html", script) })
end
