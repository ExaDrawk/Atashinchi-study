// correction.js - 超高機能司法試験答案添削システム（完全版）
// 23×30答案用紙対応・AI分析・詳細統計・リアルタイム表示

// 進捗表示関数を一時的に直接定義（モジュールロード問題対策）
function showAdvancedCorrectionProgress() {
    console.log('🔄 添削処理中...(表示は完全に無効化)');
    // 進捗表示を完全に無効化
    return;
}

function hideAdvancedCorrectionProgress() {
    console.log('✅ 添削処理完了');
    // 何もしない（表示自体を無効化しているため）
    return;
}

console.log('🚀 超高機能司法試験答案添削システム初期化開始');

/**
 * 🎯 メイン添削実行関数（超高機能版）
 */
export async function performAICorrection(answerText, subProblem, quizIndex, subIndex) {
    console.log('🎯 超高機能AI添削開始:', { 
        answerLength: answerText?.length, 
        quizIndex, 
        subIndex,
        timestamp: new Date().toISOString()
    });
    
    try {
        // プログレス表示
        showAdvancedCorrectionProgress();
        
        // 1. 高度なプロンプト生成
        const prompt = createAdvancedCorrectionPrompt(answerText, subProblem);
        console.log('📝 高度プロンプト生成完了');
        
        // 2. AI分析実行
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: prompt,
                systemRole: 'advanced_legal_essay_corrector'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🔍 AI応答受信:', { hasReply: !!result.reply, replyLength: result.reply?.length });
        
        // 3. 高度な応答解析
        const correctionData = parseAdvancedCorrection(result.reply, answerText);
        
        if (!correctionData) {
            console.warn('⚠️ 応答解析失敗、高度フォールバック使用');
            return createAdvancedFallbackCorrection(answerText, subProblem);
        }
        
        // 4. 統計情報の生成
        correctionData.statistics = generateDetailedStatistics(answerText, correctionData);
        
        console.log('✅ 超高機能AI添削完了:', correctionData);
        hideAdvancedCorrectionProgress();
        
        return correctionData;
        
    } catch (error) {
        console.error('❌ 超高機能AI添削エラー:', error);
        hideAdvancedCorrectionProgress();
        return createAdvancedFallbackCorrection(answerText, subProblem);
    }
}

/**
 * 🎯 高度なプロンプト生成
 */
function createAdvancedCorrectionPrompt(answerText, subProblem) {
    const problem = subProblem?.problem || '司法試験論文式の問題です。';
    const modelAnswer = subProblem?.modelAnswer || '模範解答が設定されていません。';
    const lawField = identifyLawField(problem);
    
    return `# 司法試験論文添削（高度分析版）

**分野**: ${lawField}
**問題**: ${problem.substring(0, 500)}
**模範解答**: ${modelAnswer.substring(0, 800)}
**学生答案**: ${answerText}

学生の答案を詳細に添削し、以下のJSON形式で返してください。各添削箇所には具体的で実用的なコメントを付けてください：

` + '```json' + `
{
  "score": 75,
  "maxScore": 100,
  "overallComment": "詳細な総合評価コメント",
  "legalAnalysis": {
    "lawIdentification": "A",
    "factAnalysis": "B",
    "lawApplication": "B",
    "conclusion": "A"
  },
  "corrections": [
    {
      "start": 0,
      "end": 10,
      "type": "essential",
      "severity": "high",
      "category": "論点抽出",
      "comment": "具体的な指摘内容",
      "suggestion": "改善提案"
    }
  ]
}
` + '```' + `

**重要な評価基準**:
1. **論点の抽出と整理** - 主要な法的争点が適切に把握されているか
2. **事実の法的評価** - 与えられた事実を法的に正確に分析できているか  
3. **条文・判例の適用** - 関連条文や判例を適切に引用・適用できているか
4. **論理的な文章構成** - 結論までの道筋が論理的に構成されているか
5. **論理構成の問題を具体的に指摘** - どの部分の論理が飛躍しているか

**添削タイプの使い分け**:
- essential: 必須論点の欠落（赤・高重要度）
- improve: 論述の改善点（オレンジ・要修正）
- good: 優秀な表現（緑・維持推奨）
- delete: 不要な記述（グレー・削除推奨）
- structure: 構成の問題（紫・論理構造）
- citation: 条文判例の問題（茶・引用関連）
- bonus: 加点要素（青・プラス評価）

文字位置は答案テキスト内の正確な位置を指定し、コメントは学習者が具体的に何をすべきかわかるよう詳細に記述してください。`;
}

/**
 * 🎯 法律分野の自動識別
 */
function identifyLawField(problemText) {
    const fieldKeywords = {
        '民法': ['債権', '物権', '親族', '相続', '契約', '不法行為', '所有権'],
        '刑法': ['犯罪', '刑罰', '構成要件', '故意', '過失', '正当防衛'],
        '憲法': ['基本的人権', '統治機構', '違憲審査', '表現の自由'],
        '商法': ['会社', '商行為', '手形', '小切手', '保険'],
        '民事訴訟法': ['訴訟', '管轄', '当事者', '証拠', '判決'],
        '刑事訴訟法': ['捜査', '公訴', '証拠能力', '令状'],
        '行政法': ['行政処分', '行政指導', '行政不服', '国家賠償']
    };
    
    for (const [field, keywords] of Object.entries(fieldKeywords)) {
        if (keywords.some(keyword => problemText.includes(keyword))) {
            return field;
        }
    }
    return '一般法学';
}

/**
 * 🎯 高度な応答解析
 */
function parseAdvancedCorrection(aiResponse, answerText) {
    console.log('🔍 高度応答解析開始:', { responseLength: aiResponse?.length });
    
    if (!aiResponse || typeof aiResponse !== 'string') {
        console.error('❌ 無効な応答:', typeof aiResponse);
        return null;
    }
    
    try {
        // JSON部分を抽出（複数パターン対応）
        let correctionData;
        const jsonMatch = aiResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        
        if (jsonMatch) {
            correctionData = JSON.parse(jsonMatch[1]);
        } else {
            // フォールバック解析
            const cleanedResponse = aiResponse.replace(/```/g, '').trim();
            if (cleanedResponse.startsWith('{')) {
                correctionData = JSON.parse(cleanedResponse);
            } else {
                throw new Error('JSON形式が見つかりません');
            }
        }
        
        // データ検証・正規化
        const validatedData = validateAndNormalizeCorrection(correctionData, answerText);
        
        console.log('✅ 高度応答解析完了:', { 
            score: validatedData.score,
            correctionsCount: validatedData.corrections?.length 
        });
        
        return validatedData;
        
    } catch (error) {
        console.error('❌ 応答解析エラー:', error);
        return null;
    }
}

/**
 * 🎯 添削データの検証・正規化
 */
function validateAndNormalizeCorrection(data, answerText) {
    // 基本構造の検証
    if (!data || typeof data !== 'object') {
        throw new Error('無効なデータ構造');
    }
    
    // 必須フィールドのデフォルト値設定
    const normalized = {
        score: Math.max(0, Math.min(100, Number(data.score) || 50)),
        maxScore: 100,
        overallComment: data.overallComment || '添削データを解析しました',
        legalAnalysis: data.legalAnalysis || {
            lawIdentification: 'B',
            factAnalysis: 'B', 
            lawApplication: 'B',
            conclusion: 'B'
        },
        corrections: []
    };
    
    // 添削項目の検証・正規化
    if (Array.isArray(data.corrections)) {
        normalized.corrections = data.corrections
            .map(correction => {
                // 基本検証
                if (!correction || typeof correction !== 'object') return null;
                
                const start = Number(correction.start);
                const end = Number(correction.end);
                
                // 位置の妥当性チェック
                if (isNaN(start) || isNaN(end) || start < 0 || end > answerText.length || start >= end) {
                    console.warn('⚠️ 無効な位置:', { start, end, textLength: answerText.length });
                    return null;
                }
                
                return {
                    start: start,
                    end: end,
                    type: validateCorrectionType(correction.type),
                    severity: correction.severity || 'medium',
                    category: correction.category || '一般',
                    comment: correction.comment || '要改善',
                    suggestion: correction.suggestion || '修正を検討してください'
                };
            })
            .filter(correction => correction !== null);
    }
    
    return normalized;
}

/**
 * 🎯 添削タイプの検証
 */
function validateCorrectionType(type) {
    const validTypes = ['essential', 'improve', 'good', 'delete', 'structure', 'citation', 'bonus'];
    return validTypes.includes(type) ? type : 'improve';
}

/**
 * 🎯 高度なフォールバック添削生成
 */
function createAdvancedFallbackCorrection(answerText, subProblem) {
    console.log('🔄 高度フォールバック添削生成開始');
    
    const fallbackCorrections = generateFallbackCorrections(answerText);
    
    return {
        score: 65,
        maxScore: 100,
        overallComment: 'AI添削システムが一時的に利用できないため、基本的な分析結果を表示しています。',
        legalAnalysis: {
            lawIdentification: 'B',
            factAnalysis: 'B',
            lawApplication: 'B', 
            conclusion: 'B'
        },
        corrections: fallbackCorrections,
        isFallback: true
    };
}

/**
 * 🎯 フォールバック添削項目生成
 */
function generateFallbackCorrections(answerText) {
    const corrections = [];
    const textLength = answerText.length;
    
    // 文字数チェック
    if (textLength < 300) {
        corrections.push({
            start: 0,
            end: Math.min(50, textLength),
            type: 'essential',
            severity: 'high',
            category: '文字数',
            comment: '答案の文字数が不足しています。より詳細な論述が必要です。',
            suggestion: '各論点について、より具体的な分析と説明を追加してください。'
        });
    }
    
    // 改行の多さチェック
    const lineBreaks = (answerText.match(/\n/g) || []).length;
    if (lineBreaks > textLength / 20) {
        const firstBreak = answerText.indexOf('\n');
        corrections.push({
            start: Math.max(0, firstBreak - 10),
            end: Math.min(textLength, firstBreak + 10),
            type: 'structure',
            severity: 'medium',
            category: '文章構成',
            comment: '段落分けが細かすぎます。論理的なまとまりを意識した構成にしてください。',
            suggestion: '関連する内容は同じ段落にまとめ、論点ごとに適切に段落を分けてください。'
        });
    }
    
    // 「。」で終わっていない文の検出
    if (!answerText.trim().endsWith('。')) {
        corrections.push({
            start: Math.max(0, textLength - 20),
            end: textLength,
            type: 'improve',
            severity: 'low',
            category: '文章表現',
            comment: '文章が適切に終了していません。',
            suggestion: '文章は句点（。）で適切に終了させてください。'
        });
    }
    
    return corrections;
}

/**
 * 🎯 詳細統計情報生成
 */
function generateDetailedStatistics(answerText, correctionData) {
    const textLength = answerText.length;
    const sentences = answerText.split(/[。！？]/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? textLength / sentences.length : 0;
    
    const statistics = {
        basic: {
            characterCount: textLength,
            sentenceCount: sentences.length,
            averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
            paragraphCount: answerText.split(/\n\s*\n/).length
        },
        corrections: {
            totalCount: correctionData.corrections?.length || 0,
            byType: {},
            bySeverity: {
                high: 0,
                medium: 0,
                low: 0
            }
        },
        quality: {
            readabilityScore: calculateReadabilityScore(answerText),
            legalTermsCount: countLegalTerms(answerText),
            citationsCount: countCitations(answerText)
        }
    };
    
    // 添削タイプ別集計
    if (correctionData.corrections) {
        correctionData.corrections.forEach(correction => {
            const type = correction.type || 'other';
            statistics.corrections.byType[type] = (statistics.corrections.byType[type] || 0) + 1;
            
            const severity = correction.severity || 'medium';
            if (statistics.corrections.bySeverity[severity] !== undefined) {
                statistics.corrections.bySeverity[severity]++;
            }
        });
    }
    
    return statistics;
}

/**
 * 🎯 読みやすさスコア計算
 */
function calculateReadabilityScore(text) {
    const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? text.length / sentences.length : 0;
    
    let score = 100;
    if (avgSentenceLength > 50) score -= 10;
    if (avgSentenceLength > 100) score -= 20;
    if (text.length < 200) score -= 15;
    
    return Math.max(0, Math.min(100, score));
}

/**
 * 🎯 法律用語カウント
 */
function countLegalTerms(text) {
    const legalTerms = [
        '条', '項', '号', '法', '規則', '判例', '裁判所', '当事者', '権利', '義務',
        '契約', '債権', '債務', '所有権', '占有', '登記', '善意', '悪意', '過失', '故意'
    ];
    
    return legalTerms.reduce((count, term) => {
        const matches = text.match(new RegExp(term, 'g'));
        return count + (matches ? matches.length : 0);
    }, 0);
}

/**
 * 🎯 条文引用カウント
 */
function countCitations(text) {
    const citationPatterns = [
        /第\d+条/g,
        /\d+条/g,
        /民法\d+条/g,
        /刑法\d+条/g
    ];
    
    return citationPatterns.reduce((count, pattern) => {
        const matches = text.match(pattern);
        return count + (matches ? matches.length : 0);
    }, 0);
}

/**
 * 🎯 超高機能添削表示システム
 */
export function applyCorrectionMarkupForJudicialSheet(correctionData, textareaId) {
    console.log('🎨 超高機能添削表示開始:', { 
        correctionsCount: correctionData?.corrections?.length,
        hasStatistics: !!correctionData?.statistics
    });
    
    // テキストエリアを複数の方法で検索
    let textarea = document.getElementById('judicial-answer-textarea');
    
    if (!textarea) {
        // フォールバック1: 他のIDで検索
        textarea = document.getElementById('initial-input-0-0') || 
                  document.getElementById('initial-input-0-1') ||
                  document.getElementById('initial-input-1-0');
    }
    
    if (!textarea) {
        // フォールバック2: クラス名で検索
        textarea = document.querySelector('.judicial-textarea') ||
                  document.querySelector('textarea[id*="initial-input"]') ||
                  document.querySelector('textarea');
    }
    
    if (!textarea) {
        console.error('❌ テキストエリアが見つかりません - 利用可能な要素:', {
            byId: !!document.getElementById('judicial-answer-textarea'),
            byClass: !!document.querySelector('.judicial-textarea'),
            anyTextarea: !!document.querySelector('textarea'),
            allElements: document.querySelectorAll('*[id*="input"]').length
        });
        return;
    }
    
    console.log('✅ テキストエリア発見:', {
        id: textarea.id,
        tagName: textarea.tagName,
        textLength: textarea.value?.length
    });
    
    // 既存の添削マーカーを全削除
    clearJudicialCorrectionMarks();
    
    // 添削データが空の場合
    if (!correctionData || !correctionData.corrections || correctionData.corrections.length === 0) {
        console.warn('⚠️ 添削データが空です');
        return;
    }
    
    // 文字位置ベース・自動改行対応のハイライトシステムを使用
    createCharacterBasedHighlightSystem(textarea, correctionData);
    
    console.log('✅ 超高機能添削表示完了');
}

/**
 * 🎯 文字位置ベース・自動改行対応ハイライトシステム
 */
function createCharacterBasedHighlightSystem(textarea, correctionData) {
    console.log('🎨 文字位置ベース・自動改行対応ハイライト開始');
    
    try {
        // 高機能オーバーレイを作成
        const overlay = createHighlightOverlay(textarea);
        
        // 各添削項目に対してハイライトセグメントを作成
        correctionData.corrections.forEach((correction, index) => {
            createHighlightSegment(overlay, correction, index, textarea.value);
        });
        
        console.log('✅ 文字位置ベース・自動改行対応ハイライト完了');
        
    } catch (error) {
        console.error('❌ ハイライトシステムエラー:', error);
        // フォールバック: correction.jsの基本システムを使用
        if (window.correctionModule && window.correctionModule.applyCorrectionMarkupForJudicialSheet) {
            window.correctionModule.applyCorrectionMarkupForJudicialSheet(correctionData, textarea.id);
        }
    }
}

/**
 * 🎯 高機能ハイライトオーバーレイ作成
 */
function createHighlightOverlay(textarea) {
    const parent = textarea.parentElement;
    
    // 既存のオーバーレイを削除
    const existingOverlay = parent.querySelector('.character-highlight-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // 計算されたスタイルを取得（より正確な同期のため）
    const textareaStyle = window.getComputedStyle(textarea);
    
    // 新しいオーバーレイを作成
    const overlay = document.createElement('div');
    overlay.className = 'character-highlight-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: ${textarea.offsetTop}px;
        left: ${textarea.offsetLeft}px;
        width: ${textarea.offsetWidth}px;
        height: ${textarea.offsetHeight}px;
        font-family: ${textareaStyle.fontFamily} !important;
        font-size: ${textareaStyle.fontSize} !important;
        font-weight: ${textareaStyle.fontWeight} !important;
        font-style: ${textareaStyle.fontStyle} !important;
        line-height: ${textareaStyle.lineHeight} !important;
        text-transform: none !important;
        text-decoration: none !important;
        font-variant: normal !important;
        letter-spacing: ${textareaStyle.letterSpacing} !important;
        word-spacing: ${textareaStyle.wordSpacing} !important;
        text-align: ${textareaStyle.textAlign} !important;
        padding: ${textareaStyle.padding};
        padding-top: ${textareaStyle.paddingTop};
        padding-right: ${textareaStyle.paddingRight};
        padding-bottom: ${textareaStyle.paddingBottom};
        padding-left: ${textareaStyle.paddingLeft};
        margin: ${textareaStyle.margin};
        border: ${textareaStyle.border};
        box-sizing: border-box;
        pointer-events: none;
        z-index: 10;
        overflow: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        background: transparent;
    `;
    
    parent.appendChild(overlay);
    
    // テキストエリアのスクロールと同期
    textarea.addEventListener('scroll', () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
    });
    
    return overlay;
}

/**
 * 🎯 司法試験答案添削マーカーを全削除
 */
function clearJudicialCorrectionMarks() {
    // オーバーレイの削除
    document.querySelectorAll('.character-highlight-overlay, .advanced-correction-overlay, .new-correction-overlay')
        .forEach(overlay => overlay.remove());
    
    // ハイライト要素の削除
    document.querySelectorAll('.correction-highlight, .correction-segment, .correction-clickable')
        .forEach(element => element.remove());
    
    // コメントポップアップの削除
    document.querySelectorAll('.correction-comment-popup, .correction-tooltip')
        .forEach(popup => popup.remove());
    
    // 統計パネルの削除
    document.querySelectorAll('.correction-statistics-panel, .correction-comment-panel')
        .forEach(panel => panel.remove());
    
    // テキストエリアのスタイルをリセット
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.style.color = '';
        textarea.style.caretColor = '';
        textarea.style.backgroundColor = '';
        textarea.style.textShadow = '';
        textarea.style.zIndex = '';
    });
}

// === ファイル終了 ===
// 重複した関数定義によるSyntaxErrorを防ぐため、ここで終了します
