import { createMCPClient } from "client/connector";
import {
  MCPClientType,
  MCPTransport,
} from "client/types";
import os from "os";
import path from "path";

function getWindSurfConfigPath() {
  // Get the home directory in a cross-platform way
  const homeDir = os.homedir();
  // .codeium/windsurf/mcp_config.json
  return path.join(homeDir, ".codeium", "windsurf", "mcp_config.json");
}

export const WindSurf = createMCPClient({
  id: MCPClientType.WindSurf,
  name: "WindSurf",
  description:
    "WindSurf is a powerful AI assistant that can help you with various tasks.",
  transport: MCPTransport.IO,
  configPath: getWindSurfConfigPath(),
});
