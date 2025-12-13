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
    WHERE section GLOB '$glob'
),
combined_tags AS (
    SELECT value AS tag, section
    FROM filtered_posts,
    json_each(
        CASE 
            WHEN tags_urlized IS NULL OR tags_urlized = '' THEN json('[]')
            ELSE json('["' || replace(tags_urlized, ',', '","') || '"]')
        END
    )
    UNION ALL
    SELECT '/' || section AS tag, section
    FROM filtered_posts
    WHERE section IS NOT NULL AND section != ''
),
distinct_tag_sections AS (
    SELECT DISTINCT tag, section
    FROM combined_tags
),
grouped_sections AS (
    SELECT 
        tag, 
        json_group_array('/' || section) as sections_json
    FROM distinct_tag_sections
    GROUP BY tag
),
tag_counts AS (
    SELECT tag, COUNT(*) as popularity
    FROM combined_tags
    GROUP BY tag
)
SELECT json_object(
    'post_count', (SELECT COUNT(*) FROM filtered_posts),
    'unique_tag_count', (SELECT COUNT(*) FROM tag_counts),
    'data', (
        SELECT json_group_array(
            json_object(
                'tag', tag, 
                'count', popularity,
                'sections', json(sections_json)
            )
        )
        FROM (
            SELECT t.tag, t.popularity, s.sections_json
            FROM tag_counts t
            JOIN grouped_sections s ON t.tag = s.tag
            ORDER BY 
                (t.tag LIKE '/%') DESC,
                t.popularity DESC,
                t.tag ASC
        )
    )
);
EOF