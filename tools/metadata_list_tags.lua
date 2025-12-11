local pandoc_safe = require("tools.modules.pandoc_safe")


function string.startswith(String,Start)
   return string.sub(String,1,string.len(Start))==Start
end

function Meta(meta)

	if meta.list_tags_file then
		local list_file = io.open(meta.list_tags_file, "r")
		local file = list_file:read("*all")
		list_file:close()

		local list = pandoc.json.decode(file)
		meta.tags_map = pandoc_safe.to_pandoc(list)

		for i, tag in ipairs(meta.tags_map.data) do
			-- font size @{2.0 - f64(idx) * 0.02}em; if idx < 50 then less and less
			local idx = i - 1
			tag.font_size = string.format("%.2f", 2.0 - idx * 0.02)
		end
	end

	return meta
end
