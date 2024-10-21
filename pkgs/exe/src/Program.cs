namespace Abp;

public class Program
{
    public static void Main(string[] args)
    {
        if (!Abplib.Start())
        {
            return;
        }
        while (true)
        {
            if (!Abplib.Update())
            {
                break;
            }
        }
        Abplib.End();
    }
}
