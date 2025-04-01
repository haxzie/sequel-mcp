export const databaseSchemaQuery = `WITH fk_info AS (
    SELECT DISTINCT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name,
        kcu.referenced_table_schema,
        kcu.referenced_table_name,
        kcu.referenced_column_name
    FROM
        information_schema.key_column_usage AS kcu
    WHERE
        kcu.referenced_table_schema IS NOT NULL
)
SELECT DISTINCT
    c.table_schema AS table_schema,
    c.table_name AS table_name,
    c.column_name AS column_name,
    c.data_type AS column_type,
    CASE
        WHEN tc.constraint_type = 'PRIMARY KEY' THEN 1
        ELSE 0
    END AS is_primary_key,
    fk.referenced_table_name AS referenced_table_name,
    fk.referenced_column_name AS referenced_column_name,
    c.ordinal_position AS ordinal_position
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
    c.table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
ORDER BY
    c.table_schema,
    c.table_name,
    c.ordinal_position;
`