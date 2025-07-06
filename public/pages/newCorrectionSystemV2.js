/**
 * 🌟 新生添削システム V2.0
 * 司法試験ミニ論文答案用紙の添削機能を一から再設計
 * 23x30 答案用紙仕様に完全対応
 */

console.log('🌟 新生添削システム V2.0 ロード開始');

// ================================================================================
// 🎯 グローバル変数
// ================================================================================

let currentCorrectionData = null;  // 現在の添削データ
let correctionMarkersVisible = false;  // 添削マーカー表示状態
let correctionOverlay = null;  // 添削オーバーレイDOM

// ================================================================================
// 🎨 CSS自動注入
// ================================================================================

function injectCorrectionCSS() {
    const cssId = 'newCorrectionSystemCSS';
    if (document.getElementById(cssId)) return;

    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = `
        /* 新生添削システム専用CSS */
        .correction-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
            font-family: monospace;
            line-height: 1.6;
            padding: 12px;
            box-sizing: border-box;
        }
        
        .correction-marker {
            position: absolute;
            border-radius: 2px;
            opacity: 0.3;
            pointer-events: auto;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        
        .correction-marker:hover {
            opacity: 0.6;
        }
        
        .correction-marker.essential {
            background-color: #ff4444;
            border: 1px solid #cc0000;
        }
        
        .correction-marker.bonus {
            background-color: #4444ff;
            border: 1px solid #0000cc;
        }
        
        .correction-marker.good {
            background-color: #44ff44;
            border: 1px solid #00cc00;
        }
        
        .correction-marker.improve {
            background-color: #ffaa44;
            border: 1px solid #cc6600;
        }
        
        .correction-marker.delete {
            background-color: #888888;
            border: 1px solid #555555;
        }
        
        .correction-tooltip {
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            max-width: 300px;
            z-index: 1000;
            pointer-events: none;
        }
        
        .correction-results {
            margin-top: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        
        .correction-score {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        
        .correction-comment {
            margin-bottom: 15px;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 4px solid #3498db;
        }
        
        .correction-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
        }
        
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 2px;
            border: 1px solid #ccc;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ CSS注入完了');
}

// ================================================================================
// 🤖 AI添削API連携
// ================================================================================

/**
 * AI添削プロンプト生成
 */
function createCorrectionPrompt(answerText, subProblem, quizIndex, subIndex) {
    console.log('📝 添削プロンプト生成中...');
    
    const prompt = `以下の司法試験ミニ論文答案を添削してください。

【問題】
${subProblem?.text || '問題文不明'}

【答案】
${answerText}

【採点基準】
- 法的論点の正確性
- 論理構成の明確性
- 条文・判例の引用
- 結論の妥当性

以下のJSON形式で添削結果を返してください：

{
  "score": 85,
  "maxScore": 100,
  "overallComment": "全体的な評価コメント",
  "corrections": [
    {
      "start": 開始文字位置,
      "end": 終了文字位置,
      "type": "essential|bonus|good|improve|delete",
      "comment": "具体的なコメント"
    }
  ]
}

添削タイプの意味：
- essential: 必須論点（必ず言及すべき点）
- bonus: 加点要素（優秀な記述）
- good: 良い表現（適切な記述）
- improve: 改善点（修正が必要）
- delete: 削除推奨（不要な記述）

文字位置は答案テキスト内での正確な位置を指定してください。`;

    console.log('✅ プロンプト生成完了');
    return prompt;
}

/**
 * AI添削実行
 */
async function performAICorrection(answerText, subProblem, quizIndex, subIndex) {
    try {
        console.log('🤖 AI添削開始...');
        
        // プロンプト生成
        const prompt = createCorrectionPrompt(answerText, subProblem, quizIndex, subIndex);
        
        // API呼び出し
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });
        
        if (!response.ok) {
            throw new Error(`API応答エラー: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📥 AI応答受信:', data);
        
        // 応答解析
        const correctionData = parseAIResponse(data.reply || data.message || '');
        console.log('✅ AI添削完了:', correctionData);
        
        return correctionData;
        
    } catch (error) {
        console.error('❌ AI添削エラー:', error);
        throw error;
    }
}

/**
 * AI応答解析
 */
function parseAIResponse(responseText) {
    console.log('🔍 AI応答解析中...');
    
    try {
        // JSONブロック抽出
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON形式の応答が見つかりません');
        }
        
        const jsonText = jsonMatch[0];
        const correctionData = JSON.parse(jsonText);
        
        // データ検証
        if (!correctionData.corrections || !Array.isArray(correctionData.corrections)) {
            correctionData.corrections = [];
        }
        
        // デフォルト値設定
        correctionData.score = correctionData.score || 0;
        correctionData.maxScore = correctionData.maxScore || 100;
        correctionData.overallComment = correctionData.overallComment || '添削完了';
        
        console.log('✅ 応答解析完了:', correctionData);
        return correctionData;
        
    } catch (error) {
        console.error('❌ 応答解析エラー:', error);
        
        // フォールバック応答
        return {
            score: 0,
            maxScore: 100,
            overallComment: 'AI応答の解析に失敗しました。手動で添削してください。',
            corrections: []
        };
    }
}

// ================================================================================
// 🎨 添削マーカー描画
// ================================================================================

/**
 * 添削マーカー表示
 */
function displayCorrectionMarkers(textarea, correctionData) {
    console.log('🎨 添削マーカー表示開始...');
    
    try {
        // CSS注入
        injectCorrectionCSS();
        
        // 既存のオーバーレイを削除
        clearCorrectionMarkers();
        
        // 新しいオーバーレイ作成
        createCorrectionOverlay(textarea, correctionData);
        
        // 結果表示
        displayCorrectionResults(correctionData);
        
        // 状態更新
        currentCorrectionData = correctionData;
        correctionMarkersVisible = true;
        
        console.log('✅ 添削マーカー表示完了');
        
    } catch (error) {
        console.error('❌ マーカー表示エラー:', error);
    }
}

/**
 * 添削オーバーレイ作成
 */
function createCorrectionOverlay(textarea, correctionData) {
    console.log('🎯 オーバーレイ作成中...');
    
    const parent = textarea.parentElement;
    if (!parent) {
        console.error('❌ 親要素が見つかりません');
        return;
    }
    
    // オーバーレイ要素作成
    correctionOverlay = document.createElement('div');
    correctionOverlay.className = 'correction-overlay';
    correctionOverlay.id = 'correctionOverlayV2';
    
    // テキストエリアの位置とサイズに合わせる
    const rect = textarea.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    
    correctionOverlay.style.left = (rect.left - parentRect.left) + 'px';
    correctionOverlay.style.top = (rect.top - parentRect.top) + 'px';
    correctionOverlay.style.width = rect.width + 'px';
    correctionOverlay.style.height = rect.height + 'px';
    
    // マーカー作成
    createMarkers(textarea, correctionData.corrections, correctionOverlay);
    
    // DOM追加
    parent.appendChild(correctionOverlay);
    
    console.log('✅ オーバーレイ作成完了');
}

/**
 * 個別マーカー作成
 */
function createMarkers(textarea, corrections, overlay) {
    console.log('🏷️ マーカー作成中...', corrections.length, '個');
    
    const text = textarea.value;
    const style = window.getComputedStyle(textarea);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.6;
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingTop = parseFloat(style.paddingTop);
    
    corrections.forEach((correction, index) => {
        try {
            const start = Math.max(0, Math.min(correction.start, text.length));
            const end = Math.max(start, Math.min(correction.end, text.length));
            
            if (start >= end) return;
            
            // 文字位置を画面座標に変換
            const position = getTextPosition(text, start, end, fontSize, lineHeight, paddingLeft, paddingTop);
            
            // マーカー要素作成
            const marker = document.createElement('div');
            marker.className = `correction-marker ${correction.type}`;
            marker.style.left = position.left + 'px';
            marker.style.top = position.top + 'px';
            marker.style.width = position.width + 'px';
            marker.style.height = position.height + 'px';
            
            // ツールチップ
            marker.addEventListener('mouseenter', (e) => showTooltip(e, correction.comment));
            marker.addEventListener('mouseleave', hideTooltip);
            
            overlay.appendChild(marker);
            
        } catch (error) {
            console.error('❌ マーカー作成エラー:', error, correction);
        }
    });
    
    console.log('✅ マーカー作成完了');
}

/**
 * テキスト位置を画面座標に変換
 */
function getTextPosition(text, start, end, fontSize, lineHeight, paddingLeft, paddingTop) {
    const beforeText = text.substring(0, start);
    const targetText = text.substring(start, end);
    
    // 行数計算
    const beforeLines = beforeText.split('\n');
    const line = beforeLines.length - 1;
    const column = beforeLines[beforeLines.length - 1].length;
    
    // 座標計算
    const left = paddingLeft + (column * fontSize * 0.6);
    const top = paddingTop + (line * lineHeight);
    const width = Math.max(targetText.length * fontSize * 0.6, fontSize * 0.6);
    const height = lineHeight;
    
    return { left, top, width, height };
}

/**
 * ツールチップ表示
 */
function showTooltip(event, comment) {
    hideTooltip(); // 既存のツールチップを削除
    
    const tooltip = document.createElement('div');
    tooltip.className = 'correction-tooltip';
    tooltip.id = 'correctionTooltip';
    tooltip.textContent = comment;
    
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 30) + 'px';
    
    document.body.appendChild(tooltip);
}

/**
 * ツールチップ非表示
 */
function hideTooltip() {
    const tooltip = document.getElementById('correctionTooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// ================================================================================
// 🧹 添削クリア
// ================================================================================

/**
 * 添削マーカークリア
 */
function clearCorrectionMarkers() {
    console.log('🧹 添削マーカークリア開始...');
    
    try {
        // オーバーレイ削除
        if (correctionOverlay) {
            correctionOverlay.remove();
            correctionOverlay = null;
        }
        
        // ID指定で削除
        const overlay = document.getElementById('correctionOverlayV2');
        if (overlay) {
            overlay.remove();
        }
        
        // ツールチップ削除
        hideTooltip();
        
        // 結果表示削除
        const results = document.getElementById('correctionResults');
        if (results) {
            results.remove();
        }
        
        // 状態リセット
        currentCorrectionData = null;
        correctionMarkersVisible = false;
        
        console.log('✅ 添削クリア完了');
        
    } catch (error) {
        console.error('❌ クリアエラー:', error);
    }
}

// ================================================================================
// 📊 添削結果表示
// ================================================================================

/**
 * 添削結果表示
 */
function displayCorrectionResults(correctionData) {
    console.log('📊 添削結果表示中...');
    
    try {
        // 既存の結果を削除
        const existingResults = document.getElementById('correctionResults');
        if (existingResults) {
            existingResults.remove();
        }
        
        // 結果要素作成
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'correctionResults';
        resultsDiv.className = 'correction-results';
        
        // スコア表示
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'correction-score';
        scoreDiv.textContent = `採点結果: ${correctionData.score}/${correctionData.maxScore}点`;
        resultsDiv.appendChild(scoreDiv);
        
        // コメント表示
        const commentDiv = document.createElement('div');
        commentDiv.className = 'correction-comment';
        commentDiv.textContent = correctionData.overallComment;
        resultsDiv.appendChild(commentDiv);
        
        // 凡例表示
        createLegend(resultsDiv);
        
        // DOM追加（テキストエリアの後に）
        const textarea = document.getElementById('answer');
        if (textarea && textarea.parentElement) {
            textarea.parentElement.appendChild(resultsDiv);
        }
        
        console.log('✅ 結果表示完了');
        
    } catch (error) {
        console.error('❌ 結果表示エラー:', error);
    }
}

/**
 * 凡例作成
 */
function createLegend(container) {
    const legend = document.createElement('div');
    legend.className = 'correction-legend';
    
    const types = [
        { key: 'essential', label: '必須論点', color: '#ff4444' },
        { key: 'bonus', label: '加点要素', color: '#4444ff' },
        { key: 'good', label: '良い表現', color: '#44ff44' },
        { key: 'improve', label: '改善点', color: '#ffaa44' },
        { key: 'delete', label: '削除推奨', color: '#888888' }
    ];
    
    types.forEach(type => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const color = document.createElement('div');
        color.className = 'legend-color';
        color.style.backgroundColor = type.color;
        
        const label = document.createElement('span');
        label.textContent = type.label;
        
        item.appendChild(color);
        item.appendChild(label);
        legend.appendChild(item);
    });
    
    container.appendChild(legend);
}

// ================================================================================
// 🎮 表示切替
// ================================================================================

/**
 * 添削表示/非表示切替
 */
function toggleCorrectionDisplay() {
    console.log('🎮 添削表示切替:', correctionMarkersVisible ? '非表示' : '表示');
    
    if (correctionMarkersVisible) {
        // 非表示
        if (correctionOverlay) {
            correctionOverlay.style.display = 'none';
        }
        correctionMarkersVisible = false;
    } else {
        // 表示
        if (correctionOverlay) {
            correctionOverlay.style.display = 'block';
        } else if (currentCorrectionData) {
            // オーバーレイが無い場合は再作成
            const textarea = document.getElementById('answer');
            if (textarea) {
                createCorrectionOverlay(textarea, currentCorrectionData);
            }
        }
        correctionMarkersVisible = true;
    }
    
    console.log('✅ 表示切替完了:', correctionMarkersVisible);
}

// ================================================================================
// 🚀 公開API
// ================================================================================

/**
 * メイン添削実行関数
 */
async function startNewCorrection(answerText, subProblem, quizIndex, subIndex) {
    console.log('🚀 新生添削システム開始...');
    
    try {
        // 既存の添削をクリア
        clearCorrectionMarkers();
        
        // AI添削実行
        const correctionData = await performAICorrection(answerText, subProblem, quizIndex, subIndex);
        
        // マーカー表示
        const textarea = document.getElementById('answer');
        if (textarea) {
            displayCorrectionMarkers(textarea, correctionData);
        }
        
        console.log('✅ 新生添削システム完了');
        return correctionData;
        
    } catch (error) {
        console.error('❌ 新生添削システムエラー:', error);
        
        // エラー時の表示
        const textarea = document.getElementById('answer');
        if (textarea && textarea.parentElement) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'correction-results';
            errorDiv.style.backgroundColor = '#ffe6e6';
            errorDiv.style.borderColor = '#ff9999';
            errorDiv.innerHTML = `
                <div class="correction-score" style="color: #cc0000;">
                    添削エラーが発生しました
                </div>
                <div class="correction-comment">
                    ${error.message || '不明なエラー'}
                </div>
            `;
            textarea.parentElement.appendChild(errorDiv);
        }
        
        throw error;
    }
}

// ================================================================================
// 🌍 グローバル公開
// ================================================================================

window.NewCorrectionSystemV2 = {
    start: startNewCorrection,
    clear: clearCorrectionMarkers,
    toggle: toggleCorrectionDisplay,
    isVisible: () => correctionMarkersVisible
};

console.log('✅ 新生添削システム V2.0 ロード完了');
