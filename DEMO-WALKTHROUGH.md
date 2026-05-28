# Demo Walkthrough — Ops Tracker Migration with Windsurf

This document provides two walkthrough variants for demonstrating the Ops Tracker → M365/Flank Speed migration using Windsurf IDE with Cascade.

---

## Non-Technical Audience Walkthrough (15 min)

*This is the PRIMARY walkthrough for the Flank Speed demo.*

---

### Phase 1: Set the Stage (2 min)

**Show a simple diagram:**
```
Legacy .NET App ("Ops Tracker")
    ├── Module A (OBS) → SPFx in SharePoint/Teams
    └── Module B (CWA) → Power Apps + Power Automate
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

### Phase 3: Cascade Analyzes the App (3 min)

**Open Windsurf Cascade chat. Enter this prompt:**

> "Summarize this application's two modules and explain which parts should migrate to SPFx in SharePoint/Teams and which should become a Power App."

**Narration while Cascade responds:**
- "Cascade is reading through the entire codebase right now"
- "It's identifying the patterns — the list views, the form logic, the approval workflow"
- "Notice it's referencing specific files and code patterns"
- "It correctly identifies Module A as read-heavy (SPFx candidate) and Module B as form-heavy (Power App candidate)"

---

### Phase 4: Cascade Generates Migration Artifacts (3 min)

**Enter this prompt:**

> "Show me how the conditional form logic in the CWA Create form would look in Power Apps using Power Fx."

**Narration:**
- "Now it's translating the jQuery conditional logic into Power Fx"
- "The `If()` expression maps directly to the Visible property in Power Apps"
- "No manual translation needed — the AI understands both source and target"
- Don't dwell on syntax — focus on "it mapped the pattern correctly"

---

### Phase 5: Create Actionable Work Items (2 min)

**Enter this prompt:**

> "Create 3 GitHub issues to track the migration of the CWA approval workflow to Power Automate. Include specific source files and acceptance criteria."

**Narration:**
- "Cascade is now creating structured work items with the GitHub MCP plugin"
- "Each issue references the specific source files involved"
- "The team can now pick up these issues and execute the migration"
- Show the created issues in GitHub

---

### Phase 6: Close (1 min)

**Key Takeaways:**
- AI analyzed a complete legacy application in seconds
- It correctly identified migration paths for different patterns
- It generated working code equivalents in the target platform
- It created actionable work items connected to source control
- This accelerates migration timelines from months to weeks

---

**Presenter Notes:**
- Don't open source code unless asked — keep Windsurf Preview large
- The user-switcher is a strong visual moment (role changes → different UI)
- If Priority/Category conditional fields don't trigger, check the jQuery is loaded
- If asked technical questions, switch to the Technical walkthrough below
- Keep energy on the "AI acceleration" narrative, not the code syntax

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
