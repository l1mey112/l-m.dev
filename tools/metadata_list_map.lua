local pandoc_safe = require("tools.modules.pandoc_safe")
local urlize = require("tools.modules.urlize")
local datenorm = require("tools.modules.datenorm")
local me = require("tools.modules.me")
local extract_html = require("tools.modules.extract_html")

local function comma_sep_to_pandoc(str)
	local result = {}
	for item in string.gmatch(str, '([^,]+)') do
		table.insert(result, pandoc.Str(item))
	end
	return pandoc.MetaList(result)
end

function Meta(meta)

	if meta.list_map_file then
		local list_file = io.open(meta.list_map_file, "r")
		local file = list_file:read("*all")
		list_file:close()

		local list = pandoc.json.decode(file)
		local nlist = {}

		if #list == 0 then
			meta.list_map = pandoc.MetaList({})
			return meta
		end

		for i, item in ipairs(list) do
			nlist[i] = pandoc_safe.to_pandoc(item)
			nlist[i].tags = comma_sep_to_pandoc(item.tags)
			nlist[i].tags_urlized = comma_sep_to_pandoc(item.tags_urlized)

			if nlist[i].epoch then
				nlist[i].date_epoch_rfc3339 = datenorm.utc_epoch_to_rfc3339(nlist[i].epoch)
				nlist[i].date_epoch_nice = datenorm.utc_epoch_to_nice_string(nlist[i].epoch)
				nlist[i].tags_me_fmt = me.fmt_tags_pandoc(nlist[i].tags)
				nlist[i].body = pandoc.RawBlock('html', extract_html.extract_body(nlist[i].path))
			end
		end

		meta.latest_post = nlist[1]

		-- move the epoch 0 post at the bottom to the top (this is pinned), if it exists
		-- 0 != "0"
		if nlist[#nlist].epoch == "0" then
			local pinned = nlist[#nlist]
			table.remove(nlist, #nlist)
			table.insert(nlist, 1, pinned)

			--[[ for inserting a <hr> ]]
			pinned.last_pinned = true
		end

		meta.list_map = pandoc.MetaList(nlist)
	end

	return meta
end
