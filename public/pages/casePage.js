// pages/casePage.js - ケースページ専用モジュール（ランク付け表示対応）

import { caseLoaders } from '../cases/index.js';
import { characters } from '../data/characters.js';
import { processArticleReferences, processAllReferences, setupArticleRefButtons, processBoldText } from '../articleProcessor.js';
import { showArticlePanel } from '../articlePanel.js';
import { ApiService } from '../apiService.js';
import { startChatSession } from '../chatSystem.js';

// グローバル関数として showArticlePanel を利用可能にする
window.showArticlePanel = showArticlePanel;

// ★★★ ランク設定 ★★★
const RANK_CONFIG = {
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
    
    const loader = caseLoaders[caseId];
    if (!loader) {
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
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="quiz">✏️ ミニ論文</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="speed-quiz">⚡ スピード条文</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="essay">✍️ 論文トレーニング</button>
            </div>
            <div id="tab-content"></div>
        </div>    `;    renderTabContent('story');
      // ★★★ Mermaid初期化（複数回実行で確実にレンダリング） ★★★
    setTimeout(() => {
        console.log('🎨 第1回Mermaid初期化開始');
        initializeMermaidDiagrams();
    }, 300);
    
    setTimeout(() => {
        console.log('🎨 第2回Mermaid初期化開始');
        initializeMermaidDiagrams();
    }, 800);
    
    setTimeout(() => {
        console.log('🎨 第3回Mermaid初期化開始（最終確認）');
        initializeMermaidDiagrams();
    }, 1500);
    
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

// ★★★ Q&Aポップアップのグローバル状態管理 ★★★
window.qaPopupState = {
    openPopups: [],
    savePopup: function(popupId, qaIndex, qNumber, quizIndex, subIndex) {
        this.openPopups.push({ popupId, qaIndex, qNumber, quizIndex, subIndex });
    },
    removePopup: function(popupId) {
        this.openPopups = this.openPopups.filter(p => p.popupId !== popupId);
    },    clearAll: function() {
        console.log(`🧹 Q&Aポップアップ状態をクリア (${this.openPopups.length}個)`);
        this.openPopups = [];
        
        // DOM上の全てのQ&Aポップアップも削除
        const allQAPopups = document.querySelectorAll('.qa-ref-popup');
        allQAPopups.forEach(popup => {
            console.log(`🗑️ DOM上のポップアップも削除: ${popup.id}`);
            popup.remove();
        });
    },
    restorePopups: function() {
        // 現在開いているポップアップを復元
        this.openPopups.forEach(popup => {
            recreateQAPopup(popup);
        });
    }
};

function recreateQAPopup({ popupId, qaIndex, qNumber, quizIndex, subIndex }) {
    const qa = window.currentCaseData.questionsAndAnswers[qaIndex];
    if (!qa) return;

    // 既存のポップアップがあれば削除
    const existing = document.getElementById(popupId);
    if (existing) existing.remove();    // ポップアップHTML生成（条文参照ボタン化 + 空欄化処理）
    let qaQuestion = qa.question.replace(/(【[^】]+】)/g, match => {
        const lawText = match.replace(/[【】]/g, '');
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-text='${lawText}'>${lawText}</button>`;
    });
    
    // 先にanswerの{{}}の外の【】を条文参照ボタン化してから、空欄化処理を行う
    let qaAnswerWithArticleRefs = processArticleReferences(qa.answer);
    let qaAnswer = processBlankFillText(qaAnswerWithArticleRefs, `qa-recreate-${qaIndex}`);

    const popupHtml = `
        <div id="${popupId}" class="qa-ref-popup fixed z-40 bg-white border border-yellow-400 rounded-lg shadow-lg p-4 max-w-md" style="top: 50%; right: 2.5rem; transform: translateY(-50%);">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-yellow-900">Q${qNumber} 参照</span>
                <button type="button" class="qa-ref-close-btn text-gray-400 hover:text-gray-700 ml-2" style="font-size:1.2em;">×</button>
            </div>
            <div class="mb-2"><span class="font-bold">問題：</span>${qaQuestion}</div>
            <div class="mb-2">
                <button type="button" class="toggle-qa-answer-btn bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1 px-3 rounded border border-green-300 text-sm mb-2">💡 解答を隠す</button>
                <div class="qa-answer-content bg-green-50 p-3 rounded-lg border border-green-200">
                    <div class="flex gap-2 mb-2">
                        <button type="button" class="show-all-blanks-btn bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-2 rounded border border-blue-300 text-xs">🔍 全て表示</button>
                        <button type="button" class="hide-all-blanks-btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded border border-gray-300 text-xs">👁️ 全て隠す</button>
                    </div>
                    <div><span class="font-bold text-green-800">解答：</span>${qaAnswer}</div>
                </div>
            </div>
        </div>
    `;

    // グローバルポップアップコンテナに追加
    const globalContainer = document.getElementById('qa-ref-popup-global-container');
    if (globalContainer) {
        globalContainer.insertAdjacentHTML('beforeend', popupHtml);
    } else {
        document.body.insertAdjacentHTML('beforeend', popupHtml);
    }
    
    // ポップアップ内のイベントリスナーを設定
    const recreatedPopup = document.getElementById(popupId);
    if (recreatedPopup) {
        // 解答表示ボタンのイベントリスナーを設定
        const answerToggleBtn = recreatedPopup.querySelector('.toggle-qa-answer-btn');
        const answerContent = recreatedPopup.querySelector('.qa-answer-content');
        if (answerToggleBtn && answerContent) {
            // デフォルトで解答が表示されているので、条文参照ボタンを有効にする
            setupArticleRefButtons(answerContent);
            
            answerToggleBtn.addEventListener('click', function() {
                const isHidden = answerContent.classList.toggle('hidden');
                this.textContent = isHidden ? '💡 解答を表示' : '💡 解答を隠す';
                
                // 解答内の条文参照ボタンも有効にする
                if (!isHidden) {
                    setupArticleRefButtons(answerContent);
                }
            });
        }
        
        // 空欄一括操作ボタンのイベントリスナーを設定
        const showAllBlanksBtn = recreatedPopup.querySelector('.show-all-blanks-btn');
        const hideAllBlanksBtn = recreatedPopup.querySelector('.hide-all-blanks-btn');
        
        if (showAllBlanksBtn && answerContent) {
            showAllBlanksBtn.addEventListener('click', function() {
                toggleAllBlanks(answerContent, true);
            });
        }
        
        if (hideAllBlanksBtn && answerContent) {
            hideAllBlanksBtn.addEventListener('click', function() {
                toggleAllBlanks(answerContent, false);
            });
        }
    }
}

export function renderTabContent(tabName) {
    console.log(`🔄 タブ表示: ${tabName}`);
    
    const contentDiv = document.getElementById('tab-content');
    
    // 既存のタブコンテンツがあるかチェック
    let storyTab = document.getElementById('tab-story-content');
    
    // 初回の場合、全てのタブコンテンツを作成
    if (!storyTab) {
        console.log('📝 タブコンテンツ初期作成');
        
        // グローバルQ&Aポップアップコンテナを作成（初回のみ）
        if (!document.getElementById('qa-ref-popup-global-container')) {
            const globalContainer = document.createElement('div');
            globalContainer.id = 'qa-ref-popup-global-container';
            globalContainer.className = 'qa-ref-popup-global-container';
            document.body.appendChild(globalContainer);
        }
        
        const storyHtml = buildStoryHtml(window.currentCaseData.story);
        const processedStoryHtml = processAllReferences(storyHtml, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
        
        const processedExplanationHtml = processAllReferences(window.currentCaseData.explanation, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);

        // ★★★ 論文トレーニングが無い場合はタブ自体を省略 ★★★
        const hasEssay = window.currentCaseData.essay && window.currentCaseData.essay.question;
        let essayTabButton = hasEssay ? `<button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="essay">✍️ 論文トレーニング</button>` : '';
        let essayTabContent = hasEssay ? `<div id="tab-essay-content" class="tab-content-panel hidden"></div>` : '';
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
                <div class="p-4">
                    <div class="mb-4 text-right">
                        <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文表示</button>
                    </div>
                    ${processedExplanationHtml}
                    
                    <!-- 解説Q&A対話セクション -->
                    <div class="mt-8 border-t pt-6">
                        <h4 class="text-lg font-bold mb-4 text-center text-green-700">🤔 解説について詳しく聞いてみよう</h4>
                        <div class="mb-4 bg-green-50 p-4 rounded-lg">
                            <p class="text-sm text-green-800 mb-2">📝 <strong>質問例：</strong></p>
                            <ul class="text-sm text-green-700 list-disc list-inside space-y-1">
                                <li>この論点について、判例の立場をもう少し詳しく教えてください。</li>
                                <li>学説の対立がある場合、どちらが有力ですか？</li>
                                <li>司法試験でこの論点はどのように出題されますか？</li>
                                <li>理解が曖昧な部分について具体例で説明してください。</li>
                            </ul>
                        </div>
                        <div class="input-form">
                            <textarea id="explanation-question-input" class="w-full h-32 p-4 border rounded-lg focus-ring" placeholder="解説について質問してください...（例：判例の理由付けがよく分からないので詳しく教えてください）"></textarea>
                            <div class="text-right mt-4">
                                <button class="start-chat-btn bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-type="explanation">質問して対話を始める</button>
                            </div>
                        </div>
                        <div class="chat-area" id="chat-area-explanation"></div>
                    </div>
                </div>
            </div>            <div id="tab-quiz-content" class="tab-content-panel hidden">
                <!-- ミニ論文コンテンツはここに動的に追加 -->
            </div>
            <div id="tab-speed-quiz-content" class="tab-content-panel hidden">
                <!-- スピード条文ゲームコンテンツはここに動的に追加 -->
            </div>
            ${essayTabContent}
        `;        // タブボタンも論文トレーニングが無い場合は省略
        const tabButtons = `
            <button class="tab-button p-4 flex-grow text-center text-gray-600 active" data-tab="story">📖 ストーリー</button>
            <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="explanation">🤔 解説</button>
            <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="quiz">✏️ ミニ論文</button>
            <button class="tab-button p-4 flex-grow text-center text-gray-600" data-tab="speed-quiz">⚡ スピード条文</button>
            ${essayTabButton}
        `;
        // タブボタン部分を書き換え
        const parent = contentDiv.parentElement;
        if (parent) {
            const tabBar = parent.querySelector('.flex.flex-wrap.border-b');
            if (tabBar) tabBar.innerHTML = tabButtons;
        }
          // 条文参照ボタンのイベントリスナーを設定
        setupArticleRefButtons(contentDiv);
        
        // 非同期でクイズとエッセイのコンテンツを初期化
        initializeQuizContent();
        initializeSpeedQuizContent();
        if (hasEssay) initializeEssayContent();
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
        console.log(`✅ タブ表示完了: ${tabName}`);        // ★★★ 条文・Q&Aボタンのイベントリスナーを再設定 ★★★
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
        
        // ★★★ Mermaid図表のレンダリング ★★★
        setTimeout(() => {
            initializeMermaidDiagrams();
        }, 100);
        
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
            <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文表示</button>
        </div>
    `;
    
    if (window.currentCaseData.quiz && window.currentCaseData.quiz.length > 0) {
        for (let quizIndex = 0; quizIndex < window.currentCaseData.quiz.length; quizIndex++) {
            const quizGroup = window.currentCaseData.quiz[quizIndex];
            
            // ★★★ 大問のランク表示 ★★★
            const groupRank = quizGroup.rank || 'C';
            const rankConfig = RANK_CONFIG[groupRank] || RANK_CONFIG['C'];
            
            html += `
                <div class="bg-white border-2 ${rankConfig.borderColor} rounded-xl shadow-lg p-6" id="quiz-group-${quizIndex}">
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
                processAllReferences(point, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
            );
            
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
                    <textarea id="initial-input-${quizIndex}-0" class="w-full h-48 p-4 border rounded-lg focus-ring" placeholder="ここに論述してみよう…"></textarea>
                    <div class="text-right mt-4">
                        <button class="start-chat-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-quiz-index="${quizIndex}" data-sub-index="0" data-type="quiz">対話型添削を始める</button>
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
                processAllReferences(point, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
            );
            
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
                ${qaButtonsHtml ? `<div class="mb-4 flex items-center gap-1"><span class="text-xs text-gray-600 font-medium">関連Q&A:</span> ${qaButtonsHtml}</div>` : ''}
                <div class="mb-4 bg-gray-100 p-4 rounded-lg problem-text">${processAllReferences(subProblem.problem, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
                ${hintHtml}
                ${pointsHtml}
                <!-- 過去の回答表示エリア -->
                <div id="past-answers-area-${quizIndex}-${subIndex}" class="mb-4 hidden"></div>
                <div class="input-form">
                    <textarea id="initial-input-${quizIndex}-${subIndex}" class="w-full h-48 p-4 border rounded-lg focus-ring" placeholder="ここに論述してみよう…"></textarea>
                    <div class="text-right mt-4">
                        <button class="start-chat-btn bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-quiz-index="${quizIndex}" data-sub-index="${subIndex}" data-type="quiz">対話型添削を始める</button>
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
            processAllReferences(point, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
        );
        
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
                    ${pastLogs.length > 0 ? `<button class="view-history-btn bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-1 px-3 rounded" data-problem-type="essay" data-problem-index="">📚 学習記録 (${pastLogs.length}件)</button>` : ''}
                </div>
            </div>
            <div class="mb-4 bg-gray-100 p-4 rounded-lg">${processAllReferences(window.currentCaseData.essay.question, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])}</div>
            ${hintHtml}
            ${pointsHtml}
            <!-- 過去回答表示エリア -->
            <div id="past-answers-area-" class="mb-4 hidden"></div>
            <textarea id="initial-input-essay" class="w-full h-96 p-4 border rounded-lg" placeholder="ここに答案を記述…"></textarea>
            <button class="start-chat-btn mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg" data-type="essay">対話型論文添削を始める</button>
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
    if (!speedQuizContainer || speedQuizContainer.hasAttribute('data-initialized')) return;

    try {
        // speedQuiz.jsモジュールを動的インポート
        const { initializeSpeedQuizGame } = await import('../speedQuiz.js');
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
        
        // ゲームを初期化（現在のケースデータを渡す）
        const gameContainer = document.getElementById(gameContainerId);
        if (gameContainer) {
            // 条文を抽出（非同期）
            const { extractAllArticles } = await import('../speedQuiz.js');
            window.speedQuizArticles = await extractAllArticles(window.currentCaseData);
            console.log('📚 抽出された条文数:', window.speedQuizArticles.length);
            
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

// ★★★ Mermaid図表初期化関数 ★★★
function initializeMermaidDiagrams() {
    console.log('🎨 Mermaid初期化開始');
    
    if (typeof mermaid === 'undefined') {
        console.warn('⚠️ Mermaid.jsが読み込まれていません');
        return;
    }
      try {
        // 最も基本的なMermaid設定
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'M PLUS Rounded 1c, sans-serif',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'linear'
            },
            themeVariables: {
                primaryColor: '#f0f9ff',
                primaryTextColor: '#1e293b',
                primaryBorderColor: '#0284c7',
                lineColor: '#475569',
                fontSize: '14px'
            }
        });
        
        // 現在表示されているMermaid要素をレンダリング
        const mermaidElements = document.querySelectorAll('.mermaid');
        console.log(`🔍 Mermaid要素を${mermaidElements.length}個発見`);
        
        mermaidElements.forEach(async (element, index) => {
            if (element.getAttribute('data-processed') !== 'true') {
                const graphDefinition = element.textContent || element.innerText;
                console.log(`📝 図表定義 #${index}:`, graphDefinition);
                
                // 新しいAPIでレンダリング
                try {
                    const graphId = `graph-${Date.now()}-${index}`;
                    const { svg } = await mermaid.render(graphId, graphDefinition);
                    element.innerHTML = svg;
                    element.setAttribute('data-processed', 'true');
                    console.log(`✅ Mermaid図表 #${index} レンダリング完了`);
                } catch (renderError) {
                    console.error(`❌ Mermaid レンダリングエラー #${index}:`, renderError);
                    element.innerHTML = `
                        <div style="color: red; padding: 20px; border: 2px solid red; border-radius: 8px;">
                            <h3>図表レンダリングエラー</h3>
                            <p>${renderError.message}</p>
                            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap;">${graphDefinition}</pre>
                        </div>
                    `;
                }
            }
        });
          console.log('🎨 Mermaid初期化完了');
        
        // ズーム機能を初期化
        initializeMermaidZoom();
    } catch (error) {
        console.error('❌ Mermaid初期化エラー:', error);
    }
}

// ★★★ Mermaidズーム機能初期化関数 ★★★
function initializeMermaidZoom() {
    console.log('🔍 Mermaidズーム機能を初期化開始');
    
    const mermaidContainers = document.querySelectorAll('.mermaid-container');
    console.log(`🎯 ${mermaidContainers.length}個のMermaidコンテナを発見`);
    
    mermaidContainers.forEach((container, index) => {
        // 既にズーム機能が初期化されている場合はスキップ
        if (container.hasAttribute('data-zoom-initialized')) {
            return;
        }
        
        const mermaidElement = container.querySelector('.mermaid');
        if (!mermaidElement) {
            console.warn(`⚠️ コンテナ #${index} にMermaid要素が見つかりません`);
            return;
        }
        
        // ズーム状態を初期化
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        
        // ズームコントロールボタンのイベント設定
        const zoomControls = container.querySelector('.zoom-controls');
        const zoomInBtn = container.querySelector('.zoom-in');
        const zoomOutBtn = container.querySelector('.zoom-out');
        const zoomResetBtn = container.querySelector('.zoom-reset');
        
        // ズームコントロール自体のクリックを防ぐ
        if (zoomControls) {
            zoomControls.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
            zoomControls.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                scale = Math.min(scale * 1.3, 4);
                updateTransform();
                console.log(`📈 ズームイン: ${scale.toFixed(2)}`);
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                scale = Math.max(scale / 1.3, 0.2);
                updateTransform();
                console.log(`📉 ズームアウト: ${scale.toFixed(2)}`);
            });
        }
        
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                scale = 1;
                translateX = 0;
                translateY = 0;
                updateTransform();
                console.log(`🔄 ズームリセット`);
            });
        }
        
        // マウスホイールでズーム（ズームコントロール以外）
        container.addEventListener('wheel', (e) => {
            // ズームコントロール上でのホイールイベントは無視
            if (e.target.closest('.zoom-controls')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const rect = container.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            const newScale = Math.max(0.2, Math.min(4, scale * zoomFactor));
            
            // ズーム中心を調整
            const scaleChange = newScale / scale;
            translateX = centerX + (translateX - centerX) * scaleChange;
            translateY = centerY + (translateY - centerY) * scaleChange;
            
            scale = newScale;
            updateTransform();
        });
        
        // ドラッグでパン（ズームコントロール以外の領域のみ）
        container.addEventListener('mousedown', (e) => {
            // ズームコントロールエリアのクリックは無視
            if (e.target.closest('.zoom-controls')) {
                return;
            }
            
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            
            // ドラッグ開始時のスタイル
            container.style.cursor = 'grabbing !important';
            mermaidElement.style.transition = 'none';
            
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ ドラッグ開始');
        });
        
        // グローバルマウス移動イベント
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            translateX += deltaX;
            translateY += deltaY;
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            
            updateTransform();
        });
        
        // グローバルマウスアップイベント
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                container.style.cursor = 'grab';
                mermaidElement.style.transition = 'transform 0.2s ease';
                console.log('🖱️ ドラッグ終了');
            }
        });
        
        // トランスフォーム更新関数
        function updateTransform() {
            if (mermaidElement) {
                mermaidElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                mermaidElement.style.transformOrigin = 'center center';
            }
        }
        
        // 初期化完了をマーク
        container.setAttribute('data-zoom-initialized', 'true');
        console.log(`✅ コンテナ #${index} のズーム機能初期化完了`);
    });
    
    console.log('🔍 Mermaidズーム機能初期化完了');
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

/**
 * {{}}で囲まれた重要語句を空欄化し、クリックで開示できるHTMLに変換する
 * @param {string} text - 処理対象のテキスト
 * @param {string} uniqueId - 一意のID（複数のQ&Aで重複しないように）
 * @returns {string} - 空欄化されたHTML
 */
function processBlankFillText(text, uniqueId = '') {
    if (!text) return text;
    
    // {{}}で囲まれた部分を検出する正規表現
    const blankPattern = /\{\{([^}]+)\}\}/g;
    let blankCounter = 0;
    let processedText = text;
    
    // まず、{{}}の外側にある【】を条文参照ボタン化
    let outsideBlankText = text;
    let blankMatches = [];
    let match;
    
    // {{}}の内容を一時的にプレースホルダーに置換
    while ((match = blankPattern.exec(text)) !== null) {
        blankMatches.push(match[1]);
        const placeholder = `__BLANK_${blankMatches.length - 1}__`;
        outsideBlankText = outsideBlankText.replace(match[0], placeholder);
    }
    
    // {{}}の外側の【】を条文参照ボタン化
    outsideBlankText = outsideBlankText.replace(/【([^】]+)】/g, (match, lawText) => {
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-text='${lawText}' onclick='event.stopPropagation(); showArticlePanel("${lawText}")'>${lawText}</button>`;
    });
    
    // プレースホルダーを空欄に戻す
    for (let i = 0; i < blankMatches.length; i++) {
        blankCounter++;
        const content = blankMatches[i];
        const blankId = `blank-${uniqueId}-${blankCounter}`;
        
        // {{}}内に【】が含まれているかチェック
        const hasArticleRef = /【([^】]+)】/.test(content);
        let displayContent, dataAnswer;
        
        if (hasArticleRef) {
            // 条文参照がある場合：ボタン化して色を変える
            displayContent = content.replace(/【([^】]+)】/g, (match, lawText) => {
                return `<button type='button' class='article-ref-btn bg-blue-200 hover:bg-blue-300 text-blue-900 px-2 py-1 rounded border border-blue-400 text-xs font-bold' data-law-text='${lawText}' onclick='event.stopPropagation(); showArticlePanel("${lawText}")'>${lawText}</button>`;
            });
            dataAnswer = content.replace(/【([^】]+)】/g, '$1'); // data-answerはプレーンテキスト
        } else {
            // 通常の空欄
            displayContent = content;
            dataAnswer = content;
        }
        
        const blankLength = Math.max(4, Math.floor(dataAnswer.length * 0.9));
        const underscores = '＿'.repeat(blankLength);
        
        // 条文参照がある場合は背景色を変える
        const bgClass = hasArticleRef ? 'bg-blue-100 hover:bg-blue-200 border-blue-400 text-blue-800' : 'bg-yellow-100 hover:bg-yellow-200 border-yellow-400 text-yellow-800';
        
        const blankHtml = `<span class="blank-container inline-block">
            <span id="${blankId}" class="blank-text cursor-pointer ${bgClass} px-2 py-1 rounded border-b-2 font-bold transition-all duration-200" 
                  data-answer="${dataAnswer.replace(/"/g, '&quot;')}" data-display-content="${displayContent.replace(/"/g, '&quot;')}" data-blank-id="${blankId}" onclick="toggleBlankReveal(this)" title="クリックして答えを表示">
                ${underscores}
            </span>
        </span>`;
        
        outsideBlankText = outsideBlankText.replace(`__BLANK_${i}__`, blankHtml);
    }
    
    return outsideBlankText;
}

/**
 * 空欄の表示/非表示を切り替える（グローバル関数）
 * @param {HTMLElement} element - クリックされた空欄要素
 */
window.toggleBlankReveal = function(element) {
    const answer = element.dataset.answer;
    const displayContent = element.dataset.displayContent;
    const blankId = element.dataset.blankId;
    const isRevealed = element.dataset.revealed === 'true';
    
    if (isRevealed) {
        // 答えを隠す
        const blankLength = Math.max(4, Math.floor(answer.length * 0.9));
        const underscores = '＿'.repeat(blankLength);
        element.innerHTML = underscores;
        element.dataset.revealed = 'false';
        element.title = 'クリックして答えを表示';
        
        // 色をリセット（条文参照があるかどうかで分岐）
        const hasArticleRef = displayContent && displayContent.includes('article-ref-btn');
        if (hasArticleRef) {
            element.className = element.className.replace(/bg-\w+-\d+|border-\w+-\d+|text-\w+-\d+/g, '');
            element.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-800');
        } else {
            element.className = element.className.replace(/bg-\w+-\d+|border-\w+-\d+|text-\w+-\d+/g, '');
            element.classList.add('bg-yellow-100', 'border-yellow-400', 'text-yellow-800');
        }
    } else {
        // 答えを表示（HTMLコンテンツがあればそれを使用、なければプレーンテキスト）
        if (displayContent && displayContent !== answer) {
            // HTMLエスケープを戻す
            const unescapedContent = displayContent.replace(/&quot;/g, '"');
            element.innerHTML = unescapedContent;
        } else {
            element.textContent = answer;
        }
        element.dataset.revealed = 'true';
        element.title = 'クリックして隠す';
        
        // 表示時の色
        element.className = element.className.replace(/bg-\w+-\d+|border-\w+-\d+|text-\w+-\d+/g, '');
        element.classList.add('bg-green-100', 'border-green-400', 'text-green-800');
        
        // 条文参照ボタンがある場合は、そのイベントリスナーを有効化
        const articleButtons = element.querySelectorAll('.article-ref-btn');
        articleButtons.forEach(btn => {
            if (btn.dataset.lawText) {
                // 既存のクリックイベントを上書き
                btn.onclick = function(event) {
                    event.stopPropagation();
                    if (window.showArticlePanel) {
                        window.showArticlePanel(btn.dataset.lawText);
                    }
                };
            }
        });
    }
};

/**
 * Q&A内のすべての空欄を一括で表示/非表示を切り替える
 * @param {HTMLElement} container - Q&Aコンテナ
 * @param {boolean} reveal - true: すべて表示, false: すべて隠す
 */
function toggleAllBlanks(container, reveal) {
    const blanks = container.querySelectorAll('.blank-text');
    blanks.forEach(blank => {
        const currentRevealed = blank.dataset.revealed === 'true';
        if (reveal && !currentRevealed) {
            window.toggleBlankReveal(blank);
        } else if (!reveal && currentRevealed) {
            window.toggleBlankReveal(blank);
        }
    });
}


function buildStoryHtml(storyData) {
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
                                <div class="zoom-controls">
                                    <button class="zoom-btn zoom-in">拡大</button>
                                    <button class="zoom-btn zoom-out">縮小</button>
                                    <button class="zoom-btn zoom-reset">リセット</button>
                                </div>
                                <div id="${mermaidId}" class="mermaid">${item.content}</div>
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
        
        const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";
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
            console.warn('⚠️ SVG要素が見つかりません');
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
                    console.log(`  ${i}: "${el.textContent}"`);                });
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
        labelElement.setAttribute('font-weight', 'bold');
        labelElement.setAttribute('fill', '#374151');
        labelElement.textContent = normalizedCharacter.displayName || characterName;
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
