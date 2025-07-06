namespace BATS.Services.Interfaces;

public interface IAIKeywordService
{
    Task<AIKeywordExtractionResult> ExtractKeywordsFromJobDescriptionAsync(string jobDescription);
    Task<AIKeywordExtractionResult> ExtractKeywordsFromJobDescriptionAsync(string jobDescription, string? resumeText);
    Task<JobRoleAnalysisResult> AnalyzeResumeJobRoleAsync(string resumeText);
    Task<bool> IsServiceAvailableAsync();
}

public class AIKeywordExtractionResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> SuggestedKeywords { get; set; } = new();
    public List<string> RequiredSkills { get; set; } = new();
    public List<string> TechnicalSkills { get; set; } = new();
    public List<string> SoftSkills { get; set; } = new();
    public List<string> ExperienceRequirements { get; set; } = new();
    public List<string> Industries { get; set; } = new();
    public List<string> JobTitles { get; set; } = new();
    public List<string> Certifications { get; set; } = new();
    public string? JobLevel { get; set; }
    public string? JobType { get; set; }
    public int? RelevanceScore { get; set; }
    public Dictionary<string, int> KeywordFrequency { get; set; } = new();
}

public class JobRoleAnalysisResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public JobRoleAnalysis? Analysis { get; set; }
}

public class JobRoleAnalysis
{
    public string PrimaryRole { get; set; } = string.Empty;
    public List<string> SecondaryRoles { get; set; } = new();
    public string Industry { get; set; } = string.Empty;
    public string SeniorityLevel { get; set; } = string.Empty;
    public float Confidence { get; set; }
    public List<RoleConfidenceScore> RoleConfidenceScores { get; set; } = new();
    public List<string> RecommendedCategories { get; set; } = new();
    public string Reasoning { get; set; } = string.Empty;
}

public class RoleConfidenceScore
{
    public string Role { get; set; } = string.Empty;
    public float Confidence { get; set; }
    public string Reasoning { get; set; } = string.Empty;
}