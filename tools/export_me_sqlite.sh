#!/bin/bash

if [[ -z "${2:-}" ]]; then
    echo "usage: $0 <db.sqlite> <dump path>" >&2
    exit 1
fi

mkdir -p "$2"

ids=$(sqlite3 "$1" "select created_at FROM posts")

for id in $ids; do

    sqlite3 "$1" <<EOF > "$2/${id}.md"
select 
  '---' || char(10) ||
  'id: ' || created_at || char(10) ||
  'date: ' || datetime(created_at, 'unixepoch') || char(10) ||
  'tags: [' || COALESCE(tags, '') || ']' || char(10) ||
  '---' || char(10) || char(10) ||
  COALESCE(content, '')
FROM posts 
WHERE created_at = $id;
EOF
done
