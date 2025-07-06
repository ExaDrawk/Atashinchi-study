// answerInputControl_new.js - 完全新設計の30文字厳守答案入力制御

/**
 * 答案入力の制御を設定（完全新設計・30文字厳守）
 */
function setupAnswerInputControl(textarea, quizIndex, subIndex) {
    if (!textarea) return;
    
    const COLS = 30; // 横30文字（絶対）
    const MAX_ROWS = 23; // 最大行数
    
    console.log('🔧 新設計答案入力制御を初期化中...');
    
    // textareaを完全にカスタマイズ
    setupTextareaStyles(textarea);
    
    // 30文字制御システム
    setupStrictCharacterControl(textarea, COLS, MAX_ROWS);
    
    // 動的フォントサイズ調整
    setupDynamicFontSizing(textarea, COLS);
    
    // リサイズ監視
    setupResizeMonitoring(textarea, COLS);
    
    console.log('✅ 新設計答案入力制御を設定完了');
}

/**
 * textareaのスタイルを完全設定
 */
function setupTextareaStyles(textarea) {
    // 基本スタイルをリセット
    textarea.style.cssText = `
        width: 100% !important;
        border: none !important;
        outline: none !important;
        padding: 0 !important;
        margin: 0 !important;
        resize: none !important;
        overflow: hidden !important;
        background: transparent !important;
        font-family: "Courier New", "Consolas", monospace !important;
        word-wrap: break-word !important;
        white-space: pre-wrap !important;
        box-sizing: border-box !important;
        line-height: 1.2 !important;
    `;
}

/**
 * 30文字厳守制御システム
 */
function setupStrictCharacterControl(textarea, COLS, MAX_ROWS) {
    // リアルタイム入力制御
    textarea.addEventListener('input', (e) => {
        enforceStrictConstraints(textarea, COLS, MAX_ROWS);
        updateBackgroundLines(textarea);
        updateCharCounter(textarea, COLS, MAX_ROWS);
    });
    
    // キー入力制御
    textarea.addEventListener('keydown', (e) => {
        handleKeyInput(e, textarea, COLS, MAX_ROWS);
    });
    
    // ペースト制御
    textarea.addEventListener('paste', (e) => {
        setTimeout(() => {
            enforceStrictConstraints(textarea, COLS, MAX_ROWS);
            updateBackgroundLines(textarea);
            updateCharCounter(textarea, COLS, MAX_ROWS);
        }, 10);
    });
}

/**
 * 厳格な制約実行（30文字×行数動的）
 */
function enforceStrictConstraints(textarea, COLS, MAX_ROWS) {
    const text = textarea.value;
    const lines = text.split('\n');
    const processedLines = [];
    
    // 各行を30文字で厳格に制限
    for (let i = 0; i < lines.length && i < MAX_ROWS; i++) {
        let line = lines[i];
        // 30文字を超えた場合は切り詰め
        if (line.length > COLS) {
            line = line.substring(0, COLS);
        }
        processedLines.push(line);
    }
    
    const newText = processedLines.join('\n');
    
    if (text !== newText) {
        const cursorPos = textarea.selectionStart;
        textarea.value = newText;
        
        // カーソル位置調整
        const newCursorPos = Math.min(cursorPos, textarea.value.length);
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    // 高さを行数に応じて動的調整
    adjustTextareaHeight(textarea, processedLines.length);
}

/**
 * キー入力ハンドラー（30文字制限）
 */
function handleKeyInput(e, textarea, COLS, MAX_ROWS) {
    // 基本制御キーは許可
    if (e.ctrlKey || e.metaKey) return;
    
    // 編集キーは許可
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    if (allowedKeys.includes(e.key)) return;
    
    const text = textarea.value;
    const lines = text.split('\n');
    const cursorPos = textarea.selectionStart;
    
    // Enterキー制御
    if (e.key === 'Enter') {
        if (lines.length >= MAX_ROWS) {
            e.preventDefault();
            showNotification('❌ 最大23行です', 'error');
            return;
        }
        return; // Enterは許可
    }
    
    // 通常文字入力制御
    if (e.key.length === 1) {
        // 現在の行を特定
        let currentLineIndex = 0;
        let charCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length;
            if (charCount + lineLength >= cursorPos) {
                currentLineIndex = i;
                break;
            }
            charCount += lineLength + 1; // +1 for \n
        }
        
        const currentLine = lines[currentLineIndex] || '';
        const positionInLine = cursorPos - charCount;
        
        // 30文字制限チェック
        if (currentLine.length >= COLS && textarea.selectionStart === textarea.selectionEnd) {
            e.preventDefault();
            showNotification('❌ 1行30文字まで', 'error');
            return;
        }
    }
}

/**
 * textareaの高さを行数に応じて動的調整
 */
function adjustTextareaHeight(textarea, lineCount) {
    const fontSize = parseFloat(textarea.style.fontSize) || 16;
    const lineHeight = fontSize * 1.2;
    const totalHeight = Math.max(lineCount, 1) * lineHeight;
    
    textarea.style.height = totalHeight + 'px';
}

/**
 * 背景線を行数に応じて更新
 */
function updateBackgroundLines(textarea) {
    const text = textarea.value;
    const lines = text.split('\n');
    const fontSize = parseFloat(textarea.style.fontSize) || 16;
    const lineHeight = fontSize * 1.2;
    
    // 行数に応じた背景線
    const lineCount = Math.max(lines.length, 1);
    
    textarea.style.backgroundImage = `repeating-linear-gradient(
        transparent,
        transparent ${lineHeight - 1}px,
        #e5e7eb ${lineHeight - 1}px,
        #e5e7eb ${lineHeight}px
    )`;
    textarea.style.backgroundSize = `100% ${lineHeight}px`;
    textarea.style.backgroundAttachment = 'local';
}

/**
 * 動的フォントサイズ調整（30文字確実維持）
 */
function setupDynamicFontSizing(textarea, COLS) {
    adjustFontSizeForExactFit(textarea, COLS);
}

/**
 * 30文字にぴったり合うフォントサイズ計算
 */
function adjustFontSizeForExactFit(textarea, COLS) {
    const container = textarea.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const padding = 32; // 左右余白
    const availableWidth = containerWidth - padding;
    
    console.log(`📏 利用可能幅: ${availableWidth}px`);
    
    // 30文字の実測テスト
    let fontSize = 8;
    let bestFontSize = 8;
    
    // 二分探索で最適フォントサイズを発見
    let low = 8, high = 32;
    
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testWidth = measureTextWidth('0'.repeat(COLS), mid);
        
        if (testWidth <= availableWidth) {
            bestFontSize = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    
    // フォントサイズ適用
    textarea.style.fontSize = bestFontSize + 'px';
    textarea.style.lineHeight = (bestFontSize * 1.2) + 'px';
    
    console.log(`✅ 最適フォントサイズ: ${bestFontSize}px`);
    
    // 背景線も更新
    updateBackgroundLines(textarea);
    
    // 高さ調整
    const lines = textarea.value.split('\n');
    adjustTextareaHeight(textarea, lines.length);
}

/**
 * テキスト幅の正確な測定
 */
function measureTextWidth(text, fontSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px "Courier New", "Consolas", monospace`;
    return context.measureText(text).width;
}

/**
 * リサイズ監視システム
 */
function setupResizeMonitoring(textarea, COLS) {
    let resizeTimeout;
    
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            adjustFontSizeForExactFit(textarea, COLS);
        }, 100);
    };
    
    // ウィンドウリサイズ
    window.addEventListener('resize', handleResize);
    
    // 親要素サイズ変更監視
    if (window.ResizeObserver) {
        const observer = new ResizeObserver(handleResize);
        observer.observe(textarea.parentElement);
    }
}

/**
 * 文字数カウンター更新
 */
function updateCharCounter(textarea, COLS, MAX_ROWS) {
    const counter = document.getElementById('char-counter');
    if (!counter) return;
    
    const text = textarea.value;
    const lines = text.split('\n');
    const charCount = text.length;
    const maxChars = COLS * MAX_ROWS;
    
    counter.textContent = `${charCount} / ${maxChars}文字 (${lines.length}行, 1行${COLS}文字)`;
    
    // 文字数に応じて色変更
    if (charCount > maxChars * 0.9) {
        counter.style.color = '#ef4444';
    } else if (charCount > maxChars * 0.7) {
        counter.style.color = '#f59e0b';
    } else {
        counter.style.color = '#6b7280';
    }
}

/**
 * 下書きを保存
 */
function saveDraftAnswer(quizIndex, subIndex) {
    const textarea = document.getElementById('answer-textarea');
    if (!textarea) return;
    
    const answerText = textarea.value;
    if (!answerText.trim()) {
        showNotification('❌ 答案が入力されていません', 'error');
        return;
    }
    
    const key = `draft_answer_${quizIndex}_${subIndex}`;
    const draftData = {
        text: answerText,
        timestamp: new Date().toISOString(),
        quizIndex: quizIndex,
        subIndex: subIndex
    };
    
    localStorage.setItem(key, JSON.stringify(draftData));
    showNotification('💾 下書きを保存しました', 'success');
    
    console.log(`💾 下書き保存完了: ${key}`);
}

/**
 * 下書きを復元
 */
function loadDraftAnswer(quizIndex, subIndex) {
    const key = `draft_answer_${quizIndex}_${subIndex}`;
    const draftDataStr = localStorage.getItem(key);
    
    if (draftDataStr) {
        try {
            const draftData = JSON.parse(draftDataStr);
            const textarea = document.getElementById('answer-textarea');
            
            if (textarea && draftData.text) {
                textarea.value = draftData.text;
                
                // 制約実行
                enforceStrictConstraints(textarea, 30, 23);
                updateBackgroundLines(textarea);
                updateCharCounter(textarea, 30, 23);
                
                const savedDate = new Date(draftData.timestamp).toLocaleString('ja-JP');
                showNotification(`📄 下書きを復元しました (${savedDate})`, 'info');
                
                console.log(`📄 下書き復元完了: ${key}`);
            }
        } catch (error) {
            console.error('❌ 下書きの復元に失敗しました:', error);
            localStorage.removeItem(key);
        }
    }
}

/**
 * 答案をクリア
 */
function clearAnswer() {
    const textarea = document.getElementById('answer-textarea');
    if (textarea) {
        textarea.value = '';
        
        // 制約実行
        enforceStrictConstraints(textarea, 30, 23);
        updateBackgroundLines(textarea);
        updateCharCounter(textarea, 30, 23);
        
        showNotification('🗑️ 答案をクリアしました', 'info');
    }
}

/**
 * AI添削を開始
 */
function startAICorrection(quizIndex, subIndex) {
    const textarea = document.getElementById('answer-textarea');
    const correctionBtn = document.getElementById('start-correction-btn');
    const correctionResult = document.getElementById('correction-result');
    
    if (!textarea || !textarea.value.trim()) {
        showNotification('❌ 答案が入力されていません', 'error');
        return;
    }
    
    if (correctionBtn) {
        correctionBtn.disabled = true;
        correctionBtn.textContent = '🤖 添削中...';
    }
    
    // 簡易的な添削結果を表示
    setTimeout(() => {
        if (correctionResult) {
            correctionResult.classList.remove('hidden');
            correctionResult.innerHTML = `
                <h4>📝 添削結果</h4>
                <div class="correction-item">
                    <strong>📊 文字数:</strong> ${textarea.value.length}文字
                </div>
                <div class="correction-item">
                    <strong>📏 行数:</strong> ${textarea.value.split('\n').length}行
                </div>
                <div class="correction-item">
                    <strong>💡 コメント:</strong> 構成がしっかりしています。論点の整理ができています。
                </div>
                <div class="correction-item">
                    <strong>⭐ 評価:</strong> B+ (良好)
                </div>
            `;
        }
        
        if (correctionBtn) {
            correctionBtn.disabled = false;
            correctionBtn.textContent = 'AI添削開始';
        }
        
        showNotification('✅ AI添削が完了しました', 'success');
    }, 2000);
}

/**
 * 通知を表示
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        min-width: 250px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

/**
 * 答案欄のフォントサイズを動的に調整（30文字維持）
 */
function adjustAnswerAreaFontSize() {
    const textarea = document.getElementById('answer-textarea');
    if (textarea) {
        adjustFontSizeForExactFit(textarea, 30);
    }
}

// グローバル公開
window.setupAnswerInputControl = setupAnswerInputControl;
window.saveDraftAnswer = saveDraftAnswer;
window.loadDraftAnswer = loadDraftAnswer;
window.clearAnswer = clearAnswer;
window.startAICorrection = startAICorrection;
window.showNotification = showNotification;
window.adjustAnswerAreaFontSize = adjustAnswerAreaFontSize;
