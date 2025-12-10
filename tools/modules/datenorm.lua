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

return datenorm