using System.ComponentModel.DataAnnotations;

namespace FlankSpeedLegacyDemo.Web.Models;

public class User
{
    public int Id { get; set; }

    [Display(Name = "Full Name")]
    public string DisplayName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // e.g., "Admin", "Reviewer", "Submitter", "Approver"
    public string Role { get; set; } = string.Empty;

    // e.g., "Operations", "IT", "Logistics", "Compliance"
    public string Team { get; set; } = string.Empty;

    [Display(Name = "Active")]
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
