namespace BATS.Services.Interfaces;

public interface IPdfService
{
    void CreatePdf(string path, string keywords);
    void ModifyPdf(string inputPath, string outputPath, string keywords);
}