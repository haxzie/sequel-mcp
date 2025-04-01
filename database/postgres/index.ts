import { createDatabaseConnector } from "database/connector";
import { CredentialType, DatabaseType } from "database/types";
import postgres from "postgres";
import { databaseSchemaQuery } from "./queries";

export const Postgres = createDatabaseConnector({
  id: DatabaseType.PostgreSQL,
  name: "PostgreSQL",
  connection: {
    type: CredentialType.ConnectionString,
    example: "postgres://username:password@host:port/database",
  },
  connect: async (credential) => {
    const { connectionString } = credential;
    const sql = postgres(connectionString, {});

    return {
      test: async () => {
        try {
          const query = sql`SELECT 1;`.raw();
          setTimeout(() => {
            query.cancel();
          }, 5000);
          await query;
          return {
            success: true,
            message: "Connection successful",
          };
        } catch (error) {
          if (error instanceof Error && error.message) {
            return {
              success: false,
              message: `Postgres Error: ${error.message}`,
            };
          } else {
            return {
              success: false,
              message: `Error: Error while testing query "select 1;". Please check your connection or refer docs for more details.`,
            };
          }
        }
      },
      query: async (query, readOnly) => {
        try {
          const rows = await sql`${sql.unsafe(query)}`.execute();
          const affectedRows = rows.count || 0;
          return {
            rows,
            fields: rows.columns.map((column) => ({
              name: column.name,
              type: column.type,
            })),
            rowCount: rows.length,
            affectedRows: rows.length > 0 ? 0 : affectedRows,
            error: "",
          };
        } catch (error) {
          return {
            rows: [],
            fields: [],
            rowCount: 0,
            affectedRows: 0,
            error:
              error instanceof Error && error.message
                ? error.message
                : "Error while executing query",
          };
        }
      },
      disconnect: async () => {
        try {
          await sql.end();
        } catch (error) {
          console.error("Error while disconnecting from Postgres:", error);
        }
      },
      getSchema: async () => {
        try {
          const tables = await sql`${sql.unsafe(
            databaseSchemaQuery
          )}`.execute();
          const schema = tables.reduce((acc: any, table: any) => {
            const tableName = `${table.table_schema}.${table.table_name}`;
            if (!acc[tableName]) {
              acc[tableName] = {
                name: table.table_name,
                schema: table.table_schema,
                columns: [],
              };
            }
            acc[tableName].columns.push({
              name: table.column_name,
              type: table.column_type,
              isPrimary: table.is_primary_key === 1,
              referenceTable: table.referenced_table_name,
              referenceColumn: table.referenced_column_name,
            });
            return acc;
          }, {});
          if (tables.length === 0) {
            return {
              error: "No tables found",
            };
          }
          return schema;
        } catch (error) {
          console.error(error);
          return {
            error:
              error instanceof Error && error.message
                ? error.message
                : "Error while fetching database schema / executing query",
          };
        }
      },
    };
  },
});
