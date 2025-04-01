import type { DatabaseConfig } from "./types";

export const createDatabaseConnector = (
  config: DatabaseConfig
): DatabaseConfig => config;
