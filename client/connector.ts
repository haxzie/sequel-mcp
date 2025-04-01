import type { DatabaseConfig } from "database/types";
import type { MCPClient, MCPConfig } from "./types";

export const createMCPClient = (mcpClient: MCPClient): MCPClient => {
  return mcpClient;
};

export const generateMCPConfig = async (
  databaseConfig: DatabaseConfig,
  connectionString: string,
  mcpClient: MCPClient
): Promise<void> => {
  const mcpConfig: MCPConfig = {
    command: "npx",
    args: [
      "@sequel/mcp",
      "run",
      databaseConfig.id,
      `--trasport`,
      mcpClient.transport,
    ],
    env: {
      DATABASE_URL: connectionString,
    },
  };

  // inject the configuration into the mcp client
  await mcpClient.injectConfig(mcpConfig);
};
