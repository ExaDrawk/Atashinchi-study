# QAフィルドリルの体験改善（ヒント排除と自動AI連携）

This ExecPlan is a living document. Maintain the sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` exactly as required by `.agent/PLANS.md`, and keep this plan fully self-contained for any future contributor.

## Purpose / Big Picture

学習者がQAフィルドリルを開始するときに余計なボタンやヒントに惑わされず、開始直後にAIテンプレートが生成され、解答中でも自由に修正しながら○/△/×の採点結果を即座に確認できるようにする。これにより、ユーザーはスクリーンショットのような文章中の空欄で集中的に演習し、全ての{{}}空欄を最低限埋める訓練を受けられる。完成後はホーム/ケース問わず、開始ボタン→テンプレ生成→回答→AI採点→結果表示の一連の流れがシームレスに働き、評価が全○なら合格と表示される。

## Progress

- [ ] (pending) 現行フィルドリルUIとデータ構造の精査、ヒント表示箇所の洗い出し。
- [ ] (pending) ヒントレスのテンプレ生成・レンダリング実装、開始ボタン自動生成フロー更新。
- [ ] (pending) 採点時の非同期スナップショット取得とUI維持、○/△/×表示ロジックの実装。
- [ ] (pending) すべての{{}}空欄を入力化するバックフィル処理とサーバープロンプト修正。
- [ ] (pending) 手動検証と `node scripts/build-case-index.js` によるビルド確認。

## Surprises & Discoveries

- Observation: _未記入_
  Evidence: _未記入_

## Decision Log

- Decision: _未記入_
  Rationale: _未記入_
  Date/Author: _未記入_

## Outcomes & Retrospective

_未記入_

## Context and Orientation

QAフィルドリルは `public/qaFillDrillSystem.js` に集中しており、`renderInlineWorksheet` や `normalizeInlineSegments` がGeminiから返る `inlineBody` と `canonicalBlanks` を組み合わせてDOMを描画する。学習開始は `.qa-fill-drill` コンポーネント内のボタンで `drillState` を更新し、テンプレ生成API (`/api/qa-fill/generate`) を経由する。採点は `/api/qa-fill/grade` に回答配列をPOSTし、レスポンスを `renderDrillResults` で整形、`QAStatusSystem` へ記録する。ヒント用の単語は現状 `blank.keywords` や `hint` をそのままUIに表示しているため、要件に合わせて削除する必要がある。

`server.js` の `buildTemplatePrompt` がGeminiに指示を与えているので、ここで「全ての{{}}を空欄定義に含める」「ヒント文は返さない」などの強制ルールを追加する。`QAStatusSystem` は採点結果を保存するため、○/△/×の表示はこの結果の上に薄いプレゼン層を差し込むだけでよい。フロントは `homePage.js` やケースページ経由で `qaFillDrillSystem` の `init` を呼び出すので、実装の大部分は共通モジュールに集中させる。

## Plan of Work

まず現在のヒント表示経路を特定し、`renderInlineWorksheet` や `renderBlankInput` が `keywords` をチップ表示している箇所を削除する。同時にサーバーのテンプレート生成プロンプトからもヒントを禁止して、生成結果に余計なガイダンスが含まれないようにする。

次に、開始UIを一本化する。`.qa-fill-start-btn` を押した瞬間に `handleStartDrill` がテンプレ生成を呼び出すようにし、別途「AIテンプレートを生成」ボタンが存在するならDOMから除去する。テンプレ生成中はスピナーのみを表示し、完了後にすぐ穴埋めDOMが描画される流れに変更する。

採点フェーズでは、送信時に現在の入力値を配列にコピーしてAPIへ送る一方、DOM上のフォームはそのまま温存する。`drillState.isGrading` などのフラグだけでローディング表示を切り替え、APIレスポンス後に○/△/×ステータスバッジを各空欄の下に描画する。判定は `result.perBlank` の正答率に応じて `circle`, `triangle`, `cross` のクラスを割り当て、全て○の場合は合格表示を追加する。

さらに、`canonicalBlanks` に含まれるすべての`{{ }}`がUIに存在するよう、サーバーから届いたテンプレに不足があれば `renderInlineWorksheet` で不足分を末尾に追加入力として描画するか、サーバー側プロンプトで必ず含めるよう強制する。今回は両面からアプローチし、バックエンドで「QAの `canonicalBlanks` を完全に列挙せよ」と指示し、フロントで安全のための `ensureAllCanonicalBlanksRendered` を追加する。

最後に、ヒントを空欄以外に埋め込まないよう、`inlineBody` テキストから `hint` フィールドを削除し、UIではツールチップや括弧付きヒントを一切表示しない。必要に応じて `title` 属性なども排除する。

## Concrete Steps

1. `public/qaFillDrillSystem.js`
   - `renderInlineWorksheet` から `renderHint`, キーワードチップ、`blank.hint` 表示を削除。
   - `handleStartDrill` を開始ボタン押下と同時にテンプレ生成するよう書き換え。`initDrillUI` で別ボタンを描画している場合は取り除く。
   - `renderDrillActions` から「AIテンプレートを生成」ボタンを削除し、「開始」「採点」「リセット」程度に整理。
   - 採点関数（`handleGradeSubmission`）で `const snapshot = collectAnswers()` を作り、APIレスポンスを待つ間もフォームDOMを保持。`drillState.isGrading` を使ってボタンだけスピナー表示にする。
   - `renderGradingResults` などの新関数を追加し、各空欄に○/△/×を描画。全○なら「合格」バッジをヘッダに表示。
   - `ensureAllCanonicalBlanksRendered` のようなヘルパーで `canonicalBlanks` と `inlineBody` を比較し、足りないIDは末尾に空欄ノードを追加。
2. `server.js`
   - `buildTemplatePrompt` の指示文を更新し、`canonicalBlanks` 全列挙・ヒント禁止・キーワードリスト禁止・空欄数>=元の{{}}の数、といったルールを明示。
3. `public/pages/homePage.js` 等で開始ボタンが重複していないか確認し、不要なUIを削除。
4. スタイル (`public/styles.css` など) に○/△/×バッジ用のクラスを追加し、色やアイコンを定義。
5. `node scripts/build-case-index.js` を実行してビルドが通ることを確認。

## Validation and Acceptance

- `npm start`（あるいは `node server.js`）でサーバーを起動し、ホームページの `.qa-fill-drill` セクションで「開始」ボタンを押すと即テンプレ生成が走り、追加ボタンが存在しないことを確認する。
- 同じ画面で空欄が多く（元の{{}}数と一致）表示され、各空欄の横や文中にヒント文字が一切表示されていないことを確認する。
- 答案を入力して「AIで採点」を押す → 採点中もフォームが編集可能で、結果として各空欄下に○/△/×が表示され、全○なら「合格！」表示が出る。
- 採点ログが `learning-logs` に記録され、`QAStatusSystem` 更新が行われている。
- `node scripts/build-case-index.js` が成功メッセージを出し、既知のデータ由来エラー以外が発生しない。

## Idempotence and Recovery

すべての変更はソース編集のみで、途中でやり直しても副作用は無い。採点APIのタイムアウト時は既存のエラー処理を使い回し、UIに警告を出して再試行できる。テンプレ生成APIは複数回呼んでも最新のテンプレで上書きされるため、再生成ボタンは不要となる。

## Artifacts and Notes

- 追加する○/△/×記号はUnicode（○=U+25CB, △=U+25B3, ×=U+00D7）を使用し、スクリーンリーダー向けに `aria-label` を付与する。
- `ensureAllCanonicalBlanksRendered` はレンダリング時にのみ実行し、`drillState.activeTemplate` に補完後の結果を保存して後続処理と整合させる。
- テンプレ生成中・採点中のトーストは既存の `showToast`/`showNotification` を再利用する。

## Interfaces and Dependencies

- `qaFillDrillSystem.js` に以下の新ヘルパーを追加する:

        function ensureAllCanonicalBlanksRendered(template) -> templateWithAllBlanks
        function renderPerBlankResults(results, container)

- 採点結果構造は既存 `/api/qa-fill/grade` の `perBlank` 配列を使用し、`{ blankId, score, feedback }` を `scoreSymbol = score >= 0.9 ? '○' : score >= 0.5 ? '△' : '×'` のように評価する。
- `server.js` の `buildTemplatePrompt` で `canonicalBlanks` のJSON構造をAIに渡し、`inlineBody` には `type: "blank"` のノードを必要数含めさせる。
