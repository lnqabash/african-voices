using AfricanVoices.API.DTOs;
using AfricanVoices.API.Models;
using AfricanVoices.API.Repositories.Interfaces;
using AfricanVoices.API.Services.Interfaces;

namespace AfricanVoices.API.Services;

public class StoryService : IStoryService
{
    private readonly IStoryRepository _repo;
    private readonly IFileStorageService _fileStorage;
    private readonly ISpeechService _speechService;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<StoryService> _logger;

    public StoryService(
        IStoryRepository repo,
        IFileStorageService fileStorage,
        ISpeechService speechService,
        IWebHostEnvironment env,
        ILogger<StoryService> logger)
    {
        _repo = repo;
        _fileStorage = fileStorage;
        _speechService = speechService;
        _env = env;
        _logger = logger;
    }

    public async Task<StoryResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var story = await _repo.GetByIdAsync(id, ct);
        return story?.ToResponseDto();
    }

    public async Task<PagedResult<StorySummaryDto>> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var result = await _repo.GetAllAsync(page, pageSize, ct);
        return new PagedResult<StorySummaryDto>(
            result.Items.Select(s => s.ToSummaryDto()),
            result.TotalCount,
            result.Page,
            result.PageSize,
            result.TotalPages);
    }

    public async Task<PagedResult<StorySummaryDto>> SearchAsync(StorySearchDto searchDto, CancellationToken ct = default)
    {
        var result = await _repo.SearchAsync(searchDto, ct);
        return new PagedResult<StorySummaryDto>(
            result.Items.Select(s => s.ToSummaryDto()),
            result.TotalCount,
            result.Page,
            result.PageSize,
            result.TotalPages);
    }

    public async Task<StoryResponseDto> CreateAsync(CreateStoryDto dto, IFormFile audioFile, CancellationToken ct = default)
    {
        if (!_fileStorage.IsValidAudioFile(audioFile))
            throw new ArgumentException("Invalid audio file. Accepted formats: MP3, WAV, OGG, M4A, FLAC, AAC. Max size: 100 MB.");

        var audioFilePath = await _fileStorage.SaveAudioFileAsync(audioFile, ct);

        var story = new Story
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Language = dto.Language.Trim(),
            Region = dto.Region.Trim(),
            Category = dto.Category.Trim(),
            AudioFilePath = audioFilePath,
            ContributorName = dto.ContributorName?.Trim(),
            ContributorEmail = dto.ContributorEmail?.Trim(),
            Tags = dto.Tags?.Trim(),
            TranscriptionStatus = TranscriptionStatus.Pending
        };

        var created = await _repo.CreateAsync(story, ct);
        _logger.LogInformation("Created story {Id}: {Title}", created.Id, created.Title);

        return created.ToResponseDto();
    }

    public async Task<StoryResponseDto?> UpdateAsync(Guid id, UpdateStoryDto dto, CancellationToken ct = default)
    {
        var story = await _repo.GetByIdAsync(id, ct);
        if (story is null) return null;

        // EF tracks by re-attaching the fetched entity
        story.Title = dto.Title.Trim();
        story.Description = dto.Description?.Trim();
        story.Language = dto.Language.Trim();
        story.Region = dto.Region.Trim();
        story.Category = dto.Category.Trim();
        story.ContributorName = dto.ContributorName?.Trim();
        story.ContributorEmail = dto.ContributorEmail?.Trim();
        story.Tags = dto.Tags?.Trim();

        var updated = await _repo.UpdateAsync(story, ct);
        return updated.ToResponseDto();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var story = await _repo.GetByIdAsync(id, ct);
        if (story is null) return false;

        // Clean up audio file
        await _fileStorage.DeleteFileAsync(story.AudioFilePath, ct);
        await _repo.DeleteAsync(id, ct);

        _logger.LogInformation("Deleted story {Id}", id);
        return true;
    }

    public async Task<TranscriptionResultDto> TranscribeAsync(Guid id, CancellationToken ct = default)
    {
        var story = await _repo.GetByIdAsync(id, ct);
        if (story is null)
            return new TranscriptionResultDto(id, false, null, "Story not found.");

        // Resolve full file path
        var fullAudioPath = Path.Combine(_env.ContentRootPath, story.AudioFilePath);
        if (!File.Exists(fullAudioPath))
            return new TranscriptionResultDto(id, false, null, "Audio file not found on disk.");

        story.TranscriptionStatus = TranscriptionStatus.Processing;
        await _repo.UpdateAsync(story, ct);

        try
        {
            var transcript = await _speechService.TranscribeAudioFileAsync(
                fullAudioPath, story.Language, ct);

            story.Transcript = transcript;
            story.TranscriptionStatus = TranscriptionStatus.Completed;
            await _repo.UpdateAsync(story, ct);

            _logger.LogInformation("Transcription completed for story {Id}", id);
            return new TranscriptionResultDto(id, true, transcript, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transcription failed for story {Id}", id);

            story.TranscriptionStatus = TranscriptionStatus.Failed;
            await _repo.UpdateAsync(story, ct);

            return new TranscriptionResultDto(id, false, null, ex.Message);
        }
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var total = await _repo.GetTotalCountAsync(ct);
        var languages = await _repo.GetDistinctLanguagesCountAsync(ct);
        var regions = await _repo.GetDistinctRegionsCountAsync(ct);
        var thisMonth = await _repo.GetStoriesThisMonthCountAsync(ct);
        var recent = await _repo.GetRecentStoriesAsync(6, ct);
        var byLanguage = await _repo.GetStoriesByLanguageAsync(ct);
        var byCategory = await _repo.GetStoriesByCategoryAsync(ct);

        return new DashboardStatsDto(
            total,
            languages,
            regions,
            thisMonth,
            recent.Select(s => s.ToSummaryDto()),
            byLanguage.Select(x => new LanguageCountDto(x.Language, x.Count)),
            byCategory.Select(x => new CategoryCountDto(x.Category, x.Count)));
    }
}
