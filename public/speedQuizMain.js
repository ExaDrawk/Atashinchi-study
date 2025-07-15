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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button id="start-all-quiz" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    🎯 全問題
                </button>
                <button id="start-weak-quiz" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    📉 弱点問題
                </button>
                <button id="start-no-paragraph-quiz" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    📝 条文のみ
                </button>
                <button id="start-custom-quiz" class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    🎛️ カスタム
                </button>
            </div>
            
            <!-- 設定パネル -->
            <div id="speed-quiz-settings-panel" class="hidden bg-gray-50 rounded-lg p-4 mb-4 text-black">
                <h3 class="text-lg font-bold mb-4 text-black">🎛️ クイズ設定</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- 法令選択 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">📚 法令選択</label>
                        <div id="law-selection" class="space-y-2 max-h-32 overflow-y-auto">
                            <!-- 動的に生成 -->
                        </div>
                    </div>
                    
                    <!-- 難易度・フィルタ -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">🎯 難易度・フィルタ</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="filter-weak" class="mr-2">
                                <span class="text-sm">正答率60%未満のみ</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="filter-no-paragraph" class="mr-2">
                                <span class="text-sm">項番号なしのみ</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="filter-recent" class="mr-2">
                                <span class="text-sm">最近間違えた問題</span>
                            </label>
                        </div>
                        
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">⏰ 制限時間</label>
                            <select id="time-limit" class="w-full p-2 border border-gray-300 rounded-md">
                                <option value="5">5秒</option>
                                <option value="10" selected>10秒</option>
                                <option value="15">15秒</option>
                                <option value="20">20秒</option>
                            </select>
                        </div>
                        
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">📊 問題数</label>
                            <select id="question-count" class="w-full p-2 border border-gray-300 rounded-md">
                                <option value="10">10問</option>
                                <option value="20" selected>20問</option>
                                <option value="30">30問</option>
                                <option value="50">50問</option>
                                <option value="all">全問題</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end space-x-4">
                    <button id="cancel-settings" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                        キャンセル
                    </button>
                    <button id="start-custom-quiz-final" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
                        🎯 開始
                    </button>
                </div>
            </div>
            
            <!-- 法令別正答率表示 -->
            <div id="law-accuracy-section" class="mt-6">
                <h3 class="text-lg font-bold mb-4 text-black">📊 法令別正答率</h3>
                <div id="law-accuracy-list" class="space-y-2">
                    <!-- 動的に生成 -->
                </div>
            </div>
            
            <!-- 弱点条文表示 -->
            <div id="weak-articles-section" class="mt-6">
                <h3 class="text-lg font-bold mb-4 text-black">📉 弱点条文（正答率60%未満）</h3>
                <div id="weak-articles-list" class="space-y-2">
                    <!-- 動的に生成 -->
                </div>
            </div>
        </div>
    `;
    
    return sectionHtml;
}

/**
 * トップページ用スピード条文セクションを初期化
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
    
    // 法令別正答率を表示
    updateLawAccuracyDisplay();
    
    // 弱点条文を表示
    updateWeakArticlesDisplay();
    
    // 法令選択チェックボックスを生成
    generateLawSelection();
    
    // イベントリスナーを設定
    setupSpeedQuizMainEvents();
    
    console.log('✅ トップページ用スピード条文セクション初期化完了');
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
 * 法令別正答率を表示
 */
function updateLawAccuracyDisplay() {
    const answerRates = getAnswerRates();
    const lawAccuracyList = document.getElementById('law-accuracy-list');
    
    if (!lawAccuracyList) return;
    
    const lawStats = [];
    
    for (const lawName in answerRates) {
        let lawAnswered = 0;
        let lawCorrect = 0;
        
        for (const articleNumber in answerRates[lawName]) {
            for (const paragraph in answerRates[lawName][articleNumber]) {
                const record = answerRates[lawName][articleNumber][paragraph];
                lawAnswered += record.answered;
                lawCorrect += record.correct;
            }
        }
        
        const accuracy = lawAnswered > 0 ? Math.round((lawCorrect / lawAnswered) * 100) : 0;
        lawStats.push({ lawName, accuracy, answered: lawAnswered, correct: lawCorrect });
    }
    
    // 正答率でソート
    lawStats.sort((a, b) => b.accuracy - a.accuracy);
    
    lawAccuracyList.innerHTML = lawStats.map(stat => `
        <div class="flex items-center justify-between p-3 bg-white rounded-lg border text-black hover:bg-blue-50 cursor-pointer transition-colors" data-law-name="${stat.lawName}" onclick="startLawSpecificQuiz('${stat.lawName}')">
            <div class="flex items-center">
                <span class="font-medium text-black">${stat.lawName}</span>
                <span class="text-sm text-gray-500 ml-2">${stat.correct}/${stat.answered}</span>
                <span class="text-xs text-blue-600 ml-2">📚 クリックでクイズ</span>
            </div>
            <div class="flex items-center">
                <div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div class="bg-${stat.accuracy >= 80 ? 'green' : stat.accuracy >= 60 ? 'yellow' : 'red'}-500 h-2 rounded-full" style="width: ${stat.accuracy}%"></div>
                </div>
                <span class="text-sm font-medium text-black">${stat.accuracy}%</span>
            </div>
        </div>
    `).join('');
}

/**
 * 弱点条文を表示
 */
function updateWeakArticlesDisplay() {
    const answerRates = getAnswerRates();
    const weakArticlesList = document.getElementById('weak-articles-list');
    
    if (!weakArticlesList) return;
    
    const weakArticles = [];
    
    for (const lawName in answerRates) {
        for (const articleNumber in answerRates[lawName]) {
            for (const paragraph in answerRates[lawName][articleNumber]) {
                const record = answerRates[lawName][articleNumber][paragraph];
                const accuracy = record.answered > 0 ? (record.correct / record.answered) * 100 : 0;
                
                if (accuracy < 60 && record.answered >= 2) {
                    weakArticles.push({
                        lawName,
                        articleNumber,
                        paragraph,
                        accuracy: Math.round(accuracy),
                        answered: record.answered,
                        correct: record.correct
                    });
                }
            }
        }
    }
    
    // 正答率でソート（低い順）
    weakArticles.sort((a, b) => a.accuracy - b.accuracy);
    
    if (weakArticles.length === 0) {
        weakArticlesList.innerHTML = '<p class="text-gray-500 text-center py-4">弱点条文はありません！</p>';
        return;
    }
    
    weakArticlesList.innerHTML = weakArticles.slice(0, 10).map(article => `
        <div class="flex items-center justify-between p-3 bg-white rounded-lg border text-black">
            <div class="flex items-center">
                <span class="font-medium text-black">${article.lawName}${article.articleNumber}条${article.paragraph !== '1' ? `第${article.paragraph}項` : ''}</span>
                <span class="text-sm text-gray-500 ml-2">${article.correct}/${article.answered}</span>
            </div>
            <div class="flex items-center">
                <div class="w-16 bg-gray-200 rounded-full h-2 mr-3">
                    <div class="bg-red-500 h-2 rounded-full" style="width: ${article.accuracy}%"></div>
                </div>
                <span class="text-sm font-medium text-red-600">${article.accuracy}%</span>
            </div>
        </div>
    `).join('');
}

/**
 * 法令選択チェックボックスを生成
 */
function generateLawSelection() {
    const answerRates = getAnswerRates();
    const lawSelection = document.getElementById('law-selection');
    
    if (!lawSelection) return;
    
    const availableLaws = Object.keys(answerRates);
    
    if (availableLaws.length === 0) {
        lawSelection.innerHTML = '<p class="text-gray-500 text-sm">まだ学習データがありません</p>';
        return;
    }
    
    lawSelection.innerHTML = availableLaws.map(lawName => `
        <label class="flex items-center">
            <input type="checkbox" class="law-checkbox mr-2" value="${lawName}" checked>
            <span class="text-sm">${lawName}</span>
        </label>
    `).join('');
}

/**
 * イベントリスナーを設定
 */
function setupSpeedQuizMainEvents() {
    // 設定ボタン
    document.getElementById('speed-quiz-settings').addEventListener('click', () => {
        const panel = document.getElementById('speed-quiz-settings-panel');
        panel.classList.toggle('hidden');
    });
    
    // 設定キャンセル
    document.getElementById('cancel-settings').addEventListener('click', () => {
        document.getElementById('speed-quiz-settings-panel').classList.add('hidden');
    });
    
    // クイックスタートボタン
    document.getElementById('start-all-quiz').addEventListener('click', () => startQuizWithSettings('all'));
    document.getElementById('start-weak-quiz').addEventListener('click', () => startQuizWithSettings('weak'));
    document.getElementById('start-no-paragraph-quiz').addEventListener('click', () => startQuizWithSettings('no-paragraph'));
    document.getElementById('start-custom-quiz').addEventListener('click', () => {
        document.getElementById('speed-quiz-settings-panel').classList.remove('hidden');
    });
    document.getElementById('start-custom-quiz-final').addEventListener('click', () => startQuizWithSettings('custom'));
}

/**
 * 設定に基づいてクイズを開始
 */
function startQuizWithSettings(mode) {
    let settings = {
        mode: mode,
        timeLimit: parseInt(document.getElementById('time-limit')?.value || '10'),
        questionCount: document.getElementById('question-count')?.value || '20',
        filterWeak: false,
        filterNoParagraph: false,
        filterRecent: false,
        selectedLaws: []
    };
    
    // モード別の設定調整
    if (mode === 'all') {
        // 全問題モード：すべてのフィルタを無効化
        settings.filterWeak = false;
        settings.filterNoParagraph = false;
        settings.filterRecent = false;
        settings.selectedLaws = []; // 法令フィルタも無効化
    } else if (mode === 'weak') {
        // 弱点問題モード
        settings.filterWeak = true;
        settings.selectedLaws = Array.from(document.querySelectorAll('.law-checkbox:checked')).map(cb => cb.value);
    } else if (mode === 'no-paragraph') {
        // 条文のみモード
        settings.filterNoParagraph = true;
        settings.selectedLaws = Array.from(document.querySelectorAll('.law-checkbox:checked')).map(cb => cb.value);
    } else if (mode === 'custom') {
        // カスタムモード：設定パネルの値を使用
        settings.filterWeak = document.getElementById('filter-weak')?.checked || false;
        settings.filterNoParagraph = document.getElementById('filter-no-paragraph')?.checked || false;
        settings.filterRecent = document.getElementById('filter-recent')?.checked || false;
        settings.selectedLaws = Array.from(document.querySelectorAll('.law-checkbox:checked')).map(cb => cb.value);
    }
    
    // 設定を適用してクイズを開始
    console.log('🎯 クイズ開始設定:', settings);
    
    // 設定パネルを閉じる
    document.getElementById('speed-quiz-settings-panel').classList.add('hidden');
    
    // クイズページに遷移（実装は別途）
    startFilteredSpeedQuiz(settings);
}

/**
 * 正答率データを取得（speedQuiz.jsから）
 */
function getAnswerRates(lawName = null) {
    try {
        const storageKey = 'speedQuizAnswerRates';
        const existingData = localStorage.getItem(storageKey);
        
        if (!existingData) {
            return {};
        }
        
        const answerRates = JSON.parse(existingData);
        
        if (lawName) {
            const normalizedLawName = normalizeLawName(lawName);
            return answerRates[normalizedLawName] || {};
        }
        
        return answerRates;
    } catch (error) {
        console.error('❌ 正答率取得エラー:', error);
        return {};
    }
}

/**
 * 法令名を正規化（speedQuiz.jsから）
 */
function normalizeLawName(lawName) {
    if (!lawName) return 'その他';
    
    const normalizations = {
        '日本国憲法': '憲法',
        '憲法': '憲法',
        '民法': '民法',
        '刑法': '刑法',
        '商法': '商法',
        '会社法': '会社法',
        '民事訴訟法': '民事訴訟法',
        '刑事訴訟法': '刑事訴訟法',
        '行政法': '行政法'
    };
    
    for (const [key, value] of Object.entries(normalizations)) {
        if (lawName.includes(key)) {
            return value;
        }
    }
    
    return lawName;
}

/**
 * フィルタリングされたスピードクイズを開始
 */
function startFilteredSpeedQuiz(settings) {
    // この関数をspeedQuiz.jsから動的にインポート
    import('./speedQuiz.js').then(module => {
        if (module.startFilteredSpeedQuiz) {
            module.startFilteredSpeedQuiz(settings);
        } else {
            console.error('❌ startFilteredSpeedQuiz関数が見つかりません');
            alert('スピードクイズ機能の読み込みに失敗しました。');
        }
    }).catch(error => {
        console.error('❌ speedQuiz.jsのインポートエラー:', error);
        alert('スピードクイズ機能の読み込みに失敗しました。');
    });
}

/**
 * 特定の法律のみでスピードクイズを開始
 * @param {string} lawName - 法律名
 */
window.startLawSpecificQuiz = function(lawName) {
    console.log(`📚 ${lawName}専用スピードクイズを開始`);
    console.log('🔍 現在のURL:', window.location.href);
    console.log('🔍 現在のhash:', window.location.hash);
    
    // 確認ダイアログ
    if (!confirm(`${lawName}の条文のみでスピードクイズを開始しますか？`)) {
        console.log('❌ ユーザーがキャンセルしました');
        return;
    }
    
    // 法律名を含む設定オブジェクトを作成
    const settings = {
        specificLaw: lawName,
        timeLimit: 10,
        questionCount: 20
    };
    
    // スピードクイズページに遷移し、法律名をパラメータとして渡す
    const newHash = `#/speed-quiz?law=${encodeURIComponent(lawName)}`;
    console.log('🔄 新しいURLに遷移:', newHash);
    
    try {
        // 一度URLを変更してから関数を呼び出す
        window.location.hash = newHash;
        console.log('✅ URL変更完了');
        
        // 少し遅延させてからspeedQuizを開始する（URLの変更が適用されるのを待つ）
        setTimeout(() => {
            // フィルタリングされた設定でスピードクイズを開始
            startFilteredSpeedQuiz(settings);
        }, 200);
    } catch (error) {
        console.error('❌ URL変更エラー:', error);
    }
};

/**
 * 特定の法律の条文のみをフィルタリング
 * @param {string} lawName - 法律名
 * @returns {Array} フィルタリングされた条文
 */
export function filterArticlesByLaw(lawName) {
    if (!window.speedQuizArticles || !Array.isArray(window.speedQuizArticles)) {
        console.warn('⚠️ 条文データが利用できません');
        return [];
    }
    
    const filteredArticles = window.speedQuizArticles.filter(article => {
        return article.lawName === lawName;
    });
    
    console.log(`📊 ${lawName}の条文: ${filteredArticles.length}件`);
    return filteredArticles;
}

/**
 * 全ケースから条文メタデータを抽出してスピードクイズ用データを作成
 * 注意: 条文の本文は事前に取得せず、ゲーム中にオンデマンドで取得する
 */
export async function loadAllArticlesForSpeedQuiz() {
    console.log('🔄 全ケースから条文メタデータを読み込み中...');
    
    try {
        // ケース一覧を取得
        const { caseSummaries } = await import('./cases/index.js');
        console.log(`📚 読み込み対象ケース: ${caseSummaries.length}件`);
        
        const allArticles = [];
        let processedCases = 0;
        let extractedArticles = 0;
        
        // 各ケースから条文を抽出
        for (const caseSummary of caseSummaries) {
            try {
                console.log(`🔍 ケース処理中: ${caseSummary.title}`);
                
                // ケースデータを動的にインポート
                const caseModule = await import(`./cases/${caseSummary.filePath}`);
                const caseData = caseModule.default;
                
                if (caseData) {
                    // 条文メタデータを抽出（本文は取得しない）
                    const { extractAllArticles } = await import('./speedQuiz.js');
                    const articles = await extractAllArticles(caseData);
                    
                    if (articles && articles.length > 0) {
                        // 重複除去のため、displayTextをキーとして使用
                        for (const article of articles) {
                            const existing = allArticles.find(a => a.displayText === article.displayText);
                            if (!existing) {
                                allArticles.push({
                                    ...article,
                                    sourceCase: caseSummary.title, // 出典ケースを記録
                                    sourceCaseId: caseSummary.id
                                });
                                extractedArticles++;
                            }
                        }
                    }
                }
                processedCases++;
                
                // 進捗表示（10件ごと）
                if (processedCases % 10 === 0) {
                    console.log(`📊 進捗: ${processedCases}/${caseSummaries.length}件処理済み`);
                }
                
            } catch (error) {
                console.warn(`⚠️ ケース処理エラー: ${caseSummary.title} - ${error.message}`);
            }
        }
        
        console.log(`✅ 条文メタデータ読み込み完了: ${allArticles.length}件の条文を${processedCases}件のケースから抽出`);
        console.log(`📊 詳細: 処理ケース=${processedCases}, 抽出条文=${extractedArticles}, 重複除去後=${allArticles.length}`);
        
        return allArticles;
        
    } catch (error) {
        console.error('❌ 全条文メタデータ読み込みエラー:', error);
        return [];
    }
}
