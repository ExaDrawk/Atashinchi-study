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

// ★★★ デバッグ用関数 ★★★
window.analyzeQAButtons = function() {
    console.log('🔍 QAポップアップ内のボタン分析開始');
    
    const popups = document.querySelectorAll('[id^="qa-ref-popup-"]');
    console.log(`📊 発見されたQAポップアップ: ${popups.length}個`);
    
    popups.forEach((popup, index) => {
        console.log(`\n🎪 ポップアップ ${index + 1}: ${popup.id}`);
        
        // 条文参照ボタンを検索
        const articleBtns = popup.querySelectorAll('.article-ref-btn');
        console.log(`📖 条文参照ボタン: ${articleBtns.length}個`);
        
        articleBtns.forEach((btn, btnIndex) => {
            console.log(`  ボタン ${btnIndex + 1}:`, {
                text: btn.textContent,
                'data-law-name': btn.dataset.lawName,
                'data-article-ref': btn.dataset.articleRef,
                'data-law-text': btn.dataset.lawText, // 古い属性チェック
                onclick: btn.onclick ? 'あり' : 'なし',
                eventListeners: 'unknown'
            });
        });
        
        // 空欄ボタンを検索
        const blankBtns = popup.querySelectorAll('.blank-text');
        console.log(`🔲 空欄ボタン: ${blankBtns.length}個`);
        
        blankBtns.forEach((btn, btnIndex) => {
            console.log(`  空欄 ${btnIndex + 1}:`, {
                text: btn.textContent,
                'data-answer': btn.dataset.answer,
                'data-blank-id': btn.dataset.blankId,
                revealed: btn.dataset.revealed
            });
        });
    });
    
    console.log('✅ QAボタン分析完了');
};

window.testArticleButtonClick = function() {
    console.log('🧪 条文ボタンクリックテスト開始');
    
    const articleBtns = document.querySelectorAll('.article-ref-btn');
    console.log(`📖 発見された条文ボタン: ${articleBtns.length}個`);
    
    if (articleBtns.length > 0) {
        const testBtn = articleBtns[0];
        console.log('🎯 テスト対象ボタン:', {
            text: testBtn.textContent,
            'data-law-name': testBtn.dataset.lawName,
            'data-article-ref': testBtn.dataset.articleRef
        });
        
        // クリックイベントをシミュレート
        testBtn.click();
        console.log('✅ クリックイベント実行完了');
    } else {
        console.warn('⚠️ テスト可能な条文ボタンが見つかりません');
    }
};

// QAポップアップが閉じないことをテストする関数
window.testPopupPersistence = function() {
    console.log('🧪 ポップアップ持続性テスト開始');
    
    const popups = document.querySelectorAll('.qa-ref-popup');
    console.log(`📊 現在のポップアップ数: ${popups.length}`);
    
    if (popups.length === 0) {
        console.warn('⚠️ テスト可能なポップアップが見つかりません');
        return;
    }
    
    const popup = popups[0];
    const articleBtn = popup.querySelector('.article-ref-btn');
    
    if (articleBtn) {
        console.log('🎯 ポップアップ内の条文ボタンをクリックします');
        console.log('📊 クリック前のポップアップ数:', document.querySelectorAll('.qa-ref-popup').length);
        
        articleBtn.click();
        
        setTimeout(() => {
            const afterClickPopups = document.querySelectorAll('.qa-ref-popup');
            console.log('📊 クリック後のポップアップ数:', afterClickPopups.length);
            
            if (afterClickPopups.length > 0) {
                console.log('✅ ポップアップが正常に保持されています');
            } else {
                console.error('❌ ポップアップが予期せず閉じられました');
            }
        }, 300);
    } else {
        console.warn('⚠️ ポップアップ内に条文ボタンが見つかりません');
    }
};

// 条文ボタンが含まれているQAを確認する関数
window.findQAsWithArticleRefs = function() {
    console.log('🔍 条文参照を含むQAの検索開始');
    
    if (!window.currentCaseData || !window.currentCaseData.questionsAndAnswers) {
        console.warn('⚠️ ケースデータが見つかりません');
        return;
    }
    
    const qas = window.currentCaseData.questionsAndAnswers;
    const qaWithRefs = [];
    
    qas.forEach((qa, index) => {
        const questionHasRef = qa.question && qa.question.includes('【') && qa.question.includes('】');
        const answerHasRef = qa.answer && qa.answer.includes('【') && qa.answer.includes('】');
        
        if (questionHasRef || answerHasRef) {
            qaWithRefs.push({
                index: index,
                question: questionHasRef,
                answer: answerHasRef,
                questionText: qa.question ? qa.question.substring(0, 100) + '...' : '',
                answerText: qa.answer ? qa.answer.substring(0, 100) + '...' : ''
            });
        }
    });
    
    console.log(`📊 条文参照を含むQA: ${qaWithRefs.length}件`);
    qaWithRefs.forEach((qa, i) => {
        console.log(`  ${i + 1}. Q${qa.index + 1} - 問題:${qa.question ? '✅' : '❌'} 解答:${qa.answer ? '✅' : '❌'}`);
        console.log(`     問題: ${qa.questionText}`);
        console.log(`     解答: ${qa.answerText}`);
    });
    
    return qaWithRefs;
};

// 条文ボタンを直接テストする関数
window.testArticleButtonDirectly = function() {
    console.log('🧪 条文ボタン直接テスト開始');
    
    const popups = document.querySelectorAll('.qa-ref-popup');
    if (popups.length === 0) {
        console.warn('⚠️ QAポップアップが見つかりません');
        return;
    }
    
    const popup = popups[0];
    const articleBtns = popup.querySelectorAll('.article-ref-btn');
    
    if (articleBtns.length === 0) {
        console.warn('⚠️ 条文ボタンが見つかりません');
        return;
    }
    
    const testBtn = articleBtns[0];
    console.log('🎯 テスト対象ボタン:', {
        text: testBtn.textContent,
        'data-law-name': testBtn.dataset.lawName,
        'data-article-ref': testBtn.dataset.articleRef,
        classList: Array.from(testBtn.classList)
    });
    
    // 直接showArticlePanelWithPresetを呼び出し
    const lawName = testBtn.dataset.lawName;
    const articleRef = testBtn.dataset.articleRef;
    
    if (lawName && articleRef) {
        console.log('🚀 直接showArticlePanelWithPreset呼び出し');
        if (window.showArticlePanelWithPreset) {
            window.showArticlePanelWithPreset(lawName, articleRef);
        } else {
            console.error('❌ window.showArticlePanelWithPresetが見つかりません');
        }
    } else {
        console.error('❌ 必要なデータ属性が不足', { lawName, articleRef });
    }
};
