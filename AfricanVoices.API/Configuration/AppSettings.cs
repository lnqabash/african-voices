namespace AfricanVoices.API.Configuration;

public class AzureSpeechSettings
{
    public const string SectionName = "AzureSpeech";
    public string SubscriptionKey { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
}

public class FileStorageSettings
{
    public const string SectionName = "FileStorage";
    public string UploadsDirectory { get; set; } = "uploads";
    public long MaxFileSizeBytes { get; set; } = 104_857_600; // 100 MB
}

public class CorsSettings
{
    public const string SectionName = "Cors";
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
}
