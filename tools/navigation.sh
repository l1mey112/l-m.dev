#!/bin/bash

if [[ -z "${2:-}" ]]; then
    echo "usage: $0 <directory> <prepend>" >&2
    exit 1
fi

missing=$(grep -L -Pz '(?s)^---\n.*?date:[[:space:]]*[0-9-]+' $1/*.md)

if [[ -n "$missing" ]]; then
    echo "error: the following files are missing a date in the frontmatter:" >&2
    echo "$missing" >&2
    exit 1
fi

set -euo pipefail

grep -H -Pzo '(?s)^---\n.*?date:[[:space:]]*"?\K[0-9-]+' $1/*.md \
		| tr '\0' '\n' \
		| sed -E 's|.*/(.+)\.md:(.+)|\2 \1|' \
		| sort \
		| awk -v arg="$2" '{print arg $2}' \
		| jq -R -s '
	split("\n") | map(select(length > 0)) | . as $rows |
	to_entries | map({
		key: .value,
		value: {
			prev: (if .key > 0 then $rows[.key - 1] else null end),
			next: (if .key < ($rows|length - 1) then $rows[.key + 1] else null end)
		} | with_entries(select(.value != null))
	}) | from_entries
'
