// newAnswerViewComponents.js - 新生答案ビューの各コンポーネント初期化

/**
 * 新生答案ビューの各コンポーネントを初期化
 */
function initializeNewAnswerViewComponents(quizIndex, subIndex, problemInfo) {
    console.log('🔧 新生答案ビューコンポーネントを初期化中...');
    
    // 1. イベントリスナーを設定
    setupEventListeners(quizIndex, subIndex);
    
    // 2. 答案入力エリアを初期化
    initializeAnswerInput(quizIndex, subIndex);
    
    // 3. 条文表示エリアを初期化
    initializeArticleArea();
    
    // 4. Q&Aエリアを初期化
    initializeQAArea();
    
    // 5. 添削結果エリアを初期化
    initializeCorrectionArea();
    
    // 6. チャットエリアを初期化
    initializeChatArea();
    
    console.log('✅ 新生答案ビューコンポーネントの初期化完了');
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners(quizIndex, subIndex) {
    // 戻るボタン（ミニヘッダー）
    const backBtn = document.getElementById('back-to-main-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exitNewAnswerView();
        });
    }
    
    // ESCキーで戻る
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            exitNewAnswerView();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Q&A表示切り替え
    const toggleQABtn = document.getElementById('toggle-qa-btn');
    if (toggleQABtn) {
        toggleQABtn.addEventListener('click', () => {
            const qaContent = document.getElementById('qa-content');
            if (qaContent) {
                qaContent.classList.toggle('hidden');
                toggleQABtn.textContent = qaContent.classList.contains('hidden') ? 'Q&Aを表示' : 'Q&Aを非表示';
            }
        });
    }
    
    // 下書き保存ボタン
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            if (window.saveDraftAnswer) {
                window.saveDraftAnswer(quizIndex, subIndex);
            } else {
                console.warn('⚠️ saveDraftAnswer関数が見つかりません');
            }
        });
    }
    
    // クリアボタン
    const clearBtn = document.getElementById('clear-answer-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('答案をクリアしますか？')) {
                if (window.clearAnswer) {
                    window.clearAnswer();
                } else {
                    console.warn('⚠️ clearAnswer関数が見つかりません');
                }
            }
        });
    }
    
    // AI添削開始ボタン
    const correctionBtn = document.getElementById('start-correction-btn');
    if (correctionBtn) {
        correctionBtn.addEventListener('click', () => {
            if (window.startAICorrection) {
                window.startAICorrection(quizIndex, subIndex);
            } else {
                console.warn('⚠️ startAICorrection関数が見つかりません');
            }
        });
    }
    
    // チャット送信
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', () => {
            sendChatMessage();
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    
    console.log('✅ イベントリスナーを設定しました');
}

/**
 * 答案入力エリアを初期化
 */
function initializeAnswerInput(quizIndex, subIndex) {
    const textarea = document.getElementById('answer-textarea');
    if (!textarea) return;
    
    console.log('✏️ 答案入力エリアを初期化中...');
    
    // answerInputControl.jsの読み込み完了を待つ
    const waitForAnswerControl = () => {
        if (window.setupAnswerInputControl) {
            // 30文字×23行の制御を設定
            window.setupAnswerInputControl(textarea, quizIndex, subIndex);
            
            // 初期化後にフォントサイズを強制調整（30文字確実維持）
            const forceAdjust = () => {
                if (window.adjustAnswerAreaFontSize) {
                    window.adjustAnswerAreaFontSize();
                    console.log('🎯 フォントサイズ強制調整実行');
                }
            };
            
            // 複数回実行で確実に調整
            setTimeout(forceAdjust, 10);
            setTimeout(forceAdjust, 50);
            setTimeout(forceAdjust, 100);
            setTimeout(forceAdjust, 200);
            setTimeout(forceAdjust, 500);
            setTimeout(forceAdjust, 1000);
            
            // プレースホルダーを設定
            textarea.placeholder = '30文字×23行の答案用紙\n各行最大30文字で自動改行されます';
            
            // 下書きを復元
            if (window.loadDraftAnswer) {
                window.loadDraftAnswer(quizIndex, subIndex);
            } else {
                console.warn('⚠️ loadDraftAnswer関数が見つかりません');
            }
            
            console.log('✅ 答案入力エリアを初期化しました');
        } else {
            // answerInputControl.jsがまだ読み込まれていない場合、少し待ってから再試行
            console.log('⏳ answerInputControl.jsの読み込み完了を待機中...');
            setTimeout(waitForAnswerControl, 100);
        }
    };
    
    waitForAnswerControl();
}

/**
 * 条文表示エリアを初期化
 */
function initializeArticleArea() {
    const articleArea = document.getElementById('article-area');
    if (!articleArea) return;
    
    console.log('📖 条文表示エリアを初期化中...');
    
    // 条文タブの HTML を生成
    articleArea.innerHTML = `
        <div class="article-tabs" style="margin-bottom: 1rem;">
            <button class="article-tab active" data-law="民法">民法</button>
            <button class="article-tab" data-law="商法">商法</button>
            <button class="article-tab" data-law="会社法">会社法</button>
            <button class="article-tab" data-law="憲法">憲法</button>
        </div>
        <div class="article-content" style="
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            padding: 1rem;
            font-size: 0.875rem;
            line-height: 1.6;
            max-height: 400px;
            overflow-y: auto;
        ">
            <div class="loading-text">条文タブをクリックして表示してください</div>
        </div>
    `;
    
    // 条文タブのクリックイベント
    const articleTabs = articleArea.querySelectorAll('.article-tab');
    const articleContent = articleArea.querySelector('.article-content');
    
    articleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // アクティブタブの切り替え
            articleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const lawType = tab.dataset.law;
            console.log(`📖 条文表示: ${lawType}`);
            
            // 既存の条文表示機能を呼び出し
            if (window.showArticles) {
                window.showArticles();
            } else if (window.setupArticleRefButtons) {
                window.setupArticleRefButtons();
            } else {
                // ダミーの条文表示
                articleContent.innerHTML = `
                    <h3 style="color: #1e40af; margin-bottom: 1rem;">${lawType}</h3>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                        <strong>第1条（目的）</strong><br>
                        この法律は、${lawType}に関する基本的な規定を定めることを目的とする。
                    </div>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                        <strong>第2条（定義）</strong><br>
                        この法律において使用する用語の意義は、次の各号に定めるところによる。
                    </div>
                    <div style="text-center; color: #6b7280; font-size: 0.8rem; margin-top: 1rem;">
                        ※ 実際の条文は既存の条文表示システムから読み込まれます
                    </div>
                `;
            }
        });
    });
    
    console.log('✅ 条文表示エリアを初期化しました');
}

/**
 * Q&Aエリアを初期化
 */
function initializeQAArea() {
    const qaArea = document.getElementById('qa-area');
    if (!qaArea) return;
    
    console.log('💬 Q&Aエリアを初期化中...');
    
    // Q&A表示の初期HTML
    qaArea.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <button id="toggle-qa-btn" class="btn-primary" style="
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: white;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.3s ease;
            ">💬 Q&Aを表示</button>
        </div>
        <div id="qa-content" class="qa-content hidden" style="display: none;">
            <div class="qa-list">
                <div class="qa-item" style="
                    background: white;
                    border: 1px solid #e0e7ff;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                ">
                    <div class="qa-question" style="
                        font-weight: bold;
                        color: #1e40af;
                        margin-bottom: 0.5rem;
                        font-size: 0.875rem;
                    ">Q1: この問題のポイントは何ですか？</div>
                    <div class="qa-answer" style="
                        color: #374151;
                        font-size: 0.8rem;
                        line-height: 1.5;
                    ">法的構成要件の確認と適用範囲の検討が重要です。</div>
                </div>
                <div class="qa-item" style="
                    background: white;
                    border: 1px solid #e0e7ff;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                ">
                    <div class="qa-question" style="
                        font-weight: bold;
                        color: #1e40af;
                        margin-bottom: 0.5rem;
                        font-size: 0.875rem;
                    ">Q2: 検討すべき条文はありますか？</div>
                    <div class="qa-answer" style="
                        color: #374151;
                        font-size: 0.8rem;
                        line-height: 1.5;
                    ">民法第○条、第○条を中心に検討してください。</div>
                </div>
            </div>
        </div>
    `;
    
    // Q&A表示切り替えのイベント
    const toggleBtn = qaArea.querySelector('#toggle-qa-btn');
    const qaContent = qaArea.querySelector('#qa-content');
    
    if (toggleBtn && qaContent) {
        toggleBtn.addEventListener('click', () => {
            if (qaContent.style.display === 'none') {
                qaContent.style.display = 'block';
                toggleBtn.textContent = '💬 Q&Aを非表示';
                
                // 既存のQ&A機能と連携
                if (window.loadQAContent) {
                    window.loadQAContent();
                }
            } else {
                qaContent.style.display = 'none';
                toggleBtn.textContent = '💬 Q&Aを表示';
            }
        });
    }
    
    console.log('✅ Q&Aエリアを初期化しました');
}

/**
 * 添削結果エリアを初期化
 */
function initializeCorrectionArea() {
    const correctionArea = document.getElementById('correction-area');
    if (correctionArea) {
        // 添削結果表示の準備
    }
    
    console.log('✅ 添削結果エリアを初期化しました');
}

/**
 * チャットエリアを初期化
 */
function initializeChatArea() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        // AIキャラとの対話システムの準備
    }
    
    console.log('✅ チャットエリアを初期化しました');
}

/**
 * チャットメッセージを送信
 */
function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // ユーザーメッセージを追加
    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.style.cssText = `
        background: #3b82f6;
        color: white;
        padding: 8px 12px;
        border-radius: 12px;
        margin: 4px 0;
        align-self: flex-end;
        max-width: 80%;
    `;
    userMsg.textContent = message;
    chatMessages.appendChild(userMsg);
    
    // AIレスポンス（簡易版）
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        aiMsg.style.cssText = `
            background: #f3f4f6;
            color: #374151;
            padding: 8px 12px;
            border-radius: 12px;
            margin: 4px 0;
            align-self: flex-start;
            max-width: 80%;
        `;
        aiMsg.textContent = `「${message}」について考えていますね。もう少し具体的に教えてください。`;
        chatMessages.appendChild(aiMsg);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// グローバル公開
window.initializeNewAnswerViewComponents = initializeNewAnswerViewComponents;
