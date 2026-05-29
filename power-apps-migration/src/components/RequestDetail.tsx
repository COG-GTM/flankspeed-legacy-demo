/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Views/Cwa/Details.cshtml
 *
 * This component displays the full detail view of a CWA work request,
 * including metadata, approval workflow, comments, and audit history.
 *
 * Power Fx equivalent: Display form with multiple sections/galleries
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkItem } from "../models";
import { getWorkItemById, isEditable } from "../services/WorkItemService";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { CommentSection } from "./CommentSection";
import { AuditHistory } from "./AuditHistory";
import { formatDate, formatDateTime } from "../utils/validation";

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  const [item, setItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadItem = useCallback(() => {
    if (!id) return;
    getWorkItemById(Number(id)).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  if (loading) return <p>Loading...</p>;
  if (!item) return <p>Request not found.</p>;

  const canEdit = isEditable(item);

  return (
    <div>
      <h2>{item.title}</h2>
      <a
        href="/cwa"
        className="btn btn-default btn-sm"
        onClick={(e) => {
          e.preventDefault();
          navigate("/cwa");
        }}
      >
        &laquo; Back to List
      </a>
      {canEdit && (
        <a
          href={`/cwa/edit/${item.id}`}
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/cwa/edit/${item.id}`);
          }}
          style={{ marginLeft: "5px" }}
        >
          Edit
        </a>
      )}
      <hr />

      {/* Metadata — Legacy: <dl class="dl-horizontal"> */}
      <dl className="dl-horizontal">
        <dt>ID</dt>
        <dd>{item.id}</dd>
        <dt>Module</dt>
        <dd>{item.module}</dd>
        <dt>Category</dt>
        <dd>{item.category?.name}</dd>
        <dt>Status</dt>
        <dd>{item.status?.name}</dd>
        <dt>Priority</dt>
        <dd>{item.priority}</dd>
        <dt>Submitted By</dt>
        <dd>{item.submittedByUser?.displayName}</dd>
        <dt>Team Owner</dt>
        <dd>{item.teamOwner ?? "—"}</dd>
        <dt>Due Date</dt>
        <dd>{formatDate(item.dueDate)}</dd>
        <dt>Submitted</dt>
        <dd>{formatDate(item.submittedDate)}</dd>
        <dt>Last Updated</dt>
        <dd>{formatDateTime(item.lastUpdatedDate)}</dd>
        <dt>Description</dt>
        <dd>{item.description ?? "—"}</dd>
        {item.justification && (
          <>
            <dt>Justification</dt>
            <dd>{item.justification}</dd>
          </>
        )}
        {item.buildingNumber && (
          <>
            <dt>Building Number</dt>
            <dd>{item.buildingNumber}</dd>
          </>
        )}
        {item.accessLevel && (
          <>
            <dt>Access Level</dt>
            <dd>{item.accessLevel}</dd>
          </>
        )}
      </dl>

      <hr />
      <ApprovalWorkflow
        steps={item.approvalSteps ?? []}
        currentUser={currentUser}
        onApprovalSubmitted={loadItem}
      />

      <hr />
      <CommentSection
        comments={item.comments ?? []}
        workItemId={item.id}
        onCommentAdded={loadItem}
      />

      <hr />
      <AuditHistory auditLogs={item.auditLogs ?? []} />
    </div>
  );
}
