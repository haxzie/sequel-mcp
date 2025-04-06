export interface MCPConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface MCPClinetConfig {
  mcpServers: Record<string, MCPConfig>;
}

export enum MCPClientType {
  Claude = "claude",
  Cursor = "cursor",
//   WindSurf = "windsurf",
}

export enum MCPTransport {
  SSE = "sse",
  IO = "io"
}

export interface MCPClient {
  id: MCPClientType;
  name: string;
  description: string;
  transport: MCPTransport;
  injectConfig: (config: MCPConfig, database: string) => Promise<void>;
}
