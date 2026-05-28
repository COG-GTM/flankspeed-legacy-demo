import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IWorkItem, IComment, IAuditLog, IDashboardSummary, ICategory, IStatus } from "../models/IObsModels";

/**
 * Data service for the OBS module — replaces Entity Framework Core data access.
 *
 * MIGRATION MAPPING:
 *   Legacy: AppDbContext + LINQ queries in ObsController.cs
 *   SPFx:   PnPjs queries against SharePoint Lists
 *
 * SharePoint List Structure:
 *   - "OBS Work Items" list → replaces WorkItems table (filtered to Module = "OBS")
 *   - "Comments" list → replaces Comments table
 *   - "Audit Log" list → replaces AuditLogs table
 *   - "Categories" list → replaces Categories table
 *   - "Statuses" list → replaces Statuses table
 */
export class ObsDataService {
  private sp: SPFI;

  constructor(sp: SPFI) {
    this.sp = sp;
  }

  /**
   * Get OBS work items with optional filters.
   *
   * LEGACY EQUIVALENT (ObsController.cs, Index action):
   *   var query = _context.WorkItems
   *     .Where(w => w.Module == "OBS")
   *     .Include(w => w.Category)
   *     .Include(w => w.Status)
   *     .Include(w => w.AssignedToUser)
   *
   * POWER FX EQUIVALENT:
   *   Filter(
   *     'OBS Work Items',
   *     Status.Value = dropdownStatus.Selected.Value,
   *     Category.Value = dropdownCategory.Selected.Value,
   *     Priority.Value = dropdownPriority.Selected.Value,
   *     Title in txtSearch.Text
   *   )
   */
  public async getWorkItems(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): Promise<IWorkItem[]> {
    let filterParts: string[] = [];

    if (filters?.status) {
      filterParts.push(`Status/Name eq '${filters.status}'`);
    }
    if (filters?.category) {
      filterParts.push(`Category/Name eq '${filters.category}'`);
    }
    if (filters?.priority) {
      filterParts.push(`Priority eq '${filters.priority}'`);
    }
    if (filters?.search) {
      filterParts.push(`substringof('${filters.search}', Title)`);
    }

    const filterString = filterParts.length > 0 ? filterParts.join(" and ") : "";

    const items = await this.sp.web.lists
      .getByTitle("OBS Work Items")
      .items.select(
        "Id", "Title", "Description", "Priority", "TeamOwner",
        "DueDate", "SubmittedDate", "LastUpdatedDate",
        "Category/Name", "Status/Name", "AssignedToUser/Title", "AssignedToUser/EMail"
      )
      .expand("Category", "Status", "AssignedToUser")
      .filter(filterString)
      .orderBy("LastUpdatedDate", false)
      .top(100)();

    return items as unknown as IWorkItem[];
  }

  /**
   * Get a single work item with all related data.
   *
   * LEGACY EQUIVALENT (ObsController.cs, Details action):
   *   _context.WorkItems
   *     .Include(w => w.Category)
   *     .Include(w => w.Status)
   *     .Include(w => w.AssignedToUser)
   *     .Include(w => w.SubmittedByUser)
   *     .Include(w => w.Comments).ThenInclude(c => c.AuthorUser)
   *     .Include(w => w.Attachments)
   *     .Include(w => w.AuditLogs).ThenInclude(al => al.PerformedByUser)
   *     .FirstOrDefault(w => w.Id == id && w.Module == "OBS");
   *
   * POWER FX EQUIVALENT:
   *   LookUp('OBS Work Items', ID = paramWorkItemId)
   */
  public async getWorkItemById(id: number): Promise<IWorkItem | null> {
    try {
      const item = await this.sp.web.lists
        .getByTitle("OBS Work Items")
        .items.getById(id)
        .select(
          "Id", "Title", "Description", "Priority", "TeamOwner",
          "DueDate", "SubmittedDate", "LastUpdatedDate", "ClosedDate",
          "Category/Name", "Status/Name", "Status/Id",
          "AssignedToUser/Title", "AssignedToUser/EMail",
          "SubmittedByUser/Title", "SubmittedByUser/EMail"
        )
        .expand("Category", "Status", "AssignedToUser", "SubmittedByUser")();

      return item as unknown as IWorkItem;
    } catch {
      return null;
    }
  }

  /**
   * Get comments for a work item.
   *
   * LEGACY: Loaded via Include() on WorkItem navigation property
   * POWER FX: Filter(Comments, WorkItemId = ThisItem.ID)
   */
  public async getComments(workItemId: number): Promise<IComment[]> {
    const items = await this.sp.web.lists
      .getByTitle("Comments")
      .items.select("Id", "Text", "CreatedAt", "Author/Title", "Author/EMail")
      .expand("Author")
      .filter(`WorkItemId eq ${workItemId}`)
      .orderBy("CreatedAt", false)();

    return items as unknown as IComment[];
  }

  /**
   * Get audit logs for a work item.
   *
   * LEGACY: Loaded via Include() on WorkItem navigation property
   * POWER FX: Filter('Audit Log', WorkItemId = ThisItem.ID)
   */
  public async getAuditLogs(workItemId: number): Promise<IAuditLog[]> {
    const items = await this.sp.web.lists
      .getByTitle("Audit Log")
      .items.select("Id", "Action", "OldValue", "NewValue", "Timestamp", "PerformedBy/Title")
      .expand("PerformedBy")
      .filter(`WorkItemId eq ${workItemId}`)
      .orderBy("Timestamp", false)();

    return items as unknown as IAuditLog[];
  }

  /**
   * Get dashboard summary data.
   *
   * LEGACY EQUIVALENT (ObsController.cs, Dashboard action):
   *   ViewBag.CountByStatus = obsItems.GroupBy(w => w.Status?.Name).ToDictionary(...)
   *   ViewBag.CountByPriority = obsItems.GroupBy(w => w.Priority).ToDictionary(...)
   *   ViewBag.CountByTeam = obsItems.GroupBy(w => w.TeamOwner).ToDictionary(...)
   *
   * POWER FX EQUIVALENTS:
   *   CountRows(Filter('OBS Work Items', Status.Value = "In Progress"))
   *   CountRows(Filter('OBS Work Items', Priority.Value = "Critical"))
   *   CountRows(Filter('OBS Work Items', TeamOwner.Value = "Operations"))
   */
  public async getDashboardSummary(currentUserEmail: string): Promise<IDashboardSummary> {
    const allItems = await this.sp.web.lists
      .getByTitle("OBS Work Items")
      .items.select(
        "Id", "Title", "Priority", "TeamOwner", "DueDate", "LastUpdatedDate",
        "Status/Name", "AssignedToUser/EMail", "AssignedToUser/Title"
      )
      .expand("Status", "AssignedToUser")
      .top(500)();

    const items = allItems as unknown as IWorkItem[];

    // Count by Status
    const countByStatus: Record<string, number> = {};
    items.forEach(item => {
      const status = (item.Status as any)?.Name || "Unknown";
      countByStatus[status] = (countByStatus[status] || 0) + 1;
    });

    // Count by Priority
    const countByPriority: Record<string, number> = {};
    items.forEach(item => {
      countByPriority[item.Priority] = (countByPriority[item.Priority] || 0) + 1;
    });

    // Count by Team
    const countByTeam: Record<string, number> = {};
    items.forEach(item => {
      const team = item.TeamOwner || "Unassigned";
      countByTeam[team] = (countByTeam[team] || 0) + 1;
    });

    // My Assigned Items
    const myAssignedItems = items.filter(
      item => (item.AssignedToUser as any)?.EMail === currentUserEmail
    );

    // Overdue Items
    const now = new Date();
    const overdueItems = items.filter(item => {
      if (!item.DueDate) return false;
      const status = (item.Status as any)?.Name;
      return new Date(item.DueDate) < now && status !== "Closed" && status !== "Completed";
    });

    return {
      countByStatus,
      countByPriority,
      countByTeam,
      myAssignedItems,
      overdueItems,
      totalItems: items.length
    };
  }

  /**
   * Add a comment to a work item.
   *
   * LEGACY: _context.Comments.Add(new Comment { ... }); _context.SaveChanges();
   * POWER FX: Patch(Comments, Defaults(Comments), { WorkItemId: ..., Text: ... })
   */
  public async addComment(workItemId: number, text: string): Promise<void> {
    await this.sp.web.lists
      .getByTitle("Comments")
      .items.add({
        WorkItemId: workItemId,
        Text: text,
        CreatedAt: new Date().toISOString()
      });
  }

  /**
   * Update work item status.
   *
   * LEGACY: item.StatusId = newStatusId; _context.SaveChanges();
   * POWER FX: Patch('OBS Work Items', ThisItem, { Status: { Value: newStatus } })
   */
  public async updateStatus(workItemId: number, newStatusId: number): Promise<void> {
    await this.sp.web.lists
      .getByTitle("OBS Work Items")
      .items.getById(workItemId)
      .update({
        StatusId: newStatusId,
        LastUpdatedDate: new Date().toISOString()
      });
  }

  /** Get all categories for OBS module */
  public async getCategories(): Promise<ICategory[]> {
    const items = await this.sp.web.lists
      .getByTitle("Categories")
      .items.filter("Module eq 'OBS'")
      .select("Id", "Name", "Description")();
    return items as unknown as ICategory[];
  }

  /** Get all statuses for OBS module */
  public async getStatuses(): Promise<IStatus[]> {
    const items = await this.sp.web.lists
      .getByTitle("Statuses")
      .items.filter("Module eq 'OBS' or Module eq 'Shared'")
      .select("Id", "Name", "SortOrder")
      .orderBy("SortOrder")();
    return items as unknown as IStatus[];
  }
}
