// qaRenderer.js - 統一されたQ&A表示機能

import { processArticleReferences, processBlankFillText } from './articleProcessor.js';
import { QAStatusSystem } from './qaStatusSystem.js';
import { getRankColor } from './rankColors.js';

// QAStatusSystemのインスタンス（既存のものを使用）
const qaStatusSystem = window.qaStatusSystem || new QAStatusSystem();

function renderFillDrillSummary(fillDrill, blankCount) {
    const cleared = new Set(Array.isArray(fillDrill?.clearedLevels) ? fillDrill.clearedLevels : []);
    const chips = [1, 2, 3].map(level => {
        const isDone = cleared.has(level);
        const base = 'px-2 py-0.5 rounded-full border text-xs font-semibold';
        const done = 'bg-green-100 text-green-700 border-green-200';
        const pending = 'bg-gray-100 text-gray-500 border-gray-200';
        return `<span class="${base} ${isDone ? done : pending}" data-level-chip="${level}">Lv${level}</span>`;
    }).join('');

    // チップのみを返す（ラッパーなし）
    return `<div class="flex gap-1 ml-auto">${chips}</div>`;
}

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

    const blankCount = (qa.answer?.match(/\{\{[^}]+\}\}/g) || []).length;

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

    // 表示用フィールドを取得（homePage.jsで設定される）
    const displayCategory = qa.displayCategory || '';
    const displaySubcategory = qa.displaySubcategory || '';
    const displayQaNum = qa.displayQaNum || qa.qaId || String(qa.id || '');

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

    const fillSummaryHtml = renderFillDrillSummary(qa.fillDrill, blankCount);

    // ★★★ Q&A JSONからのQ&Aにはスタンドアロンデータを埋め込む ★★★
    const isStandaloneQA = moduleId && moduleId.startsWith('qa-json/');
    const standaloneDataAttr = isStandaloneQA
        ? `data-standalone-qa='${JSON.stringify({
            id: qa.id,
            question: qa.question,
            answer: qa.answer,
            rank: qa.rank,
            subject: qa.subject,
            subcategoryName: qa.subcategoryName,
            fullId: qa.fullId,
            fillDrill: qa.fillDrill || {}
        }).replace(/'/g, "&#39;")}'`
        : '';

    // バッジのHTML生成（表示フィールドがある場合のみ表示、幅は内容に合わせて動的）
    const categoryBadge = displayCategory ? `<span class="qa-id-badge inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">${displayCategory}</span>` : '';
    const subcategoryBadge = displaySubcategory ? `<span class="qa-id-badge inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">${displaySubcategory}</span>` : '';
    const qaNumBadge = `<span class="qa-id-badge inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">${displayQaNum}</span>`;

    return `<div class="p-4 bg-white rounded-lg shadow border flex flex-col gap-2 qa-item" data-qa-id="${qaId}" data-module-id="${moduleId}" data-qa-index="${index}">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
                ${rankBadge}
                ${categoryBadge}
                ${subcategoryBadge}
                ${qaNumBadge}
                <span class="qa-question-text ml-2">${questionHtml}</span>
            </div>
            <div class="qa-status-buttons flex-shrink-0">${statusButtons}</div>
        </div>
        <div class="ml-8">
            <div class="flex gap-2 mb-1 items-center">
                <button class="toggle-answer-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold px-2 py-1 rounded text-xs" data-target="${answerId}">答えを表示</button>
                <button class="copy-qa-btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-2 py-1 rounded text-xs" data-qa-id="${qaId}" title="問題文と解答をコピー">📋 コピー</button>
                <button class="explanation-btn bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold px-2 py-1 rounded text-xs" 
                    data-qa-id="${qa._qaId || qa.qaId || (String(qaId).includes('-') ? String(qaId).split('-').pop() : qaId)}" 
                    data-subject="${qa.subject || ''}" 
                    data-subcategory="${qa.subcategoryId || qa._subcategoryId || (String(qaId).includes('-') ? String(qaId).split('-')[0] : '')}"
                    data-question="${(qa.question || '').substring(0, 50).replace(/"/g, '&quot;')}"
                    title="解説を表示/編集">📖 解説</button>
                ${fillSummaryHtml}
            </div>

            <span id="${answerId}" class="hidden">${answerHtml}</span>
            <div class="qa-fill-drill mt-3 border border-dashed border-slate-200 rounded-lg" data-qa-id="${qaId}" data-module-id="${moduleId}" data-relative-path="${moduleId}" data-qa-index="${index}" ${standaloneDataAttr}></div>
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
 * @param {string} options.extraHeaderHtml - ヘッダーに追加するHTML（表示件数セレクターなど）
 * @returns {Promise<string>} HTML文字列
 */
export async function renderQAList(options) {
    const {
        qaList,
        moduleId,
        showModuleLink = false,
        title = 'Q&Aリスト',
        idPrefix = 'qa',
        extraHeaderHtml = ''
    } = options;

    if (!qaList || qaList.length === 0) {
        return `<div class="max-w-4xl mx-auto p-6">
            <h2 class="text-2xl font-bold mb-6 text-center">${title}</h2>
            <div class="text-center text-gray-500">Q&Aがありません</div>
        </div>`;
    }

    // Q&Aデータを保存して後でコピーボタンで使用
    // 形式: 「科目名 + サブカテゴリ番号 + "-" + Q&A番号」（例: 商法1-1）
    const qaDataForCopy = qaList.map((qa, index) => {
        // fullId形式: "科目名.サブカテゴリID-Q&A番号" (例: "商法.1-1")
        // これを "商法1-1" 形式に変換
        let displayId;
        if (qa.fullId) {
            // "商法.1-1" → "商法1-1" (ドットを削除)
            displayId = qa.fullId.replace('.', '');
        } else {
            // fallback: subject + subcategoryId-id
            const subject = qa.subject || '';
            displayId = `${subject}${qa.subcategoryId || ''}-${qa.id || (index + 1)}`;
        }
        return {
            displayId: displayId,
            rank: qa.rank || 'C',  // ランクを追加
            question: qa.question || '',
            answer: (qa.answer || '').replace(/\{\{([^}]+)\}\}/g, '$1') // {{}} を除去して中身だけ表示
        };
    });

    // タイトルがある場合とない場合でヘッダーの構成を変える
    const titleHtml = title ? `<h2 class="text-2xl font-bold text-center flex-grow">${title}</h2>` : '';

    let html = `<div class="max-w-4xl mx-auto p-6">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-6">
            ${extraHeaderHtml}
            ${titleHtml}
            <div class="flex items-center gap-2">
                <a href="/pages/qa-manager.html" class="bg-gray-500 hover:bg-gray-600 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-all shadow-md hover:shadow-lg" title="Q&A管理画面">
                    ⚙️ 管理
                </a>
                <button id="copy-all-qa-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg" title="表示されている全Q&Aをコピー">
                    📋 全${qaList.length}問をコピー
                </button>
            </div>
        </div>
        <div class="space-y-6" id="qa-list-container" data-qa-copy='${JSON.stringify(qaDataForCopy).replace(/'/g, "&#39;")}'>`;


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
        btn.addEventListener('click', function () {
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
        btn.addEventListener('click', function () {
            console.log('ヒントボタンがクリックされました');
            const targetId = this.dataset.target;
            const answerElement = document.getElementById(targetId);
            toggleHintDisplay(answerElement, this);
        });
    });

    // コピーボタンの処理
    container.querySelectorAll('.copy-qa-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const qaId = this.dataset.qaId;
            const qaContainer = this.closest('.qa-item');
            copyQAContent(qaContainer, this, qaId);
        });
    });

    // ★★★ 全Q&Aコピーボタンの処理 ★★★
    const copyAllBtn = container.querySelector('#copy-all-qa-btn');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', function () {
            copyAllQAContent(container, this);
        });
    }

    // モジュールリンクのクリックハンドラー
    container.querySelectorAll('.module-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.stopPropagation();
            const moduleId = this.dataset.moduleId;
            if (moduleId) {
                window.location.hash = `#/case/${moduleId}`;
            }
        });
    });

    // ★★★ 解説ボタンの処理 ★★★
    container.querySelectorAll('.explanation-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const qaId = this.dataset.qaId;
            const subject = this.dataset.subject;
            const subcategory = this.dataset.subcategory;
            const question = this.dataset.question;
            openExplanationModal(subject, subcategory, qaId, question);
        });
    });

    if (window.qaFillDrillSystem && typeof window.qaFillDrillSystem.mountAll === 'function') {
        window.qaFillDrillSystem.mountAll(container);
    }

    console.log('✅ Q&Aリストのイベントハンドラーを設定しました');
}

/**
 * 難易度クラスを取得
 * @param {string} rank - ランク文字列
 * @returns {Object} CSSクラス情報
 */
function getDifficultyClass(rank) {
    const rankUpper = (rank || '').replace(/ランク$/, '').replace(/\s/g, '').toUpperCase();

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
                            class="qa-status-btn px-2 py-1 text-xs font-bold transition-all duration-200 hover:opacity-80 ${isActive
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

    // Q&Aアイテムからデータを取得
    const qaItem = container.closest('.qa-item') || container;
    const moduleId = qaItem.dataset.moduleId || '';

    // 質問文を取得（表示されているテキストから）
    const questionElem = qaItem.querySelector('.qa-item span:not(.font-bold):not(.inline-block)') ||
        qaItem.querySelector('.qa-question-text');
    if (questionElem) {
        questionText = questionElem.textContent || '';
    }

    // 回答文を取得
    const answerElem = qaItem.querySelector('[id*="answer"]') ||
        qaItem.querySelector('.qa-answer-content');
    if (answerElem) {
        // 穴埋め部分のdata-answer属性から正解を取得
        let fullAnswerText = answerElem.textContent || '';
        const blankSpans = answerElem.querySelectorAll('span[data-answer]');

        blankSpans.forEach(span => {
            const originalText = span.dataset.answer || span.dataset.displayContent || '';
            if (originalText) {
                const currentText = span.textContent;
                fullAnswerText = fullAnswerText.replace(currentText, originalText);
            }
        });

        // 「A：」を除去
        answerText = fullAnswerText.replace(/^A：/, '').replace(/^解答：/, '').trim();
    }

    // 穴埋め用のアンダースコアのみ除去（括弧は保持）
    questionText = questionText.replace(/[＿_]+/g, '').trim();
    answerText = answerText.replace(/[＿_]+/g, '').trim();

    // displayIdを取得（moduleIdがqa-json/で始まる場合はfullId形式を使用）
    let displayId = qaId;
    if (moduleId && moduleId.startsWith('qa-json/')) {
        // スタンドアロンQ&A: fullId形式（例: 刑法.4.43）
        const standaloneData = qaItem.querySelector('[data-standalone-qa]');
        if (standaloneData) {
            try {
                const data = JSON.parse(standaloneData.dataset.standaloneQa);
                if (data.fullId) {
                    displayId = data.fullId;
                }
            } catch (e) { }
        }
    }

    // 新形式: "Q刑法.4.43\n質問文\nA：回答文"
    const copyText = `Q${displayId}\n${questionText}\nA：${answerText}`;

    // クリップボードにコピー
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText).then(() => {
            copyButton.textContent = '✅ コピー完了';
            setTimeout(() => { copyButton.textContent = '📋 コピー'; }, 1200);
        }).catch(() => {
            fallbackCopy(copyText, copyButton);
        });
    } else {
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

/**
 * 全Q&Aをクリップボードにコピー
 * @param {HTMLElement} container - Q&Aリストのコンテナ
 * @param {HTMLElement} copyButton - コピーボタン
 */
function copyAllQAContent(container, copyButton) {
    const originalText = copyButton.textContent;

    // data-qa-copy属性からQ&Aデータを取得
    const qaListContainer = container.querySelector('#qa-list-container');
    if (!qaListContainer || !qaListContainer.dataset.qaCopy) {
        copyButton.textContent = '⚠️ データなし';
        setTimeout(() => { copyButton.textContent = originalText; }, 1500);
        return;
    }

    try {
        const qaData = JSON.parse(qaListContainer.dataset.qaCopy);

        // 指定の形式でテキストを生成
        // "Q刑法.4.43\n質問文\nA：回答文\n\nQ刑法.4.44\n..."
        const copyText = qaData.map(qa => {
            return `Q${qa.displayId}\n${qa.question}\nA：${qa.answer}`;
        }).join('\n\n');

        // クリップボードにコピー
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(copyText).then(() => {
                copyButton.textContent = `✅ ${qaData.length}問コピー完了！`;
                copyButton.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
                copyButton.classList.add('bg-green-500');
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.classList.remove('bg-green-500');
                    copyButton.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
                }, 2000);
            }).catch(() => {
                // フォールバック
                fallbackCopyAll(copyText, copyButton, originalText, qaData.length);
            });
        } else {
            fallbackCopyAll(copyText, copyButton, originalText, qaData.length);
        }
    } catch (err) {
        console.error('Q&Aコピーエラー:', err);
        copyButton.textContent = '⚠️ エラー';
        setTimeout(() => { copyButton.textContent = originalText; }, 1500);
    }
}

/**
 * フォールバック全コピー機能
 */
function fallbackCopyAll(text, button, originalText, count) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        button.textContent = `✅ ${count}問コピー完了！`;
        button.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        button.classList.add('bg-green-500');
    } catch (err) {
        button.textContent = '⚠️ 失敗';
    }

    document.body.removeChild(textarea);
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
        button.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
    }, 2000);
}

/**
 * 解説モーダルを開く
 * @param {string} subject - 科目名
 * @param {string} subcategory - サブカテゴリID
 * @param {string} qaId - Q&A ID
 * @param {string} questionPreview - 問題文プレビュー
 */
async function openExplanationModal(subject, subcategory, qaId, questionPreview) {
    // 必須パラメータチェック
    if (!subject || !subcategory || !qaId) {
        console.warn('⚠️ 解説編集に必要な情報が不足しています:', { subject, subcategory, qaId });
        alert('解説編集に必要な情報が不足しています。\n（科目・サブカテゴリ・Q&A IDが必要です）');
        return;
    }

    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('explanation-modal');
    if (existingModal) existingModal.remove();

    // モーダルHTML作成
    const modalHtml = `
        <div id="explanation-modal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">📖 解説編集</h3>
                        <p class="text-xs text-gray-500">${subject} ${subcategory}-${qaId}: ${questionPreview || ''}...</p>
                    </div>
                    <button id="close-explanation-modal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div class="p-4 flex-1 overflow-auto">
                    <div id="explanation-loading" class="text-center py-8 text-gray-500">
                        読み込み中...
                    </div>
                    <textarea id="explanation-textarea" class="hidden w-full h-64 p-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm" placeholder="このQ&Aの解説を入力してください..."></textarea>
                    <p class="mt-2 text-xs text-gray-500">※ 解説はAI添削時に参照されます。条文の詳しい説明、判例のポイント、論点の補足などを記載してください。</p>
                </div>
                <div class="flex gap-2 p-4 border-t border-gray-200">
                    <button id="cancel-explanation" class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">キャンセル</button>
                    <button id="save-explanation" class="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors">💾 保存</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('explanation-modal');
    const textarea = document.getElementById('explanation-textarea');
    const loadingEl = document.getElementById('explanation-loading');
    const closeBtn = document.getElementById('close-explanation-modal');
    const cancelBtn = document.getElementById('cancel-explanation');
    const saveBtn = document.getElementById('save-explanation');

    // ESCキーで閉じる
    const escHandler = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', escHandler);

    const closeModal = () => {
        document.removeEventListener('keydown', escHandler);
        modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // 解説を取得
    try {
        const res = await fetch(`/api/qa/explanation?subject=${encodeURIComponent(subject)}&subcategory=${encodeURIComponent(subcategory)}&qaId=${encodeURIComponent(qaId)}`);
        const data = await res.json();

        if (data.success) {
            textarea.value = data.explanation || '';
            loadingEl.classList.add('hidden');
            textarea.classList.remove('hidden');
            textarea.focus();
        } else {
            loadingEl.textContent = `エラー: ${data.message}`;
        }
    } catch (err) {
        console.error('解説取得エラー:', err);
        loadingEl.textContent = 'エラーが発生しました';
    }

    // 保存ボタン
    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.textContent = '保存中...';

        try {
            const res = await fetch('/api/qa/explanation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    subcategory,
                    qaId,
                    explanation: textarea.value
                })
            });
            const data = await res.json();

            if (data.success) {
                saveBtn.textContent = '✅ 保存完了';
                setTimeout(closeModal, 800);
            } else {
                alert(`保存エラー: ${data.message}`);
                saveBtn.disabled = false;
                saveBtn.textContent = '💾 保存';
            }
        } catch (err) {
            console.error('解説保存エラー:', err);
            alert('保存中にエラーが発生しました');
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 保存';
        }
    });
}

// グローバルに公開
window.openExplanationModal = openExplanationModal;
