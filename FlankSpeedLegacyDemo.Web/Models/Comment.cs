namespace FlankSpeedLegacyDemo.Web.Models;

public class Comment
{
    public int Id { get; set; }
    public int WorkItemId { get; set; }
    public WorkItem? WorkItem { get; set; }
    public int AuthorUserId { get; set; }
    public User? AuthorUser { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
