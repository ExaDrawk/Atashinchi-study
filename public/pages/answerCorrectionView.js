// answerCorrectionView.js - 完全新設計の答案添削ビュー

/**
 * 答案添削ビューを表示
 */
window.showAnswerCorrectionView = function(quizIndex, subIndex) {
    console.log('🚀 答案添削ビュー開始');
    
    // 既存のオーバーレイを削除
    const existing = document.getElementById('answer-correction-overlay');
    if (existing) existing.remove();
    
    // オーバーレイを作成
    const overlay = createAnswerCorrectionOverlay();
    document.body.appendChild(overlay);
    
    // 答案エリアを初期化
    setTimeout(() => {
        initializeAnswerTextarea();
    }, 100);
    
    console.log('✅ 答案添削ビュー表示完了');
};

/**
 * 答案添削オーバーレイを作成
 */
function createAnswerCorrectionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'answer-correction-overlay';
    overlay.innerHTML = getAnswerCorrectionHTML();
    return overlay;
}

/**
 * 答案添削ビューのHTML
 */
function getAnswerCorrectionHTML() {
    return `
        <style>
            #answer-correction-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #ffffff;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .answer-header {
                background: #f8f9fa;
                padding: 15px 25px;
                border-bottom: 2px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .answer-header h1 {
                font-size: 24px;
                font-weight: bold;
                color: #343a40;
                margin: 0;
            }
            
            .close-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: background 0.2s;
            }
            
            .close-btn:hover {
                background: #c82333;
            }
            
            .answer-grid {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 15px;
                padding: 20px;
                height: calc(100vh - 80px);
                overflow: hidden;
            }
            
            .grid-section {
                border: 2px solid #dee2e6;
                border-radius: 10px;
                padding: 20px;
                background: white;
                overflow: auto;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .grid-section.articles {
                grid-column: 1;
                grid-row: 1;
            }
            
            .grid-section.qa {
                grid-column: 2;
                grid-row: 1;
            }
            
            .grid-section.answer-writing {
                grid-column: 1 / 3;
                grid-row: 2;
            }
            
            .grid-section.correction {
                grid-column: 3;
                grid-row: 1 / 3;
            }
            
            .grid-section.opinions {
                grid-column: 4;
                grid-row: 1 / 3;
            }
            
            .section-header {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #495057;
                border-bottom: 2px solid #e9ecef;
                padding-bottom: 10px;
                display: flex;
                align-items: center;
            }
            
            .section-header .icon {
                margin-right: 8px;
                font-size: 20px;
            }
            
            .answer-writing-area {
                position: relative;
                height: calc(100% - 80px);
                overflow: hidden;
            }
            
            .answer-textarea {
                width: 100%;
                height: 100%;
                border: none;
                outline: none;
                resize: none;
                font-family: 'Courier New', 'MS Gothic', monospace;
                font-size: 16px;
                line-height: 24px;
                letter-spacing: 0.5px;
                background: transparent;
                position: relative;
                z-index: 2;
                padding: 0;
                margin: 0;
                overflow: hidden;
            }
            
            .textarea-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 1;
                background-image: repeating-linear-gradient(
                    transparent,
                    transparent 23px,
                    #e9ecef 23px,
                    #e9ecef 24px
                );
            }
            
            .answer-controls {
                margin-top: 15px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            }
            
            .control-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s;
            }
            
            .control-btn:hover {
                background: #0056b3;
            }
            
            .control-btn.secondary {
                background: #6c757d;
            }
            
            .control-btn.secondary:hover {
                background: #545b62;
            }
            
            .char-info {
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 13px;
                color: #6c757d;
                border: 1px solid #dee2e6;
            }
            
            .char-info.warning {
                background: #fff3cd;
                color: #856404;
                border-color: #ffeaa7;
            }
            
            .char-info.error {
                background: #f8d7da;
                color: #721c24;
                border-color: #f5c6cb;
            }
            
            .section-content {
                color: #6c757d;
                line-height: 1.6;
            }
            
            .placeholder-text {
                color: #adb5bd;
                font-style: italic;
            }
        </style>
        
        <div class="answer-header">
            <h1>📝 答案添削ビュー</h1>
            <button class="close-btn" onclick="closeAnswerCorrectionView()">✕ 閉じる</button>
        </div>
        
        <div class="answer-grid">
            <!-- 条文表示 -->
            <div class="grid-section articles">
                <div class="section-header">
                    <span class="icon">📚</span>
                    条文
                </div>
                <div class="section-content">
                    <div class="placeholder-text">関連条文がここに表示されます</div>
                </div>
            </div>
            
            <!-- Q&A -->
            <div class="grid-section qa">
                <div class="section-header">
                    <span class="icon">❓</span>
                    Q&A
                </div>
                <div class="section-content">
                    <div class="placeholder-text">質問と回答がここに表示されます</div>
                </div>
            </div>
            
            <!-- 答案作成 -->
            <div class="grid-section answer-writing">
                <div class="section-header">
                    <span class="icon">✍️</span>
                    答案作成（30文字×23行）
                </div>
                <div class="answer-writing-area">
                    <div class="textarea-background"></div>
                    <textarea 
                        id="answer-textarea"
                        class="answer-textarea"
                        placeholder="ここに答案を記入してください（1行30文字まで、最大23行）"
                        spellcheck="false"></textarea>
                </div>
                <div class="answer-controls">
                    <button class="control-btn" onclick="clearAnswerText()">🗑️ クリア</button>
                    <button class="control-btn" onclick="saveDraftAnswer()">💾 保存</button>
                    <button class="control-btn" onclick="loadDraftAnswer()">📂 読込</button>
                    <button class="control-btn secondary" onclick="insertSampleAnswer()">📝 サンプル</button>
                    <button class="control-btn" onclick="startAICorrection()">🤖 AI添削</button>
                    <div class="char-info" id="char-info">0文字 / 0行</div>
                </div>
            </div>
            
            <!-- 添削結果 -->
            <div class="grid-section correction">
                <div class="section-header">
                    <span class="icon">📝</span>
                    添削結果
                </div>
                <div class="section-content" id="correction-result">
                    <div class="placeholder-text">AI添削結果がここに表示されます</div>
                </div>
            </div>
            
            <!-- みんなの意見 -->
            <div class="grid-section opinions">
                <div class="section-header">
                    <span class="icon">💬</span>
                    みんなの意見
                </div>
                <div class="section-content">
                    <div class="placeholder-text">他の人の意見がここに表示されます</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 答案テキストエリアを初期化
 */
function initializeAnswerTextarea() {
    const textarea = document.getElementById('answer-textarea');
    if (!textarea) return;
    
    console.log('🎯 答案テキストエリア初期化開始');
    
    // 30文字に最適化されたフォントサイズを設定
    adjustFontSizeFor30Chars();
    
    // イベントリスナーを設定
    setupAnswerTextareaEvents(textarea);
    
    // リサイズ監視
    window.addEventListener('resize', handleAnswerViewResize);
    
    console.log('✅ 答案テキストエリア初期化完了');
}

/**
 * 30文字にフィットするフォントサイズを調整
 */
function adjustFontSizeFor30Chars() {
    const textarea = document.getElementById('answer-textarea');
    const container = textarea.parentElement;
    
    if (!textarea || !container) return;
    
    // コンテナの実際の幅を取得
    const containerWidth = container.clientWidth;
    const targetChars = 30;
    
    // パディングを考慮した実効幅
    const effectiveWidth = containerWidth - 40; // 左右20pxずつのマージン
    
    // 30文字にぴったり合うフォントサイズを計算
    let fontSize = Math.floor(effectiveWidth / targetChars * 0.6); // 0.6は文字幅係数
    
    // フォントサイズの範囲を制限
    fontSize = Math.max(10, Math.min(20, fontSize));
    
    // 等幅フォントなので行の高さも調整
    const lineHeight = fontSize + 8;
    
    textarea.style.fontSize = fontSize + 'px';
    textarea.style.lineHeight = lineHeight + 'px';
    
    // 背景の下線も調整
    const background = textarea.previousElementSibling;
    if (background) {
        background.style.backgroundImage = `repeating-linear-gradient(
            transparent,
            transparent ${lineHeight - 1}px,
            #e9ecef ${lineHeight - 1}px,
            #e9ecef ${lineHeight}px
        )`;
    }
    
    console.log(`📏 フォントサイズ調整: ${fontSize}px (行高: ${lineHeight}px)`);
}

/**
 * 答案テキストエリアのイベントを設定
 */
function setupAnswerTextareaEvents(textarea) {
    // 入力制御
    textarea.addEventListener('input', function(e) {
        enforceAnswerConstraints(this);
        updateCharacterInfo(this);
    });
    
    // キー入力制御
    textarea.addEventListener('keydown', function(e) {
        handleAnswerKeyInput(e, this);
    });
    
    // ペースト制御
    textarea.addEventListener('paste', function(e) {
        setTimeout(() => {
            enforceAnswerConstraints(this);
            updateCharacterInfo(this);
        }, 10);
    });
    
    console.log('👂 答案テキストエリアイベント設定完了');
}

/**
 * 答案の制約を実行（30文字×23行、自動改行）
 */
function enforceAnswerConstraints(textarea) {
    const lines = textarea.value.split('\n');
    const maxLines = 23;
    const maxCharsPerLine = 30;
    
    let modified = false;
    let cursorPos = textarea.selectionStart;
    
    // 行数制限
    if (lines.length > maxLines) {
        lines.splice(maxLines);
        modified = true;
        console.log(`⚠️ 行数制限適用: ${maxLines}行に制限`);
    }
    
    // 各行の文字数制限と自動改行
    const newLines = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 30文字を超える場合は自動改行
        while (line.length > maxCharsPerLine && newLines.length < maxLines - 1) {
            newLines.push(line.substring(0, maxCharsPerLine));
            line = line.substring(maxCharsPerLine);
            modified = true;
        }
        
        // 残りの文字または最後の行
        if (line.length > 0) {
            if (line.length > maxCharsPerLine && newLines.length >= maxLines - 1) {
                // 最大行数に達している場合は切り詰め
                newLines.push(line.substring(0, maxCharsPerLine));
                modified = true;
            } else {
                newLines.push(line);
            }
        }
        
        // 最大行数チェック
        if (newLines.length >= maxLines) {
            break;
        }
    }
    
    if (modified) {
        const newText = newLines.join('\n');
        textarea.value = newText;
        
        // カーソル位置を調整
        const newPos = Math.min(cursorPos, textarea.value.length);
        textarea.setSelectionRange(newPos, newPos);
        
        // 視覚的フィードバック
        textarea.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
            textarea.style.backgroundColor = 'transparent';
        }, 200);
        
        console.log(`✅ 自動改行適用: ${newLines.length}行に再構成`);
    }
}

/**
 * キー入力のハンドリング
 */
function handleAnswerKeyInput(e, textarea) {
    // 制御キーは許可
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    // 編集キーは許可
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    if (allowedKeys.includes(e.key)) return;
    
    // Enterキーの制御
    if (e.key === 'Enter') {
        const lines = textarea.value.split('\n');
        if (lines.length >= 23) {
            e.preventDefault();
            showTemporaryMessage('❌ 最大23行です');
            return;
        }
    }
    
    // 通常文字の制御は自動改行に任せる（制限しない）
    // 30文字超過時は自動的に次の行に移るようになりました
}

/**
 * 文字情報を更新
 */
function updateCharacterInfo(textarea) {
    const lines = textarea.value.split('\n');
    const charCount = textarea.value.replace(/\n/g, '').length;
    const lineCount = lines.length;
    
    // 最長行の文字数
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    const infoElement = document.getElementById('char-info');
    if (!infoElement) return;
    
    let text = `${charCount}文字 / ${lineCount}行`;
    let className = 'char-info';
    
    // 制約違反の警告
    if (lineCount > 23) {
        text += ' (行数超過)';
        className += ' error';
    } else if (lineCount > 20) {
        text += ' (行数制限に近づいています)';
        className += ' warning';
    }
    
    // 30文字制限の警告は削除（自動改行のため）
    
    infoElement.textContent = text;
    infoElement.className = className;
}

/**
 * 一時的なメッセージを表示
 */
function showTemporaryMessage(message) {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #dc3545;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
    `;
    msg.textContent = message;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        if (msg.parentNode) msg.remove();
    }, 1500);
}

/**
 * リサイズハンドリング
 */
function handleAnswerViewResize() {
    setTimeout(() => {
        adjustFontSizeFor30Chars();
    }, 100);
}

/**
 * 答案をクリア
 */
window.clearAnswerText = function() {
    const textarea = document.getElementById('answer-textarea');
    if (textarea) {
        textarea.value = '';
        updateCharacterInfo(textarea);
    }
    console.log('🗑️ 答案クリア完了');
};

/**
 * 下書き保存
 */
window.saveDraftAnswer = function() {
    const textarea = document.getElementById('answer-textarea');
    if (textarea && textarea.value.trim()) {
        localStorage.setItem('answerDraft', textarea.value);
        showTemporaryMessage('💾 下書きを保存しました');
    } else {
        showTemporaryMessage('❌ 保存する内容がありません');
    }
};

/**
 * 下書き読込
 */
window.loadDraftAnswer = function() {
    const textarea = document.getElementById('answer-textarea');
    const draft = localStorage.getItem('answerDraft');
    
    if (textarea && draft) {
        textarea.value = draft;
        enforceAnswerConstraints(textarea);
        updateCharacterInfo(textarea);
        showTemporaryMessage('📂 下書きを読み込みました');
    } else {
        showTemporaryMessage('❌ 保存された下書きがありません');
    }
};

/**
 * サンプル答案を挿入
 */
window.insertSampleAnswer = function() {
    const textarea = document.getElementById('answer-textarea');
    if (textarea) {
        const sample = `本件においては、まず契約の成立要件について検討する必要がある。民法第五百二十二条によると、契約は申込みと承諾により成立する。本件では、甲の行為が申込みに該当するか、乙の行為が承諾に該当するかを検討する。申込みとは、契約の成立に必要な事項を明確にして相手方に提示する意思表示である。本件甲の行為は、具体的な条件を示しており申込みと認められる。承諾とは申込みに対する同意の意思表示である。乙の行為は明確な同意を示しており承諾と認められる。よって本件契約は有効に成立していると考えられる。`;
        
        textarea.value = sample;
        enforceAnswerConstraints(textarea);
        updateCharacterInfo(textarea);
        showTemporaryMessage('📝 サンプルを挿入しました（自動改行適用）');
    }
};

/**
 * AI添削を開始
 */
window.startAICorrection = function() {
    const textarea = document.getElementById('answer-textarea');
    const resultArea = document.getElementById('correction-result');
    
    if (!textarea || !textarea.value.trim()) {
        showTemporaryMessage('❌ 答案が入力されていません');
        return;
    }
    
    if (resultArea) {
        resultArea.innerHTML = `
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
                <h4 style="margin: 0 0 10px 0; color: #007bff;">🤖 AI添削結果</h4>
                <div style="margin-bottom: 10px;">
                    <strong>📊 基本情報:</strong><br>
                    文字数: ${textarea.value.replace(/\n/g, '').length}文字<br>
                    行数: ${textarea.value.split('\n').length}行
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>📝 構成評価:</strong><br>
                    論理的な構成で書かれており、結論に至る過程が明確です。
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>⭐ 総合評価:</strong><br>
                    <span style="color: #28a745; font-weight: bold;">B+ (良好)</span>
                </div>
                <div style="font-size: 12px; color: #6c757d; margin-top: 15px;">
                    ※ これはデモ用の簡易添削結果です
                </div>
            </div>
        `;
        showTemporaryMessage('✅ AI添削が完了しました');
    }
};

/**
 * 答案添削ビューを閉じる
 */
window.closeAnswerCorrectionView = function() {
    const overlay = document.getElementById('answer-correction-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // リサイズイベントリスナーを削除
    window.removeEventListener('resize', handleAnswerViewResize);
    
    console.log('❌ 答案添削ビュー終了');
};

console.log('✅ answerCorrectionView.js ロード完了');
