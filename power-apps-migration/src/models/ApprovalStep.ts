/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/ApprovalStep.cs
 * Source: Multi-step approval workflow for CWA module
 * Target: Azure SQL [dbo].[ApprovalSteps] via Power Platform SQL connector
 *
 * Migration note: In the Power Apps target, approval routing logic is handled by
 * Power Automate flows triggered on WorkItem creation. The approval UI displays
 * step status and allows approvers to take action via the Code App interface.
 */
import { User } from "./User";

export interface ApprovalStep {
  id: number;
  workItemId: number;
  /** e.g., "Supervisor Review", "Director Approval", "Security Clearance Verification" */
  stepName: string;
  stepOrder: number;
  approverUserId: number | null;
  approverUser?: User;
  /** "Pending", "Approved", "Rejected", "Returned" */
  decision: ApprovalDecision;
  decisionDate: string | null;
  remarks: string | null;
  createdAt: string;
}

export type ApprovalDecision = "Pending" | "Approved" | "Rejected" | "Returned";

export const APPROVAL_DECISIONS: ApprovalDecision[] = [
  "Pending",
  "Approved",
  "Rejected",
  "Returned",
];
