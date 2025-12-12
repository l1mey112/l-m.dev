#!/bin/bash

if [[ -z "${1:-}" ]]; then
    echo "usage: $0 <db.sqlite> (<path glob>)?" >&2
    exit 1
fi

glob="${2:-"*"}"
glob="${glob//\'/\'\'}"

sqlite3 -cmd ".timeout 10000" "$1" <<EOF
WITH 
filtered_posts AS (
    SELECT * 
    FROM posts 
    WHERE path GLOB '$glob'
),
all_tags_exploded AS (
    SELECT value AS tag
    FROM filtered_posts,
    json_each(
        CASE 
            WHEN tags_urlized IS NULL OR tags_urlized = '' THEN json('[]')
            ELSE json('["' || replace(tags_urlized, ',', '","') || '"]')
        END
    )
),
tag_counts AS (
    SELECT tag, COUNT(*) as popularity
    FROM all_tags_exploded
    GROUP BY tag
    ORDER BY popularity DESC, tag ASC
)
SELECT json_object(
    'post_count', (SELECT COUNT(*) FROM filtered_posts),
    'unique_tag_count', (SELECT COUNT(*) FROM tag_counts),
    'data', (
        SELECT json_group_array(
            json_object(
                'tag', tag, 
                'count', popularity
            )
        )
        FROM tag_counts
    )
);
EOF
