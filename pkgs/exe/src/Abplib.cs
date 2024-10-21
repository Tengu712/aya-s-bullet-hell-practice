using System.Runtime.InteropServices;

namespace Abp;

public class Abplib
{
    [DllImport("abplib.dll", EntryPoint = "start")]
    public static extern bool Start();

    [DllImport("abplib.dll", EntryPoint = "end")]
    public static extern void End();

    [DllImport("abplib.dll", EntryPoint = "update")]
    public static extern bool Update();
}
