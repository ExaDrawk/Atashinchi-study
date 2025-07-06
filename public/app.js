// app.js - メインファイル（最軽量版）

import { initializeRouter } from './router.js';
import { setupGlobalEventDelegation } from './eventHandler.js';
import { createArticlePanel, updateLawSelectOptions } from './articlePanel.js';
import { ApiService } from './apiService.js';
import { testArticleDetection, forceProcessArticleButtons } from './articleProcessor.js';

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

console.log('📦 app.js モジュール読み込み完了');
