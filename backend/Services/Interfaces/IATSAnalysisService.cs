namespace BATS.Services.Interfaces;

public interface IATSAnalysisService
{
    Task<string> ExtractTextFromPdfAsync(Stream pdfStream);
    ATSAnalysisResult AnalyzeATSCompatibility(string resumeText);
    ATSAnalysisResult AnalyzeATSCompatibility(string resumeText, string jobDescription);
    List<string> ExtractKeywordsFromJobDescription(string jobDescription);
    ATSScore CalculateATSScore(string resumeText);
    List<string> GetMissingKeywords(string resumeText, List<string> requiredKeywords);
    List<ATSSuggestion> GetATSImprovementSuggestions(string resumeText);
    Task<ATSAnalysisResult> AnalyzeATSCompatibilityWithJobRoleAsync(string resumeText, IAIKeywordService aiKeywordService);
}

public class ATSAnalysisResult
{
    public required ATSScore Score { get; set; }
    public required List<string> FoundKeywords { get; set; }
    public required List<string> MissingKeywords { get; set; }
    public required List<ATSSuggestion> Suggestions { get; set; }
    public required List<ATSIssue> Issues { get; set; }
    public required string AnalysisDate { get; set; }
    public JobRoleAnalysis? JobRoleAnalysis { get; set; }
    public string? AnalysisType { get; set; }
    public string? SelectedRole { get; set; }
    public string? RoleDisplayName { get; set; }
}

public class ATSScore
{
    public int Overall { get; set; }
    public int KeywordMatch { get; set; }
    public int Formatting { get; set; }
    public int Readability { get; set; }
    public required string Grade { get; set; }
    public required string Description { get; set; }
}

public class ATSSuggestion
{
    public required string Type { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string Priority { get; set; }
    public required List<string> Keywords { get; set; }
}

public class ATSIssue
{
    public required string Type { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string Severity { get; set; }
    public required string Location { get; set; }
}