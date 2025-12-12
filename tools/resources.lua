-- we want to resolve relative to meta.media_path,
-- then put these inside the mediabag
local media_path

local function is_remote_path(path)
    return path:match("^%a+://") or path:match("^//") ~= nil
end

function resolve_url(src)
	src = pandoc.utils.stringify(src)

	if is_remote_path(src) then
		return src
	end

	local path = media_path .. "/" .. src
	local url = "/media/" .. src

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

local debug = require("tools.modules.debug")

local function handle_wikilink(el)
	--[[
		the only way we know that something is a wikilink is by checking the title="wikilink"
		on the pandoc element. this seems quite brittle, but oh well!

		if something happens, it's probably this
	]]

	local src = resolve_url(el.src)

	local caption = pandoc.utils.stringify(el.caption)

	local opt_centre = nil
	local opt_pixel = nil

	-- there isn't a special directive, captions are the directives
	if el.src == caption then
		-- no directives
	else
		for directive in string.gmatch(caption, '([^|]+)') do
			directive = directive:lower():gsub("^%s*(.-)%s*$", "%1") -- trim spaces

			if directive == "center" then
				opt_centre = true
			else
				local pixel_value = tonumber(directive)
				if pixel_value then
					opt_pixel = pixel_value
				else
					debug.eprint("unrecognized wikilink directive: " .. directive)
				end
			end
		end
	end

	if opt_centre and opt_pixel then
		return pandoc.RawInline(
			'html',
			string.format(
				'<div style="text-align: center;"><img loading="lazy" style="border: none; width: %dpx; height: auto;" src="%s"></img></div>',
				opt_pixel,
				src
			)
		)
	elseif opt_centre then
		return pandoc.RawInline(
			'html',
			string.format(
				'<div style="text-align: center;"><img loading="lazy" style="border: none;" src="%s"></img></div>',
				src
			)
		)
	elseif opt_pixel then
		return pandoc.RawInline(
			'html',
			string.format(
				'<img loading="lazy" style="border: none; width: %dpx; height: auto;" src="%s"></img>',
				opt_pixel,
				src
			)
		)
	else
		return pandoc.RawInline(
			'html',
			string.format(
				'<img loading="lazy" style="border: none;" src="%s"></img>',
				src
			)
		)
	end
end

function is_wikilink(el) 
	return el.title == "wikilink"
end

function _Para(el)
	-- handle collage images
	-- ![[tole.png]] ![[tole.png]] ![[tole.png]]

	--[[ , Para
		[ Image
			( "" , [] , [] )
			[ Str "tole.png" ]
			( "tole.png" , "wikilink" )
		, Space
		, Image
			( "" , [] , [] )
			[ Str "tole.png" ]
			( "tole.png" , "wikilink" )
		, Space
		, Image
			( "" , [] , [] )
			[ Str "tole.png" ]
			( "tole.png" , "wikilink" )
		]
	] ]]

	local image_elements = {}

	for i, inline in ipairs(el.content) do
		if inline.t == "Image" and is_wikilink(inline) then
			table.insert(image_elements, inline)
		elseif inline.t == "Space" then
			-- ignore spaces
		else
			-- not a collage
			return nil
		end
	end

	if #image_elements <= 1 then
		-- not a collage
		return nil
	end

	local html = '<div class="image-row">'
	for _, img in ipairs(image_elements) do
		html = html .. handle_wikilink(img).text
	end
	html = html .. '</div>'
	return pandoc.RawInline('html', html)
end

function _Image(el)
	if is_wikilink(el) then
		return handle_wikilink(el)
	end

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

	if not is_remote_path(el.src) then
		debug.print_table(el)
		error("unrecognized local image kind for local media (see above ^^)")
	end

	return nil
end

function _Meta(meta)
	media_path = meta.media_path
	return meta
end

function Pandoc(doc)
	doc = doc:walk { Meta = _Meta }
	doc = doc:walk { Para = _Para } -- find wikilinks in paragraphs first
	doc = doc:walk { Image = _Image }
	return doc
end
