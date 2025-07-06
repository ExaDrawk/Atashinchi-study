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
 * 🎯 新しい添削オーバーレイ作成
 */
function createNewCorrectionOverlay(textarea, correctionData) {
    console.log('🎨 新オーバーレイ作成開始');
    
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
    
    // オーバーレイ要素を作成
    const overlay = document.createElement('div');
    overlay.className = 'new-correction-overlay';
    
    // テキストエリアと同じ位置・サイズに設定
    overlay.style.cssText = `
        position: absolute;
        top: ${textarea.offsetTop}px;
        left: ${textarea.offsetLeft}px;
        width: ${textarea.offsetWidth}px;
        height: ${textarea.offsetHeight}px;
        font-family: 'MS Gothic', 'ＭＳ ゴシック', monospace;
        font-size: 22px;
        line-height: 28px;
        padding: 0;
        margin: 0;
        border: none;
        background: transparent;
        color: black;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        z-index: 15;
        pointer-events: none;
        letter-spacing: 2px;
        box-sizing: border-box;
    `;
    
    // 添削マークアップを適用したテキストを生成
    const markedText = applyCorrectionsToText(textarea.value, correctionData.corrections || []);
    overlay.innerHTML = markedText;
    
    // 親要素に追加
    parent.style.position = 'relative';
    parent.appendChild(overlay);
    
    // テキストエリアを背景に
    textarea.style.color = 'rgba(0, 0, 0, 0.1)';
    textarea.style.zIndex = '10';
    
    console.log('✅ 新オーバーレイ作成完了');
}

/**
 * 🎯 テキストに添削マークアップを適用
 */
function applyCorrectionsToText(originalText, corrections) {
    console.log('🎨 テキストマークアップ開始:', { correctionsCount: corrections.length });
    
    if (!corrections || corrections.length === 0) {
        return escapeHtml(originalText);
    }
    
    // 添削範囲をソート
    const sortedCorrections = corrections
        .filter(c => c.start < c.end && c.end <= originalText.length)
        .sort((a, b) => a.start - b.start);
    
    let result = '';
    let lastEnd = 0;
    
    for (const correction of sortedCorrections) {
        // 添削前のテキスト
        result += escapeHtml(originalText.slice(lastEnd, correction.start));
        
        // 添削部分
        const correctionText = originalText.slice(correction.start, correction.end);
        const cssClass = getCorrectionCssClass(correction.type);
        const title = escapeHtml(correction.comment || '');
        
        result += `<span class="${cssClass}" title="${title}">${escapeHtml(correctionText)}</span>`;
        
        lastEnd = correction.end;
    }
    
    // 残りのテキスト
    result += escapeHtml(originalText.slice(lastEnd));
    
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
 * 🎯 新生添削クリア機能
 */
export function clearJudicialCorrectionMarks() {
    console.log('🧹 新生添削クリア開始');
    
    // 新しいオーバーレイを削除
    const newOverlays = document.querySelectorAll('.new-correction-overlay');
    newOverlays.forEach(overlay => overlay.remove());
    
    // 古いオーバーレイも削除
    const oldOverlays = document.querySelectorAll('.judicial-text-overlay, .correction-overlay, .text-overlay');
    oldOverlays.forEach(overlay => overlay.remove());
    
    // テキストエリアをリセット
    const textarea = document.getElementById('judicial-answer-textarea');
    if (textarea) {
        textarea.style.color = 'black';
        textarea.style.zIndex = '2';
    }
    
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

// 🎯 新生添削システムのCSSスタイル
const newCorrectionStyle = document.createElement('style');
newCorrectionStyle.innerHTML = `
/* 新生添削システム専用スタイル */
.correction-essential-new {
    background: rgba(239, 68, 68, 0.2) !important;
    border-bottom: 2px solid #ef4444 !important;
    color: black !important;
    font-weight: bold !important;
}

.correction-bonus-new {
    background: rgba(59, 130, 246, 0.2) !important;
    border-bottom: 2px solid #3b82f6 !important;
    color: black !important;
    font-weight: bold !important;
}

.correction-good-new {
    background: rgba(34, 197, 94, 0.2) !important;
    border-bottom: 2px solid #22c55e !important;
    color: black !important;
    font-weight: bold !important;
}

.correction-improve-new {
    background: rgba(245, 158, 11, 0.2) !important;
    border-bottom: 2px solid #f59e0b !important;
    color: black !important;
    font-weight: bold !important;
}

.correction-delete-new {
    background: rgba(156, 163, 175, 0.2) !important;
    border-bottom: 2px solid #9ca3af !important;
    color: black !important;
    text-decoration: line-through !important;
}

.new-correction-overlay {
    cursor: default !important;
}

.new-correction-overlay span {
    cursor: help !important;
}
`;

document.head.appendChild(newCorrectionStyle);

console.log('✅ 新生添削システム初期化完了');
console.log('📋 利用可能な関数:');
console.log('  - performAICorrection: AI添削実行');
console.log('  - applyCorrectionMarkupForJudicialSheet: 添削表示');
console.log('  - clearJudicialCorrectionMarks: 添削クリア');
console.log('  - displayCorrectionResults: 結果表示');
