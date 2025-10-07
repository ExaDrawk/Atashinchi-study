// chatSystem.js - チャット・対話システムモジュール（キャラクター回答の条文処理対応）

import { processArticleReferences, processAllReferences, setupArticleRefButtons } from './articleProcessor.js';
import { characters, generateLocationNarration, getGlobalRulesAsText, getGlobalHonorificRulesAsText, getStoryContextRulesAsText, getOutputFormatRules, getLocationManagementRules, getSessionTypeInstructions, getBasicConversationRules, getArticleReferenceRules, getFollowUpLocationRules, extractLocationFromCharacters } from './data/characters.js';
import { generateInitialPrompt, generateCharacterPersonaPrompt } from './data/prompts.js';
import { startInlineSpeedQuiz, stopInlineSpeedQuiz } from './inlineSpeedQuiz.js';

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
    console.log('=== startChatSession開始（story/explanation対応） ===');
    
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
    
    // タイプに応じて適切な要素を取得
    if (type === 'story') {
        container = document.getElementById('tab-story-content');
        inputElement = document.getElementById('story-question-input');
        inputForm = inputElement ? inputElement.closest('.input-form') : null;
        chatArea = document.getElementById('chat-area-story');
    } else if (type === 'explanation') {
        container = document.getElementById('tab-explanation-content');
        inputElement = document.getElementById('explanation-question-input');
        inputForm = inputElement ? inputElement.closest('.input-form') : null;
        chatArea = document.getElementById('chat-area-explanation');
    } else {
        // 従来のquiz/essay処理
        container = button.closest('.prose-bg');
        
        // mockButtonの場合はcontainerがnullになるので、特別処理
        if (!container && button.dataset.type === 'quiz') {
            const quizIndex = button.dataset.quizIndex;
            const subIndex = button.dataset.subIndex || '0';
            
            // 司法試験用テキストエリアを複数の方法で検索
            inputElement = document.getElementById('judicial-answer-textarea');
            
            if (!inputElement) {
                // フォールバック: 他のIDで検索
                inputElement = document.getElementById('initial-input-0-0') || 
                              document.getElementById('initial-input-0-1') ||
                              document.getElementById('initial-input-1-0') ||
                              document.querySelector('textarea[id*="initial-input"]') ||
                              document.querySelector('textarea');
            }
            
            // 埋め込みチャットエリアを使用
            chatArea = document.getElementById('embedded-chat-area');
            
            console.log('🔧 テキストエリア検索結果:', { 
                inputElement: !!inputElement, 
                inputElementId: inputElement?.id,
                chatArea: !!chatArea 
            });
            
            // input-formは動的に作成するか、既存の要素を探す
            inputForm = document.querySelector('.input-form') || 
                       document.querySelector('#judicial-answer-form') ||
                       inputElement?.closest('form') ||
                       inputElement?.parentElement;
            
            console.log('🔧 mockButton用の要素検索結果:', { inputElement, chatArea, inputForm });
        } else if (container) {
            inputForm = container.querySelector('.input-form');
            inputElement = container.querySelector('textarea');
            chatArea = container.querySelector('.chat-area');
        } else {
            // containerもない場合は要素が見つからない
            inputForm = null;
            inputElement = null;
            chatArea = null;
        }
    }

    if (!inputElement || !chatArea) {
        console.error('致命的エラー: 必要なUI要素が見つかりません', { 
            type, 
            inputForm: !!inputForm, 
            inputElement: !!inputElement, 
            chatArea: !!chatArea,
            buttonType: button.dataset.type,
            isMockButton: !button.closest('.prose-bg'),
            allTextareas: Array.from(document.querySelectorAll('textarea')).map(t => t.id || t.className),
            embeddedChatExists: !!document.getElementById('embedded-chat-area')
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

        const quizIndex = button.dataset.quizIndex;
        const subIndex = button.dataset.subIndex || '0'; // 複数小問対応
        
        // ★★★ セッションIDを複数小問対応に変更（story、explanation対応） ★★★
        let sessionId;
        if (type === 'quiz') {
            sessionId = `quiz-${quizIndex}-${subIndex}`;
        } else if (type === 'story') {
            sessionId = 'story';
        } else if (type === 'explanation') {
            sessionId = 'explanation';
        } else {
            sessionId = 'essay';
        }
        
        let problemText, modelAnswer, hintText, chatTitle;
        if (type === 'quiz') {
            const quizGroup = currentCaseData.quiz[quizIndex];
            
            // 旧形式との互換性
            if (quizGroup.problem && !quizGroup.subProblems) {
                problemText = quizGroup.problem;
                modelAnswer = quizGroup.modelAnswer || '';
                hintText = `<h5 class="font-bold mb-2">答案に含めるべきポイント</h5><ul class="list-disc list-inside bg-gray-100 p-4 rounded-lg mb-4 text-sm space-y-1">${(quizGroup.points || []).map(p => `<li>${p}</li>`).join('')}</ul>`;
            } else {
                // 新形式：複数小問
                const subProblem = quizGroup.subProblems[parseInt(subIndex)];
                problemText = subProblem.problem;
                modelAnswer = subProblem.modelAnswer || '';
                hintText = `<h5 class="font-bold mb-2">答案に含めるべきポイント</h5><ul class="list-disc list-inside bg-gray-100 p-4 rounded-lg mb-4 text-sm space-y-1">${(subProblem.points || []).map(p => `<li>${p}</li>`).join('')}</ul>`;
            }
            chatTitle = '📝 ミニ論文添削';
        } else if (type === 'story') {
            problemText = `ストーリー内容：${currentCaseData.story.map(s => s.type === 'dialogue' ? `${s.speaker}: ${s.dialogue}` : s.text).join('\n')}`;
            modelAnswer = '';
            hintText = '';
            chatTitle = '💬 キャラクターと話そう';
        } else if (type === 'explanation') {
            problemText = `解説内容：${currentCaseData.explanation}`;
            modelAnswer = '';
            hintText = '';
            chatTitle = '🤔 解説について話そう';
        } else {
            problemText = currentCaseData.essay.question;
            modelAnswer = currentCaseData.essay.points.join('、');
            hintText = `<h5 class="font-bold mb-2">答案構成のヒント</h5><ul class="list-disc list-inside bg-gray-100 p-4 rounded-lg mb-4 text-sm space-y-1">${currentCaseData.essay.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
            chatTitle = '✍️ 論文トレーニング';
        }
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
        
        let initialPrompt;
        // ストーリー・解説会話用のプロンプト
        initialPrompt = generateInitialPrompt(userInput, type, currentCaseData);

        if (!window.conversationHistories) window.conversationHistories = {};
        
        let initialMessage;
        if (type === 'story' || type === 'explanation') {
            initialMessage = { role: 'user', parts: [{ text: `${userInput}` }] };
        } else {
            initialMessage = { role: 'user', parts: [{ text: `答案を添削してください。答案：${userInput}` }] };
        }
        
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
                <div id="${loadingId}" class="text-center p-4">
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
        
        
        // スコア抽出は quiz タイプのみで実行
        if (sessionId.includes('quiz')) {
            // より柔軟なスコア抽出パターン
            const scorePatterns = [
                /\*\*(\d+)点\*\*/,  // 元のパターン
                /(\d+)点/,           // シンプルなパターン
                /点数[：:]\s*(\d+)/,  // 「点数：XX」形式
                /スコア[：:]\s*(\d+)/, // 「スコア：XX」形式
                /評価[：:]\s*(\d+)点/ // 「評価：XX点」形式
            ];
            
            let score = null;
            for (const pattern of scorePatterns) {
                const match = aiResponse.match(pattern);
                if (match) {
                    score = parseInt(match[1], 10);
                    break;
                }
            }
            
            if (score !== null && score >= 10) {
                await saveUserAnswer(sessionId, userInput, score, problemText);
            } else if (score === null) {
                // スコアが検出できない場合は50点として保存
                await saveUserAnswer(sessionId, userInput, 50, problemText);
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
    const { problemText, userInput, currentCaseData } = getProblemInfoFromHistory(sessionId);
    
    // sessionIdからセッションタイプを判定
    let sessionType = null;
    if (sessionId === 'story') {
        sessionType = 'story';
    } else if (sessionId === 'explanation') {
        sessionType = 'explanation';
    } else if (sessionId.startsWith('quiz-')) {
        sessionType = 'quiz';
    } else if (sessionId === 'essay') {
        sessionType = 'essay';
    }
    
    // 簡易版プロンプト統合
    const followUpPrompt = baseFollowUpPrompt;
      await sendMessageToAI(sessionId, followUpPrompt, problemText, userInput);
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
    const history = window.conversationHistories[sessionId];
    if (!history || history.length === 0) {
        return { problemText: null, userInput: null };
    }

    const initialPrompt = history[0].parts[0].text;
    const problemMatch = initialPrompt.match(/【材料】\s*-\s*問題:\s*([\s\S]*?)\s*-\s*模範解答の骨子:/);
    const userMatch = initialPrompt.match(/-\s*ユーザーの答案:\s*([\s\S]*?)\s*##/);
    
    const problemText = problemMatch ? problemMatch[1].trim() : '（問題文の取得に失敗）';
    const userInput = userMatch ? userMatch[1].trim() : '（答案の取得に失敗）';

    return { problemText, userInput };
}

async function saveUserAnswer(sessionId, userAnswer, score, problemText) {
    const startTime = Date.now();
    console.log('🎯 =========================');
    console.log('💾 saveUserAnswer開始:', { 
        sessionId, 
        score, 
        currentCaseId: window.currentCaseData?.id,
        userAnswerLength: userAnswer?.length,
        problemTextLength: problemText?.length
    });
    
    try {
        // Step 1: 基本的なチェック
        if (!window.currentCaseData?.id) {
            console.error('❌ Step1失敗: currentCaseDataが存在しません');
            console.log('🔍 window.currentCaseData:', window.currentCaseData);
            return;
        }
        console.log('✅ Step1成功: currentCaseData確認済み');
          // Step 2: ストレージキーの生成
        const isQuiz = sessionId.startsWith('quiz-');
        let problemIndex = '';
        
        if (isQuiz) {
            // sessionId例: "quiz-0-1" → problemIndex: "0-1"
            const parts = sessionId.split('-');
            problemIndex = parts.slice(1).join('-'); // "quiz-"以降の部分を取得
        } else {
            problemIndex = '';
        }
        
        const storageKey = `answers_${window.currentCaseData.id}_${isQuiz ? 'quiz' : 'essay'}_${problemIndex}`;
        console.log('✅ Step2成功: ストレージキー生成:', { sessionId, problemIndex, storageKey });
        
        // Step 3: 既存データの取得（データ移行対応）
        let existingAnswers;
        try {
            let existingData = localStorage.getItem(storageKey);
            
            // 新しいキーでデータが見つからない場合、古いキー形式も確認
            if (!existingData && isQuiz && problemIndex.includes('-')) {
                const oldFormatIndex = problemIndex.split('-')[0]; // "0-1" → "0"
                const oldStorageKey = `answers_${window.currentCaseData.id}_quiz_${oldFormatIndex}`;
                console.log('🔄 古いキー形式をチェック:', oldStorageKey);
                
                const oldData = localStorage.getItem(oldStorageKey);
                if (oldData) {
                    console.log('📦 古いデータを発見、新しいキーに移行します');
                    existingData = oldData;
                    
                    // 古いデータを新しいキーに移行
                    localStorage.setItem(storageKey, oldData);
                    console.log('✅ データ移行完了:', { from: oldStorageKey, to: storageKey });
                }
            }
            
            existingAnswers = existingData ? JSON.parse(existingData) : [];
            console.log('✅ Step3成功: 既存データ取得:', existingAnswers.length, '件');
        } catch (parseError) {
            console.error('❌ Step3警告: 既存データのパースに失敗、新規配列で開始:', parseError);
            existingAnswers = [];
        }

        // Step 4: 新しい回答データの作成
        const newAnswer = {
            userAnswer: userAnswer,
            score: score,
            timestamp: new Date().toISOString(),
            problemText: problemText
        };
        console.log('✅ Step4成功: 新回答データ作成:', {
            score: newAnswer.score,
            timestamp: newAnswer.timestamp,
            userAnswerLength: newAnswer.userAnswer?.length
        });

        // Step 5: データの結合
        existingAnswers.push(newAnswer);
        console.log('✅ Step5成功: データ結合完了。総件数:', existingAnswers.length);
        
        // Step 6: localStorage保存
        try {
            const dataToSave = JSON.stringify(existingAnswers);
            console.log('🔄 Step6開始: localStorage保存中...', {
                key: storageKey,
                dataSize: dataToSave.length,
                answersCount: existingAnswers.length
            });
            
            localStorage.setItem(storageKey, dataToSave);
            console.log('✅ Step6成功: localStorage.setItem完了');
            
            // Step 7: 保存検証
            const verifyData = localStorage.getItem(storageKey);
            if (verifyData) {
                const parsedData = JSON.parse(verifyData);
                if (parsedData.length === existingAnswers.length) {
                    console.log('✅ Step7成功: 保存検証OK!', {
                        savedCount: parsedData.length,
                        latestScore: parsedData[parsedData.length - 1].score,
                        latestTimestamp: parsedData[parsedData.length - 1].timestamp
                    });
                } else {
                    throw new Error(`保存件数が不一致 (期待: ${existingAnswers.length}, 実際: ${parsedData.length})`);
                }
            } else {
                throw new Error('保存後の検証で、データが見つかりません');
            }
        } catch (storageError) {
            console.error('❌ Step6-7失敗: localStorage保存・検証失敗:', storageError);
            throw storageError;
        }
        
        // Step 8: UI表示
        const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
        if (dialogueArea) {
            const successMessage = document.createElement('div');
            successMessage.innerHTML = `
                <div class="my-4 p-3 bg-green-100 rounded-lg border-2 border-green-300 animate-fade-in">
                    <h5 class="font-bold text-green-800 mb-2">💾 回答を保存しました</h5>
                    <p class="text-sm text-green-700">${new Date().toLocaleString()} | ${score}点</p>
                    <p class="text-xs text-green-600 mt-1">保存キー: ${storageKey}</p>
                    <p class="text-xs text-green-500 mt-1">処理時間: ${Date.now() - startTime}ms</p>
                </div>
            `;
            dialogueArea.appendChild(successMessage);
            dialogueArea.scrollTop = dialogueArea.scrollHeight;
            console.log('✅ Step8成功: 保存メッセージ表示完了');
        } else {
            console.warn('⚠️ Step8警告: dialogueAreaが見つかりません:', `dialogue-area-${sessionId}`);
        }        // Step 9: 最終確認（念のため）
        setTimeout(() => {
            const finalCheck = localStorage.getItem(storageKey);
            if (finalCheck) {
                const finalData = JSON.parse(finalCheck);
                console.log('🎉 Step9成功: 最終確認OK!', {
                    totalTime: Date.now() - startTime,
                    finalCount: finalData.length,
                    storageKey: storageKey
                });
                
                // 過去回答表示エリアの自動更新
                if (typeof updatePastAnswersDisplay === 'function') {
                    updatePastAnswersDisplay(sessionId, storageKey);
                }
                
            } else {
                console.error('❌ Step9失敗: 最終確認でデータが消失!');
            }
        }, 100);

    } catch (error) {
        console.error('❌ 回答保存エラー:', error);
        console.log('🔍 エラー発生時の詳細情報:', {
            sessionId,
            currentCaseId: window.currentCaseData?.id,
            localStorageAvailable: typeof Storage !== 'undefined',
            totalTime: Date.now() - startTime
        });
        
        // エラーが発生した場合も、ユーザーにフィードバックを表示
        const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
        if (dialogueArea) {
            const errorMessage = document.createElement('div');
            errorMessage.innerHTML = `
                <div class="my-4 p-3 bg-red-100 rounded-lg border-2 border-red-300">
                    <h5 class="font-bold text-red-800 mb-2">❌ 保存に失敗しました</h5>
                    <p class="text-sm text-red-700">エラー: ${error.message}</p>
                    <p class="text-xs text-red-600">詳細はコンソールをご確認ください</p>
                </div>
            `;
            dialogueArea.appendChild(errorMessage);
        }
    }
    
    console.log('🎯 =========================');
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