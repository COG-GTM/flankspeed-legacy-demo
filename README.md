# Ops Tracker — Legacy .NET 8 MVC Application

**Ops Tracker** is a legacy-style .NET 8 MVC + SQL Server internal operations tool used by a fictional government team. It manages work requests and operational records across two functional areas. This application is the starting point for two M365/Flank Speed modernization demos using Windsurf IDE.

---

## Module Overview

### Module A — OBS Tool (Operational Records)
Operational records review, dashboarding, filtering, task queues, notes — a **read-heavy, collaboration-oriented** workflow.

- List views with filtering by status, category, priority
- Summary dashboards with counts and overdue tracking
- Detail views with comments, attachments, and audit history
- Assigned queue for current user
- Status update workflow

### Module B — CWA Tool (Work Requests)
Request submission, form-based data entry with conditional logic, multi-step approvals — a **write-heavy, transactional** workflow.

- Form submission with conditional field visibility
- Multi-step approval routing
- Approval/rejection with remarks
- Status tracking through approval pipeline
- Audit trail for all changes

---

## Migration Mapping

| Legacy Pattern | Module A → SPFx + Power Fx | Module B → Power App + Power Fx |
|---|---|---|
| List view + filters | SPFx ListView web part + PnPjs queries | Power Apps Gallery + delegable Filter() |
| Detail view | SPFx detail panel or Teams tab | Power Apps Display form |
| Dashboard counts | SPFx dashboard web part + CountRows() | N/A |
| Edit form | SPFx PropertyPane or React form | Power Apps EditForm |
| Conditional fields | N/A | Power Fx If()/Visible property |
| Comments/notes | M365 collaboration features | Power Apps comment Gallery |
| Approval routing | N/A | Power Automate approval flow |
| Status transitions | SPFx command set | Patch() and UpdateIf() |
| Assigned queue | Teams tab or Viva Connections | N/A |

---

## Why Module A is an SPFx Candidate

- **Read-heavy browsing and filtering** — users spend most time scanning lists and drilling into details
- **Dashboard summarization** — aggregate views mapping to SharePoint web parts
- **Collaboration patterns** — notes, comments, and assigned queues align with Teams/SharePoint
- **Lives naturally inside SharePoint/Teams** — integrates with existing M365 portal

## Why Module B is a Power App Candidate

- **Form-centric data entry** — primary interaction is filling out structured forms
- **Conditional form logic** — field visibility based on selections maps directly to Power Fx
- **Approval workflow with routing** — multi-step approvals map to Power Automate
- **Mobile-friendly submission pattern** — Power Apps provides native mobile experience
- **Business rules in form behavior** — validation and conditional logic in Power Fx

---

## How to Run Locally

**Prerequisites:** .NET 8 SDK (download from https://dotnet.microsoft.com/download/dotnet/8.0)

No database server needed — the app uses SQLite and auto-creates its database on first run.

```bash
# 1. Clone the repo
git clone https://github.com/COG-GTM/flankspeed-legacy-demo.git

# 2. Navigate to the web project
cd flankspeed-legacy-demo/FlankSpeedLegacyDemo.Web

# 3. Restore packages
dotnet restore

# 4. Run the application
dotnet run

# 5. Open in browser
# Navigate to https://localhost:5001 (or the URL shown in terminal)
# SQLite database auto-creates and seeds on first run
```

---

## Key Demo Screens

1. **Home Dashboard** (`/`) — overall summary with counts for both modules
2. **OBS List** (`/Obs`) — filtering, searching, table browsing
3. **OBS Dashboard** (`/Obs/Dashboard`) — summary counts, assigned queue, overdue items
4. **OBS Detail** (`/Obs/Details/1`) — record detail, comments, audit log
5. **CWA List** (`/Cwa`) — request list with "New Request" button
6. **CWA Create** (`/Cwa/Create`) — conditional form logic demo (change Priority to "Critical", change Category to "Facility Access Request")
7. **CWA Detail with Approval** (`/Cwa/Details/{id}`) — switch to Approver user (Michael Thompson), show approval buttons
8. **User Switcher** — navbar dropdown to demonstrate role-based differences

---

## GitHub Integration

- **GitHub Actions CI/CD** in `.github/workflows/build.yml` — automated build verification
- **GitHub Issue Templates** for migration tasks in `.github/ISSUE_TEMPLATE/`
- **GitHub MCP plugin** for Windsurf/Cascade integration in `.windsurf/mcp.json`
- **GitHub Pull Requests** extension recommended in `.vscode/extensions.json`

---

## Windsurf Demo Walkthrough

See [DEMO-WALKTHROUGH.md](DEMO-WALKTHROUGH.md) for the full scripted walkthrough with two variants:
- **Non-Technical Audience** (15 min) — visual tour + AI analysis
- **Technical Audience** — detailed Cascade prompts for code generation

### Prerequisites for Demo
- Windsurf IDE installed with Cascade enabled
- GitHub Personal Access Token configured in `.windsurf/mcp.json`
- .NET 8 SDK installed locally
- This repository cloned and built successfully

---

## Architecture Notes

- **Single SQL Server database** with shared schema across both modules
- **Entity Framework Core** for data access with code-first migrations
- **MVC pattern** with server-rendered Razor views (no SPA, no API layer — intentionally legacy)
- **Session-based mock authentication** — user switcher simulates different roles
- **Bootstrap 3.3.7** for intentionally dated UI styling
- **Migration notes throughout** — comments mark migration-relevant patterns with `[SPFx]` and `[PowerApp]` tags
- **Auto-seeding** — database creates and populates on first run for zero-config demos

---

## Project Structure

```
FlankSpeedLegacyDemo.Web/
├── Controllers/       → Business logic (maps to SPFx/Power App actions)
├── Models/            → Entity classes (maps to Dataverse/SharePoint Lists)
├── Views/             → Razor templates (maps to SPFx React / Power Apps screens)
├── Data/              → EF Core context and seed data
├── Services/          → Mock auth service (maps to Azure AD/M365 auth)
└── wwwroot/           → Static assets (CSS, JS)
```
