
-- https://gist.github.com/phiresky/978d8e204f77feaa0ab5cca08d2d5b27
pragma journal_mode = WAL;

-- https://www.sqlite.org/pragma.html#pragma_synchronous
-- not off because it might not be consistent
pragma synchronous = normal;
pragma temp_store = memory;

create table if not exists posts (
	"path" text primary key,
	"section" text not null,

	"date_yyyy_mm_dd" text not null,
	"date_formatted" text not null,

	"epoch" integer,

	"title" text,
	"description" text,

	"tags" text not null, -- comma-separated list of tags
	"tags_urlized" text not null, -- comma-separated list of urlized tags

	"word_count" integer not null,
	"reading_time" integer not null
);
