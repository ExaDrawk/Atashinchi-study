// chatSystem.js - チャット・対話システムモジュール（キャラクター回答の条文処理対応）

import { processArticleReferences, processAllReferences, setupArticleRefButtons } from './articleProcessor.js';
import { characters, generateLocationNarration, getGlobalRulesAsText, getGlobalHonorificRulesAsText, getStoryContextRulesAsText, getOutputFormatRules, getLocationManagementRules, getSessionTypeInstructions, getBasicConversationRules, getArticleReferenceRules, getFollowUpLocationRules } from './data/characters.js';
import { generateInitialPrompt, generateCharacterPersonaPrompt } from './data/prompts.js';

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
    
    // 【】で囲んだ後に、一度だけ統合処理を実行
    processedText = processAllReferences(processedText, supportedLaws, questionsAndAnswers);
    
    return processedText;
}

// ★★★ チャットセッション開始（複数小問対応） ★★★
export async function startChatSession(button, currentCaseData) {
    console.log('=== startChatSession開始（story/explanation対応） ===');
    
    const type = button.dataset.type;
    let container, inputForm, inputElement, chatArea;
    
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
        inputForm = container.querySelector('.input-form');
        inputElement = container.querySelector('textarea');
        chatArea = container.querySelector('.chat-area');
    }

    if (!inputForm || !inputElement || !chatArea) {
        console.error('致命的エラー: 必要なUI要素が見つかりません', { type, inputForm, inputElement, chatArea });
        return;
    }

    const userInput = inputElement.value.trim();
    if (userInput.length < 10) {
        alert('もう少し詳しく記述してください（10文字以上）。');
        return;
    }try {
        inputForm.style.display = 'none';
        chatArea.style.display = 'block';

        const type = button.dataset.type;
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
            modelAnswer = currentCaseData.knowledgeBox || '';
            hintText = '';
            chatTitle = '💬 ストーリーQ&A';
        } else if (type === 'explanation') {
            problemText = `解説内容：${currentCaseData.explanation}`;
            modelAnswer = currentCaseData.knowledgeBox || '';
            hintText = '';
            chatTitle = '🤔 解説Q&A';
        } else {
            problemText = currentCaseData.essay.question;
            modelAnswer = currentCaseData.essay.points.join('、');
            hintText = `<h5 class="font-bold mb-2">答案構成のヒント</h5><ul class="list-disc list-inside bg-gray-100 p-4 rounded-lg mb-4 text-sm space-y-1">${currentCaseData.essay.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
            chatTitle = '✍️ 論文トレーニング';
        }
          chatArea.innerHTML = `
            ${hintText ? `<div class="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200 mt-4 animate-fade-in">
                ${hintText}
                <h5 class="font-bold mb-2">【あなたの答案】</h5>
                <div class="bg-white p-3 rounded border text-sm">${userInput.replace(/\n/g, '<br>')}</div>
            </div>` : `<div class="bg-gray-50 p-4 rounded-lg mb-4 border-2 border-gray-200 mt-4 animate-fade-in">
                <h5 class="font-bold mb-2">【あなたの質問】</h5>
                <div class="bg-white p-3 rounded border text-sm">${userInput.replace(/\n/g, '<br>')}</div>
            </div>`}
            <div class="bg-gray-50 p-4 rounded-lg border animate-fade-in">
                <h4 class="text-lg font-bold mb-3">${chatTitle}</h4>
                <div id="dialogue-area-${sessionId}" class="space-y-4 max-h-[50vh] overflow-y-auto p-4 bg-white border rounded-lg custom-scrollbar">
                    <!-- 初期表示は空 -->
                </div>
                <div class="mt-4 flex gap-2">
                    <textarea id="chat-follow-up-input-${sessionId}" class="w-full p-4 border rounded-lg focus-ring" style="height: 120px; resize: none;" placeholder="さらに質問や反論をどうぞ…"></textarea>
                    <button id="send-follow-up-btn-${sessionId}" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-session-id="${sessionId}">送信</button>
                </div>
            </div>        `;        let initialPrompt;
        if (type === 'story' || type === 'explanation') {
            // ストーリー・解説Q&A用のプロンプト
            const basePrompt = generateQAPrompt(userInput, problemText, modelAnswer, currentCaseData, type);
            initialPrompt = generateCharacterAwarePrompt(basePrompt, currentCaseData, type);
        } else {
            // 従来の添削用プロンプト（ナレーション付き）
            const characterNames = [...new Set(currentCaseData.story.filter(s => s.type === 'dialogue').map(s => s.speaker))];
            const locationNarration = generateLocationNarration(characterNames);
            
            // 基本のプロンプトを取得してナレーションを統合
            const basePrompt = generateInitialPrompt(userInput, problemText, modelAnswer, currentCaseData);
            const narrativePrompt = integrateLocationNarration(basePrompt, locationNarration);
            initialPrompt = generateCharacterAwarePrompt(narrativePrompt, currentCaseData);
        }

        if (!window.conversationHistories) window.conversationHistories = {};
        
        let initialMessage;
        if (type === 'story' || type === 'explanation') {
            initialMessage = { role: 'user', parts: [{ text: `次の質問に答えてください。質問：${userInput}` }] };
        } else {
            initialMessage = { role: 'user', parts: [{ text: `答案を添削してください。答案：${userInput}` }] };
        }
        
        window.conversationHistories[sessionId] = [initialMessage];
        
        await sendMessageToAI(sessionId, initialPrompt, problemText, userInput);

    } catch (error) {
        console.error('❌ startChatSessionでエラーが発生:', error);
        inputForm.style.display = 'block';
        chatArea.style.display = 'none';
        chatArea.innerHTML = '';
    }
}


// ★★★ AIとの通信を管理する中核関数 ★★★
export async function sendMessageToAI(sessionId, promptText, problemText, userInput) {
    const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
    if (!dialogueArea) return;

    // ローディング表示（追記用）
    const followUpLoaderId = `follow-up-loader-${Date.now()}`;
    dialogueArea.insertAdjacentHTML('beforeend', `<div id="${followUpLoaderId}" class="text-center p-2"><div class="loader-small mx-auto"></div></div>`);
    dialogueArea.scrollTop = dialogueArea.scrollHeight;

    try {
        const history = window.conversationHistories[sessionId] || [];

        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({
                prompt: promptText,
                history: history,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`APIエラー: ${response.status} - ${errorData.error || '不明なエラー'}. 詳細: ${errorData.detail || 'なし'}`);
        }
        
        const result = await response.json();
        const aiResponse = result.text.trim();

        // ローディング表示を削除
        const loaderToRemove = document.getElementById(followUpLoaderId) || document.getElementById(`loading-indicator-${sessionId}`);
        if (loaderToRemove) loaderToRemove.remove();        window.conversationHistories[sessionId].push({ role: 'model', parts: [{ text: aiResponse }] });

        // AIレスポンスの前処理：ナレーション部分を分離
        let processedResponse = aiResponse;
        
        // 【ナレーション】形式の処理
        const narrationMatch = processedResponse.match(/^【ナレーション】(.+?)(?=\n|$)/);
        if (narrationMatch) {
            const narrationPart = narrationMatch[0];
            const remainingPart = processedResponse.replace(narrationMatch[0], '').trim();
            processedResponse = narrationPart + (remainingPart ? '---' + remainingPart : '');
        }
        
        // 混在したナレーション＋対話の処理
        processedResponse = processedResponse.replace(/^(.+?。.+?。)\s+([^。]+@[^:]+:.*)$/gm, '$1---$2');        const dialogues = processedResponse.split('---').filter(d => d.trim() !== '');
        for (const dialogue of dialogues) {
            await sleep(1500);
            displaySingleDialogue(dialogue, sessionId);
        }
        
        // ★★★ 全ての対話表示完了後にMermaid初期化 ★★★
        setTimeout(() => {
            initializeChatMermaid();
        }, 500); // 最後の対話表示を待つ// ★★★ 改良されたスコア抽出とデバッグ ★★★
        console.log('🔍 AIレスポンス（スコア検索用）:', aiResponse.substring(0, 500));
        
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
                console.log(`✅ スコア検出成功: ${score}点 (パターン: ${pattern})`);
                break;
            }
        }
        
        if (score !== null) {
            console.log(`📊 検出されたスコア: ${score}点`);
            // 保存条件を緩和：10点以上で保存
            if (score >= 10) {
                console.log(`💾 保存条件を満たしています (${score}点 >= 10点)`);
                await saveUserAnswer(sessionId, userInput, score, problemText);
            } else {
                console.log(`⚠️ 保存条件を満たしていません (${score}点 < 10点)`);
            }
        } else {
            console.log('⚠️ スコアが検出されませんでした。手動で平均スコア(50点)で保存します。');
            // スコアが検出できない場合は50点として保存
            await saveUserAnswer(sessionId, userInput, 50, problemText);
        }

    } catch (error) {
        console.error('AI通信エラー:', error);
        const loaderToRemove = document.getElementById(followUpLoaderId);
        if (loaderToRemove) loaderToRemove.remove();
        dialogueArea.insertAdjacentHTML('beforeend', `<p class="text-red-500 p-4">エラー: ${error.message}</p>`);
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
        getArticleReferenceRules() + '\n\n' +'## 【絶対厳守】出力フォーマット指示\n' +        '出力は必ず以下の形式を厳守してください：\n' +
        '- キャラクター名@表情: セリフ内容---\n' +
        '- 複数キャラクターの場合は各行に1人ずつ記述\n' +
        '- ナレーションは【ナレーション】形式で冒頭に配置\n' +        '- 上記以外の形式での出力は絶対禁止\n\n' +        getFollowUpLocationRules() + '\n\n' +
        getBasicConversationRules() + '\n\n' +
        '今すぐ、上記の全ルールを遵守し、会話の続きを生成してください。';

    // キャラクター情報を統合したプロンプトを生成
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
    
    const followUpPrompt = generateCharacterAwarePrompt(baseFollowUpPrompt, currentCaseData, sessionType);
      await sendMessageToAI(sessionId, followUpPrompt, problemText, userInput);
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
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
        return true;
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
        
        // 対話部分を再処理
        displaySingleDialogue(dialoguePart, sessionId);
        return true;
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
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
        return true;
    }
    
    return false;
}

// ★★★ 単一対話の表示（キャラクター回答の条文処理対応） ★★★
function displaySingleDialogue(dialogue, sessionId) {
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

    // ナレーション処理を最初に実行
    if (processNarration(trimmedDialogue, sessionId)) {
        return; // ナレーションが処理された場合は終了
    }

    const isScrolledToBottom = dialogueArea.scrollHeight - dialogueArea.clientHeight <= dialogueArea.scrollTop + 1;

    // ナレーションを処理
    const narrationProcessed = processNarration(trimmedDialogue, sessionId);
    if (narrationProcessed) return;

    const colonIndex = trimmedDialogue.indexOf(':');
    if (colonIndex <= 0) {
        dialogueArea.insertAdjacentHTML('beforeend', `
            <div class="my-3 animate-fade-in"><div class="bg-red-100 p-3 rounded-lg border border-red-300">
                <p class="font-bold text-sm text-red-700">AIのフォーマットエラー</p>
                <p class="text-sm text-red-600">セリフの形式が不正です（コロン":"が見つかりません）。</p>
                <p class="text-xs text-red-500 break-all mt-1">受信内容: "${trimmedDialogue}"</p>
            </div></div>`);
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
        return;
    }

    const speakerPart = trimmedDialogue.substring(0, colonIndex).trim();
    const dialogueText = trimmedDialogue.substring(colonIndex + 1).trim();
    
    const atIndex = speakerPart.indexOf('@');
    if (atIndex <= 0) {
        dialogueArea.insertAdjacentHTML('beforeend', `
            <div class="my-3 animate-fade-in"><div class="bg-red-100 p-3 rounded-lg border border-red-300">
                <p class="font-bold text-sm text-red-700">AIのフォーマットエラー</p>
                <p class="text-sm text-red-600">キャラクター名または表情の指定が不正です（例: "みかん@thinking"）。</p>
                <p class="text-xs text-red-500 break-all mt-1">受信内容: "${trimmedDialogue}"</p>
            </div></div>`);
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
        return;
    }

    const speakerName = speakerPart.substring(0, atIndex).trim();
    const expression = speakerPart.substring(atIndex + 1).trim();

    const character = characters.find(c => 
        c.name === speakerName || (c.aliases && c.aliases.includes(speakerName))
    );    if (!character) {
        dialogueArea.insertAdjacentHTML('beforeend', `
            <div class="my-3 animate-fade-in"><div class="bg-red-100 p-3 rounded-lg border border-red-300">
                <p class="font-bold text-sm text-red-700">AIのフォーマットエラー</p>
                <p class="text-sm text-red-600">「${speakerName}」というキャラクターは存在しません。</p>
                <p class="text-xs text-red-500 bg-red-50 p-1 rounded mt-1"><b>利用可能なキャラクター名:</b> ${characters.map(c => c.name).join('、')}</p>
                <p class="text-xs text-red-500 break-all mt-1">受信内容: "${trimmedDialogue}"</p>
                <p class="text-xs text-blue-600 mt-1"><b>ヒント:</b> ナレーション部分は【ナレーション】形式で囲んでください</p>
            </div></div>`);
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
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
    
    // ★★★ Mermaidグラフの処理を追加 ★★★
    processedDialogueText = processMermaidInDialogue(processedDialogueText);
    
    // **で囲まれた部分をおしゃれな太字スタイルに変換
    processedDialogueText = processedDialogueText.replace(/\*\*(.*?)\*\*/g, '<span class="inline-block bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-extrabold text-lg shadow-sm px-1 py-0.5 rounded" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1);">$1</span>');
    
    let messageHtml;
    if (isRightSide) {
        messageHtml = `
            <div class="flex justify-end items-start gap-3 my-3 animate-fade-in">
                <div class="bg-green-100 p-3 rounded-lg shadow max-w-[75%]">
                    <p class="font-bold text-sm text-green-800">${character.name}</p>
                    <p class="text-sm">${processedDialogueText}</p>
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
                    <p class="text-sm">${processedDialogueText}</p>
                </div>
            </div>
        `;
    }    dialogueArea.insertAdjacentHTML('beforeend', messageHtml);
    
    // 新しく追加された条文参照ボタンのイベントリスナーを設定
    setupArticleRefButtons(dialogueArea);
    
    // ★★★ Mermaidグラフが含まれている場合の初期化処理 ★★★
    if (processedDialogueText.includes('mermaid-chat-container')) {
        setTimeout(() => {
            initializeChatMermaid();
        }, 100); // DOM更新を待つため少し遅延
    }

    if (isScrolledToBottom) {
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
    }
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
                updatePastAnswersDisplay(sessionId, storageKey);
                
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

// ★★★ デバッグ用：localStorage確認関数 ★★★
window.debugLocalStorage = function() {
    console.log('=== localStorage デバッグ情報 ===');
    
    // localStorageが利用可能かチェック
    try {
        const testKey = '__test_storage__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('✅ localStorage は利用可能です');
    } catch (error) {
        console.error('❌ localStorage が利用できません:', error);
        console.log('📝 原因: プライベートモード、容量不足、またはブラウザ設定の問題の可能性があります');
    }
    
    const keys = Object.keys(localStorage);
    const answerKeys = keys.filter(key => key.startsWith('answers_'));
    
    console.log(`📊 総localStorage項目数: ${keys.length}`);
    console.log(`📝 回答保存項目数: ${answerKeys.length}`);
    
    // localStorage使用量の計算
    let totalSize = 0;
    keys.forEach(key => {
        const value = localStorage.getItem(key);
        totalSize += key.length + (value ? value.length : 0);
    });
    console.log(`💾 localStorage使用量: ${(totalSize / 1024).toFixed(2)} KB`);
    
    if (answerKeys.length === 0) {
        console.log('ℹ️ 保存された回答はありません');
        return;
    }
    
    answerKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            console.log(`📂 ${key}:`, data.length, '件の回答');
            data.forEach((answer, index) => {
                console.log(`  ${index + 1}. ${answer.score}点 (${new Date(answer.timestamp).toLocaleString()})`);
            });
        } catch (error) {
            console.error(`❌ ${key} の読み込みエラー:`, error);
        }
    });
    
    console.log('=== デバッグ情報終了 ===');
};

// localStorageの監視機能
window.watchLocalStorage = function() {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        console.log(`🔄 localStorage.setItem called: ${key}`, value.substring(0, 100) + '...');
        const result = originalSetItem.apply(this, arguments);
        console.log(`✅ localStorage.setItem completed for: ${key}`);
        return result;
    };
    console.log('👀 localStorage監視を開始しました');
};

// 使用方法をコンソールに表示
console.log('💡 デバッグ用コマンド:');
console.log('  - window.debugLocalStorage() でlocalStorageの内容を確認');
console.log('  - window.watchLocalStorage() でlocalStorageの操作を監視');
console.log('  - window.verifyStoredAnswers() で現在のケースの保存データを詳細確認');
console.log('  - window.watchCurrentCaseAnswers() で現在のケースの保存状況をリアルタイム監視');

const sleep = ms => new Promise(res => setTimeout(res, ms));

// ★★★ ページ読み込み時の自動デバッグ ★★★
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 chatSystem.js 読み込み完了');
    
    // 初回デバッグ情報を表示
    setTimeout(() => {
        console.log('📋 初期localStorage状況:');
        window.debugLocalStorage();
    }, 1000);
});

// ★★★ 現在のケースIDを監視 ★★★
let lastCaseId = null;
setInterval(() => {
    const currentId = window.currentCaseData?.id;
    if (currentId && currentId !== lastCaseId) {
        lastCaseId = currentId;
        console.log(`📌 現在のケースID: ${currentId}`);
        
        // このケースの保存データを確認
        const caseKeys = Object.keys(localStorage).filter(key => key.includes(currentId));
        if (caseKeys.length > 0) {
            console.log(`📂 このケースの保存データ (${caseKeys.length}件):`, caseKeys);
        } else {
            console.log('📭 このケースの保存データはまだありません');
        }
    }
}, 2000);

// ★★★ 保存データ詳細確認関数 ★★★
window.verifyStoredAnswers = function(caseId) {
    console.log('🔍 ===============================');
    console.log('📊 保存データ詳細確認開始');
    console.log('🔍 ===============================');
    
    const currentCaseId = caseId || window.currentCaseData?.id;
    if (!currentCaseId) {
        console.error('❌ ケースIDが指定されていません');
        return;
    }
    
    console.log('🎯 対象ケースID:', currentCaseId);
    
    // localStorageから該当するキーを検索
    const allKeys = Object.keys(localStorage);
    const answerKeys = allKeys.filter(key => 
        key.startsWith('answers_') && key.includes(currentCaseId)
    );
    
    console.log('📂 発見されたキー数:', answerKeys.length);
    
    if (answerKeys.length === 0) {
        console.log('❌ このケースの保存データは見つかりませんでした');
        console.log('💡 可能性:');
        console.log('  - まだ保存していない');
        console.log('  - 保存に失敗している');
        console.log('  - ケースIDが変更された');
        return;
    }
    
    // 各キーの詳細を確認
    answerKeys.forEach((key, index) => {
        console.log(`\n📝 データ ${index + 1}: ${key}`);
        
        try {
            const data = localStorage.getItem(key);
            if (!data) {
                console.log('❌ データが空です');
                return;
            }
            
            const parsedData = JSON.parse(data);
            console.log(`✅ 保存件数: ${parsedData.length}件`);
            
            // 各回答の詳細
            parsedData.forEach((answer, answerIndex) => {
                console.log(`  📄 回答 ${answerIndex + 1}:`);
                console.log(`     スコア: ${answer.score}点`);
                console.log(`     保存日時: ${new Date(answer.timestamp).toLocaleString()}`);
                console.log(`     答案文字数: ${answer.userAnswer?.length || 0}文字`);
                console.log(`     問題文: ${answer.problemText ? '保存済み' : '未保存'}`);
                
                // 最新の回答の一部を表示
                if (answerIndex === parsedData.length - 1 && answer.userAnswer) {
                    const preview = answer.userAnswer.substring(0, 100);
                    console.log(`     答案プレビュー: "${preview}${answer.userAnswer.length > 100 ? '...' : ''}"`);
                }
            });
            
        } catch (error) {
            console.error(`❌ データ解析エラー (${key}):`, error);
        }
    });
    
    console.log('\n🔍 ===============================');
    console.log('📊 保存データ詳細確認完了');
    console.log('🔍 ===============================');
    
    return {
        caseId: currentCaseId,
        totalKeys: answerKeys.length,
        keys: answerKeys
    };
};

// 現在のケースの保存データをリアルタイムで監視
window.watchCurrentCaseAnswers = function() {
    if (!window.currentCaseData?.id) {
        console.error('❌ 現在のケースが不明です');
        return;
    }
    
    const caseId = window.currentCaseData.id;
    console.log('👀 現在のケース監視開始:', caseId);
    
    // 初期状態を表示
    window.verifyStoredAnswers(caseId);
    
    // 3秒ごとに確認
    const watchInterval = setInterval(() => {
        const answerKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('answers_') && key.includes(caseId)
        );
        
        let totalAnswers = 0;
        answerKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                totalAnswers += data.length;
            } catch (error) {
                // エラーは無視
            }
        });
        
        console.log(`⏰ ${new Date().toLocaleTimeString()} - 総保存回答数: ${totalAnswers}件`);
    }, 3000);
    
    // 30秒後に監視を停止
    setTimeout(() => {
        clearInterval(watchInterval);
        console.log('🛑 監視終了');
    }, 30000);
    
    return watchInterval;
};

// ★★★ 過去回答表示の自動更新 ★★★
function updatePastAnswersDisplay(sessionId, storageKey) {
    try {
        console.log('🔄 過去回答表示の自動更新開始:', { sessionId, storageKey });
        
        // sessionIdから問題インデックスを抽出
        let problemIndex = '';
        if (sessionId.startsWith('quiz-')) {
            problemIndex = sessionId.replace('quiz-', '');
        } else if (sessionId.startsWith('essay')) {
            problemIndex = '';
        }
        
        // 対応する過去回答表示エリアを検索
        const pastAnswersArea = document.getElementById(`past-answers-area-${problemIndex}`);
        if (!pastAnswersArea) {
            console.log('⚠️ 過去回答表示エリアが見つかりません:', `past-answers-area-${problemIndex}`);
            return;
        }
        
        // 表示エリアが非表示の場合は更新しない
        if (pastAnswersArea.classList.contains('hidden')) {
            console.log('ℹ️ 過去回答エリアが非表示のため、更新をスキップ');
            return;
        }
        
        // ストレージキーから情報を抽出
        const keyParts = storageKey.split('_');
        const caseId = keyParts[1];
        const problemType = keyParts[2];
        const extractedIndex = keyParts[3];
        
        console.log('🔄 過去回答再表示実行:', { caseId, problemType, extractedIndex });
        
        // 過去回答表示を更新
        const newContent = window.displayPastAnswers ? 
            window.displayPastAnswers(caseId, problemType, extractedIndex) :
            '過去回答表示関数が見つかりません';
        
        pastAnswersArea.innerHTML = newContent;
        console.log('✅ 過去回答表示更新完了');
        
    } catch (error) {
        console.error('❌ 過去回答表示更新エラー:', error);
    }
}

// ★★★ ストーリー・解説Q&A用のプロンプト生成関数 ★★★
function generateQAPrompt(userQuestion, contentText, knowledgeBox, caseData, type) {
    const characterNames = [...new Set(caseData.story.filter(s => s.type === 'dialogue').map(s => s.speaker))];
    const typeLabel = type === 'story' ? 'ストーリー' : '解説';
    
    // 場所ナレーションを生成
    const locationNarration = generateLocationNarration(characterNames);
    
    return `# 指示：あなたは『あたしンち』の優秀な脚本家 兼 司法試験の指導講師です

# 【事前知識（必ず参照すること）】
${knowledgeBox || ''}

# 【${typeLabel}内容】
${contentText}

# 【第一部：登場人物の完全理解】
以下の登場人物たちのペルソナを**完全に理解し、なりきって**ください。
${generateCharacterPersonaPrompt(characterNames)}

# 【第二部：今回の脚本シナリオ】
上記のペルソナを踏まえ、以下のシナリオで会話劇を生成してください。

## シナリオ概要
- これから生成するのは、ユーザーの質問に対する**${typeLabel}Q&Aの会話劇**です。
- 目的は、一方的な解説ではなく、対話を通じて学習者に「気づき」を与えることです。
- **重要**: 会話は必ず以下の場所ナレーションから始めてください：

${locationNarration}

## 材料
- **ユーザーの質問**: ${userQuestion}
- **${typeLabel}内容**: ${contentText}
- **基礎知識**: ${knowledgeBox}

## 今回の脚本構成（絶対厳守）
1. **質問の理解と導入 (1〜2往復)**:
   - 法律に詳しいキャラクター（ユズヒコ、しみちゃん等）が、質問を受けて「なるほど、それは良い質問だね」のように自然に応答を始める。

2. **多角的な解説 (4〜8往復)**:
   - 法律に詳しいキャラクター達が、質問に対して具体的で分かりやすい解説を行う。
   - 専門家ではないキャラクター（みかん、母等）は、「それってどういうこと？」「もっと分かりやすく言うと？」のような質問で理解を深める役に徹する。

3. **実用的なアドバイス**:
   - 解説の後、「実際の試験ではこんな風に出題される」「覚えるコツは…」のような実用的なアドバイスを含める。

# 【第三部：マスター・ルール】
上記の執筆にあたり、以下のルールを厳守してください。

## 1. 絶対禁止事項
- **機械的な応答**: 「質問にお答えします」「解説を開始します」のような、システムやAIであることを感じさせる無機質なセリフは絶対に禁止です。
- **カギ括弧\`「」\`の使用**: 全てのセリフにおいて、カギ括弧\`「」\`やその他の引用符は一切使用しないでください。
- **キャラクターの役割崩壊**: 各キャラクターに設定された役割（専門性や性格）を無視した言動は絶対にさせないでください。

## 2. 出力形式の厳守（ゼロ・トレランス・ポリシー）
- **基本形式**: 必ず \`キャラクター名@表情: セリフ内容---\` の形式で出力してください。
- **絶対禁止**: キャラクター名を省略し、\`@表情: セリフ内容---\` のように出力することは、いかなる理由があっても絶対に禁止します。

## 3. 自然な対話の実現
- 各キャラクターは自分の性格に応じた自然な言葉遣いと関心を示してください。
- 法的な説明も、キャラクターの個性を通して行ってください。
- **呼び方のルール**: 
  - 山下、川島、須藤、石田ゆりは、ユズヒコを「ユズピ」と呼ぶ
  - みかんはユズヒコを「ユズ」と呼ぶ
  - 母はユズヒコを「ユズ」「ユーちゃん」と呼ぶ
  - 吉岡はみかんを「タチバナ」と呼ぶ
  - 岩城はみかんを「タチバナさん」と呼ぶ`;
}

// ★★★ 既存プロンプトにナレーション指示を統合する関数 ★★★
function integrateLocationNarration(basePrompt, locationNarrationInstruction) {
    if (!locationNarrationInstruction) return basePrompt;
    
    // "## 今回の脚本構成" の直前にナレーション指示を挿入
    const targetText = '## 今回の脚本構成（絶対厳守）';
    const insertText = `
## 場所設定とナレーション指示（最重要）
- **最重要**: ${locationNarrationInstruction}
- **絶対的なフォーマット要件**: ナレーションは【ナレーション】形式で出力し、必ず改行してからキャラクターのセリフを開始してください
- **ナレーション部分はキャラクター名として認識されません**: 【ナレーション】形式を厳守することで、適切に中央表示されます
- **例**: 
  【ナレーション】場所の説明文。
  キャラクター名@表情: セリフ内容---

${targetText}`;
    
    return basePrompt.replace(targetText, insertText);
}

// ★★★ 全AI対話でキャラクター情報を確実に適用するための統合関数 ★★★
function generateCharacterAwarePrompt(basePrompt, currentCaseData, sessionType = null) {
    // 登場キャラクターを抽出
    let characterNames = [];
    if (currentCaseData && currentCaseData.story) {
        characterNames = [...new Set(currentCaseData.story.filter(s => s.type === 'dialogue').map(s => s.speaker))];
    }
    
    // キャラクター情報を統合
    let enhancedPrompt = basePrompt;
    
    // グローバルルールを追加
    enhancedPrompt += '\n\n' + getGlobalRulesAsText();
    
    // 敬語ルールを追加
    enhancedPrompt += '\n\n' + getGlobalHonorificRulesAsText();
    
    // キャラクターペルソナを追加
    if (characterNames.length > 0) {
        enhancedPrompt += '\n\n' + generateCharacterPersonaPrompt(characterNames);
    }
    
    // ストーリー固有のルールを追加
    if (currentCaseData) {
        enhancedPrompt += '\n\n' + getStoryContextRulesAsText(currentCaseData);
    }    // セッションタイプ別の補足指示
    if (sessionType) {
        enhancedPrompt += '\n\n' + getSessionTypeInstructions(sessionType);
    }
    
    // 場所設定の厳格な管理指示を追加
    enhancedPrompt += '\n\n' + getLocationManagementRules();
      // 出力フォーマットの厳格な指示を追加
    enhancedPrompt += '\n\n## 【絶対厳守】出力フォーマット指示\n';
    enhancedPrompt += getOutputFormatRules(sessionType);
    
    return enhancedPrompt;
}

// ★★★ Mermaidの処理を追加（chatSystem用） ★★★
function processMermaidInDialogue(dialogueText) {
    // ```mermaid で囲まれたMermaidコードを検出
    const mermaidPattern = /```mermaid\s+(.*?)\s+```/gs;
    
    return dialogueText.replace(mermaidPattern, (match, mermaidCode) => {
        const mermaidId = 'chat-mermaid-' + Math.random().toString(36).substr(2, 9);
        console.log('🎨 チャット内でMermaid図表を作成:', mermaidId, mermaidCode.trim());
        
        return `
            <div class="mermaid-chat-container my-4 p-4 bg-gray-50 rounded-lg border">
                <div class="zoom-controls mb-2">
                    <button class="zoom-btn zoom-in text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">拡大</button>
                    <button class="zoom-btn zoom-out text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">縮小</button>
                    <button class="zoom-btn zoom-reset text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">リセット</button>
                </div>
                <div id="${mermaidId}" class="mermaid">${mermaidCode.trim()}</div>
            </div>
        `;
    });
}

// ★★★ Mermaid初期化関数（チャット用）★★★
function initializeChatMermaid() {
    console.log('🎨 チャット内Mermaid初期化開始');
    
    if (typeof mermaid === 'undefined') {
        console.warn('⚠️ Mermaid.jsが読み込まれていません');
        return;
    }
    
    try {
        // Mermaid設定
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'M PLUS Rounded 1c, sans-serif',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'linear'
            },
            themeVariables: {
                primaryColor: '#f0f9ff',
                primaryTextColor: '#1e293b',
                primaryBorderColor: '#0284c7',
                lineColor: '#475569',
                fontSize: '14px'
            }
        });
        
        // 現在表示されているMermaid要素をレンダリング
        const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
        console.log(`🔍 チャット内Mermaid要素を${mermaidElements.length}個発見`);
        
        mermaidElements.forEach(async (element, index) => {
            const graphDefinition = element.textContent || element.innerText;
            console.log(`📝 チャット図表定義 #${index}:`, graphDefinition);
            
            try {
                const graphId = `chat-graph-${Date.now()}-${index}`;
                const { svg } = await mermaid.render(graphId, graphDefinition);
                element.innerHTML = svg;
                element.setAttribute('data-processed', 'true');
                console.log(`✅ チャットMermaid図表 #${index} レンダリング完了`);
            } catch (renderError) {
                console.error(`❌ チャットMermaid レンダリングエラー #${index}:`, renderError);
                element.innerHTML = `
                    <div style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">
                        <h4>図表レンダリングエラー</h4>
                        <p>${renderError.message}</p>
                        <pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; white-space: pre-wrap; font-size: 12px;">${graphDefinition}</pre>
                    </div>
                `;
            }
        });
        
        console.log('🎨 チャット内Mermaid初期化完了');
        
        // ズーム機能も初期化
        initializeChatMermaidZoom();
    } catch (error) {
        console.error('❌ チャット内Mermaid初期化エラー:', error);
    }
}

// ★★★ チャット内Mermaidズーム機能★★★
function initializeChatMermaidZoom() {
    console.log('🔍 チャット内Mermaidズーム機能を初期化開始');
    
    const mermaidContainers = document.querySelectorAll('.mermaid-chat-container:not([data-zoom-initialized])');
    console.log(`🎯 ${mermaidContainers.length}個のチャット内Mermaidコンテナを発見`);
    
    mermaidContainers.forEach((container, index) => {
        const mermaidElement = container.querySelector('.mermaid');
        if (!mermaidElement) {
            console.warn(`⚠️ チャットコンテナ #${index} にMermaid要素が見つかりません`);
            return;
        }
        
        // ズーム状態を初期化
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        
        // ズームコントロールボタンのイベント設定
        const zoomInBtn = container.querySelector('.zoom-in');
        const zoomOutBtn = container.querySelector('.zoom-out');
        const zoomResetBtn = container.querySelector('.zoom-reset');
        
        // 拡大ボタン
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                scale *= 1.2;
                applyTransform();
            });
        }
        
        // 縮小ボタン
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                scale /= 1.2;
                applyTransform();
            });
        }
        
        // リセットボタン
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                scale = 1;
                translateX = 0;
                translateY = 0;
                applyTransform();
            });
        }
        
        // 変形適用関数
        function applyTransform() {
            mermaidElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            mermaidElement.style.transformOrigin = 'center center';
            mermaidElement.style.transition = 'transform 0.3s ease';
        }
        
        // マウスホイールでズーム
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= delta;
            applyTransform();
        });
        
        // ドラッグでパン
        mermaidElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            mermaidElement.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            translateX += deltaX;
            translateY += deltaY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            applyTransform();
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                mermaidElement.style.cursor = 'grab';
            }
        });
        
        container.setAttribute('data-zoom-initialized', 'true');
    });
}

// ★★★ デバッグ用：Mermaidグラフテスト関数 ★★★
window.testMermaidInChat = function(sessionId = 'test') {
    const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
    if (!dialogueArea) {
        console.log('テスト用の対話エリアを作成します');
        const testContainer = document.createElement('div');
        testContainer.id = `dialogue-area-${sessionId}`;
        testContainer.style.cssText = 'border: 2px dashed #ccc; padding: 20px; margin: 20px; min-height: 300px; background: #f9f9f9;';
        document.body.appendChild(testContainer);
    }

    // テスト用のMermaidコードを含むAIレスポンスをシミュレート
    const testDialogue = `理央@thinking: 都市発展段階説を図で示すとこんな感じになるね。

\`\`\`mermaid
graph TD
    A[都市化<br/>Urbanization] --> B[郊外化<br/>Suburbanization]
    B --> C[反都市化<br/>Disurbanization]
    C --> D[再都市化<br/>Reurbanization]
    D -.-> A
    
    A --> A1[中心部集中]
    B --> B1[郊外拡散]
    C --> C1[全体衰退]
    D --> D1[中心回帰]
\`\`\`

これでクラッセンの理論がより分かりやすくなるはずよ。`;

    console.log('🎯 Mermaidテスト実行中...');
    displaySingleDialogue(testDialogue, sessionId);
};

// ★★★ デバッグ用：より複雑なMermaidテスト ★★★
window.testComplexMermaidInChat = function(sessionId = 'test') {
    const testDialogue = `みかん@excited: 都市の人口変化を表にしてみたよ！

\`\`\`mermaid
flowchart LR
    subgraph "1970年代"
        A1[東京圏<br/>急成長] --> A2[大阪圏<br/>成長鈍化]
        A2 --> A3[地方都市<br/>人口減少]
    end
    
    subgraph "1990年代"
        B1[東京圏<br/>一極集中] --> B2[大阪圏<br/>停滞]
        B2 --> B3[地方都市<br/>空洞化]
    end
    
    subgraph "2020年代"
        C1[東京圏<br/>都心回帰] --> C2[大阪圏<br/>回復兆候]
        C2 --> C3[地方都市<br/>選択的成長]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    B1 --> C1
    B2 --> C2
    B3 --> C3
\`\`\`

どうかな？時代の流れがよく分かるでしょ？`;

    console.log('🎯 複雑なMermaidテスト実行中...');
    displaySingleDialogue(testDialogue, sessionId);
};
