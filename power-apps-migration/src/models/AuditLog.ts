/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/AuditLog.cs
 * Source: Audit trail for all WorkItem changes
 * Target: Azure SQL [dbo].[AuditLogs] via Power Platform SQL connector
 *
 * Migration note: In the Power Apps target, audit logging can be handled by
 * Power Automate flows triggered on data changes, or via application-level
 * logging in the TypeScript service layer.
 */
import { User } from "./User";
import { WorkItem } from "./WorkItem";

export interface AuditLog {
  id: number;
  workItemId: number;
  workItem?: WorkItem;
  /** e.g., "Created", "Status Changed", "Assigned", "Comment Added" */
  action: string;
  performedByUserId: number;
  performedByUser?: User;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}
