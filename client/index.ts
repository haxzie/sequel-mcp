import { Claude } from "./claude";
import { MCPClientType, type MCPClient } from "./types";

export const MCPClientRegistry: Record<MCPClientType, MCPClient> = {
  [MCPClientType.Claude]: Claude,
};

export const isValidMCPClient = (mcpClient: string): boolean => {
  return Object.keys(MCPClientRegistry).includes(mcpClient);
}
