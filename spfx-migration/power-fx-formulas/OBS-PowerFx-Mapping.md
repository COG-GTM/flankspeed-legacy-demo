# OBS Module — Power Fx Formula Mapping

This document maps every C# LINQ query and business logic expression in the legacy OBS module to its Power Fx equivalent for use in the SPFx + Power Fx migration.

---

## Data Source

| Legacy | Migrated |
|---|---|
| SQL Server `WorkItems` table (EF Core) | SharePoint List: `OBS Work Items` |
| SQL Server `Comments` table | SharePoint List: `Comments` |
| SQL Server `AuditLogs` table | SharePoint List: `Audit Log` |
| SQL Server `Categories` table | SharePoint List: `Categories` |
| SQL Server `Statuses` table | SharePoint List: `Statuses` |

---

## OBS List View (replaces ObsController.Index)

### Load all OBS items (sorted by last updated)
**Legacy C# (ObsController.cs):**
```csharp
var query = _context.WorkItems
    .Where(w => w.Module == "OBS")
    .Include(w => w.Category)
    .Include(w => w.Status)
    .Include(w => w.AssignedToUser)
    .Include(w => w.SubmittedByUser)
    .OrderByDescending(w => w.LastUpdatedDate);
```

**Power Fx:**
```
SortByColumns(
    'OBS Work Items',
    "LastUpdatedDate", SortOrder.Descending
)
```

### Filter by Status
**Legacy C#:**
```csharp
if (!string.IsNullOrEmpty(statusFilter))
    query = query.Where(w => w.Status!.Name == statusFilter);
```

**Power Fx:**
```
Filter(
    'OBS Work Items',
    IsBlank(dropdownStatus.Selected.Value) || Status.Value = dropdownStatus.Selected.Value
)
```

### Filter by Category
**Legacy C#:**
```csharp
if (!string.IsNullOrEmpty(categoryFilter))
    query = query.Where(w => w.Category!.Name == categoryFilter);
```

**Power Fx:**
```
Filter(
    'OBS Work Items',
    IsBlank(dropdownCategory.Selected.Value) || Category.Value = dropdownCategory.Selected.Value
)
```

### Filter by Priority
**Legacy C#:**
```csharp
if (!string.IsNullOrEmpty(priorityFilter))
    query = query.Where(w => w.Priority == priorityFilter);
```

**Power Fx:**
```
Filter(
    'OBS Work Items',
    IsBlank(dropdownPriority.Selected.Value) || Priority.Value = dropdownPriority.Selected.Value
)
```

### Search by title
**Legacy C#:**
```csharp
if (!string.IsNullOrEmpty(search))
    query = query.Where(w => w.Title.Contains(search));
```

**Power Fx:**
```
Filter(
    'OBS Work Items',
    IsBlank(txtSearch.Text) || txtSearch.Text in Title
)
```

### Combined filter (all filters applied together)
**Power Fx:**
```
SortByColumns(
    Filter(
        'OBS Work Items',
        (IsBlank(dropdownStatus.Selected.Value) || Status.Value = dropdownStatus.Selected.Value)
        && (IsBlank(dropdownCategory.Selected.Value) || Category.Value = dropdownCategory.Selected.Value)
        && (IsBlank(dropdownPriority.Selected.Value) || Priority.Value = dropdownPriority.Selected.Value)
        && (IsBlank(txtSearch.Text) || txtSearch.Text in Title)
    ),
    "LastUpdatedDate", SortOrder.Descending
)
```

---

## OBS Dashboard (replaces ObsController.Dashboard)

### Total OBS items count
**Legacy C#:**
```csharp
ViewBag.TotalItems = obsItems.Count();
```

**Power Fx:**
```
CountRows('OBS Work Items')
```

### Count by Status
**Legacy C#:**
```csharp
ViewBag.CountByStatus = obsItems
    .GroupBy(w => w.Status?.Name)
    .ToDictionary(g => g.Key!, g => g.Count());
```

**Power Fx:**
```
// In Progress count
CountRows(Filter('OBS Work Items', Status.Value = "In Progress"))

// Under Review count
CountRows(Filter('OBS Work Items', Status.Value = "Under Review"))

// Completed count
CountRows(Filter('OBS Work Items', Status.Value = "Completed"))

// Draft count
CountRows(Filter('OBS Work Items', Status.Value = "Draft"))

// Closed count
CountRows(Filter('OBS Work Items', Status.Value = "Closed"))
```

### Count by Priority
**Legacy C#:**
```csharp
ViewBag.CountByPriority = obsItems
    .GroupBy(w => w.Priority)
    .ToDictionary(g => g.Key, g => g.Count());
```

**Power Fx:**
```
CountRows(Filter('OBS Work Items', Priority.Value = "Critical"))
CountRows(Filter('OBS Work Items', Priority.Value = "High"))
CountRows(Filter('OBS Work Items', Priority.Value = "Medium"))
CountRows(Filter('OBS Work Items', Priority.Value = "Low"))
```

### Count by Team
**Legacy C#:**
```csharp
ViewBag.CountByTeam = obsItems
    .GroupBy(w => w.TeamOwner)
    .ToDictionary(g => g.Key ?? "Unassigned", g => g.Count());
```

**Power Fx:**
```
CountRows(Filter('OBS Work Items', TeamOwner.Value = "Operations"))
CountRows(Filter('OBS Work Items', TeamOwner.Value = "IT"))
CountRows(Filter('OBS Work Items', TeamOwner.Value = "Logistics"))
CountRows(Filter('OBS Work Items', TeamOwner.Value = "Compliance"))
```

### My Assigned Items
**Legacy C#:**
```csharp
ViewBag.MyAssignedItems = obsItems
    .Where(w => w.AssignedToUserId == currentUserId)
    .OrderByDescending(w => w.LastUpdatedDate)
    .ToList();
```

**Power Fx:**
```
SortByColumns(
    Filter('OBS Work Items', AssignedTo.Email = User().Email),
    "LastUpdatedDate", SortOrder.Descending
)
```

### Overdue Items
**Legacy C#:**
```csharp
ViewBag.OverdueItems = obsItems
    .Where(w => w.DueDate.HasValue && w.DueDate < DateTime.UtcNow
        && w.Status!.Name != "Closed" && w.Status!.Name != "Completed")
    .OrderBy(w => w.DueDate)
    .ToList();
```

**Power Fx:**
```
SortByColumns(
    Filter(
        'OBS Work Items',
        !IsBlank(DueDate),
        DueDate < Now(),
        Status.Value <> "Closed",
        Status.Value <> "Completed"
    ),
    "DueDate", SortOrder.Ascending
)
```

---

## OBS Detail View (replaces ObsController.Details)

### Look up a single item
**Legacy C#:**
```csharp
var item = _context.WorkItems
    .Include(w => w.Category)
    .Include(w => w.Status)
    .Include(w => w.AssignedToUser)
    .Include(w => w.SubmittedByUser)
    .Include(w => w.Comments).ThenInclude(c => c.AuthorUser)
    .Include(w => w.Attachments)
    .Include(w => w.AuditLogs).ThenInclude(al => al.PerformedByUser)
    .FirstOrDefault(w => w.Id == id && w.Module == "OBS");
```

**Power Fx:**
```
LookUp('OBS Work Items', ID = paramWorkItemId)
```

### Load comments for an item
**Legacy C#:** Loaded via `Include(w => w.Comments)` navigation property

**Power Fx:**
```
SortByColumns(
    Filter(Comments, WorkItemId = paramWorkItemId),
    "CreatedAt", SortOrder.Descending
)
```

### Add a comment
**Legacy C# (ObsController.AddComment):**
```csharp
_context.Comments.Add(new Comment {
    WorkItemId = workItemId,
    AuthorUserId = currentUserId,
    Text = text,
    CreatedAt = DateTime.UtcNow
});
_context.SaveChanges();
```

**Power Fx:**
```
Patch(
    Comments,
    Defaults(Comments),
    {
        WorkItemId: paramWorkItemId,
        Text: txtComment.Text,
        Author: { Value: User().Email },
        CreatedAt: Now()
    }
);
Reset(txtComment);
Notify("Comment added", NotificationType.Success)
```

### Update status
**Legacy C# (ObsController.UpdateStatus):**
```csharp
item.StatusId = newStatusId;
item.LastUpdatedDate = DateTime.UtcNow;
_context.SaveChanges();

_context.AuditLogs.Add(new AuditLog {
    WorkItemId = workItemId,
    Action = "Status Changed",
    OldValue = oldStatus.Name,
    NewValue = newStatus.Name,
    PerformedByUserId = currentUserId,
    Timestamp = DateTime.UtcNow
});
_context.SaveChanges();
```

**Power Fx:**
```
// Update the item's status
Patch(
    'OBS Work Items',
    LookUp('OBS Work Items', ID = paramWorkItemId),
    {
        Status: dropdownStatus.Selected,
        LastUpdatedDate: Now()
    }
);

// Log the change
Patch(
    'Audit Log',
    Defaults('Audit Log'),
    {
        WorkItemId: paramWorkItemId,
        Action: "Status Changed",
        OldValue: ThisItem.Status.Value,
        NewValue: dropdownStatus.Selected.Value,
        PerformedBy: { Value: User().Email },
        Timestamp: Now()
    }
);

Notify("Status updated", NotificationType.Success)
```

### Load audit history
**Legacy C#:** Loaded via `Include(w => w.AuditLogs)` navigation property

**Power Fx:**
```
SortByColumns(
    Filter('Audit Log', WorkItemId = paramWorkItemId),
    "Timestamp", SortOrder.Descending
)
```

---

## OBS Edit Form (replaces ObsController.Edit)

### Save edits to a work item
**Legacy C# (ObsController.Edit POST):**
```csharp
existing.Title = model.Title;
existing.Description = model.Description;
existing.Priority = model.Priority;
existing.CategoryId = model.CategoryId;
existing.AssignedToUserId = model.AssignedToUserId;
existing.TeamOwner = model.TeamOwner;
existing.DueDate = model.DueDate;
existing.LastUpdatedDate = DateTime.UtcNow;
_context.SaveChanges();
```

**Power Fx (form OnSuccess or Submit button):**
```
Patch(
    'OBS Work Items',
    LookUp('OBS Work Items', ID = paramWorkItemId),
    {
        Title: txtTitle.Text,
        Description: txtDescription.Text,
        Priority: dropdownPriority.Selected,
        Category: dropdownCategory.Selected,
        AssignedTo: comboAssignedTo.Selected,
        TeamOwner: dropdownTeam.Selected,
        DueDate: datepickerDueDate.SelectedDate,
        LastUpdatedDate: Now()
    }
);
Navigate(scrOBSDetail, ScreenTransition.None, { paramWorkItemId: paramWorkItemId })
```

---

## Home Dashboard OBS Summary (replaces HomeController.Index)

### OBS status counts on home page
**Legacy C#:**
```csharp
ViewBag.ObsStatusCounts = _context.WorkItems
    .Where(w => w.Module == "OBS")
    .Include(w => w.Status)
    .GroupBy(w => w.Status!.Name)
    .Select(g => new { Status = g.Key, Count = g.Count() })
    .ToDictionary(x => x.Status, x => x.Count);
```

**Power Fx (for a gallery or label on the home screen):**
```
// Total OBS
CountRows('OBS Work Items')

// Individual status counts for badges
CountRows(Filter('OBS Work Items', Status.Value = "In Progress"))
CountRows(Filter('OBS Work Items', Status.Value = "Completed"))
CountRows(Filter('OBS Work Items', Status.Value = "Under Review"))
```
