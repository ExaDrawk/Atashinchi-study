// chatSystem.js - チャット・対話システムモジュール（キャラクター回答の条文処理対応）

import { processArticleReferences, processAllReferences, setupArticleRefButtons } from './articleProcessor.js';
import { characters, generateLocationNarration, getGlobalRulesAsText, getGlobalHonorificRulesAsText, getStoryContextRulesAsText, getOutputFormatRules, getLocationManagementRules, getSessionTypeInstructions, getBasicConversationRules, getArticleReferenceRules, getFollowUpLocationRules, extractLocationFromCharacters } from './data/characters.js';
import { generateInitialPrompt, generateCharacterPersonaPrompt } from './data/prompts.js';
import { startInlineSpeedQuiz, stopInlineSpeedQuiz } from './inlineSpeedQuiz.js';
import { caseLoaders } from './cases/index.js';

// ★★★ ヘルパー関数 ★★★
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 🔥 【最終セーフティネット】表示直前のハイフン完全除去関数
function sanitizeDisplayText(text) {
    if (!text) return text;
    
    return text
        .replace(/---+/g, '')  // 3個以上の連続ハイフンを完全除去
        .replace(/\s*---\s*/g, ' ')  // 前後にスペースがある「---」を空白1個に置換
        .replace(/。---/g, '。')  // 句点の後の「---」を除去
        .replace(/！---/g, '！')  // 感嘆符の後の「---」を除去
        .replace(/？---/g, '？')  // 疑問符の後の「---」を除去
        .replace(/([あ-ん])---/g, '$1')  // ひらがなの後の「---」を除去
        .replace(/([ア-ン])---/g, '$1')  // カタカナの後の「---」を除去
        .replace(/([一-龠])---/g, '$1')  // 漢字の後の「---」を除去
        .replace(/\n---+\n/g, '\n')  // 改行で囲まれた「---」行を除去
        .replace(/^---+$/gm, '')  // 「---」のみの行を完全除去
        .trim();  // 前後の空白を除去
}

// ★★★ キャラクター回答の条文・Q&A参照処理（新機能） ★★★
function processCharacterDialogue(dialogueText, supportedLaws = [], questionsAndAnswers = []) {
    // ★★★ キャラクターの回答で条文を【】で囲む処理を最初に実行 ★★★
    const lawsToUse = supportedLaws.length > 0 ? [...supportedLaws, '憲法', '日本国憲法'] : [
        '憲法', '日本国憲法', '民法', '会社法', '刑法', '商法', '民事訴訟法', '刑事訴訟法', 
        '行政法', '労働基準法', '独占禁止法', '麻薬及び向精神薬取締法'
    ];
    
    const uniqueLaws = [...new Set(lawsToUse)];
    
    // 【】で囲まれていない条文パターンを検出して【】で囲む
    const lawPattern = uniqueLaws.map(law => law.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const unbracketed = new RegExp(`(?<!【)(${lawPattern})([0-9]+(?:の[0-9]+)?条(?:第?[0-9]+項)?(?:[0-9]+号)?)(?!】)`, 'g');
    
    let processedText = dialogueText.replace(unbracketed, '【$1$2】');
    
    // 🔥 【緊急】セカンダリ「---」除去処理（プロンプト禁止の限界対策）
    // キャラクター対話の最終段階でも「---」を完全除去
    processedText = processedText
        .replace(/---+/g, '')  // 3個以上の連続ハイフンを完全除去
        .replace(/\s*---\s*/g, ' ')  // 前後にスペースがある「---」を空白1個に置換
        .replace(/。---/g, '。')  // 句点の後の「---」を除去
        .replace(/！---/g, '！')  // 感嘆符の後の「---」を除去
        .replace(/？---/g, '？')  // 疑問符の後の「---」を除去
        .replace(/([あ-ん])---/g, '$1')  // ひらがなの後の「---」を除去
        .replace(/([ア-ン])---/g, '$1')  // カタカナの後の「---」を除去
        .replace(/([一-龠])---/g, '$1')  // 漢字の後の「---」を除去
        .replace(/\n---+\n/g, '\n')  // 改行で囲まれた「---」行を除去
        .replace(/^---+$/gm, '')  // 「---」のみの行を完全除去
        .trim();  // 前後の空白を除去
    
    // 【】で囲んだ後に、一度だけ統合処理を実行
    processedText = processAllReferences(processedText, supportedLaws, questionsAndAnswers);

    // {{ 強調 }} を装飾（空欄プレースホルダは禁止、内容ありの強調のみ許容）
    processedText = processedText.replace(/\{\{\s*([^{}][^}]*)\s*\}\}/g, '<span class="font-bold underline decoration-wavy decoration-rose-400/80">$1<\/span>');
    
    return processedText;
}

// ★★★ チャットセッション開始（複数小問対応） ★★★
export async function startChatSession(button, currentCaseData) {
    console.log('=== startChatSession開始 ===');
    
    // AI応答の重複防止チェック無効化（自然な会話を優先）
    console.log('� 重複防止チェックを無効化し、自然な会話を優先します');
    
    let container, inputForm, inputElement, chatArea; // 変数宣言を先頭に移動
    
    try {
        // buttonがDOM要素でない場合の処理
        if (!button || typeof button.closest !== 'function') {
            console.error('❌ button が有効なDOM要素ではありません:', button);
            throw new Error('無効なbutton要素');
        }
        
        const type = button.dataset?.type;

        if (type === 'qa') {
            await startQaChatSession(button);
            return;
        }

        const standardChatConfig = {
            story: {
                containerId: 'tab-story-content',
                inputId: 'story-question-input',
                chatAreaId: 'chat-area-story'
            },
            explanation: {
                containerId: 'tab-explanation-content',
                inputId: 'explanation-question-input',
                chatAreaId: 'chat-area-explanation'
            }
        };

        const chatConfig = standardChatConfig[type];
        if (!chatConfig) {
            console.error('❌ 未対応のチャットタイプです:', type);
            return;
        }

        container = document.getElementById(chatConfig.containerId);
        inputElement = document.getElementById(chatConfig.inputId);
        chatArea = document.getElementById(chatConfig.chatAreaId);
        inputForm = inputElement ? inputElement.closest('.input-form') : null;

    if (!inputElement || !chatArea) {
        console.error('致命的エラー: 必要なUI要素が見つかりません', { 
            type, 
            inputFormExists: !!inputForm, 
            inputElementExists: !!inputElement, 
            chatAreaExists: !!chatArea
        });
        window.isCharacterDialogueInProgress = false;
        return;
    }

    const userInput = inputElement.value.trim();
    if (userInput.length < 10) {
        alert('もう少し詳しく記述してください（10文字以上）。');
        window.isCharacterDialogueInProgress = false;
        return;
    }
    
    console.log('✅ チャットセッション要素確認完了:', {
        userInputLength: userInput.length,
        chatAreaElement: chatArea.tagName,
        inputElementType: inputElement.type
    });
    
    // 入力フォームを非表示にしてチャットエリアを表示
    if (inputForm) {
        inputForm.style.display = 'none';
    }
        chatArea.style.display = 'block';

        const sessionId = 'story';
        
        const problemText = `ストーリー内容：${currentCaseData.story.map(s => s.type === 'dialogue' ? `${s.speaker}: ${s.dialogue}` : s.text).join('\n')}`;
        const chatTitle = '💬 キャラクターと話そう';
          chatArea.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg border animate-fade-in">
                <h4 class="text-lg font-bold mb-3">${chatTitle}</h4>
                <div id="dialogue-area-${sessionId}" class="space-y-4 h-[70vh] overflow-y-auto p-4 bg-white border rounded-lg custom-scrollbar">
                    <!-- 初期表示は空 -->
                </div>
                <div class="mt-4 flex gap-2">
                    <textarea id="chat-follow-up-input-${sessionId}" class="w-full p-4 border rounded-lg focus-ring" style="height: 120px; resize: none;" placeholder="返信をどうぞ…"></textarea>
                    <button id="send-follow-up-btn-${sessionId}" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-session-id="${sessionId}">送信</button>
                </div>
            </div>        `;
        
        const initialPrompt = generateInitialPrompt(userInput, type, currentCaseData);

        if (!window.conversationHistories) window.conversationHistories = {};
        const initialMessage = { role: 'user', parts: [{ text: userInput }] };
        window.conversationHistories[sessionId] = [initialMessage];
        
        await sendMessageToAI(sessionId, initialPrompt, problemText, userInput);

    } catch (error) {
        console.error('❌ startChatSessionでエラーが発生:', error);
        if (inputForm) {
            inputForm.style.display = 'block';
        }
        if (chatArea) {
            chatArea.style.display = 'none';
            chatArea.innerHTML = '';
        }
    } finally {
        // AI応答が完了したらフラグをリセット
        window.isCharacterDialogueInProgress = false;
    }
}

// ★★★ AIとの通信を管理する中核関数 ★★★
export async function sendMessageToAI(sessionId, promptText, problemText, userInput) {
    
    try {
        const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
        if (!dialogueArea) {
            console.error('❌ dialogue-area が見つかりません:', sessionId);
            return;
        }

        console.log('🚀 sendMessageToAI開始:', { sessionId, promptLength: promptText?.length });

        // ドーナツ状ローディングアニメーション（セッションごとに1つのみ）
        const loadingId = `ai-loader-${sessionId}`;
        const existingLoader = document.getElementById(loadingId);
        if (!existingLoader) {
            const loadingHTML = `
                <div id="${loadingId}" class="text-center p-4 flex flex-col items-center justify-center">
                    <div class="donut-loader"></div>
                    <p class="text-sm text-gray-600 mt-2">AIが考えています...</p>
                </div>
            `;
            dialogueArea.insertAdjacentHTML('beforeend', loadingHTML);
        }
        dialogueArea.scrollTop = dialogueArea.scrollHeight;

        if (sessionId === 'into') {
            try {
                startInlineSpeedQuiz(window.currentCaseData, {
                    hostElement: dialogueArea,
                    loaderId: loadingId
                });
            } catch (error) {
                console.warn('⚠️ inline speed quiz start failed:', error);
            }
        }

        const history = window.conversationHistories[sessionId] || [];

        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({
                message: promptText,
                history: history,
            })
        });

        // ローディングアニメーションを一旦削除（応答取得後に表示が不要なため）
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`APIエラー: ${response.status} - ${errorData.error || '不明なエラー'}. 詳細: ${errorData.detail || 'なし'}`);
        }
        
        const result = await response.json();
    let aiResponse = result.reply || result.text || result.message || '';
        
        // 🔥 【緊急】「---」強制除去処理（プロンプト禁止の限界対策）
        // セリフの末尾や任意の場所に含まれる「---」を完全除去
        aiResponse = aiResponse
            .replace(/---+/g, '')  // 3個以上の連続ハイフンを完全除去
            .replace(/\s*---\s*/g, ' ')  // 前後にスペースがある「---」を空白1個に置換
            .replace(/。---/g, '。')  // 句点の後の「---」を除去
            .replace(/！---/g, '！')  // 感嘆符の後の「---」を除去
            .replace(/？---/g, '？')  // 疑問符の後の「---」を除去
            .replace(/([あ-ん])---/g, '$1')  // ひらがなの後の「---」を除去
            .replace(/([ア-ン])---/g, '$1')  // カタカナの後の「---」を除去
            .replace(/([一-龠])---/g, '$1')  // 漢字の後の「---」を除去
            .replace(/\n---+\n/g, '\n')  // 改行で囲まれた「---」行を除去
            .replace(/^---+$/gm, '')  // 「---」のみの行を完全除去
            .trim();  // 前後の空白を除去
        
        console.log('✅ AI応答取得（ハイフン除去後）:', { responseLength: aiResponse.length });

        // ★★★ INTO/汎用向け: 応答末尾マーカー([[SCORE:N]], [[RESPONDER:名前]])の抽出とイベント配信 ★★★
        try {
            // 末尾マーカー（SCORE/RESPONDER/Q系）の抽出値をローカル変数に保持
            // 後段の最終行形式チェック（INTO専用の軽量バリデータ）で使用する
            var extractedScore = null;
            var extractedResponder = null;
            var extractedQId = null;
            var extractedQIndex = null;
            var extractedQText = null;
            var extractedQPart = null;
            var extractedCorrector = null;
            const scoreTag = aiResponse.match(/\[\[SCORE:\s*(\d{1,3})\s*\]\]/i);
            if (scoreTag) {
                const val = parseInt(scoreTag[1], 10);
                if (!Number.isNaN(val)) extractedScore = Math.max(0, Math.min(100, val));
            }
            const responderTag = aiResponse.match(/\[\[RESPONDER:\s*([^\]]+)\]\]/i);
            if (responderTag) {
                extractedResponder = responderTag[1].trim();
            }
            const qidTag = aiResponse.match(/\[\[QID:\s*([^\]]+)\]\]/i);
            if (qidTag) {
                extractedQId = qidTag[1].trim();
            }
            const qindexTag = aiResponse.match(/\[\[QINDEX:\s*(\d+)\s*\]\]/i);
            if (qindexTag) {
                const qi = parseInt(qindexTag[1], 10);
                if (!Number.isNaN(qi)) extractedQIndex = qi;
            }
            const qtextTag = aiResponse.match(/\[\[QTEXT:\s*([^\]]+)\]\]/i);
            if (qtextTag) {
                extractedQText = qtextTag[1].trim();
            }
            const qpartTag = aiResponse.match(/\[\[QPART:\s*(\d+\s*\/\s*\d+)\s*\]\]/i);
            if (qpartTag) {
                extractedQPart = qpartTag[1].replace(/\s+/g, '');
            }
            const correctorTag = aiResponse.match(/\[\[CORRECTOR:\s*([^\]]+)\]\]/i);
            if (correctorTag) {
                extractedCorrector = correctorTag[1].trim();
            }
            // 配信（INTO側で sessionId === 'into' を受信して利用）
            window.dispatchEvent(new CustomEvent('aiResponse', {
                detail: {
                    sessionId,
                    score: extractedScore,
                    responder: extractedResponder,
                    qId: extractedQId,
                    qIndex: extractedQIndex,
                    qText: extractedQText,
                    text: aiResponse,
                    qPart: extractedQPart,
                    corrector: extractedCorrector
                }
            }));
            // 表示前にマーカーは除去
            aiResponse = aiResponse
                .replace(/\[\[SCORE:.*?\]\]/gi, '')
                .replace(/\[\[RESPONDER:.*?\]\]/gi, '')
                .replace(/\[\[SCENE_TO:.*?\]\]/gi, '')
                .replace(/\[\[QID:.*?\]\]/gi, '')
                .replace(/\[\[QINDEX:.*?\]\]/gi, '')
                .replace(/\[\[QTEXT:.*?\]\]/gi, '')
                .replace(/\[\[QPART:.*?\]\]/gi, '')
                .replace(/\[\[CORRECTOR:.*?\]\]/gi, '')
                .trim();

            // 追加セーフティ: 形式崩れの残存マーカー行や[[...]]を含む行は非表示にする
            if (aiResponse.includes('[[')) {
                aiResponse = aiResponse
                    .split(/\r?\n/)
                    .filter(line => !/\[\[.*?\]\]/.test(line))
                    .join('\n')
                    .trim();
            }
        } catch (e) {
            console.warn('⚠️ マーカー抽出に失敗:', e);
        }

        // 🔥 AI応答レベルでの重複チェック完全無効化
        // 自然な会話のため、AI応答の重複を完全に許可
        console.log('� AI応答レベルでの重複チェックを無効化し、自然な会話を優先します');

        // 文字列類似度計算関数
        function calculateSimilarity(str1, str2) {
            const len1 = str1.length;
            const len2 = str2.length;
            const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
            
            for (let i = 0; i <= len1; i++) matrix[0][i] = i;
            for (let j = 0; j <= len2; j++) matrix[j][0] = j;
            
            for (let j = 1; j <= len2; j++) {
                for (let i = 1; i <= len1; i++) {
                    const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                    matrix[j][i] = Math.min(
                        matrix[j][i - 1] + 1,
                        matrix[j - 1][i] + 1,
                        matrix[j - 1][i - 1] + indicator
                    );
                }
            }
            
            return 1 - matrix[len2][len1] / Math.max(len1, len2);
        }

    // 最終的なローディング表示も念のため削除
    const loaderToRemove = document.getElementById(`ai-loader-${sessionId}`);
    if (loaderToRemove) loaderToRemove.remove();
        
        window.conversationHistories[sessionId].push({ role: 'model', parts: [{ text: aiResponse }] });

        if (sessionId === 'into') {
            renderIntoResponse(aiResponse, sessionId);
            return;
        }

        // AIレスポンスの前処理：ナレーション部分を分離
        let processedResponse = aiResponse;

        // 余分な単独のキャラクター名行を除去（例: 「しみちゃん」だけの行）
        try {
            const nameSet = new Set((characters || []).map(c => c.name));
            processedResponse = processedResponse
                .split('\n')
                .filter(line => {
                    const t = line.trim();
                    return !(t && nameSet.has(t));
                })
                .join('\n');
        } catch {}

        // NOTE: INTO専用の強制ナレーション注入は廃止（プロンプト側で統制する）
        
        // 【ナレーション】形式の処理
        const narrationMatches = [];
        let tempResponse = processedResponse;
        
        // 【ナレーション】〜〜 の部分を抽出
        const narrationRegex = /【ナレーション】([^【]*?)(?=【|$)/g;
        let match;
        while ((match = narrationRegex.exec(processedResponse)) !== null) {
            narrationMatches.push({
                full: match[0],
                text: match[1].trim(),
                start: match.index
            });
        }
        
        // ナレーション部分を個別に処理
        for (const narration of narrationMatches) {
            tempResponse = tempResponse.replace(narration.full, `---NARRATION:${narration.text}---`);
        }
        
        // 混在したナレーション＋対話の処理（前処理で分割）- 改良版
        // ★★★ 修正: 条文参照の**記号や長いセリフを考慮した分割処理 ★★★
        
        // 1. 【ナレーション】から始まる行を先に処理
        const narrationLines = tempResponse.match(/【ナレーション】[^【\n]*(?:\n(?!【)[^【\n]*)*/g) || [];
        
        // 2. キャラクター@表情: 形式の対話行を抽出（**記号を含む可能性も考慮）
        const dialogueLines = tempResponse.match(/[^@\n]+@[^:\n]+:[^]*?(?=\n[^@\n]+@[^:\n]+:|$)/g) || [];
        
        // 3. その他のナレーション（場所描写など）
        let remainingText = tempResponse;
        narrationLines.forEach(line => {
            remainingText = remainingText.replace(line, '');
        });
        dialogueLines.forEach(line => {
            remainingText = remainingText.replace(line, '');
        });
        
        // 残ったテキストから純粋なナレーション部分を抽出
        const additionalNarrations = remainingText.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.includes('@') && !line.includes(':') && line.length > 10);
        
        // 統合された対話配列を作成
        const dialogues = [];
        
        // ナレーションを追加
        narrationLines.forEach(line => {
            dialogues.push(`---NARRATION:${line.replace('【ナレーション】', '').trim()}---`);
        });
        
        additionalNarrations.forEach(line => {
            dialogues.push(`---NARRATION:${line}---`);
        });
        
        // 対話を追加（分割しない）
        dialogueLines.forEach(line => {
            dialogues.push(line.trim());
        });
        
        // 順序を保持するため、元の応答から順番を抽出
        const orderedDialogues = [];
        const originalLines = tempResponse.split('\n');
        
        for (const originalLine of originalLines) {
            const trimmedOriginal = originalLine.trim();
            if (!trimmedOriginal) continue;
            
            // ナレーション形式の場合
            if (trimmedOriginal.startsWith('【ナレーション】')) {
                orderedDialogues.push(`---NARRATION:${trimmedOriginal.replace('【ナレーション】', '').trim()}---`);
            }
            // キャラクター対話の場合
            else if (trimmedOriginal.includes('@') && trimmedOriginal.includes(':')) {
                orderedDialogues.push(trimmedOriginal);
            }
            // その他のナレーション
            else if (trimmedOriginal.length > 10 && !trimmedOriginal.includes('@') && !trimmedOriginal.includes(':')) {
                orderedDialogues.push(`---NARRATION:${trimmedOriginal}---`);
            }
        }
        
        // 最終的な対話配列（フォールバック処理）
        const finalDialogues = orderedDialogues.length > 0 ? orderedDialogues : [tempResponse];
        
        for (const dialogue of finalDialogues) {
            await sleep(1500);
            
            // ナレーション特別処理（より厳密なチェック）
            if (dialogue.startsWith('---NARRATION:') && dialogue.endsWith('---')) {
                const narrationText = dialogue.replace('---NARRATION:', '').replace('---', '').trim();
                displayNarration(narrationText, sessionId);
            } else if (dialogue.startsWith('NARRATION:')) {
                const narrationText = dialogue.replace('NARRATION:', '').trim();
                displayNarration(narrationText, sessionId);
            } else {
                // NOTE: INTO専用の自動ナレーション挿入は廃止。AI出力のナレーションのみ表示する
                // 通常の対話処理（ナレーション混在をチェック）
                if (dialogue.includes('---NARRATION:')) {
                    // ナレーションと対話が混在している場合の分離処理
                    const parts = dialogue.split('---NARRATION:');
                    if (parts.length > 1) {
                        // 対話部分
                        if (parts[0].trim()) {
                            displaySingleDialogue(parts[0].trim(), sessionId, true);
                            await sleep(1000);
                        }
                        // ナレーション部分
                        const narrationPart = parts[1].replace('---', '').trim();
                        if (narrationPart) {
                            displayNarration(narrationPart, sessionId);
                        }
                    } else {
                        displaySingleDialogue(dialogue, sessionId, true);
                    }
                } else {
                    displaySingleDialogue(dialogue, sessionId, true);
                }
            }
        }
        
    } catch (error) {
        console.error('AI通信エラー:', error);
    const loaderToRemove = document.getElementById(`ai-loader-${sessionId}`);
    if (loaderToRemove) loaderToRemove.remove();
        
        const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
        if (dialogueArea) {
            dialogueArea.insertAdjacentHTML('beforeend', `<p class="text-red-500 p-4">エラー: ${error.message}</p>`);
        }
    } finally {
        // 最終的にローディングを確実に削除
        setTimeout(() => {
            const finalLoader = document.getElementById(`ai-loader-${sessionId}`);
            if (finalLoader) finalLoader.remove();
        }, 100);

        if (sessionId === 'into') {
            stopInlineSpeedQuiz('session-complete');
        }
        
        // AI応答が完了したらフラグをリセット
        window.isCharacterDialogueInProgress = false;
    }
}

// ★★★ 追加質問の送信 ★★★
export async function sendFollowUpMessage(sessionId) {
    const inputElement = document.getElementById(`chat-follow-up-input-${sessionId}`);
    if (!inputElement) return;

    const userMessage = inputElement.value.trim();
    if (!userMessage) return;

    displayMessage(userMessage, 'user', sessionId);
    inputElement.value = '';

    window.conversationHistories[sessionId].push({ role: 'user', parts: [{ text: userMessage }] });    // 基本の追加質問プロンプト
    const baseFollowUpPrompt = '# 指示：あなたは『あたしンち』の脚本家です\n\n' +
        'これまでの会話の流れと、ユーザーからの以下の追加発言を踏まえ、会話の【続き】を生成してください。\n\n' +
        '## ユーザーの追加発言\n' +        userMessage + '\n\n' +
        '## 【重要】回答の継続性に関する指示\n' +
        '- 2回目以降の回答では、前回の回答内容を繰り返さないこと\n' +
        '- 新たな回答部分から自然に会話を続けること\n' +
        '- 前回の回答を要約したり再掲したりしないこと\n' +
        '- 会話の流れを自然に継続させること\n\n' +
        getArticleReferenceRules() + '\n\n' +'## 【絶対厳守】出力フォーマット指示\n' +        '出力は必ず以下の形式を厳守してください：\n' +
        '- キャラクター名@表情: セリフ内容---\n' +
        '- 複数キャラクターの場合は各行に1人ずつ記述\n' +
        '- ナレーションは【ナレーション】形式で冒頭に配置\n' +        '- 上記以外の形式での出力は絶対禁止\n\n' +        getFollowUpLocationRules() + '\n\n' +
        getBasicConversationRules() + '\n\n' +
        '今すぐ、上記の全ルールを遵守し、会話の続きを生成してください。';

    // キャラクター情報を統合したプロンプトを生成（簡易版）
    const { problemText, userInput, qaMeta } = getProblemInfoFromHistory(sessionId);

    let followUpPrompt = baseFollowUpPrompt;
    let problemContext = problemText;
    let userContext = userInput;

    if (qaMeta) {
        const recentSummary = buildRecentQaSummary(sessionId);
        followUpPrompt = buildQaFollowUpPrompt(qaMeta, userMessage, recentSummary);
        problemContext = qaMeta.question;
        userContext = qaMeta.initialUserMessage || userMessage;
    }

    await sendMessageToAI(sessionId, followUpPrompt, problemContext, userContext);
}

function escapeIntoHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderIntoResponse(responseText, sessionId) {
    if (!responseText) return;
    const lines = responseText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    for (const line of lines) {
        displayIntoDialogueLine(line, sessionId);
    }
}

function displayIntoDialogueLine(line, sessionId) {
    const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
        if (!dialogueArea) return;
    
        const trimmed = line.trim();
        if (!trimmed) return;
    
        const isScrolledToBottom = dialogueArea.scrollHeight - dialogueArea.clientHeight <= dialogueArea.scrollTop + 1;
    
        const colonMatch = trimmed.match(/^([^:：]+)[:：]\s*(.*)$/);
        if (!colonMatch) {
            const safeNarration = escapeIntoHtml(trimmed);
            dialogueArea.insertAdjacentHTML('beforeend', `
                <div class="my-3 animate-fade-in">
                    <div class="text-sm text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 rounded">${safeNarration}</div>
                </div>
            `);
            if (isScrolledToBottom) {
                dialogueArea.scrollTop = dialogueArea.scrollHeight;
            }
            return;
        }
    
        let speakerToken = colonMatch[1].trim();
        const bodyText = colonMatch[2].trim();
    
        let speakerName = speakerToken;
        let expression = 'normal';
        const atIndex = speakerToken.indexOf('@');
        if (atIndex >= 0) {
            speakerName = speakerToken.slice(0, atIndex).trim();
            expression = speakerToken.slice(atIndex + 1).trim() || 'normal';
        }
    
        const character = characters.find(c => c.name === speakerName || (c.aliases && c.aliases.includes(speakerName)));
        const rightSideCharacters = window.currentCaseData?.rightSideCharacters || ['みかん', '母', '父'];
        const safeMessage = escapeIntoHtml(bodyText);
        const safeSpeaker = escapeIntoHtml(character ? character.name : speakerName);
        const safeOriginal = escapeIntoHtml(trimmed);
        let isRightSide = false;
        let iconHtml = '';
    
        if (!character) {
            const safeSpeaker = escapeIntoHtml(speakerName);
            const safeOriginal = escapeIntoHtml(trimmed);
            dialogueArea.insertAdjacentHTML('beforeend', `
                <div class="my-3 animate-fade-in">
                    <div class="bg-red-100 border border-red-300 rounded-lg p-3 max-w-[75%]">
                        <p class="font-bold text-sm text-red-700">無効な話者名</p>
                        <p class="text-sm text-red-600">${safeSpeaker} は登録キャラクターではありません。INTOモードでは既存キャラクター以外の進行役・語り手は許可されていません。</p>
                        <p class="text-xs text-red-500 mt-2 break-all">受信した行: ${safeOriginal}</p>
                    </div>
                </div>
            `);
            if (isScrolledToBottom) {
                dialogueArea.scrollTop = dialogueArea.scrollHeight;
            }
            return;
        }

        const finalExpression = character.availableExpressions && character.availableExpressions.includes(expression)
            ? expression
            : 'normal';
        const iconSrc = `/images/${character.baseName}_${finalExpression}.png`;
        const fallbackSrc = `/images/${character.baseName}_normal.png`;
        const onErrorAttr = `this.src='${fallbackSrc}'; this.onerror=null;`;
        const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";
        isRightSide = rightSideCharacters.includes(character.name);
        const extraStyle = isRightSide ? 'transform: scaleX(-1);' : '';
        iconHtml = `<img src="${iconSrc}" alt="${safeSpeaker}" style="${imageStyle} ${extraStyle}" onerror="${onErrorAttr}">`;
    
        let messageHtml;
        if (isRightSide) {
            messageHtml = `
                <div class="flex justify-end items-start gap-3 my-3 animate-fade-in">
                    <div class="bg-green-100 p-3 rounded-lg shadow max-w-[75%]">
                        <p class="font-bold text-sm text-green-800">${safeSpeaker}</p>
                        <p class="text-sm dialogue-content">${safeMessage}</p>
                        <div class="hidden original-content">${safeOriginal}</div>
                    </div>
                    ${iconHtml}
                </div>
            `;
        } else {
            messageHtml = `
                <div class="flex items-start gap-3 my-3 animate-fade-in">
                    ${iconHtml}
                    <div class="bg-white p-3 rounded-lg shadow border max-w-[75%]">
                        <p class="font-bold text-sm text-gray-800">${safeSpeaker}</p>
                        <p class="text-sm dialogue-content">${safeMessage}</p>
                        <div class="hidden original-content">${safeOriginal}</div>
                    </div>
                </div>
            `;
        }
    
        dialogueArea.insertAdjacentHTML('beforeend', messageHtml);
        setupArticleRefButtons(dialogueArea);
    
        if (isScrolledToBottom) {
            dialogueArea.scrollTop = dialogueArea.scrollHeight;
        }
}

// ★★★ ナレーション処理関数 ★★★
function processNarration(text, sessionId) {
    const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
    if (!dialogueArea) return false;
    
    // 【ナレーション】形式を検出
    const narrationMatch = text.match(/^【ナレーション】(.+)/);
    if (narrationMatch) {
        const narrationText = narrationMatch[1].trim();
        dialogueArea.insertAdjacentHTML('beforeend', `
            <div class="my-4 animate-fade-in">
                <div class="text-center">
                    <p class="text-gray-600 italic bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 inline-block max-w-lg mx-auto text-sm">
                        ${narrationText}
                    </p>
                </div>
            </div>
        `);
        // ナレーション表示時は自動スクロールしない
        return { processed: true, remainingDialogue: null };
    }
    
    // より厳密なナレーション部分の検出
    // パターン1: 「場所名。説明文。 キャラクター名@表情:」
    const locationDialogueMatch = text.match(/^(.+?。.+?。)\s+([^。]+@[^:]+:.*)$/);
    if (locationDialogueMatch) {
        const narrationPart = locationDialogueMatch[1].trim();
        const dialoguePart = locationDialogueMatch[2].trim();
        
        // ナレーション部分を表示
        dialogueArea.insertAdjacentHTML('beforeend', `
            <div class="my-4 animate-fade-in">
                <div class="text-center">
                    <p class="text-gray-600 italic bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 inline-block max-w-lg mx-auto text-sm">
                        ${narrationPart}
                    </p>
                </div>
            </div>
        `);
        
        // 対話部分は後続で処理される（再帰呼び出しを削除）
        // 修正された対話テキストを返す
        return { processed: true, remainingDialogue: dialoguePart };
    }
    
    // パターン2: 純粋なナレーション（「。」で終わるが「@」「:」を含まない）
    if (text.endsWith('。') && !text.includes('@') && !text.includes(':')) {
        dialogueArea.insertAdjacentHTML('beforeend', `
            <div class="my-4 animate-fade-in">
                <div class="text-center">
                    <p class="text-gray-600 italic bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 inline-block max-w-lg mx-auto text-sm">
                        ${text}
                    </p>
                </div>
            </div>
        `);
        // ナレーション表示時は自動スクロールしない
        return { processed: true, remainingDialogue: null };
    }
    
    return { processed: false, remainingDialogue: null };
}

// ★★★ ナレーション表示専用関数 ★★★
function displayNarration(narrationText, sessionId) {
    const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
    if (!dialogueArea) return;
    
    dialogueArea.insertAdjacentHTML('beforeend', `
        <div class="my-4 animate-fade-in">
            <div class="text-center">
                <p class="text-gray-600 italic bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 inline-block max-w-lg mx-auto text-sm">
                    ${narrationText}
                </p>
            </div>
        </div>
    `);
    // ナレーション表示時は自動スクロールしない
}

// ★★★ 単一対話の表示（キャラクター回答の条文処理対応＋重複排除強化） ★★★
function displaySingleDialogue(dialogue, sessionId, skipNarration = false) {
    const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
    if (!dialogueArea) {
        console.error(`displaySingleDialogueエラー: 対話エリア(dialogue-area-${sessionId})が見つかりません。`);
        return;
    }

    const trimmedDialogue = dialogue.trim();
    if (!trimmedDialogue) {
        console.warn('空の対話メッセージはスキップされました。');
        return;
    }

    // 🔥 重複チェック無効化: 自然な会話のため重複を完全に許可
    // 同じキャラクターの連続発言や類似内容の繰り返しを自然な会話として許可
    // const existingOriginals = dialogueArea.querySelectorAll('.original-content');
    // const existingVisibleText = dialogueArea.querySelectorAll('.dialogue-message, .dialogue-speaker, h5');
    
    // 重複チェック機能を完全に無効化
    console.log('� 重複チェックを無効化し、自然な会話を優先します');

    // 先に「台詞の形式」を判定（キャラクター名@表情: セリフ or キャラクター名: セリフ）
    const looksLikeDialogue = /^([^@\n]+@[^:\n]+|[^:\n]{1,20})[:：]\s+/.test(trimmedDialogue);

    // 台詞らしくない場合のみ、ナレーション処理を試行
    if (!skipNarration && !looksLikeDialogue) {
        const narrationResult = processNarration(trimmedDialogue, sessionId);
        if (narrationResult && narrationResult.processed) {
            if (narrationResult.remainingDialogue) {
                displaySingleDialogue(narrationResult.remainingDialogue, sessionId, true);
            }
            return;
        }
    }

    const isScrolledToBottom = dialogueArea.scrollHeight - dialogueArea.clientHeight <= dialogueArea.scrollTop + 1;

    // ★★★ 改良されたコロン検出（条文参照の**記号に対応） ★★★
    let colonIndex = -1;
    let speakerPart = '';
    let dialogueText = '';
    
    // 1. 通常のコロン":"を検索
    colonIndex = trimmedDialogue.indexOf(':');
    
    // 2. 全角コロン"："も検索
    if (colonIndex <= 0) {
        colonIndex = trimmedDialogue.indexOf('：');
    }
    
    // 3. より詳細な解析（@記号を含むキャラクター名形式）
    if (colonIndex <= 0) {
        const speakerMatch = trimmedDialogue.match(/^([^@\n]+@[^:\n]+)[:：]\s*(.*)/s);
        if (speakerMatch) {
            speakerPart = speakerMatch[1].trim();
            dialogueText = speakerMatch[2].trim();
        } else {
            // 4. @記号なしでもキャラクター名らしき部分を検索
            const simpleMatch = trimmedDialogue.match(/^([^:\n]{1,20})[:：]\s*(.*)/s);
            if (simpleMatch && !simpleMatch[1].includes('**') && !simpleMatch[1].includes('【')) {
                speakerPart = simpleMatch[1].trim();
                dialogueText = simpleMatch[2].trim();
            } else {
                // エラー表示
                console.warn('🚫 コロン検出失敗:', trimmedDialogue.substring(0, 100));
                dialogueArea.insertAdjacentHTML('beforeend', `
                    <div class="my-3 animate-fade-in"><div class="bg-red-100 p-3 rounded-lg border border-red-300">
                        <p class="font-bold text-sm text-red-700">AIのフォーマットエラー</p>
                        <p class="text-sm text-red-600">セリフの形式が不正です（適切なコロン":"が見つかりません）。</p>
                        <p class="text-xs text-red-500 break-all mt-1">受信内容: "${trimmedDialogue.substring(0, 200)}${trimmedDialogue.length > 200 ? '...' : ''}"</p>
                        <p class="text-xs text-blue-600 mt-1"><b>期待形式:</b> キャラクター名@表情: セリフ内容</p>
                    </div></div>`);
                dialogueArea.scrollTop = dialogueArea.scrollHeight;
                return;
            }
        }
    } else {
        // 通常のコロン検出が成功した場合
        speakerPart = trimmedDialogue.substring(0, colonIndex).trim();
        dialogueText = trimmedDialogue.substring(colonIndex + 1).trim();
    }
    
    // 4. 具体的な発言内容の重複チェック
    const existingDialogues = dialogueArea.querySelectorAll('.dialogue-message');
    for (const existing of existingDialogues) {
        if (existing.textContent.trim() === dialogueText.trim()) {
            console.warn('🚫 同じ発言内容の重複をスキップ:', dialogueText.substring(0, 50));
            return;
        }
    }
    
    // 5. 話者と発言の組み合わせ重複チェック
    const lastDialogueGroup = dialogueArea.querySelector('.dialogue-group:last-child');
    if (lastDialogueGroup) {
        const lastSpeaker = lastDialogueGroup.querySelector('.dialogue-speaker')?.textContent?.trim();
        const lastMessage = lastDialogueGroup.querySelector('.dialogue-message')?.textContent?.trim();
        
        if (lastSpeaker === speakerPart && lastMessage === dialogueText) {
            console.warn('🚫 同一話者・同一発言の重複をスキップ:', speakerPart, dialogueText.substring(0, 30));
            return;
        }
    }
    
    // ★★★ 改良された@記号検出（より寛容な処理） ★★★
    let atIndex = speakerPart.indexOf('@');
    let speakerName = '';
    let expression = 'normal';
    
    if (atIndex > 0) {
        // 通常の@記号検出が成功
        speakerName = speakerPart.substring(0, atIndex).trim();
        expression = speakerPart.substring(atIndex + 1).trim();
    } else {
        // @記号がない場合、speakerPart全体をキャラクター名として扱う
        speakerName = speakerPart.trim();
        expression = 'normal';
        
        console.warn('⚠️ @記号が見つかりません。デフォルト表情(normal)を使用:', speakerName);
    }
    
    // 空の表情の場合はnormalを使用
    if (!expression || expression.trim() === '') {
        expression = 'normal';
    }

    const character = characters.find(c => 
        c.name === speakerName || (c.aliases && c.aliases.includes(speakerName))
    );
    
    if (!character) {
        // ★★★ 未登録キャラクターの場合、デフォルト設定で画像なしで表示 ★★★
        console.warn('⚠️ 未登録キャラクター:', speakerName, '- 画像なしで表示します');
        
        // デフォルトのキャラクター情報を作成
        const defaultCharacter = {
            name: speakerName,
            baseName: 'unknown', // 画像なしを示す
            availableExpressions: ['normal'],
            rightSide: false
        };
        
        // 画像なしで表示するためのHTMLを生成
        const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";
        const iconHtml = `<div style="${imageStyle} background: linear-gradient(135deg, #f3f4f6, #e5e7eb); display: flex; align-items: center; justify-content: center; color: #6b7280; font-weight: bold; font-size: 12px;">?</div>`;
        
        // キャラクターのセリフ内の条文・Q&A参照もボタン化＋太字デコレーション（強化版）
        let processedDialogueText = processCharacterDialogue(dialogueText, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || []);
        
        // 🔥 【最終セーフティネット】表示直前の「---」完全除去処理
        processedDialogueText = sanitizeDisplayText(processedDialogueText);
        
        // **で囲まれた部分をおしゃれな太字スタイルに変換
        processedDialogueText = processedDialogueText.replace(/\*\*(.*?)\*\*/g, '<span class="inline-block bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-extrabold text-lg shadow-sm px-1 py-0.5 rounded" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1);">$1</span>');
        
        const messageHtml = `
            <div class="flex items-start gap-3 my-3 animate-fade-in">
                ${iconHtml}
                <div class="bg-white p-3 rounded-lg shadow border max-w-[75%]">
                    <p class="font-bold text-sm text-gray-800">${defaultCharacter.name}</p>
                    <p class="text-sm dialogue-content">${processedDialogueText}</p>
                    <div class="hidden original-content">${trimmedDialogue}</div>
                </div>
            </div>
        `;
        
        dialogueArea.insertAdjacentHTML('beforeend', messageHtml);
        
        // 新しく追加された条文参照ボタンのイベントリスナーを設定
        setupArticleRefButtons(dialogueArea);
        
        if (isScrolledToBottom) {
            dialogueArea.scrollTop = dialogueArea.scrollHeight;
        }
        return;
    }

    const finalExpression = character.availableExpressions && character.availableExpressions.includes(expression) ? expression : 'normal';
    const iconSrc = `/images/${character.baseName}_${finalExpression}.png`;
    const fallbackSrc = `/images/${character.baseName}_normal.png`;
    const onErrorAttribute = `this.src='${fallbackSrc}'; this.onerror=null;`;
    
    // 現在のケースのrightSideCharacters設定を参照
    const rightSideCharacters = window.currentCaseData?.rightSideCharacters || ['みかん', '母', '父'];
    const isRightSide = rightSideCharacters.includes(character.name);
    
    const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";
    const iconTransform = isRightSide ? 'transform: scaleX(-1);' : '';
    const iconHtml = `<img src="${iconSrc}" alt="${character.name}" style="${imageStyle} ${iconTransform}" onerror="${onErrorAttribute}">`;    // ★★★ キャラクターのセリフ内の条文・Q&A参照もボタン化＋太字デコレーション（強化版） ★★★
    let processedDialogueText = processCharacterDialogue(dialogueText, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || []);
    
    // 🔥 【最終セーフティネット】表示直前の「---」完全除去処理
    processedDialogueText = sanitizeDisplayText(processedDialogueText);
    
    
    // **で囲まれた部分をおしゃれな太字スタイルに変換
    processedDialogueText = processedDialogueText.replace(/\*\*(.*?)\*\*/g, '<span class="inline-block bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-extrabold text-lg shadow-sm px-1 py-0.5 rounded" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1);">$1</span>');
    
    let messageHtml;
    if (isRightSide) {
        messageHtml = `
            <div class="flex justify-end items-start gap-3 my-3 animate-fade-in">
                <div class="bg-green-100 p-3 rounded-lg shadow max-w-[75%]">
                    <p class="font-bold text-sm text-green-800">${character.name}</p>
                    <p class="text-sm dialogue-content">${processedDialogueText}</p>
                    <div class="hidden original-content">${trimmedDialogue}</div>
                </div>
                ${iconHtml}
            </div>
        `;
    } else {
        messageHtml = `
            <div class="flex items-start gap-3 my-3 animate-fade-in">
                ${iconHtml}
                <div class="bg-white p-3 rounded-lg shadow border max-w-[75%]">
                    <p class="font-bold text-sm text-gray-800">${character.name}</p>
                    <p class="text-sm dialogue-content">${processedDialogueText}</p>
                    <div class="hidden original-content">${trimmedDialogue}</div>
                </div>
            </div>
        `;
    }    dialogueArea.insertAdjacentHTML('beforeend', messageHtml);
    
    // 新しく追加された条文参照ボタンのイベントリスナーを設定
    setupArticleRefButtons(dialogueArea);

    if (isScrolledToBottom) {
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
    }
}

// 外部モジュール用: 任意のキャラクター発話を既存の描画ロジックで表示
export function displayExternalDialogue(sessionId, speakerName, text, expression = 'normal') {
    const line = `${speakerName}@${expression}: ${text}`;
    displaySingleDialogue(line, sessionId, true);
}

// 外部モジュール用: 任意のナレーション行を既存の描画ロジックで表示
export function displayExternalNarration(sessionId, narrationText) {
    displayNarration(narrationText, sessionId);
}

// ★★★ メッセージ表示 ★★★
function displayMessage(message, type, sessionId) {
    const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
    if (!dialogueArea) return;

    let messageHtml = '';
    if (type === 'user') {
        messageHtml = `<div class="flex justify-end my-3 animate-fade-in"><div class="bg-blue-500 text-white p-3 rounded-lg shadow max-w-[80%]"><p class="text-sm">${message}</p></div></div>`;
    } else if (type === 'error') {
        messageHtml = `<div class="my-3 animate-fade-in"><div class="p-4 rounded-lg bg-red-100 text-red-700 border border-red-300"><p class="text-sm">${message}</p></div></div>`;
    }
    
    if (messageHtml) {
        dialogueArea.insertAdjacentHTML('beforeend', messageHtml);
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
    }
}

// ★★★ ヘルパー関数 ★★★
function getProblemInfoFromHistory(sessionId) {
    if (sessionId && sessionId.startsWith('qa-') && window.qaChatMetadata?.[sessionId]) {
        const meta = window.qaChatMetadata[sessionId];
        return {
            problemText: meta.question,
            userInput: meta.initialUserMessage || '',
            qaMeta: meta
        };
    }

    const history = window.conversationHistories[sessionId];
    if (!history || history.length === 0) {
        return { problemText: null, userInput: null, qaMeta: null };
    }

    const initialPrompt = history[0].parts[0].text;
    const problemMatch = initialPrompt.match(/【材料】\s*-\s*問題:\s*([\s\S]*?)\s*-\s*模範解答の骨子:/);
    const userMatch = initialPrompt.match(/-\s*ユーザーの答案:\s*([\s\S]*?)\s*##/);
    
    const problemText = problemMatch ? problemMatch[1].trim() : '（問題文の取得に失敗）';
    const userInput = userMatch ? userMatch[1].trim() : '（答案の取得に失敗）';

    return { problemText, userInput, qaMeta: null };
}


// ★★★ チャットセッション終了 ★★★
export function endChatSession(sessionId) {
    console.log('🔚 チャットセッション終了:', sessionId);
    
    // 通常のチャットエリアを非表示
    const chatArea = document.querySelector(`#chat-area-${sessionId}`);
    if (chatArea) {
        chatArea.style.display = 'none';
        chatArea.innerHTML = '';
    }
    
    // 対話エリアを非表示
    const dialogueArea = document.querySelector(`#dialogue-area-${sessionId}`);
    if (dialogueArea) {
        dialogueArea.innerHTML = '';
    }
    
    // 埋め込みチャットエリアを非表示
    const embeddedChatArea = document.getElementById('embedded-chat-area');
    if (embeddedChatArea && sessionId === 'embedded-dialogue') {
        embeddedChatArea.style.display = 'none';
        embeddedChatArea.innerHTML = '';
    }
    
    // 入力フォームを復元
    const inputForm = document.querySelector(`#input-form-${sessionId}`);
    if (inputForm) {
        inputForm.style.display = 'block';
    }
    
    // 会話履歴をクリア
    if (window.conversationHistories && window.conversationHistories[sessionId]) {
        delete window.conversationHistories[sessionId];
    }

    if (sessionId && sessionId.startsWith('qa-')) {
        const qaSlot = document.querySelector(`.qa-chat-slot[data-active-session-id="${sessionId}"]`);
        if (qaSlot) {
            qaSlot.classList.add('hidden');
            qaSlot.classList.remove('qa-chat-open');
            qaSlot.innerHTML = '';
            qaSlot.dataset.activeSessionId = '';
        }
        if (window.qaChatMetadata && window.qaChatMetadata[sessionId]) {
            delete window.qaChatMetadata[sessionId];
        }
    }
    
    console.log('✅ チャットセッション終了完了:', sessionId);
}

// ★★★ チャットセッションリセット ★★★
export function resetChatSession(sessionId) {
    console.log('🔄 チャットセッションリセット:', sessionId);
    
    // 通常のチャットエリアを表示
    const chatArea = document.querySelector(`#chat-area-${sessionId}`);
    if (chatArea) {
        chatArea.style.display = 'block';
    }
    
    // 対話エリアを表示
    const dialogueArea = document.querySelector(`#dialogue-area-${sessionId}`);
    if (dialogueArea) {
        dialogueArea.style.display = 'block';
    }
    
    // 埋め込みチャットエリアを表示
    const embeddedChatArea = document.getElementById('embedded-chat-area');
    if (embeddedChatArea && sessionId === 'embedded-dialogue') {
        embeddedChatArea.style.display = 'block';
    }
    
    // 入力フォームを非表示
    const inputForm = document.querySelector(`#input-form-${sessionId}`);
    if (inputForm) {
        inputForm.style.display = 'none';
    }
    
    // 会話履歴をクリア
    if (window.conversationHistories && window.conversationHistories[sessionId]) {
        delete window.conversationHistories[sessionId];
    }
    
    console.log('✅ チャットセッションリセット完了:', sessionId);
}

// INTOモード用: 既存ストーリー整合の1行ナレーションを生成（フロント側フォールバック）
function getStoryCharacterNamesFromCurrentCase() {
    try {
        const names = new Set();
        const st = window.currentCaseData?.story;
        if (Array.isArray(st)) {
            st.forEach(s => { if (s && s.type === 'dialogue' && s.speaker) names.add(s.speaker); });
        }
        return Array.from(names);
    } catch { return []; }
}

function deriveIntoNarration(firstSpeaker = '') {
    // 1) 既存ストーリーのナレーションがあれば最初の1文を採用
    try {
        const story = window.currentCaseData?.story;
        if (Array.isArray(story)) {
            const firstNarr = story.find(s => s && s.type !== 'dialogue' && typeof s.text === 'string' && s.text.trim());
            if (firstNarr) {
                const text = firstNarr.text.trim();
                // 最初の句点までをナレーションとして採用
                const idx = text.indexOf('。');
                if (idx > 0) return text.slice(0, idx + 1);
                return text.length > 40 ? text.slice(0, 40) + '。' : text + (text.endsWith('。') ? '' : '。');
            }
        }
    } catch {}

    // 2) ナレーションがなければ、場所＋登場キャラで具体的に組み立て
    const names = getStoryCharacterNamesFromCurrentCase();
    let locationPhrase = '';
    try {
        const info = extractLocationFromCharacters ? extractLocationFromCharacters(names) : null;
        if (info?.location) locationPhrase = `${info.location}。`;
    } catch {}
    let subject = '';
    if (firstSpeaker) {
        const other = (names || []).find(n => n !== firstSpeaker);
        subject = other ? `${firstSpeaker}は${other}に向き直る。` : `${firstSpeaker}は姿勢を正す。`;
    } else if (names && names.length >= 2) {
        subject = `${names[0]}と${names[1]}は顔を見合わせる。`;
    } else if (names && names.length === 1) {
        subject = `${names[0]}は周囲を見渡す。`;
    } else {
        subject = '静かな空気の中、会話が始まる。';
    }
    return `${locationPhrase}${subject}`.trim();
}

const DEFAULT_QA_CHAT_CHARACTERS = ['ユズヒコ', 'みかん', 'しみちゃん', '母'];
const moduleCharacterCache = {};

function createCoverageChecklist(answerText = '') {
    if (!answerText) return [];
    const normalized = answerText
        .replace(/\{\{([^}]+)\}\}/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    const segments = normalized.split(/[。\n]/).map(seg => seg.trim()).filter(Boolean);
    const uniqueSegments = [];
    segments.forEach(seg => {
        if (!uniqueSegments.includes(seg)) {
            uniqueSegments.push(seg);
        }
    });
    return uniqueSegments;
}

function formatCoverageChecklist(items = []) {
    if (!items.length) {
        return '設問全体の論点・効果・要件をすべて確認し、欠落がないよう対話を設計する。';
    }
    return items.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
}

function buildRecentQaSummary(sessionId, maxEntries = 6) {
    const history = window.conversationHistories?.[sessionId];
    if (!history || !history.length) return '';
    const slice = history.slice(-maxEntries);
    return slice.map(entry => {
        const roleLabel = entry.role === 'model' ? 'AI' : 'USER';
        const text = entry.parts?.map(part => part.text).join(' ').trim() || '';
        return `${roleLabel}: ${text}`;
    }).join('\n');
}

function decodeDatasetValue(value = '') {
    if (!value) return '';
    try {
        return decodeURIComponent(value);
    } catch (error) {
        console.warn('⚠️ data属性のdecodeに失敗しました:', error);
        return value;
    }
}

function extractBlanksFromAnswer(answerText = '') {
    const blanks = [];
    if (!answerText) return blanks;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = regex.exec(answerText)) !== null) {
        blanks.push(match[1].trim());
    }
    return blanks;
}

function extractStorySpeakers(story = []) {
    if (!Array.isArray(story)) return [];
    return story
        .filter(item => item?.type === 'dialogue' && item.speaker)
        .map(item => item.speaker?.trim())
        .filter(Boolean);
}

async function determineQaChatCharacters(moduleId) {
    const cacheKey = moduleId || '__default__';
    if (moduleCharacterCache[cacheKey]) {
        return moduleCharacterCache[cacheKey];
    }

    const uniqueTrimmed = (list = []) => [...new Set(list.map(name => name?.trim()).filter(Boolean))];
    let storyCharacters = [];

    if (moduleId && window.currentCaseData?.id === moduleId) {
        storyCharacters = extractStorySpeakers(window.currentCaseData.story);
        if (!storyCharacters.length && window.currentCaseData?.rightSideCharacters?.length) {
            storyCharacters = [...window.currentCaseData.rightSideCharacters];
        }
    }

    if (!storyCharacters.length && moduleId) {
        try {
            const loader = (window.caseLoaders || caseLoaders)?.[moduleId];
            if (typeof loader === 'function') {
                const mod = await loader();
                const moduleData = mod?.default;
                storyCharacters = extractStorySpeakers(moduleData?.story);
                if (!storyCharacters.length && moduleData?.rightSideCharacters?.length) {
                    storyCharacters = [...moduleData.rightSideCharacters];
                }
            }
        } catch (error) {
            console.warn(`⚠️ QAチャット用キャラクター取得失敗: ${moduleId}`, error);
        }
    }

    if (!storyCharacters.length) {
        storyCharacters = extractStorySpeakers(window.currentCaseData?.story);
    }
    if (!storyCharacters.length && window.currentCaseData?.rightSideCharacters?.length) {
        storyCharacters = [...window.currentCaseData.rightSideCharacters];
    }
    if (!storyCharacters.length) {
        storyCharacters = [...DEFAULT_QA_CHAT_CHARACTERS];
    }

    const normalized = uniqueTrimmed(storyCharacters).slice(0, 4);
    moduleCharacterCache[cacheKey] = normalized;
    return normalized;
}

function buildQaInitialPrompt(meta) {
    const characterList = meta.characters.join('、');
    const personaPrompt = generateCharacterPersonaPrompt(meta.characters);
    const locationCue = generateLocationNarration(meta.characters) || '';
    const answerDigest = (meta.answer || '').replace(/\s+/g, ' ').trim() || 'モデル答案は登録されていません。';

    const coverageText = formatCoverageChecklist(meta.coverageChecklist);

    return `# 指示: 『あたしンち』キャラクターがソクラテス式で理解確認を行う

## モジュール概要
- 設問: ${meta.question}
- モジュール: ${meta.moduleTitle || meta.moduleId}
- ランク: ${meta.rank || '不明'} / ステータス: ${meta.status || '未'}
- モデル答案の要点: ${answerDigest}

## 登場人物とペルソナ
${personaPrompt}

## 世界観と会話ルール
${getGlobalRulesAsText()}

${getGlobalHonorificRulesAsText()}

${getBasicConversationRules()}

${getLocationManagementRules()}

${locationCue}

## 学習ゴール（単語当ては禁止）
1. ${characterList} は、穴埋めではなく **説明** と **理由付け** を引き出す質問を行うこと。
2. 問題文全体を踏まえ、問いの趣旨・法的効果・要件の因果関係を利用者に語らせること。
3. 一度に複数論点を詰め込まず、ターンごとに一つの論点を掘り下げ、最後は必ず追加の問いで締めること。
4. モデル答案の表現を丸写しせず、ヒントや比喩で方向づけること。

## カバレッジ必達項目
${coverageText}
- 会話の進行中に上記すべての項目を確認し、抜けがあれば次の問いで補完すること。

## ユーザー参加の演出（重要）
- 各ターンの締めに、ユーザーが回答すべきキャラクター名と状態を示す行（例: \`ユズヒコ@thinking: （ユーザーの回答を待つ）\`）を必ず出力する。
- その行ではAIは説明やヒントを追加せず、ユーザーへの指示だけを記載する。
- どのキャラクターがユーザーの代弁者になるかは、設問との親和性に応じて毎回選ぶ。

## 進め方
1. 導入: 問題の核心を利用者に言葉でまとめさせる質問をする。
2. 中盤: 「定義」「趣旨」「比較」「典型事例」「例外」のような観点から、理解を測る質問を順番に提示する。
3. 終盤: 利用者が自分の結論を再構築できるよう、論理の全体像を確認する問いを投げかける。

## 絶対禁止
- 単語リストの羅列や穴埋め指示。
- 模範解答の全文提示。
- キャラクター性・呼称・口調の逸脱。
- 質問を投げかけずに会話を終わらせること。
- ユーザーが説明すべき核心部分をAIが先に回答してしまうこと。
- 既に扱った導入・ナレーションを繰り返して会話をリセットすること。

## 出力フォーマット
${getOutputFormatRules('qa')}
`;
}

function buildQaFollowUpPrompt(meta, userMessage, recentSummary = '') {
    const personaPrompt = generateCharacterPersonaPrompt(meta.characters);
    const answerDigest = (meta.answer || '').replace(/\s+/g, ' ').trim() || 'モデル答案は登録されていません。';
    const coverageText = formatCoverageChecklist(meta.coverageChecklist);

    return `# 指示: Q&Aチャット継続 (${meta.moduleTitle || meta.moduleId} / Q${meta.qaId})

${personaPrompt}

## 状況整理
- 設問: ${meta.question}
- モデル答案の要点: ${answerDigest}
- 直前の利用者メモ: ${userMessage}

## 直近の会話ログ
${recentSummary || '（直近ログなし）'}

## 進行ルール
1. 各キャラクターは一つの論点に絞った問いを投げ、必ず新しい視点を加える。
2. 単語暗記ではなく、因果関係や適用場面を説明させる質問で理解を確認する。
3. 模範解答の語句をそのまま提示せず、たとえ話や具体例で方向付ける。
4. 会話は常に質問で終え、利用者に思考を委ねる。
5. 直近ログの続きを自然につなぎ、新しい導入や不必要なナレーションのやり直しは禁止。

## カバレッジ誓約
${coverageText}
- 未触及の項目があれば、次の問いで必ず取り上げる。

## ユーザー参加の演出
- 各ターンの最後に、ユーザーが演じるキャラクターと「（ユーザーの回答を待つ）」を示す行を必ず出力する。
- その行ではAIが追加情報を述べず、ユーザーへのバトン渡しだけを行う。
- キャラクターは状況に応じて選び、単調にならないようにする。

## 絶対禁止
- 穴埋め指示・語句丸出し。
- キャラクターの口調崩壊。
- 同じ質問の繰り返し。
- ユーザーが説明すべき本質的な結論をAIが代わりに回答すること。
- 直近ログを無視して別の会話を始めること。

## 出力フォーマット
${getOutputFormatRules('qa')}
`;
}

async function startQaChatSession(button) {
    if (!button) return;

    try {
        const qaItem = button.closest('.qa-item');
        const chatSlot = qaItem?.querySelector('.qa-chat-slot');
        if (!qaItem || !chatSlot) {
            console.error('❌ Q&Aチャット領域を特定できませんでした');
            return;
        }

        const qaId = button.dataset.qaId || 'unknown';
        const moduleId = button.dataset.moduleId || window.currentCaseData?.id || 'global';
        const moduleTitle = decodeDatasetValue(button.dataset.moduleTitle || '');
        const sessionId = `qa-${moduleId}-${qaId}`;

        if (chatSlot.dataset.activeSessionId === sessionId && chatSlot.classList.contains('qa-chat-open')) {
            chatSlot.classList.remove('qa-chat-open');
            chatSlot.classList.add('hidden');
            chatSlot.dataset.activeSessionId = '';
            chatSlot.innerHTML = '';
            if (window.conversationHistories) {
                delete window.conversationHistories[sessionId];
            }
            if (window.qaChatMetadata) {
                delete window.qaChatMetadata[sessionId];
            }
            return;
        }

        const question = decodeDatasetValue(button.dataset.question || '');
        const rawAnswer = decodeDatasetValue(button.dataset.answer || '');
        const rank = decodeDatasetValue(button.dataset.rank || '');
        const status = decodeDatasetValue(button.dataset.status || '');
        const blanks = extractBlanksFromAnswer(rawAnswer);
        const plainAnswer = rawAnswer.replace(/\{\{([^}]+)\}\}/g, '$1');

        chatSlot.dataset.activeSessionId = sessionId;
        chatSlot.classList.add('qa-chat-open');
        chatSlot.classList.remove('hidden');

        const chatTitle = moduleTitle ? `${moduleTitle}｜Q${qaId}` : `Q${qaId}`;
        const safeChatTitle = typeof escapeIntoHtml === 'function' ? escapeIntoHtml(chatTitle) : chatTitle;
        const safeQuestion = typeof escapeIntoHtml === 'function' ? escapeIntoHtml(question) : question;
        chatSlot.innerHTML = `
            <div id="chat-area-${sessionId}" class="qa-inline-chat bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 animate-fade-in">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <p class="text-[11px] font-semibold text-indigo-600 uppercase tracking-[0.2em]">Socratic Tutor</p>
                        <h4 class="text-lg font-bold text-gray-900">${safeChatTitle}</h4>
                    </div>
                    <button id="end-chat-btn-${sessionId}" data-session-id="${sessionId}" class="text-xs text-gray-500 hover:text-gray-800">× 終了</button>
                </div>
                <p class="text-sm text-gray-600 mb-3">${safeQuestion}</p>
                <div id="dialogue-area-${sessionId}" class="space-y-4 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg p-3 custom-scrollbar"></div>
                <div class="mt-3 flex gap-2">
                    <textarea id="chat-follow-up-input-${sessionId}" class="w-full border border-gray-300 rounded-lg p-3 focus-ring text-sm resize-none" rows="3" placeholder="疑問や気づきを入力して送信"></textarea>
                    <button id="send-follow-up-btn-${sessionId}" data-session-id="${sessionId}" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg whitespace-nowrap">送信</button>
                </div>
            </div>
        `;
        setupArticleRefButtons(chatSlot);

    const characters = await determineQaChatCharacters(moduleId);
        const meta = {
            qaId,
            moduleId,
            moduleTitle,
            question,
            answer: plainAnswer,
            rawAnswer,
            blanks,
            rank,
            status: status || '未',
            characters,
            coverageChecklist: createCoverageChecklist(plainAnswer)
        };
        if (!window.qaChatMetadata) window.qaChatMetadata = {};
        window.qaChatMetadata[sessionId] = meta;

        const initialPrompt = buildQaInitialPrompt(meta);
        const initialUserMessage = `Q${qaId}の理解を深めたいです。まだ次の空欄・ポイントが曖昧: ${blanks.length ? blanks.join(', ') : '論点全体'}。問いかけ中心で導いてください。`;
        meta.initialUserMessage = initialUserMessage;

        if (!window.conversationHistories) window.conversationHistories = {};
        window.conversationHistories[sessionId] = [{ role: 'user', parts: [{ text: initialUserMessage }] }];

        await sendMessageToAI(sessionId, initialPrompt, question, initialUserMessage);
    } catch (error) {
        console.error('❌ startQaChatSessionでエラー:', error);
    } finally {
        window.isCharacterDialogueInProgress = false;
    }
}