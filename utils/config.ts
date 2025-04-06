import { MCPClientRegistry } from "client";
import type { MCPClientType, MCPClinetConfig, MCPConfig } from "client/types";
import type { DatabaseCredential, DatabaseType } from "database/types";
import fs from "fs";
import { generateRandomId } from "./id";
import { DatabaseRegistry } from "database";

export const getClientConfig = async (
  path: string
): Promise<MCPClinetConfig> => {
  try {
    const config = await fs.readFileSync(path, { encoding: "utf-8" });
    // Assuming the config file is a JSON object
    const configData = JSON.parse(config) as MCPClinetConfig;

    console.log(`\n✔ MCP Client config loaded from: ${path}`);
    return configData;
  } catch (error) {
    return {
      mcpServers: {},
    };
  }
};

export const writeClientConfig = async (
  path: string,
  config: MCPClinetConfig
): Promise<void> => {
  try {
    // check if this file exists
    await fs.writeFileSync(path, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(`Error writing Claude config to ${path}:`, error);
    throw new Error(`Failed to write config`);
  }
};

export const injectMCPConfig = async ({
  database,
  credentials,
  client,
}: {
  database: DatabaseType;
  credentials: DatabaseCredential;
  client: MCPClientType;
}): Promise<void> => {
  const mcpClient = MCPClientRegistry[client];

  if (!client) {
    throw new Error(`MCP Client ${client} not found`);
  }

  const databaseConfig = DatabaseRegistry[database];

  if (!databaseConfig) {
    throw new Error(`Database ${database} not found`);
  }


  const configPath = mcpClient.configPath;
  let clientConfig = await getClientConfig(configPath);
  const mcpServerName = `sequel_${database}_${generateRandomId(6)}`;

  let mcpConfig: MCPConfig;
  if (process.env.NODE_ENV === "development") {
    mcpConfig = {
      command: "node",
      args: [
        "/Users/musthaqahamad/projects/sequel.sh/mcp/dist/index.js",
        "run",
        databaseConfig.id,
        `--transport`,
        mcpClient.transport,
      ],
      env: {
        DATABASE_URL: credentials.connectionString,
      },
    };
  } else {
    mcpConfig = {
      command: "npx",
      args: [
        "-y",
        "@sequelsh/mcp@latest",
        "run",
        databaseConfig.id,
        `--transport`,
        mcpClient.transport,
      ],
      env: {
        DATABASE_URL: credentials.connectionString,
      },
    };
  }

  clientConfig = {
    ...clientConfig,
    mcpServers: {
      ...clientConfig.mcpServers,
      [mcpServerName]: mcpConfig,
    },
  };

  await writeClientConfig(configPath, clientConfig);
};
