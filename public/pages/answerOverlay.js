// answerOverlay.js - 完全に一から作り直したシンプルな答案オーバーレイ

import { processArticleReferences, processAllReferences, setupArticleRefButtons } from '../articleProcessor.js';

class AnswerOverlay {
    constructor() {
        this.isVisible = false;
        this.overlay = null;
        this.markersVisible = false;
        this.currentQuizIndex = 0;
        this.currentSubIndex = 0;
        this.createOverlay();
        this.setupEvents();
    }

    createOverlay() {
        // 既存削除
        const existing = document.getElementById('answer-overlay');
        if (existing) existing.remove();

        // カラム幅の変数
        const ANSWER_COL_FR = 2.32; // 答案カラム
        const CORRECTION_COL_FR = 1.0; // 添削箇所
        const RESULT_COL_FR = 1.0; // 総合評価

        // 背景＋3カラム新規HTML（右端寄せ）
        const html = `
            <div id="answer-overlay" style="
                position: fixed; top: 0; left: 0; right: 0; width: 100vw; height: 100vh;
                z-index: 99999; display: none;
            ">
                <div class="overlay-bg" style="
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.8); z-index: 1;
                "></div>
                <div class="overlay-content" style="
                    position: fixed; top: 0; right: 0; height: 100vh; width: 95vw;
                    display: flex; justify-content: flex-end; align-items: center;
                    z-index: 2;
                ">
                    <div style="
                        background: white; width: 95%; max-width: 1400px; height: 90%;
                        border-radius: 8px; padding: 20px; 
                        display: grid; grid-template-columns: ${ANSWER_COL_FR}fr ${CORRECTION_COL_FR}fr ${RESULT_COL_FR}fr; grid-template-rows: auto 1fr;
                        gap: 20px; position: relative;
                    ">
                        <button id="close-btn" style="
                            position: absolute; top: 10px; right: 10px; background: red;
                            color: white; border: none; border-radius: 50%; width: 35px; height: 35px;
                            cursor: pointer; font-size: 18px; z-index: 10;
                        ">×</button>
                        
                        <!-- 上部: 問題 -->
                        <div style="
                            grid-column: 1 / span 3; grid-row: 1; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 2px; border-radius: 12px; display: flex; flex-direction: column;
                            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
                        ">
                            <div style="
                                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                                border-radius: 10px; padding: 20px; height: 100%;
                                position: relative; overflow: hidden;
                            ">
                                <!-- 装飾的な背景要素 -->
                                <div style="
                                    position: absolute; top: -10px; right: -10px;
                                    width: 80px; height: 80px;
                                    background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
                                    border-radius: 50%;
                                "></div>
                                <div style="
                                    position: absolute; bottom: -15px; left: -15px;
                                    width: 60px; height: 60px;
                                    background: radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%);
                                    border-radius: 50%;
                                "></div>
                                

                                
                                <!-- 問題文表示エリア -->
                                <div id="question-text" style="
                                    max-height:150px; overflow-y: auto; padding: 15px 18px;
                                    background: rgba(255, 255, 255, 0.7);
                                    border: 1px solid rgba(102, 126, 234, 0.1);
                                    border-radius: 10px; font-size: 15px; line-height: 1.7;
                                    color: #2c3e50; position: relative; z-index: 2;
                                    backdrop-filter: blur(10px);
                                    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
                                    scrollbar-width: thin; 
                                    scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
                                ">
                                    問題文がここに表示されます
                                </div>
                            </div>
                        </div>
                        
                        <!-- 左: 答案 -->
                        <div style="grid-column: 1; grid-row: 2; position: relative; width: calc(100% ); max-width: none;">
                            <h3 style="
                                margin-top: 0; color: #2c3e50; font-weight: 600; 
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                                background-clip: text; font-size: 18px;
                            ">📝 答案</h3>
                            <div id="answer-area" style="
                                position: relative; min-height: calc(100% - 80px); 
                                background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
                                border-radius: 12px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
                                border: 1px solid #dee2e6;
                                overflow: hidden;
                            ">
                                <div id="lines" style="
                                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                                    height: 100%; width: 100%;
                                    pointer-events: none; z-index: 1; overflow: hidden;
                                    box-sizing: border-box;
                                "></div>
                                <div id="markers" style="
                                    position: absolute; top: 0; left: 0; right: 0; height: 100%;
                                    pointer-events: none; z-index: 3; overflow: hidden;
                                "></div>
                                <div id="answer-editor" contenteditable="true" style="
                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                    background: transparent; border: none; padding: 15px;
                                    font-family: 'SF Pro Display', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
                                    font-size: 22px; line-height: 30px; font-weight: 400;
                                    color: #2c3e50; letter-spacing: 0.5px;
                                    z-index: 2; resize: none; outline: none; box-sizing: border-box;
                                    transition: all 0.2s ease; overflow-y: auto;
                                    white-space: pre-wrap; word-break: break-all;
                                " placeholder="✨ ここに答案を美しく入力してください..."></div>
                            </div>
                            <div style="
                                margin-top: 15px; display: flex; justify-content: space-between; 
                                align-items: center; padding: 12px; background: #f8f9fa; 
                                border-radius: 8px; border: 1px solid #e9ecef;
                            ">
                                <div style="
                                    color: #495057; font-weight: 500; font-size: 14px;
                                    display: flex; gap: 20px;
                                ">
                                    <span style="display: inline-flex; align-items: center; min-width: 110px;">
                                      📊 文字数: <strong id="char-count" style="color: #007bff; min-width: 2.5em; display: inline-block; text-align: right;">0</strong>
                                    </span>
                                    <span>📄 行数: <strong id="line-count" style="color: #28a745;">1</strong></span>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <button id="clear-btn" style="
                                        padding: 10px 18px; background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                                        color: white; border: none; border-radius: 25px; cursor: pointer;
                                        font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(238, 90, 82, 0.3);
                                        transition: all 0.3s ease; transform: translateY(0);
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(238, 90, 82, 0.4)';"
                                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(238, 90, 82, 0.3)';">
                                    🗑️ クリア</button>
                                    <button id="submit-btn" style="
                                        padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2);
                                        color: white; border: none; border-radius: 25px; cursor: pointer;
                                        font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
                                        transition: all 0.3s ease; transform: translateY(0);
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(118, 75, 162, 0.4)';"
                                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(118, 75, 162, 0.3)';">
                                    🚀 AI添削開始</button>
                                    <button id="show-model-answer-btn" style="
                                        padding: 10px 18px; background: linear-gradient(135deg, #00b894, #00cec9);
                                        color: white; border: none; border-radius: 25px; cursor: pointer;
                                        font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 206, 201, 0.3);
                                        transition: all 0.3s ease; transform: translateY(0);
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 206, 201, 0.4)';"
                                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 206, 201, 0.3)';">
                                    👑 模範解答を見る</button>
                                    <button id="save-result-btn" style="
                                        padding: 10px 18px; background: linear-gradient(135deg, #28a745, #20c997);
                                        color: white; border: none; border-radius: 25px; cursor: pointer;
                                        font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                                        transition: all 0.3s ease; transform: translateY(0);
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(40, 167, 69, 0.4)';"
                                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(40, 167, 69, 0.3)';">
                                    📊 結果を保存する</button>
                                    <button id="show-past-answers-btn" style="
                                        padding: 10px 18px; background: linear-gradient(135deg, #17a2b8, #6610f2);
                                        color: white; border: none; border-radius: 25px; cursor: pointer;
                                        font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
                                        transition: all 0.3s ease; transform: translateY(0);
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(23, 162, 184, 0.4)';"
                                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(23, 162, 184, 0.3)';">
                                    📜 過去の答案を見る</button>
                                </div>
                            </div>
                        </div>

                        <!-- 中央: 添削箇所 -->
                        <div id="correction-area" style="grid-column: 2; grid-row: 2; background: #fffbe6; border-radius: 8px; box-shadow: 0 2px 8px rgba(255, 224, 102, 0.13); padding: 16px; min-width: 220px; max-width: 340px; overflow-y: auto; border: 1.5px solid #ffe066;">
                            <h4 style="margin: 0 0 10px 0; color: #495057;">🎯 添削箇所</h4>
                            <div id="correction-content">答案内の<mark style='background: #ffe066; padding: 2px 4px; border-radius: 3px;'>マーカー部分</mark>をクリックすると詳細なコメントが表示されます。</div>
                        </div>

                        <!-- 右: AI添削結果・総合コメント -->
                        <div id="result-area" style="
                            grid-column: 3; grid-row: 2; background: #f0f8ff; 
                            padding: 15px; border-radius: 5px; display: none; min-width: 260px; max-width: 400px;
                        ">
                            <h3 style="margin-top: 0;">AI添削結果</h3>
                            <div id="result-content">結果がここに表示されます</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        this.overlay = document.getElementById('answer-overlay');
        this.createLines();
    }

    setupEvents() {
        const closeBtn = document.getElementById('close-btn');
        const editor = document.getElementById('answer-editor');
        const charCount = document.getElementById('char-count');
        const lineCount = document.getElementById('line-count');
        const lines = document.getElementById('lines');
        const submitBtn = document.getElementById('submit-btn');
        const showModelAnswerBtn = document.getElementById('show-model-answer-btn');

        // 素の文章を常に保持
        this.rawText = '';

        // 貼り付け時に書式を除去しプレーンテキストのみ挿入
        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            // カーソル位置にテキストを挿入
            document.execCommand('insertText', false, text);
        });

        // 閉じる（×ボタンのみ有効）
        closeBtn.onclick = () => this.hide();

        // 文字数・行数カウント＋罫線のみ30字ごと仮想行
        editor.addEventListener('input', () => {
            // 1. 入力内容（素の文章）を取得
            const plain = editor.innerText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
            this.rawText = plain;
            // 2. カウントは素の文章ベース
            charCount.textContent = this.rawText.length;
            lineCount.textContent = this.rawText ? this.rawText.split('\n').length : 1;
            // 3. 罫線は素の文章を30字ごと仮想行分割して描画
            this.updateDynamicLines(this.rawText);
        });

        // スクロール同期（改良版 - マーカーも同期）
        editor.addEventListener('scroll', () => {
            lines.style.transform = `translateY(-${editor.scrollTop}px)`;
            if (this.markersVisible) {
                this.updateMarkers();
            }
        });

        // クリアボタン
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.onclick = () => {
                editor.innerHTML = '';
                this.rawText = '';
                this.updateStats(editor, charCount, lineCount);
                this.updateDynamicLines(''); // 🎨 罫線もリセット
            };
        }

        // 提出
        submitBtn.onclick = () => this.submit();

        // 👑 模範解答表示
        if (showModelAnswerBtn) {
            showModelAnswerBtn.onclick = () => {
                const q = this.getCurrentQuestionData();
                let answer = q.modelAnswer || q.answer || '模範解答が登録されていません';
                
                // ★★★ 模範解答内の条文参照とQ&A参照を自動処理 ★★★
                // まず改行を<br>に変換
                const normalizedAnswer = this.escapeHTML(answer).replace(/\\n|\n/g, '<br>');
                // processAllReferencesで条文とQ&A参照をボタン化
                const processedAnswer = processAllReferences(
                    normalizedAnswer, 
                    window.SUPPORTED_LAWS || [], 
                    window.currentCaseData?.questionsAndAnswers || []
                );
                
                // 既存ポップアップ削除
                const old = document.getElementById('model-answer-popup');
                if (old) old.remove();
                
                // ポップアップ生成
                const popup = document.createElement('div');
                popup.id = 'model-answer-popup';
                popup.style = `
                    position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%); z-index: 100000;
                    background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                    padding: 32px 28px 24px 28px; min-width: 320px; max-width: 90vw; max-height: 70vh; overflow-y: auto;
                    font-size: 18px; color: #222; line-height: 1.8; text-align: left;
                `;
                popup.innerHTML = `<div style="font-weight:700;font-size:20px;margin-bottom:12px;">👑 模範解答</div><div>${processedAnswer}</div><button id="close-model-answer-popup" style="position:absolute;top:10px;right:16px;background:#eee;border:none;border-radius:50%;width:28px;height:28px;font-size:18px;cursor:pointer;">×</button>`;
                document.body.appendChild(popup);
                
                // ボタンのイベントリスナーを設定
                setupArticleRefButtons(popup);
                
                // 閉じるボタンのイベント
                document.getElementById('close-model-answer-popup').onclick = () => popup.remove();
            };
        }

        // 一時保存ボタン追加
        const saveBtn = document.createElement('button');
        saveBtn.id = 'temp-save-btn';
        saveBtn.textContent = '💾 一時保存';
        saveBtn.style = 'padding: 10px 18px; background: linear-gradient(135deg, #6366f1, #00b894); color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(99,102,241,0.18); transition: all 0.3s ease; margin-right: 4px;';
        const btnArea = document.querySelector('#answer-area + div > div:last-child');
        if (btnArea) btnArea.insertBefore(saveBtn, btnArea.firstChild);
        saveBtn.onclick = () => this.saveTempAnswer();

        // 新しいボタンのイベントリスナー
        const saveResultBtn = document.getElementById('save-result-btn');
        const showPastAnswersBtn = document.getElementById('show-past-answers-btn');
        
        if (saveResultBtn) {
            saveResultBtn.onclick = () => this.saveFullResult();
        }
        
        if (showPastAnswersBtn) {
            showPastAnswersBtn.onclick = () => this.showPastAnswers();
        }
    }

    getPlainText(editor) {
        // <div>の中身をテキスト化（<mark>など除去）
        return editor.innerText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    // 素の文章→30字ごと自動改行した表示用テキスト（エディタには使わない）
    getDisplayText(raw) {
        const lines = raw.split('\n');
        const processedLines = [];
        for (let line of lines) {
            if (line.length <= 30) {
                processedLines.push(line);
            } else {
                for (let i = 0; i < line.length; i += 30) {
                    processedLines.push(line.slice(i, i + 30));
                }
            }
        }
        return processedLines.join('\n');
    }

    // ⚡ 自動改行付き入力処理（30字ごとに自動で改行）
    processInput(editor, value) {
        // 改行を含むテキストの処理
        const lines = value.split('\n');
        const processedLines = [];
        for (let line of lines) {
            // 各行を30文字で制限
            if (line.length <= 30) {
                processedLines.push(line);
            } else {
                // 30文字を超える行は分割
                for (let i = 0; i < line.length; i += 30) {
                    processedLines.push(line.slice(i, i + 30));
                }
            }
        }
        // 行数制限を大幅に緩和（100行まで）
        const limitedLines = processedLines.slice(0, 100);
        const formatted = limitedLines.join('\n');
        if (value !== formatted) {
            // editorはcontenteditableなdiv
            editor.innerText = formatted;
            // カーソルを末尾に移動
            this.moveCaretToEnd(editor);
        }
    }

    moveCaretToEnd(editor) {
        // contenteditableなdivの末尾にキャレットを移動
        editor.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    // 🎨 動的罫線更新（常に500本表示）
    updateDynamicLines(raw) {
        // 型安全: string以外は空文字に
        raw = (typeof raw === 'string') ? raw : '';
        const linesDiv = document.getElementById('lines');
        if (!linesDiv) return;
        const padding = 15;
        const displayLines = 500; // 常に500本
        let html = '';
        for (let i = 1; i <= displayLines; i++) {
            const isThick = i % 24 === 0;
            const opacity = isThick ? 0.9 : 0.4;
            const height = isThick ? '3px' : '1px';
            const color = isThick ? '#495057' : '#ced4da';
            html += `<div style="
                position: absolute;
                top: ${(i - 1) * 30 + padding}px;
                left: ${padding}px;
                right: ${padding}px;
                height: ${height};
                background: ${color};
                opacity: ${opacity};
                pointer-events: none;
                border-radius: 1px;
            "></div>`;
        }
        linesDiv.innerHTML = html;
    }
    
    // 🎯 文字位置計算（改行を考慮した実際の位置・全角=半角2個分）
    calculateCharPosition(text, charIndex) {
        let line = 0;
        let positionInLine = 0;
        let textIndex = 0;
        let targetReached = false;
        
        for (let i = 0; i < text.length && !targetReached; i++) {
            if (text[i] === '\n') {
                line++;
                positionInLine = 0;
            } else {
                if (textIndex === charIndex) {
                    targetReached = true;
                    break;
                }
                textIndex++;
            }
        }
        
        // 対象文字までの実際の表示幅を計算
        let displayWidth = 0;
        let currentTextIndex = 0;
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') {
                if (currentTextIndex >= textIndex) break;
                displayWidth = 0; // 改行で幅リセット
            } else {
                if (currentTextIndex === textIndex) break;
                // 半角=1、全角=2の幅で計算
                const charWidth = text[i].match(/[\x00-\x7F]/) ? 1 : 2;
                displayWidth += charWidth;
                currentTextIndex++;
            }
        }
        
        return { line, positionInLine: displayWidth };
    }

    // 🎨 マーカー表示（3文字目から20文字目）- 選択範囲版
    showMarkers() {
        const textarea = document.getElementById('answer-input');
        const text = textarea.value;
        const cleanText = text.replace(/\n/g, ''); // 改行を除いた純粋なテキスト
        
        if (cleanText.length < 3) {
            this.hideMarkers();
            return;
        }
        
        this.markersVisible = true;
        this.highlightSpecificChars(textarea);
    }

    // 🎨 特定文字のハイライト（3文字目から20文字目）
    highlightSpecificChars(textarea) {
        const text = textarea.value;
        const cleanText = text.replace(/\n/g, '');
        
        if (cleanText.length < 3) return;
        
        const startChar = 2; // 3文字目（0ベース）
        const endChar = Math.min(19, cleanText.length - 1); // 20文字目または文字列終端
        
        // 実際のテキスト内でのマーカー範囲を計算
        let realStartIndex = -1;
        let realEndIndex = -1;
        let cleanCharIndex = 0;
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] !== '\n') {
                if (cleanCharIndex === startChar && realStartIndex === -1) {
                    realStartIndex = i;
                }
                if (cleanCharIndex === endChar) {
                    realEndIndex = i + 1; // 終端は含まないので+1
                    break;
                }
                cleanCharIndex++;
            }
        }
        
        if (realStartIndex !== -1 && realEndIndex !== -1) {
            // 選択範囲でハイライト
            this.applySelectionHighlight(textarea, realStartIndex, realEndIndex);
        }
    }

    // 🎨 選択範囲ハイライト適用
    applySelectionHighlight(textarea, startIndex, endIndex) {
        // カスタム選択スタイルを追加
        const style = document.createElement('style');
        style.id = 'selection-highlight-style';
        style.textContent = `
            #answer-input::selection {
                background: rgba(255, 255, 0, 0.7) !important;
                color: #2c3e50 !important;
            }
            #answer-input::-moz-selection {
                background: rgba(255, 255, 0, 0.7) !important;
                color: #2c3e50 !important;
            }
        `;
        
        // 既存のスタイルを削除してから追加
        const existingStyle = document.getElementById('selection-highlight-style');
        if (existingStyle) existingStyle.remove();
        document.head.appendChild(style);
        
        // 選択範囲を設定
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(startIndex, endIndex);
            
            // 視覚効果のために少し選択状態を維持
            setTimeout(() => {
                // 選択を維持（解除しない）
                console.log(`ハイライト範囲: ${startIndex}-${endIndex} (3文字目〜20文字目)`);
            }, 100);
        }, 100);
    }

    // 🎨 ハイライト削除
    removeBackgroundHighlight(textarea) {
        const existingStyle = document.getElementById('selection-highlight-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // 選択を解除
        if (textarea) {
            const currentPos = textarea.selectionEnd;
            textarea.setSelectionRange(currentPos, currentPos);
        }
    }

    // 🎨 マーカー非表示 - 選択解除版
    hideMarkers() {
        this.markersVisible = false;
        const textarea = document.getElementById('answer-input');
        if (textarea) {
            this.removeBackgroundHighlight(textarea);
        }
    }

    // 📈 統計更新（軽量）
    updateStats(textarea, charCount, lineCount) {
        const text = textarea.value;
        const cleanText = text.replace(/\n/g, '');
        const lines = text ? text.split('\n').length : 1;
        
        charCount.textContent = cleanText.length;
        lineCount.textContent = lines;
    }

    // 一時保存キー生成（モジュールID＋問題ごとにユニーク）
    getTempSaveKey() {
        const caseId = window.currentCaseData?.caseId || 'unknownCase';
        return `tempAnswer_${caseId}_${this.currentQuizIndex}_${this.currentSubIndex}`;
    }

    // 一時保存
    saveTempAnswer() {
        const editor = document.getElementById('answer-editor');
        if (!editor) return;
        const text = this.getPlainText(editor);
        const key = this.getTempSaveKey();
        localStorage.setItem(key, text);
        // 保存通知
        const msg = document.createElement('div');
        msg.textContent = '一時保存しました';
        msg.style = 'position:fixed;bottom:32px;right:32px;background:#222;color:#fff;padding:10px 22px;border-radius:8px;font-size:16px;z-index:100001;box-shadow:0 2px 12px rgba(0,0,0,0.18);opacity:0.95;';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 1200);
    }

    // 一時保存読込
    loadTempAnswer() {
        const key = this.getTempSaveKey();
        const saved = localStorage.getItem(key);
        if (saved) {
            const editor = document.getElementById('answer-editor');
            if (editor) {
                editor.innerText = saved;
                this.rawText = saved;
                // カウント・罫線も更新
                document.getElementById('char-count').textContent = saved.length;
                document.getElementById('line-count').textContent = saved ? saved.split('\n').length : 1;
                this.updateDynamicLines(saved);
            }
        }
    }

    show(quizIndex, subIndex) {
        // 現在の問題インデックスを保存
        this.currentQuizIndex = quizIndex;
        this.currentSubIndex = subIndex;
        
        // 問題読み込み
        const questionDiv = document.getElementById('question-text');
        if (window.currentCaseData?.quiz?.[quizIndex]) {
            // 大問情報を取得
            const quizGroup = window.currentCaseData.quiz[quizIndex];
            
            // 小問情報を取得
            const subProblem = quizGroup.subProblems ? 
                quizGroup.subProblems[subIndex] : 
                quizGroup; // 旧形式の場合はquizGroup自体が小問
            
            // 大問タイトルと小問を両方表示（改行対応）
            const titleHtml = `【大問】${quizGroup.title || 'ミニ論文問題'}`;
            const backgroundHtml = quizGroup.background ? this.escapeHTML(quizGroup.background).replace(/\\n|\n/g, '<br>') : '';
            const subTitleHtml = `【設問】${subProblem.title ? this.escapeHTML(subProblem.title).replace(/\\n|\n/g, '<br>') : ''}`;
            const problemHtml = subProblem.problem ? this.escapeHTML(subProblem.problem).replace(/\\n|\n/g, '<br>') : (subProblem.description ? this.escapeHTML(subProblem.description).replace(/\\n|\n/g, '<br>') : '');
            
            questionDiv.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 8px 16px; border-radius: 8px;
                    margin-bottom: 12px; font-size: 1.1rem; font-weight: 700;
                    display: inline-flex; align-items: center; gap: 8px;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                ">
                    <span style="font-size: 1.2em;">📚</span>
                    ${processAllReferences(titleHtml, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || [])}
                </div>
                ${quizGroup.background ? `<div style="background: #f0f8ff; padding: 8px; border-radius: 4px; margin-bottom: 12px; font-size: 0.9rem;"><p>${processAllReferences(backgroundHtml, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || [])}</p></div>` : ''}
                <div style="
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                    color: white; padding: 6px 14px; border-radius: 6px;
                    margin-top: 12px; margin-bottom: 8px; font-size: 1rem; font-weight: 600;
                    display: inline-flex; align-items: center; gap: 6px;
                    box-shadow: 0 3px 10px rgba(238, 90, 82, 0.3);
                ">
                    <span style="font-size: 1.1em;">❓</span>
                    ${processAllReferences(subTitleHtml, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || [])}
                </div>
                <p style="margin-top: 8px; line-height: 1.6;">${processAllReferences(problemHtml, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || [])}</p>
            `;
        } else {
            questionDiv.innerHTML = '<p>問題を読み込めませんでした</p>';
        }

        // 背景スクロール禁止
        document.body.style.overflow = 'hidden';
        
        // 表示
        this.overlay.style.display = 'flex';
        this.isVisible = true;
        
        // 結果エリア非表示
        document.getElementById('result-area').style.display = 'none';
        
        // テキストエリアクリア & 統計リセット
        const editor = document.getElementById('answer-editor');
        editor.innerHTML = '';
        document.getElementById('char-count').textContent = '0';
        document.getElementById('line-count').textContent = '1';
        setTimeout(() => editor.focus(), 100);
        
        // 🎨 マーカー非表示
        this.hideMarkers();
        
        // 🎨 初期罫線表示
        this.updateDynamicLines('');
        setTimeout(() => {
            editor.focus();
            this.loadTempAnswer(); // 一時保存読込
            this.setupQuestionArticleButtons(); // 問題文内のボタンイベント設定
        }, 100);
    }

    // 問題文内の条文・Q&Aボタンのイベント設定
    setupQuestionArticleButtons() {
        const questionDiv = document.getElementById('question-text');
        if (!questionDiv) return;
        
        // setupArticleRefButtonsを使用してイベントを設定
        setupArticleRefButtons(questionDiv);
    }

    // 🎨 初期罫線生成（文字の下に配置、23行目が太線）
    createLines() {
        const linesDiv = document.getElementById('lines');
        if (!linesDiv) return;
        
        // テキストエリアの高さに基づいて表示行数を決定
        const textarea = document.getElementById('answer-input');
        const textareaHeight = textarea ? textarea.offsetHeight : 600; // デフォルト600px
        const maxVisibleLines = Math.floor(textareaHeight / 30);
        
        // 初期は23行固定で表示（但し表示可能範囲内）
        const displayLines = Math.min(23, maxVisibleLines);
        
        let html = '';
        for (let i = 1; i <= displayLines; i++) {
            // 23の倍数行を太くする（23行目が太線）
            const isThick = i % 23 === 0;
            const opacity = isThick ? 0.9 : 0.4;
            const height = isThick ? '3px' : '1px';
            const color = isThick ? '#495057' : '#ced4da';
            
            html += `<div style="
                position: absolute;
                top: ${i * 30 + 5}px;
                left: 15px;
                right: 15px;
                height: ${height};
                background: ${color};
                opacity: ${opacity};
                pointer-events: none;
                border-radius: 1px;
            "></div>`;
        }
        linesDiv.innerHTML = html;
    }

    hide() {
        document.body.style.overflow = '';
        this.overlay.style.display = 'none';
        this.isVisible = false;
    }

    // 成績テキストを取得
    getGradeText(percentage) {
        if (percentage >= 90) return 'S評価・最優秀';
        if (percentage >= 80) return 'A評価・優秀';
        if (percentage >= 70) return 'B評価・良好';
        if (percentage >= 60) return 'C評価・一応の基準';
        return 'D評価・不良';
    }

    // 添削結果を結果エリアに表示（AIスコア・総合コメントのみ右カラム、添削箇所リストは描画しない）
    displayCorrectionResults(correctionData, resultContent) {
        // スコア・総合コメントは右カラム
        const scorePercentage = Math.round((correctionData.score / correctionData.maxScore) * 100);
        let gradeColor = '#28a745'; // 緑
        if (scorePercentage < 60) gradeColor = '#dc3545'; // 赤
        else if (scorePercentage < 80) gradeColor = '#ffc107'; // 黄

        resultContent.innerHTML = `
            <div style="background: ${gradeColor}20; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${gradeColor};">
                <div style="font-size: 24px; font-weight: bold; color: ${gradeColor}; margin-bottom: 5px;">
                    ${correctionData.score}/${correctionData.maxScore}点
                </div>
                <div style="font-size: 14px; color: #666;">
                    ${scorePercentage}% | ${this.getGradeText(scorePercentage)}
                </div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #495057;">📝 総合コメント</h4>
                <p style="margin: 0; line-height: 1.5; color: #6c757d;">
                    ${correctionData.overallComment}
                </p>
            </div>
        `;
        // 添削箇所カラムは説明のみ
        const correctionArea = document.getElementById('correction-area');
        if (correctionArea) {
            correctionArea.innerHTML = `<h4 style='margin: 0 0 10px 0; color: #495057;'>🎯 添削箇所</h4><div id='correction-content'>答案内の<mark style='background: #ffe066; padding: 2px 4px; border-radius: 3px;'>マーカー部分</mark>をクリックすると詳細なコメントが表示されます。</div><div id='correction-detail-embed' style='margin-top:18px;'></div>`;
        }
    }

    // --- submitのAI添削中ローディング&ボタン制御 ---
    async submit() {
        const editor = document.getElementById('answer-editor');
        const text = this.getPlainText(editor).trim();
        if (!text) {
            alert('答案を入力してください');
            return;
        }

        const resultArea = document.getElementById('result-area');
        const resultContent = document.getElementById('result-content');
        const submitBtn = document.getElementById('submit-btn');
        resultArea.style.display = 'block';
        // ドーナツ型ローディング表示
        resultContent.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:120px;">
            <div class="donut-loader" style="width:48px;height:48px;display:block;margin-bottom:16px;"></div>
            <div style="font-size:16px;color:#666;">AI添削中...</div>
        </div>`;
        // ボタン無効化
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.pointerEvents = 'none';
        }
        // ローディングCSS追加（1回だけ）
        if (!document.getElementById('donut-loader-style')) {
            const style = document.createElement('style');
            style.id = 'donut-loader-style';
            style.textContent = `
            .donut-loader {
                border: 5px solid #e0e0e0;
                border-top: 5px solid #667eea;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                animation: donut-spin 1s linear infinite;
            }
            @keyframes donut-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            `;
            document.head.appendChild(style);
        }

        try {
            // 答案添削システムをインポート
            const { performAnswerCorrection } = await import('./answerCorrectionSystem.js');
            // 問題データを取得
            const questionData = this.getCurrentQuestionData();
            // AI添削実行
            const correctionData = await performAnswerCorrection(text, questionData);
            // 添削結果をインスタンス変数に保存
            this.currentCorrectionResults = correctionData;
            // 添削結果をマーカーで表示
            this.applyCorrectionMarkers(editor, correctionData);
            // 結果エリアに表示
            this.displayCorrectionResults(correctionData, resultContent);
        } catch (error) {
            console.error('❌ 添削システムエラー:', error);
            resultContent.innerHTML = `
                <div style="background: #f8d7da; padding: 10px; border-radius: 3px; color: #721c24;">
                    <strong>エラー:</strong><br>
                    添削システムに問題が発生しました。しばらく後に再試行してください。
                </div>
            `;
        } finally {
            // ボタン有効化
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                submitBtn.style.pointerEvents = '';
            }
        }
    }

    // 現在の問題データを取得
    getCurrentQuestionData() {
        if (window.currentCaseData?.quiz?.[this.currentQuizIndex]?.subProblems?.[this.currentSubIndex]) {
            return window.currentCaseData.quiz[this.currentQuizIndex].subProblems[this.currentSubIndex];
        }
        return {
            title: '問題',
            problem: '法律問題です',
            description: '問題の詳細が設定されていません'
        };
    }

    // 添削結果をマーカーで表示（targetTextベースで該当箇所にマーカー）
    async applyCorrectionMarkers(editor, correctionData) {
        const { CORRECTION_STYLES, CORRECTION_ICONS } = await import('./answerCorrectionSystem.js');
        const plain = this.getPlainText(editor);
        const cleanText = plain.replace(/\n/g, ''); // 改行除去版
        if (cleanText.length < 1 || !correctionData.corrections || correctionData.corrections.length === 0) {
            return;
        }

        // === ここで各correctionの内容をコンソール出力 ===
        correctionData.corrections.forEach((correction, idx) => {
            // キャラクター名・表情も出力
            console.log(
                `[correction ${idx}]`,
                `キャラクター: ${correction.characterName || 'みかん'}`,
                `表情: ${correction.expression || 'normal'}`,
                `type: ${correction.type}`,
                `targetText: ${correction.targetText}`,
                `comment: ${correction.comment}`
            );
        });

        // すべての添削範囲（start, end, targetText）から、cleanText上のインデックス範囲を再計算
        // 複数箇所一致も考慮し、各correctionに全ての該当範囲をマーク
        let markRanges = [];
        correctionData.corrections.forEach((correction, idx) => {
            if (!correction.targetText) return;
            let searchStart = 0;
            while (searchStart < cleanText.length) {
                const foundIdx = cleanText.indexOf(correction.targetText, searchStart);
                if (foundIdx === -1) break;
                markRanges.push({
                    start: foundIdx,
                    end: foundIdx + correction.targetText.length,
                    correction,
                    index: idx
                });
                searchStart = foundIdx + correction.targetText.length;
            }
        });

        // cleanText上の各インデックスにどのcorrectionが該当するかをマッピング
        const correctionMap = new Map();
        markRanges.forEach(({ start, end, correction, index }) => {
            for (let i = start; i < end; i++) {
                if (!correctionMap.has(i)) correctionMap.set(i, []);
                correctionMap.get(i).push({ ...correction, index });
            }
        });

        // プレーンテキスト→HTML変換（改行は<br>）
        let html = '';
        let cleanIdx = 0;
        for (let i = 0; i < plain.length; i++) {
            if (plain[i] === '\n') {
                html += '<br>';
            } else {
                const corrections = correctionMap.get(cleanIdx);
                if (corrections && corrections.length > 0) {
                    const correction = corrections[0];
                    // グラデーションなしの単色背景・枠線
                    let bgColor = '#fffbe6';
                    let borderColor = '#ffe066';
                    let textColor = '#b48a00';
                    switch (correction.type) {
                        case 'essential': bgColor = '#ffebee'; borderColor = '#d32f2f'; textColor = '#d32f2f'; break;
                        case 'bonus': bgColor = '#e3f2fd'; borderColor = '#1976d2'; textColor = '#1976d2'; break;
                        case 'good': bgColor = '#e8f5e8'; borderColor = '#388e3c'; textColor = '#388e3c'; break;
                        case 'improve': bgColor = '#fff3e0'; borderColor = '#f57c00'; textColor = '#f57c00'; break;
                        case 'delete': bgColor = '#f5f5f5'; borderColor = '#757575'; textColor = '#757575'; break;
                    }
                    // マーカー開始
                    if (
                        cleanIdx === 0 ||
                        !correctionMap.get(cleanIdx - 1) ||
                        correctionMap.get(cleanIdx - 1)[0].index !== correction.index
                    ) {
                        html += `<mark 
                            data-correction-index="${correction.index}"
                            style="
                                background: ${bgColor}; 
                                border: 2px solid ${borderColor}; 
                                color: ${textColor};
                                border-radius: 6px; 
                                box-shadow: 0 2px 8px rgba(0,0,0,0.15); 
                                padding: 2px 4px; 
                                cursor: pointer; 
                                transition: box-shadow 0.2s;
                                position: relative;
                            "
                        >`;
                    }
                }
                html += this.escapeHTML(plain[i]);
                if (corrections && corrections.length > 0) {
                    const correction = corrections[0];
                    // マーカー終了
                    if (
                        cleanIdx === cleanText.length - 1 ||
                        !correctionMap.get(cleanIdx + 1) ||
                        correctionMap.get(cleanIdx + 1)[0].index !== correction.index
                    ) {
                        html += '</mark>';
                    }
                }
                cleanIdx++;
            }
        }
        editor.innerHTML = html;
        this.setupCorrectionClickEvents(editor, correctionData);
    }

    // 添削マーカーのクリックイベント設定
    setupCorrectionClickEvents(editor, correctionData) {
        // --- アニメーション用CSSを1度だけ追加 ---
        if (!document.getElementById('marker-anim-style')) {
            const style = document.createElement('style');
            style.id = 'marker-anim-style';
            style.textContent = `
            mark[data-correction-index] {
                transition: box-shadow 0.2s, transform 0.25s cubic-bezier(.4,2,.6,1), background 0.25s, filter 0.25s;
            }
            mark[data-correction-index].marker-anim {
                transform: scale(1.13) rotate(-2deg);
                background: linear-gradient(90deg, #ffe066 60%, #fffbe6 100%);
                box-shadow: 0 0 0 6px #ffe06655, 0 8px 32px 0 #ffd70055;
                filter: brightness(1.15) drop-shadow(0 0 8px #ffe066cc);
                z-index: 10;
                border-color: #ffd700;
                animation: marker-bounce 0.45s cubic-bezier(.4,2,.6,1);
            }
            @keyframes marker-bounce {
                0% { transform: scale(1) rotate(0deg); }
                40% { transform: scale(1.18) rotate(-3deg); }
                60% { transform: scale(1.10) rotate(2deg); }
                80% { transform: scale(1.15) rotate(-2deg); }
                100% { transform: scale(1.13) rotate(-2deg); }
            }
            `;
            document.head.appendChild(style);
        }
        const markers = editor.querySelectorAll('mark[data-correction-index]');
        markers.forEach(marker => {
            marker.onclick = (e) => {
                e.stopPropagation();
                const index = parseInt(marker.dataset.correctionIndex);
                const correction = correctionData.corrections[index];
                if (correction) {
                    this.showCorrectionDetailInResultArea(correction, correctionData);
                } else {
                    const dummy = { comment: '該当データが見つかりません', type: 'essential', start: 0, end: 0, targetText: '' };
                    this.showCorrectionDetailInResultArea(dummy, correctionData);
                }
            };
            marker.onmouseover = () => {
                marker.classList.add('marker-anim');
            };
            marker.onmouseout = () => {
                marker.classList.remove('marker-anim');
            };
        });
    }

    // 添削詳細を中央カラム（correction-area）に埋め込み表示
    async showCorrectionDetailInResultArea(correction, correctionData) {
        // キャラクター情報を取得
        const { characters } = await import('../data/characters.js');
        const charName = correction.characterName || 'みかん';
        const expression = correction.expression || 'normal';
        let baseName = correction.baseName;
        let character = null;
        if (!baseName) {
            character = characters.find(c => c.name === charName || (c.aliases && c.aliases.includes(charName))) || characters[0];
            baseName = character.baseName;
        } else {
            character = characters.find(c => c.baseName === baseName) || characters[0];
        }
        let finalExpression = expression;
        if (character && character.availableExpressions && !character.availableExpressions.includes(expression)) {
            finalExpression = 'normal';
        }
        const iconSrc = `/images/${baseName}_${finalExpression}.png`;
        const fallbackSrc = `/images/${baseName}_normal.png`;
        const onErrorAttribute = `this.src='${fallbackSrc}'; this.onerror=null;`;
        const rightSideCharacters = window.currentCaseData?.rightSideCharacters || ['みかん', '母', '父'];
        const isRightSide = rightSideCharacters.includes(charName);
        const imageStyle = "width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2.5px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.08);";
        const iconTransform = isRightSide ? 'transform: scaleX(-1);' : '';
        const displayName = character ? character.name : charName;
        const message = correction.comment || '';
        // 文字範囲表示（1始まり）
        let rangeText = '';
        if (typeof correction.start === 'number' && typeof correction.end === 'number' && correction.end > correction.start) {
            rangeText = `<div style=\"font-size:12px;color:#888;margin-bottom:2px;\">（${correction.start+1}〜${correction.end}文字目）</div>`;
        }

        // --- 追加: 答案本文上での一致位置を計算 ---
        let matchText = '';
        try {
            // 答案本文（改行あり）
            const editor = document.getElementById('answer-editor');
            const plain = this.getPlainText(editor);
            if (correction.targetText) {
                // 改行含む本文で検索
                let idx = plain.indexOf(correction.targetText);
                if (idx !== -1) {
                    matchText = `<div style=\"font-size:12px;color:#888;margin-bottom:2px;\">（答案本文${idx+1}〜${idx+correction.targetText.length}文字目に一致）</div>`;
                } else {
                    // 複数回出現する場合も考慮（最初のみ表示）
                    let found = false;
                    for (let i = 0; i <= plain.length - correction.targetText.length; i++) {
                        if (plain.slice(i, i+correction.targetText.length) === correction.targetText) {
                            matchText = `<div style=\"font-size:12px;color:#888;margin-bottom:2px;\">（答案本文${i+1}〜${i+correction.targetText.length}文字目に一致）</div>`;
                            found = true;
                            break;
                        }
                    }
                    if (!found) matchText = '';
                }
            }
        } catch(e) { matchText = ''; }

        // --- コメント内の【法令名○条】をボタン化（casePage/articleProcessor.jsと同じ見た目・属性・イベント） ---
        let commentHtml = processArticleReferences(this.escapeHTML(message).replace(/【([^】]+)】/g, lawRefReplacer));

        // 埋め込み先
        const correctionArea = document.getElementById('correction-area');
        if (!correctionArea) return;
        let detailDiv = document.getElementById('correction-detail-embed');
        if (!detailDiv) {
            detailDiv = document.createElement('div');
            detailDiv.id = 'correction-detail-embed';
            correctionArea.appendChild(detailDiv);
        }
        detailDiv.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:14px;min-width:220px;max-width:380px;background:rgba(255,255,255,0.98);padding:10px 10px 10px 10px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.13);font-size:14px;z-index:1;border:1.5px solid #e0e0e0;min-height:80px;pointer-events:auto;user-select:text;transition:box-shadow 0.2s;">
                <div style="flex-shrink:0;width:56px;height:56px;border-radius:50%;overflow:hidden;border:2.5px solid #e0e0e0;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <img src="${iconSrc}" alt="${displayName}" style="${imageStyle} ${iconTransform}" loading="lazy" onerror="${onErrorAttribute}" />
                </div>
                <div style="flex:1;">
                    <div style="font-weight:bold;font-size:15px;color:#5a3c1a;margin-bottom:2px;">${displayName}</div>
                    ${rangeText}
                    ${matchText}
                    <div style="background:#f8f9fa;border-radius:12px;padding:12px 16px 12px 16px;font-size:15px;line-height:1.7;color:#333;box-shadow:0 2px 8px rgba(0,0,0,0.06);margin-bottom:6px;">
                        ${commentHtml}
                    </div>
                </div>
            </div>
        `;

        // --- ボタンにイベント付与 ---
        setTimeout(() => {
            // articleProcessor.jsのボタン仕様に合わせてdata-law-name/data-article-ref属性を持つボタンに対応
            const btns = detailDiv.querySelectorAll('.article-ref-btn');
            btns.forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const lawName = btn.dataset.lawName;
                    const articleRef = btn.dataset.articleRef;
                    if (lawName && articleRef) {
                        // showArticlePanelWithPresetでプリセット表示
                        if (window.showArticlePanelWithPreset) {
                            window.showArticlePanelWithPreset(lawName, articleRef);
                        } else {
                            import('../articlePanel.js').then(mod => {
                                window.showArticlePanelWithPreset = mod.showArticlePanelWithPreset;
                                window.showArticlePanelWithPreset(lawName, articleRef);
                            });
                        }
                    } else if (btn.dataset.lawText) {
                        // 旧仕様のdata-law-text対応
                        if (window.showArticlePanel) {
                            window.showArticlePanel(btn.dataset.lawText);
                        } else {
                            import('../articlePanel.js').then(mod => {
                                window.showArticlePanel = mod.showArticlePanel;
                                window.showArticlePanel(btn.dataset.lawText);
                            });
                        }
                    }
                };
            });
        }, 10);
    }

    // 添削タイプ名を取得
    getCorrectionTypeName(type) {
        const names = {
            essential: '必須論点',
            bonus: '加点要素',
            good: '良い点',
            improve: '改善点',
            delete: '削除推奨'
        };
        return names[type] || '添削';
    }

    // HTMLエスケープ関数
    escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
    }

    // 模範解答表示
    async showModelAnswer() {
        const modelAnswerData = this.getCurrentModelAnswerData();
        const resultArea = document.getElementById('result-area');
        const resultContent = document.getElementById('result-content');
        resultArea.style.display = 'block';

        // ドーナツ型ローディング表示
        resultContent.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:120px;">
            <div class="donut-loader" style="width:48px;height:48px;display:block;margin-bottom:16px;"></div>
            <div style="font-size:16px;color:#666;">読み込み中...</div>
        </div>`;

        // ローディングCSS追加（1回だけ）
        if (!document.getElementById('donut-loader-style')) {
            const style = document.createElement('style');
            style.id = 'donut-loader-style';
            style.textContent = `
            .donut-loader {
                border: 5px solid #e0e0e0;
                border-top: 5px solid #667eea;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                animation: donut-spin 1s linear infinite;
            }
            @keyframes donut-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            `;
            document.head.appendChild(style);
        }

        // モデル答案取得
        try {
            const response = await fetch(modelAnswerData.url);
            if (!response.ok) throw new Error('ネットワークエラー');
            const text = await response.text();
            // 改行コード統一
            const unifiedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            // 表示
            resultContent.innerHTML = `<pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;">${this.escapeHTML(unifiedText)}</pre>`;
        } catch (error) {
            console.error('❌ 模範解答読み込みエラー:', error);
            resultContent.innerHTML = `
                <div style="background: #f8d7da; padding: 10px; border-radius: 3px; color: #721c24;">
                    <strong>エラー:</strong><br>
                    模範解答の読み込みに失敗しました。しばらく後に再試行してください。
                </div>
            `;
        }
    }

    // 現在の問題の模範解答データを取得
    getCurrentModelAnswerData() {
        if (window.currentCaseData?.quiz?.[this.currentQuizIndex]?.subProblems?.[this.currentSubIndex]) {
            return window.currentCaseData.quiz[this.currentQuizIndex].subProblems[this.currentSubIndex].modelAnswer;
        }
        return {
            url: '', // デフォルトは空
        };
    }

    // 完全な結果を保存する（添削前・後どちらでも対応）
    saveFullResult() {
        const editor = document.getElementById('answer-editor');
        if (!editor) return;
        
        const answerText = this.getPlainText(editor).trim();
        if (!answerText) {
            this.showNotification('❌ 答案が入力されていません', 'error');
            return;
        }
        
        // 保存データを作成
        const saveData = {
            // 基本情報
            caseId: window.currentCaseData?.caseId || 'unknown',
            quizIndex: this.currentQuizIndex,
            subIndex: this.currentSubIndex,
            timestamp: new Date().toISOString(),
            
            // 答案内容
            answerText: answerText,
            
            // 添削結果（あれば）
            correctionResults: this.currentCorrectionResults || null,
            
            // 問題情報
            problemInfo: this.getCurrentQuestionData()
        };
        
        // LocalStorageに保存
        const key = this.getAnswerSaveKey();
        let savedAnswers = JSON.parse(localStorage.getItem(key) || '[]');
        
        // 新しい答案を先頭に追加
        savedAnswers.unshift(saveData);
        
        // 最大50件まで保持（古いものを削除）
        if (savedAnswers.length > 50) {
            savedAnswers = savedAnswers.slice(0, 50);
        }
        
        // 保存
        localStorage.setItem(key, JSON.stringify(savedAnswers));
        
        // 成功通知
        const resultText = saveData.correctionResults ? 
            `添削結果付きで保存しました（${saveData.correctionResults.score}/${saveData.correctionResults.maxScore}点）` : 
            '答案を保存しました（添削前）';
        this.showNotification(`✅ ${resultText}`, 'success');
        
        console.log('📊 答案結果保存完了:', saveData);
    }
    
    // 過去の答案を表示
    showPastAnswers() {
        const key = this.getAnswerSaveKey();
        const savedAnswers = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (savedAnswers.length === 0) {
            this.showNotification('📝 保存された答案がありません', 'info');
            return;
        }
        
        this.showPastAnswersModal(savedAnswers);
    }
    
    // 過去の答案モーダルを表示
    showPastAnswersModal(savedAnswers) {
        // 既存のモーダルを削除
        const existingModal = document.getElementById('past-answers-modal');
        if (existingModal) existingModal.remove();
        
        // モーダルHTML作成
        const modal = document.createElement('div');
        modal.id = 'past-answers-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); z-index: 100000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; border-radius: 12px; padding: 24px;
            width: 90%; max-width: 800px; max-height: 70vh; overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        
        let listHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #333;">📜 過去の答案 (${savedAnswers.length}件)</h2>
                <button id="close-past-answers" style="
                    background: #dc3545; color: white; border: none; border-radius: 50%;
                    width: 32px; height: 32px; cursor: pointer; font-size: 18px;
                ">×</button>
            </div>
            <div style="max-height: 50vh; overflow-y: auto;">
        `;
        
        savedAnswers.forEach((answer, index) => {
            const date = new Date(answer.timestamp);
            const dateStr = date.toLocaleDateString('ja-JP') + ' ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
            
            // 点数情報
            let scoreInfo = '';
            if (answer.correctionResults) {
                const score = answer.correctionResults.score || 0;
                const maxScore = answer.correctionResults.maxScore || 100;
                const percentage = Math.round((score / maxScore) * 100);
                let scoreColor = '#28a745';
                if (percentage < 60) scoreColor = '#dc3545';
                else if (percentage < 80) scoreColor = '#ffc107';
                
                scoreInfo = `<span style="color: ${scoreColor}; font-weight: bold;">${score}/${maxScore}点 (${percentage}%)</span>`;
            } else {
                scoreInfo = '<span style="color: #6c757d;">添削前</span>';
            }
            
            // 答案プレビュー
            const preview = answer.answerText.length > 100 ? 
                answer.answerText.substring(0, 100) + '...' : 
                answer.answerText;
            
            listHtml += `
                <div style="
                    border: 1px solid #dee2e6; border-radius: 8px; padding: 16px; margin-bottom: 12px;
                    background: ${index === 0 ? '#f8f9fa' : 'white'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-weight: bold; color: #495057;">${dateStr}</div>
                        <div>${scoreInfo}</div>
                    </div>
                    <div style="
                        background: #f8f9fa; padding: 12px; border-radius: 6px; 
                        font-family: monospace; line-height: 1.4; font-size: 14px; color: #495057;
                        margin-bottom: 8px;
                    ">${this.escapeHTML(preview)}</div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="overlay.viewFullAnswer(${index})" style="
                            background: #007bff; color: white; border: none; padding: 6px 12px;
                            border-radius: 4px; cursor: pointer; font-size: 12px;
                        ">📖 全文表示</button>
                        <button onclick="overlay.deleteAnswer(${index})" style="
                            background: #dc3545; color: white; border: none; padding: 6px 12px;
                            border-radius: 4px; cursor: pointer; font-size: 12px;
                        ">🗑️ 削除</button>
                    </div>
                </div>
            `;
        });
        
        listHtml += `</div>`;
        content.innerHTML = listHtml;
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // イベントリスナー
        document.getElementById('close-past-answers').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        // 現在の答案データを保存（削除用）
        this.currentSavedAnswers = savedAnswers;
    }
    
    // 答案全文表示
    viewFullAnswer(index) {
        const answers = this.currentSavedAnswers;
        if (!answers || !answers[index]) return;
        
        const answer = answers[index];
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 100001;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; border-radius: 12px; padding: 24px;
            width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        `;
        
        const date = new Date(answer.timestamp);
        const dateStr = date.toLocaleDateString('ja-JP') + ' ' + date.toLocaleTimeString('ja-JP');
        
        let scoreHtml = '';
        if (answer.correctionResults) {
            const score = answer.correctionResults.score || 0;
            const maxScore = answer.correctionResults.maxScore || 100;
            const percentage = Math.round((score / maxScore) * 100);
            let scoreColor = '#28a745';
            if (percentage < 60) scoreColor = '#dc3545';
            else if (percentage < 80) scoreColor = '#ffc107';
            
            scoreHtml = `
                <div style="margin: 16px 0; padding: 12px; background: ${scoreColor}20; border-radius: 8px; border-left: 4px solid ${scoreColor};">
                    <div style="font-weight: bold; color: ${scoreColor};">📊 添削結果: ${score}/${maxScore}点 (${percentage}%)</div>
                    ${answer.correctionResults.overallComment ? `<div style="margin-top: 8px; color: #495057;">${this.escapeHTML(answer.correctionResults.overallComment)}</div>` : ''}
                </div>
            `;
        }
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #333;">📖 答案詳細</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: #dc3545; color: white; border: none; border-radius: 50%;
                    width: 32px; height: 32px; cursor: pointer; font-size: 18px;
                ">×</button>
            </div>
            <div style="color: #6c757d; margin-bottom: 16px;">${dateStr}</div>
            ${scoreHtml}
            <div style="
                background: #f8f9fa; padding: 16px; border-radius: 8px;
                font-family: monospace; line-height: 1.6; white-space: pre-wrap;
                color: #495057; border: 1px solid #dee2e6;
            ">${this.escapeHTML(answer.answerText)}</div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
    
    // 答案削除
    deleteAnswer(index) {
        if (!confirm('この答案を削除してもよろしいですか？')) return;
        
        const key = this.getAnswerSaveKey();
        let savedAnswers = JSON.parse(localStorage.getItem(key) || '[]');
        
        // 削除
        savedAnswers.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(savedAnswers));
        
        // モーダルを再表示
        document.getElementById('past-answers-modal')?.remove();
        this.showPastAnswersModal(savedAnswers);
        
        this.showNotification('🗑️ 答案を削除しました', 'success');
    }
    
    // 答案保存用キー生成
    getAnswerSaveKey() {
        const caseId = window.currentCaseData?.caseId || 'unknown';
        return `savedAnswers_${caseId}_${this.currentQuizIndex}_${this.currentSubIndex}`;
    }
    
    // 通知表示
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        let bgColor = '#17a2b8';
        if (type === 'success') bgColor = '#28a745';
        else if (type === 'error') bgColor = '#dc3545';
        else if (type === 'warning') bgColor = '#ffc107';
        
        notification.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; z-index: 100002;
            background: ${bgColor}; color: white; padding: 12px 20px;
            border-radius: 8px; font-weight: 500; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease-out;
        `;
        
        // アニメーションCSS追加
        if (!document.getElementById('notification-animation-style')) {
            const style = document.createElement('style');
            style.id = 'notification-animation-style';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 3秒後に自動削除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// グローバル設定
let overlay = null;

window.startAnswerCorrectionMode = (quizIndex, subIndex) => {
    if (!overlay) overlay = new AnswerOverlay();
    overlay.show(quizIndex, subIndex);
};

document.addEventListener('DOMContentLoaded', () => {
    overlay = new AnswerOverlay();
});

// テスト
window.testOverlay = () => {
    if (overlay) overlay.show(0, 0);
};

// 【法令名○条】→ボタン化用の正規表現置換関数（articleProcessor.jsと同等）
function lawRefReplacer(match, p1) {
    // p1: 法令名＋条文
    // 例: "民法709条" → lawName: "民法", articleRef: "709条"
    const m = p1.match(/^(.+?)([0-9０-９条項号の\-・〜～]*)$/);
    if (!m) return match;
    const lawName = m[1];
    const articleRef = m[2] || '';
    return `<button class="article-ref-btn" data-law-name="${lawName}" data-article-ref="${articleRef}" style="background:#fffbe6;border:1.2px solid #ffe066;border-radius:7px;padding:2px 7px;font-size:13px;color:#b48a00;cursor:pointer;margin:0 2px 0 2px;vertical-align:middle;">${match}</button>`;
}
