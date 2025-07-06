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
    public ATSScore Score { get; set; }
    public List<string> FoundKeywords { get; set; }
    public List<string> MissingKeywords { get; set; }
    public List<ATSSuggestion> Suggestions { get; set; }
    public List<ATSIssue> Issues { get; set; }
    public string AnalysisDate { get; set; }
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
    public string Grade { get; set; }
    public string Description { get; set; }
}

public class ATSSuggestion
{
    public string Type { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Priority { get; set; }
    public List<string> Keywords { get; set; }
}

public class ATSIssue
{
    public string Type { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Severity { get; set; }
    public string Location { get; set; }
}