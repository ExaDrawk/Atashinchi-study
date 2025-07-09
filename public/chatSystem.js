// chatSystem.js - チャット・対話システムモジュール（キャラクター回答の条文処理対応）

import { processArticleReferences, processAllReferences, setupArticleRefButtons } from './articleProcessor.js';
import { characters, generateLocationNarration, getGlobalRulesAsText, getGlobalHonorificRulesAsText, getStoryContextRulesAsText, getOutputFormatRules, getLocationManagementRules, getSessionTypeInstructions, getBasicConversationRules, getArticleReferenceRules, getFollowUpLocationRules } from './data/characters.js';
import { generateInitialPrompt, generateCharacterPersonaPrompt } from './data/prompts.js';

// ★★★ ヘルパー関数 ★★★
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    
    // 【】で囲んだ後に、一度だけ統合処理を実行
    processedText = processAllReferences(processedText, supportedLaws, questionsAndAnswers);
    
    return processedText;
}

// ★★★ チャットセッション開始（複数小問対応） ★★★
export async function startChatSession(button, currentCaseData) {
    console.log('=== startChatSession開始（story/explanation対応） ===');
    
    // AI応答の重複防止チェック（即座に強制リセット）
    if (window.isCharacterDialogueInProgress) {
        console.warn('⚠️ チャットセッションが既に進行中です - 即座に強制リセット');
        // 2秒経過していれば強制的にフラグをリセット（短縮）
        if (!window.lastDialogueStartTime || (Date.now() - window.lastDialogueStartTime) > 2000) {
            console.log('🔄 進行中フラグを強制リセット');
            window.isCharacterDialogueInProgress = false;
            window.lastDialogueStartTime = null;
        } else {
            console.log('🔄 フラグを即座に強制リセット（緊急処理）');
            window.isCharacterDialogueInProgress = false;
            window.lastDialogueStartTime = null;
        }
    }
    
    window.isCharacterDialogueInProgress = true;
    window.lastDialogueStartTime = Date.now(); // 開始時間を記録
    
    try {
        // buttonがDOM要素でない場合の処理
        if (!button || typeof button.closest !== 'function') {
            console.error('❌ button が有効なDOM要素ではありません:', button);
            throw new Error('無効なbutton要素');
        }
        
        const type = button.dataset?.type;
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
            <div class="bg-gray-50 p-4 rounded-lg border animate-fade-in">
                <h4 class="text-lg font-bold mb-3">${chatTitle}</h4>
                <div id="dialogue-area-${sessionId}" class="space-y-4 h-[70vh] overflow-y-auto p-4 bg-white border rounded-lg custom-scrollbar">
                    <!-- 初期表示は空 -->
                </div>
                <div class="mt-4 flex gap-2">
                    <textarea id="chat-follow-up-input-${sessionId}" class="w-full p-4 border rounded-lg focus-ring" style="height: 120px; resize: none;" placeholder="さらに質問や反論をどうぞ…"></textarea>
                    <button id="send-follow-up-btn-${sessionId}" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg btn-hover" data-session-id="${sessionId}">送信</button>
                </div>
            </div>        `;
        
        let initialPrompt;
        if (type === 'story' || type === 'explanation') {
            // ストーリー・解説Q&A用のプロンプト（簡易版）
            initialPrompt = generateInitialPrompt(userInput, problemText, modelAnswer, currentCaseData);
        } else {
            // 従来の添削用プロンプト
            const characterNames = [...new Set(currentCaseData.story.filter(s => s.type === 'dialogue').map(s => s.speaker))];
            const locationNarration = generateLocationNarration(characterNames);
            
            // 基本のプロンプトを取得
            const basePrompt = generateInitialPrompt(userInput, problemText, modelAnswer, currentCaseData);
            // ナレーションを統合（簡易版）
            initialPrompt = basePrompt + '\n\n' + locationNarration;
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
    let followUpLoaderId = null; // スコープを広げる
    
    try {
        const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
        if (!dialogueArea) {
            console.error('❌ dialogue-area が見つかりません:', sessionId);
            return;
        }

        console.log('🚀 sendMessageToAI開始:', { sessionId, promptLength: promptText?.length });

        // ローディング表示（追記用）
        followUpLoaderId = `follow-up-loader-${Date.now()}`;
        dialogueArea.insertAdjacentHTML('beforeend', `<div id="${followUpLoaderId}" class="text-center p-2"><div class="loader-small mx-auto"></div></div>`);
        dialogueArea.scrollTop = dialogueArea.scrollHeight;

        const history = window.conversationHistories[sessionId] || [];

        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({
                message: promptText,
                history: history,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`APIエラー: ${response.status} - ${errorData.error || '不明なエラー'}. 詳細: ${errorData.detail || 'なし'}`);
        }
        
        const result = await response.json();
        const aiResponse = result.reply || result.text || result.message || '';
        console.log('✅ AI応答取得:', { responseLength: aiResponse.length });

        // 🔥 AI応答レベルでの完全な重複チェック（最強版）
        if (dialogueArea) {
            // 1. 履歴ベースの重複チェック
            if (window.conversationHistories[sessionId]) {
                const lastResponses = window.conversationHistories[sessionId]
                    .filter(msg => msg.role === 'model')
                    .slice(-5) // 直近5回の応答をチェック
                    .map(msg => msg.parts[0].text.trim());
                
                if (lastResponses.includes(aiResponse.trim())) {
                    console.warn('🚫 履歴ベースでAI応答の重複を検出、処理をスキップ:', aiResponse.substring(0, 100));
                    return;
                }
            }
            
            // 2. 表示済み内容ベースの重複チェック
            const existingMessages = Array.from(dialogueArea.querySelectorAll('.dialogue-message, .original-content'))
                .map(el => el.textContent?.trim() || '')
                .filter(text => text.length > 10);
            
            const responseToCheck = aiResponse.trim();
            for (const existing of existingMessages) {
                if (existing === responseToCheck) {
                    console.warn('🚫 表示済み内容でAI応答の重複を検出、処理をスキップ:', responseToCheck.substring(0, 100));
                    return;
                }
                
                // 部分的な重複もチェック（80%以上一致）
                if (existing.length > 50 && responseToCheck.length > 50) {
                    const similarity = calculateSimilarity(existing, responseToCheck);
                    if (similarity > 0.8) {
                        console.warn('🚫 高い類似度でAI応答の重複を検出、処理をスキップ:', `類似度: ${(similarity * 100).toFixed(1)}%`);
                        return;
                    }
                }
            }
            
            // 3. 特定のキャラクター発言の重複チェック
            const speakerMatches = responseToCheck.match(/([^@:：]+)[@:]([^:：]*?)[:：]/g);
            if (speakerMatches) {
                for (const match of speakerMatches) {
                    const existingSpeakers = Array.from(dialogueArea.querySelectorAll('.dialogue-speaker'))
                        .map(el => el.textContent?.trim() || '');
                    
                    const currentSpeaker = match.split(/[@:：]/)[0].trim();
                    if (existingSpeakers.filter(s => s === currentSpeaker).length >= 2) {
                        console.warn('🚫 同一キャラクターの過度な重複発言を検出:', currentSpeaker);
                        return;
                    }
                }
            }
        }

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

        // ローディング表示を削除
        const loaderToRemove = document.getElementById(followUpLoaderId) || document.getElementById(`loading-indicator-${sessionId}`);
        if (loaderToRemove) loaderToRemove.remove();
        
        window.conversationHistories[sessionId].push({ role: 'model', parts: [{ text: aiResponse }] });

        // AIレスポンスの前処理：ナレーション部分を分離
        let processedResponse = aiResponse;
        
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
        
        // 混在したナレーション＋対話の処理（前処理で分割）
        tempResponse = tempResponse.replace(/^(.+?。.+?。)\s+([^。]+@[^:]+:.*)$/gm, '$1---$2');
        
        const dialogues = tempResponse.split('---').filter(d => d.trim() !== '');
        
        for (const dialogue of dialogues) {
            await sleep(1500);
            
            // ナレーション特別処理
            if (dialogue.startsWith('NARRATION:')) {
                const narrationText = dialogue.replace('NARRATION:', '').trim();
                displayNarration(narrationText, sessionId);
            } else {
                // 通常の対話処理（ナレーション処理を迂回）
                displaySingleDialogue(dialogue, sessionId, true); // skipNarrationフラグを追加
            }
        }
        
        // ★★★ 全ての対話表示完了後にMermaid初期化 ★★★
        setTimeout(() => {
            if (typeof initializeChatMermaid === 'function') {
                initializeChatMermaid();
            }
        }, 500); // 最後の対話表示を待つ
        
        // ★★★ 改良されたスコア抽出とデバッグ ★★★
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
        const loaderToRemove = document.getElementById(followUpLoaderId) || document.getElementById(`loading-indicator-${sessionId}`);
        if (loaderToRemove) loaderToRemove.remove();
        
        const dialogueArea = document.getElementById(`dialogue-area-${sessionId}`);
        if (dialogueArea) {
            dialogueArea.insertAdjacentHTML('beforeend', `<p class="text-red-500 p-4">エラー: ${error.message}</p>`);
        }
    } finally {
        // 最終的にローディングを確実に削除
        setTimeout(() => {
            const finalLoader = document.getElementById(followUpLoaderId) || document.getElementById(`loading-indicator-${sessionId}`);
            if (finalLoader) finalLoader.remove();
        }, 100);
        
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
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
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
    dialogueArea.scrollTop = dialogueArea.scrollHeight;
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

    // 🔥 重複チェック強化: 複数の条件で重複を防止
    const existingOriginals = dialogueArea.querySelectorAll('.original-content');
    const existingVisibleText = dialogueArea.querySelectorAll('.dialogue-message, .dialogue-speaker, h5');
    
    // 1. 原文ベースの重複チェック
    for (const existing of existingOriginals) {
        if (existing.textContent.trim() === trimmedDialogue.trim()) {
            console.warn('🚫 重複した対話をスキップ（原文一致）:', trimmedDialogue.substring(0, 50));
            return;
        }
    }
    
    // 2. 表示テキストベースの重複チェック
    for (const existing of existingVisibleText) {
        const existingText = existing.textContent.trim();
        if (existingText && existingText === trimmedDialogue.trim()) {
            console.warn('🚫 重複した対話をスキップ（表示一致）:', trimmedDialogue.substring(0, 50));
            return;
        }
    }
    
    // 3. 話者名の重複チェック（連続する同じ話者の発言）
    const lastSpeaker = dialogueArea.querySelector('.dialogue-speaker:last-child');
    const speakerMatch = trimmedDialogue.match(/^([^：\n]+)[:：]/);
    if (lastSpeaker && speakerMatch) {
        const currentSpeaker = speakerMatch[1].trim();
        if (lastSpeaker.textContent.trim() === currentSpeaker) {
            console.warn('🚫 連続する同じ話者の発言をスキップ:', currentSpeaker);
            return;
        }
    }

    // skipNarrationフラグがfalseの場合のみナレーション処理を実行
    if (!skipNarration) {
        // ナレーション処理を試行
        const narrationResult = processNarration(trimmedDialogue, sessionId);
        if (narrationResult && narrationResult.processed) {
            // ナレーション処理が完了した場合
            if (narrationResult.remainingDialogue) {
                // 残りの対話部分があれば再帰処理
                displaySingleDialogue(narrationResult.remainingDialogue, sessionId, true);
            }
            return;
        }
    }

    const isScrolledToBottom = dialogueArea.scrollHeight - dialogueArea.clientHeight <= dialogueArea.scrollTop + 1;

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
    if (typeof processMermaidInDialogue === 'function') {
        processedDialogueText = processMermaidInDialogue(processedDialogueText);
    }
    
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
    
    // ★★★ Mermaidグラフが含まれている場合の初期化処理 ★★★
    if (processedDialogueText.includes('mermaid-chat-container')) {
        setTimeout(() => {
            if (typeof initializeChatMermaid === 'function') {
                initializeChatMermaid();
            }
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