local urlize = require("tools.modules.urlize")
local datenorm = require("tools.modules.datenorm")
local wordcount_info = require("tools.modules.pandoc_wordcount")
local me = require("tools.modules.me")

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
	end

	if meta.epoch then
		meta.date_epoch_rfc3339 = datenorm.utc_epoch_to_rfc3339(meta.epoch)
		meta.date_epoch_nice = datenorm.utc_epoch_to_nice_string(meta.epoch)
		meta.tags_me_fmt = me.fmt_tags_pandoc(tags)
		meta.title = '???'
	end

	local reading_info = wordcount_info(doc)

	meta.word_count = reading_info.word_count
	meta.reading_time = reading_info.reading_time

	return doc
end
