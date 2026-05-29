# .NET to M365 (Flank Speed) Migration Guide — Code-First Approach

## Executive Summary

This guide covers migrating traditional .NET applications with SQL Server databases to Microsoft 365 (Flank Speed) using **code-first** approaches — not the point-and-click UI builder. After researching all available Microsoft platforms, the recommended strategy depends on your use case:

| Use Case | Recommended Platform | Why |
|---|---|---|
| **Primary (OBS Tool)**: Migrate .NET app to M365 | **Power Apps Code Apps** + **SPFx** (hybrid) | Full custom code, managed hosting on Power Platform, direct Azure SQL connectivity, plus SPFx for SharePoint/Teams integration |
| **Secondary (CWA Tool)**: Migrate .NET app to Power App | **Power Apps Code Apps** | 100% code-first React/Vue/TS app, deployed to Power Platform, connects to Azure SQL or Dataverse |

---

## Platform Comparison — Code-First Options

### 1. Power Apps Code Apps ⭐ RECOMMENDED

**What it is:** A new (GA) capability that lets developers build full custom web apps using React, Vue, or any JS framework, then deploy them directly to Power Platform with managed hosting.

**Key advantages for your use case:**
- **Full code control**: Write React/Vue/TypeScript — no drag-and-drop, no Power Fx formulas
- **Direct Azure SQL connectivity**: Connect directly to your migrated SQL Server database via Power Platform SQL connector
- **1,500+ connectors**: Access SharePoint, Teams, Outlook, Dataverse, and more via generated typed TypeScript services
- **Managed hosting**: Published and hosted within Power Platform — no separate web server needed
- **Entra authentication**: Automatic Microsoft Entra (AAD) SSO — no auth code to write
- **ALM/DevOps**: Full lifecycle management with `pac code push`, solution packaging, and Power Platform Pipelines (Dev → Test → Prod)
- **Flank Speed compatible**: Runs within M365/Power Platform tenant

**Development workflow:**
```bash
# 1. Scaffold from template
npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-app
cd my-app && npm install

# 2. Initialize code app (authenticates to Power Platform)
npx power-apps init --display-name "My Migrated App" --environment-id <env-id>

# 3. Add SQL data source (connects to your Azure SQL)
pac code add-data-source -a "shared_sql" -c "<connectionId>" -t "[dbo].[YourTable]" -d "<server>.database.windows.net,<dbname>"

# 4. Develop locally with hot reload
npm run dev  # Opens Local Play URL

# 5. Build and deploy
npm run build | pac code push
```

**Architecture:**
- Your code (React/Vue/TS) → Power Apps Client Library (`@microsoft/power-apps`) → Power Apps Host
- Generated TypeScript models/services for each data connection
- `power.config.json` manages connection metadata
- Deployed as a Power Platform solution

**Limitations:**
- Requires Power Apps Premium license for end users
- No Power Apps mobile app support (web only)
- No Power BI data integration yet
- No Git integration for solutions yet (but standard Git for source code)

---

### 2. SharePoint Framework (SPFx)

**What it is:** Full custom TypeScript/React development for SharePoint and Teams web parts, extensions, and Viva Connections cards.

**Best for:** Apps that need deep SharePoint/Teams integration, content-driven apps, or when you need broader M365 licensing (Office 365 license, no Premium needed).

**Key advantages:**
- Framework-agnostic: React, Vue, Angular, etc.
- Automatic SSO across M365 (SharePoint, Teams, Viva)
- Automatic hosting in SharePoint (no server management)
- Only requires Office 365 license
- Mature ecosystem with extensive tooling

**Development workflow:**
```bash
# 1. Scaffold SPFx project
npm install -g @microsoft/generator-sharepoint
yo @microsoft/sharepoint

# 2. Develop with TypeScript/React
gulp serve  # Local workbench

# 3. Build and package
gulp bundle --ship && gulp package-solution --ship

# 4. Deploy .sppkg to SharePoint App Catalog
```

**When to use SPFx over Code Apps:**
- Your app primarily displays content from SharePoint
- You need Teams tab integration
- You want to avoid Power Apps Premium licensing
- You need Viva Connections extensibility

---

### 3. PCF (Power Apps Component Framework)

**What it is:** Build individual custom code components in TypeScript that plug into Power Apps forms, views, and dashboards.

**Best for:** Hybrid approach — keep some Power Apps low-code structure but replace specific UI elements with custom code components.

**Development workflow:**
```bash
pac pcf init --namespace MyOrg --name MyComponent --template field --run-npm-install
npm run build
pac solution add-reference --path .
msbuild /t:build /restore
```

**When to use:**
- You want to migrate specific .NET UI controls to reusable components
- The overall app structure works as a model-driven Power App
- You need drop-in replacements for standard Power Apps controls

---

### 4. Power Pages (Less Recommended)

External-facing web portals with Liquid templates, HTML/CSS/JS. Less relevant for internal .NET app migration unless the app is a public-facing portal.

---

## Data Migration Strategy

### Recommended: SQL Server → Azure SQL

This is the **lowest friction** path for .NET apps with SQL Server:

1. **Migrate SQL Server to Azure SQL Database**
   - Use Azure Database Migration Service (DMS)
   - Or: `SqlPackage.exe` for schema + data export/import
   - Minimal schema changes needed
   - Preserves stored procedures, views, indexes

2. **Connect Code App to Azure SQL**
   - Use the Power Platform SQL connector
   - Auto-generates typed TypeScript models for each table
   - Supports CRUD operations, stored procedures, and custom queries

3. **Schema mapping approach:**

| .NET Layer | Target |
|---|---|
| SQL Server database | Azure SQL Database |
| Entity Framework models | Generated TypeScript models (from `pac code add-data-source`) |
| .NET Controllers/API | TypeScript service layer calling Power Platform connectors |
| ASP.NET Views (Razor/ASPX) | React/Vue components |
| .NET Authentication | Microsoft Entra (automatic in Code Apps) |
| .NET Business Logic | TypeScript modules or Azure Functions (for complex server-side logic) |

### Alternative: SQL Server → Dataverse

Better if you want deep Power Platform integration, but requires significant schema transformation:
- Flat table structure (limited relationship complexity)
- 1,000+ column limit per table
- Built-in audit trail, security roles, record-level permissions
- Better for simple CRUD data models

### Hybrid Approach

Keep complex relational data in Azure SQL, use Dataverse for:
- User profiles and permissions
- Configuration/lookup data
- Integration metadata

---

## Recommended Migration Architecture (Primary Use Case — OBS Tool)

Given the dual requirement of SPFx + Power Fx migration:

```
┌─────────────────────────────────────────────────────┐
│                    M365 / Flank Speed                │
│                                                     │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │   SPFx Web   │     │  Power Apps Code App      │  │
│  │   Parts      │     │  (React/TypeScript)        │  │
│  │              │     │                            │  │
│  │  SharePoint  │     │  Full custom UI + logic    │  │
│  │  + Teams     │     │  Power Platform connectors │  │
│  │  integration │     │  Entra SSO                 │  │
│  └──────┬───────┘     └──────────┬───────────────┘  │
│         │                        │                   │
│         │    ┌───────────────┐   │                   │
│         └───►│  Azure SQL    │◄──┘                   │
│              │  (migrated    │                        │
│              │  from SQL     │                        │
│              │  Server)      │                        │
│              └───────────────┘                        │
│                                                      │
│  Optional: Dataverse for config/lookup data          │
│  Optional: Azure Functions for complex biz logic     │
│  Optional: Power Automate for workflows              │
└──────────────────────────────────────────────────────┘
```

---

## Bulk Migration Strategy with Devin

### How Devin Can Automate This

Devin can systematically migrate .NET applications by:

1. **Analyzing the .NET source code** — identify controllers, views, models, data layer, authentication, and business logic
2. **Generating the target project scaffold** — create Code App or SPFx project from templates
3. **Converting data models** — map Entity Framework / ADO.NET models to TypeScript interfaces
4. **Converting views** — transform Razor/ASPX views to React/Vue components
5. **Converting controllers/business logic** — map .NET controller actions to TypeScript service functions
6. **Setting up data connections** — configure Power Platform SQL connector bindings
7. **Generating migration scripts** — SQL Server to Azure SQL migration scripts
8. **Creating deployment configuration** — solution packaging and ALM pipeline config

### What Devin CANNOT Do (Requires Human)

- Power Platform environment provisioning (admin access)
- Azure SQL server provisioning (Azure portal / admin)
- Power Platform connector authentication (interactive OAuth)
- Flank Speed-specific tenant configuration (DoD admin)
- Final UAT and compliance verification

---

## Step-by-Step Migration Playbook

### Phase 1: Analysis (Devin-automatable)
1. Clone .NET source repository
2. Inventory: controllers, views, models, database schema, NuGet packages
3. Map authentication mechanisms
4. Identify business rules and validation logic
5. Document API endpoints and data flows
6. Generate migration assessment report

### Phase 2: Database Migration
1. Export SQL Server schema (`SqlPackage.exe /Action:Extract`)
2. Transform schema for Azure SQL compatibility
3. Generate Azure SQL deployment script
4. Create data migration scripts (DMS or SqlPackage)
5. Validate data integrity post-migration

### Phase 3: Code Migration (Devin-automatable)
1. Scaffold Code App project from Vite template
2. Generate TypeScript interfaces from SQL schema / EF models
3. Convert Razor/ASPX views → React components
4. Convert .NET controllers → TypeScript service modules
5. Map Entity Framework queries → Power Platform connector calls
6. Port validation and business logic to TypeScript
7. Set up routing (React Router or equivalent)
8. Configure Power Platform data sources

### Phase 4: Integration & Auth
1. Configure Entra SSO (automatic in Code Apps)
2. Map .NET role-based auth → Dataverse security roles
3. Set up Power Automate flows for background processes
4. Configure Azure Functions for complex server-side logic (if needed)

### Phase 5: Deployment
1. `npm run build | pac code push` to dev environment
2. Add to Power Platform solution
3. Configure Power Platform Pipeline (Dev → Test → Prod)
4. Deploy to Flank Speed tenant

### Phase 6: Validation
1. Functional testing against original .NET app
2. Performance benchmarking
3. Security and compliance review
4. User acceptance testing

---

## Key Microsoft Documentation Links

- [Power Apps Code Apps Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- [Code Apps Quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch)
- [Connect Code App to Azure SQL](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-azure-sql)
- [Code Apps ALM](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- [SPFx Overview](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [PCF Overview](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/overview)
- [Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
- [Power Platform Developer Docs](https://learn.microsoft.com/en-us/power-platform/developer)
