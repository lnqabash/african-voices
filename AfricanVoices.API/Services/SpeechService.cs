using AfricanVoices.API.Configuration;
using AfricanVoices.API.Services.Interfaces;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.Extensions.Options;

namespace AfricanVoices.API.Services;

public class SpeechService : ISpeechService
{
    private readonly AzureSpeechSettings _settings;
    private readonly ILogger<SpeechService> _logger;

    public SpeechService(IOptions<AzureSpeechSettings> settings, ILogger<SpeechService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> TranscribeAudioFileAsync(
        string audioFilePath,
        string language,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.SubscriptionKey) ||
            string.IsNullOrWhiteSpace(_settings.Region))
        {
            throw new InvalidOperationException(
                "Azure Speech Service is not configured. Set AzureSpeech:SubscriptionKey and AzureSpeech:Region.");
        }

        var speechConfig = SpeechConfig.FromSubscription(_settings.SubscriptionKey, _settings.Region);

        // Map common language names to BCP-47 locale codes
        speechConfig.SpeechRecognitionLanguage = MapLanguageToLocale(language);
        speechConfig.OutputFormat = OutputFormat.Detailed;

        _logger.LogInformation("Starting transcription for file: {FilePath}, language: {Language}",
            audioFilePath, speechConfig.SpeechRecognitionLanguage);

        using var audioConfig = AudioConfig.FromWavFileInput(audioFilePath);
        using var recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        var transcriptParts = new List<string>();
        var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);

        recognizer.Recognized += (_, e) =>
        {
            if (e.Result.Reason == ResultReason.RecognizedSpeech && !string.IsNullOrWhiteSpace(e.Result.Text))
                transcriptParts.Add(e.Result.Text);
        };

        recognizer.Canceled += (_, e) =>
        {
            if (e.Reason == CancellationReason.Error)
            {
                _logger.LogError("Speech recognition canceled: {ErrorCode} - {ErrorDetails}",
                    e.ErrorCode, e.ErrorDetails);
                tcs.TrySetException(new Exception($"Speech recognition failed: {e.ErrorDetails}"));
            }
            else
            {
                tcs.TrySetResult(string.Join(" ", transcriptParts));
            }
        };

        recognizer.SessionStopped += (_, _) =>
            tcs.TrySetResult(string.Join(" ", transcriptParts));

        await recognizer.StartContinuousRecognitionAsync();

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromMinutes(30));
        cts.Token.Register(() => tcs.TrySetCanceled());

        var transcript = await tcs.Task;
        await recognizer.StopContinuousRecognitionAsync();

        _logger.LogInformation("Transcription completed. Length: {Length} chars", transcript.Length);
        return transcript;
    }

    private static string MapLanguageToLocale(string language) => language.ToLower() switch
    {
        "english" => "en-US",
        "swahili" or "kiswahili" => "sw-KE",
        "zulu" or "isizulu" => "zu-ZA",
        "xhosa" or "isixhosa" => "xh-ZA",
        "afrikaans" => "af-ZA",
        "amharic" => "am-ET",
        "hausa" => "ha-NG",
        "yoruba" => "yo-NG",
        "igbo" => "ig-NG",
        "somali" => "so-SO",
        "arabic" => "ar-EG",
        "french" => "fr-FR",
        "portuguese" => "pt-PT",
        _ => language.Contains('-') ? language : "en-US" // pass-through if already a locale code
    };
}
