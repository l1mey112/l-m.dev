
-- you want to use this on the output of pandoc.json.decode, so you can
-- actually return this to user templates

local function pandoc_safe(val)
	local t = type(val)

	if t == "string" then
		return pandoc.MetaString(val)
	elseif t == "number" then
		-- integral values should have no .0 at the end
		if val == math.floor(val) then
			return pandoc.MetaString(string.format("%.0f", val))
		else
			return pandoc.MetaString(tostring(val))
		end
	elseif t == "boolean" then
		return pandoc.MetaBool(val)
	elseif t == "table" then
		local is_list = (val[1] ~= nil) or (next(val) == nil) 
		for k, _ in pairs(val) do
			if type(k) == "string" then is_list = false; break end
		end

		if is_list then
			local clean_list = pandoc.List()
			for _, sub_item in ipairs(val) do
				clean_list:insert(pandoc_safe(sub_item))
			end
			return pandoc.MetaList(clean_list)
		else
			local clean_map = {}
			for k, sub_val in pairs(val) do
				clean_map[k] = pandoc_safe(sub_val)
			end
			return pandoc.MetaMap(clean_map)
		end
		
	else
		return pandoc.MetaMap({})
	end
end

return pandoc_safe