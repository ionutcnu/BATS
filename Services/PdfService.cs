using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;
using BATS.Services.Interfaces;

namespace BATS.Services;

public class PdfService : IPdfService
{
    public void CreatePdf(string path, string keywords)
    {
        using var fs = new FileStream(path, FileMode.Create);
        var document = new Document(PageSize.A4, 50, 50, 50, 50);
        var writer = PdfWriter.GetInstance(document, fs);

        document.Open();
        AddVisibleContent(document);
        AddInvisibleKeywords(writer, keywords);
        document.Close();
    }

    private void AddVisibleContent(Document document)
    {
        var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
        document.Add(new Paragraph("Cioncu Ionut", titleFont));
        document.Add(new Paragraph("Software Engineer", titleFont));
        document.Add(Chunk.NEWLINE);
    }

    private void AddInvisibleKeywords(PdfWriter writer, string keywords)
    {
        PdfContentByte cb = writer.DirectContent;
        cb.BeginText();
        cb.SetFontAndSize(BaseFont.CreateFont(), 1f);
        cb.SetColorFill(new BaseColor(254, 254, 254));  // Subtle nearly-white text
        cb.ShowTextAligned(Element.ALIGN_LEFT, keywords, 5, 5, 0);
        cb.EndText();
    }
}