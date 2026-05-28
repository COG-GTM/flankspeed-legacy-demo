using FlankSpeedLegacyDemo.Web.Models;

namespace FlankSpeedLegacyDemo.Web.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext context)
    {
        if (context.Users.Any())
            return;

        // --- Users ---
        var users = new List<User>
        {
            new() { DisplayName = "Sarah Mitchell", Email = "sarah.mitchell@ops.gov", Role = "Admin", Team = "Operations" },
            new() { DisplayName = "James Rodriguez", Email = "james.rodriguez@ops.gov", Role = "Reviewer", Team = "Operations" },
            new() { DisplayName = "Emily Chen", Email = "emily.chen@ops.gov", Role = "Submitter", Team = "IT" },
            new() { DisplayName = "Michael Thompson", Email = "michael.thompson@ops.gov", Role = "Approver", Team = "Compliance" },
            new() { DisplayName = "Lisa Patel", Email = "lisa.patel@ops.gov", Role = "Reviewer", Team = "Logistics" },
            new() { DisplayName = "David Kim", Email = "david.kim@ops.gov", Role = "Submitter", Team = "IT" },
            new() { DisplayName = "Rachel Foster", Email = "rachel.foster@ops.gov", Role = "Approver", Team = "Operations" },
            new() { DisplayName = "Marcus Johnson", Email = "marcus.johnson@ops.gov", Role = "Admin", Team = "Logistics" },
            new() { DisplayName = "Angela Wright", Email = "angela.wright@ops.gov", Role = "Submitter", Team = "Compliance" },
            new() { DisplayName = "Robert Davis", Email = "robert.davis@ops.gov", Role = "Reviewer", Team = "IT" }
        };
        context.Users.AddRange(users);
        context.SaveChanges();

        // --- Categories ---
        var categories = new List<Category>
        {
            // OBS module
            new() { Name = "Infrastructure Review", Module = "OBS", Description = "Reviews of physical and digital infrastructure" },
            new() { Name = "Compliance Audit", Module = "OBS", Description = "Regulatory and policy compliance assessments" },
            new() { Name = "Operational Assessment", Module = "OBS", Description = "Evaluations of operational readiness and efficiency" },
            new() { Name = "Resource Allocation", Module = "OBS", Description = "Planning and review of resource distribution" },
            // CWA module
            new() { Name = "Facility Access Request", Module = "CWA", Description = "Requests for building or area access" },
            new() { Name = "Equipment Relocation", Module = "CWA", Description = "Requests to move equipment between locations" },
            new() { Name = "Personnel Action", Module = "CWA", Description = "Staff transfers, assignments, and duty changes" },
            new() { Name = "Travel Authorization", Module = "CWA", Description = "Travel approval requests for conferences and training" }
        };
        context.Categories.AddRange(categories);
        context.SaveChanges();

        // --- Statuses ---
        var statuses = new List<Status>
        {
            // Shared
            new() { Name = "Draft", Module = "Shared", SortOrder = 1 },
            new() { Name = "Submitted", Module = "Shared", SortOrder = 2 },
            // OBS
            new() { Name = "Under Review", Module = "OBS", SortOrder = 3 },
            new() { Name = "In Progress", Module = "OBS", SortOrder = 4 },
            new() { Name = "Completed", Module = "OBS", SortOrder = 5 },
            new() { Name = "Closed", Module = "OBS", SortOrder = 6 },
            // CWA
            new() { Name = "Pending Approval", Module = "CWA", SortOrder = 3 },
            new() { Name = "Approved", Module = "CWA", SortOrder = 4 },
            new() { Name = "Rejected", Module = "CWA", SortOrder = 5 },
            new() { Name = "Returned", Module = "CWA", SortOrder = 6 }
        };
        context.Statuses.AddRange(statuses);
        context.SaveChanges();

        // Reload entities to get IDs
        var sarah = users[0];
        var james = users[1];
        var emily = users[2];
        var michael = users[3];
        var lisa = users[4];
        var david = users[5];
        var rachel = users[6];
        var marcus = users[7];
        var angela = users[8];
        var robert = users[9];

        var catInfraReview = categories[0];
        var catComplianceAudit = categories[1];
        var catOpsAssessment = categories[2];
        var catResourceAlloc = categories[3];
        var catFacilityAccess = categories[4];
        var catEquipReloc = categories[5];
        var catPersonnelAction = categories[6];
        var catTravelAuth = categories[7];

        var stDraft = statuses[0];
        var stSubmitted = statuses[1];
        var stUnderReview = statuses[2];
        var stInProgress = statuses[3];
        var stCompleted = statuses[4];
        var stClosed = statuses[5];
        var stPendingApproval = statuses[6];
        var stApproved = statuses[7];
        var stRejected = statuses[8];
        var stReturned = statuses[9];

        var now = DateTime.UtcNow;

        // --- WorkItems (OBS) ---
        var obsWorkItems = new List<WorkItem>
        {
            new()
            {
                Title = "Q3 Network Infrastructure Audit",
                Description = "Comprehensive audit of network infrastructure across all regional offices. Includes firewall configurations, switch firmware versions, and bandwidth utilization analysis.",
                Module = "OBS", CategoryId = catInfraReview.Id, StatusId = stInProgress.Id,
                Priority = "High", AssignedToUserId = james.Id, SubmittedByUserId = sarah.Id,
                TeamOwner = "IT", DueDate = now.AddDays(14),
                SubmittedDate = now.AddDays(-45), LastUpdatedDate = now.AddDays(-2)
            },
            new()
            {
                Title = "Facility Security Assessment — Building 7",
                Description = "Annual security assessment for Building 7 including access control systems, CCTV coverage, and perimeter security evaluation.",
                Module = "OBS", CategoryId = catOpsAssessment.Id, StatusId = stUnderReview.Id,
                Priority = "Critical", AssignedToUserId = rachel.Id, SubmittedByUserId = james.Id,
                TeamOwner = "Operations", DueDate = now.AddDays(7),
                SubmittedDate = now.AddDays(-30), LastUpdatedDate = now.AddDays(-5)
            },
            new()
            {
                Title = "Annual Compliance Review — IT Systems",
                Description = "Review all IT systems for compliance with federal security standards and organizational policies. Includes FISMA and NIST framework alignment.",
                Module = "OBS", CategoryId = catComplianceAudit.Id, StatusId = stSubmitted.Id,
                Priority = "High", AssignedToUserId = michael.Id, SubmittedByUserId = emily.Id,
                TeamOwner = "Compliance", DueDate = now.AddDays(30),
                SubmittedDate = now.AddDays(-10), LastUpdatedDate = now.AddDays(-10)
            },
            new()
            {
                Title = "Resource Allocation Plan — FY2025",
                Description = "Develop and review resource allocation plan for fiscal year 2025. Includes personnel, equipment, and budget projections.",
                Module = "OBS", CategoryId = catResourceAlloc.Id, StatusId = stCompleted.Id,
                Priority = "Medium", AssignedToUserId = marcus.Id, SubmittedByUserId = sarah.Id,
                TeamOwner = "Logistics", DueDate = now.AddDays(-15),
                SubmittedDate = now.AddDays(-60), LastUpdatedDate = now.AddDays(-15), ClosedDate = now.AddDays(-15)
            },
            new()
            {
                Title = "Operational Readiness Assessment — Eastern Region",
                Description = "Evaluate operational readiness across all Eastern Region facilities. Assess staffing levels, equipment status, and response capabilities.",
                Module = "OBS", CategoryId = catOpsAssessment.Id, StatusId = stInProgress.Id,
                Priority = "High", AssignedToUserId = lisa.Id, SubmittedByUserId = marcus.Id,
                TeamOwner = "Operations", DueDate = now.AddDays(21),
                SubmittedDate = now.AddDays(-25), LastUpdatedDate = now.AddDays(-3)
            },
            new()
            {
                Title = "Data Center Migration Evaluation",
                Description = "Assess feasibility and plan for migrating primary data center to new facility. Includes risk assessment and timeline estimation.",
                Module = "OBS", CategoryId = catInfraReview.Id, StatusId = stDraft.Id,
                Priority = "Medium", AssignedToUserId = null, SubmittedByUserId = david.Id,
                TeamOwner = "IT", DueDate = now.AddDays(60),
                SubmittedDate = now.AddDays(-5), LastUpdatedDate = now.AddDays(-5)
            },
            new()
            {
                Title = "Personnel Security Clearance Review Batch 12",
                Description = "Process and review security clearance renewals for batch 12 personnel. Includes background verification updates and access level reassessments.",
                Module = "OBS", CategoryId = catComplianceAudit.Id, StatusId = stUnderReview.Id,
                Priority = "High", AssignedToUserId = michael.Id, SubmittedByUserId = rachel.Id,
                TeamOwner = "Compliance", DueDate = now.AddDays(10),
                SubmittedDate = now.AddDays(-20), LastUpdatedDate = now.AddDays(-7)
            },
            new()
            {
                Title = "Quarterly Budget Variance Analysis",
                Description = "Analyze Q2 budget variances across all departments. Identify overspend areas and recommend corrective actions for Q3.",
                Module = "OBS", CategoryId = catResourceAlloc.Id, StatusId = stClosed.Id,
                Priority = "Low", AssignedToUserId = marcus.Id, SubmittedByUserId = sarah.Id,
                TeamOwner = "Logistics", DueDate = now.AddDays(-30),
                SubmittedDate = now.AddDays(-75), LastUpdatedDate = now.AddDays(-30), ClosedDate = now.AddDays(-30)
            },
            new()
            {
                Title = "Emergency Response Protocol Review",
                Description = "Review and update emergency response protocols for all facilities. Ensure alignment with latest FEMA guidelines and local requirements.",
                Module = "OBS", CategoryId = catOpsAssessment.Id, StatusId = stSubmitted.Id,
                Priority = "Critical", AssignedToUserId = null, SubmittedByUserId = rachel.Id,
                TeamOwner = "Operations", DueDate = now.AddDays(5),
                SubmittedDate = now.AddDays(-8), LastUpdatedDate = now.AddDays(-8)
            },
            new()
            {
                Title = "Fleet Vehicle Maintenance Audit",
                Description = "Audit maintenance records and condition of all fleet vehicles. Identify units requiring immediate service or replacement.",
                Module = "OBS", CategoryId = catInfraReview.Id, StatusId = stInProgress.Id,
                Priority = "Medium", AssignedToUserId = lisa.Id, SubmittedByUserId = marcus.Id,
                TeamOwner = "Logistics", DueDate = now.AddDays(28),
                SubmittedDate = now.AddDays(-35), LastUpdatedDate = now.AddDays(-1)
            }
        };
        context.WorkItems.AddRange(obsWorkItems);
        context.SaveChanges();

        // --- WorkItems (CWA) ---
        var cwaWorkItems = new List<WorkItem>
        {
            new()
            {
                Title = "Facility Access Request — Building 12 Server Room",
                Description = "Requesting access to Building 12 server room for scheduled maintenance window. Need 24/7 badge access for 2-week period.",
                Module = "CWA", CategoryId = catFacilityAccess.Id, StatusId = stPendingApproval.Id,
                Priority = "High", AssignedToUserId = null, SubmittedByUserId = david.Id,
                TeamOwner = "IT", DueDate = now.AddDays(3),
                BuildingNumber = "12", AccessLevel = "Restricted",
                SubmittedDate = now.AddDays(-4), LastUpdatedDate = now.AddDays(-2)
            },
            new()
            {
                Title = "Equipment Relocation — Finance Department",
                Description = "Relocate 15 workstations and associated peripherals from Building 3, Floor 2 to Building 5, Floor 1 as part of department consolidation.",
                Module = "CWA", CategoryId = catEquipReloc.Id, StatusId = stApproved.Id,
                Priority = "Medium", AssignedToUserId = lisa.Id, SubmittedByUserId = emily.Id,
                TeamOwner = "Logistics", DueDate = now.AddDays(14),
                SubmittedDate = now.AddDays(-12), LastUpdatedDate = now.AddDays(-6)
            },
            new()
            {
                Title = "Travel Authorization — Regional Conference",
                Description = "Travel authorization for 3 team members to attend Federal IT Modernization Conference in Arlington, VA. Duration: 3 days.",
                Module = "CWA", CategoryId = catTravelAuth.Id, StatusId = stApproved.Id,
                Priority = "Low", AssignedToUserId = null, SubmittedByUserId = emily.Id,
                TeamOwner = "IT", DueDate = now.AddDays(21),
                SubmittedDate = now.AddDays(-20), LastUpdatedDate = now.AddDays(-14)
            },
            new()
            {
                Title = "Personnel Action — Team Transfer Request",
                Description = "Request transfer of David Kim from IT Infrastructure team to IT Security team effective next quarter. Includes role change from Submitter to Reviewer.",
                Module = "CWA", CategoryId = catPersonnelAction.Id, StatusId = stPendingApproval.Id,
                Priority = "Medium", AssignedToUserId = null, SubmittedByUserId = sarah.Id,
                TeamOwner = "Operations", DueDate = now.AddDays(30),
                SubmittedDate = now.AddDays(-7), LastUpdatedDate = now.AddDays(-5)
            },
            new()
            {
                Title = "Equipment Procurement — IT Lab Upgrade",
                Description = "Procurement request for upgraded lab equipment including 10 high-performance workstations, 2 network switches, and 1 rack server.",
                Module = "CWA", CategoryId = catEquipReloc.Id, StatusId = stSubmitted.Id,
                Priority = "Critical", AssignedToUserId = null, SubmittedByUserId = david.Id,
                TeamOwner = "IT", DueDate = now.AddDays(45),
                Justification = "Current lab equipment is 5+ years old and cannot support new development workloads. Multiple hardware failures in the past month have caused project delays.",
                SubmittedDate = now.AddDays(-3), LastUpdatedDate = now.AddDays(-3)
            },
            new()
            {
                Title = "Facility Access Request — Secure Storage Area",
                Description = "Requesting temporary access to secure storage area B-14 for inventory audit purposes. Need access for 3 days.",
                Module = "CWA", CategoryId = catFacilityAccess.Id, StatusId = stRejected.Id,
                Priority = "Medium", AssignedToUserId = null, SubmittedByUserId = angela.Id,
                TeamOwner = "Compliance", DueDate = now.AddDays(-5),
                BuildingNumber = "B-14", AccessLevel = "Top Secret",
                SubmittedDate = now.AddDays(-15), LastUpdatedDate = now.AddDays(-10)
            },
            new()
            {
                Title = "Travel Authorization — Training Seminar",
                Description = "Travel authorization for Angela Wright to attend Compliance Officers Training Seminar in Washington, DC. Duration: 5 days.",
                Module = "CWA", CategoryId = catTravelAuth.Id, StatusId = stDraft.Id,
                Priority = "Low", AssignedToUserId = null, SubmittedByUserId = angela.Id,
                TeamOwner = "Compliance", DueDate = now.AddDays(45),
                SubmittedDate = now.AddDays(-1), LastUpdatedDate = now.AddDays(-1)
            },
            new()
            {
                Title = "Personnel Action — Temporary Duty Assignment",
                Description = "Request temporary duty assignment for Marcus Johnson to Eastern Region office for 90-day operational support rotation.",
                Module = "CWA", CategoryId = catPersonnelAction.Id, StatusId = stPendingApproval.Id,
                Priority = "High", AssignedToUserId = null, SubmittedByUserId = rachel.Id,
                TeamOwner = "Operations", DueDate = now.AddDays(14),
                SubmittedDate = now.AddDays(-6), LastUpdatedDate = now.AddDays(-4)
            },
            new()
            {
                Title = "Facility Access Request — Building 9 Lab",
                Description = "Requesting permanent badge access to Building 9 research lab for ongoing project collaboration.",
                Module = "CWA", CategoryId = catFacilityAccess.Id, StatusId = stReturned.Id,
                Priority = "Medium", AssignedToUserId = null, SubmittedByUserId = robert.Id,
                TeamOwner = "IT", DueDate = now.AddDays(10),
                BuildingNumber = "9", AccessLevel = "Confidential",
                SubmittedDate = now.AddDays(-9), LastUpdatedDate = now.AddDays(-4)
            },
            new()
            {
                Title = "Equipment Relocation — Logistics Warehouse",
                Description = "Move heavy equipment (forklifts, pallet jacks) from Warehouse A to new Warehouse C facility.",
                Module = "CWA", CategoryId = catEquipReloc.Id, StatusId = stApproved.Id,
                Priority = "High", AssignedToUserId = marcus.Id, SubmittedByUserId = lisa.Id,
                TeamOwner = "Logistics", DueDate = now.AddDays(7),
                SubmittedDate = now.AddDays(-14), LastUpdatedDate = now.AddDays(-8)
            }
        };
        context.WorkItems.AddRange(cwaWorkItems);
        context.SaveChanges();

        // --- Comments ---
        var comments = new List<Comment>
        {
            new() { WorkItemId = obsWorkItems[0].Id, AuthorUserId = james.Id, Text = "Initial network scan completed. Found 3 switches running outdated firmware in the Eastern corridor.", CreatedAt = now.AddDays(-40) },
            new() { WorkItemId = obsWorkItems[0].Id, AuthorUserId = sarah.Id, Text = "Please prioritize the firewall configuration review. We had an incident last week.", CreatedAt = now.AddDays(-38) },
            new() { WorkItemId = obsWorkItems[0].Id, AuthorUserId = james.Id, Text = "Firewall review complete. Identified 2 rules that need tightening. Report attached.", CreatedAt = now.AddDays(-30) },
            new() { WorkItemId = obsWorkItems[1].Id, AuthorUserId = rachel.Id, Text = "CCTV coverage gaps identified on the north perimeter. Recommending 3 additional cameras.", CreatedAt = now.AddDays(-20) },
            new() { WorkItemId = obsWorkItems[1].Id, AuthorUserId = james.Id, Text = "Access control logs show 12 failed attempts in the past month. Need to investigate.", CreatedAt = now.AddDays(-15) },
            new() { WorkItemId = obsWorkItems[2].Id, AuthorUserId = emily.Id, Text = "Submitted all documentation for FISMA review. Awaiting compliance team assessment.", CreatedAt = now.AddDays(-9) },
            new() { WorkItemId = obsWorkItems[3].Id, AuthorUserId = marcus.Id, Text = "Final allocation plan approved by leadership. All departments notified.", CreatedAt = now.AddDays(-16) },
            new() { WorkItemId = obsWorkItems[4].Id, AuthorUserId = lisa.Id, Text = "Eastern Region Site A assessment complete. Moving to Site B next week.", CreatedAt = now.AddDays(-10) },
            new() { WorkItemId = obsWorkItems[4].Id, AuthorUserId = marcus.Id, Text = "Please include staffing gaps in your assessment. We're seeing high turnover in that region.", CreatedAt = now.AddDays(-8) },
            new() { WorkItemId = obsWorkItems[6].Id, AuthorUserId = michael.Id, Text = "Batch 12 includes 47 personnel. 5 require additional documentation before processing.", CreatedAt = now.AddDays(-14) },
            new() { WorkItemId = obsWorkItems[6].Id, AuthorUserId = rachel.Id, Text = "Additional documentation for the 5 flagged personnel has been submitted.", CreatedAt = now.AddDays(-10) },
            new() { WorkItemId = obsWorkItems[9].Id, AuthorUserId = lisa.Id, Text = "Fleet audit is 60% complete. 4 vehicles flagged for immediate service.", CreatedAt = now.AddDays(-7) },
            new() { WorkItemId = obsWorkItems[9].Id, AuthorUserId = marcus.Id, Text = "Budget approved for emergency vehicle repairs. Please proceed with scheduling.", CreatedAt = now.AddDays(-5) },
            new() { WorkItemId = cwaWorkItems[0].Id, AuthorUserId = david.Id, Text = "Need access starting Monday for the scheduled UPS replacement.", CreatedAt = now.AddDays(-3) },
            new() { WorkItemId = cwaWorkItems[0].Id, AuthorUserId = rachel.Id, Text = "Supervisor review complete. Forwarding to security for clearance verification.", CreatedAt = now.AddDays(-2) },
            new() { WorkItemId = cwaWorkItems[1].Id, AuthorUserId = emily.Id, Text = "All workstations have been backed up and are ready for physical move.", CreatedAt = now.AddDays(-8) },
            new() { WorkItemId = cwaWorkItems[1].Id, AuthorUserId = lisa.Id, Text = "Logistics team confirmed availability for the move next Tuesday.", CreatedAt = now.AddDays(-6) },
            new() { WorkItemId = cwaWorkItems[3].Id, AuthorUserId = sarah.Id, Text = "David has expressed interest in the security team and has relevant certifications.", CreatedAt = now.AddDays(-6) },
            new() { WorkItemId = cwaWorkItems[4].Id, AuthorUserId = david.Id, Text = "Updated justification with cost analysis showing ROI within 18 months.", CreatedAt = now.AddDays(-2) },
            new() { WorkItemId = cwaWorkItems[5].Id, AuthorUserId = michael.Id, Text = "Access denied. Requestor does not have required clearance level for this area.", CreatedAt = now.AddDays(-10) },
            new() { WorkItemId = cwaWorkItems[7].Id, AuthorUserId = rachel.Id, Text = "Marcus has confirmed availability for the rotation. Pending director approval.", CreatedAt = now.AddDays(-4) },
            new() { WorkItemId = cwaWorkItems[8].Id, AuthorUserId = michael.Id, Text = "Request returned — need to specify project name and expected duration of access.", CreatedAt = now.AddDays(-4) },
            new() { WorkItemId = obsWorkItems[8].Id, AuthorUserId = rachel.Id, Text = "Updated protocols drafted based on latest FEMA guidelines. Ready for team review.", CreatedAt = now.AddDays(-6) },
            new() { WorkItemId = cwaWorkItems[9].Id, AuthorUserId = lisa.Id, Text = "Warehouse C receiving dock confirmed ready for heavy equipment.", CreatedAt = now.AddDays(-9) },
            new() { WorkItemId = cwaWorkItems[9].Id, AuthorUserId = marcus.Id, Text = "Safety inspection of Warehouse C floor load capacity passed. Clear to proceed.", CreatedAt = now.AddDays(-8) },
            new() { WorkItemId = obsWorkItems[5].Id, AuthorUserId = david.Id, Text = "Preliminary cost estimates gathered. Awaiting vendor proposals before full assessment.", CreatedAt = now.AddDays(-4) },
            new() { WorkItemId = cwaWorkItems[2].Id, AuthorUserId = emily.Id, Text = "Registration confirmed for all 3 attendees. Hotel reservations made.", CreatedAt = now.AddDays(-14) },
            new() { WorkItemId = obsWorkItems[7].Id, AuthorUserId = sarah.Id, Text = "Good work on the analysis. Findings presented to leadership team.", CreatedAt = now.AddDays(-32) }
        };
        context.Comments.AddRange(comments);
        context.SaveChanges();

        // --- Attachments ---
        var attachments = new List<Attachment>
        {
            new() { WorkItemId = obsWorkItems[0].Id, FileName = "network-topology-diagram.pdf", FileSize = 2450000, UploadedByUserId = james.Id, UploadedAt = now.AddDays(-40) },
            new() { WorkItemId = obsWorkItems[0].Id, FileName = "firewall-config-report.xlsx", FileSize = 185000, UploadedByUserId = james.Id, UploadedAt = now.AddDays(-30) },
            new() { WorkItemId = obsWorkItems[1].Id, FileName = "floor-plan-building-7.pdf", FileSize = 3200000, UploadedByUserId = rachel.Id, UploadedAt = now.AddDays(-25) },
            new() { WorkItemId = obsWorkItems[2].Id, FileName = "compliance-checklist.xlsx", FileSize = 98000, UploadedByUserId = emily.Id, UploadedAt = now.AddDays(-9) },
            new() { WorkItemId = obsWorkItems[3].Id, FileName = "fy2025-allocation-plan-final.pdf", FileSize = 1540000, UploadedByUserId = marcus.Id, UploadedAt = now.AddDays(-16) },
            new() { WorkItemId = obsWorkItems[4].Id, FileName = "eastern-region-site-a-report.pdf", FileSize = 890000, UploadedByUserId = lisa.Id, UploadedAt = now.AddDays(-10) },
            new() { WorkItemId = cwaWorkItems[0].Id, FileName = "maintenance-schedule.pdf", FileSize = 125000, UploadedByUserId = david.Id, UploadedAt = now.AddDays(-4) },
            new() { WorkItemId = cwaWorkItems[4].Id, FileName = "equipment-specifications.pdf", FileSize = 2100000, UploadedByUserId = david.Id, UploadedAt = now.AddDays(-3) },
            new() { WorkItemId = obsWorkItems[9].Id, FileName = "fleet-condition-photos.zip", FileSize = 15600000, UploadedByUserId = lisa.Id, UploadedAt = now.AddDays(-7) },
            new() { WorkItemId = obsWorkItems[8].Id, FileName = "emergency-protocol-draft-v2.docx", FileSize = 456000, UploadedByUserId = rachel.Id, UploadedAt = now.AddDays(-6) }
        };
        context.Attachments.AddRange(attachments);
        context.SaveChanges();

        // --- AuditLog ---
        var auditLogs = new List<AuditLog>
        {
            new() { WorkItemId = obsWorkItems[0].Id, Action = "Created", PerformedByUserId = sarah.Id, NewValue = "Draft", Timestamp = now.AddDays(-45) },
            new() { WorkItemId = obsWorkItems[0].Id, Action = "Status Changed", PerformedByUserId = sarah.Id, OldValue = "Draft", NewValue = "Submitted", Timestamp = now.AddDays(-44) },
            new() { WorkItemId = obsWorkItems[0].Id, Action = "Assigned", PerformedByUserId = sarah.Id, NewValue = "James Rodriguez", Timestamp = now.AddDays(-43) },
            new() { WorkItemId = obsWorkItems[0].Id, Action = "Status Changed", PerformedByUserId = james.Id, OldValue = "Submitted", NewValue = "In Progress", Timestamp = now.AddDays(-42) },
            new() { WorkItemId = obsWorkItems[1].Id, Action = "Created", PerformedByUserId = james.Id, NewValue = "Draft", Timestamp = now.AddDays(-30) },
            new() { WorkItemId = obsWorkItems[1].Id, Action = "Status Changed", PerformedByUserId = james.Id, OldValue = "Draft", NewValue = "Under Review", Timestamp = now.AddDays(-28) },
            new() { WorkItemId = obsWorkItems[3].Id, Action = "Status Changed", PerformedByUserId = marcus.Id, OldValue = "In Progress", NewValue = "Completed", Timestamp = now.AddDays(-15) },
            new() { WorkItemId = cwaWorkItems[0].Id, Action = "Created", PerformedByUserId = david.Id, NewValue = "Draft", Timestamp = now.AddDays(-4) },
            new() { WorkItemId = cwaWorkItems[0].Id, Action = "Status Changed", PerformedByUserId = david.Id, OldValue = "Draft", NewValue = "Pending Approval", Timestamp = now.AddDays(-4) },
            new() { WorkItemId = cwaWorkItems[1].Id, Action = "Status Changed", PerformedByUserId = rachel.Id, OldValue = "Pending Approval", NewValue = "Approved", Timestamp = now.AddDays(-6) },
            new() { WorkItemId = cwaWorkItems[5].Id, Action = "Status Changed", PerformedByUserId = michael.Id, OldValue = "Pending Approval", NewValue = "Rejected", Timestamp = now.AddDays(-10) },
            new() { WorkItemId = obsWorkItems[9].Id, Action = "Comment Added", PerformedByUserId = lisa.Id, NewValue = "Fleet audit progress update", Timestamp = now.AddDays(-7) },
            new() { WorkItemId = cwaWorkItems[7].Id, Action = "Created", PerformedByUserId = rachel.Id, NewValue = "Draft", Timestamp = now.AddDays(-6) },
            new() { WorkItemId = cwaWorkItems[7].Id, Action = "Status Changed", PerformedByUserId = rachel.Id, OldValue = "Draft", NewValue = "Pending Approval", Timestamp = now.AddDays(-6) },
            new() { WorkItemId = obsWorkItems[8].Id, Action = "Created", PerformedByUserId = rachel.Id, NewValue = "Submitted", Timestamp = now.AddDays(-8) }
        };
        context.AuditLogs.AddRange(auditLogs);
        context.SaveChanges();

        // --- ApprovalSteps ---
        var approvalSteps = new List<ApprovalStep>
        {
            // Building 12 Server Room access (Pending Approval)
            new() { WorkItemId = cwaWorkItems[0].Id, StepName = "Supervisor Review", StepOrder = 1, ApproverUserId = rachel.Id, Decision = "Approved", DecisionDate = now.AddDays(-2), Remarks = "Approved. Maintenance window confirmed with facilities." },
            new() { WorkItemId = cwaWorkItems[0].Id, StepName = "Security Clearance Verification", StepOrder = 2, ApproverUserId = michael.Id, Decision = "Pending", Remarks = null },
            // Personnel Action — Team Transfer (Pending Approval)
            new() { WorkItemId = cwaWorkItems[3].Id, StepName = "Supervisor Review", StepOrder = 1, ApproverUserId = rachel.Id, Decision = "Approved", DecisionDate = now.AddDays(-5), Remarks = "Transfer aligns with team needs." },
            new() { WorkItemId = cwaWorkItems[3].Id, StepName = "Director Approval", StepOrder = 2, ApproverUserId = michael.Id, Decision = "Pending", Remarks = null },
            // Personnel Action — Temporary Duty (Pending Approval)
            new() { WorkItemId = cwaWorkItems[7].Id, StepName = "Supervisor Review", StepOrder = 1, ApproverUserId = sarah.Id, Decision = "Pending", Remarks = null },
            new() { WorkItemId = cwaWorkItems[7].Id, StepName = "Director Approval", StepOrder = 2, ApproverUserId = michael.Id, Decision = "Pending", Remarks = null },
            // Secure Storage Area (Rejected)
            new() { WorkItemId = cwaWorkItems[5].Id, StepName = "Supervisor Review", StepOrder = 1, ApproverUserId = rachel.Id, Decision = "Approved", DecisionDate = now.AddDays(-12), Remarks = "Audit purpose confirmed." },
            new() { WorkItemId = cwaWorkItems[5].Id, StepName = "Security Clearance Verification", StepOrder = 2, ApproverUserId = michael.Id, Decision = "Rejected", DecisionDate = now.AddDays(-10), Remarks = "Requestor clearance level insufficient for Top Secret areas." }
        };
        context.ApprovalSteps.AddRange(approvalSteps);
        context.SaveChanges();
    }
}
