local datenorm = require("tools.modules.datenorm")
local urlize = require("tools.modules.urlize")
local pandoc_safe = require("tools.modules.pandoc_safe")

function Meta(meta)

	if meta.list_map_file then
		local list_file = io.open(meta.list_map_file, "r")
		local file = list_file:read("*all")
		list_file:close()

		local list = pandoc.json.decode(file)
		local nlist = {}

		for i, item in ipairs(list) do
			nlist[i] = pandoc_safe(item)
			nlist[i].date_formatted = datenorm.normalize_date(item.date)
			nlist[i].tags_urlized = urlize.urlize_pandoc_array(item.tags)
		end

		meta.list_map = pandoc.MetaList(nlist)
	end

	return meta
end
