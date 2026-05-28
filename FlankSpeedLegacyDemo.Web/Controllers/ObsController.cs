using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlankSpeedLegacyDemo.Web.Data;
using FlankSpeedLegacyDemo.Web.Models;
using FlankSpeedLegacyDemo.Web.Services;

namespace FlankSpeedLegacyDemo.Web.Controllers;

// MIGRATION NOTE [SPFx]: This controller maps to SPFx web parts in SharePoint/Teams.
// Each action would become a separate web part or view within a single-page app web part.
public class ObsController : Controller
{
    private readonly AppDbContext _context;
    private readonly CurrentUserService _currentUserService;

    public ObsController(AppDbContext context, CurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    // MIGRATION NOTE [SPFx]: This list view maps to an SPFx ListView web part with PnPjs.
    // Filter pattern maps to: Filter(WorkItems, Status.Value = dropdownStatus.Selected.Value)
    public IActionResult Index(string? statusFilter, string? categoryFilter, string? priorityFilter, string? search)
    {
        var query = _context.WorkItems
            .Where(w => w.Module == "OBS")
            .Include(w => w.Category)
            .Include(w => w.Status)
            .Include(w => w.AssignedToUser)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter))
            query = query.Where(w => w.Status!.Name == statusFilter);

        if (!string.IsNullOrEmpty(categoryFilter))
            query = query.Where(w => w.Category!.Name == categoryFilter);

        if (!string.IsNullOrEmpty(priorityFilter))
            query = query.Where(w => w.Priority == priorityFilter);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(w => w.Title.Contains(search) || (w.Description != null && w.Description.Contains(search)));

        ViewBag.StatusFilter = statusFilter;
        ViewBag.CategoryFilter = categoryFilter;
        ViewBag.PriorityFilter = priorityFilter;
        ViewBag.Search = search;
        ViewBag.Statuses = _context.Statuses.Where(s => s.Module == "OBS" || s.Module == "Shared").OrderBy(s => s.SortOrder).ToList();
        ViewBag.Categories = _context.Categories.Where(c => c.Module == "OBS").ToList();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();
        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();

        var items = query.OrderByDescending(w => w.LastUpdatedDate).ToList();
        return View(items);
    }

    // MIGRATION NOTE [SPFx]: This dashboard maps to an SPFx dashboard web part.
    // Summary counts map to Power Fx CountRows(Filter(...)) expressions.
    public IActionResult Dashboard()
    {
        var obsItems = _context.WorkItems
            .Where(w => w.Module == "OBS")
            .Include(w => w.Status)
            .Include(w => w.Category)
            .Include(w => w.AssignedToUser)
            .ToList();

        ViewBag.CountByStatus = obsItems
            .GroupBy(w => w.Status?.Name ?? "Unknown")
            .ToDictionary(g => g.Key, g => g.Count());

        ViewBag.CountByPriority = obsItems
            .GroupBy(w => w.Priority)
            .ToDictionary(g => g.Key, g => g.Count());

        ViewBag.CountByTeam = obsItems
            .GroupBy(w => w.TeamOwner ?? "Unassigned")
            .ToDictionary(g => g.Key, g => g.Count());

        var currentUserId = _currentUserService.GetCurrentUserId();
        ViewBag.MyItems = obsItems.Where(w => w.AssignedToUserId == currentUserId).ToList();

        ViewBag.OverdueItems = obsItems
            .Where(w => w.DueDate < DateTime.UtcNow && w.Status?.Name != "Closed" && w.Status?.Name != "Completed")
            .ToList();

        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        return View();
    }

    // MIGRATION NOTE [SPFx]: This detail view maps to an SPFx detail web part or Teams panel.
    public IActionResult Details(int id)
    {
        var item = _context.WorkItems
            .Include(w => w.Category)
            .Include(w => w.Status)
            .Include(w => w.AssignedToUser)
            .Include(w => w.SubmittedByUser)
            .Include(w => w.Comments!).ThenInclude(c => c.AuthorUser)
            .Include(w => w.Attachments!).ThenInclude(a => a.UploadedByUser)
            .Include(w => w.AuditLogs!).ThenInclude(al => al.PerformedByUser)
            .FirstOrDefault(w => w.Id == id && w.Module == "OBS");

        if (item == null)
            return NotFound();

        ViewBag.Statuses = _context.Statuses.Where(s => s.Module == "OBS" || s.Module == "Shared").OrderBy(s => s.SortOrder).ToList();
        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        return View(item);
    }

    // MIGRATION NOTE [SPFx]: Edit forms in SPFx would use PropertyPane or a custom React form component
    [HttpGet]
    public IActionResult Edit(int id)
    {
        var item = _context.WorkItems
            .Include(w => w.Category)
            .Include(w => w.Status)
            .FirstOrDefault(w => w.Id == id && w.Module == "OBS");

        if (item == null)
            return NotFound();

        ViewBag.Categories = _context.Categories.Where(c => c.Module == "OBS").ToList();
        ViewBag.Statuses = _context.Statuses.Where(s => s.Module == "OBS" || s.Module == "Shared").OrderBy(s => s.SortOrder).ToList();
        ViewBag.Users = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();
        ViewBag.CurrentUser = _currentUserService.GetCurrentUser();
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        return View(item);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Edit(int id, WorkItem model)
    {
        var item = _context.WorkItems.Find(id);
        if (item == null || item.Module != "OBS")
            return NotFound();

        var currentUserId = _currentUserService.GetCurrentUserId();

        item.Title = model.Title;
        item.Description = model.Description;
        item.CategoryId = model.CategoryId;
        item.Priority = model.Priority;
        item.AssignedToUserId = model.AssignedToUserId;
        item.TeamOwner = model.TeamOwner;
        item.DueDate = model.DueDate;
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

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult UpdateStatus(int workItemId, int newStatusId)
    {
        var item = _context.WorkItems.Include(w => w.Status).FirstOrDefault(w => w.Id == workItemId);
        if (item == null)
            return NotFound();

        var oldStatus = item.Status?.Name ?? "Unknown";
        var newStatus = _context.Statuses.Find(newStatusId);
        var currentUserId = _currentUserService.GetCurrentUserId();

        item.StatusId = newStatusId;
        item.LastUpdatedDate = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        if (newStatus?.Name == "Closed" || newStatus?.Name == "Completed")
            item.ClosedDate = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            WorkItemId = workItemId,
            Action = "Status Changed",
            PerformedByUserId = currentUserId,
            OldValue = oldStatus,
            NewValue = newStatus?.Name ?? "Unknown",
            Timestamp = DateTime.UtcNow
        });

        _context.SaveChanges();
        return RedirectToAction("Details", new { id = workItemId });
    }
}
