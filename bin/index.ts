#!/usr/bin/env node
import { Command } from "commander";
import { runConnectCommand } from "@/commands/install";
import { runServer } from "@/commands/run";
import type { DatabaseType } from "database/types";
import type { MCPTransport } from "client/types";

const program = new Command();

program
  .command("install")
  .description("install an MCP server for a MCP client")
  .option("-d, --database <database>", "Database type (mysql/postgres)")
  .option("-c, --client <client>", "MCP client name")
  .action((options: { database: string; client: string }) => {
    runConnectCommand(options);
  });

program
  .command("run <database>")
  .description("Run MCP server")
  .option("-t, --transport <transport>", "Transport type (sse/io)", "sse")
  .action((database: DatabaseType, options: { transport: MCPTransport }) => {
    runServer(database, options.transport);
  });

program.parse(process.argv);
