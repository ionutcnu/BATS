namespace BATS.Services.Interfaces;

public interface IPdfService
{
    void CreatePdf(string path, string keywords);
}