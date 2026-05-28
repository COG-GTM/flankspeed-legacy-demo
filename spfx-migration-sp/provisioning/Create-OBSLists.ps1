<#
.SYNOPSIS
    Creates the SharePoint Lists required by the OBS SPFx web parts.

.DESCRIPTION
    This script provisions 5 SharePoint Lists that replace the legacy SQL Server
    database tables. Run this BEFORE deploying the SPFx web parts.

    Lists created:
      1. Statuses        - Workflow status lookup values
      2. Categories      - Work item category lookup values
      3. OBS Work Items  - Main work items list (replaces WorkItems table)
      4. Comments        - Work item comments (replaces Comments table)
      5. Audit Log       - Change audit trail (replaces AuditLogs table)

.PARAMETER SiteUrl
    The SharePoint site URL where lists will be created.
    Example: https://yourtenant.sharepoint.com/sites/OBSModule

.EXAMPLE
    .\Create-OBSLists.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/OBSModule"

.NOTES
    Prerequisites:
      - PnP.PowerShell module: Install-Module PnP.PowerShell -Scope CurrentUser
      - SharePoint site owner or site collection admin permissions
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OBS Module — SharePoint List Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Connect to SharePoint
Write-Host "Connecting to $SiteUrl ..." -ForegroundColor Yellow
Connect-PnPOnline -Url $SiteUrl -Interactive
Write-Host "Connected.`n" -ForegroundColor Green

# ─────────────────────────────────────────────────
# List 1: Statuses (lookup list)
# ─────────────────────────────────────────────────
Write-Host "[1/5] Creating 'Statuses' list..." -ForegroundColor Yellow

$statusesList = Get-PnPList -Identity "Statuses" -ErrorAction SilentlyContinue
if ($null -eq $statusesList) {
    New-PnPList -Title "Statuses" -Template GenericList -Url "Lists/Statuses"
    Add-PnPField -List "Statuses" -DisplayName "SortOrder" -InternalName "SortOrder" -Type Number -Required

    # Populate statuses
    $statuses = @(
        @{ Title = "Draft";        SortOrder = 1 },
        @{ Title = "Submitted";    SortOrder = 2 },
        @{ Title = "Under Review"; SortOrder = 3 },
        @{ Title = "In Progress";  SortOrder = 4 },
        @{ Title = "Completed";    SortOrder = 5 },
        @{ Title = "Closed";       SortOrder = 6 }
    )
    foreach ($s in $statuses) {
        Add-PnPListItem -List "Statuses" -Values $s | Out-Null
    }
    Write-Host "  Created with $($statuses.Count) status values." -ForegroundColor Green
}
else {
    Write-Host "  Already exists — skipping." -ForegroundColor DarkYellow
}

# ─────────────────────────────────────────────────
# List 2: Categories (lookup list)
# ─────────────────────────────────────────────────
Write-Host "[2/5] Creating 'Categories' list..." -ForegroundColor Yellow

$categoriesList = Get-PnPList -Identity "Categories" -ErrorAction SilentlyContinue
if ($null -eq $categoriesList) {
    New-PnPList -Title "Categories" -Template GenericList -Url "Lists/Categories"
    Add-PnPField -List "Categories" -DisplayName "Description" -InternalName "Description0" -Type Note

    # Populate categories
    $categories = @(
        @{ Title = "Infrastructure Review";   Description0 = "Network, server, and facility infrastructure assessments" },
        @{ Title = "Compliance Audit";        Description0 = "Regulatory and policy compliance reviews" },
        @{ Title = "Operational Assessment";  Description0 = "Operational readiness and process evaluations" },
        @{ Title = "Resource Allocation";     Description0 = "Budget, personnel, and equipment resource planning" }
    )
    foreach ($c in $categories) {
        Add-PnPListItem -List "Categories" -Values $c | Out-Null
    }
    Write-Host "  Created with $($categories.Count) categories." -ForegroundColor Green
}
else {
    Write-Host "  Already exists — skipping." -ForegroundColor DarkYellow
}

# ─────────────────────────────────────────────────
# List 3: OBS Work Items (main list)
# ─────────────────────────────────────────────────
Write-Host "[3/5] Creating 'OBS Work Items' list..." -ForegroundColor Yellow

$workItemsList = Get-PnPList -Identity "OBS Work Items" -ErrorAction SilentlyContinue
if ($null -eq $workItemsList) {
    New-PnPList -Title "OBS Work Items" -Template GenericList -Url "Lists/OBSWorkItems"

    # Add columns
    Add-PnPField -List "OBS Work Items" -DisplayName "Description" -InternalName "Description0" -Type Note
    Add-PnPField -List "OBS Work Items" -DisplayName "Priority" -InternalName "Priority0" -Type Choice -Choices "Low","Medium","High","Critical" -Required
    Add-PnPField -List "OBS Work Items" -DisplayName "TeamOwner" -InternalName "TeamOwner" -Type Choice -Choices "Operations","IT","Logistics","Compliance"
    Add-PnPField -List "OBS Work Items" -DisplayName "DueDate" -InternalName "DueDate0" -Type DateTime
    Add-PnPField -List "OBS Work Items" -DisplayName "SubmittedDate" -InternalName "SubmittedDate" -Type DateTime -Required
    Add-PnPField -List "OBS Work Items" -DisplayName "LastUpdatedDate" -InternalName "LastUpdatedDate" -Type DateTime -Required
    Add-PnPField -List "OBS Work Items" -DisplayName "ClosedDate" -InternalName "ClosedDate" -Type DateTime

    # Lookup fields
    $statusesListId = (Get-PnPList -Identity "Statuses").Id
    $categoriesListId = (Get-PnPList -Identity "Categories").Id
    Add-PnPFieldFromXml -List "OBS Work Items" -FieldXml "<Field Type='Lookup' DisplayName='Status' Required='TRUE' List='{$statusesListId}' ShowField='Title' />"
    Add-PnPFieldFromXml -List "OBS Work Items" -FieldXml "<Field Type='Lookup' DisplayName='Category' Required='TRUE' List='{$categoriesListId}' ShowField='Title' />"

    # Person fields
    Add-PnPField -List "OBS Work Items" -DisplayName "AssignedTo" -InternalName "AssignedTo0" -Type User
    Add-PnPField -List "OBS Work Items" -DisplayName "SubmittedBy" -InternalName "SubmittedBy0" -Type User -Required

    Write-Host "  Created with all columns." -ForegroundColor Green
}
else {
    Write-Host "  Already exists — skipping." -ForegroundColor DarkYellow
}

# ─────────────────────────────────────────────────
# List 4: Comments
# ─────────────────────────────────────────────────
Write-Host "[4/5] Creating 'Comments' list..." -ForegroundColor Yellow

$commentsList = Get-PnPList -Identity "Comments" -ErrorAction SilentlyContinue
if ($null -eq $commentsList) {
    New-PnPList -Title "Comments" -Template GenericList -Url "Lists/Comments"

    Add-PnPField -List "Comments" -DisplayName "WorkItemId" -InternalName "WorkItemId" -Type Number -Required
    Add-PnPField -List "Comments" -DisplayName "Text" -InternalName "Text0" -Type Note -Required
    Add-PnPField -List "Comments" -DisplayName "Author" -InternalName "Author0" -Type User -Required
    Add-PnPField -List "Comments" -DisplayName "CreatedAt" -InternalName "CreatedAt" -Type DateTime -Required

    Write-Host "  Created." -ForegroundColor Green
}
else {
    Write-Host "  Already exists — skipping." -ForegroundColor DarkYellow
}

# ─────────────────────────────────────────────────
# List 5: Audit Log
# ─────────────────────────────────────────────────
Write-Host "[5/5] Creating 'Audit Log' list..." -ForegroundColor Yellow

$auditList = Get-PnPList -Identity "Audit Log" -ErrorAction SilentlyContinue
if ($null -eq $auditList) {
    New-PnPList -Title "Audit Log" -Template GenericList -Url "Lists/AuditLog"

    Add-PnPField -List "Audit Log" -DisplayName "WorkItemId" -InternalName "WorkItemId" -Type Number -Required
    Add-PnPField -List "Audit Log" -DisplayName "Action" -InternalName "Action0" -Type Text -Required
    Add-PnPField -List "Audit Log" -DisplayName "PerformedBy" -InternalName "PerformedBy" -Type User -Required
    Add-PnPField -List "Audit Log" -DisplayName "OldValue" -InternalName "OldValue" -Type Text
    Add-PnPField -List "Audit Log" -DisplayName "NewValue" -InternalName "NewValue" -Type Text
    Add-PnPField -List "Audit Log" -DisplayName "Timestamp" -InternalName "Timestamp0" -Type DateTime -Required

    Write-Host "  Created." -ForegroundColor Green
}
else {
    Write-Host "  Already exists — skipping." -ForegroundColor DarkYellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  All lists created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext step: Run Import-OBSSeedData.ps1 to populate with sample data." -ForegroundColor Yellow
Write-Host "Then build and deploy the SPFx web parts.`n" -ForegroundColor Yellow
