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
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Icon { get; set; }
    public List<string> Keywords { get; set; }
    public List<string> Tags { get; set; }
    public int PopularityScore { get; set; }
    public string Color { get; set; }
}

public class CategoryKeywords
{
    public string CategoryId { get; set; }
    public string CategoryName { get; set; }
    public List<string> Essential { get; set; }
    public List<string> Preferred { get; set; }
    public List<string> Bonus { get; set; }
}