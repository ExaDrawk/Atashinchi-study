// router.js - ルーティング専用モジュール

import { renderHome } from './pages/homePage.js';
import { loadAndRenderCase } from './pages/casePage.js';
import { renderSpeedQuizPage } from './speedQuizPage.js';

export function initializeRouter() {
    // 初期ルーティング
    router();
    
    // popstateイベントリスナーを追加
    window.addEventListener('popstate', handlePopState);
}

export async function router() {
    const hash = window.location.hash;
    console.log("ルーター起動:", hash);
    
    if (hash.startsWith('#/case/')) {
        const caseId = decodeURIComponent(hash.substring('#/case/'.length));
        loadAndRenderCase(caseId, false);
    } else if (hash.startsWith('#/speed-quiz')) {
        // パラメータ付きのスピードクイズURLにも対応
        console.log("スピードクイズページに遷移:", hash);
        
        // 遷移前の状態を確認（デバッグ用）
        console.log("📊 遷移前の window.speedQuizArticles:", window.speedQuizArticles?.length || 0);
        
        // renderSpeedQuizPage関数が条文の読み込みとフィルタリングを処理するので、
        // ここでは単純に関数を呼び出すだけにする
        renderSpeedQuizPage();
    } else if (hash === '#/qa-list') {
        // Q&A一覧モード
        await renderHome(false, 'qa');
    } else if (hash === '#/speed-quiz-main') {
        // スピード条文メインモード
        await renderHome(false, 'speed');
    } else {
        await renderHome(false);
    }
}

function handlePopState(event) {
    console.log("popstateイベントが発生しました:", event.state);
    router();
}
