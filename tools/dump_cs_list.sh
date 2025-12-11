#!/bin/bash

if [[ -z "${1:-}" ]]; then
    echo "usage: $0 <db.sqlite>" >&2
    exit 1
fi

sqlite3 "$1" <<EOF
select json_group_array(
	json_object(
		'path', path,
		'date_yyyy_mm_dd', date_yyyy_mm_dd,
		'date_formatted', date_formatted,
		'epoch', epoch,
		'title', title,
		'description', description,
		'tags', tags,
		'tags_urlized', tags_urlized,
		'word_count', word_count,
		'reading_time', reading_time
	)
) from (
    select * 
    from posts 
    order by date_yyyy_mm_dd desc, path asc
);
EOF
