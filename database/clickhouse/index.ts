import { validateReadOnlyQuery } from "@/utils/sql";
import { createClient } from "@clickhouse/client";
import { createDatabaseConnector } from "database/connector";
import { CredentialType, DatabaseType, type DBSchema } from "database/types";
import { databaseSchemaQuery } from "./queries";

export const Clickhouse = createDatabaseConnector({
  id: DatabaseType.ClickHouse,
  name: "ClickHouse",
  connection: {
    type: CredentialType.ConnectionString,
    example: "clickhouse://username:password@clickhouse-server:8123/database",
  },
  connect: async (credential) => {
    const { connectionString } = credential;
    const sql = await createClient({
      url: connectionString,
    });

    return {
      test: async () => {
        try {
          const result = await sql.query({
            query: `SELECT 1;`,
            format: "JSONEachRow",
          });
          const rows = await result.json();
          console.log(rows);
          return {
            success: true,
            message: "Connection successful",
          };
        } catch (error) {
          console.error(error);
          return {
            success: false,
            message: `${
              error instanceof Error ? error.message : "Unknown Error"
            }: Connection timed out while testing query "select 1;". Please check your connection (Sequel does not connect to local database).`,
          };
        }
      },
      query: async (query, readOnly) => {
        try {
          if (readOnly) {
            validateReadOnlyQuery(query);
          }
          const results = await sql.query({
            query: query,
            format: "JSONEachRow",
          });
          const jsonResults: { [key: string]: string | number | boolean }[] =
            await results.json();
          const fields = Object.keys(jsonResults[0] || {}).map((key) => ({
            name: key,
            type: typeof jsonResults[0][key],
          }));
          const affectedRows = 0;
          return {
            rows: jsonResults,
            fields: fields,
            rowCount: jsonResults.length,
            affectedRows: affectedRows,
            error: "",
          };
        } catch (error) {
          return {
            rows: [],
            fields: [],
            rowCount: 0,
            affectedRows: 0,
            error:
              error instanceof Error
                ? error.message
                : "Error while executing query",
          };
        }
      },
      disconnect: async () => {
        try {
          await sql.close();
        } catch (error) {
          console.error("Error closing ClickHouse connection:", error);
        }
      },
      getSchema: async () => {
        try {
          const results = await sql.query({
            query: databaseSchemaQuery,
            format: "JSONEachRow",
          });
          const rows = await results.json();
          const schema = rows.reduce<DBSchema>((acc: any, table: any) => {
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
          }, {} as DBSchema);

          if (rows.length === 0) {
            return {} as DBSchema; // Return an empty object conforming to DBSchema
          }
          return schema;
        } catch (error) {
          console.error(error);
          throw new Error(
            error instanceof Error
              ? error.message
              : "Error while fetching database schema / executing query"
          );
        }
      },
    };
  },
});
