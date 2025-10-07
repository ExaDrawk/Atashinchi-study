// speedQuizMain.js - トップページ用スピード条文コンポーネント

/**
 * トップページ用スピード条文セクションを作成
 */
export function createSpeedQuizMainSection() {
    const sectionHtml = `
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6 text-black">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-gray-800">⚡ スピード条文</h2>
            </div>
            
            <!-- 統計情報 -->
            <div id="speed-quiz-stats" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                    <div class="text-sm opacity-90">総回答数</div>
                    <div class="text-2xl font-bold" id="total-answered">0</div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                    <div class="text-sm opacity-90">正答率</div>
                    <div class="text-2xl font-bold" id="total-accuracy">0%</div>
                </div>
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
                    <div class="text-sm opacity-90">弱点条文</div>
                    <div class="text-2xl font-bold" id="weak-articles">0</div>
                </div>
            </div>

            <!-- 問題絞り込み条件 -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">📝 問題絞り込み条件</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- 回答済 -->
                    <div class="flex items-center">
                        <input type="checkbox" id="filter-answered" class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                        <label for="filter-answered" class="text-sm font-medium text-gray-700">📋 回答済み問題のみ</label>
                    </div>
                    
                    <!-- 正答率以下 -->
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="filter-accuracy" class="mr-2 w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500">
                        <label for="filter-accuracy" class="text-sm font-medium text-gray-700">📊 正答率</label>
                        <input type="number" id="accuracy-threshold" value="60" min="0" max="100" class="w-16 px-2 py-1 text-sm border border-gray-300 rounded">
                        <span class="text-sm text-gray-700">％以下</span>
                    </div>
                    
                    <!-- 全回間違えた問題 -->
                    <div class="flex items-center">
                        <input type="checkbox" id="filter-all-wrong" class="mr-2 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500">
                        <label for="filter-all-wrong" class="text-sm font-medium text-gray-700">❌ 全回間違えた問題</label>
                    </div>
                </div>
                
                <!-- フィルタされた問題数表示 -->
                <div class="mt-3 text-sm text-gray-600">
                    条件に一致する問題数: <span id="filtered-count" class="font-semibold text-blue-600">計算中...</span>
                </div>
            </div>

            <!-- スピード条文開始ボタン -->
            <div class="text-center mb-6">
                <button id="start-speed-quiz-btn" class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
                    <span class="relative z-10">� スピード条文！</span>
                    <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                </button>
            </div>
            
            <!-- 条文一覧表示 -->
            <div id="article-list-section" class="mt-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">📚 条文一覧</h3>
                    <div class="text-sm text-gray-600">
                        表示件数: <span id="article-count">0</span>件
                    </div>
                </div>
                <div id="article-list" class="space-y-2 max-h-96 overflow-y-auto">
                    <div class="text-center text-gray-500 py-8">条文データを読み込み中...</div>
                </div>
            </div>
        </div>
        
        <!-- 開始アニメーション用のオーバーレイ -->
        <div id="speed-quiz-overlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-8 text-center max-w-md">
                <div class="text-6xl mb-4 animate-bounce">🚀</div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">スピード条文開始！</h3>
                <p class="text-gray-600 mb-4">問題を準備中...</p>
                <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>
        </div>
    `;
    
    return sectionHtml;
}

/**
 * トップページ用スピード条文セクションを初期化
 * 回答済み問題のデータのみを使用
 */
export async function initializeSpeedQuizMainSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ コンテナが見つかりません:', containerId);
        return;
    }
    // セクションHTMLを挿入
    container.innerHTML = createSpeedQuizMainSection();
    
    // caseSummariesが利用可能でない場合は読み込み
    if (!window.caseSummaries) {
        try {
            console.log('📚 caseSummariesを読み込み中...');
            const casesModule = await import('./cases/index.js');
            window.caseSummaries = casesModule.caseSummaries || [];
            console.log(`✅ caseSummaries読み込み完了: ${window.caseSummaries.length}件`);
        } catch (error) {
            console.warn('⚠️ caseSummaries読み込みエラー:', error);
            window.caseSummaries = [];
        }
    }
    
    // 統計情報の初期表示
    displayInitialStats();
    
    // 回答済み条文データを読み込み
    window.speedQuizArticles = await loadAllArticlesForSpeedQuiz();
    
    // 全ファイルから統計データを読み込んで統計情報を更新
    await loadAndUpdateAllStats();
    
    // フィルターUIが利用可能になるまで簡易的に待機
    await new Promise(resolve => setTimeout(resolve, 100));
    // 条文一覧を初回表示
    await updateArticleList();
    // イベントリスナーを設定
    setupSpeedQuizMainEvents();
}

/**
 * 初期統計情報を表示（0から開始）
 */
function displayInitialStats() {
    // デフォルト値を表示（nullチェック付き）
    const totalAnsweredEl = document.getElementById('total-answered');
    const totalAccuracyEl = document.getElementById('total-accuracy');
    const weakArticlesEl = document.getElementById('weak-articles');
    
    if (totalAnsweredEl) totalAnsweredEl.textContent = '0';
    if (totalAccuracyEl) totalAccuracyEl.textContent = '0%';
    if (weakArticlesEl) weakArticlesEl.textContent = '0';
    
    console.log('📊 初期統計情報を0から表示');
}

/**
 * 全ファイルから統計データを読み込んで更新
 */
async function loadAndUpdateAllStats() {
    try {
        console.log('📊 ファイルベース統計データを読み込み中...');
        
        // ファイル一覧を取得
        const fileList = await getSpeedQuizFileList();
        console.log(`📋 スピード条文ファイル: ${fileList.length}個発見`);
        
        let allAnswerRates = {};
        
        // 各ファイルからデータを読み込んで統合
        for (const lawName of fileList) {
            try {
                const fileData = await loadAnswerRateFromFile(lawName);
                if (fileData && Object.keys(fileData).length > 0) {
                    allAnswerRates[lawName] = fileData;
                    console.log(`📂 ${lawName}のファイルデータを統合`);
                }
            } catch (error) {
                console.warn(`⚠️ ${lawName}ファイル読み込みエラー:`, error);
            }
        }
        
        // 統合されたデータで統計を更新
        updateStatsDisplay(allAnswerRates);
        
        console.log('✅ ファイルベース統計データの読み込み完了');
        
    } catch (error) {
        console.error('❌ 統計データ読み込みエラー:', error);
        // フォールバック: 0表示
        updateStatsDisplay({});
    }
}

/**
 * 統計表示を更新
 */
function updateStatsDisplay(answerRates) {
    let totalAnswered = 0;
    let totalCorrect = 0;
    let weakArticles = 0;
    
    for (const lawName in answerRates) {
        for (const articleNumber in answerRates[lawName]) {
            for (const paragraph in answerRates[lawName][articleNumber]) {
                const record = answerRates[lawName][articleNumber][paragraph];
                if (record && typeof record === 'object') {
                    totalAnswered += record.answered || 0;
                    totalCorrect += record.correct || 0;
                    
                    const accuracy = record.answered > 0 ? (record.correct / record.answered) * 100 : 0;
                    if (accuracy < 60 && record.answered > 0) {
                        weakArticles++;
                    }
                }
            }
        }
    }
    
    const totalAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    
    // DOM更新（nullチェック付き）
    const totalAnsweredEl = document.getElementById('total-answered');
    const totalAccuracyEl = document.getElementById('total-accuracy');
    const weakArticlesEl = document.getElementById('weak-articles');
    
    if (totalAnsweredEl) totalAnsweredEl.textContent = totalAnswered;
    if (totalAccuracyEl) totalAccuracyEl.textContent = totalAccuracy + '%';
    if (weakArticlesEl) weakArticlesEl.textContent = weakArticles;
    
    console.log(`📊 統計更新: 回答数=${totalAnswered}, 正答率=${totalAccuracy}%, 弱点=${weakArticles}`);
}

/**
 * 条文一覧を表示（既存のフォルダ選択UIと連携）
 */
async function updateArticleList() {
    const filteredArticles = await getFilteredArticles();
    const articleList = document.getElementById('article-list');
    const articleCount = document.getElementById('displayed-article-count');
    
    if (!articleList) {
        console.error('❌ article-list要素が見つかりません - HTMLが正しく生成されていない可能性があります');
        // HTMLを再生成してみる
        const container = document.getElementById('speed-quiz-main-section');
        if (container) {
            container.innerHTML = createSpeedQuizMainSection();
            setTimeout(async () => await updateArticleList(), 100); // 少し遅延後に再試行
        }
        return;
    }
    
    // 法律名と条文番号でソート
    filteredArticles.sort((a, b) => {
        // まず法律名でソート
        const lawCompare = a.lawName.localeCompare(b.lawName);
        if (lawCompare !== 0) return lawCompare;
        
        // 次に条文番号でソート
        const aNum = parseInt(a.articleNumber) || 0;
        const bNum = parseInt(b.articleNumber) || 0;
        if (aNum !== bNum) return aNum - bNum;
        
        // 最後に項番号でソート
        const aPara = parseInt(a.paragraph) || 1;
        const bPara = parseInt(b.paragraph) || 1;
        return aPara - bPara;
    });
    
    // 条文数を表示
    if (articleCount) {
        articleCount.textContent = filteredArticles.length;
    }
    
    if (filteredArticles.length === 0) {
        const selectedFolder = document.getElementById('category-filter')?.value || '';
        const selectedSubfolder = document.getElementById('subfolder-filter')?.value || '';
        const totalArticles = window.speedQuizArticles ? window.speedQuizArticles.length : 0;
        
        let message = '';
        if (totalArticles === 0) {
            message = '条文データが読み込まれていません。ページを再読み込みしてください。';
        } else if (!selectedFolder) {
            message = '該当する条文がありません。フォルダを選択してください。';
        } else {
            message = `選択されたフォルダ "${selectedFolder}"${selectedSubfolder ? ` / "${selectedSubfolder}"` : ''} には条文がありません。`;
        }
        
        articleList.innerHTML = `
            <div class="text-gray-500 text-center py-4">
                <p>${message}</p>
                <div class="text-xs mt-2 text-gray-400">
                    デバッグ情報: 総条文数=${totalArticles}, フォルダ="${selectedFolder}", サブフォルダ="${selectedSubfolder}"
                </div>
            </div>
        `;
        return;
    }
    
    // 条文一覧を表示（非同期処理対応）
    await renderArticleList(filteredArticles, articleList);
}

/**
 * 条文一覧を非同期で描画
 */
async function renderArticleList(filteredArticles, articleList) {
    // 全ファイルからの統合データを取得
    const allAnswerRates = await getAllAnswerRatesFromFiles();
    
    const articlesHtml = filteredArticles.map(article => {
        const displayName = `${article.lawName}${article.articleNumber}条${article.paragraph !== '1' ? `第${article.paragraph}項` : ''}`;
        const record = allAnswerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
        
        // 回答データからmodules情報を取得してarticleオブジェクトに追加
        if (record && record.modules) {
            article.modules = record.modules;
        }
        
        let statsHtml = '';
        if (record && record.answered > 0) {
            const correctRate = Math.round((record.correct / record.answered) * 100);
            const rateColor = correctRate >= 80 ? 'text-green-600' : correctRate >= 60 ? 'text-yellow-600' : 'text-red-600';
            statsHtml = `
                <div class="text-xs text-gray-500">
                    正答率: <span class="${rateColor} font-medium">${correctRate}%</span> (${record.correct}/${record.answered})
                </div>
            `;
        } else {
            statsHtml = '<div class="text-xs text-gray-400">未回答</div>';
        }
        
        return `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border text-black hover:bg-blue-50 cursor-pointer transition-colors" 
                 onclick="openArticleDetail('${article.lawName}', '${article.articleNumber}', '${article.paragraph}')">
                <div class="flex items-center flex-1">
                    <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm mr-3 transition-colors"
                            onclick="event.stopPropagation(); startSingleArticleQuiz('${article.lawName}', '${article.articleNumber}', '${article.paragraph}')">
                        ${displayName}
                    </button>
                    <div class="flex flex-col">
                        <div class="text-xs text-gray-600 mb-1">
                            ${getModuleButtonsForArticle(article)}
                        </div>
                        ${statsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    articleList.innerHTML = articlesHtml;
}

/**
 * 全ファイルからの統合回答率データを取得
 */
async function getAllAnswerRatesFromFiles() {
    try {
        let allAnswerRates = {};
        
        // ファイル一覧を取得
        const fileList = await getSpeedQuizFileList();
        
        // 各ファイルからデータを読み込んで統合
        for (const lawName of fileList) {
            try {
                const fileData = await loadAnswerRateFromFile(lawName);
                if (fileData && Object.keys(fileData).length > 0) {
                    allAnswerRates[lawName] = fileData;
                }
            } catch (error) {
                console.warn(`⚠️ ${lawName}ファイル読み込みエラー:`, error);
            }
        }
        
        return allAnswerRates;
        
    } catch (error) {
        console.error('❌ 統合データ取得エラー:', error);
        return {};
    }
}

/**
 * 条文が含まれるモジュールボタンを作成
 */
function getModuleButtonsForArticle(article) {
    // 実際の回答データからmodules配列を取得
    if (article.modules && Array.isArray(article.modules) && article.modules.length > 0) {
        console.log(`📁 ${article.lawName}${article.articleNumber}条のモジュール情報:`, article.modules);
        
        const caseSummaries = window.caseSummaries || [];
        
        return article.modules.map(modulePath => {
            // modulePathからケース情報を検索
            const matchingCase = caseSummaries.find(caseItem => 
                caseItem.filePath === modulePath
            );
            
            if (matchingCase) {
                return `
                    <button class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1 transition-colors"
                            onclick="event.stopPropagation(); navigateToModule('${matchingCase.id}')">
                        📁 ${matchingCase.title}
                    </button>
                `;
            } else {
                // ケース情報が見つからない場合でも、クリック可能なボタンとして表示
                const modulePathParts = modulePath.split('/');
                const fileName = modulePathParts[modulePathParts.length - 1]?.replace('.js', '') || 'モジュール';
                
                return `
                    <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1 transition-colors"
                            onclick="event.stopPropagation(); navigateToModuleByPath('${modulePath}')">
                        📁 ${fileName}
                    </button>
                `;
            }
        }).join('');
    }
    
    // 従来の検索方法もバックアップとして維持
    const caseSummaries = window.caseSummaries || [];
    const foundModules = [];
    
    // 各モジュールを検索して、この条文を含むモジュールを見つける
    for (const caseItem of caseSummaries) {
        try {
            const caseLoader = (window.caseLoaders || {})[caseItem.id];
            if (caseLoader && caseLoader.qaList) {
                const hasArticle = caseLoader.qaList.some(qa => {
                    if (!qa.content) return false;
                    
                    // 条文参照パターンを検索
                    const patterns = [
                        new RegExp(`【${article.lawName}(?:第)?${article.articleNumber}条`, 'g'),
                        new RegExp(`${article.lawName}(?:第)?${article.articleNumber}条`, 'g')
                    ];
                    
                    return patterns.some(pattern => pattern.test(qa.content));
                });
                
                if (hasArticle) {
                    foundModules.push(caseItem);
                }
            }
        } catch (error) {
            console.warn(`モジュール検索エラー (${caseItem.id}):`, error);
        }
    }
    
    if (foundModules.length === 0) {
        return '<span class="text-gray-400">モジュール未特定</span>';
    }
    
    return foundModules.map(module => `
        <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1 transition-colors"
                onclick="event.stopPropagation(); navigateToModule('${module.id}')">
            📁 ${module.title}
        </button>
    `).join('');
}

/**
 * モジュールへのナビゲーション
 */
function navigateToModule(moduleId) {
    // ハッシュベースルーティングを使用してモジュールに移動
    window.location.hash = `#/case/${moduleId}`;
    
    // または、直接モジュールページに移動
    // window.location.href = `/case/${moduleId}`;
}

// グローバル関数として使用可能にする
window.navigateToModule = navigateToModule;

/**
 * モジュールパスからケースIDを検索してナビゲーション
 */
function navigateToModuleByPath(modulePath) {
    console.log(`🔍 モジュールパスでナビゲーション: ${modulePath}`);
    console.log(`📋 現在のcaseSummaries数: ${window.caseSummaries?.length || 0}`);
    
    const caseSummaries = window.caseSummaries || [];
    const matchingCase = caseSummaries.find(caseItem => 
        caseItem.filePath === modulePath
    );
    
    if (matchingCase) {
        console.log(`✅ ケース発見: ${matchingCase.id} - ${matchingCase.title}`);
        navigateToModule(matchingCase.id);
    } else {
        console.warn(`⚠️ モジュールパス ${modulePath} に対応するケースが見つかりません`);
        console.log('検索対象パス:', modulePath);
        console.log('利用可能なケース (最初の5件):', caseSummaries.slice(0, 5).map(c => ({ 
            id: c.id, 
            filePath: c.filePath,
            title: c.title 
        })));
        
        // 代替案：パスの一部でマッチングを試行
        const pathParts = modulePath.split('/');
        const lawName = pathParts[0];
        const chapter = pathParts[1];
        
        console.log(`🔄 代替検索: 法律名=${lawName}, 章=${chapter}`);
        
        const altMatching = caseSummaries.find(caseItem => 
            caseItem.filePath && 
            caseItem.filePath.includes(lawName) && 
            caseItem.filePath.includes(chapter)
        );
        
        if (altMatching) {
            console.log(`🔄 代替ケース発見: ${altMatching.id} - ${altMatching.title}`);
            navigateToModule(altMatching.id);
        } else {
            // さらなる代替案：法律名のみでマッチング
            const lawOnlyMatch = caseSummaries.find(caseItem => 
                caseItem.category === lawName || 
                (caseItem.filePath && caseItem.filePath.includes(lawName))
            );
            
            if (lawOnlyMatch) {
                console.log(`🔄 法律名マッチ発見: ${lawOnlyMatch.id} - ${lawOnlyMatch.title}`);
                navigateToModule(lawOnlyMatch.id);
            } else {
                console.error(`❌ どの代替手段でもケースが見つかりません`);
                alert(`モジュール "${modulePath}" への移動に失敗しました。\nケース情報が見つかりませんでした。\n\n詳細はコンソールを確認してください。`);
            }
        }
    }
}

// グローバル関数として使用可能にする
window.navigateToModuleByPath = navigateToModuleByPath;

/**
 * 既存のフォルダ選択UIと連携して条文をフィルタ
 */
async function getFilteredArticles() {
    if (!window.speedQuizArticles) {
        console.warn('⚠️ speedQuizArticles が存在しません');
        return [];
    }
    
    // 既存のフォルダ選択UIから選択状態を取得
    const selectedFolder = document.getElementById('category-filter')?.value || '';
    const selectedSubfolder = document.getElementById('subfolder-filter')?.value || '';
    
    console.log(`🔍 フィルタリング開始:`, {
        selectedFolder,
        selectedSubfolder,
        totalArticles: window.speedQuizArticles.length
    });
    
    let filteredArticles = window.speedQuizArticles;
    
    // フォルダによるフィルタリング
    if (selectedFolder) {
        // まず全ファイルからの統合データを取得して条文にモジュール情報を付与
        const allAnswerRates = await getAllAnswerRatesFromFiles();
        
        filteredArticles = filteredArticles.filter(article => {
            // speedQuizファイルからmodules配列を取得
            const record = allAnswerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
            const modulePaths = record?.modules || [];
            
            // 選択されたフォルダ名がモジュールパス内に含まれるかチェック
            const folderMatchFound = modulePaths.some(modulePath => {
                // "刑事訴訟法/2.公訴・公判/2.1-6.js" のような形式のパス
                return modulePath.includes(selectedFolder + '/');
            });
            
            // サブフォルダでさらにフィルタリング
            if (folderMatchFound && selectedSubfolder) {
                return modulePaths.some(modulePath => {
                    return modulePath.includes(selectedFolder + '/') && 
                           (modulePath.includes('/' + selectedSubfolder + '/') ||
                            modulePath.includes('/' + selectedSubfolder + '.'));
                });
            }
            
            if (folderMatchFound) {
                console.log(`✅ フォルダマッチ: ${article.lawName}${article.articleNumber}条 -> ${modulePaths.join(', ')}`);
                // 条文にモジュール情報を追加
                article.modules = modulePaths;
                return true;
            }
            
            return false;
        });
    }
    
    console.log(`📂 フィルタ結果:`, {
        selectedFolder,
        selectedSubfolder,
        beforeFilter: window.speedQuizArticles.length,
        afterFilter: filteredArticles.length,
        sampleFiltered: filteredArticles.slice(0, 5).map(a => `${a.lawName}${a.articleNumber}条 (modules: ${a.modules?.join(', ') || 'なし'})`)
    });
    
    return filteredArticles;
}

/**
 * 統計情報を更新（従来の関数・後方互換性のため）
 */
async function updateSpeedQuizStats() {
    try {
        const answerRates = await getAnswerRates();
        updateStatsDisplay(answerRates);
    } catch (error) {
        console.error('❌ 統計更新エラー:', error);
    }
}

/**
 * イベントリスナーを設定
 */
function setupSpeedQuizMainEvents() {
    // スピード条文開始ボタン
    document.getElementById('start-speed-quiz-btn')?.addEventListener('click', startSpeedQuizWithFilters);
    
    // フィルタチェックボックスの変更を監視
    const filterCheckboxes = ['filter-answered', 'filter-accuracy', 'filter-all-wrong'];
    filterCheckboxes.forEach(id => {
        document.getElementById(id)?.addEventListener('change', updateFilteredCount);
    });
    
    // 正答率しきい値の変更を監視
    document.getElementById('accuracy-threshold')?.addEventListener('input', updateFilteredCount);
    
    // 既存のフォルダ選択UIと連携
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    
    console.log('🔗 既存フィルターとの連携を設定:', {
        categoryFilter: !!categoryFilter,
        subfolderFilter: !!subfolderFilter
    });
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', async () => {
            console.log('📁 フォルダ選択変更:', categoryFilter.value);
            await updateArticleList();
            updateFilteredCount();
        });
    }
    
    if (subfolderFilter) {
        subfolderFilter.addEventListener('change', async () => {
            console.log('📂 サブフォルダ選択変更:', subfolderFilter.value);
            await updateArticleList();
            updateFilteredCount();
        });
    }
    
    // 初回フィルタ計算
    setTimeout(updateFilteredCount, 1000);
}

/**
 * フィルタ条件に基づいて問題数を更新
 */
async function updateFilteredCount() {
    try {
        const filteredArticles = await getFilteredArticlesForQuiz();
        const countElement = document.getElementById('filtered-count');
        if (countElement) {
            countElement.textContent = `${filteredArticles.length}件`;
            countElement.className = filteredArticles.length > 0 ? 
                'font-semibold text-blue-600' : 
                'font-semibold text-red-600';
        }
    } catch (error) {
        console.error('❌ フィルタ数計算エラー:', error);
        const countElement = document.getElementById('filtered-count');
        if (countElement) {
            countElement.textContent = 'エラー';
            countElement.className = 'font-semibold text-red-600';
        }
    }
}

/**
 * フィルタ条件に基づいて条文を取得
 */
async function getFilteredArticlesForQuiz() {
    if (!window.speedQuizArticles) {
        console.warn('⚠️ speedQuizArticles が存在しません');
        return [];
    }
    
    // 基本の条文リスト（フォルダフィルタを適用）
    let filteredArticles = await getFilteredArticles();
    
    // 回答済みフィルタ
    const filterAnswered = document.getElementById('filter-answered')?.checked;
    if (filterAnswered) {
        const allAnswerRates = await getAllAnswerRatesFromFiles();
        filteredArticles = filteredArticles.filter(article => {
            const record = allAnswerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
            return record && record.answered > 0;
        });
    }
    
    // 正答率フィルタ
    const filterAccuracy = document.getElementById('filter-accuracy')?.checked;
    if (filterAccuracy) {
        const threshold = parseInt(document.getElementById('accuracy-threshold')?.value || '60');
        const allAnswerRates = await getAllAnswerRatesFromFiles();
        filteredArticles = filteredArticles.filter(article => {
            const record = allAnswerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
            if (!record || record.answered === 0) return false;
            const accuracy = (record.correct / record.answered) * 100;
            return accuracy <= threshold;
        });
    }
    
    // 全回間違えたフィルタ
    const filterAllWrong = document.getElementById('filter-all-wrong')?.checked;
    if (filterAllWrong) {
        const allAnswerRates = await getAllAnswerRatesFromFiles();
        filteredArticles = filteredArticles.filter(article => {
            const record = allAnswerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
            return record && record.answered > 0 && record.correct === 0;
        });
    }
    
    return filteredArticles;
}

/**
 * フィルタ条件を適用してスピードクイズを開始
 */
async function startSpeedQuizWithFilters() {
    try {
        // 開始アニメーションを表示
        showStartAnimation();
        
        // フィルタされた条文を取得
        const filteredArticles = await getFilteredArticlesForQuiz();
        
        console.log(`🎮 スピードクイズ開始: ${filteredArticles.length}件の条文`);
        
        if (filteredArticles.length === 0) {
            hideStartAnimation();
            alert('条件に一致する問題が見つかりませんでした。\nフィルタ条件を調整してください。');
            return;
        }
        
        // スピードクイズページに遷移
        window.speedQuizArticles = filteredArticles;
        window.location.hash = '#/speed-quiz';
        
        // アニメーションを少し遅らせて非表示
        setTimeout(hideStartAnimation, 1500);
        
    } catch (error) {
        console.error('❌ スピードクイズ開始エラー:', error);
        hideStartAnimation();
        alert('スピードクイズの開始に失敗しました。ページを再読み込みしてください。');
    }
}

/**
 * 開始アニメーションを表示
 */
function showStartAnimation() {
    const overlay = document.getElementById('speed-quiz-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

/**
 * 開始アニメーションを非表示
 */
function hideStartAnimation() {
    const overlay = document.getElementById('speed-quiz-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * フィルターUIの動的変更を監視
 */
function setupFilterUIObserver() {
    // MutationObserverでDOM変更を監視
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // フィルター関連の要素が変更された場合
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const target = mutation.target;
                if (target.id === 'category-filter' || 
                    target.id === 'subfolder-filter' ||
                    target.id === 'subfolder-filter-container') {
                    shouldUpdate = true;
                }
            }
        });
        
        if (shouldUpdate) {
            console.log('🔄 フィルターUI変更を検知、条文リストを更新');
            setTimeout(updateArticleList, 100); // 少し遅延させて確実に更新
        }
    });
    
    // フィルター関連の要素を監視対象に追加
    const filterContainer = document.querySelector('[data-testid="filter-grid"], #filter-grid');
    if (filterContainer) {
        observer.observe(filterContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['value', 'selected']
        });
        console.log('🔍 フィルターUI変更監視を開始');
    }
}

/**
 * 設定に基づいてクイズを開始
 */
function startQuizWithSettings(mode) {
    const filteredArticles = getFilteredArticles();
    
    console.log(`🎮 クイズ開始: モード=${mode}, フィルタ済み条文数=${filteredArticles.length}`);
    
    if (filteredArticles.length === 0) {
        const selectedFolder = document.getElementById('category-filter')?.value || '';
        const selectedSubfolder = document.getElementById('subfolder-filter')?.value || '';
        const totalArticles = window.speedQuizArticles ? window.speedQuizArticles.length : 0;
        
        let message = '';
        if (totalArticles === 0) {
            message = '条文データが読み込まれていません。ページを再読み込みしてください。';
        } else if (!selectedFolder) {
            message = '該当する条文がありません。フォルダを選択してください。';
        } else {
            message = `選択されたフォルダ "${selectedFolder}"${selectedSubfolder ? ` / "${selectedSubfolder}"` : ''} には条文がありません。他のフォルダを選択してください。`;
        }
        
        alert(message);
        return;
    }
    
    let targetArticles = [];
    const answerRates = getAnswerRates();
    
    switch (mode) {
        case 'all':
            targetArticles = filteredArticles;
            break;
        case 'weak':
            targetArticles = filteredArticles.filter(article => {
                const record = answerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
                if (!record || record.answered === 0) return true; // 未回答も弱点として扱う
                return (record.correct / record.answered) < 0.6; // 60%未満
            });
            break;
        case 'recent-wrong':
            // 最近間違えた問題のロジック（簡易版）
            targetArticles = filteredArticles.filter(article => {
                const record = answerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
                return record && record.answered > 0 && (record.correct / record.answered) < 1.0;
            });
            break;
    }
    
    if (targetArticles.length === 0) {
        const modeNames = {
            'weak': '弱点',
            'recent-wrong': '最近間違えた',
            'all': '該当する'
        };
        alert(`${modeNames[mode] || '該当する'}条文がありません。`);
        return;
    }
    
    console.log(`✅ クイズ開始: ${targetArticles.length}問の条文クイズ`);
    
    // クイズを開始
    startSpeedQuiz(targetArticles);
}

/**
 * 単一条文のクイズを開始
 */
function startSingleArticleQuiz(lawName, articleNumber, paragraph) {
    const article = window.speedQuizArticles?.find(a => 
        a.lawName === lawName && 
        a.articleNumber === articleNumber && 
        a.paragraph === paragraph
    );
    
    if (!article) {
        alert('条文が見つかりません。');
        return;
    }
    
    startSpeedQuiz([article]);
}

/**
 * 条文詳細を表示
 */
function openArticleDetail(lawName, articleNumber, paragraph) {
    if (window.showArticlePanelWithPreset) {
        window.showArticlePanelWithPreset(lawName, articleNumber, paragraph);
    } else {
        console.error('❌ showArticlePanelWithPreset関数が見つかりません');
        alert('条文詳細表示機能が利用できません。');
    }
}

/**
 * スピードクイズを開始
 */
function startSpeedQuiz(articles) {
    if (!window.startQuiz) {
        console.error('❌ startQuiz関数が見つかりません');
        alert('クイズ機能が利用できません。');
        return;
    }
    
    // 条文問題を作成
    const questions = articles.map(article => ({
        type: '条文',
        question: `${article.lawName}${article.articleNumber}条${article.paragraph !== '1' ? `第${article.paragraph}項` : ''}の内容は？`,
        article: article,
        lawName: article.lawName,
        articleNumber: article.articleNumber,
        paragraph: article.paragraph
    }));
    
    // クイズを開始
    window.startQuiz(questions, {
        mode: 'speed-quiz',
        title: `⚡ スピード条文クイズ (${articles.length}問)`
    });
}

/**
 * 全条文メタデータを読み込み（回答済み問題のみ）
 */
async function loadAllArticlesForSpeedQuiz() {
    // APIから全法令分まとめて取得
    console.log('📚 APIから法律ごとの条文リストを取得中...');
    const SUPPORTED_LAWS = [
        '日本国憲法','日本国憲法の改正手続に関する法律','国会法','内閣法','国家行政組織法','裁判所法','検察庁法','弁護士法','公職選挙法','行政手続法','行政機関の保有する情報の公開に関する法律','行政代執行法','行政不服審査法','行政事件訴訟法','国家賠償法','個人情報の保護に関する法律','地方自治法','民法','民法施行法','一般社団法人及び一般財団法人に関する法律','不動産登記法','動産及び債権の譲渡の対抗要件に関する民法の特例等に関する法律','建物の区分所有等に関する法律','仮登記担保契約に関する法律','身元保証ニ関スル法律','消費者契約法','電子消費者契約に関する民法の特例に関する法律','割賦販売法','特定商取引に関する法律','利息制限法','借地借家法','住宅の品質確保の促進等に関する法律','住宅の品質確保の促進等に関する法律施行令','信託法','失火ノ責任ニ関スル法律','製造物責任法','自動車損害賠償保障法','戸籍法','任意後見契約に関する法律','後見登記等に関する法律','法務局における遺言書の保管等に関する法律','商法','会社法','会社法施行規則','会社計算規則','社債、株式等の振替に関する法律','手形法','小切手法','民事訴訟法','民事訴訟規則','人事訴訟法','人事訴訟規則','民事執行法','民事保全法','刑法','自動車の運転により人を死傷させる行為等の処罰に関する法律','刑事訴訟法','刑事訴訟規則','犯罪捜査のための通信傍受に関する法律','裁判員の参加する刑事裁判に関する法律','検察審査会法','犯罪被害者等の権利利益の保護を図るための刑事手続に付随する措置に関する法律','少年法','刑事収容施設及び被収容者等の処遇に関する法律','警察官職務執行法','破産法','破産規則','民事再生法','民事再生規則','特許法','著作権法'
    ];
    let allArticles = [];
    for (const lawName of SUPPORTED_LAWS) {
        try {
            const res = await fetch(`/api/law-articles/${encodeURIComponent(lawName)}`);
            if (res.ok) {
                const list = await res.json();
                if (Array.isArray(list)) {
                    allArticles = allArticles.concat(list.map(a => ({ ...a, lawName })));
                }
            }
        } catch (e) {
            console.warn(`⚠️ ${lawName} のAPI取得に失敗`, e);
        }
    }
    console.log(`✅ API取得完了: ${allArticles.length}件`);
    return allArticles;
}

/**
 * テキストから条文参照を抽出
 */
function extractArticleReferences(text) {
    const references = [];
    
    // 条文参照パターンを検索
    // 【会社法106条】、【民法264条】、【刑法66条】のようなパターン
    const patterns = [
        /【([^【】]+法)(?:第)?(\d+)条(?:第(\d+)項)?(?:第(\d+)号)?】/g,
        /【([^【】]+法律)(?:第)?(\d+)条(?:第(\d+)項)?(?:第(\d+)号)?】/g,
        /([^\s【】]+法)(?:第)?(\d+)条(?:第(\d+)項)?(?:第(\d+)号)?/g,
        /([^\s【】]+法律)(?:第)?(\d+)条(?:第(\d+)項)?(?:第(\d+)号)?/g
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const lawName = match[1];
            const articleNumber = match[2];
            const paragraph = match[3] || '1';
            const fullMatch = match[0];
            
            // 法律名が適切かチェック（「法」または「法律」で終わる）
            if (lawName && (lawName.endsWith('法') || lawName.endsWith('法律'))) {
                references.push({
                    lawName,
                    articleNumber,
                    paragraph,
                    fullMatch
                });
            }
        }
    }
    
    return references;
}

/**
 * 回答率データを取得（ファイルベースのみ）
 */
async function getAnswerRates() {
    try {
        let answerRates = {};
        
        // 保存されている全法令のファイルから読み込み
        const fileList = await getSpeedQuizFileList();
        for (const lawName of fileList) {
            try {
                const fileData = await loadAnswerRateFromFile(lawName);
                if (fileData && Object.keys(fileData).length > 0) {
                    answerRates[lawName] = fileData;
                }
            } catch (error) {
                console.warn(`⚠️ ${lawName}のファイル読み込みをスキップ:`, error);
            }
        }
        
        return answerRates;
        
    } catch (e) {
        console.error('❌ 回答率データの読み込みに失敗:', e);
        return {};
    }
}

// グローバル関数として公開
window.updateSpeedQuizArticleList = updateArticleList;
window.startSingleArticleQuiz = startSingleArticleQuiz;
window.openArticleDetail = openArticleDetail;
window.updateStatsDisplay = updateStatsDisplay;

// ★★★ ファイルベース保存・読み込み機能 ★★★

/**
 * 指定した法令の回答データをファイルに保存
 */
async function saveAnswerRateToFile(lawName, lawData) {
    try {
        const response = await fetch('/api/speed-quiz/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lawName: lawName,
                data: lawData
            })
        });
        
        if (!response.ok) {
            throw new Error(`保存API エラー: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`📁 ${lawName}のデータをファイルに保存しました: ${result.fileName}`);
        
    } catch (error) {
        console.error(`❌ ${lawName}のファイル保存エラー:`, error);
    }
}

/**
 * 指定した法令の回答データをファイルから読み込み
 */
async function loadAnswerRateFromFile(lawName) {
    try {
        const response = await fetch(`/api/speed-quiz/load/${encodeURIComponent(lawName)}`);
        
        if (!response.ok) {
            throw new Error(`読み込みAPI エラー: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`📂 ${lawName}のデータをファイルから読み込みました`);
        return data;
        
    } catch (error) {
        console.warn(`⚠️ ${lawName}のファイル読み込みエラー:`, error);
        return {};
    }
}

/**
 * 全法令のファイル一覧を取得
 */
async function getSpeedQuizFileList() {
    try {
        const response = await fetch('/api/speed-quiz/list');
        
        if (!response.ok) {
            throw new Error(`一覧取得API エラー: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`📋 スピード条文ファイル一覧: ${result.fileCount}個のファイル`);
        return result.laws;
        
    } catch (error) {
        console.error('❌ ファイル一覧取得エラー:', error);
        return [];
    }
}
