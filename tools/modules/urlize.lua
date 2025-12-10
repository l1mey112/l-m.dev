
local urlize = {}

-- https://github.com/jgm/pandoc/discussions/11331

-- https://gohugo.io/functions/urls/urlize/
-- i vibed this shit unfortunately.

-- Helper: Determine if a character is allowed in Hugo's path sanitization
local function is_allowed_path_char(char, codepoint)
  -- Hugo allows: . / _ - # +
  if char:match("[%w%.%/%_%-%+%#]") then return true end
  
  -- Hugo allows Unicode letters and numbers (simplification: keep all non-ASCII)
  if codepoint > 127 then return true end
  
  return false
end

-- 1. Sanitize: Replaces spaces with hyphens, strips "bad" chars, preserves Unicode
local function sanitize(str)
  local res = {}
  local prepend_hyphen = false
  local was_hyphen = false
  
  for p, c in utf8.codes(str) do
    local char = utf8.char(c)
    local is_space = char:match("%s")
    local allowed = is_allowed_path_char(char, c)
    
    if is_space then allowed = false end
    
    if allowed then
      -- If we saw a space previously, inject a hyphen now (unless this char is a hyphen)
      if prepend_hyphen then
        if char ~= "-" then
          table.insert(res, "-")
        end
        prepend_hyphen = false
      end
      
      table.insert(res, char)
      was_hyphen = (char == "-")
    elseif is_space then
      -- Mark that we saw a space; if valid chars follow, we'll prepend a hyphen
      -- (Hugo logic: len(target) > 0 && !wasHyphen)
      if #res > 0 and not was_hyphen then
        prepend_hyphen = true
      end
    end
    -- "Bad" ASCII characters (like , : %) are simply skipped
  end
  
  return table.concat(res)
end

-- 2. URL Escape: Percent-encodes characters that aren't standard URL safe
local function url_escape(str)
  -- We iterate by byte here to percent-encode UTF-8 sequences
  -- We preserve %w (alphanumeric), ., -, _, ~, and / (path separator)
  return (str:gsub("([^%w%.%-%_~%/])", function(c)
    return string.format("%%%02X", string.byte(c))
  end))
end

-- The main urlize function
function urlize.urlize(str)
	str = pandoc.utils.stringify(str)
  return url_escape(string.lower(sanitize(str)))
end

function urlize.urlize_pandoc_array(arr)
	local typee = pandoc.utils.type(arr)

	-- this is probably an empty array..
	if typee == "userdata" then
		return nil
	end

	
	local urlized_tags = {}
	-- Iterate over the existing tags
	for i, tag in ipairs(arr) do
		local original_text = pandoc.utils.stringify(tag)
		local urlized_text = urlize.urlize(original_text)

		-- Create a new object containing both for display
		table.insert(urlized_tags, pandoc.MetaMap({
			original = original_text,
			urlized = urlized_text
		}))
	end

	return pandoc.MetaList(urlized_tags)
end

--[[ 
  > urlize("Vim (text editor)")
  vim-text-editor
]]

return urlize
