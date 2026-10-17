using AfricanVoices.API.DTOs;
using AfricanVoices.API.Services.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace AfricanVoices.API.Controllers;

/// <summary>
/// Manages African oral history stories — upload, retrieve, update, delete, search, and transcribe.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class StoriesController : ControllerBase
{
    private readonly IStoryService _storyService;
    private readonly IValidator<CreateStoryDto> _createValidator;
    private readonly IValidator<UpdateStoryDto> _updateValidator;
    private readonly ILogger<StoriesController> _logger;

    public StoriesController(
        IStoryService storyService,
        IValidator<CreateStoryDto> createValidator,
        IValidator<UpdateStoryDto> updateValidator,
        ILogger<StoriesController> logger)
    {
        _storyService = storyService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _logger = logger;
    }

    /// <summary>
    /// Get all stories with pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<StorySummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var result = await _storyService.GetAllAsync(page, pageSize, ct);
        return Ok(result);
    }

    /// <summary>
    /// Search and filter stories.
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(PagedResult<StorySummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? query,
        [FromQuery] string? language,
        [FromQuery] string? category,
        [FromQuery] string? region,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken ct = default)
    {
        var dto = new StorySearchDto(query, language, category, region,
            Math.Max(1, page), Math.Clamp(pageSize, 1, 50));

        var result = await _storyService.SearchAsync(dto, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get a single story by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(StoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var story = await _storyService.GetByIdAsync(id, ct);
        return story is null ? NotFound(new { message = $"Story {id} not found." }) : Ok(story);
    }

    /// <summary>
    /// Upload a new story with audio file.
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(StoryResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(110_000_000)] // 110 MB
    public async Task<IActionResult> Create(
        [FromForm] CreateStoryDto dto,
        IFormFile audioFile,
        CancellationToken ct = default)
    {
        var validation = await _createValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage }));

        if (audioFile is null || audioFile.Length == 0)
            return BadRequest(new { message = "Audio file is required." });

        var created = await _storyService.CreateAsync(dto, audioFile, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update story metadata (not the audio file).
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(StoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateStoryDto dto,
        CancellationToken ct = default)
    {
        var validation = await _updateValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage }));

        var updated = await _storyService.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound(new { message = $"Story {id} not found." }) : Ok(updated);
    }

    /// <summary>
    /// Delete a story and its audio file.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        var deleted = await _storyService.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound(new { message = $"Story {id} not found." });
    }

    /// <summary>
    /// Trigger Azure AI Speech transcription for a story.
    /// </summary>
    [HttpPost("{id:guid}/transcribe")]
    [ProducesResponseType(typeof(TranscriptionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Transcribe(Guid id, CancellationToken ct = default)
    {
        var result = await _storyService.TranscribeAsync(id, ct);
        if (!result.Success && result.ErrorMessage == "Story not found.")
            return NotFound(new { message = result.ErrorMessage });

        return Ok(result);
    }
}
