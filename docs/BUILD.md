# Build

現状、Windowsにおける開発のみを想定している。

以下の手順でビルドする：

1. zig 0.13.0をインストール
2. Vulkan SDKをインストール
3. 環境変数`VULKAN_INCLUDE_PATH`にVulkan SDKの`Include`ディレクトリまでのパスを登録
4. 環境変数`VULKAN_LIBRARY_PATH`にVulkan SDKの`Lib`ディレクトリまでのパスを登録
5. `zig build`を実行
