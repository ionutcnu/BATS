using BATS.Models;
using BATS.Services;
using BATS.Services.Interfaces;
using BATS.Utilities;

namespace BATS;

class Program
{
    static void Main()
    {
        var config = new AppConfig();

        IFileService fileService = new FileService(config);
        IKeywordService keywordService = new KeywordService(config);
        IPdfService pdfService = new PdfService();

        try
        {
            int choice = ConsoleHelper.GetUserChoice();
            string keywords = keywordService.GetFormattedKeywords();

            switch (choice)
            {
                case 1:
                    var newFilePath = fileService.GenerateFilePath();
                    pdfService.CreatePdf(newFilePath, keywords);
                    ConsoleHelper.ShowMessage($"✅ PDF created:\n{newFilePath}");
                    break;

                case 2:
                    var inputPath = ConsoleHelper.GetExistingPdfPath();

                    if (!File.Exists(inputPath))
                    {
                        ConsoleHelper.ShowError("The specified file doesn't exist.");
                        return;
                    }

                    string outputFilePath = Path.Combine(
                        config.PdfDirectory, 
                        $"Modified_{Path.GetFileName(inputPath)}");

                    pdfService.ModifyPdf(inputPath, outputFilePath, keywords);
                    ConsoleHelper.ShowMessage($"✅ PDF modified:\n{outputFilePath}");
                    break;

                default:
                    ConsoleHelper.ShowError("Invalid choice. Exiting...");
                    break;
            }
        }
        catch (Exception ex)
        {
            ConsoleHelper.ShowError(ex.Message);
        }
    }
}