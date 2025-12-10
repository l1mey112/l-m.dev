function Meta(meta)

	if meta.navigation_map_file then
		local nav_file = io.open(meta.navigation_map_file, "r")
		local navigation_map = nav_file:read("*all")
		nav_file:close()

		local navigation = pandoc.json.decode(navigation_map)

		meta.navigation_next = navigation[meta.pageurl].next
		meta.navigation_prev = navigation[meta.pageurl].prev
	end

	return meta
end
