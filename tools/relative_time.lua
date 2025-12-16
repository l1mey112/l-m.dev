
--[[

# []{.stream-time} Verification of Program Optimisations (Lean)

]]

local pandoc_safe = require("tools.modules.pandoc_safe")

local epoch
local duration_hours

function _Span(el)
	if el.classes:includes('stream-time') then
		return pandoc.RawInline('html', string.format('<time class="stream-time" data-stream-epoch="%s" data-duration-hours="%s" style="display: none;"></time>', epoch, duration_hours))
	end
end

function Pandoc(doc)
	epoch = pandoc_safe.stringify_or_nil(doc.meta.epoch)
	duration_hours = pandoc_safe.stringify_or_nil(doc.meta['duration-hours'])
	doc = doc:walk { Span = _Span }
	return doc
end
