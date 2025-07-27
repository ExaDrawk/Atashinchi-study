// qaPopup.js - Q&Aポップアップ専用モジュール

import { processArticleReferences, processBlankFillText, processAllReferences, setupArticleRefButtons } from './articleProcessor.js';
import { getArticlePanelPosition, isArticlePanelVisible, updateArticlePanelLayout, ARTICLE_PANEL_WIDTH } from './articlePanel.js';
import { QAStatusSystem } from './qaStatusSystem.js';

// QAStatusSystemのインスタンス作成
const qaStatusSystem = new QAStatusSystem();

// ★★★ Q&Aポップアップのグローバル状態管理 ★★★
window.qaPopupState = {
    openPopups: [],
    savePopup: function(popupId, qaIndex, qNumber, quizIndex, subIndex) {
        this.openPopups.push({ popupId, qaIndex, qNumber, quizIndex, subIndex });
        console.log(`💾 Q&Aポップアップ保存: ${popupId}`, this.openPopups);
    },
    removePopup: function(popupId) {
        this.openPopups = this.openPopups.filter(p => p.popupId !== popupId);
    },
    clearAll: function() {
        console.log(`🧹 Q&Aポップアップ状態をクリア (${this.openPopups.length}個)`);
        this.openPopups = [];
        
        // DOM上の全てのQ&Aポップアップも削除
        const allQAPopups = document.querySelectorAll('.qa-ref-popup');
        allQAPopups.forEach(popup => {
            console.log(`🗑️ DOM上のポップアップも削除: ${popup.id}`);
            popup.remove();
        });
        
        // 条文パネルのレイアウトを更新
        setTimeout(() => {
            updateArticlePanelLayout();
        }, 10);
    },
    restorePopups: function() {
        console.log(`🔄 Q&Aポップアップを復元: ${this.openPopups.length}個`);
        this.openPopups.forEach(popup => {
            recreateQAPopup(popup);
        });
    },
    updateAllPositions: function() {
        console.log(`📍 全Q&Aポップアップの位置を更新`);
        const allQAPopups = document.querySelectorAll('.qa-ref-popup');
        allQAPopups.forEach(popup => {
            updateQAPopupPosition(popup);
        });
    }
};

/**
 * Q&Aポップアップを再作成する関数
 * @param {Object} param - ポップアップ情報
 * @param {string} param.popupId - ポップアップID
 * @param {number} param.qaIndex - Q&Aインデックス
 * @param {number} param.qNumber - Q番号
 * @param {number} param.quizIndex - クイズインデックス
 * @param {number} param.subIndex - サブインデックス
 */
function recreateQAPopup({ popupId, qaIndex, qNumber, quizIndex, subIndex }) {
    const qa = window.currentCaseData.questionsAndAnswers[qaIndex];
    if (!qa) return;

    // 既存のポップアップがあれば削除
    const existing = document.getElementById(popupId);
    if (existing) existing.remove();

    // ポップアップHTML生成（条文参照ボタン化 + 空欄化処理）
    let qaQuestion = qa.question.replace(/(【[^】]+】)/g, match => {
        const lawText = match.replace(/[【】]/g, '');
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-text='${lawText}'>${lawText}</button>`;
    });
    
    // 先にanswerの{{}}の外の【】を条文参照ボタン化してから、空欄化処理を行う
    let qaAnswerWithArticleRefs = processArticleReferences(qa.answer);
    let qaAnswer = processBlankFillText(qaAnswerWithArticleRefs, `qa-recreate-${qaIndex}`);

    const popupHtml = createQAPopupHTML(popupId, qNumber, qaQuestion, qaAnswer);

    // グローバルポップアップコンテナに追加
    const globalContainer = document.getElementById('qa-ref-popup-global-container');
    if (globalContainer) {
        globalContainer.insertAdjacentHTML('beforeend', popupHtml);
    } else {
        document.body.insertAdjacentHTML('beforeend', popupHtml);
    }
    
    // ポップアップ内のイベントリスナーを設定
    setupQAPopupEvents(popupId);
    
    // 条文パネルのレイアウトを更新
    updateArticlePanelLayout();
}

/**
 * Q&AポップアップのHTMLを生成
 * @param {string} popupId - ポップアップID
 * @param {number} qNumber - Q番号
 * @param {string} qaQuestion - 質問内容
 * @param {string} qaAnswer - 回答内容
 * @returns {string} ポップアップHTML
 */
function createQAPopupHTML(popupId, qNumber, qaQuestion, qaAnswer) {
    // 条文パネルの表示状態に応じて位置を決定
    let positionStyle = '';
    let maxHeightStyle = '';
    
    if (isArticlePanelVisible()) {
        // 両方表示：Q&Aは51vhから下に配置
        positionStyle = `top: 51vh; left: 1rem; right: auto; transform: none; width: ${ARTICLE_PANEL_WIDTH};`;
        maxHeightStyle = `max-height: calc(100vh - 51vh - 0rem);`;
    } else {
        // Q&Aのみ表示：上部に配置、制限なし
        positionStyle = `top: 1rem; left: 1rem; right: auto; transform: none; width: ${ARTICLE_PANEL_WIDTH};`;
        maxHeightStyle = `max-height: calc(100vh - 2rem);`;
    }
    
    // Q&Aステータスボタンを生成
    const qaId = `qa-${qNumber}`;
    const statusButtons = qaStatusSystem.generateStatusButtons(qaId);
    
    return `
        <div id="${popupId}" class="qa-ref-popup fixed bg-white border border-yellow-400 rounded-lg shadow-lg p-4" style="${positionStyle} ${maxHeightStyle} overflow-y: auto; z-index: 1100001;">
            <div class="flex justify-between items-center mb-2 sticky top-0 bg-white z-10 border-b border-yellow-200 pb-2">
                <span class="font-bold text-yellow-900">Q${qNumber} 参照</span>
                <button type="button" class="qa-ref-close-btn text-gray-400 hover:text-gray-700 ml-2" style="font-size:1.2em;">×</button>
            </div>
            <div class="mb-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-bold">問題：</span>
                    <div class="qa-status-buttons">${statusButtons}</div>
                </div>
                <div class="qa-question-text">${qaQuestion}</div>
            </div>
            <div class="mb-2">
                <button type="button" class="toggle-qa-answer-btn bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1 px-3 rounded border border-green-300 text-sm mb-2">💡 解答を隠す</button>
                <div class="qa-answer-content bg-green-50 p-3 rounded-lg border border-green-200">
                    <div class="flex gap-2 mb-2">
                        <button type="button" class="show-all-blanks-btn bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-2 rounded border border-blue-300 text-xs">🔍 全て表示</button>
                        <button type="button" class="hide-all-blanks-btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded border border-gray-300 text-xs">👁️ 全て隠す</button>
                        <button type="button" class="copy-qa-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-1 px-2 rounded border border-yellow-400 text-xs" title="問題文と解答をコピー">📋 コピー</button>
                    </div>
                    <div><span class="font-bold text-green-800">解答：</span>${qaAnswer}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Q&Aポップアップの位置を更新する
 * @param {HTMLElement} popup - ポップアップ要素
 */
function updateQAPopupPosition(popup) {
    if (!popup) return;
    
    // 条文パネルの表示状態に応じて位置を調整
    if (isArticlePanelVisible()) {
        // 両方表示：Q&Aは51vhから下に配置
        popup.style.top = '51vh';
        popup.style.left = '1rem';
        popup.style.right = 'auto';
        popup.style.transform = 'none';
        popup.style.width = ARTICLE_PANEL_WIDTH;
        
        const availableHeight = window.innerHeight * 0.49 - 0; // 49vh - 0px余裕
        popup.style.maxHeight = `${availableHeight}px`;
        
        // 条文パネルも50vh制限に戻す
        updateArticlePanelLayout();
    } else {
        // Q&Aのみ表示：上部に配置、制限なし
        popup.style.top = '1rem';
        popup.style.left = '1rem';
        popup.style.right = 'auto';
        popup.style.transform = 'none';
        popup.style.width = ARTICLE_PANEL_WIDTH;
        
        popup.style.maxHeight = 'calc(100vh - 2rem)';
    }
}

/**
 * Q&Aポップアップ内のイベントリスナーを設定
 * @param {string} popupId - ポップアップID
 */
function setupQAPopupEvents(popupId) {
    const recreatedPopup = document.getElementById(popupId);
    if (!recreatedPopup) return;

    // コピーボタンのイベントリスナーを設定
    const copyBtn = recreatedPopup.querySelector('.copy-qa-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            // 問題文と解答を取得
            const questionElem = recreatedPopup.querySelector('.qa-question-text');
            const answerElem = recreatedPopup.querySelector('.qa-answer-content');
            let questionText = questionElem ? questionElem.textContent || '' : '';
            let answerText = '';
            if (answerElem) {
                // ボタン群を除外し、解答テキストのみ抽出
                const answerDivs = answerElem.querySelectorAll('div');
                let found = false;
                for (const div of answerDivs) {
                    // 「解答：」ラベルが含まれるdivを探す
                    const label = div.querySelector('span.font-bold.text-green-800');
                    if (label) {
                        let text = '';
                        for (let node of div.childNodes) {
                            if (node.nodeType === Node.TEXT_NODE) {
                                text += node.textContent;
                            } else if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.matches('span.font-bold.text-green-800')) {
                                    continue; // ラベルはスキップ
                                } else if (node.classList && node.classList.contains('blank-text')) {
                                    // すべてのdata-*属性を優先してコピー
                                    let blankText = '';
                                    for (const attr of node.attributes) {
                                        if (attr.name.startsWith('data-') && attr.value && attr.value.trim() !== '') {
                                            blankText = attr.value;
                                            break;
                                        }
                                    }
                                    if (!blankText || blankText.trim() === '') {
                                        blankText = node.textContent;
                                    }
                                    text += blankText;
                                } else {
                                    text += node.textContent;
                                }
                            }
                        }
                        // 余計な改行・空白を1つにまとめる
                        answerText = text.replace(/[\r\n]+/g, '').replace(/\s{2,}/g, ' ');
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    // フォールバック: すべてのテキストから「解答：」を除去
                    answerText = answerElem.textContent.replace(/^解答：/, '').trim();
                }
            }
            // 空欄用のかっこや空欄部分（___や（）など）を除去
            questionText = questionText.replace(/[（）\(\)＿_]+/g, '');
            answerText = answerText.replace(/[（）\(\)＿_]+/g, '');
            // 前後空白除去
            questionText = questionText.trim();
            answerText = answerText.trim();
            // コピーするテキスト
            const copyText = `Q: ${questionText}\nA: ${answerText}`;
            // クリップボードにコピー
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(copyText).then(() => {
                    copyBtn.textContent = '✅ コピー完了';
                    setTimeout(() => { copyBtn.textContent = '📋 コピー'; }, 1200);
                }).catch(() => {
                    copyBtn.textContent = '⚠️ 失敗';
                    setTimeout(() => { copyBtn.textContent = '📋 コピー'; }, 1200);
                });
            } else {
                // Fallback for HTTP or古いブラウザ
                const textarea = document.createElement('textarea');
                textarea.value = copyText;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    copyBtn.textContent = '✅ コピー完了';
                } catch (err) {
                    copyBtn.textContent = '⚠️ 失敗';
                }
                document.body.removeChild(textarea);
                setTimeout(() => { copyBtn.textContent = '📋 コピー'; }, 1200);
            }
        });
    }
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

    // 閉じるボタンのイベントリスナー
    const closeBtn = recreatedPopup.querySelector('.qa-ref-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            recreatedPopup.remove();
            window.qaPopupState.removePopup(popupId);
            
            // 条文パネルのレイアウトを更新
            updateArticlePanelLayout();
        });
    }

    // ★★★ Q&Aステータスボタンのイベントリスナー設定 ★★★
    const statusButtons = recreatedPopup.querySelectorAll('.qa-status-btn');
    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const status = this.dataset.status;
            const qaId = this.dataset.qaId;
            qaStatusSystem.setStatus('default', qaId, status);
            
            // ボタンの表示状態を更新（qaStatusSystemで自動的に行われる）
        });
    });

    // 条文参照ボタンを有効にする
    setupArticleRefButtons(recreatedPopup);
    
    // ポップアップ表示後にQ&Aリンクボタンの色を更新
    if (window.qaStatusSystem) {
        window.qaStatusSystem.updateAllQALinkColors();
    }
}

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

/**
 * グローバルポップアップコンテナを作成
 */
function createGlobalPopupContainer() {
    if (!document.getElementById('qa-ref-popup-global-container')) {
        const globalContainer = document.createElement('div');
        globalContainer.id = 'qa-ref-popup-global-container';
        globalContainer.className = 'qa-ref-popup-global-container';
        document.body.appendChild(globalContainer);
    }
}

/**
 * 条文パネルの状態変化を監視してQ&Aポップアップの位置を更新
 */
function setupArticlePanelObserver() {
    // MutationObserverで条文パネルの表示/非表示を監視
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'article-panel') {
                    // 条文パネルの表示状態が変わったらQ&Aポップアップの位置を更新
                    setTimeout(() => {
                        window.qaPopupState.updateAllPositions();
                    }, 100); // 少し遅延させてDOM更新を待つ
                }
            }
        });
    });
    
    // 条文パネルが存在する場合は監視開始
    const articlePanel = document.getElementById('article-panel');
    if (articlePanel) {
        observer.observe(articlePanel, { attributes: true, attributeFilter: ['class'] });
    }
    
    // 新しく作成される条文パネルも監視するため、bodyレベルで監視
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
    
    return observer;
}

// 条文パネル監視を開始
let articlePanelObserver = null;
document.addEventListener('DOMContentLoaded', () => {
    articlePanelObserver = setupArticlePanelObserver();
});

// ウィンドウリサイズ時にもQ&Aポップアップの位置を調整
window.addEventListener('resize', () => {
    setTimeout(() => {
        window.qaPopupState.updateAllPositions();
    }, 100);
});

// エクスポート
export {
    recreateQAPopup,
    createQAPopupHTML,
    setupQAPopupEvents,
    toggleAllBlanks,
    createGlobalPopupContainer,
    updateQAPopupPosition,
    setupArticlePanelObserver
};

// グローバル関数として公開
window.recreateQAPopup = recreateQAPopup;
window.createGlobalPopupContainer = createGlobalPopupContainer;
window.updateQAPopupPosition = updateQAPopupPosition;

console.log('📦 qaPopup.js モジュール読み込み完了');
