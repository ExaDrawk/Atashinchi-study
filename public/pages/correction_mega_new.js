// correction_mega.js - 司法試験答案添削システム（メイン機能）
// 分割された機能モジュールをインポートして統合

import { createCharacterBasedHighlightSystem, clearCorrectionHighlights } from './correctionHighlight.js';
import { 
    identifyLawField, 
    validateAndNormalizeCorrection, 
    parseAdvancedCorrection, 
    createAdvancedFallbackCorrection,
    generateDetailedStatistics 
} from './correctionUtils.js';
import { 
    showAdvancedCorrectionProgress, 
    hideAdvancedCorrectionProgress,
    updateCorrectionButtonState,
    displayStatisticsPanel,
    displayAnalysisPanel,
    displayAdvancedLegend,
    clearJudicialCorrectionMarks 
} from './correctionUI.js';

console.log('🚀 超高機能司法試験答案添削システム初期化開始');

// 添削状態を管理するグローバル変数（タブ間で状態を保持）
window.judicialCorrectionState = {
    isCorrectionInProgress: false,
    lastCorrectionData: null,
    startTime: null
};

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
    
    // 添削状態をグローバルに保存（タブ間で共有）
    window.judicialCorrectionState = {
        isCorrectionInProgress: true,
        startTime: new Date().toISOString(),
        lastActiveTab: document.querySelector('.tab-content.active')?.id || 'unknown'
    };
    
    // 添削ボタンを「添削中...」状態に変更
    updateCorrectionButtonState(true);
    
    try {
        // プログレス表示（完全に無効化済み）
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
            const fallbackData = createAdvancedFallbackCorrection(answerText, subProblem);
            
            // 添削状態を更新
            window.judicialCorrectionState.isCorrectionInProgress = false;
            window.judicialCorrectionState.lastCorrectionData = fallbackData;
            window.judicialCorrectionState.completionTime = new Date().toISOString();
            
            updateCorrectionButtonState(false);
            hideAdvancedCorrectionProgress();
            
            return fallbackData;
        }
        
        // 4. 統計情報の生成
        correctionData.statistics = generateDetailedStatistics(answerText, correctionData);
        
        // 添削状態を更新
        window.judicialCorrectionState.isCorrectionInProgress = false;
        window.judicialCorrectionState.lastCorrectionData = correctionData;
        window.judicialCorrectionState.completionTime = new Date().toISOString();
        
        console.log('✅ 超高機能AI添削完了:', correctionData);
        updateCorrectionButtonState(false);
        hideAdvancedCorrectionProgress();
        
        return correctionData;
        
    } catch (error) {
        console.error('❌ 超高機能AI添削エラー:', error);
        
        // エラー時も状態を更新
        window.judicialCorrectionState.isCorrectionInProgress = false;
        window.judicialCorrectionState.hasError = true;
        window.judicialCorrectionState.errorMessage = error.toString();
        
        updateCorrectionButtonState(false);
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
    "logicalStructure": "B",
    "conclusionValidity": "A"
  },
  "corrections": [
    {
      "start": 0,
      "end": 15,
      "type": "essential|bonus|good|improve|delete|structure|citation",
      "severity": "high|medium|low",
      "category": "論点|事実|条文|判例|論理|文章",
      "comment": "この部分の具体的な問題点や評価を明確に指摘",
      "suggestion": "どのように改善すべきかの具体的なアドバイス"
    }
  ],
  "strengths": ["答案の具体的な長所1", "答案の具体的な長所2"],
  "weaknesses": ["具体的な改善点1", "具体的な改善点2"],
  "recommendations": ["具体的推奨事項1", "具体的推奨事項2"]
}
` + '```' + `

**重要な添削ガイドライン**:
1. **模範解答の丸写しは必ず指摘する** - 独自の思考が見えない部分は厳しく評価
2. **論点の抜け漏れを具体的に指摘** - 何の論点が不足しているか明記
3. **事実と法規範の当てはめの質を評価** - 抽象的でない具体的な当てはめができているか
4. **条文・判例の引用の適切性を評価** - 正確性と関連性を確認
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
 * 🎯 超高機能添削表示システム（自動改行対応マーカー付き）
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
            allTextareas: Array.from(document.querySelectorAll('textarea')).map(t => t.id || t.className)
        });
        return;
    }
    
    console.log('✅ テキストエリア発見:', { id: textarea.id, className: textarea.className });
    
    // 既存の添削を完全クリア
    clearJudicialCorrectionMarks();
    
    try {
        // 🎯 NEW: 自動改行対応文字位置ベースのハイライト添削システム
        createCharacterBasedHighlightSystem(textarea, correctionData);
        
        // 2. 統計パネル表示
        displayStatisticsPanel(correctionData);
        
        // 3. 詳細分析パネル表示
        displayAnalysisPanel(correctionData);
        
        // 4. 添削凡例（拡張版）
        displayAdvancedLegend();
        
        console.log('✅ 超高機能添削表示完了（自動改行対応マーカー付き）');
        
    } catch (error) {
        console.error('❌ 超高機能添削表示エラー:', error);
    }
}

// エクスポート関数
export { clearJudicialCorrectionMarks };

console.log('🚀 司法試験答案添削システム初期化完了');
