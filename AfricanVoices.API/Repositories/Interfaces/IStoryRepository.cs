using AfricanVoices.API.DTOs;
using AfricanVoices.API.Models;

namespace AfricanVoices.API.Repositories.Interfaces;

public interface IStoryRepository
{
    Task<Story?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Story>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<PagedResult<Story>> SearchAsync(StorySearchDto searchDto, CancellationToken ct = default);
    Task<Story> CreateAsync(Story story, CancellationToken ct = default);
    Task<Story> UpdateAsync(Story story, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);

    // Dashboard
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
    Task<int> GetDistinctLanguagesCountAsync(CancellationToken ct = default);
    Task<int> GetDistinctRegionsCountAsync(CancellationToken ct = default);
    Task<int> GetStoriesThisMonthCountAsync(CancellationToken ct = default);
    Task<IEnumerable<Story>> GetRecentStoriesAsync(int count, CancellationToken ct = default);
    Task<IEnumerable<(string Language, int Count)>> GetStoriesByLanguageAsync(CancellationToken ct = default);
    Task<IEnumerable<(string Category, int Count)>> GetStoriesByCategoryAsync(CancellationToken ct = default);
}
