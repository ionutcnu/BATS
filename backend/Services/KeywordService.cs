using BATS.Models;
using BATS.Services.Interfaces;

namespace BATS.Services;

public class KeywordService : IKeywordService
{
    private readonly AppConfig _config;

    public KeywordService(AppConfig config)
    {
        _config = config;
    }

    public string GetFormattedKeywords()
        => _config.Keywords.Trim().Replace("  ", " ");
}