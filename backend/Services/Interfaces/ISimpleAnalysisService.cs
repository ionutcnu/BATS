using BATS.Models;

namespace BATS.Services.Interfaces;

public interface ISimpleAnalysisService
{
    ATSAnalysisResult AnalyzeByRole(string extractedText, string selectedRole);
    List<RoleOption> GetAvailableRoles();
    RoleKeywords GetRoleKeywords(string roleKey);
    List<string> GetKeywordsByCategory(string roleKey, string category);
}