# Build

現状、Windowsにおける開発のみを想定している。

以下を確認する：

- Vulkan SDKが使える
  - Vulkan SDKの`Include`ディレクトリまでのパスが環境変数`VULKAN_INCLUDE_PATH`に登録されている
  - Vulkan SDKの`Library`ディレクトリまでのパスが環境変数`VULKAN_LIBRARY_PATH`に登録されている
  - `glslc`コマンドとしてglslcが使える
- `py`コマンドとしてPython3が使える
- .NET Framework 8.0が使える
- zig 0.13.0が使える

次を実行してビルドする：

```
py build.py
```
