# @sequel/mcp
MCP servers for your databases. Query your database from your favourite MCP clients.

## Usage
Install the MCP server to your client

```shell
npx -y @sequelsh/mcp@latest install
```

Install a specific database MCP server
```shell
npx -y @sequelsh/mcp@latest install -d postgresql
```

### Supported Databases
```shell
npx -y @sequelsh/mcp@latest install -d <database>
```
- [X] PostgreSQL `postgresql`
- [X] MySQL `mysql`
- [X] ClickHouse `clickhouse`

### Supported MCP Clients
```shell
npx -y @sequelsh/mcp@latest install -c <client>
```
- [X] Claude `claude`
- [X] Cursor `cursor`
- [X] WindSurf `windsurf`


## Setting up for development
This project uses Bun, so make sure you have bun installed

### Install dependencies
```shell
bun install
```

### Build
```shell
bun run build
```

### Run MCP Install
```shell
bun run mcp:install
```