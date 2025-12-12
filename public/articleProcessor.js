// articleProcessor.js - 条文自動検出・ボタン化処理モジュール（憲法対応強化版）

import { showArticlePanelWithPreset } from './articlePanel.js';
import { createQAPopupHTML, setupQAPopupEvents } from './qaPopup.js';
import { generateUnifiedStatusButtons } from './qaRenderer.js';
import { buildQAButtonPresentation } from './qaButtonUtils.js';
import { getQA } from './qaLoader.js?v=999';

// ★★★ 法令名マッピング（憲法対応強化） ★★★
const LAW_NAME_MAPPING = {
    '憲法': '日本国憲法',
    '日本国憲法': '日本国憲法'
};

// HTMLエスケープユーティリティ
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 属性用に短く同様の処理（意味合いは同じ）
function escapeAttr(str) {
    return escapeHtml(str);
}

// ★★★ 条文自動検出とボタン化（憲法対応強化版） ★★★
export function processArticleReferences(htmlContent, supportedLaws = []) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        console.warn('⚠️ processArticleReferences: 無効な入力', htmlContent);
        return htmlContent;
    }

    // ★★★ デバッグ: 入力内容の確認 ★★★
    // console.log('🔍 processArticleReferences 入力内容 (最初の200文字):', htmlContent.substring(0, 200)); // デバッグログを減らす

    // ★★★ HTMLタグが既に含まれているかチェック ★★★
    if (htmlContent.includes('<button') || htmlContent.includes('article-ref-btn') ||
        htmlContent.includes('blank-button') || htmlContent.includes('blank-container')) {
        console.warn('⚠️ 入力データにHTMLボタンが既に含まれています:', htmlContent.substring(0, 100) + '...');

        // 既にHTMLタグが含まれている場合、エスケープされたHTMLタグを修正
        if (htmlContent.includes('&lt;button') || htmlContent.includes('&gt;')) {
            console.log('🔧 エスケープされたHTMLタグを修正中...');
            const unescapedContent = htmlContent
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&amp;/g, '&');
            console.log('✅ HTMLタグの修正完了');
            return unescapedContent;
        }

        return htmlContent; // そのまま返す
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
    // サポートされた法令リストと基本法令を統合
    const basicLaws = ['憲法', '日本国憲法', '民法', '会社法', '刑法', '商法', '民事訴訟法', '刑事訴訟法'];
    const lawsToUse = supportedLaws.length > 0 ? [...supportedLaws, ...basicLaws] : basicLaws;

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
        const safeActualLawName = escapeAttr(actualLawName);
        const safeBaseArticleRef = escapeAttr(baseArticleRef);
        const safeProvisoText = escapeAttr(tadashiPart);
        const safeDisplayName = escapeHtml(displayLawName + articleRef);

        const buttonHtml = `<button id="${escapeAttr(buttonId)}" class="article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-semibold border border-blue-300 transition-colors cursor-pointer mx-1" data-law-name="${safeActualLawName}" data-article-ref="${safeBaseArticleRef}" data-has-proviso="${hasProviso}" data-proviso-text="${safeProvisoText}" data-display-name="${escapeAttr(displayLawName)}" title="${escapeAttr('クリックして条文を表示' + (hasProviso ? ' (ただし書きを含む)' : ''))}">${safeDisplayName}</button>`;

        console.log(`🔧 ボタン生成: ${buttonId} (${actualLawName} → ${displayLawName})${hasProviso ? ' [ただし書き対応]' : ''}`);
        // console.log(`🔍 生成されたボタンHTML:`, buttonHtml); // デバッグログを減らす
        return buttonHtml;
    });

    // ★★★ 保護していた{{}}内の【】を元に戻す ★★★
    const finalResult = processedContent.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
        const restoredInnerContent = content.replace(/〖([^〗]+)〗/g, '【$1】');
        return `{{${restoredInnerContent}}}`;
    });

    // ★★★ HTMLボタンタグ内の改行を保護 ★★★
    const protectedResult = finalResult.replace(/<button[^>]*>[\s\S]*?<\/button>/g, (match) => {
        // ボタンタグ内の改行を特殊文字に置換して保護
        return match.replace(/\n/g, '⟪NEWLINE⟫').replace(/\\n/g, '⟪BACKSLASH_N⟫');
    });

    // ★★★ \n改行をHTMLの<br>タグに変換（ボタンタグ外のみ） ★★★
    const resultWithLineBreaks = protectedResult.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');

    // ★★★ ボタンタグ内の改行保護を解除 ★★★
    const finalResultWithButtons = resultWithLineBreaks.replace(/⟪NEWLINE⟫/g, '\n').replace(/⟪BACKSLASH_N⟫/g, '\\n');

    console.log(`📊 条文検出結果: ${matchCount}件の条文をボタン化`);

    // ★★★ デバッグ: 出力内容の確認 ★★★
    // console.log('🔍 processArticleReferences 出力内容 (最初の200文字):', finalResultWithButtons.substring(0, 200)); // デバッグログを減らす

    if (matchCount === 0) {
        console.warn('⚠️ 条文が検出されませんでした。入力内容を確認してください。');
        console.log('🔍 検索対象テキスト:', htmlContent);

        // ★★★ デバッグ用：手動テスト ★★★
        const testMatches = htmlContent.match(/【[^】]+】/g);
        if (testMatches) {
            console.log('🔍 発見された【】パターン:', testMatches);
        }
    }

    return finalResultWithButtons;
}

// ★★★ Q&A参照自動検出とボタン化（科目横断対応版） ★★★
// 対応形式:
// - 【id:番号】     : 旧形式（後方互換）- モジュール内のquestionsAndAnswers配列を参照
// - 【科目名.番号】 : 新形式 - 例: 【民法.3-1】- qaLoader経由でJSONを参照
// - 【番号】        : 新形式省略 - 例: 【3-1】- 現在の科目のQ&Aを参照
export function processQAReferences(htmlContent, questionsAndAnswers = [], options = {}) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        console.warn('⚠️ processQAReferences: 無効な入力', htmlContent);
        return htmlContent;
    }

    console.log('🔍 Q&A参照検出開始:', htmlContent.substring(0, 100) + '...');

    let matchCount = 0;
    let result = htmlContent;

    // ★★★ 形式0: 【id:カテゴリー.サブカテゴリー.番号】完全形式（最優先） ★★★
    // 例: 【id:民法.3.20】、【id:刑法.5.12】
    const fullIdPattern = /【id:([^】\.]+)\.(\d+)\.(\d+)】/g;
    result = result.replace(fullIdPattern, (match, category, subcategory, qaNumber) => {
        matchCount++;
        console.log(`✅ [完全ID形式] Q&A参照検出 ${matchCount}: ${match} → カテゴリー: ${category}, サブ: ${subcategory}, 番号: ${qaNumber}`);

        const fullRef = `${category}.${subcategory}.${qaNumber}`;
        return generateQAButtonAsync(fullRef, category, qaNumber, options);
    });

    // ★★★ 形式0.5: 【id:カテゴリー.番号】形式（サブカテゴリーなし） ★★★
    // 例: 【id:民法.20】
    const categoryIdPattern = /【id:([^】\.]+)\.(\d+)】/g;
    result = result.replace(categoryIdPattern, (match, category, qaNumber) => {
        matchCount++;
        console.log(`✅ [カテゴリーID形式] Q&A参照検出 ${matchCount}: ${match} → カテゴリー: ${category}, 番号: ${qaNumber}`);

        const fullRef = `${category}.${qaNumber}`;
        return generateQAButtonAsync(fullRef, category, qaNumber, options);
    });

    // ★★★ 形式1: 【id:番号】旧形式（後方互換） ★★★
    // 正規表現: 全角半角・大小文字・区切り文字不問でIDを検出
    // データの即時有無に関わらず処理を実行する（非同期ボタンへのフォールバックあり）
    const flexiblePattern = /[【\[][iｉＩ].*?[dｄＤ][^0-9]*([0-9]+)[】\]\}]/g;
    result = result.replace(flexiblePattern, (match, idString) => {
        matchCount++;
        const qaId = idString; // 文字列として保持
        console.log(`✅ [柔軟形式] Q&A参照検出 ${matchCount}: ${match} → ID: ${qaId}`);

        // 同期データ検索（型変換して比較）
        let qaData = null;
        if (questionsAndAnswers && questionsAndAnswers.length > 0) {
            qaData = questionsAndAnswers.find(qa => String(qa.id) === String(qaId));
        }

        if (qaData) {
            // データが見つかった場合は詳細なボタン生成
            return generateQAButton(qaData, questionsAndAnswers.indexOf(qaData), qaId, options);
        } else {
            // データが見つからない場合も、非同期ボタン（プレースホルダー）を生成して表示を保証する
            console.log(`⚠️ ID ${qaId} のQ&A即時データなし -> 非同期ボタン生成`);

            const subject = options.currentSubject || window.currentSubject || (window.currentCaseData && window.currentCaseData.category) || 'unknown';
            const subcategory = (window.currentCaseData && window.currentCaseData.subcategory) || '';
            const fullRef = subcategory ? `${subject}.${subcategory}.${qaId}` : `${subject}.${qaId}`;

            return generateQAButtonAsync(fullRef, subject, qaId, options);
        }
    });

    // ★★★ 形式2: 【科目名.番号】新形式 ★★★
    // 例: 【民法.3-1】、【刑法.105】
    const fullRefPattern = /【([^】\.]+)\.([^】]+)】/g;
    result = result.replace(fullRefPattern, (match, subject, qaId) => {
        matchCount++;
        console.log(`✅ [新形式-完全] Q&A参照検出 ${matchCount}: ${match} → 科目: ${subject}, ID: ${qaId}`);

        const fullRef = `${subject}.${qaId}`;
        return generateQAButtonAsync(fullRef, subject, qaId, options);
    });

    // ★★★ 形式3: 【番号】省略形式（現在の科目を使用） ★★★
    // 例: 【3-1】（数字-数字形式のみ。条文参照と区別するため）
    const shortRefPattern = /【(\d+-\d+(?:-\d+)?)】/g;
    result = result.replace(shortRefPattern, (match, qaId) => {
        const currentSubject = window.currentSubject || options.currentSubject;
        if (!currentSubject) {
            console.warn(`⚠️ 省略形式 ${match} を検出しましたが、現在の科目が設定されていません`);
            return match;
        }

        matchCount++;
        console.log(`✅ [新形式-省略] Q&A参照検出 ${matchCount}: ${match} → 科目: ${currentSubject}, ID: ${qaId}`);

        const fullRef = `${currentSubject}.${qaId}`;
        return generateQAButtonAsync(fullRef, currentSubject, qaId, options);
    });

    console.log(`📊 Q&A参照検出結果: ${matchCount}件の参照をボタン化`);

    if (matchCount === 0) {
        console.log('ℹ️ Q&A参照が検出されませんでした');
    }

    return result;
}

// ★★★ 旧形式用ボタン生成（同期的） ★★★
function generateQAButton(qaData, qaIndex, qaId, options = {}) {
    const buttonId = `qa-ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const embedSafe = options && options.embedSafeButtons === true;

    let colorClasses = 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300';
    if (window.qaStatusSystem) {
        const moduleId = window.currentCaseData?.id;
        const status = window.qaStatusSystem.getStatus(moduleId, qaId);
        const colors = window.qaStatusSystem.qaLinkColors[status];
        if (colors) colorClasses = `${colors.bg} ${colors.hover} ${colors.text} ${colors.border}`;
    }

    const presentation = buildQAButtonPresentation({ qaItem: qaData, fallbackNumber: qaId });
    const displayText = presentation.badgeHTML;

    const safeButtonId = escapeAttr(buttonId);
    const safeQaIndex = escapeAttr(qaIndex);
    const safeQaNumber = escapeAttr(presentation.number);
    const titleAttr = embedSafe ? escapeAttr(`Q${presentation.number}`) : escapeAttr(presentation.title);
    const embedAttr = embedSafe ? ' data-embed-safe="true"' : '';
    const qaAttrs = embedSafe ? ' data-quiz-index="global"' : ` data-qa-index="${safeQaIndex}" data-q-number="${safeQaNumber}" data-quiz-index="global" data-sub-index="0"`;

    const buttonHtml = `<button id="${safeButtonId}" class="qa-ref-btn inline-block px-2 py-1 rounded text-sm font-bold border transition-colors cursor-pointer mx-1 ${escapeAttr(colorClasses)}"${qaAttrs} title="${titleAttr}"${embedAttr}>${displayText}</button>`;

    console.log(`🔧 Q&Aボタン生成: ${buttonId} (ID: ${qaId}) embedSafe=${embedSafe}`);
    return buttonHtml;
}

// ★★★ 新形式用ボタン生成（プレースホルダー） ★★★
// 実際のデータは後から非同期で取得されるため、プレースホルダーを返す
function generateQAButtonAsync(fullRef, subject, qaId, options = {}) {
    const buttonId = `qa-ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const embedSafe = options && options.embedSafeButtons === true;

    // 基本的な色設定（データ取得後に更新される可能性あり）
    let colorClasses = 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300';

    const displayText = `Q${qaId}`;
    const safeButtonId = escapeAttr(buttonId);
    const safeFullRef = escapeAttr(fullRef);
    const safeSubject = escapeAttr(subject);
    const safeQaId = escapeAttr(qaId);

    const titleAttr = embedSafe ? escapeAttr(`Q${qaId}`) : escapeAttr(`${subject} Q${qaId}`);
    const embedAttr = embedSafe ? ' data-embed-safe="true"' : '';

    // 新形式用の属性
    const qaAttrs = embedSafe
        ? ' data-quiz-index="global"'
        : ` data-qa-ref="${safeFullRef}" data-qa-subject="${safeSubject}" data-qa-id="${safeQaId}" data-quiz-index="global" data-sub-index="0"`;

    const buttonHtml = `<button id="${safeButtonId}" class="qa-ref-btn qa-ref-new inline-block px-2 py-1 rounded text-sm font-bold border transition-colors cursor-pointer mx-1 ${escapeAttr(colorClasses)}"${qaAttrs} title="${titleAttr}"${embedAttr}>${displayText}</button>`;

    console.log(`🔧 Q&Aボタン生成(新形式): ${buttonId} (${fullRef}) embedSafe=${embedSafe}`);
    return buttonHtml;
}

// ★★★ 統一テキスト処理関数（条文ボタン化 + Q&A参照 + 改行対応 + 図表保護） ★★★
export function processDisplayText(content, supportedLaws = [], questionsAndAnswers = [], options = {}) {
    if (!content || typeof content !== 'string') {
        console.warn('⚠️ processDisplayText: 無効な入力', content);
        return content;
    }

    // ★★★ 図表ブロックを保護 ★★★
    const codeBlocks = [];
    let protectedContent = content;

    // まず**囲み文字を処理
    protectedContent = processBoldText(protectedContent);

    // 次に条文参照を処理
    protectedContent = processArticleReferences(protectedContent, supportedLaws);

    // 最後にQ&A参照を処理（オプションで無効化可能）
    // 新形式はquestionsAndAnswersがなくてもqaLoader経由で動作する
    const allowQA = options && options.allowQAButtons !== false;
    if (allowQA) {
        protectedContent = processQAReferences(protectedContent, questionsAndAnswers, options);
    }

    // ★★★ HTMLボタンを保護しながら改行変換 ★★★
    protectedContent = protectedLineBreakConversion(protectedContent);

    // ★★★ 出力最終調整: もし何らかの理由で<button>や<span>タグがエスケープされて表示用テキストになっている場合、
    //       ここで主要なタグのみ復元する。これにより、ボタンの属性が生テキストとして表示される問題を防ぐ。
    //       注意: 外部入力に対する広範な unescape はセキュリティリスクを招くため、復元対象は限定する。
    let finalHtml = protectedContent;

    // &lt;button ... &gt; / &lt;/button&gt; を復元
    finalHtml = finalHtml.replace(/&lt;\/?button([^&]*)&gt;/gi, (m) => {
        return m.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    });

    // &lt;span ... &gt; / &lt;/span&gt; を復元（穴埋め等で使われるため）
    finalHtml = finalHtml.replace(/&lt;\/?span([^&]*)&gt;/gi, (m) => {
        return m.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    });

    return finalHtml;
}

// ★★★ 条文参照、Q&A参照、**囲み文字の統合処理関数（後方互換性のため残す） ★★★
export function processAllReferences(htmlContent, supportedLaws = [], questionsAndAnswers = [], options = {}) {
    // 新しい統一関数を呼び出す
    return processDisplayText(htmlContent, supportedLaws, questionsAndAnswers, options);
}

// ★★★ エクスポートリストに統一関数を追加 ★★★

// ★★★ HTMLボタンを保護しながら改行変換を行う関数 ★★★
function protectedLineBreakConversion(content) {
    // HTMLボタンを一時的にプレースホルダーに置換
    const buttonPlaceholders = [];
    let protectedContent = content;

    // article-ref-btnボタンを保護
    protectedContent = protectedContent.replace(/<button[^>]*class="[^"]*article-ref-btn[^"]*"[^>]*>.*?<\/button>/gs, (match) => {
        buttonPlaceholders.push(match);
        return `__BUTTON_PLACEHOLDER_${buttonPlaceholders.length - 1}__`;
    });

    // qa-ref-btnボタンを保護
    protectedContent = protectedContent.replace(/<button[^>]*class="[^"]*qa-ref-btn[^"]*"[^>]*>.*?<\/button>/gs, (match) => {
        buttonPlaceholders.push(match);
        return `__BUTTON_PLACEHOLDER_${buttonPlaceholders.length - 1}__`;
    });

    // 空欄ボタンを保護（story-blank-buttonのみ）
    protectedContent = protectedContent.replace(/<span[^>]*class="[^"]*-blank-container[^"]*"[^>]*>.*?<\/span>/gs, (match) => {
        buttonPlaceholders.push(match);
        return `__BUTTON_PLACEHOLDER_${buttonPlaceholders.length - 1}__`;
    });

    // 改行を<br>タグに変換
    protectedContent = protectedContent.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');

    // プレースホルダーを元のボタンに戻す
    for (let i = 0; i < buttonPlaceholders.length; i++) {
        protectedContent = protectedContent.replace(`__BUTTON_PLACEHOLDER_${i}__`, buttonPlaceholders[i]);
    }

    return protectedContent;
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

        // 埋め込み安全ボタンの場合はクリックイベントや色更新を行わない
        if (button.dataset.embedSafe === 'true') {
            console.log(`ℹ️ 埋め込み安全ボタンを検出: ${button.id} - 既定のQA動作は無効化されます`);
            // 埋め込み用の安全ハンドラを登録（中身は表示しない）
            button.removeEventListener('click', handleEmbedSafeButtonClick);
            button.addEventListener('click', handleEmbedSafeButtonClick);
        } else {
            // 既存のイベントリスナーを削除
            button.removeEventListener('click', handleQAButtonClick);

            // 新しいイベントリスナーを追加
            button.addEventListener('click', handleQAButtonClick);

            // ボタンの色をステータスに応じて即座に更新
            if (window.qaStatusSystem && button.dataset.qNumber) {
                const qaId = button.dataset.qNumber;
                const moduleId = window.currentCaseData?.id;
                console.log(`🎨 ボタン色更新: QID=${qaId}, ModuleID=${moduleId}`);

                const status = window.qaStatusSystem.getStatus(moduleId, qaId);
                console.log(`📊 更新時ステータス: Q${qaId} → ${status}`);

                window.qaStatusSystem.updateQALinkColors(qaId, status);
            }
        }

        console.log(`✅ Q&Aボタン ${index + 1} イベントリスナー設定完了`);
    });

    // Q&Aボタンの色更新機能は無効化済み

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
    console.log(`🚀 showArticlePanelWithPreset呼び出し開始: ${lawName}, ${articleRef}, ${hasProviso ? provisoText : null}`);

    try {
        showArticlePanelWithPreset(lawName, articleRef, hasProviso ? provisoText : null);
        console.log(`✅ showArticlePanelWithPreset呼び出し成功`);
    } catch (error) {
        console.error(`❌ showArticlePanelWithPreset呼び出しエラー:`, error);
    }
}

// ★★★ Q&Aボタンクリックハンドラー ★★★
async function handleQAButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔥 Q&Aボタンがクリックされました！', e.target);
    console.log('🔥 ボタンの全データ:', e.target.dataset);
    console.log('🔥 ボタンのクラス:', e.target.className);

    // ★★★ 新形式ボタン処理（動的データ取得） ★★★
    const qaRef = this.dataset.qaRef;
    if (qaRef) {
        console.log(`🔥 新形式Q&Aボタンクリック: Ref=${qaRef}`);

        // 重複クリック防止
        if (this.dataset.clicking === 'true') return;
        this.dataset.clicking = 'true';

        try {
            // データ取得
            const qaData = await getQA(qaRef);
            if (qaData) {
                console.log('✅ データ取得成功:', qaData);
                await showQAPopupWithData(qaData);
            } else {
                console.error(`❌ データ取得失敗: ${qaRef}`);
                alert(`Q&Aデータの取得に失敗しました。\nRef: ${qaRef}`);
            }
        } catch (err) {
            console.error('❌ Q&Aクリック処理エラー:', err);
        } finally {
            setTimeout(() => { this.dataset.clicking = 'false'; }, 300);
        }
        return;
    }

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
        await showQAPopup(qaIndex, qNumber, quizIndex, subIndex);
    } finally {
        // 処理完了後にクリック防止フラグを解除
        setTimeout(() => {
            this.dataset.clicking = 'false';
        }, 300);
    }
}

// ★★★ Q&Aポップアップ表示関数 ★★★
async function showQAPopup(qaIndex, qNumber, quizIndex, subIndex) {
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

    // 問題文の条文参照ボタン化処理（processArticleReferences関数を使用）
    console.log('🔍 Q&A問題文の条文参照処理開始:', qa.question.substring(0, 100) + '...');
    let qaQuestion = processArticleReferences(qa.question, window.SUPPORTED_LAWS || []);
    console.log('✅ Q&A問題文の条文参照処理完了:', qaQuestion.substring(0, 100) + '...');

    // 先にanswerの{{}}の外の【】を条文参照ボタン化してから、空欄化処理を行う
    console.log('🔍 Q&A解答部の条文参照処理開始:', qa.answer.substring(0, 100) + '...');
    let qaAnswerWithArticleRefs = processArticleReferences(qa.answer, window.SUPPORTED_LAWS || []);
    console.log('✅ Q&A解答部の条文参照処理完了:', qaAnswerWithArticleRefs.substring(0, 100) + '...');
    let qaAnswer = processBlankFillText(qaAnswerWithArticleRefs, `qa-popup-${qaIndex}`, qa.id);

    // 統一されたステータスボタンを生成
    const moduleId = window.currentCaseData?.id;
    const statusButtons = await generateUnifiedStatusButtons(qa.id, moduleId, qa);

    // ランクバッジを生成（qaPopup.jsの関数を使用）
    const rankBadge = window.createRankBadge ? window.createRankBadge(qa.rank) : '';

    const popupHtml = createQAPopupHTML(popupId, qNumber, qaQuestion, qaAnswer, statusButtons, rankBadge);
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

    // Q&Aボタンの色更新機能は無効化済み

    console.log(`✅ Q&Aポップアップ表示完了: ${popupId}`);
}

// ★★★ グローバル関数として公開 ★★★
window.showQAPopup = showQAPopup;

// ★★★ 新形式Q&Aポップアップ表示関数（qaLoader経由のデータ用） ★★★
async function showQAPopupWithData(qaData) {
    console.log(`🔥 showQAPopupWithData開始:`, qaData);

    if (!qaData || !qaData.question || !qaData.answer) {
        console.error('❌ Q&Aデータが不完全です:', qaData);
        return;
    }

    const popupId = `qa-popup-new-${qaData.subject || 'unknown'}-${qaData.id || Date.now()}`;
    console.log(`🔥 ポップアップID: ${popupId}`);

    // ★★★ 既存の同じポップアップがあれば削除（トグル動作） ★★★
    const existing = document.getElementById(popupId);
    if (existing) {
        console.log(`🔥 既存ポップアップを削除（トグル）: ${popupId}`);
        existing.remove();
        window.qaPopupState.removePopup(popupId);
        return;
    }

    // ★★★ 他の全てのQ&Aポップアップを閉じる ★★★
    closeAllQAPopups();

    // 問題文・解答の条文参照ボタン化処理
    let qaQuestion = processArticleReferences(qaData.question, window.SUPPORTED_LAWS || []);
    let qaAnswerWithArticleRefs = processArticleReferences(qaData.answer, window.SUPPORTED_LAWS || []);
    let qaAnswer = processBlankFillText(qaAnswerWithArticleRefs, `qa-popup-new-${qaData.id}`, qaData.id);

    // ステータスボタン生成（モジュールIDがないので空に）
    const statusButtons = '';

    // ランクバッジ生成
    const rankBadge = window.createRankBadge ? window.createRankBadge(qaData.rank) : '';

    // 表示名（科目名 + Q番号）
    const qNumber = qaData.subject ? `${qaData.subject} Q${qaData.id}` : `Q${qaData.id}`;

    const popupHtml = createQAPopupHTML(popupId, qNumber, qaQuestion, qaAnswer, statusButtons, rankBadge);

    // グローバルポップアップコンテナに追加
    const globalContainer = document.getElementById('qa-ref-popup-global-container');
    if (globalContainer) {
        globalContainer.insertAdjacentHTML('beforeend', popupHtml);
    } else {
        document.body.insertAdjacentHTML('beforeend', popupHtml);
    }

    // ポップアップ内のイベントリスナーを設定
    setupQAPopupEvents(popupId);

    console.log(`✅ Q&Aポップアップ（新形式）表示完了: ${popupId}`);
}

// ★★★ 新形式用グローバル関数として公開 ★★★
window.showQAPopupWithData = showQAPopupWithData;

// ★★★ 埋め込み安全ボタンのクリックハンドラ（中身は絶対に表示しない） ★★★
function handleEmbedSafeButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔒 埋め込み安全ボタンがクリックされましたが、内容表示は無効化されています');

    // 小さなトーストを一時的に表示してユーザーに説明
    const existing = document.getElementById('embed-safe-toast');
    if (existing) {
        existing.remove();
    }
    const toast = document.createElement('div');
    toast.id = 'embed-safe-toast';
    toast.style.position = 'fixed';
    toast.style.right = '16px';
    toast.style.bottom = '16px';
    toast.style.background = 'rgba(0,0,0,0.75)';
    toast.style.color = 'white';
    toast.style.padding = '8px 12px';
    toast.style.borderRadius = '6px';
    toast.style.zIndex = 9999;
    toast.innerText = 'この埋め込み内のQ&Aは内容非表示モードです';
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 1800);
}

// ★★★ 空欄表示切り替え関数（グローバル関数） ★★★
window.toggleBlankReveal = function (blankElement) {
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

        // 答えの中に条文参照ボタンがある場合はイベント委任で処理されるので、
        // setupArticleRefButtons は不要（重複を避けるため）
        console.log('🔧 穴埋め答え表示完了 - イベント委任システムで処理されます');
    }
};

// ★★★ 条文表示パネル関数（グローバル関数） ★★★
window.showArticlePanel = function (lawText) {
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
export function processBlankFillText(text, uniqueId = '', qaId = null) {
    if (!text) return text;

    // ★★★ 全角数字を半角数字に変換 ★★★
    const normalizedText = convertFullWidthToHalfWidth(text);
    if (normalizedText !== text) {
        console.log('🔄 空欄化処理: 全角数字を半角数字に変換');
    }

    // Q&Aのチェック状態を取得
    let checkStatus = [];
    if (qaId && window.qaStatusSystem) {
        checkStatus = window.qaStatusSystem.getBlankCheckStatus(qaId);
        console.log(`📋 Q${qaId}のチェック状態: [${checkStatus.join(', ')}]`);
    }

    // ★★★ \n改行をHTMLの<br>タグに変換 ★★★
    const textWithLineBreaks = normalizedText.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');

    // {{}}で囲まれた部分を検出する正規表現
    const blankPattern = /\{\{([^}]+)\}\}/g;
    let blankCounter = 0;
    let processedText = textWithLineBreaks;

    // まず、{{}}の外側にある【】を条文参照ボタン化
    let outsideBlankText = textWithLineBreaks;
    let blankMatches = [];
    let match;

    // {{}}の内容を一時的にプレースホルダーに置換
    while ((match = blankPattern.exec(textWithLineBreaks)) !== null) {
        blankMatches.push(match[1]);
        const placeholder = `__BLANK_${blankMatches.length - 1}__`;
        outsideBlankText = outsideBlankText.replace(match[0], placeholder);
    }

    // {{}}の外側の【】を条文参照ボタン化
    outsideBlankText = outsideBlankText.replace(/【([^】]+)】/g, (match, lawText) => {
        // 簡単なパターンマッチングで法令名と条文を分離
        const simpleMatch = lawText.match(/^(.+?)(\d+条.*?)$/);
        let lawName, articleRef, displayName;

        if (simpleMatch) {
            const rawLawName = simpleMatch[1].trim();
            lawName = LAW_NAME_MAPPING[rawLawName] || rawLawName;
            articleRef = simpleMatch[2];
            displayName = lawText;
        } else {
            // パターンにマッチしない場合
            lawName = 'unknown';
            articleRef = 'unknown';
            displayName = lawText;
        }

        return `<button type='button' class='article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-300 text-xs' data-law-name='${lawName}' data-article-ref='${articleRef}' data-display-name='${displayName}'>${lawText}</button>`;
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
                // 簡単なパターンマッチングで法令名と条文を分離
                const simpleMatch = lawText.match(/^(.+?)(\d+条.*?)$/);
                let lawName, articleRef, displayName;

                if (simpleMatch) {
                    const rawLawName = simpleMatch[1].trim();
                    lawName = LAW_NAME_MAPPING[rawLawName] || rawLawName;
                    articleRef = simpleMatch[2];
                    displayName = lawText;
                } else {
                    // パターンにマッチしない場合
                    lawName = 'unknown';
                    articleRef = 'unknown';
                    displayName = lawText;
                }

                return `<button type='button' class='article-ref-btn bg-blue-200 hover:bg-blue-300 text-blue-900 px-2 py-1 rounded border border-blue-400 text-xs font-bold' data-law-name='${lawName}' data-article-ref='${articleRef}' data-display-name='${displayName}'>${lawText}</button>`;
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

        // 空欄のインデックスを計算（0から開始）
        const blankIndex = blankCounter - 1;

        // チェック済みかどうかを判定
        const isChecked = checkStatus[blankIndex] === 1;
        const checkedClass = isChecked ? 'blank-checked' : '';
        const checkedStyle = isChecked ? 'background-color: #d4edda; border-color: #28a745;' : '';

        // チェック済みの場合は初期状態で開く
        const initialContent = isChecked ? displayContent : underscores;
        const initialTitle = isChecked ?
            "左クリック: 隠す | 右クリック: チェック解除" :
            "左クリック: 答えを表示 | 右クリック: チェック切り替え";

        const blankHtml = `<span class="blank-container inline-block">
            <span id="${blankId}" class="blank-text cursor-pointer ${bgClass} ${checkedClass} px-2 py-1 rounded border-b-2 font-bold transition-all duration-200" 
                  data-answer="${dataAnswer.replace(/"/g, '&quot;')}" 
                  data-display-content="${displayContent.replace(/"/g, '&quot;')}" 
                  data-blank-id="${blankId}" 
                  data-blank-index="${blankIndex}"
                  data-qa-id="${qaId || ''}"
                  data-is-revealed="${isChecked}"
                  data-is-checked="${isChecked}"
                  style="${checkedStyle}"
                  onclick="window.toggleBlankReveal(this)" 
                  oncontextmenu="window.handleBlankRightClick(event, this)"
                  title="${initialTitle}">
                ${initialContent}
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
