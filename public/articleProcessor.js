// articleProcessor.js - 条文自動検出・ボタン化処理モジュール（憲法対応強化版）

import { showArticlePanelWithPreset } from './articlePanel.js';
import { createQAPopupHTML, setupQAPopupEvents } from './qaPopup.js';

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
    
    // ★★★ 全角数字を半角数字に変換 ★★★
    const normalizedContent = convertFullWidthToHalfWidth(htmlContent);
    if (normalizedContent !== htmlContent) {
        console.log('🔄 全角数字を半角数字に変換しました');
        console.log('変換前:', htmlContent.substring(0, 100) + '...');
        console.log('変換後:', normalizedContent.substring(0, 100) + '...');
    }
    
    // ★★★ {{}}内の【】を一時的に保護 ★★★
    const protectedContent = normalizedContent.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
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
        
        // ★★★ ただし書き対応：条文参照から「ただし書」部分を分離 ★★★
        let baseArticleRef = articleRef;
        let tadashiPart = '';
        let hasProviso = false;
        
        // 「ただし書」「ただし書き」を検出
        const tadashiMatch = articleRef.match(/^(.+?)(ただし書き?.*?)$/);
        if (tadashiMatch) {
            baseArticleRef = tadashiMatch[1]; // 「714条1項」
            tadashiPart = tadashiMatch[2];    // 「ただし書」
            hasProviso = true;
            console.log(`📝 ただし書き検出: ベース="${baseArticleRef}", ただし部分="${tadashiPart}"`);
        }
        
        // 条文参照をボタンに変換
        const buttonId = `article-ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const buttonHtml = `<button 
            id="${buttonId}" 
            class="article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-semibold border border-blue-300 transition-colors cursor-pointer mx-1" 
            data-law-name="${actualLawName}" 
            data-article-ref="${baseArticleRef}"
            data-has-proviso="${hasProviso}"
            data-proviso-text="${tadashiPart}"
            data-display-name="${displayLawName}"
            title="クリックして条文を表示${hasProviso ? ' (ただし書きを含む)' : ''}"
        >${displayLawName}${articleRef}</button>`;
        
        console.log(`🔧 ボタン生成: ${buttonId} (${actualLawName} → ${displayLawName})${hasProviso ? ' [ただし書き対応]' : ''}`);
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
    const hasProviso = this.dataset.hasProviso === 'true';
    const provisoText = this.dataset.provisoText || '';
    
    console.log(`🖱️ 条文ボタンクリック: ${lawName}${articleRef}`);
    console.log(`🔍 ボタンデータ:`, this.dataset);
    
    if (hasProviso) {
        console.log(`📝 ただし書き付き条文: ベース="${articleRef}", ただし="${provisoText}"`);
    }
    
    // データ属性が正しく設定されているかチェック
    if (!lawName || !articleRef) {
        console.error('❌ 条文ボタンのデータ属性が不完全です', {
            lawName,
            articleRef,
            hasProviso,
            provisoText,
            allData: this.dataset
        });
        return;
    }
      // 条文表示パネルを開いて、該当する条文をセット（ただし書き情報も含む）
    showArticlePanelWithPreset(lawName, articleRef, hasProviso ? provisoText : null);
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
    
    // 条文参照ボタン化処理
    let qaQuestion = qa.question.replace(/(【[^】]+】)/g, match => {
        const lawText = match.replace(/[【】]/g, '');
        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-text='${lawText}'>${lawText}</button>`;
    });
    
    // 先にanswerの{{}}の外の【】を条文参照ボタン化してから、空欄化処理を行う
    let qaAnswerWithArticleRefs = processArticleReferences(qa.answer);
    let qaAnswer = processBlankFillText(qaAnswerWithArticleRefs, `qa-popup-${qaIndex}`);
    
    const popupHtml = createQAPopupHTML(popupId, qNumber, qaQuestion, qaAnswer);
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
    
    // ポップアップ内のイベントリスナーを設定（qaPopup.jsの関数を使用）
    setupQAPopupEvents(popupId);
    
    console.log(`✅ Q&Aポップアップ表示完了: ${popupId}`);
}

// ★★★ 空欄表示切り替え関数（グローバル関数） ★★★
window.toggleBlankReveal = function(blankElement) {
    console.log('🔄 空欄表示切り替え:', blankElement);
    
    if (!blankElement) {
        console.error('❌ 空欄要素が無効です');
        return;
    }
    
    const isRevealed = blankElement.dataset.revealed === 'true';
    const answer = blankElement.dataset.answer;
    const displayContent = blankElement.dataset.displayContent || answer;
    
    console.log('🔍 空欄データ:', {
        isRevealed,
        answer,
        displayContent,
        element: blankElement
    });
    
    if (isRevealed) {
        // 答えを隠す
        const blankLength = Math.max(4, Math.floor(answer.length * 0.9));
        const underscores = '＿'.repeat(blankLength);
        blankElement.innerHTML = underscores;
        blankElement.dataset.revealed = 'false';
        blankElement.title = 'クリックして答えを表示';
        console.log('🙈 答えを隠しました');
    } else {
        // 答えを表示
        blankElement.innerHTML = displayContent;
        blankElement.dataset.revealed = 'true';
        blankElement.title = 'クリックして答えを隠す';
        console.log('👁️ 答えを表示しました');
        
        // 答えの中に条文参照ボタンがある場合、イベントリスナーを設定
        setupArticleRefButtons(blankElement);
    }
};

// ★★★ 条文表示パネル関数（グローバル関数） ★★★
window.showArticlePanel = function(lawText) {
    console.log('📖 条文表示パネル呼び出し:', lawText);
    
    // ★★★ 全角数字を半角数字に変換 ★★★
    const normalizedLawText = convertFullWidthToHalfWidth(lawText);
    if (normalizedLawText !== lawText) {
        console.log('🔄 条文表示パネル: 全角数字を半角数字に変換');
        console.log('変換前:', lawText);
        console.log('変換後:', normalizedLawText);
    }
    
    // ★★★ ただし書き対応：条文テキストからただし書きを分離 ★★★
    let provisoText = null;
    let processedLawText = normalizedLawText;
    
    // 「ただし書」を検出
    const tadashiMatch = normalizedLawText.match(/^(.+?)(ただし書き?.*)$/);
    if (tadashiMatch) {
        processedLawText = tadashiMatch[1]; // ただし書きを除いた部分
        provisoText = tadashiMatch[2];      // ただし書き部分
        console.log(`📝 ただし書き検出: ベース="${processedLawText}", ただし="${provisoText}"`);
    }
    
    // processedLawTextから法令名と条文番号を分離
    // 例: "憲法21条" → 法令名: "憲法", 条文: "21条"
    // 例: "民法719条1項前段" → 法令名: "民法", 条文: "719条1項前段"
    const match = processedLawText.match(/^(.+?)(\d+.*)$/);
    if (match) {
        const lawName = match[1];
        const articleRef = match[2];
        console.log(`📖 分離結果: 法令名="${lawName}", 条文="${articleRef}"`);
        showArticlePanelWithPreset(lawName, articleRef, provisoText);
    } else {
        console.warn('⚠️ 条文テキストの解析に失敗しました:', processedLawText);
        // フォールバック: 全体を法令名として扱う
        showArticlePanelWithPreset(processedLawText, '', provisoText);
    }
};

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
    
    // ★★★ 全角数字を半角数字に変換 ★★★
    const normalizedText = convertFullWidthToHalfWidth(text);
    if (normalizedText !== text) {
        console.log('🔄 空欄化処理: 全角数字を半角数字に変換');
    }
    
    // {{}}で囲まれた部分を検出する正規表現
    const blankPattern = /\{\{([^}]+)\}\}/g;
    let blankCounter = 0;
    let processedText = normalizedText;
    
    // まず、{{}}の外側にある【】を条文参照ボタン化
    let outsideBlankText = normalizedText;
    let blankMatches = [];
    let match;
    
    // {{}}の内容を一時的にプレースホルダーに置換
    while ((match = blankPattern.exec(normalizedText)) !== null) {
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
                  data-answer="${dataAnswer.replace(/"/g, '&quot;')}" data-display-content="${displayContent.replace(/"/g, '&quot;')}" data-blank-id="${blankId}" onclick="window.toggleBlankReveal(this)" title="クリックして答えを表示">
                ${underscores}
            </span>
        </span>`;
        
        outsideBlankText = outsideBlankText.replace(`__BLANK_${i}__`, blankHtml);
    }
    
    return outsideBlankText;
}

// ★★★ デバッグ用：条文検出テスト関数（強化版・ただし書き対応） ★★★
export function testArticleDetection() {
    console.log('🧪 条文検出テスト開始');
    
    const testTexts = [
        '【憲法21条】の精神に照らし',
        '【日本国憲法21条】の表現の自由',
        '【民事訴訟法197条1項2号】の職業の秘密',
        '【刑法199条】の殺人罪',
        '【麻薬及び向精神薬取締法】違反',
        '【民法７１９条１項前段】の共同不法行為', // 全角数字テスト
        '【会社法８２８条２項３号】の株主代表訴訟', // 全角数字テスト
        '【民法714条1項ただし書】の監督義務者の免責', // ただし書きテスト
        '【民法709条ただし書き】の過失責任', // ただし書きテスト
        '【民法415条1項ただし書】の債務不履行責任' // ただし書きテスト
    ];
    
    testTexts.forEach((text, index) => {
        console.log(`\nテスト ${index + 1}: "${text}"`);
        const result = processArticleReferences(text);
        console.log(`結果: "${result}"`);
        
        // ボタンが生成されたかチェック
        const hasButton = result.includes('article-ref-btn');
        console.log(`ボタン生成: ${hasButton ? '✅' : '❌'}`);
        
        // ただし書きが検出されたかチェック
        const hasProviso = result.includes('data-has-proviso="true"');
        if (hasProviso) {
            console.log(`ただし書き検出: ✅`);
        }
        
        // 全角数字が含まれていた場合の変換チェック
        const hasFullWidthNumbers = /[０-９]/.test(text);
        if (hasFullWidthNumbers) {
            console.log(`全角数字検出: ✅ (自動変換されました)`);
        }
    });
    
    console.log('🧪 条文検出テスト完了');
}

// ★★★ ただし書きテスト専用関数 ★★★
export function testProvisoDetection() {
    console.log('🧪 ただし書き検出テスト開始');
    
    const testTexts = [
        '民法714条1項ただし書',
        '民法709条ただし書き',
        '民法415条1項ただし書',
        '会社法362条4項ただし書き',
        '民法９０条ただし書'
    ];
    
    testTexts.forEach((text, index) => {
        console.log(`\nただし書きテスト ${index + 1}: "${text}"`);
        
        // showArticlePanelを呼び出してテスト
        try {
            window.showArticlePanel(text);
            console.log(`✅ showArticlePanel呼び出し成功`);
        } catch (error) {
            console.error(`❌ showArticlePanel呼び出し失敗:`, error);
        }
    });
    
    console.log('🧪 ただし書き検出テスト完了');
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

// ★★★ 全角数字を半角数字に変換する関数 ★★★
function convertFullWidthToHalfWidth(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    // 全角数字を半角数字に変換
    const fullWidthDigits = '０１２３４５６７８９';
    const halfWidthDigits = '0123456789';
    
    let convertedText = text;
    for (let i = 0; i < fullWidthDigits.length; i++) {
        const fullWidthChar = fullWidthDigits[i];
        const halfWidthChar = halfWidthDigits[i];
        convertedText = convertedText.replace(new RegExp(fullWidthChar, 'g'), halfWidthChar);
    }
    
    return convertedText;
}
