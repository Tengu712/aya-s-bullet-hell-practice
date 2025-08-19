using System.Runtime.InteropServices;

public static class OrgeWrapper
{
	private const string LIBRARY_NAME = "liborge.dylib";

	[DllImport(LIBRARY_NAME)]
	private static extern void orgeShowDialog(uint dtype, string title, IntPtr message);

	[DllImport(LIBRARY_NAME)]
	private static extern IntPtr orgeGetErrorMessage();

	private static void ShowErrorDialog()
	{
		orgeShowDialog(0, "Error", orgeGetErrorMessage());
	}

	[DllImport(LIBRARY_NAME)]
	private static extern byte orgeInitialize();

	public static void Init()
	{
		if (orgeInitialize() == 0)
		{
			ShowErrorDialog();
			throw new ExternalException("failed to initialize orge.");
		}
	}
}
