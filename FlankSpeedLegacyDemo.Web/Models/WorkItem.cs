using System.ComponentModel.DataAnnotations;

namespace FlankSpeedLegacyDemo.Web.Models;

public class WorkItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    // "OBS" or "CWA"
    public string Module { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public int StatusId { get; set; }
    public Status? Status { get; set; }

    // "Low", "Medium", "High", "Critical"
    public string Priority { get; set; } = "Medium";

    public int? AssignedToUserId { get; set; }
    [Display(Name = "Assigned To")]
    public User? AssignedToUser { get; set; }

    public int SubmittedByUserId { get; set; }
    [Display(Name = "Submitted By")]
    public User? SubmittedByUser { get; set; }

    [Display(Name = "Team Owner")]
    public string? TeamOwner { get; set; }

    [Display(Name = "Due Date")]
    [DataType(DataType.Date)]
    public DateTime? DueDate { get; set; }

    [Display(Name = "Submitted")]
    public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;

    [Display(Name = "Last Updated")]
    public DateTime LastUpdatedDate { get; set; } = DateTime.UtcNow;

    [Display(Name = "Closed")]
    public DateTime? ClosedDate { get; set; }

    // Extra fields for CWA conditional logic demo
    public string? Justification { get; set; }
    public string? BuildingNumber { get; set; }
    public string? AccessLevel { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Comment>? Comments { get; set; }
    public ICollection<Attachment>? Attachments { get; set; }
    public ICollection<AuditLog>? AuditLogs { get; set; }
    public ICollection<ApprovalStep>? ApprovalSteps { get; set; }
}
