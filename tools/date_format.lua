local datenorm = require("tools.modules.datenorm")

function Meta(m)
	if m.date then
		m.date_formatted = datenorm.normalize_date(m.date)
	end
	return m
end
