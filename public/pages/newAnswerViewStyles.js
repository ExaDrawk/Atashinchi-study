// newAnswerViewStyles.js - 新生答案添削ビューのスタイル定義

/**
 * 新生答案ビューのCSSスタイルを追加
 */
function addNewAnswerViewStyles() {
    const styleId = 'new-answer-view-styles';
    if (document.getElementById(styleId)) {
        return; // 既に追加済み
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* 新生答案添削ビューのメインスタイル */
        .new-answer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #f8fafc;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .new-answer-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        /* ミニヘッダー（戻るボタンのみ） */
        .mini-header {
            height: 40px;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            padding: 0 16px;
        }
        
        .back-btn {
            background: #6b7280;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .back-btn:hover {
            background: #4b5563;
        }
        
        /* 4カラムメインエリア - 画像通りのグリッドレイアウト */
        .main-columns {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr 1fr; /* 4カラム: 左:中央:右:右端 = 1:2:1:1 */
            grid-template-rows: 1fr 2fr; /* 2行、下の行を大きく */
            height: calc(100vh - 40px); /* ヘッダー分を引く */
            gap: 2px;
            background: #e2e8f0;
        }
        
        /* カラム基本スタイル */
        .column {
            display: flex;
            flex-direction: column;
            background: white;
        }
        
        /* グリッド配置の指定 - 画像通り */
        .column-article { 
            grid-column: 1; 
            grid-row: 1; 
        }
        .column-problem { 
            grid-column: 2; 
            grid-row: 1; 
        }
        .column-qa { 
            grid-column: 1; 
            grid-row: 2; 
        }
        .column-answer { 
            grid-column: 2; 
            grid-row: 2; 
        }
        .column-correction { 
            grid-column: 3; 
            grid-row: 1 / 3; /* 2行にまたがる */
        }
        .column-opinion { 
            grid-column: 4; 
            grid-row: 1 / 3; /* 2行にまたがる */
        }
        
        /* カラムヘッダー */
        .column-header {
            background: #f1f5f9;
            padding: 12px 16px;
            border-bottom: 2px solid #e2e8f0;
            font-weight: bold;
            color: #374151;
            text-align: center;
        }
        
        /* カラムコンテンツ */
        .column-content {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
        }
        
        /* ボタンスタイル */
        .btn-primary {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .btn-primary:hover {
            background: #2563eb;
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .btn-secondary:hover {
            background: #4b5563;
        }
        
        /* 答案製作エリア */
        .answer-controls {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .char-counter {
            margin-left: auto;
            font-size: 12px;
            color: #6b7280;
            font-weight: bold;
        }
        
        .answer-input-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            max-width: 100%;
            overflow: hidden;
            padding: 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .answer-textarea {
            width: 100% !important;
            max-width: none !important;
            font-family: "Courier New", "MS Gothic", monospace !important;
            border: none !important;
            outline: none !important;
            padding: 0 !important;
            margin: 0 !important;
            resize: none !important;
            overflow: hidden !important;
            word-wrap: break-word !important;
            white-space: pre-wrap !important;
            background-color: transparent !important;
            background-attachment: local !important;
            box-sizing: border-box !important;
            /* フォントサイズ、行の高さ、高さはJavaScriptで動的設定 */
        }
        
        .answer-textarea:focus {
            border-color: #1d4ed8 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* 答案用紙風のスタイル */
        .answer-textarea::placeholder {
            color: #9ca3af;
            font-size: 12px;
        }
        
        /* 問題文エリア */
        .problem-text {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            white-space: pre-wrap;
            overflow-y: auto;
            max-height: 100%;
        }
        
        /* Q&Aエリア */
        .qa-content {
            margin-top: 12px;
        }
        
        .hidden {
            display: none;
        }
        
        /* 添削結果エリア */
        .correction-result {
            margin-top: 12px;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background: #f9fafb;
        }
        
        /* チャットエリア */
        .chat-area {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .chat-messages {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            overflow-y: auto;
            margin-bottom: 12px;
            min-height: 300px;
        }
        
        .system-message {
            color: #6b7280;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
        
        .chat-input-area {
            display: flex;
            gap: 8px;
        }
        
        .chat-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            outline: none;
        }
        
        .chat-input:focus {
            border-color: #3b82f6;
        }
        
        /* 読み込み表示 */
        .loading-text {
            text-align: center;
            color: #6b7280;
            padding: 20px;
        }
        
        /* レスポンシブ対応 */
        @media (max-width: 1200px) {
            .main-columns {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: repeat(4, 1fr);
            }
            
            .column-article { grid-column: 1; grid-row: 1; }
            .column-problem { grid-column: 2; grid-row: 1; }
            .column-qa { grid-column: 1; grid-row: 2; }
            .column-answer { grid-column: 2; grid-row: 2; }
            .column-correction { grid-column: 1; grid-row: 3; }
            .column-opinion { grid-column: 2; grid-row: 3; }
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ 新生答案ビューのスタイルを追加しました');
}

// 自動実行
addNewAnswerViewStyles();
