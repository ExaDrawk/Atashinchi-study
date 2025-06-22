// pages/casePage.js - ケースページ専用モジュール（ランク付け表示対応）

import { caseLoaders } from '../cases/index.js';
import { characters } from '../data/characters.js';
import { processArticleReferences, processAllReferences, setupArticleRefButtons, processBoldText } from '../articleProcessor.js';
import { showArticlePanel } from '../articlePanel.js';
import { ApiService } from '../apiService.js';
import { startChatSession } from '../chatSystem.js';

// グローバル関数として showArticlePanel を利用可能にする
window.showArticlePanel = showArticlePanel;

/**
 * 法令参照文字列をパースして法令名と条文番号に分離
 * @param {string} lawText - 法令参照文字列（例: "民事訴訟法228条4項"）
 * @returns {{lawName: string, articleRef: string}} 分離された法令名と条文番号
 */
function parseLawReference(lawText) {
    // 正規表現で法令名と条文番号を分離
    const match = lawText.match(/^(.+?)(\d+条.*)$/);
    if (match) {
        return {
            lawName: match[1],
            articleRef: match[2]
        };
    }
    // パースできない場合は全体を法令名として扱う
    return {
        lawName: lawText,
        articleRef: ''
    };
}

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
        </div>    `;
    renderTabContent('story');
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
    },
    clearAll: function() {
        this.openPopups = [];
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
        // 法令名と条文番号を分離
        const lawRef = parseLawReference(lawText);
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-name='${lawRef.lawName}' data-article-ref='${lawRef.articleRef}'>${lawText}</button>`;
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
    }    // ポップアップ内のイベントリスナーを設定
    const recreatedPopup = document.getElementById(popupId);
    if (recreatedPopup) {
        // 問題文内の条文参照ボタンのイベントリスナーを設定
        if (recreatedPopup.querySelectorAll('.article-ref-btn').length > 0) {
            setupArticleRefButtons(recreatedPopup);
        }
          // 解答表示ボタンのイベントリスナーを設定
        const answerToggleBtn = recreatedPopup.querySelector('.toggle-qa-answer-btn');
        const answerContent = recreatedPopup.querySelector('.qa-answer-content');
        if (answerToggleBtn && answerContent) {
            // 解答内に条文参照ボタンがある場合のみセットアップ
            if (answerContent.querySelectorAll('.article-ref-btn').length > 0) {
                setupArticleRefButtons(answerContent);
            }
            
            answerToggleBtn.addEventListener('click', function() {
                const isHidden = answerContent.classList.toggle('hidden');
                this.textContent = isHidden ? '💡 解答を表示' : '💡 解答を隠す';
                
                // 解答内の条文参照ボタンも有効にする
                if (!isHidden && answerContent.querySelectorAll('.article-ref-btn').length > 0) {
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
        
        // 閉じるボタンのイベントリスナーを設定
        const closeBtn = recreatedPopup.querySelector('.qa-ref-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                recreatedPopup.remove();
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
      // 指定されたタブのみを表示
    const targetTab = document.getElementById(`tab-${tabName}-content`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        console.log(`✅ タブ表示完了: ${tabName}`);
        
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
        // 法令名と条文番号を分離
        const lawRef = parseLawReference(lawText);
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-name='${lawRef.lawName}' data-article-ref='${lawRef.articleRef}'>${lawText}</button>`;
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
                // 法令名と条文番号を分離
                const lawRef = parseLawReference(lawText);
                return `<button type='button' class='article-ref-btn bg-blue-200 hover:bg-blue-300 text-blue-900 px-2 py-1 rounded border border-blue-400 text-xs font-bold' data-law-name='${lawRef.lawName}' data-article-ref='${lawRef.articleRef}'>${lawText}</button>`;
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
        
        const character = characters.find(c => c.name === item.speaker);
        if (!character) return '';

        const requestedExpression = item.expression ?? 'normal';
        const finalExpression = character.availableExpressions.includes(requestedExpression) ? requestedExpression : 'normal';
        const iconSrc = `/images/${character.baseName}_${finalExpression}.png`;
        const fallbackSrc = `/images/${character.baseName}_normal.png`;
        const onErrorAttribute = `this.src='${fallbackSrc}'; this.onerror=null;`;
        
        const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";
        // ↓ここを修正
        const isRightSide = rightSideCharacters.includes(item.speaker);
        const iconTransform = isRightSide ? 'transform: scaleX(-1);' : '';
        const iconHtml = `<img src="${iconSrc}" alt="${character.name}" style="${imageStyle} ${iconTransform}" onerror="${onErrorAttribute}">`;
        const bubbleHtml = `<div class="chat-bubble ${isRightSide ? 'chat-bubble-right' : 'chat-bubble-left'} p-3 rounded-lg shadow"><p class="font-bold">${character.name}</p><p>${item.dialogue}</p></div>`;
        
        return `<div class="flex items-start gap-3 my-4 ${isRightSide ? 'justify-end' : ''}">${isRightSide ? bubbleHtml + iconHtml : iconHtml + bubbleHtml}</div>`;    
    }).join('');
}

function displayPastAnswers(caseId, problemType, problemIndex) {
    const storageKey = `answers_${caseId}_${problemType}_${problemIndex}`;
    console.log('🔍 =========================');
    console.log('🔍 過去回答読み込み開始:', { 
        caseId, 
        problemType, 
        problemIndex, 
        storageKey,
        timestamp: new Date().toLocaleString()
    });
    
    // localStorageの状況をチェック
    try {
        const testKey = '__display_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('✅ localStorage は利用可能');
    } catch (error) {
        console.error('❌ localStorage が利用できません:', error);
    }
    
    // 実際のデータ取得
    let pastAnswers;
    try {
        const rawData = localStorage.getItem(storageKey);
        console.log('📥 localStorage.getItem結果:', { 
            key: storageKey, 
            hasData: !!rawData, 
            dataLength: rawData?.length 
        });
        
        if (rawData) {
            pastAnswers = JSON.parse(rawData);
            console.log('✅ JSON.parse成功:', pastAnswers.length, '件');
            
            // 各回答の詳細を確認
            pastAnswers.forEach((answer, index) => {
                console.log(`📝 回答${index + 1}:`, {
                    score: answer.score,
                    timestamp: answer.timestamp,
                    answerLength: answer.userAnswer?.length,
                    hasProblemlText: !!answer.problemText
                });
            });
        } else {
            pastAnswers = [];
            console.log('ℹ️ rawDataが空/null - 新規配列で初期化');
        }
    } catch (parseError) {
        console.error('❌ JSON.parseエラー:', parseError);
        pastAnswers = [];
    }

    console.log('� 最終結果:', pastAnswers.length, '件の過去回答');
    console.log('🔍 =========================');

    if (pastAnswers.length === 0) {
        console.log('ℹ️ 過去回答なし - 空表示を返します');
        return `
            <div class="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p class="text-gray-500 text-sm mb-2">まだ保存された回答はありません</p>
                <p class="text-xs text-gray-400">10点以上の回答が自動的に保存されます</p>
                <p class="text-xs text-gray-500 mt-1">保存キー: ${storageKey}</p>
                <p class="text-xs text-gray-400 mt-1">最終確認: ${new Date().toLocaleString()}</p>
            </div>
        `;
    }

    console.log('✅ 過去回答表示HTML生成開始');
    let html = `<div class="space-y-4">
        <div class="text-xs text-green-600 bg-green-50 p-2 rounded border">
            📊 ${pastAnswers.length}件の保存済み回答 (キー: ${storageKey})
        </div>`;
    
    [...pastAnswers].reverse().forEach((answer, index) => {
        const date = new Date(answer.timestamp).toLocaleString();
        const scoreColor = answer.score >= 70 ? 'text-green-600' : 
                          answer.score >= 50 ? 'text-yellow-600' : 'text-red-600';
        
        html += `
            <div class="bg-white p-4 rounded-lg border shadow-sm">
                <div class="flex justify-between items-center mb-2">
                    <h6 class="font-bold text-gray-800">過去の回答 ${pastAnswers.length - index}</h6>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">${date}</span>
                        <span class="font-bold ${scoreColor}">${answer.score}点</span>
                    </div>
                </div>
                <div class="text-sm text-gray-700 bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto custom-scrollbar">
                    ${answer.userAnswer.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    console.log('✅ 過去回答表示HTML生成完了');
    return html;
}

// ★★★ Q&A参照ボタンのポップアップ表示ロジックを追加 ★★★
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('qa-ref-btn')) {
        // ポップアップ保護フラグを設定
        window.__preventPopupClose = true;
        
        const qaIndex = parseInt(e.target.dataset.qaIndex, 10);
        const quizIndex = e.target.dataset.quizIndex;
        const subIndex = e.target.dataset.subIndex;
        const qNumber = e.target.dataset.qNumber || (qaIndex + 1); // data-q-numberを優先、なければqaIndex+1
        
        console.log('QAボタンクリック:', { qaIndex, qNumber, dataset: e.target.dataset });
        
        const qa = window.currentCaseData.questionsAndAnswers[qaIndex];
        if (!qa) {
            console.error('Q&Aが見つかりません:', qaIndex, window.currentCaseData.questionsAndAnswers);
            window.__preventPopupClose = false;
            return;
        }
        
        const popupId = `qa-ref-popup-${quizIndex}-${subIndex}-${qaIndex}`;
        let popup = document.getElementById(popupId);
        
        // 既に開いていれば閉じる
        if (popup) {
            popup.remove();
            if (window.qaPopupState) {
                window.qaPopupState.removePopup(popupId);
            }
            window.__preventPopupClose = false;
            return;
        }
        
        // 他のポップアップを閉じる
        document.querySelectorAll('.qa-ref-popup').forEach(el => el.remove());
        if (window.qaPopupState) {
            window.qaPopupState.clearAll();
        }          // ポップアップHTML生成（条文参照ボタン化 + 空欄化処理）
        let qaQuestion = processArticleReferences(qa.question, window.currentCaseData.supportedLaws || []);
        // 先にanswerの{{}}の外の【】を条文参照ボタン化してから、空欄化処理を行う
        let qaAnswerWithArticleRefs = processArticleReferences(qa.answer, window.currentCaseData.supportedLaws || []);
        let qaAnswer = processBlankFillText(qaAnswerWithArticleRefs, `qa-${qaIndex}`);
        
        console.log('ポップアップ表示:', `Q${qNumber}`, qa.question);
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
            console.log('ポップアップをグローバルコンテナに追加:', popupId);
        } else {
            // フォールバック：body に直接追加
            document.body.insertAdjacentHTML('beforeend', popupHtml);
            console.log('ポップアップをbodyに追加:', popupId);
        }        // ポップアップ内の条文参照ボタンのイベントリスナーを設定
        const createdPopup = document.getElementById(popupId);
        if (createdPopup) {
            // ポップアップ全体に条文参照ボタンがある場合のみセットアップ
            if (createdPopup.querySelectorAll('.article-ref-btn').length > 0) {
                setupArticleRefButtons(createdPopup);
                console.log('ポップアップ内の条文ボタンのイベントリスナー設定完了:', popupId);
            }
            
            // 解答表示ボタンのイベントリスナーを設定
            const answerToggleBtn = createdPopup.querySelector('.toggle-qa-answer-btn');
            const answerContent = createdPopup.querySelector('.qa-answer-content');
            if (answerToggleBtn && answerContent) {
                // 解答内に条文参照ボタンがある場合のみセットアップ
                if (answerContent.querySelectorAll('.article-ref-btn').length > 0) {
                    setupArticleRefButtons(answerContent);
                }
                  answerToggleBtn.addEventListener('click', function() {
                    const isHidden = answerContent.classList.toggle('hidden');
                    this.textContent = isHidden ? '💡 解答を表示' : '💡 解答を隠す';
                    
                    // 解答内の条文参照ボタンも有効にする
                    if (!isHidden && answerContent.querySelectorAll('.article-ref-btn').length > 0) {
                        setupArticleRefButtons(answerContent);
                    }
                });
            }
            
            // 空欄一括操作ボタンのイベントリスナーを設定
            const showAllBlanksBtn = createdPopup.querySelector('.show-all-blanks-btn');
            const hideAllBlanksBtn = createdPopup.querySelector('.hide-all-blanks-btn');
            
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
            
            console.log('ポップアップ内の条文ボタンのイベントリスナー設定完了:', popupId);
        }
        
        // ポップアップ状態を保存
        if (window.qaPopupState) {
            window.qaPopupState.savePopup(popupId, qaIndex, qNumber, quizIndex, subIndex);
        }
        
        // フラグをリセット（少し遅せて）
        setTimeout(() => {
            window.__preventPopupClose = false;
        }, 500);
    }
    // ポップアップの閉じるボタン
    if (e.target.classList.contains('qa-ref-close-btn')) {
        const popup = e.target.closest('.qa-ref-popup');
        if (popup) {
            const popupId = popup.id;
            popup.remove();
            if (window.qaPopupState) {
                window.qaPopupState.removePopup(popupId);
            }
        }    }
      // ポップアップ外クリックで閉じる（条文参照ボタンと条文パネル関連を除外）
    if (document.querySelector('.qa-ref-popup') &&
        !e.target.closest('.qa-ref-popup') && 
        !e.target.classList.contains('qa-ref-btn') && 
        !e.target.classList.contains('article-ref-btn') &&
        !e.target.classList.contains('show-article-btn') &&
        !e.target.closest('[id*="article-panel"]') &&
        !e.target.closest('.article-panel') &&
        !e.target.closest('[class*="panel"]') &&
        !e.target.closest('form') &&
        !(e.target.tagName === 'BUTTON' && e.target.textContent.includes('取得'))) {
        
        // 条文参照ボタンのクリック処理中の場合は閉じない
        // また、条文パネルが表示されている場合も閉じない
        const articlePanelVisible = document.getElementById('article-panel') && 
                                   !document.getElementById('article-panel').classList.contains('hidden');
        
        if (!window.__preventPopupClose && !articlePanelVisible) {
            document.querySelectorAll('.qa-ref-popup').forEach(el => el.remove());
        }
    }
      // 条文参照ボタン押下時の処理
    if (e.target.classList.contains('article-ref-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        // ポップアップを閉じないようにフラグを設定
        window.__preventPopupClose = true;
        
        const lawName = e.target.dataset.lawName;
        const articleRef = e.target.dataset.articleRef;
        
        console.log(`🖱️ QAポップアップ内条文ボタンクリック: ${lawName}${articleRef}`);
        
        if (lawName && articleRef) {
            // showArticlePanelWithPreset関数を呼び出し
            if (window.showArticlePanelWithPreset) {
                window.showArticlePanelWithPreset(lawName, articleRef);
            } else {
                console.error('❌ showArticlePanelWithPreset関数が見つかりません');
            }
        } else {
            console.error('❌ 条文ボタンのデータ属性が不完全です', {
                lawName,
                articleRef,
                allData: e.target.dataset
            });
        }
        
        // フラグをリセット（少し遅延させる）
        setTimeout(() => {
            window.__preventPopupClose = false;        }, 100);        
        return;
    }
});

// ★★★ 条文パネル初期キーワード対応（show-article-btnクリック時） ★★★
document.addEventListener('click', function(e) {
    if (!e.target.classList.contains('show-article-btn')) return;

    // グローバル変数がセットされていなければ何もしない
    if (!window.__articlePanelInitialLawName && !window.__articlePanelInitialArticleNum) return;

    // 入力欄・ボタンのセレクタ
    const lawNameSelectors = [
        '#article-panel-law-name', 'select[name*="law"]', 'select[id*="law"]', 'input[name*="law"]',
        'input[placeholder*="法令"]', 'select[class*="law"]', '#law-name', '#lawName', '.law-name-select', '.law-select'
    ];
    const articleNoSelectors = [
        '#article-panel-article-no', 'input[name*="article"]', 'input[id*="article"]', 'input[placeholder*="条文"]',
        'input[placeholder*="番号"]', 'input[placeholder*="条"]', '#article-no', '#articleNo', '.article-input', '.article-no-input'
    ];
    const searchBtnSelectors = [
        '#article-panel-search-btn', 'button[id*="search"]', 'button[class*="search"]', '.search-btn', '.search-button',
        'button:contains("検索")', 'button:contains("Search")', '[role="button"]:contains("検索")', 'button[type="submit"]',
        'button[type="button"]:last-of-type', '.btn-primary', '.btn-search', 'button.btn:last-child'
    ];
    const fetchBtnSelectors = [
        'button[id*="fetch"]', 'button[class*="fetch"]', '.fetch-btn', 'button[id*="get"]', 'button[class*="get"]', '.get-btn', 'button[type="button"]'
    ];

    // 入力欄・ボタンを探す関数
    function findElement(selectors) {
        for (const selector of selectors) {
            let el = null;
            try {
                if (selector.includes(':contains')) {
                    // :containsは手動で
                    const text = selector.match(/:contains\(["']?(.*?)["']?\)/)[1];
                    const btns = document.querySelectorAll('button');
                    el = Array.from(btns).find(b => b.textContent.includes(text));
                } else {
                    el = document.querySelector(selector);
                }
            } catch {}
            if (el) return el;
        }
        return null;
    }

    // 入力欄取得
    const lawNameInput = findElement(lawNameSelectors);
    const articleNoInput = findElement(articleNoSelectors);
    const searchBtn = findElement(searchBtnSelectors);
    const fetchBtn = findElement(fetchBtnSelectors);

    // 自動入力
    if (lawNameInput && window.__articlePanelInitialLawName) {
        lawNameInput.value = window.__articlePanelInitialLawName;
        lawNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        lawNameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (articleNoInput && window.__articlePanelInitialArticleNum) {
        articleNoInput.value = window.__articlePanelInitialArticleNum;
        articleNoInput.dispatchEvent(new Event('input', { bubbles: true }));
        articleNoInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 検索ボタンがあればクリック
    if (searchBtn) {
        searchBtn.click();
        setTimeout(() => {
            // 取得ボタンがあればクリック
            const fetchBtn2 = findElement(fetchBtnSelectors);
            if (fetchBtn2) fetchBtn2.click();
        }, 300);
    } else if (fetchBtn) {
        fetchBtn.click();
    }

    // グローバル変数リセット
    window.__articlePanelInitialLawName = null;
    window.__articlePanelInitialArticleNum = null;
});

// ★★★ MutationObserverを使って条文パネルの表示を監視し、自動入力を実行 ★★★
let articlePanelObserver = null;

function startArticlePanelObserver() {
    if (articlePanelObserver) {
        articlePanelObserver.disconnect();
    }
    
    articlePanelObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 条文パネルが追加されたかチェック
                        const articlePanel = node.querySelector('[id*="article"], [class*="article"]') || 
                                           (node.id && node.id.includes('article')) ? node : null;
                        
                        if (articlePanel && (window.__articlePanelInitialLawName || window.__articlePanelInitialArticleNum)) {
                            console.log('条文パネル検出、自動入力を実行:', articlePanel);
                            setTimeout(() => performAutoFill(articlePanel), 100);
                        }
                          // 条文取得ボタンが追加された場合も検出
                        const newButtons = node.querySelectorAll('button');
                        for (const btn of newButtons) {
                            const btnText = btn.textContent.toLowerCase();
                            if (btnText.includes('条文を取得') || btnText.includes('取得') || 
                                btnText.includes('fetch') || btnText.includes('get')) {
                                console.log('新しい条文取得ボタンを検出、関数を直接実行:', btn);
                                setTimeout(() => {
                                    if (btn.onclick) {
                                        btn.onclick();
                                    } else if (btn.getAttribute('onclick')) {
                                        eval(btn.getAttribute('onclick'));                                    } else {
                                        // グローバル関数を探して実行
                                        if (window.fetchArticleContent) {
                                            window.fetchArticleContent();
                                        } else if (window.getArticle) {
                                            window.getArticle();
                                        } else if (window.loadArticle) {
                                            window.loadArticle();
                                        } else if (window.searchArticle) {
                                            window.searchArticle();
                                        } else if (window.fetchArticle) {
                                            window.fetchArticle();
                                        } else {
                                            // デフォルト動作
                                            btn.click();
                                        }
                                    }
                                }, 50);
                                break;
                            }
                        }
                    }
                });
            }
        });
    });
    
    articlePanelObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function performAutoFill(panelElement = document) {
    console.log('条文パネル自動入力実行:', window.__articlePanelInitialLawName, window.__articlePanelInitialArticleNum);
    
    // パネル内の要素を優先的に検索
    const lawNameSelectors = [
        'select[name*="law"]', 'select[id*="law"]', '#law-name', '#lawName',
        'input[name*="law"]', 'input[placeholder*="法令"]', '.law-select'
    ];
    
    const articleNoSelectors = [
        'input[name*="article"]', 'input[id*="article"]', '#article-no', '#articleNo',
        'input[placeholder*="条文"]', 'input[placeholder*="番号"]', '.article-input'
    ];
      const searchBtnSelectors = [
        'button[id*="search"]', 'button[class*="search"]', '.search-btn'
    ];
    
    // 条文取得ボタンのセレクターも追加
    const fetchBtnSelectors = [
        'button[id*="fetch"]', 'button[class*="fetch"]', '.fetch-btn',
        'button[id*="get"]', 'button[class*="get"]', '.get-btn'
       ];

    // 法令名入力欄を探す
    let lawNameInput = null;
    for (const selector of lawNameSelectors) {
        lawNameInput = panelElement.querySelector(selector);
        if (lawNameInput) {
            console.log('法令名入力欄発見:', selector, lawNameInput);
                       break;
        }
    }
    
    // 条文番号入力欄を探す
    let articleNoInput = null;
    for (const selector of articleNoSelectors) {
        articleNoInput = panelElement.querySelector(selector);
        if (articleNoInput) {
            console.log('条文番号入力欄発見:', selector, articleNoInput);
            break;
        }
    }
    
    // 検索ボタンを探す
    let searchBtn = null;
    for (const selector of searchBtnSelectors) {
        searchBtn = panelElement.querySelector(selector);
        if (searchBtn) {
            console.log('検索ボタン発見:', selector, searchBtn);
            break;
        }
    }
    
    // 条文取得ボタンを探す
    let fetchBtn = null;
    for (const selector of fetchBtnSelectors) {
        fetchBtn = panelElement.querySelector(selector);
        if (fetchBtn) {
            console.log('条文取得ボタン発見:', selector, fetchBtn);
            break;
        }
    }
    
    // テキスト検索でボタンを探す
    if (!searchBtn && !fetchBtn) {
        const buttons = panelElement.querySelectorAll('button');
        for (const btn of buttons) {
            const btnText = btn.textContent.toLowerCase();
            if (btnText.includes('検索') || btnText.includes('search')) {
                searchBtn = btn;
                console.log('検索ボタン発見(テキスト検索):', btn);
            } else if (btnText.includes('取得') || btnText.includes('fetch') || btnText.includes('get')) {
                fetchBtn = btn;
                console.log('条文取得ボタン発見(テキスト検索):', btn);
            }
        }
    }
    
    console.log('最終要素検出結果:', { lawNameInput, articleNoInput, searchBtn, fetchBtn });
    
    // 自動入力実行
    if (lawNameInput && window.__articlePanelInitialLawName) {        lawNameInput.value = window.__articlePanelInitialLawName;
        lawNameInput.dispatchEvent(new Event('change', { bubbles: true }));
        lawNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('法令名入力完了:', window.__articlePanelInitialLawName);
    }
    
    if (articleNoInput && window.__articlePanelInitialArticleNum) {
        articleNoInput.value = window.__articlePanelInitialArticleNum;
        articleNoInput.dispatchEvent(new Event('input', { bubbles: true }));
        articleNoInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('条文番号入力完了:', window.__articlePanelInitialArticleNum);
    }
    
    // 検索ボタンをクリック
    if (searchBtn) {
        console.log('検索ボタンクリック実行');
        searchBtn.click();
        
        // 検索ボタンクリック後、条文取得ボタンの関数を直接実行（即座に実行）
        const executeAfterSearch = () => {

            let fetchBtnAfterSearch = null;
            const allButtons = document.querySelectorAll('button');
            for (const btn of allButtons) {
                const btnText = btn.textContent.toLowerCase();
                if (btnText.includes('条文を取得') || btnText.includes('取得') || 
                    btnText.includes('fetch') || btnText.includes('get article')) {
                    fetchBtnAfterSearch = btn;
                    console.log('検索後に条文取得ボタン発見:', btn);
                    break;
                }
            }
            
            if (fetchBtnAfterSearch) {
                console.log('条文取得ボタンの関数を直接実行');
                // ボタンの関数を直接実行
                if (fetchBtnAfterSearch.onclick) {
                    fetchBtnAfterSearch.onclick();
                } else if (fetchBtnAfterSearch.getAttribute('onclick')) {
                    eval(fetchBtnAfterSearch.getAttribute('onclick'));                } else {
                    // グローバル関数を探して実行
                    if (window.fetchArticleContent) {
                        window.fetchArticleContent();
                    } else if (window.getArticle) {
                        window.getArticle();
                    } else if (window.loadArticle) {
                        window.loadArticle();
                    } else if (window.searchArticle) {
                        window.searchArticle();
                    } else if (window.fetchArticle) {
                        window.fetchArticle();
                    } else {
                        fetchBtnAfterSearch.click();
                    }
                }
                return true;
            } else {
                console.log('条文取得ボタンが見つかりませんでした');
                return false;
            }
        };
        
        // より短い間隔で複数回試行
        setTimeout(executeAfterSearch, 50);
        setTimeout(executeAfterSearch, 150);
        setTimeout(executeAfterSearch, 300);
        setTimeout(executeAfterSearch, 500);
        setTimeout(executeAfterSearch, 800);
        
    } else if (fetchBtn) {
        // 検索ボタンがない場合は直接条文取得ボタンの関数を実行
        console.log('条文取得ボタンの関数を直接実行');
        if (fetchBtn.onclick) {
            fetchBtn.onclick();
        } else if (fetchBtn.getAttribute('onclick')) {
            eval(fetchBtn.getAttribute('onclick'));
        } else {
            // グローバル関数を探して実行
            if (window.fetchArticleContent) {
                window.fetchArticleContent();
            } else if (window.getArticle) {
                window.getArticle();
            } else if (window.loadArticle) {
                window.loadArticle();
            } else {
                fetchBtn.click();
            }
        }
    }
    
    // グローバル変数をリセット
    window.__articlePanelInitialLawName = null;
    window.__articlePanelInitialArticleNum = null;
}

// ★★★ 保存された回答のリアルタイム更新機能 ★★★
function setupAnswerRefresh() {
    // localStorage変更を監視
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('answers_')) {
            console.log('📢 localStorage変更検出:', e.key);
            refreshPastAnswers();
        }
    });

    // ページ内でのlocalStorage変更も監視（同一タブ内）
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        const result = originalSetItem.apply(this, arguments);
        if (key.startsWith('answers_')) {
            console.log('📝 回答保存検出:', key);
            setTimeout(refreshPastAnswers, 100); // 少し遅延させて更新
        }
        return result;
    };
}

function refreshPastAnswers() {
    if (!window.currentCaseData) return;
    
    // 現在表示されている問題の過去回答エリアを更新
    document.querySelectorAll('[data-problem-type][data-problem-index]').forEach(container => {
        const problemType = container.dataset.problemType;
        const problemIndex = container.dataset.problemIndex;
        const answersContainer = container.querySelector('.past-answers-container');
        
        if (answersContainer) {
            const newContent = displayPastAnswers(window.currentCaseData.id, problemType, problemIndex);
            answersContainer.innerHTML = newContent;
            console.log(`🔄 過去回答を更新: ${problemType}-${problemIndex}`);
        }
    });
}

// キャラクター対話の左右判定もrightSideCharactersを参照する
function displayCharacterDialogue(response) {
    const rightSideCharacters = window.currentCaseData?.rightSideCharacters || ['みかん', '母', '父'];
    const container = document.getElementById('character-dialogue-container');
    if (!container) return;
    if (response.dialogues && response.dialogues.length > 0) {
        container.innerHTML = response.dialogues.map(dialogue => {
            const character = characters.find(c => c.name === dialogue.speaker);
            if (!character) return '';
            const requestedExpression = dialogue.expression ?? 'normal';
            const finalExpression = character.availableExpressions.includes(requestedExpression) ? requestedExpression : 'normal';
            const iconSrc = `/images/${character.baseName}_${finalExpression}.png`;
            const fallbackSrc = `/images/${character.baseName}_normal.png`;
            const onErrorAttribute = `this.src='${fallbackSrc}'; this.onerror=null;`;
            const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";
            const isRightSide = rightSideCharacters.includes(dialogue.speaker);
            const iconTransform = isRightSide ? 'transform: scaleX(-1);' : '';
            const iconHtml = `<img src="${iconSrc}" alt="${character.name}" style="${imageStyle} ${iconTransform}" onerror="${onErrorAttribute}">`;
            const bubbleHtml = `<div class="chat-bubble ${isRightSide ? 'chat-bubble-right' : 'chat-bubble-left'} p-3 rounded-lg shadow"><p class="font-bold">${character.name}</p><p>${dialogue.dialogue}</p></div>`;
            return `<div class="flex items-start gap-3 my-4 ${isRightSide ? 'justify-end' : ''}">${isRightSide ? bubbleHtml + iconHtml : iconHtml + bubbleHtml}</div>`;
        }).join('');
    } else {
        container.innerHTML = '<p class="text-gray-500 text-center">対話内容がありません</p>';
    }
}

// ページ読み込み時に設定
document.addEventListener('DOMContentLoaded', setupAnswerRefresh);

// ★★★ ログアウト機能の初期化 ★★★
initializeCaseLogout();

/**
 * ケースページでのログアウト機能の初期化
 */
function initializeCaseLogout() {
    // ユーザー情報の取得と表示
    fetchCaseUserInfo();
    
    // ログアウトボタンのイベントリスナー
    const logoutBtn = document.getElementById('logout-btn-case');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleCaseLogout);
    }
}

/**
 * ケースページでユーザー情報を取得してヘッダーに表示
 */
async function fetchCaseUserInfo() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        const userInfoElement = document.getElementById('user-info-case');
        if (data.authenticated && userInfoElement) {
            userInfoElement.innerHTML = `
                <div class="text-right">
                    <div class="font-semibold text-gray-700 text-sm">👤 ${data.username}</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
    }
}

/**
 * ケースページでのログアウト処理
 */
async function handleCaseLogout() {
    if (!confirm('ログアウトしますか？')) {
        return;
    }
    
    const logoutBtn = document.getElementById('logout-btn-case');
    const originalText = logoutBtn.innerHTML;
    
    try {
        // ボタンを無効化
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = `
            <svg class="animate-spin w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ログアウト中...
        `;
        
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // セッションクリア
            sessionStorage.clear();
            localStorage.clear();
            
            // ログインページへリダイレクト
            window.location.href = '/login.html';
        } else {
            throw new Error('ログアウトに失敗しました');
        }
        
    } catch (error) {
        console.error('ログアウトエラー:', error);
        alert('ログアウト処理中にエラーが発生しました。');
        
        // ボタンを復元
        logoutBtn.disabled = false;
        logoutBtn.innerHTML = originalText;
    }
}
