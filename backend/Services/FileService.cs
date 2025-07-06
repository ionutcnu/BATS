using System.IO;
using BATS.Models;
using BATS.Services.Interfaces;

namespace BATS.Services;

public class FileService : IFileService
{
    private readonly AppConfig _config;

    public FileService(AppConfig config)
    {
        _config = config;
        Directory.CreateDirectory(_config.PdfDirectory);
    }

    public string GenerateFilePath()
    {
        var baseKeyword = _config.Keywords.Split(' ')[0];
        int counter = 1;
        string path;

        do
        {
            path = Path.Combine(_config.PdfDirectory, $"{baseKeyword}_{counter}.pdf");
            counter++;
        }
        while (File.Exists(path));

        return path;
    }
}