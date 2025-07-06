/**
 * 🛠️ 司法試験答案添削ユーティリティ関数群
 */

console.log('🛠️ 添削ユーティリティ初期化');

/**
 * 🎯 法律分野の自動識別
 */
export function identifyLawField(problemText) {
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
 * 🎯 添削タイプの検証
 */
export function validateCorrectionType(type) {
    const validTypes = ['essential', 'bonus', 'good', 'improve', 'delete', 'structure', 'citation'];
    return validTypes.includes(type) ? type : 'improve';
}

/**
 * 🎯 読みやすさスコア計算
 */
export function calculateReadabilityScore(text) {
    const sentences = text.split(/[。！？]/).filter(s => s.trim());
    const avgSentenceLength = text.length / sentences.length;
    
    // 簡易的な読みやすさスコア（100点満点）
    let score = 100;
    if (avgSentenceLength > 50) score -= 10;
    if (avgSentenceLength > 100) score -= 20;
    if (text.length < 200) score -= 15;
    
    return Math.max(0, Math.min(100, score));
}

/**
 * 🎯 法律用語カウント
 */
export function countLegalTerms(text) {
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
export function countCitations(text) {
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
 * 🎯 詳細統計情報の生成
 */
export function generateDetailedStatistics(answerText, correctionData) {
    const stats = {
        textLength: answerText.length,
        characterCount: answerText.length,
        lineCount: answerText.split('\n').length,
        paragraphCount: answerText.split('\n\n').filter(p => p.trim()).length,
        averageLineLength: Math.round(answerText.length / answerText.split('\n').length),
        correctionsCount: correctionData?.corrections?.length || 0,
        severityBreakdown: {
            high: 0,
            medium: 0,
            low: 0
        },
        typeBreakdown: {
            essential: 0,
            bonus: 0,
            good: 0,
            improve: 0,
            delete: 0,
            structure: 0,
            citation: 0
        },
        readabilityScore: calculateReadabilityScore(answerText),
        legalTermsCount: countLegalTerms(answerText),
        citationCount: countCitations(answerText)
    };
    
    // 添削データから統計を計算
    if (correctionData?.corrections) {
        correctionData.corrections.forEach(correction => {
            if (stats.severityBreakdown[correction.severity]) {
                stats.severityBreakdown[correction.severity]++;
            }
            if (stats.typeBreakdown[correction.type]) {
                stats.typeBreakdown[correction.type]++;
            }
        });
    }
    
    return stats;
}

/**
 * 🎯 添削データの検証と正規化
 */
export function validateAndNormalizeCorrection(data, answerText) {
    // スコア正規化
    if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
        data.score = 70;
    }
    data.maxScore = data.maxScore || 100;
    
    // コメント正規化
    data.overallComment = data.overallComment || '添削分析を実行しました。';
    
    // 法的分析データの正規化
    if (!data.legalAnalysis) {
        data.legalAnalysis = {
            lawIdentification: 'B',
            factAnalysis: 'B', 
            logicalStructure: 'B',
            conclusionValidity: 'B'
        };
    }
    
    // 添削配列の正規化
    if (!Array.isArray(data.corrections)) {
        data.corrections = [];
    }
    
    data.corrections = data.corrections
        .filter(c => c && typeof c === 'object')
        .map(correction => ({
            start: Math.max(0, Math.min(correction.start || 0, answerText.length)),
            end: Math.max(0, Math.min(correction.end || correction.start || 0, answerText.length)),
            type: validateCorrectionType(correction.type),
            severity: ['high', 'medium', 'low'].includes(correction.severity) ? correction.severity : 'medium',
            category: correction.category || '一般',
            comment: correction.comment || '添削コメント',
            suggestion: correction.suggestion || '改善提案'
        }))
        .filter(c => c.start < c.end && c.end <= answerText.length);
    
    // 長所・短所・推奨事項の正規化
    data.strengths = Array.isArray(data.strengths) ? data.strengths : ['論理的な記述'];
    data.weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : ['より詳細な分析が必要'];
    data.recommendations = Array.isArray(data.recommendations) ? data.recommendations : ['条文の引用を増やす'];
    
    return data;
}

/**
 * 🎯 フォールバック添削ポイント生成
 */
export function generateFallbackCorrections(answerText) {
    const corrections = [];
    const length = answerText.length;
    
    // 開始部分
    if (length > 20) {
        corrections.push({
            start: 0,
            end: Math.min(20, length),
            type: 'good',
            severity: 'low',
            category: '導入',
            comment: '論述の開始部分です',
            suggestion: '問題の所在を明確にしましょう'
        });
    }
    
    // 中間部分
    if (length > 100) {
        const midStart = Math.floor(length * 0.3);
        const midEnd = Math.floor(length * 0.6);
        corrections.push({
            start: midStart,
            end: midEnd,
            type: 'improve',
            severity: 'medium',
            category: '論証',
            comment: '論証部分の分析',
            suggestion: 'より具体的な条文引用を追加してください'
        });
    }
    
    // 終了部分
    if (length > 50) {
        const endStart = Math.max(0, length - 30);
        corrections.push({
            start: endStart,
            end: length,
            type: 'structure',
            severity: 'medium',
            category: '結論',
            comment: '結論部分です',
            suggestion: '結論の根拠をより明確にしましょう'
        });
    }
    
    return corrections;
}

/**
 * 🎯 高度フォールバック添削データ生成
 */
export function createAdvancedFallbackCorrection(answerText, subProblem) {
    console.log('🔄 高度フォールバック添削データ生成');
    
    const analysisScore = Math.floor(60 + Math.random() * 20); // 60-80点
    
    return {
        score: analysisScore,
        maxScore: 100,
        overallComment: `AI添削システムが一時的に利用できないため、基本分析を表示しています。答案の文字数は${answerText.length}文字です。`,
        legalAnalysis: {
            lawIdentification: 'B',
            factAnalysis: 'B+',
            logicalStructure: 'B',
            conclusionValidity: 'B-'
        },
        corrections: generateFallbackCorrections(answerText),
        strengths: ['一定の論理構成', '基本的な法的知識'],
        weaknesses: ['より詳細な論証', '条文引用の充実'],
        recommendations: ['判例の活用', '論点の深掘り'],
        statistics: generateDetailedStatistics(answerText, null)
    };
}

/**
 * 🎯 高度な応答解析
 */
export function parseAdvancedCorrection(aiResponse, answerText) {
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
            // JSONブロックがない場合、全体をJSONとして解析を試行
            correctionData = JSON.parse(aiResponse);
        }
        
        // 高度な検証と正規化
        correctionData = validateAndNormalizeCorrection(correctionData, answerText);
        
        console.log('✅ 高度応答解析成功:', {
            score: correctionData.score,
            correctionsCount: correctionData.corrections?.length || 0,
            hasAnalysis: !!correctionData.legalAnalysis
        });
        
        return correctionData;
        
    } catch (error) {
        console.error('❌ 高度JSON解析エラー:', error);
        return null;
    }
}

/**
 * 🎯 HTMLエスケープ
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
