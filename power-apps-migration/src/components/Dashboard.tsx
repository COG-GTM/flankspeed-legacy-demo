/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Views/Home/Index.cshtml (CWA portion)
 *
 * Displays CWA module summary counts by status and pending approvals.
 * In the Power Apps target, this could be a standalone screen or integrated
 * into a Viva Connections dashboard card.
 *
 * Power Fx equivalent:
 *   CountRows(Filter(WorkItems, Module = "CWA", Status.Value = "Pending Approval"))
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary, DashboardSummary } from "../services/WorkItemService";
import { formatDate } from "../utils/validation";

export function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!summary) return <p>Failed to load dashboard.</p>;

  return (
    <div>
      <h2>CWA — Work Requests Dashboard</h2>
      <hr />

      <div className="row">
        {/* Status Summary — Legacy: panel with table of status counts */}
        <div className="col-md-6">
          <div className="panel panel-default">
            <div
              className="panel-heading"
              style={{ backgroundColor: "#003366", color: "#ffffff" }}
            >
              <h3 className="panel-title">
                CWA Status Summary{" "}
                <small style={{ color: "#cccccc" }}>
                  ({summary.totalRequests} total)
                </small>
              </h3>
            </div>
            <div className="panel-body">
              <table className="table table-striped table-bordered table-condensed">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.statusCounts).map(([status, count]) => (
                    <tr key={status}>
                      <td>{status}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-md-6">
          <div className="panel panel-default">
            <div
              className="panel-heading"
              style={{ backgroundColor: "#003366", color: "#ffffff" }}
            >
              <h3 className="panel-title">Pending Actions</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Pending Approvals:</strong> {summary.pendingApprovals}
              </p>
              <button
                className="btn btn-success"
                onClick={() => navigate("/cwa/create")}
              >
                + New Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Items — Legacy: "My Assigned Items" panel */}
      <div className="panel panel-default">
        <div
          className="panel-heading"
          style={{ backgroundColor: "#003366", color: "#ffffff" }}
        >
          <h3 className="panel-title">My Assigned Requests</h3>
        </div>
        <div className="panel-body">
          {summary.myItems.length > 0 ? (
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.myItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <a
                        href={`/cwa/details/${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/cwa/details/${item.id}`);
                        }}
                      >
                        {item.title}
                      </a>
                    </td>
                    <td>{item.status?.name}</td>
                    <td>{item.priority}</td>
                    <td>{formatDate(item.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No items currently assigned to you.</p>
          )}
        </div>
      </div>
    </div>
  );
}
