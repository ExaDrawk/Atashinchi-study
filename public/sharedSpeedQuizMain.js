import { normalizeArticleForSpeedQuiz } from './speedQuiz.js';

export const HOME_SPEED_QUIZ_LAWS = [
    '日本国憲法', '国会法', '内閣法', '国家行政組織法',
    '裁判所法', '検察庁法', '弁護士法', '公職選挙法',
    '行政手続法', '行政機関の保有する情報の公開に関する法律', '行政不服審査法', '行政事件訴訟法', '国家賠償法',
    '個人情報の保護に関する法律', '地方自治法', '民法', '民事訴訟法', '民事執行法', '民事保全法',
    '会社法', '会社法施行規則', '会社計算規則', '商法',
    '信託法', '消費者契約法', '特定商取引に関する法律', '割賦販売法',
    '住宅の品質確保の促進等に関する法律', '借地借家法',
    '刑法', '刑事訴訟法', '刑事訴訟規則', '少年法',
    '裁判員の参加する刑事裁判に関する法律', '検察審査会法',
    '破産法', '民事再生法', '特許法', '著作権法'
];

const HOME_ARTICLE_LIMIT = 60;
const CACHE_TTL_MS = 1000 * 60 * 5;

const lawArticleCache = new Map();
const preparedArticleCache = {
    articles: [],
    fetchedAt: 0
};

export async function initializeSpeedQuizMainSection(containerId = 'speed-quiz-main-section', options = {}) {
    const { forceReload = false } = options;
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ スピード条文セクションのコンテナが見つかりません:', containerId);
        return;
    }

    container.innerHTML = renderLoadingState();

    try {
        const articles = await prepareHomeQuizArticles(forceReload);
        window.speedQuizArticles = Array.isArray(articles) ? [...articles] : [];
        if (!articles.length) {
            container.innerHTML = renderEmptyStateCard();
            return;
        }

    container.innerHTML = '';
    wireHomeEvents(containerId);
    } catch (error) {
        console.error('❌ ホームスピードクイズ初期化エラー:', error);
        container.innerHTML = renderErrorState(error);
    }
}

export async function loadAllArticlesForSpeedQuiz(forceReload = false) {
    return fetchSupportedLawArticles(forceReload);
}

export function filterArticlesByLaw(lawName, articles = window.speedQuizArticles || []) {
    if (!lawName) {
        return Array.isArray(articles) ? [...articles] : [];
    }
    const normalizedTarget = normalizeLawKey(lawName);
    return (articles || []).filter(article => normalizeLawKey(article.lawName) === normalizedTarget);
}

async function prepareHomeQuizArticles(forceReload = false) {
    const now = Date.now();
    if (!forceReload && preparedArticleCache.articles.length && (now - preparedArticleCache.fetchedAt) < CACHE_TTL_MS) {
        return preparedArticleCache.articles;
    }

    const normalized = await fetchSupportedLawArticles(forceReload);
    const limited = shuffleArray(normalized).slice(0, HOME_ARTICLE_LIMIT);

    preparedArticleCache.articles = limited;
    preparedArticleCache.fetchedAt = now;
    return limited;
}

async function fetchSupportedLawArticles(forceReload = false) {
    const articlesByLaw = await Promise.all(
        HOME_SPEED_QUIZ_LAWS.map(async (lawName) => {
            const articles = await fetchArticlesFromApi(lawName, forceReload);
            return articles.map(item => ({
                ...item,
                lawName: item.lawName || lawName
            }));
        })
    );

    const flattened = articlesByLaw.flat();
    const normalized = flattened
        .map(normalizeArticleForSpeedQuiz)
        .filter(Boolean);

    return deduplicateArticles(normalized);
}

async function fetchArticlesFromApi(lawName, forceReload = false) {
    const cached = lawArticleCache.get(lawName);
    const now = Date.now();
    if (!forceReload && cached && (now - cached.fetchedAt) < CACHE_TTL_MS) {
        return cached.articles;
    }

    try {
        const response = await fetch(`/api/law-articles/${encodeURIComponent(lawName)}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const articles = Array.isArray(data) ? data : [];
        lawArticleCache.set(lawName, { articles, fetchedAt: now });
        return articles;
    } catch (error) {
        console.warn(`⚠️ ${lawName} の条文取得に失敗`, error);
        lawArticleCache.set(lawName, { articles: [], fetchedAt: now });
        return [];
    }
}

function deduplicateArticles(articles) {
    const map = new Map();
    articles.forEach(article => {
        const key = `${normalizeLawKey(article.lawName)}_${article.articleNumber}_${article.paragraph || '1'}`;
        if (!map.has(key)) {
            map.set(key, article);
        }
    });
    return Array.from(map.values());
}

function shuffleArray(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function renderLoadingState() {
    return `
        <div class="bg-white/80 rounded-xl p-6 text-center border border-blue-100">
            <div class="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p class="text-sm text-gray-600">条文リストを構築しています...</p>
        </div>
    `;
}

function renderEmptyStateCard() {
    return `
        <div class="bg-white/90 rounded-xl p-6 text-center border border-dashed border-gray-200">
            <p class="text-lg font-semibold text-gray-700 mb-2">条文データが見つかりません</p>
            <p class="text-sm text-gray-500 mb-4">APIから条文を取得できませんでした。時間を置いて再度お試しください。</p>
            <button class="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold" onclick="window.location.reload()">再読み込み</button>
        </div>
    `;
}

function renderErrorState(error) {
    return `
        <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
            <p class="font-semibold mb-2">読み込みで問題が発生しました</p>
            <p class="text-sm mb-4">詳細: ${error?.message || '不明なエラー'}</p>
            <button class="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold" onclick="window.location.reload()">ページを再読み込み</button>
        </div>
    `;
}

function wireHomeEvents(containerId) {
    // 現状は追加イベントなし（復習モードのためシンプルに維持）
}

function normalizeLawKey(value) {
    return (value || '').replace(/\s+/g, '');
}
