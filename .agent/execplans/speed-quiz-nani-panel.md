# スピード条文ナニコレAIパネル刷新

このExecPlanは `.agent/PLANS.md` に従って維持する。進捗・判断・発見は作業とともに更新し、常に自足した説明となるよう保つ。

## Purpose / Big Picture

ケース学習中に「ナニコレ？」と感じた瞬間に即座にAIへ解説を依頼できるよう、スピード条文ゲームへインラインAIパネルを組み込む。プレイヤーがナニコレボタンを押すとゲームが自動ポーズし、最新問題の条文メタデータを添えてAIへ質問を送信、画面下部の操作エリアがそのまま解説ビューへ切り替わる。プレイヤーはAIの回答を読み、必要なら追質問を送り、閉じれば元のボタン群に戻ってプレイを再開できる。`npm start` 後に任意のケースでゲームを開始し、ナニコレボタンを押すだけでポーズ・AI解説表示・再開が確認できれば受け入れとする。

## Progress

- [ ] (2025-11-16 08:00Z) 既存テンプレートとゲームステートの調査、必要なUI差し替え点を列挙。
- [ ] (2025-11-16 08:00Z) ナニコレパネル/UI更新の実装: テンプレート改修、イベント配線、状態管理、説明文削除。
- [ ] (2025-11-16 08:00Z) AIリクエスト処理・自動質問送信とポーズ/再開制御の実装。
- [ ] (2025-11-16 08:00Z) npm start での手動検証と結果の記録。

## Surprises & Discoveries

- (未記入)

## Decision Log

- (未記入)

## Outcomes & Retrospective

- (未記入)

## Context and Orientation

`public/speedQuiz.js` がゲーム全体を担い、テンプレート生成、`gameState` 作成、タイマー(`startTimer`/`stopTimer`)やスコア処理、ボタンイベントを1ファイルで扱っている。現在の操作エリアは「スキップ」「終了」の2ボタンのみで、AIヘルプやポーズ機能は存在しない。AIエンドポイント `/api/gemini` は他モジュールで利用済みのためそのまま呼び出せる。今回の作業は `public/speedQuiz.js` のテンプレート、`setupSpeedQuizEventListeners`、`gameState` フィールド、タイマー制御、AI補助関数を中心に変更する。フロントエンドのみで完結し、追加のサーバー変更は不要。

## Plan of Work

1. **テンプレート刷新**: `initializeSpeedQuizGame` のテンプレート内で (a) ルール説明を簡素化し余計な文章を削除、(b) 現在のボタン行を `<div id="control-buttons">` として定義し、新たに `<section id="nani-panel" class="hidden">` を追加。パネルにはヘッダー（タイトル＋閉じる/戻るボタン）、ステータス行、スクロール可能な回答領域、質問用テキストエリア、送信ボタン、`再開` ボタンを含める。

2. **ゲームステート拡張**: `createInitialGameState()` に `isPaused`, `pauseReason`, `naniSession`(記事メタ/auto説明フラグ/履歴)を追加。`resetGameState()` 相当の箇所でも初期化する。

3. **ポーズ/再開制御**: `startTimer` を現在の挙動に合わせつつ `gameState.isPaused` を考慮。`pauseGame(reason)` で `clearInterval` し、残り時間を維持、`updatePauseUI(true)` でボタン文言/タイマー色を更新。`resumeGame()` で残り時間から `startTimer` を再開。`setupSpeedQuizEventListeners` で新しい `#pause-game`/`#resume-game` ボタン（テンプレートに配置）を配線。

4. **ナニコレイベント**: `handleNaniButton()` を新設し、(a) 未準備なら `prepareNaniSession(currentArticle)` で条文名/番号/本文を保持、(b) `showNaniPanel({ autoExplain: true })` でボタン群を隠しパネルを表示、(c) `pauseGame('nani')` を呼び出し、(d) `requestNaniExplanation(DEFAULT_PROMPT, { auto:true })` でAIへ事前質問を送信。`DEFAULT_PROMPT` は「この条文の趣旨を簡潔に教えて」など固定文にする。

5. **AI通信**: `requestNaniExplanation(prompt, options)` を実装し、`fetch('/api/gemini')` へ現在条文情報(`gameState.naniSession.article`)とユーザー質問を payload で送信。応答を `appendNaniResponse(question, answer)` でレンダリングし、ステータス表示を更新。ユーザー質問欄の送信ボタン/ショートカット(Ctrl+Enter)もここで処理。

6. **UIトグル**: `showNaniPanel` / `closeNaniPanel` で `#control-buttons` と `#nani-panel` を切り替え、`naniSession.active` を更新。閉じる際はAIステータスをクリア。`resume-game` ボタンは `closeNaniPanel` 経由で元の操作列へ戻り `resumeGame()` を呼ぶ。

7. **テキスト整理**: ルール欄 (`#speed-quiz-rules`) の箇条書きを削り、タイトル＋短い説明1行程度に縮小。AI関連以外の余計なヒント・コツも削除し、UIをすっきりさせる。

## Concrete Steps

1. `cd C:\Users\PC_User\Desktop\Atashinchi-study`。
2. `public/speedQuiz.js` を編集し、テンプレート／ステート／イベント／タイマー処理を上記方針で更新。必要に応じて補助関数を追加。
3. 余計な説明テキストをテンプレート内で削除または短文化。
4. `npm start` でアプリを実行し、ブラウザからケースページを開いてスピード条文を起動。ナニコレボタン、ポーズ/再開、AI送信の挙動を手動確認。

## Validation and Acceptance

- ゲーム開始→「ナニコレ」ボタン押下で即ポーズし、残り時間が止まる。ボタン列がAIパネルに置き換わり、ログに自動質問送信が出る。
- AI応答がパネル内に表示される。Ctrl+Enter や送信ボタンで追加質問が送れる。
- 「戻る」または「ゲーム再開」でパネルが閉じ、元のボタン列が戻り、`resumeGame()` によりタイマーが残り秒数から再開する。
- テンプレート冒頭の説明が簡素化され、不要な文章が消えている。
- 失敗時はブラウザコンソール/サーバーログで原因が分かる。

## Idempotence and Recovery

変更ファイルは `public/speedQuiz.js` のみ。途中でレイアウトが崩れた場合でも `git checkout -- public/speedQuiz.js` で元に戻せる。AIパネル表示/非表示はDOMトグルのみで副作用がないため、作業中にブラウザをリロードすればリセットできる。

## Artifacts and Notes

- 推奨デフォルトプロンプト例
    「この条文の要旨と実務での使いどころを2段落で説明してください。」
- ステータス領域メッセージ例
    「⏳ AIが条文解説を作成中…」→「✅ 解説を受信しました」

## Interfaces and Dependencies

- `gameState` 追加フィールド:
    - `isPaused: boolean`
    - `pauseReason: 'user' | 'nani' | null`
    - `naniSession: { article, hasAutoExplanation: boolean, isActive: boolean }`
- 新関数:
    - `pauseGame(reason = 'user')`
    - `resumeGame()`
    - `handleNaniButton()`
    - `prepareNaniSession(article)`
    - `requestNaniExplanation(question, { auto?: boolean } = {})`
    - `appendNaniResponse(question, answer)`
    - `showNaniPanel(options?)` / `closeNaniPanel()`
- DOM要素 IDs: `pause-game`, `resume-game`, `nani-helper-toggle`, `control-buttons`, `nani-panel`, `nani-question-input`, `nani-send-question`, `nani-response`, `nani-status`。

これらの関数とDOM要素が揃えば、ナニコレAIパネルの切替と自動ポーズ/送信が実装できる。