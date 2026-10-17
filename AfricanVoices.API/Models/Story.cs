namespace AfricanVoices.API.Models;

public class Story
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string AudioFilePath { get; set; } = string.Empty;
    public string? Transcript { get; set; }
    public string? Summary { get; set; }
    public string? ContributorName { get; set; }
    public string? ContributorEmail { get; set; }
    public string? Tags { get; set; }
    public int? DurationSeconds { get; set; }
    public TranscriptionStatus TranscriptionStatus { get; set; } = TranscriptionStatus.Pending;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
}

public enum TranscriptionStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3
}
