using AfricanVoices.API.DTOs;

namespace AfricanVoices.API.Services.Interfaces;

public interface IStoryService
{
    Task<StoryResponseDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<StorySummaryDto>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<PagedResult<StorySummaryDto>> SearchAsync(StorySearchDto searchDto, CancellationToken ct = default);
    Task<StoryResponseDto> CreateAsync(CreateStoryDto dto, IFormFile audioFile, CancellationToken ct = default);
    Task<StoryResponseDto?> UpdateAsync(Guid id, UpdateStoryDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<TranscriptionResultDto> TranscribeAsync(Guid id, CancellationToken ct = default);
    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default);
}
