using FlankSpeedLegacyDemo.Web.Data;
using FlankSpeedLegacyDemo.Web.Models;

namespace FlankSpeedLegacyDemo.Web.Services;

// MIGRATION NOTE: This mocked auth would be replaced by M365/Azure AD authentication
// in both the SPFx and Power App versions
public class CurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly AppDbContext _context;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, AppDbContext context)
    {
        _httpContextAccessor = httpContextAccessor;
        _context = context;
    }

    public int GetCurrentUserId()
    {
        var session = _httpContextAccessor.HttpContext?.Session;
        var userId = session?.GetInt32("CurrentUserId");
        return userId ?? 1; // Default to first user
    }

    public User? GetCurrentUser()
    {
        return _context.Users.Find(GetCurrentUserId());
    }

    public void SetCurrentUser(int userId)
    {
        _httpContextAccessor.HttpContext?.Session.SetInt32("CurrentUserId", userId);
    }
}
