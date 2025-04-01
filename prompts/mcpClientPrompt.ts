import { MCPClientRegistry } from "client";
import type { MCPClientType } from "client/types";
import inquirer from "inquirer";

export async function promptMcpClient(): Promise<MCPClientType> {
  const mcpClients = Object.keys(MCPClientRegistry);

  const { client } = await inquirer.prompt([
    {
      type: "list",
      name: "client",
      message: `💻 Choose your MCP client:`,
      choices: mcpClients,
    },
  ]);
  return client;
}
