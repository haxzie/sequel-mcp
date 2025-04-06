import { generateRandomId } from "@/utils/id";
import { createMCPClient } from "client/connector";
import {
  MCPClientType,
  MCPTransport,
  type MCPClinetConfig,
} from "client/types";
import fs from "fs";
import os from "os";
import path from "path";

function getWindSurfConfigPath() {
  // Get the home directory in a cross-platform way
  const homeDir = os.homedir();
  // .codeium/windsurf/mcp_config.json
  return path.join(homeDir, ".codeium", "windsurf", "mcp_config.json");
}

async function getWindSurfClientConfig(): Promise<MCPClinetConfig> {
  try {
    const configPath = getWindSurfConfigPath();
    const config = await import(configPath);
    // Assuming the config file exports a JSON object
    const configData = JSON.parse(JSON.stringify(config));
    return configData;
  } catch (error) {
    return {
      mcpServers: {},
    };
  }
}

async function writeWindSurfConfig(config: MCPClinetConfig): Promise<void> {
  // check if the file exists
  const configPath = getWindSurfConfigPath();
  // check if this file exists
  await fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export const WindSurf = createMCPClient({
  id: MCPClientType.WindSurf,
  name: "WindSurf",
  description:
    "WindSurf is a powerful AI assistant that can help you with various tasks.",
  transport: MCPTransport.IO,
  injectConfig: async (config, database) => {
    try {
      let windsurfConfig = await getWindSurfClientConfig();
      const serverName = `sequel_${database}_${generateRandomId(6)}`;

      if (windsurfConfig && windsurfConfig.mcpServers) {
        windsurfConfig.mcpServers = {
          ...windsurfConfig.mcpServers,
          [serverName]: config,
        };
      } else {
        windsurfConfig = {
          mcpServers: {
            [serverName]: config,
          },
        };
      }
      await writeWindSurfConfig(windsurfConfig);
    } catch (error) {
      console.error("Error writing WindSurf config:", error);
      throw new Error("Failed to write WindSurf config");
    }
  },
});
