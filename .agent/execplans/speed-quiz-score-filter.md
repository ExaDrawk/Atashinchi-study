# スピード条文スコア&絞り込み再設計

このExecPlanは`.agent/PLANS.md`に従って維持する。進行状況・判断・発見は作業とともに更新する。

## Purpose / Big Picture

ホーム画面のスピード条文モードで「最近の平均得点がどのくらいか」に基づいて条文を絞り込めるようにし、スコア算出も短時間で答えるほど 0〜9 点のスケールで分かりやすくなるよう再設計する。利用者は残り時間が多いほど高い点を獲得し、各条文が「まだまだ / あと少し / カンペキ」の３段階でラベル付けされるため、ホームのスピード条文カードから苦手条文だけを即座に出題できる。

## Progress

- [x] 既存スコアロジックと記録形式を新仕様に合わせるための下地（recordArticleAnswer / completeAnswer / recordQuizResult）を更新。
- [x] 直近最大3回のスコア履歴を保存・集計し、分類ラベル（まだまだ/あと少し/カンペキ）を算出するヘルパーを実装。
- [x] ホーム表示モードがスピード条文のときにフィルタパネルを専用UIへ差し替え、分類＆法令名での絞り込みを提供。
- [x] 絞り込み条件をspeedQuiz.jsのstartFilteredSpeedQuizへ渡し、出題候補の前処理で分類＆法令フィルタを適用。
- [ ] npm startでのE2E確認と必要なREADME/データ更新、テレメトリの再生成。

## Surprises & Discoveries

- (後で更新)

## Decision Log

- (後で更新)

## Outcomes & Retrospective

- (完了時に記載)

## Context and Orientation

- `public/speedQuiz.js` はゲーム全体の状態管理を担い、`completeAnswer`でスコア計算・`recordArticleAnswer`でファイル保存を行う。現在の得点は `100 + timeLeft*10` で 100〜200 点帯になっており、平均点も `record.totalScore/record.answered` で算出される。
- `public/sharedSpeedQuizMain.js` ではホームで使用する条文データを集め、`initializeSpeedQuizGame` を呼び出す。フィルタUIはホーム (`public/pages/homePage.js`) のフィルタパネルが流用されており、スピード条文モードでもモジュール検索UIがそのまま表示される。
- 正答率データは `public/speedQuiz/<法令>.js` として保存され、`recordArticleAnswer` 経由で `answered/correct/totalScore/averageScore/modules` が保たれる。最近のスコア履歴や分類ラベルは保持されていない。
- スピード条文の結果は `/api/quiz-results` を通じて `data/quiz-results.json` にも日次で積み上がる。現行仕様では高得点が200点に達するため、新スケール導入後は低桁になる。
- ホームのフィルタUIは `renderHome` 内で静的HTMLを描画している。表示モードがスピード条文でも `📂 モジュール検索・絞り込み` セクションが残っている。

## Plan of Work

1. **スコアロジック刷新**: `completeAnswer`, `recordQuizResult`, および時間切れ処理を新スコア式 `floor(clampedRemainingSeconds * 10)` に更新し、最高値でも 9 点になるよう `remainingSeconds` を `timeLeft / timeLimit` で正規化した上で 0.999 を上限にする。`recordArticleAnswer` が受け取る `earnedScore` はこの新スケールを前提にする。
2. **履歴と分類の保存**: `recordArticleAnswer` に `recentScores` 配列（最大3件）と `speedRank` 計算を追加。保存ファイルにフィールドが無い場合は初期化し、`getAnswerRates` 呼び出し時にも欠損を埋める。分類基準は平均 0〜2 未満=まだまだ、3〜7 未満=あと少し、8 以上=カンペキ。
3. **データ活用ヘルパー**: `public/speedQuiz.js` に `computeSpeedRank(record)` と `getArticleSpeedProfile(article)` を追加し、記事毎に平均点と分類を取得できるAPIを用意。`startFilteredSpeedQuiz` でフィルタ適用前に各記事へ `speedProfile` を付与する。
4. **ホームUIの置換**: `renderHome` 内で `showSpeedQuizMode` の場合は既存フィルタパネルHTMLを差し替える `renderSpeedFilterPanel()` を実行。UI には (a) 「まだまだ / あと少し / カンペキ」のトグルボタン、(b) 法律名マルチセレクト、(c) 件数表示とクリアボタンを含める。選択状態はローカルストレージに保存し、切替時に `startFilteredSpeedQuiz` 呼び出しへ渡す設定オブジェクトを構築する。
5. **データ連携**: ホームのスピード条文カードから「出題する」アクションを実行する時に、UIで選んだ分類/法令フィルタを `startFilteredSpeedQuiz` に提供する。該当する条文が0件なら明示的なエラーメッセージを表示し、クリアボタンで条件をリセットする。
6. **表示の反映**: 結果画面 (`displayAverageScores`) で平均点と分類タグを一覧表示し、全条文の分類内訳をサマリー表示する。UI上でも記事カードや出題リストに分類バッジを添える（最低限ホームのフィルタパネルだけで分類を確認できれば可）。
7. **テスト & 回帰**: `npm start` でアプリを起動し、スピード条文モードでフィルタUIが差し替わること、分類選択で条文リストが変化すること、新スコアが 0〜9 に収まることを手動確認。サーバー側 `server.js` の `/api/quiz-results` 書き込みが新スコアを保存する点も検証する。

## Concrete Steps

1. `public/speedQuiz.js` で `completeAnswer`, `startTimer` 内時間切れ分岐, `recordQuizResult`, `recordArticleAnswer` を更新し、新スコア算出と `recentScores` 管理を実装。既存フィールドがない場合のフォールバックと JSON 保存フォーマットも調整する。
2. 同ファイル内に `calculateSpeedScore(timeLeft, timeLimit)`・`updateRecentScores(record, earnedScore)`・`deriveSpeedRank(avgScore)` 等のヘルパーを新設し、データ取得 (`getAnswerRates`) でも欠損補填する。
3. `server.js` の `/api/quiz-results` はデータ構造変更不要だが、README やコメントで点数レンジが 0〜9 になった旨を記す。必要なら既存 JSON の極端な値を移行するスクリプトを `scripts/` 配下に追加（任意）。
4. ホーム画面 (`public/pages/homePage.js`) に `renderSpeedFilterPanel`, `collectSpeedFilterSettings`, `attachSpeedFilterHandlers` を追加し、`renderFilteredModulesOrQAs` で `showSpeedQuizMode` の時にこのUIを描画・更新。分類トグルは `data-filter-rank` 属性を持つボタンにする。
5. `sharedSpeedQuizMain.js` もしくは `speedQuiz.js` に、ホームのフィルタUIが `startFilteredSpeedQuiz` へ渡す設定のエントリポイント（例: `applySpeedQuizFiltersFromHome(settings)`）を追加し、`startFilteredSpeedQuiz` 自体も `rankFilters` と `lawFilters` を読み取って article list を絞り込むよう更新。
6. `displayAverageScores` とリザルトUIで、新しい平均点と分類を表示。表示形式を `<span class="badge badge-rank">まだまだ</span>` 等に変えてユーザーに分かりやすいフィードバックを与える。
7. `npm start` を実行し、ブラウザで `#/` → スピード条文モードへ切替、フィルタUIが置換されること、ランキングで条文数が変化すること、1問あたりスコアが 0〜9 の整数になることを確認。必要に応じて `npm test`（存在すれば）を実行。

## Validation and Acceptance

- `npm start` → `http://localhost:3000/#/` を開き、表示モードをスピード条文にするとフィルタパネル全体が「条文絞り込み」に変わり、分類トグルと法令セレクタが表示される。
- 「まだまだ」だけを選んで出題すると、`startFilteredSpeedQuiz` のログとUI上の総件数がその条件に一致し、ゲーム開始後に `window.speedQuizArticles` に含まれる各記事の `speedProfile.rank` が `まだまだ` であることを console で確認できる。
- クイズを数問解いて結果画面を表示すると、新スコアが 0〜9 の範囲で増加し、平均点一覧に分類バッジが表示される。`data/quiz-results.json` に保存された最新レコードの `score` 値も 0〜9 である。
- 直近 3 回分のスコア履歴しか平均に使われないことを、同じ条文を 4 回解いた際に oldest entry が削除されるログで確認する。

## Idempotence and Recovery

- `recordArticleAnswer` は欠損フィールドを都度初期化するため、新フィールド導入後も古い `public/speedQuiz/*.js` を再生成せずに読み込める。問題が起きた場合は該当ファイルを削除してゲーム内から再保存すれば再構築できる。
- ホームUIの差し替えは `showSpeedQuizMode` のときだけ DOM を変更するため、モードを戻せば元のフィルタUIに復帰する。ローカルストレージの条件が壊れた場合は「フィルタクリア」ボタンでリセット可能。
- 新しいスコアロジックが不具合を起こしても `git checkout -- public/speedQuiz.js public/pages/homePage.js public/sharedSpeedQuizMain.js` で直前の状態に戻せる。

## Artifacts and Notes

- 代表的なスコア計算ログ: `Score calc -> timeLeft=7.4s, limit=10s, normalized=0.74, earned=7`。
- データ保存例:
      "recentScores": [7, 5, 3],
      "averageSpeedScore": 5,
      "speedRank": "あと少し"

## Interfaces and Dependencies

- `public/speedQuiz.js`
      function calculateSpeedScore(timeLeftSeconds, timeLimitSeconds): number // 0〜9
      function updateRecentScores(record, earnedScore): void // record.recentScores を最新3件に保つ
      function deriveSpeedRank(avgScore): 'まだまだ' | 'あと少し' | 'カンペキ'
      async function recordArticleAnswer(..., earnedScore): Promise<void> // recentScores, averageSpeedScore, speedRank を更新
      export function startFilteredSpeedQuiz(settings) // settings.rankFilters: string[], settings.selectedLaws: string[]
- `public/pages/homePage.js`
      function renderSpeedFilterPanel(selectedRanks, selectedLaws)
      function collectSpeedFilterSettings(): { rankFilters: string[], selectedLaws: string[] }
      function applySpeedFilterSettings(settings): void // UI反映 + localStorage
- `public/sharedSpeedQuizMain.js`
      export async function loadAllArticlesForSpeedQuiz(forceReload?) // 既存
      新設: export function getKnownLawNames(): string[] // フィルタUI用
- `data/quiz-results.json` 書式は `score: number` を 0〜9 へ縮小するだけで済む。
