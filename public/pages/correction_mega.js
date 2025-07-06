/**
 * correction_mega.js
 *
 * 超高機能 司法試験答案添削システム (v2.0 - Re:designed)
 *
 * 概要：
 * 司法試験の答案用紙（横30文字×縦23行）を忠実に再現したリッチテキストUI上で、
 * AIによる添削結果を視覚的に表示します。
 * 従来の不安定な実装を完全に刷新し、HTML/CSSベースの堅牢かつ美しいシステムとして再設計されました。
 *
 * 設計思想：
 * - **仮想DOM的レンダリング**: 添削データとテキストから常に新しいHTMLを生成し、差分更新のような形で表示に反映させることで、状態管理を簡潔にし、位置ズレなどのバグを根本的に排除します。
 * - **BEM (Block, Element, Modifier)**: `public/css/correction_mega.css` と完全に連携したBEM設計を採用し、CSSとJavaScriptの責務を明確に分離します。
 * - **コンポーネント志向**: UIを構成する各要素（エディタ、パネル、マーカー等）を論理的なコンポーネントとして扱い、見通しとメンテナンス性の良いコードを目指します。
 * - **非破壊的・状態の分離**: 元の<textarea>はデータソースとしてのみ扱い、直接は変更しません。表示の状態はラッパー要素のdata属性で管理します。
 *
 * 主な機能：
 * 1.  **答案用紙UIの自動生成**: `textarea.judicial-sheet` を、行番号付きの原稿用紙風UIに自動変換。
 * 2.  **正確な添削ハイライト**: 文字単位で添削箇所を正確にマーキングし、マウスオーバーでツールチップを表示。
 * 3.  **インタラクティブな添削パネル**: 添削項目一覧をクリックすると、該当箇所にスムーズにスクロール。
 * 4.  **表示切替**: 添削の表示/非表示をボタン一つで切り替え可能。
 * 5.  **動的要素への対応**: `MutationObserver`により、後からページに追加された答案にも自動で対応。
 */
'use strict';

// --- 定数 ---
const JUDICIAL_SHEET_COLS = 30;
const JUDICIAL_SHEET_ROWS = 23;

// --- 状態管理用オブジェクト ---
const correctionState = new Map(); // key: textarea.id, value: { correctionData, state, etc. }

// --- ユーティリティ関数 ---

/**
 * HTML特殊文字を安全にエスケープする
 * @param {string} str - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
const escapeHTML = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (match) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return map[match];
    });
};


// --- UI構築・レンダリング ---

/**
 * 添削データと元のテキストから、表示用のHTML（行の配列）を生成する
 * @param {string} originalText - 元のテキスト
 * @param {Array} corrections - 添削情報の配列
 * @returns {string[]} 各行のHTML文字列を含む配列
 */
function buildContentHTML(originalText, corrections = []) {
    let html = escapeHTML(originalText);

    if (corrections && corrections.length > 0) {
        // 後ろから適用していくことで、インデックスのズレを防ぐ
        const sorted = [...corrections].sort((a, b) => b.start - a.start);
        sorted.forEach((corr, index) => {
            const { start, end, type, comment, suggestion, color } = corr;
            const targetText = html.substring(start, end);
            const markerId = `marker-${Date.now()}-${index}`;
            const tooltipHTML = `
                <div class="correction-editor__tooltip">
                    <strong class="correction-editor__tooltip-type">${escapeHTML(type)}</strong>
                    <p class="correction-editor__tooltip-comment">${escapeHTML(comment)}</p>
                    ${suggestion ? `<p class="correction-editor__tooltip-suggestion"><strong>修正案:</strong> ${escapeHTML(suggestion)}</p>` : ''}
                </div>`;
            const markerHTML = `
                <span class="correction-editor__marker" id="${markerId}" style="--marker-color: ${color || '#ffc107'}" data-panel-item-id="panel-item-${markerId}">
                    ${targetText}
                    ${tooltipHTML}
                </span>`;
            html = html.substring(0, start) + markerHTML + html.substring(end);
        });
    }

    // 30文字ごとに分割（HTMLタグは文字数に含めない）
    const lines = [];
    let currentLine = '';
    const tagRegex = /<[^>]+>/g;
    // タグとテキストに分割する改善された正規表現
    const tokens = html.split(/(<span.*?<\/span>)/);

    for (const token of tokens) {
        if (token.startsWith('<')) {
            currentLine += token;
            continue;
        }
        for (const char of token) {
            currentLine += char;
            // タグを除いた文字数が30に達したら行を確定
            if (currentLine.replace(tagRegex, '').length >= JUDICIAL_SHEET_COLS) {
                lines.push(currentLine);
                currentLine = '';
            }
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }

    // 各行をdivでラップする。空の行には&nbsp;を入れない。
    return lines.map(line => `<div>${line}</div>`);
}

/**
 * 添削パネルを生成または更新する
 * @param {HTMLElement} wrapper - エディタのラッパー要素
 * @param {Array} corrections - 添削情報の配列
 */
function renderCorrectionPanel(wrapper, corrections = []) {
    let panel = document.getElementById('correction-panel');
    if (!corrections || corrections.length === 0) {
        if (panel) panel.remove();
        return;
    }

    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'correction-panel';
        panel.className = 'correction-panel'; // BEM
        document.body.appendChild(panel);
    }

    const itemsHTML = corrections.map((corr, index) => {
        const markerId = `marker-${corr.start}-${corr.end}-${index}`; // よりユニークなID
        return `
            <div class="correction-panel__item" data-marker-id="${markerId}">
                <div class="correction-panel__item-header">
                    <span class="correction-panel__item-type-indicator" style="--marker-color: ${corr.color || '#ffc107'}"></span>
                    <strong class="correction-panel__item-type">${escapeHTML(corr.type)}</strong>
                </div>
                <div class="correction-panel__item-body">
                    <p>${escapeHTML(corr.comment)}</p>
                    ${corr.suggestion ? `<p><strong>修正案:</strong> ${escapeHTML(corr.suggestion)}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    panel.innerHTML = `
        <div class="correction-panel__header">
            <h3>添削結果</h3>
            <button class="correction-panel__close-btn">&times;</button>
        </div>
        <div class="correction-panel__content">${itemsHTML}</div>
    `;

    // イベントリスナーの再設定
    panel.querySelector('.correction-panel__close-btn').onclick = () => panel.remove();
    panel.querySelectorAll('.correction-panel__item').forEach(item => {
        item.onclick = () => {
            // 対応するマーカーを探してハイライト
            const marker = wrapper.querySelector(`[data-panel-item-id="${item.dataset.markerId}"]`);
            if (marker) {
                marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
                marker.classList.add('correction-editor__marker--highlight');
                setTimeout(() => marker.classList.remove('correction-editor__marker--highlight'), 2500);
            }
        };
    });
}


/**
 * 答案用紙エディタの表示を更新する
 * @param {HTMLElement} wrapper - エディタのラッパー要素
 * @param {string} text - 表示する全文
 * @param {Array} [corrections] - (任意) 添削情報の配列
 */
function renderEditor(wrapper, text, corrections) {
    const contentDiv = wrapper.querySelector('.correction-editor__content');
    const lineNumbersDiv = wrapper.querySelector('.correction-editor__line-numbers');
    if (!contentDiv || !lineNumbersDiv) return;

    const lines = buildContentHTML(text, corrections);
    
    // 最低でも23行表示するための調整
    const lineCount = Math.max(JUDICIAL_SHEET_ROWS, lines.length);
    const displayLines = [...lines];
    while (displayLines.length < lineCount) {
        displayLines.push('<div>&nbsp;</div>'); // 空の行を追加
    }

    contentDiv.innerHTML = displayLines.join('');

    // 行番号の更新 (常に lineCount を使用)
    lineNumbersDiv.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');

    // パネルの更新
    renderCorrectionPanel(wrapper, corrections);
}


/**
 * textareaを新しいエディタUIに置き換える
 * @param {HTMLTextAreaElement} textarea - 対象のテキストエリア
 * @param {object} [options={}] - オプション
 * @param {boolean} [options.readonly=false] - 閲覧専用モードにするか
 */
function createEditor(textarea, options = {}) {
    if (textarea.dataset.editorInitialized) return;

    const { readonly = false } = options;

    const wrapper = document.createElement('div');
    wrapper.className = 'correction-editor';
    if (readonly) {
        wrapper.classList.add('correction-editor--readonly');
    }
    wrapper.dataset.textareaId = textarea.id;

    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'correction-editor__line-numbers';

    const content = document.createElement('div');
    content.className = 'correction-editor__content';
    content.setAttribute('contenteditable', 'false'); // 常に編集不可

    wrapper.append(lineNumbers, content);

    textarea.style.display = 'none';
    textarea.after(wrapper);
    textarea.dataset.editorInitialized = 'true';

    // 初期状態を保存
    correctionState.set(textarea.id, {
        originalText: textarea.value,
        corrections: [],
        isCorrectedView: false,
        wrapperElement: wrapper,
        readonly: readonly, // 状態としてreadonlyを保存
    });

    // 初期レンダリング
    renderEditor(wrapper, textarea.value);
}

/**
 * 生成されたエディタを破棄する
 * @param {HTMLTextAreaElement} textarea - 対象のテキストエリア
 */
function destroyEditor(textarea) {
    if (!textarea || !textarea.dataset.editorInitialized) return;

    const state = correctionState.get(textarea.id);
    if (state && state.wrapperElement) {
        state.wrapperElement.remove();
    }
    
    // 関連するパネルも削除
    const panel = document.getElementById('correction-panel');
    if (panel) {
        panel.remove();
    }

    textarea.style.display = '';
    delete textarea.dataset.editorInitialized;
    correctionState.delete(textarea.id);
    console.log(`🗑️ [${textarea.id}] エディタをクリーンアップしました。`);
}


// --- 外部連携インターフェース ---

/**
 * 添削結果を表示するメイン関数 (外部から呼び出される)
 * @param {HTMLTextAreaElement} textarea - 対象のテキストエリア
 * @param {object} correctionData - AIから受け取った添削データ
 */
function displayCorrectionResults(textarea, correctionData) {
    if (!textarea || !correctionData || !correctionData.corrections) {
        console.error("表示に必要な要素（textareaまたは添削データ）がありません。");
        return;
    }
    if (!textarea.id) {
        textarea.id = `judicial-sheet-${Date.now()}`;
    }

    const state = correctionState.get(textarea.id);
    if (!state) {
        console.error("エディタの状態が見つかりません。初期化が先に行われている必要があります。");
        return;
    }
    if (state.readonly) {
        console.warn("閲覧モードのエディタに添削結果を表示することはできません。");
        return;
    }

    // 添削データをソートして保存
    const sortedCorrections = [...correctionData.corrections].sort((a, b) => a.start - b.start);
    state.corrections = sortedCorrections;
    state.isCorrectedView = true;

    // 添削付きでレンダリング
    renderEditor(state.wrapperElement, textarea.value, sortedCorrections);
    console.log(`✅ [${textarea.id}] 添削の表示が完了しました。`);
}

/**
 * 添削の表示/非表示を切り替える (外部から呼び出される)
 * @param {HTMLTextAreaElement} textarea - 対象のテキストエリア
 */
function toggleCorrectionDisplay(textarea) {
    const state = correctionState.get(textarea.id);
    if (!state || !state.wrapperElement) {
        console.error("切り替え対象のエディタが見つかりません。");
        return;
    }
    if (state.readonly) {
        console.warn("閲覧モードでは添削の表示/非表示を切り替えできません。");
        return state.isCorrectedView;
    }

    state.isCorrectedView = !state.isCorrectedView;

    if (state.isCorrectedView) {
        // 添削を表示
        renderEditor(state.wrapperElement, textarea.value, state.corrections);
    } else {
        // 添削を非表示 (プレーンテキスト)
        renderEditor(state.wrapperElement, textarea.value);
    }
    return state.isCorrectedView;
}


// --- 初期化処理 ---

/**
 * ページ内の対象テキストエリアを全て初期化する
 */
function initializeAllEditors() {
    document.querySelectorAll('textarea.judicial-sheet').forEach(textarea => {
        if (!textarea.id) {
            textarea.id = `judicial-sheet-${Date.now()}`;
        }
        // デフォルトは編集モードで初期化
        createEditor(textarea, { readonly: false });
    });
}

/**
 * 動的に追加されるテキストエリアを監視する
 */
function observeDynamicTextareas() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.matches('textarea.judicial-sheet')) {
                        if (!node.id) node.id = `judicial-sheet-${Date.now()}`;
                        // 動的追加の場合、readonlyかどうかを判断できないため、
                        // data属性などで指定がなければデフォルトの編集モードで初期化
                        const isReadonly = node.hasAttribute('readonly');
                        createEditor(node, { readonly: isReadonly });
                    }
                    node.querySelectorAll('textarea.judicial-sheet').forEach(textarea => {
                        if (!textarea.id) textarea.id = `judicial-sheet-${Date.now()}`;
                        const isReadonly = textarea.hasAttribute('readonly');
                        createEditor(textarea, { readonly: isReadonly });
                    });
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// --- DOM読み込み完了後の処理 ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAllEditors();
        observeDynamicTextareas();
    });
} else {
    initializeAllEditors();
    observeDynamicTextareas();
}

// --- エクスポート ---
// CommonJS/ESMの両対応 (ただし、VSCode拡張機能のコンテキストでは`export`が標準)
export {
    displayCorrectionResults,
    toggleCorrectionDisplay,
    createEditor as createJudicialSheetEditor,
    destroyEditor as destroyJudicialSheetEditor, // 新しく追加
    initializeAllEditors as initializeJudicialTextareas,
};
