# Deployment Guide — Power Apps Code App ALM

## Overview

This guide covers the Application Lifecycle Management (ALM) workflow for deploying the CWA Work Requests Power Apps Code App to a Flank Speed (M365) tenant.

---

## Prerequisites

- Power Platform CLI (`pac`) installed: `npm install -g @microsoft/pac-cli`
- Power Apps Premium license assigned to end users
- Power Platform environment(s) provisioned (Dev → Test → Prod)
- Azure SQL Database configured and accessible from Power Platform

---

## Development Workflow

### Local Development

```bash
# Install dependencies
cd power-apps-migration
npm install

# Start local dev server with hot reload
npm run dev
# Opens http://localhost:3000 — Local Play URL

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Initialize Code App (first time only)

```bash
# Authenticate to Power Platform
pac auth create --environment <ENVIRONMENT_URL>

# Initialize the Code App binding
npx power-apps init \
  --display-name "CWA Work Requests" \
  --environment-id <ENVIRONMENT_ID>
```

---

## Build & Deploy

### Deploy to Development Environment

```bash
# Build production bundle
npm run build

# Push to Power Platform
pac code push

# This uploads the built assets and registers the app in the environment
```

### Solution Packaging

```bash
# Export as managed solution for ALM
pac solution export \
  --path ./solution \
  --name CWAWorkRequests \
  --managed true

# Import to target environment
pac solution import \
  --path ./solution/CWAWorkRequests_managed.zip \
  --environment <TARGET_ENVIRONMENT_URL>
```

---

## Environment Pipeline (Dev → Test → Prod)

### Using Power Platform Pipelines

1. **Configure Pipeline** in Power Platform Admin Center:
   - Development environment → Staging → Production
   - Automatic validation on promotion

2. **Promote to Test:**
   ```bash
   pac pipeline promote \
     --solution CWAWorkRequests \
     --stage Test
   ```

3. **Promote to Production:**
   ```bash
   pac pipeline promote \
     --solution CWAWorkRequests \
     --stage Production
   ```

### CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy-code-app.yml
name: Deploy CWA Code App

on:
  push:
    branches: [main]
    paths: ['power-apps-migration/**']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: power-apps-migration
        run: npm ci

      - name: Type check
        working-directory: power-apps-migration
        run: npm run typecheck

      - name: Build
        working-directory: power-apps-migration
        run: npm run build

      - name: Install Power Platform CLI
        run: npm install -g @microsoft/pac-cli

      - name: Authenticate to Power Platform
        run: pac auth create --tenant ${{ secrets.PP_TENANT_ID }} --applicationId ${{ secrets.PP_APP_ID }} --clientSecret ${{ secrets.PP_CLIENT_SECRET }}

      - name: Deploy Code App
        working-directory: power-apps-migration
        run: pac code push
```

---

## Power Automate Flows (Approval Workflow)

The approval logic from `CwaController.Approve()` is migrated to Power Automate:

### Flow 1: Auto-Create Approval Steps

- **Trigger:** When a row is created in [dbo].[WorkItems] where Module = 'CWA'
- **Logic:**
  1. Get the Category name for the new WorkItem
  2. If Category = "Facility Access Request":
     - Create ApprovalStep: "Supervisor Review" (Order 1)
     - Create ApprovalStep: "Security Clearance Verification" (Order 2)
  3. Else:
     - Create ApprovalStep: "Supervisor Review" (Order 1)
     - Create ApprovalStep: "Director Approval" (Order 2)
  4. If Priority = "Critical":
     - Create ApprovalStep: "Executive Review" (Order 3)

### Flow 2: Process Approval Decision

- **Trigger:** When an approval step is updated (Decision changed from "Pending")
- **Logic:**
  1. If Decision = "Rejected" → Update WorkItem Status to "Rejected"
  2. If all steps for this WorkItem have Decision = "Approved" → Update WorkItem Status to "Approved"
  3. Create AuditLog entry for the decision

---

## Flank Speed-Specific Configuration

### Tenant Settings

- Ensure Power Apps is enabled in the M365 admin center
- Verify DLP (Data Loss Prevention) policies allow the SQL connector
- Configure Conditional Access policies for the app

### Security

- Configure Azure AD security groups for access control
- Map legacy roles (Admin, Reviewer, Submitter, Approver) to Entra security groups
- Apply Row-Level Security in Azure SQL if needed

---

## Rollback Procedure

If issues are detected post-deployment:

```bash
# Revert to previous solution version
pac solution import \
  --path ./solution/CWAWorkRequests_previous_managed.zip \
  --environment <ENVIRONMENT_URL> \
  --force-overwrite
```

---

## Monitoring

- Power Platform analytics: Admin Center → Analytics → Power Apps
- Azure SQL monitoring: Azure Portal → SQL Database → Metrics
- Application Insights (optional): Add telemetry via custom connectors
