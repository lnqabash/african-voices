using AfricanVoices.API.Configuration;
using AfricanVoices.API.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AfricanVoices.API.Services;

public class FileStorageService : IFileStorageService
{
    private readonly FileStorageSettings _settings;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<FileStorageService> _logger;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".webm" };

    private static readonly HashSet<string> AllowedMimeTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4",
            "audio/flac", "audio/aac", "audio/webm", "audio/x-wav",
            "audio/x-m4a", "video/webm"
        };

    private const long MaxFileSizeBytes = 100 * 1024 * 1024; // 100 MB

    public FileStorageService(
        IOptions<FileStorageSettings> settings,
        IWebHostEnvironment env,
        ILogger<FileStorageService> logger)
    {
        _settings = settings.Value;
        _env = env;
        _logger = logger;
    }

    public bool IsValidAudioFile(IFormFile file)
    {
        if (file.Length == 0 || file.Length > MaxFileSizeBytes)
            return false;

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
            return false;

        if (!AllowedMimeTypes.Contains(file.ContentType))
            return false;

        return true;
    }

    public async Task<string> SaveAudioFileAsync(IFormFile file, CancellationToken ct = default)
    {
        var uploadsDir = GetUploadsDirectory();
        Directory.CreateDirectory(uploadsDir);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(uploadsDir, uniqueFileName);

        await using var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await file.CopyToAsync(stream, ct);

        _logger.LogInformation("Audio file saved: {FileName}", uniqueFileName);

        // Return relative path for storage
        return Path.Combine("uploads", uniqueFileName).Replace("\\", "/");
    }

    public Task DeleteFileAsync(string filePath, CancellationToken ct = default)
    {
        var fullPath = Path.Combine(_env.ContentRootPath, filePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Deleted audio file: {FilePath}", filePath);
        }
        return Task.CompletedTask;
    }

    public string GetFileUrl(string filePath)
        => $"/{filePath.Replace("\\", "/")}";

    private string GetUploadsDirectory()
        => Path.Combine(_env.ContentRootPath, "uploads");
}
