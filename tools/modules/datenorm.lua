-- {{ dateFormat "Jan 2, 2006" .Date }}

-- https://www.lua.org/pil/22.1.html
local datenorm = {}

function datenorm.normalize_date(date_str)
	local date_str = pandoc.utils.stringify(date_str)  
	local normalized = pandoc.utils.normalize_date(date_str)  
		
	if normalized then  
		local year, month, day = normalized:match("^(%d+)-(%d+)-(%d+)$")  
		if year and month and day then  
			local timestamp = os.time({  
				year = tonumber(year),  
				month = tonumber(month),  
				day = tonumber(day)  
			})
			local month_name = os.date("%b", timestamp)
			
			return string.format("%s %d, %s", month_name, tonumber(day), year)		end
	end

	return nil
end

function datenorm.utc_epoch_to_YYYY_MM_DD(epoch)
	local epoch_num = tonumber(epoch)
	if epoch_num == nil then
		return nil
	end
	return os.date("%Y-%m-%d", epoch_num)
end

function datenorm.utc_epoch_to_rfc3339(epoch)
	local epoch_num = tonumber(epoch)
	if epoch_num == nil then
		return nil
	end
	return os.date("!%Y-%m-%dT%H:%M:%SZ", epoch_num)
end

function datenorm.utc_epoch_to_nice_string(epoch)
	local epoch_num = tonumber(epoch)
	if epoch_num == nil then
		return nil
	end
	return os.date("%c %Z", epoch_num)
end

return datenorm