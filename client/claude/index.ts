import { createMCPClient } from "client/connector";
import {
  MCPClientType,
  MCPTransport,
} from "client/types";
import os from "os";
import path from "path";

function getClaudeConfigPath() {
  const platform = process.platform;
  // Get the home directory in a cross-platform way
  const homeDir = os.homedir();
  const appData = process.env.APPDATA || process.env.HOME || homeDir;

  switch (platform) {
    case "darwin": // macOS
      return path.join(
        homeDir,
        "Library",
        "Application Support",
        "Claude",
        "claude_desktop_config.json"
      );

    case "win32": // Windows
      return path.join(appData, "Claude", "claude_desktop_config.json");

    case "linux": // Linux
      return path.join(
        homeDir,
        ".config",
        "Claude",
        "claude_desktop_config.json"
      );

    default:
      throw new Error("Unsupported operating system for Claude");
  }
}

export const Claude = createMCPClient({
  id: MCPClientType.Claude,
  name: "Claude",
  description:
    "Claude is a powerful AI assistant that can help you with various tasks.",
  transport: MCPTransport.IO,
  configPath: getClaudeConfigPath(),
});
