// speedQuizPage.js - スピードクイズ専用ページ（シンプル版）
// speedQuiz.js がフルスクリーンゲームを提供するので、このファイルはコンテナ提供のみ

import { initializeSpeedQuizGame, startSpeedQuiz } from './speedQuiz.js';

/**
 * スピードクイズページをレンダリング
 */
export function renderSpeedQuizPage() {
    console.log('🎯 スピードクイズページ表示');
    document.title = 'スピードクイズ - あたしンちスタディ';

    // フルスクリーンゲームを表示するためのコンテナのみ提供
    const app = document.getElementById('app');
    app.innerHTML = `<div id="speed-quiz-container" style="width:100%;height:100%;"></div>`;

    initializeSpeedQuizForStandalonePage();
}

/**
 * 独立ページ用のスピードクイズを初期化
 */
async function initializeSpeedQuizForStandalonePage() {
    try {
        console.log('🎯 スタンドアロンスピードクイズページ初期化開始');

        // URLパラメータから法律名を取得
        const hash = window.location.hash;
        let specificLaw = null;
        if (hash.includes('?')) {
            const [, queryString] = hash.split('?');
            const urlParams = new URLSearchParams(queryString);
            specificLaw = urlParams.get('law');
            if (specificLaw) specificLaw = decodeURIComponent(specificLaw);
        }
        window.currentSpecificLaw = specificLaw;

        if (specificLaw) {
            console.log(`📚 特定法律モード: ${specificLaw}`);
            document.title = `${specificLaw} スピードクイズ - あたしンちスタディ`;
        }

        // ★★★ インラインスピード条文から渡された条文を優先使用 ★★★
        // window.speedQuizArticles が既に設定されている場合は、それを使用（絞り込み済み）
        if (window.speedQuizArticles?.length > 0) {
            console.log(`✅ 絞り込み済み条文を使用: ${window.speedQuizArticles.length}件`);
            // 絞り込み済みフラグを設定
            window.speedQuizFilteredMode = true;
        } else {
            // 条文メタデータがまだ読み込まれていない場合は読み込む
            console.log('📚 条文メタデータを読み込み中...');
            window.speedQuizFilteredMode = false;
            const container = document.getElementById('speed-quiz-container');
            if (container) {
                container.innerHTML = `
                    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);display:flex;align-items:center;justify-content:center;">
                        <div style="text-align:center;color:white;">
                            <h2 style="font-size:1.5rem;margin-bottom:1rem;">📚 データ読み込み中...</h2>
                            <div style="width:50px;height:50px;border:4px solid rgba(255,255,255,.3);border-top-color:#8b5cf6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>
                        </div>
                    </div>
                    <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
                `;
            }

            try {
                const { loadAllArticlesForSpeedQuiz } = await import('./sharedSpeedQuizMain.js');
                const articles = await loadAllArticlesForSpeedQuiz();
                window.speedQuizArticles = articles;
                console.log(`✅ 条文メタデータ読み込み完了: ${articles?.length || 0}件`);
            } catch (error) {
                console.error('❌ 条文メタデータ読み込みエラー:', error);
                window.speedQuizArticles = [];
            }
        }

        // 条文データが正常に読み込まれた場合
        if (window.speedQuizArticles?.length > 0) {
            // ★★★ 絞り込みモードでない場合のみ、法律フィルタリングを適用 ★★★
            if (specificLaw && !window.speedQuizFilteredMode) {
                const { filterArticlesByLaw } = await import('./sharedSpeedQuizMain.js');
                window.originalSpeedQuizArticles = [...window.speedQuizArticles];
                window.speedQuizArticles = filterArticlesByLaw(specificLaw);

                if (window.speedQuizArticles.length === 0) {
                    throw new Error(`${specificLaw}の条文が見つかりませんでした。`);
                }
                console.log(`📊 ${specificLaw}の条文数: ${window.speedQuizArticles.length}件`);
            } else if (window.speedQuizFilteredMode) {
                console.log(`📊 絞り込みモード: ${window.speedQuizArticles.length}件の条文でプレイ`);
                document.title = `スピードクイズ (絞り込み) - あたしンちスタディ`;
            }

            // フルスクリーンゲームを初期化（戻り先をホームに設定）
            await initializeSpeedQuizGame('speed-quiz-container', null, true, { returnUrl: '#/' });
        } else {
            throw new Error(specificLaw ? `${specificLaw}の条文データの読み込みに失敗しました` : '条文データの読み込みに失敗しました');
        }
    } catch (error) {
        console.error('❌ スピードクイズページ初期化エラー:', error);
        const container = document.getElementById('speed-quiz-container');
        if (container) {
            container.innerHTML = `
                <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);display:flex;align-items:center;justify-content:center;">
                    <div style="text-align:center;color:white;max-width:400px;padding:2rem;">
                        <h2 style="font-size:1.5rem;margin-bottom:1rem;color:#ef4444;">❌ エラー</h2>
                        <p style="margin-bottom:1.5rem;">${error.message}</p>
                        <button onclick="window.location.hash='#/'" style="background:#6366f1;color:white;border:none;padding:1rem 2rem;border-radius:12px;cursor:pointer;font-weight:bold;">ホームに戻る</button>
                    </div>
                </div>
            `;
        }
    }
}

export { initializeSpeedQuizForStandalonePage };
