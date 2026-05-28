namespace FlankSpeedLegacyDemo.Web.Models;

public class Status
{
    public int Id { get; set; }

    // e.g., "Draft", "Submitted", "Under Review", "Approved", "Rejected", "Completed", "Closed"
    public string Name { get; set; } = string.Empty;

    // "OBS", "CWA", or "Shared"
    public string Module { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
