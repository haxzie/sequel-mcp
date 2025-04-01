import { DatabaseRegistry } from "database";
import { DatabaseType } from "database/types";
import inquirer from "inquirer";

export async function promptDatabaseType(): Promise<DatabaseType> {
  const { db } = await inquirer.prompt([
    {
      type: "list",
      name: "db",
      message: `🗄️ Choose your database:`,
      choices: Object.keys(DatabaseRegistry),
    },
  ]);
  return db;
}
