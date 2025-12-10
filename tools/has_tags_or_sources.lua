-- https://stackoverflow.com/questions/76578891/boolean-operator-in-pandoc-template

function Meta(meta)
	local tags = meta.tags
	local sources = meta.sources

	if tags == nil then
		tags = {}
	end
	if sources == nil then
		sources = {}
	end

	meta['has_tags_or_sources'] = #tags or #sources

	-- i don't really know

	if meta['has_tags_or_sources'] > 0 then
		meta['has_tags_or_sources'] = true
	else
		meta['has_tags_or_sources'] = false
	end

	return meta
end
