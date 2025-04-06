import { createMCPClient } from "client/connector";
import {
  MCPClientType,
  MCPTransport,
  type MCPClinetConfig,
} from "client/types";
import path from "path";
import os from "os";
import fs from "fs";

const getCursorConfigPath = () => {
  // Get the home directory in a cross-platform way
  const homeDir = os.homedir();

  // Build the path to ~/.cursor/mcp.json
  const mcpJsonPath = path.join(homeDir, ".cursor", "mcp.json");
  return mcpJsonPath;
};

const getCursorClientConfig = async () => {
  try {
    const configPath = getCursorConfigPath();
    const config = await fs.readdirSync(configPath, { encoding: "utf-8" });
    // Assuming the config file exports a JSON object
    const configData = JSON.parse(JSON.stringify(config)) as MCPClinetConfig;
    return configData;
  } catch (error) {
    return {
      mcpServers: {},
    };
  }
};

const writeCursorConfig = async (config: MCPClinetConfig): Promise<void> => {
  // check if the file exists
  const configPath = getCursorConfigPath();
  // check if this file exists
  await fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

export const Cursor = createMCPClient({
  id: MCPClientType.Cursor,
  name: "Cursor",
  description:
    "Cursor is a powerful AI assistant that can help you with various tasks.",
  transport: MCPTransport.IO,
  injectConfig: async (config, database): Promise<void> => {
    try {
      let cursorConfig = await getCursorClientConfig();
      const serverName = `sequel_${database}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
      if (cursorConfig && cursorConfig.mcpServers) {
        cursorConfig.mcpServers = {
          ...cursorConfig.mcpServers,
          [serverName]: config,
        };
      } else {
        cursorConfig = {
          mcpServers: {
            [serverName]: config,
          },
        };
      }
      await writeCursorConfig(cursorConfig);
    } catch (error) {
      console.error(error);
      throw new Error(`Unable to inject claude config`);
    }
  },
});
