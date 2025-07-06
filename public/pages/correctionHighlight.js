/**
 * 🎨 司法試験答案添削ハイライトシステム
 * 自動改行対応・リアルタイム位置追従機能付き
 */

console.log('🎨 添削ハイライトシステム初期化');

/**
 * 🎯 文字位置ベースのハイライト添削システム（自動追従版）
 */
export function createCharacterBasedHighlightSystem(textarea, correctionData) {
    console.log('🎨 文字位置ベースハイライトシステム開始:', {
        correctionsCount: correctionData?.corrections?.length,
        textareaValue: textarea.value.length
    });
    
    const answerText = textarea.value;
    const corrections = correctionData?.corrections || [];
    
    if (corrections.length === 0) {
        console.warn('⚠️ 添削データが空です');
        return;
    }
    
    // 1. テキストエリアの上にハイライト用オーバーレイを作成
    const highlightOverlay = createHighlightOverlay(textarea);
    
    // 2. 各添削箇所をハイライト（リアルタイム追従機能付き）
    corrections.forEach((correction, index) => {
        createAdaptiveHighlightSegment(highlightOverlay, correction, index, answerText, textarea);
    });
    
    // 3. リアルタイム位置追従システムを開始
    setupRealtimePositionTracking(textarea, highlightOverlay, corrections);
    
    console.log('✅ 文字位置ベースハイライト完了:', corrections.length + '箇所');
}

/**
 * 🎯 ハイライト用オーバーレイを作成（改良版）
 */
function createHighlightOverlay(textarea) {
    const parent = textarea.parentElement;
    
    // 既存のハイライトオーバーレイを削除
    const existingOverlay = parent.querySelector('.character-highlight-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // 計算されたスタイルを取得（より正確な同期のため）
    const textareaStyle = window.getComputedStyle(textarea);
    
    // 新しいオーバーレイを作成
    const overlay = document.createElement('div');
    overlay.className = 'character-highlight-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: ${textarea.offsetTop}px;
        left: ${textarea.offsetLeft}px;
        width: ${textarea.offsetWidth}px;
        height: ${textarea.offsetHeight}px;
        font-family: ${textareaStyle.fontFamily};
        font-size: ${textareaStyle.fontSize};
        font-weight: ${textareaStyle.fontWeight};
        font-style: ${textareaStyle.fontStyle};
        line-height: ${textareaStyle.lineHeight};
        letter-spacing: ${textareaStyle.letterSpacing};
        word-spacing: ${textareaStyle.wordSpacing};
        text-align: ${textareaStyle.textAlign};
        padding: ${textareaStyle.padding};
        padding-top: ${textareaStyle.paddingTop};
        padding-right: ${textareaStyle.paddingRight};
        padding-bottom: ${textareaStyle.paddingBottom};
        padding-left: ${textareaStyle.paddingLeft};
        margin: ${textareaStyle.margin};
        border: ${textareaStyle.border};
        box-sizing: border-box;
        pointer-events: none;
        z-index: 10;
        overflow: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        background: transparent;
    `;
    
    parent.appendChild(overlay);
    
    // テキストエリアのスクロールと同期
    textarea.addEventListener('scroll', () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
    });
    
    return overlay;
}

/**
 * 🎯 適応型ハイライトセグメント作成（自動改行対応）
 */
function createAdaptiveHighlightSegment(overlay, correction, index, answerText, textarea) {
    const { start, end, type, comment, suggestion } = correction;
    
    // 文字位置の検証
    if (start < 0 || end > answerText.length || start >= end) {
        console.warn('⚠️ 無効な文字位置:', { start, end, textLength: answerText.length });
        return;
    }
    
    // 動的位置計算システム
    const createSegmentElements = () => {
        // 既存のセグメントを削除
        overlay.querySelectorAll(`[data-correction-index="${index}"]`).forEach(el => el.remove());
        
        // 現在のテキストで位置を再計算
        const currentText = textarea.value;
        const position = calculateDynamicCharacterPosition(overlay, currentText, start, end, textarea);
        
        if (position.isMultiSegment && position.segments) {
            createMultiLineHighlight(overlay, position, correction, index);
        } else {
            createSingleLineHighlight(overlay, position, correction, index);
        }
    };
    
    // 初期セグメント作成
    createSegmentElements();
    
    // セグメント再計算関数を保存（後でリアルタイム更新で使用）
    correction._updateSegments = createSegmentElements;
    
    return createSegmentElements;
}

/**
 * 🎯 動的文字位置計算（自動改行対応）
 */
function calculateDynamicCharacterPosition(overlay, text, start, end, textarea) {
    // Canvas要素を使用して正確な文字幅を測定
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // テキストエリアのフォント設定を適用
    const computedStyle = window.getComputedStyle(textarea);
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    
    // パディング値
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.4;
    
    // テキストエリアの実際の表示幅（スクロールバーを除く）
    const textareaWidth = textarea.clientWidth - paddingLeft - (parseFloat(computedStyle.paddingRight) || 0);
    
    // 自動改行を考慮したテキスト分析
    const lines = analyzeTextWithWrapping(text, context, textareaWidth);
    
    // start位置とend位置を行・列座標に変換
    const startCoord = getCharacterCoordinates(text, start, lines);
    const endCoord = getCharacterCoordinates(text, end, lines);
    
    // ピクセル位置に変換
    const startPixel = {
        top: (startCoord.line * lineHeight) + paddingTop,
        left: measureTextWidth(lines[startCoord.line].text.substring(0, startCoord.col), context) + paddingLeft
    };
    
    const endPixel = {
        top: (endCoord.line * lineHeight) + paddingTop,
        left: measureTextWidth(lines[endCoord.line].text.substring(0, endCoord.col), context) + paddingLeft
    };
    
    // セグメント生成
    if (startCoord.line === endCoord.line) {
        // 同一行内
        const width = endPixel.left - startPixel.left;
        return {
            top: startPixel.top,
            left: startPixel.left,
            width: Math.max(width, 10),
            height: lineHeight,
            isMultiSegment: false,
            text: text.substring(start, end)
        };
    } else {
        // 複数行にまたがる
        const segments = [];
        
        for (let line = startCoord.line; line <= endCoord.line; line++) {
            let segmentStart, segmentWidth;
            
            if (line === startCoord.line) {
                // 最初の行
                segmentStart = startPixel.left;
                segmentWidth = textareaWidth - segmentStart + paddingLeft;
            } else if (line === endCoord.line) {
                // 最後の行
                segmentStart = paddingLeft;
                segmentWidth = endPixel.left - paddingLeft;
            } else {
                // 中間行
                segmentStart = paddingLeft;
                segmentWidth = measureTextWidth(lines[line].text, context);
            }
            
            segments.push({
                top: (line * lineHeight) + paddingTop,
                left: segmentStart,
                width: Math.max(segmentWidth, 10),
                height: lineHeight,
                lineNumber: line,
                text: lines[line].text
            });
        }
        
        return {
            top: segments[0].top,
            left: segments[0].left,
            width: segments[0].width,
            height: segments[0].height,
            isMultiSegment: true,
            segments: segments
        };
    }
}

/**
 * 🎯 自動改行を考慮したテキスト分析
 */
function analyzeTextWithWrapping(text, context, maxWidth) {
    const lines = [];
    const textLines = text.split('\n');
    
    textLines.forEach(line => {
        if (line.length === 0) {
            lines.push({ text: '', width: 0 });
            return;
        }
        
        // 行が表示幅を超える場合、自動改行を模倣
        let currentLine = '';
        let currentWidth = 0;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const charWidth = context.measureText(char).width;
            
            if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
                // 改行が必要
                lines.push({
                    text: currentLine,
                    width: currentWidth
                });
                currentLine = char;
                currentWidth = charWidth;
            } else {
                currentLine += char;
                currentWidth += charWidth;
            }
        }
        
        // 残りの文字を追加
        if (currentLine.length > 0) {
            lines.push({
                text: currentLine,
                width: currentWidth
            });
        }
    });
    
    return lines;
}

/**
 * 🎯 文字位置を行・列座標に変換
 */
function getCharacterCoordinates(text, position, lines) {
    let charCount = 0;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const lineLength = line.text.length + 1; // +1 for newline character
        
        if (charCount + lineLength > position) {
            return {
                line: lineIndex,
                col: position - charCount
            };
        }
        
        charCount += lineLength;
    }
    
    // 最後の行の末尾
    return {
        line: lines.length - 1,
        col: lines[lines.length - 1].text.length
    };
}

/**
 * 🎯 テキスト幅を測定
 */
function measureTextWidth(text, context) {
    return context.measureText(text).width;
}

/**
 * 🎯 単一行ハイライト作成
 */
function createSingleLineHighlight(overlay, position, correction, index) {
    const highlight = document.createElement('span');
    highlight.className = `highlight-segment highlight-${correction.type}`;
    highlight.dataset.correctionIndex = index;
    highlight.dataset.start = correction.start;
    highlight.dataset.end = correction.end;
    
    highlight.style.cssText = `
        position: absolute;
        background-color: ${getCorrectionColor(correction.type)};
        border: 2px solid ${getCorrectionBorderColor(correction.type)};
        border-radius: 3px;
        cursor: pointer;
        pointer-events: auto;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        z-index: 11;
        top: ${position.top}px;
        left: ${position.left}px;
        width: ${position.width}px;
        height: ${position.height}px;
    `;
    
    // イベントハンドラー
    addHighlightEventHandlers(highlight, correction, index);
    
    overlay.appendChild(highlight);
}

/**
 * 🎯 複数行ハイライト作成
 */
function createMultiLineHighlight(overlay, position, correction, index) {
    // メインのクリック検出エリア
    const mainHighlight = document.createElement('span');
    mainHighlight.className = `highlight-segment highlight-main highlight-${correction.type}`;
    mainHighlight.dataset.correctionIndex = index;
    mainHighlight.dataset.start = correction.start;
    mainHighlight.dataset.end = correction.end;
    
    const firstSegment = position.segments[0];
    const lastSegment = position.segments[position.segments.length - 1];
    const totalHeight = (lastSegment.top + lastSegment.height) - firstSegment.top;
    
    mainHighlight.style.cssText = `
        position: absolute;
        opacity: 0;
        cursor: pointer;
        pointer-events: auto;
        z-index: 12;
        top: ${firstSegment.top}px;
        left: 0px;
        width: ${overlay.offsetWidth}px;
        height: ${totalHeight}px;
    `;
    
    // イベントハンドラー
    addHighlightEventHandlers(mainHighlight, correction, index);
    
    overlay.appendChild(mainHighlight);
    
    // 各行のセグメント
    position.segments.forEach((segment, i) => {
        const segmentHighlight = document.createElement('span');
        segmentHighlight.className = `highlight-segment-part highlight-${correction.type}`;
        segmentHighlight.dataset.correctionIndex = index;
        
        segmentHighlight.style.cssText = `
            position: absolute;
            background-color: ${getCorrectionColor(correction.type)};
            border: 2px solid ${getCorrectionBorderColor(correction.type)};
            border-radius: 3px;
            opacity: 0.8;
            pointer-events: none;
            transition: opacity 0.2s ease;
            z-index: 11;
            top: ${segment.top}px;
            left: ${segment.left}px;
            width: ${segment.width}px;
            height: ${segment.height}px;
        `;
        
        overlay.appendChild(segmentHighlight);
        
        // 親への参照を保存
        if (!mainHighlight._segments) mainHighlight._segments = [];
        mainHighlight._segments.push(segmentHighlight);
    });
}

/**
 * 🎯 ハイライトイベントハンドラー追加
 */
function addHighlightEventHandlers(highlight, correction, index) {
    // クリックイベント
    highlight.addEventListener('click', () => {
        showCorrectionComment(correction, index, highlight);
    });
    
    // ホバーエフェクト
    highlight.addEventListener('mouseenter', () => {
        if (highlight._segments) {
            highlight._segments.forEach(seg => {
                seg.style.opacity = '1';
                seg.style.transform = 'scale(1.02)';
            });
        } else {
            highlight.style.opacity = '1';
            highlight.style.transform = 'scale(1.02)';
        }
    });
    
    highlight.addEventListener('mouseleave', () => {
        if (highlight._segments) {
            highlight._segments.forEach(seg => {
                seg.style.opacity = '0.8';
                seg.style.transform = 'scale(1)';
            });
        } else {
            highlight.style.opacity = '0.8';
            highlight.style.transform = 'scale(1)';
        }
    });
}

/**
 * 🎯 リアルタイム位置追従システム
 */
function setupRealtimePositionTracking(textarea, overlay, corrections) {
    let updateTimeout = null;
    
    const updateHighlights = () => {
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        
        updateTimeout = setTimeout(() => {
            corrections.forEach(correction => {
                if (correction._updateSegments) {
                    correction._updateSegments();
                }
            });
        }, 100); // 100ms遅延で更新
    };
    
    // テキスト変更イベント
    textarea.addEventListener('input', updateHighlights);
    textarea.addEventListener('keydown', updateHighlights);
    textarea.addEventListener('keyup', updateHighlights);
    
    // リサイズイベント
    window.addEventListener('resize', updateHighlights);
    
    // ResizeObserver でテキストエリアのサイズ変更を監視
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(updateHighlights);
        resizeObserver.observe(textarea);
        overlay._resizeObserver = resizeObserver;
    }
    
    // スクロールイベント
    textarea.addEventListener('scroll', () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
    });
    
    console.log('🔄 リアルタイム位置追従システム開始');
}

/**
 * 🎯 添削コメント表示
 */
function showCorrectionComment(correction, index, highlightElement) {
    console.log('💬 添削コメント表示:', { index, type: correction.type });
    
    // 既存のコメントポップアップを削除
    document.querySelectorAll('.correction-comment-popup').forEach(popup => popup.remove());
    
    // コメントポップアップを作成
    const popup = document.createElement('div');
    popup.className = 'correction-comment-popup';
    popup.style.cssText = `
        position: fixed;
        background: white;
        border: 2px solid ${getCorrectionBorderColor(correction.type)};
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        min-width: 280px;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.5;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-weight: bold; color: ${getCorrectionBorderColor(correction.type)};">
                ${getCorrectionTypeLabel(correction.type)} - ${correction.category || '一般'}
            </div>
            <button class="close-popup" style="
                background: #f3f4f6; 
                border: none; 
                border-radius: 50%; 
                width: 24px; 
                height: 24px; 
                cursor: pointer;
                font-size: 12px;
            ">×</button>
        </div>
        <div style="margin-bottom: 10px; padding: 8px; background: #f9fafb; border-radius: 4px;">
            <strong>指摘:</strong> ${correction.comment}
        </div>
        ${correction.suggestion ? `
            <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; border-left: 3px solid #22c55e;">
                <strong>改善提案:</strong> ${correction.suggestion}
            </div>
        ` : ''}
        <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
            重要度: ${correction.severity || 'medium'} | 文字位置: ${correction.start}-${correction.end}
        </div>
    `;
    
    // ポップアップの位置を計算
    const rect = highlightElement.getBoundingClientRect();
    popup.style.top = (rect.bottom + 5) + 'px';
    popup.style.left = Math.max(10, rect.left - 100) + 'px';
    
    // 閉じるボタンのイベント
    popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.remove();
    });
    
    // 外部クリックで閉じる
    setTimeout(() => {
        const closeOnOutsideClick = (event) => {
            if (!popup.contains(event.target) && !highlightElement.contains(event.target)) {
                popup.remove();
                document.removeEventListener('click', closeOnOutsideClick);
            }
        };
        document.addEventListener('click', closeOnOutsideClick);
    }, 100);
    
    document.body.appendChild(popup);
}

/**
 * 🎯 添削タイプ別の色を取得
 */
function getCorrectionColor(type) {
    const colors = {
        essential: 'rgba(239, 68, 68, 0.3)',   // 赤 - 必須要素
        improve: 'rgba(245, 158, 11, 0.3)',    // オレンジ - 改善点
        good: 'rgba(34, 197, 94, 0.3)',        // 緑 - 良い点
        delete: 'rgba(107, 114, 128, 0.3)',    // グレー - 削除推奨
        structure: 'rgba(147, 51, 234, 0.3)',  // 紫 - 論理構造
        citation: 'rgba(92, 51, 23, 0.3)',     // 茶 - 引用関連
        bonus: 'rgba(59, 130, 246, 0.3)'       // 青 - 加点要素
    };
    return colors[type] || colors.improve;
}

/**
 * 🎯 添削タイプ別の境界線色を取得
 */
function getCorrectionBorderColor(type) {
    const colors = {
        essential: '#ef4444',   // 赤
        improve: '#f59e0b',     // オレンジ
        good: '#22c55e',        // 緑
        delete: '#6b7280',      // グレー
        structure: '#9333ea',   // 紫
        citation: '#92400e',    // 茶
        bonus: '#3b82f6'        // 青
    };
    return colors[type] || colors.improve;
}

/**
 * 🎯 添削タイプのラベルを取得
 */
function getCorrectionTypeLabel(type) {
    const labels = {
        essential: '必須要素',
        improve: '改善点',
        good: '良い点',
        delete: '削除推奨',
        structure: '論理構造',
        citation: '引用関連',
        bonus: '加点要素'
    };
    return labels[type] || '一般';
}

/**
 * 🎯 ハイライト要素をクリア
 */
export function clearCorrectionHighlights() {
    document.querySelectorAll('.character-highlight-overlay').forEach(overlay => {
        if (overlay._resizeObserver) {
            overlay._resizeObserver.disconnect();
        }
        overlay.remove();
    });
    
    document.querySelectorAll('.correction-comment-popup').forEach(popup => popup.remove());
    
    console.log('🧹 ハイライト要素をクリアしました');
}
