// aiGradingSystem.js - AI添削システム
// AnswerOverlayのUIは一切変更せず、AI添削機能を独立して実装

class AIGradingSystem {
    constructor() {
        this.gradingResults = new Map(); // 添削結果をキャッシュ
        this.currentAnswer = '';
        this.currentMarkers = [];
        this.isGrading = false;
    }

    // 🚀 AI添削開始（answerOverlay.jsのsubmitから呼び出される）
    async startGrading(answerText) {
        if (this.isGrading) {
            console.warn('⚠️ 添削処理が既に実行中です');
            return null;
        }

        this.isGrading = true;
        this.currentAnswer = answerText;

        try {
            console.log('🚀 AI添削開始:', { answerLength: answerText.length });

            // AI添削プロンプトを構築
            const gradingPrompt = this.buildGradingPrompt(answerText);

            // AI APIを呼び出し
            const gradingResult = await this.callAIGradingAPI(gradingPrompt);

            if (gradingResult) {
                // 添削結果を解析
                const parsedResult = this.parseGradingResult(gradingResult, answerText);
                
                // 結果をキャッシュ
                this.gradingResults.set(answerText, parsedResult);
                
                console.log('✅ AI添削完了:', parsedResult);
                return parsedResult;
            }

            return null;

        } catch (error) {
            console.error('❌ AI添削エラー:', error);
            return {
                score: 0,
                totalScore: 100,
                evaluation: 'システムエラーが発生しました',
                sections: [],
                error: true
            };
        } finally {
            this.isGrading = false;
        }
    }

    // 🎯 添削プロンプト構築
    buildGradingPrompt(answerText) {
        // 改行を含む文字位置の詳細説明
        const textAnalysis = this.analyzeTextStructure(answerText);
        
        return `
# 答案添削システム

## 指示
以下の答案を詳細に添削し、指定された形式で結果を返してください。

## 答案
${answerText}

## 答案の構造分析
- 総文字数: ${textAnalysis.totalLength}
- 行数: ${textAnalysis.lineCount}
- 改行位置: ${textAnalysis.lineBreaks.join(', ')}

## 出力形式（必須）
以下のJSON形式で必ず出力してください：

\`\`\`json
{
  "score": 85,
  "totalScore": 100,
  "evaluation": "総合評価コメント",
  "sections": [
    {
      "startIndex": 5,
      "endIndex": 25,
      "text": "抽出された部分のテキスト",
      "score": 8,
      "maxScore": 10,
      "comment": "この部分の詳細な評価",
      "type": "good|average|poor"
    }
  ]
}
\`\`\`

## 添削ルール
1. 答案を3-5つの意味的な区間に分割して評価
2. 各区間の文字位置（startIndex, endIndex）を正確に指定
   - 改行文字（\\n）も1文字としてカウント
   - 文字位置は0ベースで指定（最初の文字は0）
   - endIndexは含まない（例：0-5は0,1,2,3,4文字目）
3. 各区間に10点満点で採点
4. type は good(8-10点), average(5-7点), poor(0-4点) で分類
5. 建設的で具体的なフィードバックを提供
6. 実際の答案テキストをそのまま"text"フィールドに記載

## 重要な注意点
- 必ずJSON形式で出力
- 文字位置は改行を含めて正確にカウント
- 実際の答案の内容と"text"フィールドが一致するように
- 評価は建設的で学習に役立つ内容に
- セクションが重複しないように注意
`;
    }

    // 📝 テキスト構造分析
    analyzeTextStructure(text) {
        const lineBreaks = [];
        let lineCount = 1;
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') {
                lineBreaks.push(i);
                lineCount++;
            }
        }
        
        return {
            totalLength: text.length,
            lineCount: lineCount,
            lineBreaks: lineBreaks
        };
    }

    // 🌐 AI API呼び出し
    async callAIGradingAPI(prompt) {
        try {
            console.log('📡 AI API呼び出し開始');

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: prompt,
                    history: [],
                    systemRole: 'grading'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error || '不明なエラー'}`);
            }

            const result = await response.json();
            const aiResponse = result.reply || result.response || result.text || '';

            console.log('✅ AI応答受信:', { responseLength: aiResponse.length });
            return aiResponse;

        } catch (error) {
            console.error('❌ AI API呼び出しエラー:', error);
            throw error;
        }
    }

    // 📊 添削結果解析
    parseGradingResult(aiResponse, originalAnswer) {
        try {
            console.log('📊 添削結果解析開始');

            // JSON部分を抽出
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
            
            if (!jsonMatch) {
                console.warn('⚠️ JSON形式が見つからない、フォールバック処理');
                return this.createFallbackResult(aiResponse, originalAnswer);
            }

            const jsonStr = jsonMatch[1].trim();
            const parsedResult = JSON.parse(jsonStr);

            // データ検証と補正
            const validatedResult = this.validateGradingResult(parsedResult, originalAnswer);
            
            console.log('✅ 添削結果解析完了:', validatedResult);
            return validatedResult;

        } catch (error) {
            console.error('❌ 添削結果解析エラー:', error);
            return this.createFallbackResult(aiResponse, originalAnswer);
        }
    }

    // ✅ 添削結果検証と補正
    validateGradingResult(result, originalAnswer) {
        const validated = {
            score: Math.max(0, Math.min(100, result.score || 50)),
            totalScore: result.totalScore || 100,
            evaluation: result.evaluation || '評価コメントが生成されませんでした',
            sections: []
        };

        if (Array.isArray(result.sections)) {
            for (const section of result.sections) {
                // 文字位置の検証と補正
                const startIndex = Math.max(0, Math.min(originalAnswer.length - 1, section.startIndex || 0));
                const endIndex = Math.max(startIndex + 1, Math.min(originalAnswer.length, section.endIndex || originalAnswer.length));
                
                // 実際のテキストを抽出
                const actualText = originalAnswer.slice(startIndex, endIndex);

                validated.sections.push({
                    startIndex: startIndex,
                    endIndex: endIndex,
                    text: actualText,
                    score: Math.max(0, Math.min(10, section.score || 5)),
                    maxScore: 10,
                    comment: section.comment || 'コメントなし',
                    type: ['good', 'average', 'poor'].includes(section.type) ? section.type : 'average'
                });
            }
        }

        // セクションがない場合は全体を1つのセクションとして扱う
        if (validated.sections.length === 0) {
            validated.sections.push({
                startIndex: 0,
                endIndex: originalAnswer.length,
                text: originalAnswer,
                score: Math.round(validated.score / 10),
                maxScore: 10,
                comment: validated.evaluation,
                type: validated.score >= 80 ? 'good' : validated.score >= 60 ? 'average' : 'poor'
            });
        }

        return validated;
    }

    // 🔄 フォールバック結果生成
    createFallbackResult(aiResponse, originalAnswer) {
        console.log('🔄 フォールバック結果を生成');

        // スコアを抽出しようと試行
        const scoreMatch = aiResponse.match(/(?:点数|スコア|得点)[：:]?\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

        return {
            score: Math.max(0, Math.min(100, score)),
            totalScore: 100,
            evaluation: aiResponse.length > 50 ? aiResponse.substring(0, 200) + '...' : aiResponse,
            sections: [{
                startIndex: 0,
                endIndex: originalAnswer.length,
                text: originalAnswer,
                score: Math.round(score / 10),
                maxScore: 10,
                comment: 'AI応答のフォーマットエラーのため、詳細評価を生成できませんでした',
                type: score >= 80 ? 'good' : score >= 60 ? 'average' : 'poor'
            }]
        };
    }

    // 🎨 マーカー適用（Answer Overlayで表示される内容を更新）
    applyGradingMarkers(editor, gradingResult) {
        if (!gradingResult || !gradingResult.sections) {
            console.warn('⚠️ 添削結果がないためマーカーを適用できません');
            return;
        }

        this.currentMarkers = gradingResult.sections;
        const originalText = editor.textContent || editor.innerText || '';

        console.log('🎨 マーカー適用開始:', { 
            sectionsCount: gradingResult.sections.length,
            originalTextLength: originalText.length 
        });

        // AI添削範囲の詳細ログ
        gradingResult.sections.forEach((section, index) => {
            console.log(`📍 セクション${index + 1}: ${section.startIndex}-${section.endIndex} "${section.text.substring(0, 30)}${section.text.length > 30 ? '...' : ''}"`);
            console.log(`📍 実際のテキスト: "${originalText.slice(section.startIndex, section.endIndex).substring(0, 30)}${originalText.slice(section.startIndex, section.endIndex).length > 30 ? '...' : ''}"`);
        });

        // HTMLを構築（マーカー付き、改行保持）
        let markedHTML = '';
        let lastIndex = 0;

        // セクションを開始位置でソート
        const sortedSections = [...gradingResult.sections].sort((a, b) => a.startIndex - b.startIndex);

        for (let i = 0; i < sortedSections.length; i++) {
            const section = sortedSections[i];
            
            // 前のセクションから現在のセクションまでの間のテキスト
            if (lastIndex < section.startIndex) {
                const unmarkedText = originalText.slice(lastIndex, section.startIndex);
                markedHTML += this.escapeHTMLWithLineBreaks(unmarkedText);
            }

            // マーカー付きセクション
            const sectionText = originalText.slice(section.startIndex, section.endIndex);
            const markerClass = this.getMarkerClass(section.type);
            const markerId = `grading-marker-${i}`;

            markedHTML += `<span class="${markerClass}" id="${markerId}" data-section="${i}" style="cursor: pointer; position: relative;">${this.escapeHTMLWithLineBreaks(sectionText)}</span>`;

            lastIndex = section.endIndex;
        }

        // 残りのテキスト
        if (lastIndex < originalText.length) {
            const remainingText = originalText.slice(lastIndex);
            markedHTML += this.escapeHTMLWithLineBreaks(remainingText);
        }

        // HTMLを適用（改行は既に<br>に変換済み）
        editor.innerHTML = markedHTML;

        // マーカークリックイベントを設定
        this.setupMarkerClickEvents(editor, gradingResult);

        console.log('✅ マーカー適用完了');
    }

    // 🎨 マーカーのCSSクラス取得
    getMarkerClass(type) {
        const baseClass = 'grading-marker';
        switch (type) {
            case 'good':
                return `${baseClass} grading-good`;
            case 'average':
                return `${baseClass} grading-average`;
            case 'poor':
                return `${baseClass} grading-poor`;
            default:
                return `${baseClass} grading-average`;
        }
    }

    // 🖱️ マーカークリックイベント設定
    setupMarkerClickEvents(editor, gradingResult) {
        const markers = editor.querySelectorAll('.grading-marker');
        
        markers.forEach((marker, index) => {
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                const sectionIndex = parseInt(marker.dataset.section);
                const section = gradingResult.sections[sectionIndex];
                
                if (section) {
                    this.showSectionPopup(marker, section);
                }
            });

            // ホバー効果
            marker.addEventListener('mouseenter', () => {
                marker.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
                marker.style.transform = 'scale(1.02)';
            });

            marker.addEventListener('mouseleave', () => {
                marker.style.boxShadow = '';
                marker.style.transform = '';
            });
        });
    }

    // 💬 セクション詳細ポップアップ表示
    showSectionPopup(targetElement, section) {
        // 既存のポップアップを削除
        const existingPopup = document.getElementById('grading-section-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const rect = targetElement.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.id = 'grading-section-popup';
        popup.className = 'grading-popup';
        
        const scorePercentage = (section.score / section.maxScore) * 100;
        const scoreClass = section.type === 'good' ? 'text-green-600' : 
                          section.type === 'poor' ? 'text-red-600' : 'text-yellow-600';

        popup.innerHTML = `
            <div class="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-bold text-lg">📊 セクション評価</h4>
                    <button class="text-gray-500 hover:text-gray-700 text-xl leading-none" onclick="this.closest('.grading-popup').remove()">×</button>
                </div>
                
                <div class="mb-3">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium">得点</span>
                        <span class="${scoreClass} font-bold">${section.score}/${section.maxScore}点 (${scorePercentage.toFixed(0)}%)</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full ${this.getProgressBarClass(section.type)}" style="width: ${scorePercentage}%"></div>
                    </div>
                </div>

                <div class="mb-3">
                    <span class="text-sm font-medium text-gray-600">対象テキスト:</span>
                    <div class="bg-gray-100 p-2 rounded mt-1 text-sm">"${section.text}"</div>
                </div>

                <div>
                    <span class="text-sm font-medium text-gray-600">評価コメント:</span>
                    <div class="mt-1 text-sm text-gray-800">${section.comment}</div>
                </div>
            </div>
        `;

        // ポップアップの位置調整
        popup.style.position = 'fixed';
        popup.style.zIndex = '1000000';
        popup.style.left = `${Math.min(rect.right + 10, window.innerWidth - 320)}px`;
        popup.style.top = `${Math.max(10, rect.top - 50)}px`;

        document.body.appendChild(popup);

        // 3秒後に自動削除（クリックされない場合）
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 5000);
    }

    // 🎨 プログレスバーのクラス取得
    getProgressBarClass(type) {
        switch (type) {
            case 'good':
                return 'bg-green-500';
            case 'average':
                return 'bg-yellow-500';
            case 'poor':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    }

    // 🔄 HTMLエスケープ
    escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
    }

    // 🔄 改行を保持するHTMLエスケープ
    escapeHTMLWithLineBreaks(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        }).replace(/\n/g, '<br>');
    }

    // 📈 添削結果の表示更新（右側エリア）
    updateGradingDisplay(gradingResult) {
        const resultArea = document.getElementById('result-area');
        const resultContent = document.getElementById('result-content');
        
        if (!resultArea || !resultContent) {
            console.warn('⚠️ 結果表示エリアが見つかりません');
            return;
        }

        resultArea.style.display = 'block';

        if (gradingResult.error) {
            resultContent.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 class="text-red-800 font-bold mb-2">❌ エラー</h4>
                    <p class="text-red-700">${gradingResult.evaluation}</p>
                </div>
            `;
            return;
        }

        const scorePercentage = (gradingResult.score / gradingResult.totalScore) * 100;
        const scoreClass = scorePercentage >= 80 ? 'text-green-600' : 
                          scorePercentage >= 60 ? 'text-yellow-600' : 'text-red-600';

        let sectionsHTML = '';
        gradingResult.sections.forEach((section, index) => {
            const sectionScore = (section.score / section.maxScore) * 100;
            const sectionClass = section.type === 'good' ? 'border-green-200 bg-green-50' :
                                section.type === 'poor' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50';
            
            sectionsHTML += `
                <div class="border rounded-lg p-3 mb-3 ${sectionClass}">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium">セクション ${index + 1}</span>
                        <span class="font-bold">${section.score}/${section.maxScore}点</span>
                    </div>
                    <div class="text-sm text-gray-600 mb-2">"${section.text.substring(0, 50)}${section.text.length > 50 ? '...' : ''}"</div>
                    <div class="text-sm">${section.comment}</div>
                </div>
            `;
        });

        resultContent.innerHTML = `
            <div class="space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-blue-800">📊 総合評価</h4>
                        <span class="${scoreClass} text-xl font-bold">${gradingResult.score}/${gradingResult.totalScore}点</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div class="h-3 rounded-full ${this.getProgressBarClass(scorePercentage >= 80 ? 'good' : scorePercentage >= 60 ? 'average' : 'poor')}" 
                             style="width: ${scorePercentage}%"></div>
                    </div>
                    <p class="text-blue-800">${gradingResult.evaluation}</p>
                </div>

                <div>
                    <h5 class="font-bold mb-3 text-gray-800">📝 セクション別評価</h5>
                    ${sectionsHTML}
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p class="text-sm text-gray-600">
                        💡 <strong>使い方:</strong> 答案内の色付きマーカーをクリックすると、各セクションの詳細評価が表示されます。
                    </p>
                </div>
            </div>
        `;
    }

    // 🧪 テスト用：3文字目から20文字目を青いマーカーで表示
    applyTestMarker(editor) {
        const originalText = editor.textContent || editor.innerText || '';
        console.log('🧪 テストマーカー適用:', { originalLength: originalText.length });
        
        if (originalText.length < 3) {
            console.warn('⚠️ テキストが短すぎます（3文字未満）');
            return;
        }

        const startIndex = 2; // 3文字目（0ベース）
        const endIndex = Math.min(19, originalText.length - 1); // 20文字目または文字列終端
        
        console.log(`🧪 テストマーカー範囲: ${startIndex} - ${endIndex + 1}`);
        console.log(`🧪 対象テキスト: "${originalText.slice(startIndex, endIndex + 1)}"`);

        // HTMLを構築（改行を保持）
        let markedHTML = '';
        
        // 最初の部分（マーカーなし）
        if (startIndex > 0) {
            markedHTML += this.escapeHTMLWithLineBreaks(originalText.slice(0, startIndex));
        }
        
        // マーカー部分（青色）
        const markerText = originalText.slice(startIndex, endIndex + 1);
        markedHTML += `<span style="background: linear-gradient(135deg, #cce7ff 0%, #99d6ff 100%); border: 2px solid #0066cc; border-radius: 4px; padding: 2px 4px; cursor: pointer;" onclick="alert('テストマーカー: ${startIndex}文字目〜${endIndex + 1}文字目\\n内容: ${markerText.replace(/'/g, '\\\'')}')">${this.escapeHTMLWithLineBreaks(markerText)}</span>`;
        
        // 残りの部分（マーカーなし）
        if (endIndex + 1 < originalText.length) {
            markedHTML += this.escapeHTMLWithLineBreaks(originalText.slice(endIndex + 1));
        }

        editor.innerHTML = markedHTML;
        console.log('✅ テストマーカー適用完了');
    }

    // 🧹 マーカーをクリア
    clearMarkers(editor) {
        if (editor) {
            const plainText = editor.textContent || editor.innerText || '';
            editor.innerHTML = this.escapeHTMLWithLineBreaks(plainText);
        }
        this.currentMarkers = [];
    }
}

// 📊 CSSスタイルを動的に追加
function injectGradingStyles() {
    if (document.getElementById('grading-styles')) return; // 既に追加済み

    const styles = document.createElement('style');
    styles.id = 'grading-styles';
    styles.textContent = `
        .grading-marker {
            padding: 2px 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }

        .grading-good {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border-color: #28a745;
        }

        .grading-average {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-color: #ffc107;
        }

        .grading-poor {
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            border-color: #dc3545;
        }

        .grading-marker:hover {
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .grading-popup {
            animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .loader-small {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styles);
}

// グローバルインスタンス
let aiGradingSystem = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    injectGradingStyles();
    aiGradingSystem = new AIGradingSystem();
    
    // グローバルに公開
    window.aiGradingSystem = aiGradingSystem;
    
    // デバッグ用テスト関数もグローバルに公開
    window.testBlueMarker = () => {
        const editor = document.getElementById('answer-editor');
        if (editor && aiGradingSystem) {
            aiGradingSystem.applyTestMarker(editor);
        } else {
            console.error('エディターまたはAI添削システムが見つかりません');
        }
    };
    
    console.log('✅ AI添削システム初期化完了');
});

// エクスポート
export { AIGradingSystem };
