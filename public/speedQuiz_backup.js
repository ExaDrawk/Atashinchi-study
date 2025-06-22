// speedQuiz.js - スピード条文ゲームモジュール

/**
 * モジュール内の全条文を抽出
 * @param {Object} caseData - ケースデータ
 * @returns {Array} 条文リスト
 */
export async function extractAllArticles(caseData) {
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
    const patterns = [
        /【([^】]+?)([0-9]+(?:の[0-9]+)?条(?:第?[0-9]+項)?(?:[0-9]+号)?)】/g,
        /([^【]+?)([0-9]+(?:の[0-9]+)?条(?:第?[0-9]+項)?(?:[0-9]+号)?)/g
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(allText)) !== null) {
            const lawName = match[1].trim();
            const articleRef = match[2];
            
            // 有効な法令名かチェック
            if (isValidLawName(lawName)) {
                articles.add(`${lawName}${articleRef}`);
            }
        }
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
    const validLaws = [
        '憲法', '日本国憲法', '民法', '会社法', '刑法', '商法', 
        '民事訴訟法', '刑事訴訟法', '行政法', '労働基準法'
    ];
    return validLaws.some(law => lawName.includes(law));
}

/**
 * 条文文字列を解析（非同期で実際の条文内容を取得）
 */
async function parseArticle(articleStr) {
    const match = articleStr.match(/^(.+?)([0-9]+(?:の[0-9]+)?条)(?:第?([0-9]+)項)?(?:([0-9]+)号)?$/);
    if (!match) return null;
    
    const [, lawName, articleNum, paragraph, item] = match;
    const articleNumber = parseInt(articleNum.match(/([0-9]+(?:の[0-9]+)?)/)[1]);
    const paragraphNum = paragraph ? parseInt(paragraph) : null;
    const itemNum = item ? parseInt(item) : null;
    
    // 実際の条文内容を取得
    const content = await fetchArticleContent(lawName.trim(), articleNumber, paragraphNum, itemNum);
    
    return {
        lawName: lawName.trim(),
        fullText: articleStr,
        articleNumber: articleNumber,
        paragraph: paragraphNum,
        item: itemNum,
        displayText: `${lawName.trim()}${articleNum}${paragraph ? `第${paragraph}項` : ''}${item ? `${item}号` : ''}`,
        content: content // 実際の条文内容
    };
}

/**
 * 条文の内容を生成（サンプル）
 */
function generateArticleContent(lawName, articleNumber, paragraph, item) {
    // 代表的な条文のサンプル内容
    const sampleContents = {
        '民法': {
            1: '私権は、公共の福祉に適合しなければならない。',
            2: '解釈に疑義があるときは、信義に従い誠実に行わなければならない。',
            3: '権利の濫用は、これを許さない。',
            90: '公の秩序又は善良の風俗に反する事項を目的とする法律行為は、無効とする。',
            109: '第三者がその代理権を知り又は知ることができたときは、その代理権の範囲内においてした代理人の行為について、本人が責任を負う。'
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
    if (lawName.includes('民法')) lawSection = sampleContents['民法'];
    else if (lawName.includes('憲法')) lawSection = sampleContents['憲法'];
    else if (lawName.includes('刑法')) lawSection = sampleContents['刑法'];
    
    if (lawSection && lawSection[articleNumber]) {
        return lawSection[articleNumber];
    }
    
    // デフォルトの内容
    return `${lawName}第${articleNumber}条${paragraph ? `第${paragraph}項` : ''}${item ? `第${item}号` : ''}の内容です。条文の詳細な内容を表示するためには、法令データベースとの連携が必要です。`;
}

/**
 * スピード条文ゲームのHTML生成
 */
export function generateSpeedQuizHTML(caseData) {
    const articles = extractAllArticles(caseData);
    
    if (articles.length === 0) {
        return `
            <div class="text-center py-8">
                <h3 class="text-xl font-bold text-gray-600 mb-4">⚡ スピード条文</h3>
                <p class="text-gray-500">このモジュールには条文が含まれていません。</p>
            </div>
        `;
    }
    
    return `
        <div id="speed-quiz-container" class="max-w-4xl mx-auto">
            <div id="speed-quiz-menu" class="text-center py-8">
                <h3 class="text-3xl font-bold text-yellow-700 mb-4">⚡ スピード条文ゲーム</h3>
                <p class="text-gray-600 mb-6">このモジュールに登場する ${articles.length} 個の条文の番号を素早く入力しよう！</p>
                <div class="bg-blue-50 p-6 rounded-lg mb-6">
                    <h4 class="font-bold text-blue-800 mb-3">🎮 ルール説明</h4>
                    <ul class="text-left text-blue-700 space-y-2">
                        <li>• 条文内容が表示されるので、条文番号を入力</li>
                        <li>• 「条」の番号のみ入力（例：憲法21条 → 「21」と入力）</li>
                        <li>• 項がある場合は自動で項の入力に切り替わる</li>
                        <li>• 早く正解するほど高得点！</li>
                        <li>• 間違えると減点されるので注意</li>
                    </ul>
                </div>
                <button id="start-speed-quiz" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-xl">
                    🚀 ゲーム開始
                </button>
            </div>
            
            <div id="speed-quiz-game" class="hidden">
                <div class="bg-white rounded-lg shadow-lg p-6 mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-lg font-bold">
                            問題 <span id="current-question">1</span> / <span id="total-questions">${articles.length}</span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-yellow-600">
                                スコア: <span id="current-score">0</span>
                            </div>
                            <div class="text-sm text-gray-500">
                                残り時間: <span id="time-left">10</span>秒
                            </div>
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div id="progress-bar" class="bg-yellow-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div id="article-display" class="mb-6">
                        <div id="law-name" class="text-lg text-gray-600 mb-2"></div>
                        <div id="article-content" class="text-4xl font-bold text-gray-800 min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            条文内容がここに表示されます
                        </div>
                    </div>
                    
                    <div id="input-section" class="mb-6">
                        <div id="input-label" class="text-lg font-bold mb-3">条文番号を入力してください：</div>
                        <div class="flex justify-center items-center gap-4">
                            <input type="number" id="article-input" class="text-3xl text-center border-2 border-gray-300 rounded-lg p-4 w-32" placeholder="?" min="1" max="1000">
                            <span id="input-suffix" class="text-2xl font-bold text-gray-600">条</span>
                        </div>
                        <div id="paragraph-input-section" class="hidden mt-4">
                            <div class="text-lg font-bold mb-2">項番号を入力してください：</div>
                            <div class="flex justify-center items-center gap-4">
                                <input type="number" id="paragraph-input" class="text-2xl text-center border-2 border-gray-300 rounded-lg p-3 w-24" placeholder="?" min="1" max="10">
                                <span class="text-xl font-bold text-gray-600">項</span>
                            </div>
                        </div>
                    </div>
                    
                    <div id="feedback" class="mb-4 h-8"></div>
                    
                    <div class="flex justify-center gap-4">
                        <button id="submit-answer" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
                            ✓ 回答
                        </button>
                        <button id="skip-question" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg">
                            ⏭ スキップ
                        </button>
                        <button id="quit-game" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg">
                            🚪 終了
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="speed-quiz-result" class="hidden text-center py-8">
                <h3 class="text-3xl font-bold text-yellow-700 mb-4">🏆 ゲーム結果</h3>
                <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <div class="text-6xl font-bold text-yellow-600 mb-4" id="final-score">0</div>
                    <div class="text-xl text-gray-600 mb-6">
                        <div>正解数: <span id="correct-count">0</span> / <span id="total-count">${articles.length}</span></div>
                        <div>正答率: <span id="accuracy">0</span>%</div>
                        <div>平均回答時間: <span id="avg-time">0</span>秒</div>
                    </div>
                    <div id="rank-display" class="text-2xl font-bold mb-4"></div>
                </div>
                <div class="flex justify-center gap-4">
                    <button id="retry-game" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">
                        🔄 もう一度
                    </button>
                    <button id="back-to-menu" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                        📋 メニューに戻る
                    </button>
                </div>
            </div>
        </div>    `;
}

/**
 * スピード条文ゲームの初期化（レガシー版 - 削除予定）
 */
export function initializeSpeedQuiz(caseData) {
    console.warn('⚠️ この関数は非推奨です。initializeSpeedQuizGame を使用してください。');
    // 何もしない - 後方互換性のために残す
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
    }    // ゲームUI設定
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
            </div>
            
            <div class="text-center mb-4">
                <div id="input-stage-indicator" class="text-sm text-gray-600 mb-2">条文番号を入力してください</div>
                <input type="number" id="article-input" class="text-2xl text-center border-2 border-blue-300 rounded-lg p-3 w-32" placeholder="123" min="1">
                <button id="submit-answer" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg ml-4">回答</button>
            </div>
            
            <div id="feedback" class="mb-4 h-8 text-center"></div>
            
            <div class="text-center">
                <button id="skip-question" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2">スキップ</button>
                <button id="quit-game" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">終了</button>
            </div>
        </div>            <div id="speed-quiz-result" class="hidden text-center">
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
    }
    
    // Enter キーで回答送信
    const input = document.getElementById('article-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
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
    wrongAnswers: [] // 間違えた問題を記録
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
        wrongAnswers: [] // 間違えた問題を記録
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
    document.getElementById('current-score').textContent = gameState.score;    // 条文内容を表示（徐々に拡大）
    const articleDisplay = document.getElementById('article-text');
    
    // 条文の内容を取得（複数のプロパティ名をチェック）
    let content = currentArticle.content || currentArticle.text || currentArticle.displayText || '条文内容が見つかりません';
    
    // 条文内容から答えが分かる部分を隠す
    content = hideAnswersInContent(content, currentArticle);
    
    console.log('📝 表示する内容:', content);
    articleDisplay.textContent = content;
    articleDisplay.className = 'transition-all duration-1000 text-xs';
    
    // 段階的に文字サイズを大きく（ゆっくりと均一の速度で）
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-sm';
    }, 2000);
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-base';
    }, 4000);
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-lg';
    }, 6000);
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-xl';
    }, 8000);
    
    // 入力フィールドをリセット
    const input = document.getElementById('article-input');
    input.value = '';
    input.focus();
    
    // 入力段階を初期化
    gameState.currentAnswerStage = 'article';
    gameState.isWaitingForParagraph = false;
    document.getElementById('input-stage-indicator').textContent = '条文番号を入力してください';
    
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
            clearInterval(gameState.timer);
            
            // 間違えた問題として記録
            const currentArticle = gameState.articles[gameState.currentIndex];
            if (!gameState.wrongAnswers) {
                gameState.wrongAnswers = [];
            }
            gameState.wrongAnswers.push({
                article: currentArticle,
                userAnswer: null,
                reason: '時間切れ'
            });
            
            showIncorrectFeedback('時間切れ！');
            setTimeout(nextQuestion, 1500);
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
function checkAnswer(userInput) {
    const currentArticle = gameState.articles[gameState.currentIndex];
    
    if (gameState.currentAnswerStage === 'article') {
        if (parseInt(userInput) === currentArticle.articleNumber) {
            // 条文番号正解
            if (currentArticle.paragraph) {
                // 項がある場合は項の入力に移行
                gameState.currentAnswerStage = 'paragraph';
                gameState.isWaitingForParagraph = true;
                document.getElementById('input-stage-indicator').textContent = '項番号を入力してください';
                document.getElementById('article-input').value = '';
                document.getElementById('article-input').placeholder = '1';
                return 'continue'; // まだ完答ではない
            } else {
                // 項がない場合は完答
                return 'correct';
            }
        } else {
            return 'incorrect';
        }
    } else if (gameState.currentAnswerStage === 'paragraph') {
        if (parseInt(userInput) === currentArticle.paragraph) {
            return 'correct';
        } else {
            return 'incorrect';
        }
    }
    
    return 'incorrect';
}

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
    stopTimer();
    
    // スキップした問題を記録
    const currentArticle = gameState.articles[gameState.currentIndex];
    gameState.wrongAnswers.push({
        article: currentArticle,
        userAnswer: null,
        correctAnswer: `${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}`,
        reason: 'スキップ'
    });
    
    showIncorrectFeedback('スキップしました');
    setTimeout(nextQuestion, 1000);
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
        const cleanedContent = hideAnswersInContent(content, article);
        
        const wrongItem = document.createElement('div');
        wrongItem.className = 'bg-white p-4 rounded border-l-4 border-red-500';
        wrongItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-red-600">【${correctAnswer}】</span>
                <span class="text-sm text-gray-500">${reason}</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
                あなたの回答: <span class="font-mono bg-gray-100 px-2 py-1 rounded">${userAnswer}</span>
            </div>
            <div class="text-sm bg-gray-50 p-3 rounded">
                ${cleanedContent}
            </div>
        `;
        
        wrongList.appendChild(wrongItem);
    });
}

/**
 * 条文内容から答えが分かる部分を隠す
 * @param {string} content - 条文内容
 * @param {Object} article - 条文情報
 * @returns {string} - 答えを隠した条文内容
 */
function hideAnswersInContent(content, article) {
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
    }    // ゲームUI設定
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
            </div>
            
            <div class="text-center mb-4">
                <div id="input-stage-indicator" class="text-sm text-gray-600 mb-2">条文番号を入力してください</div>
                <input type="number" id="article-input" class="text-2xl text-center border-2 border-blue-300 rounded-lg p-3 w-32" placeholder="123" min="1">
                <button id="submit-answer" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg ml-4">回答</button>
            </div>
            
            <div id="feedback" class="mb-4 h-8 text-center"></div>
            
            <div class="text-center">
                <button id="skip-question" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2">スキップ</button>
                <button id="quit-game" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">終了</button>
            </div>
        </div>            <div id="speed-quiz-result" class="hidden text-center">
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
    }
    
    // Enter キーで回答送信
    const input = document.getElementById('article-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
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
    wrongAnswers: [] // 間違えた問題を記録
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
        wrongAnswers: [] // 間違えた問題を記録
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
    document.getElementById('current-score').textContent = gameState.score;    // 条文内容を表示（徐々に拡大）
    const articleDisplay = document.getElementById('article-text');
    
    // 条文の内容を取得（複数のプロパティ名をチェック）
    let content = currentArticle.content || currentArticle.text || currentArticle.displayText || '条文内容が見つかりません';
    
    // 条文内容から答えが分かる部分を隠す
    content = hideAnswersInContent(content, currentArticle);
    
    console.log('📝 表示する内容:', content);
    articleDisplay.textContent = content;
    articleDisplay.className = 'transition-all duration-1000 text-xs';
    
    // 段階的に文字サイズを大きく（ゆっくりと均一の速度で）
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-sm';
    }, 2000);
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-base';
    }, 4000);
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-lg';
    }, 6000);
    setTimeout(() => {
        articleDisplay.className = 'transition-all duration-1000 text-xl';
    }, 8000);
    
    // 入力フィールドをリセット
    const input = document.getElementById('article-input');
    input.value = '';
    input.focus();
    
    // 入力段階を初期化
    gameState.currentAnswerStage = 'article';
    gameState.isWaitingForParagraph = false;
    document.getElementById('input-stage-indicator').textContent = '条文番号を入力してください';
    
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
            clearInterval(gameState.timer);
            
            // 間違えた問題として記録
            const currentArticle = gameState.articles[gameState.currentIndex];
            if (!gameState.wrongAnswers) {
                gameState.wrongAnswers = [];
            }
            gameState.wrongAnswers.push({
                article: currentArticle,
                userAnswer: null,
                reason: '時間切れ'
            });
            
            showIncorrectFeedback('時間切れ！');
            setTimeout(nextQuestion, 1500);
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
function checkAnswer(userInput) {
    const currentArticle = gameState.articles[gameState.currentIndex];
    
    if (gameState.currentAnswerStage === 'article') {
        if (parseInt(userInput) === currentArticle.articleNumber) {
            // 条文番号正解
            if (currentArticle.paragraph) {
                // 項がある場合は項の入力に移行
                gameState.currentAnswerStage = 'paragraph';
                gameState.isWaitingForParagraph = true;
                document.getElementById('input-stage-indicator').textContent = '項番号を入力してください';
                document.getElementById('article-input').value = '';
                document.getElementById('article-input').placeholder = '1';
                return 'continue'; // まだ完答ではない
            } else {
                // 項がない場合は完答
                return 'correct';
            }
        } else {
            return 'incorrect';
        }
    } else if (gameState.currentAnswerStage === 'paragraph') {
        if (parseInt(userInput) === currentArticle.paragraph) {
            return 'correct';
        } else {
            return 'incorrect';
        }
    }
    
    return 'incorrect';
}

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
    stopTimer();
    
    // スキップした問題を記録
    const currentArticle = gameState.articles[gameState.currentIndex];
    gameState.wrongAnswers.push({
        article: currentArticle,
        userAnswer: null,
        correctAnswer: `${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}`,
        reason: 'スキップ'
    });
    
    showIncorrectFeedback('スキップしました');
    setTimeout(nextQuestion, 1000);
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
        const cleanedContent = hideAnswersInContent(content, article);
        
        const wrongItem = document.createElement('div');
        wrongItem.className = 'bg-white p-4 rounded border-l-4 border-red-500';
        wrongItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-red-600">【${correctAnswer}】</span>
                <span class="text-sm text-gray-500">${reason}</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
                あなたの回答: <span class="font-mono bg-gray-100 px-2 py-1 rounded">${userAnswer}</span>
            </div>
            <div class="text-sm bg-gray-50 p-3 rounded">
                ${cleanedContent}
            </div>
        `;
        
        wrongList.appendChild(wrongItem);
    });
}

/**
 * 回答送信
 */
function submitAnswer() {
    const input = document.getElementById('article-input');
    const userInput = input.value.trim();
    
    if (!userInput) {
        return;
    }
    
    const result = checkAnswer(userInput);
    
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
        
        showCorrectFeedback();    } else {
        // 不正解
        gameState.score = Math.max(0, gameState.score - 50); // 間違えると減点
        const currentArticle = gameState.articles[gameState.currentIndex];
        
        // 間違えた問題を記録
        gameState.wrongAnswers.push({
            article: currentArticle,
            userAnswer: userInput,
            correctAnswer: `${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}`,
            reason: '回答間違い'
        });
        
        showIncorrectFeedback(`❌ 不正解！正解は${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}でした`);
    }
    
    setTimeout(nextQuestion, 2000);
}

/**
 * 既存のAPIを使用して条文内容を取得
 */
async function fetchArticleContent(lawName, articleNumber, paragraph, item) {
    try {
        // 条文文字列を構築
        let articleText = `${articleNumber}条`;
        if (paragraph) {
            articleText += `第${paragraph}項`;
        }
        if (item) {
            articleText += `第${item}号`;
        }
        
        const inputText = `${lawName}${articleText}`;
        console.log(`🔍 条文取得リクエスト: "${inputText}"`);
        
        const response = await fetch('/api/parse-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputText: inputText
            })
        });
        
        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status}`);
        }
        
        const articleContent = await response.text();
        
        // エラーメッセージかどうかチェック
        if (articleContent.startsWith('❌')) {
            throw new Error(articleContent);
        }
        
        return articleContent;
    } catch (error) {
        console.warn('条文取得エラー:', error);
        // フォールバックとしてサンプル内容を返す
        return generateArticleContent(lawName, articleNumber, paragraph, item);
    }
}
