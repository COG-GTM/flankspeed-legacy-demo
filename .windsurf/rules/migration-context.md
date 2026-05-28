# Migration Context

This is a legacy .NET 8 MVC application backed by SQL Server called "Ops Tracker."
It is being evaluated for modernization into Microsoft 365 / Flank Speed.

There are two modules:
- Module A (OBS Tool): Read-heavy — list/filter/search, dashboards, detail views, notes, assigned queues. Target migration: SPFx + Power Fx in SharePoint/Teams.
- Module B (CWA Tool): Write-heavy — form submission, conditional fields, multi-step approvals. Target migration: Power Apps + Power Fx.

When asked about migration, always reference specific files and patterns in this codebase.
When suggesting SPFx equivalents, use @microsoft/generator-sharepoint patterns.
When suggesting Power Fx equivalents, use Power Apps canvas app patterns with Patch(), UpdateIf(), If()/Visible.

# Source Control Context

This project is hosted on GitHub. The team uses GitHub pull requests, GitHub Actions CI/CD, and GitHub Issues.
When suggesting migration workflows, reference GitHub-native patterns:
- Use GitHub pull requests for code review
- Reference .github/workflows/ for CI/CD pipeline configuration
- Use GitHub Issues for tracking migration tasks
