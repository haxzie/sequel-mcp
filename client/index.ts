import { Claude } from "./claude";
import { Cursor } from "./cursor";
import { MCPClientType, type MCPClient } from "./types";
import { WindSurf } from "./windsurf";

export const MCPClientRegistry: Record<MCPClientType, MCPClient> = {
  [MCPClientType.Claude]: Claude,
  [MCPClientType.Cursor]: Cursor,
  [MCPClientType.WindSurf]: WindSurf,
};

export const isValidMCPClient = (mcpClient: string): boolean => {
  return Object.keys(MCPClientRegistry).includes(mcpClient);
};
