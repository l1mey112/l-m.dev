local datenorm = require("tools.modules.datenorm")
local urlize = require("tools.modules.urlize")
local pandoc_safe = require("tools.modules.pandoc_safe")

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

		for i, item in ipairs(list) do
			nlist[i] = pandoc_safe.to_pandoc(item)
			nlist[i].tags = comma_sep_to_pandoc(item.tags)
			nlist[i].tags_urlized = comma_sep_to_pandoc(item.tags_urlized)
		end

		meta.list_map = pandoc.MetaList(nlist)
	end

	return meta
end
