# あたしンち学習アプリ (Atashin'chi Study App)

法学をもっと身近に！あたしンちキャラクターと一緒に民法、刑法、憲法などを楽しく学習できるWebアプリです。

## 🌟 特徴

- 📚 **包括的な法学学習**: 民法、刑法、憲法、民事訴訟法など主要法律をカバー
- 🧠 **レベル制穴埋めドリル**: 各Q&AでLv1〜3のAI生成テンプレートに挑戦し、自動採点＆学習記録に保存
- 🔍 **条文検索機能**: リアルタイムで法条文を参照
- 🎮 **スピード条文ゲーム**: ゲーム感覚で条文を覚える
- 🤖 **AI法学質問**: Gemini AIによる法学質問サポート
- 📱 **レスポンシブデザイン**: スマホ・タブレット対応

## 🧠 レベル制穴埋めドリルの遊び方

1. ケース詳細ページの **📝 Q&A** タブを開き、任意の設問カードを展開します。
2. Q&A本文の下にある `Lv1〜Lv3` バッジをクリックすると、専用の穴埋めカードが表示されます。
3. 「AIテンプレートを生成」ボタンを押すと Gemini がレベルに応じた穴埋めテンプレートを生成します。
4. 各 `[B#]` に答案を入力し「AIで採点する」を押すと、自動採点＆フィードバックが表示されます。
5. 合格するとバッジが緑色になり、`📅 今日の学習記録` とカレンダーに自動で「Q◯ レベル◯クリア」が追記されます。

> ℹ️ **Gemini APIキーが未設定の場合**、テンプレート生成／採点APIは 503 で失敗し、UIに「キー未設定」のトーストが表示されます。`GEMINI_API_KEY` を設定してから再度お試しください。

## 🚀 Render.com デプロイ手順

### 1. GitHubリポジトリの準備

```bash
# プロジェクトをGitHubにプッシュ
git init
git add .
git commit -m "Initial commit for Render.com deployment"
git remote add origin https://github.com/YOUR_USERNAME/atashinchi-study.git
git push -u origin main
```

### 2. Render.comでのデプロイ

1. [Render.com](https://render.com) にログイン
2. "New" → "Web Service" を選択
3. GitHubリポジトリ `atashinchi-study` を選択
4. 以下の設定を入力:

```
Name: Atashinchi-study
Environment: Node
Region: Singapore
Branch: main
Build Command: npm install
Start Command: npm start
```

### 3. 環境変数の設定

Render.comのダッシュボードで以下の環境変数を設定:

```
GEMINI_API_KEY=your_actual_api_key_here
NODE_ENV=production
RENDER=true
```

### 4. デプロイ完了

デプロイが完了すると、以下のURLでアクセス可能になります:
```
https://atashinchi-study.onrender.com
```

## 🛠️ ローカル開発

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルにGEMINI_API_KEYを設定

### Gemini APIキーを設定できない場合

1. [Google AI Studio](https://aistudio.google.com/) で新しい API キーを発行します。
2. `.env` もしくは Render.com の環境変数に `GEMINI_API_KEY` として貼り付けます。
3. テンプレート値 (`your_actual_api_key_here` など) のままだと、アプリは 503 エラーでキー未設定を通知します。
4. キーを更新したらサーバーを再起動してください。
5. 401エラーが続くときは、以下の診断スクリプトでキーの有効性を即時チェックできます。

```powershell
cd C:\Users\PC_User\Desktop\Atashinchi-study
node scripts/verify-gemini-key.js
```

`Status` が `INVALID_ARGUMENT` や `API_KEY_INVALID` のままの場合は、Google AI Studio で新しいキーを発行し直してください。

# 開発サーバーの起動

```bash
npm run dev
```

## 🏗️ ビルド & CI

- `npm run build` … ケース目次ファイル（`public/cases/index.js`）を生成するだけの短時間ジョブです。CI/CD (Render.comなど) ではこのコマンドを Build Command に指定してください。
- `npm run build:cases` … 上記コマンドの実体。ローカルで手動再生成したいときに直接呼び出せます。
- `npm run start` … 既に生成済みの目次ファイルを前提に Express サーバーを起動します。必要なら `npm run build:cases && npm start` のように組み合わせてください。

サーバー内の `/api/regenerate-case-index` エンドポイントも同じビルドロジックを呼び出しており、必要に応じて再生成をトリガーできます。

## 📦 プロジェクト構造

```
Atashinchi-study/
├── public/              # 静的ファイル（HTML, CSS, JS）
│   ├── modules/        # ケーススタディデータ
│   ├── data/           # キャラクター・設定データ
│   ├── pages/          # ページ別JavaScriptモジュール
│   └── index.html      # メインHTML
├── laws/               # 法律XMLファイル
├── scripts/            # ビルドスクリプト
├── server.js           # Express.jsサーバー
├── lawLoader.js        # 法律データローダー
└── package.json        # プロジェクト設定
```

## 🎮 機能一覧

### メイン機能
- **ケーススタディ**: 実践的な法的問題を解決
- **条文検索パネル**: 素早い法条文参照
- **Q&A演習**: 空欄補充機能付き問題練習
- **AI質問機能**: Gemini AIによるサポート

### ゲーム機能
- **スピード条文ゲーム**: 制限時間内での条文当てゲーム
- **ランキング機能**: 学習進捗の記録

## 🔧 技術スタック

- **フロントエンド**: Vanilla JavaScript (ES6+), Tailwind CSS
- **バックエンド**: Node.js, Express.js
- **AI**: Google Gemini API
- **データ**: XML (日本の法令データ)
- **デプロイ**: Render.com

## 🔐 認証システム

このアプリはセキュアなログイン認証を採用しており、認証されたユーザーのみがアクセス可能です。

### 基本認証
- ユーザー名とパスワードによる認証
- セッション管理（24時間有効）
- 安全なログアウト機能

### 複数ユーザー対応
環境変数で複数のユーザーアカウントを設定可能：

```bash
# メインユーザー
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password

# 追加ユーザー（オプション）
AUTH_USERS=user1:pass1,user2:pass2,user3:pass3
```

### セキュリティ機能
- セッションタイムアウト
- CSRF対策
- XSS対策
- セキュアCookie設定
- ログイン試行監視

## 📄 ライセンス

ISC License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

## 📞 サポート

問題が発生した場合は、GitHubのIssuesページでお知らせください。

---

**あたしンち学習アプリで、法学をもっと身近に、もっと楽しく！** 🎓✨
