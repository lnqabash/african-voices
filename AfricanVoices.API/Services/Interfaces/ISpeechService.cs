namespace AfricanVoices.API.Services.Interfaces;

public interface ISpeechService
{
    /// <summary>
    /// Transcribes an audio file using Azure AI Speech Service.
    /// Returns the transcript text, or throws on failure.
    /// </summary>
    Task<string> TranscribeAudioFileAsync(string audioFilePath, string language, CancellationToken ct = default);
}
