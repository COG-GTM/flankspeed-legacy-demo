/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Views/Cwa/Details.cshtml (Approval Workflow section)
 *
 * Displays the multi-step approval workflow table with action buttons for
 * the assigned approver. In the Power Apps target, this maps to a Gallery
 * control with conditional buttons.
 *
 * Power Fx equivalent:
 *   Gallery.Items = SortByColumns(Filter(ApprovalSteps, WorkItemId = ThisItem.Id), "StepOrder", Ascending)
 *   Button.Visible = If(ThisItem.ApproverUserId = User().Email && ThisItem.Decision = "Pending", true, false)
 */
import { useState } from "react";
import { ApprovalStep } from "../models";
import { User } from "../models";
import { submitApproval } from "../services/ApprovalService";
import { canApprove } from "../services/AuthService";
import { formatDateTime } from "../utils/validation";

interface ApprovalWorkflowProps {
  steps: ApprovalStep[];
  currentUser: User | null;
  onApprovalSubmitted: () => void;
}

export function ApprovalWorkflow({
  steps,
  currentUser,
  onApprovalSubmitted,
}: ApprovalWorkflowProps) {
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const handleDecision = async (
    stepId: number,
    decision: "Approved" | "Rejected"
  ) => {
    setSubmitting(stepId);
    try {
      await submitApproval({
        approvalStepId: stepId,
        decision,
        remarks: remarks[stepId],
      });
      onApprovalSubmitted();
    } finally {
      setSubmitting(null);
    }
  };

  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  if (steps.length === 0) {
    return (
      <div>
        <h3>Approval Workflow</h3>
        <p className="text-muted">No approval steps configured.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Approval Workflow</h3>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Step</th>
            <th>Order</th>
            <th>Approver</th>
            <th>Decision</th>
            <th>Date</th>
            <th>Remarks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedSteps.map((step) => (
            <tr
              key={step.id}
              className={
                step.decision === "Approved"
                  ? "success"
                  : step.decision === "Rejected"
                    ? "danger"
                    : ""
              }
            >
              <td>{step.stepName}</td>
              <td>{step.stepOrder}</td>
              <td>{step.approverUser?.displayName ?? "Unassigned"}</td>
              <td>
                <strong>{step.decision}</strong>
              </td>
              <td>{formatDateTime(step.decisionDate)}</td>
              <td>{step.remarks}</td>
              <td>
                {/* Action buttons visible only to assigned approver when step is Pending */}
                {step.decision === "Pending" &&
                  currentUser &&
                  canApprove(currentUser, step.approverUserId) && (
                    <div className="approval-actions">
                      <input
                        type="text"
                        className="form-control input-sm"
                        placeholder="Remarks (optional)"
                        value={remarks[step.id] ?? ""}
                        onChange={(e) =>
                          setRemarks((prev) => ({
                            ...prev,
                            [step.id]: e.target.value,
                          }))
                        }
                        style={{
                          display: "inline-block",
                          width: "150px",
                          marginRight: "5px",
                        }}
                      />
                      <button
                        className="btn btn-success btn-xs"
                        onClick={() => handleDecision(step.id, "Approved")}
                        disabled={submitting === step.id}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDecision(step.id, "Rejected")}
                        disabled={submitting === step.id}
                      >
                        Reject
                      </button>
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
