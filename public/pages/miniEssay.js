// miniEssay.js - 答案添削ビューのエントリーポイント（完全新設計）

// 必要なモジュールをインポート
import { processAllReferences, setupArticleRefButtons } from '../articleProcessor.js';
import { RANK_CONFIG } from './casePage.js';

/**
 * クイズコンテンツの初期化（答案添削ビュー対応）
 */
export async function initializeQuizContent() {
    const quizContainer = document.getElementById('tab-quiz-content');
    if (!quizContainer || quizContainer.hasAttribute('data-initialized')) return;

    console.log('📝 クイズコンテンツを初期化中...');

    let html = '<div class="space-y-8 p-4">';
    
    // 条文表示ボタン
    html += `
        <div class="text-right mb-4">
            <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded transition-all duration-300">
                📖 条文
            </button>
        </div>
    `;

    // クイズデータが存在する場合
    if (window.currentCaseData?.quiz && window.currentCaseData.quiz.length > 0) {
        html += generateQuizHTML();
    } else {
        html += `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-4">📚</div>
                <p class="text-lg">クイズデータが見つかりません</p>
                <p class="text-sm mt-2">ケースデータを確認してください</p>
            </div>
        `;
    }

    html += '</div>';
    quizContainer.innerHTML = html;
    quizContainer.setAttribute('data-initialized', 'true');

    // イベントリスナーを設定
    setupQuizEventListeners();
    console.log('✅ クイズコンテンツ初期化完了');
}

/**
 * クイズHTMLの生成
 */
function generateQuizHTML() {
    let html = '';
    
    window.currentCaseData.quiz.forEach((quizGroup, quizIndex) => {
        const groupRank = quizGroup.rank || 'C';
        const rankConfig = RANK_CONFIG[groupRank] || RANK_CONFIG['C'];

        html += `
            <div class="quiz-group border-l-4 border-${rankConfig.color} bg-${rankConfig.bgColor} p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div class="quiz-header flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${quizGroup.title || `問題 ${quizIndex + 1}`}</h3>
                    <span class="rank-badge ${rankConfig.color} px-3 py-1 rounded-full text-sm font-bold ${rankConfig.bgColor}">
                        ${groupRank}ランク
                    </span>
                </div>
                <div class="quiz-description text-gray-700 mb-4 leading-relaxed">
                    ${quizGroup.description || ''}
                </div>
        `;

        // サブ問題がある場合
        if (quizGroup.subProblems && quizGroup.subProblems.length > 0) {
            quizGroup.subProblems.forEach((subProblem, subIndex) => {
                html += createSubProblemHTML(quizIndex, subIndex, subProblem);
            });
        } else if (quizGroup.problem) {
            // 単一問題の場合
            html += createSubProblemHTML(quizIndex, 0, quizGroup);
        }

        html += '</div>';
    });

    return html;
}

/**
 * サブ問題のHTML生成
 */
function createSubProblemHTML(quizIndex, subIndex, subProblem) {
    const problemId = `quiz-${quizIndex}-${subIndex}`;
    const hasAnswerSheet = subProblem.hasAnswerSheet !== false;

    return `
        <div class="sub-problem bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200" data-quiz="${quizIndex}" data-sub="${subIndex}">
            <div class="problem-content mb-4">
                <h4 class="font-semibold text-gray-800 mb-2">
                    ${subProblem.title ? `(${subIndex + 1}) ${subProblem.title}` : `設問 ${subIndex + 1}`}
                </h4>
                <div class="problem-text text-gray-700 leading-relaxed whitespace-pre-wrap">
                    ${subProblem.problem || subProblem.description || ''}
                </div>
            </div>
            
            ${hasAnswerSheet ? `
                <div class="answer-actions flex gap-2 flex-wrap">
                    <button 
                        class="answer-mode-btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
                        data-quiz="${quizIndex}" 
                        data-sub="${subIndex}"
                        onclick="startAnswerCorrectionMode(${quizIndex}, ${subIndex})">
                        ✍️ 答案添削モード
                    </button>
                </div>
            ` : `
                <div class="no-answer-sheet text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    <div class="text-2xl mb-2">💭</div>
                    <p class="text-sm">この問題は答案用紙がありません</p>
                </div>
            `}
        </div>
    `;
}

/**
 * クイズ関連のイベントリスナー設定
 */
function setupQuizEventListeners() {
    // 条文表示ボタン
    const showArticleBtn = document.querySelector('.show-article-btn');
    if (showArticleBtn) {
        showArticleBtn.addEventListener('click', () => {
            console.log('📖 条文表示ボタンがクリックされました');
            if (window.showArticles) {
                window.showArticles();
            } else {
                console.log('条文表示機能が見つかりません');
            }
        });
    }

    console.log('👂 クイズイベントリスナー設定完了');
}

console.log('✅ miniEssay.js 答案添削ビュー対応版が読み込まれました');
