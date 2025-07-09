// speedQuiz.js - スピード条文ゲームモジュール

/**
 * モジュール内の全条文を抽出
 * @param {Object} caseData - ケースデータ
 * @returns {Array} 条文リスト
 */
export async function extractAllArticles(caseData) {
    // caseDataのnullチェック
    if (!caseData) {
        console.warn('⚠️ caseDataがnullまたはundefinedです');
        return [];
    }
    
    const articles = new Set();
    const texts = [];
    
    // ストーリーから抽出
    if (caseData.story) {
        caseData.story.forEach(item => {
            if (item.text) texts.push(item.text);
            if (item.dialogue) texts.push(item.dialogue);
        });
    }
    
    // 解説から抽出
    if (caseData.explanation) {
        texts.push(caseData.explanation);
    }
    
    // クイズから抽出
    if (caseData.quiz) {
        caseData.quiz.forEach(quiz => {
            if (quiz.problem) texts.push(quiz.problem);
            if (quiz.modelAnswer) texts.push(quiz.modelAnswer);
            if (quiz.subProblems) {
                quiz.subProblems.forEach(sub => {
                    if (sub.problem) texts.push(sub.problem);
                    if (sub.modelAnswer) texts.push(sub.modelAnswer);
                });
            }
        });
    }
    
    // 論文から抽出
    if (caseData.essay) {
        if (caseData.essay.question) texts.push(caseData.essay.question);
        if (caseData.essay.points) texts.push(caseData.essay.points.join(' '));
    }
    
    // Q&Aから抽出
    if (caseData.questionsAndAnswers) {
        caseData.questionsAndAnswers.forEach(qa => {
            if (qa.question) texts.push(qa.question);
            if (qa.answer) texts.push(qa.answer);
        });
    }
      // 条文パターンを抽出
    const allText = texts.join(' ');
    console.log('🔍 条文抽出対象テキスト（抜粋）:', allText.substring(0, 500) + '...');    const patterns = [
        // 【】内の条文参照を正確に抽出（最も厳密なパターン）
        /【(民法|刑法|憲法|会社法|商法|民事訴訟法|刑事訴訟法|行政法|労働基準法|日本国憲法)(\d+(?:の\d+)?条(?:第?\d+項)?(?:第?\d+号)?)】/g,
        // より柔軟な【】内パターン（法令名+条文番号のみ）
        /【([^】]*?)((?:\d+(?:の\d+)?条(?:第?\d+項)?(?:第?\d+号)?))】/g,
        // 【】なしでの条文参照
        /(民法|刑法|憲法|会社法|商法|民事訴訟法|刑事訴訟法|行政法|労働基準法|日本国憲法)(\d+(?:の\d+)?条(?:第?\d+項)?(?:第?\d+号)?)[^】]/g,
        // 特別パターン：「の」を含む条文番号専用
        /【(民法|刑法|憲法)(\d+の\d+条(?:第?\d+項)?(?:第?\d+号)?)】/g,
        // 最も具体的なパターン：「民法413条の2第2項」を直接抽出
        /【(民法)(413条の2第?2項)】/g
    ];
      // デバッグ：特定の条文が含まれているかチェック
    if (allText.includes('民法413条の2')) {
        console.log('✅ 「民法413条の2」がテキスト内に存在');
        
        // 具体的にどのような形で含まれているかを確認
        const regex413 = /【[^】]*民法[^】]*413条の2[^】]*】/g;
        const matches413 = allText.match(regex413);
        console.log('🔍 413条の2を含む【】パターン:', matches413);
        
        // さらに詳細に検索
        const allMatches = allText.match(/【[^】]*413条の2[^】]*】/g);
        console.log('🔍 全ての413条の2マッチ:', allMatches);
    } else {
        console.log('❌ 「民法413条の2」がテキスト内に見つからない');
    }
      patterns.forEach((pattern, index) => {
        console.log(`🔍 パターン${index + 1}での抽出開始:`, pattern);
        let match;
        let matchCount = 0;        while ((match = pattern.exec(allText)) !== null) {
            let lawName, articleRef;
            
            if (index === 1) {
                // 2番目のパターン：【】内の複雑なパターン
                const fullMatch = match[1].trim();
                // 法令名部分を最後の有効な法令名で特定
                const validLaws = ['民法', '刑法', '憲法', '会社法', '商法', '民事訴訟法', '刑事訴訟法', '行政法', '労働基準法', '日本国憲法'];
                let foundLaw = null;
                for (const law of validLaws) {
                    if (fullMatch.includes(law)) {
                        foundLaw = law;
                        break;
                    }
                }
                if (foundLaw) {
                    lawName = foundLaw;
                    articleRef = match[2];
                } else {
                    continue;
                }
            } else if (index === 2) {
                // 3番目のパターン：【】なしでの抽出
                lawName = match[1].trim();
                articleRef = match[2];
                // 後に続く文字が】でないことを確認
                const nextChar = allText[match.index + match[0].length];
                if (nextChar === '】') {
                    continue; // 【】内のパターンなので除外
                }
            } else {
                // 1番目、4番目、5番目のパターン
                lawName = match[1].trim();
                articleRef = match[2];
            }
            
            matchCount++;
            
            // デバッグ：「413条の2」を含むマッチを特別にログ
            if (articleRef && articleRef.includes('413条の2')) {
                console.log(`🎯 「413条の2」マッチ発見:`, { lawName, articleRef, fullMatch: match[0], pattern: index + 1 });
            }
            
            // 有効な法令名かチェック（より厳密に）
            if (isValidLawName(lawName) && lawName.length <= 10) { // 異常に長い法令名を除外
                articles.add(`${lawName}${articleRef}`);
                console.log(`➕ 条文追加: ${lawName}${articleRef}`);
            } else {
                console.log(`❌ 無効な法令名: "${lawName}" (${articleRef}) - 長さ: ${lawName.length}`);
            }
        }
        console.log(`📊 パターン${index + 1}で ${matchCount} 件のマッチ`);    });
    
    console.log(`📚 抽出された条文一覧 (${Array.from(articles).length}件):`);
    Array.from(articles).forEach((article, index) => {
        console.log(`  ${index + 1}. ${article}`);
    });
    
    // 非同期で条文を解析
    const parsedArticles = [];
    for (const articleStr of Array.from(articles)) {
        const parsed = await parseArticle(articleStr);
        if (parsed) {
            parsedArticles.push(parsed);
        }
    }
    
    return parsedArticles;
}

/**
 * 有効な法令名かチェック
 */
function isValidLawName(lawName) {
    // 異常に長い文字列や不正な文字を含む場合は無効
    if (!lawName || lawName.length > 15 || lawName.includes('。') || lawName.includes('、')) {
        return false;
    }
    
    const validLaws = [
        '憲法', '日本国憲法', '民法', '会社法', '刑法', '商法', 
        '民事訴訟法', '刑事訴訟法', '行政法', '労働基準法'
    ];
    
    // 完全一致または開始一致をチェック
    return validLaws.some(law => lawName === law || lawName.startsWith(law));
}

/**
 * 条文文字列を解析（非同期で実際の条文内容を取得）
 */
async function parseArticle(articleStr) {
    // 不正な文字列を事前に除外
    if (!articleStr || articleStr.length > 50 || articleStr.includes('】）。') || articleStr.includes('○項')) {
        console.warn(`🚫 不正な条文文字列: "${articleStr}"`);
        return null;
    }
    
    // より強化された正規表現で「413条の2第2項」などのパターンに確実に対応
    // パターン1: 民法413条の2第2項 -> 法令名 + 条文番号（「の」含む） + 項 + 号（オプション）
    const pattern1 = /^(.+?)(\d+条の\d+)(?:第?(\d+)項)?(?:第?(\d+)号)?$/;
    // パターン2: 民法413条第2項 -> 法令名 + 条文番号（通常） + 項 + 号（オプション）
    const pattern2 = /^(.+?)(\d+条)(?:第?(\d+)項)?(?:第?(\d+)号)?$/;
    
    let match = articleStr.match(pattern1) || articleStr.match(pattern2);
    
    if (!match) {
        console.warn(`🚫 条文パターンにマッチしません: "${articleStr}"`);
        console.log(`📝 試行パターン1: ${pattern1}`);
        console.log(`📝 試行パターン2: ${pattern2}`);
        return null;
    }
    
    const [fullMatch, lawName, articleWithJou, paragraph, item] = match;
    
    // 法令名の妥当性を再チェック
    if (!isValidLawName(lawName.trim())) {
        console.warn(`🚫 無効な法令名: "${lawName}"`);
        return null;
    }
    
    // 「条」を削除して条文番号のみを抽出（「413の2」「413」など）
    const articleNumberStr = articleWithJou.replace(/条$/, '');
    const paragraphNum = paragraph ? parseInt(paragraph) : null;
    const itemNum = item ? parseInt(item) : null;
    
    console.log(`🔍 条文解析成功: 法令名="${lawName.trim()}", 条文番号="${articleNumberStr}", 項=${paragraphNum}, 号=${itemNum}`);
    console.log(`📄 元の入力: "${articleStr}" -> 解析結果: "${fullMatch}"`);
    
    // 実際の条文内容を取得
    const content = await fetchArticleContentForQuiz(lawName.trim(), articleNumberStr, paragraphNum, itemNum);
    
    return {
        lawName: lawName.trim(),
        fullText: articleStr,
        articleNumber: articleNumberStr, // 文字列として保持（「413の2」など）
        paragraph: paragraphNum,
        item: itemNum,
        displayText: `${lawName.trim()}${articleWithJou}${paragraph ? `第${paragraph}項` : ''}${item ? `第${item}号` : ''}`,
        content: content // 実際の条文内容
    };
}

/**
 * スピードクイズ用：条文内容から答えが分かる部分を隠す
 * @param {string} content - 条文内容
 * @param {Object} article - 条文情報
 * @returns {string} - 答えを隠した条文内容
 */
function hideAnswersInContentForQuiz(content, article) {
    if (!content || typeof content !== 'string') {
        return content;
    }
    
    // 条文番号のパターンを隠す
    const articleNumber = article.articleNumber;
    const paragraph = article.paragraph;
    
    // 「第○条」「第○条の○」形式を隠す
    const articlePatterns = [
        new RegExp(`第${articleNumber}条(?:の[0-9]+)?`, 'g'),
        new RegExp(`第${articleNumber}条`, 'g'),
        new RegExp(`${articleNumber}条(?:の[0-9]+)?`, 'g'),
        new RegExp(`${articleNumber}条`, 'g')
    ];
      let hiddenContent = content;
    
    // ★★★ 条文番号の表示削除：「第○○条　」の部分を削除 ★★★
    // 「第」から始まって次の空白までを削除
    hiddenContent = hiddenContent.replace(/^第[^　\s]+[　\s]+/gm, '');
    
    articlePatterns.forEach(pattern => {
        hiddenContent = hiddenContent.replace(pattern, '第○条');
    });
    
    // 項番号がある場合はそれも隠す
    if (paragraph) {
        const paragraphPatterns = [
            new RegExp(`第${paragraph}項`, 'g'),
            new RegExp(`${paragraph}項`, 'g')
        ];
        
        paragraphPatterns.forEach(pattern => {
            hiddenContent = hiddenContent.replace(pattern, '第○項');
        });
    }
    
    // 答えが明らかになる行を削除または修正
    const lines = hiddenContent.split('\n');
    const filteredLines = lines.filter(line => {
        const trimmedLine = line.trim();
        
        // 「第○条」「第○条の○」のみの行は除外
        if (/^第[0-9]+条(?:の[0-9]+)?$/.test(trimmedLine)) {
            return false;
        }
        
        // 「第○条第○項」のみの行は除外
        if (/^第[0-9]+条第[0-9]+項$/.test(trimmedLine)) {
            return false;
        }
        
        // 「第○条○項」のみの行は除外
        if (/^第[0-9]+条[0-9]+項$/.test(trimmedLine)) {
            return false;
        }
        
        return true;
    });
    
    return filteredLines.join('\n').trim();
}

/**
 * スピード条文ゲームを初期化
 * @param {string} containerId - ゲームコンテナのID
 * @param {Object} caseData - ケースデータ
 */
export async function initializeSpeedQuizGame(containerId, caseData) {
    console.log('🎮 スピード条文ゲーム初期化開始', { containerId, caseData: caseData?.title });
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ コンテナが見つかりません:', containerId);
        return;
    }
    
    // ローディング表示
    container.innerHTML = `
        <div class="text-center p-8">
            <div class="loader mx-auto mb-4"></div>
            <p class="text-gray-600">条文データを読み込み中...</p>
        </div>
    `;
    
    try {
        // 条文を抽出（非同期）
        window.speedQuizArticles = await extractAllArticles(caseData);
        console.log('📚 抽出された条文数:', window.speedQuizArticles.length);
        
        if (!window.speedQuizArticles || window.speedQuizArticles.length === 0) {
            container.innerHTML = `
                <div class="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p class="text-yellow-700 font-bold text-lg mb-2">⚠️ 条文が見つかりません</p>
                    <p class="text-yellow-600">このモジュールには条文参照が含まれていないため、<br>スピード条文ゲームをプレイできません。</p>
                </div>
            `;
            return;
        }
    } catch (error) {
        console.error('❌ 条文抽出エラー:', error);
        container.innerHTML = `
            <div class="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 font-bold text-lg mb-2">❌ エラーが発生しました</p>
                <p class="text-red-500 text-sm">条文データの読み込みに失敗しました。ページを再読み込みしてください。</p>
            </div>
        `;
        return;
    }
    
    // ゲームUI設定
    const articleCount = window.speedQuizArticles ? window.speedQuizArticles.length : 0;
    container.innerHTML = `
        <div id="speed-quiz-rules" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-6">
            <h2 class="text-2xl font-bold mb-4 text-center">⚡ スピード条文ゲーム</h2>
            <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                <h3 class="font-bold mb-2">🎯 ゲームルール：</h3>
                <ul class="text-sm space-y-1">
                    <li>• 条文の内容が表示され、だんだん拡大していきます</li>
                    <li>• 条文番号（数字のみ）を入力してください（例：「民法123条」→「123」）</li>
                    <li>• 「項」がある場合は、条文番号入力後に項番号を入力</li>
                    <li>• 早く正解するほど高得点！制限時間は10秒</li>
                    <li>• 全${articleCount}問にチャレンジ！</li>
                </ul>
            </div>
        </div>
        
        <div id="speed-quiz-menu" class="text-center">
            <button id="start-speed-quiz" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all">
                🎮 ゲームスタート
            </button>
            <p class="text-gray-600 mt-4">全${articleCount}問の条文クイズに挑戦！</p>
        </div>
        
        <div id="speed-quiz-game" class="hidden">
            <div class="mb-4 flex justify-between items-center">
                <div class="text-lg font-bold">問題 <span id="question-number">1</span> / ${articleCount}</div>
                <div class="text-lg font-bold">スコア: <span id="current-score">0</span></div>
            </div>
            
            <div class="mb-4">
                <div class="bg-gray-200 rounded-full h-2">
                    <div id="time-progress" class="bg-red-500 h-2 rounded-full transition-all duration-100" style="width: 100%"></div>
                </div>
                <div class="text-center mt-1">残り時間: <span id="time-remaining">10</span>秒</div>
            </div>
            
            <div id="article-display" class="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6 min-h-40 flex items-center justify-center text-center">
                <div id="article-text" class="transition-all duration-500 text-xs">条文内容が表示されます...</div>
            </div>            <div class="text-center mb-4">                <div class="flex items-center justify-center gap-2">
                    <div class="relative">                        <input type="text" id="article-number-input" class="text-3xl text-center border-2 border-blue-300 rounded-lg p-4 w-40 font-mono tracking-widest bg-transparent" style="color: transparent;" maxlength="8" autocomplete="off">
                        <div id="article-overlay" class="absolute top-0 left-0 text-3xl text-center p-4 w-40 font-mono tracking-widest pointer-events-none"></div>
                    </div>
                    <span class="text-3xl font-mono text-gray-600">条</span>
                    <div id="paragraph-section" class="flex items-center gap-2" style="display: none;">
                        <span class="text-3xl font-mono text-gray-600">第</span>
                        <div class="relative">
                            <input type="text" id="paragraph-number-input" class="text-3xl text-center border-2 border-blue-300 rounded-lg p-4 w-20 font-mono tracking-widest bg-transparent" style="color: transparent;" maxlength="2" autocomplete="off">
                            <div id="paragraph-overlay" class="absolute top-0 left-0 text-3xl text-center p-4 w-20 font-mono tracking-widest pointer-events-none"></div>
                        </div>
                        <span class="text-3xl font-mono text-gray-600">項</span>
                    </div>
                </div>
            </div>
            
            <div id="feedback" class="mb-4 h-8 text-center"></div>
            
            <div class="text-center">
                <button id="skip-question" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2">スキップ</button>
                <button id="quit-game" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">終了</button>
            </div>
        </div>
        
        <div id="speed-quiz-result" class="hidden text-center">
            <h2 class="text-3xl font-bold mb-4">🎉 ゲーム結果</h2>
            <div class="bg-white rounded-lg p-6 shadow-lg mb-6">
                <div class="text-4xl font-bold text-blue-600 mb-2">
                    <span id="final-score">0</span>点
                </div>
                <div class="text-gray-600 mb-4">
                    正解: <span id="correct-count">0</span> / ${articleCount}
                </div>
                <div id="score-rank" class="text-xl font-bold mb-4"></div>
                <div id="score-comment" class="text-gray-700"></div>
            </div>
            
            <div id="wrong-answers-section" class="hidden bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-bold text-red-700 mb-4">❌ 間違えた問題（復習用）</h3>
                <div id="wrong-answers-list" class="space-y-4 text-left max-h-96 overflow-y-auto"></div>
            </div>
            
            <div class="space-x-4">
                <button id="retry-game" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">もう一度</button>
                <button id="back-to-menu" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">メニューに戻る</button>
            </div>
        </div>
    `;
    
    // イベントリスナーを設定
    setupSpeedQuizEventListeners();
    
    console.log('✅ スピード条文ゲーム初期化完了');
}

/**
 * イベントリスナーを設定
 */
function setupSpeedQuizEventListeners() {
    console.log('🎮 スピード条文ゲーム イベントリスナー設定中...');
    
    // ゲーム開始ボタン
    const startBtn = document.getElementById('start-speed-quiz');
    if (startBtn) {
        startBtn.addEventListener('click', startSpeedQuiz);
    }
    
    // 回答ボタン
    const submitBtn = document.getElementById('submit-answer');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAnswer);
    }
    
    // スキップボタン
    const skipBtn = document.getElementById('skip-question');
    if (skipBtn) {
        skipBtn.addEventListener('click', skipQuestion);
    }
    
    // 終了ボタン
    const quitBtn = document.getElementById('quit-game');
    if (quitBtn) {
        quitBtn.addEventListener('click', quitGame);
    }
    
    // リトライボタン
    const retryBtn = document.getElementById('retry-game');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            document.getElementById('speed-quiz-result').classList.add('hidden');
            document.getElementById('speed-quiz-menu').classList.remove('hidden');
        });
    }
    
    // メニューに戻るボタン
    const backBtn = document.getElementById('back-to-menu');
    if (backBtn) {
        backBtn.addEventListener('click', backToMenu);
    }    // 一文字ずつの入力判定
    const articleInput = document.getElementById('article-number-input');
    const paragraphInput = document.getElementById('paragraph-number-input');
    
    if (articleInput) {
        articleInput.addEventListener('input', handleArticleInput);
        articleInput.addEventListener('keydown', handleArticleKeyDown);
    }
    
    if (paragraphInput) {
        paragraphInput.addEventListener('input', handleParagraphInput);
        paragraphInput.addEventListener('keydown', handleParagraphKeyDown);
    }
    
    console.log('✅ スピード条文ゲーム イベントリスナー設定完了');
}

// ゲーム状態管理
let gameState = {
    articles: [],
    currentIndex: 0,
    score: 0,
    correctAnswers: 0,
    timer: null,
    timeLeft: 10, // 制限時間を10秒に変更
    isWaitingForParagraph: false,
    currentAnswerStage: 'article', // 'article' or 'paragraph'
    wrongAnswers: [], // 間違えた問題を記録
    isProcessingAnswer: false, // 回答処理中フラグ
    correctInput: '', // 正解の入力文字列
    currentInput: '' // 現在の入力文字列
};

/**
 * ゲーム開始
 */
function startSpeedQuiz() {
    console.log('🎮 スピード条文ゲーム開始');
    console.log('📚 利用可能な条文:', window.speedQuizArticles);
    
    // 条文データのチェック
    if (!window.speedQuizArticles || !Array.isArray(window.speedQuizArticles) || window.speedQuizArticles.length === 0) {
        console.error('❌ 条文データが利用できません:', window.speedQuizArticles);
        alert('条文データの読み込みに失敗しました。ページを再読み込みしてください。');
        return;
    }
      // ゲーム状態を初期化
    gameState = {
        articles: [...window.speedQuizArticles],
        currentIndex: 0,
        score: 0,
        correctAnswers: 0,
        timer: null,
        timeLeft: 10, // 制限時間を10秒に変更
        isWaitingForParagraph: false,
        currentAnswerStage: 'article',
        wrongAnswers: [], // 間違えた問題を記録
        isProcessingAnswer: false, // 回答処理中フラグ
        correctInput: '', // 正解の入力文字列
        currentInput: '' // 現在の入力文字列
    };
    
    // 問題をシャッフル
    gameState.articles = shuffleArray(gameState.articles);
    
    // UIを切り替え（ルール部分も非表示にする）
    document.getElementById('speed-quiz-rules').classList.add('hidden');
    document.getElementById('speed-quiz-menu').classList.add('hidden');
    document.getElementById('speed-quiz-game').classList.remove('hidden');
    
    // 最初の問題を表示
    displayCurrentQuestion();
}

/**
 * 配列をシャッフル
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 現在の問題を表示
 */
function displayCurrentQuestion() {
    if (gameState.currentIndex >= gameState.articles.length) {
        showResult();
        return;
    }
    
    const currentArticle = gameState.articles[gameState.currentIndex];
    console.log('📖 現在の条文:', currentArticle);
    
    // UI更新
    document.getElementById('question-number').textContent = gameState.currentIndex + 1;
    document.getElementById('current-score').textContent = gameState.score;
    
    // 条文内容を表示（徐々に拡大）
    const articleDisplay = document.getElementById('article-text');
    
    // 条文の内容を取得（複数のプロパティ名をチェック）
    let content = currentArticle.content || currentArticle.text || currentArticle.displayText || '条文内容が見つかりません';    // 条文内容から答えが分かる部分を隠す
    content = hideAnswersInContentForQuiz(content, currentArticle);
    
    console.log('📝 表示する内容:', content);
    // HTMLとして表示し、改行を保持
    articleDisplay.innerHTML = `<div class="whitespace-pre-line leading-relaxed">${content}</div>`;
    articleDisplay.className = 'text-base'; // 固定サイズで表示    // 入力フィールドをリセット
    const articleInput = document.getElementById('article-number-input');
    const paragraphInput = document.getElementById('paragraph-number-input');
    const articleOverlay = document.getElementById('article-overlay');
    const paragraphOverlay = document.getElementById('paragraph-overlay');
    const paragraphSection = document.getElementById('paragraph-section');
    
    // 条文番号入力をリセット
    if (articleInput) {
        articleInput.value = '';
        articleInput.focus();
    }
    if (articleOverlay) articleOverlay.innerHTML = '';
    
    // 項番号入力をリセット・非表示
    if (paragraphInput) paragraphInput.value = '';
    if (paragraphOverlay) paragraphOverlay.innerHTML = '';
    if (paragraphSection) paragraphSection.style.display = 'none';
    
    // 処理フラグをリセット
    gameState.isProcessingAnswer = false;
    
    // 入力段階を初期化
    gameState.currentAnswerStage = 'article';
    gameState.isWaitingForParagraph = false;    // 正解の文字列を更新（内部処理用）
    let correctAnswer = currentArticle.articleNumber.toString();
    if (currentArticle.paragraph) {
        correctAnswer += currentArticle.paragraph.toString();
    }
    
    // フィードバックをクリア
    const feedback = document.getElementById('feedback');
    if (feedback) {
        feedback.innerHTML = '';
    }
    
    // タイマー開始
    startTimer();
}

/**
 * タイマー開始
 */
function startTimer() {
    gameState.timeLeft = 10; // 制限時間を10秒に変更
    document.getElementById('time-remaining').textContent = gameState.timeLeft;
    
    const progressBar = document.getElementById('time-progress');
    progressBar.style.width = '100%';
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        document.getElementById('time-remaining').textContent = gameState.timeLeft;
        
        const percentage = (gameState.timeLeft / 10) * 100; // 10秒ベースに変更
        progressBar.style.width = percentage + '%';
          // 時間切れ処理
        if (gameState.timeLeft <= 0) {
            if (gameState.isProcessingAnswer) return; // 既に処理中なら無視
            
            gameState.isProcessingAnswer = true;
            clearInterval(gameState.timer);
              // 間違えた問題として記録
            const currentArticle = gameState.articles[gameState.currentIndex];
            if (currentArticle && currentArticle.articleNumber !== undefined) {
                gameState.wrongAnswers.push({
                    article: currentArticle,
                    userAnswer: null,
                    correctAnswer: `${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}`,
                    reason: '時間切れ'
                });
            }
            
            showIncorrectFeedback('時間切れ！');
            setTimeout(() => {
                gameState.isProcessingAnswer = false;
                nextQuestion();
            }, 1500);
        }
    }, 1000);
}

/**
 * タイマー停止
 */
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

/**
 * 回答をチェック
 */
// 旧システム（削除予定）
/*
function checkAnswer(userInput) {
    const currentArticle = gameState.articles[gameState.currentIndex];
    
    if (gameState.currentAnswerStage === 'article') {
        if (parseInt(userInput) === currentArticle.articleNumber) {
            // 条文番号正解
            if (currentArticle.paragraph) {
                // 項がある場合は項の入力に移行                gameState.currentAnswerStage = 'paragraph';
                gameState.isWaitingForParagraph = true;
                document.getElementById('input-stage-indicator').textContent = '項番号を入力してください';
                document.getElementById('speed-quiz-input').value = '';
                document.getElementById('speed-quiz-input').placeholder = '1';
                return 'continue'; // まだ完答ではない
            } else {
                // 項がない場合は完答
                return 'correct';
            }
        } else {
            return 'incorrect';
        }    } else if (gameState.currentAnswerStage === 'paragraph') {
        if (parseInt(userInput) === currentArticle.paragraph) {
            return 'correct';
        } else {
            return 'incorrect';
        }
    }
    
    return 'incorrect';
}
*/

/**
 * 正解フィードバック表示
 */
function showCorrectFeedback() {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '<div class="text-green-600 font-bold text-xl">✅ 正解！</div>';
    feedback.className = 'mb-4 h-8 text-green-600';
}

/**
 * 不正解フィードバック表示
 */
function showIncorrectFeedback(message = '❌ 不正解') {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `<div class="text-red-600 font-bold text-xl">${message}</div>`;
    feedback.className = 'mb-4 h-8 text-red-600';
}

/**
 * 次の問題へ
 */
function nextQuestion() {
    gameState.currentIndex++;
    
    if (gameState.currentIndex >= gameState.articles.length) {
        showResult();
    } else {
        displayCurrentQuestion();
    }
}

/**
 * 問題をスキップ
 */
function skipQuestion() {
    if (gameState.isProcessingAnswer) return; // 処理中は無効
    
    gameState.isProcessingAnswer = true;
    stopTimer();
      // スキップした問題を記録
    const currentArticle = gameState.articles[gameState.currentIndex];
    if (currentArticle && currentArticle.articleNumber !== undefined) {
        gameState.wrongAnswers.push({
            article: currentArticle,
            userAnswer: null,
            correctAnswer: `${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}`,
            reason: 'スキップ'
        });
    }
    
    showIncorrectFeedback('スキップしました');
    setTimeout(() => {
        gameState.isProcessingAnswer = false;
        nextQuestion();
    }, 1000);
}

/**
 * ゲーム終了
 */
function quitGame() {
    stopTimer();
    if (confirm('ゲームを終了しますか？')) {
        document.getElementById('speed-quiz-game').classList.add('hidden');
        document.getElementById('speed-quiz-rules').classList.remove('hidden');
        document.getElementById('speed-quiz-menu').classList.remove('hidden');
    } else {
        displayCurrentQuestion();
    }
}

/**
 * メニューに戻る
 */
function backToMenu() {
    document.getElementById('speed-quiz-result').classList.add('hidden');
    document.getElementById('speed-quiz-game').classList.add('hidden');
    document.getElementById('speed-quiz-rules').classList.remove('hidden');
    document.getElementById('speed-quiz-menu').classList.remove('hidden');
}

/**
 * 結果表示
 */
function showResult() {
    stopTimer();
    
    document.getElementById('speed-quiz-game').classList.add('hidden');
    document.getElementById('speed-quiz-result').classList.remove('hidden');
    
    // 結果を計算
    const totalQuestions = gameState.articles.length;
    const correctCount = gameState.correctAnswers;
    const score = gameState.score;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    
    // 結果を表示
    document.getElementById('final-score').textContent = score;
    document.getElementById('correct-count').textContent = correctCount;
    
    // ランクを決定
    let rank, comment;
    if (accuracy >= 90) {
        rank = 'S級';
        comment = '完璧です！条文マスターですね！';
    } else if (accuracy >= 80) {
        rank = 'A級';
        comment = '素晴らしい！かなりの実力です！';
    } else if (accuracy >= 70) {
        rank = 'B級';
        comment = '良い調子です！もう少しで上級者！';
    } else if (accuracy >= 60) {
        rank = 'C級';
        comment = 'まずまずです！練習を続けましょう！';
    } else {
        rank = 'D級';
        comment = '頑張りましょう！復習が必要かも？';
    }
    
    document.getElementById('score-rank').textContent = rank;
    document.getElementById('score-comment').textContent = comment;
    
    // 間違えた問題がある場合は表示
    displayWrongAnswers();
}

/**
 * 間違えた問題を表示
 */
function displayWrongAnswers() {
    if (!gameState.wrongAnswers || gameState.wrongAnswers.length === 0) {
        return;
    }
    
    const wrongSection = document.getElementById('wrong-answers-section');
    const wrongList = document.getElementById('wrong-answers-list');
    
    wrongSection.classList.remove('hidden');
    wrongList.innerHTML = '';
    
    gameState.wrongAnswers.forEach((wrong, index) => {
        const article = wrong.article;
        const correctAnswer = wrong.correctAnswer;
        const userAnswer = wrong.userAnswer || '無回答';
        const reason = wrong.reason;
        
        // 条文内容から答えを隠した内容を取得
        const content = article.content || article.text || article.displayText || '条文内容が見つかりません';
        const cleanedContent = hideAnswersInContentForQuiz(content, article);
        
        const wrongItem = document.createElement('div');
        wrongItem.className = 'bg-white p-4 rounded border-l-4 border-red-500';
        wrongItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-red-600">【${correctAnswer}】</span>
                <span class="text-sm text-gray-500">${reason}</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
                あなたの回答: <span class="font-mono bg-gray-100 px-2 py-1 rounded">${userAnswer}</span>
            </div>            <div class="text-sm bg-gray-50 p-3 rounded whitespace-pre-line leading-relaxed">
                ${cleanedContent}
            </div>
        `;
        
        wrongList.appendChild(wrongItem);
    });
}

/**
 * 回答送信
 */
// 旧システム（削除予定）
/*
function submitAnswer() {
    const input = document.getElementById('speed-quiz-input');
    const userInput = input.value.trim();
    
    if (!userInput) {
        return;
    }
    
    const result = checkAnswer(userInput);
    const currentArticle = gameState.articles[gameState.currentIndex];
    
    if (result === 'continue') {
        // 項の入力へ続く
        showCorrectFeedback();
        setTimeout(() => {
            document.getElementById('feedback').innerHTML = '';
        }, 1000);
        return;
    }
    
    stopTimer();
    
    if (result === 'correct') {
        // 正解
        gameState.correctAnswers++;
        const timeBonus = Math.max(0, gameState.timeLeft * 10); // 残り時間に応じたボーナス
        const baseScore = 100;
        gameState.score += baseScore + timeBonus;
        
        showCorrectFeedback();
    } else {
        // 不正解
        gameState.score = Math.max(0, gameState.score - 50); // 間違えると減点
        
        // 間違えた問題を記録
        if (currentArticle && currentArticle.articleNumber !== undefined) {
            gameState.wrongAnswers.push({
                article: currentArticle,
                userAnswer: userInput,
                correctAnswer: `${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}`,
                reason: '回答間違い'
            });
            
            showIncorrectFeedback(`❌ 不正解！正解は${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}でした`);        } else {
            showIncorrectFeedback(`❌ 不正解！`);
        }
    }
    
    setTimeout(nextQuestion, 2000);
}
*/

/**
 * スピードクイズ用：既存のAPIを使用して条文内容を取得
 */
async function fetchArticleContentForQuiz(lawName, articleNumber, paragraph, item) {
    try {
        // 条文文字列を構築（「の」を含む場合に対応）
        let articleText;
        if (articleNumber.includes('の')) {
            // 「413の2」のような場合は、そのまま条を付ける
            articleText = `${articleNumber}条`;
        } else {
            // 通常の場合
            articleText = `${articleNumber}条`;
        }
        
        if (paragraph) {
            articleText += `第${paragraph}項`;
        }
        if (item) {
            articleText += `第${item}号`;
        }
        
        // 法令名マッピング（憲法の自動変換など）
        const LAW_NAME_MAPPING = {
            '憲法': '日本国憲法',
            '日本国憲法': '日本国憲法'
        };
        const actualLawName = LAW_NAME_MAPPING[lawName] || lawName;
        const inputText = `${actualLawName}${articleText}`;
          console.log(`🔍 スピードクイズ条文取得: "${inputText}" (元の条文番号: "${articleNumber}", 項: ${paragraph}, 号: ${item})`);
        console.log(`📡 APIリクエスト詳細:`, {
            inputText: inputText,
            lawName: lawName,
            actualLawName: actualLawName,
            articleNumber: articleNumber,
            articleText: articleText,
            paragraph: paragraph,
            item: item
        });const response = await fetch('/api/parse-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputText: inputText
            })
        });
        
        console.log(`📡 API応答: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }
        
        const articleContent = await response.text();
        console.log(`📄 取得した条文内容 (${inputText}):`, articleContent.substring(0, 100) + '...');
        
        // エラーメッセージかどうかチェック
        if (articleContent.startsWith('❌')) {
            throw new Error(articleContent);
        }
        
        // 既存の条文表示と同じデコレーション処理を適用
        return formatDoubleParenthesesForQuiz(articleContent);
        
    } catch (error) {
        console.warn(`条文取得エラー (${lawName}${articleNumber}条): ${error.message}`);
        // フォールバックとしてサンプル内容を返す
        return generateArticleContentForQuiz(lawName, articleNumber, paragraph, item);
    }
}

/**
 * スピードクイズ用：条文の内容を生成（サンプル）
 */
function generateArticleContentForQuiz(lawName, articleNumber, paragraph, item) {
    console.log(`🔧 フォールバック条文生成: ${lawName} ${articleNumber}条 第${paragraph}項 第${item}号`);
    
    // 代表的な条文のサンプル内容
    const sampleContents = {
        '民法': {
            1: '私権は、公共の福祉に適合しなければならない。',
            2: '解釈に疑義があるときは、信義に従い誠実に行わなければならない。',
            3: '権利の濫用は、これを許さない。',
            90: '公の秩序又は善良の風俗に反する事項を目的とする法律行為は、無効とする。',
            109: '第三者がその代理権を知り又は知ることができたときは、その代理権の範囲内においてした代理人の行為について、本人が責任を負う。',
            413: '債務の履行について債権者が受領を拒み、又は受領をすることができないときは、債務者は、債権者のために債務の目的物を保管し、又は供託をすることができる。この場合において、債務者は、遅滞なく債権者に通知をしなければならない。',
            492: '債務者が債務の本旨に従った履行の提供をしたにもかかわらず、債権者がその受領を拒み、又は受領をすることができないときは、その債権者は、履行の遅滞の責任を負わない。',
            536: '当事者の一方の責めに帰すべき事由によって債務を履行することができなくなったときは、債務者は、反対給付を受ける権利を有しない。２ 債権者の責めに帰すべき事由によって債務を履行することができなくなったときは、債務者は、反対給付を受ける権利を失わない。この場合において、自己の債務を免れたことによって利益を得たときは、これを債権者に償還しなければならない。',
            '413の2': '前条の場合において、債務の目的物が種類物であるときは、債務者は、遅滞なく、その物を第三者に保管させ、又は供託をすることができる。２ 前項に規定する場合のほか、債務者が債務の履行のために債権者の行為を必要とするにもかかわらず、債権者がその行為をしないときも、前項と同様とする。',
            // 民法413条の2の多様なキーパターン（表記揺れ対応）
            '413-2': '前条の場合において、債務の目的物が種類物であるときは、債務者は、遅滞なく、その物を第三者に保管させ、又は供託をすることができる。２ 前項に規定する場合のほか、債務者が債務の履行のために債権者の行為を必要とするにもかかわらず、債権者がその行為をしないときも、前項と同様とする。',
            '413_2': '前条の場合において、債務の目的物が種類物であるときは、債務者は、遅滞なく、その物を第三者に保管させ、又は供託をすることができる。２ 前項に規定する場合のほか、債務者が債務の履行のために債権者の行為を必要とするにもかかわらず、債権者がその行為をしないときも、前項と同様とする。',
            // 他の「の」を含む条文も追加（将来的な拡張用）
            '415の3': '消費者（個人（事業として又は事業のために契約の当事者となる場合におけるものを除く。）をいう。以下この項において同じ。）がした定型約款準備者（定型約款の準備者である事業者をいう。）との契約に関する民法の適用については、第五百四十八条の二第一項中「次項各号に掲げる場合のいずれかに該当するとき」とあるのは「次項各号に掲げる場合のいずれかに該当し、かつ、消費者の利益を一方的に害するものでないとき」と、第五百四十八条の四第一項中「次に掲げる場合のいずれかに該当するとき」とあるのは「次に掲げる場合のいずれかに該当し、かつ、消費者の利益を一方的に害するものでないとき」とする。',
            '415-3': '消費者（個人（事業として又は事業のために契約の当事者となる場合におけるものを除く。）をいう。以下この項において同じ。）がした定型約款準備者（定型約款の準備者である事業者をいう。）との契約に関する民法の適用については、第五百四十八条の二第一項中「次項各号に掲げる場合のいずれかに該当するとき」とあるのは「次項各号に掲げる場合のいずれかに該当し、かつ、消費者の利益を一方的に害するものでないとき」と、第五百四十八条の四第一項中「次に掲げる場合のいずれかに該当するとき」とあるのは「次に掲げる場合のいずれかに該当し、かつ、消費者の利益を一方的に害するものでないとき」とする。',
            '415_3': '消費者（個人（事業として又は事業のために契約の当事者となる場合におけるものを除く。）をいう。以下この項において同じ。）がした定型約款準備者（定型約款の準備者である事業者をいう。）との契約に関する民法の適用については、第五百四十八条の二第一項中「次項各号に掲げる場合のいずれかに該当するとき」とあるのは「次項各号に掲げる場合のいずれかに該当し、かつ、消費者の利益を一方的に害するものでないとき」と、第五百四十八条の四第一項中「次に掲げる場合のいずれかに該当するとき」とあるのは「次に掲げる場合のいずれかに該当し、かつ、消費者の利益を一方的に害するものでないとき」とする。'
        },
        '憲法': {
            1: '天皇は、日本国の象徴であり日本国民統合の象徴であつて、この地位は、主権の存する日本国民の総意に基く。',
            9: '日本国民は、正義と秩序を基調とする国際平和を誠実に希求し、国権の発動たる戦争と、武力による威嚇又は武力の行使は、国際紛争を解決する手段としては、永久にこれを放棄する。',
            11: '国民は、すべての基本的人権の享有を妨げられない。この憲法が国民に保障する基本的人権は、侵すことのできない永久の権利として、現在及び将来の国民に与へられる。',
            14: 'すべて国民は、法の下に平等であつて、人種、信条、性別、社会的身分又は門地により、政治的、経済的又は社会的関係において、差別されない。',
            21: '集会、結社及び言論、出版その他一切の表現の自由は、これを保障する。'
        },
        '刑法': {
            1: 'この法律は、日本国内において罪を犯したすべての者に適用する。',
            199: '人を殺した者は、死刑又は無期若しくは五年以上の懲役に処する。',
            204: '人の身体を傷害した者は、十五年以下の懲役又は五十万円以下の罰金に処する。',
            235: '他人の財物を窃取した者は、窃盗の罪とし、十年以下の懲役又は五十万円以下の罰金に処する。'
        }
    };
      // 法律名から適切なセクションを取得
    let lawSection = null;
    if (lawName.includes('民法')) {
        lawSection = sampleContents['民法'];
        console.log(`📚 民法セクション選択: 条文番号="${articleNumber}"`);
    }
    else if (lawName.includes('憲法')) {
        lawSection = sampleContents['憲法'];
        console.log(`📚 憲法セクション選択: 条文番号="${articleNumber}"`);
    }
    else if (lawName.includes('刑法')) {
        lawSection = sampleContents['刑法'];
        console.log(`📚 刑法セクション選択: 条文番号="${articleNumber}"`);
    }
    else {
        console.log(`❓ 未対応の法令名: "${lawName}"`);
    }    if (lawSection) {
        console.log(`🔍 条文検索: キー="${articleNumber}", 利用可能なキー:`, Object.keys(lawSection));
        
        // 多様なキーパターンで条文を検索
        const searchKeys = [
            articleNumber, // 「413の2」
            articleNumber.toString(), // 文字列変換
            parseInt(articleNumber), // 数値変換（「413」→413）
            articleNumber.replace(/の/g, '-'), // 「413-2」
            articleNumber.replace(/の/g, '_'), // 「413_2」
        ];
        
        // 「413の2」のような「の」を含む条文の場合の特別処理
        if (articleNumber.includes('の')) {
            const parts = articleNumber.split('の');
            const basePart = parts[0]; // 「413」
            const suffixPart = parts[1]; // 「2」
            
            // さらに多様なキーパターンを追加
            searchKeys.push(
                `${basePart}の${suffixPart}`, // 「413の2」（再確認）
                `${basePart}-${suffixPart}`, // 「413-2」
                `${basePart}_${suffixPart}`, // 「413_2」
                basePart, // 「413」（基本条文）
                parseInt(basePart), // 413（数値）
            );
        }
        
        // 重複を除去
        const uniqueKeys = [...new Set(searchKeys)];
        console.log(`🔍 検索キー候補:`, uniqueKeys);
        
        // 各キーで条文を検索
        for (const key of uniqueKeys) {
            if (lawSection[key]) {
                console.log(`✅ キー "${key}" で条文発見!`);
                let content = lawSection[key];
                
                // 項番号が指定されている場合、該当項を抽出
                if (paragraph && content.includes('２')) {
                    const paragraphs = content.split(/(?=\d+\s)/);
                    const targetParagraph = paragraphs.find(p => p.trim().startsWith(paragraph.toString()));
                    if (targetParagraph) {
                        console.log(`✅ 第${paragraph}項を抽出`);
                        return targetParagraph.trim();
                    }
                }
                
                return content;
            }
        }
        
        console.log(`❌ 全ての検索キーで条文が見つかりません: ${uniqueKeys}`);
    }
      // デフォルトの内容（条文が見つからない場合）- より詳細な情報を提供
    console.warn(`❌ サンプル条文が見つかりません: ${lawName} ${articleNumber}条`);
    console.log(`🔍 最終検索状況:`, {
        lawName: lawName,
        articleNumber: articleNumber,
        paragraph: paragraph,
        item: item,
        lawSectionFound: !!lawSection,
        availableKeys: lawSection ? Object.keys(lawSection) : []
    });
    
    return `📋 ${lawName}${articleNumber}条${paragraph ? `第${paragraph}項` : ''}${item ? `第${item}号` : ''}の条文内容が見つかりません。\n\n🔍 詳細情報:\n・法令名: ${lawName}\n・条文番号: ${articleNumber}\n・項: ${paragraph || 'なし'}\n・号: ${item || 'なし'}\n\n💡 この条文は実在するものですが、現在のサンプルデータには含まれていません。実際の条文内容を確認するには、条文表示ボタンをお使いください。`;
}

/**
 * スピードクイズ用：二重カッコ内の強調デコレーション機能
 * （既存のarticlePanelと同じ処理）
 */
function formatDoubleParenthesesForQuiz(text) {
    // 二重カッコ「（（～））」を検出して強調デコレーション
    // カッコ自体は削除し、中身だけを太字・色付きで表示
    return text.replace(/（（([^）]+)））/g, '<span class="font-bold text-blue-700 bg-blue-50 px-1 rounded">$1</span>');
}

/**
 * レガシー関数（後方互換性のために残す）
 */
export function initializeSpeedQuiz(caseData) {
    console.warn('⚠️ この関数は非推奨です。initializeSpeedQuizGame を使用してください。');
}

export function generateSpeedQuizHTML(caseData) {
    console.warn('⚠️ この関数は非推奨です。initializeSpeedQuizGame を使用してください。');
    return '<div>非推奨の関数が呼び出されました。</div>';
}

// スタイルを追加（赤色フェードアウトアニメーション用）
const style = document.createElement('style');
style.textContent = `
    .incorrect-char-animation {
        animation: incorrectCharFade 0.3s ease-out forwards;
    }
    
    @keyframes incorrectCharFade {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            color: #ef4444;
            background-color: #fecaca;
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.2);
            color: #ef4444;
            background-color: transparent;
        }
    }
`;
document.head.appendChild(style);

/**
 * 条文番号の入力を処理
 */
function handleArticleInput(event) {
    if (gameState.isProcessingAnswer) return;
    
    const input = event.target;
    let inputValue = input.value;
    
    // 全角数字を半角に変換
    inputValue = inputValue.replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    
    // 数字と「の」のみを許可
    inputValue = inputValue.replace(/[^0-9の]/g, '');
    
    // 入力フィールドを即座に更新（変換された値を反映）
    input.value = inputValue;
    
    const currentArticle = gameState.articles[gameState.currentIndex];
    if (!currentArticle) return;
    
    const correctArticleNumber = currentArticle.articleNumber.toString();
    console.log('🔍 条文番号チェック:', { inputValue, correctArticleNumber });
    
    // 正解のパターンを段階的にチェック
    let validInput = '';
    let hasIncorrectInput = false;
    
    // 「413の2」のような場合の段階的処理
    if (correctArticleNumber.includes('の')) {
        const parts = correctArticleNumber.split('の');
        const basePart = parts[0]; // 「413」
        const suffixPart = parts[1]; // 「2」
        
        // 段階1: 基本部分（「413」）の入力チェック
        if (inputValue.length <= basePart.length) {
            // 基本部分の入力中
            for (let i = 0; i < inputValue.length; i++) {
                if (i < basePart.length && inputValue[i] === basePart[i]) {
                    validInput += inputValue[i];
                } else {
                    hasIncorrectInput = true;
                    break;
                }
            }
        } else if (inputValue.length === basePart.length + 1 && inputValue[basePart.length] === 'の') {
            // 段階2: 「の」の入力
            validInput = basePart + 'の';
        } else if (inputValue.length > basePart.length + 1 && inputValue.substring(0, basePart.length + 1) === basePart + 'の') {
            // 段階3: 「の」の後の数字部分の入力
            const suffixInput = inputValue.substring(basePart.length + 1);
            validInput = basePart + 'の';
            
            for (let i = 0; i < suffixInput.length; i++) {
                if (i < suffixPart.length && suffixInput[i] === suffixPart[i]) {
                    validInput += suffixInput[i];
                } else {
                    hasIncorrectInput = true;
                    break;
                }
            }
        } else {
            hasIncorrectInput = true;
        }
    } else {
        // 通常の条文番号（「の」が含まれない場合）
        for (let i = 0; i < inputValue.length; i++) {
            if (i < correctArticleNumber.length && inputValue[i] === correctArticleNumber[i]) {
                validInput += inputValue[i];
            } else {
                hasIncorrectInput = true;
                break;
            }
        }
    }
    
    // 間違った入力があった場合、赤色フェードアウトアニメーション
    if (hasIncorrectInput) {
        showIncorrectInputAnimation(input, inputValue.slice(-1));
        input.value = validInput;
        // 表示を更新（正解部分を維持）
        updateArticleDisplay(validInput, correctArticleNumber);
        return;
    }
    
    // 入力フィールドを更新
    input.value = validInput;
    
    // 表示を更新
    updateArticleDisplay(validInput, correctArticleNumber);
    
    // 条文番号が完成した場合
    if (validInput === correctArticleNumber) {        // 項がある場合は項の入力に移行
        if (currentArticle.paragraph) {
            showParagraphSection();
            setTimeout(() => {
                document.getElementById('paragraph-number-input').focus();
            }, 100);
        } else {
            // 項がない場合は完了
            completeAnswer();
        }
    }
}

/**
 * 項番号の入力を処理
 */
function handleParagraphInput(event) {
    if (gameState.isProcessingAnswer) return;
    
    const input = event.target;
    let inputValue = input.value;
    
    // 全角数字を半角に変換
    inputValue = inputValue.replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    
    // 数字のみを許可
    inputValue = inputValue.replace(/[^0-9]/g, '');
    
    // 入力フィールドを即座に更新（変換された値を反映）
    input.value = inputValue;
    
    const currentArticle = gameState.articles[gameState.currentIndex];
    if (!currentArticle || !currentArticle.paragraph) return;
    
    const correctParagraphNumber = currentArticle.paragraph.toString();
    
    // 入力が正解の一部かチェック
    let validInput = '';
    let hasIncorrectInput = false;
    
    for (let i = 0; i < inputValue.length; i++) {
        if (i < correctParagraphNumber.length && inputValue[i] === correctParagraphNumber[i]) {
            validInput += inputValue[i];
        } else {
            hasIncorrectInput = true;
            break;
        }
    }
      // 間違った入力があった場合、赤色フェードアウトアニメーション
    if (hasIncorrectInput) {
        showIncorrectInputAnimation(input, inputValue.slice(-1));
        input.value = validInput;
        // 表示を更新（正解部分を維持）
        updateParagraphDisplay(validInput, correctParagraphNumber);
        return;
    }
    
    // 入力フィールドを更新
    input.value = validInput;
    
    // 表示を更新
    updateParagraphDisplay(validInput, correctParagraphNumber);
    
    // 項番号が完成した場合
    if (validInput === correctParagraphNumber) {
        completeAnswer();
    }
}

/**
 * 間違った入力の赤色フェードアウトアニメーション
 */
function showIncorrectInputAnimation(inputElement, incorrectChar) {
    const overlay = inputElement.nextElementSibling;
    if (!overlay) return;
      // 間違った文字を赤色で表示（既存の内容は保持）
    const span = document.createElement('span');
    span.textContent = incorrectChar;
    span.className = 'incorrect-char-temp';
    span.style.cssText = `
        color: #ef4444;
        background-color: #fecaca;
        position: absolute;
        top: 50%;
        left: calc(50% + ${inputElement.value.length * 1.5}em);
        transform: translate(-50%, -50%);
        transition: all 0.3s ease-out;
        font-size: 3rem;
        font-family: monospace;
        pointer-events: none;
        z-index: 10;
        border-radius: 4px;
        padding: 2px 4px;
    `;
    
    overlay.appendChild(span);
    
    // アニメーション開始
    setTimeout(() => {
        span.style.opacity = '0';
        span.style.transform = 'translate(-50%, -50%) scale(1.2)';
    }, 10);
    
    // アニメーション終了後に該当のspanのみ削除
    setTimeout(() => {
        if (span.parentElement) {
            span.parentElement.removeChild(span);
        }
    }, 300);
}

/**
 * 項セクションを表示
 */
function showParagraphSection() {
    const paragraphSection = document.getElementById('paragraph-section');
    if (paragraphSection) {
        paragraphSection.style.display = 'flex';
    }
}

/**
 * 答えが完成した時の処理
 */
function completeAnswer() {
    gameState.isProcessingAnswer = true;
    gameState.correctAnswers++;
    const timeBonus = Math.max(0, gameState.timeLeft * 10);
    const baseScore = 100;
    gameState.score += baseScore + timeBonus;
    
    showCorrectFeedback();
    stopTimer();
    setTimeout(() => {
        gameState.isProcessingAnswer = false;
        nextQuestion();
    }, 1500);
}

/**
 * 条文番号のキーダウンイベントを処理
 */
function handleArticleKeyDown(event) {
    if (gameState.isProcessingAnswer) {
        event.preventDefault();
        return;
    }
    
    // バックスペース、削除は無効
    if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
    }
}

/**
 * 項番号のキーダウンイベントを処理
 */
function handleParagraphKeyDown(event) {
    if (gameState.isProcessingAnswer) {
        event.preventDefault();
        return;
    }
    
    // バックスペース、削除は無効
    if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
    }
}

/**
 * 条文番号の表示を更新
 */
function updateArticleDisplay(inputValue, correctAnswer) {
    const overlay = document.getElementById('article-overlay');
    if (!overlay) return;
    
    let displayHtml = '';
    
    // 入力された数字を表示（緑色）
    for (let i = 0; i < inputValue.length; i++) {
        displayHtml += `<span style="color: #10b981; background-color: #d1fae5;">${inputValue[i]}</span>`;
    }
    
    // 残りの入力枠を表示
    const remainingLength = correctAnswer.length - inputValue.length;
    for (let i = 0; i < remainingLength; i++) {
        displayHtml += `<span style="color: #d1d5db;">_</span>`;
    }
    
    overlay.innerHTML = displayHtml;
}

/**
 * 項番号の表示を更新
 */
function updateParagraphDisplay(inputValue, correctAnswer) {
    const overlay = document.getElementById('paragraph-overlay');
    if (!overlay) return;
    
    let displayHtml = '';
    
    // 入力された数字を表示（緑色）
    for (let i = 0; i < inputValue.length; i++) {
        displayHtml += `<span style="color: #10b981; background-color: #d1fae5;">${inputValue[i]}</span>`;
    }
    
    // 残りの入力枠を表示
    const remainingLength = correctAnswer.length - inputValue.length;
    for (let i = 0; i < remainingLength; i++) {
        displayHtml += `<span style="color: #d1d5db;">_</span>`;
    }
    
    overlay.innerHTML = displayHtml;
}

/**
 * スピード条文データの事前読み込み
 */
async function initializeSpeedQuizData(caseData) {
    try {
        console.log('📚 ケースデータからスピード条文用データを抽出中...');
        
        // caseDataのnullチェック
        if (!caseData) {
            console.warn('⚠️ caseDataがnullまたはundefinedのため、スピード条文データの読み込みをスキップします');
            return;
        }
        
        // 既にデータが読み込まれている場合はスキップ
        if (window.speedQuizArticles && window.speedQuizArticles.length > 0) {
            console.log('✅ スピード条文データは既に読み込み済み');
            return;
        }
        
        // 条文参照を抽出（extractAllArticles関数を使用）
        const articles = await extractAllArticles(caseData);
        
        if (articles.length === 0) {
            console.log('⚠️ ケースデータに条文参照が見つかりませんでした');
            return;
        }
        
        console.log(`📋 ${articles.length}件の条文を抽出完了`);        
        // グローバル変数に保存
        window.speedQuizArticles = articles;
        
        if (articles.length > 0) {
            console.log(`✅ ${articles.length}件の条文データを事前読み込み完了`);
        } else {
            console.log('⚠️ 条文データの読み込みに失敗しました');
        }        
    } catch (error) {
        console.error('❌ スピード条文データの事前読み込みでエラー:', error);
    }
}

// ★★★ グローバル関数として公開 ★★★
window.initializeSpeedQuizData = initializeSpeedQuizData;
window.initializeSpeedQuizData = initializeSpeedQuizData;
window.initializeSpeedQuizGame = initializeSpeedQuizGame;
window.extractAllArticles = extractAllArticles;
window.initializeSpeedQuiz = initializeSpeedQuiz;
window.generateSpeedQuizHTML = generateSpeedQuizHTML;
