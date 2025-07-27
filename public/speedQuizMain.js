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
    // 回答済み条文データを読み込み
    window.speedQuizArticles = await loadAllArticlesForSpeedQuiz();
    // 統計情報を更新
    updateSpeedQuizStats();
    // フィルターUIが利用可能になるまで簡易的に待機
    await new Promise(resolve => setTimeout(resolve, 100));
    // 条文一覧を初回表示
    updateArticleList();
    // イベントリスナーを設定
    setupSpeedQuizMainEvents();
}

/**
 * 条文一覧を表示（既存のフォルダ選択UIと連携）
 */
function updateArticleList() {
    const filteredArticles = getFilteredArticles();
    const articleList = document.getElementById('article-list');
    const articleCount = document.getElementById('displayed-article-count');
    
    if (!articleList) {
        console.error('❌ article-list要素が見つかりません - HTMLが正しく生成されていない可能性があります');
        // HTMLを再生成してみる
        const container = document.getElementById('speed-quiz-main-section');
        if (container) {
            container.innerHTML = createSpeedQuizMainSection();
            setTimeout(() => updateArticleList(), 100); // 少し遅延後に再試行
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
        console.warn('⚠️ speedQuizArticles が存在しません');
        return [];
    }
    
    // 既存のフォルダ選択UIから選択状態を取得
    const selectedFolder = document.getElementById('category-filter')?.value || '';
    const selectedSubfolder = document.getElementById('subfolder-filter')?.value || '';
    
    console.log(`🔍 フィルタリング開始:`, {
        selectedFolder,
        selectedSubfolder,
        totalArticles: window.speedQuizArticles.length,
        sampleArticles: window.speedQuizArticles.slice(0, 3).map(a => ({
            lawName: a.lawName,
            articleNumber: a.articleNumber,
            category: a.category,
            sourceCaseId: a.sourceCaseId
        }))
    });
    
    let filteredArticles = window.speedQuizArticles;
    
    // フォルダによるフィルタリング
    if (selectedFolder) {
        filteredArticles = filteredArticles.filter(article => {
            // caseSummariesから対応するケースを検索
            const caseSummaries = window.caseSummaries || [];
            const caseData = caseSummaries.find(c => c.title === article.sourceCase || c.id === article.sourceCaseId);
            
            if (!caseData) {
                console.warn(`⚠️ ケースが見つかりません: ${article.sourceCase || article.sourceCaseId}`);
                return false;
            }
            
            // フォルダ名とカテゴリのマッピングを確認
            // 選択されたフォルダ名が実際のカテゴリ名と一致するか、またはファイルパスに含まれるかチェック
            let matchesCategory = false;
            
            // 1. 直接的なカテゴリマッチ
            if (caseData.category === selectedFolder) {
                matchesCategory = true;
            }
            
            // 2. ファイルパスベースのマッチ（フォルダ名が含まれる場合）
            if (caseData.filePath && caseData.filePath.includes(selectedFolder + '/')) {
                matchesCategory = true;
            }
            
            // 3. ケースIDベースのマッチ
            if (caseData.id && caseData.id.startsWith(selectedFolder + '/')) {
                matchesCategory = true;
            }
            
            // 4. 特別なマッピング（商法 -> kaishaho など）
            const folderCategoryMapping = {
                '商法': 'kaishaho',
                '刑法': '刑法',
                '民法': '民法',
                '憲法': '憲法'
            };
            
            if (folderCategoryMapping[selectedFolder] && caseData.category === folderCategoryMapping[selectedFolder]) {
                matchesCategory = true;
            }
            
            if (!matchesCategory) {
                return false;
            }
            
            // サブフォルダでフィルタリング
            if (selectedSubfolder) {
                // ケースIDからサブフォルダを推定
                if (caseData.id && caseData.id.includes('/')) {
                    const pathParts = caseData.id.split('/');
                    if (pathParts.length >= 2) {
                        const caseSubfolder = pathParts[1];
                        return caseSubfolder === selectedSubfolder;
                    }
                }
                
                // または、明示的なsubfolderプロパティをチェック
                if (caseData.subfolder) {
                    return caseData.subfolder === selectedSubfolder;
                }
                
                // またはファイルパスからサブフォルダを抽出
                if (caseData.filePath && caseData.filePath.includes('/')) {
                    const pathParts = caseData.filePath.split('/');
                    if (pathParts.length >= 2) {
                        const fileSubfolder = pathParts[1];
                        return fileSubfolder === selectedSubfolder;
                    }
                }
                
                // サブフォルダが指定されているが、ケースにサブフォルダ情報がない場合は除外
                return false;
            }
            
            return true;
        });
    }
    
    console.log(`📂 フィルタ結果:`, {
        selectedFolder,
        selectedSubfolder,
        beforeFilter: window.speedQuizArticles.length,
        afterFilter: filteredArticles.length,
        sampleFiltered: filteredArticles.slice(0, 5).map(a => `${a.lawName}${a.articleNumber}条 (${a.sourceCase})`)
    });
    
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
    
    console.log('🔗 既存フィルターとの連携を設定:', {
        categoryFilter: !!categoryFilter,
        subfolderFilter: !!subfolderFilter
    });
    
    if (categoryFilter) {
        // 既存のイベントリスナーに追加で条文リスト更新を設定
        categoryFilter.addEventListener('change', () => {
            console.log('📁 フォルダ選択変更:', categoryFilter.value);
            updateArticleList();
        });
    }
    
    if (subfolderFilter) {
        // 既存のイベントリスナーに追加でアーticleリスト更新を設定
        subfolderFilter.addEventListener('change', () => {
            console.log('📂 サブフォルダ選択変更:', subfolderFilter.value);
            updateArticleList();
        });
    }
    
    // MutationObserverでフィルターUIの変更を監視
    setupFilterUIObserver();
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
 * 回答率データを取得
 */
function getAnswerRates() {
    try {
        return JSON.parse(localStorage.getItem('speedQuizAnswerRates') || '{}');
    } catch (e) {
        console.error('❌ 回答率データの読み込みに失敗:', e);
        return {};
    }
}

// グローバル関数として公開
window.updateSpeedQuizArticleList = updateArticleList;
window.startSingleArticleQuiz = startSingleArticleQuiz;
window.openArticleDetail = openArticleDetail;
