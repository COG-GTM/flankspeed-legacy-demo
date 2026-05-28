namespace FlankSpeedLegacyDemo.Web.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // "OBS" or "CWA" to partition usage
    public string Module { get; set; } = string.Empty;

    public string? Description { get; set; }
}
