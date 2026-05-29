/**
 * Migrated from: CwaController.Approve() action
 *
 * In the legacy app, approval logic lives in the controller. In the Power Apps
 * target, this maps to Power Automate approval flows. This service provides
 * the client-side interface for triggering approvals and displaying status.
 *
 * Power Automate mapping:
 * - "Start and wait for an approval" action for each step
 * - Conditional logic for auto-creating steps based on category/priority
 * - Status transition logic on final approval/rejection
 */
import { ApprovalStep, ApprovalDecision } from "../models";

export interface ApprovalRequest {
  approvalStepId: number;
  decision: "Approved" | "Rejected";
  remarks?: string;
}

/**
 * Submits an approval decision for a specific step.
 *
 * Legacy equivalent: CwaController.Approve(POST)
 *
 * Business logic migrated:
 * - Records decision and timestamp
 * - If "Rejected" → sets WorkItem status to "Rejected"
 * - If all steps "Approved" → sets WorkItem status to "Approved"
 * - Creates audit log entry for the decision
 *
 * Power Automate equivalent:
 *   When an approval response is received →
 *     If outcome = "Approve" → Update approval step, check all steps →
 *       If all approved → Patch(WorkItem, {Status: "Approved"})
 *     If outcome = "Reject" → Patch(WorkItem, {Status: "Rejected"})
 */
export async function submitApproval(request: ApprovalRequest): Promise<void> {
  const response = await fetch("/api/approvals/decide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Failed to submit approval decision");
}

/**
 * Fetches approval steps for a work item.
 *
 * Legacy equivalent: _context.ApprovalSteps.Where(a => a.WorkItemId == id)
 */
export async function getApprovalSteps(workItemId: number): Promise<ApprovalStep[]> {
  const response = await fetch(`/api/approvals/workitem/${workItemId}`);
  if (!response.ok) throw new Error("Failed to fetch approval steps");
  return response.json();
}

/**
 * Determines the overall approval status for a work item.
 *
 * Legacy equivalent: Logic in CwaController.Approve() that checks allSteps
 */
export function getOverallApprovalStatus(
  steps: ApprovalStep[]
): "Pending" | "Approved" | "Rejected" | "Partial" {
  if (steps.length === 0) return "Pending";
  if (steps.some((s) => s.decision === "Rejected")) return "Rejected";
  if (steps.every((s) => s.decision === "Approved")) return "Approved";
  if (steps.some((s) => s.decision === "Approved")) return "Partial";
  return "Pending";
}

/**
 * Returns the next pending approval step (for highlighting in UI).
 */
export function getNextPendingStep(steps: ApprovalStep[]): ApprovalStep | null {
  const sorted = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  return sorted.find((s) => s.decision === "Pending") ?? null;
}

/**
 * Determines which approval steps are auto-created based on category and priority.
 *
 * Legacy equivalent: Auto-creation logic in CwaController.Create(POST)
 *
 * This documents the approval routing rules that should be configured in
 * Power Automate:
 *
 * - "Facility Access Request" category:
 *   Step 1: Supervisor Review (Operations team approver)
 *   Step 2: Security Clearance Verification (Compliance team approver)
 *
 * - All other categories:
 *   Step 1: Supervisor Review (Operations team approver)
 *   Step 2: Director Approval (Compliance team approver)
 *
 * - If Priority == "Critical" (any category):
 *   Step 3: Executive Review (Admin role user)
 */
export function getApprovalStepTemplate(
  categoryName: string,
  priority: string
): Array<{ stepName: string; stepOrder: number; approverTeamOrRole: string }> {
  const steps: Array<{ stepName: string; stepOrder: number; approverTeamOrRole: string }> = [];

  if (categoryName === "Facility Access Request") {
    steps.push(
      { stepName: "Supervisor Review", stepOrder: 1, approverTeamOrRole: "Operations" },
      { stepName: "Security Clearance Verification", stepOrder: 2, approverTeamOrRole: "Compliance" }
    );
  } else {
    steps.push(
      { stepName: "Supervisor Review", stepOrder: 1, approverTeamOrRole: "Operations" },
      { stepName: "Director Approval", stepOrder: 2, approverTeamOrRole: "Compliance" }
    );
  }

  if (priority === "Critical") {
    steps.push(
      { stepName: "Executive Review", stepOrder: 3, approverTeamOrRole: "Admin" }
    );
  }

  return steps;
}
