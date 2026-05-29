# Migration Assessment Report — CWA Module (Module B)

## Executive Summary

This document provides a comprehensive analysis of the CWA (Work Requests) module from the legacy .NET 8 MVC application, mapping each component to its Power Apps Code App equivalent. The CWA module is a **write-heavy, transactional** workflow centered on form submission, conditional logic, and multi-step approval routing.

**Recommended Platform:** Power Apps Code Apps (React/TypeScript) + Power Automate for approval flows

---

## Source Application Inventory

### Controllers

| Controller | Actions | Target |
|---|---|---|
| `CwaController.cs` | Index, Create (GET/POST), Edit (GET/POST), Details, Approve, AddComment | Power Apps Code App screens + Power Automate |
| `HomeController.cs` | Index (Dashboard), SetUser | Shared dashboard (SPFx or Code App) |

### Models (Entity Framework)

| Model | Fields | Target |
|---|---|---|
| `WorkItem.cs` | Id, Title, Description, Module, CategoryId, StatusId, Priority, AssignedToUserId, SubmittedByUserId, TeamOwner, DueDate, SubmittedDate, LastUpdatedDate, ClosedDate, Justification, BuildingNumber, AccessLevel, CreatedAt, UpdatedAt | Azure SQL table → TypeScript interface |
| `User.cs` | Id, DisplayName, Email, Role, Team, IsActive, CreatedAt | Azure SQL table → TypeScript interface |
| `Category.cs` | Id, Name, Module, Description | Azure SQL table → TypeScript interface |
| `Status.cs` | Id, Name, Module, SortOrder | Azure SQL table → TypeScript interface |
| `ApprovalStep.cs` | Id, WorkItemId, StepName, StepOrder, ApproverUserId, Decision, DecisionDate, Remarks, CreatedAt | Azure SQL table → TypeScript interface |
| `Comment.cs` | Id, WorkItemId, AuthorUserId, Text, CreatedAt | Azure SQL table → TypeScript interface |
| `Attachment.cs` | Id, WorkItemId, FileName, FileSize, UploadedByUserId, UploadedAt | Azure SQL table → TypeScript interface |
| `AuditLog.cs` | Id, WorkItemId, Action, PerformedByUserId, OldValue, NewValue, Timestamp | Azure SQL table → TypeScript interface |

### Views (Razor/CSHTML)

| View | Purpose | Target Component |
|---|---|---|
| `Cwa/Index.cshtml` | Request list with filtering | `<RequestList />` React component |
| `Cwa/Create.cshtml` | New request form with conditional visibility | `<RequestForm />` React component |
| `Cwa/Edit.cshtml` | Edit request form | `<RequestForm />` (edit mode) |
| `Cwa/Details.cshtml` | Detail view with approval workflow | `<RequestDetail />` + `<ApprovalWorkflow />` |
| `Home/Index.cshtml` | Dashboard with summary counts | `<Dashboard />` React component |

### Business Logic

| Logic | Location | Target |
|---|---|---|
| Status filtering | CwaController.Index | TypeScript service + Power Platform SQL connector |
| Text search | CwaController.Index | TypeScript service with delegable filter |
| Form conditional visibility | cwa-form.js + Razor | React state + conditional rendering |
| Auto-create approval steps by category/priority | CwaController.Create (POST) | Power Automate flow triggered on record creation |
| Multi-step approval routing | CwaController.Approve | Power Automate approval actions |
| Status transitions on approval/rejection | CwaController.Approve | Power Automate + Patch() |
| Audit trail logging | All POST actions | Power Automate + Azure SQL trigger |
| Comment system | CwaController.AddComment | TypeScript service + React component |

### Authentication & Authorization

| Legacy Pattern | Target |
|---|---|
| Session-based user switching (demo) | Microsoft Entra SSO (automatic in Code Apps) |
| Role-based action visibility | Dataverse security roles or Azure SQL role checks |
| CurrentUserService | `@microsoft/power-apps` User() function |

### Database Schema

- **Engine:** SQLite (dev) / SQL Server (production pattern)
- **Tables:** 8 (Users, WorkItems, Categories, Statuses, Comments, Attachments, AuditLogs, ApprovalSteps)
- **Relationships:** FK constraints with cascade/restrict delete behaviors
- **Indexes:** Module, StatusId, CategoryId, AssignedToUserId, SubmittedByUserId

---

## Migration Mapping Summary

| .NET Layer | Power Apps Code App Target |
|---|---|
| SQL Server / SQLite database | Azure SQL Database |
| Entity Framework models | TypeScript interfaces + generated models |
| CwaController actions | TypeScript service modules |
| Razor/CSHTML views | React (TSX) components |
| cwa-form.js (conditional logic) | React state management |
| .NET session auth | Microsoft Entra (automatic SSO) |
| Anti-forgery tokens | Power Platform built-in CSRF protection |
| ViewBag data passing | React props + context |
| Entity Framework queries | Power Platform SQL connector calls |
| Approval business logic | Power Automate approval flows |

---

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Power Apps Premium licensing required | Plan licensing with M365 admin |
| Complex approval logic in C# | Map to Power Automate flows step-by-step |
| Direct SQL queries in controller | Use Power Platform SQL connector with typed models |
| Session-based user switching (demo feature) | Replace with Entra SSO; remove demo switcher |
| File attachments (stub only) | Implement with SharePoint document library |

---

## Recommended Migration Order

1. **TypeScript interfaces** — establish type safety foundation
2. **Service layer** — implement data access via Power Platform connectors
3. **React components** — build UI from views
4. **Routing** — set up React Router for screen navigation
5. **Power Automate flows** — implement approval workflow
6. **Integration testing** — validate against original app behavior
