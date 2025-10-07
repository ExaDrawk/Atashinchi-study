// qaRenderer.js - 統一されたQ&A表示機能

import { processArticleReferences, processBlankFillText } from './articleProcessor.js';
import { QAStatusSystem } from './qaStatusSystem.js';
import { getRankColor } from './rankColors.js';

// QAStatusSystemのインスタンス（既存のものを使用）
const qaStatusSystem = window.qaStatusSystem || new QAStatusSystem();

/**
 * 統一されたQ&Aアイテム表示機能
 * @param {Object} options - 表示オプション
 * @param {Object} options.qa - Q&Aデータ
 * @param {number} options.index - インデックス
 * @param {string} options.moduleId - モジュールID
 * @param {boolean} options.showModuleLink - モジュールリンクを表示するか
 * @param {string} options.idPrefix - ID接頭詞（重複回避用）
 * @returns {Promise<string>} HTML文字列
 */
export async function renderQAItem(options) {
    const {
        qa,
        index,
        moduleId,
        showModuleLink = false,
        idPrefix = 'qa'
    } = options;

    // ランクバッジの生成（homePage.js の getRankColor を使って一元化）
    const rank = qa.rank || '';
    let rankInfo = null;
    if (typeof window.getRankColor === 'function') {
        rankInfo = window.getRankColor(rank) || { color: '#6b7280', bgColor: '#f9fafb', borderColor: '#d1d5db' };
    }
    if (!rankInfo) {
        // フォールバック
        const fallback = {
            'S': { color: '#ffffff', bgColor: '#dc2626', borderColor: '#b91c1c' },
            'A': { color: '#ffffff', bgColor: '#ea580c', borderColor: '#c2410c' },
            'B': { color: '#ffffff', bgColor: '#2563eb', borderColor: '#1d4ed8' },
            'C': { color: '#ffffff', bgColor: '#16a34a', borderColor: '#15803d' }
        };
        rankInfo = fallback[rank] || { color: '#6b7280', bgColor: '#f9fafb', borderColor: '#d1d5db' };
    }
    const rankBadge = `<span class="inline-block px-2 py-0.5 rounded text-xs font-bold border mr-2" style="color: ${rankInfo.color}; background-color: ${rankInfo.bgColor}; border-color: ${rankInfo.borderColor};">${rank}</span>`;
    
    // 一意なIDの生成
    const answerId = `${idPrefix}-answer-${index}`;
    
    // コンテンツ処理
    const questionHtml = processArticleReferences(qa.question);
    const answerWithRefs = processArticleReferences(qa.answer);
    const answerHtml = processBlankFillText(answerWithRefs, `${idPrefix}-${index}`, qa.id);
    
    // ステータスボタンの生成（統一関数を使用）
    const qaId = qa.id;
    const statusButtons = await generateUnifiedStatusButtons(qaId, moduleId, qa);
    
    // モジュールリンクの生成
    const moduleLinkHtml = showModuleLink && qa.moduleTitle ? 
        `<span class="ml-auto text-xs text-blue-700 font-bold cursor-pointer hover:underline module-link" data-module-id="${moduleId}">[${qa.moduleTitle}]</span>` : '';
    
    return `<div class="p-4 bg-white rounded-lg shadow border flex flex-col gap-2 qa-item" data-qa-id="${qaId}" data-module-id="${moduleId}">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                ${rankBadge}
                <span class="font-bold">Q${qa.id}.</span>
                <span>${questionHtml}</span>
                ${moduleLinkHtml}
            </div>
            <div class="qa-status-buttons flex-shrink-0">${statusButtons}</div>
        </div>
        <div class="ml-8">
            <div class="flex gap-2 mb-1">
                <button class="toggle-answer-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold px-2 py-1 rounded text-xs" data-target="${answerId}">答えを表示</button>
                <button class="hint-btn bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold px-2 py-1 rounded text-xs" data-target="${answerId}">ヒント！</button>
                <button class="copy-qa-btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-2 py-1 rounded text-xs" data-qa-id="${qaId}" title="問題文と解答をコピー">📋 コピー</button>
            </div>
            <span id="${answerId}" class="hidden"><span class="font-bold">答：</span>${answerHtml}</span>
        </div>
    </div>`;
}

/**
 * Q&Aリスト全体の表示機能
 * @param {Object} options - 表示オプション
 * @param {Array} options.qaList - Q&Aリスト
 * @param {string} options.moduleId - モジュールID
 * @param {boolean} options.showModuleLink - モジュールリンクを表示するか
 * @param {string} options.title - リストタイトル
 * @param {string} options.idPrefix - ID接頭詞
 * @returns {Promise<string>} HTML文字列
 */
export async function renderQAList(options) {
    const {
        qaList,
        moduleId,
        showModuleLink = false,
        title = 'Q&Aリスト',
        idPrefix = 'qa'
    } = options;

    if (!qaList || qaList.length === 0) {
        return `<div class="max-w-4xl mx-auto p-6">
            <h2 class="text-2xl font-bold mb-6 text-center">${title}</h2>
            <div class="text-center text-gray-500">Q&Aがありません</div>
        </div>`;
    }

    let html = `<div class="max-w-4xl mx-auto p-6">
        <h2 class="text-2xl font-bold mb-6 text-center">${title}</h2>
        <div class="space-y-6">`;

    // 各Q&Aアイテムを非同期で処理
    for (let i = 0; i < qaList.length; i++) {
        const qa = qaList[i];
        const qaModuleId = qa.moduleId || moduleId || 'default';
        
        const qaItemHtml = await renderQAItem({
            qa,
            index: i,
            moduleId: qaModuleId,
            showModuleLink,
            idPrefix
        });
        
        html += qaItemHtml;
    }

    html += `</div></div>`;
    return html;
}

/**
 * Q&Aリストのイベントハンドラーを設定
 * @param {HTMLElement} container - コンテナ要素
 */
export function setupQAListEventHandlers(container) {
    if (!container) return;

    // 答えの表示/非表示ボタン
    container.querySelectorAll('.toggle-answer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.target);
            if (target) {
                if (target.classList.contains('hidden')) {
                    target.classList.remove('hidden');
                    this.textContent = '答えを隠す';
                } else {
                    target.classList.add('hidden');
                    this.textContent = '答えを表示';
                }
            }
        });
    });

    // ヒントボタンの処理
    container.querySelectorAll('.hint-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('ヒントボタンがクリックされました');
            const targetId = this.dataset.target;
            const answerElement = document.getElementById(targetId);
            toggleHintDisplay(answerElement, this);
        });
    });

    // コピーボタンの処理
    container.querySelectorAll('.copy-qa-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const qaId = this.dataset.qaId;
            const qaContainer = this.closest('.qa-item');
            copyQAContent(qaContainer, this, qaId);
        });
    });

    // モジュールリンクのクリックハンドラー
    container.querySelectorAll('.module-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
            const moduleId = this.dataset.moduleId;
            if (moduleId) {
                window.location.hash = `#/case/${moduleId}`;
            }
        });
    });

    console.log('✅ Q&Aリストのイベントハンドラーを設定しました');
}

/**
 * 難易度クラスを取得
 * @param {string} rank - ランク文字列
 * @returns {Object} CSSクラス情報
 */
function getDifficultyClass(rank) {
    const rankUpper = (rank || '').replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();

    // homePage.js の getRankColor を優先して使用し、インラインスタイル情報を返す
    if (typeof window.getRankColor === 'function') {
        const info = window.getRankColor(rankUpper) || { color: '#6b7280', bgColor: '#f9fafb', borderColor: '#d1d5db' };
        return {
            text: '',
            bg: '',
            border: '',
            style: `color: ${info.color}; background-color: ${info.bgColor}; border-color: ${info.borderColor};`,
            inline: info
        };
    }

    // フォールバック: 旧来のTailwindクラスも返す形で互換性を保つ
    switch (rankUpper) {
        case 'S':
            return { text: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-300', style: '', inline: null };
        case 'A':
            return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300', style: '', inline: null };
        case 'B':
            return { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300', style: '', inline: null };
        case 'C':
            return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300', style: '', inline: null };
        default:
            return { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300', style: '', inline: null };
    }
}

/**
 * Q&Aステータスの更新時にリストを再描画
 * @param {HTMLElement} container - コンテナ要素
 * @param {Array} qaList - Q&Aリスト
 * @param {Object} options - レンダリングオプション
 */
export async function refreshQAList(container, qaList, options) {
    if (!container || !qaList) return;
    
    console.log('🔄 Q&Aリストを再描画中...');
    
    // リストを再描画
    const html = await renderQAList({
        qaList,
        ...options
    });
    
    container.innerHTML = html;
    setupQAListEventHandlers(container);
    
    console.log('✅ Q&Aリスト再描画完了');
}

// グローバルに公開
window.qaRenderer = {
    renderQAItem,
    renderQAList,
    setupQAListEventHandlers,
    refreshQAList,
    generateUnifiedStatusButtons
};

/**
 * 統一されたQ&Aステータスボタン生成関数（色変更無効化版）
 * @param {number|string} qaId - Q&AのID
 * @param {string} moduleId - モジュールID
 * @param {Object} qa - Q&Aオブジェクト（statusプロパティ確認用）
 * @returns {Promise<string>} ステータスボタンのHTML
 */
export async function generateUnifiedStatusButtons(qaId, moduleId, qa = null) {
    // 最優先: Q&Aオブジェクト自体にstatusプロパティがある場合はそれを使用
    let currentStatus = qa?.status && qaStatusSystem.statuses.includes(qa.status) ? qa.status : null;
    
    // statusがない場合は非同期で取得
    if (!currentStatus) {
        currentStatus = await qaStatusSystem.getStatusAsync(moduleId, qaId);
    }
    
    // 元の色システムを使用（色変更は無効化しない）
    const statusColor = qaStatusSystem.colors[currentStatus];
    const currentModuleId = moduleId || window.currentCaseData?.id || 'unknown';
    
    return `
        <div class="qa-status-container inline-flex" data-qa-id="${qaId}" data-module-id="${currentModuleId}">
            <div class="qa-status-buttons inline-flex rounded-lg border ${statusColor.border} overflow-hidden">
                ${qaStatusSystem.statuses.map(status => {
                    const color = qaStatusSystem.colors[status];
                    const isActive = status === currentStatus;
                    return `
                        <button 
                            class="qa-status-btn px-2 py-1 text-xs font-bold transition-all duration-200 hover:opacity-80 ${
                                isActive 
                                    ? `${color.bg} ${color.text}` 
                                    : 'bg-white text-gray-400 hover:bg-gray-50'
                            }"
                            data-status="${status}"
                            data-qa-id="${qaId}"
                            data-module-id="${currentModuleId}"
                            title="${getStatusDescription(status)}"
                        >
                            ${status}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * ステータスの説明を取得
 */
function getStatusDescription(status) {
    const descriptions = {
        '未': '未学習・未確認',
        '済': '学習済み・理解済み',
        '要': '重要・要復習'
    };
    return descriptions[status] || '';
}

/**
 * 共通ヒント機能
 * @param {HTMLElement} answerElement - 回答要素
 * @param {HTMLElement} hintButton - ヒントボタン
 * @param {string} hintText - ヒント表示時のボタンテキスト
 * @param {string} normalText - 通常時のボタンテキスト
 */
export function toggleHintDisplay(answerElement, hintButton, hintText = 'ヒント解除', normalText = 'ヒント！') {
    if (!answerElement) {
        console.log('回答要素が見つかりません');
        return;
    }

    // 回答文内のすべての穴埋めスパンを取得（data-answer属性を持つもの）
    const blankSpans = answerElement.querySelectorAll('span[data-answer]');
    console.log('blankSpans found:', blankSpans.length);
    
    // ヒント状態をチェック（最初の穴埋めがヒント表示中かどうか）
    const firstBlank = blankSpans[0];
    const isHintShown = firstBlank && firstBlank.classList.contains('hinted');
    
    if (isHintShown) {
        // ヒントを非表示にする
        console.log('ヒントを非表示にします');
        blankSpans.forEach(span => {
            if (span.classList.contains('hinted') && span.dataset.isRevealed !== 'true') {
                // 元の下線に戻す
                const originalText = span.dataset.answer;
                const blankLength = Math.max(4, Math.floor(originalText.length * 0.9));
                const underscores = '＿'.repeat(blankLength);
                span.textContent = underscores;
                span.classList.remove('hinted');
                span.style.backgroundColor = ''; // 背景色をリセット
                console.log('ヒント非表示:', underscores);
            }
        });
        hintButton.textContent = normalText;
    } else {
        // ヒントを表示する
        console.log('ヒントを表示します');
        blankSpans.forEach(span => {
            // 既に表示されている場合はスキップ
            if (span.dataset.isRevealed === 'true') {
                console.log('既に表示済みのためスキップ');
                return;
            }
            
            const originalText = span.dataset.answer;
            console.log('originalText:', originalText);
            if (originalText && originalText.length > 0) {
                // 最初の1文字 + 残りの文字数分の空白文字を表示
                const firstChar = originalText.charAt(0);
                const remainingChars = '・'.repeat(originalText.length - 1);
                span.textContent = firstChar + remainingChars;
                span.classList.add('hinted');
                span.style.backgroundColor = '#dbeafe'; // 薄い青色でヒント表示を示す
                console.log('ヒント適用:', firstChar + remainingChars);
            }
        });
        hintButton.textContent = hintText;
    }
}

/**
 * 共通コピー機能
 * @param {HTMLElement} container - Q&A要素のコンテナ
 * @param {HTMLElement} copyButton - コピーボタン
 * @param {string} qaId - Q&AのID
 */
export function copyQAContent(container, copyButton, qaId) {
    // 質問文と回答文を取得
    let questionText = '';
    let answerText = '';

    // 質問文を取得
    const questionElem = container.querySelector('.qa-item span:not(.font-bold):not(.inline-block)') || 
                        container.querySelector('.qa-question-text');
    if (questionElem) {
        questionText = questionElem.textContent || '';
    }

    // 回答文を取得
    const answerElem = container.querySelector('[id*="answer"]') || 
                      container.querySelector('.qa-answer-content');
    if (answerElem) {
        // 穴埋め部分のdata-answer属性から正解を取得
        let fullAnswerText = answerElem.textContent || '';
        const blankSpans = answerElem.querySelectorAll('span[data-answer]');
        
        blankSpans.forEach(span => {
            const originalText = span.dataset.answer || span.dataset.displayContent || '';
            if (originalText) {
                // 現在のテキストを正解テキストに置換
                const currentText = span.textContent;
                fullAnswerText = fullAnswerText.replace(currentText, originalText);
            }
        });
        
        answerText = fullAnswerText.replace(/^解答：/, '').trim();
    }

    // 不要な文字を除去
    questionText = questionText.replace(/[（）\(\)＿_]+/g, '').trim();
    answerText = answerText.replace(/[（）\(\)＿_]+/g, '').trim();
    
    const copyText = `Q${qaId}. ${questionText}\n\n解答：${answerText}`;
    
    // クリップボードにコピー
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText).then(() => {
            copyButton.textContent = '✅ コピー完了';
            setTimeout(() => { copyButton.textContent = '📋 コピー'; }, 1200);
        }).catch(() => {
            // フォールバックを使用
            fallbackCopy(copyText, copyButton);
        });
    } else {
        // フォールバックを使用
        fallbackCopy(copyText, copyButton);
    }
}

/**
 * フォールバックコピー機能
 */
function fallbackCopy(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        button.textContent = '✅ コピー完了';
    } catch (err) {
        button.textContent = '⚠️ 失敗';
    }
    
    document.body.removeChild(textarea);
    setTimeout(() => { button.textContent = '📋 コピー'; }, 1200);
}
