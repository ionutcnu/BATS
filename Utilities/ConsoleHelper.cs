namespace BATS.Utilities;

public static class ConsoleHelper
{
    public static int GetUserChoice()
    {
        Console.WriteLine("Select an option:");
        Console.WriteLine("1. Create a new PDF");
        Console.WriteLine("2. Modify an existing PDF");
        Console.Write("Your choice: ");
        int.TryParse(Console.ReadLine(), out int choice);
        return choice;
    }

    public static string GetExistingPdfPath()
    {
        Console.Write("Enter existing PDF path: ");
        return Console.ReadLine() ?? string.Empty;
    }

    public static void ShowMessage(string message)
        => Console.WriteLine(message);

    public static void ShowError(string error)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"Error: {error}");
        Console.ResetColor();
    }
}