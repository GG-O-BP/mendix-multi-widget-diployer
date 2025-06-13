# Mendix Multi Widget Deployer
![Mendix Multi Widget Deployer](https://via.placeholder.com/150x150?text=Widget+Deployer)

Mendix マルチウィジェット配置ツール - 複数のMendixウィジェットを一度にビルドして配置できるデスクトップアプリケーションです。

Mendix開発者が複数のウィジェットを効率的に管理・配置できるように設計されたTauriベースのデスクトップアプリケーションです。

## 他の言語で見る
[**日本語**](./README.jp.md), [한국어](./README.md), [English](./README.en.md)

# 主な機能
- ✅ 複数のMendixウィジェットを同時にビルド
- ✅ 自動.mpkファイル配置
- ✅ ウィジェットパス及び設定管理
- ✅ 直感的なGUIインターフェース
- ✅ ビルド状態のリアルタイム監視
- ✅ 韓国語テキストエンコーディング対応（EUC-KR、CP949）
- ✅ PowerShellベースのビルド実行
- ✅ ウィジェット別選択的ビルド対応

# リリース実行（一般ユーザー）
[最新リリース](https://github.com/your-username/mendix-multi-widget-deployer/releases/latest)から実行ファイルをダウンロードしてインストールできます。

## システム要件
- Windows 10以上（PowerShell 5.1以上）
- Node.js 16以上
- pnpmパッケージマネージャー
- Mendixウィジェット開発環境

## インストール方法
1. [リリースページ](https://github.com/your-username/mendix-multi-widget-deployer/releases/latest)から最新バージョンをダウンロード
2. `.msi`ファイルを実行してインストール
3. プログラム実行後にウィジェットパスを設定

# ソースコードをビルドして実行（開発者）

## 開発環境設定
```bash
# リポジトリをクローン
git clone https://github.com/your-username/mendix-multi-widget-deployer.git
cd mendix-multi-widget-deployer

# 依存関係をインストール
pnpm install

# Tauri CLIをインストール（グローバル）
cargo install tauri-cli --version "^2.0"
```

## 開発モード実行
```bash
# 開発サーバー開始
pnpm tauri dev
```

## プロダクションビルド
```bash
# プロダクションビルド
pnpm tauri build
```

# 使用方法

## 1. 基本設定
- **Base Path**: Mendixウィジェットが配置されている基本パスを設定（packagesフォルダがある上位ディレクトリ）
- **Destination Path**: ビルドされた.mpkファイルがコピーされる対象パスを設定

## 2. ウィジェット管理
- **ウィジェット追加**: "Add Widget"ボタンで新しいウィジェットを追加
- **ウィジェット編集**: 既存ウィジェットの名前やパスを修正
- **ウィジェット削除**: 不要なウィジェットを削除
- **ウィジェット選択**: ビルドするウィジェットを選択/解除

## 3. ビルド及び配置
- 選択されたウィジェットに対して"Build Selected Widgets"ボタンをクリック
- 各ウィジェット別に`pnpm run build`コマンドを実行
- 生成された.mpkファイルを自動的に対象パスにコピー

# 技術スタック
- **Frontend**: React 18, Vite
- **Backend**: Rust (Tauri 2.0)
- **UI Framework**: CSS3（カスタムスタイル）
- **Build System**: pnpm, Cargo
- **Shell Integration**: PowerShell (Windows)

# プロジェクト構造
```
mendix-multi-widget-deployer/
├── src/                    # Reactフロントエンド
│   ├── App.jsx            # メインアプリケーションコンポーネント
│   ├── App.css            # スタイルシート
│   └── main.jsx           # Reactエントリーポイント
├── src-tauri/             # Tauriバックエンド
│   ├── src/
│   │   ├── lib.rs         # メインRustロジック
│   │   └── main.rs        # Tauriエントリーポイント
│   ├── Cargo.toml         # Rust依存関係
│   └── tauri.conf.json    # Tauri設定
├── public/                # 静的ファイル
├── dist/                  # ビルド出力
└── package.json           # Node.js依存関係
```

# 主要機能実装状況
- [x] ウィジェットリスト管理（追加、修正、削除）
- [x] 選択的ウィジェットビルド
- [x] 自動.mpkファイル配置
- [x] 設定保存及び読み込み
- [x] ビルド状態監視
- [x] 韓国語エンコーディング対応
- [x] PowerShellベースのビルド実行
- [x] エラー処理及びユーザーフィードバック
- [ ] ビルドログ詳細表示
- [ ] ウィジェットテンプレート対応
- [ ] バッチ作業スケジューリング
- [ ] 日本語エンコーディング対応

# トラブルシューティング

## 一般的な問題
1. **ビルド失敗**: Node.jsとpnpmが正しくインストールされているか確認
2. **パスエラー**: Base Pathが正しいMendixプロジェクト構造を指しているか確認
3. **権限問題**: PowerShell実行ポリシーを確認（`Get-ExecutionPolicy`）
4. **エンコーディング問題**: 日本語Windows環境で自動的に処理されます

## ログ確認
アプリケーションログは以下の場所に保存されます：
- Windows: `%APPDATA%\com.sbt-global.mendix-multi-widget-diployer\`

# 貢献方法
1. イシューを登録または既存イシューを確認
2. 開発ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some AmazingFeature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. Pull Requestを作成

# License
このプログラムは[Mozilla Public License 2.0](/LICENSE)に従います。

Copyright © 2025 SBT Global. All rights reserved.

---

**Mendix Multi Widget Deployer**はMendix開発者の生産性向上のために開発されました。
お問い合わせやバグレポートは[Issues](https://github.com/your-username/mendix-multi-widget-deployer/issues)に登録してください。
