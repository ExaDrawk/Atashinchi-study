# QAフィルドリルUX 4改善（自動空欄拡大・キャラアイコン刷新・条文ボタン化・AI思考アニメ）

This ExecPlan is a living document. Maintain the sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` exactly as required by `.agent/PLANS.md`, and keep this plan fully self-contained for any future contributor.

If PLANS.md file is checked into the repo, reference the path to that file here from the repository root and note that this document must be maintained in accordance with PLANS.md.

Referenced guidance: `.agent/PLANS.md`.

## Purpose / Big Picture

学習者がQAフィルドリルモードで解答するとき、(1) 長文の空欄でも入力欄が自動で伸びて読みやすくなり、(2) 添削フィードバックや総評に原作キャラクターの顔アイコンが正しく表示され、(3) テンプレやフィードバック内に現れる【民法○条】などの条文がストーリーページ同様にボタン化されて即座に参照でき、(4) AIがテンプレ生成や採点を処理している間は明示的な思考アニメーションで状態が伝わる──という体験を作る。これにより、ユーザーは「空欄が狭い」「キャラが表示されない」「条文を探しづらい」「AIが動いているか分からない」といった不満なく演習フローに集中できる。動作確認は `npm start` でサーバーを立ち上げ、任意のケースのQ&Aカードからフィルドリルを開いて、各改善点を目視および条文ボタンクリックで検証する。

## Progress

- [ ] (2025-02-15 05:20Z) 現行フィルドリルUI/データ構造の再精査と要件整理、プラン確定。
- [ ] (2025-02-15 05:20Z) 空欄自動リサイズのJSヘルパーとスタイル適用、レンダリングとイベント処理への組み込み。
- [ ] (2025-02-15 05:20Z) キャラクターアイコン描画ロジック刷新（`characters.js` 参照 & 画像ファイル命名に合わせた変換・フォールバック）。
- [ ] (2025-02-15 05:20Z) 条文テキスト処理とボタン化（`articleProcessor` 連携、再初期化、参照パネル起動）、必要に応じて条文一覧UIを追加。
- [ ] (2025-02-15 05:20Z) AI思考アニメーション用のスタイルとDOM挿入、テンプレ生成/採点フローと同期。
- [ ] (2025-02-15 05:20Z) `npm run build` とブラウザ検証、ログ記録、最終クリーンアップ。

## Surprises & Discoveries

- Observation: `qaFillDrillSystem.js` はキャラクターアイコンパスを `/images/characters/<名前>/<表情>.png` で組み立てているが、`public/images` には `<baseName>_<expression>.png` というフラットな命名で格納されており、現在のロジックでは全て404になる。
  Evidence: `public/images/` ディレクトリ listing と `renderBlankResultIndicator` 内の `characterImagePath` 構築コード。
- Observation: フロント側では `articleProcessor.processArticleReferences` を呼んでいないため、フィルドリル内で【民法○条】などの参照がボタン化されず、`knowledgeBox` やテンプレ本文での利便性が落ちている。
  Evidence: `qaFillDrillSystem.renderInlineWorksheet` と `buildEvaluationBlock` が素のテキストを `escapeHtml` しているのみ。

## Decision Log

- Decision: キャラ画像解決は `public/data/characters.js` の `baseName` と `availableExpressions` を利用し、`/images/${baseName}_${expression}.png`（存在しなければ `normal` フォールバック）を標準とする。
  Rationale: 実ファイル命名と一致し、aliases を含むキャラ名の揺れにも対応できる。既存の `/images/characters/...` 形式は実体が無く保守不能。
  Date/Author: 2025-02-15 / Copilot
- Decision: 条文表示は `articleProcessor.processArticleReferences` と `setupArticleRefButtons` をそのまま再利用し、フィルドリルUI描画の都度ハンドラーを再初期化する。追加で「参照条文一覧」セクションが必要な場合は、テンプレやQA本文から `【...】` パターンを抜き出して Chips を描画する。
  Rationale: 既存ストーリーページと同一のUX/イベント管理を担保でき、独自実装を避けられる。
  Date/Author: 2025-02-15 / Copilot

## Outcomes & Retrospective

_未実施。作業完了時に更新する。_

## Context and Orientation

- `public/qaFillDrillSystem.js`: フィルドリルのメインロジック。レベルごとのテンプレ生成/採点/描画や結果フィードバックを司る。今回の4改善すべてのエントリポイント。
- `public/data/characters.js`: キャラクター名称、`aliases`, `baseName`, `availableExpressions` を定義。アイコンの正しいファイル名を導出する際の真実のソース。
- `public/articleProcessor.js`: `processArticleReferences`, `setupArticleRefButtons` など条文ボタン化とイベント配線を提供。フィルドリルのテキストにも適用する。
- `public/css/modern-design.css`（もしくは共通スタイルシート）: 新しいAI思考アニメーションや自動リサイズ入力のトランジション、条文フッターバッジ等のスタイルを追加する。
- `ApiService` (`public/apiService.js`): 既存のテンプレ生成/採点API呼び出しをラップ。AIアニメーション表示に連動する `isGenerating` / `isGrading` フラグをトグルする部分は `qaFillDrillSystem` 内にある。

フィルドリルDOMは `.qa-item` 内の `.qa-fill-drill` コンテナに挿入される。イベントは `qaFillDrillSystem.mountAll` で登録されるため、描画後に条文ボタンのイベント (`setupArticleRefButtons`) を走らせる必要がある。CSSユーティリティはTailwind＋独自クラスの混在なので、新クラス名は名前衝突を避ける。

## Plan of Work

1. **自動空欄リサイズの設計**: `renderInlineWorksheet` で生成する `<input class="inline-blank-input">` に `data-min-ch` 等を付与し、描画直後と `handleInput` 時に専用ヘルパー `autoResizeInlineInputs(container, level)` を呼んで `style.width` を文字列長＋余白分に更新する。幅計算は `canvas` あるいは隠し`span`で測る。最小幅/最大幅（例: 120px〜420px）とスムーズなトランジション (`transition: width 0.15s ease`) をCSSに追加する。複数箇所で同じ blankId を共有するため、同期更新ループの中で `autoResizeSingleInput(target)` を呼ぶ。

2. **キャラアイコン再構築**: `qaFillDrillSystem` 冒頭で `import { characters } from './data/characters.js';` を追加し、`resolveCharacterByName(name)` ヘルパーを作成。`aliases` と `baseName` から一致するキャラを探し、`buildCharacterImageHTML({ speaker, expression })` が `<img src="/images/${baseName}_${expression}.png">` を生成し、`expression` が未提供/ファイル無しなら `normal`／`happy` など `availableExpressions` 先頭を順次試行する。`renderBlankResultIndicator` と `buildEvaluationBlock` から既存のパス構築を置換し、fallback時は丸背景のイニシャルバッジを描画する。

3. **条文【】表示とボタン化**: `renderInlineWorksheet` のテキストセグメント、`buildEvaluationBlock` の summary や suggestions、`buildBlankInput` のラベル/フィードバック周辺に `renderLawRichText(text)` ヘルパーを適用し、`processArticleReferences(escapeHtml(text))` の返り値を埋め込む。描画完了後（`render` 内）で `setupArticleRefButtons(container)` を呼び、`qaFillDrillSystem` 自身で生成したDOMにイベントを付与。さらに、テンプレ or QA から抽出したユニークな条文をまとめた `renderArticleFooter(lawRefs)`（Chipとボタン）をレベルボディ最下部に設置し、該当法令名/番号を `data-law-name` / `data-article-ref` に設定して `articleProcessor` の仕様に合わせる。抽出は正規表現 `/【([^】]+)】/g` を使い `lawName` と `article` を分離するか、既存 `processArticleReferences` に任せた上で `container.querySelectorAll('.article-ref-btn')` から dataset を収集して Chips を複製する。

4. **AI思考アニメーション**: `public/css/modern-design.css` に `@keyframes qa-dot-bounce` や `ai-thinking-pulse` を追加し、`.qa-ai-thinking` クラスで丸いグロー+点滅ドットを表現する。`buildLevelBody` 上部に `renderThinkingIndicator({ type: 'generate' | 'grade' })` を挿入し、`state.generatingLevel === level` や `state.gradingLevel === level` の間だけ表示。「AIがテンプレを考え中…」「AIが採点中…」などのラベルを添える。グローバルにも `.qa-fill-drill` の右上に小さなフローティングインジケータを追加してもよい。

5. **スタイル/アクセシビリティの整備**: `.inline-blank-input` の `width:auto`, `min-width`, `max-width`, `font-feature-settings: 'palt'`、`aria-live` を適用。キャラアイコン画像には `alt="<キャラ名>の表情"` を付ける。条文ボタンの親コンテナに `role="group" aria-label="参照条文"` を付ける。AIインジケータは `aria-live="polite"` で進行状況を伝達。

6. **検証と文書化**: `npm run build` でケースインデックス生成が壊れていないか確認。ブラウザで1ケースを開いて (a) inline入力を長文で試す、(b) 添削表示のアイコンと条文ボタンをクリック、(c) テンプレ再生成時のアニメーションを観察。必要に応じて README か `qaFillDrillSystem` 冒頭コメントに新ヘルパーの仕様を記述。

## Concrete Steps

1. **ソース読み直しと下準備**
    - ファイル: `public/qaFillDrillSystem.js`, `public/data/characters.js`, `public/articleProcessor.js`。
    - 目的: 関数位置の特定、既存依存関係の確認。

2. **自動リサイズ実装**
    - 追加関数: `createInlineMeasurementSpan()`（シングルトン）、`autoResizeInlineInput(input)`、`syncInputWidths(container, level)`。
    - 変更箇所: `renderInlineWorksheet`（入力に `data-auto-resize="true"` 付与）、`handleInput`（同期更新後に自動リサイズ呼び出し）、`render`（描画完了後に一括リサイズ）。
    - CSS: `public/css/modern-design.css` に `.inline-blank-input` と `.qa-inline-measure` の新ルール。

3. **キャラアイコンヘルパー**
    - 新ユーティリティ: `resolveCharacterBySpeaker(rawName)` と `buildCharacterAvatar({speaker, expression, sizeClass})`。
    - `renderBlankResultIndicator` / `buildEvaluationBlock` / 任意のキャラ表示箇所を同ヘルパーで統一。フェール時は `div` バッジ (`speaker.slice(-2)` 等) を返す。

4. **条文処理**
    - `import { processArticleReferences, setupArticleRefButtons } from './articleProcessor.js';`
    - ヘルパー `applyArticleProcessing(htmlText)` を導入し、テキストセグメント描画前に適用。
    - `render` 終了時に `setupArticleRefButtons(container)` を呼び、`renderInlineWorksheet` 末尾に `data-article-scope="level-${level}"` を付ける。
    - オプション: `renderArticleReferenceTray(container, level)` で `.article-ref-btn` コレクションをもとに Chips を複製し、同一ボタンを footer に並べる。

5. **AI思考アニメーション**
    - CSSに `.qa-ai-thinking`、`.qa-ai-dot`、`@keyframes qa-ai-dot` を追加。
    - `buildLevelBody` で `isGenerating` / `isGrading` を見てコンテンツ上部に挿入。
    - `render` 末尾や `.qa-fill-drill` 直下にステータス行を追加してもよい（将来拡張できるようプレースホルダ関数に）。

6. **スタイル & テスト**
    - 追加CSS: `.qa-article-reference-footer`, `.qa-character-avatar` など。
    - `npm run build` 実行。
    - ブラウザで `npm start` → 任意ケース → Q&A → フィルドリルUIを開き、機能検証。

## Validation and Acceptance

1. `npm run build`（あるいは `node scripts/build-case-index.js`）が成功し、既存のcaseデータ生成にエラーが出ない。
2. サーバーを `npm start` で起動し、ブラウザから任意ケースのQ&Aカードを開き、以下を目視確認：
    - 長文を入力しても空欄幅が自動で広がり、短文は縮むが最小幅を下回らない。
    - 添削丸ボタンを押すとキャラアイコン画像が正しく表示され、404が出ない。存在しないキャラ名はフォールバックバッジになる。
    - テンプレ本文やフィードバック中の【民法○条】が黄色いボタンとして表示され、クリックで条文パネルが起動する。
    - テンプレ生成・採点ボタンを押した際、AI思考アニメーションが表示され、完了後に消える。

## Idempotence and Recovery

- 自動リサイズ・キャラ表示・条文ボタンはDOM描画ごとに純粋関数で生成されるため、再描画やレベル切り替えを何度行っても重複副作用は起こらない。`setupArticleRefButtons` は毎回 remove → add する安全な実装。
- API呼び出し中にエラーが起きても既存の `finally` ブロックで `state.generatingLevel` / `gradingLevel` は解除され、AIインジケータも消える。CSS/JS追加は冪等なため、同パッチを再適用しても構成が壊れない。

## Artifacts and Notes

- 幅測定用の `span.qa-inline-measure` は `position:absolute; visibility:hidden; white-space:pre;` でbody直下に一度だけ挿入し、`window` 幅変更時に `syncInputWidths` を再呼出して可読性を維持する。
- キャラ検索は `const characterIndex = new Map([...characters].flatMap(...))` を初期化し、レンダリング毎に線形探索しないようにする。
- 条文フッターは `container.querySelectorAll('.article-ref-btn')` から dataset を読み、`Set` でユニーク化すればAI生成結果に `【】` がなくても degrade-free（ただし `processArticleReferences` 後にのみ生成すること）。

## Interfaces and Dependencies

- 追加（または変更）関数（`public/qaFillDrillSystem.js` 内）:

        function resolveCharacterBySpeaker(name) -> { baseName, displayName, availableExpressions }
        function buildCharacterAvatar({ speaker, expression, sizeClass }) -> string
        function applyArticleProcessing(rawText) -> string
        function autoResizeInlineInput(input)
        function syncInlineInputWidths(container, level)
        function renderThinkingIndicator(type) -> string

- 依存ライブラリ: 既存の `articleProcessor` と `characters.js` のみを再利用。新規パッケージ追加は不要。
- CSSインターフェース: `.inline-blank-input[data-auto-resize="true"]`, `.qa-ai-thinking`, `.qa-article-reference-footer`。`qaFillDrillSystem` 以外のコンポーネントには影響させないようクラス名を名前空間化する。

---

_Update Log_: 2025-02-15 Copilot — 初版作成。今後の進捗/仕様変更は本ファイル末尾に理由とともに追記する。