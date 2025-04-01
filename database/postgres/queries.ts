export const databaseSchemaQuery = `WITH fk_info AS (
    SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS referenced_table_schema,
        ccu.table_name AS referenced_table_name,
        ccu.column_name AS referenced_column_name
    FROM
        information_schema.table_constraints AS tc
    JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN
        information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE
        tc.constraint_type = 'FOREIGN KEY'
)
SELECT
    c.table_schema AS table_schema,
    c.table_name AS table_name,
    c.column_name AS column_name,
    c.data_type AS column_type,
    CASE
        WHEN tc.constraint_type = 'PRIMARY KEY' THEN 1
        ELSE 0
    END AS is_primary_key,
    fk.referenced_table_name AS referenced_table_name,
    fk.referenced_column_name AS referenced_column_name
FROM
    information_schema.columns c
LEFT JOIN
    information_schema.key_column_usage kcu
    ON c.table_name = kcu.table_name
    AND c.column_name = kcu.column_name
    AND c.table_schema = kcu.table_schema
LEFT JOIN
    information_schema.table_constraints tc
    ON kcu.constraint_name = tc.constraint_name
    AND tc.constraint_type = 'PRIMARY KEY'
LEFT JOIN
    fk_info fk
    ON c.table_name = fk.table_name
    AND c.column_name = fk.column_name
    AND c.table_schema = fk.table_schema
WHERE
    c.table_schema NOT IN ('pg_catalog', 'information_schema', 'supabase')
    AND c.table_schema NOT LIKE 'pg_%'
ORDER BY
    c.table_schema,
    c.table_name,
    c.ordinal_position;`;
