// speedQuizMain.js - トップページ用スピード条文コンポーネント

/**
 * トップページ用スピード条文セクションを作成
 */
export function createSpeedQuizMainSection() {
    const sectionHtml = `
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6 text-black">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-gray-800">⚡ スピード条文</h2>
                <button id="speed-quiz-settings" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                    ⚙️ 設定
                </button>
            </div>
            
            <!-- 統計情報 -->
            <div id="speed-quiz-stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                    <div class="text-sm opacity-90">総回答数</div>
                    <div class="text-2xl font-bold" id="total-answered">0</div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                    <div class="text-sm opacity-90">正答率</div>
                    <div class="text-2xl font-bold" id="total-accuracy">0%</div>
                </div>
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                    <div class="text-sm opacity-90">学習法令数</div>
                    <div class="text-2xl font-bold" id="studied-laws">0</div>
                </div>
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
                    <div class="text-sm opacity-90">弱点条文</div>
                    <div class="text-2xl font-bold" id="weak-articles">0</div>
                </div>
            </div>

            <!-- クイックスタートボタン -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button id="start-all-quiz" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    🎯 全問題
                </button>
                <button id="start-weak-quiz" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    📊 弱点問題
                </button>
                <button id="start-recent-wrong-quiz" class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    🕒 最近間違えた問題
                </button>
            </div>
            
            <!-- 条文一覧表示 -->
            <div id="article-list-section" class="mt-6">
                <h3 class="text-lg font-bold mb-4 text-black">📋 条文一覧（法律・条文番号順）</h3>
                <div class="mb-4 text-sm text-gray-600">
                    表示中の条文数: <span id="displayed-article-count">0</span>件
                </div>
                <div id="article-list" class="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    <!-- 動的に生成 -->
                </div>
            </div>
        </div>
    `;
    
    return sectionHtml;
}

/**
 * トップページ用スピード条文セクションを初期化
 * 既存のフォルダ選択UIを流用する
 */
export async function initializeSpeedQuizMainSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ コンテナが見つかりません:', containerId);
        return;
    }
    
    // HTML挿入
    container.innerHTML = createSpeedQuizMainSection();
    
    console.log('🎮 トップページ用スピード条文セクション初期化開始');
    
    // 条文メタデータを読み込み
    console.log('📚 全条文メタデータを読み込み中...');
    window.speedQuizArticles = await loadAllArticlesForSpeedQuiz();
    console.log(`✅ 条文メタデータ読み込み完了: ${window.speedQuizArticles?.length || 0}件`);
    
    // 統計情報を更新
    updateSpeedQuizStats();
    
    // 条文一覧を初回表示（全条文）
    updateArticleList();
    
    // イベントリスナーを設定
    setupSpeedQuizMainEvents();
    
    console.log('✅ トップページ用スピード条文セクション初期化完了');
}

/**
 * 条文一覧を表示（既存のフォルダ選択UIと連携）
 */
function updateArticleList() {
    const filteredArticles = getFilteredArticles();
    const articleList = document.getElementById('article-list');
    const articleCount = document.getElementById('displayed-article-count');
    
    if (!articleList) return;
    
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
        articleList.innerHTML = '<p class="text-gray-500 text-center py-4">該当する条文がありません</p>';
        return;
    }
    
    // 条文一覧を表示
    articleList.innerHTML = filteredArticles.map(article => {
        const displayName = `${article.lawName}${article.articleNumber}条${article.paragraph !== '1' ? `第${article.paragraph}項` : ''}`;
        const answerRates = getAnswerRates();
        const record = answerRates[article.lawName]?.[article.articleNumber]?.[article.paragraph];
        
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
                        <div class="text-xs text-gray-600">${article.sourceCase || '不明なモジュール'}</div>
                        ${statsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 既存のフォルダ選択UIと連携して条文をフィルタ
 */
function getFilteredArticles() {
    if (!window.speedQuizArticles) {
        return [];
    }
    
    // 既存のフォルダ選択UIから選択状態を取得
    const selectedFolder = document.getElementById('category-filter')?.value || '';
    const selectedSubfolder = document.getElementById('subfolder-filter')?.value || '';
    
    let filteredArticles = window.speedQuizArticles;
    
    // フォルダによるフィルタリング
    if (selectedFolder) {
        filteredArticles = filteredArticles.filter(article => {
            // 対応するケースのファイルパスをチェック
            const caseData = window.cases?.find(c => c.title === article.sourceCase);
            if (!caseData || !caseData.filePath) return false;
            
            const pathParts = caseData.filePath.split('/');
            
            if (selectedSubfolder) {
                // サブフォルダまで指定されている場合
                return pathParts.length >= 2 && 
                       pathParts[0] === selectedFolder && 
                       pathParts[1] === selectedSubfolder;
            } else {
                // フォルダのみ指定されている場合
                return pathParts[0] === selectedFolder;
            }
        });
    }
    
    return filteredArticles;
}

/**
 * 統計情報を更新
 */
function updateSpeedQuizStats() {
    const answerRates = getAnswerRates();
    let totalAnswered = 0;
    let totalCorrect = 0;
    let studiedLaws = 0;
    let weakArticles = 0;
    
    for (const lawName in answerRates) {
        studiedLaws++;
        for (const articleNumber in answerRates[lawName]) {
            for (const paragraph in answerRates[lawName][articleNumber]) {
                const record = answerRates[lawName][articleNumber][paragraph];
                totalAnswered += record.answered;
                totalCorrect += record.correct;
                
                const accuracy = record.answered > 0 ? (record.correct / record.answered) * 100 : 0;
                if (accuracy < 60) {
                    weakArticles++;
                }
            }
        }
    }
    
    const totalAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    
    // DOM更新
    document.getElementById('total-answered').textContent = totalAnswered;
    document.getElementById('total-accuracy').textContent = totalAccuracy + '%';
    document.getElementById('studied-laws').textContent = studiedLaws;
    document.getElementById('weak-articles').textContent = weakArticles;
}

/**
 * イベントリスナーを設定
 */
function setupSpeedQuizMainEvents() {
    // 設定ボタン
    document.getElementById('speed-quiz-settings')?.addEventListener('click', () => {
        const panel = document.getElementById('speed-quiz-settings-panel');
        panel?.classList.toggle('hidden');
    });
    
    // クイックスタートボタン
    document.getElementById('start-all-quiz')?.addEventListener('click', () => startQuizWithSettings('all'));
    document.getElementById('start-weak-quiz')?.addEventListener('click', () => startQuizWithSettings('weak'));
    document.getElementById('start-recent-wrong-quiz')?.addEventListener('click', () => startQuizWithSettings('recent-wrong'));
    
    // 既存のフォルダ選択UIと連携
    // category-filterとsubfolder-filterの変更を監視して条文リストを更新
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updateArticleList);
    }
    
    if (subfolderFilter) {
        subfolderFilter.addEventListener('change', updateArticleList);
    }
}

/**
 * 設定に基づいてクイズを開始
 */
function startQuizWithSettings(mode) {
    const filteredArticles = getFilteredArticles();
    
    if (filteredArticles.length === 0) {
        alert('該当する条文がありません。フォルダを選択してください。');
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
        alert(`${mode === 'weak' ? '弱点' : '該当する'}条文がありません。`);
        return;
    }
    
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
 * 全条文メタデータを読み込み
 */
async function loadAllArticlesForSpeedQuiz() {
    if (!window.cases) {
        console.warn('⚠️ ケースデータが読み込まれていません');
        return [];
    }
    
    const articles = [];
    
    for (const caseData of window.cases) {
        if (caseData.questions) {
            for (const question of caseData.questions) {
                if (question.type === '条文' && question.article) {
                    const article = {
                        lawName: question.article.lawName,
                        articleNumber: question.article.articleNumber,
                        paragraph: question.article.paragraph || '1',
                        content: question.article.content,
                        sourceCase: caseData.title
                    };
                    
                    articles.push(article);
                }
            }
        }
    }
    
    // 重複除去
    const uniqueArticles = [];
    const seen = new Set();
    for (const article of articles) {
        const key = `${article.lawName}-${article.articleNumber}-${article.paragraph}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueArticles.push(article);
        }
    }
    
    return uniqueArticles;
}

/**
 * 回答率データを取得
 */
function getAnswerRates() {
    try {
        return JSON.parse(localStorage.getItem('answerRates') || '{}');
    } catch (e) {
        console.error('❌ 回答率データの読み込みに失敗:', e);
        return {};
    }
}
