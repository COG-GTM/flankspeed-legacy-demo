/**
 * TypeScript interfaces for the OBS module.
 * These replace the C# model classes from FlankSpeedLegacyDemo.Web/Models/
 *
 * MIGRATION NOTE: In the legacy app, these were Entity Framework entities
 * backed by SQL Server. In the SPFx version, they map to SharePoint List items
 * accessed via PnPjs.
 */

export interface IUser {
  Id: number;
  DisplayName: string;
  Email: string;
  Role: string;    // "Admin" | "Reviewer" | "Submitter" | "Approver"
  Team: string;    // "Operations" | "IT" | "Logistics" | "Compliance"
  IsActive: boolean;
}

export interface ICategory {
  Id: number;
  Name: string;
  Module: string;  // "OBS" | "CWA"
  Description?: string;
}

export interface IStatus {
  Id: number;
  Name: string;
  Module: string;  // "OBS" | "CWA" | "Shared"
  SortOrder: number;
}

export interface IWorkItem {
  Id: number;
  Title: string;
  Description?: string;
  Module: string;
  CategoryId: number;
  Category?: ICategory;
  StatusId: number;
  Status?: IStatus;
  Priority: "Low" | "Medium" | "High" | "Critical";
  AssignedToUserId?: number;
  AssignedToUser?: IUser;
  SubmittedByUserId: number;
  SubmittedByUser?: IUser;
  TeamOwner?: string;
  DueDate?: string;
  SubmittedDate: string;
  LastUpdatedDate: string;
  ClosedDate?: string;
}

export interface IComment {
  Id: number;
  WorkItemId: number;
  AuthorUserId: number;
  AuthorUser?: IUser;
  Text: string;
  CreatedAt: string;
}

export interface IAttachment {
  Id: number;
  WorkItemId: number;
  FileName: string;
  FileSize: number;
  UploadedByUserId: number;
  UploadedByUser?: IUser;
  UploadedAt: string;
}

export interface IAuditLog {
  Id: number;
  WorkItemId: number;
  Action: string;
  PerformedByUserId: number;
  PerformedByUser?: IUser;
  OldValue?: string;
  NewValue?: string;
  Timestamp: string;
}

/** Summary data for dashboard widgets */
export interface IDashboardSummary {
  countByStatus: Record<string, number>;
  countByPriority: Record<string, number>;
  countByTeam: Record<string, number>;
  myAssignedItems: IWorkItem[];
  overdueItems: IWorkItem[];
  totalItems: number;
}
