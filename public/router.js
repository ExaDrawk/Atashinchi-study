// router.js - ルーティング専用モジュール

import { renderHome } from './pages/homePage.js';
import { loadAndRenderCase } from './pages/casePage.js';

export function initializeRouter() {
    // 初期ルーティング
    router();
    
    // popstateイベントリスナーを追加
    window.addEventListener('popstate', handlePopState);
}

export function router() {
    const hash = window.location.hash;
    console.log("ルーター起動:", hash);
    
    if (hash.startsWith('#/case/')) {
        const caseId = hash.substring('#/case/'.length);
        loadAndRenderCase(caseId, false);
    } else {
        renderHome(false);
    }
}

function handlePopState(event) {
    console.log("popstateイベントが発生しました:", event.state);
    router();
}
