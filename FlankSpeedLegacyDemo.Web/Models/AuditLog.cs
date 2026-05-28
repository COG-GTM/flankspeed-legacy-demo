namespace FlankSpeedLegacyDemo.Web.Models;

public class AuditLog
{
    public int Id { get; set; }
    public int WorkItemId { get; set; }
    public WorkItem? WorkItem { get; set; }

    // e.g., "Created", "Status Changed", "Assigned", "Comment Added"
    public string Action { get; set; } = string.Empty;

    public int PerformedByUserId { get; set; }
    public User? PerformedByUser { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
