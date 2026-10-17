namespace AfricanVoices.API.Services.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveAudioFileAsync(IFormFile file, CancellationToken ct = default);
    Task DeleteFileAsync(string filePath, CancellationToken ct = default);
    bool IsValidAudioFile(IFormFile file);
    string GetFileUrl(string filePath);
}
