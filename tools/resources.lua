-- we want to resolve relative to meta.media_path,
-- then put these inside the mediabag
local media_path

function resolve_url(src)
	src = pandoc.utils.stringify(src)

	local path = media_path .. "/" .. src
	local url = "/media/" .. src

	print(path)

	local mt, contents = pandoc.mediabag.fetch(path)
	pandoc.mediabag.insert(src, mt, contents)

	return url
end

local image_styles = {
    ['png-full']      = '<div style="text-align: center;"><img loading="lazy" style="border: none;" src="%s"></img></div>',
	--[[ png ]]
    ['png-full-50']   = '<div style="text-align: center;"><img loading="lazy" style="border: none; height: 50%%; width: 50%%;" src="%s"></img></div>',
	--[[ png_fullish ]]
    ['png-full-75']   = '<div style="text-align: center;"><img loading="lazy" style="border: none; height: 75%%; width: 75%%;" src="%s"></img></div>',
    ['mp4-full']      = '<div style="text-align: center;"><video style="height: 100%%; width: 100%%;" src="%s" muted autoplay loop></video></div>',
	--[[ mp4 ]]
    ['mp4-full-50']   = '<div style="text-align: center;"><video style="height: 50%%; width: 50%%;" src="%s" muted autoplay loop></video></div>',
	--[[ mp4_fullish ]]
    ['mp4-full-75']   = '<div style="text-align: center;"><video style="height: 75%%; width: 75%%;" src="%s" muted autoplay loop></video></div>',
    ['img-raw']       = '<img loading="lazy" src="%s"></img>',
    ['png-flex']      = '<img loading="lazy" style="max-width: 100%%; height: auto; flex: 1 1 0; min-width: 200px;" src="%s"></img>'
}

function _Image(el)

	for _, class in ipairs(el.classes) do
        local template = image_styles[class]
        if template then
            return pandoc.RawInline(
                'html',
                string.format(template, resolve_url(el.src))
            )
        end
    end
	
	if el.classes:includes('png-list') then
		local srcs = {}
		
		local src_list = pandoc.utils.stringify(el.src)
		for src in string.gmatch(src_list, '([^,]+)') do
			table.insert(srcs, resolve_url(src))
		end

		local html = '<div class="flex-columns" style="gap:2em;">'

		for _, src in ipairs(srcs) do
			html = html .. string.format(
				'<img loading="lazy" style="width: 100%%; flex: 1; min-width: 0; height: auto;" src="%s"></img>',
				src
			)
		end
	
		html = html .. '</div>'
		return pandoc.RawInline('html', html)
	end

	if el.classes:includes('mp4-list') then
		local srcs = {}
		
		local src_list = pandoc.utils.stringify(el.src)
		for src in string.gmatch(src_list, '([^,]+)') do
			table.insert(srcs, resolve_url(src))
		end

		local html = '<div class="flex-columns" style="gap:2em;">'

		for _, src in ipairs(srcs) do
			html = html .. string.format(
				'<video style="width: 100%%; flex: 1; min-width: 0; height: auto;" src="%s" muted autoplay loop></video>',
				src
			)
		end
	
		html = html .. '</div>'
		return pandoc.RawInline('html', html)
	end


	--[[ should probably error out here ]]

	return el
end

function _Meta(meta)
	media_path = meta.media_path
	return meta
end

function Pandoc(doc)
	doc = doc:walk { Meta = _Meta }
	doc = doc:walk { Image = _Image }
	return doc
end
