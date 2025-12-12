# スピード条文クイズ番号入力・正誤判定再構築

このExecPlanは`.agent/PLANS.md`の要件に従って維持する。進捗・判断・発見は作業とともに更新する。

## Purpose / Big Picture

スピード条文クイズの回答欄で、条文番号と必要に応じた項番号を正確かつ段階的に入力できるよう、入力処理と判定ロジックを一新する。利用者は数字を打ち込むだけで「の」付き条文や項番号にも迷わず答えられ、誤入力時の挙動も一貫すると確認できる。ゲームを開始し、複数の条文に回答した際に正誤判定が必ず正しい数字列と同期していることが目視・ログで分かる状態を目標にする。

## Progress

- [ ] (2024-11-24 02:00Z) 既存入力ロジックの調査と要件整理。
- [ ] (2024-11-24 02:00Z) 新しい回答ステートマシンの設計とユーティリティ実装。
- [ ] (2024-11-24 02:00Z) UIイベント（input/keydown/グローバルキー監視）の差し替えと `gameState` 更新。
- [ ] (2024-11-24 02:00Z) 動作検証・手動テスト・必要なドキュメント更新。

## Surprises & Discoveries

- (未記入)

## Decision Log

- (未記入)

## Outcomes & Retrospective

- (未記入)

## Context and Orientation

`public/speedQuiz.js` がケースページのクイズ機能全体を担い、回答欄（`#article-number-input`, `#paragraph-number-input`）のイベント処理もここに内包している。現在は `handleArticleInput`, `detectAndHandleTypo`, `getProgressiveDisplay`, グローバル `keydown` フックなど複数の関数が断片的に連動し、`gameState` 内の `articleInputBuffer`, `currentAnswerStage`, `correctArticleNumberNormalized` などのフィールドを共有している。入力途中でのリセットや「の」付き条文の扱いが複雑化しており、正誤判定までの流れを追跡しづらい。今回の作業はこのファイル内の入力・判定関連の関数をすべて置き換え、状態の初期化／進行を明確にする。追加の設定ファイルやコンポーネントは不要で、UIも既存のマークアップを流用する。

## Plan of Work

まず要件を整理し、条文番号・項番号それぞれの入力仕様（桁数制限、許可文字、"の" の扱い、段階的表示）と状態遷移（記事→項→完了）を文書化する。次に `createInitialGameState()` に回答専用の `answerState` オブジェクトを追加し、`resetAnswerState(article)` のような関数で問題ごとに初期化する。`prepareAnswerTargets(article)` で `articleDigits`（例: `['4','1','3']`）や `suffixDigits`（例: `['2']`）を配列化し、項番号も同じ形式で保持して段階的比較を容易にする。

新しい `handleArticleInput` は `input` イベントで常に全文字を正規化し、`consumeDigits(answerState.article, value)` でどこまで一致したか、途中の `の` を自動挿入するかを判定する。誤差が出た場合は即時ペナルティ・視覚効果・一文字巻き戻しを実行する。`handleParagraphInput` も同じユーティリティを使い、完了時に `finalizeAnswer(true)` を呼ぶ。グローバル `keydown` 監視は `dispatchAnswerKey(key)` に集約し、フォーカス移動や手動 `input` 発火ではなく `setInputFromState()` でDOM反映するようにし、実際のフォーム値と `answerState.buffer` の不整合をなくす。

正誤判定は `evaluateAnswerCompletion()` に一本化し、記事入力完了→項入力着手→完答の順で `gameState.currentAnswerStage` を更新する。既存の `detectAndHandleTypo`, `getProgressiveDisplay`, `articleInputBuffer` などは撤去し、代わりに `answerState.articleProgress`, `answerState.paragraphProgress`, `answerState.isLocked` といった明示的なフィールドを使う。視覚的なオーバーレイ更新は `syncAnswerOverlay()` に隠蔽し、入力欄の `value` とオーバーレイ表示が常に同じ配列データを参照するようにする。最後に `displayCurrentQuestion()` と `nextQuestion()` から `resetAnswerState` を呼び、ステート遷移のデバッグログを残す。

## Concrete Steps

1. `public/speedQuiz.js` で現行の入力関連関数（`handleArticleInput`, `handleParagraphInput`, `handleArticleKeyDown`, `handleParagraphKeyDown`, `getProgressiveDisplay`, `extractValidInput`, `detectAndHandleTypo`, `applyTypoPenalty`, `showIncorrectInputAnimation` など）と、`gameState` 上の `articleInputBuffer` 系フィールドを洗い出して削除する準備をする。
2. `createInitialGameState` と `displayCurrentQuestion` に `answerState` を追加し、`resetAnswerState(currentArticle)` を新設して正解のターゲット配列・入力バッファ・UI初期化を一か所で担う。
3. `buildAnswerStateHelpers` セクションとして以下を実装する: `normalizeDigits`, `splitArticleNumber`, `createProgressTracker`, `updateOverlay(displayElement, progress, targetLength, options)`, `consumeInput(progressTracker, nextToken)` など。これらで記事番号・「の」付き番号・項番号すべてに対応する。
4. 新しい `handleArticleInput`/`handleParagraphInput`/グローバル `keydown` ハンドラを作り、イベントから渡された文字を `processAnswerInput(stage, token)` に渡すだけにする。ここで文字列の検証・進捗更新・誤入力処理（時間ペナルティ・フラッシュ）・完了判定を集中管理する。
5. `completeAnswer` および `beginParagraphStage` を改修し、新ステートが `articleComplete` → `needsParagraph` → `paragraphComplete` となるようにする。記事完了後に `answerState.stage = 'paragraph'` とし、段階的に `finalizeCorrectAnswer()` を呼ぶ。
6. 関数整理後に死んだコード（未使用の `handleCorrectAnswer` など）を削除し、必要に応じてコメントやログを最新仕様に合わせる。

## Validation and Acceptance

- `npm install` が完了している環境で `npm start` を実行し、ブラウザで `http://localhost:3000#/speed-quiz`（またはケース詳細からゲーム開始）を開く。
- ゲーム開始後に以下を手動確認する:
  1. 「413の2」形式の条文で「413」入力時に自動で「の」が表示され、続く「2」で完了する。
  2. 誤った数字を入力すると即座に赤い警告・-1秒ペナルティが発生し、入力欄が正しい接頭辞まで巻き戻る。
  3. 項番号が必要な条文では記事番号完了後に自動で項入力欄にフォーカスし、正しい項のみ受け付ける。
  4. 正しい回答で `score` と `correctAnswers` が加算され、`questionsAnswered` も整合する。
- 想定通りに進行できれば受け入れとし、エラーがあればブラウザコンソールとログで原因を追う。

## Idempotence and Recovery

変更は `public/speedQuiz.js` のみで完結する。作業途中で問題があれば `git checkout -- public/speedQuiz.js` で元に戻せる。入力ロジック差し替えは純粋な関数置換のため `npm start` が起動中でもホットリロードで反映され、失敗してもブラウザリロードで復帰する。追加したユーティリティは他ファイルから参照されないため、ロールバックは安全。

## Artifacts and Notes

- 進捗ログ例:
      [AnswerState] stage=article progress=3/3 suffixPending=true paragraphRequired=false
- 新オーバーレイ描画イメージ:
      記事: 4 1 3 の 2
      項: 2 _

## Interfaces and Dependencies

`public/speedQuiz.js` に以下のユーティリティ／ステート構造を定義する。

      function resetAnswerState(article) -> answerState
      function processAnswerInput(stage, token)
      function finalizeCorrectAnswer()

`answerState` には `targetArticleDigits`, `targetArticleSuffixDigits`, `targetParagraphDigits`, `articleProgress`, `paragraphProgress`, `stage`, `locked` を含める。`gameState` は `answerState` を保持し、`displayCurrentQuestion` と `nextQuestion` から参照する。イベントリスナーは `processAnswerInput` を経由し、DOM 更新は `syncAnswerInputsFromState()` で集中管理する。これにより他モジュールへの依存はなく、既存の `recordArticleAnswer`, `postArticleToLawList`, `handleQuestionOutcome` などの関数はそのまま使える。
