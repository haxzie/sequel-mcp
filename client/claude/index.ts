import { generateRandomId } from "@/utils/id";
import { createMCPClient } from "client/connector";
import {
  MCPClientType,
  MCPTransport,
  type MCPClinetConfig,
  type MCPConfig,
} from "client/types";
import fs from "fs";

function getClaudeConfigPath() {
  const os = process.platform;
  switch (os) {
    case "darwin": // macOS
      return `${process.env.HOME}/Library/Application Support/Claude/claude_desktop_config.json`;

    case "win32": // Windows
      return `${process.env.APPDATA}\\Claude\\claude_desktop_config.json`;
    default:
      throw new Error("Unsupported operating system for Claude");
  }
}

async function getClaudeClientConfig(): Promise<MCPClinetConfig> {
  try {
    const configPath = getClaudeConfigPath();
    const config = await import(configPath);
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
