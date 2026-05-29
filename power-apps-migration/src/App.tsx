/**
 * Root application component with routing.
 *
 * Migrated from: ASP.NET MVC routing pattern:
 *   {controller=Home}/{action=Index}/{id?}
 *
 * In the legacy app, routing was handled by ASP.NET MVC convention-based routing.
 * In the Power Apps Code App, we use React Router for client-side navigation.
 *
 * Route mapping:
 *   /              → Dashboard (legacy: HomeController.Index)
 *   /cwa           → RequestList (legacy: CwaController.Index)
 *   /cwa/create    → RequestForm [create] (legacy: CwaController.Create GET)
 *   /cwa/edit/:id  → RequestForm [edit] (legacy: CwaController.Edit GET)
 *   /cwa/details/:id → RequestDetail (legacy: CwaController.Details)
 */
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { RequestList } from "./components/RequestList";
import { RequestForm } from "./components/RequestForm";
import { RequestDetail } from "./components/RequestDetail";
import { useCurrentUser } from "./hooks/useCurrentUser";

function AppLayout() {
  const { user } = useCurrentUser();

  return (
    <div className="container">
      {/* Navigation — Legacy: _Layout.cshtml navbar */}
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <Link className="navbar-brand" to="/">
              Ops Tracker — CWA Module
            </Link>
          </div>
          <ul className="nav navbar-nav">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/cwa">Requests</Link>
            </li>
            <li>
              <Link to="/cwa/create">New Request</Link>
            </li>
          </ul>
          {user && (
            <ul className="nav navbar-nav navbar-right">
              <li>
                <span className="navbar-text">
                  {user.displayName} ({user.role})
                </span>
              </li>
            </ul>
          )}
        </div>
      </nav>

      {/* Main content area */}
      <div className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cwa" element={<RequestList />} />
          <Route path="/cwa/create" element={<RequestForm mode="create" />} />
          <Route path="/cwa/edit/:id" element={<RequestForm mode="edit" />} />
          <Route path="/cwa/details/:id" element={<RequestDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
