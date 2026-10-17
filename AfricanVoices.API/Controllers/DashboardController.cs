using AfricanVoices.API.DTOs;
using AfricanVoices.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AfricanVoices.API.Controllers;

/// <summary>
/// Provides aggregate statistics for the African Voices dashboard.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly IStoryService _storyService;

    public DashboardController(IStoryService storyService)
    {
        _storyService = storyService;
    }

    /// <summary>
    /// Get platform statistics: total stories, languages, regions, and recent uploads.
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(CancellationToken ct = default)
    {
        var stats = await _storyService.GetDashboardStatsAsync(ct);
        return Ok(stats);
    }
}
