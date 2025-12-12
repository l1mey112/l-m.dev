
function extract_body(url_path)
	local path = 'public' .. url_path .. '/index.html'

	local file = io.open(path, "r")
	if not file then
		return nil
	end
	local content = file:read("*all")
	file:close()

	return content:match("<body>([\0-\255]-)</body>")
end

return extract_body
