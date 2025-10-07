// app.js - メインファイル（最軽量版）

import { initializeRouter } from './router.js';
import { setupGlobalEventDelegation } from './eventHandler.js';
import { createArticlePanel, updateLawSelectOptions } from './articlePanel.js';
import { ApiService } from './apiService.js';
import { testArticleDetection, forceProcessArticleButtons } from './articleProcessor.js';
import { startChatSession } from './chatSystem.js'; // チャットシステムをインポート
import './intoMode.js'; // INTOモードを読み込み

// --- グローバル変数の定義 ---
let SUPPORTED_LAWS = [];

async function initializeApp() {
    console.log('🚀 アプリを初期化中...');
    
    try {
        // 0. Faviconを設定
        setFavicon();
        
        // 1. イベントハンドラを設定
        setupGlobalEventDelegation();
        
        // 2. 条文表示パネルを作成
        createArticlePanel();
        
        // 3. 法令名を取得
        SUPPORTED_LAWS = await ApiService.loadSupportedLaws();
        
        // 4. グローバルに設定
        window.SUPPORTED_LAWS = SUPPORTED_LAWS;
        window.startChatSession = startChatSession; // チャットセッション関数をグローバルに登録
        window.handleBlankRightClick = handleBlankRightClick; // 空欄右クリック処理をグローバルに登録
        window.toggleBlankReveal = toggleBlankReveal; // 空欄表示切り替えをグローバルに登録
        
        // 5. 法令selectを更新
        updateLawSelectOptions(SUPPORTED_LAWS);
        
        // 6. ルーターを初期化
        initializeRouter();
        
        console.log('✅ アプリ初期化完了');
        
    } catch (error) {
        console.error('❌ アプリ初期化エラー:', error);
        
        // フォールバック処理
        SUPPORTED_LAWS = ApiService.getFallbackLaws();
        window.SUPPORTED_LAWS = SUPPORTED_LAWS;
        updateLawSelectOptions(SUPPORTED_LAWS);
        initializeRouter();
    }
}

// ★★★ DOMContentLoadedイベントでアプリを初期化 ★★★
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ★★★ デバッグ用のグローバル関数を追加 ★★★
window.testArticleDetection = testArticleDetection;
window.forceProcessArticleButtons = forceProcessArticleButtons;
window.debugArticleButtons = function() {
    console.log('🔍 現在の条文ボタン:');
    const buttons = document.querySelectorAll('.article-ref-btn');
    buttons.forEach((btn, index) => {
        console.log(`ボタン ${index + 1}:`, btn.textContent, btn.dataset);
    });
    
    if (buttons.length === 0) {
        console.warn('⚠️ 条文ボタンが見つかりません');
        console.log('🔄 強制再処理を実行してください: forceProcessArticleButtons()');
    }
};

// ★★★ グローバルエクスポート（必要に応じて） ★★★
window.SUPPORTED_LAWS = SUPPORTED_LAWS;

// ★★★ Favicon設定関数 ★★★
function setFavicon() {
    // 既存のfaviconリンクを削除
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach(link => link.remove());
    
    // 新しいfaviconリンクを作成
    const faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/x-icon';
    faviconLink.href = `/yuzu.ico?v=${Date.now()}`; // キャッシュバスター
    
    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = 'image/x-icon';
    shortcutLink.href = `/yuzu.ico?v=${Date.now()}`;
    
    // headに追加
    document.head.appendChild(faviconLink);
    document.head.appendChild(shortcutLink);
    
    console.log('🎯 Faviconを動的に設定しました');
}

// 初期化処理の後にFaviconを設定
setFavicon();

// ★★★ 空欄処理関数群 ★★★

/**
 * 空欄の右クリック処理（チェック切り替え）
 * @param {Event} event - 右クリックイベント
 * @param {HTMLElement} blankElement - 空欄要素
 */
function handleBlankRightClick(event, blankElement) {
    event.preventDefault(); // コンテキストメニューを無効化
    
    const qaId = parseInt(blankElement.dataset.qaId);
    const blankIndex = parseInt(blankElement.dataset.blankIndex);
    const isChecked = blankElement.dataset.isChecked === 'true';
    
    console.log(`🖱️ 空欄右クリック: Q${qaId}[${blankIndex}] (現在: ${isChecked ? 'チェック済み' : '未チェック'})`);
    
    if (!window.qaStatusSystem) {
        console.error('❌ qaStatusSystemが見つかりません');
        return;
    }
    
    // チェック状態を切り替え
    const newChecked = !isChecked;
    window.qaStatusSystem.updateBlankCheckStatus(qaId, blankIndex, newChecked);
    
    // UI更新
    updateBlankCheckUI(blankElement, newChecked);
}

/**
 * 空欄の表示切り替え（左クリック）
 * @param {HTMLElement} blankElement - 空欄要素
 */
function toggleBlankReveal(blankElement) {
    const isRevealed = blankElement.dataset.isRevealed === 'true';
    const answer = blankElement.dataset.answer;
    const displayContent = blankElement.dataset.displayContent;
    
    if (isRevealed) {
        // 隠す
        const answerLength = Math.max(4, Math.floor(answer.length * 0.9));
        const underscores = '＿'.repeat(answerLength);
        blankElement.innerHTML = underscores;
        blankElement.dataset.isRevealed = 'false';
        blankElement.title = "左クリック: 答えを表示 | 右クリック: チェック切り替え";
    } else {
        // 表示
        blankElement.innerHTML = displayContent;
        blankElement.dataset.isRevealed = 'true';
        const isChecked = blankElement.dataset.isChecked === 'true';
        blankElement.title = isChecked ? 
            "左クリック: 隠す | 右クリック: チェック解除" : 
            "左クリック: 隠す | 右クリック: チェック追加";
    }
}

/**
 * 空欄のチェック状態UIを更新
 * @param {HTMLElement} blankElement - 空欄要素
 * @param {boolean} isChecked - チェック状態
 */
function updateBlankCheckUI(blankElement, isChecked) {
    blankElement.dataset.isChecked = isChecked.toString();
    
    if (isChecked) {
        // チェック済み: 緑色にして自動的に開く
        blankElement.classList.add('blank-checked');
        blankElement.style.backgroundColor = '#d4edda';
        blankElement.style.borderColor = '#28a745';
        
        // 自動的に答えを表示
        const displayContent = blankElement.dataset.displayContent;
        blankElement.innerHTML = displayContent;
        blankElement.dataset.isRevealed = 'true';
        blankElement.title = "左クリック: 隠す | 右クリック: チェック解除";
        
        console.log(`✅ 空欄チェック済みマーク追加`);
    } else {
        // 未チェック: 元の色に戻して隠す
        blankElement.classList.remove('blank-checked');
        blankElement.style.backgroundColor = '';
        blankElement.style.borderColor = '';
        
        // 自動的に隠す
        const answer = blankElement.dataset.answer;
        const answerLength = Math.max(4, Math.floor(answer.length * 0.9));
        const underscores = '＿'.repeat(answerLength);
        blankElement.innerHTML = underscores;
        blankElement.dataset.isRevealed = 'false';
        blankElement.title = "左クリック: 答えを表示 | 右クリック: チェック切り替え";
        
        console.log(`❌ 空欄チェック解除`);
    }
}

console.log('📦 app.js モジュール読み込み完了');
