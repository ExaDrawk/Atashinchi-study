# Q&Aチャット導入と学習支援強化

This ExecPlan is a living document. Keep the sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` up to date as work proceeds. Maintain it exactly as required by `.agent/PLANS.md`.

## Purpose / Big Picture

HomeとCaseの両ページで表示されるQ&Aリストから、ユーザーが任意の設問に対して🤔ボタンを押すと、あたしンちキャラクターがソクラテス式に指導するチャット欄をその場で開き、穴埋め空欄や条文参照を踏まえた学習支援を受けられるようにする。ボタンは全Q&Aに表示され、クリックすれば既存 `chatSystem.js` を呼び出した共通コンポーネントが出現し、質問が空欄未習得部分へ誘導される。挙動はホーム横断リストとケース個別タブの両方で一致させ、会話履歴やステータスと干渉しない。

## Progress

- [x] (2025-11-16T12:05Z) 既存Q&A描画・チャット基盤の把握と要件整理。
- [x] (2025-11-16T12:32Z) 🤔ボタンとチャットエリアUIを `qaRenderer` に追加し、カード内にチャットスロットを常設。
- [x] (2025-11-16T12:36Z) Socraticプロンプトと `chatSystem` の`qa`タイプ処理を実装し、穴埋めメタデータを活かした初期/追加入力を生成。
- [x] (2025-11-16T12:40Z) Home/Case共有のイベント配線を完了し、`.start-chat-btn` → `startQaChatSession` でメタデータを受け渡し。
- [ ] (todo) 主要シナリオの動作確認・リグレッション実施。

## Surprises & Discoveries

- Observation: `chatSystem.js` は `startChatSession` 呼び出し時に押下ボタンから dataset を参照するため、Q&A用には `data-type="qa"` などの新識別子と問題文供給フックが必要。
  Evidence: 関数内タイプ分岐は `story`, `quiz`, `essay` のみ。
- Observation: `qaRenderer.js` は全Q&Aを文字列で構築しているため、ボタン挿入やチャット挿入スペースはHTML生成関数内で追加するのが一貫的。
  Evidence: `renderQAItem` が各アクションボタンを定義し、case/home両方から再利用。

## Decision Log

- Decision: 🤔ボタンは `renderQAItem` の既存ボタン群に追加し、同じイベントデリゲーション（`.start-chat-btn`）を再利用する。
  Rationale: DOM生成を1箇所に集約し、ホームとケース双方への同期を保証するため。
  Date/Author: 2025-11-16 / GitHub Copilot
- Decision: Q&Aチャットは `sessionId = qa-<moduleId>-<qaId>` 形式で個別化し、質問本文と穴埋め内容を `data` 属性経由で `startChatSession` に渡す。
  Rationale: 現行セッション管理を壊さず、履歴キーでケース別の会話を区別するため。
  Date/Author: 2025-11-16 / GitHub Copilot

## Outcomes & Retrospective

- ✅ Q&Aカードから直接チャットを展開し、空欄の要約・Socratic指導・Gemini連携まで一連の流れがフロント側で接続できた。
- ✅ HomeとCaseの両描画経路で同一の🤔ボタンが働き、データ属性から問題文/モジュール情報を取得できることを確認（要ブラウザ動作検証）。
- ⚠️ 未: 手動E2E確認とAPIレスポンスの実機テストはまだ未実施のため、次ステップでブラウザ検証とログ確認を行う必要がある。

## Context and Orientation

- `public/qaRenderer.js` で Q&A のHTMLを生成し、`renderQAItem` のボタン列に追加すればホーム/ケース双方へ適用される。
- `public/eventHandler.js` に `.start-chat-btn` クリックで `startChatSession` を呼ぶ仕組みがあり、datasetに `data-type`, `data-qa-id`, `data-module-id`, `data-question`, `data-answer` を渡せば拡張可能。
- `public/chatSystem.js` の `startChatSession` は `type` ごとのUI初期化を行うため、新しい `qa` 分岐を用意してQ&A専用の会話枠・Socratic誘導を構築する。
- `public/data/prompts.js` で生成される初期プロンプトはケースデータ (`currentCaseData`) を前提にしているため、Q&Aチャットでは `questionsAndAnswers` の穴埋めや未習得ランクを渡す補助文字列を別途整形する。
- スタイルやDOMはTailwind相当のユーティリティクラスを使っており、新規チャット欄は既存チャットのUIコンポーネントを再利用する。

## Plan of Work

1. **UIとデータ属性の拡張**: `qaRenderer.js` で🤔ボタンとチャット用ホルダーを追加し、各ボタンに `data-type="qa"`, `data-qa-id`, `data-module-id`, `data-question`, `data-answer`, `data-blanks` など学習に必要な情報を埋め込む。ボタンクリックでチャットが差し込まれるDOM（例: `.qa-chat-slot`) も一緒に描画する。
2. **イベント処理の強化**: `eventHandler.js` の `.start-chat-btn` ハンドラーにQ&Aケースを追加し、対応するチャット領域の表示、既存回答表示ボタンとの共存、重複起動防止を行う。
3. **チャットシステム対応**: `chatSystem.js` の `startChatSession` に `type === 'qa'` 分岐を追加し、
   - `sessionId = qa-<moduleId>-<qaId>` を生成
   - Q&A本文、模範解答、空欄情報を `problemText`/`hintText` に整形
   - UIには穴埋め再強調と「空欄に沿って考える」導線付きの説明を描画
   - プロンプト生成部（`generateInitialPrompt` 以前）でSocratic要求・空欄焦点のガイドテキストを挿入
4. **プロンプト補強**: Q&Aチャット用の初期メッセージテンプレートを `chatSystem.js` 内で生成し、空欄(`{{ }}`)や未チェック項目を列挙してAIに「質問で引き出す」よう指示。必要なら `data/prompts.js` にサブルール関数を追加。
5. **フォールバックとUX**: チャット領域閉鎖ボタン、再度🤔を押した際のトグル、空欄が無い古いQ&Aの扱い（通常質問モードへ）を定義。フィルター解除時などDOM再描画に備え、`setupQAListEventHandlers` 実行後に `.qa-chat-slot` をリセット。
6. **テストと検証**: ホームで複数フィルタ適用後に🤔チャットが起動すること、ケースタブからも同様に動くこと、チャットUIの送信がGemini APIへ正常送信されること、既存論文/ストーリーチャットへの回帰影響が無いことを確認。`npm start`（既知の法令エラー除き）で再度手動検証。

## Concrete Steps

1. `qaRenderer.js`
   - `renderQAItem` に🤔ボタン(`qa-chat-btn`)とチャット差し込み要素を追加。
   - Q&Aデータから `data-question`, `data-answer`, `data-blank-count` を抽出し `data-` 属性に設定。
   - HTMLテンプレートに `<div class="qa-chat-slot" data-chat-slot="${qaId}"></div>` を追加。
2. `qaRenderer.js` → `setupQAListEventHandlers`
   - 新ボタンに特別な処理は不要（`.start-chat-btn` クラスを付与し、既存イベントデリゲーションに乗せる）。
3. `eventHandler.js`
   - `.start-chat-btn` ハンドラーに `type === 'qa'` を判定し、押下ボタン付近の `.qa-chat-slot` を開く。
   - `startChatSession` 呼び出し前に必要なデータを `dataset` にセット（button生成時点）しているため、ここではUI初期化のみ。
4. `chatSystem.js`
   - `startChatSession` へ `qa` 分岐: ホーム/ケースのQ&Aカードから最寄りチャット領域を探し、QA本文と模範解答を`problemText`/`modelAnswer`に割り当てる。
   - チャットUI（タイトル、説明、空欄強調リスト）をQ&A用にカスタマイズ。
   - `initialPrompt` 生成時にQ&A固有情報（穴埋め付きanswer, ランク, ステータス）を文字列化してSocratic指示を付与。
   - `sendFollowUpMessage` にも `qa` 特化ガイドが必要なら追加。
5. 必要であれば `data/prompts.js` や補助ユーティリティにQ&Aチャット向けルールを追加。
6. スタイル調整: 既存クラスを流用しつつ、必要なら `public/styles.css` に最小限の新規クラスを追加。

## Validation and Acceptance

- `npm start` を実行してローカルサーバーを起動し、
  - ホームでQ&Aリストを表示 → 任意のQにある🤔ボタンをクリック → チャットエリアがその場に展開され、キャラクターが空欄について質問してくる。
  - ケース個別ページで `Q&A` タブを開き、同様に🤔ボタンからチャットを開ける。
  - チャットにユーザー文章を入力して送信 → Gemini応答がカード内に表示され、穴埋めヒントに言及。
  - 既存 `start chat` 機能（論文/ストーリー）が引き続き動作する。
- 主要ブラウザでDOMリセットやフィルタ再描画後もチャットボタンが有効。

## Idempotence and Recovery

- `qaRenderer.js`, `eventHandler.js`, `chatSystem.js` の変更は全てソース編集のみで、ビルドを何度でも再実行できる。
- DOM再描画でチャットエリアがクリアされるのは仕様であり、再クリックで再生成される。
- APIエラー時は既存の `chatArea` エラーハンドリングが働く。Q&A専用のUIでも同じメッセージを表示してユーザー操作をブロックしない。

## Artifacts and Notes

- 追加される主要ファイル: `public/qaRenderer.js`, `public/eventHandler.js`, `public/chatSystem.js`、必要に応じて `public/data/prompts.js`。
- DOM構造: `.qa-item` 内に `.qa-chat-slot` が追加され、`startChatSession` がそこへチャットカードを描画。

## Interfaces and Dependencies

- `startChatSession(button, currentCaseData)` will accept QA buttons with dataset:

        data-type="qa"
        data-qa-id="<number>"
        data-module-id="<string>"
        data-question="..."
        data-answer="..."
        data-blanks="["blank text", ...]"

- New helper inside `chatSystem.js`:

        function buildQaPrompt({ question, answer, blanks, rank, status }) -> string

- `qaRenderer.js` must ensure `qa.rank`, `qa.status`, `qa.answer` are provided when constructing dataset values (fallback to empty strings when missing).

## Change Notes

- 2025-11-16: Initial ExecPlan drafted to cover Q&Aチャット機能全体。