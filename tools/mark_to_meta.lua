
local debug = require("tools.modules.debug")

-- ==test== --> [test]{.meta}

function Span(el)
	found, index = el.classes:find('mark', 1)
	
	if found then
		el.classes:remove(index)
		el.classes:insert('meta')
		return el
	end
end