#!/usr/bin/env node

import { generateSchemaContext } from "@/utils/schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPTransport } from "client/types";
import { DatabaseRegistry } from "database";
import type { DatabaseType } from "database/types";

export const runServer = async (
  database: DatabaseType,
  transport: MCPTransport
) => {
  const server = new Server(
    {
      name: `@sequel/mcp ${database}`,
      description: `ModelContext Protocol server for ${database}`,
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "/schema",
          mimeType: "application/json",
          name: `Database schema`,
        },
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const db = DatabaseRegistry[database];
    const databaseURL = process.env.DATABASE_URL;
    if (!databaseURL) {
      throw new Error("DATABASE_URL is not set");
    }

    if (uri === "/schema") {
      let connection;
      try {
        connection = await db.connect({ connectionString: databaseURL });
        const schema = await connection.getSchema();
        const schemaContext = generateSchemaContext(schema);
        await connection.disconnect();
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "application/json",
              text: schemaContext,
            },
          ],
        };
      } catch (error) {
        if (connection) {
          await connection.disconnect();
        }
        throw error;
      }
    } else {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/plain",
            data: `Unsupported resource ${uri}`,
          },
        ],
      };
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "query",
          description: `Run an SQL query on the connected ${database} database`,
          inputSchema: {
            type: "object",
            properties: {
              sql: { type: "string" },
            },
          },
        },
        {
          name: "schema",
          description: `Get the schema of the connected ${database} database. Use this tool to understand the database structure.`,
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "query") {
      const sql = request.params.arguments?.sql as string;
      const db = DatabaseRegistry[database];
      const databaseURL = process.env.DATABASE_URL;
      if (!databaseURL) {
        throw new Error("DATABASE_URL is not set");
      }

      let connection;

      try {
        connection = await db.connect({ connectionString: databaseURL });
        const results = await connection.query(sql, false);
        await connection.disconnect();
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
          isError: false,
        };
      } catch (error) {
        if (connection) {
          await connection.disconnect();
        }
        return {
          content: [
            {
              type: "text",
              text: `Error executing query: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    } else if (request.params.name === "schema") {
      const db = DatabaseRegistry[database];
      const databaseURL = process.env.DATABASE_URL;
      if (!databaseURL) {
        throw new Error("DATABASE_URL is not set");
      }

      let connection;
      try {
        connection = await db.connect({ connectionString: databaseURL });
        const schema = await connection.getSchema();
        const schemaContext = generateSchemaContext(schema);
        await connection.disconnect();
        return {
          content: [
            {
              type: "text",
              text: schemaContext,
            },
          ],
        };
      } catch (error) {
        console.error(error);
        if (connection) {
          await connection.disconnect();
        }
        return {
          content: [
            {
              type: "text",
              text: `Error getting schema: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    } else {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }
  });

  const mcpTransport = new StdioServerTransport();

  await server.connect(mcpTransport);
};
