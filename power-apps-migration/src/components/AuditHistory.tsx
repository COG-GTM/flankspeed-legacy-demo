/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Views/Cwa/Details.cshtml (Audit History section)
 *
 * Displays the audit trail for a work item in a condensed table format.
 *
 * Power Fx equivalent:
 *   Gallery.Items = SortByColumns(Filter(AuditLogs, WorkItemId = ThisItem.Id), "Timestamp", Descending)
 */
import { AuditLog } from "../models";
import { formatDateTime } from "../utils/validation";

interface AuditHistoryProps {
  auditLogs: AuditLog[];
}

export function AuditHistory({ auditLogs }: AuditHistoryProps) {
  const sortedLogs = [...auditLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      <h3>Audit History</h3>
      {sortedLogs.length > 0 ? (
        <table className="table table-striped table-bordered table-condensed">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>By</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.timestamp)}</td>
                <td>{log.action}</td>
                <td>{log.performedByUser?.displayName}</td>
                <td>
                  {log.oldValue && <span>{log.oldValue} → </span>}
                  {log.newValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted">No audit history.</p>
      )}
    </div>
  );
}
