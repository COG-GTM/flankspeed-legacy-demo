/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Views/Cwa/Index.cshtml
 *
 * This component replaces the Razor view that displayed a filtered list of
 * CWA work requests in a table format with status/search filtering.
 *
 * Power Fx equivalent:
 *   Gallery control with Items = Filter(
 *     WorkItems,
 *     Module = "CWA",
 *     Status.Value = dropdownStatus.Selected.Value,
 *     Title in txtSearch.Text
 *   )
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkItem, Status } from "../models";
import { getWorkItems, getCwaStatuses } from "../services/WorkItemService";
import { formatDate } from "../utils/validation";

export function RequestList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getWorkItems({ statusFilter, search }),
      getCwaStatuses(),
    ]).then(([workItems, statusList]) => {
      setItems(workItems);
      setStatuses(statusList);
      setLoading(false);
    });
  }, [statusFilter, search]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    getWorkItems({ statusFilter, search }).then((workItems) => {
      setItems(workItems);
      setLoading(false);
    });
  };

  const clearFilters = () => {
    setStatusFilter("");
    setSearch("");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>CWA — Work Requests</h2>
      <button
        className="btn btn-success"
        onClick={() => navigate("/cwa/create")}
      >
        + New Request
      </button>
      <hr />

      {/* Filter Form — Legacy: <form method="get"> with statusFilter and search */}
      <form onSubmit={handleFilter} className="form-inline filter-bar">
        <div className="form-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            className="form-control input-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            className="form-control input-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title..."
          />
        </div>

        <button type="submit" className="btn btn-primary btn-sm">
          Filter
        </button>
        <button
          type="button"
          className="btn btn-default btn-sm"
          onClick={clearFilters}
        >
          Clear
        </button>
      </form>

      {/* Results Table — Legacy: <table class="table table-striped table-bordered"> */}
      {items.length > 0 ? (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Submitted By</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
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
                <td>{item.category?.name}</td>
                <td>{item.status?.name}</td>
                <td>{item.priority}</td>
                <td>{item.submittedByUser?.displayName}</td>
                <td>{formatDate(item.submittedDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted">No requests found.</p>
      )}
    </div>
  );
}
