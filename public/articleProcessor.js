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
    
    console.log('🔧 条文ボタンのイベントリスナー設定開始');
    
    const articleRefButtons = container.querySelectorAll('.article-ref-btn');
    console.log(`📋 発見された条文ボタン: ${articleRefButtons.length}個`);
    
    if (articleRefButtons.length === 0) {
        console.warn('⚠️ 条文ボタンが見つかりません。HTMLを確認してください。');
        console.log('🔍 コンテナHTML:', container.innerHTML.substring(0, 500) + '...');
    }
    
    articleRefButtons.forEach((button, index) => {
        console.log(`🔧 ボタン ${index + 1} 設定中:`, button.id, button.dataset);
        
        // 既存のイベントリスナーを削除
        button.removeEventListener('click', handleArticleButtonClick);
        
        // 新しいイベントリスナーを追加
        button.addEventListener('click', handleArticleButtonClick);
        
        console.log(`✅ ボタン ${index + 1} イベントリスナー設定完了`);
    });
    
    console.log('✅ 条文ボタンのイベントリスナー設定完了');
}

// ★★★ 条文ボタンクリックハンドラー ★★★
function handleArticleButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
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
        return;
    }
    
    // 条文表示パネルを開いて、該当する条文をセット
    showArticlePanelWithPreset(lawName, articleRef);
}

// ★★★ デバッグ用：条文検出テスト関数（強化版） ★★★
export function testArticleDetection() {
    console.log('🧪 条文検出テスト開始');
    
    const testTexts = [
        '【憲法21条】の精神に照らし',
        '【日本国憲法21条】の表現の自由',
        '【民事訴訟法197条1項2号】の職業の秘密',
        '【刑法199条】の殺人罪',
        '【麻薬及び向精神薬取締法】違反'
    ];
    
    testTexts.forEach((text, index) => {
        console.log(`\nテスト ${index + 1}: "${text}"`);
        const result = processArticleReferences(text);
        console.log(`結果: "${result}"`);
        
        // ボタンが生成されたかチェック
        const hasButton = result.includes('article-ref-btn');
        console.log(`ボタン生成: ${hasButton ? '✅' : '❌'}`);
    });
    
    console.log('🧪 条文検出テスト完了');
}

// ★★★ 強制的に条文ボタンを再処理する関数 ★★★
export function forceProcessArticleButtons() {
    console.log('🔄 条文ボタン強制再処理開始');
    
    // 全てのタブコンテンツを取得
    const tabContents = document.querySelectorAll('.tab-content-panel');
    
    tabContents.forEach((tab, index) => {
        console.log(`🔄 タブ ${index + 1} 処理中`);
        
        // 既存のボタンを削除
        const existingButtons = tab.querySelectorAll('.article-ref-btn');
        existingButtons.forEach(btn => {
            const parent = btn.parentNode;
            parent.replaceChild(document.createTextNode(btn.textContent), btn);
        });
        
        // HTMLを再処理
        const originalHTML = tab.innerHTML;
        const processedHTML = processArticleReferences(originalHTML);
        
        if (originalHTML !== processedHTML) {
            tab.innerHTML = processedHTML;
            setupArticleRefButtons(tab);
            console.log(`✅ タブ ${index + 1} 再処理完了`);
        }
    });
    
    console.log('✅ 条文ボタン強制再処理完了');
}

// ★★★ **で囲まれた文字を装飾する関数 ★★★
export function processBoldText(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        console.warn('⚠️ processBoldText: 無効な入力', htmlContent);
        return htmlContent;
    }
    
    console.log('🎨 **囲み文字の装飾処理開始');
    
    // **で囲まれた文字を検出する正規表現
    // 例: **特別損害**, **履行利益**, **信頼利益**
    const boldPattern = /\*\*([^*]+)\*\*/g;
    
    let matchCount = 0;
    const result = htmlContent.replace(boldPattern, (match, content) => {
        matchCount++;
        console.log(`✅ **囲み文字検出 ${matchCount}: "${content}"`);
        
        // 装飾されたspanタグに変換
        const decoratedHtml = `<span class="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-md text-sm font-bold shadow-sm border border-yellow-300">${content}</span>`;
        
        console.log(`🎨 装飾変換: "${content}" → decoratedスパン`);
        return decoratedHtml;
    });
    
    console.log(`📊 **囲み文字装飾結果: ${matchCount}件を装飾`);
    
    return result;
}
