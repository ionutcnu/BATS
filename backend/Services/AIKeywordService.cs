using System.Text;
using System.Text.Json;
using BATS.Services.Interfaces;

namespace BATS.Services;

public class AIKeywordService : IAIKeywordService
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _baseUrl;
    private readonly string _model;
    private bool? _cachedHealthStatus;
    private DateTime _lastHealthCheck = DateTime.MinValue;
    private readonly TimeSpan _healthCheckCacheExpiry = TimeSpan.FromMinutes(5);
    private bool _healthCheckInProgress = false;
    private readonly object _healthCheckLock = new object();

    public AIKeywordService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Mistral:ApiKey"];
        _baseUrl = configuration["Mistral:BaseUrl"] ?? "https://openrouter.ai/api/v1/chat/completions";
        _model = configuration["Mistral:Model"] ?? "mistralai/mistral-small-3.2-24b-instruct:free";
        
        // Configure HttpClient timeout
        var timeoutSeconds = configuration.GetValue<int>("Mistral:RequestTimeoutSeconds", 30);
        _httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
    }

    public async Task<AIKeywordExtractionResult> ExtractKeywordsFromJobDescriptionAsync(string jobDescription)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return new AIKeywordExtractionResult
            {
                Success = false,
                ErrorMessage = "Mistral API key is not configured"
            };
        }

        try
        {
            var prompt = BuildKeywordExtractionPrompt(jobDescription);
            var response = await CallMistralApiAsync(prompt);
            
            if (response.Success && !string.IsNullOrEmpty(response.Content))
            {
                return ParseKeywordResponse(response.Content);
            }
            
            return new AIKeywordExtractionResult
            {
                Success = false,
                ErrorMessage = response.ErrorMessage ?? "Failed to extract keywords"
            };
        }
        catch (Exception ex)
        {
            return new AIKeywordExtractionResult
            {
                Success = false,
                ErrorMessage = $"AI service error: {ex.Message}"
            };
        }
    }

    public async Task<AIKeywordExtractionResult> ExtractKeywordsFromJobDescriptionAsync(string jobDescription, string? resumeText)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return new AIKeywordExtractionResult
            {
                Success = false,
                ErrorMessage = "Mistral API key is not configured"
            };
        }

        try
        {
            var prompt = BuildPersonalizedKeywordExtractionPrompt(jobDescription, resumeText);
            var response = await CallMistralApiAsync(prompt);
            
            if (response.Success && !string.IsNullOrEmpty(response.Content))
            {
                return ParseKeywordResponse(response.Content);
            }
            
            return new AIKeywordExtractionResult
            {
                Success = false,
                ErrorMessage = response.ErrorMessage ?? "Failed to extract keywords"
            };
        }
        catch (Exception ex)
        {
            return new AIKeywordExtractionResult
            {
                Success = false,
                ErrorMessage = $"AI service error: {ex.Message}"
            };
        }
    }

    public async Task<JobRoleAnalysisResult> AnalyzeResumeJobRoleAsync(string resumeText)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return new JobRoleAnalysisResult
            {
                Success = false,
                ErrorMessage = "Mistral API key is not configured"
            };
        }

        try
        {
            var prompt = BuildJobRoleAnalysisPrompt(resumeText);
            var response = await CallMistralApiAsync(prompt);
            
            if (response.Success && !string.IsNullOrEmpty(response.Content))
            {
                return ParseJobRoleResponse(response.Content);
            }
            
            return new JobRoleAnalysisResult
            {
                Success = false,
                ErrorMessage = response.ErrorMessage ?? "Failed to analyze job role"
            };
        }
        catch (Exception ex)
        {
            return new JobRoleAnalysisResult
            {
                Success = false,
                ErrorMessage = $"AI service error: {ex.Message}"
            };
        }
    }

    public async Task<bool> IsServiceAvailableAsync()
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            return false;

        lock (_healthCheckLock)
        {
            // Check cache first to avoid rate limiting
            if (_cachedHealthStatus.HasValue && DateTime.UtcNow - _lastHealthCheck < _healthCheckCacheExpiry)
            {
                return _cachedHealthStatus.Value;
            }

            // If health check is already in progress, return cached value or false
            if (_healthCheckInProgress)
            {
                return _cachedHealthStatus ?? false;
            }

            _healthCheckInProgress = true;
        }

        try
        {
            // Use a minimal test prompt to reduce API usage
            var testPrompt = "Hi";
            var response = await CallMistralApiAsync(testPrompt);
            
            lock (_healthCheckLock)
            {
                // Cache the result
                _cachedHealthStatus = response.Success;
                _lastHealthCheck = DateTime.UtcNow;
                _healthCheckInProgress = false;
            }
            
            return response.Success;
        }
        catch
        {
            lock (_healthCheckLock)
            {
                // Cache failure result for shorter time to allow quicker recovery
                _cachedHealthStatus = false;
                _lastHealthCheck = DateTime.UtcNow.AddMinutes(-4); // Expire cache in 1 minute instead of 5
                _healthCheckInProgress = false;
            }
            
            return false;
        }
    }

    private string BuildKeywordExtractionPrompt(string jobDescription)
    {
        return $@"Extract keywords from this job description and return them in the required JSON format.

Job Description:
{jobDescription}

Extract:
- Technical skills and technologies
- Required skills and qualifications  
- Soft skills
- Experience requirements
- Industry terms
- Job titles
- Certifications

Return the keywords in valid JSON format.";
    }

    private string BuildPersonalizedKeywordExtractionPrompt(string jobDescription, string? resumeText)
    {
        return $@"Analyze the following job description and resume to extract optimal keywords for resume optimization. 
Compare the job requirements with the candidate's background and provide targeted recommendations.

Please provide a comprehensive analysis in the following JSON format:

{{
  ""suggestedKeywords"": [""keyword1"", ""keyword2"", ""keyword3""],
  ""requiredSkills"": [""skill1"", ""skill2"", ""skill3""],
  ""technicalSkills"": [""tech1"", ""tech2"", ""tech3""],
  ""softSkills"": [""soft1"", ""soft2"", ""soft3""],
  ""experienceRequirements"": [""exp1"", ""exp2"", ""exp3""],
  ""industries"": [""industry1"", ""industry2""],
  ""jobTitles"": [""title1"", ""title2""],
  ""certifications"": [""cert1"", ""cert2""],
  ""jobLevel"": ""Senior/Mid/Junior/Entry"",
  ""jobType"": ""Full-time/Part-time/Contract"",
  ""relevanceScore"": 85,
  ""keywordFrequency"": {{
    ""keyword1"": 5,
    ""keyword2"": 3,
    ""keyword3"": 2
  }}
}}

Focus on:
1. Keywords from job description that are missing from the resume
2. Technical skills mentioned in job but not emphasized in resume
3. Industry-specific terminology that would improve ATS matching
4. Certifications mentioned in job requirements
5. Soft skills that align with job requirements
6. Experience level indicators
7. Job titles and role variations
8. Keywords that appear frequently in job description
9. Prioritize keywords that would have the highest impact on ATS scoring

Job Description:
{jobDescription}

{(string.IsNullOrWhiteSpace(resumeText) ? "" : $@"
Current Resume Content:
{resumeText}
")}

Return only the JSON response, no additional text.";
    }

    private string BuildJobRoleAnalysisPrompt(string resumeText)
    {
        return $@"Analyze the following resume text to detect the primary job role, industry, and seniority level. 
Provide intelligent job role detection with confidence scoring and recommend relevant keyword categories.

Please provide a comprehensive analysis in the following JSON format:

{{
  ""primaryRole"": ""Software Engineer"",
  ""secondaryRoles"": [""Full Stack Developer"", ""Backend Developer""],
  ""industry"": ""Technology"",
  ""seniorityLevel"": ""Senior"",
  ""confidence"": 0.95,
  ""roleConfidenceScores"": [
    {{
      ""role"": ""Software Engineer"",
      ""confidence"": 0.95,
      ""reasoning"": ""Strong evidence of software development experience with multiple programming languages""
    }},
    {{
      ""role"": ""QA Engineer"",
      ""confidence"": 0.15,
      ""reasoning"": ""Some testing experience mentioned but not primary focus""
    }}
  ],
  ""recommendedCategories"": [""software-development"", ""qa-testing""],
  ""reasoning"": ""Based on technical skills, job titles, and experience described, this appears to be a senior software engineer with full-stack capabilities.""
}}

Analysis Guidelines:
1. **Primary Role Detection**: Identify the most likely job role based on:
   - Job titles mentioned in experience
   - Technical skills and tools used
   - Responsibilities and achievements described
   - Industry context and terminology

2. **Secondary Roles**: Identify related or alternative roles that might also fit

3. **Industry Classification**: Determine the industry sector (Technology, Finance, Healthcare, etc.)

4. **Seniority Level**: Assess experience level (Entry, Junior, Mid, Senior, Lead, Principal, Executive)

5. **Confidence Scoring**: Provide confidence scores (0.0-1.0) for role detection

6. **Category Recommendations**: Map detected roles to relevant keyword categories:
   - software-development: For developers, engineers, programmers
   - qa-testing: For QA engineers, testers, automation engineers
   - data-science: For data scientists, analysts, ML engineers
   - digital-marketing: For marketing professionals, SEO specialists
   - ux-ui-design: For designers, UX/UI professionals
   - project-management: For project managers, scrum masters
   - sales: For sales professionals, business development
   - finance-accounting: For finance, accounting professionals
   - hr-recruiting: For HR professionals, recruiters
   - cybersecurity: For security professionals, analysts

7. **Reasoning**: Provide clear explanation for the detection decisions

Resume Text:
{resumeText}

Return only the JSON response, no additional text.";
    }

    private async Task<MistralResponse> CallMistralApiAsync(string prompt)
    {
        try
        {
            var requestBody = new
            {
                model = _model,
                messages = new[]
                {
                    new
                    {
                        role = "system",
                        content = "You are a keyword extraction API. Analyze job descriptions and return structured data in JSON format. You must respond with valid JSON using this exact schema: {\"suggestedKeywords\": [\"string\"], \"requiredSkills\": [\"string\"], \"technicalSkills\": [\"string\"], \"softSkills\": [\"string\"], \"experienceRequirements\": [\"string\"], \"industries\": [\"string\"], \"jobTitles\": [\"string\"], \"certifications\": [\"string\"], \"jobLevel\": \"string\", \"jobType\": \"string\", \"relevanceScore\": 80, \"keywordFrequency\": {}}. Do not include any explanatory text."
                    },
                    new
                    {
                        role = "user",
                        content = prompt
                    }
                },
                temperature = 0.3,
                max_completion_tokens = 4000,
                top_p = 0.9,
                response_format = new { type = "json_object" }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.PostAsync(_baseUrl, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return new MistralResponse
                {
                    Success = false,
                    ErrorMessage = $"API request failed: {response.StatusCode} - {errorContent}"
                };
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var mistralResponse = JsonSerializer.Deserialize<MistralApiResponse>(responseContent);

            if (mistralResponse?.choices?.FirstOrDefault()?.message?.content != null)
            {
                return new MistralResponse
                {
                    Success = true,
                    Content = mistralResponse.choices.First().message.content
                };
            }

            return new MistralResponse
            {
                Success = false,
                ErrorMessage = "No valid response from Mistral API"
            };
        }
        catch (Exception ex)
        {
            return new MistralResponse
            {
                Success = false,
                ErrorMessage = $"Exception calling Mistral API: {ex.Message}"
            };
        }
    }

    private AIKeywordExtractionResult ParseKeywordResponse(string jsonResponse)
    {
        try
        {
            Console.WriteLine($"Raw AI Response: {jsonResponse}");
            
            // Clean the response - remove any markdown formatting
            var cleanResponse = jsonResponse.Trim();
            
            // Remove markdown code blocks
            if (cleanResponse.StartsWith("```json"))
            {
                cleanResponse = cleanResponse.Substring(7);
            }
            else if (cleanResponse.StartsWith("```"))
            {
                cleanResponse = cleanResponse.Substring(3);
            }
            
            if (cleanResponse.EndsWith("```"))
            {
                cleanResponse = cleanResponse.Substring(0, cleanResponse.Length - 3);
            }
            
            cleanResponse = cleanResponse.Trim();
            
            // Try to find JSON object within the response
            var jsonStart = cleanResponse.IndexOf('{');
            var jsonEnd = cleanResponse.LastIndexOf('}');
            
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                cleanResponse = cleanResponse.Substring(jsonStart, jsonEnd - jsonStart + 1);
            }
            
            // Validate JSON structure
            if (!cleanResponse.StartsWith("{") || !cleanResponse.EndsWith("}"))
            {
                Console.WriteLine($"Invalid JSON structure, creating fallback response");
                return CreateFallbackResponse(jsonResponse);
            }
            
            Console.WriteLine($"Cleaned Response: {cleanResponse}");

            // Try to parse the JSON
            var parsedResponse = JsonSerializer.Deserialize<AIKeywordExtractionResponse>(cleanResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            });

            if (parsedResponse == null)
            {
                // Fallback: try to extract keywords manually from text
                return ExtractKeywordsFromText(jsonResponse);
            }

            return new AIKeywordExtractionResult
            {
                Success = true,
                SuggestedKeywords = parsedResponse.SuggestedKeywords ?? new List<string>(),
                RequiredSkills = parsedResponse.RequiredSkills ?? new List<string>(),
                TechnicalSkills = parsedResponse.TechnicalSkills ?? new List<string>(),
                SoftSkills = parsedResponse.SoftSkills ?? new List<string>(),
                ExperienceRequirements = parsedResponse.ExperienceRequirements ?? new List<string>(),
                Industries = parsedResponse.Industries ?? new List<string>(),
                JobTitles = parsedResponse.JobTitles ?? new List<string>(),
                Certifications = parsedResponse.Certifications ?? new List<string>(),
                JobLevel = parsedResponse.JobLevel,
                JobType = parsedResponse.JobType,
                RelevanceScore = parsedResponse.RelevanceScore,
                KeywordFrequency = parsedResponse.KeywordFrequency ?? new Dictionary<string, int>()
            };
        }
        catch (JsonException jsonEx)
        {
            Console.WriteLine($"JSON parsing error: {jsonEx.Message}");
            Console.WriteLine($"Response that failed: {jsonResponse}");
            
            // Fallback: try to extract keywords manually from text
            return ExtractKeywordsFromText(jsonResponse);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"General parsing error: {ex.Message}");
            return new AIKeywordExtractionResult
            {
                Success = false,
                ErrorMessage = $"Error parsing AI response: {ex.Message}. Response: {jsonResponse.Substring(0, Math.Min(200, jsonResponse.Length))}..."
            };
        }
    }

    private AIKeywordExtractionResult CreateFallbackResponse(string response)
    {
        // Create a simple fallback response with basic keywords
        var basicKeywords = new List<string>
        {
            "Communication", "Leadership", "Problem Solving", "Team Work", 
            "Project Management", "Time Management", "Analytical Skills",
            "Microsoft Office", "Data Analysis", "Customer Service"
        };

        return new AIKeywordExtractionResult
        {
            Success = true,
            SuggestedKeywords = basicKeywords,
            RequiredSkills = new List<string> { "Communication", "Problem Solving" },
            TechnicalSkills = new List<string> { "Microsoft Office", "Data Analysis" },
            SoftSkills = new List<string> { "Leadership", "Team Work" },
            ExperienceRequirements = new List<string>(),
            Industries = new List<string> { "Technology" },
            JobTitles = new List<string>(),
            Certifications = new List<string>(),
            JobLevel = "Mid",
            JobType = "Full-time",
            RelevanceScore = 0.6f,
            KeywordFrequency = new Dictionary<string, int>()
        };
    }

    private AIKeywordExtractionResult ExtractKeywordsFromText(string response)
    {
        return CreateFallbackResponse(response);
    }

    private JobRoleAnalysisResult ParseJobRoleResponse(string jsonResponse)
    {
        try
        {
            // Clean the response - remove any markdown formatting
            var cleanResponse = jsonResponse.Trim();
            if (cleanResponse.StartsWith("```json"))
            {
                cleanResponse = cleanResponse.Substring(7);
            }
            if (cleanResponse.EndsWith("```"))
            {
                cleanResponse = cleanResponse.Substring(0, cleanResponse.Length - 3);
            }
            cleanResponse = cleanResponse.Trim();

            var parsedResponse = JsonSerializer.Deserialize<JobRoleAnalysisResponse>(cleanResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (parsedResponse == null)
            {
                return new JobRoleAnalysisResult
                {
                    Success = false,
                    ErrorMessage = "Failed to parse job role analysis response"
                };
            }

            return new JobRoleAnalysisResult
            {
                Success = true,
                Analysis = new JobRoleAnalysis
                {
                    PrimaryRole = parsedResponse.PrimaryRole ?? "Unknown",
                    SecondaryRoles = parsedResponse.SecondaryRoles ?? new List<string>(),
                    Industry = parsedResponse.Industry ?? "Unknown",
                    SeniorityLevel = parsedResponse.SeniorityLevel ?? "Unknown",
                    Confidence = parsedResponse.Confidence ?? 0.0f,
                    RoleConfidenceScores = parsedResponse.RoleConfidenceScores?.Select(r => new RoleConfidenceScore
                    {
                        Role = r.Role ?? "Unknown",
                        Confidence = r.Confidence ?? 0.0f,
                        Reasoning = r.Reasoning ?? ""
                    }).ToList() ?? new List<RoleConfidenceScore>(),
                    RecommendedCategories = parsedResponse.RecommendedCategories ?? new List<string>(),
                    Reasoning = parsedResponse.Reasoning ?? ""
                }
            };
        }
        catch (Exception ex)
        {
            return new JobRoleAnalysisResult
            {
                Success = false,
                ErrorMessage = $"Error parsing job role analysis response: {ex.Message}"
            };
        }
    }

    private class MistralResponse
    {
        public bool Success { get; set; }
        public string? Content { get; set; }
        public string? ErrorMessage { get; set; }
    }

    private class MistralApiResponse
    {
        public MistralChoice[]? choices { get; set; }
    }

    private class MistralChoice
    {
        public MistralMessage? message { get; set; }
    }

    private class MistralMessage
    {
        public string? content { get; set; }
    }

    private class AIKeywordExtractionResponse
    {
        public List<string>? SuggestedKeywords { get; set; }
        public List<string>? RequiredSkills { get; set; }
        public List<string>? TechnicalSkills { get; set; }
        public List<string>? SoftSkills { get; set; }
        public List<string>? ExperienceRequirements { get; set; }
        public List<string>? Industries { get; set; }
        public List<string>? JobTitles { get; set; }
        public List<string>? Certifications { get; set; }
        public string? JobLevel { get; set; }
        public string? JobType { get; set; }
        public int? RelevanceScore { get; set; }
        public Dictionary<string, int>? KeywordFrequency { get; set; }
    }

    private class JobRoleAnalysisResponse
    {
        public string? PrimaryRole { get; set; }
        public List<string>? SecondaryRoles { get; set; }
        public string? Industry { get; set; }
        public string? SeniorityLevel { get; set; }
        public float? Confidence { get; set; }
        public List<RoleConfidenceScoreResponse>? RoleConfidenceScores { get; set; }
        public List<string>? RecommendedCategories { get; set; }
        public string? Reasoning { get; set; }
    }

    private class RoleConfidenceScoreResponse
    {
        public string? Role { get; set; }
        public float? Confidence { get; set; }
        public string? Reasoning { get; set; }
    }
}