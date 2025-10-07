// pages/casePage.js - ケースページ専用モジュール（ランク付け表示対応）

import { caseLoaders } from '../cases/index.js';
import { characters } from '../data/characters.js';
import { processArticleReferences, processAllReferences, setupArticleRefButtons, processBoldText, processBlankFillText } from '../articleProcessor.js';
import { showArticlePanel } from '../articlePanel.js';
import { ApiService } from '../apiService.js';
import { startChatSession } from '../chatSystem.js';
import { recreateQAPopup, createGlobalPopupContainer } from '../qaPopup.js';
import { QAStatusSystem } from '../qaStatusSystem.js';
import { buildQAButtonPresentation } from '../qaButtonUtils.js';

/**
 * 学習記録用の日付を計算する関数
 * @param {Date} now - 現在時刻（省略時は現在時刻を使用）
 * @returns {string} - YYYY-MM-DD形式の日付
 */
function getStudyRecordDate(now = new Date()) {
    // Helper: format date as local YYYY-MM-DD (avoid toISOString which is UTC)
    function formatLocalDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    // 学習日のルール: 3:00～26:59（翌日の2:59まで）を一日とする
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 現在の時刻が3:00より前（0:00～2:59）の場合、前日の日付を返す
    if (hour < 3) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDate(yesterday);
    }

    // それ以外（3:00～23:59）の場合、当日の日付を返す
    return formatLocalDate(now);
}
import { getRankColor } from '../rankColors.js';

// QAStatusSystemのインスタンス作成
const qaStatusSystem = new QAStatusSystem();

function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;');
}

/**
 * 通知表示
 * @param {string} message - メッセージ
 * @param {string} type - タイプ（success, error, info）
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // アニメーション表示
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 3秒後に消去
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 答案入力ボタンのシンプルスタイル
const answerButtonCSS = document.createElement('style');
answerButtonCSS.innerHTML = `
.answer-entry-section {
    background: linear-gradient(135deg, #f0f8ff 0%, #f8f0ff 100%);
    border: 2px dashed #93c5fd;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
}

.answer-entry-section:hover {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.enter-answer-mode-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
    color: white;
    font-weight: bold;
    padding: 12px 32px;
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
    cursor: pointer;
    font-size: 16px;
}

.enter-answer-mode-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}
`;
document.head.appendChild(answerButtonCSS);

// チャット吹き出しアニメーションCSS
const chatBubbleCSS = document.createElement('style');
chatBubbleCSS.innerHTML = `
/* 左側キャラクターの吹き出しアニメーション */
@keyframes bubble-scale-left {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.chat-bubble-left {
    transform-origin: left center;
    animation: bubble-scale-left 0.3s ease;
}

/* 右側キャラクターの吹き出しアニメーション */
@keyframes bubble-scale-right {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.chat-bubble-right {
    transform-origin: right center;
    animation: bubble-scale-right 0.3s ease;
}

/* ストーリー・解説共通の穴埋めボタンスタイル */
.story-blank-container,
.explanation-blank-container {
    display: inline;
}

.story-blank-button,
.explanation-blank-button {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #f59e0b;
    border-radius: 6px;
    padding: 2px 8px;
    font-weight: bold;
    color: #92400e;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline;
    position: relative;
    box-shadow: 0 1px 2px rgba(245, 158, 11, 0.2);
    font-size: inherit;
    line-height: 1;
    vertical-align: baseline;
}

.story-blank-button:hover,
.explanation-blank-button:hover {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-color: #d97706;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

/* 開示しただけの状態（通常クリック）- 黄色 */
.story-blank-button.opened,
.explanation-blank-button.opened {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-color: #d97706;
    color: #92400e;
}

.story-blank-button.opened:hover,
.explanation-blank-button.opened:hover {
    background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
    border-color: #b45309;
    color: #78350f;
}

/* チェック済みの状態（右クリック固定）- 緑色 */
.story-blank-button.revealed,
.explanation-blank-button.revealed {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #10b981;
    color: #047857;
}

.story-blank-button.revealed:hover,
.explanation-blank-button.revealed:hover {
    background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
    border-color: #059669;
    color: #064e3b;
}

/* 条文を含む穴埋めボタンの特別スタイル */
.story-blank-button.article-blank,
.explanation-blank-button.article-blank {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-color: #3b82f6;
    color: #1e40af;
}

.story-blank-button.article-blank:hover,
.explanation-blank-button.article-blank:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: #1d4ed8;
    color: #ffffff;
}

/* 条文ボタンが開示しただけの状態 - 黄色 */
.story-blank-button.article-blank.opened,
.explanation-blank-button.article-blank.opened {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-color: #d97706;
    color: #92400e;
    pointer-events: none; /* 穴埋めボタン自体は無効化 */
}

.story-blank-button.article-blank.opened:hover,
.explanation-blank-button.article-blank.opened:hover {
    background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
    border-color: #b45309;
    color: #78350f;
}

/* 条文ボタンがチェック済みの状態 - 緑色 */
.story-blank-button.article-blank.revealed,
.explanation-blank-button.article-blank.revealed {
    background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
    border-color: #2563eb;
    color: #1e3a8a;
    pointer-events: none; /* 穴埋めボタン自体は無効化 */
}

.story-blank-button.article-blank.revealed:hover,
.explanation-blank-button.article-blank.revealed:hover {
    background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
    border-color: #1d4ed8;
    color: #1e3a8a;
}

/* 穴埋めボタン内の条文参照ボタンは有効にする */
.story-blank-button.revealed .article-ref-btn,
.explanation-blank-button.revealed .article-ref-btn,
.story-blank-button.opened .article-ref-btn,
.explanation-blank-button.opened .article-ref-btn {
    pointer-events: auto !important;
    cursor: pointer !important;
}

.blank-placeholder {
    font-family: inherit;
    font-size: 0.9em;
    letter-spacing: 0.5px;
}

.blank-answer {
    font-weight: bold;
    font-size: inherit;
}
`;
document.head.appendChild(chatBubbleCSS);

// グローバル関数として showArticlePanel を利用可能にする
window.showArticlePanel = showArticlePanel;
window.deleteTodayStudyRecord = deleteTodayStudyRecord;

// ★★★ homePage.jsのRANK_COLORSを使用したランク設定関数 ★★★
function getRankConfigForTailwind(rank) {
    // homePage.jsのRANK_COLORSが利用可能かチェック
    if (window.getRankColor && typeof window.getRankColor === 'function') {
        const colorInfo = window.getRankColor(rank);
        if (colorInfo && colorInfo.bgColor !== '#f9fafb') {
            // RANK_COLORSの色をインラインスタイル形式で返す（homePage.jsと完全一致）
            return {
                color: colorInfo.color,
                bgColor: colorInfo.bgColor,
                borderColor: colorInfo.borderColor,
                label: rank // 「ランクA」ではなく「A」のみ
            };
        }
    }
    
    // フォールバック（homePage.jsが読み込まれていない場合）
    const fallbackColors = {
        'S': { color: '#ffffff', bgColor: '#dc2626', borderColor: '#b91c1c', label: 'S' },
        'A': { color: '#ffffff', bgColor: '#ea580c', borderColor: '#c2410c', label: 'A' },
        'B': { color: '#ffffff', bgColor: '#2563eb', borderColor: '#1d4ed8', label: 'B' },
        'C': { color: '#ffffff', bgColor: '#16a34a', borderColor: '#15803d', label: 'C' }
    };
    
    return fallbackColors[rank] || { color: '#6b7280', bgColor: '#f9fafb', borderColor: '#6b7280', label: '' };
}

/**
 * ケースIDから相対パスを取得する
 * @param {string} caseId - ケースID
 * @returns {string|null} - 相対パス（例: "商法/3.機関/3.1-8.js"）
 */
function getRelativePathFromCaseId(caseId) {
    console.log('getRelativePathFromCaseId: caseId =', caseId);
    
    // fallbackとして現在のcaseLoadersから推測
    const currentLoaders = window.caseLoaders || caseLoaders;
    console.log('getRelativePathFromCaseId: currentLoaders keys =', Object.keys(currentLoaders));
    
    for (const [loaderKey, loader] of Object.entries(currentLoaders)) {
        if (loaderKey === caseId) {
            // ローダーキーを基に相対パスを推測
            const relativePath = loaderKey + '.js';
            console.log('getRelativePathFromCaseId: 推測された相対パス =', relativePath);
            return relativePath;
        }
    }
    
    // 見つからない場合は、caseIdをそのまま相対パスとして使用（.jsを付与）
    if (caseId && !caseId.endsWith('.js')) {
        const fallbackPath = caseId + '.js';
        console.log('getRelativePathFromCaseId: fallback path =', fallbackPath);
        return fallbackPath;
    }
    
    console.warn('getRelativePathFromCaseId: 相対パス取得失敗');
    return null;
}

/**
 * 現在のケースの相対パスを取得する（非同期版）
 * @returns {Promise<string|null>} - 相対パス
 */
async function getCurrentCaseRelativePath() {
    if (!window.currentCaseData) {
        console.warn('getCurrentCaseRelativePath: currentCaseData が存在しません');
        return null;
    }
    
    // currentCaseDataからIDを取得
    const caseId = window.currentCaseData.id;
    if (!caseId) {
        console.warn('getCurrentCaseRelativePath: caseId が存在しません', window.currentCaseData);
        return null;
    }
    
    console.log('getCurrentCaseRelativePath: caseId =', caseId);
    
    // caseSummariesから正確な相対パスを取得
    try {
        const { caseSummaries } = await import('../cases/index.js');
        const caseInfo = caseSummaries.find(c => c.id === caseId || c.originalId === caseId);
        console.log('getCurrentCaseRelativePath: caseInfo =', caseInfo);
        if (caseInfo && caseInfo.filePath) {
            console.log('getCurrentCaseRelativePath: 相対パス取得成功 =', caseInfo.filePath);
            return caseInfo.filePath;
        }
    } catch (error) {
        console.warn('caseSummariesからの相対パス取得に失敗:', error);
    }
    
    // fallbackとしてIDベースの推測
    const fallbackPath = getRelativePathFromCaseId(caseId);
    console.log('getCurrentCaseRelativePath: fallback =', fallbackPath);
    return fallbackPath;
}

/**
 * 現在のケースの相対パスを取得する（同期版・fallback用）
 * @returns {string|null} - 相対パス
 */
function getCurrentCaseRelativePathSync() {
    if (!window.currentCaseData) {
        return null;
    }
    
    const caseId = window.currentCaseData.id;
    if (!caseId) {
        return null;
    }
    
    return getRelativePathFromCaseId(caseId);
}

/**
 * ケース詳細を読み込み、表示する
 * @param {string} caseId - 表示するケースのID
 * @param {boolean} updateHistory - URL履歴を更新するかどうか
 */
export async function loadAndRenderCase(caseId, updateHistory = true) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="flex justify-center items-center p-20"><div class="loader"></div></div>`;
    
    // ★★★ キャッシュされたケースデータがあればそれを使用 ★★★
    if (window.caseModules && window.caseModules[caseId]) {
        console.log('✅ キャッシュからケースデータを読み込み:', caseId);
        window.currentCaseData = window.caseModules[caseId];
        window.currentCaseData.id = caseId; // 相対パスベースのIDを明示的に設定
        
        if (updateHistory) {
            const newUrl = `#/case/${caseId}`;
            history.pushState({ page: 'case', caseId: caseId }, window.currentCaseData.title, newUrl);
        }
        
        await renderCaseDetail();
        return;
    }
    
    // window.caseLoaders があればそれを使用（目次再生成後の更新されたローダー）
    const currentLoaders = window.caseLoaders || caseLoaders;
    const loader = currentLoaders[caseId];
    if (!loader) {
        console.error('ローダーが見つかりません:', caseId, Object.keys(currentLoaders));
        const { renderHome } = await import('./homePage.js');
        await renderHome();
        return;
    }

    try {
        const caseModule = await loader();
        window.currentCaseData = caseModule.default;
        window.currentCaseData.id = caseId; // 相対パスベースのIDを明示的に設定
        console.log('loadAndRenderCase: currentCaseData loaded:', {
            id: window.currentCaseData.id,
            title: window.currentCaseData.title,
            hasStory: !!window.currentCaseData.story,
            storyLength: window.currentCaseData.story?.length || 0,
            storyType: typeof window.currentCaseData.story
        });

        if (updateHistory) {
            const newUrl = `#/case/${caseId}`;
            history.pushState({ page: 'case', caseId: caseId }, window.currentCaseData.title, newUrl);
        }
        
        await renderCaseDetail();
    } catch (error) {
        console.error('判例データの読み込みに失敗しました:', error);
        const { renderHome } = await import('./homePage.js');
        await renderHome();
    }
}

async function renderCaseDetail() {
    document.title = `${window.currentCaseData.title} - あたしンちの世界へGO！`;
    const caseInfo = window.currentCaseData;

    const app = document.getElementById('app');
      app.innerHTML = `
        <div class="mb-6 flex justify-between items-center">
            <button id="back-to-home" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">← ホームに戻る</button>
            <div class="flex items-center space-x-3">
                <button id="regenerate-case-index" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">🔄 目次再生成</button>
                <div class="text-sm text-gray-600" id="user-info-case">
                    <!-- ユーザー情報が表示される -->
                </div>
                <button id="logout-btn-case" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition-all">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    ログアウト
                </button>
                <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">📖 条文表示</button>
            </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <header class="text-center border-b pb-4 mb-6">
                <p class="text-gray-500">${caseInfo.citation}</p>
                <h2 class="text-3xl md:text-4xl font-extrabold text-yellow-700">${caseInfo.title}</h2>
            </header>            <div class="flex flex-wrap justify-center border-b mb-6">                <button class="tab-button p-4 flex-grow text-center text-gray-600 active gentle-rotate-on-hover" data-tab="story">📖 ストーリー</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600 sparkle-effect" data-tab="explanation">🤔 解説</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600 heartbeat" data-tab="speed-quiz">⚡ スピード条文</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600 soft-bounce-on-hover" data-tab="essay">✍️ 論文トレーニング</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600 sparkle-effect" data-tab="qa-list">📝 Q&A</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600 heartbeat" data-tab="quiz">✏️ ミニ論文</button>
            </div>
            <div id="tab-content"></div>
        </div>    `;
    
    // ★★★ 保存されたタブ状態を復元（F5更新対応） ★★★
    const savedTab = getSavedTab();
    await renderTabContent(savedTab);
    
    // ★★★ スピード条文用データを事前読み込み ★★★
    if (window.currentCaseData) {
        setTimeout(() => {
            console.log('🚀 スピード条文データの事前読み込みを開始');
            if (typeof initializeSpeedQuizData === 'function') {
                initializeSpeedQuizData(window.currentCaseData);
            } else {
                console.log('⚠️ initializeSpeedQuizData関数が見つかりません。speedQuiz.jsの読み込みを確認してください。');
            }
        }, 100);
    }
    
    // ★★★ ページ固有のイベントリスナー設定 ★★★
    setupCasePageEventListeners();
}

/**
 * casePageのイベントリスナーを設定
 */
function setupCasePageEventListeners() {
    // 目次再生成ボタン
    const regenerateBtn = document.getElementById('regenerate-case-index');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', handleCaseIndexRegeneration);
    }
    
    // ホームに戻るボタン（既存の動作を維持）
    const backBtn = document.getElementById('back-to-home');
    if (backBtn) {
        backBtn.addEventListener('click', async () => {
            // 現在のモジュール表示を保存
            const modulesContainer = document.querySelector('#modules-container');
            window.savedModulesContainer = modulesContainer ? modulesContainer.innerHTML : '';
            
            // renderHomeを特別モードで呼び、モジュール表示を復元
            const { renderHome } = await import('./homePage.js');
            await renderHome(false, 'restore-modules');
        });
    }
}

export async function renderTabContent(tabName) {
    console.log(`🔄 タブ表示: ${tabName}`);
    
    // ★★★ タブ状態をlocalStorageに保存（F5更新対応） ★★★
    saveCurrentTab(tabName);
    
    const contentDiv = document.getElementById('tab-content');
    // 既存のタブコンテンツがあるかチェック
    let storyTab = document.getElementById('tab-story-content');
    // lawsの有無で毎回判定（初回以外も含む）
    const hasSpeedQuiz = Array.isArray(window.currentCaseData.laws) && window.currentCaseData.laws.length > 0;
    // 初回の場合、全てのタブコンテンツを作成
    if (!storyTab) {
        console.log('📝 タブコンテンツ初期作成');
        // グローバルQ&Aポップアップコンテナを作成（初回のみ）
        createGlobalPopupContainer();
        const storyHtml = buildStoryHtml(window.currentCaseData.story);
        const processedStoryHtml = storyHtml; // buildStoryHtml内で既に処理済み
        const explanationHtml = (window.currentCaseData.explanation && window.currentCaseData.explanation.trim()) ? window.currentCaseData.explanation : '<div class="text-center text-gray-400">解説はありません</div>';
        // 解説の処理：先に条文参照処理を行い、その後で空欄機能を追加
        const referenceProcessedExplanationHtml = processAllReferences(explanationHtml, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
        const processedExplanationHtml = processContentBlanks(referenceProcessedExplanationHtml, 'explanation', 'explanation');
        // ★★★ 論文トレーニングが無い場合はタブ自体を省略 ★★★
        const hasEssay = window.currentCaseData.essay && window.currentCaseData.essay.question;
        let essayTabButton = hasEssay ? `<button class="tab-button p-4 flex-grow text-center text-gray-600 soft-bounce-on-hover" data-tab="essay">✍️ 論文トレーニング</button>` : '';
        let essayTabContent = hasEssay ? `<div id="tab-essay-content" class="tab-content-panel hidden"></div>` : '';
        // ★★★ スピード条文タブは常に表示（中身は初期化関数で制御）★★★
        const speedQuizTabButton = `<button class="tab-button p-4 flex-grow text-center text-gray-600 heartbeat" data-tab="speed-quiz">⚡ スピード条文</button>`;
        const speedQuizTabContent = `<div id="tab-speed-quiz-content" class="tab-content-panel hidden"></div>`;
        // Q&Aタブ
        const qaTabButton = `<button class="tab-button p-4 flex-grow text-center text-gray-600 sparkle-effect" data-tab="qa-list">📝 Q&A</button>`;
        let qaTabContent = `<div id="tab-qa-list-content" class="tab-content-panel hidden"></div>`;
        
        // ★★★ 復元されるタブに応じて初期アクティブ状態を決定 ★★★
        const getSavedTabInner = () => {
            try {
                const caseId = window.currentCaseData?.caseId || 'unknown';
                const key = `currentTab_${caseId}`;
                const savedTab = localStorage.getItem(key);
                const validTabs = ['story', 'explanation', 'quiz', 'speed-quiz', 'qa-list', 'essay'];
                if (savedTab && validTabs.includes(savedTab)) {
                    return savedTab;
                }
                return 'story';
            } catch (error) {
                return 'story';
            }
        };
        const savedTab = getSavedTabInner();
        const getTabButtonClass = (tabName) => {
            const baseClass = "tab-button p-4 flex-grow text-center text-gray-600";
            const activeClass = tabName === savedTab ? " active" : "";
            // すべてのタブに統一したシンプルなアニメーション
            const effectClass = " simple-tab-hover";
            return baseClass + activeClass + effectClass;
        };
        
        // タブボタン
        const tabButtons = `
            <button class="${getTabButtonClass('story')}" data-tab="story">📖 ストーリー</button>
            <button class="${getTabButtonClass('explanation')}" data-tab="explanation">🤔 解説</button>
            <button class="${getTabButtonClass('quiz')}" data-tab="quiz">✏️ ミニ論文</button>
            <button class="${getTabButtonClass('speed-quiz')}" data-tab="speed-quiz">⚡ スピード条文</button>
            <button class="${getTabButtonClass('qa-list')}" data-tab="qa-list">📝 Q&A</button>
            ${hasEssay ? `<button class="${getTabButtonClass('essay')}" data-tab="essay">✍️ 論文トレーニング</button>` : ''}
        `;
        // タブ本体
        contentDiv.innerHTML = `
            <div id="tab-story-content" class="tab-content-panel hidden">
                <div class="p-4">
                    <div class="mb-4 flex justify-between items-center">
                        <div class="flex gap-2">
                            <button id="hide-blanks-btn" class="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded hidden">🔒 穴埋めを隠す</button>
                            <button id="show-blanks-btn" class="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded hidden">🔓 穴埋めを表示</button>
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="start-into-btn" class="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-1 px-3 rounded">🧩 INTO</button>
                            <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文表示</button>
                        </div>
                    </div>
                    ${processedStoryHtml}
                    
                    <!-- ストーリーQ&A対話セクション -->
                    <div class="mt-8 border-t pt-6">
                        <div class="input-form">
                            <textarea id="story-question-input" class="w-full h-32 p-4 border rounded-lg focus-ring" placeholder="キャラクターと対話する内容を入力してください..."></textarea>
                            <div class="text-right mt-4">
                                <button class="start-chat-btn bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-type="story">対話を始める</button>
                            </div>
                        </div>
                        <div class="chat-area" id="chat-area-story"></div>
                    </div>
                    
                    <!-- 学習記録セクション -->
                    <div class="mt-8 border-t pt-6">
                        <div class="text-center">
                            <div id="study-record-status" class="mb-4 text-sm"></div>
                            <button id="record-study-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover">
                                📝 今日の学習を記録する
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="tab-explanation-content" class="tab-content-panel hidden">
                <div class="p-4">
                    <div class="mb-4 flex justify-between items-center">
                        <div class="flex gap-2">
                            <button id="hide-explanation-blanks-btn" class="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded hidden">🔒 穴埋めを隠す</button>
                            <button id="show-explanation-blanks-btn" class="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded hidden">🔓 穴埋めを表示</button>
                        </div>
                        <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文表示</button>
                    </div>
                    ${processedExplanationHtml}
                </div>
            </div>
            <div id="tab-quiz-content" class="tab-content-panel hidden"></div>
            ${speedQuizTabContent}
            ${qaTabContent}
            ${essayTabContent}
            <div class="flex justify-center gap-2 mt-6 mb-2">${tabButtons}</div>
        `;
        // タブボタンも論文トレーニングが無い場合は省略
        const parent = contentDiv.parentElement;
        if (parent) {
            const tabBar = parent.querySelector('.flex.flex-wrap.border-b');
            if (tabBar) tabBar.innerHTML = tabButtons;
        }
          // 条文参照ボタンのイベントリスナーを設定
        setupArticleRefButtons(contentDiv);
        
        // ストーリー内穴埋めボタンのイベントリスナーを設定
        setupStoryBlankButtons(contentDiv);
        
    // 解説固定状態のローカルキャッシュをリセット
    window.explanationBlankLocks = {};

        // 解説内穴埋めボタンのイベントリスナーを設定
        setupExplanationBlankButtons(contentDiv);
        
        // ストーリーチェック状態を復元（非同期）
        await restoreStoryCheckStates(contentDiv);

    // 解説固定状態を復元（非同期）
    await restoreExplanationCheckStates(contentDiv);

        // INTOボタンのイベント
        const intoBtn = document.getElementById('start-into-btn');
        if (intoBtn) {
            intoBtn.addEventListener('click', () => {
                if (window.startIntoMode) {
                    window.startIntoMode(window.currentCaseData);
                } else {
                    console.error('intoMode が読み込まれていません');
                }
            });
        }
        
        // 学習記録ボタンのイベントリスナーを設定
        setupStudyRecordButton();
        
        // スピード条文タブの初期描画
        if (hasSpeedQuiz) {
            initializeSpeedQuizContent();
        }
    }
      // 全てのタブを非表示にする
    document.querySelectorAll('.tab-content-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // ★★★ タブボタンのアクティブ状態を更新 ★★★
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // ★★★ タブ切り替え時に全てのQ&Aポップアップを閉じる ★★★
    if (window.qaPopupState) {
        console.log(`🧹 タブ切り替えのため全Q&Aポップアップを閉じます: ${tabName}`);
        window.qaPopupState.clearAll();
    }
      // 指定されたタブのみを表示
    const targetTab = document.getElementById(`tab-${tabName}-content`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        // Q&Aタブなら再描画（async IIFEでawaitを許可）
        if (tabName === 'qa-list' && window.currentCaseData.questionsAndAnswers) {
            (async () => {
                // 既存のコンテンツをクリア
                targetTab.innerHTML = '';
                
                // 統一されたQ&A表示機能を使用
                const { renderQAList, setupQAListEventHandlers } = await import('../qaRenderer.js');
                
                const html = await renderQAList({
                    qaList: window.currentCaseData.questionsAndAnswers,
                    moduleId: window.currentCaseData.id,
                    showModuleLink: false,
                    title: 'Q&Aリスト',
                    idPrefix: 'case-qa'
                });
                
                const qaContainer = document.createElement('div');
                qaContainer.innerHTML = html;
                targetTab.appendChild(qaContainer);
                
                setupQAListEventHandlers(qaContainer);
            })();
        }
        // スピード条文タブなら再描画
        if (tabName === 'speed-quiz') {
            // data-initialized属性を毎回リセットして必ず再描画
            const speedQuizContainer = document.getElementById('tab-speed-quiz-content');
            if (speedQuizContainer) speedQuizContainer.removeAttribute('data-initialized');
            initializeSpeedQuizContent();
        }
        // ★★★ ミニ論文タブなら初期化 ★★★
        if (tabName === 'quiz') {
            initializeQuizContent();
        }
        // ★★★ 条文・Q&Aボタンのイベントリスナーを再設定 ★★★
        console.log(`🔧 タブ切り替え時のボタン再設定開始: ${tabName}`);
        const qaButtons = targetTab.querySelectorAll('.qa-ref-btn');
        console.log(`📋 タブ ${tabName} 内のQ&Aボタン: ${qaButtons.length}個`);
        setupArticleRefButtons(targetTab);
        
        // ★★★ 遅延読み込みされたQ&Aボタンにも対応 ★★★
        setTimeout(() => {
            console.log(`🔧 遅延設定: ${tabName}タブの追加Q&Aボタンをチェック`);
            const newQaButtons = targetTab.querySelectorAll('.qa-ref-btn');
            console.log(`📋 遅延チェック: ${newQaButtons.length}個のQ&Aボタンを確認`);
            if (newQaButtons.length !== qaButtons.length) {
                console.log('🔄 新しいQ&Aボタンが見つかったため、再設定します');
                setupArticleRefButtons(targetTab);
            }
        }, 200);
        
        // Q&Aポップアップを復元
        if (window.qaPopupState) {
            window.qaPopupState.restorePopups();
        }
        
        // ★★★ 全体のレンダリング完了後にQ&Aボタンの色を最終更新 ★★★
        setTimeout(() => {
            if (window.qaStatusSystem) {
            }
        }, 300);
    }
}

// ★★★ 修正版：ミニ論文コンテンツ初期化（ランク付け表示対応） ★★★
async function initializeQuizContent() {
    const quizContainer = document.getElementById('tab-quiz-content');
    if (!quizContainer || quizContainer.hasAttribute('data-initialized')) return;

    let html = '<div class="space-y-8 p-4">';
    
    // 条文表示ボタンを追加
    html += `
        <div class="text-right mb-4">
            <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文</button>
        </div>
    `;
    
    if (window.currentCaseData.quiz && window.currentCaseData.quiz.length > 0) {
        // 柔軟な小問配列対応
        const quizArr = window.currentCaseData.quiz;
        if (Array.isArray(quizArr) && quizArr.length > 0) {
            // quiz[0]がsubProblemsを持たない場合、quiz自体が小問配列とみなす
            if (!quizArr[0].subProblems && quizArr.every(q => q.problem)) {
                // 小問のみ
                html += `
                    <div class="bg-white border-2 border-blue-200 rounded-xl shadow-lg p-6">
                        <div class="space-y-6">
                            ${quizArr.map((subProblem, idx) => generateSubProblems({ ...subProblem, subProblems: undefined }, idx)).join('')}
                        </div>
                    </div>
                `;
            } else {
                // 通常の大問形式
                for (let quizIndex = 0; quizIndex < quizArr.length; quizIndex++) {
                    const quizGroup = quizArr[quizIndex];
                    
                    // ★★★ 大問のランク表示 ★★★
                    const groupRank = quizGroup.rank || 'C';
                    const rankConfig = getRankConfigForTailwind(groupRank);
                    
                    html += `
                        <div class="quiz-group-container bg-white border-2" style="border-color: ${rankConfig.borderColor};" id="quiz-group-${quizIndex}">
                            <div class="quiz-group-header">
                                <div class="quiz-group-header-content">
                                    <h3 class="quiz-group-title">【大問 ${quizIndex + 1}】${quizGroup.title || 'ミニ論文問題'}</h3>
                                    <span class="quiz-group-rank" style="color: ${rankConfig.color}; background-color: ${rankConfig.bgColor}; border-color: ${rankConfig.borderColor};">${rankConfig.label}</span>
                                </div>
                            </div>
                            
                            <!-- 大問の事例・背景 -->
                            ${quizGroup.background ? `
                                <div class="quiz-background">
                                    <div class="quiz-background-content">
                                        <h4>事例</h4>
                                        <div class="text-content">${processAllReferences(quizGroup.background, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- 小問一覧 -->
                            <div class="sub-problems">
                                ${generateSubProblems(quizGroup, quizIndex)}
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            html += `<p class="text-center text-gray-500">このモジュールのミニ論文は準備中です。</p>`;
        }
    } else {
        html += `<p class="text-center text-gray-500">このモジュールのミニ論文は準備中です。</p>`;
    }
    html += '</div>';
    
    quizContainer.innerHTML = html;
    quizContainer.setAttribute('data-initialized', 'true');    // 条文参照ボタンのイベントリスナーを設定
    setupArticleRefButtons(quizContainer);
      // 「過去の回答」ボタンにイベントリスナーを設定
    setupPastAnswersButtons(quizContainer);
    
    // ヒント・ポイントボタンのイベントリスナーを設定
    setupToggleButtons(quizContainer);
    
    // 新システムの「答案を入力する」ボタンのイベントハンドラを設定
    setupNewAnswerModeButtons(quizContainer);
}

// ★★★ 小問生成関数（ランク付け表示対応） ★★★
function generateSubProblems(quizGroup, quizIndex) {    
    // 旧形式との互換性を保つ
    if (quizGroup.problem && !quizGroup.subProblems) {
        // 旧形式：単一問題
        const problemRank = quizGroup.rank || 'C';
        const rankConfig = getRankConfigForTailwind(problemRank);
        
        // ★★★ 旧形式でもヒントとポイントに対応 ★★★
        let hintHtml = '';
        if (quizGroup.hint) {
            hintHtml = `
                <div class="mb-4">
                    <button type="button" class="toggle-hint-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-1 px-3 rounded border border-yellow-300 text-sm mb-2">💡 ヒントを表示</button>
                    <div class="hint-content bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2 hidden">
                        <h5 class="font-bold text-yellow-800 mb-2">💡 ヒント</h5>
                        <p class="text-sm text-yellow-700">${processAllReferences(quizGroup.hint, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</p>
                    </div>
                </div>
            `;
        }

        let pointsHtml = '';
        if (quizGroup.points && Array.isArray(quizGroup.points) && quizGroup.points.length > 0) {
            const processedPoints = quizGroup.points.map(point => 
                processAllReferences(point, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []))
            ;
            
            pointsHtml = `
                <div class="mb-4">
                    <button type="button" class="toggle-points-btn bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1 px-3 rounded border border-green-300 text-sm mb-2">📝 答案に含めるべきポイントを表示</button>
                    <div class="points-content bg-green-50 p-3 rounded-lg border border-green-200 mt-2 hidden">
                        <h5 class="font-bold text-green-800 mb-2">📝 答案に含めるべきポイント</h5>
                        <ul class="list-disc list-inside space-y-1">
                            ${processedPoints.map(point => `<li class="text-sm text-green-700">${point}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="sub-problem-item" id="subproblem-${quizIndex}-0">
                <div class="sub-problem-header">
                    <h4 class="sub-problem-title">問題</h4>
                    <span class="sub-problem-rank" style="color: ${rankConfig.color}; background-color: ${rankConfig.bgColor}; border-color: ${rankConfig.borderColor};">${rankConfig.label}</span>
                </div>
                
                <div class="sub-problem-content bg-gray-100 p-4 rounded-lg problem-text">${processAllReferences(quizGroup.problem, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
                
                ${hintHtml}
                ${pointsHtml}
                
                <!-- 過去の回答表示エリア -->
                <div id="past-answers-area-${quizIndex}-0" class="mb-4 hidden"></div>
                
                <div class="sub-problem-actions">
                    <button class="view-past-answers-btn action-btn secondary" data-case-id="${window.currentCaseData.id}" data-problem-type="quiz" data-problem-index="${quizIndex}-0">📝 過去の回答</button>
                    <button class="enter-answer-mode-btn action-btn" data-quiz-index="${quizIndex}" data-sub-index="0">✏️ 答案を入力する</button>
                </div>
                
                <div class="chat-area" id="chat-area-quiz-${quizIndex}-0"></div>
            </div>
        `;
    }
      // 新形式：複数小問（ランク付け表示対応）
    return quizGroup.subProblems.map((subProblem, subIndex) => {
        const subRank = subProblem.rank || quizGroup.rank || 'C';
        const rankConfig = getRankConfigForTailwind(subRank);
          // ★★★ ランクは単純に表示、Q&Aボタンは別途作成 ★★★
        let qaButtonsHtml = '';        if (subProblem.relatedQAs && subProblem.relatedQAs.length > 0) {
            if (Array.isArray(window.currentCaseData.questionsAndAnswers)) {
                qaButtonsHtml = subProblem.relatedQAs.map(qNum => {
                    // idでQ&Aを検索（配列インデックスではなく）
                    const qa = window.currentCaseData.questionsAndAnswers.find(q => q.id === qNum);
                    if (!qa) {
                        console.warn(`Q&A id:${qNum} が見つかりません`);
                        return '';
                    }
                    // 実際の配列インデックスを取得
                    const qaIndex = window.currentCaseData.questionsAndAnswers.indexOf(qa);
                    const presentation = buildQAButtonPresentation({ qaItem: qa, fallbackNumber: qNum });
                    return `<button type="button" class="qa-ref-btn inline-block px-2 py-1 rounded text-sm font-bold border transition-colors cursor-pointer mx-1" data-qa-index="${qaIndex}" data-quiz-index="${quizIndex}" data-sub-index="${subIndex}" data-q-number="${presentation.number}" title="${escapeAttr(presentation.title)}">${presentation.badgeHTML}</button>`;
                }).join(' ');

                // Q&Aボタンがある場合は、上下にスペースを追加
                qaButtonsHtml = `<div class="mb-4 flex items-center gap-1"><span class="text-xs text-gray-600 font-medium">関連Q&A:</span> ${qaButtonsHtml}</div>`;
            }
        }// ★★★ ヒントはデフォルト非表示、ボタンで開閉 ★★★
        let hintHtml = '';
        if (subProblem.hint) {
            hintHtml = `
                <div class="mb-4">
                    <button type="button" class="toggle-hint-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-1 px-3 rounded border border-yellow-300 text-sm mb-2">💡 ヒントを表示</button>
                    <div class="hint-content bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2 hidden">
                        <h5 class="font-bold text-yellow-800 mb-2">💡 ヒント</h5>
                        <p class="text-sm text-yellow-700">${processAllReferences(subProblem.hint, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</p>
                    </div>
                </div>
            `;
        }

        // ★★★ 答案に含めるべきポイント（pointsをQ&A参照として処理） ★★★
        let pointsHtml = '';
        if (subProblem.points && Array.isArray(subProblem.points) && subProblem.points.length > 0) {
            const processedPoints = subProblem.points.map(point => 
                processAllReferences(point, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []))
            ;
            
            pointsHtml = `
                <div class="mb-4">
                    <button type="button" class="toggle-points-btn bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1 px-3 rounded border border-green-300 text-sm mb-2">📝 答案に含めるべきポイントを表示</button>
                    <div class="points-content bg-green-50 p-3 rounded-lg border border-green-200 mt-2 hidden">
                        <h5 class="font-bold text-green-800 mb-2">📝 答案に含めるべきポイント</h5>
                        <ul class="list-disc list-inside space-y-1">
                            ${processedPoints.map(point => `<li class="text-sm text-green-700">${point}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }        return `
            <div class="sub-problem-item" id="subproblem-${quizIndex}-${subIndex}">
                <div class="sub-problem-header">
                    <h4 class="sub-problem-title">小問 ${subIndex + 1}${subProblem.title ? `: ${subProblem.title}` : ''}</h4>
                    <span class="sub-problem-rank" style="color: ${rankConfig.color}; background-color: ${rankConfig.bgColor}; border-color: ${rankConfig.borderColor};">${rankConfig.label}</span>
                </div>
                
                ${qaButtonsHtml}
                
                <div class="sub-problem-content bg-gray-100 p-4 rounded-lg problem-text">${processAllReferences(subProblem.problem, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
                
                ${hintHtml}
                ${pointsHtml}
                
                <!-- 過去の回答表示エリア -->
                <div id="past-answers-area-${quizIndex}-${subIndex}" class="mb-4 hidden"></div>
                
                <div class="sub-problem-actions">
                    <button class="view-past-answers-btn action-btn secondary" data-case-id="${window.currentCaseData.id}" data-problem-type="quiz" data-problem-index="${quizIndex}-${subIndex}">📝 過去回答</button>
                    <button class="enter-answer-mode-btn action-btn" data-quiz-index="${quizIndex}" data-sub-index="${subIndex}">✏️ 答案を入力する</button>
                </div>
                
                <div class="chat-area" id="chat-area-quiz-${quizIndex}-${subIndex}"></div>
            </div>
        `;
    }).join('');
}

function setupPastAnswersButtons(container) {
    container.querySelectorAll('.view-past-answers-btn').forEach(button => {
        button.addEventListener('click', function() {
            const { caseId, problemType, problemIndex } = this.dataset;
            const area = document.getElementById(`past-answers-area-${problemIndex}`);
            if (area) {
                const isHidden = area.classList.toggle('hidden');
                if (!isHidden) {
                    area.innerHTML = displayPastAnswers(caseId, problemType, problemIndex);
                }
                this.textContent = isHidden ? '📝 過去の回答' : '📝 回答を隠す';
            }
        });
    });
}

// ★★★ ヒント・ポイントボタンのイベントリスナーを設定 ★★★
function setupToggleButtons(container) {
    // ヒント表示ボタン
    container.querySelectorAll('.toggle-hint-btn').forEach(button => {
        // 既存のイベントリスナーを削除（重複を避けるため）
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function() {
            const hintContent = this.nextElementSibling;
            if (hintContent && hintContent.classList.contains('hint-content')) {
                const isHidden = hintContent.classList.toggle('hidden');
                this.textContent = isHidden ? '💡 ヒントを表示' : '💡 ヒントを隠す';
            }
        });
    });
    
    // 答案ポイント表示ボタン
    container.querySelectorAll('.toggle-points-btn').forEach(button => {
        // 既存のイベントリスナーを削除（重複を避けるため）
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function() {
            const pointsContent = this.nextElementSibling;
            if (pointsContent && pointsContent.classList.contains('points-content')) {
                const isHidden = pointsContent.classList.toggle('hidden');
                this.textContent = isHidden ? '📝 答案に含めるべきポイントを表示' : '📝 答案に含めるべきポイントを隠す';
                
                // ポイント内の条文参照ボタンのイベントリスナーを設定
                if (!isHidden) {
                    setupArticleRefButtons(pointsContent);
                }
            }
        });
    });
}

async function initializeEssayContent() {
    const essayContainer = document.getElementById('tab-essay-content');
    if (!essayContainer || essayContainer.hasAttribute('data-initialized')) return;
    
    if (!window.currentCaseData.essay || !window.currentCaseData.essay.question) {
        essayContainer.innerHTML = `<div class="p-4"><p class="text-center text-gray-500">この判例の論文トレーニングは準備中です。</p></div>`;
        return;
    }
    
    const pastLogs = await ApiService.fetchCaseLearningLogs(window.currentCaseData.id, 'essay', null);
    
    // ★★★ 論文でもヒントとポイントを表示 ★★★
    let hintHtml = '';
    if (window.currentCaseData.essay.hint) {
        hintHtml = `
            <div class="mb-4">
                <button type="button" class="toggle-hint-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-1 px-3 rounded border border-yellow-300 text-sm mb-2">💡 ヒントを表示</button>
                <div class="hint-content bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2 hidden">
                    <h5 class="font-bold text-yellow-800 mb-2">💡 ヒント</h5>
                    <p class="text-sm text-yellow-700">${processAllReferences(window.currentCaseData.essay.hint, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</p>
                </div>
            </div>
        `;
    }

    let pointsHtml = '';
    if (window.currentCaseData.essay.points && Array.isArray(window.currentCaseData.essay.points) && window.currentCaseData.essay.points.length > 0) {
        const processedPoints = window.currentCaseData.essay.points.map(point => 
            processAllReferences(point, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []))
        ;
        
        pointsHtml = `
            <div class="mb-4">
                <button type="button" class="toggle-points-btn bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1 px-3 rounded border border-green-300 text-sm mb-2">📝 答案に含めるべきポイントを表示</button>
                <div class="points-content bg-green-50 p-3 rounded-lg border border-green-200 mt-2 hidden">
                    <h5 class="font-bold text-green-800 mb-2">📝 答案に含めるべきポイント</h5>
                    <ul class="list-disc list-inside space-y-1">
                        ${processedPoints.map(point => `<li class="text-sm text-green-700">${point}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    essayContainer.innerHTML = `
        <div class="prose-bg p-6 rounded-xl shadow-sm" id="essay-container">
            <div class="flex justify-between items-start mb-4">
                <h4 class="text-xl font-bold">【論文問題】</h4>                <div class="flex gap-2">
                    <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded">📖 条文</button>
                    <button class="view-past-answers-btn bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded" data-case-id="${window.currentCaseData.id}" data-problem-type="essay" data-problem-index="">📝 過去の回答</button>
                    ${pastLogs.length > 0 ? `<button class="view-history-btn bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-1 px-3 rounded" data-problem-type="essay" data-problem-index="">📚 学習記録 (${pastLogs.length}件)</button>` : ''}                </div>
            </div>
            <div class="mb-4 bg-gray-100 p-4 rounded-lg">${processAllReferences(window.currentCaseData.essay.question, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
            ${hintHtml}
            ${pointsHtml}
            <!-- 過去回答表示エリア -->
            <div id="past-answers-area-" class="mb-4 hidden"></div>
            <div class="answer-entry-section bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
                <div class="text-center">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        <h4 class="text-lg font-bold text-gray-700 mb-2">答案を作成しましょう</h4>
                        <p class="text-sm text-gray-600 mb-4">専用の答案入力画面で、集中して論述に取り組めます</p>
                    </div>
                    <button class="enter-answer-mode-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200" data-quiz-index="essay" data-sub-index="0">
                        ✏️ 答案を入力する
                    </button>
                </div>
            </div>
            <div id="chat-area-essay" class="chat-area"></div>
        </div>
    `;
    
    essayContainer.setAttribute('data-initialized', 'true');
    
    // 条文参照ボタンのイベントリスナーを設定
    setupArticleRefButtons(essayContainer);
      // 過去回答表示ボタンのイベントリスナーを設定
    setupPastAnswersButtons(essayContainer);
    
    // ヒント・ポイントボタンのイベントリスナーを設定
    setupToggleButtons(essayContainer);
    
    // 新システムの「答案を入力する」ボタンのイベントハンドラを設定
    setupNewAnswerModeButtons(essayContainer);
    
    const startChatButton = essayContainer.querySelector('.start-chat-btn');
    if (startChatButton) {
        startChatButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            startChatSession(this, window.currentCaseData);
        });
    }
}

// ★★★ スピード条文ゲームコンテンツ初期化 ★★★
async function initializeSpeedQuizContent() {
    const speedQuizContainer = document.getElementById('tab-speed-quiz-content');
    if (!speedQuizContainer) return;
    // data-initialized属性は毎回リセット（安定化のため）
    speedQuizContainer.removeAttribute('data-initialized');

    // ★★★ laws/speedQuizArticlesの再生成・初期化を徹底 ★★★
    if (!Array.isArray(window.currentCaseData.laws) || window.currentCaseData.laws.length === 0) {
        // lawsが未定義・空の場合、必要なら再取得・初期化（ここでは空配列で初期化）
        window.currentCaseData.laws = [];
    }
    // speedQuizArticlesも毎回初期化
    window.speedQuizArticles = [];

    try {
        // speedQuiz.jsモジュールを動的インポート
        const { initializeSpeedQuizGame, extractAllArticles } = await import('../speedQuiz.js');
        // 一意のコンテナIDを先に生成
        const gameContainerId = `speed-quiz-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // ゲームのHTMLを設定（一意のIDを使用）
        speedQuizContainer.innerHTML = `
            <div class="p-4">
                <div class="mb-4 text-right">
                    <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文表示</button>
                </div>
                <div id="${gameContainerId}">
                    <!-- スピード条文ゲームのUIがここに追加されます -->
                </div>
            </div>
        `;
        // ★★★ 毎回最新の条文を抽出し直す ★★★
        window.speedQuizArticles = await extractAllArticles(window.currentCaseData);
        console.log('📚 抽出された条文数:', window.speedQuizArticles.length);
        const gameContainer = document.getElementById(gameContainerId);
        if (gameContainer) {
            if (window.speedQuizArticles.length === 0) {
                gameContainer.innerHTML = `
                    <div class="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-yellow-700 font-bold text-lg mb-2">⚠️ 条文が見つかりません</p>
                        <p class="text-yellow-600">このモジュールには条文参照が含まれていないため、<br>スピード条文ゲームをプレイできません。</p>
                    </div>
                `;
            } else {
                // ゲームを初期化
                await initializeSpeedQuizGame(gameContainerId, window.currentCaseData);
            }
        }
        speedQuizContainer.setAttribute('data-initialized', 'true');
        // 条文参照ボタンのイベントリスナーを設定
        setupArticleRefButtons(speedQuizContainer);
        console.log('✅ スピード条文ゲーム初期化完了');
    } catch (error) {
        console.error('❌ スピード条文ゲーム初期化エラー:', error);
        speedQuizContainer.innerHTML = `
            <div class="p-4 text-center">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p class="text-red-600 font-bold">スピード条文ゲームの読み込みに失敗しました</p>
                    <p class="text-red-500 text-sm mt-2">エラー: ${error.message}</p>
                </div>
            </div>
        `;
    }
}

// 答案添削ビューのロード状態管理
// answerCorrectionLoaded変数は削除（answerOverlay.js直接使用のため不要）

// answerCorrectionView.jsは削除されました - answerOverlay.jsを直接使用

/**
 * スクリプトファイルの動的ロード
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // 既に読み込み済みかチェック
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log(`✅ ${src} ロード完了`);
            resolve();
        };
        script.onerror = (error) => {
            console.error(`❌ ${src} ロード失敗:`, error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}



/**
 * ストーリー内の{{}}部分を穴埋め化する
 * @param {string} text - 処理するテキスト
 * @param {number} storyIndex - ストーリー要素のインデックス
 * @returns {string} - 穴埋め化されたHTML
 */
/**
 * テキスト内の{{}}を穴埋めボタンに変換（ストーリーと解説で共用）
 * @param {string} text - 処理するテキスト
 * @param {number|string} contentIndex - コンテンツのインデックス（ストーリーなら数値、解説なら"explanation"）
 * @param {string} contentType - コンテンツの種類（"story" または "explanation"）
 */
function processContentBlanks(text, contentIndex, contentType = 'story') {
    // {{}}で囲まれた部分を見つけて穴埋め化
    let blankCounter = 0;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
        const blankId = `${contentType}-blank-` + Math.random().toString(36).substr(2, 9);
        
        // 条文が含まれているかチェック（【】で囲まれた部分があるかどうか）
        const hasArticle = /【[^】]+】/.test(content);
        const buttonClass = hasArticle ? `${contentType}-blank-button article-blank` : `${contentType}-blank-button`;
        
        // コンテンツ要素とブランクの位置を特定するためのデータ属性を追加
        const blankIndex = blankCounter++;
        
        return `<span class="${contentType}-blank-container"><button class="${buttonClass}" data-blank-id="${blankId}" data-answer="${content}" data-${contentType}-index="${contentIndex}" data-blank-index="${blankIndex}"><span class="blank-placeholder">［？］</span><span class="blank-answer" style="display: none;">${content}</span></button></span>`;
    });
}

/**
 * ストーリーの空欄処理（後方互換性のため）
 */
function processStoryBlanks(text, storyIndex) {
    return processContentBlanks(text, storyIndex, 'story');
}

function enableArticleButtonsWithin(element) {
    if (!element) {
        return;
    }
    const articleButtons = element.querySelectorAll('.article-ref-btn');
    articleButtons.forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.position = 'relative';
        btn.style.zIndex = '10';
    });
}

function ensureExplanationLockStore() {
    if (!window.explanationBlankLocks) {
        window.explanationBlankLocks = {};
    }
}

function getCurrentCaseIdentifier() {
    return window.currentCaseData?.caseId || window.currentCaseData?.id || 'default-case';
}

function parseExplanationCheckString(checkString) {
    if (typeof checkString !== 'string' || checkString.trim() === '') {
        return [];
    }
    return checkString
        .split(',')
        .map(value => (value.trim() === '1' ? 1 : 0));
}

function serializeExplanationCheckArray(array) {
    if (!Array.isArray(array)) {
        return '';
    }
    return array.map(value => (value === 1 ? '1' : '0')).join(',');
}

function getExplanationCheckArrayFromState() {
    if (!window.currentCaseData) {
        return [];
    }
    return parseExplanationCheckString(window.currentCaseData.explanationCheck);
}

function ensureExplanationCheckArrayLength(requiredLength) {
    if (requiredLength <= 0) {
        return [];
    }
    const currentArray = getExplanationCheckArrayFromState();
    while (currentArray.length < requiredLength) {
        currentArray.push(0);
    }
    if (window.currentCaseData) {
        window.currentCaseData.explanationCheck = serializeExplanationCheckArray(currentArray);
    }
    return currentArray;
}

function updateExplanationCheckStateForButton(button, locked) {
    if (!button || !window.currentCaseData) {
        return;
    }
    const blankIndex = parseInt(button.dataset.blankIndex);
    if (Number.isNaN(blankIndex)) {
        return;
    }
    const checkArray = ensureExplanationCheckArrayLength(blankIndex + 1);
    checkArray[blankIndex] = locked ? 1 : 0;
    window.currentCaseData.explanationCheck = serializeExplanationCheckArray(checkArray);
}

function getExplanationBlankKey(button) {
    if (!button || !button.dataset) {
        return null;
    }
    const caseId = getCurrentCaseIdentifier();
    const contentIndex = button.dataset.explanationIndex ?? 'explanation';
    const blankIndex = button.dataset.blankIndex;
    if (blankIndex !== undefined && blankIndex !== null) {
        return `${caseId}:${contentIndex}-${blankIndex}`;
    }
    return button.dataset.blankId ? `${caseId}:${button.dataset.blankId}` : null;
}

function isExplanationBlankLocked(button) {
    ensureExplanationLockStore();
    if (!button) {
        return false;
    }
    if (button.dataset.explanationLocked === 'true') {
        const key = getExplanationBlankKey(button);
        if (key) {
            window.explanationBlankLocks[key] = true;
        }
        return true;
    }
    if (button.dataset.explanationLocked === 'false') {
        return false;
    }
    const key = getExplanationBlankKey(button);
    if (!key) {
        return false;
    }
    if (window.explanationBlankLocks[key] === true) {
        button.dataset.explanationLocked = 'true';
        return true;
    }
    const blankIndex = parseInt(button.dataset.blankIndex);
    if (!Number.isNaN(blankIndex)) {
        const checkArray = getExplanationCheckArrayFromState();
        if (checkArray[blankIndex] === 1) {
            window.explanationBlankLocks[key] = true;
            button.dataset.explanationLocked = 'true';
            return true;
        }
    }
    return false;
}

function setExplanationBlankLocked(button, locked, options = {}) {
    ensureExplanationLockStore();
    if (!button) {
        return;
    }
    const key = getExplanationBlankKey(button);
    button.dataset.explanationLocked = locked ? 'true' : 'false';
    if (!key) {
        return;
    }
    if (locked) {
        window.explanationBlankLocks[key] = true;
    } else {
        delete window.explanationBlankLocks[key];
    }
    if (!options.skipCheckUpdate) {
        updateExplanationCheckStateForButton(button, locked);
    }
}

function applyExplanationLockDisplay(button) {
    if (!button) {
        return;
    }
    const placeholder = button.querySelector('.blank-placeholder');
    const answer = button.querySelector('.blank-answer');
    if (!placeholder || !answer) {
        return;
    }
    placeholder.style.display = 'none';
    answer.style.display = 'inline';
    if (button.classList.contains('article-blank')) {
        const answerText = button.dataset.answer;
        const processedAnswer = processAllReferences(answerText, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || []);
        answer.innerHTML = processedAnswer;
        setTimeout(() => {
            enableArticleButtonsWithin(button);
            if (typeof setupArticleRefButtons === 'function') {
                setupArticleRefButtons(answer);
            }
        }, 100);
    }
    button.classList.remove('opened');
    button.classList.add('revealed');
    button.style.pointerEvents = 'auto';
}

/**
 * 穴埋めボタンのイベントリスナーを設定（ストーリーと解説で共用）
 * @param {HTMLElement} container - イベントリスナーを設定するコンテナ
 * @param {string} contentType - コンテンツの種類（"story" または "explanation"）
 */
function setupContentBlankButtons(container, contentType = 'story') {
    const blankButtons = container.querySelectorAll(`.${contentType}-blank-button`);

    if (contentType === 'explanation' && blankButtons.length > 0) {
        ensureExplanationCheckArrayLength(blankButtons.length);
    }
    
    // 穴埋め制御ボタンの表示/非表示を制御（contentTypeに応じて異なるIDを使用）
    const hideBtnId = contentType === 'story' ? '#hide-blanks-btn' : '#hide-explanation-blanks-btn';
    const showBtnId = contentType === 'story' ? '#show-blanks-btn' : '#show-explanation-blanks-btn';
    const hideBtn = container.querySelector(hideBtnId);
    const showBtn = container.querySelector(showBtnId);
    
    if (blankButtons.length > 0 && hideBtn && showBtn) {
        hideBtn.classList.remove('hidden');
        showBtn.classList.remove('hidden');
        
        // 穴埋めを隠すボタンのイベントリスナー
        hideBtn.addEventListener('click', function() {
            blankButtons.forEach(button => {
                const placeholder = button.querySelector('.blank-placeholder');
                const answer = button.querySelector('.blank-answer');
                
                if (placeholder && answer) {
                    let isChecked = false;
                    
                    // ストーリーの場合のみチェック状態を確認
                    if (contentType === 'story') {
                        const storyIndex = parseInt(button.dataset.storyIndex);
                        const blankIndex = parseInt(button.dataset.blankIndex);
                        
                        if (!isNaN(storyIndex) && !isNaN(blankIndex) && window.currentCaseData?.story?.[storyIndex]) {
                            const currentCheck = window.currentCaseData.story[storyIndex].check || '';
                            const checkArray = currentCheck.split(',').map(c => c.trim() === '1' ? 1 : 0);
                            isChecked = checkArray[blankIndex] === 1;
                        }
                    }
                    const isLocked = contentType === 'explanation' && isExplanationBlankLocked(button);
                    
                    if (contentType === 'story') {
                        if (!isChecked) {
                            // 答えを隠してプレースホルダーを表示
                            placeholder.style.display = 'inline';
                            answer.style.display = 'none';
                            
                            // 答えの内容を元のテキストに戻す（条文処理前の状態）
                            answer.innerHTML = button.dataset.answer;
                            
                            // openedとrevealedクラスを削除
                            button.classList.remove('revealed');
                            button.classList.remove('opened');
                            
                            // 変形をリセット
                            button.style.transform = 'scale(1)';
                        }
                    } else if (!isLocked) {
                        // 解説で固定されていない場合は隠す
                        placeholder.style.display = 'inline';
                        answer.style.display = 'none';
                        answer.innerHTML = button.dataset.answer;
                        button.classList.remove('revealed');
                        button.classList.remove('opened');
                        button.style.transform = 'scale(1)';
                        setExplanationBlankLocked(button, false, { skipCheckUpdate: true });
                    } else {
                        // 固定済みの場合は表示状態を維持
                        applyExplanationLockDisplay(button);
                    }
                    
                    // クリック有効化（チェック済み・未チェック関わらず）
                    button.style.pointerEvents = 'auto';
                }
            });
        });
        
        // 穴埋めを表示するボタンのイベントリスナー
        showBtn.addEventListener('click', function() {
            blankButtons.forEach(button => {
                const placeholder = button.querySelector('.blank-placeholder');
                const answer = button.querySelector('.blank-answer');
                
                if (placeholder && answer) {
                    // プレースホルダーを隠して答えを表示
                    placeholder.style.display = 'none';
                    answer.style.display = 'inline';
                    
                    // 条文処理を適用
                    answer.innerHTML = processAllReferences(button.dataset.answer);
                    
                    let isChecked = false;
                    
                    // ストーリーの場合のみチェック状態を確認
                    if (contentType === 'story') {
                        const storyIndex = parseInt(button.dataset.storyIndex);
                        const blankIndex = parseInt(button.dataset.blankIndex);
                        
                        if (!isNaN(storyIndex) && !isNaN(blankIndex) && window.currentCaseData?.story?.[storyIndex]) {
                            const currentCheck = window.currentCaseData.story[storyIndex].check || '';
                            const checkArray = currentCheck.split(',').map(c => c.trim() === '1' ? 1 : 0);
                            isChecked = checkArray[blankIndex] === 1;
                        }
                    }
                    const isLocked = contentType === 'explanation' && isExplanationBlankLocked(button);
                    
                    // チェック状態に応じてクラスを設定
                    if (contentType === 'story' && isChecked) {
                        // チェック済みの場合は緑色
                        button.classList.remove('opened');
                        button.classList.add('revealed');
                    } else if (contentType === 'explanation' && isLocked) {
                        button.classList.remove('opened');
                        button.classList.add('revealed');
                    } else {
                        // チェックされていない場合、または固定されていない解説の場合は黄色
                        button.classList.remove('revealed');
                        button.classList.add('opened');
                    }
                    
                    // 条文参照ボタンのイベントリスナーを設定（条文を含む場合のみ）
                    if (button.classList.contains('article-blank')) {
                        setTimeout(() => {
                            enableArticleButtonsWithin(button);
                        }, 150);
                    }
                    
                    // ボタン自体のクリックは有効のまま（トグル機能のため）
                    button.style.pointerEvents = 'auto';
                }
            });
        });
    }
    
    blankButtons.forEach(button => {
        if (contentType === 'explanation' && isExplanationBlankLocked(button)) {
            applyExplanationLockDisplay(button);
        }
        
        // 左クリックイベント（トグル機能付き）
        button.addEventListener('click', function(e) {
            // 条文ボタンがクリックされた場合はイベントを無視
            if (e.target.classList.contains('article-ref-btn')) {
                return;
            }
            
            const placeholder = this.querySelector('.blank-placeholder');
            const answer = this.querySelector('.blank-answer');
            
            if (placeholder && answer) {
                // チェック済み（revealed）の場合は閉じることができる（ストーリーのみ）
                if (contentType === 'story' && this.classList.contains('revealed')) {
                    // 答えを隠してプレースホルダーを表示
                    placeholder.style.display = 'inline';
                    answer.style.display = 'none';
                    
                    // 答えの内容を元のテキストに戻す（条文処理前の状態）
                    answer.innerHTML = this.dataset.answer;
                    
                    // revealedクラスを削除
                    this.classList.remove('revealed');
                    
                    return;
                }
                
                // 既に開いている（opened）場合は閉じる
                if (this.classList.contains('opened')) {
                    // 答えを隠してプレースホルダーを表示
                    placeholder.style.display = 'inline';
                    answer.style.display = 'none';
                    
                    // openedクラスを削除
                    this.classList.remove('opened');
                    
                    // 変形をリセット
                    this.style.transform = 'scale(1)';
                    
                    return;
                }
                
                // まだ開いていない場合は開く
                // プレースホルダーを隠して答えを表示
                placeholder.style.display = 'none';
                answer.style.display = 'inline';
                
                // 条文を含む場合は条文参照処理を適用
                if (this.classList.contains('article-blank')) {
                    const answerText = this.dataset.answer;
                    console.log('🔍 条文穴埋めボタンがクリックされました:', answerText);
                    
                    // 条文参照処理を適用してHTMLを更新
                    const processedAnswer = processAllReferences(answerText, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
                    console.log('📝 処理後のHTML:', processedAnswer);
                    
                    answer.innerHTML = processedAnswer;
                    
                    // 条文参照ボタンのイベントリスナーを設定
                    setTimeout(() => {
                        console.log('🎯 条文参照ボタンのイベントリスナーを設定中...');
                        
                        // 既存のイベントリスナーを削除
                        const articleButtons = answer.querySelectorAll('.article-ref-btn');
                        console.log('🔗 見つかった条文ボタン数:', articleButtons.length);
                        
                        articleButtons.forEach((btn, index) => {
                            console.log(`📋 条文ボタン ${index + 1}:`, btn.textContent, btn.dataset);
                            
                            // 既存のイベントリスナーを削除
                            const newBtn = btn.cloneNode(true);
                            btn.parentNode.replaceChild(newBtn, btn);
                            
                            // 新しいイベントリスナーを追加
                            newBtn.addEventListener('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🎯 条文ボタンがクリックされました!', this.dataset);
                                
                                const lawName = this.dataset.law;
                                const articleNum = this.dataset.article;
                                if (lawName && articleNum) {
                                    showArticlePanel(lawName, articleNum);
                                }
                            });
                        });
                        
                        // setupArticleRefButtons も呼び出し（念のため）
                        setupArticleRefButtons(answer);
                    }, 100);
                }
                
                // ボタンにopenedクラスを追加（通常クリック = 開示しただけ = 黄色）
                this.classList.remove('revealed');
                this.classList.add('opened');
                
                // 簡単なアニメーション効果
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            }
        });
        
        // 右クリックイベント（ストーリーのみ）
        if (contentType === 'story') {
            button.addEventListener('contextmenu', function(e) {
                e.preventDefault(); // デフォルトのコンテキストメニューを無効化
                
                const storyIndex = parseInt(this.dataset.storyIndex);
                const blankIndex = parseInt(this.dataset.blankIndex);
                
                if (isNaN(storyIndex) || isNaN(blankIndex)) {
                    console.error('Invalid story or blank index:', this.dataset);
                    return;
                }
                
                // storyが存在するかチェック
                if (!window.currentCaseData?.story || !Array.isArray(window.currentCaseData.story) || window.currentCaseData.story.length === 0) {
                    console.warn('Story data is not available, empty, or not an array:', {
                        hasCurrentCaseData: !!window.currentCaseData,
                        hasStory: !!window.currentCaseData?.story,
                        storyType: typeof window.currentCaseData?.story,
                        storyLength: window.currentCaseData?.story?.length || 0
                    });
                    return;
                }

                // storyIndexの範囲チェック
                const storyLength = window.currentCaseData.story.length;
                if (storyIndex >= storyLength) {
                    console.error('Story index out of range:', {
                        storyIndex,
                        storyLength,
                        maxValidIndex: storyLength - 1
                    });
                    return;
                }

                // 現在のチェック状態を取得
                const currentStoryData = window.currentCaseData?.story?.[storyIndex];
                if (!currentStoryData) {
                    console.error('Story data not found:', {
                        storyIndex,
                        storyLength: window.currentCaseData?.story?.length,
                        currentCaseData: window.currentCaseData
                    });
                    return;
                }
                const currentCheck = currentStoryData.check || '';
                const checkArray = currentCheck.split(',').map(c => c.trim() === '1' ? 1 : 0);
                
                // ブランクインデックスに対応するチェック状態を切り替え
                while (checkArray.length <= blankIndex) {
                    checkArray.push(0);
                }
                const wasChecked = checkArray[blankIndex] === 1;
                checkArray[blankIndex] = wasChecked ? 0 : 1;
                
                // 新しいチェック状態を保存
                const newCheck = checkArray.join(',');
                currentStoryData.check = newCheck;
                
                console.log(`📝 ストーリー要素 ${storyIndex} のチェック状態を更新:`, newCheck);
                
                // 開示済み状態の場合は表示を維持したまま状態を変更
                const isCurrentlyOpen = this.classList.contains('opened') || this.classList.contains('revealed');
                const isNowChecked = checkArray[blankIndex] === 1;
                
                if (isCurrentlyOpen) {
                    // 表示は維持したまま、クラスのみ変更
                    if (isNowChecked) {
                        // チェック済みに変更（緑色）
                        this.classList.remove('opened');
                        this.classList.add('revealed');
                    } else {
                        // 開示済みに変更（黄色）
                        this.classList.remove('revealed');
                        this.classList.add('opened');
                    }
                    
                    // 条文参照ボタンのイベントリスナーを設定（条文を含む場合のみ）
                    if (this.classList.contains('article-blank')) {
                        setTimeout(() => {
                            const articleButtons = this.querySelectorAll('.article-ref-btn');
                            articleButtons.forEach(btn => {
                                btn.style.pointerEvents = 'auto';
                                btn.style.cursor = 'pointer';
                                btn.style.position = 'relative';
                                btn.style.zIndex = '10';
                            });
                        }, 100);
                    }
                } else {
                    // 閉じている状態からは通常の更新処理を行う
                    updateStoryBlankButtonState(this, isNowChecked);
                }
                
                // サーバーに保存
                saveStoryCheckToServer();
                
                // 通知表示
                showNotification(
                    isNowChecked ? '✅ 空欄をチェック済みにしました' : '❌ 空欄のチェックを解除しました',
                    isNowChecked ? 'success' : 'info'
                );
            });
        } else if (contentType === 'explanation') {
            button.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                const placeholder = this.querySelector('.blank-placeholder');
                const answer = this.querySelector('.blank-answer');
                if (!placeholder || !answer) {
                    return;
                }
                const currentlyLocked = isExplanationBlankLocked(this);
                const newLocked = !currentlyLocked;
                setExplanationBlankLocked(this, newLocked);
                if (newLocked) {
                    applyExplanationLockDisplay(this);
                    showNotification('✅ 空欄を固定しました', 'success');
                } else {
                    // 固定解除。回答は表示状態のまま通常の開示スタイルに戻す
                    placeholder.style.display = 'none';
                    answer.style.display = 'inline';
                    if (this.classList.contains('article-blank')) {
                        const answerText = this.dataset.answer;
                        const processedAnswer = processAllReferences(answerText, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || []);
                        answer.innerHTML = processedAnswer;
                        setTimeout(() => {
                            enableArticleButtonsWithin(this);
                        }, 100);
                    }
                    this.classList.remove('revealed');
                    if (!this.classList.contains('opened')) {
                        this.classList.add('opened');
                    }
                    this.style.pointerEvents = 'auto';
                    showNotification('❌ 空欄の固定を解除しました', 'info');
                }
                saveExplanationCheckToServer();
            });
        }
    });
}

/**
 * ストーリー用の後方互換性関数
 */
function setupStoryBlankButtons(container) {
    setupContentBlankButtons(container, 'story');
}

/**
 * 解説用の空欄ボタン設定関数
 */
function setupExplanationBlankButtons(container) {
    setupContentBlankButtons(container, 'explanation');
}

/**
 * ストーリー空欄ボタンの状態を更新
 * @param {HTMLElement} button - 更新するボタン要素
 * @param {boolean} isChecked - チェック状態
 */
function updateStoryBlankButtonState(button, isChecked) {
    if (isChecked) {
        // チェック済みの場合、答えを表示して緑色にする
        const placeholder = button.querySelector('.blank-placeholder');
        const answer = button.querySelector('.blank-answer');
        
        if (placeholder && answer) {
            placeholder.style.display = 'none';
            answer.style.display = 'inline';
            
            // 条文を含む場合は条文参照処理を適用
            if (button.classList.contains('article-blank')) {
                const answerText = button.dataset.answer;
                const processedAnswer = processAllReferences(answerText, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
                answer.innerHTML = processedAnswer;
                
                // 条文参照ボタンのイベントリスナーを設定
                setTimeout(() => {
                    setupArticleRefButtons(answer);
                    
                    // 中の条文ボタンのpointer-eventsを強制的に有効化
                    const articleButtons = button.querySelectorAll('.article-ref-btn');
                    articleButtons.forEach(btn => {
                        btn.style.pointerEvents = 'auto';
                        btn.style.cursor = 'pointer';
                        btn.style.position = 'relative';
                        btn.style.zIndex = '10';
                    });
                }, 100);
            }
            
            // ボタン自体のクリックは有効のまま（トグル機能のため）
            button.style.pointerEvents = 'auto';
            
            // openedクラスを削除してrevealedクラスを追加（緑色）
            button.classList.remove('opened');
            button.classList.add('revealed');
        }
    } else {
        // チェック解除の場合、プレースホルダーを表示して元に戻す
        const placeholder = button.querySelector('.blank-placeholder');
        const answer = button.querySelector('.blank-answer');
        
        if (placeholder && answer) {
            placeholder.style.display = 'inline';
            answer.style.display = 'none';
            answer.innerHTML = button.dataset.answer;
            button.classList.remove('revealed');
            button.classList.remove('opened');
            button.style.pointerEvents = 'auto';
            button.style.transform = 'scale(1)';
        }
    }
}

/**
 * ストーリーチェック状態をサーバーに保存
 */
async function saveStoryCheckToServer() {
    try {
        const caseId = window.currentCaseData.id;
        const storyData = window.currentCaseData.story;
        
        console.log('💾 ストーリーチェック状態をサーバーに保存中:', caseId);
        
        // サーバーのAPIに送信
        const response = await fetch('/api/save-story-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caseId: caseId.replace(/\.js$/, ''),
                storyData: storyData
            })
        });
        console.log('💾 ストーリーチェック保存API呼び出し:', { 
            originalCaseId: caseId, 
            processedCaseId: caseId.replace(/\.js$/, '') 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ ストーリーチェック状態の保存完了（サーバー）:', result.filePath);
        showNotification('ストーリーチェック状態を保存しました', 'success');
        
    } catch (error) {
        console.error('❌ ストーリーチェック状態の保存に失敗:', error);
        showNotification('保存に失敗しました', 'error');
    }
}

async function saveExplanationCheckToServer() {
    try {
        const caseId = window.currentCaseData.id;
        if (!caseId) {
            console.warn('saveExplanationCheckToServer: caseId が見つかりません');
            return;
        }
        const explanationCheck = window.currentCaseData.explanationCheck || '';
        console.log('💾 解説固定状態をサーバーに保存中:', caseId, explanationCheck);
        const response = await fetch('/api/save-explanation-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caseId: caseId.replace(/\.js$/, ''),
                explanationCheck
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ 解説固定状態の保存完了（サーバー）:', result.filePath);
        showNotification('解説の固定状態を保存しました', 'success');
    } catch (error) {
        console.error('❌ 解説固定状態の保存に失敗:', error);
        showNotification('解説の固定状態の保存に失敗しました', 'error');
    }
}

/**
 * ページロード時にストーリーチェック状態を復元
 * @param {HTMLElement} container - イベントリスナーを設定するコンテナ
 */
async function restoreStoryCheckStates(container) {
    const caseId = window.currentCaseData.id;
    
    // サーバーから最新の状態を取得
    try {
        console.log('📖 サーバーからストーリーチェック状態を復元中:', caseId);
        
        const response = await fetch(`/api/get-story-check/${encodeURIComponent(caseId.replace(/\.js$/, ''))}`);
        console.log('📖 ストーリーチェックAPI呼び出し:', { originalCaseId: caseId, processedCaseId: caseId.replace(/\.js$/, '') });
        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.storyData && Array.isArray(result.storyData) && result.storyData.length > 0) {
                // サーバーから取得したデータが有効な場合のみ上書き
                window.currentCaseData.story = result.storyData;
                console.log('✅ サーバーからストーリーチェック状態を復元完了:', caseId, 'storyLength:', result.storyData.length);
            } else {
                console.log('📖 サーバーのストーリーデータが無効または空のため、元のデータを保持:', caseId);
            }
        } else {
            console.log('📖 サーバーにストーリーチェック状態が見つかりません:', caseId);
        }
    } catch (error) {
        console.error('❌ ストーリーチェック状態の復元に失敗:', error);
    }
    
    const blankButtons = container.querySelectorAll('.story-blank-button');
    
    blankButtons.forEach(button => {
        const storyIndex = parseInt(button.dataset.storyIndex);
        const blankIndex = parseInt(button.dataset.blankIndex);
        
        if (isNaN(storyIndex) || isNaN(blankIndex)) {
            return;
        }
        
        const storyData = window.currentCaseData?.story?.[storyIndex];
        if (!storyData) {
            console.warn('Story data not found for button:', { storyIndex, button });
            return;
        }

        // storyが存在するかチェック
        if (!window.currentCaseData?.story || !Array.isArray(window.currentCaseData.story)) {
            console.warn('Story data is not available for button processing');
            return;
        }
        if (!storyData || !storyData.check) {
            return;
        }
        
        const checkArray = storyData.check.split(',').map(c => c.trim() === '1' ? 1 : 0);
        
        if (checkArray[blankIndex] === 1) {
            updateStoryBlankButtonState(button, true);
        }
    });
}

async function restoreExplanationCheckStates(container) {
    if (!container || !window.currentCaseData) {
        return;
    }
    const caseId = window.currentCaseData.id;
    if (!caseId) {
        console.warn('restoreExplanationCheckStates: caseId が存在しません');
        return;
    }

    try {
        console.log('📖 サーバーから解説固定状態を復元中:', caseId);
        const response = await fetch(`/api/get-explanation-check/${encodeURIComponent(caseId.replace(/\.js$/, ''))}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && typeof result.explanationCheck === 'string') {
                window.currentCaseData.explanationCheck = result.explanationCheck;
                console.log('✅ サーバーから解説固定状態を復元:', caseId, result.explanationCheck);
            } else {
                console.log('📖 サーバーに解説固定状態が存在しません、既存データを使用します');
            }
        } else {
            console.log('📖 解説固定状態の取得に失敗、ステータス:', response.status);
        }
    } catch (error) {
        console.error('❌ 解説固定状態の復元に失敗:', error);
    }

    const blankButtons = container.querySelectorAll('.explanation-blank-button');
    if (blankButtons.length === 0) {
        return;
    }

    // 別ケースからの残りをクリア
    window.explanationBlankLocks = {};

    const checkArray = ensureExplanationCheckArrayLength(blankButtons.length);
    blankButtons.forEach(button => {
        const blankIndex = parseInt(button.dataset.blankIndex);
        if (Number.isNaN(blankIndex)) {
            return;
        }
        if (checkArray[blankIndex] === 1) {
            setExplanationBlankLocked(button, true, { skipCheckUpdate: true });
            applyExplanationLockDisplay(button);
        }
    });
}

function buildStoryHtml(storyData) {
    if (!storyData || (Array.isArray(storyData) && storyData.length === 0) || (typeof storyData === 'string' && !storyData.trim())) {
        return '<div class="text-center text-gray-400">ストーリーはありません</div>';
    }
    if (!Array.isArray(storyData)) {
        return storyData.replace(/\[\d+\]/g, '');
    }

    // ★★★ 右側キャラリストをモジュールごとに切り替え ★★★
    const rightSideCharacters = window.currentCaseData.rightSideCharacters || ['みかん', '母', '父'];
    
    // ★★★ ストーリーに登場するキャラクターを抽出してイメージギャラリー作成 ★★★
    const storyCharacters = extractStoryCharacters(storyData);
    const characterGalleryHtml = buildCharacterGallery(storyCharacters);
    
    const storyContentHtml = storyData.map((item, index) => {
        if (item.type === 'scene') {
            // scene要素: 先に条文・Q&A参照処理、その後空欄処理
            const processedText = processAllReferences(item.text, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
                .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
            return `<div class="text-sm text-gray-600 p-4 bg-yellow-50 rounded-lg mt-6 mb-4"><h3 class="font-bold mb-2 text-lg">${processStoryBlanks(processedText, index)}</h3></div>`;
        }
        if (item.type === 'narration') {
            // narration要素: 先に条文・Q&A参照処理、その後空欄処理
            const processedText = processAllReferences(item.text, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
                .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
            return `<p class="text-center text-gray-600 italic my-4">${processStoryBlanks(processedText, index)}</p>`;
        }
        
        // ★★★ 新機能: embed要素の処理 ★★★
        if (item.type === 'embed') {
            console.log('🎨 Embed要素を処理中:', item);
            // title, description, contentすべてで先に条文・Q&A参照処理、その後空欄処理
            // 埋め込み内では Q&A ボタンは生成するが、中身を絶対に表示しない「安全モード」ボタンを生成する
            const embedOptions = { allowQAButtons: true, embedSafeButtons: true };
            const processedTitle = item.title ? processAllReferences(item.title, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [], embedOptions) : '';
            const processedDescription = item.description ? processAllReferences(item.description, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [], embedOptions) : '';
            let processedContent = item.content ? processAllReferences(item.content, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [], embedOptions) : '';
            
            // デバッグ: processAllReferences後のコンテンツを確認
            console.log('🔍 processAllReferences後のcontent:', processedContent);
            
            // デバッグ: HTMLエスケープチェック
            if (processedContent && (processedContent.includes('&lt;') || processedContent.includes('&gt;'))) {
                console.log('🚨 エンベッドコンテンツでHTMLエスケープを検出:', processedContent.substring(0, 300));
            }
            
            // content内での文字揃え記法を処理
            if (processedContent) {
                processedContent = processedContent
                    .replace(/\[center\](.*?)\[\/center\]/gs, '<div class="text-center">$1</div>')
                    .replace(/\[right\](.*?)\[\/right\]/gs, '<div class="text-right">$1</div>')
                    .replace(/\[left\](.*?)\[\/left\]/gs, '<div class="text-left">$1</div>')
                    .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>'); // 改行をHTMLの改行に変換
                
                // デバッグ: 文字揃え処理後のコンテンツを確認
                console.log('🔍 文字揃え処理後のcontent:', processedContent);
            }
            
            // 全体の文字揃えの処理（デフォルトまたはフォールバック用）
            let textAlignClass = '';
            if (item.textAlign) {
                switch (item.textAlign) {
                    case 'center':
                        textAlignClass = 'text-center';
                        break;
                    case 'right':
                        textAlignClass = 'text-right';
                        break;
                    case 'left':
                        textAlignClass = 'text-left';
                        break;
                    default:
                        textAlignClass = '';
                }
            }
            
            const title = processedTitle ? `<h4 class="font-bold text-lg mb-2 text-gray-800 ${textAlignClass}">${processStoryBlanks(processedTitle, index)}</h4>` : '';
            const description = processedDescription ? `<p class="text-sm text-gray-600 mb-3 ${textAlignClass}">${processStoryBlanks(processedDescription, index)}</p>` : '';
            
            // ★★★ embedのcontentにも空欄処理を適用 ★★★
            processedContent = processStoryBlanks(processedContent, index);
            
            // ニュース形式の場合
            if (item.format === 'news') {
                console.log('📰 ニュース要素を作成:', item);
                // ニュース専用のタイトルスタイル
                const newsTitle = processedTitle ? `<h3 class="news-title">${processStoryBlanks(processedTitle, index)}</h3>` : '';
                const newsDescription = processedDescription ? `<p class="news-source">${processStoryBlanks(processedDescription, index)}</p>` : '';
                
                return `
                    <div class="embed-container my-6" data-format="news">
                        <div class="news-container">
                            <div class="news-header">
                                <div class="news-badge">📰 BREAKING NEWS</div>
                                ${newsTitle}
                                ${newsDescription}
                            </div>
                            <div class="news-body">
                                <div class="news-content">
                                    ${processedContent}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // キャラクター図表の場合
            if (item.format === 'character-diagram') {
                console.log('🎭 キャラクター図表要素を作成:', item);
                return `
                    <div class="embed-container my-6" data-format="character-diagram">
                                    <div class="embed-header">
                                        ${title}
                                        ${description}
                                    </div>
                                    <div class="embed-frame">
                                        <div class="embed-content">
                                            <div class="character-diagram">
                                                ${processedContent}
                                            </div>
                                        </div>
                                    </div>
                        </div>
                `;
            }
            
            // メモ形式の場合
            if (item.format === 'memo') {
                console.log('📝 メモ要素を作成:', item);
                return `
                    <div class="embed-container my-6" data-format="memo">
                        <div class="memo-container">
                            <div class="memo-header">
                                <div class="memo-pin">📌</div>
                                ${title}
                                ${description}
                            </div>
                            <div class="memo-content">
                                ${processedContent}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // その他のembed形式（SVG、HTMLなど）
            const finalHtml = `
                <div class="embed-container my-6" data-format="${item.format || 'default'}">
                    <div class="embed-header">
                        ${title}
                        ${description}
                    </div>
                    <div class="embed-frame">
                        <div class="embed-content">
                            ${processedContent}
                        </div>
                    </div>
                </div>
            `;
            
            // デバッグ: 最終HTMLを確認
            console.log('🔍 最終的なembed HTML:', finalHtml);
            
            return finalHtml;
        }
        
        const character = characters.find(c => c.name === item.speaker);
        if (!character) {
            // フォールバック: 未定義キャラでもセリフを表示（アイコンなし・中央スタイル）
            // 先に条文・Q&A参照処理、その後空欄処理
            const processedDialogue = processAllReferences(item.dialogue, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
                .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
            const bubbleHtml = `<div class="chat-bubble chat-bubble-left p-3 rounded-lg shadow"><p class="font-bold">${item.speaker || '（不明）'}</p><p>${processStoryBlanks(processedDialogue, index)}</p></div>`;
            return `<div class="flex items-start gap-3 my-4">${bubbleHtml}</div>`;
        }

        const requestedExpression = item.expression ?? 'normal';
        const finalExpression = character.availableExpressions.includes(requestedExpression) ? requestedExpression : 'normal';
        const iconSrc = `/images/${character.baseName}_${finalExpression}.png`;
        const fallbackSrc = `/images/${character.baseName}_normal.png`;
        const onErrorAttribute = `this.src='${fallbackSrc}'; this.onerror=null;`;
        
        const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);";
        const isRightSide = rightSideCharacters.includes(item.speaker);
        const iconTransform = isRightSide ? 'transform: scaleX(-1);' : '';
        const iconHtml = `<img src="${iconSrc}" alt="${character.name}" class="character-icon" style="${imageStyle} ${iconTransform}" onerror="${onErrorAttribute}">`;
        // 先に条文・Q&A参照処理、その後空欄処理
        const processedDialogue = processAllReferences(item.dialogue, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
            .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
        const bubbleHtml = `<div class="chat-bubble ${isRightSide ? 'chat-bubble-right' : 'chat-bubble-left'} p-3 rounded-lg shadow"><p class="font-bold">${character.name}</p><p>${processStoryBlanks(processedDialogue, index)}</p></div>`;
        
        return `<div class="flex items-start gap-3 my-4 ${isRightSide ? 'justify-end' : ''}">${isRightSide ? bubbleHtml + iconHtml : iconHtml + bubbleHtml}</div>`;    
    }).join('');
    
    // キャラクターギャラリーとストーリー内容を結合
    // 最終的なHTMLに対して、エスケープされたボタンタグを修正
    const finalHtml = characterGalleryHtml + storyContentHtml;
    
    // もしHTMLボタンがエスケープされている場合の修正処理
    // より包括的なエスケープ修正を実行
    let correctedHtml = finalHtml;
    
    // デバッグ: エスケープ検出
    if (correctedHtml.includes('&lt;') || correctedHtml.includes('&gt;')) {
        console.log('🚨 エスケープされたHTMLを検出:', correctedHtml.substring(0, 200));
        
        // より包括的なエスケープ解除
        correctedHtml = correctedHtml
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
        
        console.log('✅ 全HTMLエスケープを解除完了');
    }
    
    console.log('🔧 HTML修正処理完了');
    
    return correctedHtml;
}

/**
 * ストーリーデータから登場キャラクターを抽出
 * @param {Array} storyData - ストーリーデータ
 * @returns {Array} 登場キャラクターの配列
 */
function extractStoryCharacters(storyData) {
    const characterNames = new Set();
    
    storyData.forEach(item => {
        if (item.type !== 'scene' && item.type !== 'narration' && item.type !== 'embed' && item.speaker) {
            characterNames.add(item.speaker);
        }
    });
    
    // charactersデータから該当するキャラクター情報を取得
    const storyCharacters = Array.from(characterNames)
        .map(name => characters.find(c => c.name === name))
        .filter(character => character); // 定義されているキャラクターのみ
    
    return storyCharacters;
}

/**
 * キャラクターギャラリーHTMLを構築
 * @param {Array} storyCharacters - 登場キャラクターの配列
 * @returns {string} キャラクターギャラリーのHTML
 */
function buildCharacterGallery(storyCharacters) {
    if (storyCharacters.length === 0) {
        return '';
    }
    
    const characterItems = storyCharacters.map(character => {
        const iconSrc = `/images/${character.baseName}_normal.png`;
        return `
            <div class="character-gallery-item text-center">
                <img 
                    src="${iconSrc}" 
                    alt="${character.name}" 
                    class="character-gallery-icon"
                    style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; margin: 0 auto 8px; display: block; transition: transform 0.2s ease;"
                    onmouseover="this.style.transform='scale(1.1)'"
                    onmouseout="this.style.transform='scale(1)'"
                >
                <div class="text-xs text-gray-600 font-medium">${character.name}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="character-gallery mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm">
            <h4 class="text-sm font-bold text-gray-700 mb-3 text-center">📖 登場キャラクター</h4>
            <div class="flex flex-wrap justify-center gap-4">
                ${characterItems}
            </div>
        </div>
    `;
}

/**
 * 新システムの「答案を入力する」ボタンのイベントハンドラを設定
 * @param {HTMLElement} container - コンテナ要素
 */
function setupNewAnswerModeButtons(container) {
    container.querySelectorAll('.enter-answer-mode-btn').forEach(button => {
        button.addEventListener('click', function() {
            const quizIndex = this.dataset.quizIndex;
            const subIndex = this.dataset.subIndex;
            console.log(`✅ 答案入力モード開始: 問題${quizIndex}-${subIndex}`);
            
            // 答案添削画面に遷移（answerOverlay.jsのstartAnswerCorrectionModeを使用）
            if (window.startAnswerCorrectionMode) {
                window.startAnswerCorrectionMode(quizIndex, subIndex);
            } else {
                console.error('❌ window.startAnswerCorrectionMode関数が見つかりません（answerOverlay.js未読み込み？）');
            }
        });
    });
}

// ★★★ タブ状態管理機能（F5更新対応） ★★★
/**
 * 現在のタブ状態をlocalStorageに保存
 * @param {string} tabName - 現在のタブ名
 */
function saveCurrentTab(tabName) {
    try {
        const caseId = window.currentCaseData?.caseId || 'unknown';
        const key = `currentTab_${caseId}`;
        localStorage.setItem(key, tabName);
        console.log(`💾 タブ状態保存: ${tabName} (case: ${caseId})`);
    } catch (error) {
        console.warn('⚠️ タブ状態の保存に失敗:', error);
    }
}

/**
 * casePageでの目次再生成を処理する関数
 */
async function handleCaseIndexRegeneration() {
    const regenerateBtn = document.getElementById('regenerate-case-index');
    if (!regenerateBtn) return;
    
    const originalText = regenerateBtn.innerHTML;
    
    try {
        // ローディング状態
        regenerateBtn.disabled = true;
        regenerateBtn.innerHTML = '🔄 処理中...';
        
        console.log('🔄 目次再生成APIを呼び出し中...');
        const response = await fetch('/api/regenerate-case-index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        console.log('✅ 目次再生成API応答:', result);
        
        if (result.success) {
            // ★★★ サーバー起動時と同じようにすべてのケースを一から読み込み ★★★
            console.log('🔄 すべてのケースファイルを一から読み込み中...');
            
            // index.jsを再読み込み
            const timestamp = Date.now();
            const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);
            
            // 新しいcaseSummariesとcaseLoadersを設定
            window.caseSummaries = indexModule.caseSummaries;
            window.caseLoaders = indexModule.caseLoaders;
            
            console.log(`✅ index.js再読み込み完了: ${window.caseSummaries.length}件のケース`);
            
            // すべてのケースを一から読み込んでキャッシュ
            console.log('🔄 すべてのケースをPromise.allで読み込み中...');
            const allCasePromises = window.caseSummaries.map(async (summary) => {
                try {
                    const loader = window.caseLoaders[summary.id];
                    if (loader) {
                        const caseModule = await loader();
                        return { id: summary.id, data: caseModule.default };
                    }
                } catch (error) {
                    console.error(`❌ ケース読み込みエラー ${summary.id}:`, error);
                }
                return null;
            });
            
            const loadedCases = await Promise.all(allCasePromises);
            window.caseModules = {};
            loadedCases.forEach(item => {
                if (item) {
                    window.caseModules[item.id] = item.data;
                }
            });
            
            console.log(`✅ すべてのケース読み込み完了: ${Object.keys(window.caseModules).length}件`);
            
            // 現在開いているケースがある場合は再読み込み（キャッシュから）
            if (window.currentCaseData && window.currentCaseData.id) {
                console.log('🔄 現在開いているケースを再読み込み:', window.currentCaseData.id);
                // キャッシュから直接読み込み
                const cachedCase = window.caseModules[window.currentCaseData.id];
                if (cachedCase) {
                    window.currentCaseData = cachedCase;
                    window.currentCaseData.id = window.currentCaseData.id;
                    await renderCaseDetail();
                } else {
                    await loadAndRenderCase(window.currentCaseData.id, false);
                }
            }
            
            // homePageの表示も更新
            if (window.renderFilteredModulesOrQAs) {
                console.log('🔄 homePageの表示も更新');
                await window.renderFilteredModulesOrQAs();
            }
            
            // 成功通知
            showNotification(`✅ 目次再生成完了！ (${result.casesCount}件のケースを処理)`, 'success');
            
        } else {
            showNotification(`❌ エラー: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('目次再生成エラー:', error);
        showNotification(`❌ 通信エラー: ${error.message}`, 'error');
    } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = originalText;
    }
}

/**
 * casePageで目次ファイルを動的に再読み込みする関数
 */
async function reloadCaseIndexForCasePage() {
    try {
        // モジュールキャッシュをクリアするためにタイムスタンプを付与
        const timestamp = Date.now();
        console.log('🔄 目次ファイル再読み込み開始:', { timestamp });
        
        const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);
        console.log('✅ 新しいindex.jsを読み込み完了:', {
            caseSummariesLength: indexModule.caseSummaries.length,
            sampleCategories: indexModule.caseSummaries.slice(0, 3).map(s => ({ category: s.category, subfolder: s.subfolder }))
        });

        // 再生成後は index.js のエクスポートそのものを使用
        window.caseSummaries = indexModule.caseSummaries;
        window.caseLoaders = indexModule.caseLoaders;

        console.log(`🔄 目次ファイル再読み込み完了 (${indexModule.caseSummaries.length}件)`);
        console.log('🔄 ローダーは index.js の export をそのまま採用');
        
    } catch (error) {
        console.error('目次ファイル再読み込みエラー:', error);
        throw error;
    }
}

/**
 * 保存されたタブ状態をlocalStorageから取得
 * @returns {string} 保存されたタブ名（デフォルト: 'story'）
 */
function getSavedTab() {
    try {
        const caseId = window.currentCaseData?.caseId || 'unknown';
        const key = `currentTab_${caseId}`;
        const savedTab = localStorage.getItem(key);
        const defaultTab = 'story';
        
        if (savedTab) {
            // 有効なタブ名かチェック
            const validTabs = ['story', 'explanation', 'quiz', 'speed-quiz', 'qa-list', 'essay'];
            if (validTabs.includes(savedTab)) {
                console.log(`📖 タブ状態復元: ${savedTab} (case: ${caseId})`);
                return savedTab;
            } else {
                console.warn(`⚠️ 無効なタブ名: ${savedTab}、デフォルトに戻します`);
            }
        }
        
        console.log(`📖 デフォルトタブ使用: ${defaultTab} (case: ${caseId})`);
        return defaultTab;
    } catch (error) {
        console.warn('⚠️ タブ状態の復元に失敗:', error);
        return 'story';
    }
}

/**
 * タブ状態をクリア（必要に応じて使用）
 * @param {string} caseId - 対象のケースID（省略時は現在のケース）
 */
function clearSavedTab(caseId = null) {
    try {
        const targetCaseId = caseId || window.currentCaseData?.caseId || 'unknown';
        const key = `currentTab_${targetCaseId}`;
        localStorage.removeItem(key);
        console.log(`🗑️ タブ状態クリア: ${targetCaseId}`);
    } catch (error) {
        console.warn('⚠️ タブ状態のクリアに失敗:', error);
    }
}

// ★★★ 学習記録機能 ★★★

/**
 * 学習記録ボタンのイベントリスナーを設定
 */
function setupStudyRecordButton() {
    const recordBtn = document.getElementById('record-study-btn');
    const statusDiv = document.getElementById('study-record-status');

    if (!recordBtn || !statusDiv) return;

    // 現在の記録状態を表示
    updateStudyRecordStatus();

    // ボタンのクリックイベント
    recordBtn.addEventListener('click', async () => {
        await recordStudyCompletion();
    });

    // 削除ボタンのクリックイベント（動的に追加されるため、イベント委任を使用）
    statusDiv.addEventListener('click', async (event) => {
        if (event.target.id === 'delete-study-record-btn') {
            await deleteTodayStudyRecord();
        }
    });
}

/**
 * 学習記録状態を更新表示
 */
async function updateStudyRecordStatus() {
    const statusDiv = document.getElementById('study-record-status');
    const recordBtn = document.getElementById('record-study-btn');
    
    if (!statusDiv || !recordBtn || !window.currentCaseData) return;
    
    const relativePath = await getCurrentCaseRelativePath();
    if (!relativePath) {
        console.warn('相対パスが取得できませんでした');
        return;
    }
    
    try {
        // 拡張子を除去してAPIを呼び出し（より確実な方法）
        const pathWithoutExtension = relativePath.replace(/\.js$/i, '').replace(/\/$/, '');
        console.log('📊 学習記録取得API呼び出し:', { originalPath: relativePath, pathWithoutExtension });
        
        // サーバーから最新の学習記録を取得（相対パス使用）
        const response = await fetch(`/api/get-study-record/${encodeURIComponent(pathWithoutExtension)}`);
        const result = await response.json();
        
        if (result.success && result.todayRecord) {
            // 今日の学習記録がある場合
            const recordTime = new Date(result.todayRecord.timestamp);
            const timeStr = recordTime.toLocaleString('ja-JP');

            statusDiv.innerHTML = `
                <div class="text-green-600 font-medium mb-2">
                    ✅ 今日の学習記録済み（${timeStr}）
                </div>
                <button id="delete-study-record-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg btn-hover text-sm">
                    🗑️ 今日の記録を削除
                </button>
            `;
            recordBtn.disabled = true;
            recordBtn.className = 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed';
            recordBtn.textContent = '📝 今日は記録済み';
        } else if (result.success && result.latestRecord) {
            // 今日の記録はないが、最新の記録がある場合
            const recordTime = new Date(result.latestRecord.timestamp);
            const timeStr = recordTime.toLocaleString('ja-JP');
            const recordDate = result.latestRecord.date;

            // 最新記録の日付が今日かどうかをチェック（システム仕様: 一日は3:00から始まる）
            const now = new Date();
            const currentHour = now.getHours();
            let todayDate = new Date(now);
            if (currentHour < 3) {
                todayDate.setDate(todayDate.getDate() - 1);
            }
            const today = todayDate.getFullYear() + '-' +
                          String(todayDate.getMonth() + 1).padStart(2, '0') + '-' +
                          String(todayDate.getDate()).padStart(2, '0');
            const isTodayRecord = recordDate === today;

            if (isTodayRecord) {
                statusDiv.innerHTML = `
                    <div class="text-green-600 font-medium mb-2">
                        ✅ 今日の学習記録済み（${timeStr}）
                    </div>
                    <button id="delete-study-record-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg btn-hover text-sm">
                        🗑️ 今日の記録を削除
                    </button>
                `;
                recordBtn.disabled = true;
                recordBtn.className = 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed';
                recordBtn.textContent = '📝 今日は記録済み';
            } else {
                statusDiv.innerHTML = `
                    <div class="text-blue-600">
                        📅 最新の学習記録: ${recordDate} ${timeStr.split(' ')[1]}
                    </div>
                `;
                recordBtn.disabled = false;
                recordBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover';
                recordBtn.textContent = '📝 今日の学習を記録する';
            }
        } else {
            // 学習記録がまったくない場合
            statusDiv.innerHTML = `
                <div class="text-blue-600">
                    📅 今日はまだ学習記録がありません
                </div>
            `;
            recordBtn.disabled = false;
            recordBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover';
            recordBtn.textContent = '📝 今日の学習を記録する';
        }
    } catch (error) {
        console.warn('学習記録状態の確認に失敗:', error);
        // エラー時はデフォルト状態に設定
        statusDiv.innerHTML = `
            <div class="text-blue-600">
                📅 今日はまだ学習記録がありません
            </div>
        `;
        recordBtn.disabled = false;
        recordBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover';
        recordBtn.textContent = '📝 今日の学習を記録する';
    }
}

/**
 * 学習完了記録を実行
 */
async function recordStudyCompletion() {
    if (!window.currentCaseData) {
        showNotification('ケースデータが見つかりません', 'error');
        return;
    }
    
    const relativePath = await getCurrentCaseRelativePath();
    if (!relativePath) {
        showNotification('ファイルパスの取得に失敗しました', 'error');
        return;
    }
    
    const now = new Date();
    // 学習した時点の日付を計算（システム仕様: 一日は3:00から始まる）
    const currentHour = now.getHours();
    let studyDateObj = new Date(now);
    if (currentHour < 3) {
        studyDateObj.setDate(studyDateObj.getDate() - 1);
    }
    const studyDate = studyDateObj.getFullYear() + '-' +
                      String(studyDateObj.getMonth() + 1).padStart(2, '0') + '-' +
                      String(studyDateObj.getDate()).padStart(2, '0');

    try {
        // サーバーに学習記録をJSファイルに追加するよう依頼（相対パス使用）
        const response = await fetch('/api/add-study-record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                relativePath: relativePath.replace(/\.js$/i, '').replace(/\/$/, ''),
                title: window.currentCaseData.title || 'タイトル不明',
                timestamp: now.toISOString(),
                date: studyDate // 学習した日付を使用
            })
        });
        console.log('📝 学習記録追加API呼び出し:', { 
            originalPath: relativePath, 
            processedPath: relativePath.replace(/\.js$/, ''), 
            date: studyDate 
        });        const result = await response.json();
        
        if (result.success) {
            // 既に今日の記録があるかチェック
            if (result.alreadyRecorded) {
                showNotification('今日はすでに学習記録があります', 'info');
            } else {
                showNotification('学習記録をモジュールファイルに保存しました！', 'success');
            }
            
            // 表示を更新
            updateStudyRecordStatus();
            
            // ホームページの学習記録表示も更新
            if (window.updateSingleStudyRecord) {
                try {
                    window.updateSingleStudyRecord(window.currentCaseData.id);
                    console.log('🔄 ホームページの学習記録表示を更新しました');
                } catch (error) {
                    console.warn('⚠️ ホームページの学習記録表示更新に失敗:', error);
                }
            }
            
            console.log('✅ 学習記録保存完了:', result);
        } else {
            throw new Error(result.error || '学習記録の保存に失敗');
        }
        
    } catch (error) {
        console.error('❌ 学習記録の保存に失敗:', error);
        showNotification('学習記録の保存に失敗しました', 'error');
    }
}

/**
 * 今日の学習記録を削除
 */
async function deleteTodayStudyRecord() {
    if (!window.currentCaseData) {
        showNotification('ケースデータが見つかりません', 'error');
        return;
    }

    const relativePath = await getCurrentCaseRelativePath();
    if (!relativePath) {
        showNotification('ファイルパスの取得に失敗しました', 'error');
        return;
    }

    // 今日の日付を取得（システム仕様: 一日は3:00から始まる）
    const now = new Date();
    const currentHour = now.getHours();

    // 3:00より前の場合は前日の日付を使用
    let targetDate = new Date(now);
    if (currentHour < 3) {
        targetDate.setDate(targetDate.getDate() - 1);
    }

    const todayDate = targetDate.getFullYear() + '-' +
                      String(targetDate.getMonth() + 1).padStart(2, '0') + '-' +
                      String(targetDate.getDate()).padStart(2, '0');

    // 確認ダイアログを表示
    const confirmed = confirm(`今日の学習記録（${todayDate}）を削除しますか？\nこの操作は取り消せません。`);
    if (!confirmed) {
        return;
    }

    try {
        // 拡張子を除去してAPIを呼び出し（より確実な方法）
        const pathWithoutExtension = relativePath.replace(/\.js$/i, '').replace(/\/$/, '');
        console.log('🗑️ 学習記録削除API呼び出し:', { originalPath: relativePath, pathWithoutExtension, date: todayDate });
        
        // サーバーに学習記録の削除を依頼
        const response = await fetch(`/api/delete-study-record/${encodeURIComponent(pathWithoutExtension)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: todayDate
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`今日の学習記録を削除しました`, 'success');

            // 表示を更新
            updateStudyRecordStatus();

            // ホームページの学習記録表示も更新
            if (window.updateSingleStudyRecord) {
                try {
                    window.updateSingleStudyRecord(window.currentCaseData.id);
                    console.log('🔄 ホームページの学習記録表示を更新しました');
                } catch (error) {
                    console.warn('⚠️ ホームページの学習記録表示更新に失敗:', error);
                }
            }

            console.log('✅ 学習記録削除完了:', result);
        } else {
            throw new Error(result.error || '学習記録の削除に失敗');
        }

    } catch (error) {
        console.error('❌ 学習記録の削除に失敗:', error);
        showNotification('学習記録の削除に失敗しました', 'error');
    }
}

/**
 * 指定したケースの最新学習記録を取得（サーバーから）
 * @param {string} caseId - ケースID
 * @returns {Object|null} 学習記録データまたはnull
 */
export async function getLatestStudyRecord(caseId) {
    try {
        const response = await fetch(`/api/get-study-record/${encodeURIComponent(caseId)}`);
        const result = await response.json();
        
        if (result.success && result.latestRecord) {
            return result.latestRecord;
        }
        return null;
    } catch (error) {
        console.warn('学習記録の取得に失敗:', error);
        return null;
    }
}

/**
 * すべてのケースの最新学習記録を取得（サーバーから）
 * @returns {Object} ケースIDをキーとした学習記録のオブジェクト
 */
export async function getAllLatestStudyRecords() {
    try {
        // TTL-based client-side cache to avoid repeated heavy server scans
        const TTL = 30 * 1000; // 30 seconds
        const now = Date.now();

        if (window.__allStudyRecordsCache && (now - window.__allStudyRecordsCache.timestamp) < TTL) {
            console.log('📊 全学習記録: キャッシュを使用 (TTL内)');
            return window.__allStudyRecordsCache.data;
        }

        const response = await fetch('/api/get-all-study-records');
        const result = await response.json();

        if (result.success) {
            const records = result.records || {};
            window.__allStudyRecordsCache = { timestamp: now, data: records };
            console.log('📊 取得された学習記録:', Object.keys(records).length, '件 (fresh)');
            return records;
        }

        return {};
    } catch (error) {
        console.warn('⚠️ 学習記録の一括取得に失敗:', error);
        return {};
    }
}

// キャッシュを明示的に無効化するユーティリティ
window.invalidateAllStudyRecordsCache = function() {
    window.__allStudyRecordsCache = null;
    console.log('🧹 全学習記録キャッシュを無効化しました');
};

// casePageの関数をグローバルに公開
window.loadAndRenderCase = loadAndRenderCase;
