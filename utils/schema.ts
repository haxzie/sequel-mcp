import type { DBSchema } from "database/types";

/**
 * The function generates a schema context string from the given database schema object.
 * It formats the schema information into a readable string that describes the tables,
 * columns, relations, and their types in the database.
 * @param schema {DBSchema} schema - The database schema object
 * @returns schemaContext {string} - The formatted schema context string
 */
export const generateSchemaContext = (schema: DBSchema): string => {
  let schemaContext = `Database schema:
The following is the database schema of the connected database. It contains the tables, columns, relations and their types.
the format is:

<format>
TableName:
    ColumnName : ColumnType (PK) (FK to ReferenceTable.ReferenceColumn), 
    ...
</format>

The schema is used to understand the database structure and to generate SQL queries.
<schema>
    `;

  Object.keys(schema).forEach((tableName) => {
    schemaContext += `${tableName}:\n
`;
    schema[tableName].columns.forEach((column) => {
      schemaContext += `${column.name} : ${column.type} ${
        column.isPrimary ? " (PK)" : ""
      }${
        column.referenceTable
          ? `(FK to ${column.referenceTable}.${column.referenceColumn})`
          : ""
      }, `;
    });
    schemaContext += `\n
`;
  });
  schemaContext += `</schema>`;

  return schemaContext;
};
