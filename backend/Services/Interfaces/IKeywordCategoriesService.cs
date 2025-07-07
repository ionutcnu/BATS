namespace BATS.Services.Interfaces;

public interface IKeywordCategoriesService
{
    List<JobCategory> GetAllCategories();
    JobCategory GetCategoryById(string categoryId);
    List<string> GetKeywordsByCategory(string categoryId);
    List<JobCategory> SearchCategories(string searchTerm);
    List<string> GetCombinedKeywords(List<string> categoryIds);
    bool CategoryExists(string categoryId);
    List<JobCategory> GetCategoriesForJobRole(string jobRole, float confidence = 0.0f);
    List<JobCategory> GetSmartCategoriesForRole(JobRoleAnalysis roleAnalysis);
    List<string> GetRecommendedCategoryIds(string primaryRole, List<string> secondaryRoles);
}

public class JobCategory
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Icon { get; set; }
    public required List<string> Keywords { get; set; }
    public required List<string> Tags { get; set; }
    public int PopularityScore { get; set; }
    public required string Color { get; set; }
}

public class CategoryKeywords
{
    public required string CategoryId { get; set; }
    public required string CategoryName { get; set; }
    public required List<string> Essential { get; set; }
    public required List<string> Preferred { get; set; }
    public required List<string> Bonus { get; set; }
}