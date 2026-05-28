# OBS Module — SPFx + Power Fx Migration (End State)

This folder contains the migrated OBS (Operational Business Systems) module, rebuilt as SharePoint Framework (SPFx) web parts for deployment in SharePoint Online / Microsoft Teams within the Flank Speed environment.

## What Changed

| Legacy (.NET MVC) | Migrated (SPFx + Power Fx) |
|---|---|
| Razor views + jQuery | React components in SPFx web parts |
| SQL Server + EF Core | SharePoint Lists via PnPjs |
| Server-side C# controllers | Client-side TypeScript + Power Fx expressions |
| Session-based mock auth | Azure AD / M365 identity (automatic) |
| Bootstrap 3.3.7 | Fluent UI (SharePoint native styling) |
| Standalone web app | Embedded in SharePoint pages and Teams tabs |

## Project Structure

```
obs-webparts/
├── src/
│   ├── webparts/
│   │   ├── obsListView/         → Replaces /Obs (list + filters)
│   │   ├── obsDashboard/        → Replaces /Obs/Dashboard
│   │   └── obsDetailView/       → Replaces /Obs/Details/{id}
│   ├── models/                  → TypeScript interfaces (from C# models)
│   ├── services/                → PnPjs data access (replaces EF Core)
│   └── common/                  → Shared utilities and constants
├── config/
│   └── serve.json               → SPFx local dev config
├── package.json
└── tsconfig.json
```

## Power Fx Expressions

See `power-fx-formulas/` for the complete mapping of C# LINQ queries → Power Fx expressions used in dashboard calculations and filtering.

## How to Run Locally

```bash
cd obs-webparts
npm install
gulp serve
```

This launches the SPFx workbench where you can preview the web parts with mock data.

## Deployment

1. Build: `gulp bundle --ship`
2. Package: `gulp package-solution --ship`
3. Upload `.sppkg` to SharePoint App Catalog
4. Add web parts to SharePoint pages or Teams tabs
