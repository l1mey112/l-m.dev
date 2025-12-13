
---------------------------------------------------------------------------
-- this runs on each "post" file, and prints out the metadata to insert  --
-- into the meta.db                                                      --
--                                                                       --
-- replaces cs_list.json                                                 --
---------------------------------------------------------------------------


local datenorm = require("tools.modules.datenorm")
local urlize = require("tools.modules.urlize")
local pandoc_safe = require("tools.modules.pandoc_safe")
local wordcount_info = require("tools.modules.pandoc_wordcount")
local sql = require("tools.modules.sql")

function Pandoc(doc)
	local reading_info = wordcount_info(doc)
	local tags = pandoc_safe.stringify_array(doc.meta.tags)
	local urlized_tags = urlize.urlize_array(doc.meta.tags)
	local path = pandoc.utils.stringify(doc.meta.pageurl)

	if tags == nil then
		tags = {}
	end

	if urlized_tags == nil then
		urlized_tags = {}
	end

	local epoch = nil

	if doc.meta.epoch then
		epoch = pandoc.utils.stringify(doc.meta.epoch)
	end

	if not doc.meta.date then
		if epoch then
			doc.meta.date = datenorm.utc_epoch_to_YYYY_MM_DD(epoch)
		else
			error("no date or epoch metadata for post: " .. path)
		end
	end

	local date_yyyy_mm_dd = pandoc.utils.stringify(doc.meta.date)
	doc.meta.date_formatted = datenorm.normalize_date(doc.meta.date)

	if not doc.meta.emit_meta then
		return doc
	end

	local title = pandoc_safe.stringify_or_nil(doc.meta.title)
	local description = pandoc_safe.stringify_or_nil(doc.meta.description)

	-- see schema.sql
	sql.exec(string.format([[
		insert or replace into posts (
			path,
			date_yyyy_mm_dd, date_formatted, epoch,
			title, description, tags, tags_urlized,
			word_count, reading_time
		)
		values ('%s', '%s', '%s', %s, '%s', '%s', '%s', '%s', %d, %d);
	]],
		sql.esc(path),
		sql.esc(date_yyyy_mm_dd), sql.esc(doc.meta.date_formatted), sql.esc(epoch),
		
		sql.esc(title), sql.esc(description),
		
		sql.esc(table.concat(tags, ",")), sql.esc(table.concat(urlized_tags, ",")),
		reading_info.word_count, reading_info.reading_time
	))

	return doc
end
