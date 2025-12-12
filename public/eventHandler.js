// eventHandler.js - イベント処理専用モジュール

import { showArticlePanel } from './articlePanel.js';
import { loadAndRenderCase } from './pages/casePage.js';
import { renderHome } from './pages/homePage.js';
import { renderTabContent } from './pages/casePage.js';

let globalEventListenersAttached = false;

export function setupGlobalEventDelegation() {
    if (globalEventListenersAttached) return;
    console.log('グローバルイベントデリゲーションを設定中...');
    
    document.addEventListener('click', handleGlobalClick);
    // select等の値変更も拾えるようにchangeイベントを追加
    document.addEventListener('change', (event) => {
        // ★★★ INTOモード：回答キャラ変更（change対応） ★★★
        if (event.target && event.target.id === 'into-responder-select') {
            const name = event.target.value;
            if (window.setIntoResponder) window.setIntoResponder(name);
            return;
        }
    });
    
    globalEventListenersAttached = true;
    console.log('✅ グローバルイベントデリゲーション設定完了');
}

async function handleGlobalClick(event) {
    // console.log('クリックイベント検出:', event.target); // デバッグログを減らす
    
    // ★★★ 条文参照ボタンの処理 ★★★
    const articleRefBtn = event.target.closest('.article-ref-btn');
    if (articleRefBtn) {
        console.log('✅ 条文参照ボタンを検出（イベント委任）');
        event.preventDefault();
        event.stopPropagation();
        
        const lawName = articleRefBtn.dataset.lawName;
        const articleRef = articleRefBtn.dataset.articleRef;
        const displayName = articleRefBtn.dataset.displayName || lawName;
        
        console.log('条文参照データ:', { lawName, articleRef, displayName });
        
        // 条文の自動入力機能付きパネルを表示
        if (window.showArticlePanelWithPreset) {
            window.showArticlePanelWithPreset(lawName, articleRef);
        } else {
            console.error('❌ showArticlePanelWithPreset関数が見つかりません');
        }
        return;
    }
    
    // ★★★ Q&A参照ボタンの処理 ★★★
    const qaRefBtn = event.target.closest('.qa-ref-btn');
    if (qaRefBtn) {
        console.log('✅ Q&A参照ボタンを検出（イベント委任）');
        event.preventDefault();
        event.stopPropagation();
        
        const qaIndex = parseInt(qaRefBtn.dataset.qaIndex);
        const qNumber = qaRefBtn.dataset.qNumber;
        const quizIndex = qaRefBtn.dataset.quizIndex || 'global';
        const subIndex = qaRefBtn.dataset.subIndex || '0';
        
        console.log('Q&A参照データ:', { qaIndex, qNumber, quizIndex, subIndex });
        
        // Q&Aポップアップを表示（articleProcessor.jsの関数を使用）
        if (window.showQAPopup) {
            window.showQAPopup(qaIndex, qNumber, quizIndex, subIndex);
        } else {
            console.error('❌ showQAPopup関数が見つかりません');
        }
        return;
    }
    
    // ★★★ 条文表示ボタンの処理 ★★★
    if (event.target.closest('.show-article-btn')) {
        event.preventDefault();
        showArticlePanel();
        return;
    }

    // ★★★ みんなの意見ボタンの処理 ★★★
    const opinionBtn = event.target.closest('.opinion-btn');
    if (opinionBtn) {
        console.log('✅ みんなの意見ボタンを検出');
        event.preventDefault();
        const quizIndex = opinionBtn.dataset.quizIndex;
        const subIndex = opinionBtn.dataset.subIndex;
        console.log('データ:', { quizIndex, subIndex });
        if (window.startCharacterDialogue) {
            console.log('✅ startCharacterDialogue関数を実行中...');
            window.startCharacterDialogue(quizIndex, subIndex);
        } else {
            console.error('❌ window.startCharacterDialogue関数が見つかりません');
        }
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
        
        // アクティブ状態の更新
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // タブコンテンツをレンダリング（内部でタブ状態も保存される）
        await renderTabContent(event.target.dataset.tab);
        
        console.log(`✅ タブ切り替え完了: ${event.target.dataset.tab}`);
        return;
    }
}
