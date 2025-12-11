
---------------------------------------------------------------------------
-- this runs on each "post" file, and prints out the metadata to insert  --
-- into the meta.db                                                      --
--                                                                       --
-- replaces cs_list.json                                                 --
---------------------------------------------------------------------------

local function esc(str)
    if str == nil then return "NULL" end
    str = tostring(str)
    return str:gsub("'", "''")
end

local datenorm = require("tools.modules.datenorm")
local urlize = require("tools.modules.urlize")
local pandoc_safe = require("tools.modules.pandoc_safe")
local wordcount_info = require("tools.modules.pandoc_wordcount")

function Pandoc(doc)
	if not doc.meta.extract_meta then
		return doc
	end
	
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

	local date_yyyy_mm_dd = pandoc.utils.stringify(doc.meta.date)
	doc.meta.date_formatted = datenorm.normalize_date(doc.meta.date)

	local title = pandoc.utils.stringify(doc.meta.title)
	local description = pandoc.utils.stringify(doc.meta.description)

	local epoch = nil

	if doc.meta.epoch then
		epoch = pandoc.utils.stringify(doc.meta.epoch)
	end

	-- 10 seconds, avoid database is locked errors
	print('PRAGMA busy_timeout = 10000;')
	print('BEGIN IMMEDIATE TRANSACTION;')

	-- see schema.sql
	print(string.format([[
		insert or replace into posts (
			path,
			date_yyyy_mm_dd, date_formatted, epoch,
			title, description, tags, tags_urlized, word_count, reading_time
		)
		values ('%s', '%s', '%s', %s, '%s', '%s', '%s', '%s', %d, %d);
	]],
		esc(path),
		esc(date_yyyy_mm_dd), esc(doc.meta.date_formatted), esc(epoch),
		
		esc(title), esc(description),
		
		esc(table.concat(tags, ",")), esc(table.concat(urlized_tags, ",")),
		reading_info.word_count, reading_info.reading_time
	))

	print('COMMIT;')

	--[[ 
	
		-- into json

		select json_group_array(
			json_object(
				'path', path,
				'date_yyyy_mm_dd', date_yyyy_mm_dd,
				'date_formatted', date_formatted,
				'epoch', epoch,
				'title', title,
				'description', description,
				'tags', tags,
				'tags_urlized', tags_urlized,
				'word_count', word_count,
				'reading_time', reading_time
			)
		) from posts;
	
	]]

	return doc
end
