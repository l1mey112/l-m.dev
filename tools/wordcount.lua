-- MIT License
-- 
-- Copyright (c) 2017-2021 pandoc Lua filters contributors
-- 
-- Permission is hereby granted, free of charge, to any person obtaining a copy
-- of this software and associated documentation files (the "Software"), to deal
-- in the Software without restriction, including without limitation the rights
-- to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
-- copies of the Software, and to permit persons to whom the Software is
-- furnished to do so, subject to the following conditions:
-- 
-- The above copyright notice and this permission notice shall be included in all
-- copies or substantial portions of the Software.
-- 
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
-- IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
-- AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
-- LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
-- OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
-- SOFTWARE.

-- counts words in a document

words = 0
characters = 0
characters_and_spaces = 0

wordcount = {
	Str = function(el)
		-- we don't count a word if it's entirely punctuation:
		if el.text:match("%P") then
			words = words + 1
		end
		characters = characters + utf8.len(el.text)
		characters_and_spaces = characters_and_spaces + utf8.len(el.text)
	end,

	Space = function(el)
		characters_and_spaces = characters_and_spaces + 1
	end,

	Code = function(el)
		_,n = el.text:gsub("%S+","")
		words = words + n
		text_nospace = el.text:gsub("%s", "")
		characters = characters + utf8.len(text_nospace)
		characters_and_spaces = characters_and_spaces + utf8.len(el.text)
	end,

	CodeBlock = function(el)
		_,n = el.text:gsub("%S+","")
		words = words + n
		text_nospace = el.text:gsub("%s", "")
		characters = characters + utf8.len(text_nospace)
		characters_and_spaces = characters_and_spaces + utf8.len(el.text)
	end
}

-- https://bojidar-bg.dev/blog/2025-05-14-pandoc-word-count/

function Pandoc(doc)
	-- skip metadata, just count body:
	pandoc.walk_block(pandoc.Div(doc.blocks), wordcount)
	doc.meta.word_count = words

	-- .ReadingTime from Hugo: https://github.com/gohugoio/hugo/blob/master/hugolib/page__content.go
	local reading_time = math.floor((words + 212) / 213)
	doc.meta.reading_time = reading_time
	return doc
end
