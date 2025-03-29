namespace BATS;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;

class Program
{
    public static void Main()
    {
        PdfGenerator.CreatePdf("output.pdf");
    }
}

public class PdfGenerator
{
    public static void CreatePdf(string filePath)
    {
        using(FileStream fs = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            Document document = new Document();
            PdfWriter writer = PdfWriter.GetInstance(document, fs);
            document.Open();
            document.Add(new Paragraph("John Doe\nSoftware Engineer"));
            PdfContentByte cb = writer.DirectContent;
            BaseFont bf = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            cb.BeginText();
            cb.SetFontAndSize(bf, 12);
            cb.SetColorFill(BaseColor.WHITE);
            cb.ShowTextAligned(Element.ALIGN_LEFT, "Keyword1 Keyword2 Keyword3", 10, 10, 0);
            cb.EndText();
            document.Close();
        }
    }
}