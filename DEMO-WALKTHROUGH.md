# Demo Walkthrough — Ops Tracker Migration with Windsurf

This document provides two walkthrough variants for demonstrating the Ops Tracker → M365/Flank Speed migration using Windsurf IDE with Cascade.

---

## Non-Technical Audience Walkthrough (~18 min)

*This is the PRIMARY walkthrough for the Flank Speed demo.*

---

### Phase 1: Set the Stage (2 min)

**Show a simple diagram:**
```
Legacy .NET App ("Ops Tracker")
    ├── Module A (OBS — Operational Records) → SPFx + Power Fx in SharePoint/Teams
    └── Module B (CWA — Work Requests)       → Power Apps + Power Fx + Power Automate
```

**Talking Points:**
- "This is a legacy internal tool that tracks operational records and work requests"
- "We're going to show how AI can analyze this legacy application and accelerate its migration to Microsoft 365"
- "Two modules, two different migration paths — one for read-heavy workflows, one for form-heavy workflows"
- "The AI understands the code, identifies patterns, and generates migration artifacts"

---

### Phase 2: Tour the Legacy App (4 min)

*Use Windsurf Preview pane to show the running application.*

**Click-through sequence:**

1. **Home Dashboard** (`/`)
   - "This is the main dashboard — shows summary counts for both modules"
   - "Notice the legacy Bootstrap 3 styling — intentionally dated"

2. **OBS List with Filters** (`/Obs`)
   - "Here's the operational records module — list view with filtering"
   - Demonstrate filtering by Status and Priority
   - "This read-heavy pattern is perfect for SharePoint/Teams"

3. **OBS Detail with Comments** (`/Obs/Details/1`)
   - "Detail view with comments, attachments, and audit history"
   - "The collaboration patterns here map naturally to M365"

4. **CWA Create Form** (`/Cwa/Create`)
   - Change Priority dropdown to "Critical" — show Justification field appears
   - Change Category to "Facility Access Request" — show Building/Access fields appear
   - "This conditional form logic is a KEY demo point — it maps directly to Power Fx"

5. **CWA Detail with Approval** (`/Cwa/Details/{id}`)
   - Switch user to "Michael Thompson" (Approver) via navbar dropdown
   - "Now I'm logged in as an approver — notice the Approve/Reject buttons appear"
   - "This multi-step approval maps to Power Automate"

**Talking Points:**
- "This is what legacy looks like — functional but hard to maintain and not mobile-friendly"
- "M365 gives us modern UI, mobile access, and built-in collaboration"
- "The question is: how do we get there efficiently?"

---

### Phase 3: Demo 1 — OBS → SPFx + Power Fx (Primary Use Case) (5 min)

*This is the client's primary use case: migrating the read-heavy OBS module to SPFx in SharePoint/Teams.*

**Step 1: Cascade Analyzes OBS for SPFx Migration (2 min)**

Open Windsurf Cascade chat. Enter this prompt:

> "Analyze the OBS module — the ObsController, OBS views, and dashboard — and explain how each part would migrate to SPFx web parts in SharePoint/Teams. What would the SPFx architecture look like?"

**Narration while Cascade responds:**
- "We're asking the AI to focus on the operational records module — the client's primary concern"
- "Cascade is reading through the controller, views, and data patterns"
- "It's identifying the list view, dashboard, detail view, and collaboration patterns"
- "Notice how it maps each pattern to a specific SPFx web part type"
- "This confirms the strategy: these read-heavy, browsing-and-filtering patterns are a natural fit for SPFx in SharePoint/Teams"

**Step 2: Cascade Shows SPFx + Power Fx Equivalents (2 min)**

Enter this prompt:

> "Show me how the OBS Dashboard summary counts and filtering logic would be expressed using Power Fx in the SPFx context. Include examples for the status counts, priority counts, and the 'My Assigned Items' query."

**Narration:**
- "Now it's translating the server-side C# queries into Power Fx expressions"
- "The `CountRows(Filter(...))` pattern replaces the LINQ GroupBy we saw in the legacy code"
- "The filter dropdowns map to Power Fx `Filter()` with delegable expressions"
- "This is the bridge — same business logic, modern platform"

**Step 3: Cascade Creates SPFx Migration Work Items (1 min)**

Enter this prompt:

> "Create GitHub issues to track the migration of the OBS module to SPFx. Create one for the list view, one for the dashboard, and one for the detail/comments view. Include the specific source files and acceptance criteria."

**Narration:**
- "Cascade is creating structured work items using the GitHub integration"
- "Each issue references the exact legacy source files that need to be migrated"
- "The team can now pick these up and start executing immediately"

---

### Phase 4: Demo 2 — CWA → Power Apps + Power Fx (Secondary Use Case) (4 min)

*This is the client's secondary use case: migrating the form-heavy CWA module to a Power App using Power Fx.*

**Step 1: Cascade Analyzes CWA for Power Apps Migration (1.5 min)**

Enter this prompt:

> "Now analyze the CWA module — the request forms, conditional field logic, and approval workflow — and explain how it maps to a Power Apps canvas app with Power Fx."

**Narration:**
- "Now we're looking at the work requests module — forms, submissions, and approvals"
- "This is a different pattern — write-heavy, transactional, with business rules in the form"
- "Cascade identifies this as a Power Apps candidate, not SPFx — different tool for a different job"

**Step 2: Cascade Shows Power Fx Conditional Logic (1.5 min)**

Enter this prompt:

> "Show me how the conditional field visibility in the CWA Create form — where Priority = Critical shows the Justification field, and Category = Facility Access Request shows the building fields — would look in Power Fx."

**Narration:**
- "This is the key moment — the jQuery conditional logic maps directly to Power Fx `If()` expressions"
- "In Power Apps, you'd set the Visible property: `If(dropdownPriority.Selected.Value = \"Critical\", true, false)`"
- "No jQuery, no JavaScript — just declarative formulas. This is why Power Apps is the right target for this module"
- "This is also where Power Fx coding assistance comes in — Cascade can help write these formulas"

**Step 3: Cascade Describes the Approval Flow (1 min)**

Enter this prompt:

> "Describe how the CWA approval workflow — the multi-step Approve/Reject logic in CwaController — would be replaced by a Power Automate flow triggered from the Power App."

**Narration:**
- "The manual approval routing in the .NET code becomes a Power Automate flow"
- "When a request is submitted in the Power App, it triggers the flow automatically"
- "Approvers get notifications, can approve/reject from email or Teams — no need to log into a legacy app"

---

### Phase 5: Close (2 min)

**Key Takeaways:**
- AI analyzed a complete legacy application and correctly identified two distinct migration paths
- **OBS → SPFx + Power Fx**: Read-heavy patterns (lists, dashboards, collaboration) belong in SharePoint/Teams
- **CWA → Power Apps + Power Fx**: Form-heavy patterns (submissions, conditional logic, approvals) belong in Power Apps
- The AI generated working code equivalents and Power Fx formulas for both paths
- It created actionable GitHub issues tied to specific source code
- This accelerates migration timelines from months to weeks

**Why two different paths?**
- "Not everything should be a Power App, and not everything should be an SPFx web part"
- "The AI helps identify which pattern fits where — that's the strategy validation the client needs"

---

**Presenter Notes:**
- Don't open source code unless asked — keep Windsurf Preview large
- The user-switcher is a strong visual moment (role changes → different UI)
- If Priority/Category conditional fields don't trigger, check the jQuery is loaded
- If asked technical questions, switch to the Technical walkthrough below
- Keep energy on the "AI acceleration" narrative, not the code syntax
- Lead with OBS/SPFx (Demo 1) since it's the primary use case — don't rush it
- Demo 2 (CWA/Power Apps) reinforces that the AI picks the right tool for the right pattern
- If running short on time, you can shorten Demo 2 by combining Steps 1 and 2 into a single prompt

---

## Technical Audience Walkthrough

*For developers and architects who want to see the detailed code generation.*

---

### Prompt 1: Analyze OBS Module for SPFx Patterns

> "Analyze the OBS module (ObsController.cs, Views/Obs/) and identify all UI patterns that map to SPFx web part types. For each pattern, reference the specific source file and line numbers, and describe the equivalent SPFx component."

### Prompt 2: Generate SPFx Web Part Skeleton

> "Generate a TypeScript SPFx web part skeleton that replaces the OBS Index view. Use PnPjs for data access, include the filter dropdowns as PropertyPane fields, and render the list using React with the same columns as the current table."

### Prompt 3: Analyze CWA Module for Power App Patterns

> "Analyze the CWA module (CwaController.cs, Views/Cwa/) and map each UI pattern to Power Apps components. Focus on the conditional field logic in Create/Edit views and the approval workflow in Details view."

### Prompt 4: Show Power Fx Formula Equivalents

> "For each piece of conditional logic in wwwroot/js/cwa-form.js, write the equivalent Power Fx expression. Show the Visible property formula for each conditional section, and the DisplayMode formula for the read-only fields in Edit view."

**Expected output:**
```
// Justification section visibility
If(dropdownPriority.Selected.Value = "Critical", true, false)

// Facility section visibility
If(dropdownCategory.Selected.Value = "Facility Access Request", true, false)

// Title field DisplayMode (read-only after Draft)
If(ThisItem.Status.Value = "Draft", DisplayMode.Edit, DisplayMode.View)
```

### Prompt 5: Generate Power Automate Flow Description

> "Describe a Power Automate flow that replaces the approval logic in CwaController.Approve(). Include the trigger (when a CWA item is submitted), the approval steps (based on ApprovalStep records), and the status update logic when all steps are approved or any step is rejected."

### Prompt 6: Create GitHub Issues and Branches

> "Create a GitHub issue for migrating the OBS Dashboard to an SPFx web part. Include the source files involved, the target SPFx project structure, and a definition of done. Then create a feature branch for this work."

---

## Quick Reference — Demo URLs

| Screen | URL | Key Demo Point |
|--------|-----|----------------|
| Home Dashboard | `/` | Overall summary |
| OBS List | `/Obs` | Filtering, search |
| OBS Dashboard | `/Obs/Dashboard` | Counts, assigned queue |
| OBS Detail | `/Obs/Details/1` | Comments, audit log |
| CWA List | `/Cwa` | New Request button |
| CWA Create | `/Cwa/Create` | **Conditional fields** |
| CWA Detail | `/Cwa/Details/11` | **Approval workflow** |

## Quick Reference — User Roles

| User | Role | Demo Purpose |
|------|------|--------------|
| Sarah Mitchell | Admin | Default user, sees everything |
| Michael Thompson | Approver | Show approval buttons on CWA details |
| David Kim | Submitter | Show submitter perspective |
| James Rodriguez | Reviewer | Show OBS reviewer queue |
