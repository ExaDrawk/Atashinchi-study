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
        const prompt = await createCorrectionPrompt(answerText, questionData);
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
 * module_settings.jsonの添削基準を必ず冒頭に含める
 */
async function createCorrectionPrompt(answerText, questionData) {
    // --- 科目名特定 ---
    let subject = questionData?.subject || questionData?.category || questionData?.科目 || '';
    if (!subject && questionData?.caseId) {
        subject = questionData.caseId.split('-')[0];
    }
    if (!subject && window.currentCaseData?.subject) {
        subject = window.currentCaseData.subject;
    }
    if (!subject && window.currentCaseData?.category) {
        subject = window.currentCaseData.category;
    }
    if (!subject && window.currentCaseData?.caseId) {
        subject = window.currentCaseData.caseId.split('-')[0];
    }
    subject = subject?.replace(/\s|\u3000/g, ''); // 空白除去
    let moduleSettings = null;
    let modulePrompt = '';
    if (subject) {
        try {
            const res = await fetch(`/public/cases/${subject}/module_settings.json`);
            if (res.ok) {
                moduleSettings = await res.json();
                if (moduleSettings.miniEssayPrompt) {
                    modulePrompt = `【科目別 添削基準】\n${moduleSettings.miniEssayPrompt}\n\n---\n`;
                }
            }
        } catch (e) {
            console.warn('module_settings.jsonの取得に失敗:', e);
        }
    }
    // ここでtitle, problem等を必ず定義
    const problem = questionData?.problem || questionData?.description || '法律問題';
    const title = questionData?.title || questionData?.id || '問題';
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

    // --- 条文参照ルール ---
    const articleRule = `\n\n## ⚠️【超重要】条文参照ルールの強調\n\n> **条文や法令名を文中で参照する場合は、必ず【】（全角カギカッコ）で囲むこと。**\n> \n> 例：\n> - 【民法709条】\n> - 【刑法199条】\n> - 【会社法3条】\n> - 【会社法3条3号】\n> \n> ※【】で囲まれていない条文参照は全て修正対象とする。\n\n---\n\n【注意】\nこの条文記載ルールはAIが出力する添削コメントや修正例にのみ厳格に適用してください。\n学生答案の条文表記（例：（刑法235条）「民法90条」「【民法第90条】」など）は形式の違いがあっても誤りや減点扱いにせず、内容面での正誤のみを評価してください。\n\n---\n\n### ★重要★ 添削範囲インデックス指定ルール\n\n**必ず以下2種類のインデックスを両方出力すること:**\n- start, end: 改行を除いたテキスト上の0始まりインデックス（従来通り）\n- matchStart, matchEnd: 元の答案本文（改行含む）上での1始まりインデックス（例: 173〜241文字目）\n\n**例:**\n- 答案: こんにちは木原さん。\n木原さんは誰が1番好きなの？\n- 添削箇所: 「誰」\n- start: 15, end: 16\n- matchStart: 18, matchEnd: 19\n（matchStart, matchEndは改行を含む元の答案本文での位置。1文字目=1）\n\n**必ず両方のインデックスを正確に出力してください。AIが自動で計算してください。**\n\n---\n\n### ★重要★ 条文記述の統一ルール\n\n**1. 基本的な条文記述:**\n- **【法律名○条】**形式で統一する\n- 例：【民法90条】、【刑法199条】、【憲法14条】\n\n**2. 項・号の記述:**\n- **【法律名○条○項】**：【民法424条の3第2項】\n- **【法律名○条○号】**：【民法177条1号】\n- **【法律名○条○項○号】**：【民法424条の3第2項1号】\n\n**3. 特殊な条文記述:**\n- **条の2、条の3など**：【民法424条の3】、【会社法356条の2】\n- **削除された条文**：【民法旧○条】\n- **改正前条文**：【平成○年改正前民法○条】\n\n**4. 複数条文の記述:**\n- **連続する条文**：【民法90条〜92条】\n- **複数の条文**：【民法90条・95条】\n- **異なる法律**：【民法90条】【刑法199条】\n\n**5. 法令の略記ルール:**\n- **民法** → 民法\n- **刑法** → 刑法  \n- **日本国憲法** → 憲法\n- **会社法** → 会社法\n- **民事訴訟法** → 民訴法\n- **刑事訴訟法** → 刑訴法\n- **行政事件訴訟法** → 行訴法\n- **破産法** → 破産法\n- **民事再生法** → 民再法\n\n**6. 判例引用との組み合わせ:**\n- 条文解釈を示す場合：「【民法90条】の『公序良俗』について、最判昭39.1.15は…」\n- 条文適用事例：「【刑法199条】の殺人罪が成立した事例として、最判昭32.3.7は…」\n\n**7. ストーリー内での条文言及:**\n{ type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: 'この場合、【民法90条】の公序良俗違反が問題になるわね【id:15】' }\n\n**8. 避けるべき記述:**\n- ❌「民法90条」（【】なし）\n- ❌「【第90条】」（法律名なし）\n- ❌「【民法第90条】」（「第」は不要）\n- ❌「【民法90条第1項】」（「第」は項号のみで使用）\n\n条文記述にあたって、これらのルールーを順守させること。\n`;

    return `${modulePrompt}` + `# 法律答案添削（キャラクター添削バージョン）\n\n` +
        `**問題**: ${title}\n${problem.substring(0, 2760)}\n\n` +
        `**学生答案**: \n${answerText.substring(0, 2760)}\n\n---\n` +
        `【重要】\n添削範囲の指定は、下記の例のように「改行を除いた純粋なテキストの0始まりインデックス」と「改行を含む元の答案本文上での1始まりインデックス（matchStart, matchEnd）」の両方を必ず指定してください。\n\n【例】\n答案: こんにちは木原さん。\n木原さんは誰が1番好きなの？\n→「誰」の範囲は start: 15, end: 16, matchStart: 18, matchEnd: 19 です。\n\n---\n` +
        `【区切りについて】\n添削部分は必ずしも連続している必要はありません。意味や文脈上キリの良いところで、複数のマーカーに分けて指定しても構いません。\n\n【targetTextの指定ルール】\n- targetTextは必ず文や意味の区切りの良い部分で指定してください。\n- 句読点（「、」「。」など）や文節の途中、単語の途中で始まったり終わったりしないでください。\n- targetTextが不自然な区切りや中途半端な位置にならないよう注意してください。\n\n---\n` +
        `【キャラクター添削仕様】\n- 添削コメントは必ず「あたしンち」キャラクターが吹き出しで話す形式で出力してください。\n- 各corrections要素には、"characterName"（キャラ名。下記リストから選択）、"expression"（表情。下記リストから選択）を必ず含めてください。\n- commentはキャラのしゃべり方・性格・口癖・一人称・語尾などをcharacters.jsのpersonaに厳密に従って書いてください。\n- キャラ画像・表情は「/assets/characters/{baseName}_{expression}.webp」で表示されます。\n- キャラ・表情・しゃべり方は添削内容や文脈に応じて最適なものを選んでください。\n${storyCharInstruction}\n\n` +
        `【利用可能なキャラクター一覧】\n${characterList}\n\n` +
        `【利用可能な表情一覧】\n${expressionList}\n\n` +
        `---\n【キャラクターごとの性格・話し方・口癖・一人称・設定】\n${personaList}\n\n` +
        `【厳守】\n必ず各キャラクターの一人称・語尾・口癖・性格・話し方を厳密に守ってください。キャラごとに話し方が絶対に混ざらないようにしてください。キャラの個性が出るように、personaの特徴を忠実に反映してください。\n\n---\n` +
        `【必須】\n各corrections要素には、"targetText"（該当テキスト）、"characterName"（キャラ名）、"expression"（表情）、"comment"（キャラのしゃべり方での添削コメント）、"start","end","matchStart","matchEnd"（インデックス）を必ず含めてください。\n\n---\n` +
        `以下のJSON形式で添削結果を返してください：\n\n` +
        `/*\n{\n  "score": 85,\n  "maxScore": 100,\n  "overallComment": "全体的な評価コメント（200文字程度）",\n  "corrections": [\n    {\n      "start": 0,\n      "end": 15,\n      "matchStart": 1,\n      "matchEnd": 15,\n      "type": "essential",\n      "comment": "（キャラのしゃべり方で添削コメント）",\n      "targetText": "該当部分のテキスト",\n      "characterName": "みかん",\n      "expression": "impressed"\n    },\n    {\n      "start": 20,\n      "end": 35,\n      "matchStart": 25,\n      "matchEnd": 40,\n      "type": "good",\n      "comment": "（キャラのしゃべり方で良い点コメント）",\n      "targetText": "該当部分のテキスト",\n      "characterName": "ユズヒコ",\n      "expression": "smug"\n    }\n  ]\n}\n*/\n\n` +
        `**添削タイプ説明**:\n- essential: 必須論点（赤色表示）\n- bonus: 加点要素（青色表示）\n- good: 良い点（緑色表示）\n- improve: 改善点（オレンジ色表示）\n- delete: 削除推奨（グレー表示）\n\n**注意**:\n- startとendは答案テキスト内の正確な文字位置（改行は除く、0始まり、endはその直後の位置）\n- matchStartとmatchEndは元の答案本文（改行含む）上での1始まりインデックス（endはその直後の位置）\n- 複数の添削箇所を指摘してください\n- コメントは具体的で建設的に\n- 100点満点で採点してください${articleRule}`;
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
