export const databaseSchemaQuery = `SELECT
      database AS table_schema,
      table AS table_name,
      name AS column_name,
      type AS column_type,
      if(is_in_primary_key, 1, 0) AS is_primary_key,
      '' AS referenced_table_name,
      '' AS referenced_column_name
  FROM system.columns
  WHERE database NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA')
  ORDER BY
      table_schema,
      table_name,
      position`;
