# Migration Overview — Ops Tracker to M365/Flank Speed

## What is Ops Tracker?

Ops Tracker is an internal operations management tool used by government teams to track work requests and operational records. It has two main modules that serve different workflows.

## Module A — OBS (Operational Records)

**What it does:** Manages operational reviews, audits, and assessments. Users browse lists, filter records, view dashboards, add notes, and manage assigned task queues.

**Why it fits SPFx (SharePoint Framework):**
- The workflow is read-heavy — mostly browsing, searching, and reviewing records
- Dashboard views summarize data and show assignments
- Comments and notes follow collaboration patterns already native to SharePoint/Teams
- The list/detail pattern maps naturally to SharePoint list views and detail panels

## Module B — CWA (Work Requests)

**What it does:** Handles request submissions with forms, conditional field logic, and multi-step approval workflows. Users fill out forms, managers approve or reject in sequence.

**Why it fits Power Apps:**
- The workflow is form-centric — data entry with validation and conditional fields
- Approval routing with multiple steps maps to Power Automate approval flows
- Conditional field visibility (show/hide based on selections) maps directly to Power Fx `If()` expressions
- Mobile-friendly form submission is a natural Power Apps strength

## How Windsurf Accelerates Migration

Windsurf (with Cascade AI) can:
1. Analyze the legacy .NET source code to identify patterns
2. Map those patterns to equivalent M365 components
3. Generate scaffold code for SPFx web parts and Power Apps formulas
4. Create migration work items as GitHub Issues
5. Reference the GitHub MCP plugin for source control integration

## How It Connects to GitHub

- Source code is hosted in a GitHub repository
- GitHub Actions handles CI/CD (build verification)
- GitHub Issues track migration tasks with custom templates
- GitHub Pull Requests manage code review for new migration artifacts
- Windsurf connects to GitHub via the MCP plugin for seamless integration

## Migration Path Diagram

```
┌─────────────────────────┐
│    Ops Tracker (.NET)    │
│    SQL Server LocalDB    │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌──────────┐
│ Module A │   │ Module B  │
│   OBS    │   │   CWA    │
│          │   │          │
│ List     │   │ Forms    │
│ Filter   │   │ Approval │
│ Dashboard│   │ Workflow  │
│ Notes    │   │ Cond.    │
│          │   │ Fields   │
└────┬─────┘   └────┬─────┘
     │               │
     ▼               ▼
┌─────────┐   ┌──────────┐
│  SPFx   │   │Power Apps│
│  Web    │   │  Canvas  │
│  Parts  │   │   App    │
│         │   │         │
│SharePoint│   │  Power   │
│ /Teams  │   │ Automate │
└─────────┘   └──────────┘
```
