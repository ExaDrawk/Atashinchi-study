// speedQuiz.js - スピード条文ゲームモジュール

/**
 * 法令設定（絵文字・色・デザイン）の一元管理
 */
const LAW_SETTINGS = {
    '民法': {
        emoji: '🏠',
        color: 'from-red-500 to-red-600',
        textColor: 'text-white',
        name: '民法'
    },
    '刑法': {
        emoji: '⚖️',
        color: 'from-blue-500 to-blue-600',
        textColor: 'text-white',
        name: '刑法'
    },
    '日本国憲法': {
        emoji: '🇯🇵',
        color: 'from-green-500 to-green-600',
        textColor: 'text-white',
        name: '日本国憲法'
    },
    '憲法': {
        emoji: '🇯🇵',
        color: 'from-green-500 to-green-600',
        textColor: 'text-white',
        name: '憲法'
    },
    '民事訴訟法': {
        emoji: '�',
        color: 'from-yellow-500 to-yellow-600',
        textColor: 'text-black',
        name: '民事訴訟法'
    },
    '刑事訴訟法': {
        emoji: '🔍',
        color: 'from-purple-500 to-purple-600',
        textColor: 'text-white',
        name: '刑事訴訟法'
    },
    '商法': {
        emoji: '�',
        color: 'from-orange-500 to-orange-600',
        textColor: 'text-white',
        name: '商法'
    },
    '行政法': {
        emoji: '�️',
        color: 'from-lime-500 to-lime-600',
        textColor: 'text-black',
        name: '行政法'
    },
    '会社法': {
        emoji: '�',
        color: 'from-indigo-500 to-indigo-600',
        textColor: 'text-white',
        name: '会社法'
    }
};

/**
 * 法令名に対応する設定を取得
 * @param {string} lawName - 法令名
 * @returns {object} 法令設定オブジェクト
 */
function getLawSettings(lawName) {
    // 完全一致を優先
    if (LAW_SETTINGS[lawName]) {
        return LAW_SETTINGS[lawName];
    }
    
    // 部分一致で検索
    for (const [key, settings] of Object.entries(LAW_SETTINGS)) {
        if (lawName.includes(key)) {
            return settings;
        }
    }
    
    // デフォルト設定
    return {
        emoji: '📖',
        color: 'from-gray-500 to-gray-600',
        textColor: 'text-white',
        name: lawName || '不明な法令'
    };
}

/**
 * 記事データから法令名を抽出
 * @param {object} article - 記事オブジェクト
 * @returns {string} 法令名
 */
function extractLawName(article) {
    if (!article) return '不明な法令';
    
    // 詳細なデバッグログ
    console.log('=== 記事データ構造の詳細分析 ===');
    console.log('記事オブジェクト:', article);
    console.log('記事のキー:', Object.keys(article));
    console.log('記事のプロパティ詳細:');
    
    // 全てのプロパティを調べる
    for (const [key, value] of Object.entries(article)) {
        console.log(`  ${key}:`, typeof value, value);
        
        // オブジェクトプロパティの場合、さらに詳細に調べる
        if (typeof value === 'object' && value !== null) {
            console.log(`    ${key}のキー:`, Object.keys(value));
        }
    }
    
    // 法令名を取得する優先順位
    const lawNameCandidates = [
        article.lawName,
        article.law,
        article.fullLawName,
        article.lawTitle,
        article.title,
        article.name,
        article.displayText ? article.displayText.split('：')[0] : null,
        article.displayText ? article.displayText.split('（')[0] : null,
        article.displayText ? article.displayText.split(' ')[0] : null,
        article.displayText ? article.displayText.match(/^[^（）\s]+法/)?.[0] : null,
        article.displayText ? article.displayText.match(/^[^（）\s]+憲法/)?.[0] : null
    ];
    
    // 最初の有効な値を返す
    for (const candidate of lawNameCandidates) {
        if (candidate && typeof candidate === 'string' && candidate.trim()) {
            console.log('法令名が見つかりました:', candidate);
            return candidate.trim();
        }
    }
    
    // ファイル名から推測
    if (article.filename) {
        const fileBaseName = article.filename.split('-')[0];
        console.log('ファイル名からの推測:', fileBaseName);
        return fileBaseName;
    }
    
    console.log('法令名が見つかりませんでした');
    return '不明な法令';
}

// グローバルに公開
window.LAW_SETTINGS = LAW_SETTINGS;
window.getLawSettings = getLawSettings;

/**
 * 法令名に対応するデコ文字（絵文字）を取得（後方互換性のため残す）
 * @param {string} lawName - 法令名
 * @returns {string} 対応する絵文字
 */
function getLawEmoji(lawName) {
    return getLawSettings(lawName).emoji;
}

/**
 * サポートされている法令リストを取得
 */
async function getSupportedLaws() {
    try {
        const response = await fetch('/api/supported-laws');
        const data = await response.json();
        return data.supportedLaws || [];
    } catch (error) {
        console.error('SUPPORTED_LAWS取得エラー:', error);
        // フォールバック：基本的な法令のみ
        return ['民法', '刑法', '憲法', '会社法', '商法', '民事訴訟法', '刑事訴訟法', '刑事訴訟規則', '国家賠償法', '日本国憲法'];
    }
}

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
    
    // サポートされている法令リストを取得
    const supportedLaws = await getSupportedLaws();
    console.log('📚 サポート法令:', supportedLaws);
    
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
    console.log('🔍 条文抽出対象テキスト（抜粋）:', allText.substring(0, 500) + '...');
    
    // SUPPORTED_LAWSを使って動的に正規表現を生成
    const lawsPattern = supportedLaws.map(law => law.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    
    const patterns = [
        // 【】内の条文参照を抽出（項番号除去、余計な文言も除去）
        new RegExp(`【[^】]*?(${lawsPattern})[^】]*?(\\d+(?:の\\d+)?条)[^】]*?】`, 'g'),
        // より広範囲な【】内パターン
        /【([^】]*?)(\d+(?:の\d+)?条)[^】]*?】/g,
        // 【】なしでの条文参照（項番号除去）
        new RegExp(`(${lawsPattern})(\\d+(?:の\\d+)?条)(?:[^0-9条]|$)`, 'g')
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
    
    // デバッグ：国家賠償法の検出もチェック
    if (allText.includes('国家賠償法')) {
        console.log('✅ 「国家賠償法」がテキスト内に存在');
        const regexKokubai = /【[^】]*国家賠償法[^】]*\d+条[^】]*】/g;
        const matchesKokubai = allText.match(regexKokubai);
        console.log('🔍 国家賠償法を含む【】パターン:', matchesKokubai);
    }
      patterns.forEach((pattern, index) => {
        console.log(`🔍 パターン${index + 1}での抽出開始:`, pattern);
        let match;
        let matchCount = 0;
        
        while ((match = pattern.exec(allText)) !== null) {
            let lawName, articleRef;
            
            if (index === 0) {
                // 1番目のパターン：【】内の厳密なパターン
                const fullMatch = match[0];
                lawName = match[1];
                articleRef = match[2];
                
                // 余計な文言を除去（ただし書き、但し書き等）
                articleRef = articleRef.replace(/(?:ただし書き?|但し書き?|前段|後段|本文|各号|各項|柱書|前文).*$/, '');
                
            } else if (index === 1) {
                // 2番目のパターン：【】内の広範囲パターン
                const fullMatch = match[0];
                const beforeArticle = match[1];
                articleRef = match[2];
                
                // 余計な文言を除去
                articleRef = articleRef.replace(/(?:ただし書き?|但し書き?|前段|後段|本文|各号|各項|柱書|前文).*$/, '');
                
                // SUPPORTED_LAWSから法令名を抽出
                let foundLaw = null;
                for (const law of supportedLaws) {
                    if (fullMatch.includes(law)) {
                        foundLaw = law;
                        break;
                    }
                }
                if (!foundLaw) continue;
                lawName = foundLaw;
                
            } else if (index === 2) {
                // 3番目のパターン：【】なしでの抽出
                lawName = match[1];
                articleRef = match[2];
                
                // 余計な文言を除去
                articleRef = articleRef.replace(/(?:ただし書き?|但し書き?|前段|後段|本文|各号|各項|柱書|前文).*$/, '');
            }
            
            matchCount++;
            
            // デバッグログ
            console.log(`🎯 マッチ発見:`, { lawName, articleRef, fullMatch: match[0], pattern: index + 1 });
            
            // 有効な法令名かチェック（SUPPORTED_LAWSを使用）
            if (isValidLawNameWithList(lawName, supportedLaws) && lawName.length <= 15) {
                // 重複チェック用のキーを生成（法令名+条文番号のみ）
                const articleKey = `${lawName}${articleRef}`;
                articles.add(articleKey);
                console.log(`➕ 条文追加: ${articleKey}`);
            } else {
                console.log(`❌ 無効な法令名: "${lawName}" (${articleRef})`);
            }
        }
        console.log(`📊 パターン${index + 1}で ${matchCount} 件のマッチ`);
    });
    
    console.log(`📚 抽出された条文一覧 (${Array.from(articles).length}件):`);
    Array.from(articles).forEach((article, index) => {
        console.log(`  ${index + 1}. ${article}`);
    });
    
    // 非同期で条文を解析
    const parsedArticles = [];
    console.log(`🔄 ${Array.from(articles).length}件の条文を解析開始...`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const articleStr of Array.from(articles)) {
        console.log(`🔍 解析中: ${articleStr}`);
        try {
            const parsed = await parseArticle(articleStr, supportedLaws);
            if (parsed) {
                parsedArticles.push(parsed);
                successCount++;
                console.log(`✅ 解析成功: ${articleStr} -> ${parsed.displayText}`);
            } else {
                failureCount++;
                console.warn(`❌ 解析失敗: ${articleStr} (null返却)`);
            }
        } catch (error) {
            failureCount++;
            console.error(`❌ 解析エラー: ${articleStr} - ${error.message}`);
            
            // エラーが発生した場合でも、基本的な条文データを作成して保持
            try {
                const basicData = createBasicArticleData(articleStr, supportedLaws);
                if (basicData) {
                    parsedArticles.push(basicData);
                    console.log(`🔧 エラー回復: 基本データで保持 - ${basicData.displayText}`);
                }
            } catch (recoveryError) {
                console.error(`❌ 回復処理も失敗: ${articleStr} - ${recoveryError.message}`);
            }
        }
    }
    
    console.log(`📊 解析結果: 成功=${successCount}件, 失敗=${failureCount}件, 最終保持=${parsedArticles.length}件`);
    
    // 少なくとも1件でも条文があれば返す
    if (parsedArticles.length > 0) {
        console.log(`✅ 条文データ抽出完了: ${parsedArticles.length}件`);
        return parsedArticles;
    } else {
        console.warn(`⚠️ 抽出された条文がありません`);
        return [];
    }
}

/**
 * 有効な法令名かチェック
 */
/**
 * サポートリストを使用した法令名検証
 */
function isValidLawNameWithList(lawName, supportedLaws) {
    // 異常に長い文字列や不正な文字を含む場合は無効
    if (!lawName || lawName.length > 20 || lawName.includes('。') || lawName.includes('、')) {
        return false;
    }
    
    // SUPPORTED_LAWSとの一致をチェック
    return supportedLaws.some(law => lawName === law || lawName.startsWith(law));
}

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
async function parseArticle(articleStr, supportedLaws = []) {
    // 不正な文字列を事前に除外
    if (!articleStr || articleStr.length > 50) {
        console.warn(`🚫 不正な条文文字列: "${articleStr}"`);
        return null;
    }
    
    // 条文番号のみを抽出する正規表現（項番号は除外）
    // パターン1: 民法413条の2 -> 法令名 + 条文番号（「の」含む）
    const pattern1 = /^(.+?)(\d+条の\d+)$/;
    // パターン2: 民法413条 -> 法令名 + 条文番号（通常）
    const pattern2 = /^(.+?)(\d+条)$/;
    
    let match = articleStr.match(pattern1) || articleStr.match(pattern2);
    
    if (!match) {
        console.warn(`🚫 条文パターンにマッチしません: "${articleStr}"`);
        return null;
    }
    
    const [fullMatch, lawName, articleWithJou] = match;
    
    // 法令名の妥当性をSUPPORTED_LAWSでチェック
    if (!isValidLawNameWithList(lawName.trim(), supportedLaws)) {
        console.warn(`🚫 無効な法令名 (SUPPORTED_LAWSに未含): "${lawName}"`);
        console.warn(`📝 SUPPORTED_LAWSサンプル:`, supportedLaws.slice(0, 10));
        console.warn(`📝 検索対象法令名: "${lawName.trim()}"`);
        return null;
    }
    
    // 「条」を削除して条文番号のみを抽出（「413の2」「413」など）
    const articleNumberStr = articleWithJou.replace(/条$/, '');
    
    console.log(`🔍 条文解析成功: 法令名="${lawName.trim()}", 条文番号="${articleNumberStr}"`);
    
    // 条文メタデータを作成（項番号は含めない）
    const articleData = {
        lawName: lawName.trim(),
        fullText: articleStr,
        articleNumber: articleNumberStr, // 文字列として保持（「413の2」など）
        paragraph: null, // 項番号は含めない
        item: null, // 号番号は含めない
        displayText: `${lawName.trim()}${articleWithJou}`, // 「民法94条」「民法413条の2」の形式
        content: null // 本文は事前に取得しない
    };
    
    console.log(`✅ 条文メタデータ作成: ${articleData.displayText}`);
    
    return articleData;
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
 * @param {boolean} preserveExistingArticles - 既存の条文データを保持するかどうか
 */
export async function initializeSpeedQuizGame(containerId, caseData, preserveExistingArticles = false) {
    console.log('🎮 スピード条文ゲーム初期化開始', { containerId, caseData: caseData?.title, preserveExistingArticles });
    
    // 現在のモジュールパスをグローバル変数に設定
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    console.log('📍 現在のパス:', currentPath);
    console.log('📍 現在のハッシュ:', currentHash);
    
    // ケースページからの場合、ケースデータから情報を取得
    if (caseData && caseData.filePath) {
        const moduleFilePath = caseData.filePath;
        
        // caseDataのfilePath（例：刑事訴訟法/2.公訴・公判/2.1-6.js）をそのまま使用
        window.currentSpeedQuizModule = {
            filePath: moduleFilePath,
            lawName: caseData.category || '不明',
            chapter: caseData.subfolder || '',
            fileName: moduleFilePath.split('/').pop() || '',
            caseId: caseData.id || caseData.originalId || ''
        };
        
        console.log('🎯 ケースデータから現在のモジュール情報を設定:', window.currentSpeedQuizModule);
    } else if (currentPath.includes('/cases/')) {
        // cases/法律名/章/ファイル名.html の形式からモジュールパスを抽出
        const pathParts = currentPath.split('/');
        const casesIndex = pathParts.indexOf('cases');
        
        if (casesIndex >= 0 && pathParts.length > casesIndex + 3) {
            const lawName = pathParts[casesIndex + 1];
            const chapter = pathParts[casesIndex + 2];
            const fileName = pathParts[casesIndex + 3];
            
            // HTMLファイル名をJSファイル名に変換
            const jsFileName = fileName.replace('.html', '.js');
            const moduleFilePath = `${lawName}/${chapter}/${jsFileName}`;
            
            // グローバル変数に設定
            window.currentSpeedQuizModule = {
                filePath: moduleFilePath,
                lawName: lawName,
                chapter: chapter,
                fileName: jsFileName
            };
            
            console.log('🎯 URLパスから現在のモジュール情報を設定:', window.currentSpeedQuizModule);
        }
    } else if (currentHash && currentHash.includes('/case/')) {
        // ハッシュルーティングの場合、ケースIDから情報を推測
        const caseId = currentHash.split('/case/')[1];
        console.log('🎯 ケースIDから情報を推測:', caseId);
        
        // 既知のケースIDからモジュールパスを設定（暫定的）
        if (caseId === 'keiso-kouso-teiki-1') {
            window.currentSpeedQuizModule = {
                filePath: '刑事訴訟法/2.公訴・公判/2.1-6.js',
                lawName: '刑事訴訟法',
                chapter: '2.公訴・公判',
                fileName: '2.1-6.js',
                caseId: caseId
            };
            console.log('🎯 ケースIDから現在のモジュール情報を設定:', window.currentSpeedQuizModule);
        }
    }
    
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
        // 既存の条文データがあり、保持フラグが有効な場合はそれを使用
        if (preserveExistingArticles && window.speedQuizArticles && window.speedQuizArticles.length > 0) {
            console.log('🔄 既存の条文データを使用:', window.speedQuizArticles.length + '件');
        } else {
            // 条文を抽出（非同期）
            console.log('🔍 条文抽出開始:', caseData?.title);
            window.speedQuizArticles = await extractAllArticles(caseData);
        }
        
        console.log('📚 使用する条文数:', window.speedQuizArticles?.length || 0);
        console.log('📚 使用する条文詳細:', window.speedQuizArticles);
        
        if (!window.speedQuizArticles || window.speedQuizArticles.length === 0) {
            console.warn('⚠️ 条文データが空です');
            container.innerHTML = `
                <div class="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p class="text-yellow-700 font-bold text-lg mb-2">⚠️ 条文が見つかりません</p>
                    <p class="text-yellow-600">このモジュールには条文参照が含まれていないため、<br>スピード条文ゲームをプレイできません。</p>
                    <details class="mt-4 text-left">
                        <summary class="cursor-pointer text-yellow-700 font-semibold">デバッグ情報</summary>
                        <pre class="mt-2 text-xs bg-white p-2 rounded border">${JSON.stringify({
                            caseDataTitle: caseData?.title,
                            caseDataKeys: caseData ? Object.keys(caseData) : null,
                            articlesLength: window.speedQuizArticles?.length || 0
                        }, null, 2)}</pre>
                    </details>
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
        <style>
            @keyframes correctCircle {
                0% { transform: scale(0) rotate(0deg); opacity: 0; }
                50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
                100% { transform: scale(1) rotate(360deg); opacity: 0; }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .correct-circle-animation {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                animation: correctCircle 1.2s ease-out forwards;
                pointer-events: none;
            }
            
            .shake {
                animation: shake 0.5s ease-in-out;
            }

            .speed-quiz-article-container {
                display: flex;
                flex-direction: column;
            }

            .speed-quiz-article-scroll {
                max-height: 240px;
                overflow-y: auto;
                scroll-behavior: smooth;
                padding-right: 0.5rem;
            }

            .speed-quiz-article-scroll::-webkit-scrollbar {
                width: 6px;
            }

            .speed-quiz-article-scroll::-webkit-scrollbar-thumb {
                background-color: rgba(148, 163, 184, 0.6);
                border-radius: 9999px;
            }
        </style>
        
        <div id="speed-quiz-rules" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-6">
            <h2 class="text-2xl font-bold mb-4 text-center">⚡ スピード条文ゲーム</h2>
            <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                <h3 class="font-bold mb-2 text-white">🎯 ゲームルール：</h3>
                <ul class="text-sm space-y-1 text-white">
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
            
            <!-- 現在の法令名を表示 -->
            <div id="current-law-name" class="text-center mb-4 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
                <div class="text-xl font-bold">📚 法令名を取得中...</div>
            </div>
            
            <div id="article-display" class="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6 text-black speed-quiz-article-container">
                <div class="speed-quiz-article-scroll">
                    <div id="article-text" class="transition-all duration-500 text-xs text-black text-left">条文内容が表示されます...</div>
                </div>
            </div>

            <div class="text-center mb-4">
                <div class="flex items-center justify-center gap-2">
                    <div class="relative">
                        <input type="text" id="article-number-input" class="text-3xl text-center border-2 border-blue-300 rounded-lg p-4 w-40 font-mono tracking-widest bg-transparent" style="color: transparent;" maxlength="8" autocomplete="off">
                        <div id="article-overlay" class="absolute top-0 left-0 text-3xl text-center p-4 w-40 font-mono tracking-widest pointer-events-none text-black"></div>
                    </div>
                    <span class="text-3xl font-mono text-gray-600">条</span>
                    <div id="paragraph-section" class="flex items-center gap-2" style="display: none;">
                        <span class="text-3xl font-mono text-gray-600">第</span>
                        <div class="relative">
                            <input type="text" id="paragraph-number-input" class="text-3xl text-center border-2 border-blue-300 rounded-lg p-4 w-20 font-mono tracking-widest bg-transparent" style="color: transparent;" maxlength="2" autocomplete="off">
                            <div id="paragraph-overlay" class="absolute top-0 left-0 text-3xl text-center p-4 w-20 font-mono tracking-widest pointer-events-none text-black"></div>
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
            <h2 class="text-3xl font-bold mb-4 text-gray-800">🎉 ゲーム結果</h2>
            <div class="bg-white rounded-lg p-6 shadow-lg mb-6 text-black">
                <div class="text-4xl font-bold text-blue-600 mb-2">
                    <span id="final-score">0</span>点
                </div>
                <div class="text-gray-600 mb-4">
                    正解: <span id="correct-count">0</span> / ${articleCount}
                </div>
                <div id="score-rank" class="text-xl font-bold mb-4"></div>
                <div id="score-comment" class="text-gray-700"></div>
                
                <!-- 平均点情報表示 -->
                <div id="average-score-section" class="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">📊 今回の問題別平均点</h4>
                    <div id="average-score-list" class="text-sm text-gray-600 max-h-32 overflow-y-auto"></div>
                </div>
            </div>
            
            <div id="wrong-answers-section" class="hidden bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-bold text-red-700 mb-4">❌ 間違えた問題（復習用）</h3>
                <div id="wrong-answers-list" class="space-y-4 text-left max-h-96 overflow-y-auto"></div>
            </div>
            
            <div class="space-x-4">
                <button id="download-answer-rates" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">📊 正答率データをダウンロード</button>
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
 * 条文番号の入力を処理
 */
function handleArticleInput(e) {
    const input = e.target;
    let originalValue = input.value;
    const correctArticleNumber = gameState.correctArticleNumberNormalized || '';

    // 入力中の数字をコンソールに表示
    console.log(`🔢 入力値: "${originalValue}"`);

    // 全角数字を半角に自動変換
    const convertedValue = originalValue.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248));

    // 変換された場合、入力フィールドを更新
    if (convertedValue !== originalValue) {
        console.log(`🔄 全角→半角変換: "${originalValue}" → "${convertedValue}"`);
        input.value = convertedValue;
        originalValue = convertedValue;
    }

    // タイポ検知とペナルティ処理
    const typoResult = detectAndHandleTypo(originalValue, correctArticleNumber);

    if (typoResult.hasTypo) {
        console.log(`❌ タイポ検知: 入力="${originalValue}", 正解="${correctArticleNumber}"`);
        // タイポペナルティ適用
        applyTypoPenalty();

        // タイポ時の結果を記録（不正解）
        const currentArticle = gameState.articles[gameState.currentIndex];
        if (currentArticle) {
            recordQuizResult(currentArticle, 0, false); // 点数0、不正解
        }

        // 入力値を修正
        input.value = typoResult.correctedValue;
        input.focus();
        input.setSelectionRange(typoResult.correctedValue.length, typoResult.correctedValue.length);
    }

    // 新しい段階的表示ロジックを使用
    const result = getProgressiveDisplay(input.value, correctArticleNumber);
    const { display, isComplete, isValid } = result;

    // 表示を更新
    const articleOverlay = document.getElementById('article-overlay');
    if (articleOverlay) {
        articleOverlay.textContent = display;
    }

    // 正解判定
    if (isComplete && correctArticleNumber.length > 0) {
        input.readOnly = true;
        completeAnswer();
    }

    // デバッグ出力（開発時のみ表示）
    if (window.location.hash.includes('debug') || window.localStorage.getItem('speedQuizDebug') === 'true') {
        console.log({
            inputValue: originalValue,
            convertedValue: convertedValue,
            correctedValue: input.value,
            correctArticleNumber,
            display,
            isComplete,
            isValid,
            hasTypo: typoResult.hasTypo
        });
    }

    // 現在の入力状態を表示
    console.log(`📝 現在の入力状態: 入力="${input.value}", 正解="${correctArticleNumber}", 完了=${isComplete}`);
}

/**
 * 項番号入力を処理する関数（記事番号のみの仕様変更に伴い削除）
 */
/* function handleParagraphInput(event) {
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
    
    // ミスタイプ時に1秒減点
    if (hasIncorrectInput) {
        if (typeof gameState.timeLeft === 'number' && gameState.timeLeft > 0) {
            gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
            const timeRemainingElement = document.getElementById('time-remaining');
            if (timeRemainingElement) timeRemainingElement.textContent = gameState.timeLeft;
            showMistypeTimePenalty(); // アニメーション表示
        }
        showIncorrectInputAnimation(input, inputValue.slice(-1));
        input.value = validInput;
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
} */

/**
 * 正解時の処理
 */
function handleCorrectAnswer() {
    if (gameState.isProcessingAnswer) return;
    
    gameState.isProcessingAnswer = true;
    stopTimer();
    
    // 正答率記録
    const currentArticle = gameState.articles[gameState.currentIndex];
    if (currentArticle) {
        // スコア計算（残り時間ベース）
        const earnedScore = Math.max(1, gameState.timeLeft);
        recordArticleAnswer(
            currentArticle.lawName || 'その他',
            currentArticle.articleNumber,
            currentArticle.paragraph || 1,
            true,  // 正解
            earnedScore  // 獲得点数
        );
        // サーバーに条文を追加
        postArticleToLawList(currentArticle);
        // スコア更新
        gameState.score += earnedScore;
    }
    
    gameState.correctAnswers++;
    
    // フィードバック表示
    showCorrectFeedback();
    showCorrectCircleAnimation();
    
    console.log('✅ 正解処理完了');
    
    // 次の問題へ
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

const speedQuizGlobalHandlers = {
    keydown: null,
    visibilityChange: null,
    beforeUnload: null,
};

function cleanupSpeedQuizEventListeners() {
    if (speedQuizGlobalHandlers.keydown) {
        window.removeEventListener('keydown', speedQuizGlobalHandlers.keydown);
        speedQuizGlobalHandlers.keydown = null;
    }
    if (speedQuizGlobalHandlers.visibilityChange) {
        document.removeEventListener('visibilitychange', speedQuizGlobalHandlers.visibilityChange);
        speedQuizGlobalHandlers.visibilityChange = null;
    }
    if (speedQuizGlobalHandlers.beforeUnload) {
        window.removeEventListener('beforeunload', speedQuizGlobalHandlers.beforeUnload);
        speedQuizGlobalHandlers.beforeUnload = null;
    }
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
    
    // 正答率データダウンロードボタン
    const downloadBtn = document.getElementById('download-answer-rates');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAnswerRates);
    }    // 一文字ずつの入力判定
    const articleInput = document.getElementById('article-number-input');
    const paragraphInput = document.getElementById('paragraph-number-input');
    
    if (articleInput) {
        articleInput.addEventListener('input', handleArticleInput);
        articleInput.addEventListener('keydown', handleArticleKeyDown);
    }
    
    // 項番号入力は無効化（記事番号のみの仕様変更）
    /*
    if (paragraphInput) {
        paragraphInput.addEventListener('input', handleParagraphInput);
        paragraphInput.addEventListener('keydown', handleParagraphKeyDown);
    }
    */
    
    // グローバルで数字キー入力を監視し、入力欄が未フォーカスでも自動でフォーカス＆入力
    cleanupSpeedQuizEventListeners();

    const globalKeydownHandler = function(e) {
        // 数字キー・テンキー・全角数字・「の」・カタカナノのみ許可
        const isNumber = (e.key >= '0' && e.key <= '9') || /[０-９]/.test(e.key);
        const isNo = e.key === 'の' || e.key === 'ﾉ' || e.key === 'ノ';
        if (isNumber || isNo) {
            const articleInput = document.getElementById('article-number-input');
            const paragraphInput = document.getElementById('paragraph-number-input');
            
            // 項入力中なら項入力欄に送る
            if (isNumber && gameState && gameState.currentAnswerStage === 'paragraph' && paragraphInput) {
                if (document.activeElement !== paragraphInput) {
                    paragraphInput.focus();
                    // 数字のみ追加
                    let val = paragraphInput.value || '';
                    if (/[０-９]/.test(e.key)) {
                        val += String.fromCharCode(e.key.charCodeAt(0) - 0xFEE0);
                    } else {
                        val += e.key;
                    }
                    paragraphInput.value = val;
                    paragraphInput.dispatchEvent(new Event('input', { bubbles: true }));
                    e.preventDefault();
                }
            }
            // 条文番号入力中かつreadOnlyでない場合のみ条文番号欄に送る
            else if (articleInput && !articleInput.readOnly && document.activeElement !== articleInput) {
                articleInput.focus();
                // 入力値を追加
                let val = articleInput.value || '';
                // 全角数字→半角
                if (/[０-９]/.test(e.key)) {
                    val += String.fromCharCode(e.key.charCodeAt(0) - 0xFEE0);
                } else if (isNo) {
                    val += 'の';
                } else {
                    val += e.key;
                }
                articleInput.value = val;
                // inputイベントを手動発火
                articleInput.dispatchEvent(new Event('input', { bubbles: true }));
                e.preventDefault();
            }
        }
    };

    window.addEventListener('keydown', globalKeydownHandler);
    speedQuizGlobalHandlers.keydown = globalKeydownHandler;
    
    // ページ離脱時やタブ切り替え時にタイマーをクリア
    const handleVisibilityChange = () => {
        if (document.hidden && gameState && gameState.timer) {
            console.log('🌙 ページが非表示になったため、タイマーを一時停止');
            if (gameState.timer) {
                clearInterval(gameState.timer);
                gameState.timer = null;
            }
        }
    };
    
    const handleBeforeUnload = () => {
        if (gameState && gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
            console.log('🚪 ページ離脱時にタイマーをクリア');
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    speedQuizGlobalHandlers.visibilityChange = handleVisibilityChange;
    window.addEventListener('beforeunload', handleBeforeUnload);
    speedQuizGlobalHandlers.beforeUnload = handleBeforeUnload;
    
    console.log('✅ スピード条文ゲーム イベントリスナー設定完了');
}

// ゲーム状態管理
function createInitialGameState() {
    return {
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
}

let gameState = createInitialGameState();

/**
 * ゲーム開始
 */
// DOM要素待機用の再帰制限
let startSpeedQuizRetryCount = 0;
const MAX_RETRY_COUNT = 10;

export async function startSpeedQuiz() {
    console.log('🎮 スピード条文ゲーム開始');
    console.log('📚 利用可能な条文:', window.speedQuizArticles);
    
    // 条文データのチェック
    if (!window.speedQuizArticles || !Array.isArray(window.speedQuizArticles) || window.speedQuizArticles.length === 0) {
        console.error('❌ 条文データが利用できません:', window.speedQuizArticles);
        alert('条文データの読み込みに失敗しました。ページを再読み込みしてください。');
        return;
    }
    
    // DOM要素の存在チェック（警告のみ、継続実行）
    const speedQuizGameElement = document.getElementById('speed-quiz-game');
    if (!speedQuizGameElement) {
        console.warn('⚠️ スピードクイズのDOM要素が見つかりません。DOM生成を待機します。');
        
        // 再帰制限チェック
        if (startSpeedQuizRetryCount < MAX_RETRY_COUNT) {
            startSpeedQuizRetryCount++;
            setTimeout(() => {
                startSpeedQuiz();
            }, 100);
            return;
        } else {
            console.error('❌ DOM要素の待機がタイムアウトしました');
            alert('スピードクイズの初期化に失敗しました。ページを再読み込みしてください。');
            return;
        }
    }
    
    // 成功時は再帰カウントをリセット
    startSpeedQuizRetryCount = 0;
    
    // 既存のタイマーがあればクリア
    if (gameState && gameState.timer) {
        clearInterval(gameState.timer);
        console.log('⚠️ ゲーム開始時に既存タイマーをクリアしました');
    }
    
    // ゲーム状態を初期化
    gameState = createInitialGameState();
    gameState.articles = [...window.speedQuizArticles];
    
    // 問題をシャッフル
    gameState.articles = shuffleArray(gameState.articles);
    
    // UIを切り替え（ルール部分も非表示にする）
    const rulesElement = document.getElementById('speed-quiz-rules');
    const menuElement = document.getElementById('speed-quiz-menu');
    const gameElement = document.getElementById('speed-quiz-game');
    
    if (rulesElement) rulesElement.classList.add('hidden');
    if (menuElement) menuElement.classList.add('hidden');
    if (gameElement) gameElement.classList.remove('hidden');
    
    // 最初の問題を表示
    await displayCurrentQuestion();
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
async function displayCurrentQuestion() {
    if (gameState.currentIndex >= gameState.articles.length) {
        console.log(`🎉 クイズ完了: 全${gameState.articles.length}問終了`);
        console.log(`📊 最終成績: 正解${gameState.correctCount}/${gameState.articles.length}, タイポ${gameState.typoCount}回, 時間${gameState.elapsedTime}秒`);
        await showResult();
        return;
    }
    
    const currentArticle = gameState.articles[gameState.currentIndex];
    console.log('📖 現在の条文:', currentArticle);
    console.log('📚 条文データのキー:', Object.keys(currentArticle));
    console.log('📚 法令名データ:', {
        law: currentArticle.law,
        lawName: currentArticle.lawName,
        displayText: currentArticle.displayText?.substring(0, 100)
    });
    
    // UI更新
    const questionNumberElement = document.getElementById('question-number');
    const currentScoreElement = document.getElementById('current-score');
    
    if (questionNumberElement) questionNumberElement.textContent = gameState.currentIndex + 1;
    if (currentScoreElement) currentScoreElement.textContent = gameState.score;
    
    // 条文内容を表示（徐々に拡大）
    const articleDisplay = document.getElementById('article-text');
    const articleScrollContainer = document.querySelector('#article-display .speed-quiz-article-scroll') || document.getElementById('article-display');
    
    if (!articleDisplay) {
        console.error('❌ 条文表示要素が見つかりません');
        return;
    }
    
    // 条文の内容をオンデマンドで取得
    let content = '条文内容を読み込み中...';
    console.log('🔄 条文本文をオンデマンドで取得開始:', currentArticle.displayText);
    
    // 読み込み中表示
    articleDisplay.innerHTML = `<div class="whitespace-pre-line leading-relaxed text-black text-left">${content}</div>`;
    articleDisplay.className = 'text-base text-black';
    if (articleScrollContainer) {
        articleScrollContainer.scrollTop = 0;
    }
    
    // 法令名を更新
    const lawNameDisplay = document.getElementById('current-law-name');
    
    // 法令名を抽出
    const lawName = window.extractLawName ? window.extractLawName(currentArticle) : extractLawName(currentArticle);
    
    if (lawNameDisplay) {
        // 装飾的な表示を使用
        if (window.createDecorativeLawDisplay) {
            lawNameDisplay.innerHTML = window.createDecorativeLawDisplay(lawName);
        } else {
            // フォールバック表示
            lawNameDisplay.innerHTML = `<div class="text-center text-lg font-bold text-gray-700">${lawName}</div>`;
        }
        console.log('法令名表示更新:', lawName);
    } else {
        console.warn('法令名表示要素が見つかりません');
    }
    
    // 非同期で条文本文を取得
    try {
        const fetchedContent = await fetchArticleContentOnDemand(currentArticle);
        content = fetchedContent || currentArticle.displayText || '条文内容が見つかりません';
        
        // 条文内容から答えが分かる部分を隠す
        content = hideAnswersInContentForQuiz(content, currentArticle);
        
        console.log('📝 表示する内容:', content);
        // HTMLとして表示し、改行を保持（左詰めで表示）
        articleDisplay.innerHTML = `<div class="whitespace-pre-line leading-relaxed text-black text-left">${content}</div>`;
        if (articleScrollContainer) {
            articleScrollContainer.scrollTop = 0;
        }
        
    } catch (error) {
        console.error('❌ 条文本文取得エラー:', error);
        content = currentArticle.displayText || '条文内容の取得に失敗しました';
        articleDisplay.innerHTML = `<div class="whitespace-pre-line leading-relaxed text-black text-left">${content}</div>`;
        if (articleScrollContainer) {
            articleScrollContainer.scrollTop = 0;
        }
    }
    // 入力フィールドをリセット
    const articleInput = document.getElementById('article-number-input');
    const paragraphInput = document.getElementById('paragraph-number-input');
    const articleOverlay = document.getElementById('article-overlay');
    const paragraphOverlay = document.getElementById('paragraph-overlay');
    const paragraphSection = document.getElementById('paragraph-section');
    
    // 条文番号入力をリセット
    if (articleInput) {
        articleInput.value = '';
        articleInput.readOnly = false; // readonly状態を解除
        // 少し遅延してフォーカスを設定
        setTimeout(() => {
            articleInput.focus();
        }, 50);
    }
    if (articleOverlay) articleOverlay.innerHTML = '';
    
    // 項番号入力をリセット・非表示
    if (paragraphInput) {
        paragraphInput.value = '';
        paragraphInput.readOnly = false; // readonly状態を解除
    }
    if (paragraphOverlay) paragraphOverlay.innerHTML = '';
    if (paragraphSection) paragraphSection.style.display = 'none';
    
    // 処理フラグをリセット
    gameState.isProcessingAnswer = false;
    
    // 入力段階を初期化
    gameState.currentAnswerStage = 'article';
    gameState.isWaitingForParagraph = false;
    
    // 入力状態を完全にリセット（問題切り替え時の状態リセット）
    gameState.correctInput = '';
    gameState.currentInput = '';
    
    // 正解の条文番号を正規化してリセット
    gameState.correctArticleNumberNormalized = '';
    
    // 入力フィールドの状態と値を確実にリセット
    if (articleInput) {
        articleInput.value = '';  // 入力値をクリア
        articleInput.disabled = false;
        articleInput.style.backgroundColor = '';
        articleInput.style.cursor = 'text';
        articleInput.style.borderColor = '';
        articleInput.classList.remove('border-red-500', 'border-green-500');
    }
    if (paragraphInput) {
        paragraphInput.value = '';  // 入力値をクリア
        paragraphInput.disabled = false;
        paragraphInput.style.backgroundColor = '';
        paragraphInput.style.cursor = 'text';
        paragraphInput.style.borderColor = '';
        paragraphInput.classList.remove('border-red-500', 'border-green-500');
    }
    
    // 正解の条文番号のみを正規化して保存（項番号は含めない）
    const correctArticleNumber = currentArticle.articleNumber.toString();
    gameState.correctArticleNumberNormalized = correctArticleNumber
        .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248))
        .replace(/[のノ]/g, 'の');
    
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
    // 既存のタイマーが動いている場合は停止
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
        console.log('⚠️ 既存のタイマーをクリアしました');
    }
    
    const timeLimit = gameState.timeLimit || 10;
    gameState.timeLeft = timeLimit;
    
    const timeRemainingElement = document.getElementById('time-remaining');
    const progressBar = document.getElementById('time-progress');
    
    if (timeRemainingElement) timeRemainingElement.textContent = gameState.timeLeft;
    if (progressBar) progressBar.style.width = '100%';
    
    console.log(`⏰ タイマー開始: ${timeLimit}秒`);
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        
        if (timeRemainingElement) timeRemainingElement.textContent = gameState.timeLeft;
        
        updateTimerBar(); // バー更新関数を使用
        
        // 時間切れ処理
        if (gameState.timeLeft <= 0) {
            if (gameState.isProcessingAnswer) return; // 既に処理中なら無視
            
            gameState.isProcessingAnswer = true;
            clearInterval(gameState.timer);
            gameState.timer = null;
            console.log('⏰ 時間切れ');
              // 間違えた問題として記録
            const currentArticle = gameState.articles[gameState.currentIndex];
            if (currentArticle && currentArticle.articleNumber !== undefined) {
                gameState.wrongAnswers.push({
                    article: currentArticle,
                    userAnswer: null,
                    correctAnswer: `${currentArticle.articleNumber}${currentArticle.paragraph ? `第${currentArticle.paragraph}項` : ''}`,
                    reason: '時間切れ'
                });
                
                // 正答率記録（時間切れ＝不正解）
                recordArticleAnswer(
                    currentArticle.lawName || 'その他',
                    currentArticle.articleNumber,
                    currentArticle.paragraph || 1,
                    false,  // 不正解
                    0  // 獲得点数は0
                );
            }
            
            showIncorrectFeedback('時間切れ！', currentArticle.articleNumber, currentArticle.paragraph);
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
 * タイマーバーの更新
 */
function updateTimerBar() {
    const progressBar = document.getElementById('time-progress');
    if (!progressBar) return;
    
    const timeLimit = gameState.timeLimit || 10;
    const percentage = (gameState.timeLeft / timeLimit) * 100;
    progressBar.style.width = percentage + '%';
    
    // 時間が減った場合の警告色変更
    if (gameState.timeLeft <= 3) {
        progressBar.style.backgroundColor = '#ef4444'; // 赤色
    } else if (gameState.timeLeft <= 5) {
        progressBar.style.backgroundColor = '#f59e0b'; // 黄色
    } else {
        progressBar.style.backgroundColor = '#10b981'; // 緑色
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
    if (feedback) {
        feedback.innerHTML = '<div class="text-green-600 font-bold text-xl">✅ 正解！</div>';
        feedback.className = 'mb-4 h-8 text-green-600';
    } else {
        console.warn('⚠️ feedback要素が見つかりません');
    }
}

/**
 * 正解時の○付けアニメーションを表示
 */
function showCorrectCircleAnimation() {
    // 既存のアニメーションがあれば削除
    const existingAnimation = document.querySelector('.correct-circle-animation');
    if (existingAnimation) {
        existingAnimation.remove();
    }
    
    // 大きな緑の○を作成
    const circle = document.createElement('div');
    circle.className = 'correct-circle-animation';
    circle.innerHTML = `
        <div style="
            width: 200px;
            height: 200px;
            border: 12px solid #10b981;
            border-radius: 50%;
            background-color: rgba(16, 185, 129, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
        ">
            <div style="
                font-size: 80px;
                color: #10b981;
                font-weight: bold;
            ">✓</div>
        </div>
    `;
    
    // ページに追加
    document.body.appendChild(circle);
    
    // アニメーション終了後に削除
    setTimeout(() => {
        if (circle.parentElement) {
            circle.parentElement.removeChild(circle);
        }
    }, 1200);
}

/**
 * 不正解フィードバック表示＋正解表示
 * @param {string} message - フィードバックメッセージ
 * @param {string|number} correctArticle - 正しい条文番号
 * @param {string|number} correctParagraph - 正しい項（省略可）
 */
function showIncorrectFeedback(message = '❌ 不正解', correctArticle = '', correctParagraph = '') {
    const feedback = document.getElementById('feedback');
    let correctText = '';
    if (correctArticle) {
        correctText = `<div class='text-red-500 text-base mt-1'>正解: <span class='font-mono'>${correctArticle}${correctParagraph ? '－' + correctParagraph + '項' : ''}</span></div>`;
    }
    if (feedback) {
        feedback.innerHTML = `<div class="text-red-600 font-bold text-xl">${message}</div>${correctText}`;
        feedback.className = 'mb-4 h-8 text-red-600';
    } else {
        console.warn('⚠️ feedback要素が見つかりません');
    }
}

/**
 * 次の問題へ
 */
async function nextQuestion() {
    // 確実にタイマーを停止
    stopTimer();
    
    // 入力状態を完全にクリア（問題切り替え時の確実なリセット）
    gameState.correctInput = '';
    gameState.currentInput = '';
    gameState.isProcessingAnswer = false;
    gameState.currentAnswerStage = 'article';
    gameState.isWaitingForParagraph = false;
    gameState.correctArticleNumberNormalized = '';
    
    gameState.currentIndex++;
    
    if (gameState.currentIndex >= gameState.articles.length) {
        console.log(`🎉 クイズ完了: 全${gameState.articles.length}問終了`);
        console.log(`📊 最終成績: 正解${gameState.correctCount}/${gameState.articles.length}, タイポ${gameState.typoCount}回, 時間${gameState.elapsedTime}秒`);
        await showResult();
    } else {
        await displayCurrentQuestion();
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
        
        // 正答率記録（スキップ＝不正解）
        recordArticleAnswer(
            currentArticle.lawName || 'その他',
            currentArticle.articleNumber,
            currentArticle.paragraph || 1,
            false,  // 不正解
            0  // 獲得点数は0
        );
    }
    
    showIncorrectFeedback('スキップしました', currentArticle.articleNumber, currentArticle.paragraph);
    setTimeout(async () => {
        gameState.isProcessingAnswer = false;
        await nextQuestion();
    }, 1000);
}

/**
 * ゲーム終了
 */
async function quitGame() {
    stopTimer();
    
    // 元の条文データを復元（特定法律モードの場合）
    if (window.originalSpeedQuizArticles) {
        window.speedQuizArticles = window.originalSpeedQuizArticles;
        delete window.originalSpeedQuizArticles;
        console.log('🔄 元の条文データを復元しました');
    }
    
    if (confirm('ゲームを終了しますか？')) {
        document.getElementById('speed-quiz-game').classList.add('hidden');
        document.getElementById('speed-quiz-rules').classList.remove('hidden');
        document.getElementById('speed-quiz-menu').classList.remove('hidden');
    } else {
        await displayCurrentQuestion();
    }
}

/**
 * メニューに戻る
 */
function backToMenu() {
    // タイマーを確実に停止
    stopTimer();
    
    // 元の条文データを復元（特定法律モードの場合）
    if (window.originalSpeedQuizArticles) {
        window.speedQuizArticles = window.originalSpeedQuizArticles;
        delete window.originalSpeedQuizArticles;
        console.log('🔄 元の条文データを復元しました');
    }
    
    document.getElementById('speed-quiz-result').classList.add('hidden');
    document.getElementById('speed-quiz-game').classList.add('hidden');
    document.getElementById('speed-quiz-rules').classList.remove('hidden');
    document.getElementById('speed-quiz-menu').classList.remove('hidden');
}

/**
 * 結果表示
 */
async function showResult() {
    stopTimer();
    
    const gameElement = document.getElementById('speed-quiz-game');
    const resultElement = document.getElementById('speed-quiz-result');
    
    if (gameElement) gameElement.classList.add('hidden');
    if (resultElement) resultElement.classList.remove('hidden');
    
    // 結果を計算
    const totalQuestions = gameState.articles.length;
    const correctCount = gameState.correctAnswers;
    const score = gameState.score;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    
    // 結果を表示
    const finalScoreElement = document.getElementById('final-score');
    const correctCountElement = document.getElementById('correct-count');
    
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (correctCountElement) correctCountElement.textContent = correctCount;
    
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
    
    const rankElement = document.getElementById('score-rank');
    const commentElement = document.getElementById('score-comment');
    
    if (rankElement) rankElement.textContent = rank;
    if (commentElement) commentElement.textContent = comment;
    
    // 平均点情報を表示
    displayAverageScores();
    
    // 間違えた問題がある場合は表示
    await displayWrongAnswers();
}

/**
 * 平均点情報を表示
 */
function displayAverageScores() {
    const averageScoreList = document.getElementById('average-score-list');
    if (!averageScoreList) return;
    
    const answerRates = getAnswerRates();
    const scoreInfos = [];
    
    // 今回のゲームで出題された問題の平均点を収集
    gameState.articles.forEach(article => {
        const normalizedLawName = normalizeLawName(article.lawName || 'その他');
        const normalizedArticleNumber = article.articleNumber.toString();
        const paragraphKey = (article.paragraph || 1).toString();
        
        if (answerRates[normalizedLawName] && 
            answerRates[normalizedLawName][normalizedArticleNumber] && 
            answerRates[normalizedLawName][normalizedArticleNumber][paragraphKey]) {
            
            const record = answerRates[normalizedLawName][normalizedArticleNumber][paragraphKey];
            scoreInfos.push({
                law: normalizedLawName,
                article: normalizedArticleNumber,
                answered: record.answered,
                averageScore: record.averageScore || 0,
                correctRate: Math.round((record.correct / record.answered) * 100)
            });
        }
    });
    
    if (scoreInfos.length === 0) {
        averageScoreList.innerHTML = '<div class="text-gray-500">データがまだありません</div>';
        return;
    }
    
    // 平均点でソート（降順）
    scoreInfos.sort((a, b) => b.averageScore - a.averageScore);
    
    // 表示
    averageScoreList.innerHTML = scoreInfos.map(info => 
        `<div class="flex justify-between items-center py-1">
            <span class="font-mono">${info.law}${info.article}条</span>
            <span class="text-blue-600 font-semibold">平均${info.averageScore}点 (正答率${info.correctRate}%, ${info.answered}回)</span>
        </div>`
    ).join('');
}

/**
 * 間違えた問題を表示
 */
async function displayWrongAnswers() {
    if (!gameState.wrongAnswers || gameState.wrongAnswers.length === 0) {
        return;
    }
    
    const wrongSection = document.getElementById('wrong-answers-section');
    const wrongList = document.getElementById('wrong-answers-list');
    
    if (wrongSection) wrongSection.classList.remove('hidden');
    if (wrongList) wrongList.innerHTML = '';
    
    if (!wrongList) return; // wrongListがない場合は何もしない
    
    gameState.wrongAnswers.forEach(async (wrong, index) => {
        const article = wrong.article;
        const correctAnswer = wrong.correctAnswer;
        const userAnswer = wrong.userAnswer || '無回答';
        const reason = wrong.reason;
        
        // 条文内容をオンデマンドで取得
        let content = '条文内容を読み込み中...';
        try {
            const fetchedContent = await fetchArticleContentOnDemand(article);
            content = fetchedContent || article.displayText || '条文内容が見つかりません';
        } catch (error) {
            console.error('❌ 条文本文取得エラー（間違い表示）:', error);
            content = article.displayText || '条文内容の取得に失敗しました';
        }
        
        const cleanedContent = hideAnswersInContentForQuiz(content, article);
        
        const wrongItem = document.createElement('div');
        wrongItem.className = 'bg-white p-4 rounded border-l-4 border-red-500 text-black';
        wrongItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-red-600">【${correctAnswer}】</span>
                <span class="text-sm text-gray-500">${reason}</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
                あなたの回答: <span class="font-mono bg-gray-100 px-2 py-1 rounded text-black">${userAnswer}</span>
            </div>            <div class="text-sm bg-gray-50 p-3 rounded whitespace-pre-line leading-relaxed text-black">
                ${cleanedContent}
            </div>
        `;
        
        wrongList.appendChild(wrongItem);
    });
}

/**
 * サーバーに統計データを送信
 */
async function sendStatsToServer(lawName, articleNumber, paragraph, isCorrect) {
    try {
        const response = await fetch('/api/article-stats/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lawName,
                articleNumber,
                paragraph,
                isCorrect
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ サーバー統計更新成功:', result.message);
        } else {
            const error = await response.json();
            console.warn('⚠️ サーバー統計更新失敗:', error.error);
        }
    } catch (error) {
        console.warn('⚠️ サーバー統計送信エラー:', error.message);
        // エラーでもローカル統計は保持されるので、続行
    }
}

/**
 * スピードクイズ用：既存のAPIを使用して条文内容を取得
 */
async function fetchArticleContentForQuiz(lawName, articleNumber, paragraph, item) {
    // 法令名マッピング（憲法の自動変換など）
    const LAW_NAME_MAPPING = {
        '憲法': '日本国憲法',
        '日本国憲法': '日本国憲法'
    };
    const actualLawName = LAW_NAME_MAPPING[lawName] || lawName;
    
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
    
    const inputText = `${actualLawName}${articleText}`;
    
    try {
        console.log(`🔍 スピードクイズ条文取得: "${inputText}" (元の条文番号: "${articleNumber}", 項: ${paragraph}, 号: ${item})`);
        console.log(`📡 APIリクエスト詳細:`, {
            inputText: inputText,
            lawName: lawName,
            actualLawName: actualLawName,
            articleNumber: articleNumber,
            articleText: articleText,
            paragraph: paragraph,
            item: item
        });
        
        const response = await fetch('/api/parse-article', {
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
        const formattedContent = formatDoubleParenthesesForQuiz(articleContent);
        console.log(`🎯 条文内容取得成功: ${inputText}`);
        return formattedContent;
        
    } catch (error) {
        console.warn(`条文取得エラー (${inputText}): ${error.message}`);
        
        // より詳細なエラーログ
        console.log(`🔍 エラー詳細:`, {
            lawName: lawName,
            actualLawName: actualLawName,
            articleNumber: articleNumber,
            articleText: articleText,
            inputText: inputText,
            errorMessage: error.message
        });
        
        // フォールバックとしてサンプル内容を返す（エラーを上位に投げない）
        console.warn(`⚠️ 条文本文取得失敗、フォールバック使用: ${inputText}`);
        const fallbackContent = await generateArticleContentForQuiz(lawName, articleNumber, paragraph, item);
        console.log(`🔧 フォールバック内容を使用: ${fallbackContent.substring(0, 100)}...`);
        return fallbackContent;
    }
}

/**
 * スピードクイズ用：条文の内容を生成（サンプル）
 */
async function generateArticleContentForQuiz(lawName, articleNumber, paragraph, item) {
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
        '日本国憲法': {
            1: '天皇は、日本国の象徴であり日本国民統合の象徴であつて、この地位は、主権の存する日本国民の総意に基く。',
            9: '日本国民は、正義と秩序を基調とする国際平和を誠実に希求し、国権の発動たる戦争と、武力による威嚇又は武力の行使は、国際紛争を解決する手段としては、永久にこれを放棄する。',
            11: '国民は、すべての基本的人権の享有を妨げられない。この憲法が国民に保障する基本的人権は、侵すことのできない永久の権利として、現在及び将来の国民に与へられる。',
            14: 'すべて国民は、法の下に平等であつて、人種、信条、性別、社会的身分又は門地により、政治的、経済的又は社会的関係において、差別されない。',
            21: '集会、結社及び言論、出版その他一切の表現の自由は、これを保障する。',
            22: 'クソ人も、公共の福祉に反しない限り、居住、移転及び職業選択の自由を有する。２ 何人も、外国に移住し、又は国籍を離脱する自由を侵されない。',
            25: 'すべて国民は、健康で文化的な最低限度の生活を営む権利を有する。２ 国は、すべての生活部面について、社会福祉、社会保障及び公衆衛生の向上及び増進に努めなければならない。',
            29: '財産権は、これを侵してはならない。２ 財産権の内容は、公共の福祉に適合するやうに、法律でこれを定める。３ 私有財産は、正当な補償の下に、これを公共のために用ひることができる。'
        },
        '刑法': {
            1: 'この法律は、日本国内において罪を犯したすべての者に適用する。',
            199: '人を殺した者は、死刑又は無期若しくは五年以上の懲役に処する。',
            204: '人の身体を傷害した者は、十五年以下の懲役又は五十万円以下の罰金に処する。',
            235: '他人の財物を窃取した者は、窃盗の罪とし、十年以下の懲役又は五十万円以下の罰金に処する。'
        },
        '会社法': {
            1: '会社は、法人とする。',
            2: '会社は、次の各号に掲げる会社の種類に従い、それぞれ当該各号に定める社員の責任の限度が定款に定められた額に限定される。１ 株式会社 社員（株主）の責任は、その有する株式の引受価額を限度とする。２ 合同会社 社員の責任は、その出資の価額を限度とする。',
            3: '会社がその事業としてする行為及びその事業のためにする行為は、商行為とする。',
            5: '商号の登記の効力については、会社法の他の規定において別段の定めがある場合を除き、商法（明治三十二年法律第四十八号）第十九条から第二十一条までの規定を準用する。',
            295: '株主総会は、この法律に規定する事項及び株式会社の組織、運営、管理その他株式会社に関する一切の事項について決議をすることができる。２ 前項の規定にかかわらず、取締役会設置会社においては、株主総会は、この法律に規定する事項及び定款で定めた事項に限り、決議をすることができる。',
            327: '株式会社は、取締役を置かなければならない。２ 監査役会設置会社においては、監査役は、三人以上で、そのうち半数以上は、社外監査役でなければならない。３ 公開会社でない株式会社は、第三百二十六条第二項の規定の適用がある場合を除き、会計参与及び監査役又は委員会を置くことを要しない。',
            330: '株式会社と役員及び会計監査人との関係は、委任に関する規定に従う。',
            331: '次に掲げる者は、取締役となることができない。１ 法人 ２ 成年被後見人若しくは被保佐人又は外国の法令上これらと同様に取り扱われている者 ３ この法律若しくは一般社団法人及び一般財団法人に関する法律（平成十八年法律第四十八号）の規定に違反し、又は金融商品取引法第百九十七条、第百九十七条の二第一号から第十号まで若しくは第十三号、第百九十八条第八号、第百九十九条、第二百条第一号から第十二号まで、第二百三条第三項若しくは第二百五条第一号から第六号まで、第十九号若しくは第二十号の罪、民事再生法第二百五十五条、第二百五十六条、第二百五十八条から第二百六十条まで若しくは第二百六十二条の罪、外国倒産処理手続の承認援助に関する法律第六十五条、第六十六条、第六十八条若しくは第六十九条の罪、会社更生法第二百六十六条、第二百六十七条、第二百六十九条から第二百七十一条まで若しくは第二百七十三条の罪若しくは破産法第二百六十五条、第二百六十六条、第二百六十八条から第二百七十二条まで若しくは第二百七十四条の罪を犯し、刑に処せられ、その執行を終わり、又はその執行を受けることがなくなった日から二年を経過しない者'
        },
        '刑事訴訟規則': {
            1: 'この規則は、憲法の所期する裁判の迅速と公正とを図るようにこれを解釈し、運用しなければならない。２ 訴訟上の権利は、誠実にこれを行使し、濫用してはならない。',
            5: '被告人が管轄移転の請求書を差し出すには、事件の係属する裁判所を経由しなければならない。２ 前項の裁判所は、請求書を受け取つたときは、速やかにこれをその裁判所に対応する検察庁の検察官に通知しなければならない。',
            10: '忌避された裁判官は、次に掲げる場合を除いては、忌避の申立てに対し意見書を差し出さなければならない。１ 地方裁判所の一人の裁判官又は家庭裁判所若しくは簡易裁判所の裁判官が忌避の申立てを理由があるものとするとき。２ 忌避の申立てが訴訟を遅延させる目的のみでされたことが明らかであるとしてこれを却下するとき。３ 忌避の申立てが法第二十二条の規定に違反し、又は前条第二項若しくは第三項に定める手続に違反してされたものとしてこれを却下するとき。',
            20: '被告人又は全弁護人のする主任弁護人の指定又はその変更は、書面を裁判所に差し出してしなければならない。但し、公判期日において主任弁護人の指定を変更するには、その旨を口頭で申述すれば足りる。',
            25: '主任弁護人又は副主任弁護人は、弁護人に対する通知又は書類の送達について他の弁護人を代表する。２ 主任弁護人及び副主任弁護人以外の弁護人は、裁判長又は裁判官の許可及び主任弁護人又は副主任弁護人の同意がなければ、申立、請求、質問、尋問又は陳述をすることができない。',
            30: '裁判所は、身体の拘束を受けている被告人又は被疑者が裁判所の構内にいる場合においてこれらの者の逃亡、罪証の隠滅又は戒護に支障のある物の授受を防ぐため必要があるときは、これらの者と弁護人又は弁護人を選任することができる者の依頼により弁護人となろうとする者との接見については、その日時、場所及び時間を指定し、又、書類若しくは物の授受については、これを禁止することができる。',
            42: '第三十八条、第三十九条及び前条の調書には、裁判所書記官が取調又は処分をした年月日及び場所を記載して署名押印し、その取調又は処分をした者が認印しなければならない。但し、裁判所が取調又は処分をしたときは、認印は裁判長がしなければならない。２ 前条の調書には、処分をした時をも記載しなければならない。',
            50: '弁護人のない被告人の公判調書の閲覧は、裁判所においてこれをしなければならない。２ 前項の被告人が読むことができないとき又は目の見えないときにすべき公判調書の朗読は、裁判長の命により、裁判所書記官がこれをしなければならない。',
            60: '官吏その他の公務員以外の者が作るべき書類には、年月日を記載して署名押印しなければならない。'
        }
    };
    
    // 条文データを読み込み中の表示（フォールバック表示を改善）
    const basicContent = `【条文データを読み込み中】\n\n${lawName}${articleNumber}条${paragraph ? `第${paragraph}項` : ''}${item ? `第${item}号` : ''}の詳細な条文内容を読み込んでいます。\nしばらくお待ちください。`;
    
    // 法律名から適切なセクションを取得
    let lawSection = null;
    if (lawName.includes('民法')) {
        lawSection = sampleContents['民法'];
        console.log(`📚 民法セクション選択: 条文番号="${articleNumber}"`);
    }
    else if (lawName.includes('憲法') || lawName.includes('日本国憲法')) {
        // 憲法の場合は「日本国憲法」を優先し、なければ「憲法」を使用
        lawSection = sampleContents['日本国憲法'] || sampleContents['憲法'];
        console.log(`📚 憲法セクション選択: 条文番号="${articleNumber}", 使用セクション="${lawSection === sampleContents['日本国憲法'] ? '日本国憲法' : '憲法'}"`);
    }
    else if (lawName.includes('刑法')) {
        lawSection = sampleContents['刑法'];
        console.log(`📚 刑法セクション選択: 条文番号="${articleNumber}"`);
    }
    else if (lawName.includes('会社法')) {
        lawSection = sampleContents['会社法'];
        console.log(`📚 会社法セクション選択: 条文番号="${articleNumber}"`);
    }
    else if (lawName.includes('刑事訴訟規則')) {
        lawSection = sampleContents['刑事訴訟規則'];
        console.log(`📚 刑事訴訟規則セクション選択: 条文番号="${articleNumber}"`);
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
    // フォールバック処理：条文が見つからない場合は実際の条文取得を試みる
    console.warn(`❌ サンプル条文が見つかりません: ${lawName} ${articleNumber}条`);
    console.log(`🔍 最終検索状況:`, {
        lawName: lawName,
        articleNumber: articleNumber,
        paragraph: paragraph,
        item: item,
        lawSectionFound: !!lawSection,
        availableKeys: lawSection ? Object.keys(lawSection) : []
    });
    
    // サーバーAPIから条文を取得を試みる
    try {
        console.log(`🌐 APIから条文取得を試行: ${lawName} ${articleNumber}条`);
        const params = new URLSearchParams({
            lawName: lawName,
            articleNumber: articleNumber
        });
        if (paragraph) params.append('paragraph', paragraph);
        if (item) params.append('item', item);
        
        const response = await fetch(`/api/speed-quiz-article?${params}`);
        const data = await response.json();
        
        if (data.success && data.content) {
            console.log(`✅ APIから条文取得成功: ${data.content.substring(0, 100)}...`);
            return data.content;
        } else {
            console.warn(`❌ API取得失敗:`, data.error);
        }
    } catch (error) {
        console.error(`❌ API呼び出しエラー:`, error);
    }
    
    // 最終フォールバック
    const fallbackContent = `【条文データを読み込み中】\n\n${lawName}${articleNumber}条の詳細な条文内容を読み込んでいます。\nしばらくお待ちください。`;
    
    return fallbackContent;
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
 * 条文ごとの正答率を記録・保存する機能
 */

// 正答率データの構造：
// {
//   "民法": {
//     "415": { "1": { answered: 5, correct: 3 }, "2": { answered: 2, correct: 1 } },
//     "413": { "1": { answered: 3, correct: 2 } },
//     "413の2": { "1": { answered: 1, correct: 1 } }
//   },
//   "憲法": {
//     "9": { "1": { answered: 2, correct: 2 } }
//   }
// }

/**
 * 条文の正答率データを記録（ファイルベース保存のみ）
 */
/**
 * 指定した条文が含まれるモジュール情報を取得（相対パスで返す）
 */
function getModuleInfoForArticle(lawName, articleNumber) {
    try {
        console.log(`🔍 モジュール情報取得: ${lawName} ${articleNumber}条`);
        console.log(`📍 window.location.pathname: ${window.location.pathname}`);
        console.log(`📍 window.currentSpeedQuizModule:`, window.currentSpeedQuizModule);
        
        // 現在解いているスピードクイズのモジュール情報を取得
        // window.currentSpeedQuizModule が設定されている場合はそれを使用
        if (window.currentSpeedQuizModule && window.currentSpeedQuizModule.filePath) {
            console.log(`✅ 現在のスピードクイズモジュール: ${window.currentSpeedQuizModule.filePath}`);
            return [window.currentSpeedQuizModule.filePath];
        }
        
        // window.speedQuizContext が設定されている場合はそれを使用
        if (window.speedQuizContext && window.speedQuizContext.moduleFilePath) {
            console.log(`✅ スピードクイズコンテキストから取得: ${window.speedQuizContext.moduleFilePath}`);
            return [window.speedQuizContext.moduleFilePath];
        }
        
        // ページタイトルやグローバル変数から現在のモジュール情報を取得
        if (typeof window.getCurrentModulePath === 'function') {
            const modulePath = window.getCurrentModulePath();
            if (modulePath) {
                console.log(`✅ getCurrentModulePath()から取得: ${modulePath}`);
                return [modulePath];
            }
        }
        
        // ルーターの状態からモジュール情報を取得
        const currentHash = window.location.hash;
        console.log(`📍 現在のハッシュ: ${currentHash}`);
        
        if (currentHash && currentHash.includes('/case/')) {
            // #/case/keiso-kouso-teiki-1 のようなケースIDから推測
            console.log(`📄 ケースページからの呼び出しを検出、直接記録方式を使用`);
            
            // ケースIDをもとにした直接記録（ハードコーディング回避策）
            if (currentHash.includes('keiso-kouso-teiki-1')) {
                console.log(`🎯 刑事訴訟法・公訴の提起モジュールを検出`);
                return ['刑事訴訟法/2.公訴・公判/2.1-6.js'];
            }
        }
        
        console.log(`⚠️ モジュール情報が特定できませんでした。空配列を返します。`);
        console.log(`⚠️ デバッグ情報:`);
        console.log(`   - lawName: ${lawName}`);
        console.log(`   - articleNumber: ${articleNumber}`);
        console.log(`   - window.location: ${JSON.stringify(window.location)}`);
        return [];
        
    } catch (error) {
        console.error('❌ モジュール情報取得エラー:', error);
        return [];
    }
}

async function recordArticleAnswer(lawName, articleNumber, paragraph, isCorrect, earnedScore = 0) {
    try {
        // 法令名の正規化
        const normalizedLawName = normalizeLawName(lawName);
        
        // 条文番号の正規化
        const normalizedArticleNumber = articleNumber.toString();
        
        // 項番号（デフォルトは1）
        const paragraphKey = paragraph ? paragraph.toString() : '1';
        
        // 既存データをファイルから読み込み
        let lawData = await loadAnswerRateFromFile(normalizedLawName);
        
        // データ構造を初期化
        if (!lawData[normalizedArticleNumber]) {
            lawData[normalizedArticleNumber] = {};
        }
        
        if (!lawData[normalizedArticleNumber][paragraphKey]) {
            lawData[normalizedArticleNumber][paragraphKey] = {
                answered: 0,
                correct: 0,
                totalScore: 0,
                averageScore: 0,
                modules: []
            };
        }
        
        // 記録を更新
        const record = lawData[normalizedArticleNumber][paragraphKey];
        
        // 回答数と正解数の更新
        record.answered++;
        if (isCorrect) {
            record.correct++;
        }
        
        // 点数記録と平均点計算
        record.totalScore = (record.totalScore || 0) + earnedScore;
        record.averageScore = record.answered > 0 ? Math.round(record.totalScore / record.answered * 100) / 100 : 0;
        
        // モジュール情報を取得して、この条文データに追加
        const moduleInfo = getModuleInfoForArticle(normalizedLawName, normalizedArticleNumber);
        
        // モジュール情報を条文データに追加（重複を避ける）
        if (!record.modules) {
            record.modules = [];
        }
        
        moduleInfo.forEach(modulePath => {
            const exists = record.modules.includes(modulePath);
            if (!exists) {
                record.modules.push(modulePath);
                console.log(`📋 モジュール追加: ${normalizedLawName}${normalizedArticleNumber}条${paragraphKey}項 にモジュールパス ${modulePath} を追加`);
            }
        });
        
        // ファイルベース保存
        await saveAnswerRateToFile(normalizedLawName, lawData);
        
        // メインページの統計情報を更新（関数が存在する場合）
        if (typeof window.updateStatsDisplay === 'function') {
            const allData = await getAllAnswerRatesFromFiles();
            window.updateStatsDisplay(allData);
        }
        
        // サーバーにも統計を送信
        sendStatsToServer(normalizedLawName, normalizedArticleNumber, paragraphKey, isCorrect);
        
        console.log(`📊 記録更新: ${normalizedLawName}${normalizedArticleNumber}条${paragraphKey}項 - ${isCorrect ? '正解' : '不正解'} +${earnedScore}点 (正答率: ${record.correct}/${record.answered}, 平均点: ${record.averageScore})`);
        
    } catch (error) {
        console.error('❌ 正答率記録エラー:', error);
    }
}

/**
 * 総回答数を取得（ファイルベースから）
 */
async function getTotalAnsweredCount() {
    try {
        const answerRates = await getAnswerRates();
        let total = 0;
        
        for (const lawName in answerRates) {
            for (const articleNumber in answerRates[lawName]) {
                for (const paragraph in answerRates[lawName][articleNumber]) {
                    total += answerRates[lawName][articleNumber][paragraph].answered || 0;
                }
            }
        }
        
        return total;
    } catch (error) {
        console.error('❌ 総回答数取得エラー:', error);
        return 0;
    }
}

/**
 * 法令名を正規化
 */
function normalizeLawName(lawName) {
    if (!lawName) return 'その他';
    
    // 一般的な法令名の正規化
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
    
    // 部分一致で法令名を特定
    for (const [key, value] of Object.entries(normalizations)) {
        if (lawName.includes(key)) {
            return value;
        }
    }
    
    // 特定できない場合は元の名前を返す
    return lawName;
}

/**
 * 正答率データを取得（ファイルベースのみ）
 */
async function getAnswerRates(lawName = null) {
    try {
        let answerRates = {};
        
        // 特定の法令が指定されている場合
        if (lawName) {
            const fileData = await loadAnswerRateFromFile(lawName);
            if (fileData && Object.keys(fileData).length > 0) {
                answerRates[lawName] = fileData;
            }
            return answerRates;
        }
        
        // 全法令のデータを取得
        const fileList = await getSpeedQuizFileList();
        for (const lawName of fileList) {
            try {
                const fileData = await loadAnswerRateFromFile(lawName);
                if (fileData && Object.keys(fileData).length > 0) {
                    answerRates[lawName] = fileData;
                }
            } catch (error) {
                console.warn(`⚠️ ${lawName}のファイルデータ読み込み失敗:`, error);
            }
        }
        
        return answerRates;
        
    } catch (error) {
        console.error('❌ 正答率データ取得エラー:', error);
        return {};
    }
}

/**
 * 正答率データをファイルとしてダウンロード
 */
function downloadAnswerRates() {
    try {
        const answerRates = getAnswerRates();
        
        if (Object.keys(answerRates).length === 0) {
            alert('記録されたデータがありません。');
            return;
        }
        
        // 読みやすい形式に整形
        let formattedData = '# スピード条文 正答率データ\n\n';
        formattedData += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
        
        for (const [lawName, articles] of Object.entries(answerRates)) {
            formattedData += `## ${lawName}\n\n`;
            
            for (const [articleNumber, paragraphs] of Object.entries(articles)) {
                for (const [paragraphKey, record] of Object.entries(paragraphs)) {
                    const accuracy = record.answered > 0 ? (record.correct / record.answered * 100).toFixed(1) : '0.0';
                    formattedData += `${articleNumber}条${paragraphKey}項: ${record.correct}/${record.answered} (${accuracy}%)\n`;
                }
            }
            formattedData += '\n';
        }
        
        // JSONデータも追加
        formattedData += '---\n\n# 生データ (JSON)\n\n';
        formattedData += JSON.stringify(answerRates, null, 2);
        
        // ファイルダウンロード
        const blob = new Blob([formattedData], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speed_quiz_answer_rates_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📁 正答率データをダウンロードしました');
        
    } catch (error) {
        console.error('❌ ファイルダウンロードエラー:', error);
        alert('ファイルのダウンロードに失敗しました。');
    }
}

/**
 * フィルタリングされたスピードクイズを開始
 */
export function startFilteredSpeedQuiz(settings) {
    console.log('🎯 フィルタリングされたクイズ開始:', settings);
    
    try {
        // 全ての条文データから、設定に基づいてフィルタリング
        const allArticles = window.speedQuizArticles || [];
        let filteredArticles = [...allArticles];
        
        console.log(`📊 初期条文数: ${allArticles.length}`);
        console.log(`📊 初期filteredArticles数: ${filteredArticles.length}`);
        
        // 初期データの詳細を表示
        if (allArticles.length > 0) {
            console.log('📄 初期条文データサンプル（最初の3件）:');
            allArticles.slice(0, 3).forEach((article, index) => {
                console.log(`  ${index + 1}. 法令名: "${article.lawName}", 条文番号: "${article.articleNumber}", 項: ${article.paragraph}`);
            });
        }
        
        // 設定の詳細を表示
        console.log('⚙️ 設定詳細:');
        console.log('  selectedLaws:', settings.selectedLaws);
        console.log('  mode:', settings.mode);
        console.log('  targetArticle:', settings.targetArticle);
        console.log('  filterWeak:', settings.filterWeak);
        console.log('  filterNoParagraph:', settings.filterNoParagraph);
        console.log('  filterRecent:', settings.filterRecent);
        console.log('  questionCount:', settings.questionCount);
        
        // 単体条文モードの処理
        if (settings.mode === 'single' && settings.targetArticle) {
            console.log('🎯 単体条文モード処理開始');
            const target = settings.targetArticle;
            
            filteredArticles = filteredArticles.filter(article => {
                const normalizedLawName = normalizeLawName(article.lawName || '');
                const targetLawName = normalizeLawName(target.lawName);
                const articleMatch = article.articleNumber === target.articleNumber;
                const paragraphMatch = (article.paragraph || 1) === (target.paragraph || 1);
                const lawMatch = normalizedLawName === targetLawName;
                
                console.log(`🔍 条文チェック: ${article.lawName}${article.articleNumber}条${article.paragraph ? `第${article.paragraph}項` : ''}`);
                console.log(`  法令一致: ${lawMatch} (${normalizedLawName} === ${targetLawName})`);
                console.log(`  条文一致: ${articleMatch} (${article.articleNumber} === ${target.articleNumber})`);
                console.log(`  項一致: ${paragraphMatch} (${article.paragraph || 1} === ${target.paragraph || 1})`);
                
                return lawMatch && articleMatch && paragraphMatch;
            });
            
            console.log(`📊 単体条文フィルタリング後: ${filteredArticles.length}問`);
        }
        
        // 法令でフィルタリング
        if (settings.selectedLaws && settings.selectedLaws.length > 0) {
            console.log('🔍 法令フィルタリング開始:', settings.selectedLaws);
            
            // 利用可能な法令名をすべて表示
            const availableLaws = [...new Set(allArticles.map(article => {
                const original = article.lawName || '';
                const normalized = normalizeLawName(original);
                return `${original} → ${normalized}`;
            }))];
            console.log('📋 利用可能な法令名一覧:', availableLaws);
            
            filteredArticles = filteredArticles.filter(article => {
                const normalizedLawName = normalizeLawName(article.lawName || '');
                const isIncluded = settings.selectedLaws.includes(normalizedLawName);
                if (!isIncluded) {
                    console.log(`❌ 除外: ${article.lawName} (正規化: ${normalizedLawName})`);
                }
                return isIncluded;
            });
            console.log(`📊 法令フィルタリング後: ${filteredArticles.length}問`);
        }
        
        // 弱点問題でフィルタリング（正答率60%未満）
        if (settings.filterWeak || settings.mode === 'weak') {
            console.log('🔍 弱点問題フィルタリング開始');
            const answerRates = getAnswerRates();
            console.log('📊 正答率データ:', answerRates);
            
            const beforeCount = filteredArticles.length;
            
            filteredArticles = filteredArticles.filter(article => {
                const normalizedLawName = normalizeLawName(article.lawName || '');
                const articleNumber = article.articleNumber.toString();
                const paragraph = article.paragraph ? article.paragraph.toString() : '1';
                
                const record = answerRates[normalizedLawName]?.[articleNumber]?.[paragraph];
                
                // 回答データがない場合：初回なので弱点候補として含める
                if (!record || record.answered === 0) {
                    console.log(`✅ 含める（初回）: ${normalizedLawName} 第${articleNumber}条 第${paragraph}項`);
                    return true;
                }
                
                // 1回以上回答済みで正答率が60%未満の場合
                const accuracy = (record.correct / record.answered) * 100;
                const isWeak = accuracy < 60;
                
                if (isWeak) {
                    console.log(`✅ 含める（弱点）: ${normalizedLawName} 第${articleNumber}条 第${paragraph}項 (正答率: ${accuracy.toFixed(1)}%)`);
                } else {
                    console.log(`❌ 除外（正答率高い）: ${normalizedLawName} 第${articleNumber}条 第${paragraph}項 (正答率: ${accuracy.toFixed(1)}%)`);
                }
                
                return isWeak;
            });
            
            console.log(`📊 弱点問題フィルタリング後: ${filteredArticles.length}問（${beforeCount}問から）`);
        }
        
        // 項番号なしでフィルタリング
        if (settings.filterNoParagraph || settings.mode === 'no-paragraph') {
            console.log('🔍 項番号なしフィルタリング開始');
            filteredArticles = filteredArticles.filter(article => !article.paragraph);
            console.log(`📊 項番号なしフィルタリング後: ${filteredArticles.length}問`);
        }
        
        // 最近間違えた問題でフィルタリング（過去7日間）
        if (settings.filterRecent) {
            console.log('🔍 最近間違えた問題フィルタリング開始');
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const answerRates = getAnswerRates();
            
            filteredArticles = filteredArticles.filter(article => {
                const normalizedLawName = normalizeLawName(article.lawName || '');
                const articleNumber = article.articleNumber.toString();
                const paragraph = article.paragraph ? article.paragraph.toString() : '1';
                
                const record = answerRates[normalizedLawName]?.[articleNumber]?.[paragraph];
                if (!record || !record.lastAnswered) return false;
                
                return record.lastAnswered > sevenDaysAgo && record.correct < record.answered;
            });
            console.log(`📊 最近間違えた問題フィルタリング後: ${filteredArticles.length}問`);
        }
        
        // 問題数を制限
        if (settings.questionCount !== 'all') {
            const count = parseInt(settings.questionCount);
            if (filteredArticles.length > count) {
                // ランダムに選択
                filteredArticles = shuffleArray(filteredArticles).slice(0, count);
            }
        }
        
        console.log(`📚 フィルタリング結果: ${filteredArticles.length}問`);
        
        if (filteredArticles.length === 0) {
            console.error('❌ フィルタリング結果が0件です');
            console.log('📊 設定詳細:', {
                selectedLaws: settings.selectedLaws,
                filterWeak: settings.filterWeak,
                filterNoParagraph: settings.filterNoParagraph,
                filterRecent: settings.filterRecent,
                mode: settings.mode,
                questionCount: settings.questionCount
            });
            
            // 弱点問題モードで結果が0件の場合、全問題に戻す
            if (settings.mode === 'weak' || settings.filterWeak) {
                console.log('🔄 弱点問題が見つからないため、全問題に変更します');
                filteredArticles = [...allArticles];
                
                // 法令フィルタのみ再適用
                if (settings.selectedLaws && settings.selectedLaws.length > 0) {
                    filteredArticles = filteredArticles.filter(article => {
                        const normalizedLawName = normalizeLawName(article.lawName || '');
                        return settings.selectedLaws.includes(normalizedLawName);
                    });
                }
                
                console.log(`🔄 全問題に変更後: ${filteredArticles.length}問`);
                
                if (filteredArticles.length > 0) {
                    alert('弱点問題が見つからないため、選択した法令の全問題でゲームを開始します。');
                } else {
                    // より詳細なエラーメッセージ
                    let errorMessage = '選択した条件に一致する問題がありません。\n\n';
                    errorMessage += `初期条文数: ${allArticles.length}問\n`;
                    
                    if (settings.selectedLaws && settings.selectedLaws.length > 0) {
                        errorMessage += `選択法令: ${settings.selectedLaws.join(', ')}\n`;
                    }
                    if (settings.filterWeak || settings.mode === 'weak') {
                        errorMessage += '弱点問題フィルタ: ON\n';
                    }
                    if (settings.filterNoParagraph || settings.mode === 'no-paragraph') {
                        errorMessage += '項番号なしフィルタ: ON\n';
                    }
                    if (settings.filterRecent) {
                        errorMessage += '最近間違えた問題フィルタ: ON\n';
                    }
                    
                    errorMessage += '\n条件を緩和して再度お試しください。';
                    alert(errorMessage);
                    return;
                }
            } else {
                // より詳細なエラーメッセージ
                let errorMessage = '選択した条件に一致する問題がありません。\n\n';
                errorMessage += `初期条文数: ${allArticles.length}問\n`;
                
                if (settings.selectedLaws && settings.selectedLaws.length > 0) {
                    errorMessage += `選択法令: ${settings.selectedLaws.join(', ')}\n`;
                }
                if (settings.filterWeak || settings.mode === 'weak') {
                    errorMessage += '弱点問題フィルタ: ON\n';
                }
                if (settings.filterNoParagraph || settings.mode === 'no-paragraph') {
                    errorMessage += '項番号なしフィルタ: ON\n';
                }
                if (settings.filterRecent) {
                    errorMessage += '最近間違えた問題フィルタ: ON\n';
                }
                
                errorMessage += '\n条件を緩和して再度お試しください。';
                alert(errorMessage);
                return;
            }
        }
        
        // フィルタリングされた条文でゲームを開始
        window.speedQuizArticles = filteredArticles;
        
        // 既存のタイマーがあればクリア
        if (gameState && gameState.timer) {
            clearInterval(gameState.timer);
            console.log('⚠️ フィルタ設定時に既存タイマーをクリアしました');
        }
        
        // ゲーム状態を初期化してタイマー制限を設定
        gameState = {
            articles: [...filteredArticles],
            currentIndex: 0,
            score: 0,
            correctAnswers: 0,
            timer: null,
            timeLeft: settings.timeLimit || 10,
            timeLimit: settings.timeLimit || 10, // 制限時間を設定
            isWaitingForParagraph: false,
            currentAnswerStage: 'article',
            wrongAnswers: [],
            isProcessingAnswer: false,
            correctInput: '',
            currentInput: ''
        };
        
        // スピードクイズページに遷移する
        // 現在のハッシュに法律名パラメータが含まれているか確認し、維持する
        const currentHash = window.location.hash;
        if (currentHash.includes('?law=')) {
            // 既存のURLパラメータを維持
            console.log('🔍 既存の法律パラメータを維持します:', currentHash);
        } else {
            // settings内に法律名が指定されていれば、それをURLに追加
            if (settings && settings.specificLaw) {
                window.location.hash = `#/speed-quiz?law=${encodeURIComponent(settings.specificLaw)}`;
                console.log(`📚 特定法律のURLに遷移: ${settings.specificLaw}`);
            } else {
                window.location.hash = '#/speed-quiz';
                console.log('🔍 通常のスピードクイズURLに遷移');
            }
        }
        
    } catch (error) {
        console.error('❌ フィルタリングクイズ開始エラー:', error);
        alert('クイズの開始に失敗しました。');
    }
}

/**
 * 正答率の低い条文を取得
 */
export function getWeakArticles(threshold = 60, minAnswered = 2) {
    const answerRates = getAnswerRates();
    const weakArticles = [];
    
    for (const lawName in answerRates) {
        for (const articleNumber in answerRates[lawName]) {
            for (const paragraph in answerRates[lawName][articleNumber]) {
                const record = answerRates[lawName][articleNumber][paragraph];
                
                if (record.answered >= minAnswered) {
                    const accuracy = (record.correct / record.answered) * 100;
                    if (accuracy < threshold) {
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
    }
    
    // 正答率の低い順にソート
    return weakArticles.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * 法令別の統計を取得
 */
export function getLawStatistics() {
    const answerRates = getAnswerRates();
    const statistics = {};
    
    for (const lawName in answerRates) {
        let totalAnswered = 0;
        let totalCorrect = 0;
        let articleCount = 0;
        
        for (const articleNumber in answerRates[lawName]) {
            for (const paragraph in answerRates[lawName][articleNumber]) {
                const record = answerRates[lawName][articleNumber][paragraph];
                totalAnswered += record.answered;
                totalCorrect += record.correct;
                articleCount++;
            }
        }
        
        const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
        
        statistics[lawName] = {
            accuracy,
            totalAnswered,
            totalCorrect,
            articleCount
        };
    }
    
    return statistics;
}

/**
 * 入力値と正解番号から、正規化してどこまで一致しているか（validInput）を返す
 */
function extractValidInput(inputValue, correctArticleNumber) {
    // 正規化して部分一致・順序一致で抽出
    let validInput = '';
    let correctIdx = 0;
    for (let i = 0; i < inputValue.length && correctIdx < correctArticleNumber.length; i++) {
        let c = inputValue[i];
        let n = c.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/[のノ]/g, 'の');
        if (n === correctArticleNumber[correctIdx]) {
            validInput += n;
            correctIdx++;
        }
    }
    return validInput;
}

/**
 * 「の」付き条文番号の段階的表示処理
 * 例：「413の2」の場合、「413」まで入力すると「413の」が表示され、「2」の入力を待つ
 */
function getProgressiveDisplay(inputValue, correctArticleNumber) {
    // 正解条文番号が「の」を含む場合の特別処理
    if (correctArticleNumber.includes('の')) {
        const parts = correctArticleNumber.split('の');
        const mainNumber = parts[0];  // 例：「413」
        const subNumber = parts[1];   // 例：「2」
        
        // 数字のみを抽出（全角→半角変換、「の」「ノ」除去）
        let numericInput = '';
        for (let char of inputValue) {
            const normalized = char.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248));
            if (/[0-9]/.test(normalized)) {
                numericInput += normalized;
            }
        }
        
        // 段階的な表示ロジック
        if (numericInput.length <= mainNumber.length) {
            // まだメイン番号を入力中
            const validMainPart = numericInput.substring(0, mainNumber.length);
            if (mainNumber.startsWith(validMainPart)) {
                if (validMainPart === mainNumber) {
                    // メイン番号完了 → 「の」を表示
                    return { display: mainNumber + 'の', isComplete: false, isValid: true };
                } else {
                    // メイン番号入力中
                    return { display: validMainPart, isComplete: false, isValid: true };
                }
            } else {
                // 間違った入力
                return { display: validMainPart.substring(0, validMainPart.length - 1), isComplete: false, isValid: false };
            }
        } else {
            // サブ番号を入力中
            const validMainPart = mainNumber;
            const inputSubPart = numericInput.substring(mainNumber.length);
            const validSubPart = inputSubPart.substring(0, subNumber.length);
            
            if (subNumber.startsWith(validSubPart)) {
                const display = validMainPart + 'の' + validSubPart;
                const isComplete = validSubPart === subNumber;
                return { display: display, isComplete: isComplete, isValid: true };
            } else {
                // サブ番号が間違っている
                const previousValidSub = validSubPart.substring(0, validSubPart.length - 1);
                const display = validMainPart + 'の' + previousValidSub;
                return { display: display, isComplete: false, isValid: false };
            }
        }
    } else {
        // 従来の処理（「の」が付かない条文番号）
        const validInput = extractValidInput(inputValue, correctArticleNumber);
        return { 
            display: validInput, 
            isComplete: validInput === correctArticleNumber, 
            isValid: true 
        };
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
/**
 * 項番号入力を隠すための処理（記事番号のみの仕様変更に伴い削除）
 * function showParagraphSection() {
 *     const paragraphSection = document.getElementById('paragraph-section');
 *     if (paragraphSection) {
 *         paragraphSection.style.display = 'flex';
 *     }
 * }
 */

/**
 * 答えが完成した時の処理
 */
function completeAnswer() {
    gameState.isProcessingAnswer = true;
    gameState.correctAnswers++;
    const timeBonus = Math.max(0, gameState.timeLeft * 10);
    const baseScore = 100;
    const earnedScore = baseScore + timeBonus;

    // 正答率記録
    const currentArticle = gameState.articles[gameState.currentIndex];
    if (currentArticle) {
        recordArticleAnswer(
            currentArticle.lawName || 'その他',
            currentArticle.articleNumber,
            currentArticle.paragraph || 1,
            true,  // 正解
            earnedScore  // 獲得点数
        );

        // ローカルファイルに結果を記録
        recordQuizResult(currentArticle, earnedScore, true);

        // サーバーに条文を追加
        postArticleToLawList(currentArticle);
    }
// サーバーAPIに条文を追加
async function postArticleToLawList(article) {
    if (!article || !article.lawName || !article.articleNumber) return;
    try {
        const res = await fetch(`/api/law-articles/${encodeURIComponent(article.lawName)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                articleNumber: article.articleNumber,
                paragraph: article.paragraph || '1',
                sourceCase: article.sourceCase || article.sourceCaseId || '',
                // 他に必要なフィールドがあれば追加
            })
        });
        if (!res.ok) {
            console.warn('⚠️ サーバーへの条文追加に失敗:', article.lawName, article.articleNumber, res.status);
        }
    } catch (e) {
        console.warn('⚠️ サーバーへの条文追加リクエスト失敗:', e);
    }
}
    
    // スコア更新
    gameState.score += earnedScore;
    
    showCorrectFeedback();
    showCorrectCircleAnimation(); // ○付けアニメーションを表示
    stopTimer();
    setTimeout(() => {
        gameState.isProcessingAnswer = false;
        nextQuestion();
    }, 1200); // アニメーションの長さと同じ時間に調整
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
 * タイポ検知と処理を行う関数
 */
function detectAndHandleTypo(inputValue, correctAnswer) {
    if (!inputValue || !correctAnswer) {
        return { hasTypo: false, correctedValue: inputValue };
    }

    // 全角数字を半角に変換
    const normalizedInput = inputValue.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248));
    const normalizedCorrect = correctAnswer.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248));

    // 数字のみを抽出
    const numericInput = normalizedInput.replace(/[^0-9]/g, '');
    const numericCorrect = normalizedCorrect.replace(/[^0-9]/g, '');

    console.log(`🔍 タイポチェック: 入力="${numericInput}", 正解="${numericCorrect}"`);

    // タイポチェック
    let hasTypo = false;
    let correctedValue = '';

    // 最もシンプルなロジック：入力に正解が含まれていればOK
    if (numericCorrect.startsWith(numericInput)) {
        // 正解が入力の接頭辞である場合（例: 入力="1", 正解="10"）
        correctedValue = numericInput;
        hasTypo = false;
        console.log(`✅ 正解の接頭辞なのでタイポなし`);
    } else if (numericInput.startsWith(numericCorrect)) {
        // 入力が正解の接頭辞である場合（例: 入力="10", 正解="1"）
        correctedValue = numericCorrect;
        hasTypo = false;
        console.log(`✅ 入力が正解の接頭辞なのでタイポなし`);
    } else {
        // どちらも接頭辞でない場合のみタイポ
        hasTypo = true;
        console.log(`❌ タイポ検知：接頭辞関係なし`);
        // 正解と一致する部分までを有効とする
        for (let i = 0; i < Math.min(numericInput.length, numericCorrect.length); i++) {
            if (numericInput[i] === numericCorrect[i]) {
                correctedValue += numericInput[i];
            } else {
                break;
            }
        }
    }

    console.log(`📊 タイポチェック結果: hasTypo=${hasTypo}, correctedValue="${correctedValue}"`);

    return {
        hasTypo: hasTypo,
        correctedValue: correctedValue,
        originalValue: inputValue
    };
}

/**
 * タイポペナルティを適用する関数
 */
function applyTypoPenalty() {
    // 時間減点
    if (typeof gameState.timeLeft === 'number' && gameState.timeLeft > 0) {
        gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);

        // UI更新
        const timeRemainingElement = document.getElementById('time-remaining');
        if (timeRemainingElement) {
            timeRemainingElement.textContent = gameState.timeLeft;
        }

        // タイマーバー更新
        updateTimerBar();

        // 視覚効果表示
        showTypoPenaltyEffect();
    }
}

/**
 * クイズ結果をサーバーに保存
 */
async function recordQuizResult(article, score, isCorrect) {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
        
        // 簡略化されたデータ構造
        const result = {
            articleNumber: `${article.lawName}${article.articleNumber}条${article.paragraph && article.paragraph > 1 ? `第${article.paragraph}項` : ''}`,
            score: score,
            isCorrect: isCorrect
        };

        // サーバーAPIに保存
        const response = await fetch('/api/quiz-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: today,
                result: result
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`📝 クイズ結果を保存: ${isCorrect ? '正解' : '不正解'} - ${result.articleNumber} (${score}点)`);

    } catch (error) {
        console.error('クイズ結果の保存に失敗:', error);
        // フォールバックとしてlocalStorageに保存
        try {
            const today = new Date().toISOString().split('T')[0];
            const resultKey = `quiz_results_${today}`;
            let existingResults = localStorage.getItem(resultKey);
            let results = existingResults ? JSON.parse(existingResults) : [];

            const result = {
                articleNumber: `${article.lawName}${article.articleNumber}条${article.paragraph && article.paragraph > 1 ? `第${article.paragraph}項` : ''}`,
                score: score,
                isCorrect: isCorrect
            };

            results.push(result);
            localStorage.setItem(resultKey, JSON.stringify(results));
            console.log('📝 フォールバック: localStorageに保存しました');
        } catch (fallbackError) {
            console.error('フォールバック保存も失敗:', fallbackError);
        }
    }
}

/**
 * タイポペナルティの視覚効果を表示
 */
function showTypoPenaltyEffect() {
    const progressBar = document.getElementById('time-progress');
    const timeRemaining = document.getElementById('time-remaining');

    if (!progressBar || !timeRemaining) {
        console.warn('タイポペナルティ表示要素が見つかりません');
        return;
    }

    // 既存のアニメーションをクリア
    progressBar.style.animation = '';
    timeRemaining.style.animation = '';

    // ペナルティポップアップ作成
    const penaltyPopup = document.createElement('div');
    penaltyPopup.id = 'typo-penalty-popup';
    penaltyPopup.textContent = '-1秒';
    penaltyPopup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 20px;
        z-index: 10000;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.2);
        animation: typoPenaltyPopup 1.2s ease-out forwards;
    `;

    // CSSアニメーション追加
    if (!document.getElementById('typo-penalty-styles')) {
        const style = document.createElement('style');
        style.id = 'typo-penalty-styles';
        style.textContent = `
            @keyframes typoPenaltyPopup {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.3) rotate(-10deg);
                }
                20% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
                }
                40% {
                    transform: translate(-50%, -50%) scale(1) rotate(0deg);
                }
                80% {
                    opacity: 1;
                    transform: translate(-50%, -45%) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -40%) scale(0.9);
                }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                20%, 40%, 60%, 80% { transform: translateX(2px); }
            }

            @keyframes pulseRed {
                0%, 100% { background-color: #ef4444; }
                50% { background-color: #dc2626; }
            }
        `;
        document.head.appendChild(style);
    }

    // 既存のポップアップを削除
    const existingPopup = document.getElementById('typo-penalty-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    document.body.appendChild(penaltyPopup);

    // プログレスバー効果
    progressBar.style.animation = 'pulseRed 0.5s ease-in-out 3';
    progressBar.style.backgroundColor = '#ef4444';

    // 時間表示効果
    timeRemaining.style.animation = 'shake 0.5s ease-in-out';
    timeRemaining.style.color = '#ef4444';
    timeRemaining.style.fontWeight = 'bold';

    // 効果終了後のクリーンアップ
    setTimeout(() => {
        if (penaltyPopup.parentNode) {
            penaltyPopup.parentNode.removeChild(penaltyPopup);
        }

        // スタイルをリセット
        progressBar.style.animation = '';
        progressBar.style.backgroundColor = '';
        timeRemaining.style.animation = '';
        timeRemaining.style.color = '';
        timeRemaining.style.fontWeight = '';

        // タイマーバーを通常状態に戻す
        updateTimerBar();
    }, 1200);
}

/**
 * エラー回復用：基本的な条文データを作成
 */
function createBasicArticleData(articleStr, supportedLaws = []) {
    try {
        // 簡単なパターンマッチングで最低限のデータを抽出
        const simplePattern = /^(.+?)(\d+(?:の\d+)?条)(?:第?(\d+)項)?(?:第?(\d+)号)?/;
        const match = articleStr.match(simplePattern);
        
        if (!match) {
            return null;
        }
        
        const [fullMatch, lawName, articleWithJou, paragraph, item] = match;
        
        // SUPPORTED_LAWSでの検証（supportedLawsが空の場合は通す）
        if (supportedLaws.length > 0 && !isValidLawNameWithList(lawName.trim(), supportedLaws)) {
            console.warn(`🚫 基本データ作成時: 無効な法令名 "${lawName}"`);
            return null;
        }
        
        const articleNumberStr = articleWithJou.replace(/条$/, '');
        const paragraphNum = paragraph ? parseInt(paragraph) : null;
        const itemNum = item ? parseInt(item) : null;
        
        return {
            lawName: lawName.trim(),
            fullText: articleStr,
            articleNumber: articleNumberStr,
            paragraph: paragraphNum,
            item: itemNum,
            displayText: `${lawName.trim()}${articleWithJou}${paragraph ? `第${paragraph}項` : ''}${item ? `第${item}号` : ''}`,
            content: `${articleStr}の条文内容（詳細は条文表示で確認してください）`,
            isBasicData: true // 基本データであることを示すフラグ
        };
    } catch (error) {
        console.error(`基本データ作成エラー: ${error.message}`);
        return null;
    }
}

/**
 * ゲーム中に条文本文をオンデマンドで取得する関数
 */
export async function fetchArticleContentOnDemand(articleData) {
    try {
        console.log(`🔄 条文本文をオンデマンド取得中: ${articleData.displayText}`);
        
        const content = await fetchArticleContentForQuiz(
            articleData.lawName, 
            articleData.articleNumber, 
            articleData.paragraph, 
            articleData.item
        );
        
        console.log(`✅ 条文本文取得成功: ${articleData.displayText}`);
        return content;
        
    } catch (error) {
        console.warn(`⚠️ 条文本文取得失敗、フォールバック使用: ${articleData.displayText} - ${error.message}`);
        
        // フォールバック内容を使用
        return await generateArticleContentForQuiz(
            articleData.lawName, 
            articleData.articleNumber, 
            articleData.paragraph, 
            articleData.item
        );
    }
}

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

export function disposeSpeedQuizInstance(options = {}) {
    stopTimer();
    cleanupSpeedQuizEventListeners();
    if (options.resetState) {
        gameState = createInitialGameState();
    }
}
