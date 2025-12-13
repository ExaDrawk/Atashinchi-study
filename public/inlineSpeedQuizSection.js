/**
 * inlineSpeedQuizSection.js - Q&A/モジュールリスト下に表示するスピード条文セクション
 * 現在絞り込まれているデータから条文を抽出し、その条文でスピードクイズをプレイ可能にする
 */

// 条文抽出用の正規表現パターン（【法令名条文番号】形式）
const ARTICLE_PATTERN = /【([^】]+?)(\d+条(?:[^\】]*?)?)】/g;

// 対応する法令名（条文API対応リスト）
const SUPPORTED_LAW_NAMES = [
    '日本国憲法', '憲法', '民法', '刑法', '会社法', '商法', '民事訴訟法', '刑事訴訟法',
    '行政手続法', '行政不服審査法', '行政事件訴訟法', '国家賠償法', '地方自治法',
    '破産法', '民事再生法', '民事執行法', '民事保全法', '借地借家法', '信託法',
    '刑事訴訟規則', '少年法', '裁判員の参加する刑事裁判に関する法律',
    '会社法施行規則', '会社計算規則'
];

// 法令名の正規化マップ
const LAW_NAME_NORMALIZE = {
    '憲法': '日本国憲法'
};

/**
 * テキストから条文参照を抽出する
 * @param {string} text - 検索対象テキスト
 * @returns {Array<{lawName: string, articleRef: string, fullRef: string}>} - 抽出された条文リスト
 */
export function extractArticleReferences(text) {
    if (!text || typeof text !== 'string') return [];

    const articles = [];
    const seen = new Set();

    // 【法令名条文番号】形式を検出
    const pattern = /【([^\d\】]+?)(\d+条[^\】]*)】/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        const rawLawName = match[1].trim();
        const articleRef = match[2].trim();

        // 法令名を正規化
        const lawName = LAW_NAME_NORMALIZE[rawLawName] || rawLawName;

        // サポートされている法令かチェック
        if (!SUPPORTED_LAW_NAMES.some(l => l === lawName || l === rawLawName)) {
            continue;
        }

        const fullRef = `${lawName}${articleRef}`;

        // 重複チェック
        if (!seen.has(fullRef)) {
            seen.add(fullRef);
            articles.push({
                lawName: lawName,
                articleRef: articleRef,
                fullRef: fullRef
            });
        }
    }

    return articles;
}

/**
 * Q&Aリストから条文を抽出する
 * @param {Array} qaList - Q&Aデータの配列
 * @returns {Array} - 抽出された条文リスト（重複なし）
 */
export function extractArticlesFromQAList(qaList) {
    if (!Array.isArray(qaList)) return [];

    const allArticles = [];
    const seen = new Set();

    qaList.forEach(qa => {
        // 質問文から抽出
        if (qa.question) {
            const fromQuestion = extractArticleReferences(qa.question);
            fromQuestion.forEach(art => {
                if (!seen.has(art.fullRef)) {
                    seen.add(art.fullRef);
                    allArticles.push(art);
                }
            });
        }

        // 回答文から抽出
        if (qa.answer) {
            const fromAnswer = extractArticleReferences(qa.answer);
            fromAnswer.forEach(art => {
                if (!seen.has(art.fullRef)) {
                    seen.add(art.fullRef);
                    allArticles.push(art);
                }
            });
        }
    });

    return allArticles;
}

/**
 * 抽出された条文からスピードクイズ用の条文データを取得
 * @param {Array} articleRefs - 条文参照配列
 * @returns {Promise<Array>} - スピードクイズ用条文データ
 */
export async function fetchArticlesForSpeedQuiz(articleRefs) {
    if (!articleRefs || articleRefs.length === 0) return [];

    const articles = [];

    // 法令名ごとにグループ化
    const byLaw = {};
    articleRefs.forEach(ref => {
        if (!byLaw[ref.lawName]) {
            byLaw[ref.lawName] = [];
        }
        byLaw[ref.lawName].push(ref);
    });

    // 各法令からAPIで条文を取得
    for (const [lawName, refs] of Object.entries(byLaw)) {
        try {
            const response = await fetch(`/api/law-articles/${encodeURIComponent(lawName)}`);
            if (!response.ok) continue;

            const lawArticles = await response.json();
            if (!Array.isArray(lawArticles)) continue;

            // 参照された条文のみフィルタ
            refs.forEach(ref => {
                // 条文番号を抽出（例: "21条1項" → "21"）
                const articleNumMatch = ref.articleRef.match(/^(\d+)/);
                if (!articleNumMatch) return;

                const articleNum = articleNumMatch[1];

                // 該当する条文を検索
                const matchingArticles = lawArticles.filter(art => {
                    return String(art.articleNumber) === articleNum;
                });

                matchingArticles.forEach(art => {
                    articles.push({
                        ...art,
                        lawName: lawName
                    });
                });
            });
        } catch (error) {
            console.warn(`⚠️ ${lawName}の条文取得に失敗:`, error);
        }
    }

    // 重複除去
    const uniqueArticles = [];
    const seenKeys = new Set();
    articles.forEach(art => {
        const key = `${art.lawName}_${art.articleNumber}_${art.paragraph || '1'}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueArticles.push(art);
        }
    });

    return uniqueArticles;
}

/**
 * インラインスピード条文セクションをレンダリング
 * @param {Object} options - オプション
 * @param {string} options.containerId - コンテナID
 * @param {Array} options.articleRefs - 条文参照配列
 * @param {string} options.mode - 'qa' または 'module'
 */
export function renderInlineSpeedQuizSection(options) {
    const { containerId, articleRefs = [], mode = 'qa' } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    const count = articleRefs.length;

    if (count === 0) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4 text-center mt-6">
                <p class="text-gray-500 text-sm">⚡ 条文参照が見つかりませんでした</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 mt-6 shadow-lg">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">⚡</span>
                    <div>
                        <h3 class="text-white font-bold text-lg">スピード条文</h3>
                        <p class="text-white/80 text-sm">
                            ${mode === 'qa' ? 'このQ&Aリスト' : 'このモジュール'}から抽出した条文でプレイ
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button id="inline-speed-quiz-start-btn" 
                            class="bg-white hover:bg-gray-100 text-indigo-600 font-bold py-2 px-6 rounded-lg shadow-md transition-all transform hover:scale-105">
                        スタート
                    </button>
                </div>
            </div>
        </div>
    `;

    // スタートボタンのイベント設定
    const startBtn = container.querySelector('#inline-speed-quiz-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            startBtn.disabled = true;
            startBtn.textContent = '読込中...';

            try {
                // 条文データを取得
                const articles = await fetchArticlesForSpeedQuiz(articleRefs);

                if (articles.length === 0) {
                    alert('条文データの取得に失敗しました。');
                    startBtn.disabled = false;
                    startBtn.textContent = 'スタート';
                    return;
                }

                // スピードクイズを開始
                if (window.startSpeedQuizWithArticles) {
                    window.startSpeedQuizWithArticles(articles);
                } else {
                    // フォールバック：スピードクイズページに遷移
                    window.speedQuizArticles = articles;
                    window.location.hash = '#/speed-quiz';
                }
            } catch (error) {
                console.error('スピードクイズ開始エラー:', error);
                alert('エラーが発生しました。');
                startBtn.disabled = false;
                startBtn.textContent = 'スタート';
            }
        });
    }
}

// グローバルに公開
window.inlineSpeedQuizSection = {
    extractArticleReferences,
    extractArticlesFromQAList,
    fetchArticlesForSpeedQuiz,
    renderInlineSpeedQuizSection
};

export default {
    extractArticleReferences,
    extractArticlesFromQAList,
    fetchArticlesForSpeedQuiz,
    renderInlineSpeedQuizSection
};
