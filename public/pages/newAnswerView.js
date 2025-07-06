// newAnswerView.js - 新生答案添削ビューのメインコントローラー

/**
 * 新生答案添削ビューを開始
 * @param {number} quizIndex - 問題のインデックス
 * @param {number} subIndex - 小問のインデックス
 */
function enterNewAnswerView(quizIndex, subIndex) {
    console.log(`🎯 新生答案添削ビュー開始: 問題${quizIndex}-${subIndex}`);
    
    // メイン画面を隠す
    document.body.style.overflow = 'hidden';
    
    // 問題情報を取得
    const problemInfo = getProblemInfo(quizIndex, subIndex);
    
    // オーバーレイを作成
    const overlay = document.createElement('div');
    overlay.id = 'new-answer-overlay';
    overlay.className = 'new-answer-overlay';
    
    // 4カラムレイアウトHTML（グリッドレイアウト）
    overlay.innerHTML = `
        <div class="new-answer-container">
            <!-- ミニヘッダー（戻るボタンのみ） -->
            <div class="mini-header">
                <button id="back-to-main-btn" class="back-btn">← 戻る</button>
            </div>
            
            <!-- 4カラムメインエリア（グリッドレイアウト） -->
            <div class="main-columns">
                <!-- (1) 条文表示エリア - 左上 -->
                <div class="column column-article">
                    <div class="column-header">📖 条文</div>
                    <div class="column-content" id="article-area">
                        <div class="loading-text">条文を読み込み中...</div>
                    </div>
                </div>
                
                <!-- (2) 問題文エリア - 右上 -->
                <div class="column column-problem">
                    <div class="column-header">📝 問題文</div>
                    <div class="column-content" id="problem-area">
                        <div class="problem-text">${problemInfo.content}</div>
                    </div>
                </div>
                
                <!-- (3) Q&A表示エリア - 左下 -->
                <div class="column column-qa">
                    <div class="column-header">💬 Q&A</div>
                    <div class="column-content" id="qa-area">
                        <button id="toggle-qa-btn" class="btn-primary">Q&Aを表示</button>
                        <div id="qa-content" class="qa-content hidden">
                            Q&A内容がここに表示されます
                        </div>
                    </div>
                </div>
                
                <!-- (4) 答案製作エリア - 右下（大きく） -->
                <div class="column column-answer">
                    <div class="column-header">✏️ 答案</div>
                    <div class="column-content" id="answer-area">
                        <div class="answer-controls">
                            <button id="save-draft-btn" class="btn-secondary">💾 下書き保存</button>
                            <button id="clear-answer-btn" class="btn-secondary">🗑️ クリア</button>
                            <span id="char-counter" class="char-counter">0 / 690文字</span>
                        </div>
                        <div class="answer-input-wrapper">
                            <textarea 
                                id="answer-textarea" 
                                class="answer-textarea"
                                placeholder="30文字×23行の答案用紙&#10;各行は30文字で自動改行されます&#10;基本的なテキスト操作（コピー・ペースト・削除等）が使用できます"
                                data-quiz-index="${quizIndex}"
                                data-sub-index="${subIndex}"
                            ></textarea>
                        </div>
                    </div>
                </div>
                
                <!-- (5) 答案添削結果エリア - 右側中央 -->
                <div class="column column-correction">
                    <div class="column-header">🤖 添削結果</div>
                    <div class="column-content" id="correction-area">
                        <button id="start-correction-btn" class="btn-primary">AI添削開始</button>
                        <div id="correction-result" class="correction-result hidden">
                            添削結果がここに表示されます
                        </div>
                    </div>
                </div>
                
                <!-- (6) みんなの意見エリア - 右端 -->
                <div class="column column-opinion">
                    <div class="column-header">👥 みんなの意見</div>
                    <div class="column-content" id="opinion-area">
                        <div class="chat-area">
                            <div class="chat-messages" id="chat-messages">
                                <div class="system-message">AIキャラとの対話を開始してください</div>
                            </div>
                            <div class="chat-input-area">
                                <input type="text" id="chat-input" class="chat-input" placeholder="メッセージを入力...">
                                <button id="send-chat-btn" class="btn-primary">送信</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 各エリアを初期化
    initializeNewAnswerViewComponents(quizIndex, subIndex, problemInfo);
    
    console.log('✅ 新生答案添削ビューを表示しました');
}

/**
 * 問題情報を取得する
 */
function getProblemInfo(quizIndex, subIndex) {
    let title = `問題 ${parseInt(quizIndex) + 1}`;
    let content = '問題内容を読み込み中...';
    
    try {
        if (window.currentCaseData && window.currentCaseData.quiz && window.currentCaseData.quiz[quizIndex]) {
            const quizGroup = window.currentCaseData.quiz[quizIndex];
            
            if (quizGroup.subProblems && quizGroup.subProblems[subIndex]) {
                const subProblem = quizGroup.subProblems[subIndex];
                title = `${quizGroup.title || 'ミニ論文問題'} - 小問 ${parseInt(subIndex) + 1}`;
                if (subProblem.title) {
                    title += `: ${subProblem.title}`;
                }
                content = subProblem.problem || '問題内容がありません';
            } else if (subIndex === 0 && quizGroup.problem) {
                title = quizGroup.title || 'ミニ論文問題';
                content = quizGroup.problem;
            }
        }
    } catch (error) {
        console.error('問題情報の取得でエラーが発生しました:', error);
    }
    
    return { title, content };
}

/**
 * 新生答案ビューを終了
 */
function exitNewAnswerView() {
    console.log('🚪 新生答案添削ビューを終了します...');
    
    const overlay = document.getElementById('new-answer-overlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
    
    document.body.style.overflow = '';
    console.log('✅ 新生答案添削ビューを終了しました');
}

// グローバル公開（miniEssay.jsで呼び出される関数名に合わせる）
window.startNewAnswerView = enterNewAnswerView;
window.showAnswerSheetOnlyView = enterNewAnswerView; // 同じビューを使用
window.closeAnswerViewOverlay = exitNewAnswerView;
window.enterNewAnswerView = enterNewAnswerView; // 既存の名前も残す
window.exitNewAnswerView = exitNewAnswerView;
