using BATS.Models;
using BATS.Services.Interfaces;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using System.Text;
using System.Text.RegularExpressions;

namespace BATS.Services;

public class ATSAnalysisService : IATSAnalysisService
{
    private readonly AppConfig _config;

    public ATSAnalysisService(AppConfig config)
    {
        _config = config;
    }

    public async Task<string> ExtractTextFromPdfAsync(Stream pdfStream)
    {
        try
        {
            var text = new StringBuilder();
            using var reader = new PdfReader(pdfStream);
            
            for (int page = 1; page <= reader.NumberOfPages; page++)
            {
                var pageText = PdfTextExtractor.GetTextFromPage(reader, page);
                text.AppendLine(pageText);
            }

            return text.ToString();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to extract text from PDF: {ex.Message}");
        }
    }

    public ATSAnalysisResult AnalyzeATSCompatibility(string resumeText)
    {
        var score = CalculateATSScore(resumeText);
        var defaultKeywords = GetDefaultKeywords();
        var foundKeywords = GetFoundKeywords(resumeText, defaultKeywords);
        var missingKeywords = GetMissingKeywords(resumeText, defaultKeywords);
        var suggestions = GetATSImprovementSuggestions(resumeText);
        var issues = DetectATSIssues(resumeText);

        return new ATSAnalysisResult
        {
            Score = score,
            FoundKeywords = foundKeywords,
            MissingKeywords = missingKeywords,
            Suggestions = suggestions,
            Issues = issues,
            AnalysisDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
        };
    }

    public ATSAnalysisResult AnalyzeATSCompatibility(string resumeText, string jobDescription)
    {
        var jobKeywords = ExtractKeywordsFromJobDescription(jobDescription);
        var allKeywords = GetDefaultKeywords().Concat(jobKeywords).Distinct().ToList();
        
        var score = CalculateATSScoreWithJob(resumeText, jobKeywords);
        var foundKeywords = GetFoundKeywords(resumeText, allKeywords);
        var missingKeywords = GetMissingKeywords(resumeText, jobKeywords);
        var suggestions = GetJobSpecificSuggestions(resumeText, jobKeywords);
        var issues = DetectATSIssues(resumeText);

        return new ATSAnalysisResult
        {
            Score = score,
            FoundKeywords = foundKeywords,
            MissingKeywords = missingKeywords,
            Suggestions = suggestions,
            Issues = issues,
            AnalysisDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
        };
    }

    public List<string> ExtractKeywordsFromJobDescription(string jobDescription)
    {
        var keywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var text = jobDescription.ToLower();

        // Technical skills patterns
        var techPatterns = new[]
        {
            @"\b(javascript|js|typescript|ts|react|angular|vue|node\.?js|python|java|c#|\.net|php|ruby|go|rust|swift|kotlin)\b",
            @"\b(html|css|scss|sass|less|bootstrap|tailwind)\b",
            @"\b(sql|mysql|postgresql|mongodb|redis|elasticsearch)\b",
            @"\b(aws|azure|gcp|docker|kubernetes|jenkins|ci\/cd|devops)\b",
            @"\b(git|github|gitlab|bitbucket|svn)\b",
            @"\b(agile|scrum|kanban|jira|confluence)\b",
            @"\b(api|rest|graphql|microservices|serverless)\b",
            @"\b(testing|unit\s+testing|integration\s+testing|e2e|selenium|cypress)\b"
        };

        foreach (var pattern in techPatterns)
        {
            var matches = Regex.Matches(text, pattern, RegexOptions.IgnoreCase);
            foreach (Match match in matches)
            {
                keywords.Add(match.Value.Trim());
            }
        }

        // Experience level
        var expPatterns = new[]
        {
            @"(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)",
            @"(junior|senior|lead|principal|staff|entry\s*level)",
            @"(bachelor|master|phd|degree)",
            @"(internship|entry\s*level|graduate)"
        };

        foreach (var pattern in expPatterns)
        {
            var matches = Regex.Matches(text, pattern, RegexOptions.IgnoreCase);
            foreach (Match match in matches)
            {
                keywords.Add(match.Value.Trim());
            }
        }

        // Soft skills
        var softSkills = new[]
        {
            "communication", "leadership", "teamwork", "problem solving", "analytical",
            "creative", "detail oriented", "self motivated", "adaptable", "collaborative"
        };

        foreach (var skill in softSkills)
        {
            if (text.Contains(skill.ToLower()))
            {
                keywords.Add(skill);
            }
        }

        return keywords.Where(k => k.Length > 2).ToList();
    }

    public ATSScore CalculateATSScore(string resumeText)
    {
        var keywordScore = CalculateKeywordScore(resumeText, GetDefaultKeywords());
        var formatScore = CalculateFormatScore(resumeText);
        var readabilityScore = CalculateReadabilityScore(resumeText);

        var overall = (keywordScore + formatScore + readabilityScore) / 3;

        return new ATSScore
        {
            Overall = overall,
            KeywordMatch = keywordScore,
            Formatting = formatScore,
            Readability = readabilityScore,
            Grade = GetGrade(overall),
            Description = GetScoreDescription(overall)
        };
    }

    public List<string> GetMissingKeywords(string resumeText, List<string> requiredKeywords)
    {
        var text = resumeText.ToLower();
        return requiredKeywords
            .Where(keyword => !text.Contains(keyword.ToLower()))
            .ToList();
    }

    public List<ATSSuggestion> GetATSImprovementSuggestions(string resumeText)
    {
        var suggestions = new List<ATSSuggestion>();
        var text = resumeText.ToLower();

        // Keyword suggestions
        var missingKeywords = GetMissingKeywords(resumeText, GetDefaultKeywords());
        if (missingKeywords.Any())
        {
            suggestions.Add(new ATSSuggestion
            {
                Type = "keywords",
                Title = "Add Missing Keywords",
                Description = $"Your resume is missing {missingKeywords.Count} important keywords that ATS systems look for.",
                Priority = "high",
                Keywords = missingKeywords.Take(10).ToList()
            });
        }

        // Format suggestions
        if (!text.Contains("experience") && !text.Contains("work history"))
        {
            suggestions.Add(new ATSSuggestion
            {
                Type = "format",
                Title = "Add Experience Section",
                Description = "ATS systems expect to find a clear 'Experience' or 'Work History' section.",
                Priority = "medium",
                Keywords = new List<string> { "Experience", "Work History", "Professional Experience" }
            });
        }

        if (!text.Contains("education") && !text.Contains("degree"))
        {
            suggestions.Add(new ATSSuggestion
            {
                Type = "format",
                Title = "Add Education Section",
                Description = "Include an 'Education' section to improve ATS compatibility.",
                Priority = "medium",
                Keywords = new List<string> { "Education", "Degree", "Certification" }
            });
        }

        if (!text.Contains("skills") && !text.Contains("technical"))
        {
            suggestions.Add(new ATSSuggestion
            {
                Type = "format",
                Title = "Add Skills Section",
                Description = "A dedicated 'Skills' section helps ATS systems identify your capabilities.",
                Priority = "low",
                Keywords = new List<string> { "Skills", "Technical Skills", "Core Competencies" }
            });
        }

        return suggestions.OrderBy(s => s.Priority).ToList();
    }

    public async Task<ATSAnalysisResult> AnalyzeATSCompatibilityWithJobRoleAsync(string resumeText, IAIKeywordService aiKeywordService)
    {
        // Get job role analysis first
        var jobRoleAnalysis = await aiKeywordService.AnalyzeResumeJobRoleAsync(resumeText);
        
        // Perform standard ATS analysis
        var score = CalculateATSScore(resumeText);
        var defaultKeywords = GetDefaultKeywords();
        var foundKeywords = GetFoundKeywords(resumeText, defaultKeywords);
        var missingKeywords = GetMissingKeywords(resumeText, defaultKeywords);
        var suggestions = GetATSImprovementSuggestions(resumeText);
        var issues = DetectATSIssues(resumeText);

        // Add job role specific suggestions if analysis was successful
        if (jobRoleAnalysis.Success && jobRoleAnalysis.Analysis != null)
        {
            var roleSpecificSuggestions = GetJobRoleSpecificSuggestions(jobRoleAnalysis.Analysis);
            suggestions.AddRange(roleSpecificSuggestions);
        }

        return new ATSAnalysisResult
        {
            Score = score,
            FoundKeywords = foundKeywords,
            MissingKeywords = missingKeywords,
            Suggestions = suggestions.OrderBy(s => s.Priority).ToList(),
            Issues = issues,
            AnalysisDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            JobRoleAnalysis = jobRoleAnalysis.Success ? jobRoleAnalysis.Analysis : null
        };
    }

    private ATSScore CalculateATSScoreWithJob(string resumeText, List<string> jobKeywords)
    {
        var keywordScore = CalculateKeywordScore(resumeText, jobKeywords);
        var formatScore = CalculateFormatScore(resumeText);
        var readabilityScore = CalculateReadabilityScore(resumeText);

        var overall = (int)((keywordScore * 0.5) + (formatScore * 0.3) + (readabilityScore * 0.2));

        return new ATSScore
        {
            Overall = overall,
            KeywordMatch = keywordScore,
            Formatting = formatScore,
            Readability = readabilityScore,
            Grade = GetGrade(overall),
            Description = GetScoreDescription(overall)
        };
    }

    private int CalculateKeywordScore(string resumeText, List<string> keywords)
    {
        if (!keywords.Any()) return 0;

        var text = resumeText.ToLower();
        var foundCount = keywords.Count(keyword => text.Contains(keyword.ToLower()));
        
        return Math.Min(100, (foundCount * 100) / keywords.Count);
    }

    private int CalculateFormatScore(string resumeText)
    {
        var score = 0;
        var text = resumeText.ToLower();

        // Check for standard sections
        if (text.Contains("experience") || text.Contains("work history")) score += 20;
        if (text.Contains("education")) score += 15;
        if (text.Contains("skills")) score += 15;
        if (text.Contains("contact") || text.Contains("email") || text.Contains("phone")) score += 10;

        // Check for dates
        if (Regex.IsMatch(text, @"\b\d{4}\b")) score += 10;

        // Check for bullet points or structure
        if (text.Contains("•") || text.Contains("-") || text.Contains("*")) score += 10;

        // Check length (not too short, not too long)
        var wordCount = text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        if (wordCount >= 200 && wordCount <= 800) score += 20;

        return Math.Min(100, score);
    }

    private int CalculateReadabilityScore(string resumeText)
    {
        var score = 100;
        var text = resumeText.ToLower();

        // Penalize very long sentences
        var sentences = text.Split('.', '!', '?');
        var avgWordsPerSentence = sentences.Average(s => s.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length);
        if (avgWordsPerSentence > 25) score -= 20;

        // Penalize excessive use of complex words
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var complexWords = words.Count(w => w.Length > 10);
        if (complexWords > words.Length * 0.1) score -= 15;

        // Check for action verbs
        var actionVerbs = new[] { "managed", "led", "developed", "created", "implemented", "achieved", "improved" };
        if (actionVerbs.Any(verb => text.Contains(verb))) score += 10;

        return Math.Max(0, Math.Min(100, score));
    }

    private string GetGrade(int score)
    {
        return score switch
        {
            >= 90 => "A+",
            >= 80 => "A",
            >= 70 => "B",
            >= 60 => "C",
            >= 50 => "D",
            _ => "F"
        };
    }

    private string GetScoreDescription(int score)
    {
        return score switch
        {
            >= 90 => "Excellent ATS compatibility! Your resume should pass most ATS filters.",
            >= 80 => "Very good ATS compatibility with minor room for improvement.",
            >= 70 => "Good ATS compatibility, but could benefit from optimization.",
            >= 60 => "Fair ATS compatibility. Consider adding more relevant keywords.",
            >= 50 => "Poor ATS compatibility. Significant improvements needed.",
            _ => "Very poor ATS compatibility. Major restructuring recommended."
        };
    }

    private List<string> GetDefaultKeywords()
    {
        return _config.Keywords.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();
    }

    private List<string> GetFoundKeywords(string resumeText, List<string> keywords)
    {
        var text = resumeText.ToLower();
        return keywords
            .Where(keyword => text.Contains(keyword.ToLower()))
            .ToList();
    }

    private List<ATSIssue> DetectATSIssues(string resumeText)
    {
        var issues = new List<ATSIssue>();
        var text = resumeText.ToLower();

        // Check for images or graphics references
        if (text.Contains("image") || text.Contains("graphic") || text.Contains("photo"))
        {
            issues.Add(new ATSIssue
            {
                Type = "format",
                Description = "Images and graphics may not be readable by ATS systems",
                Severity = "medium",
                Location = "document"
            });
        }

        // Check for unusual characters
        if (Regex.IsMatch(resumeText, @"[^\x00-\x7F]"))
        {
            issues.Add(new ATSIssue
            {
                Type = "encoding",
                Description = "Special characters may cause parsing issues",
                Severity = "low",
                Location = "text"
            });
        }

        // Check for missing contact information
        if (!Regex.IsMatch(text, @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"))
        {
            issues.Add(new ATSIssue
            {
                Type = "contact",
                Description = "No email address found",
                Severity = "high",
                Location = "header"
            });
        }

        return issues;
    }

    private List<ATSSuggestion> GetJobSpecificSuggestions(string resumeText, List<string> jobKeywords)
    {
        var suggestions = GetATSImprovementSuggestions(resumeText);
        var missingJobKeywords = GetMissingKeywords(resumeText, jobKeywords);

        if (missingJobKeywords.Any())
        {
            suggestions.Insert(0, new ATSSuggestion
            {
                Type = "job-specific",
                Title = "Add Job-Specific Keywords",
                Description = $"Your resume is missing {missingJobKeywords.Count} keywords from the job description.",
                Priority = "low",
                Keywords = missingJobKeywords.Take(15).ToList()
            });
        }

        return suggestions;
    }

    private List<ATSSuggestion> GetJobRoleSpecificSuggestions(JobRoleAnalysis roleAnalysis)
    {
        var suggestions = new List<ATSSuggestion>();

        if (roleAnalysis.Confidence >= 0.7f)
        {
            suggestions.Add(new ATSSuggestion
            {
                Type = "role-specific",
                Title = $"Optimize for {roleAnalysis.PrimaryRole} Role",
                Description = $"We detected you're a {roleAnalysis.PrimaryRole} with {roleAnalysis.Confidence:P0} confidence. Consider adding role-specific keywords.",
                Priority = "low",
                Keywords = new List<string> { roleAnalysis.PrimaryRole, roleAnalysis.SeniorityLevel, roleAnalysis.Industry }
            });
        }

        if (roleAnalysis.RecommendedCategories.Any())
        {
            suggestions.Add(new ATSSuggestion
            {
                Type = "category-recommendation",
                Title = "Focus on Relevant Keyword Categories",
                Description = $"Based on your {roleAnalysis.PrimaryRole} role, we recommend focusing on these keyword categories: {string.Join(", ", roleAnalysis.RecommendedCategories)}.",
                Priority = "low",
                Keywords = roleAnalysis.RecommendedCategories
            });
        }

        return suggestions;
    }
}