using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlankSpeedLegacyDemo.Web.Data;
using FlankSpeedLegacyDemo.Web.Models;
using FlankSpeedLegacyDemo.Web.Services;

namespace FlankSpeedLegacyDemo.Web.Controllers;

// MIGRATION NOTE [PowerApp]: This controller maps to Power Apps screens and Power Automate flows.
// Form submissions map to Patch() calls. Approval logic maps to Power Automate approval actions.
public class CwaController : Controller
{
    private readonly AppDbContext _context;
    private readonly CurrentUserService _currentUserService;

    public CwaController(AppDbContext context, CurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    // MIGRATION NOTE [PowerApp]: This list maps to a Power Apps Gallery control with delegable filtering.
    // Filter formula: Filter(Requests, Status.Value = dropdownStatus.Selected.Value, Title in searchText)
    public IActionResult Index(string? statusFilter, string? search)
    {
        var query = _context.WorkItems
            .Where(w => w.Module == "CWA")
            .Include(w => w.Category)
            .Include(w => w.Status)
            .Include(w => w.SubmittedByUser)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter))
            query = query.Where(w => w.Status!.Name == statusFilter);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(w => w.Title.Contains(search) || (w.Description != null && w.Description.Contains(search)));

        ViewBag.StatusFilter = statusFilter;
        ViewBag.Search = search;
        ViewBag.Statuses = _context.Statuses.Where(s => s.Module == "CWA" || s.Module == "Shared").OrderBy(s => s.SortOrder).ToList();
        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        var items = query.OrderByDescending(w => w.SubmittedDate).ToList();
        return View(items);
    }

    // MIGRATION NOTE [PowerApp]: Create form maps to a Power Apps EditForm with a New item mode.
    // Conditional visibility maps to Power Fx If() and Visible properties.
    [HttpGet]
    public IActionResult Create()
    {
        ViewBag.Categories = _context.Categories.Where(c => c.Module == "CWA").ToList();
        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        return View(new WorkItem { Module = "CWA" });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(WorkItem model)
    {
        var currentUserId = _currentUserService.GetCurrentUserId();
        var submittedStatus = _context.Statuses.First(s => s.Name == "Pending Approval" && s.Module == "CWA");

        model.Module = "CWA";
        model.StatusId = submittedStatus.Id;
        model.SubmittedByUserId = currentUserId;
        model.SubmittedDate = DateTime.UtcNow;
        model.LastUpdatedDate = DateTime.UtcNow;
        model.CreatedAt = DateTime.UtcNow;
        model.UpdatedAt = DateTime.UtcNow;

        _context.WorkItems.Add(model);
        _context.SaveChanges();

        // Auto-create ApprovalSteps based on category/priority
        var category = _context.Categories.Find(model.CategoryId);
        var approvers = _context.Users.Where(u => u.Role == "Approver" && u.IsActive).ToList();
        var supervisorApprover = approvers.FirstOrDefault(u => u.Team == "Operations") ?? approvers.First();
        var directorApprover = approvers.FirstOrDefault(u => u.Team == "Compliance") ?? approvers.Last();

        if (category?.Name == "Facility Access Request")
        {
            _context.ApprovalSteps.Add(new ApprovalStep
            {
                WorkItemId = model.Id, StepName = "Supervisor Review", StepOrder = 1,
                ApproverUserId = supervisorApprover.Id, Decision = "Pending"
            });
            _context.ApprovalSteps.Add(new ApprovalStep
            {
                WorkItemId = model.Id, StepName = "Security Clearance Verification", StepOrder = 2,
                ApproverUserId = directorApprover.Id, Decision = "Pending"
            });
        }
        else
        {
            _context.ApprovalSteps.Add(new ApprovalStep
            {
                WorkItemId = model.Id, StepName = "Supervisor Review", StepOrder = 1,
                ApproverUserId = supervisorApprover.Id, Decision = "Pending"
            });
            _context.ApprovalSteps.Add(new ApprovalStep
            {
                WorkItemId = model.Id, StepName = "Director Approval", StepOrder = 2,
                ApproverUserId = directorApprover.Id, Decision = "Pending"
            });
        }

        // If Critical priority, add a third step
        if (model.Priority == "Critical")
        {
            var adminApprover = _context.Users.FirstOrDefault(u => u.Role == "Admin" && u.IsActive);
            _context.ApprovalSteps.Add(new ApprovalStep
            {
                WorkItemId = model.Id, StepName = "Executive Review", StepOrder = 3,
                ApproverUserId = adminApprover?.Id, Decision = "Pending"
            });
        }

        _context.AuditLogs.Add(new AuditLog
        {
            WorkItemId = model.Id,
            Action = "Created",
            PerformedByUserId = currentUserId,
            NewValue = "Pending Approval",
            Timestamp = DateTime.UtcNow
        });

        _context.SaveChanges();
        return RedirectToAction("Details", new { id = model.Id });
    }

    // MIGRATION NOTE [PowerApp]: Edit form maps to Power Apps EditForm with an Edit item mode.
    // Read-only conditional fields map to Power Fx DisplayMode.
    [HttpGet]
    public IActionResult Edit(int id)
    {
        var item = _context.WorkItems
            .Include(w => w.Category)
            .Include(w => w.Status)
            .FirstOrDefault(w => w.Id == id && w.Module == "CWA");

        if (item == null)
            return NotFound();

        ViewBag.Categories = _context.Categories.Where(c => c.Module == "CWA").ToList();
        ViewBag.Statuses = _context.Statuses.Where(s => s.Module == "CWA" || s.Module == "Shared").OrderBy(s => s.SortOrder).ToList();
        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        return View(item);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Edit(int id, WorkItem model)
    {
        var item = _context.WorkItems.Include(w => w.Status).FirstOrDefault(w => w.Id == id);
        if (item == null || item.Module != "CWA")
            return NotFound();

        var currentUserId = _currentUserService.GetCurrentUserId();

        item.Title = model.Title;
        item.Description = model.Description;
        item.CategoryId = model.CategoryId;
        item.Priority = model.Priority;
        item.DueDate = model.DueDate;
        item.Justification = model.Justification;
        item.BuildingNumber = model.BuildingNumber;
        item.AccessLevel = model.AccessLevel;
        item.LastUpdatedDate = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            WorkItemId = id,
            Action = "Updated",
            PerformedByUserId = currentUserId,
            NewValue = "Record updated",
            Timestamp = DateTime.UtcNow
        });

        _context.SaveChanges();
        return RedirectToAction("Details", new { id });
    }

    // MIGRATION NOTE [PowerApp]: Detail view maps to a Power Apps Display form with Gallery for approvals.
    public IActionResult Details(int id)
    {
        var item = _context.WorkItems
            .Include(w => w.Category)
            .Include(w => w.Status)
            .Include(w => w.SubmittedByUser)
            .Include(w => w.AssignedToUser)
            .Include(w => w.Comments!).ThenInclude(c => c.AuthorUser)
            .Include(w => w.Attachments!).ThenInclude(a => a.UploadedByUser)
            .Include(w => w.AuditLogs!).ThenInclude(al => al.PerformedByUser)
            .Include(w => w.ApprovalSteps!).ThenInclude(a => a.ApproverUser)
            .FirstOrDefault(w => w.Id == id && w.Module == "CWA");

        if (item == null)
            return NotFound();

        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        return View(item);
    }

    // MIGRATION NOTE [PowerApp]: Approval flow maps to Power Automate triggered by Power Apps.
    // The approval UI in Power Apps would use a Gallery of approval steps with conditional buttons.
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Approve(int approvalStepId, string decision, string? remarks)
    {
        var step = _context.ApprovalSteps
            .Include(a => a.WorkItem)
            .FirstOrDefault(a => a.Id == approvalStepId);

        if (step == null)
            return NotFound();

        var currentUserId = _currentUserService.GetCurrentUserId();

        step.Decision = decision;
        step.DecisionDate = DateTime.UtcNow;
        step.Remarks = remarks;

        _context.AuditLogs.Add(new AuditLog
        {
            WorkItemId = step.WorkItemId,
            Action = $"Approval Step {decision}",
            PerformedByUserId = currentUserId,
            OldValue = "Pending",
            NewValue = $"{step.StepName}: {decision}",
            Timestamp = DateTime.UtcNow
        });

        // Check if all steps are now decided
        var allSteps = _context.ApprovalSteps.Where(a => a.WorkItemId == step.WorkItemId).ToList();

        if (decision == "Rejected")
        {
            var rejectedStatus = _context.Statuses.First(s => s.Name == "Rejected" && s.Module == "CWA");
            step.WorkItem!.StatusId = rejectedStatus.Id;
            step.WorkItem.LastUpdatedDate = DateTime.UtcNow;
        }
        else if (allSteps.All(a => a.Decision == "Approved"))
        {
            var approvedStatus = _context.Statuses.First(s => s.Name == "Approved" && s.Module == "CWA");
            step.WorkItem!.StatusId = approvedStatus.Id;
            step.WorkItem.LastUpdatedDate = DateTime.UtcNow;
        }

        _context.SaveChanges();
        return RedirectToAction("Details", new { id = step.WorkItemId });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult AddComment(int workItemId, string text)
    {
        var currentUserId = _currentUserService.GetCurrentUserId();

        _context.Comments.Add(new Comment
        {
            WorkItemId = workItemId,
            AuthorUserId = currentUserId,
            Text = text,
            CreatedAt = DateTime.UtcNow
        });

        _context.AuditLogs.Add(new AuditLog
        {
            WorkItemId = workItemId,
            Action = "Comment Added",
            PerformedByUserId = currentUserId,
            NewValue = text.Length > 50 ? text[..50] + "..." : text,
            Timestamp = DateTime.UtcNow
        });

        var item = _context.WorkItems.Find(workItemId);
        if (item != null)
            item.LastUpdatedDate = DateTime.UtcNow;

        _context.SaveChanges();
        return RedirectToAction("Details", new { id = workItemId });
    }
}
