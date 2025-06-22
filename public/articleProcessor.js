// articleProcessor.js - 条文自動検出・ボタン化処理モジュール（憲法対応強化版）

import { showArticlePanelWithPreset } from './articlePanel.js';

// ★★★ 法令名マッピング（憲法対応強化） ★★★
const LAW_NAME_MAPPING = {
    '憲法': '日本国憲法',
    '日本国憲法': '日本国憲法'
};

// ★★★ 条文自動検出とボタン化（憲法対応強化版） ★★★
export function processArticleReferences(htmlContent, supportedLaws = []) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        console.warn('⚠️ processArticleReferences: 無効な入力', htmlContent);
        return htmlContent;
    }
    
    console.log('🔍 条文検出開始:', htmlContent.substring(0, 100) + '...');
    
    // ★★★ {{}}内の【】を一時的に保護 ★★★
    const protectedContent = htmlContent.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
        // {{}}内の【】を一時的に特殊文字に置換
        const protectedInnerContent = content.replace(/【([^】]+)】/g, '〖$1〗');
        return `{{${protectedInnerContent}}}`;
    });
    
    // ★★★ 憲法を含む法令リスト（強化版） ★★★
    const lawsToUse = supportedLaws.length > 0 ? [...supportedLaws, '憲法', '日本国憲法'] : [
        '憲法', '日本国憲法', '民法', '会社法', '刑法', '商法', '民事訴訟法', '刑事訴訟法', 
        '行政法', '労働基準法', '独占禁止法', '麻薬及び向精神薬取締法'
    ];
    
    // 重複を除去
    const uniqueLaws = [...new Set(lawsToUse)];
    
    console.log('📋 使用する法令名:', uniqueLaws);
    
    // ★★★ 【法令名条文番号】形式を検出する正規表現（憲法対応強化版） ★★★
    // 例: 【憲法21条】、【民事訴訟法197条1項2号】、【刑法199条第1項】
    const lawPattern = uniqueLaws.map(law => law.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const articlePattern = new RegExp(`【(${lawPattern})([^】]+)】`, 'g');
    
    console.log('🔍 正規表現パターン:', articlePattern);
    console.log('🔍 法令パターン文字列:', lawPattern);
    
    let matchCount = 0;
    const processedContent = protectedContent.replace(articlePattern, (match, lawName, articleRef) => {
        matchCount++;
        console.log(`✅ 条文検出 ${matchCount}: ${match} → 法令名: "${lawName}", 条文: "${articleRef}"`);
        
        // ★★★ 憲法の自動変換 ★★★
        const actualLawName = LAW_NAME_MAPPING[lawName] || lawName;
        const displayLawName = lawName; // 表示は元の名前のまま
        
        console.log(`🔄 法令名変換: "${lawName}" → "${actualLawName}"`);
        
        // 条文参照をボタンに変換
        const buttonId = `article-ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const buttonHtml = `<button 
            id="${buttonId}" 
            class="article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-semibold border border-blue-300 transition-colors cursor-pointer mx-1" 
            data-law-name="${actualLawName}" 
            data-article-ref="${articleRef}"
            data-display-name="${displayLawName}"
            title="クリックして条文を表示"
        >${displayLawName}${articleRef}</button>`;
        
        console.log(`🔧 ボタン生成: ${buttonId} (${actualLawName} → ${displayLawName})`);
        return buttonHtml;
    });
    
    // ★★★ 保護していた{{}}内の【】を元に戻す ★★★
    const finalResult = processedContent.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
        const restoredInnerContent = content.replace(/〖([^〗]+)〗/g, '【$1】');
        return `{{${restoredInnerContent}}}`;
    });
    
    console.log(`📊 条文検出結果: ${matchCount}件の条文をボタン化`);
    
    if (matchCount === 0) {
        console.warn('⚠️ 条文が検出されませんでした。入力内容を確認してください。');
        console.log('🔍 検索対象テキスト:', htmlContent);
        
        // ★★★ デバッグ用：手動テスト ★★★
        const testMatches = htmlContent.match(/【[^】]+】/g);
        if (testMatches) {
            console.log('🔍 発見された【】パターン:', testMatches);
        }
    }
    
    return finalResult;
}

// ★★★ Q&A参照自動検出とボタン化（新機能） ★★★
export function processQAReferences(htmlContent, questionsAndAnswers = []) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        console.warn('⚠️ processQAReferences: 無効な入力', htmlContent);
        return htmlContent;
    }
    
    if (!questionsAndAnswers || questionsAndAnswers.length === 0) {
        console.warn('⚠️ processQAReferences: Q&Aデータが無効または空です');
        return htmlContent;
    }
    
    console.log('🔍 Q&A参照検出開始:', htmlContent.substring(0, 100) + '...');
    
    // ★★★ 【id:番号】形式を検出する正規表現 ★★★
    // 例: 【id:1】、【id:3】、【id:10】
    const qaPattern = /【id:(\d+)】/g;
    
    let matchCount = 0;
    const result = htmlContent.replace(qaPattern, (match, idString) => {
        matchCount++;
        const qaId = parseInt(idString, 10);
        console.log(`✅ Q&A参照検出 ${matchCount}: ${match} → ID: ${qaId}`);
        
        // Q&Aデータから該当するものを検索
        const qaData = questionsAndAnswers.find(qa => qa.id === qaId);
        if (!qaData) {
            console.warn(`⚠️ ID ${qaId} のQ&Aが見つかりません`);
            return match; // 変換せずそのまま返す
        }
        
        const qaIndex = questionsAndAnswers.indexOf(qaData);
        
        // Q&A参照をボタンに変換
        const buttonId = `qa-ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const buttonHtml = `<button 
            id="${buttonId}" 
            class="qa-ref-btn inline-block bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-bold border border-yellow-300 transition-colors cursor-pointer mx-1" 
            data-qa-index="${qaIndex}" 
            data-q-number="${qaId}"
            data-quiz-index="global"
            data-sub-index="0"
            title="Q${qaId}: ${qaData.question.substring(0, 50)}..."
        >Q${qaId}</button>`;
        
        console.log(`🔧 Q&Aボタン生成: ${buttonId} (ID: ${qaId})`);
        return buttonHtml;
    });
    
    console.log(`📊 Q&A参照検出結果: ${matchCount}件の参照をボタン化`);
    
    if (matchCount === 0) {
        console.log('ℹ️ Q&A参照が検出されませんでした');
    }
    
    return result;
}

// ★★★ **囲み文字処理関数 ★★★
export function processBoldText(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        return htmlContent;
    }
    
    // **text**パターンを<strong>text</strong>に変換
    return htmlContent.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-red-600">$1</strong>');
}

// ★★★ 条文参照、Q&A参照、**囲み文字の統合処理関数 ★★★
export function processAllReferences(htmlContent, supportedLaws = [], questionsAndAnswers = []) {
    // まず**囲み文字を処理
    let processedContent = processBoldText(htmlContent);
    
    // 次に条文参照を処理
    processedContent = processArticleReferences(processedContent, supportedLaws);
    
    // 最後にQ&A参照を処理
    processedContent = processQAReferences(processedContent, questionsAndAnswers);
    
    return processedContent;
}

// ★★★ 条文参照ボタンのイベントリスナー設定（強化版） ★★★
export function setupArticleRefButtons(container) {
    if (!container) {
        console.warn('⚠️ setupArticleRefButtons: containerが無効です');
        return;
    }
    
    const articleRefButtons = container.querySelectorAll('.article-ref-btn');
    const qaRefButtons = container.querySelectorAll('.qa-ref-btn');
    
    // 条文ボタンが存在しない場合は静かに終了
    if (articleRefButtons.length === 0 && qaRefButtons.length === 0) {
        console.log(`📋 条文ボタン: 0個 (対象外コンテナ)`);
        return;
    }
    
    console.log('� 条文ボタンのイベントリスナー設定開始');
    console.log(`📋 発見された条文ボタン: ${articleRefButtons.length}個`);
    console.log(`📋 発見されたQ&Aボタン: ${qaRefButtons.length}個`);
    
    articleRefButtons.forEach((button, index) => {
        console.log(`🔧 ボタン ${index + 1} 設定中:`, button.id, button.dataset);
        
        // 既存のイベントリスナーを削除
        button.removeEventListener('click', handleArticleButtonClick);
        
        // 新しいイベントリスナーを追加
        button.addEventListener('click', handleArticleButtonClick);
        
        console.log(`✅ ボタン ${index + 1} イベントリスナー設定完了`);
    });
    
    qaRefButtons.forEach((button, index) => {
        console.log(`🔧 Q&Aボタン ${index + 1} 設定中:`, button.id, button.dataset);
        
        // 既存のイベントリスナーを削除
        button.removeEventListener('click', handleQAButtonClick);
        
        // 新しいイベントリスナーを追加
        button.addEventListener('click', handleQAButtonClick);
        
        console.log(`✅ Q&Aボタン ${index + 1} イベントリスナー設定完了`);
    });
    
    console.log('✅ 条文ボタンのイベントリスナー設定完了');
}

// ★★★ 条文ボタンクリックハンドラー ★★★
function handleArticleButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // 確実にイベント伝播を停止
    
    // ポップアップを閉じないようにフラグを設定
    window.__preventPopupClose = true;
    
    const lawName = this.dataset.lawName;
    const articleRef = this.dataset.articleRef;
      console.log(`🖱️ 条文ボタンクリック: ${lawName}${articleRef}`);
    console.log(`🔍 ボタンデータ:`, this.dataset);
    
    // データ属性が正しく設定されているかチェック
    if (!lawName || !articleRef) {
        console.error('❌ 条文ボタンのデータ属性が不完全です', {
            lawName,
            articleRef,
            allData: this.dataset
        });
        // フラグをリセット
        window.__preventPopupClose = false;
        return;
    }
    
    console.log(`🚀 showArticlePanelWithPreset呼び出し開始: ${lawName} + ${articleRef}`);
    
    // 条文表示パネルを開いて、該当する条文をセット
    try {
        showArticlePanelWithPreset(lawName, articleRef);
        console.log(`✅ showArticlePanelWithPreset呼び出し完了`);
        
        // パネルが実際に表示されているかチェック
        setTimeout(() => {
            const panel = document.getElementById('article-panel');
            if (panel && !panel.classList.contains('hidden')) {
                console.log(`✅ 条文パネルが正常に表示されました`);
            } else {
                console.error(`❌ 条文パネルの表示に問題があります`, panel);
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ showArticlePanelWithPreset呼び出しでエラー:', error);
    }
    
    // フラグをリセット（少し遅延させる）
    setTimeout(() => {
        window.__preventPopupClose = false;
    }, 200);
}

// ★★★ Q&Aボタンクリックハンドラー ★★★
function handleQAButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // ポップアップを閉じないようにフラグを設定
    window.__preventPopupClose = true;
    
    const qaIndex = parseInt(this.dataset.qaIndex, 10);
    const qNumber = this.dataset.qNumber;
    
    console.log(`🖱️ Q&Aボタンクリック: Q${qNumber} (Index: ${qaIndex})`);
    console.log(`🔍 ボタンデータ:`, this.dataset);
    
    // データ属性が正しく設定されているかチェック
    if (isNaN(qaIndex)) {
        console.error('❌ Q&Aボタンのデータ属性が不完全です', {
            qaIndex,
            qNumber,
            allData: this.dataset
        });
        window.__preventPopupClose = false;
        return;
    }
    
    // Q&Aポップアップを表示
    try {
        showQAPopup(qaIndex, qNumber);
        console.log(`✅ Q&Aポップアップ表示完了: Q${qNumber}`);
    } catch (error) {
        console.error('❌ Q&Aポップアップ表示でエラー:', error);
    }
    
    // フラグをリセット（少し遅延させる）
    setTimeout(() => {
        window.__preventPopupClose = false;
    }, 200);
}

// ★★★ Q&Aポップアップ表示関数 ★★★
function showQAPopup(qaIndex, qNumber) {
    const qaData = window.currentCaseData?.questionsAndAnswers?.[qaIndex];
    if (!qaData) {
        console.error(`❌ Q&A データが見つかりません: Index ${qaIndex}`);
        return;
    }
    
    // 既存のポップアップを削除
    const existingPopup = document.getElementById('qa-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // ポップアップ作成
    const popup = document.createElement('div');
    popup.id = 'qa-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
    
    const rankConfig = getRankConfig(qaData.rank);
    
    popup.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-bold ${rankConfig.bgColor} ${rankConfig.textColor}">
                        ${qaData.rank}ランク
                    </span>
                    <h3 class="text-lg font-bold">Q${qNumber}</h3>
                </div>
                <button id="close-qa-popup" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            <div class="p-6">
                <div class="mb-6">
                    <h4 class="text-md font-bold mb-3 text-gray-800">📋 問題</h4>
                    <p class="bg-gray-50 p-4 rounded-lg border-l-4 ${rankConfig.borderColor}">
                        ${qaData.question}
                    </p>
                </div>
                <div>
                    <h4 class="text-md font-bold mb-3 text-gray-800">💡 解答例</h4>
                    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        ${processAllReferences(qaData.answer, window.SUPPORTED_LAWS || [], window.currentCaseData?.questionsAndAnswers || [])}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // 解答内の参照ボタンにイベントリスナーを設定
    setupArticleRefButtons(popup);
    
    // 閉じるボタンのイベントリスナー
    document.getElementById('close-qa-popup').addEventListener('click', () => {
        popup.remove();
    });
    
    // 背景クリックで閉じる
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// ★★★ ランク設定取得関数 ★★★
function getRankConfig(rank) {
    const configs = {
        'S': { bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-400' },
        'A': { bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-400' },
        'B': { bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-400' },
        'C': { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-400' }    };
    return configs[rank] || configs['C'];
}

// ★★★ 強制的に条文ボタンを再処理する関数 ★★★
export function forceProcessArticleButtons() {
    console.log('🔄 条文ボタンを強制再処理中...');
    
    // 全ての条文ボタンを再処理
    const containers = document.querySelectorAll('.case-content, .article-content, .qa-content');
    containers.forEach(container => {
        setupArticleRefButtons(container);
    });
    
    console.log('✅ 条文ボタンの強制再処理が完了しました');
}

// ★★★ テスト用の条文検出関数 ★★★
export function testArticleDetection() {
    console.log('🧪 条文検出テストを実行中...');
    
    const testCases = [
        '民法110条',
        '会社法828条2項1号',
        '憲法14条',
        '【id:1】',
        '**重要なポイント**'
    ];
    
    testCases.forEach(testCase => {
        console.log(`テスト: ${testCase}`);
        const processed = processAllReferences(testCase, ['民法', '会社法', '憲法'], []);
        console.log(`結果: ${processed}`);
    });
    
    console.log('✅ 条文検出テストが完了しました');
}
