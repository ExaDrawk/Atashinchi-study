// answerInputControl.js - 答案入力の30文字×23行制御（テキスト機能保持）

/**
 * 答案入力の制御を設定（基本的なテキスト機能を保持）
 */
function setupAnswerInputControl(textarea, quizIndex, subIndex) {
    if (!textarea) return;
    
    const COLS = 30; // 横30文字
    const ROWS = 23; // 縦23行
    const MAX_CHARS = COLS * ROWS; // 690文字
    
    console.log('🔧 答案入力制御を初期化中...');
    
    // 答案欄のフォントサイズを動的に調整（30文字維持）
    adjustAnswerAreaFontSize();
    
    // ウィンドウリサイズ時のフォントサイズ調整（デバウンス処理付き）
    let resizeTimeout;
    const resizeHandler = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('🔄 ウィンドウリサイズ検出 - フォントサイズを再調整');
            adjustAnswerAreaFontSize();
        }, 150); // 150msのデバウンス
    };
    
    window.addEventListener('resize', resizeHandler);
    
    // オブザーバーで親要素のサイズ変更も監視
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target.contains(textarea)) {
                    console.log('📐 親要素のサイズ変更検出 - フォントサイズを再調整');
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        adjustAnswerAreaFontSize();
                    }, 100);
                    break;
                }
            }
        });
        
        // 答案エリアの親要素を監視
        const answerColumn = textarea.closest('.column-answer');
        if (answerColumn) {
            resizeObserver.observe(answerColumn);
        }
    }
    
    // textareaの基本設定（動的調整されるため、基本値のみ設定）
    // textareaの基本設定（完全に動的調整、枠線なし）
    textarea.style.width = '100%';
    textarea.style.fontFamily = '"Courier New", "MS Gothic", monospace';
    textarea.style.wordWrap = 'break-word';
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.padding = '0';
    textarea.style.margin = '0';
    textarea.style.boxSizing = 'border-box';
    textarea.style.backgroundColor = 'transparent';
    
    // 文字数カウンターを更新
    function updateCharCounter() {
        const counter = document.getElementById('char-counter');
        if (!counter) return;
        
        const text = textarea.value;
        const lines = text.split('\n');
        const charCount = text.length;
        
        counter.textContent = `${charCount} / ${MAX_CHARS}文字 (${lines.length}/${ROWS}行)`;
        
        // 文字数に応じて色を変更
        if (charCount > MAX_CHARS * 0.9) {
            counter.style.color = '#ef4444';
        } else if (charCount > MAX_CHARS * 0.7) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#6b7280';
        }
    }
    
    // 30文字で自動改行する関数
    function autoWrapText(text) {
        const lines = text.split('\n');
        const wrappedLines = [];
        
        lines.forEach(line => {
            if (line.length <= COLS) {
                wrappedLines.push(line);
            } else {
                // 30文字ずつに分割
                for (let i = 0; i < line.length; i += COLS) {
                    wrappedLines.push(line.substring(i, i + COLS));
                }
            }
        });
        
        return wrappedLines.slice(0, ROWS).join('\n');
    }
    
    // 行と文字数を制御する関数（30文字厳格制御）
    function enforceConstraints() {
        const text = textarea.value;
        const lines = text.split('\n');
        const processedLines = [];
        
        // 各行を30文字以下に制限
        for (let i = 0; i < lines.length && i < ROWS; i++) {
            let line = lines[i];
            if (line.length > COLS) {
                line = line.substring(0, COLS);
            }
            processedLines.push(line);
        }
        
        // 23行を超える場合は切り詰め
        if (processedLines.length > ROWS) {
            processedLines.splice(ROWS);
        }
        
        const newText = processedLines.join('\n');
        
        if (text !== newText) {
            const cursorPos = textarea.selectionStart;
            textarea.value = newText;
            
            // カーソル位置を調整
            const newCursorPos = Math.min(cursorPos, textarea.value.length);
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
        
        updateCharCounter();
    }
    
    // 入力イベントリスナー
    textarea.addEventListener('input', () => {
        enforceConstraints();
    });
    
    // キーダウンイベント（基本的なテキスト機能を保持）
    textarea.addEventListener('keydown', (e) => {
        // Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+Y などの基本機能は妨げない
        if (e.ctrlKey || e.metaKey) {
            return; // 制御キーの組み合わせは許可
        }
        
        // Backspace, Delete, 方向キーなどの基本操作は許可
        const allowedKeys = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
            'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'
        ];
        
        if (allowedKeys.includes(e.key)) {
            return; // 基本操作は許可
        }
        
        // Enterキーの制御
        if (e.key === 'Enter') {
            const text = textarea.value;
            const lines = text.split('\n');
            
            if (lines.length >= ROWS) {
                e.preventDefault();
                showNotification('❌ 23行を超えることはできません', 'error');
                return;
            }
        }
        
        // 通常の文字入力の制御
        if (e.key.length === 1) {
            const text = textarea.value;
            const cursorPos = textarea.selectionStart;
            const lines = text.split('\n');
            
            // 現在の行を特定
            let currentLineIndex = 0;
            let charCount = 0;
            
            for (let i = 0; i < lines.length; i++) {
                if (charCount + lines[i].length >= cursorPos) {
                    currentLineIndex = i;
                    break;
                }
                charCount += lines[i].length + 1; // +1 for newline
            }
            
            const currentLine = lines[currentLineIndex] || '';
            const positionInLine = cursorPos - charCount;
            
            // 現在行の文字数チェック
            if (currentLine.length >= COLS && positionInLine >= COLS) {
                e.preventDefault();
                showNotification('❌ 30文字を超えることはできません', 'error');
                return;
            }
            
            // 総文字数チェック
            if (text.length >= MAX_CHARS) {
                e.preventDefault();
                showNotification('❌ 690文字を超えることはできません', 'error');
                return;
            }
        }
    });
    
    // ペーストイベント（基本機能を保持しつつ制限）
    textarea.addEventListener('paste', (e) => {
        setTimeout(() => {
            enforceConstraints();
        }, 10);
    });
    
    // 初期化
    updateCharCounter();
    
    console.log('✅ 答案入力制御を設定しました（基本テキスト機能保持）');
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
                
                // 文字数カウンターを更新
                const event = new Event('input');
                textarea.dispatchEvent(event);
                
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
        const event = new Event('input');
        textarea.dispatchEvent(event);
        
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
    
    // 簡易的な添削結果を表示（実際のAI添削システムと連携する部分）
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
    if (!textarea) return;
    
    console.log('🔧 答案欄のフォントサイズを調整中...');
    
    // 親要素の実際の幅を取得
    const parentElement = textarea.parentElement;
    const parentWidth = parentElement.clientWidth;
    const paddingLeft = 16;  // 左パディング
    const paddingRight = 16; // 右パディング
    const availableWidth = parentWidth - paddingLeft - paddingRight;
    
    console.log(`📏 利用可能幅: ${availableWidth}px, 親要素幅: ${parentWidth}px`);
    
    // 30文字を確実に収めるためのフォントサイズを計算
    // Courier Newフォントでは、1文字の幅はフォントサイズの約0.6倍
    let targetFontSize = Math.floor(availableWidth / (30 * 0.6));
    
    // 最小・最大フォントサイズの制限
    const minFontSize = 8; // 最小8px
    const maxFontSize = 32; // 最大32px
    targetFontSize = Math.max(minFontSize, Math.min(targetFontSize, maxFontSize));
    
    // 行の高さを計算（フォントサイズ + 余白）
    const lineHeight = targetFontSize + 4;
    const totalHeight = lineHeight * 23; // 23行
    
    // textareaに適用（枠線なし、パディングなし）
    textarea.style.fontSize = targetFontSize + 'px';
    textarea.style.lineHeight = lineHeight + 'px';
    textarea.style.height = totalHeight + 'px';
    textarea.style.width = '100%';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.padding = '0';
    textarea.style.margin = '0';
    textarea.style.boxSizing = 'border-box';
    textarea.style.fontFamily = '"Courier New", "MS Gothic", monospace';
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    textarea.style.wordWrap = 'break-word';
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.backgroundColor = 'transparent';
    
    // 背景の横線も調整
    textarea.style.backgroundImage = `repeating-linear-gradient(
        transparent,
        transparent ${lineHeight - 1}px,
        #e5e7eb ${lineHeight - 1}px,
        #e5e7eb ${lineHeight}px
    )`;
    textarea.style.backgroundSize = '100% ' + lineHeight + 'px';
    textarea.style.backgroundAttachment = 'local';
    
    // 実際の文字数をテストして微調整
    testAndAdjustFontSize(textarea, targetFontSize, availableWidth);
    
    console.log(`✅ フォントサイズを${targetFontSize}pxに調整しました（利用可能幅: ${availableWidth}px）`);
}

/**
 * 実際の文字数をテストしてフォントサイズを微調整
 */
function testAndAdjustFontSize(textarea, initialFontSize, availableWidth) {
    // テスト用の文字列（30文字）
    const testString = '1234567890123456789012345678901';
    
    // 一時的なspan要素を作成してテスト
    const testSpan = document.createElement('span');
    testSpan.style.fontFamily = '"Courier New", "MS Gothic", monospace';
    testSpan.style.fontSize = initialFontSize + 'px';
    testSpan.style.visibility = 'hidden';
    testSpan.style.position = 'absolute';
    testSpan.style.whiteSpace = 'nowrap';
    testSpan.style.left = '-9999px';
    testSpan.textContent = testString;
    
    document.body.appendChild(testSpan);
    
    // 実際の文字幅を測定
    const actualWidth = testSpan.offsetWidth;
    
    console.log(`📊 テスト結果: 30文字の実際の幅 = ${actualWidth}px, 許容幅 = ${availableWidth}px`);
    
    // 文字幅が許容幅を超える場合、フォントサイズを調整
    if (actualWidth > availableWidth) {
        const adjustmentRatio = availableWidth / actualWidth;
        const adjustedFontSize = Math.floor(initialFontSize * adjustmentRatio);
        const minFontSize = 8;
        const finalFontSize = Math.max(minFontSize, adjustedFontSize);
        
        console.log(`🔧 フォントサイズを${initialFontSize}px → ${finalFontSize}pxに微調整`);
        
        // 再計算して適用
        const lineHeight = finalFontSize + 4;
        const totalHeight = lineHeight * 23;
        
        textarea.style.fontSize = finalFontSize + 'px';
        textarea.style.lineHeight = lineHeight + 'px';
        textarea.style.height = totalHeight + 'px';
        textarea.style.backgroundImage = `repeating-linear-gradient(
            transparent,
            transparent ${lineHeight - 1}px,
            #e5e7eb ${lineHeight - 1}px,
            #e5e7eb ${lineHeight}px
        )`;
        textarea.style.backgroundSize = '100% ' + lineHeight + 'px';
    }
    
    // テスト要素を削除
    document.body.removeChild(testSpan);
}

// グローバル公開
window.setupAnswerInputControl = setupAnswerInputControl;
window.saveDraftAnswer = saveDraftAnswer;
window.loadDraftAnswer = loadDraftAnswer;
window.clearAnswer = clearAnswer;
window.startAICorrection = startAICorrection;
window.showNotification = showNotification;
window.adjustAnswerAreaFontSize = adjustAnswerAreaFontSize;
