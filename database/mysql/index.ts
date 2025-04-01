import { createDatabaseConnector } from "database/connector";
import {
  CredentialType,
  DatabaseType,
  type DatabaseCredential,
} from "database/types";
import mysql, { type RowDataPacket } from "mysql2/promise";
import { databaseSchemaQuery } from "./queries";

export const MySQL = createDatabaseConnector({
  id: DatabaseType.MySQL,
  name: "MySQL",
  connection: {
    type: CredentialType.ConnectionString,
    example: "mysql://your_username:your_password@localhost:3306/your_database",
  },
  connect: async (credentials: DatabaseCredential) => {
    const { connectionString } = credentials;
    const sql = await mysql.createConnection(connectionString);

    return {
      test: async () => {
        try {
          await sql.query("SELECT 1");
          return {
            success: true,
            message: "Connection successful",
          };
        } catch (error) {
          if (error instanceof Error && error.message) {
            return {
              success: false,
              message: `MySQL Error: ${error.message}`,
            };
          } else {
            return {
              success: false,
              message: `Error: Error while testing query "SELECT 1". Please check your connection.`,
            };
          }
        }
      },
      query: async (query, readOnly) => {
        try {
          const [results, fields] = await sql.query<RowDataPacket[]>(query);
          const affectedRows = 0;
          return {
            rows: results,
            fields: fields,
            rowCount: results.length,
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
              error instanceof Error && error.message
                ? error.message
                : "Error while executing query",
          };
        }
      },
      getSchema: async () => {
        try {
          const tables = await sql.query<RowDataPacket[]>(databaseSchemaQuery);
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
          return schema;
        } catch (error) {
          return {
            error:
              error instanceof Error && error.message
                ? error.message
                : "Error while fetching schema",
          };
        }
      },
      disconnect: async () => {
        await sql.end();
      },
    };
  },
});
