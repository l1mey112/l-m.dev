local urlize = require("tools.modules.urlize")

function Meta(meta)
  if meta.tags then
    meta.tags_urlized = urlize.urlize_pandoc_array(meta.tags)
  end
  return meta
end
