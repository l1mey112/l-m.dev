
local sql = {}

function sql.esc(str)
    if str == nil then return "NULL" end
    str = tostring(str)
    return str:gsub("'", "''")
end

function sql.exec(...)
    local args = {...}

    -- 10 seconds, avoid database is locked errors
	print('PRAGMA busy_timeout = 10000;')
	print('BEGIN IMMEDIATE TRANSACTION;')
	for i = 1, #args do
        print(args[i])
    end
    print('COMMIT;')
end

return sql