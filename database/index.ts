import { MySQL } from "./mysql";
import { Postgres } from "./postgres";
import { DatabaseType, type DatabaseConfig } from "./types";

export const DatabaseRegistry: Record<DatabaseType, DatabaseConfig> = {
  [DatabaseType.PostgreSQL]: Postgres,
  [DatabaseType.MySQL]: MySQL,
};


export const isValidDatabaseType = (dbType: string): boolean => {
  return Object.keys(DatabaseRegistry).includes(dbType);
}
