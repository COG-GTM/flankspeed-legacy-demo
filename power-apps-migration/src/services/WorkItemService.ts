/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Controllers/CwaController.cs
 *
 * This service replaces the CWA controller's CRUD operations. In the Power Apps
 * Code App, data access goes through the Power Platform SQL connector which
 * auto-generates typed operations for each table.
 *
 * Connection: Azure SQL via Power Platform connector (configured in power.config.json)
 * Legacy: Entity Framework Core with SQLite/SQL Server
 */
import {
  WorkItem,
  WorkItemFormData,
  Category,
  Status,
  User,
  Priority,
} from "../models";

// --- Filter Types ---

export interface WorkItemFilter {
  statusFilter?: string;
  search?: string;
}

// --- Service Functions ---

/**
 * Fetches CWA work items with optional filtering.
 *
 * Legacy equivalent: CwaController.Index()
 * Power Fx equivalent: Filter(WorkItems, Module="CWA", Status.Value = dropdown.Selected.Value)
 *
 * @param filter - Optional status and search filters
 * @returns Filtered list of CWA work items, ordered by SubmittedDate descending
 */
export async function getWorkItems(filter?: WorkItemFilter): Promise<WorkItem[]> {
  const params = new URLSearchParams();
  if (filter?.statusFilter) params.set("statusFilter", filter.statusFilter);
  if (filter?.search) params.set("search", filter.search);

  const response = await fetch(`/api/workitems/cwa?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch work items");
  return response.json();
}

/**
 * Fetches a single CWA work item with all related data.
 *
 * Legacy equivalent: CwaController.Details()
 * Includes: Category, Status, SubmittedByUser, AssignedToUser, Comments, Attachments,
 *           AuditLogs, ApprovalSteps (with ApproverUser)
 */
export async function getWorkItemById(id: number): Promise<WorkItem | null> {
  const response = await fetch(`/api/workitems/cwa/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch work item");
  return response.json();
}

/**
 * Creates a new CWA work item.
 *
 * Legacy equivalent: CwaController.Create(POST)
 *
 * Business logic migrated:
 * - Sets Module = "CWA"
 * - Sets StatusId to "Pending Approval"
 * - Sets SubmittedByUserId to current user
 * - Auto-creates ApprovalSteps based on category/priority
 * - Creates audit log entry
 *
 * Note: In production Power Apps, the approval step creation should be handled
 * by a Power Automate flow triggered on record creation for better separation
 * of concerns and to leverage Power Automate's built-in approval actions.
 */
export async function createWorkItem(data: WorkItemFormData): Promise<WorkItem> {
  const response = await fetch("/api/workitems/cwa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create work item");
  return response.json();
}

/**
 * Updates an existing CWA work item.
 *
 * Legacy equivalent: CwaController.Edit(POST)
 *
 * Business logic migrated:
 * - Updates mutable fields (Title, Description, Category, Priority, etc.)
 * - Updates LastUpdatedDate timestamp
 * - Creates audit log entry
 */
export async function updateWorkItem(
  id: number,
  data: Partial<WorkItemFormData>
): Promise<WorkItem> {
  const response = await fetch(`/api/workitems/cwa/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update work item");
  return response.json();
}

/**
 * Checks if a work item is editable based on its status.
 *
 * Legacy equivalent: var canEdit = Model.Status?.Name == "Draft" || Model.Status?.Name == "Returned"
 * Power Fx equivalent: If(ThisItem.Status.Value in ["Draft","Returned"], DisplayMode.Edit, DisplayMode.View)
 */
export function isEditable(item: WorkItem): boolean {
  const editableStatuses = ["Draft", "Returned"];
  return editableStatuses.includes(item.status?.name ?? "");
}

// --- Lookup Data ---

/**
 * Fetches CWA categories for form dropdowns.
 *
 * Legacy equivalent: _context.Categories.Where(c => c.Module == "CWA")
 */
export async function getCwaCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories?module=CWA");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

/**
 * Fetches CWA statuses for filter dropdowns.
 *
 * Legacy equivalent: _context.Statuses.Where(s => s.Module == "CWA" || s.Module == "Shared")
 */
export async function getCwaStatuses(): Promise<Status[]> {
  const response = await fetch("/api/statuses?module=CWA");
  if (!response.ok) throw new Error("Failed to fetch statuses");
  return response.json();
}

/**
 * Fetches active users for assignment dropdowns.
 *
 * Legacy equivalent: _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName)
 */
export async function getActiveUsers(): Promise<User[]> {
  const response = await fetch("/api/users?active=true");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

// --- Dashboard Data ---

export interface DashboardSummary {
  statusCounts: Record<string, number>;
  totalRequests: number;
  myItems: WorkItem[];
  pendingApprovals: number;
}

/**
 * Fetches CWA dashboard summary data.
 *
 * Legacy equivalent: HomeController.Index() (CWA portion)
 * Power Fx equivalent: CountRows(Filter(WorkItems, Module="CWA", Status.Value="Pending Approval"))
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch("/api/workitems/cwa/dashboard");
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  return response.json();
}

// --- Validation ---

/**
 * Validates work item form data before submission.
 *
 * Migrated from: client-side validation in Create.cshtml + server-side in CwaController
 */
export function validateWorkItem(data: WorkItemFormData): string[] {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push("Title is required");
  }

  if (!data.categoryId) {
    errors.push("Category is required");
  }

  if (data.priority === "Critical" && !data.justification.trim()) {
    errors.push("Justification is required for Critical priority requests");
  }

  return errors;
}

/**
 * Determines which conditional form sections should be visible.
 *
 * Legacy equivalent: cwa-form.js conditional visibility logic
 * Power Fx equivalent:
 *   - Justification visible: If(dropdownPriority.Selected.Value = "Critical", true, false)
 *   - Facility section visible: If(dropdownCategory.Selected.Value = "Facility Access Request", true, false)
 */
export function getConditionalVisibility(
  priority: Priority,
  categoryName: string
): { showJustification: boolean; showFacilitySection: boolean } {
  return {
    showJustification: priority === "Critical",
    showFacilitySection: categoryName === "Facility Access Request",
  };
}
