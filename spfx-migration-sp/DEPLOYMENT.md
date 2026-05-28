# OBS Module — Deployment guide

This guide walks through deploying the OBS SPFx web parts to your SharePoint Online environment. There are 3 phases: provisioning the data layer, building the web parts, and adding them to pages.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 18.x (LTS) | [nodejs.org](https://nodejs.org/) |
| **PowerShell** | 7.x | [Install docs](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell) |
| **PnP.PowerShell** | Latest | `Install-Module PnP.PowerShell -Scope CurrentUser` |
| **Gulp CLI** | 4.x | `npm install -g gulp-cli` |

You also need:
- **SharePoint site owner** permissions on the target site
- **App Catalog** access (tenant-level or site-level) to upload the `.sppkg`

---

## Phase 1: Create SharePoint lists

The web parts read/write data from 5 SharePoint Lists. These replace the legacy SQL Server database.

```powershell
# Navigate to the provisioning folder
cd spfx-migration-sp/provisioning

# Create all 5 lists (Statuses, Categories, OBS Work Items, Comments, Audit Log)
.\Create-OBSLists.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE"

# Import sample data (optional but recommended for testing)
.\Import-OBSSeedData.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE"
```

The scripts are idempotent — they skip lists that already exist.

### What gets created

| List | Purpose | Columns |
|---|---|---|
| **Statuses** | Status lookup values | Title, SortOrder |
| **Categories** | Category lookup values | Title, Description |
| **OBS Work Items** | Main work items | Title, Description, Priority, Status (lookup), Category (lookup), AssignedTo (person), SubmittedBy (person), TeamOwner, DueDate, SubmittedDate, LastUpdatedDate, ClosedDate |
| **Comments** | Work item comments | WorkItemId, Text, Author (person), CreatedAt |
| **Audit Log** | Change history | WorkItemId, Action, PerformedBy (person), OldValue, NewValue, Timestamp |

---

## Phase 2: Build the SPFx package

```bash
# Navigate to the web parts project
cd spfx-migration-sp/obs-webparts

# Install dependencies
npm install

# Build for production
gulp bundle --ship

# Create the .sppkg package
gulp package-solution --ship
```

This produces: `sharepoint/solution/obs-webparts.sppkg`

### Local development (optional)

To test in the SharePoint Workbench before deploying:

```bash
gulp serve
```

Then open: `https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE/_layouts/15/workbench.aspx`

---

## Phase 3: Deploy to SharePoint

### 3a. Upload to App Catalog

1. Go to your **SharePoint Admin Center** → **More features** → **Apps** → **App Catalog**
   - Or use a site-level App Catalog if your tenant supports it
2. Click **Apps for SharePoint** in the left nav
3. Click **Upload** → select `obs-webparts.sppkg`
4. In the trust dialog, check **"Make this solution available to all sites"** → click **Deploy**

Alternatively, use PnP PowerShell:

```powershell
# Connect to your App Catalog site
Connect-PnPOnline -Url "https://YOUR-TENANT.sharepoint.com/sites/appcatalog" -Interactive

# Upload and deploy
Add-PnPApp -Path "./sharepoint/solution/obs-webparts.sppkg" -Scope Tenant -Publish
```

### 3b. Add web parts to SharePoint pages

1. Navigate to your SharePoint site
2. Create a new page (or edit an existing one): **New** → **Page**
3. Click the **+** button to add a section
4. Search for **"OBS"** in the web part picker
5. You'll see 3 web parts:
   - **OBS List View** — The main table with filters (add this first)
   - **OBS Dashboard** — Summary cards and breakdowns
   - **OBS Detail View** — Item detail with comments and audit history
6. Add each web part to the page
7. Click **Publish**

### Recommended page layout

| Page | Web parts |
|---|---|
| **OBS Records** (main page) | OBS List View |
| **OBS Dashboard** | OBS Dashboard |
| **OBS Item Detail** | OBS Detail View |

You can also add multiple web parts to a single page using SharePoint's column layouts.

---

## Web part configuration

Each web part has settings accessible via the **property pane** (click the pencil icon on the web part).

### OBS List View settings
- **Default status filter** — Pre-filter the list on load (e.g., show only "In Progress")
- **Default category filter** — Pre-filter by category
- **Items per page** — 10, 20, or 50

### OBS Dashboard settings
- **Show overdue items section** — Toggle the overdue alert panel
- **Show team breakdown** — Toggle the team distribution section

### OBS Detail View settings
- **Show audit history** — Toggle the audit log section
- **Show attachments section** — Toggle the attachments panel

---

## Updating

To update the web parts after code changes:

```bash
# Rebuild
gulp bundle --ship
gulp package-solution --ship

# Re-upload (overwrites the previous version)
Add-PnPApp -Path "./sharepoint/solution/obs-webparts.sppkg" -Scope Tenant -Publish -Overwrite
```

SharePoint pages using the web parts will automatically pick up the new version.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Web parts don't appear in picker | Ensure the `.sppkg` was deployed to the App Catalog and "Make available to all sites" was checked |
| "List not found" errors | Run `Create-OBSLists.ps1` on the same site where the web parts are used |
| Build fails on `gulp bundle` | Ensure Node.js 18.x is installed (`node -v`) and run `npm install` first |
| Person fields show "Unassigned" | The `AssignedTo` and `SubmittedBy` fields need valid M365 users in your tenant |
| Filters return no results | Verify the Statuses and Categories lookup lists are populated (run `Import-OBSSeedData.ps1`) |
