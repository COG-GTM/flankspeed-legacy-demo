/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/WorkItem.cs
 * Source: Core entity with relationships to User, Category, Status, Comments, etc.
 * Target: Azure SQL [dbo].[WorkItems] via Power Platform SQL connector
 *
 * Migration notes:
 * - Navigation properties (Category, Status, etc.) become separate service calls or joins
 * - Collections (Comments, Attachments, etc.) are loaded via related table queries
 * - DateTime fields mapped to ISO 8601 strings for JSON serialization
 */
import { Category } from "./Category";
import { Status } from "./Status";
import { User } from "./User";
import { ApprovalStep } from "./ApprovalStep";
import { Comment } from "./Comment";
import { Attachment } from "./Attachment";
import { AuditLog } from "./AuditLog";

export interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  /** "OBS" or "CWA" */
  module: "OBS" | "CWA";
  categoryId: number;
  category?: Category;
  statusId: number;
  status?: Status;
  /** "Low", "Medium", "High", "Critical" */
  priority: Priority;
  assignedToUserId: number | null;
  assignedToUser?: User;
  submittedByUserId: number;
  submittedByUser?: User;
  teamOwner: string | null;
  dueDate: string | null;
  submittedDate: string;
  lastUpdatedDate: string;
  closedDate: string | null;
  /** CWA-specific: required when Priority is "Critical" */
  justification: string | null;
  /** CWA-specific: required for "Facility Access Request" category */
  buildingNumber: string | null;
  /** CWA-specific: required for "Facility Access Request" category */
  accessLevel: AccessLevel | null;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  attachments?: Attachment[];
  auditLogs?: AuditLog[];
  approvalSteps?: ApprovalStep[];
}

export type Priority = "Low" | "Medium" | "High" | "Critical";
export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];

export type AccessLevel = "General" | "Restricted" | "Confidential" | "Top Secret";
export const ACCESS_LEVELS: AccessLevel[] = ["General", "Restricted", "Confidential", "Top Secret"];

/** Form data for creating/editing a CWA work item */
export interface WorkItemFormData {
  title: string;
  description: string;
  categoryId: number;
  priority: Priority;
  dueDate: string;
  justification: string;
  buildingNumber: string;
  accessLevel: AccessLevel | "";
}
