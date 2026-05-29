# Power Apps Code App Migration — CWA Module

This directory contains the **Power Apps Code App** migration of the CWA (Work Requests) module from the legacy .NET 8 MVC application. It follows the [.NET to M365 Migration Guide](../docs/dotnet-to-m365-migration-guide.md) code-first approach.

## Architecture

```
Legacy (.NET 8 MVC)              →  Target (Power Apps Code App)
─────────────────────────────────────────────────────────────────
ASP.NET Controllers              →  TypeScript service modules
Razor/CSHTML views               →  React (TSX) components
Entity Framework Core models     →  TypeScript interfaces
SQL Server / SQLite              →  Azure SQL Database
Session-based auth               →  Microsoft Entra SSO (automatic)
.NET anti-forgery tokens         →  Power Platform CSRF protection
ViewBag data passing             →  React props + context
Server-side approval logic       →  Power Automate approval flows
```

## Project Structure

```
power-apps-migration/
├── index.html              # HTML entry point
├── package.json            # Node dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── power.config.json       # Power Platform connection manifest
├── src/
│   ├── main.tsx            # App entry point
│   ├── App.tsx             # Root component + routing
│   ├── models/             # TypeScript interfaces (from .NET models)
│   │   ├── WorkItem.ts    # Core work item entity
│   │   ├── User.ts        # User entity with roles
│   │   ├── Category.ts    # Category lookup
│   │   ├── Status.ts      # Status lookup
│   │   ├── ApprovalStep.ts # Multi-step approvals
│   │   ├── Comment.ts     # Work item comments
│   │   ├── Attachment.ts  # File attachment metadata
│   │   ├── AuditLog.ts    # Audit trail entries
│   │   └── index.ts       # Barrel exports
│   ├── services/           # TypeScript services (from .NET controllers)
│   │   ├── WorkItemService.ts   # CRUD + filtering + validation
│   │   ├── ApprovalService.ts   # Approval workflow logic
│   │   ├── CommentService.ts    # Comment operations
│   │   └── AuthService.ts       # User context (Entra SSO)
│   ├── components/         # React components (from Razor views)
│   │   ├── Dashboard.tsx        # CWA summary dashboard
│   │   ├── RequestList.tsx      # Filterable request list
│   │   ├── RequestForm.tsx      # Create/Edit form with conditional fields
│   │   ├── RequestDetail.tsx    # Full detail view
│   │   ├── ApprovalWorkflow.tsx # Multi-step approval table
│   │   ├── CommentSection.tsx   # Comment feed + add form
│   │   └── AuditHistory.tsx     # Audit trail table
│   ├── hooks/
│   │   └── useCurrentUser.ts    # Current user context hook
│   └── utils/
│       └── validation.ts        # Form validation utilities
├── docs/
│   ├── migration-assessment.md  # Phase 1 analysis output
│   ├── data-migration.md        # Database migration guide
│   └── deployment-guide.md      # ALM/deployment instructions
└── scripts/
    └── sql-to-azure-sql.sql     # Azure SQL schema + seed data
```

## Migration Mapping

| Legacy Screen | Route | Component | Controller Action |
|---|---|---|---|
| Dashboard | `/` | `Dashboard.tsx` | `HomeController.Index` |
| Request List | `/cwa` | `RequestList.tsx` | `CwaController.Index` |
| New Request | `/cwa/create` | `RequestForm.tsx` | `CwaController.Create` |
| Edit Request | `/cwa/edit/:id` | `RequestForm.tsx` | `CwaController.Edit` |
| Request Detail | `/cwa/details/:id` | `RequestDetail.tsx` | `CwaController.Details` |

## Key Demo Points

1. **Conditional Form Visibility** (`RequestForm.tsx`):
   - Priority = "Critical" → shows Justification field
   - Category = "Facility Access Request" → shows Building/Access Level fields
   - Maps directly to Power Fx `If()/Visible` properties

2. **Multi-Step Approval Workflow** (`ApprovalWorkflow.tsx`):
   - Category-based routing (Facility Access → Security Clearance step)
   - Priority-based escalation (Critical → Executive Review)
   - Maps to Power Automate approval actions

3. **Type-Safe Data Models** (`src/models/`):
   - All .NET Entity Framework models converted to TypeScript interfaces
   - Preserves relationships, nullable types, and business constraints

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck
```

## Deployment

See [docs/deployment-guide.md](docs/deployment-guide.md) for full ALM workflow.

```bash
# Build and deploy to Power Platform
npm run build
pac code push
```

## What Requires Human Action

- Power Platform environment provisioning (admin access)
- Azure SQL Database provisioning (Azure portal)
- Power Platform SQL connector authentication (interactive OAuth)
- Power Automate flow creation and testing
- Flank Speed tenant-specific configuration (DoD admin)
- UAT and compliance verification
