using BATS.Models;
using BATS.Services;
using BATS.Services.Interfaces;
using BATS.Utilities;

namespace BATS;

class Program
{
    static void Main()
    {
        // Setup config
        var config = new AppConfig();

        // Instantiate services
        IFileService fileService = new FileService(config);
        IKeywordService keywordService = new KeywordService(config);
        IPdfService pdfService = new PdfService();

        try
        {
            var filePath = fileService.GenerateFilePath();
            var keywords = keywordService.GetFormattedKeywords();

            pdfService.CreatePdf(filePath, keywords);

            ConsoleHelper.ShowMessage($"PDF created successfully:\n{filePath}");
        }
        catch (Exception ex)
        {
            ConsoleHelper.ShowError(ex.Message);
        }
    }
}