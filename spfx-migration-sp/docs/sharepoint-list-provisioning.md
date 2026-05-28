# SharePoint List Provisioning Guide

This document describes the SharePoint Lists needed to support the migrated OBS module. These lists replace the SQL Server database tables from the legacy application.

---

## List 1: OBS Work Items

**Replaces:** `WorkItems` table (filtered to `Module = "OBS"`)

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | Yes | Work item title |
| Description | Multiple lines of text (plain) | No | Detailed description |
| Priority | Choice (`Low`, `Medium`, `High`, `Critical`) | Yes | |
| Status | Lookup → Statuses list | Yes | |
| Category | Lookup → Categories list | Yes | |
| AssignedTo | Person or Group | No | M365 user picker |
| SubmittedBy | Person or Group | Yes | Auto-set to current user |
| TeamOwner | Choice (`Operations`, `IT`, `Logistics`, `Compliance`) | No | |
| DueDate | Date and Time | No | |
| SubmittedDate | Date and Time | Yes | Auto-set on creation |
| LastUpdatedDate | Date and Time | Yes | Auto-set on modification |
| ClosedDate | Date and Time | No | |

**Views:**
- **All Items** — default view, sorted by LastUpdatedDate desc
- **My Assigned** — filtered to `[AssignedTo] = [Me]`
- **Overdue** — filtered to `[DueDate] < [Today]` AND `[Status] <> "Closed"` AND `[Status] <> "Completed"`
- **By Priority** — grouped by Priority

---

## List 2: Comments

**Replaces:** `Comments` table

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | No | Auto-generated or hidden |
| WorkItemId | Number | Yes | Links to OBS Work Items |
| Text | Multiple lines of text (plain) | Yes | Comment body |
| Author | Person or Group | Yes | Auto-set to current user |
| CreatedAt | Date and Time | Yes | Auto-set on creation |

---

## List 3: Audit Log

**Replaces:** `AuditLogs` table

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | No | Auto-generated |
| WorkItemId | Number | Yes | Links to OBS Work Items |
| Action | Single line of text | Yes | e.g., "Status Changed", "Comment Added" |
| PerformedBy | Person or Group | Yes | Auto-set to current user |
| OldValue | Single line of text | No | Previous value |
| NewValue | Single line of text | No | New value |
| Timestamp | Date and Time | Yes | Auto-set on creation |

---

## List 4: Categories

**Replaces:** `Categories` table (filtered to `Module = "OBS"`)

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | Yes | Category name |
| Description | Multiple lines of text | No | |

**Pre-populated items:**
1. Infrastructure Review
2. Compliance Audit
3. Operational Assessment
4. Resource Allocation

---

## List 5: Statuses

**Replaces:** `Statuses` table (filtered to `Module = "OBS"` or `Module = "Shared"`)

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | Yes | Status name |
| SortOrder | Number | Yes | Display order |

**Pre-populated items:**
1. Draft (SortOrder: 1)
2. Submitted (SortOrder: 2)
3. Under Review (SortOrder: 3)
4. In Progress (SortOrder: 4)
5. Completed (SortOrder: 5)
6. Closed (SortOrder: 6)

---

## Provisioning Options

### Option A: PnP Provisioning Template (recommended)
Use PnP PowerShell to provision all lists at once:

```powershell
Connect-PnPOnline -Url https://{tenant}.sharepoint.com/sites/{site} -Interactive
Apply-PnPProvisioningTemplate -Path ./obs-lists-template.xml
```

### Option B: Manual Creation
Create each list manually in SharePoint → Site Contents → New → List.

### Option C: Site Script + Site Design
Package the list definitions as a Site Script for repeatable provisioning across multiple sites.

---

## Data Migration

To migrate the legacy seed data from the SQLite database to SharePoint Lists:

1. Export from SQLite:
   ```bash
   sqlite3 FlankSpeedLegacyDemo.db ".mode csv" ".headers on" ".output work_items.csv" "SELECT * FROM WorkItems WHERE Module='OBS';"
   ```

2. Import to SharePoint via PnP PowerShell:
   ```powershell
   $items = Import-Csv ./work_items.csv
   foreach ($item in $items) {
       Add-PnPListItem -List "OBS Work Items" -Values @{
           Title = $item.Title
           Description = $item.Description
           Priority = $item.Priority
           # ... map remaining fields
       }
   }
   ```

Or use the SharePoint migration API for larger datasets.
