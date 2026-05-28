<#
.SYNOPSIS
    Imports sample data into the OBS SharePoint Lists.

.DESCRIPTION
    Populates the "OBS Work Items", "Comments", and "Audit Log" lists with
    the same sample data shown in the HTML mockup demo. Run this AFTER
    Create-OBSLists.ps1.

.PARAMETER SiteUrl
    The SharePoint site URL where lists were created.

.PARAMETER AssigneeEmail
    Email of the user to assign items to (defaults to current user).
    In the mockup, this was "Sarah Mitchell". You can set this to any
    valid user in your tenant.

.EXAMPLE
    .\Import-OBSSeedData.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/OBSModule"

.NOTES
    Prerequisites:
      - PnP.PowerShell module installed
      - Create-OBSLists.ps1 has been run first
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$AssigneeEmail
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OBS Module — Import Seed Data" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Connect
Write-Host "Connecting to $SiteUrl ..." -ForegroundColor Yellow
Connect-PnPOnline -Url $SiteUrl -Interactive

# Use current user if no assignee specified
if (-not $AssigneeEmail) {
    $AssigneeEmail = (Get-PnPProperty -ClientObject (Get-PnPWeb) -Property CurrentUser).Email
    Write-Host "Using current user as assignee: $AssigneeEmail" -ForegroundColor DarkYellow
}

# Get lookup IDs for statuses
Write-Host "`nReading lookup values..." -ForegroundColor Yellow
$statusItems = Get-PnPListItem -List "Statuses" -Fields "Title"
$statusLookup = @{}
foreach ($s in $statusItems) {
    $statusLookup[$s.FieldValues.Title] = $s.Id
}

$categoryItems = Get-PnPListItem -List "Categories" -Fields "Title"
$categoryLookup = @{}
foreach ($c in $categoryItems) {
    $categoryLookup[$c.FieldValues.Title] = $c.Id
}

Write-Host "  Statuses: $($statusLookup.Keys -join ', ')" -ForegroundColor DarkGray
Write-Host "  Categories: $($categoryLookup.Keys -join ', ')" -ForegroundColor DarkGray

# ─────────────────────────────────────────────────
# Seed OBS Work Items (matches HTML mockup data)
# ─────────────────────────────────────────────────
Write-Host "`nImporting OBS Work Items..." -ForegroundColor Yellow

$workItems = @(
    @{
        Title            = "Annual Infrastructure Security Audit - Bldg 7"
        Description0     = "Comprehensive security audit of Building 7 infrastructure including network equipment, physical access controls, fire suppression systems, and emergency power backup. This is an annual compliance requirement under DoD Instruction 8500.01."
        Priority0        = "Critical"
        Status           = $statusLookup["In Progress"]
        Category         = $categoryLookup["Compliance Audit"]
        TeamOwner        = "Operations"
        DueDate0         = "2024-03-15"
        SubmittedDate    = "2024-01-15"
        LastUpdatedDate  = "2024-03-01"
    },
    @{
        Title            = "Q1 Network Performance Assessment"
        Description0     = "Quarterly assessment of network performance metrics across all facilities. Includes bandwidth utilization, latency measurements, and packet loss analysis."
        Priority0        = "High"
        Status           = $statusLookup["Under Review"]
        Category         = $categoryLookup["Infrastructure Review"]
        TeamOwner        = "IT"
        DueDate0         = "2024-04-01"
        SubmittedDate    = "2024-01-20"
        LastUpdatedDate  = "2024-02-28"
    },
    @{
        Title            = "Server Room Environmental Compliance"
        Description0     = "Review of server room environmental controls including temperature, humidity, and fire suppression systems for NIST SP 800-53 compliance."
        Priority0        = "Medium"
        Status           = $statusLookup["Completed"]
        Category         = $categoryLookup["Compliance Audit"]
        TeamOwner        = "Compliance"
        DueDate0         = "2024-02-28"
        SubmittedDate    = "2024-01-10"
        LastUpdatedDate  = "2024-02-15"
    },
    @{
        Title            = "Fleet Vehicle Maintenance Tracking Overhaul"
        Description0     = "Complete overhaul of the fleet vehicle maintenance tracking system. Includes digitizing paper records and establishing preventive maintenance schedules."
        Priority0        = "High"
        Status           = $statusLookup["In Progress"]
        Category         = $categoryLookup["Operational Assessment"]
        TeamOwner        = "Logistics"
        DueDate0         = "2024-05-01"
        SubmittedDate    = "2024-01-25"
        LastUpdatedDate  = "2024-02-20"
    },
    @{
        Title            = "FY24 Budget Allocation - IT Infrastructure"
        Description0     = "Planning and allocation of FY24 budget for IT infrastructure upgrades including network switches, servers, and UPS systems."
        Priority0        = "Medium"
        Status           = $statusLookup["Draft"]
        Category         = $categoryLookup["Resource Allocation"]
        TeamOwner        = "Operations"
        DueDate0         = "2024-06-30"
        SubmittedDate    = "2024-02-01"
        LastUpdatedDate  = "2024-03-05"
    },
    @{
        Title            = "Physical Security Perimeter Review"
        Description0     = "Assessment of physical security perimeter including fencing, lighting, camera coverage, and guard post effectiveness."
        Priority0        = "Critical"
        Status           = $statusLookup["Submitted"]
        Category         = $categoryLookup["Compliance Audit"]
        TeamOwner        = "Compliance"
        DueDate0         = "2024-03-20"
        SubmittedDate    = "2024-02-15"
        LastUpdatedDate  = "2024-03-08"
    },
    @{
        Title            = "Data Center Capacity Planning - Phase 2"
        Description0     = "Phase 2 of data center capacity planning including power density analysis, cooling requirements, and rack space projections for next 3 years."
        Priority0        = "High"
        Status           = $statusLookup["In Progress"]
        Category         = $categoryLookup["Infrastructure Review"]
        TeamOwner        = "IT"
        DueDate0         = "2024-07-15"
        SubmittedDate    = "2024-02-01"
        LastUpdatedDate  = "2024-03-02"
    },
    @{
        Title            = "Emergency Generator Load Test Results"
        Description0     = "Documentation and analysis of emergency generator load test results for all buildings. Includes runtime capacity verification and fuel consumption metrics."
        Priority0        = "Low"
        Status           = $statusLookup["Completed"]
        Category         = $categoryLookup["Operational Assessment"]
        TeamOwner        = "Logistics"
        DueDate0         = "2024-02-15"
        SubmittedDate    = "2024-01-05"
        LastUpdatedDate  = "2024-01-30"
    },
    @{
        Title            = "Contractor Badge Access Reconciliation"
        Description0     = "Reconciliation of contractor badge access with current contract records. Includes identification of expired access and revocation of inactive badges."
        Priority0        = "Medium"
        Status           = $statusLookup["Under Review"]
        Category         = $categoryLookup["Compliance Audit"]
        TeamOwner        = "Operations"
        DueDate0         = "2024-04-15"
        SubmittedDate    = "2024-02-10"
        LastUpdatedDate  = "2024-03-10"
    },
    @{
        Title            = "Warehouse Inventory System Migration Plan"
        Description0     = "Migration plan for the legacy warehouse inventory system to a modern cloud-based solution. Includes requirements gathering, vendor evaluation, and timeline."
        Priority0        = "Low"
        Status           = $statusLookup["Draft"]
        Category         = $categoryLookup["Resource Allocation"]
        TeamOwner        = "Logistics"
        DueDate0         = "2024-08-01"
        SubmittedDate    = "2024-03-01"
        LastUpdatedDate  = "2024-03-12"
    }
)

$itemCount = 0
foreach ($wi in $workItems) {
    $itemCount++
    # Set AssignedTo and SubmittedBy to the specified user
    $wi["AssignedTo0"] = $AssigneeEmail
    $wi["SubmittedBy0"] = $AssigneeEmail

    Add-PnPListItem -List "OBS Work Items" -Values $wi | Out-Null
    Write-Host "  [$itemCount/$($workItems.Count)] $($wi.Title)" -ForegroundColor DarkGray
}
Write-Host "  Imported $itemCount work items." -ForegroundColor Green

# ─────────────────────────────────────────────────
# Seed Comments (for work item #1)
# ─────────────────────────────────────────────────
Write-Host "`nImporting Comments..." -ForegroundColor Yellow

$comments = @(
    @{
        WorkItemId = 1
        Text0      = "Network equipment inspection completed for floors 1-3. Found 2 switches past their maintenance window. Creating replacement tickets."
        Author0    = $AssigneeEmail
        CreatedAt  = "2024-03-01T14:30:00"
    },
    @{
        WorkItemId = 1
        Text0      = "Physical access audit for all entry points is scheduled for next week. Badge reader logs have been pulled for the last 90 days."
        Author0    = $AssigneeEmail
        CreatedAt  = "2024-02-20T11:15:00"
    },
    @{
        WorkItemId = 1
        Text0      = "Initiating annual infrastructure security audit per DoD 8500.01. Sarah Mitchell assigned as lead auditor. Target completion: March 15."
        Author0    = $AssigneeEmail
        CreatedAt  = "2024-01-15T09:00:00"
    }
)

foreach ($comment in $comments) {
    Add-PnPListItem -List "Comments" -Values $comment | Out-Null
}
Write-Host "  Imported $($comments.Count) comments." -ForegroundColor Green

# ─────────────────────────────────────────────────
# Seed Audit Log (for work item #1)
# ─────────────────────────────────────────────────
Write-Host "`nImporting Audit Log entries..." -ForegroundColor Yellow

$auditLogs = @(
    @{
        WorkItemId  = 1
        Action0     = "Status Changed"
        PerformedBy = $AssigneeEmail
        OldValue    = "Under Review"
        NewValue    = "In Progress"
        Timestamp0  = "2024-03-01T14:00:00"
    },
    @{
        WorkItemId  = 1
        Action0     = "Comment Added"
        PerformedBy = $AssigneeEmail
        Timestamp0  = "2024-02-20T11:15:00"
    },
    @{
        WorkItemId  = 1
        Action0     = "Status Changed"
        PerformedBy = $AssigneeEmail
        OldValue    = "Submitted"
        NewValue    = "Under Review"
        Timestamp0  = "2024-01-20T10:00:00"
    },
    @{
        WorkItemId  = 1
        Action0     = "Item Created"
        PerformedBy = $AssigneeEmail
        Timestamp0  = "2024-01-15T09:00:00"
    }
)

foreach ($log in $auditLogs) {
    Add-PnPListItem -List "Audit Log" -Values $log | Out-Null
}
Write-Host "  Imported $($auditLogs.Count) audit log entries." -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Seed data imported successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nYour SharePoint lists are now populated with sample data." -ForegroundColor Yellow
Write-Host "Next step: Build and deploy the SPFx web parts.`n" -ForegroundColor Yellow
