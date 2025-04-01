import inquirer from "inquirer";
import chalk from "chalk";
import { DatabaseRegistry } from "database";
import {
  CredentialType,
  type DatabaseCredential,
  type DatabaseType,
} from "database/types";

export async function promptConnectionString(
  dbType: DatabaseType
): Promise<DatabaseCredential> {
  const config = DatabaseRegistry[dbType];
  const example = config.connection.example;

  // inquire user for connection string
  if (config.connection.type === CredentialType.ConnectionString) {
    const lightGray = chalk.reset.dim(`eg: ${example}`);
    const { connectionString } = await inquirer.prompt([
      {
        type: "input",
        name: "connectionString",
        message: `🔗 Enter your connection string (${lightGray}):`,
      },
    ]);
    return { connectionString };
  } else {
    let credentials = {};
    for (let i = 0; i < Object.keys(config.connection.example).length; i++) {
      const key = Object.keys(config.connection.example)[i];
      const example = config.connection.example[key];
      const lightGray = chalk.reset.dim(`eg: ${example}`);

      const result = await inquirer.prompt([
        {
          type: "input",
          name: key,
          message: `🔑 ${key} (${lightGray}):`,
        },
      ]);
      credentials = { ...credentials, [key]: result[key] };
    }

    return credentials;
  }
}
