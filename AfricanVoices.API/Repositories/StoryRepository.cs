using AfricanVoices.API.Data;
using AfricanVoices.API.DTOs;
using AfricanVoices.API.Models;
using AfricanVoices.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AfricanVoices.API.Repositories;

public class StoryRepository : IStoryRepository
{
    private readonly AfricanVoicesDbContext _context;

    public StoryRepository(AfricanVoicesDbContext context)
    {
        _context = context;
    }

    public async Task<Story?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Stories.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<PagedResult<Story>> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Stories.AsNoTracking().OrderByDescending(s => s.CreatedDate);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Story>(items, total, page, pageSize,
            (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<PagedResult<Story>> SearchAsync(StorySearchDto dto, CancellationToken ct = default)
    {
        var query = _context.Stories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(dto.Query))
        {
            var q = dto.Query.ToLower();
            query = query.Where(s =>
                s.Title.ToLower().Contains(q) ||
                (s.Transcript != null && s.Transcript.ToLower().Contains(q)) ||
                (s.Description != null && s.Description.ToLower().Contains(q)));
        }

        if (!string.IsNullOrWhiteSpace(dto.Language))
            query = query.Where(s => s.Language.ToLower() == dto.Language.ToLower());

        if (!string.IsNullOrWhiteSpace(dto.Category))
            query = query.Where(s => s.Category.ToLower() == dto.Category.ToLower());

        if (!string.IsNullOrWhiteSpace(dto.Region))
            query = query.Where(s => s.Region.ToLower() == dto.Region.ToLower());

        query = query.OrderByDescending(s => s.CreatedDate);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((dto.Page - 1) * dto.PageSize)
            .Take(dto.PageSize)
            .ToListAsync(ct);

        return new PagedResult<Story>(items, total, dto.Page, dto.PageSize,
            (int)Math.Ceiling(total / (double)dto.PageSize));
    }

    public async Task<Story> CreateAsync(Story story, CancellationToken ct = default)
    {
        _context.Stories.Add(story);
        await _context.SaveChangesAsync(ct);
        return story;
    }

    public async Task<Story> UpdateAsync(Story story, CancellationToken ct = default)
    {
        story.UpdatedDate = DateTime.UtcNow;
        _context.Stories.Update(story);
        await _context.SaveChangesAsync(ct);
        return story;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FindAsync(new object[] { id }, ct);
        if (story is not null)
        {
            _context.Stories.Remove(story);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _context.Stories.AnyAsync(s => s.Id == id, ct);

    public async Task<int> GetTotalCountAsync(CancellationToken ct = default)
        => await _context.Stories.CountAsync(ct);

    public async Task<int> GetDistinctLanguagesCountAsync(CancellationToken ct = default)
        => await _context.Stories.Select(s => s.Language).Distinct().CountAsync(ct);

    public async Task<int> GetDistinctRegionsCountAsync(CancellationToken ct = default)
        => await _context.Stories.Select(s => s.Region).Distinct().CountAsync(ct);

    public async Task<int> GetStoriesThisMonthCountAsync(CancellationToken ct = default)
    {
        var firstOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        return await _context.Stories.CountAsync(s => s.CreatedDate >= firstOfMonth, ct);
    }

    public async Task<IEnumerable<Story>> GetRecentStoriesAsync(int count, CancellationToken ct = default)
        => await _context.Stories
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedDate)
            .Take(count)
            .ToListAsync(ct);

    public async Task<IEnumerable<(string Language, int Count)>> GetStoriesByLanguageAsync(CancellationToken ct = default)
    {
        var results = await _context.Stories
            .GroupBy(s => s.Language)
            .Select(g => new { Language = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync(ct);

        return results.Select(r => (r.Language, r.Count));
    }

    public async Task<IEnumerable<(string Category, int Count)>> GetStoriesByCategoryAsync(CancellationToken ct = default)
    {
        var results = await _context.Stories
            .GroupBy(s => s.Category)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync(ct);

        return results.Select(r => (r.Category, r.Count));
    }
}
