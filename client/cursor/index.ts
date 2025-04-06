import { createMCPClient } from "client/connector";
import {
  MCPClientType,
  MCPTransport,
} from "client/types";
import path from "path";
import os from "os";

const getCursorConfigPath = () => {
  // Get the home directory in a cross-platform way
  const homeDir = os.homedir();

  // Build the path to ~/.cursor/mcp.json
  const mcpJsonPath = path.join(homeDir, ".cursor", "mcp.json");
  return mcpJsonPath;
};

export const Cursor = createMCPClient({
  id: MCPClientType.Cursor,
  name: "Cursor",
  description:
    "Cursor is a powerful AI assistant that can help you with various tasks.",
  transport: MCPTransport.IO,
  configPath: getCursorConfigPath(),
});
