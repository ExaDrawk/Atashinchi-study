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
    
    // ★★★ 条文参照ボタンの設定 ★★★
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
      // ★★★ Q&A参照ボタンの設定 ★★★
    const qaRefButtons = container.querySelectorAll('.qa-ref-btn');
    console.log(`📋 発見されたQ&Aボタン: ${qaRefButtons.length}個`);
    
    qaRefButtons.forEach((button, index) => {
        console.log(`🔧 Q&Aボタン ${index + 1} 設定中:`, button.id, button.dataset);
        console.log(`🔧 Q&Aボタン ${index + 1} の要素:`, button);
        console.log(`🔧 Q&Aボタン ${index + 1} のクラス:`, button.className);
        
        // 既存のイベントリスナーを削除
        button.removeEventListener('click', handleQAButtonClick);
        
        // 新しいイベントリスナーを追加
        button.addEventListener('click', handleQAButtonClick);
        
        console.log(`✅ Q&Aボタン ${index + 1} イベントリスナー設定完了`);
    });
    
    console.log('✅ 条文ボタンとQ&Aボタンのイベントリスナー設定完了');
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

// ★★★ Q&Aボタンクリックハンドラー ★★★
function handleQAButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥 Q&Aボタンがクリックされました！', e.target);
    console.log('🔥 ボタンの全データ:', e.target.dataset);
    console.log('🔥 ボタンのクラス:', e.target.className);
    
    const qaIndex = parseInt(this.dataset.qaIndex);
    const qNumber = this.dataset.qNumber;
    const quizIndex = this.dataset.quizIndex || 'global';
    const subIndex = this.dataset.subIndex || '0';
    
    console.log(`🖱️ Q&Aボタンクリック: Q${qNumber} (Index: ${qaIndex})`);
    console.log(`🔍 ボタンデータ:`, this.dataset);
    
    // データ属性が正しく設定されているかチェック
    if (isNaN(qaIndex) || !qNumber) {
        console.error('❌ Q&Aボタンのデータ属性が不完全です', {
            qaIndex,
            qNumber,
            allData: this.dataset
        });
        return;
    }
    
    // ★★★ 重複クリック防止 ★★★
    if (this.dataset.clicking === 'true') {
        console.log('⚠️ 重複クリックを防止しました');
        return;
    }
    this.dataset.clicking = 'true';
    
    // Q&Aポップアップを表示
    try {
        showQAPopup(qaIndex, qNumber, quizIndex, subIndex);
    } finally {
        // 処理完了後にクリック防止フラグを解除
        setTimeout(() => {
            this.dataset.clicking = 'false';
        }, 300);
    }
}

// ★★★ Q&Aポップアップ表示関数 ★★★
function showQAPopup(qaIndex, qNumber, quizIndex, subIndex) {
    console.log(`🔥 showQAPopup開始: qaIndex=${qaIndex}, qNumber=${qNumber}`);
    
    if (!window.currentCaseData || !window.currentCaseData.questionsAndAnswers) {
        console.error('❌ Q&Aデータが利用できません');
        console.error('currentCaseData:', window.currentCaseData);
        return;
    }
    
    console.log(`🔥 Q&Aデータ配列長: ${window.currentCaseData.questionsAndAnswers.length}`);
    
    const qa = window.currentCaseData.questionsAndAnswers[qaIndex];
    if (!qa) {
        console.error(`❌ インデックス ${qaIndex} のQ&Aが見つかりません`);
        console.error('利用可能なQ&A:', window.currentCaseData.questionsAndAnswers);
        return;
    }
    
    console.log(`🔥 Q&Aデータ取得成功:`, qa);
    
    const popupId = `qa-popup-${quizIndex}-${subIndex}-${qNumber}`;
    console.log(`🔥 ポップアップID: ${popupId}`);
    
    // ★★★ 既存の同じポップアップがあれば削除（トグル動作） ★★★
    const existing = document.getElementById(popupId);
    if (existing) {
        console.log(`🔥 既存ポップアップを削除（トグル）: ${popupId}`);
        existing.remove();
        window.qaPopupState.removePopup(popupId);
        return; // トグル動作で終了
    }
    
    // ★★★ 他の全てのQ&Aポップアップを閉じる ★★★
    console.log(`🔥 既存の全Q&Aポップアップを閉じます`);
    closeAllQAPopups();
    
    // ポップアップHTMLを生成
    console.log(`🔥 ポップアップHTML生成開始`);
    const popupHtml = createQAPopupHTML(popupId, qa, qNumber, qaIndex);
    console.log(`🔥 生成されたHTML (最初の200文字):`, popupHtml.substring(0, 200));
    
    // グローバルポップアップコンテナに追加
    const globalContainer = document.getElementById('qa-ref-popup-global-container');
    if (globalContainer) {
        console.log(`🔥 グローバルコンテナに追加中`);
        globalContainer.insertAdjacentHTML('beforeend', popupHtml);
    } else {
        console.log(`🔥 グローバルコンテナが見つからないため、bodyに追加`);
        document.body.insertAdjacentHTML('beforeend', popupHtml);
    }
    
    // ポップアップの状態を保存
    window.qaPopupState.savePopup(popupId, qaIndex, qNumber, quizIndex, subIndex);
    
    // ポップアップ内のイベントリスナーを設定
    setupQAPopupEvents(popupId);
    
    console.log(`✅ Q&Aポップアップ表示完了: ${popupId}`);
}

// ★★★ Q&AポップアップHTML生成 ★★★
function createQAPopupHTML(popupId, qa, qNumber, qaIndex) {
    // 条文参照ボタン化処理
    let qaQuestion = qa.question.replace(/(【[^】]+】)/g, match => {
        const lawText = match.replace(/[【】]/g, '');
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-text='${lawText}'>${lawText}</button>`;
    });
    
    // 先にanswerの{{}}の外の【】を条文参照ボタン化してから、空欄化処理を行う
    let qaAnswerWithArticleRefs = processArticleReferences(qa.answer);
    let qaAnswer = processBlankFillText(qaAnswerWithArticleRefs, `qa-popup-${qaIndex}`);

    return `
        <div id="${popupId}" class="qa-ref-popup fixed z-40 bg-white border border-yellow-400 rounded-lg shadow-lg p-4 max-w-md" style="top: 50%; right: 2.5rem; transform: translateY(-50%);">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-yellow-900">Q${qNumber} 参照</span>
                <button type="button" class="qa-ref-close-btn text-gray-400 hover:text-gray-700 ml-2" style="font-size:1.2em;">×</button>
            </div>
            <div class="mb-2"><span class="font-bold">問題：</span>${qaQuestion}</div>
            <div class="mb-2">
                <button type="button" class="toggle-qa-answer-btn bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1 px-3 rounded border border-green-300 text-sm mb-2">💡 解答を隠す</button>
                <div class="qa-answer-content bg-green-50 p-3 rounded-lg border border-green-200">
                    <div class="flex gap-2 mb-2">
                        <button type="button" class="show-all-blanks-btn bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-2 rounded border border-blue-300 text-xs">🔍 全て表示</button>
                        <button type="button" class="hide-all-blanks-btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded border border-gray-300 text-xs">👁️ 全て隠す</button>
                    </div>
                    <div><span class="font-bold text-green-800">解答：</span>${qaAnswer}</div>
                </div>
            </div>
        </div>
    `;
}

// ★★★ Q&Aポップアップ内のイベントリスナー設定 ★★★
function setupQAPopupEvents(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;
      // 閉じるボタン
    const closeBtn = popup.querySelector('.qa-ref-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            console.log(`🗑️ 閉じるボタンクリック: ${popupId}`);
            popup.remove();
            window.qaPopupState.removePopup(popupId);
        });
    }
    
    // 解答表示ボタン
    const answerToggleBtn = popup.querySelector('.toggle-qa-answer-btn');
    const answerContent = popup.querySelector('.qa-answer-content');
    if (answerToggleBtn && answerContent) {
        // デフォルトで解答が表示されているので、条文参照ボタンを有効にする
        setupArticleRefButtons(answerContent);
        
        answerToggleBtn.addEventListener('click', function() {
            const isHidden = answerContent.classList.toggle('hidden');
            this.textContent = isHidden ? '💡 解答を表示' : '💡 解答を隠す';
            
            // 解答内の条文参照ボタンも有効にする
            if (!isHidden) {
                setupArticleRefButtons(answerContent);
            }
        });
    }
    
    // 空欄一括操作ボタン
    const showAllBlanksBtn = popup.querySelector('.show-all-blanks-btn');
    const hideAllBlanksBtn = popup.querySelector('.hide-all-blanks-btn');
    
    if (showAllBlanksBtn && answerContent) {
        showAllBlanksBtn.addEventListener('click', function() {
            toggleAllBlanks(answerContent, true);
        });
    }
    
    if (hideAllBlanksBtn && answerContent) {
        hideAllBlanksBtn.addEventListener('click', function() {
            toggleAllBlanks(answerContent, false);
        });
    }
}

// ★★★ 空欄一括操作関数（casePage.jsから移動） ★★★
function toggleAllBlanks(container, reveal) {
    const blanks = container.querySelectorAll('.blank-text');
    blanks.forEach(blank => {
        const currentRevealed = blank.dataset.revealed === 'true';
        if (reveal && !currentRevealed) {
            window.toggleBlankReveal(blank);
        } else if (!reveal && currentRevealed) {
            window.toggleBlankReveal(blank);
        }
    });
}

// ★★★ 空欄化処理関数（casePage.jsから移動） ★★★
export function processBlankFillText(text, uniqueId = '') {
    if (!text) return text;
    
    // {{}}で囲まれた部分を検出する正規表現
    const blankPattern = /\{\{([^}]+)\}\}/g;
    let blankCounter = 0;
    let processedText = text;
    
    // まず、{{}}の外側にある【】を条文参照ボタン化
    let outsideBlankText = text;
    let blankMatches = [];
    let match;
    
    // {{}}の内容を一時的にプレースホルダーに置換
    while ((match = blankPattern.exec(text)) !== null) {
        blankMatches.push(match[1]);
        const placeholder = `__BLANK_${blankMatches.length - 1}__`;
        outsideBlankText = outsideBlankText.replace(match[0], placeholder);
    }
    
    // {{}}の外側の【】を条文参照ボタン化
    outsideBlankText = outsideBlankText.replace(/【([^】]+)】/g, (match, lawText) => {
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-text='${lawText}' onclick='event.stopPropagation(); showArticlePanel("${lawText}")'>${lawText}</button>`;
    });
    
    // プレースホルダーを空欄に戻す
    for (let i = 0; i < blankMatches.length; i++) {
        blankCounter++;
        const content = blankMatches[i];
        const blankId = `blank-${uniqueId}-${blankCounter}`;
        
        // {{}}内に【】が含まれているかチェック
        const hasArticleRef = /【([^】]+)】/.test(content);
        let displayContent, dataAnswer;
        
        if (hasArticleRef) {
            // 条文参照がある場合：ボタン化して色を変える
            displayContent = content.replace(/【([^】]+)】/g, (match, lawText) => {
                return `<button type='button' class='article-ref-btn bg-blue-200 hover:bg-blue-300 text-blue-900 px-2 py-1 rounded border border-blue-400 text-xs font-bold' data-law-text='${lawText}' onclick='event.stopPropagation(); showArticlePanel("${lawText}")'>${lawText}</button>`;
            });
            dataAnswer = content.replace(/【([^】]+)】/g, '$1'); // data-answerはプレーンテキスト
        } else {
            // 通常の空欄
            displayContent = content;
            dataAnswer = content;
        }
        
        const blankLength = Math.max(4, Math.floor(dataAnswer.length * 0.9));
        const underscores = '＿'.repeat(blankLength);
        
        // 条文参照がある場合は背景色を変える
        const bgClass = hasArticleRef ? 'bg-blue-100 hover:bg-blue-200 border-blue-400 text-blue-800' : 'bg-yellow-100 hover:bg-yellow-200 border-yellow-400 text-yellow-800';
        
        const blankHtml = `<span class="blank-container inline-block">
            <span id="${blankId}" class="blank-text cursor-pointer ${bgClass} px-2 py-1 rounded border-b-2 font-bold transition-all duration-200" 
                  data-answer="${dataAnswer.replace(/"/g, '&quot;')}" data-display-content="${displayContent.replace(/"/g, '&quot;')}" data-blank-id="${blankId}" onclick="toggleBlankReveal(this)" title="クリックして答えを表示">
                ${underscores}
            </span>
        </span>`;
        
        outsideBlankText = outsideBlankText.replace(`__BLANK_${i}__`, blankHtml);
    }
    
    return outsideBlankText;
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

// ★★★ 全てのQ&Aポップアップを閉じる関数 ★★★
function closeAllQAPopups() {
    console.log(`🧹 全Q&Aポップアップを閉じる処理開始`);
    
    // DOMから全てのQ&Aポップアップを削除
    const allQAPopups = document.querySelectorAll('.qa-ref-popup');
    allQAPopups.forEach(popup => {
        console.log(`🗑️ ポップアップを削除: ${popup.id}`);
        popup.remove();
    });
    
    // 状態管理をクリア
    if (window.qaPopupState) {
        console.log(`🧹 ポップアップ状態をクリア (${window.qaPopupState.openPopups.length}個)`);
        window.qaPopupState.clearAll();
    }
    
    console.log(`✅ 全Q&Aポップアップ閉じる処理完了`);
}
