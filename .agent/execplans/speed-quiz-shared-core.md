# ホーム＆ケース共通スピード条文コア再構築

このExecPlanはPLANS.mdの要件に従って維持する。進捗・判断・発見は作業とともに更新する。

## Purpose / Big Picture

ホームページとケース詳細画面のスピード条文ゲームを単一のUI/ロジックに統合し、どちらかを変更すればもう一方も自動的に反映されるようにする。利用者はホームからもケースからも同じ操作感でクイズを遊べ、進行状況や結果記録も一貫する。成果はホームのスピード条文セクションとケースの「スピード条文タブ」が同じコンポーネントを示し、片方だけを修正しても機能が崩れないことで確認する。

## Progress

- [ ] (2024-02-14 00:00Z) 既存実装の把握と共有インターフェース設計。
- [ ] (2024-02-14 00:00Z) 共通コアモジュール作成とAPI整備。
- [ ] (2024-02-14 00:00Z) ホームページを新コアに切り替え。
- [ ] (2024-02-14 00:00Z) ケースページを新コアに切り替え。
- [ ] (2024-02-14 00:00Z) テスト・検証・ドキュメント更新。

## Surprises & Discoveries

- (未記入)

## Decision Log

- (未記入)

## Outcomes & Retrospective

- (未記入)

## Context and Orientation

`public/speedQuiz.js` はケースページ専用に設計されたモジュールで、ゲームUIの生成、条文抽出、タイマー、回答処理を単一ファイルで行う。`public/speedQuizMain.js` はホームページ専用で、回答済みデータに基づく統計・フィルターUIやリストを含む別実装になっている。`public/pages/homePage.js` では `initializeSpeedQuizMainSection` を介してホーム用セクションを描画し、`public/pages/casePage.js` は `speedQuiz.js` を直接インポートしてケース固有の条文抽出とゲーム起動を行う。挙動が二重管理になっており、UIやロジックを変更するたびに両方を書き換える必要がある。

## Plan of Work

最初に共通インターフェースを定義する。記事リストを提供する `ArticleProvider`（ケースでは `extractAllArticles`、ホームではフィルター済みの全条文一覧）と、進捗記録を更新する `ProgressRecorder` を受け取る形の新しいコアモジュール `public/speedQuizCore.js` を作る。そこではタイマー、回答UI、答え表示、統計表示などゲーム本体を構築し、必要なDOM IDを引数で受け取る。既存のケース用 `speedQuiz.js` からゲームUI生成・イベント制御を切り出し、抽出専用関数やケース特有のヘルパーだけを残す。同様にホーム用 `speedQuizMain.js` は新しいコアのラッパーとなり、従来の統計・フィルター機能は必要に応じて再設計してコアに差し込む。UIは共通テンプレートを使い、ホーム固有のメトリクス（総回答数など）は外側コンテナで別途表示する。最後に `homePage.js` と `casePage.js` の呼び出し部分を更新し、共通化に伴うCSSやイベント初期化を整える。仕上げに学習ログへの書き込みが両ルートから同じコードパスで行われることを確認し、READMEや関連ドキュメントへ使用方法を追記する。

## Concrete Steps

1. ケース専用ロジックを調査し、「条文抽出」と「ゲーム表示」の責務を分離する。`public/speedQuiz.js` に `buildSpeedQuizUI(container, options)` のような薄いラッパーを残し、抽出関数（`extractAllArticles` など）は `casePage` で使えるようエクスポートする。
2. `public/speedQuizCore.js` を新規作成し、以下を実装する。
    * `initializeSpeedQuizUI({ containerId, articles, clockSettings, recorder, displaySettings })` で DOM を構築し、既存のタイマー・回答ロジックを移植する。
    * `renderQuestion`, `handleAnswer`, `revealAnswer`, `updateStats` など細分化した関数を含め、他モジュールからもテストしやすい状態にする。
    * 入力として渡された `articles` 配列を信頼し、ケースとホームのいずれも同じ挙動を共有できるようにする。
3. `public/speedQuiz.js` を整理し、`extractAllArticles` やケース特有の補助関数は維持しつつ、ゲーム初期化部分はコアモジュールに委譲する。ケースページからは `initializeCaseSpeedQuiz(containerId, caseData)` のような薄いAPIだけを公開する。
4. `public/speedQuizMain.js` を全面改修し、データ取得とフィルター機能は保ちつつ、ゲーム開始時に `speedQuizCore` を呼び出す。ホームページ独自の統計表示も、コアから受け取るイベント（回答完了、タイムアウトなど）にフックして更新するようにする。
5. `public/pages/homePage.js` と `public/pages/casePage.js` の初期化コードを更新し、新しいAPIに合わせて import と呼び出しを書き換える。古い UI コンテナや冗長な state があれば削除する。
6. `README.md` か該当ドキュメントにスピード条文ゲームの構成図と共通モジュールの使い方を追記し、メンテ手順を説明する。

## Validation and Acceptance

アプリを `npm start` で起動し、ホームのスピード条文カードが新UIで表示されることを目視確認する。同じクイズ設定でケース詳細ページのスピード条文タブへ遷移し、同じUI・同じ挙動でプレイできることを確認する。回答結果が `data/quiz-results.json` に保存され、ホームの統計にも反映されることをログで確かめる。フロントの自動テストがあれば実行し、最低でも `npm run lint` (存在する場合) を通す。`npm start` 中にエラーがないことも受け入れ基準とする。

## Idempotence and Recovery

コアモジュールは純粋なJSファイル追加であり、副作用は既存ファイルの編集のみ。作業途中でロールバックしたい場合は Git で該当ファイルを checkout すればよい。`npm start` が失敗したら依存関係を再インストール (`npm install`) し、再度起動する。共通化後でも旧モジュールを残しておくため、必要があれば `git revert` で元に戻せる。

## Artifacts and Notes

- 共有UIを使うサンプル呼び出し:
      import { initializeSpeedQuizUI } from './speedQuizCore.js';
      initializeSpeedQuizUI({ containerId: 'speed-quiz', articles, clockSettings: { limitSeconds: 30 } });
- 期待されるDOM構造: 親コンテナの直下にヘッダー、問題表示、回答入力、タイマー、統計パネルの順で生成される。

## Interfaces and Dependencies

`public/speedQuizCore.js` に以下のエクスポートを定義する。

      export async function initializeSpeedQuizUI(options);
      export function formatArticleDisplay(article);
      export function attachSpeedQuizEventBus(bus);

`options` には `containerId`, `articles`, `questionCount`, `timeLimitSeconds`, `onResult` コールバックなどを含め、両ページが共通で渡せる。ケースページでは `extractAllArticles(caseData)` を流用して `articles` を用意し、ホームページでは回答履歴ファイルから構築した `articles` を使う。`onResult` でホーム固有の統計を更新する。