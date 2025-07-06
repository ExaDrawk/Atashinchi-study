// answerCorrectionSystem.js - 答案添削システム（answerOverlay専用）
import { characters } from '../data/characters.js';

console.log('🔄 答案添削システム初期化開始');

/**
 * 🎯 メイン添削実行関数（answerOverlay専用）
 */
export async function performAnswerCorrection(answerText, questionData) {
    console.log('🤖 答案添削開始:', { answerLength: answerText?.length });
    
    try {
        // 1. プロンプト生成
        const prompt = createCorrectionPrompt(answerText, questionData);
        console.log('📝 プロンプト生成完了');
        
        // 2. AI API呼び出し
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
        console.log('🔍 API応答受信:', { hasReply: !!result.reply });
        
        // 3. 応答解析
        const correctionData = parseCorrectionResponse(result.reply, answerText);
        
        if (!correctionData) {
            console.warn('⚠️ 応答解析失敗、フォールバック使用');
            return createFallbackCorrection(answerText);
        }
        
        console.log('✅ 答案添削完了:', correctionData);
        return correctionData;
        
    } catch (error) {
        console.error('❌ 答案添削エラー:', error);
        return createFallbackCorrection(answerText);
    }
}

/**
 * 🎯 添削プロンプト生成（AIに範囲指定の例を明示・区切りも明記・対象部分も送信）
 */
function createCorrectionPrompt(answerText, questionData) {
    const problem = questionData?.problem || questionData?.description || '法律問題';
    const title = questionData?.title || '問題';
    const cleanText = answerText.replace(/\n/g, '');
    // ストーリー登場キャラ優先リスト
    let storyCharacters = [];
    if (questionData && Array.isArray(questionData.story)) {
        // dialogue型のspeakerを抽出
        const speakers = questionData.story.filter(s => s.type === 'dialogue' && s.speaker).map(s => s.speaker);
        // 重複除去
        storyCharacters = [...new Set(speakers)];
    }
    // キャラ名・表情リスト
    const characterList = characters.map(c => `- ${c.name}（aliases: ${c.aliases ? c.aliases.join(', ') : ''}）`).join('\n');
    const expressionList = characters[0]?.availableExpressions ? characters[0].availableExpressions.join(', ') : '';
    // personaリスト
    const personaList = characters.map(c => `【${c.name}】\n${c.persona}`).join('\n\n');

    // ストーリー登場キャラ優先指示を追加
    let storyCharInstruction = '';
    if (storyCharacters.length > 0) {
        storyCharInstruction = `\n【キャラクター選択ルール】\n- 添削コメントは、まずストーリーで登場したキャラクター（${storyCharacters.join('、')}）を優先的に割り当ててください。\n- ストーリー登場キャラで割り当てが難しい場合のみ、他のキャラクターを使っても構いません。`;
    }

    return `# 法律答案添削（キャラクター添削バージョン）

**問題**: ${title}
${problem.substring(0, 400)}

**学生答案**: 
${answerText.substring(0, 1000)}

---
【重要】
添削範囲の指定は、下記の例のように「改行を除いた純粋なテキストの0始まりインデックス」で正確に指定してください。

【例】
答案: こんにちは木原さん。\n木原さんは誰が1番好きなの？
→「誰」の範囲は15～16、「1番好き」の範囲は17～21です。

---
【区切りについて】
添削部分は必ずしも連続している必要はありません。意味や文脈上キリの良いところで、複数のマーカーに分けて指定しても構いません。

【targetTextの指定ルール】
- targetTextは必ず文や意味の区切りの良い部分で指定してください。
- 句読点（「、」「。」など）や文節の途中、単語の途中で始まったり終わったりしないでください。
- targetTextが不自然な区切りや中途半端な位置にならないよう注意してください。

---
【キャラクター添削仕様】
- 添削コメントは必ず「あたしンち」キャラクターが吹き出しで話す形式で出力してください。
- 各corrections要素には、"characterName"（キャラ名。下記リストから選択）、"expression"（表情。下記リストから選択）を必ず含めてください。
- commentはキャラのしゃべり方・性格・口癖・一人称・語尾などをcharacters.jsのpersonaに厳密に従って書いてください。
- キャラ画像・表情は「/assets/characters/{baseName}_{expression}.webp」で表示されます。
- キャラ・表情・しゃべり方は添削内容や文脈に応じて最適なものを選んでください。
${storyCharInstruction}

【利用可能なキャラクター一覧】
${characterList}

【利用可能な表情一覧】
${expressionList}

---
【キャラクターごとの性格・話し方・口癖・一人称・設定】
${personaList}

【厳守】
必ず各キャラクターの一人称・語尾・口癖・性格・話し方を厳密に守ってください。キャラごとに話し方が絶対に混ざらないようにしてください。キャラの個性が出るように、personaの特徴を忠実に反映してください。

---
【必須】
各corrections要素には、"targetText"（該当テキスト）、"characterName"（キャラ名）、"expression"（表情）、"comment"（キャラのしゃべり方での添削コメント）を必ず含めてください。

---
以下のJSON形式で添削結果を返してください：

\`\`\`json
{
  "score": 85,
  "maxScore": 100,
  "overallComment": "全体的な評価コメント（200文字程度）",
  "corrections": [
    {
      "start": 0,
      "end": 15,
      "type": "essential",
      "comment": "（キャラのしゃべり方で添削コメント）",
      "targetText": "該当部分のテキスト",
      "characterName": "みかん",
      "expression": "impressed"
    },
    {
      "start": 20,
      "end": 35,
      "type": "good",
      "comment": "（キャラのしゃべり方で良い点コメント）",
      "targetText": "該当部分のテキスト",
      "characterName": "ユズヒコ",
      "expression": "smug"
    }
  ]
}
\`\`\`

**添削タイプ説明**:
- essential: 必須論点（赤色表示）
- bonus: 加点要素（青色表示）
- good: 良い点（緑色表示）
- improve: 改善点（オレンジ色表示）
- delete: 削除推奨（グレー表示）

**注意**:
- startとendは答案テキスト内の正確な文字位置（改行は除く、0始まり、endはその直後の位置）
- 複数の添削箇所を指摘してください
- コメントは具体的で建設的に
- 100点満点で採点してください`;
}

/**
 * 🎯 AI応答解析（targetTextもパース）
 */
function parseCorrectionResponse(aiResponse, answerText) {
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
            correctionData = JSON.parse(aiResponse);
        }
        
        // 必須フィールドの検証・補完
        if (typeof correctionData.score !== 'number' || correctionData.score < 0 || correctionData.score > 100) {
            correctionData.score = 75;
        }
        if (!correctionData.maxScore || correctionData.maxScore <= 0) {
            correctionData.maxScore = 100;
        }
        if (!correctionData.overallComment) {
            correctionData.overallComment = '添削コメントを生成中です。';
        }
        if (!Array.isArray(correctionData.corrections)) {
            correctionData.corrections = [];
        }
        
        // 添削データの正規化（targetText, characterName, expression, baseNameも必ずセット）
        const cleanText = answerText.replace(/\n/g, '');
        correctionData.corrections = correctionData.corrections
            .filter(c => c && typeof c === 'object')
            .map(correction => {
                const start = Math.max(0, Math.min(correction.start || 0, cleanText.length));
                const end = Math.max(start, Math.min(correction.end || start, cleanText.length));
                let targetText = correction.targetText;
                if (!targetText) {
                    targetText = cleanText.substring(start, end);
                }
                // キャラ名・表情・baseName補完
                let characterName = correction.characterName || 'みかん';
                let expression = correction.expression || 'normal';
                let baseName = 'mikan';
                try {
                    const charObj = characters.find(c => c.name === characterName || (c.aliases && c.aliases.includes(characterName)));
                    if (charObj) baseName = charObj.baseName;
                } catch(e) {}
                return {
                    start: start,
                    end: end,
                    type: ['essential', 'bonus', 'good', 'improve', 'delete'].includes(correction.type) 
                          ? correction.type : 'improve',
                    comment: correction.comment || '添削コメント',
                    targetText: targetText,
                    characterName,
                    expression,
                    baseName
                };
            })
            .filter(c => c.start < c.end && c.end <= cleanText.length);
        
        console.log('✅ 応答解析成功:', {
            score: correctionData.score,
            correctionsCount: correctionData.corrections.length,
            cleanTextLength: cleanText.length
        });
        
        return correctionData;
        
    } catch (error) {
        console.error('❌ JSON解析エラー:', error, '\n応答内容:', aiResponse.substring(0, 500));
        return null;
    }
}

/**
 * 🎯 フォールバック添削データ生成
 */
function createFallbackCorrection(answerText) {
    console.log('🔄 フォールバック添削データ生成');
    
    const cleanText = answerText.replace(/\n/g, '');
    const corrections = [];
    
    // 最初の10文字をgoodマーク
    if (cleanText.length >= 10) {
        corrections.push({
            start: 0,
            end: 10,
            type: 'good',
            comment: '導入部分は適切です。'
        });
    }
    
    // 中間部分をimproveマーク
    if (cleanText.length >= 30) {
        const midStart = Math.floor(cleanText.length / 2) - 5;
        const midEnd = midStart + 10;
        corrections.push({
            start: midStart,
            end: midEnd,
            type: 'improve',
            comment: 'この部分の論理展開をより明確にしてください。'
        });
    }
    
    // 最後の10文字をessentialマーク
    if (cleanText.length >= 20) {
        const endStart = Math.max(cleanText.length - 15, 15);
        corrections.push({
            start: endStart,
            end: cleanText.length,
            type: 'essential',
            comment: '結論部分をより具体的に記述してください。'
        });
    }
    
    return {
        score: 70,
        maxScore: 100,
        overallComment: 'AI添削システムが一時的に利用できません。基本的な評価を表示しています。論理的な構成は見られますが、より詳細な論述が期待されます。',
        corrections: corrections
    };
}

/**
 * 🎯 添削タイプ別スタイル定義
 */
export const CORRECTION_STYLES = {
    essential: {
        background: 'linear-gradient(90deg, #ffebee 60%, #ef5350 100%)',
        border: '2px solid #d32f2f',
        color: '#d32f2f'
    },
    bonus: {
        background: 'linear-gradient(90deg, #e3f2fd 60%, #42a5f5 100%)',
        border: '2px solid #1976d2',
        color: '#1976d2'
    },
    good: {
        background: 'linear-gradient(90deg, #e8f5e8 60%, #66bb6a 100%)',
        border: '2px solid #388e3c',
        color: '#388e3c'
    },
    improve: {
        background: 'linear-gradient(90deg, #fff3e0 60%, #ffa726 100%)',
        border: '2px solid #f57c00',
        color: '#f57c00'
    },
    delete: {
        background: 'linear-gradient(90deg, #f5f5f5 60%, #bdbdbd 100%)',
        border: '2px solid #757575',
        color: '#757575'
    }
};

/**
 * 🎯 添削タイプ別アイコン
 */
export const CORRECTION_ICONS = {
    essential: '🔴',
    bonus: '🔵',
    good: '✅',
    improve: '🟠',
    delete: '❌'
};
