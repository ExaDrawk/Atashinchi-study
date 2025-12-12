/**
 * 🎭 INTOモード - ビジュアルノベル風ストーリー再生
 * 恋愛シミュレーションゲーム風の高品質な演出
 * 
 * 機能:
 * - 複数キャラクター同時表示（左・中央・右配置）
 * - 発言中キャラの最前面表示＋アニメーション
 * - 空欄ボタン（クリックで表示）
 * - 条文ボタン（クリックで条文モーダル）
 * - Q&Aボタン（クリックでQ&A表示）
 */

import { characters } from './data/characters.js';

// ═══════════════════════════════════════════════════════════════════════════
// グローバル状態
// ═══════════════════════════════════════════════════════════════════════════
const INTO = {
    phase: 'idle', // idle, playing, paused
    story: [],
    index: 0,
    container: null,
    autoMode: false,
    autoTimer: null,
    textSpeed: 30, // 文字表示速度（ms/文字）
    isTyping: false,
    skipTyping: false,
    currentText: '',
    typingTimer: null,
    history: [], // 読み返し用履歴
    caseData: null,
    // 複数キャラクター管理
    activeCharacters: new Map(), // speakerName -> { charInfo, position, expression, side }
    speakerHistory: [], // 発言順序を追跡
    // BGM・背景管理
    currentBgm: null, // 現在再生中のBGM Audio要素
    currentBackground: null, // 現在の背景画像パス
};

// キャラクターの配置位置定義（左・中央左・中央右・右）
const CHAR_POSITIONS = {
    left: { x: '10%', zIndex: 1 },
    centerLeft: { x: '30%', zIndex: 2 },
    center: { x: '50%', zIndex: 3 },
    centerRight: { x: '70%', zIndex: 2 },
    right: { x: '90%', zIndex: 1 },
};

// ═══════════════════════════════════════════════════════════════════════════
// スタイル定義
// ═══════════════════════════════════════════════════════════════════════════
const INTO_STYLES = `
<style id="into-styles">
/* フルスクリーンコンテナ */
.into-fullscreen {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999;
    overflow: hidden;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
}

/* 背景レイヤー */
.into-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #ffffff 0%, #f1f3f4 50%, #e8eaed 100%);
    transition: background 0.5s ease;
}

/* シーン変更時の背景 */
.into-bg.scene-change {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

/* キャラクター表示エリア - 複数キャラ対応 */
.into-character-area {
    position: absolute;
    bottom: 220px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: calc(100vh - 300px);
    width: 100%;
    pointer-events: none;
}

/* 個別キャラクターコンテナ */
.into-char-slot {
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 100%;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-50%);
}

.into-char-slot.position-left { left: 15%; }
.into-char-slot.position-centerLeft { left: 35%; }
.into-char-slot.position-center { left: 50%; }
.into-char-slot.position-centerRight { left: 65%; }
.into-char-slot.position-right { left: 85%; }
.into-char-slot.position-centerRight { left: 65%; }

/* 右側キャラクターを左右反転 */
.into-char-slot.position-right .into-character,
.into-char-slot.position-centerRight .into-character {
    transform: scaleX(-1);
}

.into-char-slot.position-right .into-character.speaking,
.into-char-slot.position-centerRight .into-character.speaking {
    transform: scaleX(-1) scale(1.05);
    animation: speakingPulseFlipped 1.5s ease-in-out infinite;
}

.into-char-slot.position-right .into-character.inactive,
.into-char-slot.position-centerRight .into-character.inactive {
    transform: scaleX(-1) scale(0.92);
}

@keyframes speakingPulseFlipped {
    0%, 100% { transform: scaleX(-1) scale(1.05); }
    50% { transform: scaleX(-1) scale(1.08) translateY(-5px); }
}

/* キャラクター画像 */
.into-character {
    max-height: 100%;
    max-width: 300px;
    object-fit: contain;
    filter: drop-shadow(0 10px 30px rgba(0,0,0,0.15));
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: bottom center;
}

.into-character.entering {
    animation: charEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.into-character.speaking {
    filter: drop-shadow(0 10px 40px rgba(99, 102, 241, 0.4));
    transform: scale(1.05);
    animation: speakingPulse 1.5s ease-in-out infinite;
}

.into-character.inactive {
    filter: brightness(0.6) saturate(0.7) drop-shadow(0 10px 20px rgba(0,0,0,0.1));
    transform: scale(0.92);
    opacity: 0.85;
}

@keyframes speakingPulse {
    0%, 100% { transform: scale(1.05); }
    50% { transform: scale(1.08) translateY(-5px); }
}

@keyframes charEnter {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* テキストボックス */
.into-textbox {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
    backdrop-filter: blur(10px);
    border-top: 3px solid rgba(99, 102, 241, 0.5);
    padding: 0;
    min-height: 200px;
    display: flex;
    flex-direction: column;
}

/* 話者名プレート */
.into-speaker {
    position: absolute;
    top: -20px;
    left: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 8px 28px;
    border-radius: 8px 8px 0 0;
    font-weight: bold;
    font-size: 1.1rem;
    box-shadow: 0 -4px 20px rgba(99, 102, 241, 0.4);
    transform: translateY(0);
    transition: all 0.3s ease;
}

.into-speaker.narration {
    background: linear-gradient(135deg, #475569 0%, #334155 100%);
    box-shadow: 0 -4px 20px rgba(71, 85, 105, 0.4);
}

/* テキスト表示エリア */
.into-text-content {
    flex: 1;
    padding: 30px 50px 20px;
    color: #f1f5f9;
    font-size: 1.25rem;
    line-height: 2;
    letter-spacing: 0.05em;
    overflow-y: auto;
}

/* ナレーション時のスタイル */
.into-text-content.narration {
    font-style: italic;
    color: #cbd5e1;
}

/* 次へ進むインジケーター */
.into-next-indicator {
    position: absolute;
    bottom: 20px;
    right: 40px;
    color: rgba(255,255,255,0.6);
    font-size: 0.9rem;
    animation: blink 1.5s infinite;
    display: flex;
    align-items: center;
    gap: 8px;
}

.into-next-indicator::after {
    content: '▼';
    animation: bounce 1s infinite;
}

@keyframes blink {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
}

/* UI ボタン群 */
.into-ui {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 10;
}

.into-btn {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    color: #64748b;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.into-btn:hover {
    background: rgba(255,255,255,0.95);
    color: #1e293b;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.into-btn.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
}

.into-btn-close {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
}

.into-btn-close:hover {
    background: #ef4444;
    color: white;
}

/* 進捗バー */
.into-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(0,0,0,0.1);
}

.into-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #a855f7);
    transition: width 0.3s ease;
}

/* シーン表示 */
.into-scene-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.5s ease;
    z-index: 20;
}

.into-scene-text {
    color: white;
    font-size: 2rem;
    font-weight: bold;
    letter-spacing: 0.2em;
    text-shadow: 0 0 30px rgba(255,255,255,0.3);
    animation: sceneTextIn 1s ease forwards;
}

.into-scene-line {
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #6366f1, transparent);
    margin-top: 20px;
    animation: lineExpand 1s ease 0.3s forwards;
    opacity: 0;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes sceneTextIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes lineExpand {
    from {
        opacity: 0;
        width: 0;
    }
    to {
        opacity: 1;
        width: 200px;
    }
}

/* 履歴モーダル */
.into-history-modal {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.9);
    z-index: 30;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease;
}

.into-history-header {
    padding: 20px 30px;
    background: rgba(30, 41, 59, 0.95);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.into-history-title {
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
}

.into-history-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 30px;
}

.into-history-item {
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 10px;
    background: rgba(255,255,255,0.05);
}

.into-history-speaker {
    color: #a5b4fc;
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 5px;
}

.into-history-text {
    color: #e2e8f0;
    line-height: 1.8;
}

/* タイピングカーソル */
.into-cursor {
    display: inline-block;
    width: 3px;
    height: 1.2em;
    background: #6366f1;
    margin-left: 2px;
    animation: cursorBlink 0.8s infinite;
    vertical-align: text-bottom;
}

@keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

/* クリックエリア（透明）- テキストボックスの上を避ける */
.into-click-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 220px; /* テキストボックスの高さ分避ける */
    cursor: pointer;
    z-index: 5;
}

/* ═══ インタラクティブ要素スタイル ═══ */

/* 共通：行の高さに影響しないinline要素 */
.into-blank,
.into-article-btn,
.into-qa-btn {
    display: inline;
    padding: 0 6px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s ease, color 0.2s ease;
    vertical-align: baseline;
    line-height: inherit;
    pointer-events: auto;
    position: relative;
    z-index: 100;
}

/* 空欄ボタン */
.into-blank {
    background: #fbbf24;
    color: #1e293b;
}

.into-blank:hover {
    background: #f59e0b;
}

.into-blank.revealed {
    background: #10b981;
    color: white;
}

.into-blank.checked {
    background: #059669;
    color: white;
    box-shadow: 0 0 0 2px #34d399;
}

.into-blank.checked::after {
    content: ' ✓';
    font-size: 0.8em;
}

/* 条文ボタン */
.into-article-btn {
    background: #3b82f6;
    color: white;
}

.into-article-btn:hover {
    background: #2563eb;
}

/* Q&Aボタン */
.into-qa-btn {
    background: #8b5cf6;
    color: white;
    font-size: 0.9em;
}

.into-qa-btn:hover {
    background: #7c3aed;
}

/* インタラクティブ要素の出現アニメーション */
.into-interactive {
    visibility: hidden;
}

.into-interactive.appear {
    visibility: visible;
}

/* モバイル対応 */
@media (max-width: 768px) {
    .into-textbox {
        min-height: 180px;
    }
    
    .into-text-content {
        font-size: 1.1rem;
        padding: 25px 20px 15px;
    }
    
    .into-speaker {
        left: 20px;
        font-size: 1rem;
        padding: 6px 20px;
    }
    
    .into-character {
        max-width: 150px;
    }
    
    .into-char-slot.position-left { left: 10%; }
    .into-char-slot.position-centerLeft { left: 30%; }
    .into-char-slot.position-centerRight { left: 70%; }
    .into-char-slot.position-right { left: 90%; }
    
    .into-ui {
        top: 10px;
        right: 10px;
    }
    
    .into-btn {
        padding: 8px 14px;
        font-size: 0.85rem;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* 埋め込みオーバーレイ - プロ仕様の大画面表示 */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* 背景オーバーレイ（ぼかし効果付き） */
.into-embed-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 200; /* キャラクター、テキストボックスより全面に表示 */
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    pointer-events: auto;
    animation: embedFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.into-embed-overlay.active {
    display: flex;
}

/* 埋め込みコンテンツラッパー */
.into-embed-overlay > div {
    width: 95%;
    max-width: 1000px;
    max-height: 85vh;
    overflow-y: auto;
    animation: embedSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ═══ 黒板スタイル ═══ */
.into-embed-board {
    background: linear-gradient(135deg, #1a5a35 0%, #0d3d23 50%, #0a2a18 100%);
    border: 20px solid #6d4c41;
    border-radius: 12px;
    box-shadow: 
        0 30px 100px rgba(0, 0, 0, 0.8),
        inset 0 0 120px rgba(0, 0, 0, 0.3),
        inset 0 3px 0 rgba(255, 255, 255, 0.05),
        0 0 0 4px #3e2723,
        0 0 0 8px #8d6e63;
    color: #f5f5f0;
    font-family: 'Hiragino Mincho ProN', 'Yu Mincho', serif;
    padding: 60px 70px;
    position: relative;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    min-height: 300px;
}

/* チョークの粉っぽさを表現 */
.into-embed-board::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
        radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 50%);
    pointer-events: none;
    border-radius: inherit;
}

.into-embed-board h3 {
    border-bottom: 4px solid rgba(255, 255, 255, 0.5);
    padding-bottom: 25px;
    margin-bottom: 35px;
    text-align: center;
    color: #fffde7;
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

/* ═══ 書類スタイル ═══ */
.into-embed-document {
    background: linear-gradient(180deg, #fefefe 0%, #f8f6f0 100%);
    border: none;
    border-radius: 4px;
    box-shadow: 
        0 30px 60px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(0, 0, 0, 0.08),
        inset 0 0 0 1px rgba(255, 255, 255, 0.9);
    color: #1a1a1a;
    font-family: 'Hiragino Mincho ProN', 'Yu Mincho', 'Times New Roman', serif;
    padding: 60px 70px;
    position: relative;
    line-height: 2.2;
}

/* 紙の質感 */
.into-embed-document::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
        repeating-linear-gradient(
            0deg,
            transparent,
            transparent 31px,
            rgba(0, 0, 0, 0.02) 31px,
            rgba(0, 0, 0, 0.02) 32px
        );
    pointer-events: none;
}

/* 左側の赤いマージン線 */
.into-embed-document::after {
    content: '';
    position: absolute;
    top: 40px;
    bottom: 40px;
    left: 55px;
    width: 2px;
    background: rgba(220, 50, 50, 0.25);
}

.into-embed-document h3 {
    text-align: center;
    border-bottom: 3px double #334155;
    padding-bottom: 20px;
    margin-bottom: 40px;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 0.15em;
}

/* ═══ メモスタイル ═══ */
.into-embed-memo {
    background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
    border: none;
    border-radius: 2px;
    box-shadow: 
        4px 8px 25px rgba(0, 0, 0, 0.25),
        -2px 0 10px rgba(0, 0, 0, 0.05);
    color: #374151;
    padding: 45px 50px 45px 60px;
    font-family: 'Yu Gothic', 'Meiryo', sans-serif;
    line-height: 2.4rem;
    transform: rotate(-0.5deg);
    position: relative;
}

/* 付箋のめくれ効果 */
.into-embed-memo::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(315deg, #f5f5dc 50%, transparent 50%);
    box-shadow: -3px -3px 8px rgba(0, 0, 0, 0.1);
}

/* ═══ 共通コンテンツスタイル ═══ */
.into-embed-content {
    white-space: pre-wrap;
    font-size: 1.6rem;
    line-height: 2.2;
}

.into-embed-description {
    font-size: 1.2rem;
    opacity: 0.85;
    margin-bottom: 35px;
    text-align: center;
    font-style: italic;
    padding-bottom: 25px;
    border-bottom: 2px dashed currentColor;
}

/* ═══ 閉じるヒント ═══ */
.into-embed-overlay::after {
    content: 'クリックで続ける ▼';
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
    font-weight: 500;
    padding: 10px 24px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 30px;
    animation: embedHintPulse 2s ease-in-out infinite;
}

/* ═══ アニメーション ═══ */
@keyframes embedFadeIn {
    from { 
        opacity: 0;
        backdrop-filter: blur(0px);
    }
    to { 
        opacity: 1;
        backdrop-filter: blur(8px);
    }
}

@keyframes embedSlideUp {
    from { 
        opacity: 0;
        transform: translateY(30px) scale(0.96);
    }
    to { 
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes embedHintPulse {
    0%, 100% { opacity: 0.8; transform: translateX(-50%) translateY(0); }
    50% { opacity: 1; transform: translateX(-50%) translateY(-5px); }
}

/* ═══ スマホ対応 ═══ */
@media (max-width: 768px) {
    .into-embed-overlay {
        padding: 20px 10px;
    }
    .into-embed-overlay > div {
        width: 100%;
        max-height: 90vh;
    }
    .into-embed-board, .into-embed-document {
        padding: 30px 25px;
    }
    .into-embed-board h3, .into-embed-document h3 {
        font-size: 1.4rem;
    }
    .into-embed-content {
        font-size: 1.1rem;
    }
    .into-embed-memo {
        padding: 25px 30px 25px 40px;
        transform: none;
    }
    .into-embed-document::after {
        left: 25px;
    }
}
</style>
`;

// ═══════════════════════════════════════════════════════════════════════════
// ユーティリティ関数
// ═══════════════════════════════════════════════════════════════════════════

/**
 * キャラクター情報を取得
 */
function getCharacterInfo(speakerName) {
    const char = characters.find(c =>
        c.name === speakerName ||
        (c.aliases && c.aliases.includes(speakerName))
    );
    return char || null;
}

/**
 * キャラクター画像パスを取得
 */
function getCharacterImagePath(baseName, expression = 'normal') {
    // 表情のバリエーションを試す
    const expressionVariants = [expression, 'normal'];
    for (const expr of expressionVariants) {
        const path = `/images/${baseName}_${expr}.png`;
        return path;
    }
    return `/images/${baseName}_normal.png`;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * テキスト内の特殊記法を処理してインタラクティブ要素に変換
 * {{空欄テキスト}} → 空欄ボタン
 * 【民法XX条】 → 条文ボタン
 * 【id:XX】 → Q&Aボタン（新形式対応）
 *   - 【id:14】→ モジュールのcategory/subcategory内のQ&A #14
 *   - 【id:5.10】→ モジュールのcategory、サブカテゴリー5のQ&A #10
 *   - 【id:民法.5.11】→ 民法カテゴリー、サブカテゴリー5のQ&A #11
 */
function processInteractiveText(text, withAnimation = false) {
    // アニメーション用クラス
    const animClass = withAnimation ? 'into-interactive' : '';

    // Q&Aのプレースホルダー処理 (HTMLエスケープ前に実施、干渉を回避)
    const qaButtons = [];

    const categoryRaw = INTO.caseData?.category || window.currentCaseData?.category;
    const subcategoryRaw = INTO.caseData?.subcategory || window.currentCaseData?.subcategory;
    const moduleCategory = categoryRaw ? String(categoryRaw) : '';
    const moduleSubcategory = subcategoryRaw ? String(subcategoryRaw) : '';

    // パターン1: 完全指定
    text = text.replace(/[【\[][iｉＩ].*?[dｄＤ][^.0-9]*([^.0-9]+)\.([^.]+)\.([0-9]+)[】\]\}]/g, (match, category, subcategory, qaNum) => {
        const fullRef = `${category}.${subcategory}.${qaNum}`;
        const placeholder = `__QA_BTN_${qaButtons.length}__`;
        const html = `<span class="into-qa-btn ${animClass}" data-qa-ref="${fullRef}" data-category="${category}" data-subcategory="${subcategory}" data-qa-num="${qaNum}">Q${qaNum}</span>`;
        qaButtons.push({ placeholder, html });
        return placeholder;
    });

    // パターン2: カテゴリ省略
    text = text.replace(/[【\[][iｉＩ].*?[dｄＤ][^.0-9]*([0-9]+)\.([0-9]+)[】\]\}]/g, (match, subcategory, qaNum) => {
        const cat = moduleCategory || 'unknown';
        const fullRef = `${cat}.${subcategory}.${qaNum}`;
        const placeholder = `__QA_BTN_${qaButtons.length}__`;
        const html = `<span class="into-qa-btn ${animClass}" data-qa-ref="${fullRef}" data-category="${cat}" data-subcategory="${subcategory}" data-qa-num="${qaNum}">Q${qaNum}</span>`;
        qaButtons.push({ placeholder, html });
        return placeholder;
    });

    // パターン3: 番号のみ (最も広範なマッチ)
    text = text.replace(/[【\[][iｉＩ].*?[dｄＤ][^0-9]*([0-9]+)[】\]\}]/g, (match, qaNum) => {
        const cat = moduleCategory || 'unknown';
        const sub = moduleSubcategory || 'unknown';
        const fullRef = `${cat}.${sub}.${qaNum}`;
        const placeholder = `__QA_BTN_${qaButtons.length}__`;
        const html = `<span class="into-qa-btn ${animClass}" data-qa-ref="${fullRef}" data-category="${cat}" data-subcategory="${sub}" data-qa-num="${qaNum}">Q${qaNum}</span>`;
        qaButtons.push({ placeholder, html });
        return placeholder;
    });

    // ここでHTMLエスケープ
    let processed = escapeHtml(text);

    // Q&Aボタンを復元
    qaButtons.forEach(btn => {
        processed = processed.replace(btn.placeholder, btn.html);
    });

    // 空欄処理: {{テキスト}} → 空欄ボタン
    processed = processed.replace(/\{\{(.+?)\}\}/g, (match, content) => {
        const id = `blank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // contentはエスケープ済みなので、さらにエスケープしないように注意（元のロジックに合わせるが、二重エスケープ回避）
        return `<span class="into-blank ${animClass}" data-blank-id="${id}" data-answer="${content}">???</span>`;
    });

    // 条文処理: 【民法XX条】...
    processed = processed.replace(/【([^【】]+?(?:法|規則|令)\d+条(?:の\d+)?(?:第?\d+項)?(?:第?\d+号)?(?:前段|後段|本文|ただし書|但書)?)】/g, (match, article) => {
        return `<span class="into-article-btn ${animClass}" data-article="${article}">${article}</span>`;
    });

    // [center]タグ処理: [center]テキスト[/center] → 中央揃え
    processed = processed.replace(/\[center\]([\s\S]*?)\[\/center\]/g, (match, content) => {
        return `<div style="text-align: center; width: 100%;">${content}</div>`;
    });

    return processed;
}

/**
 * インタラクティブ要素を表示（アニメーション付き）
 */
function animateInteractiveElements() {
    const elements = document.querySelectorAll('.into-interactive');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('appear');
        }, index * 100); // 100msずつずらして表示
    });
}

/**
 * 空欄を表示
 */
function revealBlank(element) {
    if (element.classList.contains('revealed')) return;

    const answer = element.dataset.answer;
    element.textContent = answer;
    element.classList.add('revealed');
}

/**
 * 保存されたcheck状態に基づいて空欄を開示・チェック状態にする
 * @param {string} checkStr - check属性の値（例: "1,0,1"）
 */
function restoreSavedBlankStates(checkStr) {
    if (!checkStr) return;

    const checkArray = checkStr.split(',').map(c => c.trim() === '1' ? 1 : 0);
    const blanks = document.querySelectorAll('.into-blank');

    blanks.forEach((blank, index) => {
        if (checkArray[index] === 1) {
            // 保存済み：開示状態＋チェックマーク
            const answer = blank.dataset.answer;
            blank.textContent = answer;
            blank.classList.add('revealed', 'checked');
        }
    });

    console.log(`🔄 空欄状態を復元: ${checkArray.filter(c => c === 1).length}/${blanks.length}個がチェック済み`);
}

/**
 * 空欄の右クリック処理（チェック状態を保存）
 * @param {HTMLElement} element - 空欄要素
 */
async function handleBlankRightClick(element) {
    const blankId = element.dataset.blankId;
    if (!blankId) return;

    // 現在のストーリーインデックスを取得
    const storyIndex = INTO.index;

    // 対応するストーリー項目を探す（embed以外も含む）
    const storyItem = INTO.story[storyIndex];
    if (!storyItem) return;

    // 空欄の番号を計算（blankIdからユニーク部分を使用）
    // blankIdは "blank-{timestamp}-{random}" 形式だが、ストーリー内の位置で管理
    const allBlanks = document.querySelectorAll('.into-blank');
    let blankIndex = -1;
    allBlanks.forEach((blank, idx) => {
        if (blank.dataset.blankId === blankId) {
            blankIndex = idx;
        }
    });

    if (blankIndex < 0) return;

    // チェック状態をトグル
    const isCurrentlyChecked = element.classList.contains('checked');
    const newCheckedState = !isCurrentlyChecked;

    // ビジュアル更新
    if (newCheckedState) {
        element.classList.add('checked');
        // 答えを表示（まだならば）
        if (!element.classList.contains('revealed')) {
            element.textContent = element.dataset.answer;
            element.classList.add('revealed');
        }
    } else {
        element.classList.remove('checked');
    }

    // ストーリーデータにチェック状態を保存
    if (!storyItem.check) {
        storyItem.check = '';
    }
    const checkArray = storyItem.check.split(',').map(c => c.trim() === '1' ? 1 : 0);
    while (checkArray.length <= blankIndex) {
        checkArray.push(0);
    }
    checkArray[blankIndex] = newCheckedState ? 1 : 0;
    storyItem.check = checkArray.join(',');

    // window.currentCaseDataにも反映
    if (window.currentCaseData?.story?.[storyIndex]) {
        window.currentCaseData.story[storyIndex].check = storyItem.check;
    }

    // LocalStorageに保存
    try {
        const caseId = INTO.caseData?.id || window.currentCaseData?.id;
        if (caseId) {
            const storageKey = `into-blank-checks-${caseId}`;
            const allChecks = {};

            // 全ストーリーのcheck状態を収集
            INTO.story.forEach((item, idx) => {
                if (item.check) {
                    allChecks[idx] = item.check;
                }
            });

            localStorage.setItem(storageKey, JSON.stringify(allChecks));
            console.log(`✅ INTOモード: 空欄チェック保存完了 (localStorage) index=${storyIndex}, blank=${blankIndex}, checked=${newCheckedState}`);
        }
    } catch (error) {
        console.error('空欄チェック保存エラー:', error);
    }
}

/**
 * 条文パネルを表示（既存のshowArticlePanelWithPresetを使用）
 */
function showIntoArticle(element) {
    const articleRef = element.dataset.article;

    // 条文参照文字列をパース（例: "民法177条" → lawName="民法", articleRef="177条"）
    const match = articleRef.match(/^(.+?(?:法|規則|令))(\d+条.*)$/);
    if (match && window.showArticlePanelWithPreset) {
        const lawName = match[1];
        const articleNum = match[2];
        window.showArticlePanelWithPreset(lawName, articleNum);
    } else {
        console.error('条文参照のパースに失敗:', articleRef);
    }
}

/**
 * Q&Aポップアップを表示（既存のshowQAPopupを使用）
 * 新旧両形式に対応:
 * - 旧形式: data-qa-id + questionsAndAnswers配列
 * - 新形式: data-qa-ref (例: "民法.3-1") + qaLoader経由
 */
async function showIntoQA(element) {
    // 新形式: data-qa-ref がある場合
    const qaRef = element.dataset.qaRef;
    if (qaRef) {
        console.log(`🔍 Q&Aポップアップ（新形式）: ${qaRef}`);

        if (window.qaLoader && window.qaLoader.getQA) {
            try {
                const qa = await window.qaLoader.getQA(qaRef);
                if (qa && window.showQAPopupWithData) {
                    // 新形式用のポップアップ表示
                    window.showQAPopupWithData({
                        id: qa.id,
                        fullId: qa.fullId,
                        subject: qa.subject,
                        rank: qa.rank,
                        question: qa.question,
                        answer: qa.answer
                    });
                } else if (qa) {
                    // フォールバック: 既存のshowQAPopupを使用
                    // 一時的に window.tempQAData に格納して参照
                    window.tempQAData = qa;
                    if (window.showQAPopup) {
                        window.showQAPopup(0, `Q${qa.id}`, 'into-new', '0');
                    } else {
                        // 簡易表示
                        alert(`Q: ${qa.question}\n\nA: ${qa.answer}`);
                    }
                } else {
                    console.error(`Q&A ${qaRef} が見つかりません`);
                }
            } catch (error) {
                console.error('Q&A取得エラー:', error);
            }
        } else {
            console.error('qaLoaderが利用できません');
        }
        return;
    }

    // 旧形式: data-qa-id がある場合
    const qaIdAttr = element.dataset.qaId || element.dataset.qNumber;
    const qaId = parseInt(qaIdAttr);

    // caseDataからQ&Aのインデックスを探す
    const qaList = INTO.caseData?.questionsAndAnswers || [];
    const qaIndex = qaList.findIndex(q => q.id === qaId);

    if (qaIndex >= 0 && window.showQAPopup) {
        // 既存のshowQAPopup関数を使用
        // showQAPopup(qaIndex, qNumber, quizIndex, subIndex)
        window.showQAPopup(qaIndex, `Q${qaId}`, 'into', '0');
    } else {
        console.error(`Q&A #${qaId} が見つかりません`);
    }
}

/**
 * 空欄を全て開示/非開示
 */
let blanksRevealed = false;
function toggleRevealAllBlanks() {
    blanksRevealed = !blanksRevealed;
    const blanks = document.querySelectorAll('.into-blank');
    blanks.forEach(blank => {
        if (blanksRevealed) {
            if (!blank.classList.contains('revealed')) {
                blank.textContent = blank.dataset.answer;
                blank.classList.add('revealed');
            }
        } else {
            blank.textContent = '???';
            blank.classList.remove('revealed');
        }
    });

    // ボタンの状態を更新
    const btn = document.getElementById('into-reveal-all-btn');
    if (btn) {
        btn.textContent = blanksRevealed ? '🙈 空欄を隠す' : '👁 空欄全開示';
        btn.classList.toggle('active', blanksRevealed);
    }
}

/**
 * BGMを再生
 * @param {string} path - BGMファイルのパス（例: '1.mp3'）
 */
function playBgm(path) {
    console.log('🎵 BGM再生リクエスト:', path);

    // 既存のBGMを停止（フェードアウトなし、即停止）
    if (INTO.currentBgm) {
        console.log('🎵 既存のBGMを停止');
        INTO.currentBgm.pause();
        INTO.currentBgm.currentTime = 0;
        INTO.currentBgm = null;
    }

    if (!path) {
        console.log('🎵 パスが空のためBGM停止のみ');
        return;
    }

    // 共通BGMフォルダからパスを構築
    const bgmPath = `/sounds/bgm/${path}`;
    console.log('🎵 BGMパス:', bgmPath);

    const audio = new Audio(bgmPath);
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().then(() => {
        console.log('🎵 BGM再生開始:', bgmPath);
    }).catch(err => {
        console.error('🎵 BGM再生に失敗:', bgmPath, err);
    });

    INTO.currentBgm = audio;
}

/**
 * BGMを停止
 */
function stopBgm() {
    if (INTO.currentBgm) {
        INTO.currentBgm.pause();
        INTO.currentBgm = null;
    }
}

/**
 * 背景を設定
 * @param {string} path - 背景画像のパス（例: '1.png'）
 */
function setBackground(path) {
    console.log('🖼️ 背景設定リクエスト:', path);

    const bgEl = document.getElementById('into-bg');
    if (!bgEl) {
        console.error('🖼️ #into-bg要素が見つかりません');
        return;
    }

    if (!path) {
        console.log('🖼️ パスが空のため背景をクリア');
        bgEl.style.backgroundImage = '';
        bgEl.style.backgroundColor = '';
        INTO.currentBackground = null;
        return;
    }

    // 共通背景フォルダからパスを構築
    const bgPath = `/images/background/${path}`;
    console.log('🖼️ 背景パス:', bgPath);

    bgEl.style.backgroundImage = `url('${bgPath}')`;
    bgEl.style.backgroundSize = 'cover';
    bgEl.style.backgroundPosition = 'center';
    bgEl.style.transition = 'background-image 0.5s ease';

    INTO.currentBackground = path;
    console.log('🖼️ 背景設定完了:', bgPath);
}

/**
 * ストーリーから登場キャラクターを抽出
 */
function extractCharactersFromStory(story) {
    const charSet = new Set();
    story.forEach(item => {
        if (item.type === 'dialogue' && item.speaker) {
            charSet.add(item.speaker);
        }
    });
    return Array.from(charSet);
}

/**
 * キャラクターに位置を割り当て
 * 最大5人まで左から順に配置
 */
function assignCharacterPositions(charNames) {
    const positions = ['left', 'centerLeft', 'center', 'centerRight', 'right'];
    const assignments = new Map();

    // 登場順に配置（中央優先）
    const count = Math.min(charNames.length, 5);
    const startIdx = Math.floor((5 - count) / 2);

    charNames.slice(0, 5).forEach((name, i) => {
        assignments.set(name, positions[startIdx + i]);
    });

    return assignments;
}

// ═══════════════════════════════════════════════════════════════════════════
// レンダリング関数
// ═══════════════════════════════════════════════════════════════════════════

/**
 * メインUIをレンダリング
 */
function renderIntoUI() {
    const progress = INTO.story.length > 0 ? ((INTO.index + 1) / INTO.story.length) * 100 : 0;

    return `
        <div class="into-fullscreen" id="into-container">
            <!-- 進捗バー -->
            <div class="into-progress">
                <div class="into-progress-bar" id="into-progress-bar" style="width: ${progress}%"></div>
            </div>
            
            <!-- 背景 -->
            <div class="into-bg" id="into-bg"></div>
            
            <!-- キャラクター表示エリア -->
            <div class="into-character-area" id="into-character-area"></div>

            <!-- 埋め込みコンテンツオーバーレイ -->
            <div class="into-embed-overlay" id="into-embed-overlay"></div>
            
            <!-- クリックエリア -->
            <div class="into-click-area" id="into-click-area"></div>
            
            <!-- UIボタン -->
            <div class="into-ui">
                <button class="into-btn" id="into-reveal-all-btn" title="空欄を全て表示/非表示">👁 空欄全開示</button>
                <button class="into-btn" id="into-history-btn" title="履歴">📜 履歴</button>
                <button class="into-btn" id="into-auto-btn" title="オート">▶ オート</button>
                <button class="into-btn" id="into-skip-btn" title="スキップ">⏩ スキップ</button>
                <button class="into-btn into-btn-close" id="into-close-btn" title="閉じる">✕ 閉じる</button>
            </div>
            
            <!-- テキストボックス -->
            <div class="into-textbox" id="into-textbox">
                <div class="into-speaker" id="into-speaker"></div>
                <div class="into-text-content" id="into-text-content"></div>
                <div class="into-next-indicator" id="into-next-indicator">クリックで次へ</div>
            </div>
        </div>
    `;
}

/**
 * シーン変更オーバーレイを表示
 */
function showSceneOverlay(sceneText) {
    return new Promise(resolve => {
        const container = document.getElementById('into-container');
        if (!container) return resolve();

        const overlay = document.createElement('div');
        overlay.className = 'into-scene-overlay';
        overlay.id = 'into-scene-overlay';
        overlay.style.cursor = 'pointer';
        overlay.innerHTML = `
            <div class="into-scene-text">${escapeHtml(sceneText)}</div>
            <div class="into-scene-line"></div>
            <div style="position:absolute;bottom:30px;color:rgba(255,255,255,0.6);font-size:0.9rem;">クリックでスキップ</div>
        `;
        container.appendChild(overlay);

        // 背景を変更
        const bg = document.getElementById('into-bg');
        if (bg) bg.classList.add('scene-change');

        let resolved = false;
        const cleanup = () => {
            if (resolved) return;
            resolved = true;
            overlay.style.animation = 'fadeIn 0.5s ease reverse';
            setTimeout(() => {
                overlay.remove();
                if (bg) bg.classList.remove('scene-change');
                resolve();
            }, 500);
        };

        // クリックでスキップ
        overlay.addEventListener('click', cleanup);

        // 2秒後に自動で消える
        setTimeout(cleanup, 2000);
    });
}

/**
 * 全キャラクターを表示（複数キャラ対応）
 * currentSpeaker が発言中のキャラ（前面＋アニメーション）
 */
function showAllCharacters(currentSpeaker = null, currentExpression = 'normal') {
    const area = document.getElementById('into-character-area');
    if (!area) return;

    area.innerHTML = '';

    // 表示すべきキャラクターがいない場合
    if (INTO.activeCharacters.size === 0) return;

    // 各キャラクターを配置
    INTO.activeCharacters.forEach((data, speakerName) => {
        const { charInfo, position } = data;
        if (!charInfo || !charInfo.baseName) return;

        const isSpeaking = speakerName === currentSpeaker;
        const expression = isSpeaking ? currentExpression : (data.expression || 'normal');

        // スロットコンテナ
        const slot = document.createElement('div');
        slot.className = `into-char-slot position-${position}`;
        slot.style.zIndex = isSpeaking ? 100 : CHAR_POSITIONS[position]?.zIndex || 1;

        // キャラクター画像
        const img = document.createElement('img');
        img.className = `into-character ${isSpeaking ? 'speaking' : 'inactive'}`;
        img.src = getCharacterImagePath(charInfo.baseName, expression);
        img.alt = charInfo.name;
        img.onerror = () => {
            img.src = getCharacterImagePath(charInfo.baseName, 'normal');
            img.onerror = () => slot.remove();
        };

        slot.appendChild(img);
        area.appendChild(slot);
    });
}

/**
 * 現在のシーンに登場するキャラクターを更新
 * @param {string} speakerName - 発言者名
 * @param {string} expression - 表情
 * @param {string|number|null} side - 'left', 'right', 'center' 等、または 0=左, 1=右
 */
function updateActiveCharacters(speakerName, expression = 'normal', side = null) {
    if (!speakerName) return;

    const charInfo = getCharacterInfo(speakerName);
    if (!charInfo) return;

    // sideの正規化
    let targetPosition = null;
    if (side !== null && side !== undefined) {
        if (side === 0) targetPosition = 'left';
        else if (side === 1) targetPosition = 'right';
        else if (typeof side === 'string' && CHAR_POSITIONS[side]) targetPosition = side;
    }

    // まだ登録されていないキャラの場合、位置を割り当て
    if (!INTO.activeCharacters.has(speakerName)) {
        let position = targetPosition;

        if (!position) {
            // 使用されていない位置を探す
            const usedPositions = new Set(
                Array.from(INTO.activeCharacters.values()).map(d => d.position)
            );
            const positions = ['center', 'centerLeft', 'centerRight', 'left', 'right'];
            position = positions.find(p => !usedPositions.has(p)) || 'center';
        }

        INTO.activeCharacters.set(speakerName, {
            charInfo,
            position,
            expression: 'normal',
            side: side
        });
    } else {
        // 既存キャラの更新
        const data = INTO.activeCharacters.get(speakerName);

        // sideが明示的に指定された場合、位置を更新（アニメーション移動）
        if (targetPosition && data.position !== targetPosition) {
            data.position = targetPosition;
            data.side = side;
        }

        // 表情更新
        data.expression = expression;
    }
}

/**
 * テキストをタイプライター効果で表示（インタラクティブ要素対応）
 * レイアウトずれを防ぐため、最初から最終的なHTMLを配置し、テキストのみをタイプライター表示
 */
function typeText(text, callback, useInteractive = true) {
    const content = document.getElementById('into-text-content');
    const indicator = document.getElementById('into-next-indicator');
    if (!content) return;

    INTO.isTyping = true;
    INTO.skipTyping = false;
    INTO.currentText = text;

    if (indicator) indicator.style.display = 'none';

    // 最初から最終的なHTMLを配置（インタラクティブ要素は非表示状態）
    const finalHtml = useInteractive ? processInteractiveText(text, true) : escapeHtml(text);
    content.innerHTML = finalHtml + '<span class="into-cursor"></span>';

    // テキストノードを収集（タイプライター対象）
    const textNodes = [];
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim() && !node.parentElement.classList.contains('into-cursor')) {
            textNodes.push({
                node: node,
                fullText: node.textContent,
                currentLength: 0
            });
        }
    }

    // 全テキストを非表示にする
    textNodes.forEach(item => {
        item.node.textContent = '';
    });

    let currentNodeIndex = 0;
    let totalCharsTyped = 0;

    function typeNext() {
        if (INTO.skipTyping) {
            // スキップ時は全テキストを表示
            textNodes.forEach(item => {
                item.node.textContent = item.fullText;
            });
            finishTyping();
            return;
        }

        if (currentNodeIndex >= textNodes.length) {
            finishTyping();
            return;
        }

        const currentItem = textNodes[currentNodeIndex];
        currentItem.currentLength++;
        currentItem.node.textContent = currentItem.fullText.substring(0, currentItem.currentLength);

        if (currentItem.currentLength >= currentItem.fullText.length) {
            currentNodeIndex++;
        }

        INTO.typingTimer = setTimeout(typeNext, INTO.textSpeed);
    }

    function finishTyping() {
        // カーソルを削除
        const cursor = content.querySelector('.into-cursor');
        if (cursor) cursor.remove();

        INTO.isTyping = false;
        if (indicator) indicator.style.display = 'flex';

        // インタラクティブ要素をアニメーション表示
        setTimeout(() => {
            animateInteractiveElements();
        }, 50);

        if (callback) callback();
    }

    typeNext();
}

/**
 * 現在のストーリー項目を表示
 */
async function displayCurrentItem() {
    if (INTO.index >= INTO.story.length) {
        // ストーリー終了
        endIntoMode();
        return;
    }

    const item = INTO.story[INTO.index];
    const speakerEl = document.getElementById('into-speaker');
    const contentEl = document.getElementById('into-text-content');
    const progressBar = document.getElementById('into-progress-bar');

    // 埋め込みオーバーレイをリセット（全てのタイプで実行）
    const embedOverlay = document.getElementById('into-embed-overlay');
    if (embedOverlay && embedOverlay.classList.contains('active')) {
        embedOverlay.classList.remove('active');
        embedOverlay.innerHTML = '';
        // セリフ欄を再表示（埋め込みで非表示にしていた場合）
        if (speakerEl) speakerEl.style.display = 'block';
    }

    if (!speakerEl || !contentEl) return;

    // 進捗バー更新
    if (progressBar) {
        const progress = ((INTO.index + 1) / INTO.story.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // 履歴に追加
    INTO.history.push(item);

    // ═══ BGM処理 ═══
    if (item.type === 'bgm') {
        playBgm(item.path);
        advanceStory();
        return;
    }

    // ═══ 背景処理 ═══
    if (item.type === 'background') {
        setBackground(item.path);
        advanceStory();
        return;
    }

    if (item.type === 'scene') {
        // シーン変更 → キャラクターをクリア
        speakerEl.textContent = '';
        speakerEl.style.display = 'none';
        contentEl.innerHTML = '';
        INTO.activeCharacters.clear();
        showAllCharacters(null);
        await showSceneOverlay(item.text);
        advanceStory();
        return;
    }

    if (item.type === 'narration') {
        // ナレーション
        speakerEl.textContent = 'ナレーション';
        speakerEl.style.display = 'block';
        speakerEl.className = 'into-speaker narration';
        contentEl.className = 'into-text-content narration';
        // 全キャラクターを暗くする（発言者なし）
        showAllCharacters(null);
        typeText(item.text, () => {
            // 保存された空欄状態を復元
            restoreSavedBlankStates(item.check);
            if (INTO.autoMode) scheduleAutoAdvance();
        });
        return;
    }

    if (item.type === 'dialogue') {
        // セリフ
        speakerEl.textContent = item.speaker;
        speakerEl.style.display = 'block';
        speakerEl.className = 'into-speaker';
        contentEl.className = 'into-text-content';

        // キャラクター登録・更新（side指定対応）
        const side = item.side !== undefined ? item.side : null;
        updateActiveCharacters(item.speaker, item.expression || 'normal', side);

        // 全キャラクター表示（発言者を前面＋アニメーション）
        showAllCharacters(item.speaker, item.expression || 'normal');

        // テキスト表示
        typeText(item.dialogue, () => {
            // 保存された空欄状態を復元
            restoreSavedBlankStates(item.check);
            if (INTO.autoMode) scheduleAutoAdvance();
        });
        return;
    }

    if (item.type === 'embed') {
        // 埋め込みコンテンツ（ボード、ドキュメントなど）
        // セリフ欄は非表示/空にする
        speakerEl.style.display = 'none';
        contentEl.innerHTML = '';

        if (embedOverlay) {
            const format = item.format || 'board';
            let styleClass = 'into-embed-board'; // デフォルトは黒板
            if (format === 'document') styleClass = 'into-embed-document';
            else if (format === 'memo') styleClass = 'into-embed-memo';

            // コンテンツ構築
            const titleHtml = item.title ? `<h3>${escapeHtml(item.title)}</h3>` : '';
            const descHtml = item.description ? `<div class="into-embed-description">${escapeHtml(item.description)}</div>` : '';
            // インタラクティブテキスト処理 (Q&Aボタンなど有効)
            const contentHtml = `<div class="into-embed-content">${processInteractiveText(item.content || '')}</div>`;

            embedOverlay.innerHTML = `
                <div class="${styleClass}">
                    ${titleHtml}
                    ${descHtml}
                    ${contentHtml}
                </div>
            `;

            // 表示
            embedOverlay.classList.add('active');

            // インタラクティブ要素のアニメーション
            setTimeout(animateInteractiveElements, 100);

            // 保存された空欄状態を復元
            setTimeout(() => restoreSavedBlankStates(item.check), 150);
        }

        INTO.isTyping = false;

        const indicator = document.getElementById('into-next-indicator');
        if (indicator) indicator.style.display = 'flex'; // 次へ進むアイコンを表示

        if (INTO.autoMode) scheduleAutoAdvance();
        return;
    }
}

/**
 * ストーリーを進める
 */
function advanceStory() {
    if (INTO.isTyping) {
        // タイピング中ならスキップ
        INTO.skipTyping = true;
        return;
    }

    INTO.index++;
    displayCurrentItem();
}

/**
 * オート進行をスケジュール
 */
function scheduleAutoAdvance() {
    if (!INTO.autoMode) return;

    clearTimeout(INTO.autoTimer);
    INTO.autoTimer = setTimeout(() => {
        if (INTO.autoMode && !INTO.isTyping) {
            advanceStory();
        }
    }, 2500);
}

/**
 * 履歴モーダルを表示
 */
function showHistoryModal() {
    const container = document.getElementById('into-container');
    if (!container) return;

    const historyHtml = INTO.history.map(item => {
        let speaker = 'ナレーション';
        let text = item.text || '';

        if (item.type === 'dialogue') {
            speaker = item.speaker;
            text = item.dialogue;
        } else if (item.type === 'scene') {
            speaker = '📍 シーン';
            text = item.text;
        }

        return `
            <div class="into-history-item">
                <div class="into-history-speaker">${escapeHtml(speaker)}</div>
                <div class="into-history-text">${escapeHtml(text)}</div>
            </div>
        `;
    }).join('');

    const modal = document.createElement('div');
    modal.className = 'into-history-modal';
    modal.id = 'into-history-modal';
    modal.innerHTML = `
        <div class="into-history-header">
            <div class="into-history-title">📜 バックログ</div>
            <button class="into-btn" id="into-history-close">閉じる</button>
        </div>
        <div class="into-history-content">
            ${historyHtml || '<div style="color:#94a3b8;text-align:center;padding:40px;">履歴がありません</div>'}
        </div>
    `;
    container.appendChild(modal);

    document.getElementById('into-history-close').addEventListener('click', () => {
        modal.remove();
    });
}

/**
 * スキップモード（全テキストを即座に表示しながら高速進行）
 */
function startSkipMode() {
    if (INTO.index >= INTO.story.length) return;

    // 現在のタイピングをスキップ
    INTO.skipTyping = true;

    // 高速で進行
    const skipInterval = setInterval(() => {
        if (INTO.index >= INTO.story.length - 1) {
            clearInterval(skipInterval);
            return;
        }
        INTO.index++;
        const item = INTO.story[INTO.index];
        INTO.history.push(item);

        // 進捗バー更新
        const progressBar = document.getElementById('into-progress-bar');
        if (progressBar) {
            const progress = ((INTO.index + 1) / INTO.story.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }, 100);

    // 3秒後に停止して現在位置を表示
    setTimeout(() => {
        clearInterval(skipInterval);
        displayCurrentItem();
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════════════════
// 公開API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * INTOモードを開始
 */
export function startIntoMode(caseData) {
    if (!caseData || !caseData.story || caseData.story.length === 0) {
        alert('このモジュールにはストーリーがありません。');
        return;
    }

    // スタイル挿入
    if (!document.getElementById('into-styles')) {
        document.head.insertAdjacentHTML('beforeend', INTO_STYLES);
    }

    // 状態初期化
    INTO.story = caseData.story;
    INTO.index = 0;
    INTO.autoMode = false;
    INTO.history = [];
    INTO.caseData = caseData;
    INTO.phase = 'playing';
    INTO.activeCharacters = new Map();  // キャラクター管理をリセット
    INTO.speakerHistory = [];
    blanksRevealed = false;  // 空欄表示状態をリセット
    stopBgm();  // 既存のBGMを停止
    INTO.currentBackground = null;  // 背景をリセット

    // LocalStorageから保存されたcheck状態を復元
    try {
        const caseId = caseData.id;
        if (caseId) {
            const storageKey = `into-blank-checks-${caseId}`;
            const savedChecks = localStorage.getItem(storageKey);
            if (savedChecks) {
                const checksData = JSON.parse(savedChecks);
                Object.entries(checksData).forEach(([idx, check]) => {
                    const storyIdx = parseInt(idx);
                    if (INTO.story[storyIdx]) {
                        INTO.story[storyIdx].check = check;
                    }
                });
                console.log(`🔄 LocalStorageからcheck状態を復元: ${Object.keys(checksData).length}件`);
            }
        }
    } catch (error) {
        console.error('check状態の復元エラー:', error);
    }

    // スクロール禁止
    document.body.style.overflow = 'hidden';

    // UI生成
    const container = document.createElement('div');
    container.innerHTML = renderIntoUI();
    document.body.appendChild(container.firstElementChild);

    // イベントリスナー設定
    setupEventListeners();

    // 最初のアイテムを表示
    displayCurrentItem();
}

/**
 * INTOモードを終了
 */
export function endIntoMode() {
    INTO.phase = 'idle';
    clearTimeout(INTO.autoTimer);
    clearTimeout(INTO.typingTimer);

    // BGMを停止
    stopBgm();

    const container = document.getElementById('into-container');
    if (container) {
        container.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => container.remove(), 300);
    }

    document.body.style.overflow = '';
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // ═══ 最優先：インタラクティブボタンのクリック処理（キャプチャフェーズ）═══
    // document.bodyでキャプチャフェーズで処理し、他のイベントより先に発火させる
    document.body.addEventListener('click', (e) => {
        const target = e.target;

        // 空欄ボタン
        if (target.classList && target.classList.contains('into-blank')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (!target.classList.contains('revealed')) {
                revealBlank(target);
            }
            return false;
        }

        // 条文ボタン
        if (target.classList && target.classList.contains('into-article-btn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showIntoArticle(target);
            return false;
        }

        // Q&Aボタン（旧形式: into-qa-btn, 新形式: qa-ref-btn, qa-ref-new）
        if (target.classList && (target.classList.contains('into-qa-btn') ||
            target.classList.contains('qa-ref-btn') || target.classList.contains('qa-ref-new'))) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showIntoQA(target);
            return false;
        }
    }, true); // true = キャプチャフェーズ

    // ═══ 空欄の右クリック処理（キャプチャフェーズ）═══
    document.body.addEventListener('contextmenu', (e) => {
        const target = e.target;

        // INTOモード内の空欄のみ処理
        if (target.classList && target.classList.contains('into-blank')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            handleBlankRightClick(target);
            return false;
        }
    }, true); // true = キャプチャフェーズ


    // クリックエリア（キャラクター背景部分）
    const clickArea = document.getElementById('into-click-area');
    if (clickArea) {
        clickArea.addEventListener('click', advanceStory);
    }

    // 埋め込みオーバーレイのクリック処理（黒板・書類などをクリックで進む）
    const embedOverlay = document.getElementById('into-embed-overlay');
    if (embedOverlay) {
        embedOverlay.addEventListener('click', (e) => {
            // インタラクティブ要素（空欄、条文、Q&A）のクリックは無視
            if (e.target.classList.contains('into-blank') ||
                e.target.classList.contains('into-article-btn') ||
                e.target.classList.contains('into-qa-btn') ||
                e.target.classList.contains('qa-ref-btn') ||
                e.target.classList.contains('qa-ref-new')) {
                return;
            }
            advanceStory();
        });
    }

    // テキストコンテンツ内のクリック処理（ボタン以外）
    const textContent = document.getElementById('into-text-content');
    if (textContent) {
        textContent.addEventListener('click', (e) => {
            // インタラクティブ要素は上のキャプチャで処理済み
            if (e.target.classList.contains('into-blank') ||
                e.target.classList.contains('into-article-btn') ||
                e.target.classList.contains('into-qa-btn') ||
                e.target.classList.contains('qa-ref-btn') ||
                e.target.classList.contains('qa-ref-new')) {
                return;
            }
            advanceStory();
        });
    }

    // テキストボックス全体（スピーカー名やインジケーター部分）
    const textbox = document.getElementById('into-textbox');
    if (textbox) {
        textbox.addEventListener('click', (e) => {
            // テキストコンテンツ内のクリックは上で処理済み
            if (e.target.closest('#into-text-content')) {
                return;
            }
            advanceStory();
        });
    }

    // 閉じるボタン
    const closeBtn = document.getElementById('into-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (confirm('INTOモードを終了しますか？')) {
                endIntoMode();
            }
        });
    }

    // 空欄全開示ボタン
    const revealAllBtn = document.getElementById('into-reveal-all-btn');
    if (revealAllBtn) {
        revealAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleRevealAllBlanks();
        });
    }

    // オートボタン
    const autoBtn = document.getElementById('into-auto-btn');
    if (autoBtn) {
        autoBtn.addEventListener('click', () => {
            INTO.autoMode = !INTO.autoMode;
            autoBtn.classList.toggle('active', INTO.autoMode);
            autoBtn.textContent = INTO.autoMode ? '⏸ オート中' : '▶ オート';

            if (INTO.autoMode && !INTO.isTyping) {
                scheduleAutoAdvance();
            } else {
                clearTimeout(INTO.autoTimer);
            }
        });
    }

    // スキップボタン
    const skipBtn = document.getElementById('into-skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', startSkipMode);
    }

    // 履歴ボタン
    const historyBtn = document.getElementById('into-history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', showHistoryModal);
    }

    // キーボードショートカット
    const keyHandler = (e) => {
        if (INTO.phase !== 'playing') return;

        // モーダルが開いている場合
        const articleModal = document.getElementById('into-article-modal-active');
        const qaModal = document.getElementById('into-qa-modal-active');
        const historyModal = document.getElementById('into-history-modal');

        if (articleModal || qaModal) {
            if (e.key === 'Escape') {
                if (articleModal) articleModal.remove();
                if (qaModal) qaModal.remove();
            }
            return;
        }

        if (historyModal) {
            if (e.key === 'Escape') historyModal.remove();
            return;
        }

        switch (e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                advanceStory();
                break;
            case 'Escape':
                if (confirm('INTOモードを終了しますか？')) {
                    endIntoMode();
                }
                break;
            case 'a':
            case 'A':
                // オートトグル
                const autoBtn = document.getElementById('into-auto-btn');
                if (autoBtn) autoBtn.click();
                break;
            case 'h':
            case 'H':
                // 履歴表示
                showHistoryModal();
                break;
        }
    };

    document.addEventListener('keydown', keyHandler);

    // クリーンアップ用に保存
    INTO.keyHandler = keyHandler;
}