// This file defines types and interfaces for database connection configurations.
// It includes a type for database credentials, an interface for database connection methods,
// and an interface for database configuration objects. The `DatabaseCredential` type can be either

// Credentials can be a record of string key-value pairs or an object with a `connectionString` property.
export enum CredentialType {
  ConnectionString = "connectionString",
  ConnectionObject = "connectionObject",
}

export enum DatabaseType {
  PostgreSQL = "postgresql",
  MySQL = "mysql",
//   ClickHouse = "clickhouse",
//   MongoDB = "mongodb",
}

export type DatabaseCredential =
  | Record<string, string>
  | { connectionString: string };

export type DatabaseConnectionConfig =
  | {
      type: CredentialType.ConnectionObject;
      example: Record<string, string>;
    }
  | {
      type: CredentialType.ConnectionString;
      example: string;
    };

export interface QueryResult {
  rows?: Array<{ [key: string]: string | number | boolean | undefined | null }>;
  fields?: Array<{ name: string; dataTypeID?: number }>;
  rowCount?: number;
  affectedRows?: number;
  error?: string;
}

export interface DBTable {
  name: string;
  schema: string;
  columns: Array<{
    name: string;
    type: string;
    isPrimary?: boolean;
    referenceTable?: string;
    referenceColumn?: string;
  }>;
}

export type DBSchema = Record<string, DBTable>;

export type TestConnectionResponse = {
    success: boolean;
    message: string;
}

export interface DatabaseConnection {
  /**
   * function to test the connection, throws an error if it fails
   *  */
  test: () => Promise<TestConnectionResponse>;

  /**
   * Disconnect from the database
   */
  disconnect: () => Promise<void>;

  /**
   * function to execute a write query
   * returns the result of the query, throws an error if it fails
   */
  query: (
    query: string,
    readOnly: boolean,
  ) => Promise<QueryResult>;

  /**
   * function to fetch the database schema
   * returns the result of the query, throws an error if it fails
   */
  getSchema: () => Promise<DBSchema>;
}

export interface DatabaseConfig {
  id: DatabaseType;
  name: string;
  connection: DatabaseConnectionConfig;

  connect: (credential: DatabaseCredential) => Promise<DatabaseConnection>;
}
