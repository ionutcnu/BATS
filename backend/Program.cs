using BATS.Models;
using BATS.Services;
using BATS.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
DotNetEnv.Env.Load();

// Configure settings from appsettings.json and environment variables
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Override Mistral configuration with environment variables
builder.Configuration["Mistral:ApiKey"] = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? builder.Configuration["Mistral:ApiKey"];
builder.Configuration["Mistral:BaseUrl"] = Environment.GetEnvironmentVariable("GROQ_BASE_URL") ?? builder.Configuration["Mistral:BaseUrl"];
builder.Configuration["Mistral:Model"] = Environment.GetEnvironmentVariable("GROQ_MODEL") ?? builder.Configuration["Mistral:Model"];
builder.Configuration["Mistral:RequestTimeoutSeconds"] = Environment.GetEnvironmentVariable("API_REQUEST_TIMEOUT") ?? builder.Configuration["Mistral:RequestTimeoutSeconds"];
builder.Configuration["Mistral:MaxRetries"] = Environment.GetEnvironmentVariable("API_MAX_RETRIES") ?? builder.Configuration["Mistral:MaxRetries"];
builder.Configuration["Mistral:MaxKeywords"] = Environment.GetEnvironmentVariable("API_MAX_KEYWORDS") ?? builder.Configuration["Mistral:MaxKeywords"];
builder.Configuration["Mistral:EnableAIKeywordExtraction"] = Environment.GetEnvironmentVariable("ENABLE_AI_KEYWORD_EXTRACTION") ?? builder.Configuration["Mistral:EnableAIKeywordExtraction"];

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddSingleton<AppConfig>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IKeywordService, KeywordService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IATSAnalysisService, ATSAnalysisService>();
builder.Services.AddScoped<ISimpleAnalysisService, SimpleAnalysisService>();
builder.Services.AddScoped<IKeywordCategoriesService, KeywordCategoriesService>();
builder.Services.AddHttpClient<IAIKeywordService, AIKeywordService>();
builder.Services.AddScoped<IAIKeywordService, AIKeywordService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");

app.MapPost("/api/upload", async (HttpRequest request, IFileService fileService, IKeywordService keywordService, IPdfService pdfService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var file = form.Files.FirstOrDefault();

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(new { error = "No file provided" });
        }

        if (file.ContentType != "application/pdf")
        {
            return Results.BadRequest(new { error = "Only PDF files are allowed" });
        }

        if (file.Length > 10 * 1024 * 1024)
        {
            return Results.BadRequest(new { error = "File size exceeds 10MB limit" });
        }

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var inputPath = Path.Combine(Path.GetTempPath(), fileName);
        var outputPath = Path.Combine(Path.GetTempPath(), $"optimized_{fileName}");

        using (var stream = new FileStream(inputPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var keywords = keywordService.GetFormattedKeywords();
        pdfService.ModifyPdf(inputPath, outputPath, keywords);

        var optimizedFileBytes = await File.ReadAllBytesAsync(outputPath);
        var optimizedFileName = $"optimized_{file.FileName}";

        if (File.Exists(inputPath)) File.Delete(inputPath);
        if (File.Exists(outputPath)) File.Delete(outputPath);

        return Results.File(optimizedFileBytes, "application/pdf", optimizedFileName);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error processing file: {ex.Message}");
    }
});

// Analyze uploaded resume for ATS compatibility with job role detection
app.MapPost("/api/analyze", async (HttpRequest request, IATSAnalysisService atsService, IAIKeywordService aiKeywordService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var file = form.Files.FirstOrDefault();

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(new { error = "No file provided" });
        }

        if (file.ContentType != "application/pdf")
        {
            return Results.BadRequest(new { error = "Only PDF files are allowed" });
        }

        using var stream = file.OpenReadStream();
        var resumeText = await atsService.ExtractTextFromPdfAsync(stream);
        var analysis = await atsService.AnalyzeATSCompatibilityWithJobRoleAsync(resumeText, aiKeywordService);

        return Results.Ok(analysis);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error analyzing file: {ex.Message}");
    }
});

// Get all job categories
app.MapGet("/api/categories", (IKeywordCategoriesService categoriesService) =>
{
    try
    {
        var categories = categoriesService.GetAllCategories();
        return Results.Ok(categories);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting categories: {ex.Message}");
    }
});

// Search job categories
app.MapGet("/api/categories/search", (string? q, IKeywordCategoriesService categoriesService) =>
{
    try
    {
        var categories = categoriesService.SearchCategories(q ?? "");
        return Results.Ok(categories);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error searching categories: {ex.Message}");
    }
});

// Get keywords by category ID
app.MapGet("/api/categories/{id}/keywords", (string id, IKeywordCategoriesService categoriesService) =>
{
    try
    {
        if (!categoriesService.CategoryExists(id))
        {
            return Results.NotFound(new { error = "Category not found" });
        }

        var keywords = categoriesService.GetKeywordsByCategory(id);
        return Results.Ok(new { categoryId = id, keywords });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting keywords: {ex.Message}");
    }
});

// Get smart categories based on job role
app.MapGet("/api/categories/smart", (string? jobRole, float? confidence, IKeywordCategoriesService categoriesService) =>
{
    try
    {
        if (string.IsNullOrEmpty(jobRole))
        {
            return Results.BadRequest(new { error = "Job role is required" });
        }

        var categories = categoriesService.GetCategoriesForJobRole(jobRole, confidence ?? 0.0f);
        return Results.Ok(new { 
            jobRole,
            confidence = confidence ?? 0.0f,
            categories,
            message = confidence >= 0.7f ? "High confidence recommendations" : "General recommendations with fallback categories"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting smart categories: {ex.Message}");
    }
});

// Analyze job role from resume text
app.MapPost("/api/analyze-job-role", async (HttpRequest request, IAIKeywordService aiKeywordService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var resumeText = form["resumeText"].ToString();

        if (string.IsNullOrEmpty(resumeText))
        {
            return Results.BadRequest(new { error = "Resume text is required" });
        }

        var jobRoleAnalysis = await aiKeywordService.AnalyzeResumeJobRoleAsync(resumeText);

        if (!jobRoleAnalysis.Success)
        {
            return Results.BadRequest(new { error = jobRoleAnalysis.ErrorMessage ?? "Failed to analyze job role" });
        }

        return Results.Ok(jobRoleAnalysis);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error analyzing job role: {ex.Message}");
    }
});

// Get smart categories based on job role analysis
app.MapPost("/api/categories/smart-analysis", async (HttpRequest request, IAIKeywordService aiKeywordService, IKeywordCategoriesService categoriesService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var resumeText = form["resumeText"].ToString();

        if (string.IsNullOrEmpty(resumeText))
        {
            return Results.BadRequest(new { error = "Resume text is required" });
        }

        var jobRoleAnalysis = await aiKeywordService.AnalyzeResumeJobRoleAsync(resumeText);

        if (!jobRoleAnalysis.Success || jobRoleAnalysis.Analysis == null)
        {
            // Fallback to all categories if analysis fails
            var allCategories = categoriesService.GetAllCategories();
            return Results.Ok(new { 
                success = false,
                error = jobRoleAnalysis.ErrorMessage,
                categories = allCategories,
                message = "Using all categories as fallback"
            });
        }

        var smartCategories = categoriesService.GetSmartCategoriesForRole(jobRoleAnalysis.Analysis);
        
        return Results.Ok(new { 
            success = true,
            jobRoleAnalysis = jobRoleAnalysis.Analysis,
            categories = smartCategories,
            message = $"Smart categories for {jobRoleAnalysis.Analysis.PrimaryRole} ({jobRoleAnalysis.Analysis.Confidence:P0} confidence)"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting smart categories: {ex.Message}");
    }
});

// Process resume with selected keywords
app.MapPost("/api/process", async (HttpRequest request, IFileService fileService, IPdfService pdfService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var file = form.Files.GetFile("file");
        var keywordsJson = form["keywords"].ToString();
        var jobDescription = form["jobDescription"].ToString();

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(new { error = "No file provided" });
        }

        if (string.IsNullOrEmpty(keywordsJson))
        {
            return Results.BadRequest(new { error = "No keywords provided" });
        }

        var keywords = string.Join(" ", System.Text.Json.JsonSerializer.Deserialize<string[]>(keywordsJson) ?? Array.Empty<string>());

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var inputPath = Path.Combine(Path.GetTempPath(), fileName);
        var outputPath = Path.Combine(Path.GetTempPath(), $"optimized_{fileName}");

        using (var stream = new FileStream(inputPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        pdfService.ModifyPdf(inputPath, outputPath, keywords);

        var optimizedFileBytes = await File.ReadAllBytesAsync(outputPath);
        var optimizedFileName = $"optimized_{file.FileName}";

        if (File.Exists(inputPath)) File.Delete(inputPath);
        if (File.Exists(outputPath)) File.Delete(outputPath);

        return Results.File(optimizedFileBytes, "application/pdf", optimizedFileName);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error processing file: {ex.Message}");
    }
});

app.MapGet("/api/keywords", (IKeywordService keywordService) =>
{
    try
    {
        var keywords = keywordService.GetFormattedKeywords();
        return Results.Ok(new { keywords });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting keywords: {ex.Message}");
    }
});

app.MapGet("/api/health", () =>
{
    return Results.Ok(new { 
        status = "healthy", 
        timestamp = DateTime.UtcNow,
        version = "1.0.0"
    });
});

// Extract text from PDF file
app.MapPost("/api/extract-text", async (HttpRequest request, IATSAnalysisService atsService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var file = form.Files.FirstOrDefault();

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(new { error = "No file provided" });
        }

        if (file.ContentType != "application/pdf")
        {
            return Results.BadRequest(new { error = "Only PDF files are allowed" });
        }

        using var stream = file.OpenReadStream();
        var extractedText = await atsService.ExtractTextFromPdfAsync(stream);

        return Results.Ok(new { 
            extractedText = extractedText,
            wordCount = extractedText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
            characterCount = extractedText.Length
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error extracting text from PDF: {ex.Message}");
    }
});

// AI-powered keyword extraction from job description
app.MapPost("/api/extract-keywords", async (HttpRequest request, IAIKeywordService aiKeywordService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var jobDescription = form["jobDescription"].ToString();
        var resumeText = form["resumeText"].ToString();

        if (string.IsNullOrEmpty(jobDescription))
        {
            return Results.BadRequest(new { error = "Job description is required" });
        }

        AIKeywordExtractionResult result;
        
        if (!string.IsNullOrEmpty(resumeText))
        {
            result = await aiKeywordService.ExtractKeywordsFromJobDescriptionAsync(jobDescription, resumeText);
        }
        else
        {
            result = await aiKeywordService.ExtractKeywordsFromJobDescriptionAsync(jobDescription);
        }

        if (!result.Success)
        {
            return Results.BadRequest(new { error = result.ErrorMessage ?? "Failed to extract keywords" });
        }

        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error extracting keywords: {ex.Message}");
    }
});

// Check if AI service is available
app.MapGet("/api/ai/health", async (IAIKeywordService aiKeywordService) =>
{
    try
    {
        var isAvailable = await aiKeywordService.IsServiceAvailableAsync();
        return Results.Ok(new { 
            aiServiceAvailable = isAvailable,
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error checking AI service: {ex.Message}");
    }
});

// AI-powered resume analysis
app.MapPost("/api/analyze-resume", async (HttpRequest request, IAIKeywordService aiKeywordService, IATSAnalysisService atsService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var resumeText = form["resumeText"].ToString();
        var jobDescription = form["jobDescription"].ToString();

        if (string.IsNullOrEmpty(resumeText))
        {
            return Results.BadRequest(new { error = "Resume text is required" });
        }

        // Get basic ATS analysis
        var atsAnalysis = atsService.AnalyzeATSCompatibility(resumeText);

        // Get AI keyword suggestions based on resume content
        AIKeywordExtractionResult? aiSuggestions = null;
        if (!string.IsNullOrEmpty(jobDescription))
        {
            aiSuggestions = await aiKeywordService.ExtractKeywordsFromJobDescriptionAsync(jobDescription, resumeText);
        }
        else
        {
            // Analyze resume for improvement suggestions
            var resumePrompt = $"Analyze this resume and suggest improvements:\n{resumeText}";
            aiSuggestions = await aiKeywordService.ExtractKeywordsFromJobDescriptionAsync(resumePrompt);
        }

        var result = new
        {
            atsAnalysis = atsAnalysis,
            aiSuggestions = aiSuggestions?.Success == true ? aiSuggestions : null,
            aiError = aiSuggestions?.Success == false ? aiSuggestions.ErrorMessage : null,
            improvements = new
            {
                missingKeywords = aiSuggestions?.Success == true ? aiSuggestions.SuggestedKeywords : new List<string>(),
                skillsToAdd = aiSuggestions?.Success == true ? aiSuggestions.TechnicalSkills : new List<string>(),
                recommendedCertifications = aiSuggestions?.Success == true ? aiSuggestions.Certifications : new List<string>(),
                experienceGaps = aiSuggestions?.Success == true ? aiSuggestions.ExperienceRequirements : new List<string>()
            },
            timestamp = DateTime.UtcNow
        };

        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error analyzing resume: {ex.Message}");
    }
});

app.MapGet("/api/test", () =>
{
    return Results.Ok(new { 
        message = "BATS API is working!",
        timestamp = DateTime.UtcNow,
        endpoints = new[]
        {
            "/api/health",
            "/api/test", 
            "/api/analyze",
            "/api/analyze-job-role",
            "/api/categories",
            "/api/categories/search",
            "/api/categories/smart",
            "/api/categories/smart-analysis",
            "/api/categories/{id}/keywords",
            "/api/process",
            "/api/keywords",
            "/api/upload",
            "/api/extract-keywords",
            "/api/extract-text",
            "/api/ai/health",
            "/api/analyze-resume",
            "/api/simple/roles",
            "/api/simple/analyze",
            "/api/simple/keywords/{role}",
            "/api/simple/keywords/{role}/{category}",
            "/swagger"
        }
    });
});

// Simple Mode API Endpoints
// Get available roles for simple mode
app.MapGet("/api/simple/roles", (ISimpleAnalysisService simpleAnalysisService) =>
{
    try
    {
        var roles = simpleAnalysisService.GetAvailableRoles();
        return Results.Ok(new { 
            roles,
            message = "Available roles for simple mode analysis"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting available roles: {ex.Message}");
    }
});

// Analyze resume by selected role
app.MapPost("/api/simple/analyze", async (HttpRequest request, ISimpleAnalysisService simpleAnalysisService, IATSAnalysisService atsService) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Form content required" });
        }

        var form = await request.ReadFormAsync();
        var file = form.Files.FirstOrDefault();
        var selectedRole = form["selectedRole"].ToString();

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(new { error = "No file provided" });
        }

        if (string.IsNullOrEmpty(selectedRole))
        {
            return Results.BadRequest(new { error = "Selected role is required" });
        }

        // Extract text from PDF
        string extractedText;
        using (var stream = file.OpenReadStream())
        {
            extractedText = await atsService.ExtractTextFromPdfAsync(stream);
        }

        // Analyze with selected role
        var result = simpleAnalysisService.AnalyzeByRole(extractedText, selectedRole);

        return Results.Ok(new
        {
            analysis = result,
            message = $"Analysis completed for {result.RoleDisplayName} role",
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error analyzing resume: {ex.Message}");
    }
});

// Get all keywords for a specific role
app.MapGet("/api/simple/keywords/{role}", (string role, ISimpleAnalysisService simpleAnalysisService) =>
{
    try
    {
        var roleKeywords = simpleAnalysisService.GetRoleKeywords(role);
        
        if (string.IsNullOrEmpty(roleKeywords.DisplayName))
        {
            return Results.NotFound(new { error = $"Role '{role}' not found" });
        }

        return Results.Ok(new
        {
            role,
            roleInfo = new
            {
                displayName = roleKeywords.DisplayName,
                description = roleKeywords.Description
            },
            keywords = new
            {
                primary = roleKeywords.PrimaryKeywords,
                technical = roleKeywords.TechnicalKeywords,
                process = roleKeywords.ProcessKeywords,
                tools = roleKeywords.ToolsKeywords
            },
            totalKeywords = roleKeywords.PrimaryKeywords.Length + 
                           roleKeywords.TechnicalKeywords.Length + 
                           roleKeywords.ProcessKeywords.Length + 
                           roleKeywords.ToolsKeywords.Length
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting keywords for role: {ex.Message}");
    }
});

// Get keywords by category for a specific role
app.MapGet("/api/simple/keywords/{role}/{category}", (string role, string category, ISimpleAnalysisService simpleAnalysisService) =>
{
    try
    {
        var keywords = simpleAnalysisService.GetKeywordsByCategory(role, category);
        
        if (!keywords.Any())
        {
            return Results.NotFound(new { error = $"No keywords found for role '{role}' and category '{category}'" });
        }

        return Results.Ok(new
        {
            role,
            category,
            keywords,
            count = keywords.Count
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error getting keywords by category: {ex.Message}");
    }
});

app.Run();