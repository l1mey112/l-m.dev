#!/bin/bash

if [[ -z "${1:-}" ]]; then
    echo "usage: $0 <db.sqlite>" >&2
    exit 1
fi

sqlite3 "$1" <<EOF
WITH all_tags_exploded AS (
    SELECT value AS tag
    FROM posts,
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
    'post_count', (SELECT COUNT(*) FROM posts),
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
