local pandoc_safe = require("tools.modules.pandoc_safe")

local me = {}

--[[ me.l-m.dev ]]
function me.fmt_tags_pandoc(tags)
	tags = pandoc_safe.stringify_array(tags)
	if #tags == 0 then return "" end
	return "[ " .. table.concat(tags, " | ") .. " ]"
end

return me
