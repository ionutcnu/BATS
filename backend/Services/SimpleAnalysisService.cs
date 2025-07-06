using BATS.Models;
using BATS.Services.Interfaces;
using System.Text.RegularExpressions;

namespace BATS.Services;

public class SimpleAnalysisService : ISimpleAnalysisService
{
    private readonly AppConfig _config;

    public SimpleAnalysisService(AppConfig config)
    {
        _config = config;
    }

    public ATSAnalysisResult AnalyzeByRole(string extractedText, string selectedRole)
    {
        if (!_config.RoleKeywords.ContainsKey(selectedRole))
        {
            throw new ArgumentException($"Role '{selectedRole}' not found in configuration");
        }

        var roleKeywords = _config.RoleKeywords[selectedRole];
        var allKeywords = GetAllKeywordsForRole(selectedRole);
        
        var foundKeywords = FindKeywordsInText(extractedText, allKeywords);
        var missingKeywords = allKeywords.Except(foundKeywords, StringComparer.OrdinalIgnoreCase).ToList();
        
        var score = CalculateATSScore(foundKeywords, allKeywords, extractedText);
        var suggestions = GetRoleSpecificSuggestions(selectedRole, missingKeywords);
        var issues = DetectBasicATSIssues(extractedText);

        return new ATSAnalysisResult
        {
            Score = score,
            FoundKeywords = foundKeywords,
            MissingKeywords = missingKeywords,
            Suggestions = suggestions,
            Issues = issues,
            AnalysisDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            AnalysisType = "role-based",
            SelectedRole = selectedRole,
            RoleDisplayName = roleKeywords.DisplayName
        };
    }

    public List<RoleOption> GetAvailableRoles()
    {
        return _config.GetAvailableRoles();
    }

    public RoleKeywords GetRoleKeywords(string roleKey)
    {
        return _config.RoleKeywords.ContainsKey(roleKey) 
            ? _config.RoleKeywords[roleKey] 
            : new RoleKeywords();
    }

    public List<string> GetKeywordsByCategory(string roleKey, string category)
    {
        if (!_config.RoleKeywords.ContainsKey(roleKey))
            return new List<string>();

        var roleKeywords = _config.RoleKeywords[roleKey];
        
        return category.ToLower() switch
        {
            "primary" => roleKeywords.PrimaryKeywords.ToList(),
            "technical" => roleKeywords.TechnicalKeywords.ToList(),
            "process" => roleKeywords.ProcessKeywords.ToList(),
            "tools" => roleKeywords.ToolsKeywords.ToList(),
            _ => new List<string>()
        };
    }

    private List<string> GetAllKeywordsForRole(string roleKey)
    {
        return _config.GetAllKeywordsForRole(roleKey);
    }

    private List<string> FindKeywordsInText(string text, List<string> keywords)
    {
        var foundKeywords = new List<string>();
        var lowercaseText = text.ToLowerInvariant();

        foreach (var keyword in keywords)
        {
            var pattern = $@"\b{Regex.Escape(keyword.ToLowerInvariant())}\b";
            if (Regex.IsMatch(lowercaseText, pattern, RegexOptions.IgnoreCase))
            {
                foundKeywords.Add(keyword);
            }
        }

        return foundKeywords.Distinct().ToList();
    }

    private ATSScore CalculateATSScore(List<string> foundKeywords, List<string> allKeywords, string text)
    {
        var keywordMatchPercentage = allKeywords.Count > 0 
            ? (foundKeywords.Count * 100) / allKeywords.Count 
            : 0;

        var formattingScore = CalculateFormattingScore(text);
        var readabilityScore = CalculateReadabilityScore(text);

        var overallScore = (keywordMatchPercentage * 0.6) + (formattingScore * 0.2) + (readabilityScore * 0.2);

        return new ATSScore
        {
            Overall = (int)Math.Round(overallScore),
            KeywordMatch = keywordMatchPercentage,
            Formatting = formattingScore,
            Readability = readabilityScore,
            Grade = GetGradeFromScore((int)Math.Round(overallScore)),
            Description = GetScoreDescription((int)Math.Round(overallScore))
        };
    }

    private int CalculateFormattingScore(string text)
    {
        var score = 100;
        
        // Penalize for common ATS-unfriendly elements
        if (text.Contains("│") || text.Contains("└") || text.Contains("├"))
            score -= 15; // Tables or special characters

        if (text.Length < 500)
            score -= 10; // Too short

        if (text.Length > 5000)
            score -= 5; // Too long

        // Check for section headers
        var commonSections = new[] { "experience", "education", "skills", "summary", "profile" };
        var sectionCount = commonSections.Count(section => 
            text.ToLowerInvariant().Contains(section));
        
        if (sectionCount < 2)
            score -= 10;

        return Math.Max(score, 0);
    }

    private int CalculateReadabilityScore(string text)
    {
        var score = 100;
        
        var words = text.Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries);
        var sentences = text.Split(new[] { '.', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
        
        if (words.Length == 0 || sentences.Length == 0)
            return 0;

        var avgWordsPerSentence = (double)words.Length / sentences.Length;
        
        // Penalize for very long or very short sentences
        if (avgWordsPerSentence > 25)
            score -= 10;
        else if (avgWordsPerSentence < 8)
            score -= 5;

        // Check for bullet points (good for readability)
        var bulletPoints = Regex.Matches(text, @"^[\s]*[•\-\*]", RegexOptions.Multiline).Count;
        if (bulletPoints > 5)
            score += 5;

        return Math.Max(score, 0);
    }

    private string GetGradeFromScore(int score)
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
            >= 90 => "Excellent ATS compatibility with strong keyword presence",
            >= 80 => "Very good ATS compatibility with most keywords present",
            >= 70 => "Good ATS compatibility with room for keyword improvement",
            >= 60 => "Fair ATS compatibility - consider adding more relevant keywords",
            >= 50 => "Poor ATS compatibility - significant keyword gaps identified",
            _ => "Very poor ATS compatibility - major improvements needed"
        };
    }

    private List<ATSSuggestion> GetRoleSpecificSuggestions(string roleKey, List<string> missingKeywords)
    {
        var suggestions = new List<ATSSuggestion>();

        if (missingKeywords.Count > 0)
        {
            var roleKeywords = _config.RoleKeywords[roleKey];
            var topMissingKeywords = missingKeywords.Take(10).ToList();
            
            suggestions.Add(new ATSSuggestion
            {
                Type = "keywords",
                Title = $"Add Missing {roleKeywords.DisplayName} Keywords",
                Description = $"Your resume is missing {missingKeywords.Count} relevant keywords for {roleKeywords.DisplayName} roles. Consider adding: {string.Join(", ", topMissingKeywords.Take(5))}",
                Priority = "high",
                Keywords = topMissingKeywords
            });
        }

        suggestions.Add(new ATSSuggestion
        {
            Type = "optimization",
            Title = "Optimize Your Resume",
            Description = "Use our optimization feature to automatically add missing keywords while preserving your resume's format.",
            Priority = "medium",
            Keywords = new List<string>()
        });

        return suggestions;
    }

    private List<ATSIssue> DetectBasicATSIssues(string text)
    {
        var issues = new List<ATSIssue>();

        // Check for common ATS issues
        if (text.Contains("│") || text.Contains("└") || text.Contains("├"))
        {
            issues.Add(new ATSIssue
            {
                Type = "formatting",
                Title = "Special Characters Detected",
                Description = "Your resume contains special characters that may not be ATS-friendly.",
                Severity = "medium"
            });
        }

        if (text.Length < 500)
        {
            issues.Add(new ATSIssue
            {
                Type = "content",
                Title = "Resume Too Short",
                Description = "Your resume appears to be quite short. Consider adding more details about your experience and skills.",
                Severity = "medium"
            });
        }

        var emailCount = Regex.Matches(text, @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b").Count;
        if (emailCount == 0)
        {
            issues.Add(new ATSIssue
            {
                Type = "contact",
                Title = "No Email Address Found",
                Description = "Make sure your email address is clearly visible on your resume.",
                Severity = "high"
            });
        }

        return issues;
    }
}