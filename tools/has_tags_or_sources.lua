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
	return meta
end
