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

## Supported Databases
```shell
npx -y @sequelsh/mcp@latest install -d <database>
```
- [X] PostgreSQL `postgresql`
- [X] MySQL `mysql`
- [X] ClickHouse `clickhouse`

## Supported MCP Clients
```shell
npx -y @sequelsh/mcp@latest install -c <client>
```
- [X] Claude `claude`
- [X] Cursor `cursor`
- [X] WindSurf `windsurf`
