using AfricanVoices.API.Models;

namespace AfricanVoices.API.DTOs;

// ─── Request DTOs ────────────────────────────────────────────────────────────

public record CreateStoryDto(
    string Title,
    string? Description,
    string Language,
    string Region,
    string Category,
    string? ContributorName,
    string? ContributorEmail,
    string? Tags
);

public record UpdateStoryDto(
    string Title,
    string? Description,
    string Language,
    string Region,
    string Category,
    string? ContributorName,
    string? ContributorEmail,
    string? Tags
);

public record StorySearchDto(
    string? Query,
    string? Language,
    string? Category,
    string? Region,
    int Page = 1,
    int PageSize = 12
);

// ─── Response DTOs ───────────────────────────────────────────────────────────

public record StoryResponseDto(
    Guid Id,
    string Title,
    string? Description,
    string Language,
    string Region,
    string Category,
    string AudioFilePath,
    string? Transcript,
    string? Summary,
    string? ContributorName,
    string? Tags,
    int? DurationSeconds,
    string TranscriptionStatus,
    DateTime CreatedDate,
    DateTime UpdatedDate
);

public record StorySummaryDto(
    Guid Id,
    string Title,
    string Language,
    string Region,
    string Category,
    string? ContributorName,
    string? Tags,
    string TranscriptionStatus,
    DateTime CreatedDate
);

public record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record DashboardStatsDto(
    int TotalStories,
    int LanguagesRepresented,
    int RegionsRepresented,
    int StoriesThisMonth,
    IEnumerable<StorySummaryDto> RecentStories,
    IEnumerable<LanguageCountDto> StoriesByLanguage,
    IEnumerable<CategoryCountDto> StoriesByCategory
);

public record LanguageCountDto(string Language, int Count);
public record CategoryCountDto(string Category, int Count);

public record TranscriptionResultDto(
    Guid StoryId,
    bool Success,
    string? Transcript,
    string? ErrorMessage
);

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

public static class StoryMappings
{
    public static StoryResponseDto ToResponseDto(this Story story) => new(
        story.Id,
        story.Title,
        story.Description,
        story.Language,
        story.Region,
        story.Category,
        story.AudioFilePath,
        story.Transcript,
        story.Summary,
        story.ContributorName,
        story.Tags,
        story.DurationSeconds,
        story.TranscriptionStatus.ToString(),
        story.CreatedDate,
        story.UpdatedDate
    );

    public static StorySummaryDto ToSummaryDto(this Story story) => new(
        story.Id,
        story.Title,
        story.Language,
        story.Region,
        story.Category,
        story.ContributorName,
        story.Tags,
        story.TranscriptionStatus.ToString(),
        story.CreatedDate
    );
}
