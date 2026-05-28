using System.ComponentModel.DataAnnotations;

namespace FlankSpeedLegacyDemo.Web.Models;

// Used primarily by CWA module for multi-step approval workflow
public class ApprovalStep
{
    public int Id { get; set; }
    public int WorkItemId { get; set; }
    public WorkItem? WorkItem { get; set; }

    // e.g., "Supervisor Review", "Director Approval"
    [Display(Name = "Step")]
    public string StepName { get; set; } = string.Empty;

    public int StepOrder { get; set; }

    public int? ApproverUserId { get; set; }
    [Display(Name = "Approver")]
    public User? ApproverUser { get; set; }

    // "Pending", "Approved", "Rejected", "Returned"
    public string Decision { get; set; } = "Pending";

    [Display(Name = "Decision Date")]
    public DateTime? DecisionDate { get; set; }

    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
