#!/bin/bash

if [[ -z "${1:-}" ]]; then
    echo "usage: $0 <db.sqlite> (<path glob>)?" >&2
    exit 1
fi

glob="${2:-"*"}"
glob="${glob//\'/\'\'}"

sqlite3 -cmd ".timeout 10000" "$1" <<EOF
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
	where path glob '$glob'
	order by
    	coalesce(epoch, cast(strftime('%s', date_yyyy_mm_dd) as integer)) desc, path asc
);
EOF
