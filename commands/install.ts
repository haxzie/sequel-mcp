import { promptMcpClient } from "@/prompts/mcpClientPrompt";
import { promptDatabaseType } from "@/prompts/dbTypePrompt";
import { promptConnectionString } from "@/prompts/connectionPrompt";
import { DatabaseRegistry, isValidDatabaseType } from "database";
import ora from "ora";
import { isValidMCPClient, MCPClientRegistry } from "client";
import { generateMCPConfig } from "client/connector";
import type { DatabaseType } from "database/types";
import type { MCPClientType } from "client/types";

export async function runConnectCommand({
  database,
  client,
}: {
  database?: string;
  client?: string;
}) {
  let dbType = database as DatabaseType;
  let mcpClient = client as MCPClientType;

  /**
   * Check if the provided database type and MCP client are valid.
   * If not, prompt the user to select a valid option.
   */
  if (client && !isValidMCPClient(client)) {
    console.error(`Invalid MCP client: ${client}`);
    console.error(
      `Available clients: ${Object.keys(MCPClientRegistry).join(", ")}`
    );
    process.exit(1);
  }
  if (database && !isValidDatabaseType(database)) {
    console.error(`Invalid database type: ${database}`);
    console.error(
      `Available database types: ${Object.keys(DatabaseRegistry).join(", ")}`
    );
    process.exit(1);
  }

  // if the database type and MCP client are not provided, prompt the user
  // to select a valid option
  if (!client) {
    mcpClient = await promptMcpClient();
  }
  if (!database) {
    dbType = await promptDatabaseType();
  }

  if (!dbType || !mcpClient) {
    console.error("Database type and MCP client are required.");
    process.exit(1);
  }

  const connection = await promptConnectionString(dbType);
  const connectionString = connection.connectionString;

  const databaseConfig = DatabaseRegistry[dbType];

  // test the connection
  const spinner = ora("Testing database connection...").start();
  try {
    // test the connection
    const connection = await databaseConfig.connect({
      connectionString,
    });
    const testResult = await connection.test();
    // disconnect
    await connection.disconnect();

    if (!testResult.success) {
      spinner.fail(`Connection failed: ${testResult.message}`);
      process.exit(0);
    } else {
      spinner.succeed(`Connection successful!`);
    }

    // inject the configuration into the mcp client
    ora(`Generating MCP config...`).start();
    try {
      const client = MCPClientRegistry[mcpClient];
      await generateMCPConfig(databaseConfig, connectionString, client);
      spinner.succeed(`MCP config generated successfully for ${client.name}!`);
      process.exit(0);
    } catch (error) {
      spinner.fail(`Failed to generate MCP config: ${error}`);
      process.exit(0);
    }
  } catch (error) {
    spinner.fail(`Connection failed.`);
    process.exit(0);
  }
}
