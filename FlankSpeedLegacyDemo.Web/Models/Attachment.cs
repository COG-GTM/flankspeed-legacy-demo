namespace FlankSpeedLegacyDemo.Web.Models;

// Stub/metadata only — no actual file storage
public class Attachment
{
    public int Id { get; set; }
    public int WorkItemId { get; set; }
    public WorkItem? WorkItem { get; set; }
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
