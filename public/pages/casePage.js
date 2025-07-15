// pages/casePage.js - ケースページ専用モジュール（ランク付け表示対応）

import { caseLoaders } from '../cases/index.js';
import { characters } from '../data/characters.js';
import { processArticleReferences, processAllReferences, setupArticleRefButtons, processBoldText, processBlankFillText } from '../articleProcessor.js';
import { showArticlePanel } from '../articlePanel.js';
import { ApiService } from '../apiService.js';
import { startChatSession } from '../chatSystem.js';
import { renderFilteredQAs } from './homePage.js';
import { recreateQAPopup, createGlobalPopupContainer } from '../qaPopup.js';

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

// Mermaid図表の大きなサイズ表示用CSS（縦幅無制限対応）
const mermaidCSS = document.createElement('style');
mermaidCSS.innerHTML = `
/* Mermaid図表の無制限縦幅表示設定 */
.mermaid {
    width: 100% !important;
    height: auto !important;
    min-height: 400px !important;
    max-height: none !important;
    padding: 15px !important;
    margin: 16px 0 !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    background-color: #ffffff !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    display: block !important;
    position: relative !important;
    cursor: grab !important;
    user-select: none !important;
}

.mermaid:active {
    cursor: grabbing !important;
}

.mermaid svg {
    width: 100% !important;
    height: auto !important;
    min-height: unset !important;
    max-height: none !important;
    max-width: 100% !important;
    display: block !important;
    transition: transform 0.2s ease !important;
    transform-origin: center center !important;
}

/* ストーリー内のMermaid図表専用設定 */
#tab-story-content .mermaid {
    width: 100% !important;
    height: auto !important;
    min-height: 500px !important;
    max-height: none !important;
    padding: 20px !important;
    margin: 20px 0 !important;
    position: relative !important;
    overflow: hidden !important;
}

#tab-story-content .mermaid svg {
    width: 100% !important;
    height: auto !important;
    min-height: unset !important;
    max-height: none !important;
}

/* Mermaidコンテナも無制限に */
.mermaid-container {
    width: 100% !important;
    height: auto !important;
    min-height: 450px !important;
    max-height: none !important;
    overflow: hidden !important;
    position: relative !important;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin: 16px 0;
}

.embed-container {
    width: 100% !important;
    height: auto !important;
    min-height: 400px !important;
    max-height: none !important;
    overflow: visible !important;
    margin: 12px 0 !important;
    padding: 8px !important;
    border-radius: 6px !important;
}

.embed-content {
    width: 100% !important;
    height: auto !important;
    min-height: 380px !important;
    max-height: none !important;
    overflow: visible !important;
}

/* インタラクティブコントロール */
.mermaid-controls {
    position: absolute !important;
    top: 8px !important;
    right: 8px !important;
    z-index: 100 !important;
    display: flex !important;
    gap: 4px !important;
    opacity: 0.8 !important;
    transition: opacity 0.3s !important;
}

.mermaid-controls:hover {
    opacity: 1 !important;
}

.control-btn {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    padding: 4px 8px !important;
    cursor: pointer !important;
    font-size: 10px !important;
    font-weight: bold !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    transition: all 0.2s !important;
    min-width: 40px !important;
    text-align: center !important;
    color: #333 !important;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 1) !important;
    border-color: #4a90e2 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 3px 8px rgba(0,0,0,0.2) !important;
}

.zoom-info {
    background: rgba(0, 0, 0, 0.7) !important;
    color: white !important;
    padding: 3px 6px !important;
    border-radius: 3px !important;
    font-size: 10px !important;
    position: absolute !important;
    bottom: 8px !important;
    right: 8px !important;
    z-index: 100 !important;
    pointer-events: none !important;
}

/* チャット内のMermaid図表も同様に無制限 */
.mermaid-chat-container .mermaid {
    width: 100% !important;
    height: auto !important;
    min-height: 350px !important;
    max-height: none !important;
    padding: 15px !important;
    margin: 16px 0 !important;
}

.mermaid-chat-container .mermaid svg {
    width: 100% !important;
    height: auto !important;
    min-height: unset !important;
    max-height: none !important;
}

/* Mermaid図表のテキストサイズも調整 */
.mermaid text {
    font-size: 16px !important;
    font-family: 'M PLUS Rounded 1c', sans-serif !important;
}

.mermaid .nodeLabel {
    font-size: 18px !important;
    font-weight: 500 !important;
}

/* インタラクティブモード専用スタイル */
.mermaid.interactive {
    overflow: hidden !important;
    height: 400px !important;
}

.mermaid.interactive svg {
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    cursor: move !important;
    width: auto !important;
    height: auto !important;
    max-width: none !important;
    max-height: none !important;
    transform-origin: center center !important;
    transition: transform 0.2s ease !important;
}

/* インタラクティブモード用の初期位置 */
.mermaid.interactive svg[data-initial="true"] {
    transform: translate(-50%, -50%) !important;
}
`;
document.head.appendChild(mermaidCSS);

// グローバル関数として showArticlePanel を利用可能にする
window.showArticlePanel = showArticlePanel;

// ★★★ ランク設定 ★★★
export const RANK_CONFIG = {
    'S': { color: 'text-cyan-600', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300', label: 'Sランク' },
    'A': { color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-300', label: 'Aランク' },
    'B': { color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300', label: 'Bランク' },
    'C': { color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-300', label: 'Cランク' }
};

/**
 * ケース詳細を読み込み、表示する
 * @param {string} caseId - 表示するケースのID
 * @param {boolean} updateHistory - URL履歴を更新するかどうか
 */
export async function loadAndRenderCase(caseId, updateHistory = true) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="flex justify-center items-center p-20"><div class="loader"></div></div>`;
    
    // window.caseLoaders があればそれを使用（目次再生成後の更新されたローダー）
    const currentLoaders = window.caseLoaders || caseLoaders;
    const loader = currentLoaders[caseId];
    if (!loader) {
        console.error('ローダーが見つかりません:', caseId, Object.keys(currentLoaders));
        const { renderHome } = await import('./homePage.js');
        renderHome();
        return;
    }

    try {
        const caseModule = await loader();
        window.currentCaseData = caseModule.default;

        if (updateHistory) {
            const newUrl = `#/case/${caseId}`;
            history.pushState({ page: 'case', caseId: caseId }, window.currentCaseData.title, newUrl);
        }
        
        renderCaseDetail();
    } catch (error) {
        console.error('判例データの読み込みに失敗しました:', error);
        const { renderHome } = await import('./homePage.js');
        renderHome();
    }
}

function renderCaseDetail() {
    document.title = `${window.currentCaseData.title} - あたしンちの世界へGO！`;
    const caseInfo = window.currentCaseData;
    const app = document.getElementById('app');
      app.innerHTML = `
        <div class="mb-6 flex justify-between items-center">
            <button id="back-to-home" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">← ホームに戻る</button>
            <div class="flex items-center space-x-3">
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
            </header>            <div class="flex flex-wrap justify-center border-b mb-6">                <button class="tab-button p-4 flex-grow text-center text-gray-600 active" data-tab="story">📖 ストーリー</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="explanation">🤔 解説</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="speed-quiz">⚡ スピード条文</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="essay">✍️ 論文トレーニング</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="qa-list">📝 Q&A</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="quiz">✏️ ミニ論文</button>
            </div>
            <div id="tab-content"></div>
        </div>    `;    renderTabContent('story');
      // ★★★ Mermaid初期化（強化版・DOM構築完了保証） ★★★
    // まず最初の初期化を待機
    setTimeout(() => {
        console.log('🎨 第1回Mermaid初期化開始（DOM構築後）');
        initializeMermaidDiagrams();
        
        // DOM確実化のため追加チェック
        setTimeout(() => {
            console.log('🎨 第2回Mermaid初期化開始（DOM安定化後）');
            const remainingElements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
            if (remainingElements.length > 0) {
                console.log(`🔍 未処理要素${remainingElements.length}個を発見、追加処理実行`);
                mermaidInitialized = false;
                mermaidInitializing = false;
                initializeMermaidDiagrams();
            }
        }, 1000);
        
        // 最終確認
        setTimeout(() => {
            console.log('🎨 第3回Mermaid初期化開始（最終確認）');
            const finalCheck = document.querySelectorAll('.mermaid:not([data-processed="true"])');
            if (finalCheck.length > 0) {
                console.log(`🔍 最終チェック: 未処理要素${finalCheck.length}個を発見、最終処理実行`);
                mermaidInitialized = false;
                mermaidInitializing = false;
                initializeMermaidDiagrams();
            }
        }, 3000);
    }, 300);
    
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
}

export function renderTabContent(tabName) {
    console.log(`🔄 タブ表示: ${tabName}`);
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
        const processedStoryHtml = processAllReferences(storyHtml, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
        const explanationHtml = (window.currentCaseData.explanation && window.currentCaseData.explanation.trim()) ? window.currentCaseData.explanation : '<div class="text-center text-gray-400">解説はありません</div>';
        const processedExplanationHtml = processAllReferences(explanationHtml, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
        // ★★★ 論文トレーニングが無い場合はタブ自体を省略 ★★★
        const hasEssay = window.currentCaseData.essay && window.currentCaseData.essay.question;
        let essayTabButton = hasEssay ? `<button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="essay">✍️ 論文トレーニング</button>` : '';
        let essayTabContent = hasEssay ? `<div id="tab-essay-content" class="tab-content-panel hidden"></div>` : '';
        // ★★★ スピード条文タブは常に表示（中身は初期化関数で制御）★★★
        const speedQuizTabButton = `<button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="speed-quiz">⚡ スピード条文</button>`;
        const speedQuizTabContent = `<div id="tab-speed-quiz-content" class="tab-content-panel hidden"></div>`;
        // Q&Aタブ
        const qaTabButton = `<button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="qa-list">📝 Q&A</button>`;
        let qaTabContent = `<div id="tab-qa-list-content" class="tab-content-panel hidden"></div>`;
        // タブボタン
        const tabButtons = `
            <button class="tab-button p-4 flex-grow text-center text-gray-600 active" data-tab="story">📖 ストーリー</button>
            <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="explanation">🤔 解説</button>
            <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="quiz">✏️ ミニ論文</button>
            ${speedQuizTabButton}
            ${qaTabButton}
            ${essayTabButton}
        `;
        // タブ本体
        contentDiv.innerHTML = `
            <div id="tab-story-content" class="tab-content-panel hidden">
                <div class="p-4">
                    <div class="mb-4 text-right">
                        <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文表示</button>
                    </div>
                    ${processedStoryHtml}
                    
                    <!-- ストーリーQ&A対話セクション -->
                    <div class="mt-8 border-t pt-6">
                        <h4 class="text-lg font-bold mb-4 text-center text-blue-700">💬 ストーリーについて質問してみよう</h4>
                        <div class="mb-4 bg-blue-50 p-4 rounded-lg">
                            <p class="text-sm text-blue-800 mb-2">📝 <strong>質問例：</strong></p>
                            <ul class="text-sm text-blue-700 list-disc list-inside space-y-1">
                                <li>このストーリーで一番重要な法的論点は何ですか？</li>
                                <li>登場人物の行為について、どのような法的問題がありますか？</li>
                                <li>実際の裁判ではどのような結論になると思いますか？</li>
                                <li>類似の判例や事例があれば教えてください。</li>
                            </ul>
                        </div>
                        <div class="input-form">
                            <textarea id="story-question-input" class="w-full h-32 p-4 border rounded-lg focus-ring" placeholder="ストーリーについて質問してください...（例：この事案の一番のポイントは何ですか？）"></textarea>
                            <div class="text-right mt-4">
                                <button class="start-chat-btn bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-type="story">質問して対話を始める</button>
                            </div>
                        </div>
                        <div class="chat-area" id="chat-area-story"></div>
                    </div>
                </div>
            </div>
            <div id="tab-explanation-content" class="tab-content-panel hidden">
                <div class="p-4">${processedExplanationHtml}</div>
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
        
        // Q&Aタブの初期描画
        (async () => {
            const qaTabDiv = document.getElementById('tab-qa-list-content');
            if (qaTabDiv && window.currentCaseData.questionsAndAnswers) {
                await renderFilteredQAs({
                    container: qaTabDiv,
                    qaList: window.currentCaseData.questionsAndAnswers,
                    showFilter: false
                });
            }
        })();
        // スピード条文タブの初期描画
        if (hasSpeedQuiz) {
            initializeSpeedQuizContent();
        }
    }
      // 全てのタブを非表示にする
    document.querySelectorAll('.tab-content-panel').forEach(panel => {
        panel.classList.add('hidden');
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
                await renderFilteredQAs({
                    container: targetTab,
                    qaList: window.currentCaseData.questionsAndAnswers,
                    showFilter: false
                });
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
        
        // ★★★ Mermaid図表のレンダリング（遅延強化版） ★★★
        setTimeout(() => {
            console.log(`🎨 タブ切り替え時のMermaid初期化: ${tabName}`);
            // ストーリータブの場合は特に確実に処理
            if (tabName === 'story') {
                // 初期化フラグをリセットして再処理を可能にする
                mermaidInitialized = false;
                mermaidInitializing = false;
            }
            initializeMermaidDiagrams();
        }, 200);
        
        // ★★★ ストーリータブの場合は追加の初期化を実行 ★★★
        if (tabName === 'story') {
            setTimeout(() => {
                console.log('🎨 ストーリータブ専用の追加Mermaid初期化');
                const mermaidElements = targetTab.querySelectorAll('.mermaid');
                if (mermaidElements.length > 0) {
                    console.log(`🔍 ストーリータブ内にMermaid要素${mermaidElements.length}個発見、強制再初期化`);
                    mermaidInitialized = false;
                    mermaidInitializing = false;
                    initializeMermaidDiagrams();
                }
            }, 500);
        }
        
        // Q&Aポップアップを復元
        if (window.qaPopupState) {
            window.qaPopupState.restorePopups();
        }
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
                    const rankConfig = RANK_CONFIG[groupRank] || RANK_CONFIG['C'];
                    
                    html += `
                        <div class="bg-white border-2 ${(rankConfig).borderColor} rounded-xl shadow-lg p-6" id="quiz-group-${quizIndex}">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex items-center gap-3">
                                    <h3 class="text-xl font-bold text-yellow-800">【大問 ${quizIndex + 1}】${quizGroup.title || 'ミニ論文問題'}</h3>
                                    <span class="px-3 py-1 rounded-full text-sm font-bold ${rankConfig.color} ${rankConfig.bgColor} border ${rankConfig.borderColor}">
                                        ${rankConfig.label}
                                    </span>
                                </div>
                                <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded">📖 条文</button>
                            </div>
                            
                            <!-- 大問の事例・背景 -->
                            ${quizGroup.background ? `
                                <div class="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                    <h4 class="font-bold text-blue-800 mb-2">📋 事例</h4>
                                    <div class="text-sm text-blue-700">${processAllReferences(quizGroup.background, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
                                </div>
                            ` : ''}
                            
                            <!-- 小問一覧 -->
                            <div class="space-y-6">
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
        const rankConfig = RANK_CONFIG[problemRank] || RANK_CONFIG['C'];
        
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
            <div class="prose-bg p-4 rounded-lg shadow-sm border-l-4 ${rankConfig.borderColor}" id="subproblem-${quizIndex}-0">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-2">
                        <h4 class="text-lg font-bold">問題</h4>
                        <span class="px-2 py-1 rounded text-xs font-bold ${rankConfig.color} ${rankConfig.bgColor}">
                            ${rankConfig.label}
                        </span>
                    </div>
                    <button class="view-past-answers-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded" data-case-id="${window.currentCaseData.id}" data-problem-type="quiz" data-problem-index="${quizIndex}-0">📝 過去の回答</button>
                </div>
                
                <div class="mb-4 bg-gray-100 p-4 rounded-lg problem-text">${processAllReferences(quizGroup.problem, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
                ${hintHtml}
                ${pointsHtml}
                
                <!-- 過去の回答表示エリア -->
                <div id="past-answers-area-${quizIndex}-0" class="mb-4 hidden"></div>
                
                <div class="input-form">
                    <div class="answer-entry-section bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
                        <div class="text-center">
                            <div class="mb-4">
                                <svg class="w-16 h-16 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <h4 class="text-lg font-bold text-gray-700 mb-2">答案を作成しましょう</h4>
                                <p class="text-sm text-gray-600 mb-4">専用の答案入力画面で、集中して論述に取り組めます</p>
                            </div>
                            <button class="enter-answer-mode-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200" data-quiz-index="${quizIndex}" data-sub-index="0">
                                ✏️ 答案を入力する
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="chat-area" id="chat-area-quiz-${quizIndex}-0"></div>
            </div>
        `;
    }
      // 新形式：複数小問（ランク付け表示対応）
    return quizGroup.subProblems.map((subProblem, subIndex) => {
        const subRank = subProblem.rank || quizGroup.rank || 'C';
        const rankConfig = RANK_CONFIG[subRank] || RANK_CONFIG['C'];
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
                    return `<button type="button" class="qa-ref-btn ml-1 px-2 py-0.5 rounded bg-yellow-200 text-yellow-900 border border-yellow-400 text-xs font-bold" data-qa-index="${qaIndex}" data-quiz-index="${quizIndex}" data-sub-index="${subIndex}" data-q-number="${qNum}">Q${qNum}</button>`;
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
            <div class="prose-bg p-4 rounded-lg shadow-sm border-l-4 ${rankConfig.borderColor}" id="subproblem-${quizIndex}-${subIndex}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-2">
                        <h4 class="text-lg font-bold text-green-800">小問 ${subIndex + 1}${subProblem.title ? `: ${subProblem.title}` : ''}</h4>
                        <span class="px-2 py-1 rounded text-xs font-bold ${rankConfig.color} ${rankConfig.bgColor}">
                            ${rankConfig.label}
                        </span>
                    </div>                    <div class="flex gap-1">
                        <button class="view-past-answers-btn bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded" data-case-id="${window.currentCaseData.id}" data-problem-type="quiz" data-problem-index="${quizIndex}-${subIndex}">📝 過去回答</button>
                    </div>                </div>
                ${qaButtonsHtml}
                <div class="mb-4 bg-gray-100 p-4 rounded-lg problem-text">${processAllReferences(subProblem.problem, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
                ${hintHtml}
                ${pointsHtml}
                <!-- 過去の回答表示エリア -->
                <div id="past-answers-area-${quizIndex}-${subIndex}" class="mb-4 hidden"></div>
                <div class="input-form">
                    <div class="answer-entry-section bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
                        <div class="text-center">
                            <div class="mb-4">
                                <svg class="w-16 h-16 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <h4 class="text-lg font-bold text-gray-700 mb-2">答案を作成しましょう</h4>
                                <p class="text-sm text-gray-600 mb-4">専用の答案入力画面で、集中して論述に取り組めます</p>
                            </div>
                            <button class="enter-answer-mode-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200" data-quiz-index="${quizIndex}" data-sub-index="${subIndex}">
                                ✏️ 答案を入力する
                            </button>
                        </div>
                    </div>
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

// ★★★ Mermaid初期化状態管理
let mermaidInitialized = false;
let mermaidInitializing = false;

// ★★★ Mermaid図表初期化関数 ★★★
function initializeMermaidDiagrams() {
    console.log('🎨 Mermaid初期化開始');
    
    // ✨ 初期化中の場合はスキップ
    if (mermaidInitializing) {
        console.log('⏳ Mermaid初期化中のためスキップ');
        return;
    }
    
    if (typeof mermaid === 'undefined') {
        console.warn('⚠️ Mermaid.jsが読み込まれていません');
        return;
    }
    
    // ✨ 未処理のMermaid要素があるかチェック
    const unprocessedElements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
    console.log(`🔍 未処理のMermaid要素: ${unprocessedElements.length}個`);
    
    // 未処理要素がない場合で、かつ初期化済みの場合はスキップ
    if (unprocessedElements.length === 0 && mermaidInitialized) {
        console.log('⏭️ 未処理要素なし、かつ初期化済みのためスキップ');
        return;
    }
    
    mermaidInitializing = true; // 初期化中フラグを立てる
    
    try {
        // ✨ より安全なMermaid設定（サイズ調整対応版）
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'M PLUS Rounded 1c, sans-serif',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'linear',
                // ✨ 座標エラー対策
                rankdir: 'TD',
                nodeSpacing: 80, // ノード間隔を拡大
                rankSpacing: 100, // ランク間隔を拡大
                // ✨ サイズ調整対応
                diagramPadding: 40, // パディングを拡大
                wrappingWidth: 300 // テキスト折り返し幅を拡大
            },
            // ✨ グラフの幅と高さを適切に設定
            graph: {
                useMaxWidth: true,
                htmlLabels: true
            },
            themeVariables: {
                primaryColor: '#f0f9ff',
                primaryTextColor: '#1e293b',
                primaryBorderColor: '#0284c7',
                lineColor: '#475569',
                fontSize: '18px' // フォントサイズをさらに大きく
            },
            // ✨ エラー対策の追加設定
            maxTextSize: 50000,
            maxEdges: 500,
            // ✨ レンダリング設定
            deterministicIds: true,
            deterministicIDSeed: 'mermaid-seed'
        });
        
        // 現在表示されている未処理のMermaid要素のみをレンダリング
        const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
        console.log(`🔍 処理対象のMermaid要素を${mermaidElements.length}個発見`);
        
        if (mermaidElements.length === 0) {
            console.log('✅ 処理対象のMermaid要素なし、初期化完了');
            mermaidInitializing = false;
            mermaidInitialized = true;
            return;
        }
        
        mermaidElements.forEach(async (element, index) => {
            try {
                const graphDefinition = element.textContent.trim();
                console.log(`🎨 Mermaid #${index} 描画開始:`, graphDefinition.substring(0, 100));
                
                // スタイル設定（無制限縦幅で表示）
                element.style.padding = '30px';
                element.style.margin = '24px 0';
                element.style.border = '1px solid #e5e7eb';
                element.style.borderRadius = '12px';
                element.style.backgroundColor = '#ffffff';
                element.style.width = '100%';
                element.style.boxSizing = 'border-box';
                element.style.height = 'auto'; // 高さを自動調整
                element.style.minHeight = 'unset'; // 最小高さ制限を解除
                element.style.maxHeight = 'none'; // 最大高さ制限を解除
                element.style.overflow = 'visible';
                element.setAttribute('data-processed', 'true');
                
                // 親コンテナの調整（無制限縦幅対応）
                const parentContainer = element.parentElement;
                if (parentContainer) {
                    parentContainer.style.width = '100%';
                    parentContainer.style.height = 'auto';
                    parentContainer.style.maxHeight = 'none';
                    parentContainer.style.overflow = 'visible';
                }

                // Mermaid構文修正
                const fixedDefinition = fixMermaidSyntax(graphDefinition);
                
                // Mermaidレンダリング実行
                const renderResult = await mermaid.render(`mermaid-${index}-${Date.now()}`, fixedDefinition);
                element.innerHTML = renderResult.svg;
                
                // SVGサイズ調整（縦幅無制限対応）
                setTimeout(() => {
                    const svg = element.querySelector('svg');
                    if (svg) {
                        // インタラクティブモードの場合の特別処理
                        if (element.classList.contains('interactive')) {
                            // インタラクティブモード用のSVG設定
                            svg.style.position = 'absolute';
                            svg.style.top = '50%';
                            svg.style.left = '50%';
                            svg.style.transform = 'translate(-50%, -50%)';
                            svg.style.transformOrigin = 'center center';
                            svg.style.cursor = 'move';
                            svg.style.maxWidth = 'none';
                            svg.style.maxHeight = 'none';
                            svg.style.width = 'auto';
                            svg.style.height = 'auto';
                            svg.style.transition = 'transform 0.2s ease';
                            svg.setAttribute('data-initial', 'true');
                            
                            // コンテナの高さを固定
                            element.style.height = '400px';
                            element.style.overflow = 'hidden';
                            element.style.position = 'relative';
                            
                            console.log('🎮 インタラクティブSVG設定完了:', svg);
                        } else {
                            // 通常モードのSVG設定
                            svg.setAttribute('width', '100%');
                            svg.removeAttribute('height');
                            svg.style.width = '100%';
                            svg.style.height = 'auto';
                            svg.style.minHeight = 'unset';
                            svg.style.maxHeight = 'none';
                            svg.style.maxWidth = '100%';
                            svg.style.display = 'block';
                        }
                        
                        // preserveAspectRatio を設定してスケールを適切に
                        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                        
                        // viewBoxがある場合は調整
                        const viewBox = svg.getAttribute('viewBox');
                        if (viewBox) {
                            console.log(`🎨 ViewBox設定: ${viewBox}`);
                            const [x, y, width, height] = viewBox.split(' ').map(Number);
                            svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
                        }
                    }
                }, 100);
                
                console.log(`✅ Mermaid #${index} 描画完了`);
            } catch (renderError) {
                console.error(`❌ Mermaid レンダリングエラー #${index}:`, renderError);
                const graphDefinition = element.textContent.trim();
                element.innerHTML = `
                    <div style="color: red; padding: 20px; border: 2px solid red; border-radius: 8px; background: #fef2f2;">
                        <h3>❌ 図表レンダリングエラー</h3>
                        <p><strong>エラー:</strong> ${renderError.message}</p>
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #dc2626; font-weight: bold;">図表定義を表示</summary>
                            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; margin-top: 8px;">${graphDefinition}</pre>
                        </details>
                    </div>
                `;
                element.setAttribute('data-processed', 'error');
            }
        });
        console.log('🎨 Mermaid初期化完了');
        
        // ✨ 初期化フラグをリセット
        mermaidInitializing = false;
        mermaidInitialized = true;
        
        // ★★★ インタラクティブ機能を初期化 ★★★
        setTimeout(() => {
            initializeMermaidInteractive();
        }, 100);
        
    } catch (error) {
        console.error('❌ Mermaid初期化エラー:', error);
        // ✨ エラー時もフラグをリセット
        mermaidInitializing = false;
    } finally {
        mermaidInitializing = false; // 初期化中フラグを解除
    }
}

// ★★★ Mermaidインタラクティブ機能初期化 ★★★
function initializeMermaidInteractive() {
    console.log('🎮 Mermaidインタラクティブ機能を初期化');
    
    // すべてのmermaid-containerを対象にする
    const containers = document.querySelectorAll('.mermaid-container');
    
    containers.forEach(container => {
        const mermaidDiv = container.querySelector('.mermaid');
        const controls = container.querySelector('.mermaid-controls');
        const zoomInfo = container.querySelector('.zoom-info');
        
        if (!mermaidDiv || !controls) return;
        
        // インタラクティブデータを初期化
        // ★★★ Mermaidインタラクティブデータ（拡張移動範囲対応） ★★★
        const interactiveData = {
            scale: 1,
            translateX: 0,
            translateY: 0,
            isDragging: false,
            lastMouseX: 0,
            lastMouseY: 0,
            minScale: 0.1,
            maxScale: 5
        };
        
        // データを要素に保存（移動範囲は実際の制限計算で2倍拡張される）
        mermaidDiv._interactiveData = interactiveData;
        
        // SVG要素の取得
        const svg = mermaidDiv.querySelector('svg');
        if (!svg) return;
        
        // 初期設定
        updateMermaidTransform(mermaidDiv);
        updateZoomInfo(zoomInfo, interactiveData.scale);
        
        // コントロールボタンのイベント設定
        setupMermaidControls(controls, mermaidDiv, zoomInfo);
        
        // マウスイベントの設定
        setupMermaidMouseEvents(mermaidDiv, zoomInfo);
        
        console.log('✅ インタラクティブ機能設定完了:', container);
    });
}

// ★★★ Mermaidコントロールボタン設定 ★★★
function setupMermaidControls(controls, mermaidDiv, zoomInfo) {
    const buttons = controls.querySelectorAll('.control-btn');
    
    buttons.forEach(button => {
        const action = button.dataset.action;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const data = mermaidDiv._interactiveData;
            if (!data) return;
            
            switch (action) {
                case 'zoom-in':
                    data.scale = Math.min(data.maxScale, data.scale * 1.2);
                    break;
                case 'zoom-out':
                    data.scale = Math.max(data.minScale, data.scale / 1.2);
                    break;
                case 'reset':
                    data.scale = 1;
                    data.translateX = 0;
                    data.translateY = 0;
                    break;
                case 'fullscreen':
                    toggleMermaidFullscreen(mermaidDiv);
                    return;
            }
            
            // ズーム後に位置を調整（境界制限を適用）
            updateMermaidTransform(mermaidDiv);
            updateZoomInfo(zoomInfo, data.scale);
        });
    });
}

// ★★★ Mermaidマウスイベント設定 ★★★
function setupMermaidMouseEvents(mermaidDiv, zoomInfo) {
    const data = mermaidDiv._interactiveData;
    if (!data) return;
    
    // マウスホイールでズーム
    mermaidDiv.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const rect = mermaidDiv.getBoundingClientRect();
        const svg = mermaidDiv.querySelector('svg');
        if (!svg) return;
        
        // マウス位置（mermaidDiv内の相対座標）
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // mermaidDivの中心点
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // 現在のtranslateを考慮したマウス位置（SVG座標系）
        const svgMouseX = (mouseX - centerX - data.translateX) / data.scale;
        const svgMouseY = (mouseY - centerY - data.translateY) / data.scale;
        
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(data.minScale, Math.min(data.maxScale, data.scale * scaleFactor));
        
        if (newScale !== data.scale) {
            // 新しいスケールでのマウス位置
            const newSvgMouseX = svgMouseX * newScale;
            const newSvgMouseY = svgMouseY * newScale;
            
            // マウス位置が変わらないように新しいtranslateを計算
            data.translateX = mouseX - centerX - newSvgMouseX;
            data.translateY = mouseY - centerY - newSvgMouseY;
            
            data.scale = newScale;
            updateMermaidTransform(mermaidDiv);
            updateZoomInfo(zoomInfo, data.scale);
        }
    });
    
    // マウスドラッグでパン
    mermaidDiv.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // 左クリックのみ
        
        e.preventDefault();
        data.isDragging = true;
        data.lastMouseX = e.clientX;
        data.lastMouseY = e.clientY;
        
        mermaidDiv.style.cursor = 'grabbing';
        
        // ズーム情報を表示
        if (zoomInfo) zoomInfo.style.display = 'block';
    });
    
    mermaidDiv.addEventListener('mousemove', (e) => {
        if (!data.isDragging) return;
        
        const deltaX = e.clientX - data.lastMouseX;
        const deltaY = e.clientY - data.lastMouseY;
        
        // 仮の新しい位置を計算
        const newTranslateX = data.translateX + deltaX;
        const newTranslateY = data.translateY + deltaY;
        
        // 境界チェック
        const container = mermaidDiv.closest('.mermaid-container') || mermaidDiv;
        const containerRect = container.getBoundingClientRect();
        const svg = mermaidDiv.querySelector('svg');
        
        if (svg) {
            const svgRect = svg.getBoundingClientRect();
            const scaledWidth = svgRect.width * data.scale;
            const scaledHeight = svgRect.height * data.scale;
            
            // ★★★ 最小移動範囲を設定（ズームレベルに関係なく常に動かせる） ★★★
            const minMovableRange = 400; // 最小400px分は動かせるようにする（拡大）
            const baseMaxTranslateX = Math.max(0, (scaledWidth - containerRect.width) / 2);
            const baseMaxTranslateY = Math.max(0, (scaledHeight - containerRect.height) / 2);
            
            // 基本範囲の2倍と最小範囲の大きい方を採用
            const maxTranslateX = Math.max(minMovableRange, baseMaxTranslateX * 2);
            const maxTranslateY = Math.max(minMovableRange, baseMaxTranslateY * 2);
            
            // 制限範囲内に収める
            data.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
            data.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        } else {
            data.translateX = newTranslateX;
            data.translateY = newTranslateY;
        }
        
        data.lastMouseX = e.clientX;
        data.lastMouseY = e.clientY;
        
        updateMermaidTransform(mermaidDiv);
    });
    
    // グローバルなマウスアップイベント
    document.addEventListener('mouseup', () => {
        if (data.isDragging) {
            data.isDragging = false;
            mermaidDiv.style.cursor = 'grab';
            
            // ズーム情報を一定時間後に非表示
            setTimeout(() => {
                if (zoomInfo) zoomInfo.style.display = 'none';
            }, 2000);
        }
    });
    
    // マウスリーブ時の処理
    mermaidDiv.addEventListener('mouseleave', () => {
        if (data.isDragging) {
            data.isDragging = false;
            mermaidDiv.style.cursor = 'grab';
        }
    });
}

// ★★★ Mermaid変形適用 ★★★
function updateMermaidTransform(mermaidDiv) {
    const data = mermaidDiv._interactiveData;
    const svg = mermaidDiv.querySelector('svg');
    
    if (!data || !svg) {
        console.warn('⚠️ updateMermaidTransform: データまたはSVGが見つかりません');
        return;
    }
    
    // 境界チェックと制限
    const container = mermaidDiv.closest('.mermaid-container') || mermaidDiv;
    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    
    // スケール済みのSVGサイズ
    const scaledWidth = svgRect.width * data.scale;
    const scaledHeight = svgRect.height * data.scale;
    
    // ★★★ 最小移動範囲を設定（ズームレベルに関係なく常に動かせる） ★★★
    const minMovableRange = 400; // 最小400px分は動かせるようにする（拡大）
    const baseMaxTranslateX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const baseMaxTranslateY = Math.max(0, (scaledHeight - containerRect.height) / 2);
    
    // 基本範囲の2倍と最小範囲の大きい方を採用
    const maxTranslateX = Math.max(minMovableRange, baseMaxTranslateX * 2);
    const maxTranslateY = Math.max(minMovableRange, baseMaxTranslateY * 2);
    
    // 移動量を制限
    data.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, data.translateX));
    data.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, data.translateY));
    
    console.log('🎯 変形適用:', {
        scale: data.scale,
        translateX: data.translateX,
        translateY: data.translateY,
        scaledSize: { width: scaledWidth, height: scaledHeight },
        containerSize: { width: containerRect.width, height: containerRect.height },
        movableRange: { maxX: maxTranslateX, maxY: maxTranslateY }
    });
    
    // SVGのスタイルを強制的に設定
    svg.style.transformOrigin = 'center center';
    svg.style.transition = 'transform 0.2s ease';
    
    // インタラクティブモードでは初期位置(-50%, -50%)を含めてtransformを計算
    const baseTransform = 'translate(-50%, -50%)';
    const userTransform = `translate(${data.translateX}px, ${data.translateY}px) scale(${data.scale})`;
    const finalTransform = `${baseTransform} ${userTransform}`;
    
    svg.style.transform = finalTransform;
    
    // 強制的にスタイルを適用
    svg.style.setProperty('transform', finalTransform, 'important');
    
    console.log('✅ 変形適用完了:', finalTransform);
}

// ★★★ ズーム情報更新 ★★★
function updateZoomInfo(zoomInfo, scale) {
    if (!zoomInfo) return;
    
    const percentage = Math.round(scale * 100);
    zoomInfo.textContent = `${percentage}%`;
    zoomInfo.style.display = 'block';
    
    // 一定時間後に非表示
    clearTimeout(zoomInfo._hideTimeout);
    zoomInfo._hideTimeout = setTimeout(() => {
        zoomInfo.style.display = 'none';
    }, 3000);
}

// ★★★ フルスクリーン切り替え ★★★
function toggleMermaidFullscreen(mermaidDiv) {
    const container = mermaidDiv.closest('.mermaid-container');
    if (!container) return;
    
    if (container.classList.contains('fullscreen')) {
        // フルスクリーン解除
        container.classList.remove('fullscreen');
        container.style.cssText = '';
        document.body.style.overflow = '';
        
        // 通常モードのスタイルを復元
        mermaidDiv.classList.remove('fullscreen-mermaid');
        mermaidDiv.style.cssText = '';
        
        // 変形をリセット
        const data = mermaidDiv._interactiveData;
        if (data) {
            data.scale = 1;
            data.translateX = 0;
            data.translateY = 0;
            updateMermaidTransform(mermaidDiv);
        }
    } else {
        // フルスクリーン化
        container.classList.add('fullscreen');
        container.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
            background: white !important;
            border: none !important;
            border-radius: 0 !important;
        `;
        
        mermaidDiv.classList.add('fullscreen-mermaid');
        mermaidDiv.style.cssText = `
            width: 100% !important;
            height: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
        `;
        
        document.body.style.overflow = 'hidden';
        
        // ESCキーでフルスクリーン解除
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                toggleMermaidFullscreen(mermaidDiv);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
}

// ★★★ 修正されたMermaid構文エラー自動修正関数 ★★★
function fixMermaidSyntax(definition) {
    console.log('🔧 Mermaid構文エラー自動修正開始');
    
    // 1. 開始行とノード定義の分離（より厳密にチェック）
    const lines = definition.split('\n');
    const firstLine = lines[0].trim();
    
    // flowchart TD A[...] のような開始行にノード定義が含まれている場合
    if (firstLine.match(/^(flowchart|graph)\s+(TD|LR|TB|RL|BT)\s+[A-Z]/)) {
        console.log('🔧 開始行にノード定義が含まれているため分離します');
        const parts = firstLine.split(/\s+/);
        const chartType = parts[0]; // flowchart
        const direction = parts[1]; // TD
        const nodeDefinition = parts.slice(2).join(' '); // A[...] --> ...
        
        // 分離して再構築
        lines[0] = `${chartType} ${direction}`;
        lines.splice(1, 0, '    ' + nodeDefinition);
        definition = lines.join('\n');
    }
    
    // 2. 無効な文字を除去・置換
    definition = definition
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // ゼロ幅文字を削除
        .replace(/[""]/g, '"') // 特殊なクォートを標準に
        .replace(/['']/g, "'"); // 特殊なアポストロフィを標準に
    
    // 3. ノードラベル内の特殊文字と改行をサニタイズ（角括弧ノード）
    definition = definition.replace(/\[([^\]]+)\]/g, (match, label) => {
        let sanitizedLabel = label
            .replace(/\n/g, ' ') // 改行を空白に変換
            .replace(/<br\/?>/gi, ' ') // HTMLブレークタグを空白に変換（大文字小文字無視）
            .replace(/<[^>]+>/g, ' ') // その他のHTMLタグを空白に変換
            .replace(/\(/g, '（') // 半角括弧を全角に
            .replace(/\)/g, '）')
            .replace(/:/g, '：') // 半角コロンを全角に
            .replace(/;/g, '；') // 半角セミコロンを全角に
            .replace(/"/g, '"') // 半角ダブルクォートを全角に
            .replace(/'/g, "'") // 半角シングルクォートを全角に
            .replace(/\s+/g, ' ') // 連続する空白を単一の空白に
            .trim(); // 前後の空白を削除
        
        return `[${sanitizedLabel}]`;
    });
    
    // 4. 円形ノード（二重丸）内の特殊文字もサニタイズ
    definition = definition.replace(/\(\(([^)]+)\)\)/g, (match, label) => {
        let sanitizedLabel = label
            .replace(/\n/g, ' ')
            .replace(/<br\/?>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\(/g, '（')
            .replace(/\)/g, '）')
            .replace(/:/g, '：')
            .replace(/;/g, '；')
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
        
        return `((${sanitizedLabel}))`;
    });
    
    // 5. 判断ノード（菱形）内の特殊文字もサニタイズ
    definition = definition.replace(/\{([^}]+)\}/g, (match, label) => {
        let sanitizedLabel = label
            .replace(/\n/g, ' ')
            .replace(/<br\/?>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\(/g, '（')
            .replace(/\)/g, '）')
            .replace(/:/g, '：')
            .replace(/;/g, '；')
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
        
        return `{${sanitizedLabel}}`;
    });
    
    // 6. エッジラベル内の特殊文字もサニタイズ
    definition = definition.replace(/--\s*"([^"]+)"\s*-->/g, (match, label) => {
        let sanitizedLabel = label
            .replace(/\n/g, ' ')
            .replace(/<br\/?>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        return `-- "${sanitizedLabel}" -->`;
    });
    
    // 7. コメント行の改行問題を修正
    definition = definition.replace(/%%.*$/gm, (match) => {
        return match.replace(/\n/g, ' ');
    });
    
    console.log('🔧 修正後のMermaid定義:', definition);
    return definition;
}

// ★★★ キャラクター名@表情を事前処理する関数 ★★★
function preprocessCharacterNodes(graphDefinition) {
    try {
        console.log('🔄 キャラクター@表情の事前処理開始');
          // キャラクター名@表情のパターンを検出して、IDマッピングを作成（拡張版）
        const characterPattern = /[\"\[]([^\"@\[\]]+)@([^\"@\[\]]+)[\"\]]/g;
        const characterMatches = [...graphDefinition.matchAll(characterPattern)];
        
        if (characterMatches.length === 0) {
            console.log('⚠️ キャラクター@表情パターンが見つかりません');
            console.log('📝 検索対象の定義:', graphDefinition.substring(0, 500));
            return graphDefinition;
        }
        
        console.log(`🎭 ${characterMatches.length}個のキャラクター指定を発見`);
        
        let processedDefinition = graphDefinition;
        const characterMap = new Map();
        
        characterMatches.forEach((match, index) => {
            const [fullMatch, characterName, expression] = match;
            const nodeId = `char_${index}`;
            const cleanName = characterName.trim();
            
            // キャラクター情報を保存
            characterMap.set(nodeId, { name: cleanName, expression: expression });
            
            // 元のテキストをクリーンなノードIDに置換
            const cleanText = fullMatch.replace(/@[^\"@\[\]]+/, '').replace(/[\"\[\]]/g, '');
            const replacement = `${nodeId}["${cleanName}"]`;
            
            processedDefinition = processedDefinition.replace(fullMatch, replacement);
            
            console.log(`🔄 置換: ${fullMatch} → ${replacement}`);
        });
          // キャラクターマップをグローバルに保存（画像追加時に使用）
        window.currentMermaidCharacterMap = characterMap;
        
        console.log('✅ キャラクター@表情の事前処理完了');
        return processedDefinition;
       } catch (error) {
        console.error('❌ キャラクター事前処理エラー:', error);
        return graphDefinition;
    }
}

// ★★★ タブ切り替え時のMermaidレンダリング ★★★
function renderMermaidInTab() {
    setTimeout(() => {
        initializeMermaidDiagrams();
    }, 100);
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

    return storyData.map(item => {
        if (item.type === 'scene') return `<div class="text-sm text-gray-600 p-4 bg-yellow-50 rounded-lg mt-6 mb-4"><h3 class="font-bold mb-2 text-lg">${item.text}</h3></div>`;
        if (item.type === 'narration') return `<p class="text-center text-gray-600 italic my-4">${item.text}</p>`;
        
        // ★★★ 新機能: embed要素の処理 ★★★
        if (item.type === 'embed') {
            console.log('🎨 Embed要素を処理中:', item);
            const title = item.title ? `<h4 class="font-bold text-lg mb-2 text-gray-800">${item.title}</h4>` : '';
            const description = item.description ? `<p class="text-sm text-gray-600 mb-3">${item.description}</p>` : '';            // Mermaid図表の場合
            if (item.format === 'mermaid') {
                const mermaidId = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                console.log('🎨 Mermaid embed要素を作成:', mermaidId, item.content);
                return `
                    <div class="embed-container my-6">
                        ${title}
                        ${description}
                        <div class="embed-content">
                            <div class="mermaid-container" data-mermaid-id="${mermaidId}">
                                <div class="mermaid-controls">
                                    <button class="control-btn zoom-in" data-action="zoom-in">🔍+</button>
                                    <button class="control-btn zoom-out" data-action="zoom-out">🔍-</button>
                                    <button class="control-btn zoom-reset" data-action="reset">📐</button>
                                    <button class="control-btn fullscreen" data-action="fullscreen">⛶</button>
                                </div>
                                <div class="zoom-info" style="display: none;">100%</div>
                                <div id="${mermaidId}" class="mermaid interactive">${item.content}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // キャラクター図表の場合
            if (item.format === 'character-diagram') {
                console.log('🎭 キャラクター図表要素を作成:', item);
                return `
                    <div class="embed-container my-6">
                        ${title}
                        ${description}
                        <div class="embed-content">
                            <div class="character-diagram">
                                ${item.content}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // その他のembed形式（SVG、HTMLなど）
            return `
                <div class="embed-container my-6">
                    ${title}
                    ${description}
                    <div class="embed-content">
                        ${item.content || ''}
                    </div>
                </div>
            `;
        }
        
        const character = characters.find(c => c.name === item.speaker);
        if (!character) return '';

        const requestedExpression = item.expression ?? 'normal';
        const finalExpression = character.availableExpressions.includes(requestedExpression) ? requestedExpression : 'normal';
        const iconSrc = `/images/${character.baseName}_${finalExpression}.png`;
        const fallbackSrc = `/images/${character.baseName}_normal.png`;
        const onErrorAttribute = `this.src='${fallbackSrc}'; this.onerror=null;`;
        
        const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,  0, 0.1);";
        const isRightSide = rightSideCharacters.includes(item.speaker);
        const iconTransform = isRightSide ? 'transform: scaleX(-1);' : '';
        const iconHtml = `<img src="${iconSrc}" alt="${character.name}" style="${imageStyle} ${iconTransform}" onerror="${onErrorAttribute}">`;
        const bubbleHtml = `<div class="chat-bubble ${isRightSide ? 'chat-bubble-right' : 'chat-bubble-left'} p-3 rounded-lg shadow"><p class="font-bold">${character.name}</p><p>${item.dialogue}</p></div>`;
        
        return `<div class="flex items-start gap-3 my-4 ${isRightSide ? 'justify-end' : ''}">${isRightSide ? bubbleHtml + iconHtml : iconHtml + bubbleHtml}</div>`;    
    }).join('');
}

// ★★★ Mermaid図表にキャラクター画像を追加する関数（大幅改良版） ★★★
function addCharacterImagesToMermaid(mermaidElement, graphDefinition) {
    try {
        console.log('🎨 Mermaid図表にキャラクター画像を追加開始');
        
        // 保存されたキャラクターマップを使用
        const characterMap = window.currentMermaidCharacterMap;
        
        if (!characterMap || characterMap.size === 0) {

            console.log('⚠️ キャラクターマップが見つかりません');
            return;
        }
        
        console.log(`🔍 ${characterMap.size}個のキャラクター画像指定を発見`);
        
        // SVG要素を取得
        const svgElement = mermaidElement.querySelector('svg');
        if (!svgElement) {
            console.warn('⚠️ SVG要素が見つつかりません');
            return;
        }
        
        // SVGの名前空間とdefsを設定
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        
        let defsElement = svgElement.querySelector('defs');
        if (!defsElement) {
            defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svgElement.insertBefore(defsElement, svgElement.firstChild);
        }
        
        // 各キャラクターに対して画像を追加
        characterMap.forEach((characterInfo, nodeId) => {
            const { name: characterName, expression } = characterInfo;
            console.log(`🎭 キャラクター画像追加: ${characterName}@${expression} (ID: ${nodeId})`);
            
            // ノードIDでテキスト要素を検索
            const textElements = svgElement.querySelectorAll('text, tspan');
            let targetTextElement = null;
            
            textElements.forEach(textEl => {
                const textContent = textEl.textContent || '';
                // キャラクター名で検索
                if (textContent.trim() === characterName) {
                    targetTextElement = textEl;
                    console.log(`🎯 ターゲットテキスト発見: ${textContent}`);
                }
            });
            
            if (targetTextElement) {
                addCharacterImageToNode(svgElement, targetTextElement, characterName, expression, defsElement);
            } else {
                console.warn(`⚠️ ${characterName}のテキスト要素が見つかりません`);
                // フォールバック: 全てのテキスト要素を確認
                console.log('📋 利用可能なテキスト要素:');
                textElements.forEach((el, i) => {
                    console.log(`  ${i}: "${el.textContent}"`);
                });
            }
        });
        
        console.log('✅ キャラクター画像追加完了');
    } catch (error) {
        console.error('❌ キャラクター画像追加エラー:', error);
    }
}

// ★★★ 特定のノードにキャラクター画像を追加（改良版） ★★★
function addCharacterImageToNode(svgElement, targetTextElement, characterName, expression, defsElement) {
    try {
        // キャラクター名を正規化（characters.jsと照合）
        const normalizedCharacter = normalizeCharacterName(characterName);
        if (!normalizedCharacter) {
            console.warn(`⚠️ 未知のキャラクター: ${characterName}`);
            return;
        }
        
        // 表情を正規化
        const normalizedExpression = normalizeExpression(expression);
        
        // 画像パスを生成
        const imagePath = `/images/${normalizedCharacter.baseName}_${normalizedExpression}.png`;
        const fallbackPath = `/images/${normalizedCharacter.baseName}_normal.png`;
        
        console.log(`🖼️ 画像パス: ${imagePath}`);
        
        // テキスト要素の位置を取得
        const textBBox = targetTextElement.getBBox();
        const textX = parseFloat(targetTextElement.getAttribute('x') || 0);
        const textY = parseFloat(targetTextElement.getAttribute('y') || 0);
          // 画像のサイズと位置を設定（大きくして見やすく）
        const imageSize = 80; // 画像サイズ（ピクセル）を大幅に拡大
        const imageX = textX - imageSize / 2;
        const imageY = textY - textBBox.height - imageSize - 15; // テキストの上に配置、間隔も調整
        
        // clipPath を作成（円形）
        const clipPathId = `clip-${characterName}-${Date.now()}`;
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', clipPathId);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', imageX + imageSize / 2);
        circle.setAttribute('cy', imageY + imageSize / 2);
        circle.setAttribute('r', imageSize / 2);
        clipPath.appendChild(circle);
        defsElement.appendChild(clipPath);
        
        // 背景円を作成
        const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        backgroundCircle.setAttribute('cx', imageX + imageSize / 2);
        backgroundCircle.setAttribute('cy', imageY + imageSize / 2);
        backgroundCircle.setAttribute('r', imageSize / 2 + 2);
        backgroundCircle.setAttribute('fill', '#ffffff');
        backgroundCircle.setAttribute('stroke', '#e5e7eb');
        backgroundCircle.setAttribute('stroke-width', '2');
        backgroundCircle.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
        
        // 画像要素を作成
        const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imagePath);
        imageElement.setAttribute('x', imageX);
        imageElement.setAttribute('y', imageY);
        imageElement.setAttribute('width', imageSize);
        imageElement.setAttribute('height', imageSize);
        imageElement.setAttribute('clip-path', `url(#${clipPathId})`);
        imageElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        
        // フォールバック画像のエラーハンドリング
        imageElement.addEventListener('error', function() {
            console.warn(`⚠️ 画像読み込み失敗、フォールバック使用: ${fallbackPath}`);
            this.setAttributeNS('http://www.w3.org/1999/xlink', 'href', fallbackPath);
        });
        
        // 画像をSVGに追加（背景円→画像の順）
        svgElement.appendChild(backgroundCircle);
        svgElement.appendChild(imageElement);
          // キャラクター名ラベルを追加（フォントサイズ拡大）
        const labelElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelElement.setAttribute('x', imageX + imageSize / 2);
        labelElement.setAttribute('y', imageY + imageSize + 20);
        labelElement.setAttribute('text-anchor', 'middle');
        labelElement.setAttribute('font-family', 'M PLUS Rounded 1c, sans-serif');
        labelElement.setAttribute('font-size', '16');
        svgElement.appendChild(labelElement);
        
        console.log(`✅ ${characterName}@${expression} の画像を追加完了`);
    } catch (error) {
        console.error(`❌ ${characterName}の画像追加エラー:`, error);
    }
}

// ★★★ キャラクター名正規化関数 ★★★
function normalizeCharacterName(characterName) {
    // characters.jsのデータが利用可能な場合
    if (typeof characters !== 'undefined') {
        // 完全一致を探す
        let character = characters.find(c => c.name === characterName);
        if (character) return character;
        
        // エイリアス（別名）で探す
        character = characters.find(c => c.aliases && c.aliases.includes(characterName));
        if (character) return character;
        
        // 部分一致で探す
        character = characters.find(c => 
            c.name.includes(characterName) || characterName.includes(c.name)
        );        if (character) return character;
    }
    
    // フォールバック：基本的なマッピング（displayName追加）
    const characterMap = {
        'みかん': { baseName: 'mikan', displayName: 'みかん' },
        'ユズヒコ': { baseName: 'yuzuhiko', displayName: 'ユズヒコ' },
        'ユズ': { baseName: 'yuzuhiko', displayName: 'ユズヒコ' },
        '母': { baseName: 'haha', displayName: '母' },
        '父': { baseName: 'chichi', displayName: '父' },
        'しみちゃん': { baseName: 'shimi', displayName: 'しみちゃん' },
        '吉岡': { baseName: 'yoshioka', displayName: '吉岡' },
        '岩城': { baseName: 'iwaki', displayName: '岩城' },
        'ゆかりん': { baseName: 'yukarin', displayName: 'ゆかりん' },
        '藤野': { baseName: 'fujino', displayName: '藤野' },
        'ナスオ': { baseName: 'nasuo', displayName: 'ナスオ' },
        '川島': { baseName: 'kawashima', displayName: '川島' },
        '須藤': { baseName: 'sudo', displayName: '須藤' },
        '石田': { baseName: 'ishida', displayName: '石田' },
        '山下': { baseName: 'yamashita', displayName: '山下' },
        '息子': { baseName: 'yuzuhiko', displayName: '息子' },
        '娘': { baseName: 'mikan', displayName: '娘' },
        '田中': { baseName: 'mikan', displayName: '田中' },
        '佐藤': { baseName: 'yukarin', displayName: '佐藤' },
        '鈴木': { baseName: 'sudo', displayName: '鈴木' },
        '第三者': { baseName: 'nasuo', displayName: '第三者' }
    };
    
    return characterMap[characterName] || null;
}

// ★★★ 表情正規化関数 ★★★
function normalizeExpression(expression) {
    const validExpressions = [
        'normal', 'impressed', 'angry', 'surprised', 'happy', 'sad', 
        'thinking', 'laughing', 'desperate', 'smug', 'annoyed', 'blush', 
        'cool', 'serious', 'excited', 'passionate', 'drunk'
    ];
    
    // 有効な表情かチェック
    if (validExpressions.includes(expression)) {
        return expression;
    }
    
    // 表情のエイリアス（別名）マッピング
    const expressionAliases = {
        'normal': 'normal',
        'smile': 'happy',
        'laugh': 'laughing',
        'mad': 'angry',
        'shock': 'surprised',
        'think': 'thinking',
        'cry': 'sad',
        'confident': 'smug',
        'embarrassed': 'blush',
        'calm': 'cool'
    };
    
    return expressionAliases[expression] || 'normal';
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

// answerCorrectionView.jsは削除 - answerOverlay.jsを直接使用

// ★★★ Mermaid移動範囲テスト関数（デバッグ用） ★★★
function testMermaidMovableRange() {
    console.log('🧪 Mermaidの移動範囲テスト開始');
    
    const mermaidDivs = document.querySelectorAll('.mermaid-diagram');
    if (mermaidDivs.length === 0) {
        console.warn('⚠️ Mermaidダイアグラムが見つかりません');
        return;
    }
    
    mermaidDivs.forEach((mermaidDiv, index) => {
        console.log(`\n📊 Mermaidダイアグラム ${index + 1}:`);
        
        const data = mermaidDiv._interactiveData;
        if (!data) {
            console.warn(`⚠️ インタラクティブデータが見つかりません`);
            return;
        }
        
        const container = mermaidDiv.closest('.mermaid-container') || mermaidDiv;
        const containerRect = container.getBoundingClientRect();
        const svg = mermaidDiv.querySelector('svg');
        
        if (!svg) {
            console.warn(`⚠️ SVG要素が見つかりません`);
            return;
        }
        
        const svgRect = svg.getBoundingClientRect();
        const scaledWidth = svgRect.width * data.scale;
        const scaledHeight = svgRect.height * data.scale;
        
        // ★★★ 最小移動範囲を含む拡張移動範囲を計算 ★★★
        const minMovableRange = 400; // 最小400px分は動かせるようにする（拡大）
        const baseMaxTranslateX = Math.max(0, (scaledWidth - containerRect.width) / 2);
        const baseMaxTranslateY = Math.max(0, (scaledHeight - containerRect.height) / 2);
        
        // 基本範囲の2倍と最小範囲の大きい方を採用
        const maxTranslateX = Math.max(minMovableRange, baseMaxTranslateX * 2);
        const maxTranslateY = Math.max(minMovableRange, baseMaxTranslateY * 2);
        
        console.log(`📐 サイズ情報:`);
        console.log(`  - コンテナサイズ: ${containerRect.width}x${containerRect.height}`);
        console.log(`  - SVGサイズ: ${svgRect.width}x${svgRect.height}`);
        console.log(`  - スケール: ${data.scale}`);
        console.log(`  - スケール済みサイズ: ${scaledWidth}x${scaledHeight}`);
        
        console.log(`🎯 移動範囲:`);
        console.log(`  - 基本範囲X: ${baseMaxTranslateX} → 拡張範囲X: ${maxTranslateX}`);
        console.log(`  - 基本範囲Y: ${baseMaxTranslateY} → 拡張範囲Y: ${maxTranslateY}`);
        console.log(`  - X軸: -${maxTranslateX} ～ +${maxTranslateX} (幅: ${maxTranslateX * 2})`);
        console.log(`  - Y軸: -${maxTranslateY} ～ +${maxTranslateY} (高さ: ${maxTranslateY * 2})`);
        console.log(`  - 最小保証範囲: ${minMovableRange}px`);
        
        console.log(`📍 現在位置:`);
        console.log(`  - translateX: ${data.translateX}`);
        console.log(`  - translateY: ${data.translateY}`);
        
        // 移動範囲の比率を計算
        const originalMaxX = baseMaxTranslateX;
        const originalMaxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
        
        // 最小範囲が適用されているかチェック
        const isMinRangeActiveX = maxTranslateX === minMovableRange;
        const isMinRangeActiveY = maxTranslateY === minMovableRange;
        
        console.log(`🔍 移動範囲の詳細:`);
        console.log(`  - X軸最小範囲適用: ${isMinRangeActiveX ? 'はい' : 'いいえ'} (${isMinRangeActiveX ? '常に動かせます' : 'ズーム依存'})`);
        console.log(`  - Y軸最小範囲適用: ${isMinRangeActiveY ? 'はい' : 'いいえ'} (${isMinRangeActiveY ? '常に動かせます' : 'ズーム依存'})`);
        
        if (!isMinRangeActiveX && !isMinRangeActiveY) {
            const expansionRatio = originalMaxX > 0 ? maxTranslateX / originalMaxX : 2;
            console.log(`  - 拡張比率: ${expansionRatio.toFixed(1)}倍`);
        }
        
        console.log(`✅ 移動可能性: ${(isMinRangeActiveX || isMinRangeActiveY) ? '常に動かせます！' : '拡大後により動かしやすくなります'}`);
    });
    
    console.log('\n🧪 Mermaidの移動範囲テスト完了');
    console.log('💡 使用方法: マウスドラッグでMermaidを動かして範囲を確認してください');
    console.log('🎯 改善点: 最小400px分の移動範囲を保証し、ズーム前でも常に動かせるようになりました！');
}

// グローバル関数として登録
window.testMermaidMovableRange = testMermaidMovableRange;
