# Data Migration Guide — SQL Server → Azure SQL

## Overview

This document covers migrating the FlankSpeedLegacyDemo database from the legacy SQLite/SQL Server instance to Azure SQL Database for use with the Power Apps Code App via the Power Platform SQL connector.

---

## Prerequisites

- Azure subscription with permissions to create SQL resources
- Azure CLI installed (`az login`)
- `SqlPackage.exe` installed (part of SQL Server Data Tools)
- Power Platform environment with SQL connector available

---

## Step 1: Provision Azure SQL Database

```bash
# Create resource group
az group create --name rg-flankspeed-demo --location eastus

# Create SQL Server
az sql server create \
  --name flankspeed-sql-server \
  --resource-group rg-flankspeed-demo \
  --location eastus \
  --admin-user sqladmin \
  --admin-password "<STRONG_PASSWORD>"

# Create database (S0 tier for demo, scale up for production)
az sql db create \
  --resource-group rg-flankspeed-demo \
  --server flankspeed-sql-server \
  --name FlankSpeedLegacyDemo \
  --service-objective S0

# Allow Azure services to access (required for Power Platform connector)
az sql server firewall-rule create \
  --resource-group rg-flankspeed-demo \
  --server flankspeed-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## Step 2: Create Schema

Run the migration script against the Azure SQL database:

```bash
sqlcmd -S flankspeed-sql-server.database.windows.net \
  -d FlankSpeedLegacyDemo \
  -U sqladmin \
  -P "<PASSWORD>" \
  -i scripts/sql-to-azure-sql.sql
```

Or use Azure Data Studio / SSMS to execute the script.

---

## Step 3: Migrate Existing Data (if applicable)

### Option A: SqlPackage (schema + data)

```bash
# Export from source
SqlPackage.exe /Action:Export \
  /SourceServerName:"<source-server>" \
  /SourceDatabaseName:"FlankSpeedLegacyDemo" \
  /TargetFile:"FlankSpeedLegacyDemo.bacpac"

# Import to Azure SQL
SqlPackage.exe /Action:Import \
  /TargetServerName:"flankspeed-sql-server.database.windows.net" \
  /TargetDatabaseName:"FlankSpeedLegacyDemo" \
  /TargetUser:"sqladmin" \
  /TargetPassword:"<PASSWORD>" \
  /SourceFile:"FlankSpeedLegacyDemo.bacpac"
```

### Option B: Azure Database Migration Service (DMS)

For larger databases, use the Azure DMS:

1. Create a DMS instance in Azure Portal
2. Create a migration project (SQL Server → Azure SQL Database)
3. Configure source and target connections
4. Select tables to migrate
5. Run the migration

---

## Step 4: Configure Power Platform SQL Connector

1. Go to [Power Platform Admin Center](https://admin.powerplatform.microsoft.com)
2. Navigate to your environment → Connectors
3. Create a new SQL Server connection:
   - Server: `flankspeed-sql-server.database.windows.net`
   - Database: `FlankSpeedLegacyDemo`
   - Authentication: Azure AD (recommended) or SQL Authentication
4. Note the Connection ID for use in `power.config.json`

---

## Step 5: Add Data Source to Code App

```bash
# Add SQL data source for each table
pac code add-data-source \
  -a "shared_sql" \
  -c "<CONNECTION_ID>" \
  -t "[dbo].[WorkItems]" \
  -d "flankspeed-sql-server.database.windows.net,FlankSpeedLegacyDemo"

pac code add-data-source \
  -a "shared_sql" \
  -c "<CONNECTION_ID>" \
  -t "[dbo].[Users]" \
  -d "flankspeed-sql-server.database.windows.net,FlankSpeedLegacyDemo"

# Repeat for Categories, Statuses, ApprovalSteps, Comments, AuditLogs, Attachments
```

This generates typed TypeScript models and service bindings in `src/generated/`.

---

## Schema Mapping Reference

| .NET Entity Framework | Azure SQL Column | Power Platform Type |
|---|---|---|
| `int` | `INT` | Whole Number |
| `string` | `NVARCHAR(n)` | Text |
| `string?` | `NVARCHAR(n) NULL` | Text (optional) |
| `DateTime` | `DATETIME2(7)` | Date/Time |
| `DateTime?` | `DATETIME2(7) NULL` | Date/Time (optional) |
| `bool` | `BIT` | Yes/No |
| `long` | `BIGINT` | Whole Number |

---

## Security Considerations

- Use Azure AD authentication for the SQL connector (not SQL auth) in production
- Enable Transparent Data Encryption (TDE) — enabled by default on Azure SQL
- Configure Azure SQL firewall to restrict access
- Use managed identities where possible
- Enable Azure SQL auditing for compliance
