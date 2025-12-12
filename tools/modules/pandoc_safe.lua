
-- you want to use this on the output of pandoc.json.decode, so you can
-- actually return this to user templates

local pandoc_safe = {}

function pandoc_safe.to_pandoc(val)
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
				clean_list:insert(pandoc_safe.to_pandoc(sub_item))
			end
			return pandoc.MetaList(clean_list)
		else
			local clean_map = {}
			for k, sub_val in pairs(val) do
				clean_map[k] = pandoc_safe.to_pandoc(sub_val)
			end
			return pandoc.MetaMap(clean_map)
		end
		
	else
		return pandoc.MetaMap({})
	end
end

--[[ function pandoc_safe.to_lua(val)
	local p_type = pandoc.utils.type(val)

	-- this is probably nil
	if p_type == "userdata" then
		return nil
	end

	if p_type == 'List' or p_type == 'MetaList' then
		local clean_list = {}
		for i, item in ipairs(val) do
			clean_list[i] = pandoc_safe.to_lua(item)
		end
		return clean_list

	elseif p_type == 'MetaMap' then
		local clean_map = {}
		for k, item in pairs(val) do
			clean_map[k] = pandoc_safe.to_lua(item)
		end
		return clean_map

	elseif p_type == 'MetaString' or p_type == 'Str' then
		return tostring(val)

	elseif p_type == 'MetaBool' then
		return val == true

	elseif p_type == 'MetaInlines' or p_type == 'MetaBlocks' then
		return pandoc.utils.stringify(val)
	
	else
		return val
	end
end ]]

function pandoc_safe.stringify_array(arr)
	local typee = pandoc.utils.type(arr)

	if typee == "userdata" or arr == nil then
		return {}
	end

	local str_arr = {}
	for i, item in ipairs(arr) do
		local item_str = pandoc.utils.stringify(item)
		table.insert(str_arr, item_str)
	end
	return str_arr
end

function pandoc_safe.stringify_or_nil(val)
	local typee = pandoc.utils.type(val)
	if typee == "userdata" or val == nil then
		return nil
	end
	return pandoc.utils.stringify(val)
end

return pandoc_safe