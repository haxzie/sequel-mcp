import { generateRandomId } from "@/utils/id";
import { createMCPClient } from "client/connector";
import {
  MCPClientType,
  MCPTransport,
  type MCPClinetConfig,
  type MCPConfig,
} from "client/types";
import fs from "fs";
import os from "os";
import path from "path";

function getClaudeConfigPath() {
  const platform = process.platform;
  // Get the home directory in a cross-platform way
  const homeDir = os.homedir();
  const appData = process.env.APPDATA || process.env.HOME || homeDir;

  switch (platform) {
    case "darwin": // macOS
      return path.join(homeDir, "Library", "Application Support", "Claude", "claude_desktop_config.json");

    case "win32": // Windows
      return path.join(appData, "Claude", "claude_desktop_config.json");
      
    case "linux": // Linux
      return path.join(homeDir, ".config", "Claude", "claude_desktop_config.json");

    default:
      throw new Error("Unsupported operating system for Claude");
  }
}

async function getClaudeClientConfig(): Promise<MCPClinetConfig> {
  try {
    const configPath = getClaudeConfigPath();
    const config = await fs.readdirSync(configPath, { encoding: "utf-8" });
    // Assuming the config file exports a JSON object
    const configData = JSON.parse(JSON.stringify(config)) as MCPClinetConfig;
    return configData;
  } catch (error) {
    return {
      mcpServers: {},
    };
  }
}

async function writeClaudeConfig(config: MCPClinetConfig): Promise<void> {
  // check if the file exists
  const configPath = getClaudeConfigPath();
  // check if this file exists
  await fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export const Claude = createMCPClient({
  id: MCPClientType.Claude,
  name: "Claude",
  description:
    "Claude is a powerful AI assistant that can help you with various tasks.",
  transport: MCPTransport.SSE,
  injectConfig: async (config: MCPConfig, database: string) => {
    // get the client config
    try {
      let claudeConfig = await getClaudeClientConfig();
      const serverName = `sequel_${database}_${generateRandomId(6)}`;
      if (claudeConfig && claudeConfig.mcpServers) {
        claudeConfig.mcpServers = {
          ...claudeConfig.mcpServers,
          [serverName]: config,
        };
      } else {
        console.log(`Creating new config...`)
        claudeConfig = {
          mcpServers: {
            [serverName]: config,
          },
        };
      }
      await writeClaudeConfig(claudeConfig);
    } catch (error) {
      console.error(error);
      throw new Error(`Unable to inject claude config`);
    }
  },
});
