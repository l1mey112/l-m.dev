#!/usr/bin/env bash

set -uo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
readonly SCRIPT_DIR

# exit tools/
cd "$SCRIPT_DIR/.." || exit 1

{
	echo '<?xml version="1.0" encoding="UTF-8"?>'
	echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

	while IFS= read -r f; do
		grep -q '<meta name="robots" content="noindex">' "$f" && continue

		# public/cs/crepl/index.html -> /cs/crepl
		# public/index.html -> /
		loc="${f#public}"
		loc="${loc%index.html}"
		[[ $loc == / ]] || loc="${loc%/}"

		canon=$(sed -n 's/.*<link rel="canonical" href="\([^"]*\)".*/\1/p' "$f" | head -1)
		[[ $canon == *"://"*"$loc" ]] || continue

		if [[ $loc == / ]]; then src="Website/index.md"; else src="Website$loc.md"; fi
		# /cs and /stream are generated from meta.db, so fall back to the section dir
		[[ -f $src ]] || src="Website$loc"
		mod=$(git log -1 --format=%cs -- "$src" 2>/dev/null)

		printf '\t<url><loc>%s</loc>%s</url>\n' \
			"$canon" "${mod:+<lastmod>$mod</lastmod>}"
	done < <(find public -name index.html | sort)

	# /talks
	# the point is that i create "handout" versions (the phandout.typ files) that
	# can be indexed nicely by the internet
	while IFS= read -r f; do
		# public/talks/foo.pdf -> /talks/foo.pdf
		loc="${f#public}"

		mod=$(git log -1 --format=%cs -- "$f" 2>/dev/null)
		[[ -n $mod ]] || mod=$(date -r "$f" +%F)

		printf '\t<url><loc>%s%s</loc>%s</url>\n' \
			"https://l-m.dev" "${loc// /%20}" "${mod:+<lastmod>$mod</lastmod>}"
	done < <(find public/talks -name '*.pdf' | sort)

	# /physics-applied
	printf '\t<url><loc>%s</loc><lastmod>%s</lastmod></url>\n' \
		"https://l-m.dev/physics-applied" "2026-08-19"

	echo '</urlset>'
} > public/sitemap.xml
