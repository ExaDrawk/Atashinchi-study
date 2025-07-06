// answerOverlay.js - 完全に一から作り直したシンプルな答案オーバーレイ

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

        // 完全新規HTML
        const html = `
            <div id="answer-overlay" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); z-index: 99999; display: none;
                justify-content: center; align-items: center;
            ">
                <div style="
                    background: white; width: 95%; max-width: 1200px; height: 90%;
                    border-radius: 8px; padding: 20px; 
                    display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: auto 1fr;
                    gap: 20px; position: relative;
                ">
                    <button id="close-btn" style="
                        position: absolute; top: 10px; right: 10px; background: red;
                        color: white; border: none; border-radius: 50%; width: 35px; height: 35px;
                        cursor: pointer; font-size: 18px; z-index: 10;
                    ">×</button>
                    
                    <!-- 中央上: 問題 -->
                    <div style="grid-column: 1; grid-row: 1; background: #f5f5f5; padding: 15px; border-radius: 5px;">
                        <h3 style="margin-top: 0;">問題</h3>
                        <div id="question-text">問題文がここに表示されます</div>
                    </div>
                    
                    <!-- 右: 添削結果 -->
                    <div id="result-area" style="
                        grid-column: 2; grid-row: 1 / span 2; background: #f0f8ff; 
                        padding: 15px; border-radius: 5px; display: none;
                    ">
                        <h3 style="margin-top: 0;">AI添削結果</h3>
                        <div id="result-content">結果がここに表示されます</div>
                    </div>
                    
                    <!-- 中央: 答案（モダンデザイン） -->
                    <div style="grid-column: 1; grid-row: 2; position: relative;">
                        <h3 style="
                            margin-top: 0; color: #2c3e50; font-weight: 600; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                            background-clip: text; font-size: 18px;
                        ">📝 答案（30文字自動改行）</h3>
                        <div style="
                            position: relative; min-height: calc(100% - 80px); 
                            background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
                            border-radius: 12px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
                            border: 1px solid #dee2e6;
                        ">
                            <div id="lines" style="
                                position: absolute; top: 0; left: 0; right: 0; height: 100%;
                                pointer-events: none; z-index: 1; overflow: hidden;
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
                                <span>📊 文字数: <strong id="char-count" style="color: #007bff;">0</strong></span>
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
                                <button id="show-user-newline-text-btn" style="
                                    padding: 10px 18px; background: linear-gradient(135deg, #0984e3, #00b894);
                                    color: white; border: none; border-radius: 25px; cursor: pointer;
                                    font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(9, 132, 227, 0.3);
                                    transition: all 0.3s ease; transform: translateY(0);
                                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(9, 132, 227, 0.4)';"
                                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(9, 132, 227, 0.3)';">
                                改行のみ反映テキストを表示</button>
                            </div>
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
        const showUserNewlineTextBtn = document.getElementById('show-user-newline-text-btn');
        // ユーザー入力の改行のみ反映したテキストを保持
        this.userNewlineText = '';
        // 改行監視用
        editor.addEventListener('input', (e) => {
            // contenteditableのdivから、ユーザーが入力した改行のみを反映したテキストを抽出
            // ここではShift+EnterやEnterでの改行のみを反映し、自動改行やwrapは無視
            // innerTextは自動改行も含むため、childNodesを走査してbr/テキストノードのみを抽出
            let result = '';
            function traverse(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    result += node.nodeValue;
                } else if (node.nodeName === 'BR') {
                    result += '\n';
                } else if (node.childNodes) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        traverse(node.childNodes[i]);
                    }
                }
            }
            traverse(editor);
            // 末尾の改行は除去
            this.userNewlineText = result.replace(/\n+$/,'');
        }); // ←ここでinputイベントの関数を閉じる

        // 文字数・行数カウント
        editor.addEventListener('input', () => {
            const text = editor.innerText;
            charCount.innerText = text.length;
            lineCount.innerText = text.split('\n').length;
        });

        // 提出ボタン
        submitBtn.addEventListener('click', () => {
            this.submitAnswer();
        });

        // モデル答案表示ボタン
        showModelAnswerBtn.addEventListener('click', () => {
            this.showModelAnswer();
        });

        // ユーザー改行テキスト表示ボタン
        showUserNewlineTextBtn.addEventListener('click', () => {
            this.showUserNewlineText();
        });

        // 閉じるボタン
        closeBtn.addEventListener('click', () => {
            this.close();
        });

        // オーバーレイ外クリックで閉じる
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    createLines() {
        const lines = document.getElementById('lines');
        lines.innerHTML = ''; // 既存のラインをクリア

        // 行数に応じたラインを生成
        for (let i = 0; i < 50; i++) {
            const line = document.createElement('div');
            line.style.cssText = `
                position: absolute; left: 0; right: 0; height: 1px;
                background: linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent);
                top: ${i * 1.5}em;
                pointer-events: none;
            `;
            lines.appendChild(line);
        }
    }

    submitAnswer() {
        const answer = document.getElementById('answer-editor').innerText;
        if (!answer.trim()) {
            alert('答案が空です。何か入力してください。');
            return;
        }
        // 送信処理（ダミー）
        console.log('提出された答案:', answer);
        alert('答案を提出しました！');
        this.close();
    }

    showModelAnswer() {
        // モデル答案のダイアログを表示（ダミー処理）
        alert('モデル答案の表示機能はまだ実装されていません。');
    }

    showUserNewlineText() {
        // ユーザー改行テキストのダイアログを表示（ダミー処理）
        alert('ユーザー改行テキストの表示機能はまだ実装されていません。');
    }

    open(quiz) {
        this.currentQuizIndex = quiz.index;
        this.currentSubIndex = 0;
        this.isVisible = true;
        this.overlay.style.display = 'flex';

        // 問題文をセット
        document.getElementById('question-text').innerText = quiz.question;

        // 答案エリアを初期化
        const editor = document.getElementById('answer-editor');
        editor.innerHTML = '';
        editor.focus();

        // 既存の結果エリアをクリア
        document.getElementById('result-content').innerHTML = '';
        document.getElementById('result-area').style.display = 'none';

        // 行数・文字数をリセット
        document.getElementById('char-count').innerText = '0';
        document.getElementById('line-count').innerText = '1';
    }

    close() {
        this.isVisible = false;
        this.overlay.style.display = 'none';
    }
}

// 使用例
const overlay = new AnswerOverlay();
document.getElementById('open-overlay-btn').addEventListener('click', () => {
    overlay.open({
        index: 0,
        question: 'これはサンプルの問題です。あなたの意見を述べてください。'
    });
});
