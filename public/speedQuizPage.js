// speedQuizPage.js - スピードクイズ専用ページ

import { initializeSpeedQuizGame } from './speedQuiz.js';

// speedQuiz.jsから関数をインポート
let startSpeedQuiz = null;

/**
 * スピードクイズページをレンダリング
 */
export function renderSpeedQuizPage() {
    console.log('🎯 スピードクイズページ表示');
    
    document.title = 'スピードクイズ - あたしンちスタディ';
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <!-- ヘッダー -->
            <div class="max-w-4xl mx-auto mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button id="back-to-home" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                            ← ホームに戻る
                        </button>
                        <h1 class="text-3xl font-bold text-gray-800">⚡ スピードクイズ</h1>
                    </div>
                </div>
            </div>
            
            <!-- スピードクイズコンテンツ -->
            <div class="max-w-4xl mx-auto">
                <div id="speed-quiz-container">
                    <!-- スピードクイズがここに表示される -->
                </div>
            </div>
        </div>
    `;
    
    // ホームに戻るボタン
    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.hash = '#/';
    });
    
    // スピードクイズを初期化
    initializeSpeedQuizForStandalonePage();
}

/**
 * 独立ページ用のスピードクイズを初期化
 */
async function initializeSpeedQuizForStandalonePage() {
    try {
        console.log('🎯 スタンドアロンスピードクイズページ初期化開始');
        console.log('🔍 Document state:', document.readyState);
        
        // URLパラメータから法律名を取得
        const hash = window.location.hash;
        console.log('🔍 現在のhash:', hash);
        
        let specificLaw = null;
        if (hash.includes('?')) {
            const [path, queryString] = hash.split('?');
            console.log('🔍 パス:', path, 'クエリ:', queryString);
            const urlParams = new URLSearchParams(queryString);
            specificLaw = urlParams.get('law');
            
            // URLデコードを行う（必要に応じて）
            if (specificLaw) {
                specificLaw = decodeURIComponent(specificLaw);
                console.log(`🔄 デコード後の法律名: "${specificLaw}"`);
            }
            
            console.log('🔍 取得した法律名:', specificLaw);
        } else {
            console.log('⚠️ URLパラメータがありません');
        }
        
        // グローバル変数にも保存（他の場所で参照できるように）
        window.currentSpecificLaw = specificLaw;
        
        if (specificLaw) {
            console.log(`📚 特定法律モード: ${specificLaw}`);
            document.title = `${specificLaw} スピードクイズ - あたしンちスタディ`;
            
            // ヘッダーのタイトルも更新
            const titleElement = document.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = `⚡ ${specificLaw} スピードクイズ`;
            } else {
                console.warn('⚠️ タイトル要素が見つかりません');
            }
        }
        
        // 条文メタデータがまだ読み込まれていない場合は読み込む
        if (!window.speedQuizArticles || !Array.isArray(window.speedQuizArticles) || window.speedQuizArticles.length === 0) {
            console.log('📚 条文メタデータを読み込み中...');
            
            // コンテナにローディング表示
            const container = document.getElementById('speed-quiz-container');
            if (container) {
                container.innerHTML = `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <h2 class="text-xl font-bold text-blue-800 mb-2">📚 データ読み込み中...</h2>
                        <p class="text-blue-600 mb-4">条文データを読み込んでいます。しばらくお待ちください。</p>
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div>
                    </div>
                `;
            }
            
            try {
                // speedQuizMain.jsから読み込み関数をインポート
                console.log('🔄 loadAllArticlesForSpeedQuiz関数をインポート中...');
                const { loadAllArticlesForSpeedQuiz } = await import('./speedQuizMain.js');
                
                console.log('🔄 条文メタデータを読み込み中...');
                const articles = await loadAllArticlesForSpeedQuiz();
                console.log('🔍 読み込み結果:', articles);
                console.log('📊 読み込み結果の型:', typeof articles);
                console.log('📊 読み込み結果の長さ:', articles?.length);
                
                window.speedQuizArticles = articles;
                console.log('🗂️ window.speedQuizArticlesに設定:', window.speedQuizArticles);
                
                console.log(`✅ 条文メタデータ読み込み完了: ${window.speedQuizArticles?.length || 0}件`);
            } catch (error) {
                console.error('❌ 条文メタデータ読み込みエラー:', error);
                window.speedQuizArticles = [];
            }
        }
        
        // 条文データが正常に読み込まれた場合
        if (window.speedQuizArticles && window.speedQuizArticles.length > 0) {
            console.log('🎯 スピードクイズを初期化中...');
            
            // 特定の法律が指定されている場合、条文をフィルタリング
            if (specificLaw) {
                const { filterArticlesByLaw } = await import('./speedQuizMain.js');
                const originalArticles = [...window.speedQuizArticles];
                window.speedQuizArticles = filterArticlesByLaw(specificLaw);
                
                if (window.speedQuizArticles.length === 0) {
                    throw new Error(`${specificLaw}の条文が見つかりませんでした。`);
                }
                
                console.log(`📊 ${specificLaw}の条文数: ${window.speedQuizArticles.length}件`);
                
                // クイズ終了後に元の条文データを復元するためのフラグ
                window.originalSpeedQuizArticles = originalArticles;
            }
            
            // ダミーのケースデータを作成（条文メタデータは既にグローバルに設定済み）
            const dummyCaseData = {
                title: specificLaw ? `${specificLaw} スピードクイズ` : 'スピードクイズ',
                story: [],
                explanation: '',
                quiz: [],
                essay: null,
                questionsAndAnswers: []
            };
            
            await initializeSpeedQuizGame('speed-quiz-container', dummyCaseData, true); // 既存の条文データを保持
            
            // startSpeedQuiz関数を動的インポート
            const { startSpeedQuiz: startSpeedQuizFunc } = await import('./speedQuiz.js');
            startSpeedQuiz = startSpeedQuizFunc;
            
            // 自動的にゲームを開始
            setTimeout(() => {
                // 最終的にデータが存在するかチェック
                console.log('🔍 ゲーム開始前の最終チェック:');
                console.log('  window.speedQuizArticles:', window.speedQuizArticles);
                console.log('  配列かどうか:', Array.isArray(window.speedQuizArticles));
                console.log('  長さ:', window.speedQuizArticles?.length);
                console.log('  現在の法律:', window.currentSpecificLaw);
                
                if (!window.speedQuizArticles || !Array.isArray(window.speedQuizArticles) || window.speedQuizArticles.length === 0) {
                    console.error('❌ 条文データが準備できていません');
                    alert('条文データの読み込みに失敗しました。ページを再読み込みしてください。');
                    return;
                }
                
                if (typeof startSpeedQuiz === 'function') {
                    console.log('🎮 スピードクイズゲーム開始');
                    
                    // 特定の法律が指定されている場合、その情報をゲーム開始時に渡す
                    if (window.currentSpecificLaw) {
                        console.log(`📚 特定法律モードでゲーム開始: ${window.currentSpecificLaw}`);
                        // 法律名を含む設定オブジェクトを作成
                        const settings = {
                            specificLaw: window.currentSpecificLaw,
                            timeLimit: 10,
                            questionCount: 20
                        };
                        import('./speedQuiz.js').then(module => {
                            if (module.startFilteredSpeedQuiz) {
                                module.startFilteredSpeedQuiz(settings);
                            } else {
                                console.error('❌ startFilteredSpeedQuiz関数が見つかりません');
                                startSpeedQuiz(); // フォールバック
                            }
                        }).catch(() => {
                            startSpeedQuiz(); // エラーの場合はフォールバック
                        });
                    } else {
                        // 通常モードで開始
                        startSpeedQuiz();
                    }
                } else {
                    console.error('❌ startSpeedQuiz関数が見つかりません');
                }
            }, 500); // 500ms遅延で確実に初期化完了を待つ
        } else {
            const errorMessage = specificLaw ? 
                `${specificLaw}の条文データの読み込みに失敗しました` : 
                '条文データの読み込みに失敗しました';
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('❌ スピードクイズページ初期化エラー:', error);
        
        const container = document.getElementById('speed-quiz-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 class="text-xl font-bold text-red-800 mb-2">❌ エラーが発生しました</h2>
                    <p class="text-red-600 mb-4">スピードクイズの初期化に失敗しました：${error.message}</p>
                    <button onclick="window.location.hash = '#/'" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                        ホームに戻る
                    </button>
                </div>
            `;
        }
    }
}

export { initializeSpeedQuizForStandalonePage };
