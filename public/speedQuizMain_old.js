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
            
            <!-- モジュール検索・絞り込み -->
            <div class="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-bold mb-4 text-black">� モジュール検索・絞り込み</h3>
                
                <!-- 検索バー -->
                <div class="mb-4">
                    <input type="text" id="module-search" placeholder="🔍 モジュール名で検索..." 
                           class="w-full p-3 border border-gray-300 rounded-lg text-sm">
                </div>
                
                <!-- フォルダ選択 -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">📁 所属フォルダ</label>
                    <select id="folder-filter" class="w-full p-2 border border-gray-300 rounded-md text-sm">
                        <option value="">すべてのフォルダ</option>
                        <!-- 動的に生成 -->
                    </select>
                </div>
                
                <!-- サブフォルダ選択 -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">📂 サブフォルダ</label>
                    <select id="subfolder-filter" class="w-full p-2 border border-gray-300 rounded-md text-sm" disabled>
                        <option value="">サブフォルダを選択...</option>
                        <!-- 動的に生成 -->
                    </select>
                </div>
                
                <!-- モジュール選択 -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">📄 モジュール選択</label>
                    <div id="module-list" class="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                        <div class="text-gray-500 text-sm text-center py-2">読み込み中...</div>
                    </div>
                </div>
                
                <!-- 選択状況表示 -->
                <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div class="text-sm text-blue-800">
                        <div>選択中のモジュール: <span id="selected-module-count" class="font-bold">0</span>個</div>
                        <div>対象条文: <span id="target-article-count" class="font-bold">0</span>件</div>
                    </div>
                </div>
            </div>

            <!-- クイックスタートボタン -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button id="start-all-quiz" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    🎯 全問題
                </button>
                <button id="start-weak-quiz" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    � 弱点問題
                </button>
                <button id="start-recent-wrong-quiz" class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all">
                    🕒 最近間違えた問題
                </button>
            </div>
            
            <!-- 条文一覧表示 -->
            <div id="article-list-section" class="mt-6">
                <h3 class="text-lg font-bold mb-4 text-black">� 条文一覧（法律・条文番号順）</h3>
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
    
    // モジュール・フォルダフィルターを初期化
    await initializeModuleFilters();
    
    // 条文一覧を表示
    updateArticleList();
    
    // イベントリスナーを設定
    setupSpeedQuizMainEvents();
    
    console.log('✅ トップページ用スピード条文セクション初期化完了');
}

/**
 * モジュール・フォルダフィルターを初期化
 */
async function initializeModuleFilters() {
    // ケース一覧を取得してフォルダ構造を構築
    try {
        const { caseSummaries } = await import('./cases/index.js');
        window.allCaseSummaries = caseSummaries;
        
        // フォルダ構造を解析
        const folderStructure = analyzeFolderStructure(caseSummaries);
        window.folderStructure = folderStructure;
        
        // フォルダセレクトボックスを初期化
        populateFolderSelect(folderStructure);
        
        // モジュールリストを初期化
        populateModuleList(caseSummaries);
        
        // 初期選択状況を更新
        updateSelectionStatus();
        
    } catch (error) {
        console.error('❌ モジュールフィルター初期化エラー:', error);
    }
}

/**
 * フォルダ構造を解析
 */
function analyzeFolderStructure(caseSummaries) {
    const structure = {};
    
    caseSummaries.forEach(caseItem => {
        if (caseItem.filePath) {
            const pathParts = caseItem.filePath.split('/');
            
            if (pathParts.length >= 2) {
                const folder = pathParts[0];
                const subfolder = pathParts.length > 2 ? pathParts[1] : null;
                
                if (!structure[folder]) {
                    structure[folder] = {
                        subfolders: new Set(),
                        cases: []
                    };
                }
                
                if (subfolder && pathParts.length > 2) {
                    structure[folder].subfolders.add(subfolder);
                }
                
                structure[folder].cases.push({
                    ...caseItem,
                    folder,
                    subfolder
                });
            }
        }
    });
    
    // Setを配列に変換
    Object.keys(structure).forEach(folder => {
        structure[folder].subfolders = Array.from(structure[folder].subfolders).sort();
    });
    
    return structure;
}

/**
 * フォルダセレクトボックスを初期化
 */
function populateFolderSelect(folderStructure) {
    const folderSelect = document.getElementById('folder-filter');
    if (!folderSelect) return;
    
    const folders = Object.keys(folderStructure).sort();
    folderSelect.innerHTML = '<option value="">すべてのフォルダ</option>' + 
        folders.map(folder => `<option value="${folder}">📁 ${folder}</option>`).join('');
}

/**
 * サブフォルダセレクトボックスを更新
 */
function updateSubfolderSelect(selectedFolder) {
    const subfolderSelect = document.getElementById('subfolder-filter');
    if (!subfolderSelect) return;
    
    if (!selectedFolder || !window.folderStructure[selectedFolder]) {
        subfolderSelect.innerHTML = '<option value="">サブフォルダを選択...</option>';
        subfolderSelect.disabled = true;
        return;
    }
    
    const subfolders = window.folderStructure[selectedFolder].subfolders;
    if (subfolders.length === 0) {
        subfolderSelect.innerHTML = '<option value="">サブフォルダなし</option>';
        subfolderSelect.disabled = true;
        return;
    }
    
    subfolderSelect.innerHTML = '<option value="">すべてのサブフォルダ</option>' + 
        subfolders.map(subfolder => `<option value="${subfolder}">📂 ${subfolder}</option>`).join('');
    subfolderSelect.disabled = false;
}

/**
 * サブフォルダを動的に更新
 */
function populateSubfolders(selectedFolder) {
    const subfolderSelector = document.getElementById('subfolder-selector');
    if (!subfolderSelector) return;
    
    // 「全て」オプションを最初に追加
    subfolderSelector.innerHTML = '<option value="全て">全て</option>';
    
    if (!selectedFolder || selectedFolder === '全て') {
        subfolderSelector.disabled = true;
        return;
    }
    
    // 選択されたフォルダのサブフォルダを取得
    const subfolders = window.folderStructure[selectedFolder] || [];
    
    if (subfolders.length === 0) {
        subfolderSelector.disabled = true;
        return;
    }
    
    // サブフォルダオプションを追加
    subfolders.forEach(subfolder => {
        const option = document.createElement('option');
        option.value = subfolder;
        option.textContent = `📂 ${subfolder}`;
        subfolderSelector.appendChild(option);
    });
    
    subfolderSelector.disabled = false;
}

/**
 * 選択されたモジュールから条文を取得
 */
function getSelectedModuleArticles() {
    const selectedFolder = document.getElementById('folder-selector')?.value || '';
    const selectedSubfolder = document.getElementById('subfolder-selector')?.value || '';
    const searchKeyword = document.getElementById('module-search')?.value.toLowerCase() || '';
    
    if (!window.speedQuizArticles) {
        return [];
    }
    
    // フォルダ/サブフォルダ選択に基づいて条文をフィルタ
    let filteredArticles = window.speedQuizArticles;
    
    if (selectedFolder && selectedFolder !== '全て') {
        filteredArticles = filteredArticles.filter(article => {
            // 対応するケースのファイルパスをチェック
            const caseData = window.cases?.find(c => c.title === article.sourceCase);
            if (!caseData || !caseData.filePath) return false;
            
            const pathParts = caseData.filePath.split('/');
            
            if (selectedSubfolder && selectedSubfolder !== '全て') {
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
    
    // キーワード検索でさらにフィルタ
    if (searchKeyword) {
        filteredArticles = filteredArticles.filter(article => {
            const searchText = `${article.lawName}${article.articleNumber}条`.toLowerCase();
            return searchText.includes(searchKeyword) || 
                   article.content?.toLowerCase().includes(searchKeyword) ||
                   article.sourceCase?.toLowerCase().includes(searchKeyword);
        });
    }
    
    return filteredArticles;
}

/**
 * 選択状況を更新
 */
function updateSelectionStatus() {
    const selectedArticles = getSelectedModuleArticles();
    const selectedFolder = document.getElementById('folder-selector')?.value || '';
    const selectedSubfolder = document.getElementById('subfolder-selector')?.value || '';
    
    // 選択されたフォルダ/サブフォルダに含まれるモジュール数を計算
    let moduleCount = 0;
    if (selectedFolder && selectedFolder !== '全て') {
        const targetCases = window.cases?.filter(c => {
            const pathParts = c.filePath?.split('/') || [];
            if (selectedSubfolder && selectedSubfolder !== '全て') {
                return pathParts.length >= 2 && 
                       pathParts[0] === selectedFolder && 
                       pathParts[1] === selectedSubfolder;
            } else {
                return pathParts[0] === selectedFolder;
            }
        }) || [];
        moduleCount = targetCases.length;
    } else {
        moduleCount = window.cases?.length || 0;
    }
    
    const moduleCountEl = document.getElementById('selected-module-count');
    const articleCountEl = document.getElementById('target-article-count');
    
    if (moduleCountEl) moduleCountEl.textContent = moduleCount;
    if (articleCountEl) articleCountEl.textContent = selectedArticles.length;
}

/**
 * フィルター条件に基づいて条文を取得（新しい実装）
 */
function getFilteredArticles() {
    return getSelectedModuleArticles();
}

/**
 * 条文一覧を表示
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
 * 弱点条文を表示
 */
function updateWeakArticlesDisplay() {
    // この関数は削除されました（新しいレイアウトでは使用しない）
}

/**
 * 条文統計を表示
 */
function updateArticleStatsDisplay() {
    // この関数は削除されました（新しいレイアウトでは使用しない）
}

/**
 * 法令選択チェックボックスを生成
 */
function generateLawSelection() {
    // この関数は削除されました（新しいレイアウトでは使用しない）
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
    
    // フォルダ選択
    document.getElementById('folder-selector')?.addEventListener('change', (e) => {
        populateSubfolders(e.target.value);
        updateSelectionStatus();
        updateArticleList();
    });
    
    // サブフォルダ選択
    document.getElementById('subfolder-selector')?.addEventListener('change', () => {
        updateSelectionStatus();
        updateArticleList();
    });
    
    // モジュール検索
    document.getElementById('module-search')?.addEventListener('input', () => {
        updateSelectionStatus();
        updateArticleList();
    });
    
    // クイックスタートボタン
    document.getElementById('start-all-quiz')?.addEventListener('click', () => startQuizWithSettings('all'));
    document.getElementById('start-weak-quiz')?.addEventListener('click', () => startQuizWithSettings('weak'));
    document.getElementById('start-recent-wrong-quiz')?.addEventListener('click', () => startQuizWithSettings('recent-wrong'));
}

/**
 * 設定に基づいてクイズを開始
 */
function startQuizWithSettings(mode) {
    const filteredArticles = getFilteredArticles();
    
    if (filteredArticles.length === 0) {
        alert('対象となる条文がありません。検索条件を確認してください。');
        return;
    }
    
    let settings = {
        mode: mode,
        timeLimit: 10,
        questionCount: 20,
        targetArticles: filteredArticles,
        filterWeak: false,
        filterRecentWrong: false
    };
    
    // モード別の設定調整
    if (mode === 'all') {
        // 全問題モード：フィルター済みの全条文を対象
        settings.filterWeak = false;
        settings.filterRecentWrong = false;
    } else if (mode === 'weak') {
        // 弱点問題モード：正答率60%未満の条文のみ
        settings.filterWeak = true;
    } else if (mode === 'recent-wrong') {
        // 最近間違えた問題モード
        settings.filterRecentWrong = true;
    }
    
    // 設定を適用してクイズを開始
    console.log('🎯 クイズ開始設定:', settings);
    
    // クイズページに遷移
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
 * 単体条文でクイズを開始
 */
function startSingleArticleQuiz(lawName, articleNumber, paragraph) {
    console.log(`🎯 単体条文クイズ開始: ${lawName}${articleNumber}条${paragraph !== '1' ? `第${paragraph}項` : ''}`);
    
    // 該当条文のみでクイズを開始
    const settings = {
        mode: 'single',
        timeLimit: 10,
        questionCount: 1,
        targetArticle: {
            lawName,
            articleNumber: parseInt(articleNumber),
            paragraph: parseInt(paragraph)
        }
    };
    
    startFilteredSpeedQuiz(settings);
}

/**
 * 条文詳細を表示（将来の拡張用）
 */
function openArticleDetail(lawName, articleNumber, paragraph) {
    console.log(`📖 条文詳細表示: ${lawName}${articleNumber}条${paragraph !== '1' ? `第${paragraph}項` : ''}`);
    
    // 条文ポップアップ表示（articlePanel.jsの関数を利用）
    if (window.showArticlePanelWithPreset) {
        window.showArticlePanelWithPreset(lawName, articleNumber);
    } else {
        alert('条文ポップアップ機能が利用できません');
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

// グローバル関数として公開
window.startSingleArticleQuiz = startSingleArticleQuiz;
window.openArticleDetail = openArticleDetail;
window.startLawSpecificQuiz = function(lawName) {
    const settings = {
        mode: 'law-specific',
        timeLimit: 10,
        questionCount: 20,
        selectedLaws: [lawName]
    };
    startFilteredSpeedQuiz(settings);
};
