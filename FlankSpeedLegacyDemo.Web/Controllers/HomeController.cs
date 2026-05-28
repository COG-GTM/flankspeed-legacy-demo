using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlankSpeedLegacyDemo.Web.Data;
using FlankSpeedLegacyDemo.Web.Services;

namespace FlankSpeedLegacyDemo.Web.Controllers;

// MIGRATION NOTE: The Home controller serves as the main dashboard.
// In M365, this would be replaced by a Viva Connections dashboard or SharePoint home page.
public class HomeController : Controller
{
    private readonly AppDbContext _context;
    private readonly CurrentUserService _currentUserService;

    public HomeController(AppDbContext context, CurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public IActionResult Index()
    {
        var currentUser = _currentUserService.GetCurrentUser();
        ViewBag.CurrentUser = currentUser;

        // OBS summary counts by status
        ViewBag.ObsStatusCounts = _context.WorkItems
            .Where(w => w.Module == "OBS")
            .Include(w => w.Status)
            .GroupBy(w => w.Status!.Name)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionary(x => x.Status, x => x.Count);

        // CWA summary counts by status
        ViewBag.CwaStatusCounts = _context.WorkItems
            .Where(w => w.Module == "CWA")
            .Include(w => w.Status)
            .GroupBy(w => w.Status!.Name)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionary(x => x.Status, x => x.Count);

        // My assigned items
        var currentUserId = _currentUserService.GetCurrentUserId();
        ViewBag.MyItems = _context.WorkItems
            .Where(w => w.AssignedToUserId == currentUserId)
            .Include(w => w.Status)
            .Include(w => w.Category)
            .OrderByDescending(w => w.LastUpdatedDate)
            .ToList();

        // Recent activity
        ViewBag.RecentActivity = _context.AuditLogs
            .Include(al => al.WorkItem)
            .Include(al => al.PerformedByUser)
            .OrderByDescending(al => al.Timestamp)
            .Take(10)
            .ToList();

        // Total counts
        ViewBag.TotalObs = _context.WorkItems.Count(w => w.Module == "OBS");
        ViewBag.TotalCwa = _context.WorkItems.Count(w => w.Module == "CWA");

        // All users for switcher
        ViewBag.AllUsers = _context.Users.Where(u => u.IsActive).OrderBy(u => u.DisplayName).ToList();

        return View();
    }

    [HttpPost]
    public IActionResult SetUser(int id)
    {
        _currentUserService.SetCurrentUser(id);
        return RedirectToAction("Index");
    }
}
