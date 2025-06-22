// eventHandler.js - イベント処理専用モジュール

import { showArticlePanel } from './articlePanel.js';
import { startChatSession, sendFollowUpMessage } from './chatSystem.js';
import { loadAndRenderCase } from './pages/casePage.js';
import { renderHome } from './pages/homePage.js';
import { renderTabContent } from './pages/casePage.js';

let globalEventListenersAttached = false;

export function setupGlobalEventDelegation() {
    if (globalEventListenersAttached) return;
    console.log('グローバルイベントデリゲーションを設定中...');
    
    document.addEventListener('click', handleGlobalClick);
    
    globalEventListenersAttached = true;
    console.log('✅ グローバルイベントデリゲーション設定完了');
}

function handleGlobalClick(event) {
    // ★★★ 条文表示ボタンの処理 ★★★
    if (event.target.closest('.show-article-btn')) {
        event.preventDefault();
        showArticlePanel();
        return;
    }
    
    // ★★★ 対話開始ボタンの処理を委任方式で捕捉 ★★★
    const startChatBtn = event.target.closest('.start-chat-btn');
    if (startChatBtn) {
        console.log('✅ 対話開始ボタンを検出（イベント委任）');
        event.preventDefault();
        event.stopPropagation();
        startChatSession(startChatBtn, window.currentCaseData);
        return;
    }

    // ★★★ 追加質問ボタンの処理も委任方式で捕捉 ★★★
    const sendFollowUpBtn = event.target.closest('[id^="send-follow-up-btn-"]');
    if (sendFollowUpBtn) {
        console.log('✅ 追加質問ボタンを検出（イベント委任）');
        event.preventDefault();
        const sessionId = sendFollowUpBtn.dataset.sessionId;
        if (sessionId) sendFollowUpMessage(sessionId);
        return;
    }
    
    // ★★★ ケースカードの処理 ★★★
    const caseCard = event.target.closest('.case-card');
    if (caseCard) {
        event.preventDefault();
        loadAndRenderCase(caseCard.dataset.caseId);
        return;
    }

    // ★★★ ホームに戻るボタンの処理 ★★★
    if (event.target.id === 'back-to-home') {
        event.preventDefault();
        renderHome();
        return;
    }

    // ★★★ タブボタンの処理 ★★★
    if (event.target.classList.contains('tab-button')) {
        event.preventDefault();
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        renderTabContent(event.target.dataset.tab);
        return;
    }
}
