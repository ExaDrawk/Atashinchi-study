// correction.js - 統一添削システム（完全作り直し版）
// 司法試験答案用紙専用の添削機能

/**
 * AI添削専用プロンプト作成
 */
export async function createCorrectionPrompt(answerText, subProblem, quizIndex, subIndex) {
    console.log('🔍 プロンプト作成開始:', {
        answerTextLength: answerText?.length || 0,
        subProblem: !!subProblem,
        quizIndex,
        subIndex
    });
    
    if (!subProblem) {
        console.error('❌ subProblemが未定義です');
        throw new Error('subProblemが未定義です');
    }
    
    const { modelAnswer, modelAnalysis, problem } = subProblem;
    
    if (!problem) {
        console.error('❌ 問題文が見つかりません');
        throw new Error('問題文が見つかりません');
    }
    
    // プロンプトのサイズを制限
    const truncatedProblem = problem.length > 300 ? problem.substring(0, 300) + '...' : problem;
    const truncatedModelAnswer = (modelAnswer || '模範解答が設定されていません').length > 500 ? (modelAnswer || '').substring(0, 500) + '...' : (modelAnswer || '模範解答が設定されていません');
    const truncatedAnswer = answerText.length > 800 ? answerText.substring(0, 800) + '...' : answerText;
    
    // 答案例を読み込み
    let answerExampleText = '';
    if (quizIndex !== undefined && subIndex !== undefined) {
        const exampleAnswer = await loadAnswerExample(quizIndex, subIndex);
        if (exampleAnswer) {
            const cleanedExample = exampleAnswer.replace(/\[([^\]]+)\]/g, '').substring(0, 500);
            answerExampleText = `\n\n参考答案例: ${cleanedExample}...`;
        }
    }
    
    return `## 司法試験論文添削依頼

**問題**: ${truncatedProblem}

**模範解答**: ${truncatedModelAnswer}

**提出答案**: ${truncatedAnswer}${answerExampleText}

以下の形式で添削してください：

\`\`\`json
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
\`\`\`

**添削基準**:
- essential: 必須論点（赤色）
- bonus: 加点要素（青色）
- good: 良い表現（緑色）
- improve: 改善点（オレンジ色）
- delete: 削除推奨（グレー色）

文字位置は提出答案テキストでの正確な位置を指定してください。`;
}

/**
 * AI添削を実行する関数
 */
export async function performAICorrection(answerText, subProblem, quizIndex, subIndex) {
    try {
        console.log('🤖 AI添削開始');
        
        const prompt = await createCorrectionPrompt(answerText, subProblem, quizIndex, subIndex);
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });
        
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        
        const result = await response.json();
        const correctionData = parseCorrectionResponse(result.reply, answerText);
        
        console.log('✅ AI添削完了:', correctionData);
        return correctionData;
        
    } catch (error) {
        console.error('❌ AI添削エラー:', error);
        throw error;
    }
}

/**
 * AI回答をパースして添削データに変換
 */
export function parseCorrectionResponse(aiResponse, answerText) {
    console.log('🔍 AI回答パース開始:', { responseLength: aiResponse?.length || 0 });
    
    try {
        // JSON部分を抽出
        const jsonMatch = aiResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (!jsonMatch) {
            throw new Error('JSON形式の回答が見つかりません');
        }
        
        const parsed = JSON.parse(jsonMatch[1]);
        console.log('✅ パース成功:', parsed);
        
        // 基本的な検証
        if (!parsed.score || !parsed.corrections) {
            throw new Error('必要なフィールドが不足しています');
        }
        
        return parsed;
        
    } catch (error) {
        console.error('❌ AI回答のパースに失敗:', error);
        return null;
    }
}

/**
 * 司法試験答案用紙での添削表示（統一システム）
 */
export function applyCorrectionMarkupForJudicialSheet(correctionData, textareaIdOrText) {
    console.log('🎯 統一添削システム: 司法試験答案用紙への添削適用開始', correctionData);
    
    const textarea = document.getElementById('judicial-answer-textarea');
    if (!textarea) {
        console.error('❌ 司法試験用テキストエリアが見つかりません');
        return;
    }
    
    try {
        // 既存の添削をクリア
        clearJudicialCorrectionMarks();
        
        const text = textarea.value;
        console.log('📝 テキスト内容:', { length: text.length, firstChars: text.substring(0, 50) });
        
        // 添削データを統合処理
        let correctionList = [];
        if (correctionData.corrections && Array.isArray(correctionData.corrections)) {
            correctionList = correctionData.corrections;
        } else if (correctionData.highlights && Array.isArray(correctionData.highlights)) {
            correctionList = correctionData.highlights;
        }
        
        console.log('📋 添削データ:', { count: correctionList.length, data: correctionList });
        
        if (correctionList.length > 0) {
            createUnifiedTextOverlay(textarea, text, correctionList);
        } else {
            console.warn('⚠️ 添削データが空です');
        }
        
        console.log('✅ 統一添削システム: 司法試験答案用紙への添削適用完了');
        
    } catch (error) {
        console.error('❌ 統一添削システム: 司法試験答案用紙添削エラー:', error);
    }
}

/**
 * 統一されたテキストオーバーレイを作成
 */
function createUnifiedTextOverlay(textarea, originalText, corrections) {
    console.log('🎨 統一テキストオーバーレイ作成開始:', { 
        textLength: originalText.length, 
        correctionsCount: corrections.length 
    });
    
    // 既存のオーバーレイを削除
    const existingOverlay = document.querySelector('.judicial-text-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
        console.log('🗑️ 既存オーバーレイを削除');
    }
    
    // テキストエリアの親要素の位置設定
    const parent = textarea.parentElement;
    if (parent.style.position === '' || parent.style.position === 'static') {
        parent.style.position = 'relative';
    }
    
    // オーバーレイ用のコンテナを作成
    const overlay = document.createElement('div');
    overlay.className = 'judicial-text-overlay';
    
    // テキストエリアのスタイルを取得
    const textareaStyle = window.getComputedStyle(textarea);
    
    // 正確な位置計算
    const topOffset = textarea.offsetTop;
    const leftOffset = textarea.offsetLeft;
    
    // オーバーレイのスタイル設定
    overlay.style.cssText = `
        position: absolute;
        top: ${topOffset}px;
        left: ${leftOffset}px;
        width: ${textarea.offsetWidth}px;
        height: ${textarea.offsetHeight}px;
        font-family: ${textareaStyle.fontFamily};
        font-size: ${textareaStyle.fontSize};
        line-height: ${textareaStyle.lineHeight};
        padding: ${textareaStyle.padding};
        margin: 0;
        border: none;
        border-radius: ${textareaStyle.borderRadius};
        background: transparent;
        color: black;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        z-index: 15;
        pointer-events: none;
        letter-spacing: ${textareaStyle.letterSpacing};
        box-sizing: ${textareaStyle.boxSizing};
    `;
    
    console.log('📐 オーバーレイ位置:', { 
        top: topOffset, 
        left: leftOffset, 
        width: textarea.offsetWidth, 
        height: textarea.offsetHeight 
    });
    
    // 添削データを位置順にソート
    const sortedCorrections = corrections.slice().sort((a, b) => {
        const startA = getTextPosition(a, originalText);
        const startB = getTextPosition(b, originalText);
        return startA - startB;
    });
    
    console.log('📋 ソート済み添削データ:', sortedCorrections);
    
    // HTMLマークアップ処理
    const markedUpText = applyMarkupToText(originalText, sortedCorrections);
    overlay.innerHTML = markedUpText;
    
    // 親要素に追加
    parent.appendChild(overlay);
    
    // テキストエリアを半透明にして背景に
    textarea.style.color = 'rgba(0, 0, 0, 0.2)';
    textarea.style.backgroundColor = 'transparent';
    
    // スクロール同期の設定
    setupScrollSync(textarea, overlay);
    
    console.log('✅ 統一テキストオーバーレイ作成完了');
}

/**
 * テキスト内の位置を特定
 */
function getTextPosition(correction, text) {
    if (correction.start !== undefined) {
        return correction.start;
    }
    if (correction.text) {
        const position = text.indexOf(correction.text);
        return position >= 0 ? position : 0;
    }
    return 0;
}

/**
 * テキストにマークアップを適用
 */
function applyMarkupToText(originalText, corrections) {
    let processedText = originalText;
    
    // 逆順で処理（位置がずれないように）
    for (let i = corrections.length - 1; i >= 0; i--) {
        const correction = corrections[i];
        let start, end;
        
        if (correction.start !== undefined && correction.end !== undefined) {
            start = correction.start;
            end = correction.end;
        } else if (correction.text) {
            start = originalText.indexOf(correction.text);
            if (start === -1) continue;
            end = start + correction.text.length;
        } else {
            continue;
        }
        
        if (start < 0 || end > processedText.length || start >= end) continue;
        
        const before = processedText.substring(0, start);
        const target = processedText.substring(start, end);
        const after = processedText.substring(end);
        
        const colorStyle = getInlineStyle(correction.type);
        const tooltip = correction.comment ? ` title="${escapeHtml(correction.comment)}"` : '';
        
        processedText = before + `<span class="correction-highlight" style="${colorStyle}" data-type="${correction.type}"${tooltip}>${escapeHtml(target)}</span>` + after;
    }
    
    // 改行を<br>に変換
    return processedText.replace(/\n/g, '<br>');
}

/**
 * スクロール同期の設定
 */
function setupScrollSync(textarea, overlay) {
    const syncScroll = () => {
        overlay.style.transform = `translateY(-${textarea.scrollTop}px)`;
    };
    
    // 既存のイベントリスナーを削除してから新しいものを追加
    textarea.removeEventListener('scroll', syncScroll);
    textarea.addEventListener('scroll', syncScroll);
    
    // オーバーレイにも同じスクロール位置を設定
    overlay.scrollTop = textarea.scrollTop;
}

/**
 * 添削タイプに応じたインラインスタイルを取得
 */
function getInlineStyle(type) {
    const styleMap = {
        essential: 'background-color: rgba(239, 68, 68, 0.3); border-bottom: 2px solid #ef4444; font-weight: bold;',
        bonus: 'background-color: rgba(59, 130, 246, 0.3); border-bottom: 2px solid #3b82f6; font-weight: bold;',
        good: 'background-color: rgba(34, 197, 94, 0.3); border-bottom: 2px solid #22c55e; font-weight: bold;',
        improve: 'background-color: rgba(245, 158, 11, 0.3); border-bottom: 2px solid #f59e0b; font-weight: bold;',
        delete: 'background-color: rgba(156, 163, 175, 0.3); border-bottom: 2px solid #9ca3af; text-decoration: line-through;'
    };
    return styleMap[type] || styleMap.improve;
}

/**
 * 司法試験答案用紙の添削マークをクリア
 */
export function clearJudicialCorrectionMarks() {
    console.log('🧹 統一システム: 司法試験答案用紙の添削マーククリア開始');
    
    // 統一オーバーレイを削除
    const overlay = document.querySelector('.judicial-text-overlay');
    if (overlay) {
        overlay.remove();
        console.log('✅ 統一テキストオーバーレイを削除');
    }
    
    // 古い形式のマーカーも削除（互換性のため）
    const markers = document.querySelectorAll('.correction-marker');
    markers.forEach(marker => marker.remove());
    
    // 古いHTMLマークアップ表示エリアも削除
    const display = document.querySelector('.judicial-correction-display');
    if (display) {
        display.remove();
    }
    
    // テキストエリアのスタイルを復元
    const textarea = document.getElementById('judicial-answer-textarea');
    if (textarea) {
        textarea.style.color = 'black';
        textarea.style.backgroundColor = 'transparent';
        console.log('✅ テキストエリアのスタイル復元完了');
    }
    
    console.log('✅ 統一システム: 司法試験答案用紙の添削マーククリア完了');
}

/**
 * 従来システム互換のclearCorrectionMarks
 */
export function clearCorrectionMarks() {
    console.log('🧹 従来システム互換: 添削マーククリア');
    clearJudicialCorrectionMarks();
    
    // 追加で従来システムのクリアも実行
    const answerLines = document.querySelectorAll('.answer-line');
    answerLines.forEach(line => {
        const highlights = line.querySelectorAll('.correction-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
        
        const markers = line.querySelectorAll('.correction-margin-marker');
        markers.forEach(marker => marker.remove());
    });
    
    // コメントリストをクリア
    const correctionCommentsList = document.getElementById('correction-comments-list');
    if (correctionCommentsList) {
        correctionCommentsList.innerHTML = '';
    }
    
    // 従来のグリッド表示形式のクリア
    document.querySelectorAll('.answer-sheet-cell').forEach(cell => {
        cell.classList.remove('correction-essential', 'correction-bonus', 'correction-good', 'correction-improve', 'correction-delete');
        cell.removeAttribute('title');
        cell.style.cursor = '';
        cell.style.transform = '';
        cell.style.backgroundColor = '';
        cell.style.transition = '';
    });
    
    // 点数表示をクリア
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
        scoreDisplay.style.display = 'none';
    }
    
    // 全体コメントをクリア
    const overallComment = document.getElementById('overall-comment');
    if (overallComment) {
        overallComment.style.display = 'none';
    }
    
    // 添削凡例をクリア
    const correctionLegend = document.getElementById('correction-legend');
    if (correctionLegend) {
        correctionLegend.style.display = 'none';
    }
}

/**
 * 従来システム互換のapplyCorrectionMarkupWithAnimation
 */
export function applyCorrectionMarkupWithAnimation(correctionData, answerText) {
    console.log('🎯 従来システム互換: 添削マークアップ適用開始', correctionData);
    
    // 司法試験答案用紙があるかチェック
    const judicialTextarea = document.getElementById('judicial-answer-textarea');
    if (judicialTextarea) {
        return applyCorrectionMarkupForJudicialSheet(correctionData, answerText);
    }
    
    // 従来のテキスト表示形式（簡易対応）
    console.log('⚠️ 従来システム: テキスト表示形式は簡易対応');
    clearCorrectionMarks();
    updateScoreDisplay(correctionData);
    showOverallComment(correctionData);
    showCorrectionLegend();
}

/**
 * 点数表示を更新
 */
function updateScoreDisplay(correctionData) {
    const scoreDisplay = document.getElementById('score-display');
    const scoreNumber = document.getElementById('score-number');
    if (scoreDisplay && scoreNumber && correctionData.score !== undefined) {
        scoreNumber.textContent = `${correctionData.score}/${correctionData.maxScore || 100}`;
        scoreDisplay.style.display = 'block';
    }
}

/**
 * 全体コメントを表示
 */
function showOverallComment(correctionData) {
    const overallComment = document.getElementById('overall-comment');
    const overallCommentText = document.getElementById('overall-comment-text');
    if (overallComment && overallCommentText && correctionData.overallComment) {
        overallCommentText.textContent = correctionData.overallComment;
        overallComment.style.display = 'block';
    }
}

/**
 * 添削凡例を表示
 */
function showCorrectionLegend() {
    const legend = document.getElementById('correction-legend');
    if (legend) {
        legend.style.display = 'flex';
    }
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 答案例を読み込む関数
 */
async function loadAnswerExample(quizIndex, subIndex) {
    try {
        if (!window.currentCaseData || !window.currentCaseData.quiz) {
            console.warn('ケースデータが見つかりません');
            return null;
        }
        
        const quiz = window.currentCaseData.quiz[quizIndex];
        if (!quiz) {
            console.warn('該当するクイズが見つかりません');
            return null;
        }
        
        let answerExample = null;
        
        // 新形式：subProblemsから取得
        if (quiz.subProblems && quiz.subProblems[subIndex]) {
            answerExample = quiz.subProblems[subIndex].answerExample;
        }
        // 旧形式：直接取得
        else if (quiz.answerExample) {
            answerExample = quiz.answerExample;
        }
        
        return answerExample || null;
        
    } catch (error) {
        console.error('答案例読み込みエラー:', error);
        return null;
    }
}

/**
 * 添削結果を表示（miniEssay.js用 - 統一システム）
 */
export function displayCorrectionResults(correctionData, answerText) {
    console.log('🎯 統一添削システム: 添削結果表示開始', correctionData);
    
    // 点数表示
    updateScoreDisplay(correctionData);
    
    // 総合コメント表示
    showOverallComment(correctionData);
    
    // 添削凡例表示
    showCorrectionLegend();
    
    // 司法試験答案用紙があれば統一添削マークアップを適用
    const judicialTextarea = document.getElementById('judicial-answer-textarea');
    if (judicialTextarea) {
        applyCorrectionMarkupForJudicialSheet(correctionData, 'judicial-answer-textarea');
    } else {
        // 通常の添削マークアップを適用
        applyCorrectionMarkupWithAnimation(correctionData, answerText);
    }
    
    console.log('✅ 統一添削システム: 添削結果表示完了');
}

// グローバル関数として登録（互換性維持用）
window.updateCorrectionMarkersPosition = () => {
    console.log('📍 旧マーカー位置更新関数が呼ばれました（統一方式では不要）');
};

console.log('✅ 統一添削システム: 初期化完了');
console.log('📋 エクスポートされた関数:');
console.log('  - performAICorrection: AI添削実行');
console.log('  - displayCorrectionResults: 添削結果表示（統一方式）');
console.log('  - clearCorrectionMarks: 添削マーククリア（統一方式）');
console.log('  - applyCorrectionMarkupWithAnimation: アニメーション付き添削表示（統一方式）');
console.log('  - applyCorrectionMarkupForJudicialSheet: 司法試験答案用紙添削表示（統一方式）');
console.log('  - clearJudicialCorrectionMarks: 添削マーククリア（統一方式）');
