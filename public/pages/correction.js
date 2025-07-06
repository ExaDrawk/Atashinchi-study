// correction.js - 新生添削システム（完全リビルド版）
// 23×30の司法試験答案用紙専用・シンプル確実動作

console.log('🔄 新生添削システム初期化開始');

/**
 * 🎯 メイン添削実行関数（新システム）
 */
export async function performAICorrection(answerText, subProblem, quizIndex, subIndex) {
    console.log('🤖 新生AI添削開始:', { answerLength: answerText?.length, quizIndex, subIndex });
    
    try {
        // 1. プロンプト生成
        const prompt = createSimpleCorrectionPrompt(answerText, subProblem);
        console.log('📝 プロンプト生成完了:', prompt.substring(0, 200) + '...');
        
        // 2. API呼び出し
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: prompt,
                systemRole: 'legal_essay_corrector'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🔍 API応答:', { hasReply: !!result.reply, replyLength: result.reply?.length });
        
        // 3. 応答解析
        const correctionData = parseSimpleCorrection(result.reply, answerText);
        
        if (!correctionData) {
            console.warn('⚠️ 応答解析失敗、フォールバック使用');
            return createFallbackCorrection(answerText);
        }
        
        console.log('✅ 新生AI添削完了:', correctionData);
        return correctionData;
        
    } catch (error) {
        console.error('❌ 新生AI添削エラー:', error);
        return createFallbackCorrection(answerText);
    }
}

/**
 * 🎯 シンプルプロンプト生成
 */
function createSimpleCorrectionPrompt(answerText, subProblem) {
    const problem = subProblem?.problem || '司法試験論文式の問題です。';
    const modelAnswer = subProblem?.modelAnswer || '模範解答が設定されていません。';
    
    return `# 司法試験論文添削

**問題**: ${problem.substring(0, 300)}

**模範解答**: ${modelAnswer.substring(0, 500)}

**学生答案**: ${answerText.substring(0, 800)}

以下のJSON形式で添削結果を返してください：

\`\`\`json
{
  "score": 75,
  "maxScore": 100,
  "overallComment": "全体的な評価コメント",
  "corrections": [
    {
      "start": 0,
      "end": 10,
      "type": "essential",
      "comment": "必須論点の指摘"
    }
  ]
}
\`\`\`

**添削タイプ**:
- essential: 必須論点（赤）
- bonus: 加点要素（青）
- good: 良い点（緑）
- improve: 改善点（オレンジ）
- delete: 削除推奨（グレー）

文字位置は答案テキスト内の正確な位置を指定してください。`;
}

/**
 * 🎯 シンプル応答解析
 */
function parseSimpleCorrection(aiResponse, answerText) {
    console.log('🔍 応答解析開始:', { responseLength: aiResponse?.length });
    
    if (!aiResponse || typeof aiResponse !== 'string') {
        console.error('❌ 無効な応答:', typeof aiResponse);
        return null;
    }
    
    try {
        // JSON部分を抽出
        const jsonMatch = aiResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        let correctionData;
        
        if (jsonMatch) {
            correctionData = JSON.parse(jsonMatch[1]);
        } else {
            // JSON markupがない場合、全体を解析
            correctionData = JSON.parse(aiResponse);
        }
        
        // 必須フィールドの検証
        if (typeof correctionData.score !== 'number') {
            correctionData.score = 70;
        }
        if (!correctionData.maxScore) {
            correctionData.maxScore = 100;
        }
        if (!correctionData.overallComment) {
            correctionData.overallComment = '添削コメントを生成中です。';
        }
        if (!Array.isArray(correctionData.corrections)) {
            correctionData.corrections = [];
        }
        
        // 添削データの正規化
        correctionData.corrections = correctionData.corrections
            .filter(c => c && typeof c === 'object')
            .map(correction => ({
                start: Math.max(0, Math.min(correction.start || 0, answerText.length)),
                end: Math.max(0, Math.min(correction.end || correction.start || 0, answerText.length)),
                type: ['essential', 'bonus', 'good', 'improve', 'delete'].includes(correction.type) 
                      ? correction.type : 'improve',
                comment: correction.comment || '添削コメント'
            }))
            .filter(c => c.start < c.end && c.end <= answerText.length);
        
        console.log('✅ 応答解析成功:', {
            score: correctionData.score,
            correctionsCount: correctionData.corrections.length
        });
        
        return correctionData;
        
    } catch (error) {
        console.error('❌ JSON解析エラー:', error);
        return null;
    }
}

/**
 * 🎯 フォールバック添削データ生成
 */
function createFallbackCorrection(answerText) {
    console.log('🔄 フォールバック添削データ生成');
    
    return {
        score: 65,
        maxScore: 100,
        overallComment: 'AI添削システムが一時的に利用できません。基本的な評価を表示しています。',
        corrections: [
            {
                start: 0,
                end: Math.min(20, answerText.length),
                type: 'good',
                comment: '論述の開始部分です'
            },
            {
                start: Math.max(0, answerText.length - 20),
                end: answerText.length,
                type: 'improve',
                comment: '結論部分の充実をお勧めします'
            }
        ]
    };
}

/**
 * 🎯 新生添削表示システム（23×30対応）
 */
export function applyCorrectionMarkupForJudicialSheet(correctionData, textareaId) {
    console.log('🎨 新生添削表示開始:', { correctionsCount: correctionData?.corrections?.length });
    
    const textarea = document.getElementById('judicial-answer-textarea');
    if (!textarea) {
        console.error('❌ テキストエリアが見つかりません');
        return;
    }
    
    // 既存の添削を完全クリア
    clearJudicialCorrectionMarks();
    
    try {
        // 新しいオーバーレイシステムで表示
        createNewCorrectionOverlay(textarea, correctionData);
        console.log('✅ 新生添削表示完了');
        
    } catch (error) {
        console.error('❌ 新生添削表示エラー:', error);
    }
}

/**
 * 🎯 新しい添削オーバーレイ作成（完全同期版）
 */
function createNewCorrectionOverlay(textarea, correctionData) {
    console.log('🎨 新オーバーレイ作成開始（完全同期版）');
    
    const parent = textarea.parentElement;
    if (!parent) {
        console.error('❌ 親要素が見つかりません');
        return;
    }
    
    // 既存のオーバーレイを削除
    const existingOverlay = parent.querySelector('.new-correction-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // テキストエリアの計算されたスタイルを取得
    const computedStyle = window.getComputedStyle(textarea);
    const textareaRect = textarea.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    
    // オーバーレイ要素を作成
    const overlay = document.createElement('div');
    overlay.className = 'new-correction-overlay';
    
    // テキストエリアと完全に同期したスタイルを設定
    overlay.style.cssText = `
        position: absolute;
        top: ${textarea.offsetTop}px;
        left: ${textarea.offsetLeft}px;
        width: ${textarea.offsetWidth}px;
        height: ${textarea.offsetHeight}px;
        font-family: ${computedStyle.fontFamily} !important;
        font-size: ${computedStyle.fontSize} !important;
        line-height: ${computedStyle.lineHeight} !important;
        font-weight: ${computedStyle.fontWeight} !important;
        font-style: ${computedStyle.fontStyle} !important;
        text-transform: none !important;
        text-decoration: none !important;
        padding: ${computedStyle.paddingTop} ${computedStyle.paddingRight} ${computedStyle.paddingBottom} ${computedStyle.paddingLeft};
        margin: 0;
        border: ${computedStyle.borderWidth} ${computedStyle.borderStyle} transparent;
        background: transparent;
        color: transparent;
        white-space: ${computedStyle.whiteSpace};
        word-wrap: ${computedStyle.wordWrap};
        word-break: ${computedStyle.wordBreak};
        overflow: hidden;
        z-index: 15;
        pointer-events: none;
        letter-spacing: ${computedStyle.letterSpacing};
        box-sizing: ${computedStyle.boxSizing};
        text-align: ${computedStyle.textAlign};
        text-indent: ${computedStyle.textIndent};
        resize: none;
    `;
    
    // 添削マークアップを適用したテキストを生成
    const markedText = applyCorrectionsToText(textarea.value, correctionData.corrections || []);
    overlay.innerHTML = markedText;
    
    // 親要素に追加
    parent.style.position = 'relative';
    parent.appendChild(overlay);
    
    // テキストエリアの文字を完全に透明にして二重表示を防ぐ
    // ただし、テキストエリア自体は操作可能に保つ
    textarea.style.color = 'transparent';
    textarea.style.caretColor = 'black'; // カーソルは見えるように
    textarea.style.zIndex = '10';
    
    // テキストエリア以外の要素も操作可能に保つ（強化版）
    const container = textarea.closest('.judicial-answer-container') || 
                     textarea.closest('.answer-section') ||
                     textarea.closest('.main-container') ||
                     textarea.parentElement;
    if (container) {
        // コンテナ内の他の要素（ボタンなど）を操作可能に保つ
        const otherElements = container.querySelectorAll('button, select, input, a, [role="button"], .opinion-btn, .correction-btn, .nav-button, .tab-button, .mini-essay-tab');
        otherElements.forEach(element => {
            if (element !== textarea) {
                element.style.pointerEvents = 'auto';
                element.style.zIndex = '5000'; // より高いz-index
                element.style.position = 'relative';
            }
        });
        
        // 特に重要なボタンクラスは確実に操作可能にする
        const importantButtons = document.querySelectorAll('.opinion-btn, .correction-btn, .toggle-correction, .clear-correction, .tab-button, .mini-essay-tab, .case-navigation button');
        importantButtons.forEach(button => {
            button.style.pointerEvents = 'auto';
            button.style.zIndex = '5000';
            button.style.position = 'relative';
        });
    }
    
    // 全体のページ内でもナビゲーション要素を操作可能に保つ（強化版）
    const navigationElements = document.querySelectorAll('nav, header, .tab-button, .mini-essay-tab, .case-navigation, .main-container button, .tab-content button');
    navigationElements.forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.zIndex = '5000';
        element.style.position = 'relative';
    });
    
    // 全てのボタン要素を確実に操作可能にする
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        if (button !== textarea) {
            button.style.pointerEvents = 'auto';
            button.style.zIndex = '5000';
            button.style.position = 'relative';
        }
    });
    
    // ウィンドウリサイズ時の同期
    const resizeHandler = () => {
        updateOverlayPosition(overlay, textarea);
    };
    window.addEventListener('resize', resizeHandler);
    
    // 🎯 最適化されたスクロール同期（引っかかり解消・パフォーマンス重視）
    let scrollFrame = null;
    let syncInterval = null;
    
    const optimizedScrollHandler = () => {
        if (scrollFrame) {
            cancelAnimationFrame(scrollFrame);
        }
        
        scrollFrame = requestAnimationFrame(() => {
            if (overlay && textarea) {
                // 即座にスクロール位置を同期
                overlay.scrollTop = textarea.scrollTop;
                overlay.scrollLeft = textarea.scrollLeft;
            }
            scrollFrame = null;
        });
    };
    
    // 必要最小限のイベントで効率的な同期
    const events = ['scroll', 'input'];
    events.forEach(eventType => {
        textarea.addEventListener(eventType, optimizedScrollHandler, { passive: true });
    });
    
    // 背景同期（軽量版）
    syncInterval = setInterval(() => {
        if (overlay && textarea && document.body.contains(overlay)) {
            overlay.scrollTop = textarea.scrollTop;
            overlay.scrollLeft = textarea.scrollLeft;
        } else {
            clearInterval(syncInterval);
        }
    }, 200); // 頻度を下げて負荷軽減
    
    // ホイールイベント最適化（引っかかり防止）
    overlay.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 即座にスクロール
        textarea.scrollTop += e.deltaY;
        textarea.scrollLeft += e.deltaX;
        
        // 同期実行
        optimizedScrollHandler();
    }, { passive: false });
    
    // マウスドラッグでのスクロール対応
    let isDragging = false;
    overlay.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            optimizedScrollHandler();
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // オーバーレイにイベントハンドラーを保存（後で削除するため）
    overlay._resizeHandler = resizeHandler;
    overlay._scrollHandler = optimizedScrollHandler;
    
    console.log('✅ 新オーバーレイ作成完了（完全同期版）');
}

/**
 * 🎯 オーバーレイ位置更新（リサイズ・スクロール完全対応）
 */
function updateOverlayPosition(overlay, textarea) {
    if (!overlay || !textarea) return;
    
    const computedStyle = window.getComputedStyle(textarea);
    
    overlay.style.top = `${textarea.offsetTop}px`;
    overlay.style.left = `${textarea.offsetLeft}px`;
    overlay.style.width = `${textarea.offsetWidth}px`;
    overlay.style.height = `${textarea.offsetHeight}px`;
    overlay.style.fontSize = computedStyle.fontSize;
    overlay.style.lineHeight = computedStyle.lineHeight;
    overlay.style.padding = `${computedStyle.paddingTop} ${computedStyle.paddingRight} ${computedStyle.paddingBottom} ${computedStyle.paddingLeft}`;
    
    // 🔥 重要: スクロール位置も完全に同期
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
}

/**
 * 🎯 テキストに添削マークアップを適用（改良版）
 */
function applyCorrectionsToText(originalText, corrections) {
    console.log('🎨 テキストマークアップ開始:', { correctionsCount: corrections.length });
    
    if (!corrections || corrections.length === 0) {
        // 添削がない場合は元テキストをそのまま表示（文字色は黒）
        return `<span style="color: black;">${escapeHtml(originalText)}</span>`;
    }
    
    // 添削範囲をソート（重複排除も実施）
    const sortedCorrections = corrections
        .filter(c => c && c.start < c.end && c.end <= originalText.length)
        .sort((a, b) => a.start - b.start)
        .reduce((acc, current) => {
            // 重複する範囲を統合
            const last = acc[acc.length - 1];
            if (last && current.start <= last.end) {
                last.end = Math.max(last.end, current.end);
                last.comment += '; ' + current.comment;
                last.type = current.type; // 後の方の種類を採用
            } else {
                acc.push(current);
            }
            return acc;
        }, []);
    
    let result = '';
    let lastEnd = 0;
    
    for (const correction of sortedCorrections) {
        // 添削前のテキスト（通常の黒文字）
        const beforeText = originalText.slice(lastEnd, correction.start);
        if (beforeText) {
            result += `<span style="color: black;">${escapeHtml(beforeText)}</span>`;
        }
        
        // 添削部分（マークアップ適用）
        const correctionText = originalText.slice(correction.start, correction.end);
        const cssClass = getCorrectionCssClass(correction.type);
        const title = escapeHtml(correction.comment || '');
        
        result += `<span class="${cssClass}" title="${title}" style="color: black;">${escapeHtml(correctionText)}</span>`;
        
        lastEnd = correction.end;
    }
    
    // 残りのテキスト（通常の黒文字）
    const remainingText = originalText.slice(lastEnd);
    if (remainingText) {
        result += `<span style="color: black;">${escapeHtml(remainingText)}</span>`;
    }
    
    console.log('✅ テキストマークアップ完了');
    return result;
}

/**
 * 🎯 添削タイプに対応するCSSクラス
 */
function getCorrectionCssClass(type) {
    const classMap = {
        essential: 'correction-essential-new',
        bonus: 'correction-bonus-new',
        good: 'correction-good-new',
        improve: 'correction-improve-new',
        delete: 'correction-delete-new'
    };
    return classMap[type] || 'correction-improve-new';
}

/**
 * 🎯 HTMLエスケープ
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 🎯 添削結果表示
 */
export function displayCorrectionResults(correctionData, answerText) {
    console.log('📊 添削結果表示開始:', correctionData);
    
    // スコア表示
    const scoreDisplay = document.getElementById('score-display');
    const scoreNumber = document.getElementById('score-number');
    
    if (scoreDisplay && scoreNumber) {
        scoreNumber.textContent = `${correctionData.score}/${correctionData.maxScore || 100}`;
        scoreDisplay.style.display = 'block';
    }
    
    // 凡例表示
    const legend = document.getElementById('correction-legend');
    if (legend) {
        legend.style.display = 'flex';
    }
    
    // 総合コメント表示
    const overallComment = document.getElementById('overall-comment');
    const overallCommentText = document.getElementById('overall-comment-text');
    
    if (overallComment && overallCommentText && correctionData.overallComment) {
        overallCommentText.textContent = correctionData.overallComment;
        overallComment.style.display = 'block';
    }
    
    console.log('✅ 添削結果表示完了');
}

/**
 * 🎯 新生添削クリア機能（改良版）
 */
export function clearJudicialCorrectionMarks() {
    console.log('🧹 新生添削クリア開始');
    
    // 新しいオーバーレイを削除
    const newOverlays = document.querySelectorAll('.new-correction-overlay');
    newOverlays.forEach(overlay => {
        // リサイズハンドラーがあれば削除
        if (overlay._resizeHandler) {
            window.removeEventListener('resize', overlay._resizeHandler);
        }
        // スクロールハンドラーがあれば削除
        if (overlay._scrollHandler) {
            const textarea = document.getElementById('judicial-answer-textarea') || 
                           document.querySelector('textarea[id*="initial-input"]');
            if (textarea) {
                textarea.removeEventListener('scroll', overlay._scrollHandler);
            }
        }
        overlay.remove();
    });
    
    // 古いオーバーレイも削除
    const oldOverlays = document.querySelectorAll('.judicial-text-overlay, .correction-overlay, .text-overlay');
    oldOverlays.forEach(overlay => overlay.remove());
    
    // テキストエリアをリセット（元の見た目に戻す）
    const textarea = document.getElementById('judicial-answer-textarea');
    if (textarea) {
        textarea.style.color = 'black';
        textarea.style.caretColor = 'black';
        textarea.style.zIndex = '2';
    }
    
    // 他の要素のスタイルもリセット
    const allElements = document.querySelectorAll('button, select, input, a, [role="button"], .opinion-btn, .correction-btn, nav, header, .tab-button, .mini-essay-tab, .case-navigation');
    allElements.forEach(element => {
        if (element.style.zIndex && parseInt(element.style.zIndex) > 10) {
            element.style.zIndex = '';
            element.style.position = '';
            element.style.pointerEvents = '';
        }
    });
    
    // UI要素を隠す
    const scoreDisplay = document.getElementById('score-display');
    const legend = document.getElementById('correction-legend');
    const overallComment = document.getElementById('overall-comment');
    
    if (scoreDisplay) scoreDisplay.style.display = 'none';
    if (legend) legend.style.display = 'none';
    if (overallComment) overallComment.style.display = 'none';
    
    console.log('✅ 新生添削クリア完了');
}

/**
 * 🎯 従来システム互換関数
 */
export function clearCorrectionMarks() {
    clearJudicialCorrectionMarks();
}

export function applyCorrectionMarkupWithAnimation(correctionData, answerText) {
    applyCorrectionMarkupForJudicialSheet(correctionData);
}

/**
 * 🎯 添削表示の切り替え機能
 */
export function toggleCorrectionDisplay() {
    console.log('🔄 添削表示切り替え開始');
    
    const textarea = document.getElementById('judicial-answer-textarea');
    const overlay = document.querySelector('.new-correction-overlay');
    
    if (!textarea) {
        console.error('❌ テキストエリアが見つかりません');
        return;
    }
    
    if (overlay) {
        // 添削表示中 → 通常表示に切り替え
        const isVisible = overlay.style.display !== 'none';
        
        if (isVisible) {
            // 添削を非表示にして通常の文字を表示
            overlay.style.display = 'none';
            textarea.style.color = 'black';
            textarea.style.caretColor = 'black';
            console.log('📝 通常表示モードに切り替え');
        } else {
            // 添削を表示して元の文字を透明に
            overlay.style.display = 'block';
            textarea.style.color = 'transparent';
            textarea.style.caretColor = 'black';
            console.log('🎨 添削表示モードに切り替え');
        }
        
        return !isVisible; // 新しい状態を返す（true=添削表示中、false=通常表示中）
    }
    
    console.warn('⚠️ 添削オーバーレイが見つかりません');
    return false;
}

/**
 * 🎯 添削表示状態の確認
 */
export function isCorrectionDisplayed() {
    const overlay = document.querySelector('.new-correction-overlay');
    return overlay && overlay.style.display !== 'none';
}

/**
 * 🎯 添削表示の強制ON
 */
export function showCorrectionDisplay() {
    const textarea = document.getElementById('judicial-answer-textarea');
    const overlay = document.querySelector('.new-correction-overlay');
    
    if (textarea && overlay) {
        overlay.style.display = 'block';
        textarea.style.color = 'transparent';
        textarea.style.caretColor = 'black';
        console.log('🎨 添削表示ON');
    }
}

/**
 * 🎯 添削表示の強制OFF
 */
export function hideCorrectionDisplay() {
    const textarea = document.getElementById('judicial-answer-textarea');
    const overlay = document.querySelector('.new-correction-overlay');
    
    if (textarea && overlay) {
        overlay.style.display = 'none';
        textarea.style.color = 'black';
        textarea.style.caretColor = 'black';
        console.log('📝 添削表示OFF');
    }
}

// 🎯 新生添削システムのCSSスタイル（改良版）
const newCorrectionStyle = document.createElement('style');
newCorrectionStyle.innerHTML = `
/* 新生添削システム専用スタイル - 完全同期版 */
.new-correction-overlay {
    cursor: default !important;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.new-correction-overlay span {
    cursor: help !important;
    display: inline;
    line-height: inherit;
    font-size: inherit;
    font-family: inherit;
}

.correction-essential-new {
    background: rgba(239, 68, 68, 0.3) !important;
    border-bottom: 3px solid #ef4444 !important;
    color: black !important;
    font-weight: bold !important;
    border-radius: 2px;
    position: relative;
}

.correction-bonus-new {
    background: rgba(59, 130, 246, 0.3) !important;
    border-bottom: 3px solid #3b82f6 !important;
    color: black !important;
    font-weight: bold !important;
    border-radius: 2px;
    position: relative;
}

.correction-good-new {
    background: rgba(34, 197, 94, 0.3) !important;
    border-bottom: 3px solid #22c55e !important;
    color: black !important;
    font-weight: bold !important;
    border-radius: 2px;
    position: relative;
}

.correction-improve-new {
    background: rgba(245, 158, 11, 0.3) !important;
    border-bottom: 3px solid #f59e0b !important;
    color: black !important;
    font-weight: bold !important;
    border-radius: 2px;
    position: relative;
}

.correction-delete-new {
    background: rgba(156, 163, 175, 0.3) !important;
    border-bottom: 3px solid #9ca3af !important;
    color: black !important;
    text-decoration: line-through !important;
    border-radius: 2px;
    position: relative;
}

/* ホバー時の詳細表示 */
.correction-essential-new:hover::after,
.correction-bonus-new:hover::after,
.correction-good-new:hover::after,
.correction-improve-new:hover::after,
.correction-delete-new:hover::after {
    content: attr(title);
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: normal;
    white-space: normal;
    max-width: 300px;
    word-wrap: break-word;
    z-index: 1000;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 添削統計バッジ用のスタイル */
.correction-stats {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 12px;
    margin: 0 2px;
    display: inline-block;
}

.correction-stats.essential { background: #ef4444; color: white; }
.correction-stats.bonus { background: #3b82f6; color: white; }
.correction-stats.good { background: #22c55e; color: white; }
.correction-stats.improve { background: #f59e0b; color: white; }
.correction-stats.delete { background: #9ca3af; color: white; }

/* 添削中でも操作可能にするためのスタイル（強化版） */
.opinion-btn, .correction-btn, .toggle-correction, .clear-correction {
    pointer-events: auto !important;
    z-index: 5000 !important;
    position: relative !important;
}

.mini-essay-tab, .tab-button, .case-navigation, nav, header {
    pointer-events: auto !important;
    z-index: 5000 !important;
    position: relative !important;
}

/* 全ページナビゲーション要素を最優先で操作可能に */
.main-container, .tab-content, .case-card, .nav-button, button {
    pointer-events: auto !important;
}

/* 特定のボタンクラス */
button[class*="btn"], button[class*="button"], .btn, .button {
    pointer-events: auto !important;
    z-index: 5000 !important;
    position: relative !important;
}

/* 添削オーバーレイの改良 */
.new-correction-overlay {
    pointer-events: none !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}

.new-correction-overlay * {
    pointer-events: none !important;
}
`;

document.head.appendChild(newCorrectionStyle);

console.log('✅ 新生添削システム初期化完了');
console.log('📋 利用可能な関数:');
console.log('  - performAICorrection: AI添削実行');
console.log('  - applyCorrectionMarkupForJudicialSheet: 添削表示');
console.log('  - clearJudicialCorrectionMarks: 添削クリア');
console.log('  - displayCorrectionResults: 結果表示');

// 添削プロンプトのサンプル形式（参考用）
const correctionPromptExample = `答案の添削をお願いします。以下のJSON形式で回答してください：

{
  "score": 85,
  "maxScore": 100,
  "overallComment": "全体的な評価コメント",
  "corrections": [
    {
      "start": 文字位置,
      "end": 文字位置,
      "type": "essential|bonus|good|improve|delete",
      "comment": "コメント文"
    }
  ]
}

**添削基準**:
- essential: 必須論点（赤色）
- bonus: 加点要素（青色）
- good: 良い表現（緑色）
- improve: 改善点（オレンジ色）
- delete: 削除推奨（グレー色）

文字位置は提出答案テキストでの正確な位置を指定してください。`;
