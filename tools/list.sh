#!/bin/bash

if [[ -z "${2:-}" ]]; then
    echo "usage: $0 <directory> <prepend>" >&2
    exit 1
fi

missing=$(grep -L -Pz '(?s)^---\n.*?date:[[:space:]]*[0-9-]+' "$1"/*.md)

if [[ -n "$missing" ]]; then
    echo "error: the following files are missing a date in the frontmatter:" >&2
    echo "$missing" >&2
    exit 1
fi

set -euo pipefail
shopt -s nullglob

while IFS= read -r -d '' f; do
	# we can use yq now

	filename="${f##*/}"
	filename="${filename%.*}"

	# prepend + filename
	baseurl="$2$filename"

	# word count, reading time
	# title, date
	# tags
	# description

	meta_json=$(yq --front-matter=extract -o=json '{"title": .title, "date": .date, "description": .description, "tags": .tags}' "$f")

    wordcount=$(wc -w < "$f")
    reading_time=$(( (wordcount + 212) / 213 ))
    meta_trimmed="${meta_json%\}}"
	echo "$meta_trimmed, \"path\": \"$baseurl\", \"wordcount\": $wordcount, \"reading_time_minutes\": $reading_time}"
done < <(find "$1" -type f -name '*.md' -print0) \
	| jq -s '. | sort_by(.path) | reverse | sort_by(.date) | reverse'

# sort by date descending, path ascending
