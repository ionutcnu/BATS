namespace BATS.Utilities;

public static class ConsoleHelper
{
    public static void ShowMessage(string message)
        => Console.WriteLine(message);

    public static void ShowError(string error)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"Error: {error}");
        Console.ResetColor();
    }
}