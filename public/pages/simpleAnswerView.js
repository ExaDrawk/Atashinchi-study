// simpleAnswerView.js - 完全新設計の答案添削ビュー（シンプル版）

/**
 * 新しい答案ビューを表示する
 */
window.startSimpleAnswerView = function(quizIndex, subIndex) {
    console.log('🚀 シンプル答案ビュー開始');
    
    // 既存のオーバーレイを削除
    removeExistingOverlay();
    
    // オーバーレイを作成
    const overlay = createAnswerViewOverlay();
    document.body.appendChild(overlay);
    
    // 答案エリアを初期化
    initializeAnswerArea();
    
    // リサイズイベントリスナーを追加
    window.addEventListener('resize', handleWindowResize);
    
    console.log('✅ シンプル答案ビュー表示完了');
};

/**
 * 既存のオーバーレイを削除
 */
function removeExistingOverlay() {
    const existingOverlay = document.getElementById('simple-answer-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
}

/**
 * 答案ビューのオーバーレイを作成
 */
function createAnswerViewOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'simple-answer-overlay';
    overlay.innerHTML = getAnswerViewHTML();
    return overlay;
}

/**
 * 答案ビューのHTMLを取得
 */
function getAnswerViewHTML() {
    return `
        <style>
            #simple-answer-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: white;
                z-index: 9999;
                display: flex;
                flex-direction: column;
            }
            
            .answer-header {
                background: #f8f9fa;
                padding: 10px 20px;
                border-bottom: 2px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .close-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            }
            
            .close-btn:hover {
                background: #c82333;
            }
            
            .answer-main {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 10px;
                padding: 20px;
                overflow: hidden;
            }
            
            .answer-section {
                border: 2px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                background: white;
                overflow: auto;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #495057;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 5px;
            }
            
            #simple-answer-textarea {
                width: 100%;
                resize: none;
                border: none;
                outline: none;
                font-family: 'Courier New', monospace;
                background: transparent;
                position: relative;
                z-index: 2;
                line-height: 24px;
                letter-spacing: 0.05em;
                padding: 0;
                margin: 0;
            }
            
            .answer-input-container {
                position: relative;
                height: calc(100% - 40px);
                overflow: hidden;
            }
            
            .answer-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }
            
            .answer-controls {
                margin-top: 10px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .control-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .control-btn:hover {
                background: #0056b3;
            }
            
            .char-count {
                background: #f8f9fa;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                color: #6c757d;
            }
            
            .char-count.warning {
                background: #fff3cd;
                color: #856404;
            }
            
            .char-count.error {
                background: #f8d7da;
                color: #721c24;
            }
            
            .char-guide {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 1;
                color: #ccc;
                font-family: 'Courier New', monospace;
                white-space: pre;
                line-height: 24px;
                letter-spacing: 0.05em;
            }
        </style>
        
        <div class="answer-header">
            <h2>答案作成モード</h2>
            <button class="close-btn" onclick="closeSimpleAnswerView()">✕ 閉じる</button>
        </div>
        
        <div class="answer-main">
            <div class="answer-section">
                <div class="section-title">📚 条文表示</div>
                <div>関連条文がここに表示されます</div>
            </div>
            
            <div class="answer-section">
                <div class="section-title">❓ Q&A</div>
                <div>質問と回答がここに表示されます</div>
            </div>
            
            <div class="answer-section">
                <div class="section-title">✍️ 答案作成（30文字×23行）</div>
                <div class="answer-input-container">
                    <div class="answer-background" id="answer-background"></div>
                    <div class="char-guide" id="char-guide"></div>
                    <textarea 
                        id="simple-answer-textarea" 
                        placeholder="ここに答案を記入してください（1行30文字まで、最大23行）"
                        spellcheck="false"></textarea>
                </div>
                <div class="answer-controls">
                    <button class="control-btn" onclick="clearAnswer()">🗑️ クリア</button>
                    <button class="control-btn" onclick="saveDraft()">💾 下書き保存</button>
                    <button class="control-btn" onclick="loadDraft()">📂 下書き読込</button>
                    <button class="control-btn" onclick="insertSampleText()">📝 サンプル表示</button>
                    <button class="control-btn" onclick="aiCorrection()">🤖 AI添削</button>
                    <div class="char-count" id="char-count">0文字 / 0行</div>
                </div>
            </div>
            
            <div class="answer-section">
                <div class="section-title">📝 添削結果</div>
                <div id="correction-result">添削結果がここに表示されます</div>
            </div>
            
            <div class="answer-section">
                <div class="section-title">💬 みんなの意見</div>
                <div>他の人の意見がここに表示されます</div>
            </div>
            
            <div class="answer-section">
                <div class="section-title">🎯 重要ポイント</div>
                <div>解答のポイントがここに表示されます</div>
            </div>
        </div>
    `;
}

/**
 * 答案エリアを初期化
 */
function initializeAnswerArea() {
    const textarea = document.getElementById('simple-answer-textarea');
    if (!textarea) return;
    
    console.log('🎯 答案エリア初期化開始');
    
    // 初期フォントサイズを設定
    adjustFontSizeFor30Characters();
    
    // 背景線を描画
    drawBackgroundLines();
    
    // 30文字ガイドを表示
    drawCharacterGuide();
    
    // イベントリスナーを設定
    setupTextareaEvents(textarea);
    
    console.log('✅ 答案エリア初期化完了');
}

/**
 * 30文字にフィットするフォントサイズを調整
 */
function adjustFontSizeFor30Characters() {
    const textarea = document.getElementById('simple-answer-textarea');
    const container = textarea.parentElement;
    
    // コンテナの幅を取得
    const containerWidth = container.clientWidth;
    const targetChars = 30;
    
    // パディングやマージンを考慮した実効幅
    const effectiveWidth = containerWidth - 20; // 左右余白10pxずつ
    
    // 30文字にフィットするフォントサイズを計算
    let fontSize = Math.floor(effectiveWidth / targetChars);
    
    // 最小・最大フォントサイズを制限
    fontSize = Math.max(8, Math.min(24, fontSize));
    
    textarea.style.fontSize = fontSize + 'px';
    textarea.style.lineHeight = (fontSize + 4) + 'px';
    
    console.log(`📏 フォントサイズ調整: ${fontSize}px (幅: ${effectiveWidth}px / 30文字)`);
}

/**
 * 30文字ガイドを描画
 */
function drawCharacterGuide() {
    const guide = document.getElementById('char-guide');
    const textarea = document.getElementById('simple-answer-textarea');
    
    if (!guide || !textarea) return;
    
    // テキストエリアのスタイルに合わせてガイドを設定
    guide.style.fontSize = textarea.style.fontSize;
    guide.style.lineHeight = textarea.style.lineHeight;
    
    // 30文字のガイド文字列を作成（最初の行のみ）
    const guideText = '123456789012345678901234567890\n';
    guide.textContent = guideText;
    
    console.log('📏 30文字ガイド描画完了');
}

/**
 * 背景線を描画
 */
function drawBackgroundLines() {
    const background = document.getElementById('answer-background');
    const textarea = document.getElementById('simple-answer-textarea');
    
    if (!background || !textarea) return;
    
    const lineHeight = parseInt(textarea.style.lineHeight) || 24;
    const containerHeight = background.parentElement.clientHeight;
    const lineCount = Math.floor(containerHeight / lineHeight);
    
    let lines = '';
    for (let i = 0; i < lineCount; i++) {
        const top = i * lineHeight + lineHeight - 2; // 文字の下に線
        lines += `<div style="position: absolute; top: ${top}px; left: 0; right: 0; height: 1px; background: #ddd;"></div>`;
    }
    
    background.innerHTML = lines;
    console.log(`📝 背景線描画: ${lineCount}本`);
}

/**
 * テキストエリアのイベントを設定
 */
function setupTextareaEvents(textarea) {
    // 文字制限と行制限
    textarea.addEventListener('input', function(e) {
        enforceTextConstraints(this);
        updateCharCount(this);
    });
    
    textarea.addEventListener('keydown', function(e) {
        // Enterキーで改行時の制御
        if (e.key === 'Enter') {
            setTimeout(() => {
                enforceTextConstraints(this);
                updateCharCount(this);
            }, 10);
        }
    });
    
    textarea.addEventListener('paste', function(e) {
        setTimeout(() => {
            enforceTextConstraints(this);
            updateCharCount(this);
        }, 10);
    });
    
    console.log('👂 テキストエリアイベント設定完了');
}

/**
 * テキスト制限を実行
 */
function enforceTextConstraints(textarea) {
    const lines = textarea.value.split('\n');
    const maxLines = 23;
    const maxCharsPerLine = 30;
    
    let modified = false;
    let cursorPosition = textarea.selectionStart;
    
    // 行数制限
    if (lines.length > maxLines) {
        lines.splice(maxLines);
        modified = true;
        console.log(`⚠️ 行数制限適用: ${lines.length}行に制限`);
    }
    
    // 各行の文字数制限
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > maxCharsPerLine) {
            console.log(`⚠️ 第${i+1}行の文字数制限適用: ${lines[i].length}文字 → ${maxCharsPerLine}文字`);
            lines[i] = lines[i].substring(0, maxCharsPerLine);
            modified = true;
        }
    }
    
    if (modified) {
        textarea.value = lines.join('\n');
        
        // カーソル位置を調整
        const newPosition = Math.min(cursorPosition, textarea.value.length);
        textarea.setSelectionRange(newPosition, newPosition);
        
        // 視覚的フィードバック
        textarea.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
            textarea.style.backgroundColor = 'transparent';
        }, 300);
    }
}

/**
 * 文字数カウントを更新
 */
function updateCharCount(textarea) {
    const lines = textarea.value.split('\n');
    const charCount = textarea.value.replace(/\n/g, '').length;
    const lineCount = lines.length;
    
    // 最長行の文字数を計算
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    const countElement = document.getElementById('char-count');
    if (countElement) {
        let text = `${charCount}文字 / ${lineCount}行`;
        let className = 'char-count';
        
        // 制約違反の警告表示
        if (lineCount > 23) {
            text += ' (行数制限超過)';
            className += ' error';
        } else if (maxLineLength > 30) {
            text += ' (30文字制限超過)';
            className += ' error';
        } else if (lineCount > 20 || maxLineLength > 25) {
            text += ' (制限に近づいています)';
            className += ' warning';
        }
        
        countElement.textContent = text;
        countElement.className = className;
    }
}

/**
 * ウィンドウリサイズ処理
 */
function handleWindowResize() {
    console.log('🔄 ウィンドウリサイズ検出');
    setTimeout(() => {
        adjustFontSizeFor30Characters();
        drawBackgroundLines();
        drawCharacterGuide();
    }, 100);
}

/**
 * サンプルテキストを挿入
 */
window.insertSampleText = function() {
    const textarea = document.getElementById('simple-answer-textarea');
    if (textarea) {
        // 30文字制約を確認できるサンプルテキスト
        const sampleText = `これは三十文字ちょうどのテストテキストです
二行目もぴったり三十文字にしてあります
三行目：文字数制限の動作を確認できます
四行目：自動的にフォントサイズが調整される
五行目：ウィンドウサイズを変更してみてね
六行目：三十一文字になると自動で切り取られるはず
七行目：このシステムは確実に動作します
八行目：背景の下線も見えていますか？
九行目：行数も自動的にカウントされます
十行目：最大二十三行まで入力可能です`;
        
        textarea.value = sampleText;
        enforceTextConstraints(textarea);
        updateCharCount(textarea);
        
        console.log('📝 サンプルテキスト挿入完了');
    }
};

/**
 * 答案をクリア
 */
window.clearAnswer = function() {
    const textarea = document.getElementById('simple-answer-textarea');
    if (textarea) {
        textarea.value = '';
        updateCharCount(textarea);
    }
    console.log('🗑️ 答案クリア完了');
};

/**
 * 下書き保存
 */
window.saveDraft = function() {
    const textarea = document.getElementById('simple-answer-textarea');
    if (textarea) {
        localStorage.setItem('answerDraft', textarea.value);
        alert('下書きを保存しました');
    }
    console.log('💾 下書き保存完了');
};

/**
 * 下書き読込
 */
window.loadDraft = function() {
    const textarea = document.getElementById('simple-answer-textarea');
    const draft = localStorage.getItem('answerDraft');
    if (textarea && draft) {
        textarea.value = draft;
        enforceTextConstraints(textarea);
        updateCharCount(textarea);
        alert('下書きを読み込みました');
    } else {
        alert('保存された下書きがありません');
    }
    console.log('📂 下書き読込完了');
};

/**
 * AI添削
 */
window.aiCorrection = function() {
    const textarea = document.getElementById('simple-answer-textarea');
    const resultArea = document.getElementById('correction-result');
    
    if (!textarea.value.trim()) {
        alert('答案が入力されていません');
        return;
    }
    
    if (resultArea) {
        resultArea.innerHTML = `
            <div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">
                <strong>AI添削結果：</strong><br>
                答案内容: "${textarea.value.substring(0, 50)}..."<br>
                文字数: ${textarea.value.replace(/\n/g, '').length}文字<br>
                行数: ${textarea.value.split('\n').length}行<br>
                <br>
                <em>※ 実際のAI添削機能は開発中です</em>
            </div>
        `;
    }
    
    console.log('🤖 AI添削実行');
};

/**
 * シンプル答案ビューを閉じる
 */
window.closeSimpleAnswerView = function() {
    const overlay = document.getElementById('simple-answer-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // リサイズイベントリスナーを削除
    window.removeEventListener('resize', handleWindowResize);
    
    console.log('❌ シンプル答案ビュー終了');
};

console.log('✅ simpleAnswerView.js ロード完了');
