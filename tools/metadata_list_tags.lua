local pandoc_safe = require("tools.modules.pandoc_safe")
local debug = require("tools.modules.debug")

function string.startswith(String,Start)
   return string.sub(String,1,string.len(Start))==Start
end

local function make_pieces(colours, tag_obj)
	local text = tag_obj.tag
	local sections = tag_obj.sections
	
	local text_len = #text
	local sec_count = #sections

	if sec_count == 0 then
		return text
	end

	local html_parts = {}
	local prev_end = 0

	for i, section_key in ipairs(sections) do
		local end_idx = math.floor((i * text_len) / sec_count)
		local start_idx = prev_end + 1

		if start_idx <= end_idx then
			local chunk = text:sub(start_idx, end_idx)
			local color = colours[section_key] or "#FFFFFF"

			table.insert(html_parts, string.format(
				'<span style="background-color: %s;">%s</span>', 
				color, 
				chunk
			))
		end

		prev_end = end_idx
	end

	return table.concat(html_parts)
end

function Meta(meta)

	if meta.list_tags_file then
		local list_file = io.open(meta.list_tags_file, "r")
		local list = pandoc.json.decode(list_file:read("*all"))
		list_file:close()

		local colours_file = io.open(meta.colours_file, "r")
		local colours = pandoc.json.decode(colours_file:read("*all"))
		colours_file:close()

		meta.tags_map = pandoc_safe.to_pandoc(list)

		for i, tag in ipairs(meta.tags_map.data) do
			-- font size @{2.0 - f64(idx) * 0.02}em; if idx < 50 then less and less
			local idx = i - 1
			tag.font_size = string.format("%.2f", 2.0 - idx * 0.02)
			tag.pieces = pandoc.RawInline(
				"html", 
				make_pieces(colours, tag)
			)

			if string.startswith(tag.tag, "/") then
				tag.url = tag.tag
			end
		end
	end

	return meta
end
