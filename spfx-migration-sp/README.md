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
spfx-migration-sp/
├── obs-webparts/                   → SPFx project (builds to .sppkg)
│   ├── src/
│   │   ├── webparts/
│   │   │   ├── obsListView/        → Replaces /Obs (list + filters)
│   │   │   ├── obsDashboard/       → Replaces /Obs/Dashboard
│   │   │   └── obsDetailView/      → Replaces /Obs/Details/{id}
│   │   ├── models/                 → TypeScript interfaces (from C# models)
│   │   ├── services/               → PnPjs data access (replaces EF Core)
│   │   └── common/                 → Shared utilities and constants
│   ├── config/                     → SPFx build configuration
│   ├── gulpfile.js                 → Build orchestrator
│   ├── package.json
│   └── tsconfig.json
├── provisioning/                   → SharePoint setup scripts
│   ├── Create-OBSLists.ps1         → Creates all 5 SharePoint Lists
│   └── Import-OBSSeedData.ps1      → Imports sample data from HTML mockup
├── docs/                           → Architecture and migration docs
├── power-fx-formulas/              → C# LINQ → Power Fx mapping
├── preview-app/                    → Original HTML mockup (reference)
├── DEPLOYMENT.md                   → Step-by-step deployment guide
└── README.md                       → This file
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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide covering:

1. **Provision SharePoint Lists** — Run `Create-OBSLists.ps1` to create the data layer
2. **Import seed data** — Run `Import-OBSSeedData.ps1` to populate with sample records
3. **Build** — `gulp bundle --ship && gulp package-solution --ship`
4. **Deploy** — Upload `obs-webparts.sppkg` to the SharePoint App Catalog
5. **Add to pages** — Add the OBS web parts to SharePoint pages or Teams tabs
